"""Verification suite for Python trend_engine.py.
Run with: python3 test_trend_engine.py
"""

import sys
import trend_engine as te

passed_tests = 0
total_tests = 0

def assert_true(condition: bool, msg: str):
    global passed_tests, total_tests
    total_tests += 1
    if not condition:
        print(f"❌ FAIL: {msg}", file=sys.stderr)
        sys.exit(1)
    else:
        passed_tests += 1
        print(f"✅ PASS: {msg}")

def assert_close(actual: float, expected: float, tol: float, msg: str):
    global passed_tests, total_tests
    total_tests += 1
    diff = abs(actual - expected)
    if diff > tol:
        print(f"❌ FAIL: {msg} (Actual {actual}, Expected {expected}, Diff {diff} > {tol})", file=sys.stderr)
        sys.exit(1)
    else:
        passed_tests += 1
        print(f"✅ PASS: {msg} ({actual:.5f} ≈ {expected:.5f})")

print("================================================================")
print(" TerraPulse Python Trend Engine — Verification Suite")
print("================================================================\n")

# 1. Linear Regression
x = [1.0, 2.0, 3.0, 4.0, 5.0]
y = [3.0, 5.0, 7.0, 9.0, 11.0]
reg = te.linear_regression(x, y)
assert_close(reg["slope"], 2.0, 1e-6, "Slope on y = 2x + 1")
assert_close(reg["intercept"], 1.0, 1e-6, "Intercept on y = 2x + 1")
assert_close(reg["r2"], 1.0, 1e-6, "R2 on collinear data")
assert_true(reg["is_significant"], "Significance flag on collinear data")

# 2. Mann-Kendall test
mk_inc = te.mann_kendall_test([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0])
assert_true(mk_inc["s"] == 45, "Mann-Kendall S-score for n=10 is 45")
assert_close(mk_inc["var_s"], 125.0, 1e-6, "Mann-Kendall Var(S) is 125.0")
assert_close(mk_inc["z"], 3.9354796, 1e-4, "Mann-Kendall Z-score is 3.9355")
assert_true(mk_inc["p_value"] < 0.0001, "Mann-Kendall p-value < 0.0001")

# Flat data
mk_flat = te.mann_kendall_test([5.0, 5.0, 5.0, 5.0, 5.0])
assert_true(mk_flat["s"] == 0, "Mann-Kendall S is 0 on flat data")
assert_true(mk_flat["p_value"] == 1.0, "Mann-Kendall p-value is 1.0 on flat data")

# Theil-Sen slope
ts_slope = te.theil_sen_slope(x, [3.0, 5.0, 999.0, 9.0, 11.0])
assert_close(ts_slope, 2.0, 1e-6, "Theil-Sen robust to middle outlier")

# HNI calculation
hni = te.calculate_hni(80.0, 70.0, 60.0, 50.0)
assert_close(hni, 68.5, 0.1, "HNI weighted sum matches formula")

print("\n================================================================")
print(f" RESULTS: {passed_tests} / {total_tests} Tests Passed (100% Success)")
print("================================================================")
