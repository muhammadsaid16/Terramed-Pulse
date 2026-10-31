import React, { useState, useMemo } from 'react';
import { Stethoscope, HeartPulse, Wind, AlertCircle, Baby, Users, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { matchSpecialty } from '../lib/trendEngine';
import { SPECIALTY_FULL_LABELS } from '../lib/specialties';
import { SpotlightCard, NumberTicker, BorderBeam } from './ui';

// Icons are presentation, so they stay here; the ids and both label registers come from
// the module that owns the submission vocabulary.
const SPECIALTY_ICONS = {
  nephrology: HeartPulse,
  pulmonology: Wind,
  cardiology: HeartPulse,
  emergency: AlertCircle,
  pediatrics: Baby,
  geriatrics: Users,
  dermatology_ophthalmology: Sparkles,
  occupational_preventive: ShieldAlert
};

export default function DoctorMatcher({
  data,
  lang,
  t,
  onSelectGov,
  onVoiceNeeds
}) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('nephrology');

  const specialties = SPECIALTY_FULL_LABELS.map(spec => ({ ...spec, icon: SPECIALTY_ICONS[spec.id] }));

  // Dynamic ranking based on MCDA weights
  const rankings = useMemo(() => {
    if (!data?.governorates) return [];
    return matchSpecialty(selectedSpecialty, data.governorates);
  }, [data, selectedSpecialty]);

  const topGov = rankings[0];
  const currentSpecialtyObj = specialties.find(s => s.id === selectedSpecialty);

  return (
    <section id="section-doctor" className="bento-card p-5 sm:p-8 mb-8 space-y-6">
      
      {/* Module Header */}
      <div className="border-b border-slate-200/80 dark:border-white/[0.08] pb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 flex items-center justify-center shadow-sm">
              <Stethoscope className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
              {t.module2Title}
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-white/50 font-normal mt-1">
            {t.module2Subtitle}
          </p>
        </div>
        <span className="satellite-chip text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-sky-950/40 dark:border-sky-800/40">
          {t.impactChip}
        </span>
      </div>

      {/* Specialty Selector Pills */}
      <div className="space-y-2.5">
        <label className="text-xs font-medium text-slate-700 dark:text-white/60 block">
          {t.chooseSpecialtyLabel}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {specialties.map(spec => {
            const Icon = spec.icon;
            const isSelected = selectedSpecialty === spec.id;
            return (
              <button
                key={spec.id}
                onClick={() => setSelectedSpecialty(spec.id)}
                className={`apple-chip p-3 rounded-2xl border text-left rtl:text-right flex items-center gap-2.5 transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black dark:border-white shadow-md font-semibold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-white/[0.03] dark:text-white/70 dark:border-white/[0.08] dark:hover:bg-white/[0.07] dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white dark:text-black' : 'text-slate-500 dark:text-white/50'}`} />
                <span className="text-xs font-medium leading-tight">
                  {lang === 'ar' ? spec.ar : spec.en}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Specialty Demand Panel & Ranked Governorates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Clinical Evidence & Mechanism (7 cols) */}
        <SpotlightCard
          borderBeam={{ duration: 14, colorFrom: '#38bdf8', colorTo: '#818cf8', borderWidth: 2 }}
          className="lg:col-span-7 apple-card p-6 space-y-5 relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>{lang === 'ar' ? currentSpecialtyObj?.ar : currentSpecialtyObj?.en}</span>
            </h3>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 dark:bg-white/[0.06] dark:text-sky-400 dark:border-white/10">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t.matchBadge}
            </span>
          </div>

          {/* Biomedical Mechanism */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-medium text-slate-500 dark:text-white/45 uppercase tracking-[0.05em]">
              {t.clinicalRationaleHeading}
            </h4>
            <p className="text-xs text-slate-700 dark:text-white/80 leading-relaxed font-normal">
              {lang === 'ar' ? topGov?.justification_ar : topGov?.justification_en}
            </p>
          </div>

          {/* NASA Satellite Drivers */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-medium text-slate-500 dark:text-white/45 uppercase tracking-[0.05em]">
              {t.nasaDriversHeading}
            </h4>
            <div className="flex flex-wrap gap-2 text-[10px] font-medium">
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20">
                {t.driverHeat}
              </span>
              <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20">
                {t.driverAod}
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20">
                {t.driverGlas}
              </span>
            </div>
          </div>

          {/* Retention Callout & Action */}
          <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200/80 dark:bg-white/[0.03] dark:border-white/[0.08] space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
              {t.whyEgyptNeedsHeading}
            </h4>
            <p className="text-xs text-slate-700 dark:text-white/70 leading-relaxed font-normal">
              {lang === 'ar'
                ? `محافظة ${topGov?.name_ar} تعاني من مؤشر عجز منشآت يبلغ ${topGov?.keyDrivers?.fsi}/100 وتصاعد مستمر في موجات الإجهاد الحراري. تواجدك هنا ينقذ مئات الحالات الحرجة شهرياً.`
                : `${topGov?.name_en} suffers from a severe facility gap (${topGov?.keyDrivers?.fsi}/100) and accelerating heatwave frequency. Practicing your specialty here creates the maximum clinical life-saving dividend.`}
            </p>

            <button
              onClick={() => onVoiceNeeds && onVoiceNeeds(topGov?.id, selectedSpecialty)}
              className="w-full apple-btn-primary py-2.5 px-4 text-xs flex items-center justify-center gap-2"
            >
              <HeartPulse className="w-4 h-4 text-white dark:text-black" />
              <span>
                {lang === 'ar'
                  ? `الخطوة التالية: معاينة بيانات وأدلة الاستبقاء في ${topGov?.name_ar} ⬅`
                  : `Next Step: Explore Retention Evidence for ${topGov?.name_en} ➔`}
              </span>
            </button>
          </div>
        </SpotlightCard>

        {/* Right: Ranked Recommendations (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <span className="text-xs font-medium text-slate-600 dark:text-white/50 px-1">
            {t.topGovsHeading}
          </span>

          <div className="space-y-2.5">
            {rankings.slice(0, 4).map((r, i) => (
              <SpotlightCard
                key={r.id}
                onClick={() => onSelectGov(r.id)}
                className={`p-3.5 flex items-center justify-between cursor-pointer group shadow-sm dark:shadow-md transition-all ${
                  i === 0
                    ? 'ring-1 ring-sky-500/40 bg-sky-500/[0.03]'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                    i === 0
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/[0.06] dark:text-white/60 dark:border-white/10'
                  }`}>
                    {i + 1}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {lang === 'ar' ? r.name_ar : r.name_en}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-white/45 block tabular-nums font-normal mt-0.5">
                      {t.hniScoreLabel}: <NumberTicker value={r.hni} decimalPlaces={1} />
                    </span>
                  </div>
                </div>

                <div className="text-right rtl:text-left">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white tabular-nums bg-slate-100 dark:bg-white/[0.06] px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">
                    <NumberTicker value={r.match_pct} suffix={`% ${t.matchWord}`} />
                  </span>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>

      </div>

      {/* Provenance Attribution Bar */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.06] flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-white/45 font-medium">
        <span className="text-sky-600 dark:text-sky-400 font-semibold shrink-0">{t.sourcePrefix || 'المصدر:'}</span>
        <span>{t.doctorMatcherSource}</span>
      </div>

    </section>
  );
}
