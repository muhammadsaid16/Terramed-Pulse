import React from 'react';

/**
 * Console section header: numbered rail, title, deck, and an optional
 * right-hand telemetry label. One visual family for every module.
 */
export default function SectionHeader({
  index,
  title,
  subtitle,
  meta,
  Icon,
  right,
  className = ''
}) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-4 ${className}`}>
      <div className="flex min-w-0 items-start gap-3.5">
        <div className="flex shrink-0 flex-col items-center gap-2 pt-0.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[color:var(--line-strong)] bg-[color:var(--panel-2)] font-mono text-micro font-semibold tabular-nums text-[color:var(--accent)]"
          >
            {index}
          </span>
          <span aria-hidden="true" className="hidden h-10 w-px bg-[color:var(--line)] sm:block" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-[color:var(--ink)] sm:text-[22px] sm:leading-[1.2]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1.5 max-w-2xl text-micro leading-relaxed text-[color:var(--muted)]">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-2 pt-1.5 sm:justify-end">
        {right || (
          <>
            {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 text-[color:var(--muted)]" /> : null}
            {meta ? (
              <span className="break-words text-left font-mono text-2xs uppercase tracking-[0.16em] text-[color:var(--muted)] sm:text-right">
                {meta}
              </span>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
