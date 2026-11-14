import React from 'react';
import { cn } from '../../lib/utils';

export const Card = React.forwardRef(({ className, interactive = false, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] shadow-sm backdrop-blur-sm',
      'transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
      interactive && 'hover:-translate-y-0.5 hover:shadow-md hover:border-[color:var(--line-strong)]',
      'motion-reduce:transform-none motion-reduce:transition-none',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

export const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-5 sm:p-6', className)}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold text-base sm:text-lg text-[color:var(--ink)] tracking-tight', className)}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs text-[color:var(--muted)] font-normal leading-relaxed', className)}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 sm:p-6 pt-0', className)} {...props}>
    {children}
  </div>
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-5 sm:p-6 pt-0 border-t border-[color:var(--line)] mt-4', className)}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';

export default Card;
