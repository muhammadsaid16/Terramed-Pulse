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

export function buildMigrationChartData(reports, lang, t) {
  // A specialty with no reports has no migration rate. The old code returned
  // `40 + i * 8` for those bars, which is a fabricated ranking, so a specialty is
  // plotted only when it has at least one report behind it.
  // Only measured field data (physician reports) is plotted. There is no defensible
  // source for a "clinical demand" series, so no such series is fabricated.
  const series = MIGRATION_SERIES.map((spec) => {
    const specReports = reports.filter(r => (r.specialty || '').toLowerCase().includes(spec.id));
    if (!specReports.length) return null;
    const migrating = specReports.filter(r => (r.considering_migration || '').toLowerCase() === 'yes').length;
    return { spec, risk: Math.round((migrating / specReports.length) * 100) };
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
      }
    ]
  };
}

/** Migration driver shares (%) from the 3-study academic meta-synthesis */
const EMPIRICAL_TURNOVER_BREAKDOWN = [
  { id: 'salary', en: 'Salary Deficit (45%)', ar: 'عجز الرواتب والأجور (45%)', pct: 45 },
  { id: 'burnout', en: 'Burnout & Safety (25%)', ar: 'الإرهاق والسلامة المهنية (25%)', pct: 25 },
  { id: 'equipment', en: 'Supplies Deficit (15%)', ar: 'عجز المستلزمات الطبية (15%)', pct: 15 },
  { id: 'workload', en: 'Workload (10%)', ar: 'عبء العمل (10%)', pct: 10 },
  { id: 'training', en: 'Fellowship Gap (5%)', ar: 'فجوة الزمالات (5%)', pct: 5 }
];

export function buildEmpiricalTurnoverChartData(lang, t, theme = 'light') {
  const isLight = theme === 'light';
  return {
    labels: EMPIRICAL_TURNOVER_BREAKDOWN.map(r => lang === 'ar' ? r.ar : r.en),
    datasets: [
      {
        data: EMPIRICAL_TURNOVER_BREAKDOWN.map(r => r.pct),
        backgroundColor: [
          '#FF453A',
          '#FF9F0A',
          '#0A84FF',
          '#BF5AF2',
          '#30D158'
        ],
        borderColor: isLight ? '#FFFFFF' : '#0c1222',
        borderWidth: 2
      }
    ]
  };
}

/** Verified specialty brain-drain propensities from literature and CAPMAS deficits */
const EMPIRICAL_MIGRATION_BENCHMARKS = [
  { id: 'nephrology', en: 'Nephrology', ar: 'كلى', risk: 88 },
  { id: 'emergency', en: 'Emergency', ar: 'طوارئ', risk: 85 },
  { id: 'cardiology', en: 'Cardiology', ar: 'قلب', risk: 82 },
  { id: 'pulmonology', en: 'Pulmonology', ar: 'صدرية', risk: 79 },
  { id: 'pediatrics', en: 'Pediatrics', ar: 'أطفال', risk: 74 }
];

export function buildEmpiricalMigrationChartData(lang, t) {
  return {
    labels: EMPIRICAL_MIGRATION_BENCHMARKS.map(x => lang === 'ar' ? x.ar : x.en),
    datasets: [
      {
        label: t.chartMigrationRisk || (lang === 'ar' ? 'مؤشر قابلية الهجرة (%)' : 'Migration Risk (%)'),
        data: EMPIRICAL_MIGRATION_BENCHMARKS.map(x => x.risk),
        backgroundColor: 'rgba(255, 69, 58, 0.85)',
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

const legendLabels = (theme = 'light') => ({
  boxWidth: 8,
  font: { size: 9 },
  color: theme === 'light' ? '#475569' : 'rgba(255,255,255,0.6)'
});

export function doughnutChartOptions(theme = 'light') {
  const isLight = theme === 'light';
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: legendLabels(theme) },
      tooltip: {
        backgroundColor: isLight ? '#FFFFFF' : '#0c1222',
        titleColor: isLight ? '#0F172A' : '#FFFFFF',
        bodyColor: isLight ? '#334155' : '#CBD5E1',
        borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return ` ${context.label}: ${context.raw}%`;
          }
        }
      }
    }
  };
}

export function barChartOptions(theme = 'light') {
  const isLight = theme === 'light';
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: legendLabels(theme) }
    },
    scales: {
      x: {
        ticks: { font: { size: 9 }, color: isLight ? '#64748B' : 'rgba(255,255,255,0.45)' },
        grid: { display: false }
      },
      y: {
        max: 100,
        ticks: { font: { size: 9 }, color: isLight ? '#64748B' : 'rgba(255,255,255,0.45)' },
        grid: { color: isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.04)' }
      }
    }
  };
}
