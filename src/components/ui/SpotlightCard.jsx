import React, { useRef, useState } from 'react';
import BorderBeam from './BorderBeam';

/**
 * 21st.dev Spotlight Card Component
 * Adds a cursor-tracking radial glow on hover using CSS variables for 60fps GPU acceleration.
 * Supports optional `borderBeam` prop to align perimeter beam precisely along the card's outer border.
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColorLight = 'rgba(14, 165, 233, 0.08)',
  spotlightColorDark = 'rgba(56, 189, 248, 0.14)',
  as: Component = 'div',
  borderBeam = null,
  ...props
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <Component
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden group ${className}`}
      {...props}
    >
      {/* 21st.dev Radial Spotlight Sheen */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 rounded-[inherit] z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(480px circle at var(--mouse-x, -999px) var(--mouse-y, -999px), var(--spotlight-glow, ${spotlightColorLight}), transparent 70%)`
        }}
      />

      {/* 21st.dev Border Beam (aligned precisely on outer border) */}
      {borderBeam && (
        <BorderBeam {...(typeof borderBeam === 'object' ? borderBeam : {})} />
      )}

      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </Component>
  );
}
