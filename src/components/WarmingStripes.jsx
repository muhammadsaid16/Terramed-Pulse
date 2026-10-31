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

export default function WarmingStripes({ className = '' }) {
  const reduced = prefersReducedMotion();

  const { years, means, min, max, delta } = useMemo(() => {
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
    return { years, means, min, max, delta: avg(2021, 2025) - avg(1995, 1999) };
  }, []);

  return (
    <div
      className={`select-none ${reduced ? 'animate-fadeIn' : ''} ${className}`}
      role="img"
      aria-label={`MODIS land surface temperature stripes, ${years[0]} to ${years[years.length - 1]}, mean rise ${delta.toFixed(1)} degrees Celsius`}
    >
      <div className="flex items-end justify-between gap-2 mb-1.5">
        <span className="font-mono text-2xs uppercase tracking-[0.08em] text-slate-500 dark:text-white/45" dir="ltr">
          EGY MEAN · MODIS LST · °C
        </span>
        <span className="font-mono text-2xs tabular-nums text-rose-500 dark:text-rose-400" dir="ltr">
          Δ +{delta.toFixed(1)}°C 1995→2025
        </span>
      </div>

      <div
        className="grid gap-[2px] h-14 sm:h-16"
        style={{ gridTemplateColumns: `repeat(${years.length}, minmax(0, 1fr))` }}
      >
        {means.map((v, i) => (
          <div
            key={years[i]}
            title={`${years[i]} · ${v.toFixed(1)}°C`}
            className={!reduced ? 'enter-pop h-full rounded-[2px]' : 'h-full rounded-[2px]'}
            style={{
              backgroundColor: rampColor((v - min) / Math.max(0.001, max - min)),
              animationDelay: reduced ? undefined : `${i * 18}ms`
            }}
          />
        ))}
      </div>

      <div className="flex justify-between mt-1.5 font-mono text-2xs tabular-nums text-slate-400 dark:text-white/35">
        <span>{years[0]}</span>
        <span>{years[Math.floor(years.length / 2)]}</span>
        <span>{years[years.length - 1]}</span>
      </div>
    </div>
  );
}
