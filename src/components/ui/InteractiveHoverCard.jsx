import React, { useRef, useState } from 'react';

/**
 * 21st.dev InteractiveHoverCard Component
 * 3D perspective micro-interaction card with smooth tilt, specular shine, and spring easing.
 */
export default function InteractiveHoverCard({
  children,
  className = '',
  maxTilt = 7,
  ...props
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(4px)`);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.15
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)');
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: 'transform 0.15s ease-out',
        willChange: 'transform'
      }}
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm transition-shadow hover:shadow-lg dark:border-white/[0.08] dark:bg-[#0c1222]/80 dark:hover:border-white/[0.16] ${className}`}
      {...props}
    >
      {/* Dynamic Specular Glare */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: glare.opacity,
          background: `radial-gradient(circle 240px at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.4), transparent 80%)`
        }}
      />
      <div className="relative z-0">{children}</div>
    </div>
  );
}
