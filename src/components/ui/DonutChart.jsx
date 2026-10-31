import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';

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
  size = 200,
  innerRadius = 60, // Radius of the center hole
  outerRadius = 88, // Radius of the outer ring
  sliceGapAngle = 3, // Degrees of gap between slices
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
      currentAngle = endAngle;

      return {
        ...item,
        index,
        value,
        percentage: ((value / total) * 100).toFixed(0),
        startAngle,
        endAngle,
        midAngle,
        angle
      };
    });
  }, [data, total]);

  // Helper to calculate SVG arc path with slice gap (angularInset)
  const getArcPath = (slice, isHovered) => {
    const gap = slice.angle > sliceGapAngle * 2 ? sliceGapAngle : 0;
    const startDeg = slice.startAngle + gap / 2;
    const endDeg = slice.endAngle - gap / 2;

    const startRad = (startDeg * Math.PI) / 180;
    const endRad = (endDeg * Math.PI) / 180;
    const midRad = (slice.midAngle * Math.PI) / 180;

    // Center coordinates
    const center = size / 2;

    // Apply radial outward translation if hovered
    const offset = isHovered ? hoverOffset : 0;
    const offsetX = Math.cos(midRad) * offset;
    const offsetY = Math.sin(midRad) * offset;

    const cx = center + offsetX;
    const cy = center + offsetY;

    const rOut = outerRadius;
    const rIn = innerRadius;

    // Coordinates
    const x1 = cx + rOut * Math.cos(startRad);
    const y1 = cy + rOut * Math.sin(startRad);
    const x2 = cx + rOut * Math.cos(endRad);
    const y2 = cy + rOut * Math.sin(endRad);
    const x3 = cx + rIn * Math.cos(endRad);
    const y3 = cy + rIn * Math.sin(endRad);
    const x4 = cx + rIn * Math.cos(startRad);
    const y4 = cy + rIn * Math.sin(startRad);

    const largeArc = slice.angle - gap > 180 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${rIn} ${rIn} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;
  };

  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className={cn(layoutClasses[layout] || layoutClasses.auto, className)}>
      {/* Donut Chart Ring with Center Label */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible select-none"
          role="img"
          aria-label="Donut Chart"
        >
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.index;
            return (
              <path
                key={slice.index}
                d={getArcPath(slice, isHovered)}
                fill={slice.color}
                className={cn(
                  'cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
                  isHovered ? 'filter drop-shadow(0 4px 8px rgba(0,0,0,0.25)) opacity-100' : 'opacity-90 hover:opacity-100'
                )}
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                tabIndex={0}
                role="graphics-symbol"
                aria-label={`${slice.label}: ${slice.value}${totalSuffix}`}
              />
            );
          })}
        </svg>

        {/* Center Label inside the Donut's Hole */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
          {activeSlice ? (
            <div className="animate-in fade-in zoom-in-95 duration-150 flex flex-col items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                {activeSlice.value}{totalSuffix}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-white/60 font-medium truncate max-w-[110px] mt-0.5">
                {activeSlice.label}
              </span>
            </div>
          ) : (
            <div className="animate-in fade-in duration-150 flex flex-col items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                {total}{totalSuffix}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-white/50 font-medium mt-0.5 uppercase tracking-wider">
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
                  <span className="truncate">{slice.label}</span>
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
