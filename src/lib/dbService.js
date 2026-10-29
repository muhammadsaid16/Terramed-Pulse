/**
 * TerraPulse submission service.
 *
 * Crowdsourced telemetry for Egyptian physician field reports, with an explicit
 * local-only mode.
 *
 * Architecture — three nodes, and the browser is not allowed to touch the third one:
 *
 *   browser (static SPA)  --POST /api/reports-->  Pages Function  --SQL-->  Neon
 *        no credential                            web_writer role            RLS + CHECKs
 *        on the wire                              INSERT grant only
 *
 * There is no key here to configure, paste, validate or refuse. That is the whole
 * design: a Postgres connection string is database-owner access, and Vite inlines any
 * VITE_* value into the public bundle, so the credential lives only in a Cloudflare
 * secret and only ever in the function. What the browser holds is a URL path.
 *
 * There is also no read path, in this file or anywhere in the deployed system. Reports
 * come from this device's localStorage plus the shipped seed; a submission that reaches
 * the cloud is acknowledged and never fetched back.
 *
 * The schema is imported as text so the copy-to-clipboard SQL in the sync modal and the
 * migration that was actually applied cannot drift.
 */

import migrationSql from '../../db/migrations/0001_neon_physician_reports.sql?raw';
import { validateSubmission, SUBMISSION_FIELDS } from './reportLimits.js';

/** Canonical setup SQL, surfaced verbatim in the sync modal. */
export const SQL_TABLE_SCHEMA = migrationSql;

const ENDPOINT_REPORTS = '/api/reports';
const ENDPOINT_STATUS = '/api/status';

/**
 * Coarse classification of what a remote call actually did.
 *   local         - no write endpoint reachable; localStorage mode
 *   ok            - the write was accepted (201)
 *   read_blocked  - the endpoint is live and writes are accepted; reads do not exist.
 *                   This is the shipped posture, not a fault.
 *   rate_limited  - the caller's address hit its per-minute quota (429)
 *   rejected      - validation or RLS refused the row (400/403)
 *   unreachable   - network failure, including an air-gapped machine
 *   error         - anything else non-fatal
 */
export const SYNC_STATE = {
  LOCAL: 'local',
  OK: 'ok',
  READ_BLOCKED: 'read_blocked',
  RATE_LIMITED: 'rate_limited',
  REJECTED: 'rejected',
  UNREACHABLE: 'unreachable',
  ERROR: 'error'
};

// A fetch that never resolves must not hang the badge forever. Chosen to sit above the
// worst cold-start of a Pages Function plus a cross-continent connection, and well
// below the point where a user has already moved on.
const TIMEOUT_MS = 12000;

async function request(path, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(path, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function failure(err) {
  return { state: SYNC_STATE.UNREACHABLE, detail: err?.message || `Unable to reach ${ENDPOINT_REPORTS}.` };
}

/**
 * Ask the endpoint what it is, once, at startup.
 *
 * It reports configuration, not connectivity: the status handler never opens a
 * database connection, so this cannot upgrade a broken store to a healthy badge — and
 * equally, a 404 here means "this build has no backend", which is local mode rather
 * than an error.
 */
export async function getSyncStatus() {
  let res;
  try {
    res = await request(ENDPOINT_STATUS);
  } catch (err) {
    // Same-origin on Pages, so a network error here is the machine having no route to
    // its own site: an offline physician on a generator and a satellite dish.
    return { state: SYNC_STATE.UNREACHABLE, detail: err?.message || 'No network.' };
  }

  if (res.status === 404) {
    return { state: SYNC_STATE.LOCAL, writes: false, status: 404 };
  }
  if (!res.ok) {
    return { state: SYNC_STATE.ERROR, detail: `HTTP ${res.status}`, status: res.status };
  }

  let body;
  try {
    body = await res.json();
  } catch {
    // A 200 that is not the JSON we agreed on is an error, not a success with unknown
    // contents. Something other than this function answered.
    return { state: SYNC_STATE.ERROR, detail: 'Unexpected response from /api/status.' };
  }

  if (body.writes === 'enabled') {
    // The truthful deployed state: submissions land, nothing can be read back.
    return { state: SYNC_STATE.READ_BLOCKED, writes: true, reads: body.reads, status: res.status };
  }
  if (body.writes === 'unconfigured') {
    return { state: SYNC_STATE.LOCAL, writes: false, status: res.status };
  }
  return { state: SYNC_STATE.ERROR, detail: `Unrecognised status payload: ${JSON.stringify(body).slice(0, 120)}` };
}

/**
 * Submit one report.
 *
 * The caller has already stored it locally, so a failed send loses the cloud copy and
 * nothing else. What it must not do is come back looking like a success: the state
 * here is what the toast says, verbatim.
 */
export async function submitRemoteReport(report) {
  // The local object carries an `id` the app invented for its own list keys, and the
  // database generates its own uuid. Only the contract fields go on the wire; an
  // unknown key is a 400 by design, so this projection is what keeps a legitimate
  // report from being rejected for a field the table never had.
  const payload = Object.fromEntries(
    SUBMISSION_FIELDS.filter(key => report?.[key] !== undefined).map(key => [key, report[key]])
  );

  // Checked on the device first, because the same rules are in the database and a
  // payload that breaks them costs a round trip to be told no after the user pressed
  // Send. The validator is pure, so this cannot touch the network.
  const checked = validateSubmission(payload);
  if (!checked.ok) {
    return { success: false, state: SYNC_STATE.REJECTED, errors: checked.errors };
  }

  let res;
  try {
    res = await request(ENDPOINT_REPORTS, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(checked.value)
    });
  } catch (err) {
    const f = failure(err);
    return { success: false, ...f, error: f.detail };
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    /* an empty 201 is still a stored row; an empty 500 is handled below */
  }

  if (res.status === 201) {
    // rowCount was 1. No id comes back, by design — reading one would need the SELECT
    // this system withholds.
    return { success: true, state: SYNC_STATE.OK, stored: body?.stored === true };
  }
  if (res.status === 429) {
    return { success: false, state: SYNC_STATE.RATE_LIMITED, error: 'rate_limited' };
  }
  if (res.status === 400 || res.status === 403) {
    return {
      success: false,
      state: SYNC_STATE.REJECTED,
      errors: body?.reasons,
      error: body?.error || `HTTP ${res.status}`
    };
  }
  if (res.status === 503) {
    // The function is deployed but has no secret attached. That is local mode with an
    // endpoint in front of it, and the badge should say local rather than "error".
    return { success: false, state: SYNC_STATE.LOCAL, error: body?.error || 'storage_unconfigured' };
  }
  if (res.status === 404) {
    return { success: false, state: SYNC_STATE.LOCAL, error: 'no such endpoint' };
  }
  return {
    success: false,
    state: res.status >= 500 ? SYNC_STATE.UNREACHABLE : SYNC_STATE.ERROR,
    error: body?.error || `HTTP ${res.status}`
  };
}
