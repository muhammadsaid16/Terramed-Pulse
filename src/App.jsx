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
        onOpenMath={() => setIsMathOpen(true)}
        onApplyCase={handleApplyCase}
        activeCase={activeCase}
      />

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        
        {/* ===================================================================
            SECTION 1: HERO & CORE VISION (Docx Section 1 & 6)
            =================================================================== */}
        <section className="apple-glass p-6 sm:p-8 mb-8 relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>{t.heroBadge}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight leading-tight">
              {t.heroMainTitle}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
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
                className="apple-btn px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-apple-glow"
              >
                <Stethoscope className="w-4 h-4 text-slate-950" />
                <span>{t.btnDoctorCta}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('decision');
                  const el = document.getElementById('section-decision');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="apple-chip px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-white/15 font-bold text-sm flex items-center gap-2 shadow-md"
              >
                <BarChart3 className="w-4 h-4 text-teal-400" />
                <span>{t.btnDecisionCta}</span>
              </button>
            </div>
          </div>

          {/* Scientific Disclaimer Card (Docx Section 1 & 3: 10/10 Judging Criteria) */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-teal-500/20 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-teal-300 block">
                  {t.disclaimerTitle}
                </span>
                <p className="text-slate-300 leading-relaxed">
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
        <section id="section-detective" className="apple-glass p-5 lg:p-6 mb-8 space-y-6">
          <div className="border-b border-white/10 pb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                <span>{t.module1Title}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {t.module1Subtitle}
              </p>
            </div>
            <div className="text-[11px] text-teal-400 font-semibold bg-teal-950/60 px-3 py-1 rounded-full border border-teal-500/30">
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
