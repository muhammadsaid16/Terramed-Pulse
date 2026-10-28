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
import { Sliders, ShieldCheck, TrendingDown, Users, HeartHandshake, BarChart3, PieChart } from 'lucide-react';
import { simulatePolicyInterventions } from '../lib/trendEngine';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function DecisionMaker({
  selectedGov,
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
      clinics,
      stipendPct,
      greeningPct
    );
  }, [baseIndices, clinics, stipendPct, greeningPct]);

  // Executive Chart 1: Primary Drivers of Turnover (computed live from reports)
  const turnoverChartData = useMemo(() => {
    const counts = {
      salary: 0,
      burnout: 0,
      equipment: 0,
      workload: 0,
      training: 0
    };

    reports.forEach(r => {
      const reason = (r.primary_reason || 'salary').toLowerCase();
      if (counts[reason] !== undefined) counts[reason]++;
      else counts.salary++;
    });

    const labels = lang === 'ar'
      ? ['الراتب والمعيشة', 'بيئة العمل والإرهاق', 'نقص الأجهزة', 'التكدس السكاني', 'غياب التدريب']
      : ['Salary & Living', 'Burnout & Environment', 'Medical Equipment', 'Workload & Pop', 'Training Gap'];

    return {
      labels,
      datasets: [
        {
          data: [counts.salary, counts.burnout, counts.equipment, counts.workload, counts.training],
          backgroundColor: [
            '#F43F5E', // Rose
            '#F59E0B', // Amber
            '#38BDF8', // Sky
            '#A855F7', // Purple
            '#10B981'  // Emerald
          ],
          borderColor: '#0B1120',
          borderWidth: 2
        }
      ]
    };
  }, [reports, lang]);

  // Executive Chart 2: Migration Risk vs Climate Demand
  const migrationChartData = useMemo(() => {
    const specialtiesList = ['nephrology', 'pulmonology', 'cardiology', 'emergency', 'pediatrics'];
    const specLabels = lang === 'ar'
      ? ['كلى', 'صدرية', 'قلب', 'طوارئ', 'أطفال']
      : ['Nephrology', 'Pulmonology', 'Cardiology', 'Emergency', 'Pediatrics'];

    // Calculate migration intent ratio per specialty from reports
    const migrationRates = specialtiesList.map(spec => {
      const specReports = reports.filter(r => r.specialty === spec);
      if (specReports.length === 0) return 60;
      const migrating = specReports.filter(r => (r.considering_migration || '').toLowerCase() === 'yes').length;
      return Math.round((migrating / specReports.length) * 100);
    });

    // Environmental sensitivity demand scores
    const climateDemandScores = [92, 85, 78, 88, 72];

    return {
      labels: specLabels,
      datasets: [
        {
          label: lang === 'ar' ? 'نسبة نية الهجرة (%)' : 'Migration Intent (%)',
          data: migrationRates,
          backgroundColor: 'rgba(244, 63, 94, 0.7)',
          borderRadius: 6
        },
        {
          label: lang === 'ar' ? 'درجة الاحتياج المناخي' : 'Climate Demand Score',
          data: climateDemandScores,
          backgroundColor: 'rgba(20, 184, 166, 0.7)',
          borderRadius: 6
        }
      ]
    };
  }, [reports, lang]);

  // Executive Chart 3: Governorate Priority Matrix (HNI vs EPI)
  const priorityChartData = useMemo(() => {
    if (!allGovs) return { labels: [], datasets: [] };
    const govIds = Object.keys(allGovs);
    const labels = govIds.map(id => lang === 'ar' ? allGovs[id].name_ar : allGovs[id].name_en);
    const hniScores = govIds.map(id => allGovs[id].baseline_indices?.hni || 70);
    const epiScores = govIds.map(id => allGovs[id].baseline_indices?.epi || 65);

    return {
      labels,
      datasets: [
        {
          label: 'HNI (Overall Need)',
          data: hniScores,
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderRadius: 6
        },
        {
          label: 'EPI (NASA Climate Pressure)',
          data: epiScores,
          backgroundColor: 'rgba(56, 189, 248, 0.8)',
          borderRadius: 6
        }
      ]
    };
  }, [allGovs, lang]);

  const govName = lang === 'ar' ? govData?.name_ar : govData?.name_en;

  return (
    <section id="section-decision" className="apple-glass p-5 lg:p-6 mb-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-teal-400" />
          <h2 className="text-xl font-black text-slate-100">
            {t.module4Title}
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {t.module4Subtitle}
        </p>
      </div>

      {/* Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Composite HNI Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-space-950/80 p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="font-bold text-xs text-slate-200">
              {t.hniSummaryTitle}
            </h3>
            <span className="text-[11px] text-teal-400 font-bold bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-500/30">
              {govName}
            </span>
          </div>

          {/* Large Numerical Indicator */}
          <div className="flex items-center justify-around py-2">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                {t.currentHni}
              </span>
              <div className="text-3xl font-black text-rose-400 tabular-nums">
                {baseIndices.hni}
              </div>
            </div>
            <div className="text-slate-500 font-light text-2xl">→</div>
            <div className="text-center">
              <span className="text-[10px] text-emerald-400 block uppercase tracking-wider">
                {t.simulatedHni}
              </span>
              <div className="text-3xl font-black text-emerald-400 tabular-nums">
                {sim.simHni}
              </div>
            </div>
          </div>

          <div className="text-center">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 tabular-nums shadow-sm">
              {sim.deltaHni} pts ({sim.pctReduction}% reduction)
            </span>
          </div>

          {/* Sub-indices Progress Bars */}
          <div className="space-y-3 pt-2 text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1 font-semibold">
                <span className="text-slate-300">Environmental Pressure (EPI - 35%)</span>
                <span className="text-rose-400 tabular-nums">{sim.simEpi}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, sim.simEpi)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1 font-semibold">
                <span className="text-slate-300">Population Pressure (PPI - 30%)</span>
                <span className="text-amber-400 tabular-nums">{baseIndices.ppi}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, baseIndices.ppi)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1 font-semibold">
                <span className="text-slate-300">Facility Shortage (FSI - 20%)</span>
                <span className="text-blue-400 tabular-nums">{sim.simFsi}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, sim.simFsi)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1 font-semibold">
                <span className="text-slate-300">Physician Shortage (WNI - 15%)</span>
                <span className="text-teal-400 tabular-nums">{sim.simWni}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, sim.simWni)}%` }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right: Policy Sliders & Projected Health Dividends (7 cols) */}
        <div className="lg:col-span-7 bg-space-950/80 p-5 rounded-2xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="font-bold text-xs text-slate-200">
              {t.leversTitle}
            </h3>
            <span className="text-[11px] text-slate-400">{t.leversSub}</span>
          </div>

          {/* Slider 1: Clinics */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label className="text-slate-300">{t.sliderClinics}</label>
              <span className="font-bold text-teal-400 tabular-nums bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30">
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
            <div className="flex justify-between text-xs font-semibold">
              <label className="text-slate-300">{t.sliderIncentive}</label>
              <span className="font-bold text-teal-400 tabular-nums bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30">
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
            <div className="flex justify-between text-xs font-semibold">
              <label className="text-slate-300">{t.sliderGreening}</label>
              <span className="font-bold text-teal-400 tabular-nums bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30">
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
            <div className="apple-glass-card p-3.5 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">
                {t.admissionsPrevented}
              </span>
              <div className="text-2xl font-black text-teal-300 mt-1 tabular-nums">
                {sim.preventedAdmissions.toLocaleString()}
              </div>
            </div>

            <div className="apple-glass-card p-3.5 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">
                {t.retentionBoost}
              </span>
              <div className="text-2xl font-black text-blue-300 mt-1 tabular-nums">
                +{sim.retentionGainPct}%
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3 Executive Dashboards Required by NASA Challenge */}
      <div className="pt-4 border-t border-white/10 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-400" />
          <h3 className="font-extrabold text-sm text-slate-100">
            {t.execChartsTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Executive Chart 1: Turnover Drivers Doughnut */}
          <div className="bg-space-950/80 p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-4 h-4 text-rose-400" />
              <h4 className="text-xs font-bold text-slate-200">
                {t.chartTurnoverTitle}
              </h4>
            </div>
            <div className="h-[180px] w-full flex items-center justify-center">
              <Doughnut
                data={turnoverChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 9 }, color: '#94A3B8' } }
                  }
                }}
              />
            </div>
          </div>

          {/* Executive Chart 2: Migration Risk vs Demand */}
          <div className="bg-space-950/80 p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-teal-400" />
              <h4 className="text-xs font-bold text-slate-200">
                {t.chartMigrationTitle}
              </h4>
            </div>
            <div className="h-[180px] w-full">
              <Bar
                data={migrationChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 9 }, color: '#94A3B8' } }
                  },
                  scales: {
                    x: { ticks: { font: { size: 9 }, color: '#64748B' } },
                    y: { max: 100, ticks: { font: { size: 9 }, color: '#64748B' } }
                  }
                }}
              />
            </div>
          </div>

          {/* Executive Chart 3: Governorate Priority Matrix */}
          <div className="bg-space-950/80 p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-slate-200">
                {t.chartPriorityTitle}
              </h4>
            </div>
            <div className="h-[180px] w-full">
              <Bar
                data={priorityChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 9 }, color: '#94A3B8' } }
                  },
                  scales: {
                    x: { ticks: { font: { size: 9 }, color: '#64748B' } },
                    y: { max: 100, ticks: { font: { size: 9 }, color: '#64748B' } }
                  }
                }}
              />
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
