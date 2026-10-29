import React, { useState, useEffect, useMemo } from 'react';
import { Stethoscope, BarChart3, ShieldCheck, Sparkles } from 'lucide-react';
import Header from './components/Header';
import KpiStrip from './components/KpiStrip';
import MapModule from './components/MapModule';
import TrendChartModule from './components/TrendChartModule';
import OppositeTrends from './components/OppositeTrends';
import DoctorMatcher from './components/DoctorMatcher';
import PhysicianForm from './components/PhysicianForm';
import DecisionMaker from './components/DecisionMaker';
import WizardModal from './components/WizardModal';
import MathModal from './components/MathModal';
import DbSyncModal from './components/DbSyncModal';
import PrintBrief from './components/PrintBrief';
import Footer from './components/Footer';

import { TERRAPULSE_DATA } from './data/terrapulseData';
import { TRANSLATIONS } from './lib/translations';
import { computeWNIFromReports, computeHNI, WNI_PRIOR_DEFAULT } from './lib/trendEngine';
import { getDbConfig, fetchRemoteReports, submitRemoteReport, SYNC_STATE } from './lib/dbService';

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
    } catch {}
    return 'aswan';
  });
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
  const [dbConfig, setDbConfig] = useState(() => getDbConfig());
  const [syncStatus, setSyncStatus] = useState(() => ({
    // Until the first probe answers, nothing is claimed about the cloud.
    state: dbConfig.isConfigured ? 'pending' : SYNC_STATE.LOCAL,
    reportsSynced: 0
  }));

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
      // fallback to seed
    }
    return TERRAPULSE_DATA.survey_seed || [];
  });

  // Sync remote crowdsourced reports from Supabase if configured. The result is
  // published to `syncStatus` so the UI can say what actually happened; a failed
  // read is never displayed as "cloud synced".
  useEffect(() => {
    let isMounted = true;
    async function syncRemote() {
      if (!dbConfig.isConfigured) {
        setSyncStatus({ state: SYNC_STATE.LOCAL, reportsSynced: 0 });
        return;
      }
      const result = await fetchRemoteReports();
      if (!isMounted) return;
      setSyncStatus({ state: result.state, detail: result.detail, error: result.error, reportsSynced: 0 });
      if (result.state !== SYNC_STATE.OK) return;

      const remote = result.rows;
      if (remote.length === 0) return;

      setReports(prev => {
        const map = new Map();
        remote.forEach(r => { if (r && r.id) map.set(r.id, r); });
        prev.forEach(r => { if (r && r.id && !map.has(r.id)) map.set(r.id, r); });
        const merged = Array.from(map.values());
        try {
          localStorage.setItem('terrapulse_reports', JSON.stringify(merged));
        } catch {}
        setSyncStatus(s => ({ ...s, reportsSynced: merged.length - prev.length }));
        return merged;
      });
    }
    syncRemote();
    return () => { isMounted = false; };
  }, [dbConfig]);

  const t = useMemo(() => TRANSLATIONS[lang] || TRANSLATIONS.en, [lang]);

  // Recalculate WNI & HNI whenever reports change
  useEffect(() => {
    setAppData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const govs = next.governorates;

      Object.keys(govs).forEach(govId => {
        const gov = govs[govId];
        // The prior must come from the immutable import, never from `gov`, because the
        // line below writes `wni` back into the clone. Reading it back on the next
        // report would blend the previous *result* as if it were the prior, so the score
        // would drift with every submission in a session instead of depending only on n.
        const priorWni = TERRAPULSE_DATA.governorates[govId]?.baseline_indices?.wni ?? WNI_PRIOR_DEFAULT;
        const newWni = computeWNIFromReports(govId, reports, priorWni);
        gov.baseline_indices.wni = newWni;

        const epi = gov.baseline_indices.epi;
        const ppi = gov.baseline_indices.ppi;
        const fsi = gov.baseline_indices.fsi;
        gov.baseline_indices.hni = computeHNI(epi, ppi, fsi, newWni);
      });

      return next;
    });
  }, [reports]);

  // Local write is authoritative and happens first; the cloud write is an extra that
  // reports its own outcome. Returns the remote state so the form can tell the truth.
  const handleAddReport = async (newReport) => {
    const updated = [newReport, ...reports];
    setReports(updated);
    try {
      localStorage.setItem('terrapulse_reports', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    if (!dbConfig.isConfigured) {
      setSyncStatus(s => ({ ...s, state: SYNC_STATE.LOCAL, lastResult: SYNC_STATE.LOCAL }));
      return { state: SYNC_STATE.LOCAL, storedLocally: true };
    }

    const result = await submitRemoteReport(newReport);
    setSyncStatus(s => ({
      ...s,
      // A failed write changes the badge; a successful one does not. The badge describes
      // what the app can do with the table, and the read probe answers that — promoting
      // the state to "Cloud Synced" after a 201 would claim a read the app never made,
      // since the shipped policy allows anon to INSERT and nothing else. The toast,
      // driven by result.state, is where the write outcome is reported.
      state: result.success ? s.state : result.state,
      detail: result.error || result.detail,
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

  return (
    <div className={`min-h-screen flex flex-col ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>
      
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
        t={t}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWizard={() => setIsWizardOpen(true)}
      />

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 w-full flex-1">
        
        {/* ===================================================================
            SECTION 1: HERO & CORE VISION (Docx Section 1 & 6)
            =================================================================== */}
        <section className="bento-card p-6 sm:p-10 mb-8 relative overflow-hidden">
          {/* Subtle Cosmic ambient background glow */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-sky-950/50 text-sky-300 border border-sky-800/40 backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.heroBadge}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-white/60 leading-[1.15]">
              {t.heroMainTitle}
            </h1>

            <p className="text-sm sm:text-base text-white/70 leading-relaxed font-normal max-w-3xl">
              {t.heroDesc}
            </p>

            {/* The 2 Primary Hero Call-to-Actions from Docx Section 6 */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setActiveTab('doctor');
                  const el = document.getElementById('section-doctor');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="apple-btn-primary px-5 py-2.5 text-xs sm:text-sm flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4 text-black" />
                <span>{t.btnDoctorCta}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('decision');
                  const el = document.getElementById('section-decision');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="apple-btn-secondary px-5 py-2.5 text-xs sm:text-sm flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4 text-sky-400" />
                <span>{t.btnDecisionCta}</span>
              </button>
            </div>
          </div>

          {/* Scientific Disclaimer Card (Docx Section 1 & 3: 10/10 Judging Criteria) */}
          <div className="mt-7 pt-5 border-t border-white/[0.08]">
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-semibold text-white/90 block">
                  {t.disclaimerTitle}
                </span>
                <p className="text-white/60 leading-relaxed font-normal">
                  {t.disclaimerBody}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Executive KPI Summary Strip */}
        <KpiStrip t={t} reportsCount={reports.length} />

        {/* ===================================================================
            MODULE 1: EARTH SYSTEM TREND DETECTIVE & SPATIAL MAP
            =================================================================== */}
        <section id="section-detective" className="bento-card p-5 sm:p-8 mb-8 space-y-6">
          <div className="border-b border-white/[0.08] pb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                <span>{t.module1Title}</span>
              </h2>
              <p className="text-xs text-white/50 font-normal mt-1">
                {t.module1Subtitle}
              </p>
            </div>
            <div className="satellite-chip text-sky-300 bg-sky-950/40 border-sky-800/40">
              {t.clickMarkerTip}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Map & 1995-2025 Scrubber (6 cols) */}
            <div className="lg:col-span-6">
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
            </div>

            {/* Right: Chart & Statistical Significance (6 cols) */}
            <div className="lg:col-span-6">
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
                onOpenMath={() => setIsMathOpen(true)}
              />
            </div>
          </div>
        </section>

        {/* Opposite Trends Demonstration Showcase */}
        <OppositeTrends t={t} />

        {/* ===================================================================
            MODULE 2: DOCTOR IMPACT MATCHER (STAY & BUILD EGYPT)
            =================================================================== */}
        <DoctorMatcher
          data={appData}
          lang={lang}
          t={t}
          onSelectGov={(id) => {
            setSelectedGov(id);
            setActiveTab('detective');
            const el = document.getElementById('section-detective');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onVoiceNeeds={(govId, specId) => {
            setSelectedGov(govId);
            if (specId) setFormSpecialty(specId);
            setActiveTab('physicians');
            const el = document.getElementById('section-physicians');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* ===================================================================
            MODULE 3: VOICE OF EGYPTIAN PHYSICIANS OBSERVATORY
            =================================================================== */}
        <PhysicianForm
          reports={reports}
          onAddReport={handleAddReport}
          governorates={appData.governorates}
          selectedGov={selectedGov}
          preselectedSpecialty={formSpecialty}
          lang={lang}
          t={t}
          syncStatus={syncStatus}
          onOpenDbModal={() => setIsDbModalOpen(true)}
        />

        {/* ===================================================================
            MODULE 4: DECISION-MAKER & "WHAT-IF" POLICY LAB
            =================================================================== */}
        <DecisionMaker
          govData={currentGovData}
          allGovs={appData.governorates}
          reports={reports}
          lang={lang}
          t={t}
        />

      </main>

      {/* Global Footer */}
      <Footer lang={lang} t={t} />

      {/* Modals */}
      <WizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        t={t}
        onApplyPreset={handleApplyCase}
      />

      <MathModal
        isOpen={isMathOpen}
        onClose={() => setIsMathOpen(false)}
        t={t}
      />

      <DbSyncModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        lang={lang}
        onConfigUpdated={(cfg) => setDbConfig(cfg)}
      />

    </div>
  );
}
