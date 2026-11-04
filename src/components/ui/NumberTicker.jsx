import React, { useEffect, useState, useRef } from 'react';

/**
 * 21st.dev Number Ticker Component
 * Smoothly interpolates and counts up numbers from 0 to target
 * when entering the viewport (via IntersectionObserver) and when target values change.
 */
export default function NumberTicker({
  value,
  startValue = 0,
  duration = 1100,
  delay = 0,
  decimalPlaces = 0,
  prefix = '',
  suffix = '',
  className = '',
  once = true
}) {
  const numericTarget = typeof value === 'number' ? value : parseFloat(value) || 0;
  const [displayValue, setDisplayValue] = useState(startValue);
  const [isInView, setIsInView] = useState(false);

  const spanRef = useRef(null);
  const currentValueRef = useRef(startValue);
  const hasAnimatedRef = useRef(false);
  const startTimeRef = useRef(null);
  const animFrameRef = useRef(null);
  const delayTimerRef = useRef(null);

  // 1. Observe when the number element enters the user's viewport
  useEffect(() => {
    const node = spanRef.current;
    if (!node) return;

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

  // 2. Animate count-up when the element enters view, or when target value updates
  useEffect(() => {
    // Do not animate until the element actually enters the user's viewport!
    if (!isInView) {
      return;
    }

    // Check reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(numericTarget);
      currentValueRef.current = numericTarget;
      hasAnimatedRef.current = true;
      return;
    }

    // Determine starting number:
    // If it has not animated yet, start from startValue (usually 0).
    // If it already animated once and numericTarget changed, start from current value.
    const startVal = hasAnimatedRef.current ? currentValueRef.current : startValue;
    const diff = numericTarget - startVal;

    if (Math.abs(diff) < 0.0001) {
      setDisplayValue(numericTarget);
      currentValueRef.current = numericTarget;
      hasAnimatedRef.current = true;
      return;
    }

    const startAnimation = () => {
      const animate = (timestamp) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic: 1 - (1 - t)^3
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = startVal + diff * easeOut;

        currentValueRef.current = current;
        setDisplayValue(current);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayValue(numericTarget);
          currentValueRef.current = numericTarget;
          startTimeRef.current = null;
          hasAnimatedRef.current = true;
        }
      };

      startTimeRef.current = null;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    if (delay > 0) {
      delayTimerRef.current = setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    };
  }, [isInView, numericTarget, duration, delay, startValue]);

  const formattedNumber = Number(displayValue).toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  });

  return (
    <span ref={spanRef} className={`inline-block tabular-nums font-inherit ${className}`}>
      {prefix}{formattedNumber}{suffix}
    </span>
  );
}
