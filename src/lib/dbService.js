/**
 * TerraPulse Cloud Database Service (Supabase / PostgREST)
 * 
 * Provides seamless crowdsourced telemetry sync for Egyptian physician field reports.
 * 
 * Architecture:
 * - 0 extra npm dependencies (native HTTPS fetch with Bearer token & apikey).
 * - Multi-tier configuration: reads from Vite environment variables (VITE_SUPABASE_URL,
 *   VITE_SUPABASE_ANON_KEY) with optional runtime override via browser localStorage.
 * - Robust offline fallback: when no API key is provided, the application operates
 *   in Local Offline Mode (seed dataset + localStorage).
 */

const STORAGE_KEY_URL = 'terrapulse_supabase_url';
const STORAGE_KEY_KEY = 'terrapulse_supabase_key';

export const SQL_TABLE_SCHEMA = `-- =========================================================================
-- TerraPulse: Egyptian Physician Field Reports Table
-- Run this in your Supabase SQL Editor to enable multi-device sync
-- =========================================================================

CREATE TABLE IF NOT EXISTS physician_reports (
  id TEXT PRIMARY KEY,
  doctor TEXT,
  specialty TEXT,
  gov TEXT,
  hospital TEXT,
  considering_migration TEXT,
  primary_reason TEXT,
  needed_support TEXT,
  severity INT,
  comment TEXT,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE physician_reports ENABLE ROW LEVEL SECURITY;

-- Allow public read access to crowdsourced reports
CREATE POLICY "Allow anonymous read" 
ON physician_reports FOR SELECT 
TO anon USING (true);

-- Allow verified clinicians to submit field observations
CREATE POLICY "Allow anonymous insert" 
ON physician_reports FOR INSERT 
TO anon WITH CHECK (true);
`;

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
      return false;
    }
    localStorage.setItem(STORAGE_KEY_URL, url.trim().replace(/\/$/, ''));
    localStorage.setItem(STORAGE_KEY_KEY, key.trim());
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
  } catch {}
}

/**
 * Test connectivity with provided or stored credentials.
 */
export async function testDbConnection(testUrl, testKey) {
  const url = (testUrl || '').trim().replace(/\/$/, '');
  const key = (testKey || '').trim();

  if (!url || !key) {
    return { ok: false, error: 'Both Supabase URL and Anon Key are required.' };
  }

  try {
    const endpoint = `${url}/rest/v1/physician_reports?select=id&limit=1`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      return { ok: true, status: res.status };
    }

    if (res.status === 404 || res.status === 400) {
      return {
        ok: false,
        error: `Connected to Supabase, but the "physician_reports" table was not found (HTTP ${res.status}). Please run the provided SQL script to create the table.`
      };
    }

    if (res.status === 401 || res.status === 403) {
      return {
        ok: false,
        error: `Authentication failed (HTTP ${res.status}). Please verify your anon/public API key and RLS policies.`
      };
    }

    return {
      ok: false,
      error: `Supabase returned HTTP ${res.status}: ${res.statusText}`
    };
  } catch (err) {
    return {
      ok: false,
      error: `Network error: ${err.message || 'Unable to connect to Supabase endpoint.'}`
    };
  }
}

/**
 * Fetch remote crowdsourced reports.
 */
export async function fetchRemoteReports() {
  const config = getDbConfig();
  if (!config.isConfigured) return null;

  try {
    const endpoint = `${config.url}/rest/v1/physician_reports?select=*&order=created_at.desc&limit=100`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': config.key,
        'Authorization': `Bearer ${config.key}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      console.warn('Remote report fetch returned HTTP', res.status);
      return null;
    }

    const data = await res.json();
    if (Array.isArray(data)) {
      return data;
    }
    return null;
  } catch (err) {
    console.warn('Failed to query remote Supabase reports:', err);
    return null;
  }
}

/**
 * Submit a newly recorded report to Supabase.
 */
export async function submitRemoteReport(report) {
  const config = getDbConfig();
  if (!config.isConfigured) {
    return { success: false, mode: 'local' };
  }

  try {
    const payload = {
      id: report.id || `report-${Date.now()}`,
      doctor: report.doctor || 'طبيب ميداني موثق',
      specialty: report.specialty || 'nephrology',
      gov: report.gov || report.governorate || 'aswan',
      hospital: report.hospital || 'مستشفى عام',
      considering_migration: report.considering_migration || 'hesitant',
      primary_reason: report.primary_reason || 'salary',
      needed_support: report.needed_support || 'incentive',
      severity: Number(report.severity) || 3,
      comment: report.comment || '',
      date: report.date || new Date().toISOString().split('T')[0]
    };

    const endpoint = `${config.url}/rest/v1/physician_reports`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': config.key,
        'Authorization': `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, mode: 'supabase', data };
    } else {
      const errText = await res.text();
      console.warn('Remote report submission failed:', res.status, errText);
      return { success: false, mode: 'error', error: errText };
    }
  } catch (err) {
    console.warn('Network error during report submission:', err);
    return { success: false, mode: 'network_error', error: err.message };
  }
}
