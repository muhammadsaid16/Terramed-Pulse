import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import SpotlightCard from './ui/SpotlightCard';
import { getHeadlineMetrics } from '../lib/headlineMetrics';

/**
 * Opposite-direction regional trends.
 *
 * The two cards quote the shipped dataset directly: the hot-region heat
 * extreme slope, the humidity slopes that move in opposite directions, and the
 * vegetation loss they share. Nothing here is a hand-written number, so the
 * cards cannot drift away from the map or the charts.
 *
 * Class strings stay literal (not interpolated) so Tailwind's content
 * scanner keeps them in the bundle.
 */
export default function OppositeTrends({ t, lang = 'en' }) {
  const m = getHeadlineMetrics();
  const isAr = lang === 'ar';
  const { aswan, alexandria, cairo } = m.divergence;

  const HOTSPOTS = [
    {
      id: 'upper-egypt',
      labelKey: 'upperEgyptLabel',
      detailKey: 'upperEgyptDetail',
      sourceKey: 'oppositeSourceUpper',
      Icon: ArrowUpRight,
      labelClass: 'font-semibold text-xs text-[color:var(--danger)] dark:text-rose-300 flex items-center gap-1.5',
      dotClass: 'w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400',
      iconBoxClass: 'w-7 h-7 rounded-lg bg-rose-100 text-[color:var(--danger)] border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 flex items-center justify-center',
      glowClass: 'absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none',
      chips: [
        {
          label: isAr
            ? `T2M_MAX: ${aswan.heatSlope.toFixed(2)}°م / عقد`
            : `T2M_MAX: ${aswan.heatSlope.toFixed(2)}°C / dec`,
          tone: 'text-[color:var(--danger-soft)] dark:text-rose-300'
        },
        {
          label: isAr
            ? `أيام الحر المتطرف: +${aswan.heatDaysSlope.toFixed(1)} / عقد`
            : `Extreme heat days: +${aswan.heatDaysSlope.toFixed(1)} / dec`,
          tone: 'text-[color:var(--warn)] dark:text-amber-300'
        },
        {
          label: isAr
            ? `NDVI: ${aswan.vegSlope.toFixed(4)} / عقد`
            : `NDVI: ${aswan.vegSlope.toFixed(4)} / dec`,
          tone: 'text-[color:var(--ok)] dark:text-emerald-300'
        }
      ]
    },
    {
      id: 'nile-delta',
      labelKey: 'deltaLabel',
      detailKey: 'deltaDetail',
      sourceKey: 'oppositeSourceDelta',
      Icon: ArrowDownRight,
      labelClass: 'font-semibold text-xs text-[color:var(--info)] dark:text-sky-300 flex items-center gap-1.5',
      dotClass: 'w-2 h-2 rounded-full bg-sky-500 dark:text-sky-400',
      iconBoxClass: 'w-7 h-7 rounded-lg bg-sky-100 text-[color:var(--info)] border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 flex items-center justify-center',
      glowClass: 'absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none',
      chips: [
        {
          label: isAr
            ? `رطوبة القاهرة: ${cairo.humidSlope.toFixed(2)}% / عقد`
            : `Cairo RH2M: ${cairo.humidSlope.toFixed(2)}% / dec`,
          tone: 'text-[color:var(--info)] dark:text-sky-300'
        },
        {
          label: isAr
            ? `رطوبة الإسكندرية: ${alexandria.humidSlope.toFixed(2)}% / عقد`
            : `Alexandria RH2M: ${alexandria.humidSlope.toFixed(2)}% / dec`,
          tone: 'text-violet-700 dark:text-violet-300'
        },
        {
          label: isAr
            ? `PM2.5 القاهرة: +${cairo.pm25Slope.toFixed(2)} / عقد`
            : `Cairo PM2.5: +${cairo.pm25Slope.toFixed(2)} / dec`,
          tone: 'text-[color:var(--ok)] dark:text-emerald-300'
        }
      ]
    }
  ];

  return (
    <div className="bento-card p-5 sm:p-7 mb-8 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[color:var(--line)] pb-3">
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-[color:var(--ink)] tracking-tight">
            {t.oppositeTitle}
          </h3>
          <p className="text-micro text-[color:var(--muted)] font-normal mt-0.5">
            {t.oppositeDesc}
          </p>
        </div>
        <span className="font-mono text-2xs tracking-[0.08em] text-[color:var(--muted)] pt-1" dir="ltr">
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
              className={`bento-card p-4 sm:p-5 relative flex flex-col justify-between shadow-sm overflow-hidden ${
                isUpperEgypt ? 'border border-rose-300/80 dark:border-rose-500/30 shadow-[0_0_20px_-3px_rgba(244,63,94,0.15)]' : ''
              }`}
            >
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
                <p className="text-xs text-[color:var(--ink-2)] leading-relaxed font-normal">
                  {t[spot.detailKey]}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-micro font-medium telemetry-mono">
                  {spot.chips.map(chip => (
                    <span key={chip.label} className={`px-2.5 py-1 rounded-full bg-[color:var(--panel-2)] border border-[color:var(--line)] ${chip.tone}`}>
                      {chip.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Source Provenance Footnote */}
              <div className="mt-4 pt-2.5 border-t border-[color:var(--line)] flex items-center gap-1.5 text-2xs text-[color:var(--muted)] font-medium">
                <span className="text-[color:var(--accent)] font-semibold shrink-0">{t.sourcePrefix || 'المصدر:'}</span>
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
