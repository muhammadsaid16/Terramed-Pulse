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
  buildTurnoverChartData,
  buildMigrationChartData,
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
  t
}) {
  const [activeSubTab, setActiveSubTab] = useState('simulation');
  const [clinics, setClinics] = useState(15);
  const [stipendPct, setStipendPct] = useState(40);
  const [greeningPct, setGreeningPct] = useState(10);

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
      greeningPct
    );
  }, [baseIndices, clinics, stipendPct, greeningPct]);

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

  // Executive Chart 1: Primary Drivers of Turnover (computed live from combined reports)
  const turnoverChartData = useMemo(
    () => buildTurnoverChartData(combinedReports, lang, t),
    [combinedReports, lang, t]
  );

  // Executive Chart 2: Migration Risk vs Climate Demand
  const migrationChartData = useMemo(
    () => buildMigrationChartData(combinedReports, lang, t),
    [combinedReports, lang, t]
  );

  // Executive Chart 3: Governorate Priority Matrix (Comparative)
  const priorityChartData = useMemo(
    () => buildPriorityChartData(allGovs, lang, t),
    [allGovs, lang, t]
  );

  const govName = lang === 'ar' ? govData?.name_ar : govData?.name_en;

  return (
    <section id="section-decision" className="bento-card p-5 sm:p-8 mb-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <Sliders className="w-4 h-4 text-sky-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
              {t.module4Title}
            </h2>
          </div>
          <p className="text-xs text-white/50 font-normal mt-1">
            {t.module4Subtitle} — {govName}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveSubTab('simulation')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeSubTab === 'simulation'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-white/60 hover:text-white'
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
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.tabResearchEvidence}</span>
            </button>
          </div>

          <span className="satellite-chip text-sky-300 bg-sky-950/40 border-sky-800/40">
            {t.mcdaChip}
          </span>
        </div>
      </div>

      {activeSubTab === 'simulation' && (
        <div className="space-y-6 animate-fade-in">
          {/* Policy Scenario Model Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] text-xs">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white/90 block text-[11px] uppercase tracking-wider">
                {t.policyScenarioBadge}
              </span>
              <span className="text-[11px] text-white/50 leading-relaxed block mt-0.5">
                {t.policyScenarioNotice}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Live Simulation Output Scoreboard (5 cols) */}
        <div className="lg:col-span-5 apple-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-white/80">
              {t.simulationHeading}
            </h3>
            <span className="text-[11px] font-medium text-white/50 bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-white/10">
              {govName}
            </span>
          </div>

          {!hasBaseline && (
            <div
              role="status"
              className="flex items-center gap-2 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{t.baselineMissingBadge}</span>
            </div>
          )}

          {/* Delta Indicator */}
          <div className="flex items-center justify-center gap-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <div className="text-center">
              <span className="text-[10px] text-white/45 block uppercase tracking-[0.05em] font-medium">
                {t.baselineHni}
              </span>
              <div className="text-3xl font-semibold text-white/70 tabular-nums">
                {baseIndices.hni}
              </div>
            </div>
            <div className="text-white/30 font-light text-2xl select-none" aria-hidden="true">
              {lang === 'ar' ? '←' : '→'}
            </div>
            <div className="text-center">
              <span className="text-[10px] text-emerald-400 block uppercase tracking-[0.05em] font-medium">
                {t.simulatedHni}
              </span>
              <div className="text-3xl font-semibold text-emerald-400 tabular-nums">
                {sim.simHni}
              </div>
            </div>
          </div>

          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 tabular-nums shadow-sm">
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
                <span className="text-white/70">
                  {t.sliderEpi}
                </span>
                <span className="text-rose-400 tabular-nums font-semibold">{sim.simEpi}</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, sim.simEpi)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1 font-medium">
                <span className="text-white/70">
                  {t.sliderPpi}
                </span>
                <span className="text-amber-400 tabular-nums font-semibold">{baseIndices.ppi}</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, baseIndices.ppi)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1 font-medium">
                <span className="text-white/70">
                  {t.sliderFsi}
                </span>
                <span className="text-sky-400 tabular-nums font-semibold">{sim.simFsi}</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, sim.simFsi)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1 font-medium">
                <span className="text-white/70">
                  {t.sliderWni}
                </span>
                <span className="text-emerald-400 tabular-nums font-semibold">{sim.simWni}</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, sim.simWni)}%` }}
                />
              </div>
            </div>
          </div>

          <details className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5">
            <summary className="cursor-pointer text-[11px] font-medium text-white/60 select-none">
              {t.modelAssumptionsTitle}
            </summary>
            <p className="mt-2 text-[11px] leading-relaxed text-white/50">
              {t.modelAssumptionsBody}
            </p>
          </details>

        </div>

        {/* Right: Policy Sliders & Projected Health Dividends (7 cols) */}
        <div className="lg:col-span-7 apple-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="font-semibold text-xs text-white/80">
              {t.leversTitle}
            </h3>
            <span className="text-[11px] text-white/50">{t.leversSub}</span>
          </div>

          {/* Slider 1: Clinics */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <label className="text-white/80">{t.sliderClinics}</label>
              <span className="font-semibold text-white tabular-nums bg-white/[0.08] px-2.5 py-0.5 rounded-full border border-white/10 text-[11px]">
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
          </div>

          {/* Slider 2: Rural Incentives */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <label className="text-white/80">{t.sliderIncentive}</label>
              <span className="font-semibold text-white tabular-nums bg-white/[0.08] px-2.5 py-0.5 rounded-full border border-white/10 text-[11px]">
                +{stipendPct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={stipendPct}
              onChange={(e) => setStipendPct(Number(e.target.value))}
              className="slider-teal"
            />
          </div>

          {/* Slider 3: Urban Greening */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <label className="text-white/80">{t.sliderGreening}</label>
              <span className="font-semibold text-white tabular-nums bg-white/[0.08] px-2.5 py-0.5 rounded-full border border-white/10 text-[11px]">
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
          </div>

          {/* Projected Dividends */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center">
              <span className="text-[11px] text-white/50 block font-medium">
                {t.admissionsPrevented}
              </span>
              <div className="text-2xl font-semibold text-white mt-1 tabular-nums">
                {sim.preventedAdmissions.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center">
              <span className="text-[11px] text-white/50 block font-medium">
                {t.retentionBoost}
              </span>
              <div className="text-2xl font-semibold text-sky-400 mt-1 tabular-nums">
                +{sim.retentionGainPct}%
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3 Executive Dashboards Required by NASA Challenge */}
      <div className="pt-6 border-t border-white/[0.08] space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-sky-400" />
          </div>
          <h3 className="font-semibold text-base text-white">
            {t.execChartsTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Executive Chart 1: Turnover Drivers Doughnut */}
          <div className="apple-card p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-rose-400" />
              <h4 className="text-xs font-semibold text-white/90">
                {t.chartTurnoverTitle}
              </h4>
            </div>
            <div className="h-[180px] w-full flex items-center justify-center">
              {turnoverChartData ? (
                <Doughnut
                  data={turnoverChartData}
                  options={doughnutChartOptions()}
                />
              ) : (
                <p className="text-xs text-white/45 px-4 text-center leading-relaxed">{t.chartNoFieldData}</p>
              )}
            </div>
          </div>

          {/* Executive Chart 2: Migration Risk vs Demand */}
          <div className="apple-card p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-semibold text-white/90">
                {t.chartMigrationTitle}
              </h4>
            </div>
            <div className="h-[180px] w-full">
              {migrationChartData ? (
                <Bar
                  data={migrationChartData}
                  options={barChartOptions()}
                />
              ) : (
                <p className="h-full flex items-center justify-center text-xs text-white/45 px-4 text-center leading-relaxed">{t.chartNoFieldData}</p>
              )}
            </div>
          </div>

          {/* Executive Chart 3: Governorate Priority Matrix */}
          <div className="apple-card p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-semibold text-white/90">
                {t.chartPriorityTitle}
              </h4>
            </div>
            <div className="h-[180px] w-full">
              <Bar
                data={priorityChartData}
                options={barChartOptions()}
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
            <div className="apple-card p-5 border-l-4 border-l-emerald-400 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                WHO EMHJ (2021)
              </span>
              <div className="text-2xl font-bold text-white tabular-nums">97.4%</div>
              <p className="text-xs text-white/70 leading-relaxed">
                {t.evidenceWhoStat}
              </p>
            </div>

            <div className="apple-card p-5 border-l-4 border-l-sky-400 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-sky-400 font-bold block">
                Oxford Int Health (2015)
              </span>
              <div className="text-2xl font-bold text-white tabular-nums">81.8%</div>
              <p className="text-xs text-white/70 leading-relaxed">
                {t.evidenceOxfordStat}
              </p>
            </div>

            <div className="apple-card p-5 border-l-4 border-l-amber-400 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                MDPI Social Sciences (2025)
              </span>
              <div className="text-2xl font-bold text-white tabular-nums">20.0× Odds</div>
              <p className="text-xs text-white/70 leading-relaxed">
                {t.evidenceMdpiStat}
              </p>
            </div>
          </div>

          {/* Detailed Peer-Reviewed Studies */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-semibold text-white">
                {t.researchEvidenceTitle}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {MIGRATION_RESEARCH_STUDIES.map((study) => (
                <div key={study.id} className="apple-card p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/[0.08] pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                        {study.journal} ({study.year})
                      </span>
                      <h4 className="text-xs font-semibold text-white/95 mt-1.5 leading-snug">
                        {study.citation}
                      </h4>
                    </div>
                    <a
                      href={study.doi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors shrink-0"
                    >
                      <span>DOI</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">
                    {lang === 'ar' ? study.narrative_ar : study.narrative_en}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
                      <span className="text-[10px] text-white/40 block font-medium mb-1">
                        {t.researchStudyCohort}
                      </span>
                      <span className="text-white/85 text-[11px] leading-relaxed block">
                        {study.cohort} (n = {study.sample_size})
                      </span>
                    </div>

                    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
                      <span className="text-[10px] text-white/40 block font-medium mb-1">
                        {t.researchKeyMetrics}
                      </span>
                      <div className="space-y-1 text-[11px] text-white/85">
                        {study.key_findings.migration_intent_pct && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Migration Intent:</span>
                            <span className="font-semibold text-rose-300">{study.key_findings.migration_intent_pct}%</span>
                          </div>
                        )}
                        {study.key_findings.retention_willingness_if_improved_pct && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Willing to Stay if Improved:</span>
                            <span className="font-semibold text-emerald-300">{study.key_findings.retention_willingness_if_improved_pct}%</span>
                          </div>
                        )}
                        {study.key_findings.plan_to_return_after_training_pct && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Plan to Return:</span>
                            <span className="font-semibold text-sky-300">{study.key_findings.plan_to_return_after_training_pct}%</span>
                          </div>
                        )}
                        {study.key_findings.work_dissatisfaction_odds_ratio && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Work Dissatisfaction OR:</span>
                            <span className="font-semibold text-amber-300">{study.key_findings.work_dissatisfaction_odds_ratio}×</span>
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
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-white">
                {t.actionablePolicyDrivers}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCUMENTED_MIGRATION_DRIVERS.map(driver => (
                <div key={driver.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                  <span className="text-xs font-semibold text-white block">
                    {lang === 'ar' ? driver.ar : driver.en}
                  </span>
                  <div className="text-[11px] text-rose-300/90 font-medium">
                    📌 {lang === 'ar' ? driver.evidence_stat_ar : driver.evidence_stat}
                  </div>
                  <div className="text-[11px] text-emerald-300 font-medium pt-1 border-t border-white/[0.06]">
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
