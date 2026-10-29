// The single place the submission contract is written down.
//
// Every constant here is mirrored by a constraint in
// db/migrations/0001_neon_physician_reports.sql, and src/lib/syncContract.test.mjs
// reads that file as text and asserts the two lists are identical. That test is the
// only reason this duplication is tolerable: the form caps input, the serverless
// validator rejects payloads before they cost a database round trip, and Postgres
// enforces the same rules on the way in. If any two of the three disagree, the third
// answers with a 400 or a 23514 that the UI has to describe as a server fault.
//
// Keep this module free of React, lucide and the dataset: the Cloudflare Pages
// Function imports it directly, and anything heavy here is shipped twice.

import { SPECIALTY_SHORT_LABELS } from './specialties.js';

// The ids the form can produce. Derived, never retyped — a fifth specialty added to
// SPECIALTY_SHORT_LABELS is admissible the moment this file is imported, and the
// contract test fails until the migration's IN-list grows with it.
export const SPECIALTY_IDS = SPECIALTY_SHORT_LABELS.map(s => s.id);

// Declared literally on purpose. Deriving it from TERRAPULSE_DATA would pull a ~170 kB
// dataset into the serverless bundle for five strings; the test asserts it still equals
// Object.keys(TERRAPULSE_DATA.governorates).
export const GOVERNORATE_IDS = ['cairo', 'giza', 'alexandria', 'assiut', 'aswan'];

// Character caps, counting code points the way PostgreSQL's char_length does. A JS
// `.length` would count two for an emoji and reject a name the database accepts.
export const LIMITS = {
  doctor: 120,
  hospital: 160,
  comment: 1000,
  primaryReason: 120,
  neededSupport: 120
};

// 0 is a real answer ("asymptomatic"), which is why the floor is 0 and not 1.
export const SEVERITY_RANGE = { min: 0, max: 5 };

// The form writes the English tokens; the Arabic ones are accepted because a manually
// backfilled row or an older bundle may carry them.
export const MIGRATION_VALUES = ['yes', 'no', 'hesitant', 'undecided', 'نعم', 'لا', 'متردد'];

// A submission must look like a date from the study window, and it may be one day in
// the future to survive a UTC/local midnight straddle at the top of a report.
export const DATE_FLOOR = '2020-01-01';
export const DATE_CEILING_DAYS_AHEAD = 1;

// The keys a caller may send. `ip_hash` and `submitted_at` are computed server-side
// and are NOT client-settable: accepting them would let a caller choose the quota key
// or rewrite the feed's ordering. Anything else is rejected before the database sees
// the request.
export const SUBMISSION_FIELDS = [
  'doctor', 'specialty', 'gov', 'hospital', 'considering_migration',
  'primary_reason', 'needed_support', 'severity', 'comment', 'date'
];

function charCount(value) {
  return Array.from(value).length;
}

function checkLength(out, value, max, label) {
  if (value !== undefined && value !== null && charCount(String(value)) > max) {
    out.push(`${label} exceeds ${max} characters`);
  }
}

/**
 * Validate an untrusted submission body against the contract.
 *
 * Pure and synchronous: it never touches the network, so the same function answers
 * for the form's client-side pre-check, the Pages Function's gate, and the test that
 * asserts the seven known poison payloads are refused without a database.
 *
 * Returns { ok, errors, value }. `value` is the trimmed, coerced row — the caller
 * binds that, never the original object.
 */
export function validateSubmission(raw) {
  const errors = [];

  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, errors: ['body must be a JSON object'], value: null };
  }

  for (const key of Object.keys(raw)) {
    if (!SUBMISSION_FIELDS.includes(key)) errors.push(`unknown field "${key}"`);
  }

  const specialty = typeof raw.specialty === 'string' ? raw.specialty.trim() : '';
  if (!specialty) {
    errors.push('specialty is required');
  } else if (!SPECIALTY_IDS.includes(specialty)) {
    errors.push(`specialty "${specialty}" is not one the form can produce`);
  }

  const gov = typeof raw.gov === 'string' ? raw.gov.trim() : '';
  if (!gov) {
    errors.push('gov is required');
  } else if (!GOVERNORATE_IDS.includes(gov)) {
    errors.push(`gov "${gov}" is not an Egyptian governorate this study tracks`);
  }

  const intent = raw.considering_migration === undefined || raw.considering_migration === null
    ? null
    : String(raw.considering_migration).trim();
  if (intent !== null && !MIGRATION_VALUES.includes(intent)) {
    errors.push(`considering_migration "${intent}" is outside the accepted vocabulary`);
  }

  // An explicit 0 survives; `||` would turn "asymptomatic" into the default and lose
  // the only answer that distinguishes it from no answer at all.
  let severity = null;
  if (raw.severity !== undefined && raw.severity !== null && raw.severity !== '') {
    const n = Number(raw.severity);
    if (!Number.isInteger(n) || n < SEVERITY_RANGE.min || n > SEVERITY_RANGE.max) {
      errors.push(`severity must be an integer between ${SEVERITY_RANGE.min} and ${SEVERITY_RANGE.max}`);
    } else {
      severity = n;
    }
  }

  const date = typeof raw.date === 'string' ? raw.date.trim() : '';
  let normalizedDate = null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.push('date is required as YYYY-MM-DD');
  } else {
    const [y, m, d] = date.split('-').map(Number);
    const parsed = new Date(Date.UTC(y, m - 1, d));
    const roundTrips = parsed.getUTCFullYear() === y && parsed.getUTCMonth() === m - 1 && parsed.getUTCDate() === d;
    const floor = new Date(`${DATE_FLOOR}T00:00:00.000Z`).getTime();
    const ceiling = Date.now() + DATE_CEILING_DAYS_AHEAD * 86400000;
    if (!roundTrips) {
      errors.push(`date "${date}" is not a calendar date`);
    } else if (parsed.getTime() < floor || parsed.getTime() > ceiling) {
      errors.push(`date "${date}" is outside the study window`);
    } else {
      normalizedDate = date;
    }
  }

  const text = (key) => (raw[key] === undefined || raw[key] === null ? null : String(raw[key]).trim());
  const doctor = text('doctor');
  const hospital = text('hospital');
  const comment = text('comment');
  const primaryReason = text('primary_reason');
  const neededSupport = text('needed_support');

  checkLength(errors, doctor, LIMITS.doctor, 'doctor');
  checkLength(errors, hospital, LIMITS.hospital, 'hospital');
  checkLength(errors, comment, LIMITS.comment, 'comment');
  checkLength(errors, primaryReason, LIMITS.primaryReason, 'primary_reason');
  checkLength(errors, neededSupport, LIMITS.neededSupport, 'needed_support');

  // A number in a text column would be silently coerced by String() above, so a
  // `doctor: 42` submission would arrive as "42". Refuse it: the shape the form sends
  // is the shape the table declares, and a caller inventing types has not read either.
  for (const [key, value] of Object.entries({
    doctor, hospital, comment, primary_reason: primaryReason, needed_support: neededSupport
  })) {
    if (value !== null && typeof raw[key] !== 'string') errors.push(`${key} must be a string`);
  }

  if (errors.length) return { ok: false, errors, value: null };

  return {
    ok: true,
    errors: [],
    value: {
      doctor: doctor || null,
      specialty,
      gov,
      hospital: hospital || null,
      considering_migration: intent,
      primary_reason: primaryReason,
      needed_support: neededSupport,
      severity,
      comment: comment || null,
      date: normalizedDate
    }
  };
}
