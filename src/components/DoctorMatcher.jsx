import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { HeartPulse, Wind, AlertCircle, Baby, Users, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { matchSpecialty } from '../lib/trendEngine';
import { SPECIALTY_FULL_LABELS } from '../lib/specialties';
import gsap from 'gsap';
import { SpotlightCard, NumberTicker, Button, Badge } from './ui';
import { prefersReducedMotion } from '../lib/motionTokens';

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
  const isAr = lang === 'ar';
  const panelRef = useRef(null);
  const cardListRef = useRef(null);

  useLayoutEffect(() => {
    if (!panelRef.current || prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        panelRef.current,
        { autoAlpha: 0, y: 6 },
        { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power3.out', overwrite: true }
      );
      const cards = cardListRef.current ? Array.from(cardListRef.current.children) : [];
      if (cards.length) {
        gsap.fromTo(
          cards,
          { autoAlpha: 0, x: isAr ? -8 : 8 },
          { autoAlpha: 1, x: 0, duration: 0.24, ease: 'power3.out', stagger: 0.035, delay: 0.04, overwrite: true }
        );
      }
    }, panelRef);
    return () => ctx.revert();
  }, [selectedSpecialty, isAr]);

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
      <div className="border-b border-slate-200/80 dark:border-white/[0.08] pb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className="font-mono text-2xs tracking-[0.18em] text-slate-400 dark:text-white/35 pt-1.5">02</span>
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.module2Title}
            </h2>
            <p className="text-micro text-slate-600 dark:text-white/50 font-normal mt-1">
              {t.module2Subtitle}
            </p>
          </div>
        </div>
        <span className="font-mono text-2xs tracking-[0.08em] text-emerald-600/80 dark:text-emerald-400/60 pt-1.5" dir="ltr">
          {t.impactChip}
        </span>
      </div>

      {/* Specialty Selector Buttons */}
      <div className="space-y-2.5">
        <label className="text-xs font-medium text-slate-700 dark:text-white/60 block">
          {t.chooseSpecialtyLabel}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {specialties.map(spec => {
            const Icon = spec.icon;
            const isSelected = selectedSpecialty === spec.id;
            return (
              <Button
                key={spec.id}
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => setSelectedSpecialty(spec.id)}
                className={`p-3 h-auto justify-start text-left rtl:text-right rounded-2xl gap-2.5 transition-all duration-150 ${
                  isSelected
                    ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-md font-semibold'
                    : 'text-slate-700 dark:text-white/80'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white dark:text-black' : 'text-slate-500 dark:text-white/50'}`} />
                <span className="text-xs font-medium leading-tight truncate">
                  {lang === 'ar' ? spec.ar : spec.en}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Specialty Demand Panel & Ranked Governorates */}
      <div ref={panelRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Clinical Evidence & Mechanism (7 cols) */}
        <SpotlightCard
          className="lg:col-span-7 apple-card p-6 space-y-4 relative overflow-hidden border border-sky-400/30 dark:border-sky-400/40 shadow-[0_0_20px_-3px_rgba(14,165,233,0.15)] self-start"
        >
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3 mb-1">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>{lang === 'ar' ? currentSpecialtyObj?.ar : currentSpecialtyObj?.en}</span>
            </h3>
            <Badge variant="success" className="gap-1.5 py-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t.matchBadge}
            </Badge>
          </div>

          {/* Biomedical Mechanism */}
          <div className="space-y-2">
            <h4 className="text-micro font-medium text-slate-500 dark:text-white/45 uppercase tracking-[0.05em]">
              {t.clinicalRationaleHeading}
            </h4>
            <p className="text-xs text-slate-700 dark:text-white/80 leading-relaxed font-normal">
              {lang === 'ar' ? topGov?.justification_ar : topGov?.justification_en}
            </p>
          </div>

          {/* NASA Satellite Drivers */}
          <div className="space-y-2">
            <h4 className="text-micro font-medium text-slate-500 dark:text-white/45 uppercase tracking-[0.05em]">
              {t.nasaDriversHeading}
            </h4>
            <div className="flex flex-wrap gap-2 text-2xs font-medium">
              <Badge variant="destructive" className="py-0.5">
                {t.driverHeat}
              </Badge>
              <Badge variant="default" className="py-0.5">
                {t.driverAod}
              </Badge>
              <Badge variant="purple" className="py-0.5">
                {t.driverGlas}
              </Badge>
            </div>
          </div>

          {/* Retention Callout & Action */}
          <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200/80 dark:bg-white/[0.03] dark:border-white/[0.08] space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
              {t.whyEgyptNeedsHeading}
            </h4>
            <p className="text-xs text-slate-700 dark:text-white/70 leading-relaxed font-normal">
              {lang === 'ar'
                ? `محافظة ${topGov?.name_ar} تعاني من مؤشر عجز منشآت يبلغ ${topGov?.keyDrivers?.fsi}/100 وتصاعد مستمر في موجات الإجهاد الحراري. تواجدك هنا يرفع نسبة خفض العبء المرضي المرتبط بالمناخ.`
                : `${topGov?.name_en} suffers from a severe facility gap (${topGov?.keyDrivers?.fsi}/100) and accelerating heatwave frequency. Practicing your specialty here maximizes the relative reduction in climate-sensitive disease burden.`}
            </p>

            <Button
              variant="default"
              size="lg"
              onClick={() => onVoiceNeeds && onVoiceNeeds(topGov?.id, selectedSpecialty)}
              className="w-full py-2.5 h-auto text-xs flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              <HeartPulse className="w-4 h-4 text-rose-400 dark:text-rose-600" />
              <span>
                {lang === 'ar'
                  ? `الخطوة التالية: معاينة بيانات وأدلة الاستبقاء في ${topGov?.name_ar} ⬅`
                  : `Next Step: Explore Retention Evidence for ${topGov?.name_en} ➔`}
              </span>
            </Button>
          </div>
        </SpotlightCard>

        {/* Right: Ranked Recommendations (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <span className="text-xs font-medium text-slate-600 dark:text-white/50 px-1">
            {t.topGovsHeading}
          </span>

          <div ref={cardListRef} className="space-y-2.5">
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
                    <span className="text-2xs text-slate-500 dark:text-white/45 block tabular-nums font-normal mt-0.5">
                      {t.relativePriorityLabel}: <NumberTicker value={r.priorityIndex} /> / 100
                    </span>
                    <span className="text-2xs text-slate-500 dark:text-white/45 block tabular-nums font-normal mt-0.5">
                      {t.envBurdenShareLabel}: <NumberTicker value={r.envBurdenPct} suffix="%" />
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
      <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.06] flex items-center gap-1.5 text-2xs text-slate-500 dark:text-white/45 font-medium">
        <span className="text-sky-600 dark:text-sky-400 font-semibold shrink-0">{t.sourcePrefix || 'المصدر:'}</span>
        <span>{t.doctorMatcherSource}</span>
      </div>

    </section>
  );
}
