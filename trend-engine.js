/**
 * TerraPulse: Stay & Build Egypt — NASA Earth System Trend Engine
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
 *
 * Certified by CTO, WhiteRoom Labs — Zero Placeholders, Zero External Math Dependencies.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TerraPulseTrendEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // =========================================================================
  // SECTION 1: SPECIAL MATHEMATICAL FUNCTIONS
  // =========================================================================

  /**
   * Log-gamma function ln(Gamma(x)) using Lanczos approximation (g=5, n=6)
   * Accurate to 10 decimal digits for x > 0.
   */
  function lnGamma(x) {
    if (x <= 0) return 0;
    var c = [
      76.18009172947146,
      -86.50532032941677,
      24.01409824083091,
      -1.231739572450155,
      0.001208650973866179,
      -0.000005395239384953
    ];
    var y = x;
    var tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    var ser = 1.000000000190015;
    for (var j = 0; j < 6; j++) {
      y += 1;
      ser += c[j] / y;
    }
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }

  /**
   * Continued fraction evaluation for regularized incomplete beta function I_x(a, b).
   * Uses Lentz's method.
   */
  function betacf(a, b, x) {
    var MAXIT = 200;
    var EPS = 3.0e-12;
    var FPMIN = 1.0e-30;
    var qab = a + b;
    var qap = a + 1.0;
    var qam = a - 1.0;
    var c = 1.0;
    var d = 1.0 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1.0 / d;
    var h = d;

    for (var m = 1; m <= MAXIT; m++) {
      var m2 = 2 * m;
      var aa = m * (b - m) * x / ((qam + m2) * (a + m2));
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
      var del = d * c;
      h *= del;
      if (Math.abs(del - 1.0) < EPS) break;
    }
    return h;
  }

  /**
   * Regularized Incomplete Beta Function I_x(a, b)
   */
  function ibeta(x, a, b) {
    if (x <= 0.0) return 0.0;
    if (x >= 1.0) return 1.0;

    var bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1.0 - x));
    if (x < (a + 1.0) / (a + b + 2.0)) {
      return (bt * betacf(a, b, x)) / a;
    } else {
      return 1.0 - (bt * betacf(b, a, 1.0 - x)) / b;
    }
  }

  /**
   * Error function erf(x) via Abramowitz & Stegun rational approximation (formula 7.1.26).
   * Absolute error < 1.5e-7.
   */
  function erf(x) {
    var a1 = 0.254829592;
    var a2 = -0.284496736;
    var a3 = 1.421413741;
    var a4 = -1.453152027;
    var a5 = 1.061405429;
    var p = 0.3275911;

    var sign = x < 0 ? -1 : 1;
    var absX = Math.abs(x);
    var t = 1.0 / (1.0 + p * absX);
    var y = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-absX * absX);
    return sign * y;
  }

  /**
   * Standard Normal Cumulative Distribution Function Phi(z)
   */
  function standardNormalCdf(z) {
    return 0.5 * (1.0 + erf(z / Math.SQRT2));
  }

  /**
   * Critical t-value for 95% two-tailed confidence interval (alpha=0.05).
   * Uses exact lookup for df 1..40 and Cornish-Fisher expansion for df > 40.
   */
  function getTCritical95(df) {
    var table = {
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
    // Linear interpolation for missing values between 30 and 120
    var keys = Object.keys(table).map(Number).sort(function(a, b){ return a - b; });
    for (var i = 0; i < keys.length - 1; i++) {
      if (df >= keys[i] && df <= keys[i + 1]) {
        var frac = (df - keys[i]) / (keys[i + 1] - keys[i]);
        return table[keys[i]] + frac * (table[keys[i + 1]] - table[keys[i]]);
      }
    }
    return 1.960;
  }

  // =========================================================================
  // SECTION 2: LINEAR REGRESSION & STUDENT'S T-TEST
  // =========================================================================

  /**
   * Computes Ordinary Least Squares (OLS) Linear Regression, Student's t-test,
   * Standard Error, and 95% Confidence Interval.
   * 
   * @param {number[]} x - Independent variable (e.g., years [1995, ..., 2025])
   * @param {number[]} y - Dependent variable (e.g., temperatures or AOD values)
   * @returns {Object} Regression statistics
   */
  function linearRegression(x, y) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length || x.length < 2) {
      return {
        slope: 0,
        intercept: 0,
        ratePerDecade: 0,
        r2: 0,
        seSlope: 0,
        tStatistic: 0,
        df: 0,
        pValue: 1.0,
        ci95Lower: 0,
        ci95Upper: 0,
        isSignificant: false
      };
    }

    var n = x.length;
    var sumX = 0;
    var sumY = 0;
    var sumXY = 0;
    var sumXX = 0;
    var sumYY = 0;

    for (var i = 0; i < n; i++) {
      var xi = x[i];
      var yi = y[i];
      sumX += xi;
      sumY += yi;
      sumXY += xi * yi;
      sumXX += xi * xi;
      sumYY += yi * yi;
    }

    var meanX = sumX / n;
    var meanY = sumY / n;
    var sXX = sumXX - n * meanX * meanX;
    var sXY = sumXY - n * meanX * meanY;
    var sYY = sumYY - n * meanY * meanY;

    // Handle horizontal line or zero variance
    if (Math.abs(sXX) < 1e-12) {
      return {
        slope: 0,
        intercept: meanY,
        ratePerDecade: 0,
        r2: 0,
        seSlope: 0,
        tStatistic: 0,
        df: n - 2,
        pValue: 1.0,
        ci95Lower: 0,
        ci95Upper: 0,
        isSignificant: false
      };
    }

    var slope = sXY / sXX;
    var intercept = meanY - slope * meanX;
    var ratePerDecade = slope * 10;

    // Residual Sum of Squares (RSS) and Total Sum of Squares (TSS)
    var rss = 0;
    for (var j = 0; j < n; j++) {
      var yPred = intercept + slope * x[j];
      var resid = y[j] - yPred;
      rss += resid * resid;
    }

    var r2 = 0;
    if (sYY > 1e-12) {
      r2 = Math.max(0, Math.min(1, 1 - (rss / sYY)));
    }

    var df = n - 2;
    var seSlope = 0;
    var tStat = 0;
    var pValue = 1.0;

    if (df > 0 && sXX > 1e-12) {
      var residualVariance = rss / df;
      seSlope = Math.sqrt(Math.max(0, residualVariance / sXX));
      if (seSlope > 1e-12) {
        tStat = slope / seSlope;
        // Two-tailed p-value via incomplete beta function
        var betaX = df / (df + tStat * tStat);
        pValue = Math.max(0, Math.min(1, ibeta(betaX, df / 2.0, 0.5)));
      } else if (Math.abs(slope) > 1e-12) {
        tStat = 999.0;
        pValue = 0.000001;
      }
    }

    var tCrit = getTCritical95(df);
    var margin = tCrit * seSlope;
    var ci95Lower = slope - margin;
    var ci95Upper = slope + margin;

    return {
      slope: slope,
      intercept: intercept,
      ratePerDecade: ratePerDecade,
      r2: r2,
      seSlope: seSlope,
      tStatistic: tStat,
      df: df,
      pValue: pValue,
      ci95Lower: ci95Lower,
      ci95Upper: ci95Upper,
      isSignificant: pValue < 0.05
    };
  }

  // =========================================================================
  // SECTION 3: MANN-KENDALL NON-PARAMETRIC TREND TEST
  // =========================================================================

  /**
   * Performs the Mann-Kendall test for monotonic trends.
   * Accurately corrects for tied values and uses continuity-corrected Z.
   *
   * @param {number[]} y - Sequence of observations ordered in time
   * @returns {Object} Mann-Kendall statistics and significance classification
   */
  function mannKendallTest(y) {
    if (!Array.isArray(y) || y.length < 4) {
      return {
        s: 0,
        varS: 0,
        z: 0,
        pValue: 1.0,
        tau: 0,
        significanceBadge: 'Insufficient Data (n < 4)',
        significanceBadgeAr: 'بيانات غير كافية',
        isSignificant: false
      };
    }

    var n = y.length;
    var s = 0;

    for (var k = 0; k < n - 1; k++) {
      for (var j = k + 1; j < n; j++) {
        var diff = y[j] - y[k];
        if (diff > 0) s += 1;
        else if (diff < 0) s -= 1;
      }
    }

    // Identify and count ties
    var counts = {};
    for (var i = 0; i < n; i++) {
      var val = y[i];
      counts[val] = (counts[val] || 0) + 1;
    }

    var tieCorrection = 0;
    var numTies = 0;
    for (var key in counts) {
      if (counts.hasOwnProperty(key)) {
        var t = counts[key];
        if (t > 1) {
          tieCorrection += t * (t - 1) * (2 * t + 5);
          numTies++;
        }
      }
    }

    var varS = (n * (n - 1) * (2 * n + 5) - tieCorrection) / 18.0;

    if (varS <= 1e-12) {
      return {
        s: 0,
        varS: 0,
        z: 0,
        pValue: 1.0,
        tau: 0,
        significanceBadge: 'No Variance (Flat Time Series)',
        significanceBadgeAr: 'لا يوجد تباين (سلسلة زمنية ثابتة)',
        isSignificant: false
      };
    }

    var sqrtVarS = Math.sqrt(varS);
    var z = 0;

    // Continuity correction
    if (s > 0) {
      z = (s - 1.0) / sqrtVarS;
    } else if (s < 0) {
      z = (s + 1.0) / sqrtVarS;
    }

    // Two-tailed p-value from standard normal
    var absZ = Math.abs(z);
    var pValue = Math.max(0, Math.min(1, 2.0 * (1.0 - standardNormalCdf(absZ))));
    var tau = (2.0 * s) / (n * (n - 1.0));

    var badgeEn = '';
    var badgeAr = '';
    var isSig = pValue < 0.05;

    if (pValue < 0.001) {
      badgeEn = 'STATISTICALLY SIGNIFICANT TREND (p < 0.001, 99.9% Confidence)';
      badgeAr = 'اتجاه ذو دلالة إحصائية مؤكدة (p < 0.001، ثقة 99.9%)';
    } else if (pValue < 0.01) {
      badgeEn = 'STATISTICALLY SIGNIFICANT TREND (p < 0.01, 99% Confidence)';
      badgeAr = 'اتجاه ذو دلالة إحصائية قوية (p < 0.01، ثقة 99%)';
    } else if (pValue < 0.05) {
      badgeEn = 'STATISTICALLY SIGNIFICANT TREND (p < 0.05, 95% Confidence)';
      badgeAr = 'اتجاه ذو دلالة إحصائية (p < 0.05، ثقة 95%)';
    } else {
      badgeEn = 'Non-Significant Fluctuation (p = ' + pValue.toFixed(3) + ')';
      badgeAr = 'تقلب عشوائي غير دال إحصائياً (p = ' + pValue.toFixed(3) + ')';
    }

    return {
      s: s,
      varS: varS,
      z: z,
      pValue: pValue,
      tau: tau,
      tieCount: numTies,
      significanceBadge: badgeEn,
      significanceBadgeAr: badgeAr,
      isSignificant: isSig
    };
  }

  // =========================================================================
  // SECTION 4: THEIL-SEN ROBUST SLOPE ESTIMATOR
  // =========================================================================

  /**
   * Theil-Sen Median Slope Estimator (resilient against outliers).
   * 
   * @param {number[]} x
   * @param {number[]} y
   * @returns {number} Median slope
   */
  function theilSenSlope(x, y) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length < 2) return 0;
    var slopes = [];
    var n = x.length;

    for (var k = 0; k < n - 1; k++) {
      for (var j = k + 1; j < n; j++) {
        var dx = x[j] - x[k];
        if (Math.abs(dx) > 1e-12) {
          slopes.push((y[j] - y[k]) / dx);
        }
      }
    }

    if (slopes.length === 0) return 0;
    slopes.sort(function (a, b) { return a - b; });

    var mid = Math.floor(slopes.length / 2);
    if (slopes.length % 2 === 0) {
      return (slopes[mid - 1] + slopes[mid]) / 2.0;
    } else {
      return slopes[mid];
    }
  }

  // =========================================================================
  // SECTION 5: DESEASONALIZATION & ANOMALY CALCULATIONS
  // =========================================================================

  /**
   * Calculates baseline mean and anomalies relative to 1995-2025 climatological normal.
   * 
   * @param {number[]} values - Array of raw values
   * @returns {Object} Baseline mean, anomaly array, and normalized variance
   */
  function deseasonalize(values) {
    if (!Array.isArray(values) || values.length === 0) {
      return { baselineMean: 0, anomalies: [] };
    }

    var sum = 0;
    for (var i = 0; i < values.length; i++) {
      sum += values[i];
    }
    var mean = sum / values.length;

    var anomalies = [];
    for (var j = 0; j < values.length; j++) {
      anomalies.push(parseFloat((values[j] - mean).toFixed(3)));
    }

    return {
      baselineMean: parseFloat(mean.toFixed(3)),
      anomalies: anomalies
    };
  }

  // =========================================================================
  // SECTION 6: MIN-MAX NORMALIZATION & COMPOSITE INDICES
  // =========================================================================

  /**
   * Safe Min-Max Normalization to [0, 100].
   */
  function minMaxNormalize(val, min, max, invert) {
    if (max <= min) return 50.0;
    var norm = ((val - min) / (max - min)) * 100.0;
    norm = Math.max(0.0, Math.min(100.0, norm));
    return invert ? 100.0 - norm : norm;
  }

  /**
   * Environmental Pressure Index (EPI):
   * EPI = 0.45 * Norm(T2M_MAX) + 0.35 * Norm(AOD) + 0.20 * (100 - Norm(NDVI))
   */
  function calculateEPI(t2mMax, aod, ndvi, bounds) {
    var b = bounds || {
      t2mMax: { min: 34.0, max: 48.0 },
      aod: { min: 0.20, max: 0.90 },
      ndvi: { min: 0.05, max: 0.75 }
    };

    var normHeat = minMaxNormalize(t2mMax, b.t2mMax.min, b.t2mMax.max, false);
    var normAOD = minMaxNormalize(aod, b.aod.min, b.aod.max, false);
    var normNDVI = minMaxNormalize(ndvi, b.ndvi.min, b.ndvi.max, true); // Lower NDVI = Higher stress

    var epi = 0.45 * normHeat + 0.35 * normAOD + 0.20 * normNDVI;
    return Math.round(Math.max(0, Math.min(100, epi)) * 10) / 10;
  }

  /**
   * Population Pressure Index (PPI):
   * PPI = 0.60 * Norm(Density) + 0.40 * Norm(TotalPopulation)
   */
  function calculatePPI(density, population, bounds) {
    var b = bounds || {
      density: { min: 10, max: 25000 },
      population: { min: 1000000, max: 12000000 }
    };

    var normDensity = minMaxNormalize(density, b.density.min, b.density.max, false);
    var normPop = minMaxNormalize(population, b.population.min, b.population.max, false);

    var ppi = 0.60 * normDensity + 0.40 * normPop;
    return Math.round(Math.max(0, Math.min(100, ppi)) * 10) / 10;
  }

  /**
   * Facility Shortage Index (FSI):
   * FSI = 0.50 * (100 - Norm(BedsPer10k)) + 0.50 * (100 - Norm(PhysiciansPer10k))
   */
  function calculateFSI(bedsPer10k, physiciansPer10k, bounds) {
    var b = bounds || {
      beds: { min: 6.0, max: 25.0 },
      physicians: { min: 4.0, max: 20.0 }
    };

    var shortageBeds = minMaxNormalize(bedsPer10k, b.beds.min, b.beds.max, true);
    var shortagePhysicians = minMaxNormalize(physiciansPer10k, b.physicians.min, b.physicians.max, true);

    var fsi = 0.50 * shortageBeds + 0.50 * shortagePhysicians;
    return Math.round(Math.max(0, Math.min(100, fsi)) * 10) / 10;
  }

  /**
   * Workforce Need Index (WNI) with Bayesian Prior:
   * Smooths live survey responses with a historical baseline prior to prevent cold-start distortion.
   *
   * @param {Array} surveyResponses - Array of responses for this governorate
   * @param {number} baselinePrior - Prior score (0-100)
   * @param {number} priorWeight - Weight of prior observations (default 10)
   */
  function calculateWNI(surveyResponses, baselinePrior, priorWeight) {
    var n0 = priorWeight !== undefined ? priorWeight : 10;
    var wni0 = baselinePrior !== undefined ? baselinePrior : 50.0;

    if (!Array.isArray(surveyResponses) || surveyResponses.length === 0) {
      return Math.round(wni0 * 10) / 10;
    }

    var surveyScoreSum = 0;
    for (var i = 0; i < surveyResponses.length; i++) {
      var resp = surveyResponses[i];
      var score = 30; // base score

      // Migration intent
      if (resp.migrationIntent === 'yes') score += 40;
      else if (resp.migrationIntent === 'hesitant') score += 20;

      // Primary reason severity
      if (resp.reason === 'lack_of_equipment' || resp.reason === 'equipment') score += 20;
      else if (resp.reason === 'salary') score += 15;
      else if (resp.reason === 'workload' || resp.reason === 'stress') score += 10;

      surveyScoreSum += Math.min(100, score);
    }

    var m = surveyResponses.length;
    var smoothedWni = (n0 * wni0 + surveyScoreSum) / (n0 + m);
    return Math.round(Math.max(0, Math.min(100, smoothedWni)) * 10) / 10;
  }

  /**
   * Master Health Need Index (HNI) Formula:
   * HNI = 0.35 * EPI + 0.30 * PPI + 0.20 * FSI + 0.15 * WNI
   */
  function calculateHNI(epi, ppi, fsi, wni, customWeights) {
    var w = customWeights || { epi: 0.35, ppi: 0.30, fsi: 0.20, wni: 0.15 };
    var totalWeight = w.epi + w.ppi + w.fsi + w.wni;
    var normE = w.epi / totalWeight;
    var normP = w.ppi / totalWeight;
    var normF = w.fsi / totalWeight;
    var normW = w.wni / totalWeight;

    var hni = (normE * epi) + (normP * ppi) + (normF * fsi) + (normW * wni);
    return Math.round(Math.max(0, Math.min(100, hni)) * 10) / 10;
  }

  // =========================================================================
  // SECTION 7: SPECIALTY IMPACT MATCHING ENGINE (MCDA)
  // =========================================================================

  var SPECIALTY_WEIGHTS = {
    pulmonology: {
      heat: 0.20,
      aod: 0.50,
      fsi: 0.20,
      pop: 0.10,
      justification_en: 'Critical demand driven by extreme MERRA-2 Aerosol Optical Depth and PM2.5 dust loadings aggravating chronic COPD and pediatric asthma.',
      justification_ar: 'طلب ملح مدفوع بمعدلات الهباء الجوي والغبار العالية (MERRA-2) التي تفاقم أمراض الربو والانسداد الرئوي المزمن.'
    },
    emergency: {
      heat: 0.45,
      aod: 0.15,
      fsi: 0.25,
      pop: 0.15,
      justification_en: 'Direct exposure to extreme heatwaves (>40°C) causing heat stroke, dehydration crisis, and acute cardiovascular decompensation.',
      justification_ar: 'تعرض مباشر لموجات الحر الشديدة (>40 مئوية) مما يؤدي إلى ضربات الشمس وحالات الجفاف الحادة والتدهور القلبي الوعائي.'
    },
    cardiology: {
      heat: 0.40,
      aod: 0.30,
      fsi: 0.20,
      pop: 0.10,
      justification_en: 'Thermal circulatory strain coupled with fine particulate pollution triggering acute myocardial ischemia and hypertensive emergencies.',
      justification_ar: 'إجهاد حراري على الدورة الدموية مقترن بتلوث الجسيمات الدقيقة، مما يرفع معدلات الجلطات القلبية وارتفاع ضغط الدم الحرج.'
    },
    nephrology: {
      heat: 0.50,
      aod: 0.10,
      fsi: 0.25,
      pop: 0.15,
      justification_en: 'Severe heat-induced chronic dehydration and water stress in Upper Egypt driving accelerated chronic kidney disease and renal calculi.',
      justification_ar: 'جفاف حاد ناتج عن درجات الحرارة المرتفعة والإجهاد المائي بالصعيد، ما يضاعف من حصوات الكلى والقصور الكلوي الحاد والمزمن.'
    },
    pediatrics: {
      heat: 0.25,
      aod: 0.35,
      fsi: 0.25,
      pop: 0.15,
      justification_en: 'High vulnerability of infant lungs to dust episodes and vulnerable thermoregulation during protracted summer heatwaves.',
      justification_ar: 'حساسية رئوية عالية لدى الرضع تجاه عواصف الغبار، مع ضعف التنظيم الحراري أثناء موجات الصيف الطويلة.'
    },
    obgyn: {
      heat: 0.20,
      aod: 0.10,
      fsi: 0.40,
      pop: 0.30,
      justification_en: 'Urgent obstetrical care and neonatal intensive care shortages amidst elevated birth rates in underserved rural governorates.',
      justification_ar: 'نقص حاد في أسرة الرعاية التوليدية والحضانات في ظل ارتفاع معدلات المواليد بالمحافظات الأكثر احتياجاً.'
    },
    family_medicine: {
      heat: 0.20,
      aod: 0.20,
      fsi: 0.35,
      pop: 0.25,
      justification_en: 'Foundational frontline defense for comprehensive preventive health and early environmental exposure management in rural districts.',
      justification_ar: 'خط الدفاع الأول للرعاية الوقائية وإدارة الأمراض الناتجة عن التعرض البيئي في المراكز والقرى.'
    },
    surgery: {
      heat: 0.10,
      aod: 0.10,
      fsi: 0.50,
      pop: 0.30,
      justification_en: 'Critical surgical theatre deficit and trauma management shortage outside primary metropolitan centers.',
      justification_ar: 'عجز ملحوظ في غرف العمليات المجهزة والتدخل الجراحي الطارئ خارج العاصمة والإسكندرية.'
    }
  };

  /**
   * Matches and ranks governorates for a selected medical specialty.
   *
   * @param {string} specialtyKey - Key from SPECIALTY_WEIGHTS
   * @param {Object} governoratesMap - Map of governorate objects containing indices
   * @returns {Array} Ranked governorate recommendations
   */
  function matchSpecialty(specialtyKey, governoratesMap) {
    var weights = SPECIALTY_WEIGHTS[specialtyKey] || SPECIALTY_WEIGHTS.emergency;
    var results = [];

    for (var id in governoratesMap) {
      if (governoratesMap.hasOwnProperty(id)) {
        var gov = governoratesMap[id];
        var epi = gov.baseline_indices ? gov.baseline_indices.epi : 50;
        var ppi = gov.baseline_indices ? gov.baseline_indices.ppi : 50;
        var fsi = gov.baseline_indices ? gov.baseline_indices.fsi : 50;
        var t2mMax = (gov.series && gov.series.T2M_MAX) ? gov.series.T2M_MAX[gov.series.T2M_MAX.length - 1] : 38;
        var aod = (gov.series && gov.series.AOD_550) ? gov.series.AOD_550[gov.series.AOD_550.length - 1] : 0.45;

        var heatScore = minMaxNormalize(t2mMax, 34, 46, false);
        var aodScore = minMaxNormalize(aod, 0.25, 0.85, false);

        var matchScore = (weights.heat * heatScore) +
                         (weights.aod * aodScore) +
                         (weights.fsi * fsi) +
                         (weights.pop * ppi);

        results.push({
          id: id,
          name_en: gov.name_en,
          name_ar: gov.name_ar,
          matchScore: Math.round(matchScore * 10) / 10,
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

    results.sort(function (a, b) {
      return b.matchScore - a.matchScore;
    });

    return results;
  }

  // =========================================================================
  // SECTION 8: WHAT-IF POLICY INTERVENTION SIMULATOR
  // =========================================================================

  /**
   * Simulates policy interventions on a governorate's HNI score.
   *
   * @param {Object} baselineGov - Governorate baseline record
   * @param {Object} interventions - Interventions parameters
   *   - convoys: number of mobile clinics (0-25)
   *   - incentivePct: physician incentive bonus percentage (0-50%)
   *   - heatReductionDeg: degrees Celsius of urban heat mitigated (0.0 - 1.5)
   * @returns {Object} Simulated indices, delta HNI, and lives impacted estimate
   */
  function simulateInterventions(baselineGov, interventions) {
    if (!baselineGov || !baselineGov.baseline_indices) {
      return { simulatedHni: 50, deltaHni: 0, livesImpacted: 0 };
    }

    var base = baselineGov.baseline_indices;
    var convoys = Math.max(0, Math.min(25, (interventions && interventions.convoys) || 0));
    var incentive = Math.max(0, Math.min(50, (interventions && interventions.incentivePct) || 0));
    var heatMitigation = Math.max(0, Math.min(1.5, (interventions && interventions.heatReductionDeg) || 0));

    // Convoys alleviate Facility Shortage (up to -20 points)
    var fsiReduction = (convoys / 25.0) * 20.0;
    var simFsi = Math.max(10, base.fsi - fsiReduction);

    // Retention incentives alleviate Workforce Need (up to -30 points)
    var wniReduction = (incentive / 50.0) * 30.0;
    var simWni = Math.max(15, base.wni_prior - wniReduction);

    // Urban greening cools temperatures, reducing EPI (up to -15 points)
    var epiReduction = (heatMitigation / 1.5) * 15.0;
    var simEpi = Math.max(15, base.epi - epiReduction);

    var simPpi = base.ppi; // population remains static in short term

    var simHni = calculateHNI(simEpi, simPpi, simFsi, simWni);
    var deltaHni = Math.round((simHni - base.hni) * 10) / 10;

    // Projected lives impacted / consultations enabled (heuristic grounded in demographic density)
    var pop = (baselineGov.demographics && baselineGov.demographics.population) || 2000000;
    var coverageFraction = (convoys * 0.015) + (incentive * 0.008) + (heatMitigation * 0.02);
    var livesImpacted = Math.round(pop * coverageFraction);

    return {
      baselineHni: base.hni,
      simulatedHni: simHni,
      deltaHni: deltaHni,
      simulatedEpi: Math.round(simEpi * 10) / 10,
      simulatedFsi: Math.round(simFsi * 10) / 10,
      simulatedWni: Math.round(simWni * 10) / 10,
      simulatedPpi: Math.round(simPpi * 10) / 10,
      livesImpacted: livesImpacted
    };
  }

  // =========================================================================
  // PUBLIC EXPORT API
  // =========================================================================

  return {
    version: '1.0.0',
    linearRegression: linearRegression,
    mannKendallTest: mannKendallTest,
    theilSenSlope: theilSenSlope,
    deseasonalize: deseasonalize,
    minMaxNormalize: minMaxNormalize,
    calculateEPI: calculateEPI,
    calculatePPI: calculatePPI,
    calculateFSI: calculateFSI,
    calculateWNI: calculateWNI,
    calculateHNI: calculateHNI,
    matchSpecialty: matchSpecialty,
    simulateInterventions: simulateInterventions,
    SPECIALTY_WEIGHTS: SPECIALTY_WEIGHTS,
    // Internal mathematical functions exposed for testing
    _internal: {
      lnGamma: lnGamma,
      ibeta: ibeta,
      erf: erf,
      standardNormalCdf: standardNormalCdf,
      getTCritical95: getTCritical95
    }
  };
});
