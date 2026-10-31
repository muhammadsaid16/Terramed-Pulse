import React from 'react';
import { cn } from '../../lib/utils';

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value = 0,
  onChange,
  className,
  disabled = false,
  ariaLabel,
  ...props
}) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={cn('relative flex w-full touch-none select-none items-center py-2', className)}>
      <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
        <div
          className="h-full bg-sky-500 dark:bg-sky-400 transition-all duration-75"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        {...props}
      />
      <div
        className={cn(
          'absolute h-4 w-4 -ml-2 rounded-full border-2 border-sky-600 bg-white shadow-sm pointer-events-none',
          'dark:border-sky-400 dark:bg-slate-900',
          'transition-transform duration-100 ease-out',
          'active:scale-125'
        )}
        style={{ left: `${percentage}%` }}
      />
    </div>
  );
}

export default Slider;
