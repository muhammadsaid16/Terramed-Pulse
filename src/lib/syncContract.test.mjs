/**
 * Contract suite for the submission path. Run with: node src/lib/syncContract.test.mjs
 *
 * Three surfaces must agree about one row shape, in three languages, in three places
 * that are deployed separately:
 *
 *   db/migrations/*.sql      CHECKs + the RLS policy, applied by hand in Neon
 *   src/lib/reportLimits.js  the validator, run by the browser AND the Pages Function
 *   src/components/*.jsx     the form, whose caps decide what a user can even type
 *
 * Nothing notices when they drift. A policy that is one specialty id out of date does
 * not fail a test; it 400s a real physician's report. A validator that is one
 * character looser than the table turns a 400 into a 23514 that the UI has to describe
 * as a server fault. So this file reads all three as text and asserts set equality on
 * identifiers and numeric equality on caps — never string formatting.
 *
 * Reading rather than importing the JSX is deliberate: PhysicianForm.jsx is JSX, and
 * dbService.js imports the SQL with Vite's `?raw` suffix, so neither parses under
 * plain Node.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { TERRAPULSE_DATA } from '../data/terrapulseData.js';
import { SPECIALTY_SHORT_LABELS, SPECIALTY_FULL_LABELS } from './specialties.js';
import {
  SPECIALTY_IDS, GOVERNORATE_IDS, LIMITS, SEVERITY_RANGE,
  MIGRATION_VALUES, DATE_FLOOR, SUBMISSION_FIELDS, validateSubmission
} from './reportLimits.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const SQL = read('db/migrations/0001_neon_physician_reports.sql');
const FORM = read('src/components/PhysicianForm.jsx');
const MATCHER = read('src/components/DoctorMatcher.jsx');
const DB = read('src/lib/dbService.js');
const FN = read('functions/api/reports.js');
const STATUS = read('functions/api/status.js');
const LIMITS_SRC = read('src/lib/reportLimits.js');
const TRANSLATIONS = read('src/lib/translations.js');

let passed = 0;
let total = 0;
const failures = [];

function check(condition, description) {
  total++;
  if (condition) {
    passed++;
    console.log(`  PASS: ${description}`);
  } else {
    failures.push(description);
    console.log(`  FAIL: ${description}`);
  }
}

/** Every `name IN ('a', 'b')` list in the migration, parsed. */
function sqlInLists(name) {
  const lists = [];
  for (const [, body] of SQL.matchAll(new RegExp(`${name}\\s+IN \\(([^)]*)\\)`, 'gi'))) {
    lists.push(body.split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean));
  }
  return lists;
}

/**
 * Every `char_length(col) <= N` in the migration. The same cap is written twice on
 * purpose — a table CHECK and a policy clause — and the two must not differ: the CHECK
 * is the only one that also binds the database owner.
 */
function sqlCaps(column) {
  return [...SQL.matchAll(new RegExp(`char_length\\(${column}\\)\\s*<=\\s*(\\d+)`, 'g'))].map(m => Number(m[1]));
}

const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));

// ---------------------------------------------------------------------------
// 1. Value lists: one list, three readers.
// ---------------------------------------------------------------------------
console.log('\n[Value lists: migration vs. validator vs. form]');

check(sameSet(SPECIALTY_IDS, SPECIALTY_SHORT_LABELS.map(s => s.id)),
  `reportLimits SPECIALTY_IDS is derived from SPECIALTY_SHORT_LABELS (${SPECIALTY_IDS.length} ids)`);

const specLists = sqlInLists('specialty');
check(specLists.length >= 2, `the specialty list is asserted in ${specLists.length} places in the migration (CHECK + policy)`);
check(specLists.every(list => sameSet(list, SPECIALTY_IDS)),
  'every specialty list in the migration === the validator list, exactly');

const govLists = sqlInLists('gov');
check(govLists.length >= 2, `the gov list is asserted in ${govLists.length} places in the migration`);
check(govLists.every(list => sameSet(list, GOVERNORATE_IDS)),
  `every gov list in the migration === GOVERNORATE_IDS (${GOVERNORATE_IDS.join(', ')})`);
check(sameSet(GOVERNORATE_IDS, Object.keys(TERRAPULSE_DATA.governorates)),
  'GOVERNORATE_IDS still equals the governorate keys in the shipped dataset');

const migrationLists = sqlInLists('considering_migration');
check(migrationLists.length >= 2 && migrationLists.every(list => sameSet(list, MIGRATION_VALUES)),
  `every considering_migration list === MIGRATION_VALUES (${MIGRATION_VALUES.length} tokens, Arabic included)`);

// The form's segmented control is what a user can actually click; it must be a subset
// of the vocabulary the database admits, or a legitimate answer 400s.
const formIntentValues = [...FORM.matchAll(/id: '(yes|no|hesitant)'/g)].map(m => m[1]);
check(formIntentValues.length === 3, 'the form offers exactly yes / no / hesitant');
check(formIntentValues.every(v => MIGRATION_VALUES.includes(v)),
  'every migration-intent value the form can send is admissible');

// Two label registers exist on purpose (short for the form and feed, full for the
// matcher cards). The strings differ; the ids must not.
check(sameSet(SPECIALTY_FULL_LABELS.map(s => s.id), SPECIALTY_IDS),
  'the FULL and SHORT label registers cover the same eight ids');
check(/SPECIALTY_FULL_LABELS/.test(MATCHER) && !/\{ id: 'nephrology', label_en:/.test(MATCHER),
  'DoctorMatcher imports the id list rather than keeping a fourth inline copy');

// The 45 fabricated survey_seed rows were the only thing in this app using a second
// specialty register (obgyn / family_medicine / general_surgery, `governorate` not `gov`,
// no date). They are gone, and the two invariants that replaced the old "fixture is not
// this table's shape" note: nothing invented ships in the dataset, and the migration
// stops documenting a fixture that no longer exists.
check(!('survey_seed' in TERRAPULSE_DATA),
  'no fabricated report register rides in the shipped dataset');
check(!/survey_seed/.test(SQL) && /obgyn/.test(SQL),
  'the migration dropped the deleted fixture but kept obgyn as a measured rejection');

// ---------------------------------------------------------------------------
// 2. Caps: a number written three times must be one number.
// ---------------------------------------------------------------------------
console.log('\n[Length caps: migration CHECK + policy vs. validator vs. inputs]');

const capColumns = { doctor: 'doctor', hospital: 'hospital', comment: 'comment',
  primary_reason: 'primaryReason', needed_support: 'neededSupport' };
for (const [column, key] of Object.entries(capColumns)) {
  const caps = sqlCaps(column);
  check(caps.length === 2, `${column}: cap written twice in the migration (CHECK and policy)`);
  check(caps.every(c => c === LIMITS[key]),
    `${column}: migration cap ${caps.join('/')} === LIMITS.${key} = ${LIMITS[key]}`);
}
check((FORM.match(/maxLength=\{LIMITS\.\w+\}/g) ?? []).length === 3,
  'all three typed inputs bind a LIMITS cap rather than a literal');
check(/import \{[^}]*LIMITS[^}]*\} from '..\/lib\/reportLimits'/.test(FORM),
  'PhysicianForm takes LIMITS from reportLimits, not from its own copy');

// A cap enforced in UTF-16 units would reject an emoji name the database accepts, and
// one enforced in code points is never looser than the SQL. Both directions matter.
check(/Array\.from\(value\)\.length/.test(LIMITS_SRC),
  'the validator counts code points the way char_length does');

// ---------------------------------------------------------------------------
// 3. Numeric ranges and the date window.
// ---------------------------------------------------------------------------
console.log('\n[Severity and date ranges]');

const severityRanges = [...SQL.matchAll(/severity BETWEEN (\d+) AND (\d+)/g)].map(m => [Number(m[1]), Number(m[2])]);
check(severityRanges.length >= 2, `the severity range is asserted ${severityRanges.length} times in the migration`);
check(severityRanges.every(([lo, hi]) => lo === SEVERITY_RANGE.min && hi === SEVERITY_RANGE.max),
  `severity ${SEVERITY_RANGE.min}..${SEVERITY_RANGE.max} matches the migration everywhere it appears`);
check(/0 is a real answer/.test(LIMITS_SRC),
  'the validator documents why the floor is 0 and not 1');

const floors = [...SQL.matchAll(/DATE '(\d{4}-\d{2}-\d{2})'/g)].map(m => m[1]);
check(floors.includes(DATE_FLOOR), `DATE_FLOOR ${DATE_FLOOR} is the migration\u2019s window start`);
check(/CURRENT_DATE \+ 1/.test(SQL) && /DATE_CEILING_DAYS_AHEAD = 1/.test(LIMITS_SRC),
  'the one-day-future tolerance is the same on both sides');

// ---------------------------------------------------------------------------
// 4. The validator itself, exercised as a pure function with no network.
// ---------------------------------------------------------------------------
console.log('\n[Validator: the poison payloads the migration documents]');

const without = (payload, ...keys) => Object.fromEntries(
  Object.entries(payload).filter(([k]) => !keys.includes(k))
);

const VALID = {
  doctor: 'د. سارة محمود', specialty: 'dermatology_ophthalmology', gov: 'assiut',
  hospital: 'مستشفى أسوان الجامعي', considering_migration: 'hesitant',
  primary_reason: 'salary', needed_support: 'incentive', severity: 4,
  comment: 'حرارة شديدة في العيادة', date: new Date().toISOString().slice(0, 10)
};

const poisoned = {
  'forged governorate': { ...VALID, gov: 'atlantis' },
  'seed-vocabulary specialty': { ...VALID, specialty: 'obgyn' },
  'severity above the range': { ...VALID, severity: 9 },
  'severity as a float': { ...VALID, severity: 3.5 },
  'migration "maybe"': { ...VALID, considering_migration: 'maybe' },
  'comment one over the cap': { ...VALID, comment: 'x'.repeat(LIMITS.comment + 1) },
  'future date': { ...VALID, date: '2099-01-01' },
  'pre-window date': { ...VALID, date: '2019-06-01' },
  'impossible calendar date': { ...VALID, date: '2026-02-31' },
  'missing date': without(VALID, 'date'),
  'client-invented column': { ...VALID, ip_hash: 'a'.repeat(64) },
  'the id the app uses locally': { ...VALID, id: 'report-1730000000000' },
  'not an object': 'a string',
  'an array of rows': [VALID]
};

for (const [label, payload] of Object.entries(poisoned)) {
  const result = validateSubmission(payload);
  check(result.ok === false && result.errors.length > 0,
    `rejected: ${label}${result.ok ? ' — ACCEPTED' : ` (${result.errors[0].slice(0, 48)})`}`);
}

const good = validateSubmission(VALID);
check(good.ok === true, `accepted: a full Arabic submission (${good.errors.join('; ')})`);
check(good.value?.severity === 4 && good.value?.gov === 'assiut',
  'the coerced value carries the governorate and severity the caller sent');

// An explicit zero is the answer "asymptomatic"; null/absent means no answer. The two
// must not collapse into each other, which is why the validator uses neither || nor !!.
const zero = validateSubmission({ ...VALID, severity: 0 });
check(zero.ok === true && zero.value.severity === 0, 'severity 0 survives as an answer, not as a missing value');
const absent = validateSubmission(without(VALID, 'severity'));
check(absent.ok === true && absent.value.severity === null,
  'an omitted severity stays null rather than becoming the default');
check(validateSubmission({ ...VALID, comment: 'x'.repeat(LIMITS.comment) }).ok === true,
  `a comment at exactly the cap (${LIMITS.comment}) is accepted, not merely under it`);

// Whitespace-only text becomes null, so an empty note is absent rather than a space the
// scoring engine later has to trim.
const blank = validateSubmission({ ...VALID, doctor: '   ', hospital: '', comment: '  ' });
check(blank.ok === true && blank.value.doctor === null && blank.value.hospital === null,
  'blank free-text lands as null');

// ---------------------------------------------------------------------------
// 5. The columns a client may write, and the ones it may not.
// ---------------------------------------------------------------------------
console.log('\n[Payload keys vs. table definition]');

const createBlock = SQL.match(/CREATE TABLE IF NOT EXISTS public\.physician_reports \(([\s\S]*?)\n\);/);
check(createBlock !== null, 'the migration contains a parseable CREATE TABLE');
const declared = new Map();
const serverOwned = [];
for (const line of (createBlock?.[1] ?? '').split('\n')) {
  const m = line.match(/^\s*"?(\w+)"?\s+(uuid|text|smallint|date|timestamptz)\b(.*)$/);
  if (!m) continue;
  declared.set(m[1], m[2]);
  // A DEFAULT means the server produces it, so the client must not be able to choose it.
  if (/DEFAULT/.test(m[3])) serverOwned.push(m[1]);
}
check(declared.get('id') === 'uuid' && /DEFAULT gen_random_uuid\(\)/.test(createBlock?.[1] ?? ''),
  'id is a server-generated uuid — the cross-device report-${Date.now()} collision is gone');
check(SUBMISSION_FIELDS.every(k => declared.has(k)),
  `every client-settable field is a declared column (${SUBMISSION_FIELDS.join(', ')})`);
check(SUBMISSION_FIELDS.every(k => !serverOwned.includes(k)),
  `no client-settable field is server-owned (${serverOwned.join(', ')} stay out of reach)`);
check(!SUBMISSION_FIELDS.includes('ip_hash') && !SUBMISSION_FIELDS.includes('submitted_at'),
  'the quota key and the arrival timestamp are not client-supplied');

const required = [...(createBlock?.[1] ?? '').matchAll(/^\s*"?(\w+)"?\s+\w+[^,\n]*NOT NULL(?! DEFAULT)/gm)].map(m => m[1]);
check(required.every(col => SUBMISSION_FIELDS.includes(col) || ['ip_hash'].includes(col)),
  `every NOT NULL-without-DEFAULT column is either sent or server-set (${required.join(', ')})`);
check(validateSubmission(without(VALID, 'specialty')).ok === false,
  'omitting a NOT NULL column is refused locally instead of at the table');

// ---------------------------------------------------------------------------
// 6. The function is the only writer, and it writes the way the migration says.
// ---------------------------------------------------------------------------
console.log('\n[Pages Function vs. migration]');

check(/import \{[^}]*validateSubmission[^}]*\} from '..\/..\/src\/lib\/reportLimits(\.js)?'/.test(FN),
  'the function shares the browser\u2019s validator rather than carrying a second one');
const insertStatement = (FN.match(/const INSERT_SQL = `([\s\S]*?)`/) ?? [])[1] ?? '';
check(/insert into public\.physician_reports/i.test(insertStatement)
  && /where public\.admit_submission\(\$11\)/i.test(insertStatement),
  'quota check and insert are one atomic statement');
check(insertStatement !== '' && !/returning/i.test(insertStatement),
  'the statement the function issues has no RETURNING, which would need a SELECT');
check(/rowCount === 1/.test(FN) && /429/.test(FN),
  'rowCount 1 answers 201 and rowCount 0 answers 429 — the quota is not an error');
check(/cf-connecting-ip/.test(FN) && /SHA-256/.test(FN) && /IP_SALT/.test(FN),
  'the quota key is a salted hash of the platform-supplied address, not a raw IP');
check(!/select \*|select\s+\w+\s+from public\.physician_reports/i.test(FN),
  'the function issues no read of physician_reports');
check(!/res\.json\(\)|body\.rows/i.test(FN), 'no response body carries row data out');
check(/NEON_URL/.test(FN) && !/VITE_SUPABASE|supabase\.co|apikey/.test(FN),
  'the credential is a Pages secret named NEON_URL, never a VITE_* value');
check(!/neondb_owner/.test(`${FN}\n${STATUS}\n${DB}`),
  'no source file mentions the owner role the function must not connect as');
check(/storage_unconfigured/.test(FN) && /503/.test(FN),
  'a missing secret is reported as missing configuration rather than a successful send');

// Both of these were measured under `wrangler pages dev`, not reasoned about.
// A client built at module scope answers the first submission and then hangs the next
// one: Workers binds every I/O object to the request that created it, and cancels the
// handler with "Cannot perform I/O on behalf of a different request". Separately,
// pg's Pool takes an options object, and a bare URL handed to it fails with a driver
// message that quotes the whole connection string — credential included — into the log.
check(!/new Pool/.test(FN) && /new Client\(/.test(FN),
  'the database client is built inside the request, never pooled at module scope');
check(/connectionString:/.test(FN),
  'the connection is handed to the driver as an object, not as a bare URL string');
check(/client\.end\(\)\.catch/.test(FN),
  'closing the client cannot mask the outcome of the write it followed');
check(/\[redacted\]@/.test(FN),
  'a driver error that quotes the connection string has its credential stripped before logging');

// The status endpoint answers the one question the badge asks, and nothing else.
check(/disabled-by-design/.test(STATUS) && !/physician_reports/.test(STATUS),
  'the status view states the read posture without touching the table');
check(!/Pool|NEON_URL.*query/.test(STATUS), 'the status endpoint opens no database connection');

// ---------------------------------------------------------------------------
// 7. States, badges and copy.
// ---------------------------------------------------------------------------
console.log('\n[States vs. UI coverage]');

const stateBlock = DB.match(/export const SYNC_STATE = \{([\s\S]*?)\n\};/);
check(stateBlock !== null, 'dbService declares SYNC_STATE');
const stateValues = [...(stateBlock?.[1] ?? '').matchAll(/:\s*'([a-z_]+)'/g)].map(m => m[1]);
const badgeKeys = [...FORM.matchAll(/^\s*([a-z_]+):\s*t\.(\w+),?$/gm)].map(m => m[1]);
// `ok` is deliberately absent from the badge map: it describes one submission's result,
// which is what the toast says, not what the endpoint can do.
const writeOnlyStates = ['ok'];
for (const state of stateValues) {
  check(badgeKeys.includes(state) || writeOnlyStates.includes(state),
    `"${state}" is either rendered as a badge or documented as a per-submission result`);
}
check(!stateValues.includes('schema_missing') && !stateValues.includes('forbidden'),
  'the PostgREST-era states are gone with the PostgREST client');
check(/read_blocked/.test(stateValues.join()) && /syncSubmitOnly/.test(FORM),
  'the shipped posture has its own string in both the service and the badge map');

const usedKeys = [...new Set([...FORM.matchAll(/(?:^|[^\w.])t\.(\w+)/g)].map(m => m[1]))];
for (const key of usedKeys) {
  check([...TRANSLATIONS.matchAll(new RegExp(`^\\s*${key}:`, 'gm'))].length >= 2,
    `translation key "${key}" used by the form exists in both en and ar`);
}
// The modal writes bilingual strings inline (it predates the translation table), so the
// keys it would need are the ones asserted above; check the removed ones stay removed.
check(!/feedSub:/.test(TRANSLATIONS),
  'no "Live Synchronized Feed" copy survives a system with no read path');
check(!/Supabase|supabase/.test(`${TRANSLATIONS}\n${DB}\n${FORM}\n${MATCHER}`),
  'no user-facing string or client file still names Supabase');

// ---------------------------------------------------------------------------
// 8. The posture the migration claims.
// ---------------------------------------------------------------------------
console.log('\n[Posture assertions]');

check(/ENABLE ROW LEVEL SECURITY/.test(SQL), 'RLS is enabled on the table');
check(!/FORCE ROW LEVEL SECURITY/.test(SQL), 'RLS is not forced, so the owner can still moderate');
check(!/FOR SELECT TO web_writer/.test(SQL), 'no policy grants web_writer a read');
check(!/GRANT[^;]*\bSELECT\b[^;]*TO web_writer/.test(SQL), 'web_writer holds no table-level SELECT');
check(!/\bUPDATE\b|\bDELETE\b/.test((SQL.match(/GRANT[^;]*TO web_writer;/g) ?? []).join('')),
  'web_writer is granted neither UPDATE nor DELETE');
check(/REVOKE ALL ON public\.physician_reports FROM web_writer/.test(SQL),
  'web_writer privileges are asserted, not inherited');
check(/GRANT INSERT ON public\.physician_reports TO web_writer/.test(SQL),
  'INSERT is granted explicitly to the one role that needs it');
check(!/NOTIFY pgrst/.test(SQL), 'no PostgREST schema-cache signal, which only meant something on Supabase');
check(!/\banon\b\s*(=|IN)/.test(SQL), 'no policy or grant is addressed to the Supabase anon role');
check(/CREATE ROLE web_writer LOGIN;/.test(SQL) && !/PASSWORD/.test(SQL.match(/CREATE ROLE[^;]*/)?.[0] ?? ''),
  'the role is created without a password in the file, so no credential transits a commit');
check(/SECURITY DEFINER/.test(SQL) && /SET search_path = public, pg_temp/.test(SQL),
  'the definer function pins its search_path');
check(/REVOKE ALL ON FUNCTION public\.admit_submission\(text\) FROM PUBLIC/.test(SQL),
  'the quota function is not callable by every role in the database');

// Neon refuses `ALTER DATABASE SET` for an unknown custom GUC with 42501, so the
// tunable has to live in a row. That row is then a second table the writer must not
// be able to read — and certainly not to widen.
check(/CREATE TABLE IF NOT EXISTS public\.submission_quota/.test(SQL),
  'the quota lives in a table, because Neon will not accept ALTER DATABASE SET for it');
check(/REVOKE ALL ON public\.submission_quota FROM web_writer/.test(SQL),
  'the writer holds no privilege on the quota row it is rate-limited by');
check(/value BETWEEN 1 AND 1000/.test(SQL),
  'the quota column cannot be set somewhere outside the sane band');
check(/ON CONFLICT \(key\) DO NOTHING/.test(SQL),
  're-applying the migration does not reset an operator-tuned quota');
check(/submission_quota/.test(SQL.match(/DO \$guard\$[\s\S]*?\$guard\$;/)?.[0] ?? ''),
  'the guard inspects the quota table, so a pre-existing object of another shape aborts');

// CREATE TABLE IF NOT EXISTS alone would silently keep an incompatible existing object.
check(/DO \$guard\$/.test(SQL), 'the migration carries an apply guard');
check(/RAISE EXCEPTION/.test(SQL), 'the guard aborts rather than adapting');
check(/expected_columns/.test(SQL) && /information_schema\.columns/.test(SQL),
  'the guard checks column names and types');
check(/must not be the table owner|owner.*web_writer/i.test(SQL),
  'the guard refuses a table owned by the writer, which would make RLS decorative');
check(/policyname <> 'web_writer may submit a physician report'/.test(SQL),
  'the guard rejects any other web_writer policy, since permissive policies OR together');

// A submission always carries a date, so the column is NOT NULL and the window is
// bounded twice — as a table CHECK and as a policy clause — rather than left to
// three-valued logic. The client is the one that supplies it.
check(/"date"\s+date\s+NOT NULL/.test(SQL), 'the reporting date column is NOT NULL in the table');
check((SQL.match(/"date" BETWEEN DATE/g) ?? []).length >= 2,
  'the date window is enforced by both the CHECK and the policy');
check(/date: report\.date/.test(`${DB}\n${LIMITS_SRC}`) || /'date'/.test(LIMITS_SRC),
  'the date a submission carries is validated before the request is made');

// ---------------------------------------------------------------------------
console.log(`\n${passed}/${total} sync-contract checks passed.`);
if (failures.length) {
  console.log('\nFailures:');
  failures.forEach(f => console.log(`  - ${f}`));
  console.log(
    '\nA disagreement between the migration, the validator and the form means real\n' +
      'submissions are rejected, or accepted more widely than intended. Fix every side\n' +
      'in one change: the SQL, reportLimits.js, and whatever renders it.'
  );
  process.exit(1);
}
