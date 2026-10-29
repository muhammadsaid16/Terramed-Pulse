# TerraPulse: Stay & Build Egypt — Architectural Blueprint & System Specification
**Project**: TerraPulse: Stay & Build Egypt (ابقَ وابنِ — محقق اتجاهات الأرض وبوصلة الأثر الصحي والبيئي في مصر)  
**Challenge**: NASA Space Apps Challenge 2026 — *"Be An Earth System Trend Detective!"*  
**Author**: Chief Technology Officer (CTO), WhiteRoom Labs  
**Status**: APPROVED & SIGNED-OFF (V1.0 Final)  
**Date**: October 2026  

---

## 1. Executive Summary & Architectural Vision

TerraPulse is a high-performance, client-first, zero-backend geospatial analytics and climate-health decision platform built for the NASA Space Apps Challenge 2026.

The platform directly solves the challenge prompt by empowering researchers, healthcare professionals, and policy leaders to detect opposite-direction Earth system trends across Egypt over a 30-year window (1995–2025). It bridges planetary observations from NASA missions (NASA POWER, MERRA-2, MODIS, GLDAS, SEDAC) with socio-demographic indicators from CAPMAS and WHO to calculate the **Health Need Index (HNI)**. In doing so, it provides actionable evidence to retain and strategically deploy Egyptian medical talent ("Stay & Build Egypt").

### Core Architectural Pillars
1. **Zero-Backend Determinism**:
   The application operates 100% in-browser with zero mandatory server dependencies — there is no application backend; every statistic is computed in the page. Serving requires a static HTTP origin (`npm run preview` after build) because the shipped entry is the Vite template, which loads `/src/main.jsx` as an ES module and renders blank over `file://`. The datasets, Leaflet and Chart.js are bundled, so maps and charts work without internet; the two Google Fonts (Inter + Cairo) are the only remaining network dependency and are needed on first visit.
2. **Mathematical Precision with In-Browser JS Math**:
   Every trend statistic—Ordinary Least Squares (OLS) slope, Student's $t$-test $p$-value, Mann-Kendall non-parametric test ($S$, $Var(S)$, $Z$, and exact two-tailed $p$-value), Theil-Sen robust estimator, and Min-Max HNI composite weighting—is computed deterministically on-the-fly in JavaScript without external math libraries.
3. **Bilingual Bi-Directional UX (English LTR & Arabic RTL)**:
   A clean, reactive internationalization engine that toggles language without reload, re-rendering Leaflet choropleths, Chart.js time-series plots, wizard state, and RTL typography.
4. **Reactive Physician Feedback Loop**:
   An embedded in-page survey with a Bayesian prior updating the Workforce Need Index (WNI) and HNI in real-time, feeding a "What-If" intervention simulator.

---

## 2. System Architecture & Topology

```mermaid
flowchart TD
    subgraph Data Sources [Satellite & Ground Truth Ingestion]
        NASA_POWER["NASA POWER API<br/>(T2M, T2M_MAX, RH2M, ALLSKY_SFC_SW_DWN)"]
        MERRA2["MERRA-2 Reanalysis<br/>(AOD TOTEXTTAU, PM2.5, Dust)"]
        MODIS["MODIS Satellite<br/>(MOD13A3 NDVI, MOD11C3 LST)"]
        GLDAS["GLDAS Land Models<br/>(Soil Moisture, Evapotranspiration)"]
        SEDAC["NASA SEDAC + CAPMAS + WHO<br/>(Population, Facilities, Physicians)"]
    end

    subgraph Data Pipeline [Python Offline / Online Refresher]
        FETCH_PY["pipeline/fetch_nasa_data.py<br/>REST Client + Fallback Cache"]
        PY_MATH["pipeline/trend_engine.py<br/>Python Statistical Engine"]
        DATA_JSON["legacy/data.json / embedded-data.js<br/>30-Year Normalized Records (1995-2025)"]
    end

    subgraph Browser Client [Zero-Backend Standalone Web App]
        STORE["Application State & Reactive Store<br/>(localStorage + Bayesian Prior)"]
        
        subgraph Core Engines
            MATH_JS["src/lib/trendEngine.js<br/>- Mann-Kendall Z & p-value<br/>- OLS Regression & t-test<br/>- HNI Composite & MinMax"]
            ROUTER["Bilingual & Theme Controller<br/>(EN LTR / AR RTL, Dark Theme)"]
            DOCTOR_MCDA["Specialty Impact Matcher<br/>(8 Specialties Sensitivity Matrix)"]
            SIMULATOR["What-If Policy Simulator<br/>(Convoys, Incentives, Greening)"]
        end

        subgraph Presentation Layer
            MAP_VIEW["Leaflet.js Geospatial Map<br/>(5 Egyptian Governorates & Choropleths)"]
            CHART_VIEW["Chart.js Time Series<br/>(30-Year Trend + Deseasonalized Anomaly)"]
            WIZARD["Trend Detective Wizard<br/>(3-Step Discovery Flow)"]
            FORM_VIEW["Embedded Physician Survey<br/>(45 Seed Responses + Real-time Reactive Input)"]
            BRIEF_VIEW["Executive Policy Brief<br/>(Print Stylesheet @media print 1-Page PDF)"]
        end
    end

    Data Sources --> FETCH_PY
    FETCH_PY --> PY_MATH
    PY_MATH --> DATA_JSON
    DATA_JSON --> STORE
    STORE --> MATH_JS
    MATH_JS --> DOCTOR_MCDA
    MATH_JS --> SIMULATOR
    STORE --> ROUTER
    MATH_JS --> CHART_VIEW
    MATH_JS --> MAP_VIEW
    DOCTOR_MCDA --> MAP_VIEW
    FORM_VIEW --> STORE
    SIMULATOR --> BRIEF_VIEW
```

---

## 3. Module Decomposition & Layer Contracts

### Module 1: Trend & Statistics Engine (`src/lib/trendEngine.js` — live; `legacy/trend-engine.js` and `pipeline/trend_engine.py` are parity copies)
Provides analytical guarantees across all datasets. Zero external dependencies.

#### Mathematical Contracts:
1. **Ordinary Least Squares (OLS) Linear Regression**:
   - Slope: $\beta = \frac{n \sum (t \cdot y) - \sum t \sum y}{n \sum t^2 - (\sum t)^2}$
   - Intercept: $\alpha = \bar{y} - \beta \bar{t}$
   - Rate per decade: $\Delta_{decade} = 10 \times \beta$
   - Standard Error of Slope: $SE(\beta) = \sqrt{\frac{RSS / (n - 2)}{\sum (t_i - \bar{t})^2}}$
   - Student's $t$-statistic: $t = \frac{\beta}{SE(\beta)}$, $df = n - 2$
   - Two-tailed $p$-value: $p = I_{\frac{df}{df + t^2}}\left(\frac{df}{2}, \frac{1}{2}\right)$ (Regularized Incomplete Beta Function)
   - 95% Confidence Interval: $[\beta - t_{0.025, df} \cdot SE(\beta), \; \beta + t_{0.025, df} \cdot SE(\beta)]$

2. **Mann-Kendall Non-Parametric Trend Test**:
   - Sum of pairwise signs: $S = \sum_{k=1}^{n-1} \sum_{j=k+1}^n \operatorname{sgn}(y_j - y_k)$
   - Variance with tie group correction:
     $$Var(S) = \frac{n(n-1)(2n+5) - \sum_{p=1}^g t_p(t_p - 1)(2t_p + 5)}{18}$$
   - Continuity-corrected standardized test statistic:
     $$Z = \begin{cases} \frac{S - 1}{\sqrt{Var(S)}} & S > 0 \\ 0 & S = 0 \\ \frac{S + 1}{\sqrt{Var(S)}} & S < 0 \end{cases}$$
   - Two-tailed $p$-value from standard normal CDF: $p = \operatorname{erfc}\left(\frac{|Z|}{\sqrt{2}}\right)$
   - Kendall's $\tau = \frac{2S}{n(n-1)}$
   - Significance Classification:
     - $p < 0.001$: `STATISTICALLY SIGNIFICANT TREND (p < 0.001, 99.9% Confidence)`
     - $p < 0.01$: `STATISTICALLY SIGNIFICANT TREND (p < 0.01, 99% Confidence)`
     - $p < 0.05$: `STATISTICALLY SIGNIFICANT TREND (p < 0.05, 95% Confidence)`
     - $p \ge 0.05$: `Non-Significant Fluctuation (p >= 0.05)`

3. **Deseasonalization & Anomaly Detection**:
   - Climatological baseline normal (1995–2005 window, per WMO convention): $\mu_{base} = \frac{1}{N} \sum_{i \in [1995,2005]} y_i$
   - Anomaly time series: $\Delta y_i = y_i - \mu_{base}$
   - The legacy `trend-engine.js` / `trend_engine.py` implementations subtract the full-series mean instead; their anomalies are not comparable with the React app's.

4. **Health Need Index (HNI) Specification**:
   $$\text{HNI} = 0.35 \times \text{EPI} + 0.30 \times \text{PPI} + 0.20 \times \text{FSI} + 0.15 \times \text{WNI}$$

   > **Implementation status.** This block is the *design specification*. In the shipped React app only **HNI** and **WNI** are computed at runtime (`computeHNI`, `computeWNIFromReports` in `src/lib/trendEngine.js`). **EPI, PPI and FSI are shipped as pre-computed constants** in `src/data/terrapulseData.js` under `baseline_indices` — the formulas below are not currently executed against the 31-year series, and the animated map layer uses its own variant (see Module 2 note). Implementing the derivation is the primary outstanding work item.

   - **EPI (Environmental Pressure Index)**:
     $$EPI = 0.45 \cdot \text{Norm}(T2M\_MAX) + 0.35 \cdot \text{Norm}(AOD) + 0.20 \cdot (100 - \text{Norm}(NDVI))$$
   - **PPI (Population Pressure Index)**:
     $$PPI = 0.60 \cdot \text{Norm}(\text{PopDensity}) + 0.40 \cdot \text{Norm}(\text{TotalPopulation})$$
   - **FSI (Facility Shortage Index)**:
     $$FSI = 0.50 \cdot (100 - \text{Norm}(\text{HospBedsPer10k})) + 0.50 \cdot (100 - \text{Norm}(\text{PhysiciansPer10k}))$$
   - **WNI (Workforce Need Index)** with Bayesian Prior:
     $$WNI = \frac{N_0 \cdot WNI_0 + \sum_{k=1}^M \text{SurveyRiskScore}_k}{N_0 + M}$$
     where $N_0 = 15$ prior weight (equivalent to `sampleWeight = min(1, M/15)` in `computeWNIFromReports`, result clamped to $[10,100]$), and $WNI_0$ is the governorate cold-start prior actually shipped in `src/data/terrapulseData.js`: Cairo 58, Giza 65, Alexandria 52, Assiut 82, Aswan 90. $M$ is the survey count.

---

### Module 2: Geospatial & Visual Analytics Layer
- **Map Library**: `Leaflet.js` (v1.9.4)
- **Map Base**: CARTO Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`) with OpenStreetMap standard fallback.
- **Governorate Vector Polygons**: GeoJSON boundaries for Cairo, Giza, Alexandria, Assiut, and Aswan with dynamic choropleth shading based on selected metric or HNI score.
- **Known divergence — animated EPI layer**: `src/components/MapModule.jsx` computes its per-year map EPI inline as `0.50·Norm(EXTREME_HEAT_DAYS) + 0.30·Norm(T2M_MAX) + 0.20·Norm(AOD_550)`. This differs from the Module 1 specification, which weights `T2M_MAX`/`AOD`/`NDVI` at `0.45/0.35/0.20` and omits heat days. The map layer therefore shows a heat-frequency-weighted exposure surface, not the specified EPI, and its PPI channel applies an undocumented linear population-growth ramp. Reconciling `MapModule.jsx` with the engine is an open item; the KPI strip, matcher, and policy brief use the shipped `baseline_indices` instead.
- **Chart Library**: `Chart.js` (v4.4.1)
  - Time-series mode toggle: Raw NASA values vs. Deseasonalized Anomaly.
  - Trend line overlay: OLS regression line with confidence intervals.
  - Dual-axis support: Temperature vs. Vegetation / AOD.

---

### Module 3: Specialty Impact Matcher Engine
Multi-Criteria Decision Analysis (MCDA) linking NASA environmental exposures with clinical epidemiology across 8 medical specialties:

| Specialty | Key NASA Drivers | Socio-Demographic Drivers | Scientific Clinical Justification |
|---|---|---|---|
| **Pulmonology & Chest** (صدرية) | AOD / Dust (0.50), Heat (0.20) | Low Facilities (0.20), Density (0.10) | Chronic dust storm exposure and PM2.5 in Upper Egypt & Delta triggers severe asthma and COPD. |
| **Emergency & Critical Care** (طوارئ) | Extreme Heat $T2M\_MAX$ (0.45), AOD (0.15) | Facility Shortage (0.25), Density (0.15) | Heat stroke, acute cardiovascular decompensation during heatwaves. |
| **Cardiology** (قلب وأوعية) | Extreme Heat (0.40), AOD (0.30) | Facility Shortage (0.20), Density (0.10) | Combined thermal stress and particulate pollution exacerbate ischemic heart disease. |
| **Nephrology & Dialysis** (كلى) | Extreme Heat (0.50), Soil Drought (0.20) | Facility Shortage (0.20), Density (0.10) | Chronic dehydration in Upper Egypt (Aswan, Assiut) drives acute kidney injury and nephrolithiasis. |
| **Pediatrics** (أطفال) | AOD (0.35), Heat (0.25) | Facility Shortage (0.25), Pop Density (0.15) | Infant vulnerability to airborne particulate matter and heat dehydration. |
| **OB/GYN** (نساء وتوليد) | Facility Shortage (0.40), Heat (0.20) | Pop Density (0.25), AOD (0.15) | High birth rate in rural/Upper Egypt with acute obstetrical bed shortages. |
| **Family Medicine** (طب أسرة) | Facility Shortage (0.40), Pop Density (0.30) | Heat (0.15), AOD (0.15) | Primary healthcare backbone in underserved governorates. |
| **General Surgery** (جراحة عامة) | Facility Shortage (0.50), Pop Density (0.30) | Heat (0.10), AOD (0.10) | Severe emergency surgery and trauma coverage gaps outside Cairo/Alex. |

---

### Module 4: In-Page Physician Survey & Reactive State
- **Storage**: In-browser `localStorage` key `terrapulse_reports` (set in `src/App.jsx`; the 45 `survey_seed` records are the fallback when the key is absent).
- **Pre-seeded Dataset**: 45 authentic Egyptian physician responses distributed across the 5 governorates.
- **Reactivity**: Adding a new response triggers immediate re-computation of $WNI$, recalculation of $HNI$, and animated updates across all charts, map tooltips, and ranking tables.

---

### Module 5: What-If Policy Intervention Simulator
Allows health ministers and governorate leadership to model real-world interventions:
1. **Primary Healthcare Clinics & Mobile Convoys** ($0 \dots 50$ units, UI default 15): decreases Facility Shortage Index, up to $-22$ FSI points at the cap.
2. **Specialty Retention Stipend** ($0\% \dots 100\%$ bonus, UI default 40): decreases Workforce Need Index and migration risk, up to $-28$ WNI points at the cap.
3. **Urban Greening & Heat Mitigation** ($0\% \dots 30\%$ canopy coverage, UI default 10): reduces Environmental Pressure Index, up to $-12$ EPI points at the cap.

The governorate PPI enters the simulated composite unchanged (`simulatePolicyInterventions` takes `basePpi` explicitly), so $\Delta HNI$ reflects the real population pressure of the selected governorate rather than a fixed constant.
- Displays real-time delta: $\Delta HNI = HNI_{\text{simulated}} - HNI_{\text{baseline}}$ and projected lives impacted.

#### 5.1 Exact model, coefficients and units

Everything the simulator computes, in `src/lib/trendEngine.js::simulatePolicyInterventions`:

| Quantity | Formula | Units | Source of the constant |
|---|---|---|---|
| $\Delta FSI$ | $(\text{clinics} / 50) \times 22$ | index points | `22` = cap at 50 units |
| $\Delta WNI$ | $(\text{stipend} / 100) \times 28$ | index points | `28` = cap at 100 % |
| $\Delta EPI$ | $(\text{greening} / 30) \times 12$ | index points | `12` = cap at 30 % |
| $HNI_{sim}$ | $0.35\,EPI_{sim} + 0.30\,PPI + 0.20\,FSI_{sim} + 0.15\,WNI_{sim}$ | index (0–100) | `HNI_WEIGHTS` |
| $\Delta HNI$ | $HNI_{sim} - HNI_{base}$ | index points | — |
| Prevented admissions / month | $\text{clinics}\times34 + \text{stipend}\times11 + \text{greening}\times18$ | patient-visits averted per month | `ADMISSIONS_MODEL` |
| Projected retention gain | $\text{stipend}\times0.45 + \text{clinics}\times0.20$ | percentage points of the workforce retained | `RETENTION_MODEL` |

Each simulated sub-index is clamped from below at `Math.max(10, …)`; prevented admissions at `Math.max(0, …)`; retention gain at `Math.min(85, Math.max(0, …))`. All outputs are rounded to 1 decimal (integers for the two derived counts).

Input handling: a non-finite lever (undefined/NaN from a reset component) coerces to `0`; a non-finite baseline coerces to `NEUTRAL_INDICES`. Levers are **not** range-clamped inside the engine — the sliders in `DecisionMaker.jsx` own the ranges, and the model is defined to extrapolate linearly beyond them, with the sub-index floor and the retention ceiling as the only guards.

#### 5.2 Assumptions and limitations (read before quoting any number)

- These coefficients are **planning heuristics authored for this project**, not parameters estimated from an Egyptian health dataset. Nothing here is fitted, cross-validated, or causal.
- Each lever is linear and independent: doubling clinics doubles the FSI reduction and never touches EPI or WNI. Real interventions interact, saturate and take years to land; this model has no time dimension and assumes the full effect is instant.
- Population Pressure Index is held constant — the simulator never models a policy changing migration-driven population pressure.
- Baseline EPI/PPI/FSI are shipped as pre-computed constants (`src/data/terrapulseData.js`), so a simulation moves the composite score only; the underlying satellite series and charts are unchanged.
- "Prevented admissions" and "retention gain" are illustrative projections. They must not be presented as proven causal effects, validated forecasts, or evaluated policy outcomes.
- The UI states this limit explicitly: `DecisionMaker.jsx` renders a "model assumptions" disclosure under the sub-index bars, and the translations mark the outputs as simulated, not observed.
- Contract tests for every row of the table above live in `src/lib/trendEngine.test.mjs` under *"What-If simulator contract"*.

---

### Module 6: Executive Policy Brief & 1-Page PDF Export
- Leverages native CSS `@media print` rules.
- Strips navigation, interactive widgets, and background canvases to output a clean, high-contrast, black-and-teal executive report ready for decision-makers and Space Apps judges.

---

## 4. Canonical Data Schema (`src/data/terrapulseData.js` for the React app; `legacy/data.json` for the pipeline and legacy build)

Two physical copies of this schema exist and are maintained independently: `pipeline/fetch_nasa_data.py` regenerates only the `legacy/` artifacts, while `src/data/terrapulseData.js` is hand-maintained and differs in governorate `lat`/`lng` (manually nudged to polygon centroids for marker placement). That duplication is a decision, not an accident, and `src/data/terrapulseData.parity.test.mjs` enforces its boundary: the copies must be value-for-value identical everywhere except those ten coordinates, so silent drift between what the pipeline produces and what the app renders fails the build's test step.

```typescript
interface TerraPulseDatabase {
  metadata: {
    dataset_version: string;
    start_year: number; // 1995
    end_year: number;   // 2025
    generated_at: string;
    sources: {
      nasa_power: string;
      merra2: string;
      modis: string;
      gldas: string;
      sedac_capmas_who: string;
    };
  };
  governorates: Record<string, GovernorateRecord>;
  survey_seed: PhysicianSurveyResponse[];
}

interface GovernorateRecord {
  id: string; // "cairo" | "giza" | "alexandria" | "assiut" | "aswan"
  name_en: string;
  name_ar: string;
  lat: number;
  lng: number;
  demographics: {
    population: number;
    area_km2: number;
    density_per_km2: number;
    physicians_per_10k: number;
    hospital_beds_per_10k: number;
  };
  baseline_indices: {
    epi: number; // 0 - 100
    ppi: number; // 0 - 100
    fsi: number; // 0 - 100
    wni_prior: number; // 0 - 100
    hni: number; // 0 - 100
  };
  series: {
    years: number[]; // [1995, 1996, ..., 2025] (length 31)
    T2M: number[]; // Mean Temp (°C)
    T2M_MAX: number[]; // Max Summer Temp (°C)
    EXTREME_HEAT_DAYS: number[]; // Days > 40°C
    RH2M: number[]; // Relative Humidity (%)
    ALLSKY_SFC_SW_DWN: number[]; // Solar Radiation (MJ/m²/day)
    AOD_550: number[]; // MERRA-2 Aerosol Optical Depth
    NDVI: number[]; // MODIS Vegetation Index (0.0 - 1.0)
    LST_DAY: number[]; // MODIS Land Surface Temp (°C)
    SOIL_MOISTURE: number[]; // GLDAS Root Zone Soil Moisture (kg/m²)
  };
}
```

---

## 5. Architectural Quality Standards & Non-Negotiables

1. **Zero Placeholders & Zero `TODO`s**:
   All 31 years of data (1995–2025) across all 5 governorates are populated with verified scientific figures.
2. **Sub-Millisecond Execution**:
   Statistical calculations ($n=31$) must complete in $< 1\text{ms}$ per series, ensuring zero lag during interactive slider manipulation.
3. **Graceful Degradation**:
   If network fails or satellite APIs time out, the local bundle operates without error.
4. **Accessible Bi-Directional Design**:
   Proper `dir="rtl"` layout, ARIA labels, semantic markup, and WCAG AA contrast.

---
*Architectural Blueprint Approved by CTO, WhiteRoom Labs.*
