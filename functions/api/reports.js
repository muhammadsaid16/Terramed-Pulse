// TerraPulse — the only writer.
//
// POST /api/reports
//
// The browser holds no database credential. It calls this function, which validates the
// payload, derives a salted hash of the caller's address for the quota, and issues one
// INSERT as `web_writer` — a role that can add a row to physician_reports and cannot
// read, alter, or delete one. See db/migrations/0001_neon_physician_reports.sql for the
// database half of that sentence, including the two facts this file is shaped around:
//
//   * No RETURNING. `INSERT ... RETURNING` reads the new row back, so it needs SELECT,
//     which web_writer deliberately does not have: the same statement with RETURNING
//     answers 42501 (measured). So the outcome is rowCount — 1 stored, 0 refused.
//   * One statement. The quota check is `where public.admit_submission($n)` inside the
//     INSERT, so check and write share a transaction and an advisory lock. Splitting
//     them across two queries would race, and on Neon's HTTP driver the two would not
//     even be in the same transaction.
//
// There is no GET. No row can be read back out of this endpoint by anyone, including
// this function, which is the point: the rows name physicians and record that they are
// considering leaving the country.

import { Client, neonConfig } from '@neondatabase/serverless';
import { validateSubmission } from '../../src/lib/reportLimits.js';

const MAX_BODY_BYTES = 32 * 1024;

neonConfig.fetchConnectionCache = true;

/**
 * One client, built for this request alone.
 *
 * Both shapes below were measured locally under `wrangler pages dev`, not assumed:
 *
 *   * Pool built on a bare URL — pg's Pool takes an options object, and the driver
 *     reads properties off whatever it is handed. A string instead answers
 *     "Cannot use 'in' operator to search for 'password' in postgresql://…", and that
 *     message carries the connection string into the function logs.
 *   * A Pool built at module scope and reused by the next invocation — the first
 *     submission returns 201, the second hangs until the runtime cancels it with
 *     "Cannot perform I/O on behalf of a different request". Workers binds every I/O
 *     object to the request that created it, so nothing holding a socket may outlive
 *     one. Reuse happens at Neon's pooler and in fetchConnectionCache instead, which
 *     is what the driver's connection cache is for.
 */
async function insertOne(url, sql, params) {
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    return await client.query(sql, params);
  } finally {
    // Closing must never mask the outcome of the write it followed.
    await client.end().catch(() => {});
  }
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers
    }
  });
}

/**
 * sha-256(ip | salt | UTC day). Three properties the quota needs and a raw IP does not
 * give: nothing personally identifying is stored, the value cannot be forged by the
 * caller (they do not know the salt), and it rotates daily, so the stored hashes do not
 * build a permanent index of who submitted from the same address for a year.
 */
async function ipHash(request, env, now) {
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || 'unknown';
  const day = now.toISOString().slice(0, 10);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${ip}|${env.IP_SALT}|${day}`));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

const INSERT_SQL = `
  insert into public.physician_reports
    (doctor, specialty, gov, hospital, considering_migration, primary_reason,
     needed_support, severity, comment, "date", ip_hash)
  select $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
    where public.admit_submission($11)`;

export async function onRequestPost({ request, env }) {
  if (!env.NEON_URL || !env.IP_SALT) {
    // Misconfiguration is reported as misconfiguration. Falling through to "success"
    // would tell the user their report reached the cloud when nothing was contacted.
    return json({ error: 'storage_unconfigured' }, 503);
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return json({ error: 'expected application/json' }, 400);
  }

  let raw;
  try {
    raw = await request.text();
  } catch {
    return json({ error: 'unreadable body' }, 400);
  }
  if (raw.length > MAX_BODY_BYTES) {
    return json({ error: 'payload too large' }, 413);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return json({ error: 'invalid JSON' }, 400);
  }

  // Everything the table would reject is rejected here instead, so a spammer costs this
  // endpoint a few microseconds and zero database work.
  const checked = validateSubmission(parsed);
  if (!checked.ok) {
    return json({ error: 'invalid submission', reasons: checked.errors }, 400);
  }

  const hash = await ipHash(request, env, new Date());
  const row = checked.value;
  const params = [
    row.doctor, row.specialty, row.gov, row.hospital, row.considering_migration,
    row.primary_reason, row.needed_support, row.severity, row.comment, row.date, hash
  ];

  try {
    const result = await insertOne(env.NEON_URL, INSERT_SQL, params);
    if (result.rowCount === 1) {
      // No id comes back, because reading it would need the SELECT this role does not
      // have. The client keeps its own local key; the database has its own.
      return json({ stored: true, date: row.date }, 201);
    }
    // rowCount 0 is the quota refusing, not a failure of the write. The distinction
    // reaches the user as its own message, never as a generic error.
    return json({ error: 'rate_limited' }, 429);
  } catch (err) {
    // RLS or a CHECK still refusing a row that passed the validator means the two
    // enforcement layers have drifted. That is a bug to see, so the code goes to the
    // function logs — but not the payload, and not to the caller. The message is
    // scrubbed because the driver interpolates the connection string into some of
    // its own failures, and those logs are not where a credential belongs.
    console.error('insert rejected:', err.code, String(err.message).replace(/\S*:\S*@/g, '[redacted]@'));
    if (err.code === '42501' || err.code === '23514' || err.code === '23502') {
      return json({ error: 'rejected_by_policy' }, 403);
    }
    return json({ error: 'storage_unreachable' }, 502);
  }
}

// Explicitly not a read endpoint. Without an OPTIONS handler this stays a simple
// cross-origin-less POST surface; adding one is what a future moderation UI would need,
// and that is a decision about exposing physicians' migration intent, not a config flag.
export async function onRequestGet() {
  return json({ error: 'method_not_allowed', reads: 'disabled by design' }, 405, { allow: 'POST' });
}

// Wrangler dispatches onRequestPost and onRequestGet before this one, so what reaches
// here is PUT/DELETE/PATCH/HEAD — every verb the endpoint does not have.
export async function onRequest() {
  return json({ error: 'method_not_allowed', reads: 'disabled by design' }, 405, { allow: 'POST' });
}
