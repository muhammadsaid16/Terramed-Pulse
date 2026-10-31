import React, { useState, useEffect } from 'react';
import { Compass, X, ArrowRight, ArrowLeft, Check, Sparkles, MapPin, Activity, Stethoscope } from 'lucide-react';

export default function WizardModal({ isOpen, onClose, lang, t, onApplyPreset }) {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('physician');
  const [selectedPreset, setSelectedPreset] = useState(1);

  const isAr = lang === 'ar' || (!lang && document.documentElement.dir === 'rtl');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const presets = [
    {
      id: 1,
      label: t.demo1,
      sub: t.demoSub1,
      gov: isAr ? 'أسوان (صعيد مصر)' : 'Aswan (Upper Egypt)',
      metric: isAr ? 'أقصى حرارة يومية T2M_MAX (+1.46°C ذروة الاحترار)' : 'Max Daily Air Temp T2M_MAX (+1.46°C Peak)',
      specialty: isAr ? 'أمراض الكلى، المسالك، وطب الطوارئ' : 'Nephrology, Urology & Emergency Medicine',
      impact: isAr
        ? 'تسارع الاحترار والجفاف الشديد يرفع حالات القصور الكلوي الحاد، مما يجعل استبقاء أطباء الكلى والطوارئ في صعيد مصر ضرورة إنقاذ حياة قصوى.'
        : 'Accelerating thermal stress & dehydration compound acute renal distress, making nephrologist & emergency talent retention in Upper Egypt life-critical.'
    },
    {
      id: 2,
      label: t.demo2,
      sub: t.demoSub2,
      gov: isAr ? 'الإسكندرية وأطراف الدلتا' : 'Alexandria & Nile Delta Fringes',
      metric: isAr ? 'مؤشر الغطاء النباتي NDVI ورطوبة التربة GLDAS' : 'Vegetation Index NDVI & Soil Moisture GLDAS',
      specialty: isAr ? 'طب الأسرة، الباطنة العامة، ورعاية الأطفال' : 'Family Medicine, Internal Medicine & Pediatrics',
      impact: isAr
        ? 'انحسار المساحات الخضراء وجفاف التربة مع ثبات الرطوبة الساحلية يغير الخريطة الصحية والغذائية، مما يتطلب نشر مراكز الرعاية الأولية وطب الأسرة.'
        : 'Vegetative desiccation alongside persistent coastal humidity alters agro-nutritional health, calling for primary care & family medicine deployment.'
    },
    {
      id: 3,
      label: t.demo3,
      sub: t.demoSub3,
      gov: isAr ? 'القاهرة الكبرى (القاهرة والجيزة)' : 'Greater Cairo (Cairo & Giza)',
      metric: isAr ? 'كثافة الهباء الجوي MERRA-2 AOD والجزر الحرارية' : 'Aerosol Optical Depth MERRA-2 AOD & Heat Island',
      specialty: isAr ? 'الأمراض الصدرية، الحساسية، وطب القلب' : 'Pulmonology, Allergy & Cardiology',
      impact: isAr
        ? 'تراكم الجسيمات العالقة والغبار والانحباس الحراري يرفع معدلات نوبات الربو وأمراض الجهاز التنفسي، مما يرفع الطلب الحرج لأطباء الصدر.'
        : 'Dense airborne particulates (AOD > 0.42) & urban heat trapping exacerbate asthma & cardiopulmonary distress, demanding pulmonology talents.'
    }
  ];

  const activePreset = presets.find(p => p.id === selectedPreset) || presets[0];

  const handleFinish = () => {
    onApplyPreset(selectedPreset);
    onClose();
    setTimeout(() => {
      const el = document.getElementById('section-detective');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-3xl border border-slate-200/90 dark:border-white/10 rounded-3xl max-w-xl w-full p-6 modal-spring space-y-5 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 flex items-center justify-center">
              <Compass className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-white">
              {t.wizardTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="apple-chip p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:text-white/50 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator (Apple Segmented Track) */}
        <div className="flex items-center justify-center space-x-6 rtl:space-x-reverse py-1">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <button
                type="button"
                onClick={() => {
                  if (s < step) setStep(s);
                }}
                disabled={s > step}
                className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                  step === s
                    ? 'bg-sky-600 text-white dark:bg-white dark:text-black shadow-sm'
                    : step > s
                    ? 'bg-emerald-500 text-white dark:bg-emerald-400 dark:text-black cursor-pointer hover:opacity-90'
                    : 'bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-white/40 cursor-default'
                }`}
              >
                {step > s ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s}
              </button>
              {s < 3 && (
                <div
                  className={`w-12 h-0.5 transition-all ${
                    step > s ? 'bg-emerald-500/60 dark:bg-emerald-400/60' : 'bg-slate-200 dark:bg-white/[0.06]'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Role / Intent Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
              {t.step1Title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed font-normal">
              {t.step1Desc}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('physician');
                  setStep(2);
                }}
                className={`apple-card p-4 text-left rtl:text-right space-y-1.5 group border transition-all ${
                  selectedRole === 'physician'
                    ? 'border-sky-500 bg-sky-50/70 dark:border-sky-400/80 dark:bg-sky-500/10'
                    : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20'
                }`}
              >
                <span className="font-semibold text-xs text-slate-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400 flex items-center gap-1.5">
                  🩺 {t.rolePhysician}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-white/50 block font-normal leading-normal">
                  {t.rolePhysicianSub}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('decision');
                  setStep(2);
                }}
                className={`apple-card p-4 text-left rtl:text-right space-y-1.5 group border transition-all ${
                  selectedRole === 'decision'
                    ? 'border-sky-500 bg-sky-50/70 dark:border-sky-400/80 dark:bg-sky-500/10'
                    : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20'
                }`}
              >
                <span className="font-semibold text-xs text-slate-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400 flex items-center gap-1.5">
                  📊 {t.roleDecision}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-white/50 block font-normal leading-normal">
                  {t.roleDecisionSub}
                </span>
              </button>
            </div>
            {t.step1Tip && (
              <div className="text-[11px] text-slate-600 dark:text-white/45 bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] leading-relaxed">
                {t.step1Tip}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Investigation Case Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
              {t.step2Title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed font-normal">
              {t.step2Desc}
            </p>
            <div className="space-y-2 pt-1">
              {presets.map(preset => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset.id)}
                    className={`apple-card p-3.5 flex items-center justify-between cursor-pointer border transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/80 dark:border-sky-400 dark:bg-sky-500/15 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className={`font-semibold text-xs transition-colors flex items-center gap-2 ${
                        isSelected ? 'text-sky-700 dark:text-sky-300' : 'text-slate-900 dark:text-white'
                      }`}>
                        {preset.label}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-white/50 block font-normal leading-normal">
                        {preset.sub}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-sky-600 dark:bg-sky-400 text-white dark:text-black flex items-center justify-center font-bold">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-400 dark:text-white/20">
                          <Sparkles className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {t.step2Tip && (
              <div className="text-[11px] text-slate-600 dark:text-white/45 bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] leading-relaxed">
                {t.step2Tip}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Synthesis & Health Action */}
        {step === 3 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
              {t.step3Title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed font-normal">
              {t.step3Desc}
            </p>

            {/* Selected Investigation Brief Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-sky-300 dark:border-sky-400/30 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-2">
                <span className="font-semibold text-xs text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                  {activePreset.label}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-400/10 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-400/20">
                  {isAr ? 'حالة التحقيق المختارة' : 'Selected Case'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-start gap-2 text-slate-700 dark:text-white/70">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 dark:text-white/40 text-[11px] block">{isAr ? 'المحافظة المستهدفة:' : 'Target Governorate:'}</span>
                    <span className="text-slate-900 dark:text-white font-medium">{activePreset.gov}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-700 dark:text-white/70">
                  <Activity className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 dark:text-white/40 text-[11px] block">{isAr ? 'رصد أقمار ناسا المتسارع:' : 'NASA Satellite Telemetry:'}</span>
                    <span className="text-slate-900 dark:text-white font-medium">{activePreset.metric}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-700 dark:text-white/70">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 dark:text-white/40 text-[11px] block">{isAr ? 'التخصص الطبي الأكثر حاجة واستبقاءً:' : 'Priority Retention Specialty:'}</span>
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold">{activePreset.specialty}</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-700 dark:text-white/70 bg-white dark:bg-black/30 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] leading-relaxed">
                {activePreset.impact}
              </div>
            </div>

            {t.step3Tip && (
              <div className="text-[11px] text-amber-800 dark:text-amber-300/90 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-2.5 rounded-xl flex items-start gap-2 leading-relaxed">
                {t.step3Tip}
              </div>
            )}
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="apple-chip px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/[0.06] dark:text-white/70 dark:hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{t.btnBack}</span>
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="apple-btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5"
            >
              <span>{t.btnNext}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="apple-btn-primary px-5 py-2 text-xs font-semibold flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white dark:from-emerald-400 dark:to-teal-400 dark:text-black shadow-lg shadow-teal-500/20 hover:opacity-95 transition-all"
            >
              <span>{t.btnFinish || (isAr ? 'تطبيق التحقيق على المنظومة' : 'Apply Investigation')}</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
