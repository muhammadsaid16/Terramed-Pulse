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
    <footer className="border-t border-white/[0.08] bg-[#040508]/80 backdrop-blur-2xl py-8 px-4 text-xs text-white/50 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 text-white/80">
          <Orbit className="w-4 h-4 text-sky-400" />
          <span className="font-medium">
            {t.footerTagline}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-white/40 text-[11px] font-normal">
          {DATA_SOURCES.map((source, i) => (
            <React.Fragment key={source.id}>
              {i > 0 && <span>•</span>}
              <span>{lang === 'ar' ? source.ar : source.en}</span>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-white/80 font-medium bg-white/[0.04] px-3 py-1 rounded-full border border-white/10">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {t.footerArchitecture}
          </span>
        </div>

      </div>
    </footer>
  );
}
