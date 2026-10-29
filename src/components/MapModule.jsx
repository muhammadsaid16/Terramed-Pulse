import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Play, Pause, ChevronLeft, ChevronRight, Layers, Flame, Sparkles, CloudOff } from 'lucide-react';

import { EGYPT_GOVS_GEOJSON } from '../data/egyptGovernoratesGeoJson';
import { HNI_WEIGHTS } from '../lib/trendEngine';

// Verified visual centroids ensuring every circle marker sits directly in the center of its governorate polygon
const GOV_MAP_COORDINATES = {
  alexandria: [31.0500, 29.8500], // True visual center of Alexandria governorate
  cairo:      [30.0400, 31.5500], // Center of Cairo governorate polygon (East Cairo axis)
  giza:       [29.8000, 30.7000], // Center of Giza metropolitan & plateau polygon
  assiut:     [27.3500, 31.3500], // Visual center of Assiut Nile valley polygon
  aswan:      [24.1000, 32.8500]  // Center of Aswan Nile valley polygon
};

// Calibrated 6-tier Climate & Heat scale: single source for the polygon/marker color and the on-map legend.
// Tier `min` thresholds are mirrored in the legend caption strings — keep both in sync.
const HEAT_TIERS = [
  { min: 72, hex: '#f43f5e', dot: 'bg-rose-500 shadow-sm shadow-rose-500/50', labelKey: 'scaleCritical' },
  { min: 63, hex: '#f97316', dot: 'bg-orange-500 shadow-sm shadow-orange-500/50', labelKey: 'scaleSevere' },
  { min: 57, hex: '#f59e0b', dot: 'bg-amber-500 shadow-sm shadow-amber-500/50', labelKey: 'scaleArid' },
  { min: 50, hex: '#8b5cf6', dot: 'bg-purple-500 shadow-sm shadow-purple-500/50', labelKey: 'scaleSmog' },
  { min: 44, hex: '#06b6d4', dot: 'bg-cyan-500 shadow-sm shadow-cyan-500/50', labelKey: 'scaleModerate' },
  { min: 10, hex: '#10b981', dot: 'bg-emerald-500 shadow-sm shadow-emerald-500/50', labelKey: 'scaleBaseline' }
];

// Severity scores are clamped to [10, 100] upstream, so the last tier is unreachable only below 10.
function getDynamicColor(score) {
  return (HEAT_TIERS.find(tier => score >= tier.min) || HEAT_TIERS[HEAT_TIERS.length - 1]).hex;
}

// Map layer switcher: id feeds getAnnualMetricData, labelKey feeds TRANSLATIONS.
const MAP_METRIC_OPTIONS = [
  { id: 'hni', labelKey: 'layerHni' },
  { id: 'epi', labelKey: 'layerEpi' },
  { id: 'var', labelKey: 'layerVar' },
  { id: 'ppi', labelKey: 'layerPpi' },
  { id: 'fsi', labelKey: 'layerFsi' },
  { id: 'wni', labelKey: 'layerWni' }
];

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
      (HNI_WEIGHTS.epi * annualEpi) + (HNI_WEIGHTS.ppi * annualPpi) + (HNI_WEIGHTS.fsi * baseFsi) + (HNI_WEIGHTS.wni * baseWni)
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
  // 'unknown' until the first tile answers, then 'online' or 'unavailable'.
  const [basemapState, setBasemapState] = useState('unknown');
  const basemapSettledRef = useRef(false);

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
    const basemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      subdomains: ['server']
    }).addTo(map);

    // Tiles come from Esri, so an air-gapped machine loses the basemap but keeps every
    // overlay. Leaflet does not retry a failed tile, so the only thing to control here is
    // reporting: settle on the first definitive answer and ignore the rest, otherwise each
    // visible tile error would re-render the module.
    basemap.on('tileload', () => {
      if (basemapSettledRef.current) return;
      basemapSettledRef.current = true;
      setBasemapState('online');
    });
    basemap.on('tileerror', () => {
      if (basemapSettledRef.current) return;
      basemapSettledRef.current = true;
      setBasemapState('unavailable');
    });

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
      basemapSettledRef.current = false;
      setBasemapState('unknown');
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

  // Class is toggled imperatively because Leaflet owns this element's className; a
  // React-written className attribute would strip `leaflet-container` and unstyle the map.
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    el.classList.toggle('basemap-unavailable', basemapState === 'unavailable');
  }, [basemapState]);

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
          <div class="marker-pulse-ring" style="width: 52px; height: 52px; border: 2px solid ${color};"></div>
          <div class="w-10 h-10 rounded-full flex flex-col items-center justify-center text-[12px] font-semibold text-white transition-all duration-300 ${
            isSelected ? 'scale-125 ring-2 ring-white shadow-[0_0_30px_rgba(255,255,255,0.45)]' : 'group-hover:scale-110'
          }" style="background-color: ${color}; box-shadow: 0 6px 20px ${color}80, inset 0 1px 1px rgba(255,255,255,0.4);">
            <span class="leading-none tabular-nums font-semibold">${displayVal}</span>
          </div>
          <div class="absolute -bottom-6 px-2.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap border transition-all ${
            isSelected
              ? 'bg-white text-black border-white scale-105 font-semibold shadow-[0_4px_16px_rgba(255,255,255,0.3)]'
              : 'bg-[#07090F]/90 backdrop-blur-md text-white/90 border-white/10 shadow-lg'
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
        badge: t.phaseBaselineBadge
      };
    } else if (year <= 2012) {
      return {
        title_en: '2001-2012: Warming Acceleration & Upper Egypt Heat Escalation',
        title_ar: '2001-2012: تسارع الاحترار وتزايد الإجهاد الحراري بصعيد مصر',
        anomaly: '+0.65°C',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        badge: t.phaseWarmingBadge
      };
    } else {
      return {
        title_en: '2013-2025: CRITICAL HEAT DOME & ARIDIFICATION PEAK',
        title_ar: '2013-2025: ذروة القباب الحرارية وأزمة الجفاف القصوى بالصعيد',
        anomaly: '+1.46°C',
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/25 text-rose-300 border-rose-500/50',
        badge: t.phaseCriticalBadge
      };
    }
  }, [year, lang]);

  return (
    <div className="flex flex-col h-full space-y-3">
      
      {/* Top Map Metric Selector Toolbar (Apple Segmented Style) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white/[0.03] backdrop-blur-xl p-2.5 rounded-2xl border border-white/[0.08]">
        <div className="flex items-center gap-2 px-1">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-medium text-white/70">{t.layerSelectorLabel}</span>
        </div>
        <div className="apple-segmented-track flex flex-wrap items-center gap-0.5">
          {MAP_METRIC_OPTIONS.map(metric => (
            <button
              key={metric.id}
              onClick={() => setMapMetric(metric.id)}
              className={`apple-segmented-item px-2.5 py-1 text-[11px] font-medium transition-all ${
                mapMetric === metric.id
                  ? 'apple-segmented-item-active'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {t[metric.labelKey]}
            </button>
          ))}
        </div>
      </div>

      {/* Map Viewport Container */}
      <div className="relative flex-1 min-h-[420px] rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl">
        <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />

        {basemapState === 'unavailable' && (
          <div
            role="status"
            aria-live="polite"
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[450] max-w-[92%] flex items-start gap-2 bg-black/70 backdrop-blur-2xl px-3 py-2 rounded-xl border border-white/[0.14] shadow-xl"
          >
            <CloudOff className="w-3.5 h-3.5 shrink-0 text-amber-300 mt-0.5" />
            <span className="text-[11px] leading-snug text-white/80">
              {t.basemapOffline}
            </span>
          </div>
        )}

        {/* Basemap credit. Leaflet's attribution control is switched off for the dark UI,
            so the Esri tile source has to be credited here instead. Lifted above the
            bottom-right zoom stack, which it would otherwise sit under, and dropped when
            no Esri tile is on screen. */}
        {basemapState !== 'unavailable' && (
          <div className="absolute bottom-[78px] right-2 z-[400] px-1.5 py-0.5 rounded-md bg-black/45 text-[9px] leading-none text-white/45 pointer-events-none">
            © Esri — Source: Esri, Maxar, Earthstar Geographics
          </div>
        )}

        {/* Dynamic On-Map Year HUD Banner */}
        <div className="absolute top-3 left-3 right-3 z-[400] bg-black/65 backdrop-blur-2xl px-4 py-2 rounded-2xl border border-white/[0.12] shadow-2xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <Flame className={`w-4 h-4 shrink-0 ${timelinePhase.color}`} />
            <span className="text-xs font-semibold text-white/95 truncate">
              {lang === 'ar' ? timelinePhase.title_ar : timelinePhase.title_en}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-semibold tabular-nums ${timelinePhase.color}`}>
              {timelinePhase.anomaly}
            </span>
            <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${timelinePhase.bgColor}`}>
              {timelinePhase.badge}
            </span>
          </div>
        </div>

        {/* Dynamic Live Heatmap Legend */}
        <div className="absolute bottom-4 left-4 z-[400] bg-black/75 backdrop-blur-2xl p-3.5 rounded-2xl border border-white/[0.12] shadow-2xl text-xs space-y-1.5">
          <div className="font-semibold text-[11px] text-white/90 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>{t.heatScaleTitle} ({year})</span>
          </div>
          {HEAT_TIERS.map(tier => (
            <div key={tier.labelKey} className="flex items-center gap-2 text-[10px]">
              <span className={`w-2.5 h-2.5 rounded-full ${tier.dot}`}></span>
              <span className="text-white/80 font-medium">
                {t[tier.labelKey]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 30-Year Time-Lapse Slider Control Box (Apple Player Aesthetics) */}
      <div className="apple-glass p-4 rounded-2xl border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="apple-chip px-3.5 py-1.5 rounded-full bg-white text-black font-semibold flex items-center gap-1.5 shadow-sm hover:bg-neutral-200 transition-all text-xs"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black" />}
              <span>{isPlaying ? t.btnPauseTime : t.btnPlayTime}</span>
            </button>

            <button
              onClick={() => setYear(prev => Math.max(1995, prev - 1))}
              className="apple-chip p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white/80 border border-white/10"
              title={t.prevYearTitle}
            >
              <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>

            <button
              onClick={() => setYear(prev => Math.min(2025, prev + 1))}
              className="apple-chip p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white/80 border border-white/10"
              title={t.nextYearTitle}
            >
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-white/45 font-medium text-xs">{t.timelapseYearLabel}</span>
            <span className="text-xl font-semibold text-white tabular-nums bg-white/[0.06] px-3 py-0.5 rounded-xl border border-white/10">
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
          <div className="flex justify-between text-[11px] font-medium text-white/45 px-1 tabular-nums">
            <span className="text-emerald-400/90 font-medium">
              {t.yearBaselineCaption}
            </span>
            <span className="text-amber-400/90 font-medium">
              {t.yearMidCaption}
            </span>
            <span className="text-rose-400/90 font-medium">
              {t.yearPeakCaption}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
