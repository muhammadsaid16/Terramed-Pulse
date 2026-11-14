import React, { createContext, useContext, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const DialogContext = createContext(null);

export function Dialog({ open, onOpenChange, children }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onOpenChange?.(false);
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children, className, ...props }) {
  const context = useContext(DialogContext);
  return (
    <div
      onClick={() => context?.onOpenChange?.(true)}
      className={cn('inline-flex cursor-pointer', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogContent({ className, children, ...props }) {
  const context = useContext(DialogContext);
  if (!context?.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 animate-fadeIn"
        onClick={() => context?.onOpenChange?.(false)}
      />

      {/* Modal Dialog Window */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-50 w-full max-w-lg rounded-3xl bg-[color:var(--panel)] p-6 shadow-2xl border border-[color:var(--line)]',
          'text-[color:var(--ink)]',
          'modal-spring',
          'motion-reduce:animate-none',
          className
        )}
        {...props}
      >
        <button
          type="button"
          onClick={() => context?.onOpenChange?.(false)}
          className="absolute right-4 top-4 rtl:left-4 rtl:right-auto rounded-full p-1.5 text-[color:var(--muted)] hover:text-[color:var(--ink-2)] dark:hover:text-white hover:bg-[color:var(--panel-2)] dark:hover:bg-[color:var(--surface-4)] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, children, ...props }) {
  return (
    <div className={cn('flex flex-col space-y-1.5 text-left rtl:text-right mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function DialogTitle({ className, children, ...props }) {
  return (
    <h2 className={cn('text-lg font-semibold tracking-tight text-[color:var(--ink)]', className)} {...props}>
      {children}
    </h2>
  );
}

export function DialogDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-xs text-[color:var(--muted)] leading-relaxed', className)} {...props}>
      {children}
    </p>
  );
}

export function DialogFooter({ className, children, ...props }) {
  return (
    <div className={cn('flex items-center justify-end gap-2 mt-6 pt-3 border-t border-[color:var(--line)]', className)} {...props}>
      {children}
    </div>
  );
}

export default Dialog;
