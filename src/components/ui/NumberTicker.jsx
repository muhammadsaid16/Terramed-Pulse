import React, { useEffect, useState, useRef } from 'react';

/**
 * 21st.dev Number Ticker Component
 * Smoothly interpolates and counts up numbers when rendered or when values change.
 */
export default function NumberTicker({
  value,
  startValue = 0,
  duration = 1100,
  decimalPlaces = 0,
  prefix = '',
  suffix = '',
  className = ''
}) {
  const numericTarget = typeof value === 'number' ? value : parseFloat(value) || 0;
  const [displayValue, setDisplayValue] = useState(startValue);
  const startTimeRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    // Check reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(numericTarget);
      return;
    }

    const startVal = displayValue;
    const diff = numericTarget - startVal;
    if (Math.abs(diff) < 0.0001) {
      setDisplayValue(numericTarget);
      return;
    }

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic: 1 - (1 - t)^3
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startVal + diff * easeOut;
      
      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(numericTarget);
        startTimeRef.current = null;
      }
    };

    startTimeRef.current = null;
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [numericTarget, duration]);

  const formattedNumber = Number(displayValue).toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  });

  return (
    <span className={`inline-block tabular-nums font-inherit ${className}`}>
      {prefix}{formattedNumber}{suffix}
    </span>
  );
}
