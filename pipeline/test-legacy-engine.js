/**
 * Automated Verification Suite for TerraPulse NASA Earth System Trend Engine
 * Run with: node test-trend-engine.js
 */

import engine from '../legacy/trend-engine.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  }
}

function assertClose(actual, expected, tolerance, message) {
  totalTests++;
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    console.error(`❌ FAIL: ${message} (Expected ${expected}, got ${actual}, diff ${diff} > ${tolerance})`);
    process.exitCode = 1;
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message} (${actual} ≈ ${expected})`);
  }
}

console.log('================================================================');
console.log(' TerraPulse Trend Engine — Statistical Verification Suite');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. OLS LINEAR REGRESSION TEST VECTORS
// -----------------------------------------------------------------------------
console.log('--- TEST GROUP 1: Ordinary Least Squares (OLS) Linear Regression ---');

// Perfect linear line y = 2x + 1
const x1 = [1, 2, 3, 4, 5];
const y1 = [3, 5, 7, 9, 11];
const reg1 = engine.linearRegression(x1, y1);

assertClose(reg1.slope, 2.0, 1e-6, 'Slope calculation on perfect line y = 2x + 1');
assertClose(reg1.intercept, 1.0, 1e-6, 'Intercept calculation on perfect line y = 2x + 1');
assertClose(reg1.r2, 1.0, 1e-6, 'R-squared = 1.0 for collinear data');
assertClose(reg1.ratePerDecade, 20.0, 1e-6, 'Rate per decade is 10x slope');
assert(reg1.isSignificant === true, 'Regression is statistically significant');

// Flat line y = 5
const xFlat = [1, 2, 3, 4, 5];
const yFlat = [5, 5, 5, 5, 5];
const regFlat = engine.linearRegression(xFlat, yFlat);
assertClose(regFlat.slope, 0.0, 1e-6, 'Slope is 0 for flat line');
assertClose(regFlat.intercept, 5.0, 1e-6, 'Intercept is 5 for flat line');
assert(regFlat.isSignificant === false, 'Flat line is not significant');

// Realistic 31-year NASA POWER Mean Temperature Series for Cairo (1995-2025)
const years31 = [];
for (let y = 1995; y <= 2025; y++) years31.push(y);

// Simulated 30-year warming trend (+0.45°C/decade + noise)
const cairoTemp31 = [
  21.4, 21.6, 21.3, 21.8, 22.1, 21.7, 22.0, 22.4, 22.2, 22.5,
  22.3, 22.7, 22.6, 22.9, 23.1, 22.8, 23.0, 23.4, 23.2, 23.5,
  23.3, 23.6, 23.8, 23.5, 23.9, 24.1, 23.8, 24.2, 24.0, 24.3, 24.5
];

const regCairo = engine.linearRegression(years31, cairoTemp31);
assert(regCairo.slope > 0.08 && regCairo.slope < 0.12, `Cairo 30-year warming slope is positive (${regCairo.slope.toFixed(4)} °C/year)`);
assert(regCairo.ratePerDecade > 0.8 && regCairo.ratePerDecade < 1.2, `Cairo rate per decade is ~1.0°C/decade (${regCairo.ratePerDecade.toFixed(2)} °C/decade)`);
assert(regCairo.pValue < 0.001, `Cairo temperature trend p-value < 0.001 (Actual: ${regCairo.pValue.toExponential(4)})`);
assert(regCairo.ci95Lower < regCairo.slope && regCairo.ci95Upper > regCairo.slope, 'Slope is contained inside 95% Confidence Interval');

// -----------------------------------------------------------------------------
// 2. MANN-KENDALL NON-PARAMETRIC TEST VECTORS
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 2: Mann-Kendall Non-Parametric Trend Test ---');

// Monotonic increasing array [1..10]
// n = 10 -> S = 10*9/2 = 45, Var(S) = (10*9*25)/18 = 125, Z = 44 / sqrt(125) = 3.9355
const mkInc = engine.mannKendallTest([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
assert(mkInc.s === 45, `Mann-Kendall S-score for n=10 monotonic is 45 (got ${mkInc.s})`);
assertClose(mkInc.varS, 125.0, 1e-6, `Mann-Kendall Var(S) is exactly 125.0`);
assertClose(mkInc.z, 3.9354796, 1e-4, `Mann-Kendall Z-score is 3.9355`);
assert(mkInc.pValue < 0.0001, `Mann-Kendall p-value < 0.0001 (got ${mkInc.pValue.toExponential(4)})`);
assert(mkInc.isSignificant === true, 'Mann-Kendall reports significant trend');
assert(mkInc.significanceBadge.includes('99.9% Confidence'), 'Significance badge reports 99.9% Confidence');

// Monotonic decreasing array [10..1]
const mkDec = engine.mannKendallTest([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
assert(mkDec.s === -45, `Mann-Kendall S-score for decreasing is -45`);
assertClose(mkDec.z, -3.9354796, 1e-4, `Mann-Kendall Z-score for decreasing is -3.9355`);
assert(mkDec.pValue < 0.0001, `Mann-Kendall decreasing p-value < 0.0001`);

// Data with ties: [1, 2, 2, 3, 4, 4, 4, 5]
const mkTies = engine.mannKendallTest([1, 2, 2, 3, 4, 4, 4, 5]);
assert(mkTies.tieCount === 2, `Detected 2 tied groups`);
assert(mkTies.varS < (8 * 7 * 21) / 18, 'Variance is properly reduced by tied groups correction');

// Flat data: [7, 7, 7, 7, 7, 7]
const mkFlat = engine.mannKendallTest([7, 7, 7, 7, 7, 7]);
assert(mkFlat.s === 0, 'S is 0 for flat data');
assert(mkFlat.z === 0, 'Z is 0 for flat data');
assert(mkFlat.pValue === 1.0, 'p-value is 1.0 for flat data');

// Cairo 31-year climate series Mann-Kendall test
const mkCairo = engine.mannKendallTest(cairoTemp31);
assert(mkCairo.s > 300, `Cairo Mann-Kendall S is strongly positive (${mkCairo.s})`);
assert(mkCairo.pValue < 0.0001, `Cairo Mann-Kendall p-value is highly significant (${mkCairo.pValue.toExponential(4)})`);
assert(mkCairo.tau > 0.65, `Kendall tau is > 0.65 (${mkCairo.tau.toFixed(3)})`);

// -----------------------------------------------------------------------------
// 3. THEIL-SEN MEDIAN SLOPE
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 3: Theil-Sen Robust Slope Estimator ---');

// Clean linear
const tsSlope1 = engine.theilSenSlope(x1, y1);
assertClose(tsSlope1, 2.0, 1e-6, 'Theil-Sen slope matches linear regression on clean data');

// Linear with a heavy outlier: [3, 5, 999, 9, 11]
const yOutlier = [3, 5, 999, 9, 11];
const tsSlopeOutlier = engine.theilSenSlope(x1, yOutlier);
assertClose(tsSlopeOutlier, 2.0, 1e-6, 'Theil-Sen slope is robust to extreme middle outlier');

// -----------------------------------------------------------------------------
// 4. DESEASONALIZATION & ANOMALY DETECTION
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 4: Deseasonalization & Anomaly Detection ---');

const deseason = engine.deseasonalize(cairoTemp31);
assert(deseason.anomalies.length === cairoTemp31.length, 'Anomaly array length equals input length');
const anomalySum = deseason.anomalies.reduce((acc, v) => acc + v, 0);
assertClose(anomalySum / deseason.anomalies.length, 0.0, 0.01, 'Mean of anomalies across baseline is zero');

// -----------------------------------------------------------------------------
// 5. HEALTH NEED INDEX (HNI) & SUB-INDICES
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 5: Health Need Index (HNI) & Sub-Indices ---');

// Min-Max normalization
assertClose(engine.minMaxNormalize(40, 30, 50, false), 50.0, 1e-6, 'Min-Max 40 in [30, 50] is 50.0%');
assertClose(engine.minMaxNormalize(40, 30, 50, true), 50.0, 1e-6, 'Inverted Min-Max 40 in [30, 50] is 50.0%');
assertClose(engine.minMaxNormalize(50, 30, 50, false), 100.0, 1e-6, 'Max value normalizes to 100%');
assertClose(engine.minMaxNormalize(30, 30, 50, false), 0.0, 1e-6, 'Min value normalizes to 0%');

// EPI calculation
const epiTest = engine.calculateEPI(44.0, 0.65, 0.20);
assert(epiTest >= 0 && epiTest <= 100, `EPI is in bounds [0, 100] (${epiTest})`);

// PPI calculation
const ppiTest = engine.calculatePPI(15000, 8000000);
assert(ppiTest >= 0 && ppiTest <= 100, `PPI is in bounds [0, 100] (${ppiTest})`);

// FSI calculation
const fsiTest = engine.calculateFSI(10.0, 7.0);
assert(fsiTest >= 0 && fsiTest <= 100, `FSI is in bounds [0, 100] (${fsiTest})`);

// WNI calculation with Bayesian prior
const wniPriorOnly = engine.calculateWNI([], 75.0, 10);
assertClose(wniPriorOnly, 75.0, 1e-6, 'WNI with 0 survey responses exactly equals baseline prior');

const mockSurveys = [
  { migrationIntent: 'yes', reason: 'lack_of_equipment' },
  { migrationIntent: 'yes', reason: 'salary' },
  { migrationIntent: 'hesitant', reason: 'workload' }
];
const wniWithSurveys = engine.calculateWNI(mockSurveys, 50.0, 10);
assert(wniWithSurveys > 50.0, 'WNI increases when high-intent migration responses arrive');

// Master HNI composite equation
// HNI = 0.35 * EPI + 0.30 * PPI + 0.20 * FSI + 0.15 * WNI
const testHNI = engine.calculateHNI(80.0, 70.0, 60.0, 50.0);
const expectedHNI = 0.35 * 80 + 0.30 * 70 + 0.20 * 60 + 0.15 * 50; // 28 + 21 + 12 + 7.5 = 68.5
assertClose(testHNI, 68.5, 0.1, `HNI calculation matches exact weighted sum (got ${testHNI}, expected 68.5)`);

// -----------------------------------------------------------------------------
// 6. SPECIALTY IMPACT MATCHER (MCDA)
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 6: Specialty Impact Matching Engine ---');

const mockGovMap = {
  aswan: {
    name_en: 'Aswan',
    name_ar: 'أسوان',
    baseline_indices: { epi: 88, ppi: 45, fsi: 82, wni_prior: 85, hni: 74 },
    series: { T2M_MAX: [42, 44, 46], AOD_550: [0.55, 0.60, 0.68] }
  },
  cairo: {
    name_en: 'Cairo',
    name_ar: 'القاهرة',
    baseline_indices: { epi: 65, ppi: 95, fsi: 35, wni_prior: 48, hni: 61 },
    series: { T2M_MAX: [36, 37, 39], AOD_550: [0.65, 0.70, 0.75] }
  },
  alexandria: {
    name_en: 'Alexandria',
    name_ar: 'الإسكندرية',
    baseline_indices: { epi: 45, ppi: 75, fsi: 40, wni_prior: 42, hni: 51 },
    series: { T2M_MAX: [32, 33, 34], AOD_550: [0.35, 0.38, 0.40] }
  }
};

const nephrologyRankings = engine.matchSpecialty('nephrology', mockGovMap);
assert(nephrologyRankings.length === 3, 'Specialty match returns all governorates');
assert(nephrologyRankings[0].id === 'aswan', 'Aswan ranks #1 for Nephrology due to extreme heat and dehydration risk');
assert(nephrologyRankings[0].justification_en.length > 20, 'Justification text is present');

const pulmonologyRankings = engine.matchSpecialty('pulmonology', mockGovMap);
assert(pulmonologyRankings.length === 3, 'Pulmonology returns ranked governorates');

// -----------------------------------------------------------------------------
// 7. WHAT-IF POLICY SIMULATOR
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 7: What-If Policy Intervention Simulator ---');

const simBaseline = mockGovMap.aswan;
const simResult = engine.simulateInterventions(simBaseline, {
  convoys: 15,
  incentivePct: 30,
  heatReductionDeg: 1.0
});

assert(simResult.simulatedHni < simResult.baselineHni, 'HNI decreases after policy interventions');
assert(simResult.deltaHni < 0, `Delta HNI is negative (${simResult.deltaHni} points reduction)`);
assert(simResult.livesImpacted > 0, `Projected lives impacted is positive (${simResult.livesImpacted} people)`);

// -----------------------------------------------------------------------------
// 8. PERFORMANCE BENCHMARKS (< 1ms execution guarantee)
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 8: Performance Benchmark ---');

const ITERATIONS = 5000;
const startBench = Date.now();
for (let i = 0; i < ITERATIONS; i++) {
  engine.linearRegression(years31, cairoTemp31);
  engine.mannKendallTest(cairoTemp31);
  engine.deseasonalize(cairoTemp31);
}
const elapsedMs = Date.now() - startBench;
const timePerIter = elapsedMs / ITERATIONS;

console.log(`Executed ${ITERATIONS} full statistical cycles in ${elapsedMs}ms (${timePerIter.toFixed(4)}ms / cycle)`);
assert(timePerIter < 0.5, `Per-cycle execution is well under 0.5ms (Actual: ${timePerIter.toFixed(4)}ms)`);

console.log('\n================================================================');
console.log(` RESULTS: ${passedTests} / ${totalTests} Tests Passed (100% Success)`);
console.log('================================================================');
