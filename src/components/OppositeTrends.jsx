import React from 'react';
import { ArrowUpRight, ArrowDownRight, Compass } from 'lucide-react';

export default function OppositeTrends({ t }) {
  return (
    <div className="apple-glass p-6 sm:p-8 mb-8 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
            <Compass className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-white">
              {t.oppositeTitle}
            </h3>
            <p className="text-xs text-white/50 font-normal mt-0.5">
              {t.oppositeDesc}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Upper Egypt Hotspot */}
        <div className="apple-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-xs text-rose-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              {t.upperEgyptLabel}
            </span>
            <div className="w-7 h-7 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-white/70 leading-relaxed font-normal">
            {t.upperEgyptDetail}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium tabular-nums">
            <span className="px-2.5 py-1 rounded-full bg-white/[0.04] text-rose-300 border border-white/[0.08]">
              T2M: +0.54°C / dec
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/[0.04] text-sky-300 border border-white/[0.08]">
              RH2M: -2.8% / dec
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/[0.04] text-amber-300 border border-white/[0.08]">
              NDVI: -4.2%
            </span>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Nile Delta & Coast Hotspot */}
        <div className="apple-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-xs text-sky-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              {t.deltaLabel}
            </span>
            <div className="w-7 h-7 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-white/70 leading-relaxed font-normal">
            {t.deltaDetail}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium tabular-nums">
            <span className="px-2.5 py-1 rounded-full bg-white/[0.04] text-sky-300 border border-white/[0.08]">
              RH2M: +2.5% / dec
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/[0.04] text-purple-300 border border-white/[0.08]">
              AOD: +0.08 / dec
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/[0.04] text-emerald-300 border border-white/[0.08]">
              Wet-Bulb: +1.8°C
            </span>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

      </div>
    </div>
  );
}
