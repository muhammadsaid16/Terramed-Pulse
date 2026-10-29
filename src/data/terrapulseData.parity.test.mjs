/**
 * Drift gate between the two physical copies of the TerraPulse dataset:
 *   src/data/terrapulseData.js  — what the React app renders
 *   legacy/data.json            — what pipeline/fetch_nasa_data.py regenerates
 *
 * They are maintained independently on purpose (the pipeline does not write the React
 * file), so nothing else notices when one side's 31-year series is edited and the other
 * isn't. This suite pins that gap shut: the ONLY permitted divergence is governorate
 * lat/lng, which were hand-nudged to polygon centroids for marker placement.
 *
 * Run with: node src/data/terrapulseData.parity.test.mjs   (also part of `npm test`)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TERRAPULSE_DATA as APP } from './terrapulseData.js';

const LEGACY_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'legacy', 'data.json');

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
const section = (title) => console.log(`\n--- ${title} ---`);

const isObj = (v) => v !== null && typeof v === 'object';

// Fields allowed to differ, with the reason recorded so a future edit has to argue for it.
const ALLOWED_DIFF = new Set(['lat', 'lng']);

function walk(a, b, trail, out) {
  const leaf = trail.split('.').pop();
  if (!isObj(a) || !isObj(b)) {
    if (a !== b) out.push({ trail, kind: ALLOWED_DIFF.has(leaf) ? 'allowed' : 'value', app: a, legacy: b });
    return;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) { out.push({ trail, kind: 'type', app: typeof a, legacy: typeof b }); return; }
    if (a.length !== b.length) { out.push({ trail, kind: 'length', app: a.length, legacy: b.length }); return; }
    for (let i = 0; i < a.length; i++) walk(a[i], b[i], `${trail}[${i}]`, out);
    return;
  }
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (!(key in a) || !(key in b)) {
      out.push({ trail: `${trail}.${key}`, kind: 'presence', app: key in a, legacy: key in b });
      continue;
    }
    walk(a[key], b[key], trail ? `${trail}.${key}` : key, out);
  }
}

// =========================================================================
section('0. Both artifacts are readable');

let legacy = null;
try {
  legacy = JSON.parse(fs.readFileSync(LEGACY_PATH, 'utf8'));
  check(true, `legacy/data.json parses (${fs.statSync(LEGACY_PATH).size} bytes)`);
} catch (err) {
  check(false, `legacy/data.json unreadable: ${err.message}`);
}

if (!legacy) {
  console.log('\nCannot continue without the second copy.');
  process.exit(1);
}

// =========================================================================
section('1. Shape matches on both sides');

check(
  JSON.stringify(Object.keys(APP).sort()) === JSON.stringify(Object.keys(legacy).sort()),
  `top-level keys identical (${Object.keys(APP).join(', ')})`
);

const appGovs = Object.keys(APP.governorates).sort();
const legacyGovs = Object.keys(legacy.governorates).sort();
check(
  JSON.stringify(appGovs) === JSON.stringify(legacyGovs),
  `same ${appGovs.length} governorates: ${appGovs.join(', ')}`
);

// =========================================================================
section('2. Every satellite series is identical');

const METRIC_KEYS = Object.keys(APP.governorates.cairo.series).filter(k => k !== 'years');
check(METRIC_KEYS.length >= 10, `${METRIC_KEYS.length} metric series compared per governorate`);

let seriesDiffs = 0;
for (const govId of appGovs) {
  const a = APP.governorates[govId].series;
  const b = legacy.governorates[govId]?.series;
  if (!b) { check(false, `${govId}: legacy copy has no series block`); seriesDiffs++; continue; }
  if (JSON.stringify(a.years) !== JSON.stringify(b.years)) {
    check(false, `${govId}: the years axis itself differs`);
    seriesDiffs++;
    continue;
  }
  for (const metric of METRIC_KEYS) {
    if (!(metric in b)) { seriesDiffs++; continue; }
    if (JSON.stringify(a[metric]) !== JSON.stringify(b[metric])) seriesDiffs++;
  }
}
check(seriesDiffs === 0, `all ${METRIC_KEYS.length} x ${appGovs.length} series are value-for-value identical (${seriesDiffs} diverged)`);

let statsDiffs = 0;
for (const govId of appGovs) {
  const a = APP.governorates[govId].statistics || {};
  const b = legacy.governorates[govId]?.statistics || {};
  const out = [];
  walk(a, b, `${govId}.statistics`, out);
  statsDiffs += out.length;
  out.slice(0, 3).forEach(d => console.log(`    ${govId}: ${d.trail} app=${d.app} legacy=${d.legacy}`));
}
check(statsDiffs === 0, `published statistics identical on both sides (${statsDiffs} diverged)`);

// =========================================================================
section('3. Indices, demographics and seed survey agree');

const idxOut = [];
appGovs.forEach(g => walk(APP.governorates[g].baseline_indices, legacy.governorates[g]?.baseline_indices, `${g}.baseline_indices`, idxOut));
check(idxOut.length === 0, `baseline_indices agree for every governorate (${idxOut.length} diverged)`);

const demoOut = [];
appGovs.forEach(g => walk(APP.governorates[g].demographics, legacy.governorates[g]?.demographics, `${g}.demographics`, demoOut));
check(demoOut.length === 0, `demographics agree for every governorate (${demoOut.length} diverged)`);

const seedOut = [];
walk(APP.survey_seed, legacy.survey_seed, 'survey_seed', seedOut);
check(APP.survey_seed.length === legacy.survey_seed.length, `same seed report count (${APP.survey_seed.length} vs ${legacy.survey_seed.length})`);
check(seedOut.length === 0, `seed survey is identical (${seedOut.length} diverged)`);

const restOut = [];
['metadata', 'specialties', 'case_studies'].forEach(k => walk(APP[k], legacy[k], k, restOut));
check(restOut.length === 0, `metadata, specialties and case_studies identical (${restOut.length} diverged)`);
if (restOut.length) restOut.slice(0, 5).forEach(d => console.log(`    ${d.trail} app=${JSON.stringify(d.app)} legacy=${JSON.stringify(d.legacy)}`));

// =========================================================================
section('4. lat/lng is the ONLY sanctioned divergence');

const all = [];
walk(APP, legacy, '', all);
const real = all.filter(d => d.kind !== 'allowed');
const allowed = all.filter(d => d.kind === 'allowed');

check(real.length === 0, `no unsanctioned field differs anywhere in the tree (${real.length} found)`);
if (real.length) real.slice(0, 12).forEach(d => console.log(`    ${d.kind.toUpperCase()} ${d.trail}: app=${JSON.stringify(d.app)} legacy=${JSON.stringify(d.legacy)}`));

check(
  allowed.length === appGovs.length * 2,
  `exactly the ${appGovs.length * 2} expected lat/lng offsets are present (${allowed.length})`
);
allowed.forEach(d => {
  const govId = d.trail.split('.')[1];
  check(
    /^governorates\..*\.(lat|lng)$/.test(d.trail) && Math.abs(d.app - d.legacy) < 1.0,
    `${govId}: ${d.trail.split('.').pop()} ${d.legacy} -> ${d.app} stays a sub-degree centroid nudge`
  );
});

// =========================================================================
console.log('\n' + '='.repeat(80));
console.log(` RESULTS: ${passed} / ${total} Tests Passed (${((passed / total) * 100).toFixed(1)}%)`);
if (failures.length) {
  console.log(`\n FAILURES (${failures.length}):`);
  failures.forEach(f => console.log(`   - ${f}`));
  console.log(`
 If a divergence is real and intended, regenerate the other copy with
 python3 pipeline/fetch_nasa_data.py, or widen ALLOWED_DIFF in this file with a reason.
 If it is not, the two datasets have drifted and the app is rendering numbers the
 pipeline no longer produces.`);
  process.exit(1);
}
console.log('='.repeat(80));
process.exit(0);
