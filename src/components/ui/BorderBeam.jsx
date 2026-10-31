import React from 'react';

/**
 * 21st.dev Border Beam Component
 * Traces a continuous glowing beam of light along container borders.
 * Uses CSS mask-composite for zero content occlusion.
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
      className={`pointer-events-none absolute inset-0 rounded-[inherit] z-20 ${className}`}
      style={{
        padding: `${borderWidth}px`,
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude'
      }}
    >
      <div
        className="absolute inset-[-150%] animate-[spin_10s_linear_infinite]"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg 330deg, ${colorFrom} 345deg, ${colorTo} 360deg)`,
          animationDuration: `${duration}s`
        }}
      />
    </div>
  );
}
