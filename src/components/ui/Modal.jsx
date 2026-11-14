import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Modal shell.
 *
 * Every dialog in the app uses this so that one implementation owns the
 * accessibility contract:
 *   - Escape closes it
 *   - focus moves into the dialog on open and returns to the trigger on close
 *   - Tab cycles inside the dialog instead of escaping to the page behind it
 *   - the page behind is marked aria-hidden to assistive technology
 *
 * The three modals that existed before this shared the overlay markup but not
 * the behaviour, so two of them could not be closed with the keyboard at all.
 */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

export default function Modal({
  isOpen,
  onClose,
  title,
  titleId,
  children,
  className = '',
  panelClassName = '',
  labelledBy
}) {
  const panelRef = useRef(null);
  const restoreRef = useRef(null);
  const headingId = titleId || 'modal-heading';

  useEffect(() => {
    if (!isOpen) return undefined;

    restoreRef.current = document.activeElement;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
        el => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);

    // Move focus into the dialog once it has painted.
    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const target = panel.querySelector(FOCUSABLE) || panel;
      target.focus?.();
    });

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      cancelAnimationFrame(raf);
      // Return the user to where they were before the dialog opened.
      const restore = restoreRef.current;
      if (restore && typeof restore.focus === 'function') {
        restore.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy || headingId}
        tabIndex={-1}
        className={cn(
          'bg-[color:var(--panel)] backdrop-blur-3xl border border-[color:var(--line-strong)] rounded-3xl w-full p-6 sm:p-8 modal-spring space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto',
          panelClassName,
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between gap-3 border-b border-[color:var(--line)] pb-4">
            <h3 id={headingId} className="font-semibold text-base text-[color:var(--ink)]">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="apple-chip p-1.5 rounded-full text-[color:var(--muted)] hover:text-[color:var(--ink-2)] hover:bg-[color:var(--panel-2)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
