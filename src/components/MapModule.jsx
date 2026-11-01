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
  // Driven by what is actually on screen, not by a one-shot verdict: the credit must
  // stay up while any Esri tile is displayed, and the offline notice must stay down
  // while the basemap is still rendering. Both flip at most twice per transition.
  const [creditedTilesVisible, setCreditedTilesVisible] = useState(false);
  const [basemapNoticeVisible, setBasemapNoticeVisible] = useState(false);
  const creditedRef = useRef(false);
  const erroredTilesRef = useRef(0);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Safety: remove previous leaflet id if container was reused
    if (mapContainerRef.current._leaflet_id) {
      delete mapContainerRef.current._leaflet_id;
    }

    const map = L.map(mapContainerRef.current, {
      center: [25.6, 30.8],
      zoom: 5.5,
      zoomSnap: 0.25,
      minZoom: 4.5,
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
    // overlay. Leaflet never retries a failed tile, so the only thing to get right here is
    // reporting. Read the live DOM rather than trusting the first event: a single erroring
    // tile among many that load fine is a partial failure, not an offline basemap, and the
    // attribution has to stay visible for the tiles that did render.
    const syncBasemapUi = () => {
      const el = mapContainerRef.current;
      if (!el) return;
      const visible = el.querySelectorAll('.leaflet-tile-loaded').length > 0;
      if (visible !== creditedRef.current) {
        creditedRef.current = visible;
        setCreditedTilesVisible(visible);
      }
      const notice = !visible && erroredTilesRef.current > 0;
      setBasemapNoticeVisible(prev => (prev === notice ? prev : notice));
    };

    basemap.on('tileload', syncBasemapUi);
    basemap.on('tileunload', syncBasemapUi);
    basemap.on('tileerror', () => {
      erroredTilesRef.current += 1;
      syncBasemapUi();
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
      creditedRef.current = false;
      erroredTilesRef.current = 0;
      setCreditedTilesVisible(false);
      setBasemapNoticeVisible(false);
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
    el.classList.toggle('basemap-unavailable', !creditedTilesVisible);
  }, [creditedTilesVisible]);

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
          <div class="w-10 h-10 rounded-full flex flex-col items-center justify-center text-xs font-semibold text-white transition-all duration-300 ${
            isSelected ? 'scale-125 ring-2 ring-white shadow-[0_0_30px_rgba(255,255,255,0.45)]' : 'group-hover:scale-110'
          }" style="background-color: ${color}; box-shadow: 0 6px 20px ${color}80, inset 0 1px 1px rgba(255,255,255,0.4);">
            <span class="leading-none tabular-nums font-semibold">${displayVal}</span>
          </div>
          <div class="absolute -bottom-6 px-2.5 py-0.5 rounded-full text-2xs font-medium whitespace-nowrap border transition-all ${
            isSelected
              ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black dark:border-white scale-105 font-semibold shadow-md dark:shadow-[0_4px_16px_rgba(255,255,255,0.3)]'
              : 'bg-white/95 text-slate-800 border-slate-200/90 shadow-md dark:bg-[#07090F]/90 dark:backdrop-blur-md dark:text-white/90 dark:border-white/10 dark:shadow-lg'
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
        title_en: '1995-2000: Baseline Climatology, Moderate Thermal Load',
        title_ar: '1995-2000: خط الأساس المناخي: حمل حراري معتدل ومساحات زراعية مستقرة',
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
    <div className="flex flex-col h-full space-y-5">
      
      {/* Top Map Metric Selector Toolbar (Apple Segmented Style) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-100/80 dark:bg-white/[0.03] backdrop-blur-xl p-2.5 rounded-[14px] border border-slate-200/90 dark:border-white/[0.08]">
        <div className="flex items-center gap-2 px-1">
          <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span className="text-xs font-medium text-slate-700 dark:text-white/70">{t.layerSelectorLabel}</span>
        </div>
        <div className="apple-segmented-track flex flex-wrap items-center gap-0.5">
          {MAP_METRIC_OPTIONS.map(metric => (
            <button
              key={metric.id}
              onClick={() => setMapMetric(metric.id)}
              className={`apple-segmented-item px-2.5 py-1 text-micro font-medium transition-all ${
                mapMetric === metric.id
                  ? 'apple-segmented-item-active'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.04]'
              }`}
            >
              {t[metric.labelKey]}
            </button>
          ))}
        </div>
      </div>

      {/* Active Layer Empirical Sensor Attribution Pill */}
      <div className="flex items-center justify-between text-micro bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] rounded-xl px-3 py-1.5 font-medium">
        <span className="text-slate-500 dark:text-white/40">{t.sourcePrefix || 'المصدر:'}</span>
        <span className="text-sky-700 dark:text-sky-300/90 text-right rtl:text-left truncate font-semibold">
          {mapMetric === 'var'
            ? (t[`sensorSource_${selectedVar}`] || 'NASA Earth Observation')
            : (t[`sensorSource_${mapMetric}`] || 'NASA POWER / CAPMAS 2024')}
        </span>
      </div>

      {/* Map Viewport Container */}
      <div className="relative flex-1 min-h-[460px] rounded-[14px] overflow-hidden border border-slate-200/90 dark:border-white/[0.08] shadow-md dark:shadow-2xl">
        <div ref={mapContainerRef} className="w-full h-full min-h-[460px]" />

        {basemapNoticeVisible && (
          <div
            role="status"
            aria-live="polite"
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[450] max-w-[92%] flex items-start gap-2 bg-white/90 dark:bg-black/70 backdrop-blur-2xl px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.14] shadow-xl"
          >
            <CloudOff className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-300 mt-0.5" />
            <span className="text-micro leading-snug text-slate-800 dark:text-white/80">
              {t.basemapOffline}
            </span>
          </div>
        )}

        {/* Basemap credit */}
        {creditedTilesVisible && (
          <div className="absolute bottom-[78px] right-2 z-[400] px-1.5 py-0.5 rounded-md bg-white/70 text-slate-700 border border-slate-200/60 dark:border-transparent dark:bg-black/45 text-2xs leading-none dark:text-white/45 pointer-events-none">
            © Esri, Source: Esri, Maxar, Earthstar Geographics
          </div>
        )}

        {/* Dynamic On-Map Year HUD Banner */}
        <div className="absolute top-3 left-3 right-3 z-[400] bg-white/90 dark:bg-black/65 backdrop-blur-2xl px-4 py-2 rounded-2xl border border-slate-200/80 dark:border-white/[0.12] shadow-lg dark:shadow-2xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <Flame className={`w-4 h-4 shrink-0 ${timelinePhase.color}`} />
            <span className="text-xs font-semibold text-slate-900 dark:text-white/95 truncate">
              {lang === 'ar' ? timelinePhase.title_ar : timelinePhase.title_en}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-semibold tabular-nums ${timelinePhase.color}`}>
              {timelinePhase.anomaly}
            </span>
            <span className={`text-2xs font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${timelinePhase.bgColor}`}>
              {timelinePhase.badge}
            </span>
          </div>
        </div>

        {/* Dynamic Live Heatmap Legend */}
        <div className="absolute bottom-4 left-4 z-[400] bg-white/90 dark:bg-black/75 backdrop-blur-2xl p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.12] shadow-lg dark:shadow-2xl text-xs space-y-1.5">
          <div className="font-semibold text-micro text-slate-900 dark:text-white/90 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>{t.heatScaleTitle} ({year})</span>
          </div>
          {HEAT_TIERS.map(tier => (
            <div key={tier.labelKey} className="flex items-center gap-2 text-2xs">
              <span className={`w-2.5 h-2.5 rounded-full ${tier.dot}`}></span>
              <span className="text-slate-700 dark:text-white/80 font-medium">
                {t[tier.labelKey]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 30-Year Time-Lapse Slider Control Box (Apple Player Aesthetics) */}
      <div className="p-4 rounded-[14px] bg-slate-100/70 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200/90 dark:border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="apple-chip px-3.5 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold flex items-center gap-1.5 shadow-sm transition-all text-xs"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? t.btnPauseTime : t.btnPlayTime}</span>
            </button>

            <button
              onClick={() => setYear(prev => Math.max(1995, prev - 1))}
              className="apple-chip p-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] dark:text-white/80 dark:border-white/10"
              title={t.prevYearTitle}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setYear(prev => Math.min(2025, prev + 1))}
              className="apple-chip p-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] dark:text-white/80 dark:border-white/10"
              title={t.nextYearTitle}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-slate-500 dark:text-white/45 font-medium text-xs">{t.timelapseYearLabel}</span>
            <span dir="ltr" className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums bg-white dark:bg-white/[0.06] px-3 py-0.5 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-sm">
              {year}
            </span>
          </div>
        </div>

        {/* Interactive Slider Bar */}
        <div className="space-y-1.5" dir="ltr">
          <input
            type="range"
            min="1995"
            max="2025"
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value));
              if (isPlaying) setIsPlaying(false);
            }}
            className="slider-teal w-full"
          />
          <div className="flex justify-between text-micro font-medium text-slate-500 dark:text-white/45 px-1 tabular-nums">
            <span className="text-emerald-600 dark:text-emerald-400/90 font-medium">
              {t.yearBaselineCaption}
            </span>
            <span className="text-amber-600 dark:text-amber-400/90 font-medium">
              {t.yearMidCaption}
            </span>
            <span className="text-rose-600 dark:text-rose-400/90 font-medium">
              {t.yearPeakCaption}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
