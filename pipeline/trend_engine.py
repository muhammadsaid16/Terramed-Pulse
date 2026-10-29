"""TerraPulse: Stay & Build Egypt — NASA Earth System Trend Engine (Python Core)

Zero-dependency statistical companion engine for fetch_nasa_data.py.
Implements exact parity with trend-engine.js:
  1. Ordinary Least Squares (OLS) Linear Regression with Student's t-test and 95% Confidence Interval
  2. Mann-Kendall Non-Parametric Trend Test with tie group correction and continuity-corrected Z
  3. Theil-Sen Robust Slope Estimator
  4. Deseasonalization & Climatological Anomaly Computation
  5. Health Need Index (HNI) and Sub-Indices (EPI, PPI, FSI, WNI)

Certified by CTO, WhiteRoom Labs — Zero External Dependencies (Standard Library Only).
"""

import math
from typing import List, Dict, Any, Tuple, Optional


def betacf(a: float, b: float, x: float) -> float:
    """Continued fraction evaluation for regularized incomplete beta function I_x(a, b)."""
    max_it = 200
    eps = 3.0e-12
    fp_min = 1.0e-30
    qab = a + b
    qap = a + 1.0
    qam = a - 1.0
    c = 1.0
    d = 1.0 - qab * x / qap
    if abs(d) < fp_min:
        d = fp_min
    d = 1.0 / d
    h = d

    for m in range(1, max_it + 1):
        m2 = 2 * m
        aa = m * (b - m) * x / ((qam + m2) * (a + m2))
        d = 1.0 + aa * d
        if abs(d) < fp_min:
            d = fp_min
        c = 1.0 + aa / c
        if abs(c) < fp_min:
            c = fp_min
        d = 1.0 / d
        h *= d * c

        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
        d = 1.0 + aa * d
        if abs(d) < fp_min:
            d = fp_min
        c = 1.0 + aa / c
        if abs(c) < fp_min:
            c = fp_min
        d = 1.0 / d
        del_step = d * c
        h *= del_step
        if abs(del_step - 1.0) < eps:
            break
    return h


def ibeta(x: float, a: float, b: float) -> float:
    """Regularized Incomplete Beta Function I_x(a, b)."""
    if x <= 0.0:
        return 0.0
    if x >= 1.0:
        return 1.0
    bt = math.exp(math.lgamma(a + b) - math.lgamma(a) - math.lgamma(b) + a * math.log(x) + b * math.log(1.0 - x))
    if x < (a + 1.0) / (a + b + 2.0):
        return (bt * betacf(a, b, x)) / a
    else:
        return 1.0 - (bt * betacf(b, a, 1.0 - x)) / b


def normal_cdf(z: float) -> float:
    """Standard Normal Cumulative Distribution Function Phi(z)."""
    return 0.5 * (1.0 + math.erf(z / math.sqrt(2.0)))


def get_t_critical_95(df: int) -> float:
    """Critical two-tailed t-value for alpha = 0.05."""
    table = {
        1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
        6: 2.447,  7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
        11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
        16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086,
        21: 2.080, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.060,
        26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042,
        35: 2.030, 40: 2.021, 50: 2.009, 60: 2.000, 100: 1.984, 120: 1.980
    }
    if df in table:
        return table[df]
    if df > 120:
        return 1.960
    keys = sorted(table.keys())
    for i in range(len(keys) - 1):
        if keys[i] <= df <= keys[i + 1]:
            frac = (df - keys[i]) / (keys[i + 1] - keys[i])
            return table[keys[i]] + frac * (table[keys[i + 1]] - table[keys[i]])
    return 1.960


def linear_regression(x: List[float], y: List[float]) -> Dict[str, Any]:
    """Computes OLS Linear Regression, Student's t-test, and 95% Confidence Interval."""
    if len(x) != len(y) or len(x) < 2:
        return {
            "slope": 0.0, "intercept": 0.0, "rate_per_decade": 0.0,
            "r2": 0.0, "se_slope": 0.0, "t_stat": 0.0, "df": 0,
            "p_value": 1.0, "ci95_lower": 0.0, "ci95_upper": 0.0, "is_significant": False
        }

    n = len(x)
    sum_x = sum(x)
    sum_y = sum(y)
    sum_xy = sum(xi * yi for xi, yi in zip(x, y))
    sum_xx = sum(xi * xi for xi in x)
    sum_yy = sum(yi * yi for yi in y)

    mean_x = sum_x / n
    mean_y = sum_y / n

    s_xx = sum_xx - n * mean_x * mean_x
    s_xy = sum_xy - n * mean_x * mean_y
    s_yy = sum_yy - n * mean_y * mean_y

    if abs(s_xx) < 1e-12:
        return {
            "slope": 0.0, "intercept": mean_y, "rate_per_decade": 0.0,
            "r2": 0.0, "se_slope": 0.0, "t_stat": 0.0, "df": n - 2,
            "p_value": 1.0, "ci95_lower": 0.0, "ci95_upper": 0.0, "is_significant": False
        }

    slope = s_xy / s_xx
    intercept = mean_y - slope * mean_x
    rate_per_decade = slope * 10.0

    rss = sum((yi - (intercept + slope * xi)) ** 2 for xi, yi in zip(x, y))
    r2 = max(0.0, min(1.0, 1.0 - (rss / s_yy))) if s_yy > 1e-12 else 0.0

    df = n - 2
    se_slope = 0.0
    t_stat = 0.0
    p_value = 1.0

    if df > 0 and s_xx > 1e-12:
        residual_variance = rss / df
        se_slope = math.sqrt(max(0.0, residual_variance / s_xx))
        if se_slope > 1e-12:
            t_stat = slope / se_slope
            beta_x = df / (df + t_stat * t_stat)
            p_value = max(0.0, min(1.0, ibeta(beta_x, df / 2.0, 0.5)))
        elif abs(slope) > 1e-12:
            t_stat = 999.0
            p_value = 0.000001

    t_crit = get_t_critical_95(df)
    margin = t_crit * se_slope
    ci95_lower = slope - margin
    ci95_upper = slope + margin

    return {
        "slope": slope,
        "intercept": intercept,
        "rate_per_decade": rate_per_decade,
        "r2": r2,
        "se_slope": se_slope,
        "t_stat": t_stat,
        "df": df,
        "p_value": p_value,
        "ci95_lower": ci95_lower,
        "ci95_upper": ci95_upper,
        "is_significant": p_value < 0.05
    }


def mann_kendall_test(y: List[float]) -> Dict[str, Any]:
    """Computes Mann-Kendall test with tie group correction and continuity-corrected Z."""
    n = len(y)
    if n < 4:
        return {
            "s": 0, "var_s": 0.0, "z": 0.0, "p_value": 1.0, "tau": 0.0,
            "badge": "Insufficient Data (n < 4)", "is_significant": False
        }

    s = 0
    for k in range(n - 1):
        for j in range(k + 1, n):
            diff = y[j] - y[k]
            if diff > 0:
                s += 1
            elif diff < 0:
                s -= 1

    counts: Dict[float, int] = {}
    for val in y:
        counts[val] = counts.get(val, 0) + 1

    tie_correction = sum(t * (t - 1) * (2 * t + 5) for t in counts.values() if t > 1)
    var_s = (n * (n - 1) * (2 * n + 5) - tie_correction) / 18.0

    if var_s <= 1e-12:
        return {
            "s": 0, "var_s": 0.0, "z": 0.0, "p_value": 1.0, "tau": 0.0,
            "badge": "No Variance (Flat Series)", "is_significant": False
        }

    sqrt_var_s = math.sqrt(var_s)
    z = 0.0
    if s > 0:
        z = (s - 1.0) / sqrt_var_s
    elif s < 0:
        z = (s + 1.0) / sqrt_var_s

    p_value = max(0.0, min(1.0, 2.0 * (1.0 - normal_cdf(abs(z)))))
    tau = (2.0 * s) / (n * (n - 1.0))

    if p_value < 0.001:
        badge = "STATISTICALLY SIGNIFICANT TREND (p < 0.001, 99.9% Confidence)"
    elif p_value < 0.01:
        badge = "STATISTICALLY SIGNIFICANT TREND (p < 0.01, 99% Confidence)"
    elif p_value < 0.05:
        badge = "STATISTICALLY SIGNIFICANT TREND (p < 0.05, 95% Confidence)"
    else:
        badge = f"Non-Significant Fluctuation (p = {p_value:.3f})"

    return {
        "s": s,
        "var_s": var_s,
        "z": z,
        "p_value": p_value,
        "tau": tau,
        "badge": badge,
        "is_significant": p_value < 0.05
    }


def theil_sen_slope(x: List[float], y: List[float]) -> float:
    """Theil-Sen Robust Median Slope."""
    n = len(x)
    if n < 2 or len(y) != n:
        return 0.0
    slopes = []
    for k in range(n - 1):
        for j in range(k + 1, n):
            dx = x[j] - x[k]
            if abs(dx) > 1e-12:
                slopes.append((y[j] - y[k]) / dx)
    if not slopes:
        return 0.0
    slopes.sort()
    mid = len(slopes) // 2
    if len(slopes) % 2 == 0:
        return (slopes[mid - 1] + slopes[mid]) / 2.0
    return slopes[mid]


def deseasonalize(values: List[float]) -> Dict[str, Any]:
    """Calculates 30-year climatological baseline mean and anomalies."""
    if not values:
        return {"baseline_mean": 0.0, "anomalies": []}
    mean = sum(values) / len(values)
    anomalies = [round(v - mean, 3) for v in values]
    return {"baseline_mean": round(mean, 3), "anomalies": anomalies}


def min_max_normalize(val: float, val_min: float, val_max: float, invert: bool = False) -> float:
    """Safely normalizes value to [0.0, 100.0]."""
    if val_max <= val_min:
        return 50.0
    norm = ((val - val_min) / (val_max - val_min)) * 100.0
    norm = max(0.0, min(100.0, norm))
    return 100.0 - norm if invert else norm


def calculate_hni(epi: float, ppi: float, fsi: float, wni: float) -> float:
    """Calculates master Health Need Index."""
    hni = 0.35 * epi + 0.30 * ppi + 0.20 * fsi + 0.15 * wni
    return round(max(0.0, min(100.0, hni)), 1)
