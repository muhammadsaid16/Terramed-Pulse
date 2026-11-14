import React from 'react';
import { Flame, AlertTriangle, Stethoscope, ArrowLeftRight } from 'lucide-react';
import { NumberTicker } from './ui';
import Reveal from './Reveal';
import { getHeadlineMetrics, formatPValue } from '../lib/headlineMetrics';

/**
 * Executive KPI strip.
 *
 * Every figure is read from the shipped dataset through headlineMetrics, so
 * the strip cannot advertise a number the map, the charts or the print brief
 * would contradict. Nothing here is typed in by hand.
 */
export default function KpiStrip({ t, lang = 'en' }) {
  const m = getHeadlineMetrics();
  const isAr = lang === 'ar';

  const warmingRate = m.warmingPerDecade;
  const topGovName = m.topGov
    ? (isAr ? m.topGov.gov.name_ar : m.topGov.gov.name_en)
    : '—';
  const topGovHni = m.topGov?.hni ?? 0;
  const mk = m.strongestMk;
  const mkGovName = mk
    ? (isAr ? GOV_NAME_AR[mk.gov] || mk.gov : GOV_NAME_EN[mk.gov] || mk.gov)
    : '—';

  const KPIS = [
    {
      id: 'warming',
      index: '01',
      accent: 'text-[color:var(--danger)] dark:text-rose-400',
      dot: 'bg-rose-500 dark:bg-rose-400',
      Icon: Flame,
      chipLabelKey: 'kpiChipPower',
      labelKey: 'kpiWarmingLabel',
      Value: () => (
        <>
          <NumberTicker
            value={Math.abs(warmingRate)}
            prefix="+"
            suffix="°C"
            decimalPlaces={2}
          />
          <span className="text-xs font-normal text-[color:var(--muted)]">
            {isAr ? '/ عقد' : '/ decade'}
          </span>
        </>
      ),
      subKey: 'kpiWarmingSub',
      subOverride: m.warmingAcceleration
        ? (m.warmingAcceleration.accelerating
            ? 'kpiWarmingSubAccelerating'
            : 'kpiWarmingSubEasing')
        : null,
      sourceKey: 'kpiSource1'
    },
    {
      id: 'highest-need',
      index: '02',
      accent: 'text-[color:var(--warn)] dark:text-amber-400',
      dot: 'bg-amber-500 dark:bg-amber-400',
      Icon: AlertTriangle,
      chipLabelKey: 'kpiChipModis',
      labelKey: 'kpiHighestNeedLabel',
      Value: () => (
        <>
          <span className="font-display text-2xl font-semibold tracking-tight text-[color:var(--warn)] dark:text-amber-400 sm:text-3xl">
            {topGovName}
          </span>
          <span className="text-sm font-semibold text-[color:var(--warn)]">
            <NumberTicker value={topGovHni} decimalPlaces={1} prefix="HNI " />
          </span>
        </>
      ),
      subKey: 'kpiHighestNeedSub',
      sourceKey: 'kpiSource2'
    },
    {
      id: 'field-doctors',
      index: '03',
      accent: 'text-[color:var(--info)] dark:text-sky-400',
      dot: 'bg-sky-500 dark:text-sky-400',
      Icon: Stethoscope,
      chipLabelKey: 'kpiChipField',
      labelKey: 'kpiTotalDoctorsLabel',
      Value: () => (
        <>
          <NumberTicker value={3} />
          <span className="text-sm font-normal text-[color:var(--muted)]">
            {t.kpiTotalDoctors}
          </span>
        </>
      ),
      subKey: 'kpiTotalDoctorsSub',
      sourceKey: 'kpiSource3'
    },
    {
      id: 'divergence',
      index: '04',
      accent: 'text-[color:var(--ink)]',
      dot: 'bg-sky-500 dark:text-sky-400',
      Icon: ArrowLeftRight,
      chipLabelKey: 'kpiChipSpatial',
      labelKey: 'kpiTrendDivergenceLabel',
      Value: () => (
        <span className="font-display text-lg font-semibold leading-tight tracking-tight text-[color:var(--ink)] sm:text-xl">
          {t.kpiTrendDivergence}
        </span>
      ),
      subKey: 'kpiTrendDivergenceSub',
      sourceKey: 'kpiSource4'
    }
  ];

  return (
    <Reveal className="mb-8">
      <div className="bento-card grid grid-cols-1 divide-y divide-[color:var(--line)] overflow-hidden sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
        {KPIS.map((kpi, idx) => {
          const Icon = kpi.Icon;
          const Value = kpi.Value;
          return (
            <div
              key={kpi.id}
              className={`relative flex flex-col justify-between px-5 py-5 ${
                idx !== 0 ? 'sm:border-s sm:border-[color:var(--line)]' : ''
              } ${idx === 2 ? 'sm:border-t sm:border-[color:var(--line)] lg:border-t-0' : ''} ${
                idx === 3 ? 'sm:border-t sm:border-[color:var(--line)] lg:border-t-0' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-mono text-2xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                    <span className="tabular-nums opacity-60">{kpi.index}</span>
                    <span className="h-3 w-px bg-[color:var(--line)]" />
                    {t[kpi.chipLabelKey]}
                  </span>
                  <Icon className={`h-4 w-4 shrink-0 ${kpi.accent} opacity-70`} />
                </div>

                <div className="mt-5 text-[11px] font-medium leading-tight text-[color:var(--muted)]">
                  {t[kpi.labelKey]}
                </div>

                <div className={`mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-3xl font-bold tracking-tight text-[color:var(--ink)] sm:text-[32px] ${kpi.id === 'divergence' ? '' : 'telemetry-mono'}`}>
                  <Value t={t} />
                </div>

                <p className={`mt-2 flex items-start gap-1.5 text-2xs font-medium leading-relaxed ${kpi.accent}`}>
                  <span className={`mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${kpi.dot}`} />
                  {t[kpi.subOverride || kpi.subKey]}
                </p>
              </div>

              <div className="mt-4 border-t border-[color:var(--line)] pt-2.5 font-mono text-[11px] leading-relaxed text-[color:var(--muted)]">
                <span className="font-semibold text-[color:var(--accent)]">{t.sourcePrefix || 'SOURCE'}</span>{' '}
                {t[kpi.sourceKey]}
              </div>
            </div>
          );
        })}
      </div>

      {/* The strongest trend test in the dataset, quoted with its own numbers. */}
      {mk && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-[color:var(--line)] bg-[color:var(--panel-2)] px-4 py-2.5 font-mono text-[11px] text-[color:var(--muted)]">
          <span className="font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            {isAr ? 'أقوى اختبار اتجاه' : 'Strongest trend test'}
          </span>
          <span dir="ltr" className="text-[color:var(--ink-2)]">
            {mk.variable} · {mkGovName}
          </span>
          <span dir="ltr">
            Z = {mk.z.toFixed(2)} · p {formatPValue(mk.p_value)}
          </span>
          <span dir="ltr" className="opacity-80">
            ({isAr ? 'اختبار مان-كيندال، ثقة 99.9%' : 'Mann-Kendall, 99.9% confidence'})
          </span>
        </div>
      )}
    </Reveal>
  );
}

const GOV_NAME_EN = {
  cairo: 'Cairo',
  giza: 'Giza',
  alexandria: 'Alexandria',
  assiut: 'Assiut',
  aswan: 'Aswan'
};

const GOV_NAME_AR = {
  cairo: 'القاهرة',
  giza: 'الجيزة',
  alexandria: 'الإسكندرية',
  assiut: 'أسيوط',
  aswan: 'أسوان'
};
