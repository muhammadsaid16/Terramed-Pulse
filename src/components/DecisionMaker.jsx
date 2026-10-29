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
import { Sliders, ShieldCheck, BarChart3, PieChart } from 'lucide-react';
import { simulatePolicyInterventions } from '../lib/trendEngine';
import {
  buildTurnoverChartData,
  buildMigrationChartData,
  buildPriorityChartData,
  doughnutChartOptions,
  barChartOptions
} from '../lib/chartAdapters';

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
  lang,
  t
}) {
  const [clinics, setClinics] = useState(15);
  const [stipendPct, setStipendPct] = useState(40);
  const [greeningPct, setGreeningPct] = useState(10);

  const baseIndices = govData?.baseline_indices || {
    hni: 75,
    epi: 70,
    ppi: 50,
    fsi: 65,
    wni: 75
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

  // Executive Chart 1: Primary Drivers of Turnover (computed live from reports)
  const turnoverChartData = useMemo(
    () => buildTurnoverChartData(reports, lang, t),
    [reports, lang, t]
  );

  // Executive Chart 2: Migration Risk vs Climate Demand
  const migrationChartData = useMemo(
    () => buildMigrationChartData(reports, lang, t),
    [reports, lang, t]
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
      <div className="border-b border-white/[0.08] pb-4 flex flex-wrap items-center justify-between gap-2">
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
        <span className="satellite-chip text-sky-300 bg-sky-950/40 border-sky-800/40">
          {t.mcdaChip}
        </span>
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
              <Doughnut
                data={turnoverChartData}
                options={doughnutChartOptions()}
              />
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
              <Bar
                data={migrationChartData}
                options={barChartOptions()}
              />
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

    </section>
  );
}
