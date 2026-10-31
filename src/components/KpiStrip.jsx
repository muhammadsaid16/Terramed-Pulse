import React from 'react';
import { Flame, AlertTriangle, Stethoscope, ArrowLeftRight } from 'lucide-react';
import { SpotlightCard, NumberTicker, Badge } from './ui';

const KPIS = [
  {
    id: 'warming',
    badgeVariant: 'destructive',
    pulse: true,
    chipLabelKey: 'kpiChipPower',
    iconBoxClass: 'w-7 h-7 rounded-lg bg-rose-100 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 flex items-center justify-center',
    Icon: Flame,
    labelKey: 'kpiWarmingLabel',
    valueClass: 'text-3xl font-bold tracking-tight text-slate-900 dark:text-white telemetry-mono flex items-baseline gap-1.5',
    Value: ({ t }) => (
      <>
        <NumberTicker value={0.44} prefix="+" suffix="°C" decimalPlaces={2} />
        <span className="text-xs font-normal text-slate-500 dark:text-white/50">{t.kpiWarmingRate?.split('°C')[1] || '/ decade'}</span>
      </>
    ),
    dotClass: 'inline-block w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400 animate-pulse',
    subClass: 'text-xs text-rose-600 dark:text-rose-400/80 mt-1.5 font-medium flex items-center gap-1',
    subKey: 'kpiWarmingSub',
    sourceKey: 'kpiSource1',
    glowClass: 'absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none'
  },
  {
    id: 'highest-need',
    badgeVariant: 'warning',
    pulse: false,
    chipLabelKey: 'kpiChipModis',
    iconBoxClass: 'w-7 h-7 rounded-lg bg-amber-100 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 flex items-center justify-center',
    Icon: AlertTriangle,
    labelKey: 'kpiHighestNeedLabel',
    valueClass: 'text-2xl sm:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400 telemetry-mono flex items-baseline gap-1.5',
    Value: ({ t }) => (
      <>
        <span>{t.kpiHighestNeed?.split('(')[0]?.trim() || 'Aswan'}</span>
        <span className="text-sm font-semibold text-amber-500 dark:text-amber-300 flex items-center">
          (<NumberTicker value={88.4} decimalPlaces={1} prefix="HNI " />)
        </span>
      </>
    ),
    dotClass: 'inline-block w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400',
    subClass: 'text-xs text-amber-600 dark:text-amber-400/80 mt-1.5 font-medium flex items-center gap-1',
    subKey: 'kpiHighestNeedSub',
    sourceKey: 'kpiSource2',
    glowClass: 'absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none'
  },
  {
    id: 'field-doctors',
    badgeVariant: 'default',
    pulse: false,
    chipLabelKey: 'kpiChipField',
    iconBoxClass: 'w-7 h-7 rounded-lg bg-sky-100 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 flex items-center justify-center',
    Icon: Stethoscope,
    labelKey: 'kpiTotalDoctorsLabel',
    valueClass: 'text-3xl font-bold tracking-tight text-slate-900 dark:text-white telemetry-mono flex items-baseline gap-1.5',
    Value: ({ t }) => (
      <>
        <NumberTicker value={1735} />
        <span className="text-sm font-normal text-slate-500 dark:text-white/50">{t.kpiTotalDoctors}</span>
      </>
    ),
    dotClass: 'inline-block w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400',
    subClass: 'text-xs text-sky-600 dark:text-sky-400/80 mt-1.5 font-medium flex items-center gap-1',
    subKey: 'kpiTotalDoctorsSub',
    sourceKey: 'kpiSource3',
    glowClass: 'absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none'
  },
  {
    id: 'divergence',
    badgeVariant: 'purple',
    pulse: false,
    chipLabelKey: 'kpiChipSpatial',
    iconBoxClass: 'w-7 h-7 rounded-lg bg-purple-100 text-purple-600 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 flex items-center justify-center',
    Icon: ArrowLeftRight,
    labelKey: 'kpiTrendDivergenceLabel',
    valueClass: 'text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white',
    Value: ({ t }) => t.kpiTrendDivergence,
    dotClass: 'inline-block w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400',
    subClass: 'text-xs text-purple-600 dark:text-purple-400/80 mt-1.5 font-medium flex items-center gap-1',
    subKey: 'kpiTrendDivergenceSub',
    sourceKey: 'kpiSource4',
    glowClass: 'absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none'
  }
];

export default function KpiStrip({ t }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
      {KPIS.map((kpi, idx) => {
        const Icon = kpi.Icon;
        const Value = kpi.Value;
        return (
          <SpotlightCard
            key={kpi.id}
            className="bento-card p-5 flex flex-col justify-between enter-pop"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant={kpi.badgeVariant} pulse={kpi.pulse} className="text-2xs py-0.5">
                  {t[kpi.chipLabelKey]}
                </Badge>
                <div className={kpi.iconBoxClass}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-white/50 mb-1 font-medium">
                {t[kpi.labelKey]}
              </div>
              <div className={kpi.valueClass}>
                <Value t={t} />
              </div>
              <p className={kpi.subClass}>
                <span className={kpi.dotClass} />
                {t[kpi.subKey]}
              </p>
            </div>
            
            {/* Explicit Empirical Provenance Footnote */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-white/[0.06] flex items-start gap-1.5 text-2xs text-slate-500 dark:text-white/50 font-medium leading-relaxed">
              <span className="text-sky-600 dark:text-sky-400 font-semibold shrink-0">{t.sourcePrefix || 'المصدر:'}</span>
              <span>{t[kpi.sourceKey]}</span>
            </div>

            <div className={kpi.glowClass} />
          </SpotlightCard>
        );
      })}
    </div>
  );
}
