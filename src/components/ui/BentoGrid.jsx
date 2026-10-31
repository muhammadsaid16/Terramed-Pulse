import React from 'react';

/**
 * 21st.dev BentoGrid Component
 * Responsive layout container for modular bento dashboard cards.
 */
export function BentoGrid({ children, className = '' }) {
  return (
    <div
      className={`grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * 21st.dev BentoCard Component
 * Individual card within a BentoGrid with optional background graphic, badge, and interactive states.
 */
export function BentoCard({
  name,
  className = '',
  background,
  Icon,
  description,
  href,
  cta,
  children,
  badge,
  ...props
}) {
  return (
    <div
      className={`group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-2xl md:rounded-3xl border border-slate-200/80 bg-white/80 p-5 sm:p-6 shadow-sm backdrop-blur-xl transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:shadow-md dark:border-white/[0.08] dark:bg-[#0a0f1d]/70 dark:hover:border-white/[0.15] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] enter-pop ${className}`}
      {...props}
    >
      {background && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-80 dark:opacity-60">
          {background}
        </div>
      )}

      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-sky-400 border border-slate-200/70 dark:border-white/10 flex items-center justify-center transition-transform group-hover:scale-110">
                <Icon className="w-4 h-4" />
              </div>
            )}
            {badge && (
              <span className="text-2xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20">
                {badge}
              </span>
            )}
          </div>

          {name && (
            <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              {name}
            </h3>
          )}

          {description && (
            <p className="mt-1 text-xs text-slate-600 dark:text-white/60 leading-relaxed font-normal">
              {description}
            </p>
          )}
        </div>

        {children && <div className="mt-2">{children}</div>}

        {cta && (
          <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:text-sky-500 transition-colors">
            <span>{cta}</span>
            <span className="ltr:ml-1 rtl:mr-1 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">→</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default BentoGrid;
