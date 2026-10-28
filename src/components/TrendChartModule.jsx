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
  onOpenMath
}) {
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
          label: `${t[`var_${selectedVar}`] || selectedVar} ${isAnomaly ? '(Anomaly)' : ''}`,
          data: displaySeries,
          borderColor: '#0A84FF',
          backgroundColor: 'rgba(10, 132, 255, 0.08)',
          pointBackgroundColor: years.map(yr => yr === currentYear ? '#FF453A' : '#0A84FF'),
          pointBorderColor: years.map(yr => yr === currentYear ? '#FFFFFF' : '#05070D'),
          pointRadius: years.map(yr => yr === currentYear ? 6 : 3),
          pointHoverRadius: 6,
          borderWidth: 2.2,
          tension: 0.35,
          fill: true,
          order: 2
        },
        {
          label: 'OLS Linear Trendline',
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
  }, [years, displaySeries, regression, selectedVar, isAnomaly, currentYear, t]);

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
          color: '#94A3B8',
          font: { family: 'Inter', size: 11 },
          boxWidth: 14,
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#F8FAFC',
        bodyColor: '#2DD4BF',
        borderColor: 'rgba(45, 212, 191, 0.3)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 10,
        titleFont: { weight: 'bold' }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748B', font: { size: 10 }, maxTicksLimit: 11 }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748B', font: { size: 10 } }
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
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white/[0.03] backdrop-blur-xl p-3 rounded-2xl border border-white/[0.08]">
        
        {/* Governorate Selector */}
        <div className="sm:col-span-4">
          <label className="text-[11px] font-medium text-white/50 block mb-1">
            {t.govSelectorLabel}
          </label>
          <select
            value={selectedGov}
            onChange={(e) => setSelectedGov(e.target.value)}
            className="w-full bg-[#0E1320] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-medium outline-none focus:border-white/30 transition-colors"
          >
            {Object.keys(allGovs || {}).map(id => (
               <option key={id} value={id}>
                {lang === 'ar' ? allGovs[id].name_ar : allGovs[id].name_en}
              </option>
            ))}
          </select>
        </div>

        {/* NASA Variable Selector */}
        <div className="sm:col-span-5">
          <label className="text-[11px] font-medium text-white/50 block mb-1">
            {t.varSelectorLabel}
          </label>
          <select
            value={selectedVar}
            onChange={(e) => setSelectedVar(e.target.value)}
            className="w-full bg-[#0E1320] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-medium outline-none focus:border-white/30 transition-colors"
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
            className={`apple-chip w-full py-1.5 px-3 rounded-xl text-[11px] font-medium border transition-all flex items-center justify-center gap-1.5 ${
              isAnomaly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                : 'bg-white/[0.05] text-white/70 border-white/10 hover:bg-white/[0.1] hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isAnomaly ? 'Anomaly Mode' : 'Raw Values'}</span>
          </button>
        </div>

      </div>

      {/* Chart Canvas Container */}
      <div className="apple-glass p-5 rounded-3xl min-h-[300px] flex-1 flex flex-col justify-between shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold text-white/90">
              {govName} — {t[`var_${selectedVar}`] || selectedVar} (1995-2025)
            </span>
          </div>
          <span className="text-[10px] text-white/40 tabular-nums font-medium">
            {isAnomaly ? 'Baseline: 1995–2005' : 'Continuous 31-Yr Annual Orbit'}
          </span>
        </div>

        <div className="h-[240px] w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Statistical Proof Card */}
      <div className="apple-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-white/[0.08] text-white/90 font-mono text-[10px] font-semibold flex items-center justify-center border border-white/10">
              MK
            </span>
            <h4 className="text-xs font-semibold text-white/90">{t.statTitle}</h4>
          </div>

          <button
            onClick={onOpenMath}
            className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors"
          >
            <Info className="w-3 h-3" />
            <span>Methodology</span>
          </button>
        </div>

        {/* Significance Badge */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium ${
            mkTest.isSignificant
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'bg-white/[0.05] text-white/50 border border-white/10'
          }`}>
            {mkTest.isSignificant ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>{mkTest.badgeText}</span>
          </span>

          <span className="text-xs font-semibold text-white tabular-nums">
            {regression.ratePerDecade >= 0 ? '+' : ''}
            {regression.ratePerDecade.toFixed(3)} / decade
          </span>
        </div>

        {/* Math Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
          <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06]">
            <span className="text-[10px] text-white/40 block font-medium">{t.mkStatLabel}</span>
            <span className="font-semibold text-white tabular-nums">
              {mkTest.s > 0 ? `+${mkTest.s}` : mkTest.s}
            </span>
          </div>

          <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06]">
            <span className="text-[10px] text-white/40 block font-medium">{t.zScoreLabel}</span>
            <span className="font-semibold text-sky-400 tabular-nums">
              {mkTest.z.toFixed(2)}
            </span>
          </div>

          <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06]">
            <span className="text-[10px] text-white/40 block font-medium">{t.pValueLabel}</span>
            <span className="font-semibold text-amber-300 tabular-nums">
              {mkTest.pValue < 0.0001 ? '< 0.0001' : mkTest.pValue.toFixed(4)}
            </span>
          </div>

          <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06]">
            <span className="text-[10px] text-white/40 block font-medium">{t.ci95Label}</span>
            <span className="font-semibold text-white/80 tabular-nums text-[11px]">
              [{regression.ci95Lower.toFixed(2)}, {regression.ci95Upper.toFixed(2)}]
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
