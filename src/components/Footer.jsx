import React from 'react';
import { Award, CalendarClock, Orbit } from 'lucide-react';

// Upstream datasets credited in the footer, in citation order (NASA POWER first).
const DATA_SOURCES = [
  { id: 'power', en: 'NASA POWER', ar: 'مرصد ناسا POWER' },
  { id: 'merra2', en: 'MERRA-2', ar: 'مرصد MERRA-2' },
  { id: 'modis', en: 'MODIS Terra/Aqua', ar: 'أقمار MODIS تيرا/أكوا' },
  { id: 'gldas', en: 'GLDAS Noah', ar: 'نموذج GLDAS نوح' },
  { id: 'sedac', en: 'SEDAC GPWv4', ar: 'مرصد SEDAC السكاني' },
  { id: 'capmas', en: 'CAPMAS', ar: 'الجهاز المركزي للتعبئة والإحصاء (CAPMAS)' }
];

export default function Footer({ lang, t, dataUpdated }) {
  const snapshot = dataUpdated
    ? new Date(dataUpdated).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : null;

  return (
    <footer className="mt-16 border-t border-[color:var(--line)] bg-[color:var(--bg)] py-8 px-4 text-xs text-[color:var(--muted)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 md:flex-row md:items-center">

        <div className="flex items-center gap-3 text-[color:var(--ink)]">
          <Orbit className="h-4 w-4 shrink-0 text-[color:var(--info)] dark:text-sky-400" />
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span dir="ltr" className="font-mono text-2xs font-bold uppercase tracking-[0.26em] text-[color:var(--accent)]">
                TERRAMED PULSE
              </span>
              <span className="text-[color:var(--muted)]">/</span>
              <span className="text-micro font-medium">
                {lang === 'ar' ? 'ابقَ وابنِ مصر — تحدي ناسا لتطبيقات الفضاء 2026' : 'Stay & Build Egypt — NASA Space Apps Challenge 2026'}
              </span>
            </div>
            {snapshot && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[color:var(--muted)]">
                <CalendarClock className="h-3 w-3 text-[color:var(--info)] dark:text-sky-400" />
                <span>{t.dataSnapshotLabel}: {snapshot}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--muted)]">
          {DATA_SOURCES.map((source, i) => (
            <React.Fragment key={source.id}>
              {i > 0 && <span className="text-[color:var(--line-strong)]">/</span>}
              <span>{lang === 'ar' ? source.ar : source.en}</span>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-[color:var(--line)] bg-[color:var(--panel-2)] px-3 py-1 font-medium text-[color:var(--ink-2)]">
          <Award className="h-3.5 w-3.5 text-[color:var(--warn)] dark:text-amber-400" />
          <span>{t.footerArchitecture}</span>
        </div>

      </div>
    </footer>
  );
}
