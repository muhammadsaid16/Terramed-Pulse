// Pure Chart.js data builders and option factories for the executive dashboards.
// Option helpers return a fresh object per call so no chart instance can mutate another's config.
// Each builder keeps label/value pairs in one table so dataset order can never drift out of sync.

const TURNOVER_REASONS = [
  { id: 'salary', en: 'Salary & Living', ar: 'الراتب والمعيشة' },
  { id: 'burnout', en: 'Burnout & Environment', ar: 'بيئة العمل والإرهاق' },
  { id: 'equipment', en: 'Medical Equipment', ar: 'نقص الأجهزة' },
  { id: 'workload', en: 'Workload & Pop', ar: 'التكدس السكاني' },
  { id: 'training', en: 'Training Gap', ar: 'غياب التدريب' }
];

export function buildTurnoverChartData(reports, lang, t) {
  // No reports, no drivers. Returning null makes the caller say "no field data"
  // rather than plot an empty ring that reads like a measured result.
  if (!reports.length) return null;

  const counts = Object.fromEntries(TURNOVER_REASONS.map(r => [r.id, 0]));

  reports.forEach(r => {
    const reason = (r.primary_reason || 'salary').toLowerCase();
    if (counts[reason] !== undefined) counts[reason]++;
    else counts.salary++;
  });

  return {
    labels: TURNOVER_REASONS.map(r => lang === 'ar' ? r.ar : r.en),
    datasets: [
      {
        data: TURNOVER_REASONS.map(r => counts[r.id]),
        backgroundColor: [
          '#FF453A', // Apple Red
          '#FF9F0A', // Apple Orange
          '#0A84FF', // Apple Blue
          '#BF5AF2', // Apple Purple
          '#30D158'  // Apple Mint
        ],
        borderColor: '#07090F',
        borderWidth: 2
      }
    ]
  };
}

// Chart-axis specialty names are a third label register (axis-width abbreviations),
// deliberately shorter than SPECIALTY_SHORT_LABELS used by the form and the live feed.
const MIGRATION_SERIES = [
  { id: 'nephrology', en: 'Nephrology', ar: 'كلى' },
  { id: 'pulmonology', en: 'Pulmonology', ar: 'صدرية' },
  { id: 'cardiology', en: 'Cardiology', ar: 'قلب' },
  { id: 'emergency', en: 'Emergency', ar: 'طوارئ' },
  { id: 'pediatrics', en: 'Pediatrics', ar: 'أطفال' }
];

const CLINICAL_DEMAND_PCT = [85, 78, 72, 90, 68];

export function buildMigrationChartData(reports, lang, t) {
  // A specialty with no reports has no migration rate. The old code returned
  // `40 + i * 8` for those bars, which is a fabricated ranking, so a specialty is
  // plotted only when it has at least one report behind it.
  const series = MIGRATION_SERIES.map((spec, i) => {
    const specReports = reports.filter(r => (r.specialty || '').toLowerCase().includes(spec.id));
    if (!specReports.length) return null;
    const migrating = specReports.filter(r => (r.considering_migration || '').toLowerCase() === 'yes').length;
    return { spec, risk: Math.round((migrating / specReports.length) * 100), demand: CLINICAL_DEMAND_PCT[i] };
  }).filter(Boolean);

  if (!series.length) return null;

  return {
    labels: series.map(x => lang === 'ar' ? x.spec.ar : x.spec.en),
    datasets: [
      {
        label: t.chartMigrationRisk,
        data: series.map(x => x.risk),
        backgroundColor: 'rgba(255, 69, 58, 0.85)',
        borderRadius: 6
      },
      {
        label: t.chartClimateDemand,
        data: series.map(x => x.demand),
        backgroundColor: 'rgba(10, 132, 255, 0.85)',
        borderRadius: 6
      }
    ]
  };
}

export function buildPriorityChartData(allGovs, lang, t) {
  const govKeys = Object.keys(allGovs || {});
  const labels = govKeys.map(k => lang === 'ar' ? allGovs[k].name_ar : allGovs[k].name_en);
  const hniValues = govKeys.map(k => Math.round(allGovs[k].baseline_indices?.hni || 50));
  const epiValues = govKeys.map(k => Math.round(allGovs[k].baseline_indices?.epi || 50));

  return {
    labels,
    datasets: [
      {
        label: t.chartOverallHni,
        data: hniValues,
        backgroundColor: 'rgba(10, 132, 255, 0.85)',
        borderRadius: 6
      },
      {
        label: t.chartClimateEpi,
        data: epiValues,
        backgroundColor: 'rgba(255, 159, 10, 0.85)',
        borderRadius: 6
      }
    ]
  };
}

const legendLabels = () => ({ boxWidth: 8, font: { size: 9 }, color: 'rgba(255,255,255,0.6)' });

export function doughnutChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: legendLabels() }
    }
  };
}

export function barChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: legendLabels() }
    },
    scales: {
      x: { ticks: { font: { size: 9 }, color: 'rgba(255,255,255,0.45)' }, grid: { display: false } },
      y: { max: 100, ticks: { font: { size: 9 }, color: 'rgba(255,255,255,0.45)' }, grid: { color: 'rgba(255,255,255,0.04)' } }
    }
  };
}
