# TerraPulse: Stay & Build Egypt — NASA Earth System Trend Detective
### ابقَ وابنِ — محقق اتجاهات نظام الأرض وبوصلة الأثر الصحي والبيئي في مصر

**NASA Space Apps Challenge 2026** — *Category: "Be An Earth System Trend Detective!"*  
*Developed with WhiteRoom Labs*

---

## 🌍 Executive Summary (الموجز التنفيذي)

**English:**  
Egypt stands at a critical climate and human capital crossroads. While global analyses often treat national climate warming as a uniform phenomenon, 30 years of NASA satellite Earth observations (1995–2025) reveal **starkly opposing regional trends** across Egypt’s geographic coordinates. In Upper Egypt (Aswan, Assiut), extreme daytime temperatures ($T_{2M\_MAX}$) are escalating at $+0.55^\circ\text{C}$ to $+0.72^\circ\text{C}$ per decade alongside rapid aridification (Relative Humidity dropping by $-2.8\%$/decade), triggering acute dehydration, heatstroke, and endemic renal/cardiovascular crises. Simultaneously, coastal Nile Delta regions (Alexandria) experience **increasing relative humidity** ($+2.5\%$/decade) coupled with fine particulate pollution ($PM_{2.5} > 85\,\mu\text{g/m}^3$) in Greater Cairo, sharply worsening wet-bulb respiratory stress and pediatric asthma.

Compounding this environmental divergence is Egypt's severe physician brain drain: over 50% of recent medical graduates seek opportunities abroad, leaving Upper Egypt with as few as **5.2 physicians per 10,000 residents** (compared to 16.5 in Cairo).

**TerraPulse ("Stay & Build Egypt" — ابقَ وابنِ)** bridges this gap. It acts as an interactive Earth System Trend Detective and public health compass that connects NASA satellite data directly to clinical demand, crowdsources verified physician field observations, and equips decision-makers with a "What-If" policy simulation lab to retain medical talent and protect vulnerable communities.

---

**العربية:**  
تقف مصر اليوم أمام منعطف حرج يجمع بين تسارع الأزمات المناخية وتحديات الحفاظ على الكوادر الطبية الوطنية. تكشف بيانات أقمار وكالة ناسا الفضائية عبر 30 عاماً (1995–2025) عن **اتجاهات إقليمية متضادة تماماً** بين أقاليم مصر المختلفة؛ ففي صعيد مصر (أسوان وأسيوط) يتسارع الاحترار الشديد بمعدل $+0.55$ إلى $+0.72$ درجة مئوية لكل عقد بالتزامن مع جفاف شديد، مسبباً موجات جفاف حاد وفشلاً كلوياً وإجهاداً قلبياً مميتاً. وفي المقابل، يشهد الساحل الشمالي والدلتا (الإسكندرية) **ارتفاعاً في الرطوبة النسبية** ممتزجاً مع ركود الجسيمات العالقة الدقيقة ($PM_{2.5}$) بالقاهرة، مما يضاعف أزمات الربو الشعبي عند الأطفال وإجهاد البصيلة الرطبة.

يتزامن ذلك مع هجرة الكوادر الطبية الشابة للخارج، مما أدى لعجز طبي حاد في الصعيد (5.2 طبيب لكل 10 آلاف مواطن بأسوان مقابل 16.5 بالقاهرة).

تأتي منصة **"تيرابالس: ابقَ وابنِ"** لتكون محققاً فضائياً تفاعلياً لاتجاهات الأرض وبوصلة للأثر الصحي؛ تربط قياسات أقمار ناسا باحتياجات التخصصات الطبية، وتستقبل بلاغات الأطباء الميدانية في الوقت الفعلي، وتتيح لصناع القرار محاكاة تدخلات السياسات لتوجيه الموارد واستبقاء الأطباء لحماية أرواح المصريين.

---

## 🛰️ NASA Earth Observation Datasets & Sensors

TerraPulse integrates multi-sensor NASA Earth observations covering the continuous 30-year baseline from 1995 to 2025:

| Dataset / Sensor | Variable Identifier | Spatial & Temporal Resolution | Public Health & Environmental Relevance |
|---|---|---|---|
| **NASA POWER** (CERES / MERRA-2) | `T2M`, `T2M_MAX` | 0.5° × 0.5°, Annual & Daily | Mean and extreme daily maximum temperatures driving acute heatwave mortality and hyperthermia. |
| **NASA POWER** | `RH2M` | 0.5° × 0.5°, Annual & Hourly | Near-surface relative humidity; determines human evaporative cooling thresholds and heat index. |
| **NASA POWER** | `ALLSKY_SFC_SW_DWN` | 0.5° × 0.5°, Annual Mean | Solar insolation (MJ/m²/day); ultraviolet exposure linked to photokeratitis, cataracts, and skin lesions. |
| **NASA MERRA-2** | `PM25`, `AOD` (`TOTEXTTAU`) | 0.5° × 0.625°, Assimilated | Respirable particulate matter $\le 2.5\,\mu\text{m}$ and aerosol optical depth driving COPD and asthma admissions. |
| **NASA MODIS Terra/Aqua** | `NDVI` (`MOD13A2`) | 1 km, 16-Day / Annual Synth | Normalized Difference Vegetation Index; monitors green space loss, urban encroachment, and aridity. |
| **NASA MODIS Terra/Aqua** | `LST` (`MOD11A2`) | 1 km, Daily / Annual Mean | Radiometric Land Surface Temperature tracking the Urban Heat Island (UHI) effect in concrete zones. |
| **NASA GLDAS Noah** | `SOIL_MOIST` (0-10cm) | 0.25° × 0.25°, Land Model | Topsoil moisture (kg/m²); controls drought intensity, dust detachment, and agricultural water deficit. |
| **NASA GLDAS Noah** | `ET` | 0.25° × 0.25°, Land Model | Evapotranspiration flux (kg/m²/day); hydrological indicator of regional water vapor loss. |
| **SEDAC CIESIN** | `POP_DENSITY`, Healthcare Beds | Gridded Population / Admin | Population density, hospital bed density per 100k, and baseline physician ratios per 10k residents. |

---

## 📐 Mathematical & Statistical Architecture

TerraPulse features an in-browser statistical calculation engine that executes non-parametric and parametric trend tests on demand with zero server roundtrips:

### 1. Ordinary Least Squares (OLS) Linear Regression & Student's t 95% Confidence Interval
$$\text{Slope } m = \frac{\sum_{i=1}^n (x_i - \bar{x})(y_i - \bar{y})}{\sum_{i=1}^n (x_i - \bar{x})^2}, \quad \text{Intercept } b = \bar{y} - m\bar{x}$$

$$\text{Slope per Decade} = 10 \times m$$

$$\text{Goodness of Fit } R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$$

The standard error of the slope $SE(m)$ is computed with $df = n - 2 = 29$ degrees of freedom ($n = 31$ years from 1995 to 2025):
$$SE(m) = \sqrt{\frac{\sum (y_i - \hat{y}_i)^2 / (n - 2)}{\sum (x_i - \bar{x})^2}}$$
$$95\% \text{ CI} = [m - 2.045 \times SE(m), \; m + 2.045 \times SE(m)]$$

### 2. Mann-Kendall Non-Parametric Monotonic Trend Test
Evaluates whether a monotonic upward or downward trend exists without assuming normality:
$$S = \sum_{k=1}^{n-1} \sum_{j=k+1}^n \text{sgn}(x_j - x_k)$$
where:
$$\text{sgn}(\theta) = \begin{cases} +1 & \text{if } \theta > 0 \\ 0 & \text{if } \theta = 0 \\ -1 & \text{if } \theta < 0 \end{cases}$$

Variance adjusted for tied groups $g$ with group sizes $t_p$:
$$\text{Var}(S) = \frac{n(n-1)(2n+5) - \sum_{p=1}^g t_p(t_p-1)(2t_p+5)}{18}$$

Standardized normal test statistic $Z$:
$$Z = \begin{cases} \frac{S - 1}{\sqrt{\text{Var}(S)}} & \text{if } S > 0 \\ 0 & \text{if } S = 0 \\ \frac{S + 1}{\sqrt{\text{Var}(S)}} & \text{if } S < 0 \end{cases}$$

Two-tailed $p$-value calculated via standard normal cumulative distribution function $\Phi(|Z|)$ using high-precision Horner polynomial approximation ($\epsilon < 1.5 \times 10^{-7}$):
$$p = 2 \times (1 - \Phi(|Z|))$$

### 3. Composite Health Need Index (HNI)
Quantifies localized climate-health urgency on a 0–100 scale:
$$\text{HNI} = 0.35 \times \text{EPI} + 0.30 \times \text{PPI} + 0.20 \times \text{FSI} + 0.15 \times \text{WNI}$$

- **EPI (Environmental Pressure Index):** Composite of normalized $T_{2M\_MAX}$, $PM_{2.5}$, $LST$, and inverted $NDVI$.
- **PPI (Population Pressure Index):** Composite of normalized Population Density and demographic vulnerability.
- **FSI (Facility Shortage Index):** $100 - \text{Normalized Hospital Capacity per 100k}$.
- **WNI (Physician Workload & Need Index):** $0.5 \times (100 - \text{Physicians per 10k normalized}) + 0.5 \times \text{Doctor Field Severity Score}$.

---

## 🏛️ System Modules

```
TerraPulse Architecture
│
├── Module 1: Earth System Trend Detective & Spatial Map
│   ├── Leaflet.js Interactive Egypt Map (5 Governorates: Cairo, Giza, Alex, Assiut, Aswan)
│   ├── Chart.js 30-Year Time Series with Linear Trendline & 95% Confidence Band
│   ├── Anomaly Mode Toggle (Baseline 1995-2005)
│   ├── Mann-Kendall Statistical Badges (S, Z, p-value, R², slope/decade)
│   └── Opposite-Direction Regional Trend Showcase (Upper Egypt vs Nile Delta)
│
├── Module 2: "Stay & Build Egypt" Doctor Impact Matcher (ابقَ وابنِ)
│   ├── 8 Medical Specialties (Pulmonology, Cardiology, Nephrology, ER, Pediatrics, Geriatrics, Derm/Eye, Occupational)
│   ├── Pathophysiological Rationale Linking NASA Data to Clinical Manifestations
│   ├── Ranked Governorate Need Recommendations
│   └── Career Retention & Fellowship Impact Pitch
│
├── Module 3: Voice of Egyptian Physicians In-Page Observatory
│   ├── Interactive Case Logging Form (Specialty, Governorate, Burden, Severity 1-5, Notes)
│   ├── 45 Pre-Seeded Realistic Egyptian Hospital Reports
│   └── Real-Time Recalculation of WNI and HNI via localStorage
│
├── Module 4: Decision-Maker & "What-If" Policy Lab
│   ├── HNI Sub-Index Breakdown (EPI, PPI, FSI, WNI)
│   ├── 3 Policy Levers: Mobile Clinics (0-50), Retention Stipends (0-100%), Urban Greening (0-30%)
│   ├── Simulated Impact: Projected HNI Drop, Prevented ER Visits, Retention Gains
│   └── 1-Click Printable Executive Briefing Document (@media print)
│
└── Modals & Presets
    ├── 3-Step Guided Trend Detective Wizard
    ├── Statistical Methodology & Math Explainer Modal (?)
    └── 3 One-Click Demonstration Cases (Upper Egypt Heat, Nile Delta Water, Cairo Smog)
```

---

## 🚀 Quickstart & Usage

### 1. Launch the Vite + React Application
The root `index.html` is the Vite **entry template** — it loads `/src/main.jsx` as an ES module, so opening it with a double-click renders a blank page. Serve it instead:
```bash
cd "/home/zer0/Desktop/Projects/Nasa project"

# Install dependencies (if not already installed)
npm install

# Start lightning-fast Vite development server with HMR
npm run dev

# Or build and preview the optimized production bundle
npm run build
npm run preview
```

> **What needs a network, and what does not.** The dataset, the statistical engine,
> Leaflet and its CSS, the governorate polygons, choropleth and every Chart.js chart are
> bundled — they work with the cable unplugged. Three things are fetched at runtime:
> the **Esri ArcGIS `World_Dark_Gray_Base` tile layer** (offline, the map keeps its polygons,
> markers, legend and time-lapse on a plain grid canvas and shows a "basemap unavailable"
> notice instead of retrying), the **Inter/Cairo webfonts** from Google Fonts (system-font
> fallback), and **Supabase** when you configure it. TerraPulse is offline-*capable*, not
> fully offline.
>
> **Cloud sync is optional and off by default.** With no `.env` the app runs in local-only
> mode on `localStorage`; nothing requests the network and the UI says so. To enable it:
> create a Supabase project, run `supabase/migrations/0001_init_physician_reports.sql`
> in the SQL Editor (the same SQL is copyable from the in-app *Cloud Database Sync* dialog),
> then set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (or
> `VITE_SUPABASE_PUBLISHABLE_KEY` — the same browser-safe value under the name newer
> Supabase dashboards print) — or enter them at runtime in that dialog.
>
> **What the migration actually allows.** Row Level Security is on, and the public
> `anon` key holds exactly one right: **INSERT a report**, with every value re-validated
> by the policy's `WITH CHECK`. It can never `SELECT`, `UPDATE` or `DELETE`, so a visitor
> cannot enumerate other physicians' submissions. The feed consequently shows this
> device's reports plus the embedded seed, and the status badge reads "cloud submits
> allowed, reads blocked" — which is the intended posture, not a failure. A shared
> cross-device feed needs Supabase Auth plus a read policy (commented `auth.uid()`
> template in the migration); that is a disclosure decision, not a config flag.
>
> Never put a service-role / secret key in `.env` or the dialog: Vite inlines every
> `VITE_*` value into the public bundle, and `dbService` refuses to use or store one.

### 2. Run the Full Verification Suite
`npm test` runs all six suites — the live React engine, the dataset drift gate, the Supabase/RLS contract gate, the legacy JS engine, and both Python suites:
```bash
cd "/home/zer0/Desktop/Projects/Nasa project"
npm test
```
Individual suites:
```bash
node src/lib/trendEngine.test.mjs            # 144 checks — the engine the app actually imports
node src/data/terrapulseData.parity.test.mjs #  23 checks — src/data vs legacy/data.json drift gate
node src/lib/rlsContract.test.mjs            # 103 checks — RLS policy vs. form/payload contract
node pipeline/test-legacy-engine.js          #  51 checks — legacy/trend-engine.js parity
python3 pipeline/test_trend_engine.py        #  12 checks — Python statistical engine
python3 pipeline/test_nasa_pipeline.py       #  82 checks — dataset artifacts & cross-runtime parity
```

> **Why the RLS contract gate exists.** The policy lives in SQL, in another directory,
> and is applied by hand, so nothing else in the repo can see it drift. Its `specialty`
> and `gov` value lists, its `char_length` caps and its column list are asserted against
> `src/lib/specialties.js`, `src/data/terrapulseData.js`, `PhysicianForm.jsx` and
> `dbService.js` — an out-of-date list would 400 a legitimate report in production.

> **Why the drift gate exists.** `pipeline/fetch_nasa_data.py` regenerates `legacy/data.json`
> only; `src/data/terrapulseData.js` is maintained by hand alongside it. The gate asserts the
> two copies are value-for-value identical **except** governorate `lat`/`lng`, which were
> deliberately nudged to polygon centroids for marker placement — and it fails if any other
> field, or any coordinate by more than a degree, diverges.

### 3. Run the NASA POWER Python Data Pipeline
The `pipeline/fetch_nasa_data.py` script queries the real NASA POWER API, computes statistical trends, and exports `data.json`, `data.js` and `embedded-data.js` into `legacy/` (the default `--out-dir`):
```bash
cd "/home/zer0/Desktop/Projects/Nasa project"

# Fetch live NASA POWER observations into legacy/
python3 pipeline/fetch_nasa_data.py

# Or regenerate from the bundled calibrated cache, with no network
python3 pipeline/fetch_nasa_data.py --offline
```

> **Note:** this pipeline refreshes the **legacy** dataset only. The React app reads
> `src/data/terrapulseData.js`, a separately maintained copy — re-running the pipeline does
> **not** update the application. That split is deliberate (the React file carries hand-nudged
> marker centroids), and the drift gate in suite 2 above is what keeps it honest.

---

## 🗂️ Project Directory Structure

```
/home/zer0/Desktop/Projects/Nasa project/
├── index.html                   # Vite entry template (loads /src/main.jsx; not double-clickable)
├── package.json                 # Vite + React 18, Tailwind, Lucide, Leaflet, Chart.js
├── vite.config.js               # Optimized Vite bundler configuration
├── tailwind.config.js           # Apple dark space theme tokens & typography
├── README.md                    # Bilingual documentation & architecture guide
├── SUBMISSION_COPY.md           # Copy-paste submission package (storyboard & 7-slide deck)
├── ARCHITECTURE.md              # System design, module contracts & index specification
├── TECHNICAL_SIGNOFF.md         # Mathematical audit & verification record
├── .env.example                 # Optional Supabase sync configuration
├── src/                         # ── THE SHIPPED REACT APPLICATION ──
│   ├── main.jsx                 # React root mount (bundles Leaflet CSS locally)
│   ├── App.jsx                  # Main application orchestrator & state manager
│   ├── index.css                # Apple Design fluid interactions, frosted glass, print styles
│   ├── data/
│   │   ├── terrapulseData.js    # Continuous 31-yr records & 45 realistic physician reports
│   │   ├── terrapulseData.parity.test.mjs # 23-check drift gate vs legacy/data.json
│   │   └── egyptGovernoratesGeoJson.js  # Official UN OCHA / geoBoundaries polygons
│   ├── lib/
│   │   ├── trendEngine.js       # OLS regression, Mann-Kendall, t-test, HNI/WNI & simulation
│   │   ├── trendEngine.test.mjs # 144-check suite for the live engine (npm test)
│   │   ├── chartAdapters.js     # Chart.js option/dataset builders per metric
│   │   ├── dbService.js         # Supabase telemetry with local-storage fallback
│   │   ├── rlsContract.test.mjs # 103-check gate: RLS policy vs. form & INSERT payload
│   │   ├── specialties.js       # Shared AR/EN specialty label registers
│   │   └── translations.js      # Full English & Arabic localization dictionaries
│   └── components/
│       ├── Header.jsx           # Apple-style segmented tabs, 1-click cases, language toggle
│       ├── KpiStrip.jsx         # Executive metrics with tabular-nums & glowing cards
│       ├── MapModule.jsx        # Watermark-free Leaflet map (Esri Dark) + 1995-2025 time-lapse
│       ├── TrendChartModule.jsx # 30-yr Chart.js series, anomaly toggle, Mann-Kendall badge
│       ├── OppositeTrends.jsx   # Upper Egypt arid warming vs Nile Delta humidity/aerosols
│       ├── DoctorMatcher.jsx    # "Stay & Build" 8-specialty clinical impact matcher
│       ├── PhysicianForm.jsx    # In-page clinical observation & migration intent form
│       ├── DecisionMaker.jsx    # What-If simulator & 3 executive Chart.js dashboards
│       ├── DbSyncModal.jsx      # Cloud telemetry status & configuration panel
│       ├── WizardModal.jsx      # 3-step Guided Trend Detective Wizard
│       ├── MathModal.jsx        # Mathematical & statistical methodology guide
│       ├── PrintBrief.jsx       # Official 1-page ministerial brief for @media print
│       └── Footer.jsx           # NASA mission credits & hackathon branding
├── supabase/
│   └── migrations/
│       └── 0001_init_physician_reports.sql  # Optional cloud schema (RLS on, INSERT-only anon)
├── pipeline/                    # ── PYTHON DATA PIPELINE (generates legacy/ artifacts only) ──
│   ├── fetch_nasa_data.py       # NASA POWER API fetcher & Mann-Kendall CLI pipeline
│   ├── trend_engine.py          # Python statistical engine (parity with legacy JS engine)
│   ├── test_nasa_pipeline.py    # 82-check artifact & cross-runtime parity suite
│   ├── test_trend_engine.py     # 12-check Python statistics suite
│   └── test-legacy-engine.js    # 51-check suite for legacy/trend-engine.js
└── legacy/                      # ── ARCHIVED PRE-REACT VANILLA BUILD (not shipped) ──
    ├── index.html               # Archived UI; does NOT run standalone (see note below)
    ├── app.js                   # Vanilla JS UI
    ├── styles.css               # Vanilla stylesheet
    ├── trend-engine.js          # Legacy statistical engine
    ├── data.json                # Golden 30-year NASA datasets (1995-2025)
    ├── data.js                  # Same dataset, ES module wrapper
    └── embedded-data.js         # Same dataset, window global for file:// use
```

> **Legacy status.** `legacy/` is kept for statistical parity against
> `pipeline/trend_engine.py` and as a record of the pre-React implementation — it is **not**
> a working demo. `legacy/index.html:969-970` load `data.js` and `trend-engine.js` with plain
> `<script src>` tags, but `trend-engine.js:808` ends in `export default _engine`, so the
> browser throws `SyntaxError: Unexpected token 'export'` and `app.js`'s two `TrendEngine`
> references never resolve. It also pulls Tailwind, Leaflet, Chart.js and Lucide from CDNs,
> so it is not offline-capable either. Both defects predate this cleanup and are unchanged by
> it; fixing them is out of scope because nothing ships from this directory. Relocating the
> files did repair one thing: `data.js`, `data.json`, `embedded-data.js`, `app.js` and
> `styles.css` previously sat at the repo root while the archive pointed at them by relative
> path, so it only resolved when served from the root. Serve it with `python3 -m http.server`
> from inside `legacy/` if you want to read the old UI.

---

## 🏆 NASA Space Apps 2026 Submission Highlights
- **100% Functional & Zero Placeholders:** Complete production-ready implementation with mathematically verified algorithms.
- **Deeply Human & Regionally Grounded:** Transforms abstract satellite pixels into clinical urgency, motivating Egyptian physicians to "Stay & Build".
- **Bilingual Arab-English Support:** True RTL layout and culturally authentic clinical terminology for Egypt's healthcare leadership.
- **Opposite Trend Discovery:** Demonstrates true Earth System Trend Detection by juxtaposing Upper Egypt desert warming with Nile Delta marine boundary moisture escalation.

---
*Developed for the 2026 NASA Space Apps Challenge by WhiteRoom Labs.*
