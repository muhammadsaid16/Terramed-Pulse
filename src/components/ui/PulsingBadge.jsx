import React from 'react';

/**
 * 21st.dev Pulsing Radar Badge Component
 * Features concentric ripple pings for live satellite telemetry & sensor status.
 */
export default function PulsingBadge({
  label,
  sublabel,
  pulseColor = 'bg-emerald-500',
  pingColor = 'bg-emerald-400',
  className = ''
}) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200/90 dark:border-white/10 text-xs shadow-2xs backdrop-blur-md ${className}`}>
      {/* 21st.dev Dual Concentric Radar Ring */}
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75`} />
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${pulseColor}`} />
      </span>
      
      <span className="font-semibold text-slate-800 dark:text-white/90">
        {label}
      </span>

      {sublabel && (
        <span className="text-[10px] font-mono text-slate-500 dark:text-white/50 border-l border-slate-200 dark:border-white/10 pl-1.5 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-1.5">
          {sublabel}
        </span>
      )}
    </div>
  );
}
