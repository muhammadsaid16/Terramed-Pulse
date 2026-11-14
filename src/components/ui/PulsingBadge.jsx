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
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color:var(--panel-2)] dark:bg-[color:var(--surface-3)] border border-[color:var(--line-strong)] text-xs shadow-2xs backdrop-blur-md ${className}`}>
      {/* 21st.dev Dual Concentric Radar Ring */}
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75`} />
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${pulseColor}`} />
      </span>
      
      <span className="font-semibold text-[color:var(--ink)]">
        {label}
      </span>

      {sublabel && (
        <span className="text-2xs font-mono text-[color:var(--muted)] border-l border-[color:var(--line-strong)] pl-1.5 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-1.5">
          {sublabel}
        </span>
      )}
    </div>
  );
}
