// GET /api/status
//
// One question, answered honestly: is there a write path at all? The badge in the UI
// needs to know whether the app is talking to a store or keeping reports on this
// device, and until now it inferred the answer from an error code.
//
// What it deliberately does not claim:
//   * that anything was read — there is no read path in this system, and this endpoint
//     proves the posture rather than testing it;
//   * that the database is reachable — it does not open a connection, so a cold
//     isolate answers instantly and a Neon outage cannot turn the badge into a lie.
//     Whether a write actually landed is known only from that write's own response.
//
// No row data, no counts, no credentials, and nothing derived from either.

export async function onRequestGet({ env }) {
  const writesEnabled = Boolean(env.NEON_URL && env.IP_SALT);
  return new Response(JSON.stringify({
    writes: writesEnabled ? 'enabled' : 'unconfigured',
    reads: 'disabled-by-design',
    // The shape a rejected submission arrives as, so a client can distinguish "the
    // endpoint is there and said no" from "there is no endpoint here".
    accepts: 'POST /api/reports'
  }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      allow: 'GET'
    }
  });
}

export async function onRequestPost() {
  return new Response(JSON.stringify({ error: 'method_not_allowed', accepts: 'GET /api/status' }), {
    status: 405,
    headers: { 'content-type': 'application/json', allow: 'GET' }
  });
}
