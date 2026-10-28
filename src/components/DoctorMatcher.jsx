import React, { useState, useMemo } from 'react';
import { Stethoscope, HeartPulse, Wind, AlertCircle, Baby, Users, ShieldAlert, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { matchSpecialty } from '../lib/trendEngine';

export default function DoctorMatcher({
  data,
  lang,
  t,
  onSelectGov,
  onVoiceNeeds
}) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('nephrology');

  const specialties = [
    { id: 'nephrology', label_en: 'Nephrology', label_ar: 'أمراض الكلى والغسيل الكلوي', icon: HeartPulse },
    { id: 'pulmonology', label_en: 'Pulmonology', label_ar: 'الأمراض الصدرية والجهاز التنفسي', icon: Wind },
    { id: 'cardiology', label_en: 'Cardiology', label_ar: 'أمراض القلب والأوعية الدموية', icon: HeartPulse },
    { id: 'emergency', label_en: 'Emergency & Critical Care', label_ar: 'طب الطوارئ والحالات الحرجة', icon: AlertCircle },
    { id: 'pediatrics', label_en: 'Pediatrics', label_ar: 'طب الأطفال وحديثي الولادة', icon: Baby },
    { id: 'geriatrics', label_en: 'Geriatrics', label_ar: 'طب وصحة المسنين', icon: Users },
    { id: 'dermatology_ophthalmology', label_en: 'Derm / Ophthalmology', label_ar: 'الجلدية والعيون', icon: Sparkles },
    { id: 'occupational_preventive', label_en: 'Occupational & Preventive', label_ar: 'الطب المهني والوقائي وطب الأسرة', icon: ShieldAlert }
  ];

  // Dynamic ranking based on MCDA weights
  const rankings = useMemo(() => {
    if (!data?.governorates) return [];
    return matchSpecialty(selectedSpecialty, data.governorates);
  }, [data, selectedSpecialty]);

  const topGov = rankings[0];
  const currentSpecialtyObj = specialties.find(s => s.id === selectedSpecialty);

  return (
    <section id="section-doctor" className="apple-glass p-6 sm:p-8 mb-8 space-y-6">
      
      {/* Module Header */}
      <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-sky-400" />
            </div>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              {t.module2Title}
            </h2>
          </div>
          <p className="text-xs text-white/50 font-normal mt-1">
            {t.module2Subtitle}
          </p>
        </div>
      </div>

      {/* Specialty Selector Pills */}
      <div className="space-y-2.5">
        <label className="text-xs font-medium text-white/60 block">
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
                    ? 'bg-white text-black border-white shadow-md font-semibold'
                    : 'bg-white/[0.03] text-white/70 border-white/[0.08] hover:bg-white/[0.07] hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-black' : 'text-white/50'}`} />
                <span className="text-xs truncate font-medium">
                  {lang === 'ar' ? spec.label_ar : spec.label_en}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Specialty Demand Panel & Ranked Governorates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Clinical Evidence & Mechanism (7 cols) */}
        <div className="lg:col-span-7 apple-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <span>{lang === 'ar' ? currentSpecialtyObj?.label_ar : currentSpecialtyObj?.label_en}</span>
            </h3>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-white/[0.06] text-sky-400 border border-white/10">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t.matchBadge}
            </span>
          </div>

          {/* Biomedical Mechanism */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-medium text-white/45 uppercase tracking-[0.05em]">
              {t.clinicalRationaleHeading}
            </h4>
            <p className="text-xs text-white/80 leading-relaxed font-normal">
              {lang === 'ar' ? topGov?.justification_ar : topGov?.justification_en}
            </p>
          </div>

          {/* NASA Satellite Drivers */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-medium text-white/45 uppercase tracking-[0.05em]">
              {t.nasaDriversHeading}
            </h4>
            <div className="flex flex-wrap gap-2 text-[10px] font-medium">
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                NASA POWER T2M_MAX &gt; 42°C
              </span>
              <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                MERRA-2 AOD / PM2.5 Spikes
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                GLDAS Aridification
              </span>
            </div>
          </div>

          {/* Retention Callout & Action */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
            <h4 className="text-xs font-semibold text-white">
              {t.whyEgyptNeedsHeading}
            </h4>
            <p className="text-xs text-white/70 leading-relaxed font-normal">
              {lang === 'ar'
                ? `محافظة ${topGov?.name_ar} تعاني من مؤشر عجز منشآت يبلغ ${topGov?.keyDrivers?.fsi}/100 وتصاعد مستمر في موجات الإجهاد الحراري. تواجدك هنا ينقذ مئات الحالات الحرجة شهرياً.`
                : `${topGov?.name_en} suffers from a severe facility gap (${topGov?.keyDrivers?.fsi}/100) and accelerating heatwave frequency. Practicing your specialty here creates the maximum clinical life-saving dividend.`}
            </p>

            <button
              onClick={() => onVoiceNeeds && onVoiceNeeds(topGov?.id, selectedSpecialty)}
              className="w-full apple-btn-primary py-2.5 px-4 text-xs flex items-center justify-center gap-2"
            >
              <HeartPulse className="w-4 h-4 text-black" />
              <span>
                {lang === 'ar'
                  ? `الخطوة التالية: سجّل صوتك واحتياجك الميداني في ${topGov?.name_ar} ⬅`
                  : `Next Step: Voice Your Needs in ${topGov?.name_en} ➔`}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Ranked Recommendations (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <span className="text-xs font-medium text-white/50 px-1">
            {t.topGovsHeading}
          </span>

          <div className="space-y-2.5">
            {rankings.slice(0, 4).map((r, i) => (
              <div
                key={r.id}
                onClick={() => onSelectGov(r.id)}
                className="apple-card p-3.5 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                    i === 0
                      ? 'bg-white text-black shadow-sm'
                      : 'bg-white/[0.06] text-white/60 border border-white/10'
                  }`}>
                    {i + 1}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-white group-hover:text-sky-400 transition-colors">
                      {lang === 'ar' ? r.name_ar : r.name_en}
                    </span>
                    <span className="text-[10px] text-white/45 block tabular-nums font-normal mt-0.5">
                      HNI Score: {r.hni}
                    </span>
                  </div>
                </div>

                <div className="text-right rtl:text-left">
                  <span className="text-xs font-semibold text-white tabular-nums bg-white/[0.06] px-3 py-1 rounded-full border border-white/10">
                    {r.match_pct}% Match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </section>
  );
}
