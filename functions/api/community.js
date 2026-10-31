// TerraPulse — Anonymized Community Observatory Endpoint.
//
// GET /api/community
//
// Serves cross-device community feedback from physicians across Egypt while strictly
// protecting individual physician privacy:
//   - Statically strips doctor personal names and caller IP addresses.
//   - Queries public.get_community_reports() (a SECURITY DEFINER function) or returns
//     an empty array when database storage is unconfigured.
//   - Caches responses with cache-control headers to prevent serverless connection exhaustion.

import { Client, neonConfig } from '@neondatabase/serverless';

neonConfig.fetchConnectionCache = true;

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=30, s-maxage=60',
      ...headers
    }
  });
}

export async function onRequestGet({ env }) {
  if (!env.NEON_URL) {
    return json({ reports: [], source: 'local_mode', count: 0 }, 200);
  }

  const client = new Client({ connectionString: env.NEON_URL });
  try {
    await client.connect();
    // Safe execution of anonymized security definer function
    const result = await client.query('SELECT * FROM public.get_community_reports(50);');
    const reports = (result.rows || []).map(r => ({
      id: r.id,
      doctor: null, // Statically scrubbed to preserve physician anonymity
      specialty: r.specialty,
      gov: r.gov,
      hospital: r.hospital,
      considering_migration: r.considering_migration,
      primary_reason: r.primary_reason,
      needed_support: r.needed_support,
      severity: r.severity,
      clinical_challenges: r.clinical_challenges,
      missing_resources: r.missing_resources,
      working_conditions: r.working_conditions,
      retention_priorities: r.retention_priorities,
      comment: r.comment,
      date: r.date,
      submitted_at: r.submitted_at
    }));

    return json({ reports, count: reports.length, source: 'cloud_community' }, 200);
  } catch (err) {
    // If the database role does not yet have the view/function or is unreachable,
    // degrade gracefully rather than breaking the client app.
    console.warn('Community reports fetch degraded:', err.message);
    return json({ reports: [], source: 'offline_degraded', count: 0 }, 200);
  } finally {
    await client.end().catch(() => {});
  }
}
