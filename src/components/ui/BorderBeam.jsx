import React from 'react';

/**
 * 21st.dev Border Beam Component
 * Traces a luminous traveling comet of light exactly along container borders.
 * Uses CSS mask-composite (content-box vs border-box) for zero content occlusion.
 */
export default function BorderBeam({
  duration = 10,
  borderWidth = 1.5,
  colorFrom = '#0ea5e9',
  colorTo = '#10b981',
  className = ''
}) {
  return (
    <div
      className={`pointer-events-none absolute -inset-px rounded-[inherit] overflow-hidden z-20 ${className}`}
      style={{
        padding: `${borderWidth}px`,
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0) border-box',
        maskComposite: 'exclude',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0) border-box',
        WebkitMaskComposite: 'xor'
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 w-[300%] aspect-square -translate-x-1/2 -translate-y-1/2 animate-border-beam-spin"
        style={{
          '--beam-duration': `${duration}s`,
          background: `conic-gradient(from 0deg, transparent 0deg 280deg, ${colorFrom} 320deg, ${colorTo} 355deg, transparent 360deg)`
        }}
      />
    </div>
  );
}
