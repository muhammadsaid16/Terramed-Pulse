import React from 'react';
import { ArrowUpRight, ArrowDownRight, Compass } from 'lucide-react';
import SpotlightCard from './ui/SpotlightCard';
import BorderBeam from './ui/BorderBeam';

// The two hotspot cards are the same component shape; only accent colors, icon and telemetry chips differ.
// Class strings stay literal (not interpolated) so Tailwind's content scanner keeps them in the bundle.
const HOTSPOTS = [
  {
    id: 'upper-egypt',
    labelKey: 'upperEgyptLabel',
    detailKey: 'upperEgyptDetail',
    sourceKey: 'oppositeSourceUpper',
    Icon: ArrowUpRight,
    labelClass: 'font-semibold text-xs text-rose-600 dark:text-rose-300 flex items-center gap-1.5',
    dotClass: 'w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400 animate-pulse',
    iconBoxClass: 'w-7 h-7 rounded-lg bg-rose-100 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 flex items-center justify-center',
    glowClass: 'absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none',
    chips: [
      { labelKey: 'chipUpperHeat', tone: 'text-rose-700 dark:text-rose-300' },
      { labelKey: 'chipUpperHumidity', tone: 'text-sky-700 dark:text-sky-300' },
      { labelKey: 'chipUpperNdvi', tone: 'text-amber-700 dark:text-amber-300' }
    ]
  },
  {
    id: 'nile-delta',
    labelKey: 'deltaLabel',
    detailKey: 'deltaDetail',
    sourceKey: 'oppositeSourceDelta',
    Icon: ArrowDownRight,
    labelClass: 'font-semibold text-xs text-sky-700 dark:text-sky-300 flex items-center gap-1.5',
    dotClass: 'w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse',
    iconBoxClass: 'w-7 h-7 rounded-lg bg-sky-100 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 flex items-center justify-center',
    glowClass: 'absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none',
    chips: [
      { labelKey: 'chipDeltaHumidity', tone: 'text-sky-700 dark:text-sky-300' },
      { labelKey: 'chipDeltaAod', tone: 'text-purple-700 dark:text-purple-300' },
      { labelKey: 'chipDeltaWetBulb', tone: 'text-emerald-700 dark:text-emerald-300' }
    ]
  }
];

export default function OppositeTrends({ t }) {
  return (
    <div className="bento-card p-5 sm:p-7 mb-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
              {t.oppositeTitle}
            </h3>
            <p className="text-xs text-slate-600 dark:text-white/50 font-normal mt-0.5">
              {t.oppositeDesc}
            </p>
          </div>
        </div>
        <span className="satellite-chip text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-sky-950/40 dark:border-sky-800/40">
          {t.spatialChip}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {HOTSPOTS.map(spot => {
          const Icon = spot.Icon;
          const isUpperEgypt = spot.id === 'upper-egypt';
          return (
            <SpotlightCard
              key={spot.id}
              className={`bento-card p-4 sm:p-5 relative flex flex-col justify-between shadow-sm dark:shadow-md ${
                isUpperEgypt ? 'border-rose-300/80 dark:border-rose-500/30' : ''
              }`}
            >
              {isUpperEgypt && (
                <BorderBeam
                  duration={9}
                  colorFrom="#f43f5e"
                  colorTo="#fb923c"
                  borderWidth={1.5}
                />
              )}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={spot.labelClass}>
                    <span className={spot.dotClass}></span>
                    {t[spot.labelKey]}
                  </span>
                  <div className={spot.iconBoxClass}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-700 dark:text-white/70 leading-relaxed font-normal">
                  {t[spot.detailKey]}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium telemetry-mono">
                  {spot.chips.map(chip => (
                    <span key={chip.labelKey} className={`px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 dark:bg-white/[0.04] ${chip.tone} dark:border-white/[0.08]`}>
                      {t[chip.labelKey]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Source Provenance Footnote */}
              <div className="mt-4 pt-2.5 border-t border-slate-200/80 dark:border-white/[0.06] flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-white/45 font-medium">
                <span className="text-sky-600 dark:text-sky-400 font-semibold shrink-0">{t.sourcePrefix || 'المصدر:'}</span>
                <span>{t[spot.sourceKey]}</span>
              </div>

              <div className={spot.glowClass} />
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
}
