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
import PrintBrief from './components/PrintBrief';
import Footer from './components/Footer';

import { TERRAPULSE_DATA } from './data/terrapulseData';
import { TRANSLATIONS } from './lib/translations';
import { computeWNIFromReports, computeHNI } from './lib/trendEngine';

export default function App() {
  const [lang, setLang] = useState('en');
  const [selectedGov, setSelectedGov] = useState('aswan');
  const [selectedVar, setSelectedVar] = useState('T2M_MAX');
  const [year, setYear] = useState(2025);
  const [mapMetric, setMapMetric] = useState('hni');
  const [isAnomaly, setIsAnomaly] = useState(false);
  const [activeTab, setActiveTab] = useState('detective');
  const [activeCase, setActiveCase] = useState(null);
  const [formSpecialty, setFormSpecialty] = useState('nephrology');

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isMathOpen, setIsMathOpen] = useState(false);

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

  const t = useMemo(() => TRANSLATIONS[lang] || TRANSLATIONS.en, [lang]);

  // Recalculate WNI & HNI whenever reports change
  useEffect(() => {
    setAppData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const govs = next.governorates;

      Object.keys(govs).forEach(govId => {
        const gov = govs[govId];
        const baseWni = gov.baseline_indices?.wni || 75;
        const newWni = computeWNIFromReports(govId, reports, baseWni);
        gov.baseline_indices.wni = newWni;

        const epi = gov.baseline_indices.epi;
        const ppi = gov.baseline_indices.ppi;
        const fsi = gov.baseline_indices.fsi;
        gov.baseline_indices.hni = computeHNI(epi, ppi, fsi, newWni);
      });

      return next;
    });
  }, [reports]);

  // Handle new in-page report
  const handleAddReport = (newReport) => {
    const updated = [newReport, ...reports];
    setReports(updated);
    try {
      localStorage.setItem('terrapulse_reports', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
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

  const currentGovData = appData?.governorates?.[selectedGov] || null;

  return (
    <div className={`min-h-screen flex flex-col ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>
      
      {/* Official Print Brief Container */}
      <PrintBrief
        govData={currentGovData}
        selectedGov={selectedGov}
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        
        {/* ===================================================================
            SECTION 1: HERO & CORE VISION (Docx Section 1 & 6)
            =================================================================== */}
        <section className="apple-glass p-8 sm:p-12 mb-8 relative overflow-hidden">
          {/* Subtle Apple ambient background glow */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-white/[0.06] text-white/90 border border-white/10 backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.heroBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.035em] text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-white/55 leading-[1.12]">
              {t.heroMainTitle}
            </h1>

            <p className="text-base sm:text-lg text-white/60 leading-relaxed font-normal max-w-3xl">
              {t.heroDesc}
            </p>

            {/* The 2 Primary Hero Call-to-Actions from Docx Section 6 */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setActiveTab('doctor');
                  const el = document.getElementById('section-doctor');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="apple-btn-primary px-6 py-3 text-sm flex items-center gap-2.5"
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
                className="apple-btn-secondary px-6 py-3 text-sm flex items-center gap-2.5"
              >
                <BarChart3 className="w-4 h-4 text-sky-400" />
                <span>{t.btnDecisionCta}</span>
              </button>
            </div>
          </div>

          {/* Scientific Disclaimer Card (Docx Section 1 & 3: 10/10 Judging Criteria) */}
          <div className="mt-8 pt-6 border-t border-white/[0.08]">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl flex items-start gap-3.5">
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
        <section id="section-detective" className="apple-glass p-6 sm:p-8 mb-8 space-y-6">
          <div className="border-b border-white/[0.08] pb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                <span>{t.module1Title}</span>
              </h2>
              <p className="text-xs text-white/50 font-normal mt-1">
                {t.module1Subtitle}
              </p>
            </div>
            <div className="text-[11px] text-white/70 font-medium bg-white/[0.06] px-3 py-1 rounded-full border border-white/10">
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
        />

        {/* ===================================================================
            MODULE 4: DECISION-MAKER & "WHAT-IF" POLICY LAB
            =================================================================== */}
        <DecisionMaker
          selectedGov={selectedGov}
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

    </div>
  );
}
