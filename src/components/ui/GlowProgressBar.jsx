import React from 'react';

/**
 * 21st.dev Glow Progress Bar Component
 * An animated progress indicator with gradient fill and luminous head marker.
 */
export default function GlowProgressBar({
  value = 0,
  max = 100,
  label,
  valueText,
  gradientFrom = 'from-sky-500',
  gradientTo = 'to-blue-600',
  glowColor = 'shadow-sky-500/30',
  className = ''
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || valueText) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="text-slate-600 dark:text-white/70 font-medium">{label}</span>}
          {valueText && <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{valueText}</span>}
        </div>
      )}
      
      {/* 21st.dev Progress Track */}
      <div className="h-2 w-full rounded-full bg-slate-200/80 dark:bg-white/[0.08] overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradientFrom} ${gradientTo} transition-all duration-700 ease-out shadow-sm ${glowColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
