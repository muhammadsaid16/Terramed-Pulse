import React from 'react';

/**
 * 21st.dev Marquee Component
 * Continuous GPU-accelerated infinite scrolling ticker for live telemetry, alerts, and scientific indicators.
 */
export default function Marquee({
  className = '',
  reverse = false,
  pauseOnHover = true,
  children,
  repeat = 4,
  duration = 32,
  ...props
}) {
  return (
    <div
      {...props}
      style={{ '--marquee-duration': `${duration}s` }}
      className={`group flex overflow-hidden select-none py-1.5 [--gap:1rem] [gap:var(--gap)] ${
        pauseOnHover ? 'pause-on-hover' : ''
      } ${className}`}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={`flex shrink-0 items-center justify-around [gap:var(--gap)] ${
            reverse ? 'animate-marquee-reverse' : 'animate-marquee'
          }`}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
