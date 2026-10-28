import React from 'react';
import { ArrowUpRight, ArrowDownRight, Compass } from 'lucide-react';

export default function OppositeTrends({ t }) {
  return (
    <div className="apple-glass p-5 mb-8">
      <div className="flex items-center gap-2 mb-2">
        <Compass className="w-5 h-5 text-teal-400" />
        <h3 className="font-extrabold text-sm text-slate-100">
          {t.oppositeTitle}
        </h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        {t.oppositeDesc}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Upper Egypt Hotspot */}
        <div className="bg-space-950/80 p-4 rounded-xl border border-rose-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-rose-300">
              {t.upperEgyptLabel}
            </span>
            <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {t.upperEgyptDetail}
          </p>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-bold">
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">T2M: +0.54°C / dec</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">RH2M: -2.8% / dec</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">NDVI: -4.2%</span>
          </div>
        </div>

        {/* Nile Delta & Coast Hotspot */}
        <div className="bg-space-950/80 p-4 rounded-xl border border-teal-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-teal-300">
              {t.deltaLabel}
            </span>
            <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {t.deltaDetail}
          </p>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-bold">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">RH2M: +2.5% / dec</span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">AOD: +0.08 / dec</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Wet-Bulb: +1.8°C</span>
          </div>
        </div>

      </div>
    </div>
  );
}
