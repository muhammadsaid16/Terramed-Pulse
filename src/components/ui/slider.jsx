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
  dir,
  ...props
}) {
  const isRtl = dir === 'rtl' || (dir === undefined && typeof document !== 'undefined' && document.documentElement.dir === 'rtl');
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={cn('relative flex w-full touch-none select-none items-center py-2', className)}
    >
      <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[color:var(--line)] dark:bg-[color:var(--surface-4)]">
        <div
          className={cn(
            'absolute top-0 bottom-0 bg-sky-500 dark:bg-sky-400 transition-none',
            isRtl ? 'right-0' : 'left-0'
          )}
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
        dir={isRtl ? 'rtl' : 'ltr'}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        {...props}
      />
      <div
        className={cn(
          'absolute h-4 w-4 rounded-full border-2 border-sky-600 bg-[color:var(--panel)] shadow-sm pointer-events-none',
          'dark:border-sky-400 dark:bg-[color:var(--ink)]',
          'transition-transform duration-100 ease-out',
          'peer-hover:scale-110 peer-active:scale-125 peer-disabled:opacity-50',
          isRtl ? '-mr-2' : '-ml-2'
        )}
        style={isRtl ? { right: `${percentage}%` } : { left: `${percentage}%` }}
      />
    </div>
  );
}

export default Slider;
