/**
 * TerraPulse Cloud Database Service (Supabase / PostgREST)
 *
 * Crowdsourced telemetry sync for Egyptian physician field reports, with an
 * explicit local-only mode.
 *
 * Architecture:
 * - 0 extra npm dependencies (native fetch with Bearer token & apikey).
 * - Multi-tier configuration: Vite env vars (VITE_SUPABASE_URL,
 *   VITE_SUPABASE_ANON_KEY) with optional runtime override in localStorage.
 * - Every remote call returns a classified SyncState. Callers decide what to show;
 *   nothing here converts a failed remote operation into a success.
 *
 * The schema lives in supabase/migrations/0001_init_physician_reports.sql and is
 * imported as text so the copy-to-clipboard SQL and the migration file cannot drift.
 */

import migrationSql from '../../supabase/migrations/0001_init_physician_reports.sql?raw';

const STORAGE_KEY_URL = 'terrapulse_supabase_url';
const STORAGE_KEY_KEY = 'terrapulse_supabase_key';

/** Canonical setup SQL, surfaced verbatim in the sync modal. */
export const SQL_TABLE_SCHEMA = migrationSql;

/**
 * Coarse classification of what a remote call actually did.
 *   local          - no credentials configured; localStorage mode
 *   ok             - PostgREST answered normally
 *   schema_missing - table absent (or schema cache stale); permanent for the session
 *   forbidden      - credentials rejected or RLS denied the operation
 *   unreachable    - DNS/network/TLS failure, including an air-gapped machine
 *   error          - anything else non-fatal
 */
export const SYNC_STATE = {
  LOCAL: 'local',
  OK: 'ok',
  SCHEMA_MISSING: 'schema_missing',
  FORBIDDEN: 'forbidden',
  UNREACHABLE: 'unreachable',
  ERROR: 'error'
};

// Set once a request proves the table is not there. PostgREST reports that on every
// call, so without this the app re-404s on each mount and each submission. Reset
// whenever the endpoint changes, since a new project may well have the table.
let schemaUnavailableThisSession = false;

// Concurrent callers (React StrictMode double-invokes the mount effect in dev) would
// otherwise issue the same probe twice before the first response can set the flag.
let inFlightFetch = null;

export function isSchemaKnownMissing() {
  return schemaUnavailableThisSession;
}

function resetSessionProbe() {
  schemaUnavailableThisSession = false;
  inFlightFetch = null;
}

/**
 * Map an HTTP response to a SyncState, reading PostgREST's JSON error body rather
 * than trusting the status code alone — 404 means "no such route" for the proxy and
 * "no such table" for a live schema, and the two need different messages.
 */
async function classifyResponse(res) {
  if (res.ok) return { state: SYNC_STATE.OK };

  let body = '';
  try {
    body = await res.text();
  } catch {
    // An unreadable body must not upgrade a failure into OK.
  }

  let code = '';
  let message = body.slice(0, 200);
  try {
    const parsed = JSON.parse(body);
    code = parsed.code || '';
    message = parsed.message || parsed.hint || body.slice(0, 200);
  } catch {
    /* plain-text or HTML error body; keep the raw snippet */
  }

  // Absent table. 42P01 is PostgreSQL undefined_table; PGRST205 is PostgREST's own
  // "not in my schema cache", which is what a project with the table never created
  // actually returns (observed: HTTP 404 + PGRST205). Both mean "not usable here".
  if (res.status === 404 || code === '42P01' || code === 'PGRST205') {
    schemaUnavailableThisSession = true;
    return { state: SYNC_STATE.SCHEMA_MISSING, detail: message };
  }
  if (res.status === 401 || res.status === 403 || code === '42501' || code === 'PGRST301') {
    return { state: SYNC_STATE.FORBIDDEN, detail: message };
  }
  return { state: SYNC_STATE.ERROR, detail: `HTTP ${res.status}: ${message}` };
}

function networkFailure(err) {
  return { state: SYNC_STATE.UNREACHABLE, detail: err?.message || 'Unable to reach the Supabase endpoint.' };
}

function authHeaders(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Get current database configuration.
 */
export function getDbConfig() {
  try {
    const customUrl = localStorage.getItem(STORAGE_KEY_URL);
    const customKey = localStorage.getItem(STORAGE_KEY_KEY);

    if (customUrl && customKey) {
      return {
        url: customUrl.trim().replace(/\/$/, ''),
        key: customKey.trim(),
        isConfigured: true,
        source: 'custom'
      };
    }
  } catch {}

  const envUrl = (import.meta.env?.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const envKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY || '').trim();

  if (envUrl && envKey) {
    return {
      url: envUrl,
      key: envKey,
      isConfigured: true,
      source: 'env'
    };
  }

  return {
    url: '',
    key: '',
    isConfigured: false,
    source: 'none'
  };
}

/**
 * Save custom credentials to browser storage.
 */
export function saveDbConfig(url, key) {
  try {
    if (!url || !key) {
      localStorage.removeItem(STORAGE_KEY_URL);
      localStorage.removeItem(STORAGE_KEY_KEY);
      resetSessionProbe();
      return false;
    }
    localStorage.setItem(STORAGE_KEY_URL, url.trim().replace(/\/$/, ''));
    localStorage.setItem(STORAGE_KEY_KEY, key.trim());
    resetSessionProbe();
    return true;
  } catch (e) {
    console.warn('Failed to save DB config to localStorage:', e);
    return false;
  }
}

/**
 * Reset to default / local offline mode.
 */
export function clearDbConfig() {
  try {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
    resetSessionProbe();
  } catch {}
}

/**
 * Probe the configured endpoint and report what it said. Never persists
 * credentials — the caller does that only when this returns OK.
 */
export async function testDbConnection(testUrl, testKey) {
  const url = (testUrl || '').trim().replace(/\/$/, '');
  const key = (testKey || '').trim();

  if (!url || !key) {
    return { state: SYNC_STATE.ERROR, ok: false, error: 'Both Supabase URL and Anon Key are required.' };
  }

  try {
    const res = await fetch(`${url}/rest/v1/physician_reports?select=id&limit=1`, {
      method: 'GET',
      headers: authHeaders(key)
    });

    const classified = await classifyResponse(res);
    if (classified.state === SYNC_STATE.OK) {
      let rowCount = null;
      try {
        const rows = await res.json();
        rowCount = Array.isArray(rows) ? rows.length : null;
      } catch { /* non-JSON body stays unreported rather than guessed at */ }
      return { state: SYNC_STATE.OK, ok: true, status: res.status, rowCount };
    }
    return { ...classified, ok: false, status: res.status, error: classified.detail };
  } catch (err) {
    return { ...networkFailure(err), ok: false, error: networkFailure(err).detail };
  }
}

/**
 * Fetch remote crowdsourced reports.
 *
 * Returns { state, rows } — rows is only meaningful for SYNC_STATE.OK.
 */
export async function fetchRemoteReports() {
  const config = getDbConfig();
  if (!config.isConfigured) return { state: SYNC_STATE.LOCAL, rows: [] };
  if (schemaUnavailableThisSession) {
    return { state: SYNC_STATE.SCHEMA_MISSING, rows: [], suppressed: true };
  }
  if (inFlightFetch) return inFlightFetch;

  inFlightFetch = (async () => {
    try {
      const res = await fetch(
        `${config.url}/rest/v1/physician_reports?select=*&order=created_at.desc&limit=100`,
        { method: 'GET', headers: authHeaders(config.key) }
      );

      const classified = await classifyResponse(res);
      if (classified.state !== SYNC_STATE.OK) return { ...classified, rows: [] };

      const data = await res.json();
      if (!Array.isArray(data)) {
        return { state: SYNC_STATE.ERROR, rows: [], detail: 'Expected an array of reports from PostgREST.' };
      }
      return { state: SYNC_STATE.OK, rows: data };
    } catch (err) {
      return { ...networkFailure(err), rows: [] };
    } finally {
      inFlightFetch = null;
    }
  })();

  return inFlightFetch;
}

/**
 * Submit a newly recorded report to Supabase.
 *
 * A rejected write is reported as a rejected write; the caller already has the
 * report in localStorage, so the user keeps their data either way.
 */
export async function submitRemoteReport(report) {
  const config = getDbConfig();
  if (!config.isConfigured) {
    return { success: false, state: SYNC_STATE.LOCAL };
  }
  if (schemaUnavailableThisSession) {
    return {
      success: false,
      state: SYNC_STATE.SCHEMA_MISSING,
      error: 'physician_reports is unavailable; this request was skipped for the session.'
    };
  }

  // Field-for-field match to the migration's column list.
  const severity = Number(report.severity ?? 3);
  const payload = {
    id: report.id || `report-${Date.now()}`,
    doctor: report.doctor || 'طبيب ميداني موثق',
    specialty: report.specialty || 'nephrology',
    gov: report.gov || report.governorate || 'aswan',
    hospital: report.hospital || 'مستشفى عام',
    considering_migration: report.considering_migration || 'hesitant',
    primary_reason: report.primary_reason || 'salary',
    needed_support: report.needed_support || 'incentive',
    // An explicit 0 is a real answer ("asymptomatic"), so keep ?? over ||; a
    // non-numeric value is dropped rather than sent, because the column is smallint
    // and a type error there would be reported as a server fault we caused.
    severity: Number.isFinite(severity) ? Math.trunc(severity) : null,
    comment: report.comment || '',
    date: report.date || new Date().toISOString().split('T')[0]
  };

  try {
    const res = await fetch(`${config.url}/rest/v1/physician_reports`, {
      method: 'POST',
      headers: { ...authHeaders(config.key), Prefer: 'return=representation' },
      body: JSON.stringify(payload)
    });

    const classified = await classifyResponse(res);
    if (classified.state !== SYNC_STATE.OK) {
      return { success: false, state: classified.state, error: classified.detail || classified.state };
    }

    let data = null;
    try {
      data = await res.json();
    } catch { /* 201 with an empty body is still a successful write */ }
    return { success: true, state: SYNC_STATE.OK, mode: 'supabase', data };
  } catch (err) {
    const failure = networkFailure(err);
    return { success: false, state: failure.state, error: failure.detail };
  }
}
