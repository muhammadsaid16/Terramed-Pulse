/**
 * Contract suite for the Supabase write path. Run with: node src/lib/rlsContract.test.mjs
 *
 * The RLS policy in supabase/migrations/0001_init_physician_reports.sql is the only
 * thing standing between a public submission form and a public table of physicians'
 * migration intent. It is also the only part of the app that lives in another language,
 * in another directory, and is applied by hand — so nothing else notices when the two
 * sides stop agreeing. A policy that is one specialty id out of date does not fail a
 * test; it 400s a real doctor's report.
 *
 * These checks read the files as text instead of importing the components:
 * PhysicianForm.jsx is JSX and dbService.js imports the SQL with Vite's `?raw` suffix,
 * so neither parses under plain Node. Regex over source is deliberate, and the
 * assertions are set-equality on identifiers — not string formatting.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { TERRAPULSE_DATA } from '../data/terrapulseData.js';
import { SPECIALTY_SHORT_LABELS } from './specialties.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const SQL = read('supabase/migrations/0001_init_physician_reports.sql');
const FORM = read('src/components/PhysicianForm.jsx');
const MATCHER = read('src/components/DoctorMatcher.jsx');
const DB = read('src/lib/dbService.js');
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

/** Members of the first SQL `name IN ('a', 'b')` list, or null if absent. */
function sqlInList(name) {
  const match = SQL.match(new RegExp(`${name}\\s+IN \\(([^)]*)\\)`, 'i'));
  if (!match) return null;
  return match[1].split(',').map((s) => s.trim().replace(/^'|'$/g, '')).filter(Boolean);
}

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

// ---------------------------------------------------------------------------
// 1. The policy's value lists must be exactly what the form can submit.
// ---------------------------------------------------------------------------
console.log('\n[Policy value lists vs. what the form can submit]');

const appSpecialties = SPECIALTY_SHORT_LABELS.map((s) => s.id);
const policySpecialties = sqlInList('specialty');
check(policySpecialties !== null, 'migration declares a specialty IN(...) list');
check(
  sameSet(policySpecialties ?? [], appSpecialties),
  `policy specialty list === SPECIALTY_SHORT_LABELS ids (${appSpecialties.length} values)`
);

const appGovernorates = Object.keys(TERRAPULSE_DATA.governorates);
const policyGovernorates = sqlInList('gov');
check(policyGovernorates !== null, 'migration declares a gov IN(...) list');
check(
  sameSet(policyGovernorates ?? [], appGovernorates),
  `policy gov list === governorate keys (${appGovernorates.join(', ')})`
);

const formMigrationValues = [...FORM.matchAll(/id:\s*'(yes|no|hesitant)'/g)].map((m) => m[1]);
const policyMigration = sqlInList('considering_migration') ?? [];
check(formMigrationValues.length === 3, 'form offers exactly yes / no / hesitant');
check(
  formMigrationValues.every((v) => policyMigration.includes(v)),
  'every migration-intent value the form sends is allowed by the policy'
);

// DoctorMatcher keeps its own inline copy of the specialty ids and hands one of
// them straight to the form via onVoiceNeeds -> preselectedSpecialty, which the form
// applies with a useEffect that bypasses the <select>. So it is a third writer of
// this column, and it has to agree too.
const matcherSpecialties = [...MATCHER.matchAll(/\{ id: '(\w+)', label_en:/g)].map((m) => m[1]);
check(matcherSpecialties.length === 8, `matcher declares ${matcherSpecialties.length} specialties`);
check(
  matcherSpecialties.every((v) => (policySpecialties ?? []).includes(v)),
  'every specialty the matcher can preselect is allowed by the policy'
);

// The 45 embedded survey_seed rows use a different register (obgyn / family_medicine
// / general_surgery, `governorate` not `gov`, no `date`). They are display fixtures
// and are never submitted; the policy must keep matching the writer, not the fixture.
const seedSpecialties = [...new Set((TERRAPULSE_DATA.survey_seed ?? []).map((r) => r.specialty))];
const seedOnly = seedSpecialties.filter((s) => !(policySpecialties ?? []).includes(s));
check(seedOnly.length > 0, `survey_seed uses ${seedOnly.length} specialty ids the policy rejects (expected)`);
check(
  /survey_seed/.test(SQL) && /obgyn/.test(SQL),
  'the migration documents that survey_seed is not this table\'s shape'
);

const formReasons = [...FORM.matchAll(/<option value="(\w+)">/g)].map((m) => m[1]);
check(
  formReasons.every((v) => v.length <= (policyLimitsFor('primary_reason') ?? 0)),
  `every select value fits its column cap (${formReasons.length} fixed values)`
);

// ---------------------------------------------------------------------------
// 2. Caps the policy enforces must be caps the inputs enforce, or a long note
//    becomes a submission the server rejects after the user pressed Send.
// ---------------------------------------------------------------------------
function policyLimitsFor(column) {
  const match = SQL.match(new RegExp(`char_length\\(${column}\\)\\s*<=\\s*(\\d+)`));
  return match ? Number(match[1]) : null;
}
console.log('\n[Text length caps: input maxLength vs. WITH CHECK]');

const limitsBlock = FORM.match(/const LIMITS = \{([^}]*)\}/);
check(limitsBlock !== null, 'PhysicianForm declares a LIMITS map');
const formLimits = {};
for (const [, key, value] of (limitsBlock?.[1] ?? '').matchAll(/(\w+):\s*(\d+)/g)) {
  formLimits[key] = Number(value);
}
for (const column of ['doctor', 'hospital', 'comment']) {
  check(
    formLimits[column] !== null && formLimits[column] === policyLimitsFor(column),
    `${column}: input cap ${formLimits[column]} === policy char_length cap ${policyLimitsFor(column)}`
  );
}
check(
  (FORM.match(/maxLength=\{LIMITS\.\w+\}/g) ?? []).length === 3,
  'all three caps are actually bound to an input'
);

// ---------------------------------------------------------------------------
// 3. The INSERT payload must only name declared columns, and must always supply
//    the NOT NULL ones.
// ---------------------------------------------------------------------------
console.log('\n[INSERT payload vs. table definition]');

const createBlock = SQL.match(/CREATE TABLE IF NOT EXISTS public\.physician_reports \(([\s\S]*?)\n\);/);
check(createBlock !== null, 'migration contains a parseable CREATE TABLE');
const declared = new Map();
const notNull = [];
for (const line of (createBlock?.[1] ?? '').split('\n')) {
  const m = line.match(/^\s*"?(\w+)"?\s+(text|smallint|date|timestamptz)\b(.*)$/);
  if (!m) continue;
  declared.set(m[1], m[2]);
  // A NOT NULL column with a DEFAULT is the server's job, not the client's.
  if (/NOT NULL/.test(m[3]) && !/DEFAULT/.test(m[3])) notNull.push(m[1]);
}
check(declared.size >= 12, `${declared.size} columns declared`);

const payloadBlock = DB.match(/const payload = \{([\s\S]*?)\n  \};/);
check(payloadBlock !== null, 'dbService builds a parseable INSERT payload');
const payloadKeys = [...(payloadBlock?.[1] ?? '').matchAll(/^\s*"?(\w+)"?\s*:/gm)].map((m) => m[1]);
check(
  payloadKeys.length > 0 && payloadKeys.every((k) => declared.has(k)),
  `every payload key is a declared column (${payloadKeys.join(', ')})`
);
check(
  notNull.every((k) => payloadKeys.includes(k)),
  `every NOT NULL column is always sent (${notNull.join(', ')})`
);
check(
  sameSet(notNull, ['id', 'specialty', 'gov']),
  'the required columns are exactly id, specialty, gov'
);

// ---------------------------------------------------------------------------
// 4. Every state the service can report needs a UI label, or the badge quietly
//    degrades to a generic error.
// ---------------------------------------------------------------------------
console.log('\n[Sync states vs. UI coverage]');

const stateBlock = DB.match(/export const SYNC_STATE = \{([\s\S]*?)\n\};/);
check(stateBlock !== null, 'dbService declares SYNC_STATE');
const stateValues = [...(stateBlock?.[1] ?? '').matchAll(/:\s*'(\w+)'/g)].map((m) => m[1]);
const badgeKeys = [...FORM.matchAll(/^\s*(\w+):\s*t\.(\w+),?$/gm)].map((m) => m[1]);
for (const state of stateValues) {
  check(badgeKeys.includes(state), `PhysicianForm renders a badge for the "${state}" state`);
}
const usedKeys = [...new Set([...FORM.matchAll(/(?:^|[^\w.])t\.(\w+)/g)].map((m) => m[1]))];
for (const key of usedKeys) {
  // One file, two locale objects: each key must appear at least twice.
  check(
    [...TRANSLATIONS.matchAll(new RegExp(`^\\s*${key}:`, 'gm'))].length >= 2,
    `translation key "${key}" exists in both en and ar`
  );
}

// ---------------------------------------------------------------------------
// 5. The posture the migration claims.
// ---------------------------------------------------------------------------
console.log('\n[Posture assertions]');

check(/ENABLE ROW LEVEL SECURITY/.test(SQL), 'RLS is enabled on the table');
check(!/FOR SELECT TO anon/.test(SQL), 'no policy grants anon a read');
check(!/GRANT[^;]*\bSELECT\b[^;]*TO anon/.test(SQL), 'anon holds no table-level SELECT');
check(!/\bUPDATE\b|\bDELETE\b/.test((SQL.match(/GRANT[^;]*TO anon;/g) ?? []).join('')), 'anon is granted neither UPDATE nor DELETE');
check(/REVOKE ALL ON public\.physician_reports FROM anon/.test(SQL), 'anon privileges are asserted, not inherited');
check(/GRANT INSERT ON public\.physician_reports TO anon/.test(SQL), 'anon is granted INSERT explicitly');
check(/NOTIFY pgrst/.test(SQL), "the migration reloads PostgREST's schema cache");
check(/42501/.test(DB) && /PGRST205/.test(DB), 'a denied read, a stale cache and an absent table are classified apart');
check(
  DB.includes("import migrationSql from '../../supabase/migrations/0001_init_physician_reports.sql?raw'"),
  'the modal shows this migration verbatim instead of a second copy of it'
);
check(/isSecretKey/.test(DB), 'dbService can recognise a service-role key');
check(/if \(isSecretKey\(key\)\) return false/.test(DB), 'saveDbConfig refuses to persist a secret key');
check(!/sb_secret_[A-Za-z0-9]/.test(`${SQL}\n${DB}\n${FORM}`), 'no secret key value appears in the source');

// A submission always carries a date, so the policy says so rather than leaving it
// to three-valued logic; and the app must never be able to post without one.
check(/"date" IS NOT NULL/.test(SQL), 'the policy requires a reporting date explicitly');
check(/date: report\.date \|\| new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]/.test(DB), 'the payload always supplies a date');

// CREATE TABLE IF NOT EXISTS alone would silently keep an incompatible existing object.
check(/DO \$guard\$/.test(SQL), 'the migration carries an apply guard');
check(/RAISE EXCEPTION/.test(SQL), 'the guard aborts rather than adapting');
check(/expected_columns/.test(SQL) && /information_schema\.columns/.test(SQL), 'the guard checks column names and types');
check(/policyname <> 'anon may submit a physician report'/.test(SQL), 'the guard rejects any other anon policy');

// ---------------------------------------------------------------------------
console.log(`\n${passed}/${total} rls-contract checks passed.`);
if (failures.length) {
  console.log('\nFailures:');
  failures.forEach((f) => console.log(`  - ${f}`));
  console.log(
    '\nA policy/app disagreement means real submissions are rejected, or accepted more\n' +
      'widely than intended. Fix both sides in one change: the migration and the form that feeds it.'
  );
  process.exit(1);
}
