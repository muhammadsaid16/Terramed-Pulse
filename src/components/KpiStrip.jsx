import React from 'react';
import { Flame, AlertTriangle, Stethoscope, ArrowLeftRight } from 'lucide-react';

// Four KPI cards, one shape. Class strings stay literal so Tailwind's scanner keeps them.
// `Value` is the only slot that genuinely differs between the cards.
const KPIS = [
  {
    id: 'warming',
    chipClass: 'satellite-chip text-rose-300/80 bg-rose-950/40 border-rose-800/40',
    chipLabelKey: 'kpiChipPower',
    iconBoxClass: 'w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400',
    Icon: Flame,
    labelKey: 'kpiWarmingLabel',
    valueClass: 'text-3xl font-bold tracking-tight text-white telemetry-mono',
    Value: ({ t }) => t.kpiWarmingRate,
    dotClass: 'inline-block w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse',
    subClass: 'text-xs text-rose-400/80 mt-1.5 font-medium flex items-center gap-1',
    subKey: 'kpiWarmingSub',
    sourceKey: 'kpiSource1',
    glowClass: 'absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none'
  },
  {
    id: 'highest-need',
    chipClass: 'satellite-chip text-amber-300/80 bg-amber-950/40 border-amber-800/40',
    chipLabelKey: 'kpiChipModis',
    iconBoxClass: 'w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400',
    Icon: AlertTriangle,
    labelKey: 'kpiHighestNeedLabel',
    valueClass: 'text-2xl sm:text-3xl font-bold tracking-tight text-amber-300 telemetry-mono',
    Value: ({ t }) => t.kpiHighestNeed,
    dotClass: 'inline-block w-1.5 h-1.5 rounded-full bg-amber-400',
    subClass: 'text-xs text-amber-400/80 mt-1.5 font-medium flex items-center gap-1',
    subKey: 'kpiHighestNeedSub',
    sourceKey: 'kpiSource2',
    glowClass: 'absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none'
  },
  {
    id: 'field-doctors',
    chipClass: 'satellite-chip text-sky-300/80 bg-sky-950/40 border-sky-800/40',
    chipLabelKey: 'kpiChipField',
    iconBoxClass: 'w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400',
    Icon: Stethoscope,
    labelKey: 'kpiTotalDoctorsLabel',
    valueClass: 'text-3xl font-bold tracking-tight text-white telemetry-mono',
    Value: ({ t, reportsCount }) => (
      <>
        {reportsCount && reportsCount > 0 ? reportsCount : '1,735'} <span className="text-sm font-normal text-white/50">{t.kpiTotalDoctors}</span>
      </>
    ),
    dotClass: 'inline-block w-1.5 h-1.5 rounded-full bg-sky-400',
    subClass: 'text-xs text-sky-400/80 mt-1.5 font-medium flex items-center gap-1',
    subKey: 'kpiTotalDoctorsSub',
    sourceKey: 'kpiSource3',
    glowClass: 'absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none'
  },
  {
    id: 'divergence',
    chipClass: 'satellite-chip text-purple-300/80 bg-purple-950/40 border-purple-800/40',
    chipLabelKey: 'kpiChipSpatial',
    iconBoxClass: 'w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400',
    Icon: ArrowLeftRight,
    labelKey: 'kpiTrendDivergenceLabel',
    valueClass: 'text-xl sm:text-2xl font-bold tracking-tight text-white',
    Value: ({ t }) => t.kpiTrendDivergence,
    dotClass: 'inline-block w-1.5 h-1.5 rounded-full bg-purple-400',
    subClass: 'text-xs text-purple-400/80 mt-1.5 font-medium flex items-center gap-1',
    subKey: 'kpiTrendDivergenceSub',
    sourceKey: 'kpiSource4',
    glowClass: 'absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none'
  }
];

export default function KpiStrip({ t, reportsCount = 0 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
      {KPIS.map(kpi => {
        const Icon = kpi.Icon;
        const Value = kpi.Value;
        return (
          <div key={kpi.id} className="bento-card p-5 relative overflow-hidden group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={kpi.chipClass}>{t[kpi.chipLabelKey]}</span>
                <div className={kpi.iconBoxClass}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xs text-white/50 mb-1 font-medium">
                {t[kpi.labelKey]}
              </div>
              <div className={kpi.valueClass}>
                <Value t={t} reportsCount={reportsCount} />
              </div>
              <p className={kpi.subClass}>
                <span className={kpi.dotClass} />
                {t[kpi.subKey]}
              </p>
            </div>
            
            {/* Explicit Empirical Provenance Footnote */}
            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-start gap-1.5 text-[10px] text-white/50 font-medium leading-relaxed">
              <span className="text-sky-400 font-semibold shrink-0">{t.sourcePrefix || 'المصدر:'}</span>
              <span>{t[kpi.sourceKey]}</span>
            </div>

            <div className={kpi.glowClass} />
          </div>
        );
      })}
    </div>
  );
}
