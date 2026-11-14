import React, { useState, useEffect, useRef } from 'react';

/**
 * 21st.dev Glow Progress Bar Component
 * An animated progress indicator with gradient fill and luminous head marker.
 * Smoothly animates fill from 0% when entering the viewport via IntersectionObserver.
 */
export default function GlowProgressBar({
  value = 0,
  max = 100,
  label,
  valueText,
  gradientFrom = 'from-sky-500',
  gradientTo = 'to-blue-600',
  glowColor = 'shadow-sky-500/30',
  className = '',
  once = true
}) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsInView(true);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry && entry.isIntersecting) {
          setIsInView(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px'
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [once]);

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayPercentage = isInView ? percentage : 0;

  return (
    <div ref={containerRef} className={`space-y-1.5 ${className}`}>
      {(label || valueText) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="text-[color:var(--ink-2)] font-medium">{label}</span>}
          {valueText && <span className="font-semibold text-[color:var(--ink)] tabular-nums">{valueText}</span>}
        </div>
      )}
      
      {/* 21st.dev Progress Track */}
      <div className="h-2 w-full rounded-full bg-[color:var(--line)] overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradientFrom} ${gradientTo} transition-all duration-700 ease-out shadow-sm ${glowColor}`}
          style={{ width: `${displayPercentage}%` }}
        />
      </div>
    </div>
  );
}
