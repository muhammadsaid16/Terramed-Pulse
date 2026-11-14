import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';

const TabsContext = createContext(null);

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeValue = value !== undefined ? value : internalValue;

  const handleValueChange = (newVal) => {
    if (value === undefined) {
      setInternalValue(newVal);
    }
    onValueChange?.(newVal);
  };

  return (
    <TabsContext.Provider value={{ activeValue, onValueChange: handleValueChange }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children, ...props }) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center justify-center p-1 rounded-xl',
        'bg-[color:var(--panel-2)]',
        'border border-[color:var(--line)]',
        'text-[color:var(--muted)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  disabled = false,
  className,
  children,
  ...props
}) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }

  const isActive = context.activeValue === value;

  return (
    <button
      role="tab"
      type="button"
      disabled={disabled}
      aria-selected={isActive}
      onClick={() => context.onValueChange(value)}
      className={cn(
        'relative inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-lg select-none',
        'transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50',
        'disabled:pointer-events-none disabled:opacity-50',
        'active:scale-[0.98]',
        isActive
          ? 'bg-[color:var(--panel)] text-[color:var(--ink)] shadow-sm font-semibold border border-[color:var(--line-strong)]'
          : 'hover:text-[color:var(--ink)] hover:bg-[color:var(--panel)]',
        'motion-reduce:transform-none motion-reduce:transition-none',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children, ...props }) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }

  if (context.activeValue !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      className={cn(
        'mt-3 focus-visible:outline-none animate-fadeIn',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Tabs;
