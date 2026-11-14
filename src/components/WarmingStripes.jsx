import React, { useMemo } from 'react';
import { TERRAPULSE_DATA } from '../data/terrapulseData';
import { prefersReducedMotion } from '../lib/motionTokens';

// Warming-stripes band: mean MODIS Land Surface Temperature across all five
// governorate series, 1995–2025. One cell per year, cool→hot ramp.
const RAMP = [
  [56, 189, 248],   // cyan — cool anomaly
  [245, 158, 11],   // amber — caution
  [244, 63, 94]     // rose — critical
];

function rampColor(t) {
  const clamped = Math.min(1, Math.max(0, t));
  const seg = clamped < 0.5 ? 0 : 1;
  const local = clamped < 0.5 ? clamped / 0.5 : (clamped - 0.5) / 0.5;
  const from = RAMP[seg];
  const to = RAMP[seg + 1];
  const rgb = from.map((c, i) => Math.round(c + (to[i] - c) * local));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export default function WarmingStripes({ className = '', size = 'default' }) {
  const reduced = prefersReducedMotion();
  const isHero = size === 'hero';

  const { years, means, min, max, delta, last } = useMemo(() => {
    const govSeries = Object.values(TERRAPULSE_DATA.governorates)
      .map(g => g.series)
      .filter(s => Array.isArray(s?.LST) && Array.isArray(s?.years));
    const years = govSeries[0].years;
    const means = years.map((_, i) => {
      const vals = govSeries.map(s => s.LST[i]).filter(v => Number.isFinite(v));
      return vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);
    });
    const min = Math.min(...means);
    const max = Math.max(...means);
    const avg = (from, to) => {
      const slice = means.slice(years.indexOf(from), years.indexOf(to) + 1);
      return slice.reduce((a, b) => a + b, 0) / slice.length;
    };
    return {
      years,
      means,
      min,
      max,
      delta: avg(2021, 2025) - avg(1995, 1999),
      last: means[means.length - 1]
    };
  }, []);

  return (
    <div
      className={`select-none ${reduced ? 'animate-fadeIn' : ''} ${className}`}
      role="img"
      aria-label={`MODIS land surface temperature stripes, ${years[0]} to ${years[years.length - 1]}, mean rise ${delta.toFixed(1)} degrees Celsius`}
    >
      <div className="mb-2 flex items-end justify-between gap-2">
        <span
          className={`font-mono uppercase tracking-[0.14em] text-[color:var(--muted)] ${
            isHero ? 'text-2xs' : 'text-2xs'
          }`}
          dir="ltr"
        >
          EGY MEAN · MODIS LST · °C
        </span>
        {isHero ? (
          <span className="text-2xs uppercase tracking-[0.12em] text-[color:var(--muted)]" dir="ltr">
            1995 — 2025
          </span>
        ) : (
          <span
            className="text-2xs font-semibold tabular-nums text-[color:var(--danger)] dark:text-rose-400"
            dir="ltr"
          >
            Δ +{delta.toFixed(1)}°C <span className="opacity-60">1995→2025</span>
          </span>
        )}
      </div>

      <div
        className={`relative grid ${isHero ? 'h-24 sm:h-32' : 'h-14 sm:h-16'}`}
        style={{
          gridTemplateColumns: `repeat(${years.length}, minmax(0, 1fr))`,
          gap: isHero ? '3px' : '2px'
        }}
      >
        {means.map((v, i) => {
          const color = rampColor((v - min) / Math.max(0.001, max - min));
          const isLast = i === means.length - 1;
          return (
            <div
              key={years[i]}
              title={`${years[i]} · ${v.toFixed(1)}°C`}
              className={`${!reduced ? 'enter-pop' : ''} h-full rounded-[2px] transition-[filter] duration-200 hover:brightness-125`}
              style={{
                backgroundColor: color,
                animationDelay: reduced ? undefined : `${i * 18}ms`,
                boxShadow: isLast
                  ? `0 0 18px -2px ${color}, 0 0 42px -10px ${color}`
                  : isHero
                    ? 'inset 0 1px 0 rgba(255,255,255,0.10)'
                    : undefined
              }}
            />
          );
        })}
      </div>

      <div className="mt-2 flex items-baseline justify-between font-mono text-2xs tabular-nums text-[color:var(--muted)]">
        <span>{years[0]}</span>
        <span className="opacity-70">{years[Math.floor(years.length / 2)]}</span>
        <span className={isHero ? 'text-[color:var(--danger)]' : ''}>{years[years.length - 1]}</span>
      </div>

      {isHero && (
        <div className="mt-3 flex items-center justify-between border-t border-[color:var(--line)] pt-2.5 font-mono text-2xs tabular-nums text-[color:var(--muted)]">
          <span dir="ltr">T_MIN {min.toFixed(1)}°C</span>
          <span dir="ltr">T_MAX {max.toFixed(1)}°C</span>
          <span dir="ltr" className="text-[color:var(--ink)]">
            T_LAST {last.toFixed(1)}°C
          </span>
        </div>
      )}
    </div>
  );
}
