import React from 'react';
import { Globe, Award, Sparkles, Orbit } from 'lucide-react';

export default function Footer({ lang, t }) {
  return (
    <footer className="border-t border-white/[0.08] bg-[#040508]/80 backdrop-blur-2xl py-8 px-4 text-xs text-white/50 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 text-white/80">
          <Orbit className="w-4 h-4 text-sky-400" />
          <span className="font-medium">
            TerraPulse: Stay & Build Egypt — NASA Space Apps Challenge 2026
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-white/40 text-[11px] font-normal">
          <span>NASA POWER</span>
          <span>•</span>
          <span>MERRA-2</span>
          <span>•</span>
          <span>MODIS Terra/Aqua</span>
          <span>•</span>
          <span>GLDAS Noah</span>
          <span>•</span>
          <span>SEDAC GPWv4</span>
          <span>•</span>
          <span>CAPMAS</span>
        </div>

        <div className="flex items-center gap-1.5 text-white/80 font-medium bg-white/[0.04] px-3 py-1 rounded-full border border-white/10">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>NASA Space Apps 2026 Architecture</span>
        </div>

      </div>
    </footer>
  );
}
