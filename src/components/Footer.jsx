import React from 'react';
import { Globe, Award, Sparkles } from 'lucide-react';

export default function Footer({ lang, t }) {
  return (
    <footer className="bg-space-950/95 border-t border-white/10 py-8 px-4 text-xs text-slate-400 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-teal-400" />
          <span>
            <b>TerraPulse: Stay & Build Egypt</b> — NASA Space Apps Challenge 2026
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-slate-500 font-medium text-[11px]">
          <span>NASA POWER</span>
          <span>•</span>
          <span>MERRA-2</span>
          <span>•</span>
          <span>MODIS Terra/Aqua</span>
          <span>•</span>
          <span>GLDAS Noah</span>
          <span>•</span>
          <span>SEDAC CIESIN</span>
          <span>•</span>
          <span>CAPMAS</span>
        </div>

        <div className="flex items-center gap-1.5 text-teal-300 font-bold">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>NASA Grand Prize Finalist Architecture</span>
        </div>

      </div>
    </footer>
  );
}
