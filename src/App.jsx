import React, { lazy, Suspense, useState, useEffect, useMemo } from 'react';
import { Stethoscope, BarChart3, ShieldCheck } from 'lucide-react';
import Header from './components/Header';
import KpiStrip from './components/KpiStrip';
import OppositeTrends from './components/OppositeTrends';
import PrintBrief from './components/PrintBrief';
import Footer from './components/Footer';
import AtmosphericField from './components/AtmosphericField';
import SectionHeader from './components/SectionHeader';

const MapModule = lazy(() => import('./components/MapModule'));
const TrendChartModule = lazy(() => import('./components/TrendChartModule'));
const DecisionMaker = lazy(() => import('./components/DecisionMaker'));
const WizardModal = lazy(() => import('./components/WizardModal'));
const MathModal = lazy(() => import('./components/MathModal'));
const DbSyncModal = lazy(() => import('./components/DbSyncModal'));
const GovernorateCompare = lazy(() => import('./components/GovernorateCompare'));
const DoctorMatcher = lazy(() => import('./components/DoctorMatcher'));
const PhysicianObservatory = lazy(() => import('./components/PhysicianObservatory'));

import { ShimmerButton, Marquee } from './components/ui';
import WarmingStripes from './components/WarmingStripes';

import { TERRAPULSE_DATA } from './data/terrapulseData';
import { TRANSLATIONS } from './lib/translations';
import { computeWNIFromReports, computeHNI, WNI_PRIOR_DEFAULT } from './lib/trendEngine';
import { getSyncStatus, submitRemoteReport, fetchCommunityReports } from './lib/dbService';
import { scrollBehavior } from './lib/motionTokens';

function ModuleSkeleton({ className = 'h-72' }) {
  return (
    <div
      aria-hidden="true"
      className={`bento-card animate-pulse bg-slate-200/60 dark:bg-white/[0.04] ${className}`}
    />
  );
}

export default function App() {
  const [lang, setLang] = useState(() => {
    try {
      const urlLang = new URLSearchParams(window.location.search).get('lang');
      if (urlLang === 'ar' || urlLang === 'en') return urlLang;
      const saved = localStorage.getItem('terrapulse_lang');
      if (saved === 'ar' || saved === 'en') return saved;
    } catch {}
    return 'en';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('terrapulse_lang', lang);
    } catch {}
  }, [lang]);

  const [selectedGov, setSelectedGov] = useState(() => {
    try {
      const urlGov = new URLSearchParams(window.location.search).get('gov');
      if (urlGov && TERRAPULSE_DATA.governorates[urlGov]) return urlGov;
      const saved = localStorage.getItem('terrapulse_selected_gov');
      if (saved && TERRAPULSE_DATA.governorates[saved]) return saved;
    } catch {}
    return 'cairo';
  });
  useEffect(() => {
    try {
      if (selectedGov) localStorage.setItem('terrapulse_selected_gov', selectedGov);
      else localStorage.removeItem('terrapulse_selected_gov');
    } catch {}
  }, [selectedGov]);
  const [selectedVar, setSelectedVar] = useState('T2M_MAX');
  const [year, setYear] = useState(2025);
  const [mapMetric, setMapMetric] = useState('hni');
  const [isAnomaly, setIsAnomaly] = useState(false);
  const [activeTab, setActiveTab] = useState('detective');
  const [activeCase, setActiveCase] = useState(null);
  const [formSpecialty, setFormSpecialty] = useState('nephrology');

  const [isWizardOpen, setIsWizardOpen] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('modal') === 'wizard';
    } catch { return false; }
  });
  const [isMathOpen, setIsMathOpen] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('modal') === 'math';
    } catch { return false; }
  });
  const [isDbModalOpen, setIsDbModalOpen] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('modal') === 'db';
    } catch { return false; }
  });
  const [syncStatus, setSyncStatus] = useState(() => ({
    // Until the endpoint answers, nothing is claimed about it.
    state: 'pending'
  }));

  // Clean Lab theme state ('light' | 'dark')
  const [theme, setTheme] = useState(() => {
    try {
      const urlTheme = new URLSearchParams(window.location.search).get('theme');
      if (urlTheme === 'dark' || urlTheme === 'light') return urlTheme;
      const saved = localStorage.getItem('terrapulse_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'dark'; // Observatory default
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    try {
      localStorage.setItem('terrapulse_theme', theme);
    } catch {}
  }, [theme]);

  // App Data copy with dynamic updates
  const [appData, setAppData] = useState(() => JSON.parse(JSON.stringify(TERRAPULSE_DATA)));

  // Load verified physician reports with localStorage persistence
  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem('terrapulse_reports');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // An unreadable key means "no reports on this device", not an error state.
    }
    // Nothing is seeded. This list is this device's own submissions or nothing; the 45
    // invented reports the dataset used to carry here have been deleted.
    return [];
  });

  // Aggregated anonymized community reports across devices
  const [communityReports, setCommunityReports] = useState([]);

  // Fetch anonymized community reports once at startup
  useEffect(() => {
    let isMounted = true;
    fetchCommunityReports().then(remoteReports => {
      if (isMounted && Array.isArray(remoteReports) && remoteReports.length > 0) {
        setCommunityReports(remoteReports);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Ask the submission endpoint what it is, once at startup.
  useEffect(() => {
    let isMounted = true;
    getSyncStatus().then(result => {
      if (isMounted) setSyncStatus({ state: result.state, detail: result.detail });
    });
    return () => { isMounted = false; };
  }, []);

  const t = useMemo(() => TRANSLATIONS[lang] || TRANSLATIONS.en, [lang]);

  // Recalculate WNI & HNI whenever reports or communityReports change
  useEffect(() => {
    setAppData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const govs = next.governorates;
      const allReports = [...reports, ...communityReports];

      Object.keys(govs).forEach(govId => {
        const gov = govs[govId];
        // The prior must come from the immutable import, never from `gov`, because the
        // line below writes `wni` back into the clone. Reading it back on the next
        // report would blend the previous *result* as if it were the prior, so the score
        // would drift with every submission in a session instead of depending only on n.
        // The shipped key is `wni_prior`; bare `wni` is what this effect publishes.
        const priorWni = TERRAPULSE_DATA.governorates[govId]?.baseline_indices?.wni_prior ?? WNI_PRIOR_DEFAULT;
        const totalCount = allReports.filter(r => (r.gov || r.governorate) === govId).length;
        if (totalCount === 0) {
          // No field signal for this governorate: publish the prior and leave the
          // published HNI untouched. computeHNI(epi, ppi, fsi, wni_prior) reproduces the
          // shipped hni exactly, so this branch is an identity, not a shortcut.
          gov.baseline_indices.wni = priorWni;
          return;
        }
        const newWni = computeWNIFromReports(govId, allReports, priorWni);
        gov.baseline_indices.wni = newWni;

        const epi = gov.baseline_indices.epi;
        const ppi = gov.baseline_indices.ppi;
        const fsi = gov.baseline_indices.fsi;
        gov.baseline_indices.hni = computeHNI(epi, ppi, fsi, newWni);
      });

      return next;
    });
  }, [reports, communityReports]);

  // Local write is authoritative and happens first; the remote write is an extra that
  // reports its own outcome. Returns the remote state so the form can tell the truth.
  const handleAddReport = async (newReport) => {
    const updated = [newReport, ...reports];
    setReports(updated);
    try {
      localStorage.setItem('terrapulse_reports', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    const result = await submitRemoteReport(newReport);
    // A quota or policy refusal is a fact about this submission, not about the endpoint:
    // the next physician is not rate-limited by this one, and the posture modal would
    // otherwise start claiming writes are unavailable while the function is healthy and
    // accepting everyone else. Only a failure that describes the endpoint itself —
    // unreachable, absent, misconfigured — is allowed to change what the modal states.
    const aboutThisReport = result.state === 'rate_limited' || result.state === 'rejected';
    setSyncStatus(s => ({
      ...s,
      // A failed write changes the badge; a successful one does not. The badge describes
      // what the endpoint accepts, and the startup probe answers that — promoting it after
      // one 201 would claim a general capability from a single event, and there is no
      // read available to confirm it. The toast, driven by result.state, is where the
      // outcome of this particular report is reported.
      state: aboutThisReport || result.success ? s.state : result.state,
      detail: result.error || result.errors?.join('; ') || result.detail,
      lastResult: result.state,
      storedLocally: true
    }));
    return { state: result.state, storedLocally: true };
  };

  // 1-Click Demonstration Case Handler
  const handleApplyCase = (caseId) => {
    setActiveCase(caseId);
    if (caseId === 1) {
      // Case 1: Flagship Upper Egypt Heat & Kidney Crisis
      setSelectedGov('aswan');
      setSelectedVar('T2M_MAX');
      setYear(2025);
      setIsAnomaly(false);
      setMapMetric('hni');
      setActiveTab('detective');
    } else if (caseId === 2) {
      // Case 2: Nile Delta Water Shift
      setSelectedGov('alexandria');
      setSelectedVar('NDVI');
      setYear(2025);
      setIsAnomaly(true);
      setMapMetric('epi');
      setActiveTab('detective');
    } else if (caseId === 3) {
      // Case 3: Cairo Heat & Smog
      setSelectedGov('cairo');
      setSelectedVar('AOD_550');
      setYear(2025);
      setIsAnomaly(false);
      setMapMetric('wni');
      setActiveTab('detective');
    }
  };

  // Scroll spy to sync header activeTab with visible section
  useEffect(() => {
    const sectionIds = ['detective', 'doctor', 'physicians', 'decision'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 220;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(`section-${sectionIds[i]}`);
        if (el && el.offsetTop <= scrollPos) {
          setActiveTab(sectionIds[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentGovData = appData?.governorates?.[selectedGov] || null;

  const tickerItems = useMemo(() => {
    return lang === 'ar'
      ? [
          { title: 'مرصد ناسا POWER', desc: 'احترار 31 عاماً (+0.44°م)' },
          { title: 'ذروة أسوان الحرارية', desc: '46.2°م T2M_MAX' },
          { title: 'هباء جوي MERRA-2', desc: 'كثافة 0.44 AOD بالقاهرة' },
          { title: 'رادار دلتا النيل', desc: 'انحسار غطاء نباتي NDVI (-0.003/yr)' },
          { title: 'التحليل المرجعي الأكاديمي', desc: '3 دراسات أكاديمية محكّمة' },
          { title: 'مؤشر HNI الحرج', desc: 'أسوان 88.4 نقطة عجز' },
          { title: 'اختبار مان-كيندال', desc: 'Z=3.94 (ثقة 99.9%)' },
          { title: 'استبقاء الكوادر', desc: 'مكاسب متوقعة +18.4%' }
        ]
      : [
          { title: 'NASA POWER Telemetry', desc: '31-Yr Warming (+0.44°C)' },
          { title: 'Upper Egypt Peak', desc: 'Aswan 46.2°C T2M_MAX' },
          { title: 'MERRA-2 Particulates', desc: 'Cairo AOD 0.44' },
          { title: 'Nile Delta Radar', desc: 'Vegetative shift -0.003 NDVI/yr' },
          { title: 'Academic Meta-Synthesis', desc: '3 Peer-Reviewed Studies' },
          { title: 'Critical HNI Score', desc: 'Aswan 88.4 Index' },
          { title: 'Mann-Kendall Test', desc: 'Z=3.94 (p < 0.0001, 99.9% Conf)' },
          { title: 'Stay & Build Model', desc: 'Projected retention gain +18.4%' }
        ];
  }, [lang]);

  return (
    <div className={`min-h-screen flex flex-col bg-[color:var(--bg)] text-[color:var(--ink)] transition-colors duration-200 ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>
      
      {/* Official Government Print Brief Container */}
      <PrintBrief
        govData={currentGovData}
        selectedGov={selectedGov}
        year={year}
        selectedVar={selectedVar}
        reports={reports}
        allGovs={appData?.governorates}
        lang={lang}
        t={t}
      />

      {/* Main Top Header */}
      <Header
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        t={t}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWizard={() => setIsWizardOpen(true)}
      />

      {/* ===================================================================
          HERO: EARTH SYSTEM OBSERVATORY
          One atmospheric surface, one signal panel, one method note.
          =================================================================== */}
      <section className="relative overflow-hidden border-b border-[color:var(--line)]">
        <AtmosphericField theme={theme} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-field opacity-60" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-[color:var(--bg)]" />

        <div className="relative mx-auto w-full max-w-7xl px-3 pb-10 pt-10 sm:px-6 sm:pb-12 sm:pt-14 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">

            {/* Narrative */}
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2.5 font-mono text-2xs uppercase tracking-[0.14em] text-[color:var(--muted)]">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span dir="ltr">LINK NOMINAL</span>
                <span className="hidden h-3 w-px bg-[color:var(--line-strong)] sm:block" />
                <span dir="ltr">MODIS TERRA/AQUA · MERRA-2 · SEDAC</span>
                <span
                  dir="ltr"
                  className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 font-bold tracking-[0.22em] text-sky-600 dark:text-sky-300"
                >
                  TERRAMED PULSE
                </span>
              </div>

              <h1 className="mt-6 max-w-[22ch] font-display text-[clamp(2.15rem,5vw,3.9rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-[color:var(--ink)]">
                {t.heroMainTitle}
              </h1>

              <p className="mt-4 font-display text-sm font-medium tracking-[-0.01em] text-[color:var(--ink-2)] sm:text-base">
                {t.heroSubTitle}
              </p>

              <p className="mt-5 max-w-xl text-[14px] leading-[1.75] text-[color:var(--ink-2)] sm:text-[15px]">
                {lang === 'ar'
                  ? 'واحد وثلاثون عاماً من رصد ناسا للأرض، تتحول إلى خريطة سريرية تحدد أين يحتاج مرضى مصر أطباءهم أكثر — ثم تمنح الطبيب وصانع القرار أداة لاتخاذ القرار.'
                  : 'Thirty-one years of NASA Earth observation, resolved into a clinical map of where Egypt needs its physicians most — then handed to doctors and policy makers as a decision tool.'}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <ShimmerButton
                  onClick={() => {
                    setActiveTab('doctor');
                    const el = document.getElementById('section-doctor');
                    if (el) el.scrollIntoView({ behavior: scrollBehavior() });
                  }}
                  className="text-xs sm:text-sm"
                >
                  <Stethoscope className="h-4 w-4 text-sky-400" />
                  <span>{t.btnDoctorCta}</span>
                </ShimmerButton>

                <button
                  onClick={() => {
                    setActiveTab('decision');
                    const el = document.getElementById('section-decision');
                    if (el) el.scrollIntoView({ behavior: scrollBehavior() });
                  }}
                  className="apple-btn-secondary flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm"
                >
                  <BarChart3 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  <span>{t.btnDecisionCta}</span>
                </button>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-2xs uppercase tracking-[0.12em] text-[color:var(--muted)]" dir="ltr">
                <span>1995—2025</span>
                <span className="hidden h-3 w-px bg-[color:var(--line-strong)] sm:block" />
                <span>5 GOVERNORATES</span>
                <span className="hidden h-3 w-px bg-[color:var(--line-strong)] sm:block" />
                <span>9 NASA DATASETS</span>
                <span className="hidden h-3 w-px bg-[color:var(--line-strong)] sm:block" />
                <span>MANN-KENDALL p&lt;0.0001</span>
              </div>
            </div>

            {/* Climate signal instrument */}
            <div className="lg:col-span-5">
              <div className="panel-ticks relative overflow-hidden rounded-[18px] border border-[color:var(--line-strong)] bg-[color:var(--panel)]/72 p-5 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-mono text-2xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    CLIMATE SIGNAL
                  </span>
                  <span className="font-mono text-2xs tabular-nums text-[color:var(--muted)]" dir="ltr">
                    LST · 1995—2025
                  </span>
                </div>

                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <div dir="ltr" className="font-display text-[40px] font-semibold leading-none tracking-[-0.04em] text-[color:var(--ink)] rtl:text-right">
                      +3.7<span className="ml-1 text-lg font-normal text-[color:var(--muted)]">°C</span>
                    </div>
                    <div className="mt-1.5 text-micro text-[color:var(--muted)]">
                      {lang === 'ar' ? 'ارتفاع حرارة سطح الأرض' : 'Land surface warming'}
                    </div>
                  </div>
                  <span className="mb-1 rounded-full border border-[color:var(--line)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--muted)]" dir="ltr">
                    EGY MEAN
                  </span>
                </div>

                <div className="mt-5">
                  <WarmingStripes size="hero" />
                </div>

                <div className="mt-5 grid grid-cols-3 divide-x divide-[color:var(--line)] border-t border-[color:var(--line)] pt-4 text-center" dir="ltr">
                  {[
                    { v: '5', l: 'GOVERNORATES' },
                    { v: '31', l: 'YEARS' },
                    { v: '9', l: 'DATASETS' }
                  ].map(stat => (
                    <div key={stat.l} className="px-2">
                      <div className="telemetry-mono text-xl font-semibold tabular-nums text-[color:var(--ink)]">
                        {stat.v}
                      </div>
                      <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
                        {stat.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-3 text-right font-mono text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--muted)]" dir="ltr">
                SOURCE · NASA POWER / MODIS MOD11A2
              </p>
            </div>
          </div>

          {/* Method note */}
          <div className="mt-9 grid gap-3 border-t border-[color:var(--line)] pt-5 md:grid-cols-[1fr_auto] md:items-start">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
              <div className="space-y-1">
                <span className="block text-xs font-semibold text-[color:var(--ink)]">
                  {t.disclaimerTitle}
                </span>
                <p className="max-w-3xl text-[11.5px] leading-relaxed text-[color:var(--muted)]">
                  {t.disclaimerBody}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--muted)] md:justify-end" dir="ltr">
              <span className="rounded-full border border-[color:var(--line)] px-2 py-0.5">CONTEXTUAL ASSOCIATION</span>
              <span className="rounded-full border border-[color:var(--line)] px-2 py-0.5">NO CAUSAL CLAIM</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 w-full flex-1">
        
        {/* 21st.dev Live Satellite & Scientific Telemetry Ticker Marquee */}
        <div className="mb-8 flex items-stretch overflow-hidden rounded-full border border-[color:var(--line)] bg-[color:var(--panel)]/60 backdrop-blur-md">
          <div className="flex shrink-0 items-center gap-2 border-e border-[color:var(--line)] bg-[color:var(--accent-soft)] px-3.5 py-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-2xs font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
              {lang === 'ar' ? 'بث حي' : 'LIVE'}
            </span>
          </div>
          <Marquee duration={35} className="text-xs text-[color:var(--ink-2)]">
            {tickerItems.map((item, idx) => (
              <div key={idx} className="mx-4 flex items-center gap-2 whitespace-nowrap">
                <span className="text-[color:var(--muted)]">/</span>
                <span className="font-semibold text-[color:var(--ink)]">{item.title}:</span>
                <span className="tabular-nums text-[color:var(--muted)]">{item.desc}</span>
              </div>
            ))}
          </Marquee>
        </div>

        {/* Executive KPI Summary Strip */}
        <KpiStrip t={t} />

        {/* ===================================================================
            MODULE 1: EARTH SYSTEM TREND DETECTIVE & SPATIAL MAP
            =================================================================== */}
        <section id="section-detective" className="bento-card mb-8 space-y-6 p-5 sm:p-8">
          <SectionHeader
            index="01"
            title={t.module1Title}
            subtitle={t.module1Subtitle}
            meta={t.clickMarkerTip}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Map & 1995-2025 Scrubber (6 cols) */}
            <div className="lg:col-span-6">
              <Suspense fallback={<ModuleSkeleton className="h-[420px]" />}>
                <MapModule
                  data={appData}
                  selectedGov={selectedGov}
                  setSelectedGov={setSelectedGov}
                  selectedVar={selectedVar}
                  lang={lang}
                  t={t}
                  year={year}
                  setYear={setYear}
                  mapMetric={mapMetric}
                  setMapMetric={setMapMetric}
                />
              </Suspense>
            </div>

            {/* Right: Chart & Statistical Significance (6 cols) */}
            <div className="lg:col-span-6">
              <Suspense fallback={<ModuleSkeleton className="h-[420px]" />}>
                <TrendChartModule
                  govData={currentGovData}
                  selectedGov={selectedGov}
                  setSelectedGov={setSelectedGov}
                  selectedVar={selectedVar}
                  setSelectedVar={setSelectedVar}
                  allGovs={appData.governorates}
                  isAnomaly={isAnomaly}
                  setIsAnomaly={setIsAnomaly}
                  currentYear={year}
                  t={t}
                  lang={lang}
                  theme={theme}
                  onOpenMath={() => setIsMathOpen(true)}
                />
              </Suspense>
            </div>
          </div>
        </section>

        <Suspense fallback={<ModuleSkeleton className="h-80 mb-8" />}>
          <GovernorateCompare
            governorates={appData.governorates}
            lang={lang}
            t={t}
            onSelectGov={setSelectedGov}
          />
        </Suspense>

        {/* Opposite Trends Demonstration Showcase */}
        <OppositeTrends t={t} />

        {/* ===================================================================
            MODULE 2: DOCTOR IMPACT MATCHER (STAY & BUILD EGYPT)
            =================================================================== */}
        <Suspense fallback={<ModuleSkeleton className="h-[520px] mb-8" />}>
          <DoctorMatcher
            data={appData}
            lang={lang}
            t={t}
            onSelectGov={(id) => {
              setSelectedGov(id);
              setActiveTab('detective');
              const el = document.getElementById('section-detective');
              if (el) el.scrollIntoView({ behavior: scrollBehavior() });
            }}
            onVoiceNeeds={(govId, specId) => {
              setSelectedGov(govId);
              if (specId) setFormSpecialty(specId);
              setActiveTab('physicians');
              const el = document.getElementById('section-physicians');
              if (el) el.scrollIntoView({ behavior: scrollBehavior() });
            }}
          />
        </Suspense>

        {/* ===================================================================
            MODULE 3: HEALTHCARE WORKFORCE & PHYSICIAN RETENTION OBSERVATORY
            =================================================================== */}
        <Suspense fallback={<ModuleSkeleton className="h-[520px] mb-8" />}>
          <PhysicianObservatory
            selectedGov={selectedGov}
            onSelectGov={setSelectedGov}
            governorates={appData.governorates}
            lang={lang}
            t={t}
          />
        </Suspense>

        {/* ===================================================================
            MODULE 4: DECISION-MAKER & "WHAT-IF" POLICY LAB
            =================================================================== */}
        <Suspense fallback={<ModuleSkeleton className="h-[520px] mb-8" />}>
          <DecisionMaker
            govData={currentGovData}
            allGovs={appData.governorates}
            reports={reports}
            communityReports={communityReports}
            lang={lang}
            t={t}
            theme={theme}
          />
        </Suspense>

      </main>

      {/* Global Footer */}
      <Footer lang={lang} t={t} dataUpdated={TERRAPULSE_DATA.metadata?.generated_at} />

      {/* Modals */}
      {isWizardOpen && (
        <Suspense fallback={null}>
          <WizardModal
            isOpen={isWizardOpen}
            onClose={() => setIsWizardOpen(false)}
            lang={lang}
            t={t}
            onApplyPreset={handleApplyCase}
          />
        </Suspense>
      )}

      {isMathOpen && (
        <Suspense fallback={null}>
          <MathModal
            isOpen={isMathOpen}
            onClose={() => setIsMathOpen(false)}
            t={t}
          />
        </Suspense>
      )}

      {isDbModalOpen && (
        <Suspense fallback={null}>
          <DbSyncModal
            isOpen={isDbModalOpen}
            onClose={() => setIsDbModalOpen(false)}
            lang={lang}
            syncStatus={syncStatus}
          />
        </Suspense>
      )}

    </div>
  );
}
