#!/usr/bin/env python3
"""
TerraPulse: Unit & Integration Verification Suite for NASA POWER Pipeline & Data Artifacts
NASA Space Apps Challenge 2026

Verifies:
  1. Integrity of data.json, embedded-data.js, and data.js
  2. Completeness of 31-year continuous records (1995-2025)
  3. Accuracy of Mann-Kendall and OLS Linear Regression calculations
  4. Opposite-direction regional trend detection (Upper Egypt warming vs Delta NDVI decline)
  5. Physician survey seed responses (45 authentic Egyptian responses)
  6. Health Need Index (HNI) calculations and sensitivity weights
  7. Cross-runtime parity (Python trend_engine vs JS trend-engine)

Author: Backend Engineer, WhiteRoom Labs
"""

import os
import sys
import json
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).parent.resolve()

def run_tests():
    print("=" * 80)
    print("🧪 TERRAPULSE BACKEND DATA PIPELINE & ARTIFACT VERIFICATION SUITE")
    print("=" * 80)

    passed = 0
    failed = 0

    def assert_true(condition: bool, description: str):
        nonlocal passed, failed
        if condition:
            passed += 1
            print(f"  ✅ PASS: {description}")
        else:
            failed += 1
            print(f"  ❌ FAIL: {description}")

    # 1. Check generated files exist and non-empty
    json_file = BASE_DIR / "data.json"
    js_file = BASE_DIR / "data.js"
    embedded_file = BASE_DIR / "embedded-data.js"

    assert_true(json_file.exists() and json_file.stat().st_size > 50000, "data.json exists and > 50KB")
    assert_true(js_file.exists() and js_file.stat().st_size > 50000, "data.js exists and > 50KB")
    assert_true(embedded_file.exists() and embedded_file.stat().st_size > 50000, "embedded-data.js exists and > 50KB")

    # 2. Parse data.json
    with open(json_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 3. Check metadata
    meta = data.get("metadata", {})
    assert_true(meta.get("start_year") == 1995, "Metadata start_year is 1995")
    assert_true(meta.get("end_year") == 2025, "Metadata end_year is 2025")
    assert_true(meta.get("total_years") == 31, "Metadata total_years is 31")

    # 4. Check governorates
    govs = data.get("governorates", {})
    expected_govs = ["cairo", "giza", "alexandria", "assiut", "aswan"]
    assert_true(set(govs.keys()) == set(expected_govs), "All 5 expected governorates present")

    # 5. Check series completeness
    for gid in expected_govs:
        gov = govs[gid]
        series = gov.get("series", {})
        assert_true(len(series.get("years", [])) == 31, f"{gid} has 31 year records")
        assert_true(len(series.get("T2M", [])) == 31, f"{gid} has 31 T2M records")
        assert_true(len(series.get("T2M_MAX", [])) == 31, f"{gid} has 31 T2M_MAX records")
        assert_true(len(series.get("RH2M", [])) == 31, f"{gid} has 31 RH2M records")
        assert_true(len(series.get("ALLSKY_SFC_SW_DWN", [])) == 31, f"{gid} has 31 solar records")
        assert_true(len(series.get("EXTREME_HEAT_DAYS", [])) == 31, f"{gid} has 31 extreme heat days records")
        assert_true(len(series.get("AOD_550", [])) == 31, f"{gid} has 31 AOD records")
        assert_true(len(series.get("NDVI", [])) == 31, f"{gid} has 31 NDVI records")
        assert_true(len(series.get("LST_DAY", [])) == 31, f"{gid} has 31 LST records")
        assert_true(len(series.get("SOIL_MOISTURE", [])) == 31, f"{gid} has 31 soil moisture records")

    # 6. Check statistics accuracy
    aswan_stats = govs["aswan"]["statistics"]["T2M"]
    assert_true(aswan_stats["ols"]["slope"] > 0, "Aswan 30-year warming slope is positive")
    assert_true(aswan_stats["ols"]["rate_per_decade"] > 0.25, f"Aswan warming rate > 0.25 °C/decade ({aswan_stats['ols']['rate_per_decade']:.2f})")
    assert_true(aswan_stats["mann_kendall"]["z"] > 2.5, f"Aswan Mann-Kendall Z > 2.5 ({aswan_stats['mann_kendall']['z']:.2f})")
    assert_true(aswan_stats["mann_kendall"]["p_value"] < 0.01, f"Aswan Mann-Kendall p-value < 0.01 ({aswan_stats['mann_kendall']['p_value']:.4e})")

    # 7. Check opposite-direction trend: NDVI & Soil Moisture declining in Delta
    alex_ndvi = govs["alexandria"]["statistics"]["NDVI"]
    alex_soil = govs["alexandria"]["statistics"]["SOIL_MOISTURE"]
    assert_true(alex_ndvi["ols"]["slope"] < 0, "Alexandria NDVI slope is negative (opposite-direction trend)")
    assert_true(alex_soil["ols"]["slope"] < 0, "Alexandria Soil Moisture slope is negative (opposite-direction trend)")

    # 8. Check physician survey seed responses
    surveys = data.get("survey_seed", [])
    assert_true(len(surveys) == 45, f"Expected 45 seed responses, got {len(surveys)}")
    survey_govs = set(s["governorate"] for s in surveys)
    assert_true(survey_govs == set(expected_govs), "Seed responses cover all 5 governorates")
    survey_specs = set(s["specialty"] for s in surveys)
    assert_true(len(survey_specs) == 8, f"Seed responses cover all 8 specialties (got {len(survey_specs)})")

    # 9. Check specialties & sensitivity weights
    specialties = data.get("specialties", {})
    assert_true(len(specialties) == 8, "8 medical specialties configured")
    for sname, sdata in specialties.items():
        w = sdata.get("weights", {})
        weight_sum = round(sum(w.values()), 2)
        assert_true(weight_sum == 1.00, f"Specialty {sname} weights sum to 1.00 (got {weight_sum})")

    # 10. Check HNI scores
    for gid in expected_govs:
        hni = govs[gid]["baseline_indices"]["hni"]
        assert_true(0.0 <= hni <= 100.0, f"{gid} HNI is within [0, 100] (got {hni})")
    # Aswan has highest environmental & workforce need
    assert_true(govs["aswan"]["baseline_indices"]["hni"] > govs["alexandria"]["baseline_indices"]["hni"],
                "Aswan HNI > Alexandria HNI (reflecting Upper Egypt critical need)")

    # 11. Cross-runtime parity test with Node.js
    node_test_code = """
    const fs = require('fs');
    const path = require('path');
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
    const engine = require(path.resolve(__dirname, 'trend-engine.js'));

    const years = data.governorates.aswan.series.years;
    const t2m = data.governorates.aswan.series.T2M;

    const ols = engine.linearRegression(years, t2m);
    const mk = engine.mannKendallTest(t2m);

    const pyOlsSlope = data.governorates.aswan.statistics.T2M.ols.slope;
    const pyMkZ = data.governorates.aswan.statistics.T2M.mann_kendall.z;

    const slopeDiff = Math.abs(ols.slope - pyOlsSlope);
    const zDiff = Math.abs(mk.z - pyMkZ);

    if (slopeDiff > 1e-4 || zDiff > 1e-3) {
      console.error(`Discrepancy: slopeDiff=${slopeDiff}, zDiff=${zDiff}`);
      process.exit(1);
    }
    console.log(`PARITY_OK: slopeDiff=${slopeDiff.toExponential(2)}, zDiff=${zDiff.toExponential(2)}`);
    """
    proc = subprocess.run(["node", "-e", node_test_code], cwd=str(BASE_DIR), capture_output=True, text=True)
    assert_true(proc.returncode == 0 and "PARITY_OK" in proc.stdout, f"Python & JS runtime parity: {proc.stdout.strip()}")

    print("=" * 80)
    print(f"🏁 RESULT: {passed} / {passed + failed} tests passed ({passed / (passed + failed) * 100:.1f}%)")
    print("=" * 80)
    return failed == 0

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
