import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Play, Pause, ChevronLeft, ChevronRight, Layers, Eye } from 'lucide-react';

export default function MapModule({
  data,
  selectedGov,
  setSelectedGov,
  selectedVar,
  lang,
  t,
  year,
  setYear,
  mapMetric = 'hni',
  setMapMetric
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef(null);

  // Helper for color by score
  const getSeverityColor = (score) => {
    if (score >= 80) return "#f43f5e"; // Rose / Critical
    if (score >= 70) return "#f59e0b"; // Amber / High
    if (score >= 60) return "#38bdf8"; // Sky / Moderate
    return "#10b981"; // Emerald
  };

  // Helper for metric value
  const getGovMetricValue = (gov, currentYear, metric) => {
    if (!gov) return 0;
    const yearIdx = Math.max(0, Math.min(30, currentYear - 1995));

    if (metric === 'hni') return Math.round(gov.baseline_indices?.hni || 70);
    if (metric === 'epi') return Math.round(gov.baseline_indices?.epi || 70);
    if (metric === 'ppi') return Math.round(gov.baseline_indices?.ppi || 50);
    if (metric === 'fsi') return Math.round(gov.baseline_indices?.fsi || 60);
    if (metric === 'wni') return Math.round(gov.baseline_indices?.wni || 75);

    // Variable specific
    const series = gov.series?.[selectedVar];
    if (series && typeof series[yearIdx] === 'number') {
      const val = series[yearIdx];
      return val > 20 ? Math.round(val) : val.toFixed(1);
    }
    return Math.round(gov.baseline_indices?.hni || 70);
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [26.8, 30.8],
      zoom: 6,
      minZoom: 5,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: false
    });

    // Watermark-free Esri World Dark Gray Base
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      subdomains: ['server']
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update or create markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !data?.governorates) return;

    const govs = data.governorates;

    Object.keys(govs).forEach(govId => {
      const gov = govs[govId];
      const coords = [gov.lat, gov.lng];
      const val = getGovMetricValue(gov, year, mapMetric);
      const score = gov.baseline_indices?.hni || 70;
      const color = getSeverityColor(score);
      const isSelected = selectedGov === govId;
      const name = lang === 'ar' ? gov.name_ar : gov.name_en;

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 44px; height: 44px;">
          <div class="marker-pulse-ring" style="width: 44px; height: 44px; border: 2px solid ${color};"></div>
          <div class="w-9 h-9 rounded-full flex flex-col items-center justify-center text-[11px] font-black text-white shadow-xl transition-transform ${isSelected ? 'scale-125 ring-2 ring-teal-300' : 'group-hover:scale-110'}" style="background-color: ${color}">
            <span class="leading-none tabular-nums">${val}</span>
          </div>
          <div class="absolute -bottom-5 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap shadow-xl border ${isSelected ? 'bg-teal-900/95 text-teal-200 border-teal-400' : 'bg-slate-900/90 text-slate-200 border-slate-700'}">
            ${name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: iconHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      if (markersRef.current[govId]) {
        markersRef.current[govId].setIcon(customIcon);
      } else {
        const marker = L.marker(coords, { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedGov(govId);
        });
        markersRef.current[govId] = marker;
      }
    });
  }, [data, selectedGov, selectedVar, year, mapMetric, lang]);

  // Handle Play / Pause 30-year Time-Lapse
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setYear(prev => (prev >= 2025 ? 1995 : prev + 1));
      }, 750);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, setYear]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Map Toolbar: Metric Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-space-950/70 p-3 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold text-slate-200">{t.layerSelectorLabel}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'hni', label: 'HNI (Overall Need)' },
            { id: 'epi', label: 'EPI (NASA Climate)' },
            { id: 'ppi', label: 'PPI (Population)' },
            { id: 'fsi', label: 'FSI (Facilities)' },
            { id: 'wni', label: 'WNI (Workforce)' },
            { id: 'var', label: 'Satellite Var' }
          ].map(metric => (
            <button
              key={metric.id}
              onClick={() => setMapMetric(metric.id)}
              className={`apple-chip px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                mapMetric === metric.id
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 min-h-[360px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <div ref={mapContainerRef} className="w-full h-full min-h-[360px]" />

        {/* Floating Map Legend */}
        <div className="absolute bottom-4 left-4 z-[400] bg-space-950/90 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-xl text-xs space-y-1.5">
          <div className="font-bold text-[11px] text-slate-300">{t.legendHni}</div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">{t.legendCritical}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">{t.legendHigh}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <span className="text-slate-300">{t.legendModerate}</span>
          </div>
        </div>
      </div>

      {/* Time-Lapse Scrubber & Controls */}
      <div className="bg-space-950/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="apple-btn px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-black flex items-center gap-1.5 shadow-md shadow-teal-500/20"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? t.btnPauseTime : t.btnPlayTime}</span>
            </button>

            <button
              onClick={() => setYear(prev => Math.max(1995, prev - 1))}
              className="apple-btn p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Previous Year"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setYear(prev => Math.min(2025, prev + 1))}
              className="apple-btn p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Next Year"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">{t.timelapseYearLabel}</span>
            <span className="text-lg font-black text-teal-300 tabular-nums bg-teal-950/60 px-2.5 py-0.5 rounded-lg border border-teal-500/40">
              {year}
            </span>
          </div>
        </div>

        {/* 1995-2025 Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="1995"
            max="2025"
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value));
              if (isPlaying) setIsPlaying(false);
            }}
            className="slider-teal"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-medium px-1">
            <span>1995 (Baseline Orbit)</span>
            <span>2010 (Mid-Point)</span>
            <span>2025 (Present State)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
