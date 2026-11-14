import React from 'react';

/**
 * 21st.dev Shimmer Button Component
 * High-conversion interactive button with traveling perimeter sheen and hover glow.
 */
export default function ShimmerButton({
  children,
  onClick,
  className = '',
  shimmerColor = 'rgba(255, 255, 255, 0.4)',
  shimmerDuration = '3s',
  type = 'button',
  ...props
}) {
  const buttonRef = React.useRef(null);
  const [onScreen, setOnScreen] = React.useState(true);

  React.useEffect(() => {
    const el = buttonRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: '100px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full p-[1.5px] font-semibold transition-transform duration-100 ease-out active:scale-95 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 ${className}`}
      {...props}
    >
      {/* 21st.dev Traveling Shimmer Background (paused off-viewport) */}
      <span
        className="absolute inset-[-100%] animate-[spin_3s_linear_infinite]"
        style={{
          background: `conic-gradient(from 0deg, transparent 0 300deg, ${shimmerColor} 340deg, transparent 360deg)`,
          animationDuration: shimmerDuration,
          animationPlayState: onScreen ? 'running' : 'paused'
        }}
      />

      {/* Button Body */}
      <span className="relative z-10 inline-flex items-center justify-center gap-2 w-full h-full px-5 py-2.5 rounded-full bg-[color:var(--inverse-bg)] text-[color:var(--inverse-fg)] border border-[color:var(--inverse-ring)] group-hover:bg-[color:var(--inverse-bg-hover)] transition-colors shadow-sm">
        {children}
      </span>
    </button>
  );
}
