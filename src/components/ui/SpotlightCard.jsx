import React, { useRef, useState } from 'react';

/**
 * 21st.dev Spotlight Card Component
 * Adds a cursor-tracking radial glow on hover using CSS variables for 60fps GPU acceleration.
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColorLight = 'rgba(14, 165, 233, 0.08)',
  spotlightColorDark = 'rgba(56, 189, 248, 0.14)',
  as: Component = 'div',
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
      {/* Content wrapper */}
      <div className="relative z-10 h-full">{children}</div>
    </Component>
  );
}
