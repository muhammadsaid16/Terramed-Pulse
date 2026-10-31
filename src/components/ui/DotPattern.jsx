import React, { useId } from 'react';

/**
 * 21st.dev DotPattern Component
 * SVG dot matrix background pattern with radial gradient vignette for Clean Lab UI.
 */
export default function DotPattern({
  width = 24,
  height = 24,
  x = 0,
  y = 0,
  cx = 1.2,
  cy = 1.2,
  cr = 1.2,
  className = '',
  mask = 'radial', // 'radial' | 'none'
  ...props
}) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full fill-slate-900/[0.06] dark:fill-white/[0.08] ${className}`}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <circle cx={cx} cy={cy} r={cr} />
        </pattern>
        {mask === 'radial' && (
          <mask id={`${id}-mask`}>
            <rect width="100%" height="100%" fill="url(#mask-grad)" />
            <radialGradient id="mask-grad" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="85%" stopColor="white" stopOpacity="0.2" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </mask>
        )}
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${id})`}
        mask={mask === 'radial' ? `url(#${id}-mask)` : undefined}
      />
    </svg>
  );
}
