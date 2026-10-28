import React from 'react';
import { Flame, AlertTriangle, Stethoscope, ArrowLeftRight } from 'lucide-react';

export default function KpiStrip({ t, reportsCount = 45 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* KPI 1: Warming Rate */}
      <div className="apple-card p-5 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium text-white/45 uppercase tracking-[0.05em]">
            {t.kpiWarmingLabel}
          </span>
          <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-semibold tracking-tight text-white tabular-nums">
          {t.kpiWarmingRate}
        </div>
        <p className="text-xs text-white/45 mt-1 font-normal leading-normal">{t.kpiWarmingSub}</p>
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI 2: Highest Need */}
      <div className="apple-card p-5 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium text-white/45 uppercase tracking-[0.05em]">
            {t.kpiHighestNeedLabel}
          </span>
          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-semibold tracking-tight text-white tabular-nums">
          {t.kpiHighestNeed}
        </div>
        <p className="text-xs text-white/45 mt-1 font-normal leading-normal">{t.kpiHighestNeedSub}</p>
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI 3: Verified Field Doctors */}
      <div className="apple-card p-5 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium text-white/45 uppercase tracking-[0.05em]">
            {t.kpiTotalDoctorsLabel}
          </span>
          <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Stethoscope className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-semibold tracking-tight text-white tabular-nums">
          {reportsCount}+ <span className="text-lg font-normal text-white/50">{t.kpiTotalDoctors}</span>
        </div>
        <p className="text-xs text-white/45 mt-1 font-normal leading-normal">{t.kpiTotalDoctorsSub}</p>
        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI 4: Climate Divergence */}
      <div className="apple-card p-5 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium text-white/45 uppercase tracking-[0.05em]">
            {t.kpiTrendDivergenceLabel}
          </span>
          <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-semibold tracking-tight text-white leading-tight">
          {t.kpiTrendDivergence}
        </div>
        <p className="text-xs text-white/45 mt-1 font-normal leading-normal">{t.kpiTrendDivergenceSub}</p>
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
      </div>

    </div>
  );
}
