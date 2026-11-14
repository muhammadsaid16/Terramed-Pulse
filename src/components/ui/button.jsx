import React from 'react';
import { cn } from '../../lib/utils';

export const buttonVariants = {
  variant: {
    default:
      'bg-sky-600 text-white hover:bg-sky-700 shadow-sm dark:bg-sky-500 dark:hover:bg-sky-600',
    inverse:
      'bg-[color:var(--inverse-bg)] text-[color:var(--inverse-fg)] hover:bg-[color:var(--inverse-bg-hover)] shadow-sm',
    secondary:
      'bg-[color:var(--panel-2)] text-[color:var(--ink-2)] hover:bg-[color:var(--line)] hover:text-[color:var(--ink)]',
    outline:
      'border border-[color:var(--line-strong)] bg-[color:var(--panel)] hover:bg-[color:var(--panel-2)] text-[color:var(--ink-2)] hover:text-[color:var(--ink)]',
    ghost:
      'text-[color:var(--ink-2)] hover:bg-[color:var(--panel-2)] hover:text-[color:var(--ink)]',
    destructive:
      'bg-rose-600 text-white hover:bg-rose-700 shadow-sm dark:bg-rose-500 dark:hover:bg-rose-600',
    link:
      'text-[color:var(--info)] underline-offset-4 hover:underline dark:text-sky-400 p-0 h-auto'
  },
  size: {
    default: 'h-9 px-4 py-2 text-xs sm:text-sm rounded-xl',
    sm: 'h-8 px-3 text-xs rounded-lg',
    lg: 'h-10 px-6 text-sm font-semibold rounded-xl',
    icon: 'h-9 w-9 p-0 rounded-xl flex items-center justify-center shrink-0',
    chip: 'h-7 px-2.5 py-1 text-xs rounded-full shrink-0'
  }
};

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', type = 'button', disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-medium select-none',
          'transition-all duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
          'active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-1',
          'disabled:pointer-events-none disabled:opacity-50',
          'motion-reduce:transform-none motion-reduce:transition-none',
          buttonVariants.variant[variant] || buttonVariants.variant.default,
          buttonVariants.size[size] || buttonVariants.size.default,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
export { Button };
