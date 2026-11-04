import React from 'react';
import { Award, Orbit } from 'lucide-react';

// Upstream datasets credited in the footer, in citation order (NASA POWER first).
const DATA_SOURCES = [
  { id: 'power', en: 'NASA POWER', ar: 'مرصد ناسا POWER' },
  { id: 'merra2', en: 'MERRA-2', ar: 'مرصد MERRA-2' },
  { id: 'modis', en: 'MODIS Terra/Aqua', ar: 'أقمار MODIS تيرا/أكوا' },
  { id: 'gldas', en: 'GLDAS Noah', ar: 'نموذج GLDAS نوح' },
  { id: 'sedac', en: 'SEDAC GPWv4', ar: 'مرصد SEDAC السكاني' },
  { id: 'capmas', en: 'CAPMAS', ar: 'الجهاز المركزي للتعبئة والإحصاء (CAPMAS)' }
];

export default function Footer({ lang, t }) {
  return (
    <footer className="border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/90 dark:bg-[#040508]/80 backdrop-blur-2xl py-8 px-4 text-xs text-slate-500 dark:text-white/50 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2.5 text-slate-800 dark:text-white/80">
          <Orbit className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
          <div className="flex flex-wrap items-center gap-1.5 font-medium">
            <span dir="ltr" className="font-mono font-bold tracking-[0.25em] text-sky-600 dark:text-sky-400 uppercase">
              TERRAMED &nbsp; PULSE
            </span>
            <span className="text-slate-400 dark:text-white/30">•</span>
            <span>
              {lang === 'ar' ? 'ابقَ وابنِ مصر — تحدي ناسا لتطبيقات الفضاء 2026' : 'Stay & Build Egypt — NASA Space Apps Challenge 2026'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-slate-500 dark:text-white/40 text-micro font-normal">
          {DATA_SOURCES.map((source, i) => (
            <React.Fragment key={source.id}>
              {i > 0 && <span className="text-slate-300 dark:text-white/20">•</span>}
              <span>{lang === 'ar' ? source.ar : source.en}</span>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-slate-700 dark:text-white/80 font-medium bg-white dark:bg-white/[0.04] px-3 py-1 rounded-full border border-slate-200/80 dark:border-white/10 shadow-2xs dark:shadow-none">
          <Award className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span>
            {t.footerArchitecture}
          </span>
        </div>

      </div>
    </footer>
  );
}
