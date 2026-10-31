import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';

/** Helper to strip duplicate (XX%) from labels if present */
export const cleanSliceLabel = (text) => {
  if (!text) return '';
  return text.replace(/\s*\(\d+%\)/g, '').trim();
};

/**
 * NameThatUI Donut Chart Component
 * Implements full anatomy:
 * 1. Slices (sectors) with precise share angles
 * 2. Center label inside the hole (default aggregate or active slice inspection)
 * 3. Slice gap (padding angle / angular inset)
 * 4. Synchronized legend with two-way hover pop-out (hoverOffset)
 * 
 * Reference: https://namethatui.com/web/pie-donut-chart
 */
export function DonutChart({
  data = [], // [{ label: string, value: number, color: string }]
  size = 180,
  innerRadius = 52, // Radius of the center hole
  outerRadius = 76, // Radius of the outer ring
  strokeWidth = 2.5, // Even gap between slices
  hoverOffset = 7, // Radial outward offset on hover
  totalLabel = 'Total',
  totalSuffix = '%',
  centerSublabel = 'Share',
  className,
  showLegend = true,
  legendClassName,
  layout = 'auto' // 'auto' | 'vertical' | 'horizontal'
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const layoutClasses = {
    auto: 'flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full',
    vertical: 'flex flex-col items-center gap-3 w-full',
    horizontal: 'flex flex-row items-center gap-4 w-full'
  };

  // Compute total value
  const total = useMemo(() => {
    return data.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  }, [data]);

  // Compute slice angles (radians & degrees)
  const slices = useMemo(() => {
    if (!total || !data.length) return [];

    let currentAngle = -90; // Start at 12 o'clock

    return data.map((item, index) => {
      const value = Number(item.value) || 0;
      const angle = (value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      const midAngle = startAngle + angle / 2;
      const midRad = (midAngle * Math.PI) / 180;
      currentAngle = endAngle;

      return {
        ...item,
        index,
        value,
        percentage: ((value / total) * 100).toFixed(0),
        startAngle,
        endAngle,
        midAngle,
        midRad,
        angle
      };
    });
  }, [data, total]);

  // Generate SVG path for a circular ring sector
  const getArcPath = (slice) => {
    const center = size / 2;
    const startRad = (slice.startAngle * Math.PI) / 180;
    const endRad = (slice.endAngle * Math.PI) / 180;

    const rOut = outerRadius;
    const rIn = innerRadius;

    // Outer arc start/end
    const x1 = center + rOut * Math.cos(startRad);
    const y1 = center + rOut * Math.sin(startRad);
    const x2 = center + rOut * Math.cos(endRad);
    const y2 = center + rOut * Math.sin(endRad);

    // Inner arc start/end
    const x3 = center + rIn * Math.cos(endRad);
    const y3 = center + rIn * Math.sin(endRad);
    const x4 = center + rIn * Math.cos(startRad);
    const y4 = center + rIn * Math.sin(startRad);

    const largeArc = slice.angle > 180 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${rIn} ${rIn} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;
  };

  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;
  const holeDiameter = innerRadius * 2 - 8;

  return (
    <div className={cn(layoutClasses[layout] || layoutClasses.auto, className)}>
      {/* Donut Chart Ring with Center Label */}
      <div
        className="relative shrink-0 flex items-center justify-center select-none"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
          role="img"
          aria-label="Donut Chart"
        >
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.index;
            const dx = isHovered ? Math.cos(slice.midRad) * hoverOffset : 0;
            const dy = isHovered ? Math.sin(slice.midRad) * hoverOffset : 0;

            return (
              <g
                key={slice.index}
                style={{
                  transform: `translate(${dx}px, ${dy}px)`,
                  transition: 'transform 200ms cubic-bezier(0.2, 0, 0, 1)'
                }}
              >
                <path
                  d={getArcPath(slice)}
                  fill={slice.color}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  className={cn(
                    'cursor-pointer stroke-white dark:stroke-[#090b12] transition-opacity duration-150',
                    isHovered
                      ? 'opacity-100 filter drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                      : 'opacity-90 hover:opacity-100'
                  )}
                  onMouseEnter={() => setHoveredIndex(slice.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  tabIndex={0}
                  role="graphics-symbol"
                  aria-label={`${cleanSliceLabel(slice.label)}: ${slice.value}${totalSuffix}`}
                />
              </g>
            );
          })}
        </svg>

        {/* Center Label inside the Donut's Hole - Constrained to prevent slice overlap */}
        <div
          className="absolute inset-0 m-auto rounded-full flex flex-col items-center justify-center text-center p-1.5 overflow-hidden pointer-events-none"
          style={{ width: holeDiameter, height: holeDiameter }}
        >
          {activeSlice ? (
            <div className="enter-pop motion-reduce:animate-none flex flex-col items-center justify-center max-w-full">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                {activeSlice.value}{totalSuffix}
              </span>
              <span className="text-2xs text-slate-600 dark:text-white/75 font-medium leading-tight max-w-[84px] mt-1 line-clamp-2 break-words">
                {cleanSliceLabel(activeSlice.label)}
              </span>
            </div>
          ) : (
            <div className="animate-fadeIn motion-reduce:animate-none flex flex-col items-center justify-center max-w-full">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                {total}{totalSuffix}
              </span>
              <span className="text-2xs text-slate-500 dark:text-white/50 font-medium uppercase tracking-wider mt-1">
                {totalLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Synchronized Interactive Legend */}
      {showLegend && (
        <div className={cn('flex flex-col gap-1.5 w-full max-w-xs', legendClassName)}>
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.index;
            const displayLabel = cleanSliceLabel(slice.label);
            return (
              <div
                key={slice.index}
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer select-none',
                  'transition-all duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
                  isHovered
                    ? 'bg-slate-100 dark:bg-white/10 font-semibold translate-x-1 rtl:-translate-x-1 shadow-sm'
                    : 'text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={cn(
                      'w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-150',
                      isHovered && 'scale-125'
                    )}
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="truncate">{displayLabel}</span>
                </div>
                <span className="font-mono font-medium text-slate-900 dark:text-white shrink-0 ml-2 rtl:mr-2">
                  {slice.value}{totalSuffix}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DonutChart;
