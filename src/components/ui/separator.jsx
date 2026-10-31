import React from 'react';
import { cn } from '../../lib/utils';

export function Separator({
  orientation = 'horizontal',
  decorative = true,
  className,
  ...props
}) {
  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-orientation={orientation}
      className={cn(
        'shrink-0 bg-slate-200/80 dark:bg-white/[0.08]',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  );
}

export default Separator;
