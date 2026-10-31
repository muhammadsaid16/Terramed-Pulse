import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Sliders, ShieldCheck, BarChart3, PieChart, AlertTriangle, BookOpen, FileText, ExternalLink, Info } from 'lucide-react';
import { simulatePolicyInterventions, NEUTRAL_INDICES } from '../lib/trendEngine';
import {
  buildEmpiricalTurnoverChartData,
  buildEmpiricalMigrationChartData,
  buildPriorityChartData,
  doughnutChartOptions,
  barChartOptions
} from '../lib/chartAdapters';
import { MIGRATION_RESEARCH_STUDIES, DOCUMENTED_MIGRATION_DRIVERS } from '../data/migrationResearchData';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function DecisionMaker({
  govData,
  allGovs,
  reports,
  communityReports = [],
  lang,
  t,
  theme = 'light'
}) {
  const [activeSubTab, setActiveSubTab] = useState('simulation');
  const [clinics, setClinics] = useState(15);
  const [stipendPct, setStipendPct] = useState(40);
  const [greeningPct, setGreeningPct] = useState(10);
  const [salaryHikePct, setSalaryHikePct] = useState(50);
  const [hazardPayPct, setHazardPayPct] = useState(60);
  const [securityPct, setSecurityPct] = useState(40);
  const [equipmentPct, setEquipmentPct] = useState(50);

  // Guard per-field, not per-object: App.jsx only writes `wni` in a post-paint effect,
  // so on the first frame `baseline_indices.wni` is undefined and every product of it
  // rendered as NaN. A missing reading falls back to the engine's neutral index, which
  // is the same value the effect blends from, so the first frame matches steady state.
  const rawIndices = govData?.baseline_indices;
  const hasBaseline = !!rawIndices;
  const pick = (key) => {
    const n = Number(rawIndices?.[key]);
    return Number.isFinite(n) ? n : NEUTRAL_INDICES[key];
  };
  const baseIndices = {
    hni: pick('hni'),
    epi: pick('epi'),
    ppi: pick('ppi'),
    fsi: pick('fsi'),
    wni: pick('wni')
  };

  // Run What-If Simulation
  const sim = useMemo(() => {
    return simulatePolicyInterventions(
      baseIndices.hni,
      baseIndices.epi,
      baseIndices.fsi,
      baseIndices.wni,
      baseIndices.ppi,
      clinics,
      stipendPct,
      greeningPct,
      salaryHikePct,
      hazardPayPct,
      securityPct,
      equipmentPct
    );
  }, [baseIndices, clinics, stipendPct, greeningPct, salaryHikePct, hazardPayPct, securityPct, equipmentPct]);

  // Aggregate local submissions and verified community reports for executive analytics
  const combinedReports = useMemo(() => {
    if (!communityReports || communityReports.length === 0) return reports;
    const map = new Map();
    reports.forEach(r => map.set(r.id || `${r.doctor}-${r.hospital}-${r.comment}`, r));
    communityReports.forEach(r => {
      const key = r.id || `${r.doctor}-${r.hospital}-${r.comment}`;
      if (!map.has(key)) map.set(key, r);
    });
    return Array.from(map.values());
  }, [reports, communityReports]);

  // Executive Chart 1: Primary Drivers of Turnover (verified empirical WHO breakdown n=885)
  const turnoverChartData = useMemo(() => {
    return buildEmpiricalTurnoverChartData(lang, t, theme);
  }, [lang, t, theme]);

  // Executive Chart 2: Migration Risk vs Climate Demand (empirical literature benchmarks)
  const migrationChartData = useMemo(() => {
    return buildEmpiricalMigrationChartData(lang, t);
  }, [lang, t]);

  // Executive Chart 3: Governorate Priority Matrix (Comparative)
  const priorityChartData = useMemo(
    () => buildPriorityChartData(allGovs, lang, t),
    [allGovs, lang, t]
  );

  const govName = lang === 'ar' ? govData?.name_ar : govData?.name_en;

  return (
    <section id="section-decision" className="bento-card p-5 sm:p-8 mb-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-white/[0.08] pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 flex items-center justify-center shadow-sm">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
              {t.module4Title}
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-white/50 font-normal mt-1">
            {t.module4Subtitle} — {govName}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100/80 dark:bg-white/[0.04] p-1 rounded-xl border border-slate-200/80 dark:border-white/10">
            <button
              type="button"
              onClick={() => setActiveSubTab('simulation')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeSubTab === 'simulation'
                  ? 'bg-white text-sky-700 shadow-xs border border-slate-200/80 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40'
                  : 'text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t.tabSimulation}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('evidence')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeSubTab === 'evidence'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
                  : 'text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.tabResearchEvidence}</span>
            </button>
          </div>

          <span className="satellite-chip text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-sky-950/40 dark:border-sky-800/40">
            {t.mcdaChip}
          </span>
        </div>
      </div>

      {activeSubTab === 'simulation' && (
        <div className="space-y-6 animate-fade-in">
          {/* Policy Scenario Model Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] text-xs">
            <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white/90 block text-[11px] uppercase tracking-wider">
                {t.policyScenarioBadge}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-white/50 leading-relaxed block mt-0.5">
                {t.policyScenarioNotice}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Live Simulation Output Scoreboard (5 cols) */}
        <div className="lg:col-span-5 apple-card p-6 space-y-5 lg:sticky lg:top-24 shadow-sm dark:shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-slate-800 dark:text-white/80">
              {t.simulationHeading}
            </h3>
            <span className="text-[11px] font-medium text-slate-700 dark:text-white/50 bg-slate-100 dark:bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-white/10">
              {govName}
            </span>
          </div>

          {!hasBaseline && (
            <div
              role="status"
              className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/25 rounded-xl px-3 py-2"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{t.baselineMissingBadge}</span>
            </div>
          )}

          {/* Delta Indicator */}
          <div className="flex items-center justify-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08]">
            <div className="text-center">
              <span className="text-[10px] text-slate-500 dark:text-white/45 block uppercase tracking-[0.05em] font-medium">
                {t.baselineHni}
              </span>
              <div className="text-3xl font-semibold text-slate-700 dark:text-white/70 tabular-nums">
                {baseIndices.hni}
              </div>
            </div>
            <div className="text-slate-300 dark:text-white/30 font-light text-2xl select-none" aria-hidden="true">
              {lang === 'ar' ? '←' : '→'}
            </div>
            <div className="text-center">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block uppercase tracking-[0.05em] font-medium">
                {t.simulatedHni}
              </span>
              <div className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {sim.simHni}
              </div>
            </div>
          </div>

          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 tabular-nums shadow-sm">
              <span dir="ltr" className="font-mono font-bold">{sim.deltaHni}</span>
              <span>{t.unitPts}</span>
              <span className="opacity-80">
                (<span dir="ltr" className="font-mono">{sim.pctReduction}%</span> {t.reductionWord})
              </span>
            </span>
          </div>

          {/* Sub-indices Progress Bars */}
          <div className="space-y-3 pt-2 text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1 font-medium">
                <span className="text-slate-700 dark:text-white/70">
                  {t.sliderEpi}
                </span>
                <span className="text-rose-600 dark:text-rose-400 tabular-nums font-semibold">{sim.simEpi}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, sim.simEpi)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1 font-medium">
                <span className="text-slate-700 dark:text-white/70">
                  {t.sliderPpi}
                </span>
                <span className="text-amber-600 dark:text-amber-400 tabular-nums font-semibold">{baseIndices.ppi}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, baseIndices.ppi)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1 font-medium">
                <span className="text-slate-700 dark:text-white/70">
                  {t.sliderFsi}
                </span>
                <span className="text-sky-600 dark:text-sky-400 tabular-nums font-semibold">{sim.simFsi}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, sim.simFsi)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1 font-medium">
                <span className="text-slate-700 dark:text-white/70">
                  {t.sliderWni}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 tabular-nums font-semibold">{sim.simWni}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, sim.simWni)}%` }}
                />
              </div>
            </div>
          </div>

          <details className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] px-3.5 py-2.5">
            <summary className="cursor-pointer text-[11px] font-medium text-slate-600 dark:text-white/60 select-none">
              {t.modelAssumptionsTitle}
            </summary>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-white/50">
              {t.modelAssumptionsBody}
            </p>
          </details>

        </div>

        {/* Right: Policy Sliders & Projected Health Dividends (7 cols) */}
        <div className="lg:col-span-7 apple-card p-6 space-y-6 shadow-sm dark:shadow-md">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white/80">
              {t.leversTitle}
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-white/50">{t.leversSub}</span>
          </div>

          {/* TRACK 1: DIRECT FINANCIAL & COMPENSATION PACKAGE */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/[0.06] pb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {t.trackFinancialTitle}
              </h4>
            </div>

            {/* Slider 1: Base Salary Hike */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <label className="text-slate-800 dark:text-white/80">{t.sliderSalaryHike}</label>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums bg-emerald-50 dark:bg-white/[0.08] px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-white/10 text-[11px]">
                  +{salaryHikePct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                step="5"
                value={salaryHikePct}
                onChange={(e) => setSalaryHikePct(Number(e.target.value))}
                className="slider-teal"
              />
              <p className="text-[10px] text-slate-500 dark:text-white/45 leading-relaxed font-normal">
                {t.sourceRationaleSalary}
              </p>
            </div>

            {/* Slider 2: Hazard & Infection Pay */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <label className="text-slate-800 dark:text-white/80">{t.sliderHazardPay}</label>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums bg-emerald-50 dark:bg-white/[0.08] px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-white/10 text-[11px]">
                  +{hazardPayPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="10"
                value={hazardPayPct}
                onChange={(e) => setHazardPayPct(Number(e.target.value))}
                className="slider-teal"
              />
              <p className="text-[10px] text-slate-500 dark:text-white/45 leading-relaxed font-normal">
                {t.sourceRationaleHazard}
              </p>
            </div>

            {/* Slider 3: Remote Housing & Hardship Allowance */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <label className="text-slate-800 dark:text-white/80">{t.sliderIncentive}</label>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums bg-emerald-50 dark:bg-white/[0.08] px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-white/10 text-[11px]">
                  +{stipendPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={stipendPct}
                onChange={(e) => setStipendPct(Number(e.target.value))}
                className="slider-teal"
              />
              <p className="text-[10px] text-slate-500 dark:text-white/45 leading-relaxed font-normal">
                {t.sourceRationaleStipend}
              </p>
            </div>
          </div>

          {/* TRACK 2: WORKPLACE SAFETY & CLINICAL FACILITIES */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/[0.06] pb-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <h4 className="text-xs font-semibold text-sky-700 dark:text-sky-300">
                {t.trackFacilitiesTitle}
              </h4>
            </div>

            {/* Slider 4: Hospital Security Protection */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <label className="text-slate-800 dark:text-white/80">{t.sliderSecurity}</label>
                <span className="font-semibold text-sky-700 dark:text-sky-300 tabular-nums bg-sky-50 dark:bg-white/[0.08] px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-white/10 text-[11px]">
                  {securityPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={securityPct}
                onChange={(e) => setSecurityPct(Number(e.target.value))}
                className="slider-teal"
              />
              <p className="text-[10px] text-slate-500 dark:text-white/45 leading-relaxed font-normal">
                {t.sourceRationaleSecurity}
              </p>
            </div>

            {/* Slider 5: Critical Care & Dialysis Re-equipment */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <label className="text-slate-800 dark:text-white/80">{t.sliderEquipment}</label>
                <span className="font-semibold text-sky-700 dark:text-sky-300 tabular-nums bg-sky-50 dark:bg-white/[0.08] px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-white/10 text-[11px]">
                  {equipmentPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={equipmentPct}
                onChange={(e) => setEquipmentPct(Number(e.target.value))}
                className="slider-teal"
              />
              <p className="text-[10px] text-slate-500 dark:text-white/45 leading-relaxed font-normal">
                {t.sourceRationaleEquipment}
              </p>
            </div>

            {/* Slider 6: Mobile Response Clinics */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <label className="text-slate-800 dark:text-white/80">{t.sliderClinics}</label>
                <span className="font-semibold text-sky-700 dark:text-sky-300 tabular-nums bg-sky-50 dark:bg-white/[0.08] px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-white/10 text-[11px]">
                  {clinics}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={clinics}
                onChange={(e) => setClinics(Number(e.target.value))}
                className="slider-teal"
              />
              <p className="text-[10px] text-slate-500 dark:text-white/45 leading-relaxed font-normal">
                {t.sourceRationaleClinics}
              </p>
            </div>

            {/* Slider 7: Urban Greening & Cool Surfaces (NASA Heat Exposure Reduction) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <label className="text-slate-800 dark:text-white/80">{t.sliderGreening}</label>
                <span className="font-semibold text-sky-700 dark:text-sky-300 tabular-nums bg-sky-50 dark:bg-white/[0.08] px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-white/10 text-[11px]">
                  +{greeningPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={greeningPct}
                onChange={(e) => setGreeningPct(Number(e.target.value))}
                className="slider-teal"
              />
              <p className="text-[10px] text-slate-500 dark:text-white/45 leading-relaxed font-normal">
                {t.sourceRationaleGreening}
              </p>
            </div>
          </div>

          {/* Projected Dividends */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] text-center shadow-xs">
              <span className="text-[11px] text-slate-500 dark:text-white/50 block font-medium">
                {t.admissionsPrevented}
              </span>
              <div className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mt-1 tabular-nums">
                {lang === 'ar' 
                  ? `~${(sim.preventedAdmissions / 1000).toFixed(1)} ألف حالة / شهرياً`
                  : `~${(sim.preventedAdmissions / 1000).toFixed(1)}k cases / mo`}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-white/40 block mt-1">
                {t.scenarioIllustrativeNote}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-white/45 block mt-1 pt-1.5 border-t border-slate-200/80 dark:border-white/[0.06]">
                <span className="text-sky-600 dark:text-sky-400 font-semibold">{t.sourcePrefix || 'المصدر:'}</span> {t.sourceAdmissionsPrevented}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] text-center shadow-xs">
              <span className="text-[11px] text-slate-500 dark:text-white/50 block font-medium">
                {t.retentionBoost}
              </span>
              <div className="text-xl sm:text-2xl font-semibold text-sky-600 dark:text-sky-400 mt-1 tabular-nums">
                +{sim.retentionGainPct}%
              </div>
              <span className="text-[10px] text-sky-600/80 dark:text-sky-400/60 block mt-1">
                {t.modeledResponseNote}
              </span>
              <span className="text-[9px] text-sky-600/90 dark:text-sky-400/80 block mt-1 pt-1.5 border-t border-slate-200/80 dark:border-white/[0.06]">
                <span className="text-slate-500 dark:text-white/40">{t.sourcePrefix || 'المصدر:'}</span> {t.sourceProjectedRetention}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* 3 Executive Dashboards Required by NASA Challenge */}
      <div className="pt-6 border-t border-slate-200/80 dark:border-white/[0.08] space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <h3 className="font-semibold text-base text-slate-900 dark:text-white">
            {t.execChartsTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Executive Chart 1: Turnover Drivers Doughnut */}
          <div className="apple-card p-5 flex flex-col justify-between shadow-sm dark:shadow-md">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <PieChart className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white/90">
                  {t.chartTurnoverTitle}
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-white/45 block mb-2 font-medium">
                <span className="text-rose-600 dark:text-rose-400 font-semibold">{t.sourcePrefix || 'المصدر:'}</span> {t.sourceExecTurnover}
              </span>
            </div>
            <div className="h-[180px] w-full flex items-center justify-center">
              {turnoverChartData ? (
                <Doughnut
                  data={turnoverChartData}
                  options={doughnutChartOptions(theme)}
                />
              ) : (
                <p className="text-xs text-slate-500 dark:text-white/45 px-4 text-center leading-relaxed">{t.chartNoFieldData}</p>
              )}
            </div>
          </div>

          {/* Executive Chart 2: Migration Risk vs Demand */}
          <div className="apple-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <BarChart3 className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white/90">
                  {t.chartMigrationTitle}
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-white/45 block mb-2 font-medium">
                <span className="text-sky-600 dark:text-sky-400 font-semibold">{t.sourcePrefix || 'المصدر:'}</span> {t.sourceExecMigration}
              </span>
            </div>
            <div className="h-[180px] w-full">
              {migrationChartData ? (
                <Bar
                  data={migrationChartData}
                  options={barChartOptions(theme)}
                />
              ) : (
                <p className="h-full flex items-center justify-center text-xs text-slate-500 dark:text-white/45 px-4 text-center leading-relaxed">{t.chartNoFieldData}</p>
              )}
            </div>
          </div>

          {/* Executive Chart 3: Governorate Priority Matrix */}
          <div className="apple-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white/90">
                  {t.chartPriorityTitle}
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-white/45 block mb-2 font-medium">
                <span className="text-amber-600 dark:text-amber-400 font-semibold">{t.sourcePrefix || 'المصدر:'}</span> {t.sourceExecPriority}
              </span>
            </div>
            <div className="h-[180px] w-full">
              <Bar
                data={priorityChartData}
                options={barChartOptions(theme)}
              />
            </div>
          </div>

        </div>
      </div>
      </div>
      )}

      {/* Peer-Reviewed Research Evidence View */}
      {activeSubTab === 'evidence' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top 3 Empirical Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="apple-card p-5 border-l-4 border-l-emerald-500 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">
                {lang === 'ar' ? 'الصحة العالمية EMHJ (2021)' : 'WHO EMHJ (2021)'}
              </span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">97.4%</div>
              <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed">
                {t.evidenceWhoStat}
              </p>
            </div>

            <div className="apple-card p-5 border-l-4 border-l-sky-500 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-sky-600 dark:text-sky-400 font-bold block">
                {lang === 'ar' ? 'أكسفورد Int Health (2015)' : 'Oxford Int Health (2015)'}
              </span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">81.8%</div>
              <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed">
                {t.evidenceOxfordStat}
              </p>
            </div>

            <div className="apple-card p-5 border-l-4 border-l-amber-500 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">
                {lang === 'ar' ? 'مجلة MDPI للعلوم الاجتماعية (2025)' : 'MDPI Social Sciences (2025)'}
              </span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {lang === 'ar' ? '20.0× أرجحية' : '20.0× Odds'}
              </div>
              <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed">
                {t.evidenceMdpiStat}
              </p>
            </div>
          </div>

          {/* Detailed Peer-Reviewed Studies */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t.researchEvidenceTitle}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {MIGRATION_RESEARCH_STUDIES.map((study) => (
                <div key={study.id} className="apple-card p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-500/20">
                        {(lang === 'ar' ? study.journal_ar : study.journal_en) || study.journal} ({study.year})
                      </span>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white/95 mt-1.5 leading-snug">
                        {study.citation}
                      </h4>
                    </div>
                    <a
                      href={study.doi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1 font-medium transition-colors shrink-0"
                    >
                      <span>DOI</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-white/80 leading-relaxed bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-200/80 dark:border-white/[0.05]">
                    {lang === 'ar' ? study.narrative_ar : study.narrative_en}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="bg-slate-50 dark:bg-white/[0.03] p-3 rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
                      <span className="text-[10px] text-slate-500 dark:text-white/40 block font-medium mb-1">
                        {t.researchStudyCohort}
                      </span>
                      <span className="text-slate-800 dark:text-white/85 text-[11px] leading-relaxed block">
                        {(lang === 'ar' ? study.cohort_ar : study.cohort_en) || study.cohort} ({t.sampleSizeLabel} {study.sample_size})
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/[0.03] p-3 rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
                      <span className="text-[10px] text-slate-500 dark:text-white/40 block font-medium mb-1">
                        {t.researchKeyMetrics}
                      </span>
                      <div className="space-y-1 text-[11px] text-slate-800 dark:text-white/85">
                        {study.key_findings.migration_intent_pct && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-white/60">{t.metricMigrationIntent}</span>
                            <span className="font-semibold text-rose-600 dark:text-rose-300 tabular-nums">{study.key_findings.migration_intent_pct}%</span>
                          </div>
                        )}
                        {study.key_findings.retention_willingness_if_improved_pct && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-white/60">{t.metricWillingToStay}</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-300 tabular-nums">{study.key_findings.retention_willingness_if_improved_pct}%</span>
                          </div>
                        )}
                        {study.key_findings.plan_to_return_after_training_pct && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-white/60">{t.metricPlanToReturn}</span>
                            <span className="font-semibold text-sky-600 dark:text-sky-300 tabular-nums">{study.key_findings.plan_to_return_after_training_pct}%</span>
                          </div>
                        )}
                        {study.key_findings.work_dissatisfaction_odds_ratio && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-white/60">{t.metricWorkDissatisfaction}</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-300 tabular-nums">{study.key_findings.work_dissatisfaction_odds_ratio}× {t.oddsUnit}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Evidence-Based Levers Matrix */}
          <div className="apple-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                {t.actionablePolicyDrivers}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCUMENTED_MIGRATION_DRIVERS.map(driver => (
                <div key={driver.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1.5">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                    {lang === 'ar' ? driver.ar : driver.en}
                  </span>
                  <div className="text-[11px] text-rose-600 dark:text-rose-300/90 font-medium">
                    📌 {lang === 'ar' ? driver.evidence_stat_ar : driver.evidence_stat}
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium pt-1 border-t border-slate-200/80 dark:border-white/[0.06]">
                    🎯 {lang === 'ar' ? driver.policy_lever_ar : driver.policy_lever}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </section>
  );
}
