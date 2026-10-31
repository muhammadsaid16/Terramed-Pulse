import React, { useId } from 'react';

/**
 * 21st.dev Border Beam Component
 * Traces a luminous traveling beam of light strictly along the container's outer border via SVG.
 * 100% immune to CSS mask-composite bugs, zero content bleeding, sub-pixel corner precision.
 */
export default function BorderBeam({
  duration = 10,
  borderWidth = 2,
  size = 22, // length of the beam as percentage of total perimeter
  colorFrom = '#38bdf8',
  colorTo = '#818cf8',
  radius = 16,
  className = ''
}) {
  const id = useId();

  return (
    <svg
      className={`pointer-events-none absolute -inset-[1px] h-[calc(100%+2px)] w-[calc(100%+2px)] rounded-[inherit] overflow-visible z-20 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colorFrom} stopOpacity="1" />
          <stop offset="50%" stopColor={colorTo} stopOpacity="1" />
          <stop offset="100%" stopColor={colorFrom} stopOpacity="1" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={colorFrom} floodOpacity="0.6" />
        </filter>
      </defs>
      <rect
        x={borderWidth / 2}
        y={borderWidth / 2}
        width={`calc(100% - ${borderWidth}px)`}
        height={`calc(100% - ${borderWidth}px)`}
        rx={radius}
        ry={radius}
        fill="none"
        stroke={`url(#${id}-grad)`}
        strokeWidth={borderWidth}
        strokeLinecap="round"
        pathLength="100"
        strokeDasharray={`${size} ${100 - size}`}
        filter={`url(#${id}-glow)`}
        style={{
          animation: `border-beam-dash ${duration}s linear infinite`
        }}
      />
    </svg>
  );
}
