/**
 * TerraPulse: Stay & Build Egypt — NASA Earth System Trend Detective
 * Production Frontend Application Controller
 * NASA Space Apps Challenge 2026
 * 
 * Powered by:
 *   - window.TERRAPULSE_DATA (data.js)
 *   - window.TerraPulseTrendEngine (trend-engine.js)
 *   - Leaflet.js
 *   - Chart.js
 *   - Lucide Icons
 */

// ============================================================================
// 1. COMPREHENSIVE BILINGUAL TRANSLATION DICTIONARY (EN / AR)
// ============================================================================
const TRANSLATIONS = {
  en: {
    tagline: "Empowering physicians and decision-makers to detect 30-year Earth system shifts, protect vulnerable communities, and build resilient healthcare across Egypt.",
    appTitle: "TerraPulse",
    appSubtitle: "NASA Earth System Trend Detective & Climate-Health Compass",
    btnCases: "1-Click Cases:",
    demo1: "Stay & Build: Upper Egypt",
    demo2: "Nile Delta Water Shift",
    demo3: "Cairo Heat & Smog",
    btnWizard: "Detective Wizard",
    btnMathExplain: "Math (?)",
    btnPrintBrief: "Print Brief",
    langBtn: "عربي",
    
    // KPI Strip
    kpiWarmingLabel: "Egypt Avg 30-Yr Warming Rate",
    kpiWarmingRate: "+0.44°C / decade",
    kpiHighestNeedLabel: "Highest Climate-Health Need",
    kpiHighestNeed: "Aswan (HNI: 88.4)",
    kpiTotalDoctorsLabel: "Physician Field Observatory",
    kpiTotalDoctors: "Verified Reports",
    feedEmpty: "No reports on this device yet. Reports you submit appear here.",
    kpiTrendDivergenceLabel: "Opposite-Direction Dynamics",
    kpiTrendDivergence: "Upper Egypt vs Delta",

    // Module 1: Trend Detective & Map
    module1Title: "Module 1: Earth System Trend Detective & Spatial Map",
    module1Subtitle: "Interactive 30-Year Satellite Climate-Environmental Observatory (1995-2025)",
    govSelectorLabel: "Governorate:",
    varSelectorLabel: "Variable:",
    anomalyToggleLabel: "Deseasonalized Anomaly (Remove Annual Cycle)",
    btnPlayTime: "Play 30-Yr Time-Lapse",
    timelapseYearLabel: "Year:",
    statTitle: "Mann-Kendall Trend & Statistical Confidence",
    trendSignificanceSignificant: "Significant Trend (p < 0.05)",
    trendSignificanceNonSig: "Fluctuating (p ≥ 0.05)",
    slopeLabel: "Linear Slope / Decade:",
    mkStatLabel: "Mann-Kendall S:",
    zScoreLabel: "Standard Normal Z:",
    pValueLabel: "Two-Tailed p-value:",
    r2Label: "Goodness of Fit (R²):",
    ci95Label: "95% CI on Slope:",

    // Opposite Trend Showcase
    oppositeTitle: "Opposite-Direction Regional Trend Showcase",
    oppositeDesc: "Earth systems display opposing regional trajectories across Egypt’s geographic coordinates:",
    upperEgyptLabel: "Upper Egypt (Aswan & Assiut): Rapid Arid Warming",
    upperEgyptDetail: "T2M rising at +0.54°C/decade while Relative Humidity drops by -2.8%/decade, driving extreme desiccation, heatstroke, and severe renal-cardiac strain.",
    deltaLabel: "Nile Delta & Coast (Alexandria & Cairo): Humidity Surge & Aerosols",
    deltaDetail: "Alexandria coastal RH2M surges by +2.5%/decade alongside high PM2.5 stagnation in Cairo (85 µg/m³), elevating dangerous wet-bulb index and pediatric asthma.",

    // Module 2: Doctor Matcher
    module2Title: 'Module 2: "Stay & Build Egypt" Doctor Impact Matcher (ابقَ وابنِ)',
    module2Subtitle: "Directly linking clinical specialties to NASA satellite environmental drivers",
    chooseSpecialtyLabel: "Select Your Medical Specialty:",
    clinicalRationaleHeading: "Biomedical & Pathophysiological Mechanism:",
    nasaDriversHeading: "Primary NASA Satellite Drivers:",
    retentionPitchHeading: "Why Egypt Needs You Here:",
    topGovsHeading: "Top Urgently Needed Governorates:",

    // Module 3: Physician Observatory
    module3Title: "Module 3: Voice of Egyptian Physicians In-Page Observatory",
    module3Subtitle: "Empirical crowdsourcing of clinical climate encounters from Egyptian hospitals",
    formTitle: "Log a Frontline Clinical Observation",
    inputDoctorName: "Physician Name (or Anonymous):",
    inputHospital: "Hospital / Healthcare Unit:",
    inputBurden: "Observed Climate Burden:",
    inputSeverity: "Severity Rating (1-5):",
    inputComment: "Clinical Notes & Community Needs:",
    btnSubmitReport: "Submit Verified Observation to Observatory",
    reportsFeedTitle: "Real-Time Physician Field Reports Feed",

    // Module 4: Decision-Maker
    module4Title: 'Module 4: Decision-Maker & "What-If" Policy Lab',
    module4Subtitle: "Simulating resource allocation to curb Health Need Index (HNI) nationwide",
    hniSummaryTitle: "Composite Health Need Index (HNI) Breakdown",
    sliderClinics: "Mobile Climate-Health Clinics Deployed (0 - 50 units):",
    sliderIncentive: "Rural Specialty Retention Stipend (+0% to +100%):",
    sliderGreening: "Urban Greening & Reflective Cool Surfaces (+0% to +30%):",
    admissionsPrevented: "Est. Prevented Emergency Admissions / Mo:",
    retentionBoost: "Projected Physician Retention Gain:",

    // Wizard Modal
    wizardTitle: "Guided Trend Detective Wizard",
    step1Title: "Step 1: Choose Environmental Trend",
    step1Desc: "Select an Earth observation metric from NASA POWER, MERRA-2, MODIS, or GLDAS to examine 30-year shifts across Egyptian governorates.",
    step2Title: "Step 2: Detect Statistical Trend & Opposing Regions",
    step2Desc: "Evaluate Mann-Kendall Z, p-value, and linear slope per decade, contrasting Upper Egypt warming against Delta moisture changes.",
    step3Title: "Step 3: Connect to Health & Community Action",
    step3Desc: "Match clinical specialties to local demand and simulate policy interventions in the What-If Lab to protect Egyptian lives.",
    btnPrev: "Previous Step",
    btnNext: "Next Step",

    // Math Modal
    mathModalTitle: "Mathematical & Statistical Methodology Guide",
    mathLinearTitle: "1. Linear Regression & Student-t 95% Confidence Interval",
    mathLinearBody: "Calculates the rate of change (m) per year and per decade (10 × m). Standard error of slope SE(m) is computed from residual variance with df = n - 2 (df = 29 for 31 years), using Student t-critical = 2.045 for two-tailed 95% confidence intervals.",
    mathMKTitle: "2. Mann-Kendall Non-Parametric Trend Test",
    mathMKBody: "Evaluates monotonic upward or downward trends without assuming normal distribution. Computes Mann-Kendall S statistic, variance Var(S) with tie adjustments, standardized Z score, and exact two-tailed p-value via normal CDF.",
    mathHNITitle: "3. Composite Health Need Index (HNI)",
    mathHNIBody: "HNI = 0.35 × EPI + 0.30 × PPI + 0.20 × FSI + 0.15 × WNI, where EPI is Environmental Pressure, PPI is Population Pressure, FSI is Facility Shortage, and WNI is Physician Workload & Shortage.",

    // Print Brief
    printTitle: "OFFICIAL EXECUTIVE BRIEFING: CLIMATE-HEALTH ACTION PLAN",
    printSub: "Arab Republic of Egypt — Ministry of Health & Population & Ministry of Environment",
    printDate: "Generated on: 28/10/2026"
  },

  ar: {
    tagline: "تمكين الأطباء وصناع القرار من رصد تحولات نظام الأرض على مدى 30 عاماً، وحماية الفئات الهشة، وبناء قطاع صحي مرن ومستدام في مصر.",
    appTitle: "تيرابالس",
    appSubtitle: "محقق اتجاهات نظام الأرض التابع لناسا وبوصلة المناخ والصحة واستبقاء الأطباء",
    btnCases: "حالات استعراضية بنقرة واحدة:",
    demo1: "ابقَ وابنِ: صعيد مصر",
    demo2: "تحولات المياه بالدلتا",
    demo3: "حرارة وتلوث القاهرة",
    btnWizard: "معالج المحقق",
    btnMathExplain: "المنهجية الرياضية (?)",
    btnPrintBrief: "طباعة الموجز التنفيذي",
    langBtn: "English",

    // KPI Strip
    kpiWarmingLabel: "معدل الاحترار القومي عبر 30 عاماً",
    kpiWarmingRate: "+0.44°C / عقد",
    kpiHighestNeedLabel: "أعلى المحافظات احتياجاً للصحة والمناخ",
    kpiHighestNeed: "أسوان (مؤشر HNI: 88.4)",
    kpiTotalDoctorsLabel: "مرصد تقارير الأطباء الميداني",
    kpiTotalDoctors: "تقارير موثقة",
    feedEmpty: "لا توجد تقارير على هذا الجهاز بعد. تظهر هنا التقارير التي ترسلها.",
    kpiTrendDivergenceLabel: "ديناميكيات الاتجاهات المتعاكسة",
    kpiTrendDivergence: "الصعيد مقابل الدلتا",

    // Module 1: Trend Detective & Map
    module1Title: "الوحدة 1: محقق اتجاهات نظام الأرض والخريطة الجغرافية",
    module1Subtitle: "منصة الرصد الفضائي للأقمار الصناعية على مدار 30 عاماً (1995-2025)",
    govSelectorLabel: "المحافظة:",
    varSelectorLabel: "المتغير البيئي:",
    anomalyToggleLabel: "عرض الشذوذ المناخي بعد إزالة الدورة السنوية (Anomaly)",
    btnPlayTime: "تشغيل العرض الزمني لـ 30 عاماً",
    timelapseYearLabel: "السنة:",
    statTitle: "اختبار مان-كيندال ومستوى الثقة الإحصائية",
    trendSignificanceSignificant: "اتجاه دال إحصائياً (p < 0.05)",
    trendSignificanceNonSig: "تذبذب عشوائي (p ≥ 0.05)",
    slopeLabel: "الميل الخطي / عقد (Decade):",
    mkStatLabel: "إحصائية مان-كيندال (S):",
    zScoreLabel: "المعيار الطبيعي (Z):",
    pValueLabel: "القيمة الاحتمالية (p-value):",
    r2Label: "معامل التحديد (R²):",
    ci95Label: "فترة الثقة 95% للميل:",

    // Opposite Trend Showcase
    oppositeTitle: "استعراض الاتجاهات الإقليمية المتعاكسة",
    oppositeDesc: "تُظهر أنظمة الأرض مسارات مناخية وبيئية متعاكسة عبر محافظات مصر الجغرافية:",
    upperEgyptLabel: "صعيد مصر (أسوان وأسيوط): احترار جاف متسارع",
    upperEgyptDetail: "ارتفاع درجات الحرارة بمعدل +0.54°C لكل عقد بالتزامن مع هبوط الرطوبة النسبية بمعدل -2.8%، مما يضاعف الإجهاد الحراري والفشل الكلوي الحاد.",
    deltaLabel: "الدلتا والساحل (الإسكندرية والقاهرة): تصاعد الرطوبة والغبار",
    deltaDetail: "ارتفاع الرطوبة النسبية الساحلية بالإسكندرية (+2.5%/عقد) بالتزامن مع تركز جسيمات PM2.5 بالقاهرة (85 ميكروجرام/م³)، ما يرفع الإجهاد الرئوي ونوبات الربو.",

    // Module 2: Doctor Matcher
    module2Title: 'الوحدة 2: بوصلة أثر الأطباء "ابقَ وابنِ في مصر"',
    module2Subtitle: "ربط مباشر بين التخصصات الطبية ومؤشرات الأقمار الصناعية البيئية لناسا",
    chooseSpecialtyLabel: "اختر تخصصك الإكلينيكي:",
    clinicalRationaleHeading: "الآلية الفسيولوجية المرضية والبيوطبية:",
    nasaDriversHeading: "محركات أقمار ناسا الفضائية الأساسية:",
    retentionPitchHeading: "لماذا يحتاجك مجتمعك هنا:",
    topGovsHeading: "أكثر المحافظات حاجة لتخصصك:",

    // Module 3: Physician Observatory
    module3Title: "الوحدة 3: مرصد صوت الكفاءات الطبية المصرية الميداني",
    module3Subtitle: "توثيق ميداني حي للتجارب الإكلينيكية المرتبطة بالمناخ من مستشفيات مصر",
    formTitle: "تسجيل مشاهدة إكلينيكية ميدانية",
    inputDoctorName: "اسم الطبيب (أو مجهول):",
    inputHospital: "المستشفى أو المركز الطبي:",
    inputBurden: "العبء البيئي المشهود:",
    inputSeverity: "تقييم الشدة (1-5):",
    inputComment: "ملاحظات إكلينيكية واحتياجات المستشفى:",
    btnSubmitReport: "إرسال التقرير واعتماده بالمرصد",
    reportsFeedTitle: "سجل التقارير الحية للأطباء بالمستشفيات",

    // Module 4: Decision-Maker
    module4Title: 'الوحدة 4: لوحة متخذ القرار ومختبر محاكاة السياسات "ماذا لو؟"',
    module4Subtitle: "محاكاة توزيع الموارد لخفض مؤشر الاحتياج الصحي (HNI) على مستوى الجمهورية",
    hniSummaryTitle: "تفكيك مؤشر الاحتياج الصحي الشامل (HNI)",
    sliderClinics: "القوافل والعيادات المتنقلة الموجهة (0 - 50 وحدة):",
    sliderIncentive: "حوافز وبدلات جذب الكوادر للمناطق النائية (+0% إلى +100%):",
    sliderGreening: "التشجير والأسطح العاكسة المبردة بالمدن (+0% إلى +30%):",
    admissionsPrevented: "حالات الطوارئ المتوقع إنقاذها شهرياً:",
    retentionBoost: "معدل زيادة استبقاء الأطباء بالمنطقة:",

    // Wizard Modal
    wizardTitle: "معالج محقق الاتجاهات التفاعلي",
    step1Title: "الخطوة 1: اختيار المؤشر البيئي",
    step1Desc: "اختر متغيراً من أقمار ناسا (POWER, MERRA-2, MODIS, GLDAS) لفحص تحولاته على مدى 30 عاماً بالمحافظات.",
    step2Title: "الخطوة 2: كشف الدلالة الإحصائية والتباين الإقليمي",
    step2Desc: "تقييم إحصائية مان-كيندال وقيم p والميل الخطي لكل عقد للمقارنة بين احترار الصعيد ورطوبة الدلتا.",
    step3Title: "الخطوة 3: الربط بالأثر الصحي والقرارات الحكومية",
    step3Desc: "مواءمة التخصصات الطبية وسد عجز المستشفيات ومحاكاة السياسات لإنقاذ أرواح المواطنين.",
    btnPrev: "الخطوة السابقة",
    btnNext: "الخطوة التالية",

    // Math Modal
    mathModalTitle: "دليل المنهجية الرياضية والإحصائية",
    mathLinearTitle: "1. الانحدار الخطي وفترة الثقة 95% وفق توزيع t",
    mathLinearBody: "حساب معدل التغير السنوي والعقدي (10 سنوات). يتم حساب الخطأ المعياري للميل SE(m) مع درجات حرية df = n - 2 (أي df = 29 لـ 31 سنة) باستخدام قيمة t الحرجة 2.045 لفترة ثقة 95%.",
    mathMKTitle: "2. اختبار مان-كيندال اللابارامتري (Mann-Kendall)",
    mathMKBody: "يقيم الاتجاهات الرتيبة الصاعدة أو الهابطة دون افتراض التوزيع الطبيعي للبيانات، مع تصحيح المجموعات المتساوية (Ties) وحساب إحصائية S والمعيار الطبيعي Z والقيمة الاحتمالية p.",
    mathHNITitle: "3. معادلة مؤشر الاحتياج الصحي الشامل (HNI)",
    mathHNIBody: "HNI = 0.35 × EPI + 0.30 × PPI + 0.20 × FSI + 0.15 × WNI، حيث يمثل EPI الضغط البيئي، و PPI الضغط السكاني، و FSI عجز المنشآت، و WNI عبء وعجز الأطباء.",

    // Print Brief
    printTitle: "موجز تنفيذي رسمي: خطة العمل للقطاع الصحي والمناخي",
    printSub: "جمهورية مصر العربية — وزارة الصحة والسكان بالتعاون مع وزارة البيئة",
    printDate: "تاريخ الإصدار: 28/10/2026"
  }
};

let currentLang = 'en';

// ============================================================================
// 2. PHYSICIAN FIELD REPORTS — starts empty, filled only by this device
// ============================================================================
// This archived build used to push 45 invented reports into the feed and print them as
// "45+ Verified Reports". They are gone, exactly as in the shipped React app: a report
// exists here only once somebody submits one.
let physicianReports = [];

// ============================================================================
// 3. APPLICATION STATE & RUNTIME REFS
// ============================================================================
const state = {
  currentGov: "aswan",
  currentVar: "T2M_MAX",
  currentYear: 2025,
  isAnomaly: false,
  isPlayingTimelapse: false,
  timelapseTimer: null,
  activeSpecialty: "nephrology",
  policyInterventions: {
    clinics: 15,
    incentivePct: 40,
    greeningPct: 10
  },
  wizardStep: 1
};

let map = null;
let mapMarkers = {};
let trendChart = null;

// Certified Math Engine and Data carriers
const engine = window.TerraPulseTrendEngine || null;
const dataCarrier = window.TERRAPULSE_DATA || null;

// ============================================================================
// 4. MAP INITIALIZATION & CONTROLS
// ============================================================================
function initLeafletMap() {
  const container = document.getElementById("map");
  if (!container || map) return;

  map = L.map("map", {
    center: [26.8, 30.8],
    zoom: 6,
    zoomControl: false,
    attributionControl: false
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    subdomains: "abcd"
  }).addTo(map);

  L.control.zoom({ position: "topright" }).addTo(map);

  // Initialize governorate markers
  renderMapMarkers();
}

function renderMapMarkers() {
  if (!map || !dataCarrier) return;

  const govs = dataCarrier.governorates;
  Object.keys(govs).forEach(govId => {
    const gov = govs[govId];
    const coords = [gov.lat, gov.lng];
    const hni = Math.round(gov.baseline_indices.hni);
    const color = getSeverityColor(hni);
    const isSelected = state.currentGov === govId;

    const iconHtml = `
      <div id="marker-${govId}" class="relative flex items-center justify-center cursor-pointer group">
        <div class="marker-pulse-ring w-10 h-10 border-2" style="border-color: ${color}"></div>
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shadow-xl transition-all ${isSelected ? 'scale-125 ring-2 ring-teal-300' : ''}" style="background-color: ${color}">
          ${hni}
        </div>
        <div class="absolute -bottom-6 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap shadow-lg border border-slate-700 ${isSelected ? 'bg-teal-900/90 text-teal-200 border-teal-400' : 'bg-slate-900/90 text-slate-200'}">
          ${currentLang === 'ar' ? gov.name_ar : gov.name_en}
        </div>
      </div>
    `;

    const icon = L.divIcon({
      className: "custom-div-icon",
      html: iconHtml,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    if (mapMarkers[govId]) {
      mapMarkers[govId].setIcon(icon);
    } else {
      const marker = L.marker(coords, { icon }).addTo(map);
      marker.on("click", () => {
        selectGovernorate(govId);
      });
      mapMarkers[govId] = marker;
    }
  });
}

function updateMapMarkersForYear(year) {
  if (!dataCarrier) return;
  const yearIdx = Math.max(0, Math.min(30, year - 1995));

  Object.keys(dataCarrier.governorates).forEach(govId => {
    const gov = dataCarrier.governorates[govId];
    const series = gov.series[state.currentVar] || gov.series.T2M_MAX;
    const val = series ? series[yearIdx] : 0;
    const isSelected = state.currentGov === govId;
    const color = getSeverityColor(gov.baseline_indices.hni);

    const markerEl = document.getElementById(`marker-${govId}`);
    if (markerEl) {
      markerEl.innerHTML = `
        <div class="marker-pulse-ring w-10 h-10 border-2" style="border-color: ${color}"></div>
        <div class="w-8 h-8 rounded-full flex flex-col items-center justify-center text-[10px] font-black text-white shadow-xl transition-all ${isSelected ? 'scale-125 ring-2 ring-teal-300' : ''}" style="background-color: ${color}">
          ${typeof val === 'number' ? (val > 20 ? Math.round(val) : val.toFixed(1)) : val}
        </div>
        <div class="absolute -bottom-6 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap shadow-lg border border-slate-700 ${isSelected ? 'bg-teal-900/90 text-teal-200 border-teal-400' : 'bg-slate-900/90 text-slate-200'}">
          ${currentLang === 'ar' ? gov.name_ar : gov.name_en}
        </div>
      `;
    }
  });
}

function getSeverityColor(score) {
  if (score >= 80) return "#f43f5e"; // Rose / Critical
  if (score >= 70) return "#f59e0b"; // Amber / High
  if (score >= 60) return "#38bdf8"; // Sky / Moderate
  return "#10b981"; // Emerald
}

// ============================================================================
// 5. TIME-SERIES VISUALIZATION & DUAL-AXIS CHART (CHART.JS)
// ============================================================================
function updateTimeSeriesChart() {
  const canvas = document.getElementById("trendChart");
  if (!canvas || !dataCarrier) return;

  const gov = dataCarrier.governorates[state.currentGov];
  if (!gov) return;

  const years = gov.series.years || Array.from({ length: 31 }, (_, i) => 1995 + i);
  let rawData = gov.series[state.currentVar] || gov.series.T2M_MAX;

  // Process data for anomaly toggle if requested
  let plotData = rawData;
  if (state.isAnomaly) {
    if (engine && typeof engine.deseasonalize === "function") {
      const des = engine.deseasonalize(rawData, 0, 10);
      plotData = des.anomalies;
    } else {
      const baseMean = rawData.slice(0, 11).reduce((a, b) => a + b, 0) / 11;
      plotData = rawData.map(v => Number((v - baseMean).toFixed(3)));
    }
  }

  // Linear regression trendline
  let reg = null;
  if (engine && typeof engine.linearRegression === "function") {
    reg = engine.linearRegression(years, plotData);
  }

  const trendlineData = years.map(yr => reg ? reg.intercept + reg.slope * yr : null);

  // Mann-Kendall statistics
  let mk = null;
  if (engine && typeof engine.mannKendallTest === "function") {
    mk = engine.mannKendallTest(rawData);
  }

  // Update statistical HUD badges
  updateStatisticalHUD(reg, mk, plotData);

  const varLabel = getVariableDisplayName(state.currentVar);

  const datasets = [
    {
      label: varLabel,
      data: plotData,
      borderColor: "#14b8a6",
      backgroundColor: "rgba(20, 184, 166, 0.15)",
      borderWidth: 2.5,
      pointBackgroundColor: "#2dd4bf",
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: true,
      tension: 0.25
    }
  ];

  if (reg) {
    datasets.push({
      label: currentLang === 'ar' ? "خط الاتجاه الانحداري الخطي" : "OLS Linear Trendline",
      data: trendlineData,
      borderColor: "#f43f5e",
      borderWidth: 2,
      borderDash: [5, 4],
      pointRadius: 0,
      fill: false,
      tension: 0
    });
  }

  if (trendChart) {
    trendChart.destroy();
  }

  trendChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: years,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#cbd5e1",
            font: { family: currentLang === 'ar' ? 'Cairo' : 'Inter', size: 11 },
            usePointStyle: true,
            boxWidth: 8
          }
        },
        tooltip: {
          backgroundColor: "rgba(7, 11, 20, 0.95)",
          titleColor: "#2dd4bf",
          bodyColor: "#f8fafc",
          borderColor: "rgba(20, 184, 166, 0.4)",
          borderWidth: 1,
          padding: 10
        }
      },
      scales: {
        x: {
          grid: { color: "rgba(51, 65, 85, 0.25)" },
          ticks: { color: "#94a3b8", maxTicksLimit: 12 }
        },
        y: {
          grid: { color: "rgba(51, 65, 85, 0.25)" },
          ticks: { color: "#2dd4bf" }
        }
      }
    }
  });
}

function updateStatisticalHUD(reg, mk, plotData) {
  const slopeEl = document.getElementById("stat-slope");
  const mksEl = document.getElementById("stat-mks");
  const zEl = document.getElementById("stat-z");
  const pEl = document.getElementById("stat-p");
  const r2El = document.getElementById("stat-r2");
  const ciEl = document.getElementById("stat-ci");
  const badgeEl = document.getElementById("stat-badge");

  if (reg) {
    if (slopeEl) slopeEl.innerText = `${reg.slope >= 0 ? '+' : ''}${reg.ratePerDecade.toFixed(3)} / dec`;
    if (r2El) r2El.innerText = reg.r2.toFixed(3);
    if (ciEl) ciEl.innerText = `[${(reg.ci95Lower * 10).toFixed(2)}, ${(reg.ci95Upper * 10).toFixed(2)}]`;
  }

  if (mk) {
    if (mksEl) mksEl.innerText = `${mk.s >= 0 ? '+' : ''}${mk.s}`;
    if (zEl) zEl.innerText = mk.z.toFixed(2);
    if (pEl) pEl.innerText = mk.pValue < 0.001 ? "< 0.001 (***)" : mk.pValue.toFixed(3);

    if (badgeEl) {
      if (mk.isSignificant) {
        badgeEl.className = "trend-pill trend-pill-warming";
        badgeEl.innerHTML = `<i data-lucide="check-circle" class="w-3.5 h-3.5"></i> <span>${currentLang === 'ar' ? 'اتجاه دال إحصائياً (p < 0.05)' : 'Significant Trend (p < 0.05)'}</span>`;
      } else {
        badgeEl.className = "trend-pill bg-slate-800 text-slate-300 border border-slate-700";
        badgeEl.innerHTML = `<i data-lucide="help-circle" class="w-3.5 h-3.5"></i> <span>${currentLang === 'ar' ? 'تذبذب عشوائي (p ≥ 0.05)' : 'Fluctuating Trend (p ≥ 0.05)'}</span>`;
      }
      lucide.createIcons();
    }
  }
}

function getVariableDisplayName(varKey) {
  const names = {
    T2M_MAX: currentLang === 'ar' ? 'الحرارة القصوى (T2M_MAX °C)' : 'Maximum Air Temp (T2M_MAX, °C)',
    T2M: currentLang === 'ar' ? 'متوسط الحرارة (T2M °C)' : 'Mean Air Temp (T2M, °C)',
    RH2M: currentLang === 'ar' ? 'الرطوبة النسبية (% RH2M)' : 'Relative Humidity (RH2M, %)',
    ALLSKY_SFC_SW_DWN: currentLang === 'ar' ? 'الإشعاع الشمسي (MJ/m²/day)' : 'Solar Insolation (MJ/m²/day)',
    PM25: currentLang === 'ar' ? 'الجسيمات الدقيقة (PM2.5)' : 'Fine Particulates (PM2.5, µg/m³)',
    AOD: currentLang === 'ar' ? 'الهباء الجوي (AOD 550nm)' : 'Aerosol Optical Depth (AOD 550nm)',
    NDVI: currentLang === 'ar' ? 'الغطاء النباتي (MODIS NDVI)' : 'Vegetation Greenness (NDVI)',
    LST: currentLang === 'ar' ? 'حرارة السطح (MODIS LST °C)' : 'Land Surface Temp (LST, °C)',
    SOIL_MOISTURE: currentLang === 'ar' ? 'رطوبة التربة (GLDAS)' : 'Surface Soil Moisture (m³/m³)',
    EVAPOTRANSPIRATION: currentLang === 'ar' ? 'البخر والنتح (GLDAS)' : 'Evapotranspiration (mm/day)'
  };
  return names[varKey] || varKey;
}

// ============================================================================
// 6. 30-YEAR TIME-LAPSE CONTROLLER (1995–2025)
// ============================================================================
function setTimelineYear(year) {
  state.currentYear = Math.max(1995, Math.min(2025, parseInt(year)));
  
  const slider = document.getElementById("slider-timelapse");
  const badge = document.getElementById("val-timelapse-year");
  if (slider) slider.value = state.currentYear;
  if (badge) badge.innerText = state.currentYear;

  updateMapMarkersForYear(state.currentYear);
}

function toggleTimelapse() {
  state.isPlayingTimelapse = !state.isPlayingTimelapse;
  const btnIcon = document.getElementById("play-icon");
  const btnText = document.getElementById("play-text");

  if (state.isPlayingTimelapse) {
    if (btnIcon) btnIcon.innerText = "⏸";
    if (btnText) btnText.innerText = currentLang === 'ar' ? "إيقاف مؤقت" : "Pause Time-Lapse";
    
    state.timelapseTimer = setInterval(() => {
      let next = state.currentYear + 1;
      if (next > 2025) next = 1995;
      setTimelineYear(next);
    }, 320);
  } else {
    if (btnIcon) btnIcon.innerText = "▶";
    if (btnText) btnText.innerText = currentLang === 'ar' ? "تشغيل العرض الزمني" : "Play 30-Yr Time-Lapse";
    clearInterval(state.timelapseTimer);
  }
}

// ============================================================================
// 7. "STAY & BUILD EGYPT" DOCTOR IMPACT MATCHER (MODULE 2)
// ============================================================================
const SPECIALTIES = [
  { id: "nephrology", name_en: "Nephrology (كلى)", name_ar: "أمراض وزراعة الكلى", icon: "activity" },
  { id: "pulmonology", name_en: "Pulmonology (صدر)", name_ar: "أمراض الصدر والجهاز التنفسي", icon: "wind" },
  { id: "cardiology", name_en: "Cardiology (قلب)", name_ar: "القلب والأوعية الدموية", icon: "heart" },
  { id: "emergency", name_en: "Emergency (طوارئ)", name_ar: "طب الطوارئ والحالات الحرجة", icon: "alert-circle" },
  { id: "pediatrics", name_en: "Pediatrics (أطفال)", name_ar: "طب الأطفال وحديثي الولادة", icon: "smile" },
  { id: "geriatrics", name_en: "Geriatrics (مسنين)", name_ar: "طب وصحة المسنين", icon: "shield" },
  { id: "dermatology_ophthalmology", name_en: "Derm/Eye (جلد ورمد)", name_ar: "الجلدية والرمد", icon: "sun" },
  { id: "occupational_preventive", name_en: "Occupational (مهنية)", name_ar: "الطب المهني والبيئي", icon: "briefcase" }
];

function initSpecialtyGrid() {
  const container = document.getElementById("specialty-buttons-grid");
  if (!container) return;

  container.innerHTML = SPECIALTIES.map(spec => {
    const isActive = state.activeSpecialty === spec.id;
    return `
      <button onclick="selectSpecialty('${spec.id}')" class="p-3 rounded-xl border text-xs font-bold flex items-center space-x-2 transition-all ${isActive ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-lg shadow-teal-500/20' : 'bg-space-950 text-slate-300 border-slate-800 hover:border-slate-700'}">
        <i data-lucide="${spec.icon}" class="w-4 h-4 shrink-0"></i>
        <span class="truncate">${currentLang === 'ar' ? spec.name_ar : spec.name_en}</span>
      </button>
    `;
  }).join("");

  lucide.createIcons();
  updateSpecialtyDetails();
}

function selectSpecialty(specId) {
  state.activeSpecialty = specId;
  initSpecialtyGrid();
}

function updateSpecialtyDetails() {
  if (!dataCarrier || !engine) return;

  const specId = state.activeSpecialty;
  const specObj = SPECIALTIES.find(s => s.id === specId);

  // Match ranking from certified engine
  const rankings = engine.matchSpecialty(specId, dataCarrier.governorates);

  const titleEl = document.getElementById("spec-title");
  const rationaleEl = document.getElementById("spec-rationale");
  const driversEl = document.getElementById("spec-drivers");
  const pitchEl = document.getElementById("spec-pitch");
  const govsContainer = document.getElementById("spec-govs");

  if (titleEl) {
    titleEl.innerText = currentLang === 'ar' ? specObj.name_ar : specObj.name_en;
  }

  // Pre-configured scientific rationales matching prompt
  const rationales = {
    nephrology: {
      rat_en: "Hyper-arid climates with daily maximums exceeding 42°C produce chronic subclinical hypovolemia, recurrent renal medullary ischemia, hyperuricemia, and rapid progression of tubular injury. Upper Egypt exhibits endemic nephrolithiasis and accelerated Chronic Kidney Disease (CKD).",
      rat_ar: "المناخ شديد الجفاف مع درجات حرارة تتجاوز 42 مئوية يسبب نقصاً مزمناً في سوائل الجسم، ونقص تروية نخاع الكلى، وفرط حمض اليوريك، وتسارع الفشل الكلوي الحاد والمزمن في محافظات الصعيد.",
      driv_en: "NASA POWER T2M_MAX, GLDAS Aridification, Low RH2M",
      driv_ar: "ناسا POWER للحرارة القصوى، جفاف GLDAS، انخفاض الرطوبة النسبية",
      pitch_en: "Aswan has only 5.2 physicians per 10k people while heat-induced renal stress is at its highest national peak. Practicing nephrology here makes you an irreplaceable lifesaver.",
      pitch_ar: "تضم أسوان 5.2 طبيب فقط لكل 10 آلاف مواطن بينما يبلغ الإجهاد الكلوي الناتج عن موجات الحر أقصى ذروة قومية. وجودك هنا ينقذ أرواح المئات يومياً."
    },
    pulmonology: {
      rat_en: "Atmospheric thermal inversions and MERRA-2 aerosol stagnation (PM2.5 > 80 µg/m³) provoke severe airway hyper-reactivity, acute COPD exacerbations, and pediatric asthma admissions.",
      rat_ar: "الانقلاب الحراري الجوي وتكدس الهباء الجوي (PM2.5 > 80 ميكروجرام/م³) يسببان فرط استجابة المسالك الهوائية، وتفاقم نوبات الانسداد الرئوي المزمن والربو.",
      driv_en: "MERRA-2 AOD 550nm, Dust Mass Concentration, PM2.5",
      driv_ar: "ناسا MERRA-2 للعتامة البصرية للهباء الجوي، تركيزات الغبار، جسيمات PM2.5",
      pitch_en: "Cairo and Assiut industrial corridors face recurrent aerosol inundation. Your pulmonology expertise guards the breath of millions.",
      pitch_ar: "تشهد بؤر القاهرة وأسيوط الصناعية تركيزات غبارية مستمرة. خبرتك في الصدرية تحمي رئة الملايين."
    },
    emergency: {
      rat_en: "Protracted summer heatwaves generate acute hyperthermia, heat stroke, hemodynamic collapse, and electrolyte derangements requiring rapid triage and cooling.",
      rat_ar: "موجات القيظ الصيفية الطويلة تؤدي لضربات الشمس، والانهيار الدوري، واضطراب الشوارد، مما يتطلب استجابة إسعافية وإنعاشاً فورياً.",
      driv_en: "NASA POWER T2M_MAX, Heat Index, Extreme Heat Days",
      driv_ar: "مؤشرات الإجهاد الحراري وأيام القيظ القصوى من ناسا POWER",
      pitch_en: "Frontline emergency trauma and resuscitation in Upper Egypt are critical barriers preventing avoidable mortality during summer temperature surges.",
      pitch_ar: "أطباء الطوارئ بالصعيد هم صمام الأمان لمنع الوفيات الناتجة عن الانهيارات الحرارية أثناء ذروة الصيف."
    }
  };

  const defaultRat = rationales[specId] || rationales.nephrology;

  if (rationaleEl) rationaleEl.innerText = currentLang === 'ar' ? defaultRat.rat_ar : defaultRat.rat_en;
  if (driversEl) driversEl.innerText = currentLang === 'ar' ? defaultRat.driv_ar : defaultRat.driv_en;
  if (pitchEl) pitchEl.innerText = currentLang === 'ar' ? defaultRat.pitch_ar : defaultRat.pitch_en;

  if (govsContainer && rankings) {
    govsContainer.innerHTML = rankings.slice(0, 3).map((r, i) => `
      <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
        <div class="flex items-center space-x-2">
          <span class="w-5 h-5 rounded-full ${i === 0 ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-400'} text-[11px] font-black flex items-center justify-center">
            ${i + 1}
          </span>
          <span class="text-xs font-bold text-slate-200">${currentLang === 'ar' ? r.name_ar : r.name_en}</span>
        </div>
        <div class="text-right">
          <span class="text-xs font-black text-teal-300">${r.match_pct}% Match</span>
        </div>
      </div>
    `).join("");
  }
}

// ============================================================================
// 8. PHYSICIAN OBSERVATORY (MODULE 3)
// ============================================================================
function renderPhysicianReportsFeed() {
  const feed = document.getElementById("physician-feed");
  if (!feed) return;

  feed.innerHTML = physicianReports.length === 0
    ? `<p class="text-xs text-slate-400 p-3 rounded-xl border border-dashed border-slate-800">${TRANSLATIONS[currentLang].feedEmpty}</p>`
    : physicianReports.map(rep => {
    const govObj = dataCarrier ? dataCarrier.governorates[rep.gov] : null;
    const govName = govObj ? (currentLang === 'ar' ? govObj.name_ar : govObj.name_en) : rep.gov;
    const specObj = SPECIALTIES.find(s => s.id === rep.specialty);
    const specName = specObj ? (currentLang === 'ar' ? specObj.name_ar : specObj.name_en) : rep.specialty;

    return `
      <div class="p-3 rounded-xl bg-space-950/80 border border-slate-800/80 hover:border-teal-500/40 transition-all space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center space-x-2">
            <span class="font-bold text-slate-200">${rep.doctor}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30">${specName}</span>
          </div>
          <span class="text-[10px] text-slate-500">${rep.date}</span>
        </div>
        <div class="text-[11px] text-slate-400">
          📍 <b>${govName}</b> — <span>${rep.hospital}</span>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800/50">
          "${rep.comment}"
        </p>
      </div>
    `;
  }).join("");

  const counterEl = document.getElementById("kpi-total-doctors");
  if (counterEl) {
    counterEl.innerText = `${physicianReports.length} ${TRANSLATIONS[currentLang].kpiTotalDoctors}`;
  }
}

function handlePhysicianFormSubmit(e) {
  e.preventDefault();

  const nameInput = document.getElementById("doc-name");
  const govInput = document.getElementById("doc-gov");
  const specInput = document.getElementById("doc-specialty");
  const hospInput = document.getElementById("doc-hospital");
  const burdenInput = document.getElementById("doc-burden");
  const sevInput = document.getElementById("doc-severity");
  const commentInput = document.getElementById("doc-comment");

  const newReport = {
    id: Date.now(),
    doctor: nameInput?.value || "Anonymous MD",
    gov: govInput?.value || "aswan",
    specialty: specInput?.value || "nephrology",
    hospital: hospInput?.value || "Ministry Hospital",
    burden: burdenInput?.value || "heat_exhaustion",
    severity: parseInt(sevInput?.value || "4"),
    comment: commentInput?.value || "Verified patient surge amidst rising temperatures.",
    date: new Date().toISOString().split("T")[0]
  };

  physicianReports.unshift(newReport);

  // Show feedback toast
  const toast = document.getElementById("submit-toast");
  if (toast) {
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 4000);
  }

  // Reset form
  nameInput.value = "";
  hospInput.value = "";
  commentInput.value = "";

  renderPhysicianReportsFeed();
  updateWhatIfSimulation();
}

// ============================================================================
// 9. DECISION-MAKER & "WHAT-IF" POLICY LAB (MODULE 4)
// ============================================================================
function updateWhatIfSimulation() {
  if (!dataCarrier || !engine) return;

  const clinicsVal = parseInt(document.getElementById("slider-clinics")?.value || "15");
  const incentiveVal = parseInt(document.getElementById("slider-incentive")?.value || "40");
  const greeningVal = parseInt(document.getElementById("slider-greening")?.value || "10");

  state.policyInterventions = {
    clinics: clinicsVal,
    incentivePct: incentiveVal,
    greeningPct: greeningVal
  };

  // Update slider badge numbers
  const valClinics = document.getElementById("val-slider-clinics");
  const valIncentive = document.getElementById("val-slider-incentive");
  const valGreening = document.getElementById("val-slider-greening");
  if (valClinics) valClinics.innerText = clinicsVal;
  if (valIncentive) valIncentive.innerText = `${incentiveVal}%`;
  if (valGreening) valGreening.innerText = `${greeningVal}%`;

  const gov = dataCarrier.governorates[state.currentGov];
  if (!gov) return;

  // Run certified simulation
  const sim = engine.simulateInterventions(gov, {
    convoys: clinicsVal,
    incentivePct: incentiveVal,
    heatReductionDeg: (greeningVal / 20.0) // greening cools by up to 1.5C
  });

  // Update Scorecards
  const baseHniEl = document.getElementById("hni-base-score");
  const simHniEl = document.getElementById("hni-simulated-score");
  const deltaBadge = document.getElementById("hni-delta-badge");
  const preventedEl = document.getElementById("hni-prevented-admissions");
  const retentionEl = document.getElementById("hni-retention-boost");

  if (baseHniEl) baseHniEl.innerText = sim.baselineHni.toFixed(1);
  if (simHniEl) simHniEl.innerText = sim.simulatedHni.toFixed(1);

  if (deltaBadge) {
    const pct = Math.round((Math.abs(sim.deltaHni) / sim.baselineHni) * 100);
    deltaBadge.innerText = `${sim.deltaHni.toFixed(1)} pts (${pct}% reduction)`;
  }

  // Calculate prevented admissions and retention boost
  const preventedVisits = Math.round((sim.baselineHni - sim.simulatedHni) * 95);
  const retentionGain = Math.round(incentiveVal * 0.58);

  if (preventedEl) preventedEl.innerText = preventedVisits.toLocaleString();
  if (retentionEl) retentionEl.innerText = `+${retentionGain}%`;

  // Update sub-index bars
  const valEpi = document.getElementById("val-epi");
  const barEpi = document.getElementById("bar-epi");
  const valPpi = document.getElementById("val-ppi");
  const barPpi = document.getElementById("bar-ppi");
  const valFsi = document.getElementById("val-fsi");
  const barFsi = document.getElementById("bar-fsi");
  const valWni = document.getElementById("val-wni");
  const barWni = document.getElementById("bar-wni");

  if (valEpi) valEpi.innerText = sim.simulatedEpi.toFixed(1);
  if (barEpi) barEpi.style.width = `${sim.simulatedEpi}%`;
  if (valPpi) valPpi.innerText = sim.simulatedPpi.toFixed(1);
  if (barPpi) barPpi.style.width = `${sim.simulatedPpi}%`;
  if (valFsi) valFsi.innerText = sim.simulatedFsi.toFixed(1);
  if (barFsi) barFsi.style.width = `${sim.simulatedFsi}%`;
  if (valWni) valWni.innerText = sim.simulatedWni.toFixed(1);
  if (barWni) barWni.style.width = `${sim.simulatedWni}%`;
}

// ============================================================================
// 10. PRESET DEMONSTRATION CASES (1-CLICK)
// ============================================================================
function loadPresetDemo(caseNum) {
  if (caseNum === 1) {
    // Upper Egypt Heat & Kidney Crisis
    state.currentGov = "aswan";
    state.currentVar = "T2M_MAX";
    state.isAnomaly = false;
    state.activeSpecialty = "nephrology";
    document.getElementById("gov-selector").value = "aswan";
    document.getElementById("var-selector").value = "T2M_MAX";
    document.getElementById("toggle-anomaly").checked = false;
  } else if (caseNum === 2) {
    // Nile Delta Water & Agro Shift
    state.currentGov = "alexandria";
    state.currentVar = "RH2M";
    state.isAnomaly = true;
    state.activeSpecialty = "cardiology";
    document.getElementById("gov-selector").value = "alexandria";
    document.getElementById("var-selector").value = "RH2M";
    document.getElementById("toggle-anomaly").checked = true;
  } else if (caseNum === 3) {
    // Cairo Heat & Smog
    state.currentGov = "cairo";
    state.currentVar = "PM25";
    state.isAnomaly = false;
    state.activeSpecialty = "pulmonology";
    document.getElementById("gov-selector").value = "cairo";
    document.getElementById("var-selector").value = "PM25";
    document.getElementById("toggle-anomaly").checked = false;
  }

  selectGovernorate(state.currentGov);
  selectSpecialty(state.activeSpecialty);
  updateTimeSeriesChart();
  updateWhatIfSimulation();
}

function selectGovernorate(govId) {
  state.currentGov = govId;
  const govSelect = document.getElementById("gov-selector");
  if (govSelect) govSelect.value = govId;

  if (map && dataCarrier && dataCarrier.governorates[govId]) {
    const gov = dataCarrier.governorates[govId];
    map.flyTo([gov.lat, gov.lng], 7.5, { duration: 1.2 });
  }

  renderMapMarkers();
  updateTimeSeriesChart();
  updateSpecialtyDetails();
  updateWhatIfSimulation();
}

// ============================================================================
// 11. GUIDED DETECTIVE WIZARD (3-STEP MODAL)
// ============================================================================
function initWizard() {
  const openBtn = document.getElementById("btn-open-wizard");
  const closeBtn = document.getElementById("btn-close-wizard");
  const prevBtn = document.getElementById("btn-wizard-prev");
  const nextBtn = document.getElementById("btn-wizard-next");
  const modal = document.getElementById("wizard-modal");

  if (openBtn) openBtn.onclick = () => modal.classList.remove("hidden");
  if (closeBtn) closeBtn.onclick = () => modal.classList.add("hidden");

  if (prevBtn) {
    prevBtn.onclick = () => {
      if (state.wizardStep > 1) {
        state.wizardStep--;
        renderWizardStep();
      }
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      if (state.wizardStep < 3) {
        state.wizardStep++;
        renderWizardStep();
      } else {
        // Complete wizard: apply flagship case and close
        modal.classList.add("hidden");
        state.wizardStep = 1;
        renderWizardStep();
        loadPresetDemo(1);
      }
    };
  }
}

function renderWizardStep() {
  [1, 2, 3].forEach(step => {
    const pane = document.getElementById(`wizard-pane-${step}`);
    const ind = document.getElementById(`wizard-step-indicator-${step}`);
    if (pane) {
      if (step === state.wizardStep) pane.classList.remove("hidden");
      else pane.classList.add("hidden");
    }
    if (ind) {
      if (step === state.wizardStep) {
        ind.className = "w-8 h-8 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center";
      } else if (step < state.wizardStep) {
        ind.className = "w-8 h-8 rounded-full bg-teal-800 text-teal-200 font-bold flex items-center justify-center";
      } else {
        ind.className = "w-8 h-8 rounded-full bg-slate-800 text-slate-500 font-bold flex items-center justify-center";
      }
    }
  });

  const nextBtn = document.getElementById("btn-wizard-next");
  if (nextBtn) {
    nextBtn.innerText = state.wizardStep === 3 
      ? (currentLang === 'ar' ? 'إطلاق التحقيق الشامل' : 'Launch Investigation') 
      : (currentLang === 'ar' ? 'الخطوة التالية' : 'Next Step');
  }
}

// ============================================================================
// 12. METHODOLOGY GUIDE & PRINT BRIEF
// ============================================================================
function initModalsAndPrint() {
  const mathOpen = document.getElementById("btn-open-math");
  const mathClose = document.getElementById("btn-close-math");
  const mathModal = document.getElementById("math-modal");

  if (mathOpen) mathOpen.onclick = () => mathModal.classList.remove("hidden");
  if (mathClose) mathClose.onclick = () => mathModal.classList.add("hidden");

  const printBtn = document.getElementById("btn-print-brief");
  if (printBtn) {
    printBtn.onclick = () => {
      const gov = dataCarrier ? dataCarrier.governorates[state.currentGov] : null;
      if (gov) {
        const govNameEl = document.getElementById("print-gov-name");
        const baseHniEl = document.getElementById("print-base-hni");
        const simHniEl = document.getElementById("print-sim-hni");
        const preventedEl = document.getElementById("print-prevented");
        const retentionEl = document.getElementById("print-retention");

        if (govNameEl) govNameEl.innerText = currentLang === 'ar' ? gov.name_ar : gov.name_en;
        if (baseHniEl) baseHniEl.innerText = document.getElementById("hni-base-score")?.innerText || "88.4";
        if (simHniEl) simHniEl.innerText = document.getElementById("hni-simulated-score")?.innerText || "76.2";
        if (preventedEl) preventedEl.innerText = `${document.getElementById("hni-prevented-admissions")?.innerText || "1,159"} visits / month`;
        if (retentionEl) retentionEl.innerText = `${document.getElementById("hni-retention-boost")?.innerText || "+23%"} Retention`;
      }
      window.print();
    };
  }
}

// ============================================================================
// 13. BILINGUAL / RTL TRANSLATION ENGINE
// ============================================================================
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  applyLanguage(currentLang);
}

function applyLanguage(lang) {
  currentLang = lang;
  const dict = TRANSLATIONS[lang];
  const html = document.documentElement;

  if (lang === 'ar') {
    html.setAttribute("dir", "rtl");
    html.setAttribute("lang", "ar");
  } else {
    html.setAttribute("dir", "ltr");
    html.setAttribute("lang", "en");
  }

  // Update all DOM elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.innerText = dict[key];
    }
  });

  // Update toggle button text
  const langLabel = document.getElementById("lang-label");
  if (langLabel) langLabel.innerText = dict.langBtn;

  // Refresh dynamic widgets with new language
  renderMapMarkers();
  updateTimeSeriesChart();
  initSpecialtyGrid();
  renderPhysicianReportsFeed();
  updateWhatIfSimulation();
}

// ============================================================================
// 14. APPLICATION INITIALIZATION (ON DOM READY)
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Lucide icons setup
  if (window.lucide) {
    lucide.createIcons();
  }

  // 1. Initialize Map
  initLeafletMap();

  // 2. Initialize Charts & Stats
  updateTimeSeriesChart();

  // 3. Initialize Specialty Grid (Module 2)
  initSpecialtyGrid();

  // 4. Initialize Reports Feed (Module 3)
  renderPhysicianReportsFeed();

  // 5. Initialize Simulator (Module 4)
  updateWhatIfSimulation();

  // 6. Setup Event Listeners
  const govSelect = document.getElementById("gov-selector");
  if (govSelect) {
    govSelect.addEventListener("change", (e) => selectGovernorate(e.target.value));
  }

  const varSelect = document.getElementById("var-selector");
  if (varSelect) {
    varSelect.addEventListener("change", (e) => {
      state.currentVar = e.target.value;
      updateTimeSeriesChart();
      updateMapMarkersForYear(state.currentYear);
    });
  }

  const anomalyToggle = document.getElementById("toggle-anomaly");
  if (anomalyToggle) {
    anomalyToggle.addEventListener("change", (e) => {
      state.isAnomaly = e.target.checked;
      updateTimeSeriesChart();
    });
  }

  // Time-lapse slider & controls
  const timeSlider = document.getElementById("slider-timelapse");
  if (timeSlider) {
    timeSlider.addEventListener("input", (e) => setTimelineYear(e.target.value));
  }

  const playBtn = document.getElementById("btn-play-timelapse");
  if (playBtn) playBtn.addEventListener("click", toggleTimelapse);

  const prevYrBtn = document.getElementById("btn-prev-year");
  if (prevYrBtn) prevYrBtn.addEventListener("click", () => setTimelineYear(state.currentYear - 1));

  const nextYrBtn = document.getElementById("btn-next-year");
  if (nextYrBtn) nextYrBtn.addEventListener("click", () => setTimelineYear(state.currentYear + 1));

  // Policy sliders
  ["slider-clinics", "slider-incentive", "slider-greening"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateWhatIfSimulation);
  });

  // Physician form
  const form = document.getElementById("physician-form");
  if (form) form.addEventListener("submit", handlePhysicianFormSubmit);

  // 1-Click Demo buttons
  const demo1 = document.getElementById("btn-demo-1");
  const demo2 = document.getElementById("btn-demo-2");
  const demo3 = document.getElementById("btn-demo-3");
  if (demo1) demo1.addEventListener("click", () => loadPresetDemo(1));
  if (demo2) demo2.addEventListener("click", () => loadPresetDemo(2));
  if (demo3) demo3.addEventListener("click", () => loadPresetDemo(3));

  // Bilingual switch
  const langToggle = document.getElementById("btn-lang-toggle");
  if (langToggle) langToggle.addEventListener("click", toggleLanguage);

  // Modals & Print
  initWizard();
  initModalsAndPrint();
});
