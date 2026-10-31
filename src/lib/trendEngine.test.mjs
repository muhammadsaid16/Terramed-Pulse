/**
 * Verification suite for the LIVE trend engine (src/lib/trendEngine.js) — the one the
 * React app actually imports. Run with: node src/lib/trendEngine.test.mjs
 *
 * pipeline/test-legacy-engine.js covers the legacy vanilla engine for cross-runtime
 * parity; this file covers shipped behaviour.
 */

import {
  lnGamma, betacf, ibeta, erf, standardNormalCdf, getTCritical95, studentTPValue,
  linearRegression, mannKendall, theilSenSlope, deseasonalize, minMaxNormalize,
  HNI_WEIGHTS, computeHNI, computeWNIFromReports, SPECIALTY_WEIGHTS, matchSpecialty,
  simulatePolicyInterventions, ADMISSIONS_MODEL, RETENTION_MODEL, RETENTION_CEILING,
  NEUTRAL_INDICES, WNI_PRIOR_DEFAULT
} from './trendEngine.js';
import { TERRAPULSE_DATA } from '../data/terrapulseData.js';

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

function closeTo(actual, expected, tolerance) {
  return Math.abs(actual - expected) <= tolerance;
}

function section(title) {
  console.log(`\n--- ${title} ---`);
}

// =========================================================================
section('1. Special mathematical functions');
// =========================================================================

check(closeTo(lnGamma(5), Math.log(24), 1e-6), 'lnGamma(5) equals ln(4!)');
check(closeTo(erf(0), 0, 1e-9), 'erf(0) is 0');
check(closeTo(erf(1), 0.84270079, 1e-6), 'erf(1) matches reference value');
check(erf(-2) === -erf(2), 'erf is odd-symmetric');
check(closeTo(standardNormalCdf(0), 0.5, 1e-6), 'standard normal CDF at 0 is 0.5');
check(closeTo(standardNormalCdf(1.96), 0.975, 1e-3), 'standard normal CDF at 1.96 is ~0.975');
check(closeTo(standardNormalCdf(-1.96), 0.025, 1e-3), 'standard normal CDF at -1.96 is ~0.025');
check(closeTo(ibeta(0.5, 2, 2), 0.5, 1e-9), 'ibeta is 0.5 at the symmetric midpoint');
check(ibeta(0, 2, 3) === 0, 'ibeta at x=0 is 0');
check(ibeta(1, 2, 3) === 1, 'ibeta at x=1 is 1');
check(getTCritical95(1) > getTCritical95(30), 't critical value decreases as degrees of freedom grow');
check(closeTo(getTCritical95(1000), 1.96, 0.05), 't critical value converges to 1.96 for large df');
check(closeTo(studentTPValue(0, 10), 1.0, 1e-6), 'student t two-sided p-value at t=0 is 1');
check(studentTPValue(3, 10) < studentTPValue(1, 10), 'larger t statistic yields smaller p-value');

// =========================================================================
section('2. OLS linear regression with Student t-test');
// =========================================================================

const xs = [1, 2, 3, 4, 5, 6];
const perfect = xs.map(v => 2 * v);
const olsPerfect = linearRegression(xs, perfect);
check(closeTo(olsPerfect.slope, 2, 1e-9), 'recovers exact slope of a noise-free line');
check(closeTo(olsPerfect.intercept, 0, 1e-9), 'recovers exact intercept of a noise-free line');
check(closeTo(olsPerfect.r2, 1, 1e-9), 'R-squared is 1 for a noise-free line');
check(closeTo(olsPerfect.ratePerDecade, 20, 1e-9), 'ratePerDecade is slope scaled by 10');
check(olsPerfect.isSignificant, 'noise-free trend is flagged significant');

const olsFlat = linearRegression(xs, xs.map(() => 7));
check(closeTo(olsFlat.slope, 0, 1e-9), 'constant response produces zero slope');
check(olsFlat.pValue === 1.0, 'constant response is reported as non-significant');

const olsShort = linearRegression([1, 2], [1, 2]);
check(olsShort.slope === 0 && olsShort.pValue === 1.0, 'series shorter than 3 points degrades safely');
check(olsShort.ci95Lower === 0 && olsShort.ci95Upper === 0, 'degenerate regression reports a zero-width interval');

const olsNoX = linearRegression([3, 3, 3, 3], [1, 2, 3, 4]);
check(olsNoX.slope === 0, 'zero-variance predictor yields zero slope without dividing by zero');
check(closeTo(olsNoX.intercept, 2.5, 1e-9), 'zero-variance predictor still centres on the response mean');

const olsNoisy = linearRegression(xs, [1, 5, 2, 6, 3, 7]);
check(Number.isFinite(olsNoisy.pValue) && olsNoisy.pValue >= 0 && olsNoisy.pValue <= 1, 'p-value stays a valid probability');
check(olsNoisy.ci95Lower <= olsNoisy.slope && olsNoisy.slope <= olsNoisy.ci95Upper, 'slope falls inside its own 95% confidence interval');

// =========================================================================
section('3. Mann-Kendall non-parametric trend test');
// =========================================================================

const mkUp = mannKendall([1, 2, 3, 4, 5, 6, 7]);
check(mkUp.s === 21, 'strictly increasing series reaches the maximum S statistic');
check(mkUp.direction === 'increasing', 'increasing trend direction detected');
check(closeTo(mkUp.tau, 1, 1e-9), 'Kendall tau is 1 for a perfectly ordered series');

const mkDown = mannKendall([7, 6, 5, 4, 3, 2, 1]);
check(mkDown.s === -21, 'strictly decreasing series reaches the negative maximum S');
check(mkDown.direction === 'decreasing', 'decreasing trend direction detected');
check(mkUp.s === -mkDown.s, 'trend statistic is antisymmetric under reversal');

const mkTies = mannKendall([5, 5, 5, 5, 5]);
check(mkTies.s === 0, 'fully tied series produces no trend');
check(closeTo(mkTies.z, 0, 1e-9), 'tie variance correction prevents division by zero');
check(Number.isFinite(mkTies.pValue), 'all-tied series yields a finite p-value rather than NaN');
check(mkTies.direction === 'no_trend', 'all-tied series is classified as no trend');

const mkShort = mannKendall([1, 2, 3]);
check(mkShort.badgeKey === 'sigInsufficient', 'fewer than 4 observations reported as insufficient sample');
check(!mkShort.isSignificant, 'insufficient sample is never flagged significant');

const mkWeak = mannKendall([1, 3, 2, 4, 6, 5, 7, 9, 8, 10]);
check(mkWeak.pValue < 0.05 && mkWeak.isSignificant, 'persistent weak upward trend reaches 95% significance');
check(mkWeak.tau < 1 && mkWeak.tau > 0.5, 'partially ordered series produces intermediate tau');

// =========================================================================
section('4. Theil-Sen robust slope estimator');
// =========================================================================

const tsClean = theilSenSlope(xs, perfect);
check(closeTo(tsClean, 2, 1e-9), 'Theil-Sen recovers the slope of a noise-free line');

const withOutlier = [1, 2, 3, 4, 5, 1000];
const tsRobust = theilSenSlope(xs, withOutlier);
const olsPulled = linearRegression(xs, withOutlier);
check(closeTo(tsRobust, 1, 0.5), 'Theil-Sen recovers the unit slope despite an extreme outlier');
check(olsPulled.slope > tsRobust + 1, 'OLS is demonstrably inflated by the same outlier');
check(theilSenSlope([1], [1]) === 0, 'single observation produces slope 0 instead of NaN');
check(theilSenSlope([4, 4, 4, 4], [1, 2, 3, 4]) === 0, 'zero-variance predictor returns slope 0');

// =========================================================================
section('5. Deseasonalization and anomaly detection');
// =========================================================================

const ramp = Array.from({ length: 31 }, (_, i) => i);
const anomalies = deseasonalize(ramp);
check(anomalies.length === 31, 'anomaly series preserves input length');
check(closeTo(anomalies[5], 0, 1e-9), 'values are centred on the baseline mean');
check(closeTo(anomalies[0], -5, 1e-9), 'first baseline year sits 5 units below the 1995-2005 mean');
check(closeTo(anomalies[30], 25, 1e-9), 'final year anomaly equals distance above baseline');
const custom = deseasonalize(ramp, 2015, 2020, 1995);
check(closeTo(custom[0], -22.5, 1e-9), 'custom 2015-2020 baseline window recentres the whole series');
check(closeTo(deseasonalize([9, 9, 9])[1], 0, 1e-9), 'constant series anomalies out to zero');
check(deseasonalize([]).length === 0, 'empty series returns an empty anomaly list');

// =========================================================================
section('6. Min-max normalisation');
// =========================================================================

check(closeTo(minMaxNormalize(15, 10, 20), 50, 1e-9), 'midpoint normalises to 50');
check(closeTo(minMaxNormalize(10, 10, 20), 0, 1e-9), 'lower bound normalises to 0');
check(closeTo(minMaxNormalize(20, 10, 20), 100, 1e-9), 'upper bound normalises to 100');
check(closeTo(minMaxNormalize(999, 10, 20), 100, 1e-9), 'overshoot clamps to 100');
check(closeTo(minMaxNormalize(-999, 10, 20), 0, 1e-9), 'undershoot clamps to 0');
check(closeTo(minMaxNormalize(12, 10, 20, true), 80, 1e-9), 'inverted flag mirrors the scale');
check(minMaxNormalize(5, 5, 5) === 50.0, 'degenerate min equal to max falls back to 50');

// =========================================================================
section('7. Health Need Index composition');
// =========================================================================

const weightSum = HNI_WEIGHTS.epi + HNI_WEIGHTS.ppi + HNI_WEIGHTS.fsi + HNI_WEIGHTS.wni;
check(closeTo(weightSum, 1.0, 1e-9), 'HNI sub-index weights sum to exactly 1');
check(computeHNI(100, 100, 100, 100) === 100, 'HNI of maximum inputs is 100');
check(computeHNI(0, 0, 0, 0) === 0, 'HNI of zero inputs is 0');
check(closeTo(computeHNI(68.4, 92.1, 42.0, 58.0), 68.7, 1e-9), 'Cairo reference indices reproduce the published HNI');

const envHeavy = computeHNI(100, 0, 0, 0);
const facHeavy = computeHNI(0, 0, 100, 0);
check(envHeavy > facHeavy, 'environmental pressure outweighs facility shortage in HNI');

// =========================================================================
section('8. Workforce Need Index with Bayesian prior');
// =========================================================================

check(computeWNIFromReports('cairo', []) === 75.0, 'no reports returns the prior untouched');
check(computeWNIFromReports('cairo', [{ gov: 'giza', considering_migration: 'yes', severity: 5 }], 70) === 70, 'reports from other governorates do not contaminate the estimate');

const oneReport = computeWNIFromReports('cairo', [{ gov: 'cairo', considering_migration: 'yes', severity: 5 }], 75);
const tenReports = computeWNIFromReports('cairo', Array.from({ length: 10 }, () => ({ gov: 'cairo', considering_migration: 'yes', severity: 5 })), 75);
check(tenReports > oneReport, 'larger sample shifts the posterior toward the empirical signal');
check(tenReports < 100, 'posterior stays below the ceiling');
check(oneReport > 75 && oneReport < 100, 'small sample is pulled toward the prior');

check(computeWNIFromReports('cairo', [{ governorate: 'cairo', migration_intent: 'YES', severity: 4 }], 75) > 75, 'alternate key and uppercase intent are recognised');
check(computeWNIFromReports('cairo', [{ gov: 'cairo', considering_migration: 'نعم', severity: 4 }], 75) > 75, 'Arabic affirmative intent is recognised');
const arabicHesitant = computeWNIFromReports('cairo', Array.from({ length: 20 }, () => ({ gov: 'cairo', considering_migration: 'متردد', severity: 4 })), 20);
const arabicRefused = computeWNIFromReports('cairo', Array.from({ length: 20 }, () => ({ gov: 'cairo', considering_migration: 'لا', severity: 4 })), 20);
check(arabicHesitant > arabicRefused, 'Arabic hesitant intent counts as more risk than a refusal');
check(closeTo(arabicHesitant, computeWNIFromReports('cairo', Array.from({ length: 20 }, () => ({ gov: 'cairo', considering_migration: 'hesitant', severity: 4 })), 20), 1e-9), 'Arabic and English hesitant responses score identically');
check(computeWNIFromReports('cairo', [{ gov: 'cairo', considering_migration: 'no', severity: 1 }], 99) < 99, 'low-risk responses pull the index down');
check(computeWNIFromReports('cairo', Array.from({ length: 40 }, () => ({ gov: 'cairo', considering_migration: 'no', severity: 0 })), 75) === 10, 'risk-free sample is floored at 10 rather than reaching 0');
check(computeWNIFromReports('cairo', Array.from({ length: 40 }, () => ({ gov: 'cairo', considering_migration: 'yes', severity: 100 })), 75) === 100, 'extreme sample is capped at 100');
check(closeTo(computeWNIFromReports('cairo', [{ gov: 'cairo', considering_migration: 'hesitant', severity: 3 }], 50), computeWNIFromReports('cairo', [{ gov: 'cairo', considering_migration: 'undecided', severity: 3 }], 50), 1e-9), 'hesitant and undecided are weighted identically');

const sample20 = (severity) => computeWNIFromReports('cairo', Array.from({ length: 20 }, () => ({ gov: 'cairo', considering_migration: 'yes', severity })), 50);
check(sample20(0) < sample20(1) && sample20(1) < sample20(5), 'severity ranks monotonically, including an explicit zero');
check(sample20(0) === 60, 'severity 0 contributes no symptom pressure instead of defaulting to 3');
check(sample20(undefined) === 60 + 3 * 8, 'an omitted severity still falls back to the default of 3');

// =========================================================================
section('9. MCDA specialty matching');
// =========================================================================

const govs = TERRAPULSE_DATA.governorates;
const nephro = matchSpecialty('nephrology', govs);
check(nephro.length === Object.keys(govs).length, 'matcher scores every governorate');
check(nephro.every((r, i, a) => i === 0 || a[i - 1].matchScore >= r.matchScore), 'results are sorted by descending match score');
check(nephro.every(r => r.match_pct >= 50 && r.match_pct <= 99), 'match percentages stay within the 50-99 display band');
check(nephro.every(r => r.justification_en && r.justification_ar), 'every recommendation carries both language justifications');
check(nephro.every(r => Object.keys(r.keyDrivers).length === 4), 'driver breakdown exposes all four components');
check(matchSpecialty('unknown_specialty', govs).map(r => r.matchScore).join() === matchSpecialty('emergency', govs).map(r => r.matchScore).join(), 'unknown specialty falls back to the emergency weight profile');
check(Object.keys(SPECIALTY_WEIGHTS).every(k => {
  const w = SPECIALTY_WEIGHTS[k];
  return closeTo(w.heat + w.aod + w.fsi + w.pop, 1.0, 1e-9);
}), 'every specialty weight profile sums to 1');

// =========================================================================
section('10. Policy intervention simulator');
// =========================================================================

const cairo = govs.cairo.baseline_indices;
const baseHni = computeHNI(cairo.epi, cairo.ppi, cairo.fsi, cairo.wni_prior);
const untouched = simulatePolicyInterventions(baseHni, cairo.epi, cairo.fsi, cairo.wni_prior, cairo.ppi, 0, 0, 0);
check(untouched.deltaHni === 0, 'zero interventions leave the baseline HNI unchanged');
check(untouched.preventedAdmissions === 0, 'zero interventions prevent zero admissions');
check(untouched.retentionGainPct === 0, 'zero interventions retain no additional staff');

const withPolicy = simulatePolicyInterventions(baseHni, cairo.epi, cairo.fsi, cairo.wni_prior, cairo.ppi, 15, 40, 10);
check(withPolicy.deltaHni < 0, 'a funded policy reduces the need index');
check(withPolicy.simEpi < cairo.epi && withPolicy.simFsi < cairo.fsi && withPolicy.simWni < cairo.wni_prior, 'all three addressed sub-indices improve');
check(withPolicy.preventedAdmissions === 15 * ADMISSIONS_MODEL.perClinic + 40 * ADMISSIONS_MODEL.perStipendPct + 10 * ADMISSIONS_MODEL.perGreeningPct, 'admission dividend is reproducible from the published model constants');
check(closeTo(withPolicy.simHni, computeHNI(withPolicy.simEpi, cairo.ppi, withPolicy.simFsi, withPolicy.simWni), 0.15), 'simulated HNI is internally consistent with its own sub-indices');

const scaledUp = simulatePolicyInterventions(baseHni, cairo.epi, cairo.fsi, cairo.wni_prior, cairo.ppi, 30, 80, 20);
check(scaledUp.deltaHni < withPolicy.deltaHni, 'doubling the intervention deepens the improvement');

const saturated = simulatePolicyInterventions(baseHni, 12, 12, 12, cairo.ppi, 500, 500, 500);
check(saturated.simEpi === 10 && saturated.simFsi === 10 && saturated.simWni === 10, 'sub-indices floor at 10 under extreme policy');
check(saturated.retentionGainPct === RETENTION_CEILING, `retention gain is capped at ${RETENTION_CEILING} percent`);
check(closeTo(simulatePolicyInterventions(baseHni, cairo.epi, cairo.fsi, cairo.wni_prior, 92.1, 15, 40, 10).deltaHni, withPolicy.deltaHni, 1e-9), 'simulator is deterministic for identical inputs');
check(simulatePolicyInterventions(baseHni, cairo.epi, cairo.fsi, cairo.wni_prior, 48.0, 15, 40, 10).deltaHni !== withPolicy.deltaHni, 'simulator honours the governorate population pressure rather than a fixed value');
check(typeof RETENTION_MODEL.perStipendPct === 'number', 'retention model coefficients are exported for auditing');

// =========================================================================
section('11. Engine reproduces the shipped NASA dataset');
// =========================================================================

let statParity = 0;
let statTotal = 0;
const statProblems = [];
for (const [govId, gov] of Object.entries(govs)) {
  const years = gov.series.years;
  for (const [variable, stored] of Object.entries(gov.statistics)) {
    const series = gov.series[variable];
    if (!series) continue;
    statTotal++;
    const ols = linearRegression(years, series);
    const mk = mannKendall(series);
    if (!closeTo(ols.slope, stored.ols.slope, 1e-6) || !closeTo(mk.z, stored.mann_kendall.z, 1e-6)) {
      statProblems.push(`${govId}.${variable}`);
    } else {
      statParity++;
    }
  }
}
check(statTotal === 55, `dataset exposes the expected statistics surface (found ${statTotal})`);
check(statParity === statTotal, `live engine reproduces all ${statParity} published OLS/Mann-Kendall values${statProblems.length ? ` (drift: ${statProblems.join(', ')})` : ''}`);

const hniMatches = Object.entries(govs).filter(([, gov]) => {
  const b = gov.baseline_indices;
  return computeHNI(b.epi, b.ppi, b.fsi, b.wni_prior) === b.hni;
}).length;
check(hniMatches === Object.keys(govs).length, `every governorate HNI is reproducible from its published sub-indices (${hniMatches}/${Object.keys(govs).length})`);

const needLadder = ['alexandria', 'cairo', 'giza', 'assiut', 'aswan']
  .map(name => govs[name].baseline_indices.hni);
check(needLadder.every((v, i) => i === 0 || v >= needLadder[i - 1]), 'need rises from coastal Cairo through Upper Egypt to Aswan');
check(govs.aswan.baseline_indices.hni > govs.alexandria.baseline_indices.hni, 'Upper Egypt need exceeds Delta/Coastal need');

// =========================================================================
// SECTION: NON-FINITE INPUT GUARDS
// `baseline_indices.wni` is written by an effect after first paint, so the engine
// legitimately receives undefined on the first render. Nothing below may return NaN
// or Infinity, because those values reach the DOM as the text "NaN".
// =========================================================================
section('Non-finite input guards');

const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);

check(Number.isFinite(computeHNI(68.4, 92.1, 42.0, undefined)), 'computeHNI survives an undefined wni');
check(Number.isFinite(computeHNI(68.4, 92.1, 42.0, NaN)), 'computeHNI survives a NaN wni');
check(Number.isFinite(computeHNI(Infinity, 92.1, 42.0, 77)), 'computeHNI survives an Infinity epi');
check(Number.isFinite(computeHNI('68.4', 92.1, 42.0, 77)), 'computeHNI survives a numeric-string epi');
check(
  computeHNI(68.4, 92.1, 42.0, undefined) === computeHNI(68.4, 92.1, 42.0, NEUTRAL_INDICES.wni),
  'a missing wni falls back to the documented neutral index, not to zero'
);
check(
  computeHNI(68.4, 92.1, 42.0, 77) === 71.5,
  `valid inputs are unchanged (Cairo vector -> ${computeHNI(68.4, 92.1, 42.0, 77)})`
);

const junkSeverity = [{
  governorate: 'aswan', considering_migration: 'yes', severity: 'moderate'
}, {
  governorate: 'aswan', considering_migration: 'yes', severity: 4
}];
check(Number.isFinite(computeWNIFromReports('aswan', junkSeverity, 75)), 'WNI survives a non-numeric severity row');
check(
  computeWNIFromReports('aswan', junkSeverity, 75) === computeWNIFromReports('aswan', [
    { governorate: 'aswan', considering_migration: 'yes', severity: 3 },
    { governorate: 'aswan', considering_migration: 'yes', severity: 4 }
  ], 75),
  'an unreadable severity is scored as the neutral 3, matching a missing value'
);
const zeroVsThree = [
  computeWNIFromReports('aswan', [{ governorate: 'aswan', considering_migration: 'no', severity: 0 }], 75),
  computeWNIFromReports('aswan', [{ governorate: 'aswan', considering_migration: 'no' }], 75)
];
check(zeroVsThree[0] < zeroVsThree[1], `severity 0 scores below a missing severity (${zeroVsThree[0]} < ${zeroVsThree[1]})`);
check(
  computeWNIFromReports('cairo', [], NaN) === WNI_PRIOR_DEFAULT,
  'a non-finite prior degrades to the documented default instead of NaN'
);

// =========================================================================
// SECTION: WHAT-IF SIMULATOR CONTRACT
// Coefficients and units are pinned to the values documented in ARCHITECTURE.md;
// these tests exist so a future edit to the model has to be deliberate.
// =========================================================================
section('What-If simulator contract');

const simFor = (govId, levers = {}) => {
  const b = govs[govId].baseline_indices;
  const wni = 77;
  return simulatePolicyInterventions(
    computeHNI(b.epi, b.ppi, b.fsi, wni), b.epi, b.fsi, wni, b.ppi,
    levers.clinics ?? 0, levers.stipend ?? 0, levers.greening ?? 0
  );
};

const zeroDeltas = Object.keys(govs).map(simFor);
check(
  zeroDeltas.every(s => s.deltaHni === 0 && s.pctReduction === 0),
  `zero intervention leaves every governorate's HNI untouched (${zeroDeltas.map(s => s.deltaHni).join(',')})`
);
check(
  Object.keys(govs).every(id => simFor(id).simHni === computeHNI(govs[id].baseline_indices.epi, govs[id].baseline_indices.ppi, govs[id].baseline_indices.fsi, 77)),
  'zero intervention reproduces the baseline HNI exactly for every governorate'
);

const r1 = (v) => Math.round(v * 10) / 10;
check(simFor('cairo', { clinics: 50 }).simFsi === r1(Math.max(10, govs.cairo.baseline_indices.fsi - 22)), '50 clinics cut FSI by the documented 22 points');
check(simFor('cairo', { stipend: 100 }).simWni === r1(Math.max(10, 77 - 28)), 'a 100% incentive cut WNI by the documented 28 points');
check(simFor('cairo', { greening: 30 }).simEpi === r1(Math.max(10, govs.cairo.baseline_indices.epi - 12)), '30% greening cuts EPI by the documented 12 points');
check(
  simFor('cairo', { clinics: 25 }).simFsi === r1(Math.max(10, govs.cairo.baseline_indices.fsi - 11)),
  'a half-travelled clinic lever halves the FSI reduction (linear response)'
);
check(
  simFor('cairo', { clinics: 50 }).simEpi === govs.cairo.baseline_indices.epi,
  'the clinic lever does not touch EPI'
);
check(
  simFor('cairo', { greening: 30 }).simWni === 77,
  'the greening lever does not touch WNI'
);

const floorCase = simulatePolicyInterventions(20, 12, 14, 11, 50, 50, 100, 30);
check(
  floorCase.simEpi === 10 && floorCase.simFsi === 10 && floorCase.simWni === 10,
  `reductions clamp at the 10-point floor (${floorCase.simEpi}/${floorCase.simFsi}/${floorCase.simWni})`
);

const ppiOnly = (ppi) => simulatePolicyInterventions(50, 60, 60, 60, ppi, 0, 0, 0);
check(
  closeTo(ppiOnly(92.1).simHni - ppiOnly(48).simHni, (92.1 - 48) * HNI_WEIGHTS.ppi, 0.1),
  `PPI enters at its own weight, not a constant (${(ppiOnly(92.1).simHni - ppiOnly(48).simHni).toFixed(1)} vs ${(0.3 * 44.1).toFixed(1)})`
);
check(
  ppiOnly(92.1).simHni !== ppiOnly(48).simHni,
  'two governorates with identical EPI/FSI/WNI still simulate differently on PPI'
);
check(
  simulatePolicyInterventions(computeHNI(68.4, 92.1, 42, 77), 68.4, 42, 77, 92.1, 0, 0, 0).deltaHni === 0,
  'Cairo at zero policy shows no phantom reduction (the hardcoded-PPI regression)'
);

const maxed = simFor('aswan', { clinics: 50, stipend: 100, greening: 30 });
check(
  Object.values(maxed).every(v => isFiniteNum(v)),
  `every simulator output is finite at maximum levers (${JSON.stringify(maxed)})`
);
check(
  maxed.preventedAdmissions === 50 * ADMISSIONS_MODEL.perClinic + 100 * ADMISSIONS_MODEL.perStipendPct + 30 * ADMISSIONS_MODEL.perGreeningPct,
  `prevented admissions follow ADMISSIONS_MODEL exactly (${maxed.preventedAdmissions})`
);
check(
  maxed.retentionGainPct === 100 * RETENTION_MODEL.perStipendPct + 50 * RETENTION_MODEL.perClinic,
  `retention at max UI levers follows RETENTION_MODEL (${maxed.retentionGainPct})`
);
check(
  maxed.retentionGainPct < RETENTION_CEILING,
  `the slider range alone never reaches the ${RETENTION_CEILING}% ceiling (${maxed.retentionGainPct})`
);
check(
  simFor('aswan', { clinics: 500, stipend: 500 }).retentionGainPct === RETENTION_CEILING,
  `the ${RETENTION_CEILING}% ceiling only binds on an out-of-range lever`
);
check(
  simFor('aswan', { clinics: 50 }).preventedAdmissions === 50 * ADMISSIONS_MODEL.perClinic,
  'a single lever contributes only its own admissions term'
);

const hostileLevers = [
  ['undefined clinics', { clinics: undefined }],
  ['NaN stipend', { stipend: NaN }],
  ['negative clinics', { clinics: -20 }],
  ['over-range greening', { greening: 999 }],
  ['string lever', { clinics: '15' }]
];
for (const [label, levers] of hostileLevers) {
  const out = simFor('aswan', levers);
  check(
    Object.values(out).every(isFiniteNum),
    `simulator stays finite with ${label} (${out.simHni})`
  );
}
check(
  simFor('aswan', { clinics: -20 }).preventedAdmissions === 0 && simFor('aswan', { clinics: -20 }).retentionGainPct === 0,
  'a negative lever cannot produce a negative benefit figure',
);
check(
  simFor('aswan', { clinics: -20 }).simFsi > simFor('aswan', { clinics: 0 }).simFsi,
  'out-of-range levers extrapolate the linear model rather than being silently clamped (the sliders own the range)',
);
check(
  simFor('aswan', { greening: 999 }).simEpi === 10,
  `an extreme greening lever is stopped by the 10-point EPI floor (${simFor('aswan', { greening: 999 }).simEpi})`,
);
check(
  simFor('aswan', { clinics: '15' }).simHni === simFor('aswan', { clinics: 15 }).simHni,
  'a numeric-string lever behaves like its numeric value'
);

const nonFiniteBaseline = simulatePolicyInterventions(undefined, undefined, undefined, undefined, undefined, 15, 40, 10);
check(
  Object.values(nonFiniteBaseline).every(isFiniteNum),
  `an all-undefined baseline still yields finite output (${nonFiniteBaseline.simHni})`
);

// =========================================================================

console.log('\n' + '='.repeat(80));
console.log(` RESULTS: ${passed} / ${total} Tests Passed (${((passed / total) * 100).toFixed(1)}%)`);
if (failures.length) {
  console.log('\n FAILURES:');
  failures.forEach(f => console.log(`   - ${f}`));
}
console.log('='.repeat(80));
process.exit(failures.length ? 1 : 0);
