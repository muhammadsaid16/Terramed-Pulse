import React from 'react';
import { Flame, AlertTriangle, Stethoscope, ArrowLeftRight } from 'lucide-react';

export default function KpiStrip({ t, reportsCount = 45 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* KPI 1 */}
      <div className="apple-glass p-4 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {t.kpiWarmingLabel}
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
        </div>
        <div className="text-2xl font-black text-rose-400 tabular-nums">
          {t.kpiWarmingRate}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">{t.kpiWarmingSub}</p>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500/0 via-rose-500/40 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* KPI 2 */}
      <div className="apple-glass p-4 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {t.kpiHighestNeedLabel}
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-amber-400 tabular-nums">
          {t.kpiHighestNeed}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">{t.kpiHighestNeedSub}</p>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500/40 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* KPI 3 */}
      <div className="apple-glass p-4 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {t.kpiTotalDoctorsLabel}
          </span>
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Stethoscope className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-teal-300 tabular-nums">
          {reportsCount}+ {t.kpiTotalDoctors}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">{t.kpiTotalDoctorsSub}</p>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500/0 via-teal-500/40 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* KPI 4 */}
      <div className="apple-glass p-4 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {t.kpiTrendDivergenceLabel}
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-black text-blue-300">
          {t.kpiTrendDivergence}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">{t.kpiTrendDivergenceSub}</p>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

    </div>
  );
}
