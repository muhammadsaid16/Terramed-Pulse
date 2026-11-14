/**
 * Headline-metric parity guard.
 *
 * The hero, the ticker, the KPI strip and the divergence cards all quote
 * figures that a judging panel will check against the map and the charts.
 * This test fails if any of those figures is typed into a component by hand
 * instead of being derived from the shipped dataset.
 *
 * Run: node src/lib/headlineMetrics.test.mjs
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(here, '..');

const { getHeadlineMetrics } = await import('./headlineMetrics.js');
const { TERRAPULSE_DATA } = await import('../data/terrapulseData.js');

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ✅ PASS: ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`  ❌ FAIL: ${name}`);
    console.log(`     ${error.message}`);
  }
}

console.log('='.repeat(80));
console.log('HEADLINE METRIC PARITY');
console.log('='.repeat(80));

const m = getHeadlineMetrics();
const govs = TERRAPULSE_DATA.governorates;

check('metrics module exposes the fields the UI reads', () => {
  for (const key of [
    'warmingPerDecade',
    'warmingMaxPerDecade',
    'lstWindowDelta',
    'topGov',
    'hottest',
    'divergence',
    'cairoAodLast',
    'cairoPm25Last',
    'strongestMk'
  ]) {
    assert.ok(m[key] !== undefined, `missing ${key}`);
  }
});

check('Egypt warming rate matches the mean of the per-governorate OLS slopes', () => {
  const slopes = Object.values(govs).map(
    g => g.statistics.T2M.ols.rate_per_decade
  );
  const mean = slopes.reduce((a, b) => a + b, 0) / slopes.length;
  assert.ok(
    Math.abs(m.warmingPerDecade - mean) < 1e-6,
    `metric ${m.warmingPerDecade} vs dataset mean ${mean}`
  );
});

check('the top HNI governorate is the one the dataset scores highest', () => {
  const expected = Object.entries(govs).sort(
    (a, b) => b[1].baseline_indices.hni - a[1].baseline_indices.hni
  )[0];
  assert.equal(m.topGov.id, expected[0]);
  assert.equal(m.topGov.hni, expected[1].baseline_indices.hni);
});

check('the hottest governorate is the one with the largest T2M_MAX slope', () => {
  const expected = Object.entries(govs).sort(
    (a, b) =>
      b[1].statistics.T2M_MAX.ols.rate_per_decade -
      a[1].statistics.T2M_MAX.ols.rate_per_decade
  )[0];
  assert.equal(m.hottest.id, expected[0]);
});

check('the hottest peak equals the maximum T2M_MAX in that series', () => {
  const series = govs[m.hottest.id].series.T2M_MAX;
  assert.equal(m.hottest.peak, Math.max(...series));
});

check('the strongest Mann-Kendall result is significant and is the largest |Z|', () => {
  assert.ok(m.strongestMk, 'no significant trend found');
  assert.equal(m.strongestMk.is_significant, true);

  let best = null;
  for (const gov of Object.values(govs)) {
    for (const stat of Object.values(gov.statistics)) {
      const mk = stat.mann_kendall;
      if (!mk.is_significant) continue;
      if (!best || Math.abs(mk.z) > Math.abs(best.z)) best = mk;
    }
  }
  assert.ok(
    Math.abs(m.strongestMk.z - best.z) < 1e-9,
    `metric Z ${m.strongestMk.z} vs dataset Z ${best.z}`
  );
});

check('the divergence reads two different humidity directions', () => {
  const { aswan, alexandria, cairo } = m.divergence;
  assert.ok(
    Math.sign(cairo.humidSlope) !== Math.sign(alexandria.humidSlope),
    'Cairo and Alexandria humidity should move in opposite directions'
  );
  assert.ok(aswan.heatSlope > alexandria.heatSlope, 'Upper Egypt should warm faster');
});

check('the post-2010 warming direction is measured, not assumed', () => {
  const acc = m.warmingAcceleration;
  assert.ok(acc, 'no split measured');
  assert.equal(acc.splitYear, 2010);
  assert.equal(typeof acc.accelerating, 'boolean');
  // The two halves must be computed from different slices of the series.
  assert.notEqual(acc.before, acc.after);
});

check('the LST window delta matches the warming-stripe band it describes', () => {
  const years = govs.cairo.series.years;
  const means = years.map((_, i) => {
    const vals = Object.values(govs).map(g => g.series.LST[i]);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  });
  const avg = (from, to) => {
    const slice = means.slice(years.indexOf(from), years.indexOf(to) + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  };
  const expected = avg(2021, 2025) - avg(1995, 1999);
  assert.ok(
    Math.abs(m.lstWindowDelta - expected) < 1e-9,
    `metric ${m.lstWindowDelta} vs ${expected}`
  );
});

check('no component hardcodes a figure the dataset owns', () => {
  const components = [
    'KpiStrip.jsx',
    'OppositeTrends.jsx',
    path.join('..', 'App.jsx')
  ];
  // Figures that used to be typed into the markup by hand.
  const banned = [
    '88.4',       // Aswan HNI — the dataset says 75.7
    '46.2',       // Aswan T2M_MAX peak — the dataset says 48.94
    '+0.44',      // Egypt warming rate — the dataset says ~0.34
    '3.94',       // Mann-Kendall Z
    '-0.003'      // NDVI per year
  ];
  for (const file of components) {
    const text = fs.readFileSync(path.join(srcDir, 'components', file), 'utf8');
    for (const needle of banned) {
      assert.ok(
        !text.includes(needle),
        `${file} still hardcodes "${needle}" instead of deriving it`
      );
    }
  }
});

check('the shipped copy does not claim a humidity collapse in Upper Egypt', () => {
  const translations = fs.readFileSync(
    path.join(srcDir, 'lib', 'translations.js'),
    'utf8'
  );
  assert.ok(
    !translations.includes('-2.8%/decade'),
    'the dataset shows humidity rising in Assiut/Cairo, not collapsing'
  );
  assert.ok(
    !translations.includes('HNI: 88.4'),
    'the dataset HNI for Aswan is 75.7'
  );
});

console.log('='.repeat(80));
console.log(`🏁 RESULT: ${passed} / ${passed + failed} tests passed`);
if (failed > 0) {
  console.log(`   ${failed} FAILED`);
  process.exitCode = 1;
}
console.log('='.repeat(80));
