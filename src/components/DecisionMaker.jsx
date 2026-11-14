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
import {
  SpotlightCard,
  NumberTicker,
  GlowProgressBar,
  Button,
  Badge,
  Card,
  Tabs,
  TabsList,
  TabsTrigger,
  Slider,
  DonutChart
} from './ui';
import SectionHeader from './SectionHeader';

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

  // Executive Chart 1: Migration driver shares (%) from the 3-study academic meta-synthesis
  const turnoverChartData = useMemo(() => {
    return buildEmpiricalTurnoverChartData(lang, t, theme);
  }, [lang, t, theme]);

  // NameThatUI Donut Chart representation with synchronized legend
  const donutData = useMemo(() => {
    if (!turnoverChartData?.labels || !turnoverChartData?.datasets?.[0]) return [];
    return turnoverChartData.labels.map((label, idx) => ({
      label,
      value: turnoverChartData.datasets[0].data[idx],
      color: turnoverChartData.datasets[0].backgroundColor[idx]
    }));
  }, [turnoverChartData]);

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
      <SectionHeader
        index="04"
        title={t.module4Title}
        subtitle={`${t.module4Subtitle} (${govName})`}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-auto">
              <TabsList className="p-0.5 h-auto">
                <TabsTrigger value="simulation" className="gap-1.5 py-1 px-3 text-xs">
                  <Sliders className="w-3.5 h-3.5 text-[color:var(--info)] dark:text-sky-400" />
                  <span>{t.tabSimulation}</span>
                </TabsTrigger>
                <TabsTrigger value="evidence" className="gap-1.5 py-1 px-3 text-xs">
                  <BookOpen className="w-3.5 h-3.5 text-[color:var(--ok)] dark:text-emerald-400" />
                  <span>{t.tabResearchEvidence}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Badge variant="default" pulse={true} className="text-xs py-1">
              {t.mcdaChip}
            </Badge>
          </div>
        }
      />

      {activeSubTab === 'simulation' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Policy Scenario Model Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[color:var(--panel-2)] border border-[color:var(--line)] text-xs">
            <Info className="w-4 h-4 text-[color:var(--info)] dark:text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[color:var(--ink)] block text-micro uppercase tracking-wider">
                {t.policyScenarioBadge}
              </span>
              <span className="text-micro text-[color:var(--ink-2)] leading-relaxed block mt-0.5">
                {t.policyScenarioNotice}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Live Simulation Output Scoreboard (5 cols) */}
        <SpotlightCard
          className="lg:col-span-5 apple-card p-6 lg:sticky lg:top-24 shadow-sm dark:shadow-md relative overflow-hidden border border-emerald-400/40 dark:border-emerald-500/40 shadow-[0_0_25px_-5px_rgba(16,185,129,0.18)]"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[color:var(--line)] pb-3">
              <h3 className="font-semibold text-xs text-[color:var(--ink)]">
                {t.simulationHeading}
              </h3>
              <span className="text-micro font-medium text-[color:var(--ink-2)] bg-[color:var(--panel-2)] px-2.5 py-0.5 rounded-full border border-[color:var(--line-strong)]">
                {govName}
              </span>
            </div>

            {!hasBaseline && (
              <div
                role="status"
                className="flex items-center gap-2 text-micro text-[color:var(--warn)] bg-amber-50 border border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/25 rounded-xl px-3 py-2"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{t.baselineMissingBadge}</span>
              </div>
            )}

            {/* Delta Indicator */}
            <div className="flex items-center justify-center gap-6 p-4 rounded-2xl bg-[color:var(--panel-2)] border border-[color:var(--line)]">
              <div className="text-center">
                <span className="text-2xs text-[color:var(--muted)] block uppercase tracking-[0.05em] font-medium">
                  {t.baselineHni}
                </span>
                <div className="text-3xl font-semibold text-[color:var(--ink-2)] tabular-nums">
                  <NumberTicker value={baseIndices.hni} decimalPlaces={1} />
                </div>
              </div>
              <div className="text-[color:var(--muted)] font-light text-2xl select-none" aria-hidden="true">
                {lang === 'ar' ? '←' : '→'}
              </div>
              <div className="text-center">
                <span className="text-2xs text-[color:var(--ok)] dark:text-emerald-400 block uppercase tracking-[0.05em] font-medium">
                  {t.simulatedHni}
                </span>
                <div className="text-3xl font-semibold text-[color:var(--ok)] dark:text-emerald-400 tabular-nums">
                  <NumberTicker value={sim.simHni} decimalPlaces={1} />
                </div>
              </div>
            </div>

            {/* Clear breathing space between the numbers box and reduction pill */}
            <div className="text-center mt-6 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-[color:var(--ok)] border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 tabular-nums shadow-sm">
                <span dir="ltr" className="font-mono font-bold">
                  <NumberTicker value={sim.deltaHni} decimalPlaces={1} prefix={sim.deltaHni > 0 ? '+' : ''} />
                </span>
                <span>{t.unitPts}</span>
                <span className="opacity-80">
                  (<span dir="ltr" className="font-mono"><NumberTicker value={sim.pctReduction} />%</span> {t.reductionWord})
                </span>
              </span>
            </div>

            {/* Sub-indices Progress Bars using 21st.dev GlowProgressBar */}
            <div className="space-y-3.5 pt-2 text-xs">
            <GlowProgressBar
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              label={t.sliderEpi}
              value={sim.simEpi}
              valueText={`${sim.simEpi}`}
              gradientFrom="from-rose-500"
              gradientTo="to-red-600"
              glowColor="shadow-rose-500/25"
            />

            <GlowProgressBar
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              label={t.sliderPpi}
              value={baseIndices.ppi}
              valueText={`${baseIndices.ppi}`}
              gradientFrom="from-amber-500"
              gradientTo="to-orange-500"
              glowColor="shadow-amber-500/25"
            />

            <GlowProgressBar
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              label={t.sliderFsi}
              value={sim.simFsi}
              valueText={`${sim.simFsi}`}
              gradientFrom="from-sky-500"
              gradientTo="to-blue-600"
              glowColor="shadow-sky-500/25"
            />

            <GlowProgressBar
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              label={t.sliderWni}
              value={sim.simWni}
              valueText={`${sim.simWni}`}
              gradientFrom="from-emerald-500"
              gradientTo="to-teal-600"
              glowColor="shadow-emerald-500/25"
            />
          </div>

          <details className="rounded-xl border border-[color:var(--line)] bg-[color:var(--panel-2)] px-3.5 py-2.5">
            <summary className="cursor-pointer text-micro font-medium text-[color:var(--ink-2)] select-none">
              {t.modelAssumptionsTitle}
            </summary>
            <p className="mt-2 text-micro leading-relaxed text-[color:var(--muted)]">
              {t.modelAssumptionsBody}
            </p>
          </details>
          </div>

        </SpotlightCard>

        {/* Right: Policy Sliders & Projected Health Dividends (7 cols) */}
        <div className="lg:col-span-7 apple-card p-6 space-y-6 shadow-sm dark:shadow-md">
          <div className="flex items-center justify-between border-b border-[color:var(--line)] pb-3">
            <h3 className="font-semibold text-xs text-[color:var(--ink)]">
              {t.leversTitle}
            </h3>
            <span className="text-micro text-[color:var(--muted)]">{t.leversSub}</span>
          </div>

          {/* TRACK 1: DIRECT FINANCIAL & COMPENSATION PACKAGE */}
          <div className="p-4 rounded-2xl bg-[color:var(--panel-2)] border border-[color:var(--line)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[color:var(--line)] pb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h4 className="text-xs font-semibold text-[color:var(--ok)] dark:text-emerald-300">
                {t.trackFinancialTitle}
              </h4>
            </div>

            {/* Slider 1: Base Salary Hike */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <label className="text-[color:var(--ink)]">{t.sliderSalaryHike}</label>
                <span dir="ltr" className="font-semibold text-[color:var(--ok)] dark:text-emerald-300 tabular-nums bg-emerald-50 dark:bg-[color:var(--surface-3)] px-2.5 py-0.5 rounded-full border border-emerald-200 text-micro">
                  +{salaryHikePct}%
                </span>
              </div>
              <Slider
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                min={0}
                max={150}
                step={5}
                value={salaryHikePct}
                onChange={setSalaryHikePct}
                ariaLabel={t.sliderSalaryHike}
              />
              <p className="text-2xs text-[color:var(--muted)] leading-relaxed font-normal">
                {t.sourceRationaleSalary}
              </p>
            </div>

            {/* Slider 2: Hazard & Infection Pay */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <label className="text-[color:var(--ink)]">{t.sliderHazardPay}</label>
                <span dir="ltr" className="font-semibold text-[color:var(--ok)] dark:text-emerald-300 tabular-nums bg-emerald-50 dark:bg-[color:var(--surface-3)] px-2.5 py-0.5 rounded-full border border-emerald-200 text-micro">
                  +{hazardPayPct}%
                </span>
              </div>
              <Slider
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                min={0}
                max={200}
                step={10}
                value={hazardPayPct}
                onChange={setHazardPayPct}
                ariaLabel={t.sliderHazardPay}
              />
              <p className="text-2xs text-[color:var(--muted)] leading-relaxed font-normal">
                {t.sourceRationaleHazard}
              </p>
            </div>

            {/* Slider 3: Remote Housing & Hardship Allowance */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <label className="text-[color:var(--ink)]">{t.sliderIncentive}</label>
                <span dir="ltr" className="font-semibold text-[color:var(--ok)] dark:text-emerald-300 tabular-nums bg-emerald-50 dark:bg-[color:var(--surface-3)] px-2.5 py-0.5 rounded-full border border-emerald-200 text-micro">
                  +{stipendPct}%
                </span>
              </div>
              <Slider
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                min={0}
                max={100}
                step={5}
                value={stipendPct}
                onChange={setStipendPct}
                ariaLabel={t.sliderIncentive}
              />
              <p className="text-2xs text-[color:var(--muted)] leading-relaxed font-normal">
                {t.sourceRationaleStipend}
              </p>
            </div>
          </div>

          {/* TRACK 2: WORKPLACE SAFETY & CLINICAL FACILITIES */}
          <div className="p-4 rounded-2xl bg-[color:var(--panel-2)] border border-[color:var(--line)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[color:var(--line)] pb-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <h4 className="text-xs font-semibold text-[color:var(--info)] dark:text-sky-300">
                {t.trackFacilitiesTitle}
              </h4>
            </div>

            {/* Slider 4: Hospital Security Protection */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <label className="text-[color:var(--ink)]">{t.sliderSecurity}</label>
                <span dir="ltr" className="font-semibold text-[color:var(--info)] dark:text-sky-300 tabular-nums bg-sky-50 dark:bg-[color:var(--surface-3)] px-2.5 py-0.5 rounded-full border border-sky-200 text-micro">
                  +{securityPct}%
                </span>
              </div>
              <Slider
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                min={0}
                max={100}
                step={5}
                value={securityPct}
                onChange={setSecurityPct}
                ariaLabel={t.sliderSecurity}
              />
              <p className="text-2xs text-[color:var(--muted)] leading-relaxed font-normal">
                {t.sourceRationaleSecurity}
              </p>
            </div>

            {/* Slider 5: Critical Care & Dialysis Re-equipment */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <label className="text-[color:var(--ink)]">{t.sliderEquipment}</label>
                <span dir="ltr" className="font-semibold text-[color:var(--info)] dark:text-sky-300 tabular-nums bg-sky-50 dark:bg-[color:var(--surface-3)] px-2.5 py-0.5 rounded-full border border-sky-200 text-micro">
                  +{equipmentPct}%
                </span>
              </div>
              <Slider
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                min={0}
                max={100}
                step={5}
                value={equipmentPct}
                onChange={setEquipmentPct}
                ariaLabel={t.sliderEquipment}
              />
              <p className="text-2xs text-[color:var(--muted)] leading-relaxed font-normal">
                {t.sourceRationaleEquipment}
              </p>
            </div>

            {/* Slider 6: Mobile Response Clinics */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <label className="text-[color:var(--ink)]">{t.sliderClinics}</label>
                <span dir="ltr" className="font-semibold text-[color:var(--info)] dark:text-sky-300 tabular-nums bg-sky-50 dark:bg-[color:var(--surface-3)] px-2.5 py-0.5 rounded-full border border-sky-200 text-micro">
                  +{clinics}
                </span>
              </div>
              <Slider
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                min={0}
                max={50}
                step={1}
                value={clinics}
                onChange={setClinics}
                ariaLabel={t.sliderClinics}
              />
              <p className="text-2xs text-[color:var(--muted)] leading-relaxed font-normal">
                {t.sourceRationaleClinics}
              </p>
            </div>

            {/* Slider 7: Urban Greening & Cool Surfaces (NASA Heat Exposure Reduction) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <label className="text-[color:var(--ink)]">{t.sliderGreening}</label>
                <span dir="ltr" className="font-semibold text-[color:var(--info)] dark:text-sky-300 tabular-nums bg-sky-50 dark:bg-[color:var(--surface-3)] px-2.5 py-0.5 rounded-full border border-sky-200 text-micro">
                  +{greeningPct}%
                </span>
              </div>
              <Slider
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                min={0}
                max={30}
                step={1}
                value={greeningPct}
                onChange={setGreeningPct}
                ariaLabel={t.sliderGreening}
              />
              <p className="text-2xs text-[color:var(--muted)] leading-relaxed font-normal">
                {t.sourceRationaleGreening}
              </p>
            </div>
          </div>

          {/* Projected Dividends */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <SpotlightCard className="p-4 rounded-2xl bg-[color:var(--panel-2)] border border-[color:var(--line)] text-center shadow-xs">
              <span className="text-micro text-[color:var(--muted)] block font-medium">
                {t.erPressureReduction}
              </span>
              <div className="text-xl sm:text-2xl font-semibold text-[color:var(--ink)] mt-1 tabular-nums" dir="ltr">
                -<NumberTicker value={sim.erPressureReductionPct} suffix="%" />
              </div>
              <span className="text-2xs text-[color:var(--muted)] block mt-1">
                {t.scenarioIllustrativeNote}
              </span>
              <span className="text-2xs text-[color:var(--muted)] block mt-1 pt-1.5 border-t border-[color:var(--line)]">
                <span className="text-[color:var(--info)] dark:text-sky-400 font-semibold">{t.sourcePrefix || 'المصدر:'}</span> {t.sourceErPressureReduction}
              </span>
            </SpotlightCard>

            <SpotlightCard className="p-4 rounded-2xl bg-[color:var(--panel-2)] border border-[color:var(--line)] text-center shadow-xs">
              <span className="text-micro text-[color:var(--muted)] block font-medium">
                {t.retentionBoost}
              </span>
              <div className="text-xl sm:text-2xl font-semibold text-[color:var(--info)] dark:text-sky-400 mt-1 tabular-nums">
                +<NumberTicker value={sim.retentionGainPct} decimalPlaces={1} suffix="%" />
              </div>
              <span className="text-2xs text-[color:var(--muted)] block mt-1">
                {t.modeledResponseNote}
              </span>
              <span className="text-2xs text-[color:var(--muted)] block mt-1 pt-1.5 border-t border-[color:var(--line)]">
                <span className="text-[color:var(--info)] dark:text-sky-400 font-semibold">{t.sourcePrefix || 'المصدر:'}</span> {t.sourceProjectedRetention}
              </span>
            </SpotlightCard>
          </div>

        </div>

      </div>

      {/* 3 Executive Dashboards Required by NASA Challenge */}
      <div className="pt-6 border-t border-[color:var(--line)] space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[color:var(--panel-2)] border border-[color:var(--line-strong)] flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-[color:var(--info)] dark:text-sky-400" />
          </div>
          <h3 className="font-semibold text-base text-[color:var(--ink)]">
            {t.execChartsTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Executive Chart 1: Turnover Drivers Doughnut */}
          <div className="apple-card p-5 flex flex-col justify-between shadow-sm dark:shadow-md">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <PieChart className="w-4 h-4 text-[color:var(--danger)] dark:text-rose-400" />
                <h4 className="text-xs font-semibold text-[color:var(--ink)]">
                  {t.chartTurnoverTitle}
                </h4>
              </div>
              <span className="text-2xs text-[color:var(--muted)] block mb-2 font-medium">
                <span className="text-[color:var(--danger)] dark:text-rose-400 font-semibold">{t.sourcePrefix || 'المصدر:'}</span> {t.sourceExecTurnover}
              </span>
            </div>
            <div className="w-full flex items-center justify-center py-1">
              {donutData && donutData.length > 0 ? (
                <DonutChart
                  data={donutData}
                  layout="vertical"
                  size={164}
                  innerRadius={50}
                  outerRadius={72}
                  strokeWidth={2.5}
                  hoverOffset={6}
                  totalLabel={lang === 'ar' ? 'الإجمالي' : 'Total'}
                  totalSuffix="%"
                  centerSublabel={lang === 'ar' ? 'نسبة' : 'Share'}
                  legendClassName="w-full mt-2"
                />
              ) : (
                <p className="text-xs text-[color:var(--muted)] px-4 text-center leading-relaxed">{t.chartNoFieldData}</p>
              )}
            </div>
          </div>

          {/* Executive Chart 2: Migration Risk vs Demand */}
          <div className="apple-card p-5 flex flex-col gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <BarChart3 className="w-4 h-4 text-[color:var(--info)] dark:text-sky-400" />
                <h4 className="text-xs font-semibold text-[color:var(--ink)]">
                  {t.chartMigrationTitle}
                </h4>
              </div>
              <span className="text-2xs text-[color:var(--muted)] block font-medium">
                <span className="text-[color:var(--info)] dark:text-sky-400 font-semibold">{t.sourcePrefix || 'المصدر:'}</span> {t.sourceExecMigration}
              </span>
            </div>
            <div className="flex-1 min-h-[180px] w-full">
              {migrationChartData ? (
                <Bar
                  data={migrationChartData}
                  options={barChartOptions(theme)}
                />
              ) : (
                <p className="h-full flex items-center justify-center text-xs text-[color:var(--muted)] px-4 text-center leading-relaxed">{t.chartNoFieldData}</p>
              )}
            </div>
          </div>

          {/* Executive Chart 3: Governorate Priority Matrix */}
          <div className="apple-card p-5 flex flex-col gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-[color:var(--warn)] dark:text-amber-400" />
                <h4 className="text-xs font-semibold text-[color:var(--ink)]">
                  {t.chartPriorityTitle}
                </h4>
              </div>
              <span className="text-2xs text-[color:var(--muted)] block font-medium">
                <span className="text-[color:var(--warn)] dark:text-amber-400 font-semibold">{t.sourcePrefix || 'المصدر:'}</span> {t.sourceExecPriority}
              </span>
            </div>
            <div className="flex-1 min-h-[180px] w-full">
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
        <div className="space-y-6 animate-fadeIn">
          {/* Top 3 Empirical Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SpotlightCard className="p-5 border-l-4 border-l-emerald-500 space-y-2">
              <Badge variant="success" className="text-2xs font-bold py-0.5">
                {lang === 'ar' ? 'الصحة العالمية EMHJ (2021)' : 'WHO EMHJ (2021)'}
              </Badge>
              <div className="text-2xl font-bold text-[color:var(--ink)] tabular-nums">
                <NumberTicker value={97.4} decimalPlaces={1} suffix="%" />
              </div>
              <p className="text-xs text-[color:var(--ink-2)] leading-relaxed">
                {t.evidenceWhoStat}
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-5 border-l-4 border-l-sky-500 space-y-2">
              <Badge variant="default" className="text-2xs font-bold py-0.5">
                {lang === 'ar' ? 'أكسفورد Int Health (2015)' : 'Oxford Int Health (2015)'}
              </Badge>
              <div className="text-2xl font-bold text-[color:var(--ink)] tabular-nums">
                <NumberTicker value={81.8} decimalPlaces={1} suffix="%" />
              </div>
              <p className="text-xs text-[color:var(--ink-2)] leading-relaxed">
                {t.evidenceOxfordStat}
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-5 border-l-4 border-l-amber-500 space-y-2">
              <Badge variant="warning" className="text-2xs font-bold py-0.5">
                {lang === 'ar' ? 'مجلة MDPI للعلوم الاجتماعية (2025)' : 'MDPI Social Sciences (2025)'}
              </Badge>
              <div className="text-2xl font-bold text-[color:var(--ink)] tabular-nums">
                {lang === 'ar' ? (
                  <><NumberTicker value={20.0} decimalPlaces={1} suffix="×" /> أرجحية</>
                ) : (
                  <><NumberTicker value={20.0} decimalPlaces={1} suffix="×" /> Odds</>
                )}
              </div>
              <p className="text-xs text-[color:var(--ink-2)] leading-relaxed">
                {t.evidenceMdpiStat}
              </p>
            </SpotlightCard>
          </div>

          {/* Detailed Peer-Reviewed Studies */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[color:var(--line)] mb-1">
              <FileText className="w-4 h-4 text-[color:var(--info)] dark:text-sky-400" />
              <h3 className="text-sm font-semibold text-[color:var(--ink)]">
                {t.researchEvidenceTitle}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {MIGRATION_RESEARCH_STUDIES.map((study) => (
                <div key={study.id} className="apple-card p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[color:var(--line)] pb-3">
                    <div>
                      <Badge variant="default" className="text-2xs font-bold py-0.5">
                        {(lang === 'ar' ? study.journal_ar : study.journal_en) || study.journal} ({study.year})
                      </Badge>
                      <a
                        href={study.url || study.doi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[color:var(--ink)] mt-1.5 leading-snug hover:text-[color:var(--info)] dark:hover:text-sky-400 block transition-colors"
                      >
                        {study.citation}
                      </a>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      {study.pubmed && (
                        <a
                          href={study.pubmed}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-micro text-[color:var(--ok)] hover:text-[color:var(--ok)] dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 font-semibold transition-colors"
                        >
                          <span>PubMed</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {study.researchgate && (
                        <a
                          href={study.researchgate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-micro text-[color:var(--info)] hover:underline flex items-center gap-1 font-medium transition-colors"
                        >
                          <span>ResearchGate</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <a
                        href={study.url || study.doi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-micro text-[color:var(--info)] hover:text-[color:var(--info)] dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1 font-medium transition-colors"
                      >
                        <span>{study.id === 'mdpi_societies_2025' ? (lang === 'ar' ? 'المستودع الأكاديمي' : 'Open Access') : 'DOI'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <p className="text-xs text-[color:var(--ink-2)] leading-relaxed bg-[color:var(--panel-2)] p-3 rounded-xl border border-[color:var(--line)]">
                    {lang === 'ar' ? study.narrative_ar : study.narrative_en}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="bg-[color:var(--panel-2)] p-3 rounded-xl border border-[color:var(--line)]">
                      <span className="text-2xs text-[color:var(--muted)] block font-medium mb-1">
                        {t.researchStudyCohort}
                      </span>
                      <span className="text-[color:var(--ink)] text-micro leading-relaxed block">
                        {(lang === 'ar' ? study.cohort_ar : study.cohort_en) || study.cohort} ({t.sampleSizeLabel} {study.sample_size})
                      </span>
                    </div>

                    <div className="bg-[color:var(--panel-2)] p-3 rounded-xl border border-[color:var(--line)]">
                      <span className="text-2xs text-[color:var(--muted)] block font-medium mb-1">
                        {t.researchKeyMetrics}
                      </span>
                      <div className="space-y-1 text-micro text-[color:var(--ink)]">
                        {study.key_findings.migration_intent_pct && (
                          <div className="flex justify-between items-center">
                            <span className="text-[color:var(--ink-2)]">{t.metricMigrationIntent}</span>
                            <span className="font-semibold text-[color:var(--danger)] dark:text-rose-300 tabular-nums">{study.key_findings.migration_intent_pct}%</span>
                          </div>
                        )}
                        {study.key_findings.retention_willingness_if_improved_pct && (
                          <div className="flex justify-between items-center">
                            <span className="text-[color:var(--ink-2)]">{t.metricWillingToStay}</span>
                            <span className="font-semibold text-[color:var(--ok)] dark:text-emerald-300 tabular-nums">{study.key_findings.retention_willingness_if_improved_pct}%</span>
                          </div>
                        )}
                        {study.key_findings.plan_to_return_after_training_pct && (
                          <div className="flex justify-between items-center">
                            <span className="text-[color:var(--ink-2)]">{t.metricPlanToReturn}</span>
                            <span className="font-semibold text-[color:var(--info)] dark:text-sky-300 tabular-nums">{study.key_findings.plan_to_return_after_training_pct}%</span>
                          </div>
                        )}
                        {study.key_findings.work_dissatisfaction_odds_ratio && (
                          <div className="flex justify-between items-center">
                            <span className="text-[color:var(--ink-2)]">{t.metricWorkDissatisfaction}</span>
                            <span className="font-semibold text-[color:var(--warn)] dark:text-amber-300 tabular-nums">{study.key_findings.work_dissatisfaction_odds_ratio}× {t.oddsUnit}</span>
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
            <div className="flex items-center gap-2 pb-3 border-b border-[color:var(--line)] mb-1">
              <ShieldCheck className="w-4 h-4 text-[color:var(--ok)] dark:text-emerald-400" />
              <h3 className="text-xs font-semibold text-[color:var(--ink)]">
                {t.actionablePolicyDrivers}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCUMENTED_MIGRATION_DRIVERS.map(driver => (
                <div key={driver.id} className="p-3.5 rounded-xl bg-[color:var(--panel-2)] border border-[color:var(--line)] space-y-1.5">
                  <span className="text-xs font-semibold text-[color:var(--ink)] block">
                    {lang === 'ar' ? driver.ar : driver.en}
                  </span>
                  <div className="text-micro text-[color:var(--danger)] dark:text-rose-300/90 font-medium">
                    📌 {lang === 'ar' ? driver.evidence_stat_ar : driver.evidence_stat}
                  </div>
                  <div className="text-micro text-[color:var(--ok)] dark:text-emerald-300 font-medium pt-1 border-t border-[color:var(--line)]">
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
