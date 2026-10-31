import React from 'react';
import { cn } from '../../lib/utils';

export const badgeVariants = {
  default:
    'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40',
  secondary:
    'bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-white/[0.06] dark:text-white/80 dark:border-white/10',
  outline:
    'border border-slate-300/80 text-slate-700 bg-transparent dark:border-white/15 dark:text-white/70',
  destructive:
    'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40',
  success:
    'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40',
  warning:
    'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40',
  purple:
    'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40',
  info:
    'bg-cyan-50 text-cyan-700 border-cyan-200/80 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/40'
};

const dotColors = {
  default: 'bg-sky-500 dark:bg-sky-400',
  secondary: 'bg-slate-500 dark:bg-slate-400',
  outline: 'bg-slate-400 dark:bg-slate-500',
  destructive: 'bg-rose-500 dark:bg-rose-400',
  success: 'bg-emerald-500 dark:bg-emerald-400',
  warning: 'bg-amber-500 dark:bg-amber-400',
  purple: 'bg-purple-500 dark:bg-purple-400',
  info: 'bg-cyan-500 dark:bg-cyan-400'
};

export function Badge({
  className,
  variant = 'default',
  pulse = false,
  children,
  ...props
}) {
  const variantClass = badgeVariants[variant] || badgeVariants.default;
  const dotClass = dotColors[variant] || dotColors.default;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border leading-tight select-none',
        'transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
        variantClass,
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', dotClass)} />
          <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5', dotClass)} />
        </span>
      )}
      {children}
    </span>
  );
}

export default Badge;
