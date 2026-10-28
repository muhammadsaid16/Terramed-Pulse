import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Play, Pause, ChevronLeft, ChevronRight, Layers, Flame, Eye, Thermometer, ShieldAlert, Sparkles, Activity } from 'lucide-react';

import { EGYPT_GOVS_GEOJSON } from '../data/egyptGovernoratesGeoJson';

// Verified visual centroids ensuring every circle marker sits directly in the center of its governorate polygon
const GOV_MAP_COORDINATES = {
  alexandria: [31.0500, 29.8500], // True visual center of Alexandria governorate
  cairo:      [30.0400, 31.5500], // Center of Cairo governorate polygon (East Cairo axis)
  giza:       [29.8000, 30.7000], // Center of Giza metropolitan & plateau polygon
  assiut:     [27.3500, 31.3500], // Visual center of Assiut Nile valley polygon
  aswan:      [24.1000, 32.8500]  // Center of Aswan Nile valley polygon
};

// Calibrated 6-tier Climate & Heat Color Palette ensuring Cairo & Giza contrast
function getDynamicColor(score) {
  if (score >= 72) return '#f43f5e'; // Blazing Crimson Red (Critical Crisis - e.g. Aswan)
  if (score >= 63) return '#f97316'; // Deep Fiery Orange (Severe Heat - e.g. Assiut)
  if (score >= 57) return '#f59e0b'; // Golden Amber (High Arid Burden - e.g. Giza)
  if (score >= 50) return '#8b5cf6'; // Electric Violet (Urban Smog & Heat Island - e.g. Cairo)
  if (score >= 44) return '#06b6d4'; // Radiant Cyan (Moderate Coastal - e.g. Alexandria)
  return '#10b981';                  // Cool Emerald Green (Baseline Mild)
}

// Compute dynamic annual metric value and 0-100 severity score for every year
function getAnnualMetricData(gov, currentYear, metric, selectedVar) {
  if (!gov) return { displayVal: 0, severityScore: 50 };
  const yearIdx = Math.max(0, Math.min(30, currentYear - 1995));

  const t2mMax = gov.series?.T2M_MAX?.[yearIdx] ?? 38;
  const heatDays = gov.series?.EXTREME_HEAT_DAYS?.[yearIdx] ?? 45;
  const aod = gov.series?.AOD_550?.[yearIdx] ?? 0.45;
  const ndvi = gov.series?.NDVI?.[yearIdx] ?? 0.25;

  let displayVal = 0;
  let severityScore = 50;

  if (metric === 'var') {
    const series = gov.series?.[selectedVar];
    const val = series ? series[yearIdx] : 0;
    displayVal = typeof val === 'number' ? (val > 20 ? Math.round(val) : val.toFixed(2)) : val;

    if (selectedVar === 'T2M_MAX') {
      severityScore = ((t2mMax - 36) / (49 - 36)) * 100;
    } else if (selectedVar === 'EXTREME_HEAT_DAYS') {
      severityScore = ((heatDays - 20) / (90 - 20)) * 100;
    } else if (selectedVar === 'NDVI') {
      severityScore = (1 - (ndvi - 0.18) / (0.35 - 0.18)) * 100;
    } else if (selectedVar === 'AOD_550') {
      severityScore = ((aod - 0.25) / (0.85 - 0.25)) * 100;
    } else {
      severityScore = ((val - 20) / (50 - 20)) * 100;
    }
  } else {
    // Dynamic Annual Climate-Health Need Index
    const annualEpi = Math.min(100, Math.max(20,
      ((heatDays - 25) / (88 - 25)) * 50 +
      ((t2mMax - 36) / (49 - 36)) * 30 +
      ((aod - 0.25) / (0.80 - 0.25)) * 20
    ));

    const popGrowth = 0.72 + (yearIdx / 30) * 0.28;
    const annualPpi = (gov.baseline_indices?.ppi || 50) * popGrowth;
    const baseFsi = gov.baseline_indices?.fsi || 60;
    const baseWni = gov.baseline_indices?.wni || gov.baseline_indices?.wni_prior || 75;

    const annualHni = Math.round(
      (0.35 * annualEpi) + (0.30 * annualPpi) + (0.20 * baseFsi) + (0.15 * baseWni)
    );

    if (metric === 'hni') {
      displayVal = annualHni;
      severityScore = annualHni;
    } else if (metric === 'epi') {
      displayVal = Math.round(annualEpi);
      severityScore = annualEpi;
    } else if (metric === 'ppi') {
      displayVal = Math.round(annualPpi);
      severityScore = annualPpi;
    } else if (metric === 'fsi') {
      displayVal = Math.round(baseFsi);
      severityScore = baseFsi;
    } else if (metric === 'wni') {
      displayVal = Math.round(baseWni);
      severityScore = baseWni;
    }
  }

  severityScore = Math.max(10, Math.min(100, Math.round(severityScore)));
  return { displayVal, severityScore };
}

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
  const layerGroupRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Safety: remove previous leaflet id if container was reused
    if (mapContainerRef.current._leaflet_id) {
      delete mapContainerRef.current._leaflet_id;
    }

    const map = L.map(mapContainerRef.current, {
      center: [27.0, 31.0],
      zoom: 6,
      minZoom: 5,
      maxZoom: 9,
      zoomControl: false,
      attributionControl: false
    });

    // High performance keyless Esri World Dark Gray Base
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      subdomains: ['server']
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;
    setMapReady(true);

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 120);

    return () => {
      clearTimeout(timer);
      setMapReady(false);
      if (layerGroupRef.current) {
        layerGroupRef.current.clearLayers();
        layerGroupRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Synchronize Official GeoJSON Boundaries and Pulse Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup || !data?.governorates) return;

    // Clean previous layers on this map instance
    layerGroup.clearLayers();

    const govs = data.governorates;

    // 1. Official UN OCHA / geoBoundaries Egypt Governorate Polygons
    const geoJsonLayer = L.geoJSON(EGYPT_GOVS_GEOJSON, {
      style: (feature) => {
        const govId = feature.properties.govId;
        const gov = govs[govId];
        const { severityScore } = getAnnualMetricData(gov, year, mapMetric, selectedVar);
        const color = getDynamicColor(severityScore);
        const isSelected = selectedGov === govId;
        const fillOpacity = isSelected ? 0.70 : 0.40 + (severityScore / 100) * 0.32;

        return {
          color: isSelected ? '#ffffff' : color,
          weight: isSelected ? 3 : 1.5,
          fillColor: color,
          fillOpacity: fillOpacity,
          dashArray: isSelected ? null : '4, 4'
        };
      },
      onEachFeature: (feature, layer) => {
        const govId = feature.properties.govId;
        layer.on('click', () => setSelectedGov(govId));
      }
    });
    layerGroup.addLayer(geoJsonLayer);

    // 2. Glowing Interactive Pulse Marker with Live Annual Score
    Object.keys(govs).forEach(govId => {
      const gov = govs[govId];
      const coords = GOV_MAP_COORDINATES[govId] || [gov.lat, gov.lng];
      const { displayVal, severityScore } = getAnnualMetricData(gov, year, mapMetric, selectedVar);
      const color = getDynamicColor(severityScore);
      const isSelected = selectedGov === govId;
      const name = lang === 'ar' ? gov.name_ar : gov.name_en;

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 52px; height: 52px;">
          <div class="marker-pulse-ring" style="width: 52px; height: 52px; border: 3px solid ${color};"></div>
          <div class="w-11 h-11 rounded-full flex flex-col items-center justify-center text-[12px] font-black text-white shadow-2xl transition-all duration-300 ${
            isSelected ? 'scale-125 ring-4 ring-teal-300' : 'group-hover:scale-115'
          }" style="background-color: ${color}; box-shadow: 0 0 20px ${color}99;">
            <span class="leading-none tabular-nums font-black">${displayVal}</span>
          </div>
          <div class="absolute -bottom-6 px-2.5 py-0.5 rounded-lg text-[10px] font-black whitespace-nowrap shadow-2xl border transition-all ${
            isSelected
              ? 'bg-teal-900/95 text-teal-200 border-teal-400 scale-110 shadow-apple-glow'
              : 'bg-slate-900/90 text-slate-200 border-slate-700'
          }">
            ${name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: iconHtml,
        iconSize: [52, 52],
        iconAnchor: [26, 26]
      });

      const marker = L.marker(coords, { icon: customIcon });
      marker.on('click', () => setSelectedGov(govId));
      layerGroup.addLayer(marker);
    });
  }, [mapReady, data, selectedGov, selectedVar, year, mapMetric, lang]);

  // Handle Play / Pause 30-year Time-Lapse
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setYear(prev => (prev >= 2025 ? 1995 : prev + 1));
      }, 650);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, setYear]);

  // Year Timeline Metadata & Alert Levels
  const timelinePhase = useMemo(() => {
    if (year <= 2000) {
      return {
        title_en: '1995-2000: Baseline Climatology — Moderate Thermal Load',
        title_ar: '1995-2000: خط الأساس المناخي — حمل حراري معتدل ومساحات زراعية مستقرة',
        anomaly: '+0.0°C',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        badge: 'Baseline Orbit'
      };
    } else if (year <= 2012) {
      return {
        title_en: '2001-2012: Warming Acceleration & Upper Egypt Heat Escalation',
        title_ar: '2001-2012: تسارع الاحترار وتزايد الإجهاد الحراري بصعيد مصر',
        anomaly: '+0.65°C',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        badge: 'Warming Accelerating'
      };
    } else {
      return {
        title_en: '2013-2025: CRITICAL HEAT DOME & ARIDIFICATION PEAK',
        title_ar: '2013-2025: ذروة القباب الحرارية وأزمة الجفاف القصوى بالصعيد',
        anomaly: '+1.46°C',
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/25 text-rose-300 border-rose-500/50',
        badge: 'CRITICAL ALERT'
      };
    }
  }, [year]);

  return (
    <div className="flex flex-col h-full space-y-3">
      
      {/* Top Map Metric Selector Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-space-950/85 p-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold text-slate-200">{t.layerSelectorLabel}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'hni', label: 'HNI (Annual Need)' },
            { id: 'epi', label: 'EPI (NASA Heat/Dust)' },
            { id: 'var', label: 'Live NASA Var' },
            { id: 'ppi', label: 'PPI (Population)' },
            { id: 'fsi', label: 'FSI (Facilities)' },
            { id: 'wni', label: 'WNI (Workforce)' }
          ].map(metric => (
            <button
              key={metric.id}
              onClick={() => setMapMetric(metric.id)}
              className={`apple-chip px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                mapMetric === metric.id
                  ? 'bg-teal-500 text-slate-950 font-black shadow-apple-glow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Viewport Container */}
      <div className="relative flex-1 min-h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" />

        {/* Dynamic On-Map Year HUD Banner */}
        <div className="absolute top-3 left-3 right-3 z-[400] bg-space-950/90 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/15 shadow-2xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <Flame className={`w-4 h-4 shrink-0 ${timelinePhase.color} animate-pulse`} />
            <span className="text-xs font-black text-slate-100 truncate">
              {lang === 'ar' ? timelinePhase.title_ar : timelinePhase.title_en}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-black tabular-nums ${timelinePhase.color}`}>
              {timelinePhase.anomaly}
            </span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${timelinePhase.bgColor}`}>
              {timelinePhase.badge}
            </span>
          </div>
        </div>

        {/* Dynamic Live Heatmap Legend */}
        <div className="absolute bottom-4 left-4 z-[400] bg-space-950/95 backdrop-blur-md p-3 rounded-2xl border border-white/15 shadow-2xl text-xs space-y-1.5">
          <div className="font-extrabold text-[11px] text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Heat & Stress Scale ({year})</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
            <span className="text-slate-200 font-bold">Critical Peak (≥ 72 HNI / Alert)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50"></span>
            <span className="text-slate-200 font-bold">Severe Heat (63 - 71)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
            <span className="text-slate-200 font-bold">High Arid Burden (57 - 62)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50"></span>
            <span className="text-slate-200 font-bold">Urban Smog & Density (50 - 56)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50"></span>
            <span className="text-slate-200 font-bold">Moderate Strain (44 - 49)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            <span className="text-slate-200 font-bold">Baseline Cool (&lt; 44)</span>
          </div>
        </div>
      </div>

      {/* 30-Year Time-Lapse Slider Control Box */}
      <div className="bg-space-950/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="apple-btn px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black flex items-center gap-2 shadow-apple-glow"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? t.btnPauseTime : t.btnPlayTime}</span>
            </button>

            <button
              onClick={() => setYear(prev => Math.max(1995, prev - 1))}
              className="apple-chip p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5"
              title="Previous Year"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>

            <button
              onClick={() => setYear(prev => Math.min(2025, prev + 1))}
              className="apple-chip p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5"
              title="Next Year"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-slate-400 font-bold text-xs">{t.timelapseYearLabel}</span>
            <span className="text-2xl font-black text-teal-300 tabular-nums bg-teal-950/80 px-3.5 py-1 rounded-xl border border-teal-500/50 shadow-inner">
              {year}
            </span>
          </div>
        </div>

        {/* Interactive Slider Bar */}
        <div className="space-y-1.5">
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
          <div className="flex justify-between text-[11px] font-bold px-1 tabular-nums">
            <span className="text-emerald-400">1995 (Baseline Orbit: +0.0°C)</span>
            <span className="text-amber-400">2010 (Mid-Point: +0.65°C)</span>
            <span className="text-rose-400 font-black">2025 (Present Crisis: +1.46°C)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
