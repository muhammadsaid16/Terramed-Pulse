/**
 * TerraPulse: Stay & Build Egypt — NASA Earth System Trend Engine
 * ES6 Modular Edition for Vite + React
 * 
 * High-precision, zero-dependency statistical and geospatial decision engine.
 * Implements:
 *   1. Ordinary Least Squares (OLS) Linear Regression with Student's t-test and 95% Confidence Intervals
 *   2. Mann-Kendall Non-Parametric Trend Test with tied-group variance corrections and continuity-corrected Z
 *   3. Theil-Sen Robust Slope Estimator
 *   4. Climatological Baseline Deseasonalization & Anomaly Detection
 *   5. Health Need Index (HNI) and Sub-Indices (EPI, PPI, FSI, WNI with Bayesian Prior)
 *   6. Multi-Criteria Decision Analysis (MCDA) Specialty Impact Matcher
 *   7. Policy Intervention "What-If" Simulator
 */

// =========================================================================
// SECTION 1: SPECIAL MATHEMATICAL FUNCTIONS
// =========================================================================

export function lnGamma(x) {
  if (x <= 0) return 0;
  const c = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.001208650973866179,
    -0.000005395239384953
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += c[j] / y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

export function betacf(a, b, x) {
  const MAXIT = 200;
  const EPS = 3.0e-12;
  const FPMIN = 1.0e-30;
  const qab = a + b;
  const qap = a + 1.0;
  const qam = a - 1.0;
  let c = 1.0;
  let d = 1.0 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1.0 / d;
  let h = d;

  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    h *= d * c;

    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1.0) < EPS) break;
  }
  return h;
}

export function ibeta(x, a, b) {
  if (x <= 0.0) return 0.0;
  if (x >= 1.0) return 1.0;

  const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1.0 - x));
  if (x < (a + 1.0) / (a + b + 2.0)) {
    return (bt * betacf(a, b, x)) / a;
  } else {
    return 1.0 - (bt * betacf(b, a, 1.0 - x)) / b;
  }
}

export function erf(x) {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-absX * absX);
  return sign * y;
}

export function standardNormalCdf(z) {
  return 0.5 * (1.0 + erf(z / Math.SQRT2));
}

export function getTCritical95(df) {
  const table = {
    1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
    6: 2.447,  7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
    11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
    16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086,
    21: 2.080, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.060,
    26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042,
    35: 2.030, 40: 2.021, 50: 2.009, 60: 2.000, 100: 1.984, 120: 1.980
  };
  if (table[df]) return table[df];
  if (df > 120) return 1.960;
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < keys.length - 1; i++) {
    if (df >= keys[i] && df <= keys[i + 1]) {
      const frac = (df - keys[i]) / (keys[i + 1] - keys[i]);
      return table[keys[i]] + frac * (table[keys[i + 1]] - table[keys[i]]);
    }
  }
  return 1.960;
}

export function studentTPValue(t, df) {
  if (df <= 0) return 1.0;
  const absT = Math.abs(t);
  const x = df / (df + absT * absT);
  const p = ibeta(x, 0.5 * df, 0.5);
  return Math.max(0.0, Math.min(1.0, p));
}

// =========================================================================
// SECTION 2: ORDINARY LEAST SQUARES LINEAR REGRESSION
// =========================================================================

export function linearRegression(x, y) {
  const n = x.length;
  if (n !== y.length || n < 3) {
    return {
      slope: 0, intercept: 0, r2: 0, ratePerDecade: 0,
      tStat: 0, pValue: 1.0, seSlope: 0,
      ci95Lower: 0, ci95Upper: 0, isSignificant: false
    };
  }

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
    sumYY += y[i] * y[i];
  }

  const meanX = sumX / n;
  const meanY = sumY / n;
  const ssXX = sumXX - (sumX * sumX) / n;
  const ssYY = sumYY - (sumY * sumY) / n;
  const ssXY = sumXY - (sumX * sumY) / n;

  if (Math.abs(ssXX) < 1e-12) {
    return {
      slope: 0, intercept: meanY, r2: 0, ratePerDecade: 0,
      tStat: 0, pValue: 1.0, seSlope: 0,
      ci95Lower: 0, ci95Upper: 0, isSignificant: false
    };
  }

  const slope = ssXY / ssXX;
  const intercept = meanY - slope * meanX;
  const r2 = Math.abs(ssYY) < 1e-12 ? 0 : Math.max(0, Math.min(1, (ssXY * ssXY) / (ssXX * ssYY)));
  const ratePerDecade = slope * 10;

  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const yHat = slope * x[i] + intercept;
    const res = y[i] - yHat;
    ssRes += res * res;
  }

  const df = n - 2;
  const s2 = ssRes / df;
  const seSlope = Math.sqrt(Math.max(0, s2 / ssXX));
  const tStat = seSlope < 1e-12 ? (Math.abs(slope) > 1e-12 ? 999 : 0) : slope / seSlope;
  const pValue = seSlope < 1e-12 ? (Math.abs(slope) > 1e-12 ? 0 : 1.0) : studentTPValue(tStat, df);
  const tCrit = getTCritical95(df);
  const margin = tCrit * seSlope;

  return {
    slope,
    intercept,
    r2,
    ratePerDecade,
    tStat,
    pValue,
    seSlope,
    ci95Lower: slope - margin,
    ci95Upper: slope + margin,
    isSignificant: pValue < 0.05
  };
}

// =========================================================================
// SECTION 3: MANN-KENDALL NON-PARAMETRIC TREND TEST
// =========================================================================

export function mannKendall(x) {
  const n = x.length;
  if (n < 4) {
    return {
      s: 0, varS: 1, z: 0, pValue: 1.0, tau: 0,
      direction: 'no_trend', isSignificant: false, badgeKey: 'sigInsufficient'
    };
  }

  let s = 0;
  for (let k = 0; k < n - 1; k++) {
    for (let j = k + 1; j < n; j++) {
      const diff = x[j] - x[k];
      if (diff > 1e-9) s += 1;
      else if (diff < -1e-9) s -= 1;
    }
  }

  // Count tied groups
  const sorted = x.slice().sort((a, b) => a - b);
  const tieCounts = [];
  let currentRun = 1;
  for (let i = 1; i < n; i++) {
    if (Math.abs(sorted[i] - sorted[i - 1]) < 1e-9) {
      currentRun++;
    } else {
      if (currentRun > 1) tieCounts.push(currentRun);
      currentRun = 1;
    }
  }
  if (currentRun > 1) tieCounts.push(currentRun);

  let tieCorrection = 0;
  for (let i = 0; i < tieCounts.length; i++) {
    const t = tieCounts[i];
    tieCorrection += t * (t - 1) * (2 * t + 5);
  }

  const baseVar = (n * (n - 1) * (2 * n + 5) - tieCorrection) / 18.0;
  const varS = Math.max(1e-6, baseVar);
  const stdS = Math.sqrt(varS);

  let z = 0;
  if (s > 0) z = (s - 1) / stdS;
  else if (s < 0) z = (s + 1) / stdS;

  const pValue = 2.0 * (1.0 - standardNormalCdf(Math.abs(z)));
  const maxPairs = (n * (n - 1)) / 2;
  const tau = s / maxPairs;

  let direction = 'no_trend';
  if (s > 0) direction = 'increasing';
  else if (s < 0) direction = 'decreasing';

  const isSignificant = pValue < 0.05;
  let badgeKey = 'sigNone';
  if (pValue < 0.001) badgeKey = 'sigP999';
  else if (pValue < 0.01) badgeKey = 'sigP99';
  else if (pValue < 0.05) badgeKey = 'sigP95';

  return {
    s,
    varS,
    z,
    pValue,
    tau,
    direction,
    isSignificant,
    badgeKey
  };
}

// =========================================================================
// SECTION 4: THEIL-SEN ROBUST SLOPE ESTIMATOR
// =========================================================================

export function theilSenSlope(x, y) {
  const n = x.length;
  const slopes = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = x[j] - x[i];
      if (Math.abs(dx) > 1e-9) {
        slopes.push((y[j] - y[i]) / dx);
      }
    }
  }
  slopes.sort((a, b) => a - b);
  const m = slopes.length;
  if (m === 0) return 0;
  if (m % 2 === 1) return slopes[Math.floor(m / 2)];
  return (slopes[m / 2 - 1] + slopes[m / 2]) / 2.0;
}

// =========================================================================
// SECTION 5: DESEASONALIZATION & ANOMALY DETECTION
// =========================================================================

export function deseasonalize(series, baselineStartYear = 1995, baselineEndYear = 2005, startYear = 1995) {
  const baseStartIdx = Math.max(0, baselineStartYear - startYear);
  const baseEndIdx = Math.min(series.length - 1, baselineEndYear - startYear);
  let baseSum = 0;
  let baseCount = 0;
  for (let i = baseStartIdx; i <= baseEndIdx; i++) {
    baseSum += series[i];
    baseCount++;
  }
  const baseMean = baseCount > 0 ? baseSum / baseCount : 0;
  return series.map(val => Math.round((val - baseMean) * 1000) / 1000);
}

// =========================================================================
// SECTION 6: HEALTH NEED INDEX (HNI) & NORMALIZATION
// =========================================================================

export function minMaxNormalize(value, min, max, invert = false) {
  if (max === min) return 50.0;
  const clamped = Math.max(min, Math.min(max, value));
  let normalized = ((clamped - min) / (max - min)) * 100.0;
  if (invert) normalized = 100.0 - normalized;
  return Math.round(normalized * 10) / 10;
}

export const HNI_WEIGHTS = { epi: 0.35, ppi: 0.30, fsi: 0.20, wni: 0.15 };

// `baseline_indices.wni` is written at runtime, so on the very first render it is
// undefined. Without an explicit neutral value every downstream product becomes
// NaN and the UI renders "NaN" for one frame. These mirror the fallback already
// used by the components, so a neutral reading is identical to today's behaviour.
export const NEUTRAL_INDICES = { hni: 75, epi: 70, ppi: 50, fsi: 65, wni: 75 };
export const WNI_PRIOR_DEFAULT = NEUTRAL_INDICES.wni;

function finiteIndex(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function computeHNI(epi, ppi, fsi, wni) {
  const score =
    (HNI_WEIGHTS.epi * finiteIndex(epi, NEUTRAL_INDICES.epi)) +
    (HNI_WEIGHTS.ppi * finiteIndex(ppi, NEUTRAL_INDICES.ppi)) +
    (HNI_WEIGHTS.fsi * finiteIndex(fsi, NEUTRAL_INDICES.fsi)) +
    (HNI_WEIGHTS.wni * finiteIndex(wni, NEUTRAL_INDICES.wni));
  return Math.round(score * 10) / 10;
}

export function computeWNIFromReports(govId, reports, baselinePrior = WNI_PRIOR_DEFAULT) {
  const prior = finiteIndex(baselinePrior, WNI_PRIOR_DEFAULT);
  if (!reports || reports.length === 0) return prior;
  const govReports = reports.filter(r => (r.gov || r.governorate) === govId);
  if (govReports.length === 0) return prior;

  let migrationRiskSum = 0;
  let severitySum = 0;

  for (let i = 0; i < govReports.length; i++) {
    const r = govReports[i];
    const intent = (r.considering_migration || r.migration_intent || '').toLowerCase();
    if (intent === 'yes' || intent === 'نعم') migrationRiskSum += 1.0;
    else if (intent === 'hesitant' || intent === 'undecided' || intent === 'متردد') migrationRiskSum += 0.5;
    // `??` not `||` — an explicit severity of 0 is a real answer ("asymptomatic"),
    // not a missing one, and must not silently re-score as 3.
    // A stored report can also carry a non-numeric severity (remote row written by
    // another client, or a hand-edited localStorage blob); one NaN would otherwise
    // poison this governorate's WNI and therefore its HNI.
    const severity = Number(r.severity ?? 3);
    severitySum += Number.isFinite(severity) ? severity : 3;
  }

  const migrationRiskRatio = migrationRiskSum / govReports.length;
  const avgSeverity = severitySum / govReports.length;
  const empiricalWni = (migrationRiskRatio * 60.0) + (avgSeverity * 8.0);
  const sampleWeight = Math.min(1.0, govReports.length / 15.0);
  const blendedWni = (sampleWeight * empiricalWni) + ((1.0 - sampleWeight) * prior);

  return Math.round(Math.max(10, Math.min(100, blendedWni)) * 10) / 10;
}

// =========================================================================
// SECTION 7: SPECIALTY IMPACT MATCHING ENGINE (8 SPECIALTIES)
// =========================================================================

export const SPECIALTY_WEIGHTS = {
  nephrology: {
    heat: 0.50, aod: 0.10, fsi: 0.25, pop: 0.15,
    justification_en: "Extreme ambient temperatures (>42°C) trigger subclinical dehydration, hyperuricemia, and accelerated chronic kidney disease progression. Severe dialysis bed shortage makes nephrologists lifesavers.",
    justification_ar: "درجات الحرارة القصوى تتجاوز 42 مئوية وتسبب جفافاً كلوياً ونقص تروية متكرر يؤدي لتسارع الفشل الكلوي. نقص أجهزة الغسيل الكلوي يجعل تخصص الكلى ضرورة منقذة للحياة."
  },
  pulmonology: {
    heat: 0.15, aod: 0.55, fsi: 0.15, pop: 0.15,
    justification_en: "High particulate matter (PM2.5) and seasonal Khamaseen dust storms cause intense bronchospasm and severe pediatric/geriatric asthma exacerbations.",
    justification_ar: "العوالق الترابية الدقيقة (PM2.5) وعواصف الخماسين ترفع نوبات الربو الشعبي وتفاقم الانسداد الرئوي المزمن، مما يستدعي تدخلاً مكثفاً لأطباء الصدرية."
  },
  cardiology: {
    heat: 0.40, aod: 0.25, fsi: 0.20, pop: 0.15,
    justification_en: "Prolonged thermal strain increases cardiac output demand and plasma viscosity, elevating acute myocardial infarction rates, especially among vulnerable elderly populations.",
    justification_ar: "الإجهاد الحراري المتواصل يضاعف العبء الدوارني ولزوجة الدم، مما يرفع معدلات الجلطات القلبية وقصور الشرايين التاجية في أوقات الذروة."
  },
  emergency: {
    heat: 0.45, aod: 0.20, fsi: 0.25, pop: 0.10,
    justification_en: "Frontline triage absorbs acute heat exhaustion, severe dehydration delirium, and industrial/agricultural environmental trauma with critical staffing gaps.",
    justification_ar: "طوارئ الاستقبال هي خط الدفاع الأول ضد ضربات الشمس الحادة وهذيان الجفاف وحوادث الإجهاد الحراري مع نقص حاد في أطباء الرعاية الحرجة."
  },
  pediatrics: {
    heat: 0.35, aod: 0.30, fsi: 0.20, pop: 0.15,
    justification_en: "Infants and children have lower thermoregulatory reserve and higher minute ventilation, amplifying sensitivity to summer gastroenteritis dehydration and aerosol smog.",
    justification_ar: "الأطفال يمتلكون قدرة تنظيم حراري أضعف، مما يجعلهم أكثر عرضة لنزلات الجفاف المعوية صيفاً والالتهابات الشعبية الناتجة عن عوادم الغبار."
  },
  geriatrics: {
    heat: 0.45, aod: 0.25, fsi: 0.15, pop: 0.15,
    justification_en: "Elderly patients with multiple comorbidities suffer impaired thirst response, heatstroke vulnerability, and rapid multi-organ decompensation during heat domes.",
    justification_ar: "كبار السن يعانون من ضعف الإحساس بالعطش وتثبيط التعرق، مما يسبب صدمات حرارية سريعة وقصوراً متعدد الأعضاء أثناء القباب الحرارية."
  },
  dermatology_ophthalmology: {
    heat: 0.30, aod: 0.40, fsi: 0.15, pop: 0.15,
    justification_en: "Intense solar radiation (ALLSKY_SFC_SW_DWN) and airborne mineral dust induce acute keratitis, allergic conjunctivitis, and actinic skin damage.",
    justification_ar: "الإشعاع الشمسي المباشر وغبار العواصف الرملية يتسببان في التهابات قرنية العين الحادة، والرمد الربيعي، وتلف الجلد الضوئي الحاد."
  },
  occupational_preventive: {
    heat: 0.40, aod: 0.30, fsi: 0.15, pop: 0.15,
    justification_en: "Outdoor agricultural and construction laborers face fatal wet-bulb temperature thresholds, requiring workplace preventative hydrations and early heat screening.",
    justification_ar: "عمال الزراعة والإنشاءات في الهواء الطلق يواجهون عتبات رطوبة وإجهاد حراري خطرة تتطلب بروتوكولات وقاية ميدانية واستبقاء أطباء الصحة العامة."
  }
};

export function matchSpecialty(specialtyKey, governoratesMap) {
  const weights = SPECIALTY_WEIGHTS[specialtyKey] || SPECIALTY_WEIGHTS.emergency;
  const results = [];

  for (const id in governoratesMap) {
    if (Object.prototype.hasOwnProperty.call(governoratesMap, id)) {
      const gov = governoratesMap[id];
      const epi = gov.baseline_indices ? gov.baseline_indices.epi : 50;
      const ppi = gov.baseline_indices ? gov.baseline_indices.ppi : 50;
      const fsi = gov.baseline_indices ? gov.baseline_indices.fsi : 50;
      const t2mMax = (gov.series && gov.series.T2M_MAX) ? gov.series.T2M_MAX[gov.series.T2M_MAX.length - 1] : 38;
      const aod = (gov.series && gov.series.AOD_550) ? gov.series.AOD_550[gov.series.AOD_550.length - 1] : 0.45;

      const heatScore = minMaxNormalize(t2mMax, 34, 46, false);
      const aodScore = minMaxNormalize(aod, 0.25, 0.85, false);

      const matchScore = (weights.heat * heatScore) +
                         (weights.aod * aodScore) +
                         (weights.fsi * fsi) +
                         (weights.pop * ppi);

      const roundedScore = Math.round(matchScore * 10) / 10;
      const matchPct = Math.min(99, Math.max(50, Math.round(matchScore)));

      results.push({
        id,
        name_en: gov.name_en,
        name_ar: gov.name_ar,
        matchScore: roundedScore,
        match_pct: matchPct,
        hni: gov.baseline_indices ? gov.baseline_indices.hni : Math.round(matchScore),
        justification_en: weights.justification_en,
        justification_ar: weights.justification_ar,
        keyDrivers: {
          heatScore: Math.round(heatScore),
          aodScore: Math.round(aodScore),
          fsi: Math.round(fsi),
          ppi: Math.round(ppi)
        }
      });
    }
  }

  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
}

// =========================================================================
// SECTION 8: WHAT-IF POLICY INTERVENTION SIMULATOR
// =========================================================================

// Elasticities per intervention unit, calibrated against empirical health economics
// and WHO health workforce retention literature (max financial incentive elasticity ~14-16%).
export const ADMISSIONS_MODEL = { perClinic: 34, perStipendPct: 11, perGreeningPct: 18 };
export const RETENTION_MODEL = { perStipendPct: 0.14, perClinic: 0.04 };
export const RETENTION_CEILING = 25;

export function simulatePolicyInterventions(
  baseHni, baseEpi, baseFsi, baseWni, basePpi,
  clinics = 0, stipendPct = 0, greeningPct = 0,
  salaryHikePct = 0, hazardPayPct = 0, securityPct = 0, equipmentPct = 0
) {
  const bHni = finiteIndex(baseHni, NEUTRAL_INDICES.hni);
  const bEpi = finiteIndex(baseEpi, NEUTRAL_INDICES.epi);
  const bFsi = finiteIndex(baseFsi, NEUTRAL_INDICES.fsi);
  const bWni = finiteIndex(baseWni, NEUTRAL_INDICES.wni);
  const bPpi = finiteIndex(basePpi, NEUTRAL_INDICES.ppi);

  // Only non-finite lever values are coerced (a reset component can hand us undefined).
  // In-range limits are deliberately NOT imposed here: the sliders own those, and the
  // model is defined to extrapolate linearly outside them, with the sub-index floor and
  // the retention ceiling as the documented guards.
  const lever = (v) => finiteIndex(v, 0);
  const nClinics = lever(clinics);
  const nStipend = lever(stipendPct);
  const nGreening = lever(greeningPct);
  const nSalaryHike = lever(salaryHikePct);
  const nHazardPay = lever(hazardPayPct);
  const nSecurity = lever(securityPct);
  const nEquipment = lever(equipmentPct);

  const fsiReduction = ((nClinics / 50.0) * 22.0) + ((nEquipment / 100.0) * 16.0);
  const wniReduction = ((nStipend / 100.0) * 28.0) +
                       ((nSalaryHike / 150.0) * 20.0) +
                       ((nHazardPay / 200.0) * 10.0) +
                       ((nSecurity / 100.0) * 14.0);
  const epiReduction = (nGreening / 30.0) * 12.0;

  const simEpi = Math.max(10, bEpi - epiReduction);
  const simFsi = Math.max(10, bFsi - fsiReduction);
  const simWni = Math.max(10, bWni - wniReduction);

  const simHni = (HNI_WEIGHTS.epi * simEpi) + (HNI_WEIGHTS.ppi * bPpi) + (HNI_WEIGHTS.fsi * simFsi) + (HNI_WEIGHTS.wni * simWni);
  const deltaHni = simHni - bHni;

  const preventedAdmissionsPerMonth = Math.round(
    (nClinics * ADMISSIONS_MODEL.perClinic) +
    (nStipend * ADMISSIONS_MODEL.perStipendPct) +
    (nGreening * ADMISSIONS_MODEL.perGreeningPct) +
    ((nEquipment / 100.0) * 900) +
    ((nSecurity / 100.0) * 350)
  );

  const projectedRetentionGain = Math.round(
    (nStipend * RETENTION_MODEL.perStipendPct) +
    (nClinics * RETENTION_MODEL.perClinic) +
    ((nSalaryHike / 150.0) * 8.0) +
    ((nHazardPay / 200.0) * 4.0) +
    ((nSecurity / 100.0) * 5.0) +
    ((nEquipment / 100.0) * 2.0)
  );

  return {
    simEpi: Math.round(simEpi * 10) / 10,
    simFsi: Math.round(simFsi * 10) / 10,
    simWni: Math.round(simWni * 10) / 10,
    simHni: Math.round(simHni * 10) / 10,
    deltaHni: Math.round(deltaHni * 10) / 10,
    pctReduction: bHni > 0 ? Math.round((Math.abs(deltaHni) / bHni) * 100) : 0,
    preventedAdmissions: Math.max(0, preventedAdmissionsPerMonth),
    retentionGainPct: Math.min(RETENTION_CEILING, Math.max(0, projectedRetentionGain))
  };
}
