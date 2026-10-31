import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { CheckCircle2, AlertCircle, Info, TrendingUp, Activity } from 'lucide-react';
import { linearRegression, mannKendall, deseasonalize } from '../lib/trendEngine';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TrendChartModule({
  govData,
  selectedGov,
  setSelectedGov,
  selectedVar,
  setSelectedVar,
  allGovs,
  isAnomaly,
  setIsAnomaly,
  currentYear,
  t,
  lang,
  theme = 'light',
  onOpenMath
}) {
  const isDark = theme === 'dark';
  const years = useMemo(() => Array.from({ length: 31 }, (_, i) => 1995 + i), []);

  const rawSeries = useMemo(() => {
    if (!govData?.series?.[selectedVar]) {
      return Array(31).fill(0);
    }
    return govData.series[selectedVar];
  }, [govData, selectedVar]);

  // Compute Deseasonalized Anomaly
  const displaySeries = useMemo(() => {
    if (isAnomaly) {
      return deseasonalize(rawSeries, 1995, 2005, 1995);
    }
    return rawSeries;
  }, [rawSeries, isAnomaly]);

  // Compute Linear Regression
  const regression = useMemo(() => {
    return linearRegression(years, displaySeries);
  }, [years, displaySeries]);

  // Compute Mann-Kendall Trend Test
  const mkTest = useMemo(() => {
    return mannKendall(displaySeries);
  }, [displaySeries]);

  // Chart datasets
  const chartData = useMemo(() => {
    const trendlineData = years.map(yr => regression.slope * yr + regression.intercept);

    return {
      labels: years,
      datasets: [
        {
          label: `${t[`var_${selectedVar}`] || selectedVar} ${isAnomaly ? t.anomalySuffix : ''}`,
          data: displaySeries,
          borderColor: isDark ? '#0A84FF' : '#0284C7',
          backgroundColor: isDark ? 'rgba(10, 132, 255, 0.08)' : 'rgba(2, 132, 199, 0.08)',
          pointBackgroundColor: years.map(yr => yr === currentYear ? '#FF453A' : (isDark ? '#0A84FF' : '#0284C7')),
          pointBorderColor: years.map(yr => yr === currentYear ? '#FFFFFF' : (isDark ? '#05070D' : '#FFFFFF')),
          pointRadius: years.map(yr => yr === currentYear ? 6 : 3.5),
          pointHoverRadius: 6.5,
          borderWidth: 2.2,
          tension: 0.35,
          fill: true,
          order: 2
        },
        {
          label: t.trendlineOls,
          data: trendlineData,
          borderColor: '#FF453A',
          borderWidth: 1.8,
          borderDash: [5, 4],
          pointRadius: 0,
          fill: false,
          order: 1
        }
      ]
    };
  }, [years, displaySeries, regression, selectedVar, isAnomaly, currentYear, t, lang, isDark]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#94A3B8' : '#334155',
          font: { family: 'Inter', size: 11, weight: '500' },
          boxWidth: 14,
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.96)',
        titleColor: isDark ? '#F8FAFC' : '#0F172A',
        bodyColor: isDark ? '#2DD4BF' : '#0284C7',
        borderColor: isDark ? 'rgba(45, 212, 191, 0.3)' : 'rgba(2, 132, 199, 0.25)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 10,
        titleFont: { weight: 'bold' }
      }
    },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.06)' },
        ticks: { color: isDark ? '#64748B' : '#64748B', font: { size: 10 }, maxTicksLimit: 11 }
      },
      y: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.06)' },
        ticks: { color: isDark ? '#64748B' : '#64748B', font: { size: 10 } }
      }
    }
  };

  const govName = lang === 'ar' ? govData?.name_ar : govData?.name_en;

  const variablesList = [
    { id: 'T2M_MAX', label: t.var_T2M_MAX },
    { id: 'T2M', label: t.var_T2M },
    { id: 'RH2M', label: t.var_RH2M },
    { id: 'ALLSKY_SFC_SW_DWN', label: t.var_ALLSKY_SFC_SW_DWN },
    { id: 'EXTREME_HEAT_DAYS', label: t.var_EXTREME_HEAT_DAYS },
    { id: 'AOD_550', label: t.var_AOD_550 },
    { id: 'NDVI', label: t.var_NDVI },
    { id: 'LST_DAY', label: t.var_LST_DAY },
    { id: 'SOIL_MOISTURE', label: t.var_SOIL_MOISTURE }
  ];

  return (
    <div className="flex flex-col space-y-4 h-full">
      
      {/* Top Selectors: Governorate, NASA Variable, Anomaly Toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-100/80 dark:bg-white/[0.03] backdrop-blur-xl p-3 rounded-2xl border border-slate-200/90 dark:border-white/[0.08]">
        
        {/* Governorate Selector */}
        <div className="sm:col-span-3">
          <label className="text-micro font-medium text-slate-600 dark:text-white/50 block mb-1">
            {t.govSelectorLabel}
          </label>
          <select
            value={selectedGov}
            onChange={(e) => setSelectedGov(e.target.value)}
            className="w-full bg-white text-slate-800 border-slate-200 dark:bg-[#0E1320] dark:border-white/10 rounded-xl px-3 py-1.5 text-xs dark:text-white font-medium outline-none focus:border-sky-500 transition-colors shadow-sm"
          >
            {Object.keys(allGovs || {}).map(id => (
               <option key={id} value={id}>
                {lang === 'ar' ? allGovs[id].name_ar : allGovs[id].name_en}
              </option>
            ))}
          </select>
        </div>

        {/* NASA Variable Selector */}
        <div className="sm:col-span-6">
          <label className="text-micro font-medium text-slate-600 dark:text-white/50 block mb-1">
            {t.varSelectorLabel}
          </label>
          <select
            value={selectedVar}
            onChange={(e) => setSelectedVar(e.target.value)}
            className="w-full bg-white text-slate-800 border-slate-200 dark:bg-[#0E1320] dark:border-white/10 rounded-xl px-3 py-1.5 text-xs dark:text-white font-medium outline-none focus:border-sky-500 transition-colors shadow-sm"
          >
            {variablesList.map(v => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* Anomaly Mode Toggle */}
        <div className="sm:col-span-3 flex flex-col justify-end">
          <button
            onClick={() => setIsAnomaly(!isAnomaly)}
            className={`apple-chip w-full py-1.5 px-3 rounded-xl text-micro font-medium border transition-all flex items-center justify-center gap-1.5 shadow-sm ${
              isAnomaly
                ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-white/[0.05] dark:text-white/70 dark:border-white/10 dark:hover:bg-white/[0.1] dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isAnomaly ? t.anomalyMode : t.rawValues}</span>
          </button>
        </div>

      </div>

      {/* Sensor Operational Window Note (MODIS Terra 2000-2025 vs 1995-1999 baseline) */}
      {(selectedVar === 'NDVI' || selectedVar === 'LST_DAY') && (
        <div className="flex items-center gap-2 text-micro text-amber-800 bg-amber-50 border border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/25 px-3.5 py-2 rounded-xl">
          <Info className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{t.sensorModisNote}</span>
        </div>
      )}

      {/* Chart Canvas Bento Container */}
      <div className="bento-card p-4 sm:p-5 min-h-[300px] flex-1 flex flex-col justify-between shadow-md dark:shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-900 dark:text-white/95">
              {govName}: {t[`var_${selectedVar}`] || selectedVar} (1995-2025)
            </span>
          </div>
          <span className="satellite-chip text-2xs text-slate-500 dark:text-white/50">
            {isAnomaly ? t.anomalyBaselineChip : t.continuousOrbitChip}
          </span>
        </div>

        {/* Dedicated Sensor Micro-Badge */}
        <div className="mb-2 text-2xs text-slate-500 dark:text-white/40 flex items-center gap-1.5 font-medium">
          <span className="text-sky-600 dark:text-sky-400 font-semibold">{t.sourcePrefix || 'المصدر:'}</span>
          <span>{t[`sensorSource_${selectedVar}`] || 'NASA Earth Observation Telemetry'}</span>
        </div>

        <div className="h-[220px] sm:h-[240px] w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Statistical Proof Bento Card */}
      <div className="bento-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-2">
          <div className="flex items-center gap-2">
            <span className="satellite-chip text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-sky-950/40 dark:border-sky-800/40">
              {t.mannKendallSuite}
            </span>
          </div>

          <button
            onClick={onOpenMath}
            className="text-micro text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1 font-medium transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{t.methodologyLink}</span>
          </button>
        </div>

        {/* Significance Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium ${
            mkTest.isSignificant
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
              : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-white/[0.05] dark:text-white/50 dark:border-white/10'
          }`}>
            {mkTest.isSignificant ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>
              {t[mkTest.badgeKey]}
            </span>
          </span>

          <span className="text-xs font-bold text-slate-900 dark:text-white telemetry-mono">
            {regression.ratePerDecade >= 0 ? '+' : ''}
            {regression.ratePerDecade.toFixed(3)} {t.perDecade}
          </span>
        </div>

        {/* Telemetry Math Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
          <div className="bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
            <span className="text-2xs text-slate-500 dark:text-white/40 block font-medium mb-0.5">{t.mkStatLabel}</span>
            <span className="font-bold text-slate-900 dark:text-white telemetry-mono text-sm">
              {mkTest.s > 0 ? `+${mkTest.s}` : mkTest.s}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
            <span className="text-2xs text-slate-500 dark:text-white/40 block font-medium mb-0.5">{t.zScoreLabel}</span>
            <span className="font-bold text-sky-600 dark:text-sky-400 telemetry-mono text-sm">
              {mkTest.z.toFixed(2)}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
            <span className="text-2xs text-slate-500 dark:text-white/40 block font-medium mb-0.5">{t.pValueLabel}</span>
            <span className="font-bold text-amber-600 dark:text-amber-300 telemetry-mono text-sm">
              {mkTest.pValue < 0.0001 ? '< 0.0001' : mkTest.pValue.toFixed(4)}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
            <span className="text-2xs text-slate-500 dark:text-white/40 block font-medium mb-0.5">{t.ci95Label}</span>
            <span className="font-bold text-slate-700 dark:text-white/80 telemetry-mono text-micro">
              [{regression.ci95Lower.toFixed(2)}, {regression.ci95Upper.toFixed(2)}]
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
