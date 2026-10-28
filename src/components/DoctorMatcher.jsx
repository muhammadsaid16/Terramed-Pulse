import React, { useState, useMemo } from 'react';
import { Stethoscope, HeartPulse, Wind, AlertCircle, Baby, Users, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { matchSpecialty } from '../lib/trendEngine';

export default function DoctorMatcher({
  data,
  lang,
  t,
  onSelectGov
}) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('nephrology');
  const [priorityGoal, setPriorityGoal] = useState('impact'); // 'impact', 'facilities', 'climate'

  const specialties = [
    { id: 'nephrology', label_en: 'Nephrology (كلى)', label_ar: 'أمراض الكلى والغسيل الكلوي', icon: HeartPulse },
    { id: 'pulmonology', label_en: 'Pulmonology (صدر)', label_ar: 'الأمراض الصدرية والجهاز التنفسي', icon: Wind },
    { id: 'cardiology', label_en: 'Cardiology (قلب)', label_ar: 'أمراض القلب والأوعية الدموية', icon: HeartPulse },
    { id: 'emergency', label_en: 'Emergency & Critical Care (طوارئ)', label_ar: 'طب الطوارئ والحالات الحرجة', icon: AlertCircle },
    { id: 'pediatrics', label_en: 'Pediatrics (أطفال)', label_ar: 'طب الأطفال وحديثي الولادة', icon: Baby },
    { id: 'geriatrics', label_en: 'Geriatrics (مسنين)', label_ar: 'طب وصحة المسنين', icon: Users },
    { id: 'dermatology_ophthalmology', label_en: 'Derm / Eye (جلد ورمد)', label_ar: 'الجلدية والعيون', icon: Sparkles },
    { id: 'occupational_preventive', label_en: 'Occupational & Preventive (مهنية)', label_ar: 'الطب المهني والوقائي وطب الأسرة', icon: ShieldAlert }
  ];

  // Dynamic ranking based on MCDA weights
  const rankings = useMemo(() => {
    if (!data?.governorates) return [];
    return matchSpecialty(selectedSpecialty, data.governorates);
  }, [data, selectedSpecialty]);

  const topGov = rankings[0];

  const currentSpecialtyObj = specialties.find(s => s.id === selectedSpecialty);

  return (
    <section id="section-doctor" className="apple-glass p-5 lg:p-6 mb-8 space-y-6">
      
      {/* Module Header */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-teal-400" />
          <h2 className="text-xl font-black text-slate-100">
            {t.module2Title}
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {t.module2Subtitle}
        </p>
      </div>

      {/* Specialty Selector Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 block">
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
                className={`apple-chip p-2.5 rounded-xl border text-left rtl:text-right flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-teal-500/20 text-teal-300 border-teal-400 shadow-apple-glow font-bold'
                    : 'bg-space-950/70 text-slate-300 border-white/10 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-teal-400' : 'text-slate-400'}`} />
                <span className="text-xs truncate">
                  {lang === 'ar' ? spec.label_ar : spec.label_en}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Specialty Demand Panel & Ranked Governorates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Scientific Justification & Drivers (7 cols) */}
        <div className="lg:col-span-7 bg-space-950/80 p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-teal-300 flex items-center gap-2">
              <span>{lang === 'ar' ? currentSpecialtyObj?.label_ar : currentSpecialtyObj?.label_en}</span>
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
              <CheckCircle2 className="w-3 h-3" />
              {t.matchBadge}
            </span>
          </div>

          {/* Biomedical Mechanism */}
          <div className="space-y-1">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.clinicalRationaleHeading}
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              {lang === 'ar' ? topGov?.justification_ar : topGov?.justification_en}
            </p>
          </div>

          {/* NASA Satellite Drivers */}
          <div className="space-y-1">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.nasaDriversHeading}
            </h4>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold">
                NASA POWER T2M_MAX &gt; 42°C
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-teal-500/15 text-teal-300 border border-teal-500/30 font-bold">
                MERRA-2 AOD / PM2.5 Spikes
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold">
                GLDAS Aridification
              </span>
            </div>
          </div>

          {/* Retention Pitch */}
          <div className="p-3.5 bg-gradient-to-r from-teal-950/50 to-slate-900 rounded-xl border border-teal-500/30">
            <h4 className="text-xs font-bold text-teal-300 mb-1">
              {t.whyEgyptNeedsHeading}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'ar'
                ? `محافظة ${topGov?.name_ar} تعاني من مؤشر عجز منشآت يبلغ ${topGov?.keyDrivers?.fsi}/100 وتصاعد مستمر في موجات الإجهاد الحراري. تواجدك هنا ينقذ مئات الحالات الحرجة شهرياً.`
                : `${topGov?.name_en} suffers from a severe facility gap (${topGov?.keyDrivers?.fsi}/100) and accelerating heatwave frequency. Practicing your specialty here creates the maximum clinical life-saving dividend.`}
            </p>
          </div>
        </div>

        {/* Right: Ranked Recommendations (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <span className="text-xs font-bold text-slate-300">
            {t.topGovsHeading}
          </span>

          <div className="space-y-2.5">
            {rankings.slice(0, 4).map((r, i) => (
              <div
                key={r.id}
                onClick={() => onSelectGov(r.id)}
                className="apple-glass-card p-3 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${
                    i === 0
                      ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {i + 1}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                      {lang === 'ar' ? r.name_ar : r.name_en}
                    </span>
                    <span className="text-[10px] text-slate-400 block tabular-nums">
                      HNI Score: {r.hni}
                    </span>
                  </div>
                </div>

                <div className="text-right rtl:text-left">
                  <span className="text-xs font-black text-teal-300 tabular-nums bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-500/40">
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
