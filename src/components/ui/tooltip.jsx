import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export function TooltipProvider({ children }) {
  return <>{children}</>;
}

export function Tooltip({ children, delayDuration = 100 }) {
  const [open, setOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => setOpen(true), delayDuration);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setOpen(false);
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          'data-state': open ? 'open' : 'closed',
          open
        });
      })}
    </div>
  );
}

export function TooltipTrigger({ children, className, ...props }) {
  return (
    <span className={cn('inline-flex items-center cursor-pointer', className)} {...props}>
      {children}
    </span>
  );
}

export function TooltipContent({
  children,
  side = 'top',
  open,
  className,
  ...props
}) {
  if (!open) return null;

  const sidePositions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5'
  };

  return (
    <div
      role="tooltip"
      className={cn(
        'absolute z-50 pointer-events-none whitespace-nowrap px-2.5 py-1 text-micro font-medium leading-none rounded-md',
        'bg-[color:var(--ink)] text-white shadow-lg border border-[color:var(--line-strong)]',
        
        'enter-pop motion-reduce:animate-none',
        sidePositions[side] || sidePositions.top,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Tooltip;
