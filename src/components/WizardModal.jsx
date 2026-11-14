import React, { useState, useEffect } from 'react';
import { Compass, X, ArrowRight, ArrowLeft, Check, Sparkles, MapPin, Activity, Stethoscope } from 'lucide-react';
import { ShimmerButton } from './ui';
import Modal from './ui/Modal';
import { scrollBehavior } from '../lib/motionTokens';

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
        el.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
      }
    }, 100);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.wizardTitle}
      titleId="wizard-title"
      panelClassName="max-w-xl p-6"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[color:var(--panel-2)] border border-[color:var(--line-strong)] flex items-center justify-center">
          <Compass className="w-4 h-4 text-[color:var(--info)] dark:text-sky-400" />
        </div>
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
                className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-[color,background-color,border-color,box-shadow,transform,filter] ${
                  step === s
                    ? 'bg-sky-600 text-white shadow-sm'
                    : step > s
                    ? 'bg-emerald-500 text-white cursor-pointer hover:opacity-90'
                    : 'bg-[color:var(--panel-2)] text-[color:var(--muted)] dark:bg-[color:var(--surface-3)] cursor-default'
                }`}
              >
                {step > s ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s}
              </button>
              {s < 3 && (
                <div
                  className={`w-12 h-0.5 transition-[color,background-color,border-color,box-shadow,transform,filter] ${
                    step > s ? 'bg-emerald-500/60 dark:bg-emerald-400/60' : 'bg-[color:var(--line)]'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Role / Intent Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-[color:var(--ink)]">
              {t.step1Title}
            </h4>
            <p className="text-xs text-[color:var(--ink-2)] leading-relaxed font-normal">
              {t.step1Desc}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('physician');
                  setStep(2);
                }}
                className={`apple-card p-4 text-left rtl:text-right space-y-1.5 group border transition-[color,background-color,border-color,box-shadow,transform,filter] ${
                  selectedRole === 'physician'
                    ? 'border-sky-500 bg-sky-50/70 dark:border-sky-400/80 dark:bg-sky-500/10'
                    : 'border-[color:var(--line)] hover:border-[color:var(--line-strong)] dark:hover:border-white/20'
                }`}
              >
                <span className="font-semibold text-xs text-[color:var(--ink)] group-hover:text-[color:var(--info)] dark:group-hover:text-sky-400 flex items-center gap-1.5">
                  🩺 {t.rolePhysician}
                </span>
                <span className="text-micro text-[color:var(--muted)] block font-normal leading-normal">
                  {t.rolePhysicianSub}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('decision');
                  setStep(2);
                }}
                className={`apple-card p-4 text-left rtl:text-right space-y-1.5 group border transition-[color,background-color,border-color,box-shadow,transform,filter] ${
                  selectedRole === 'decision'
                    ? 'border-sky-500 bg-sky-50/70 dark:border-sky-400/80 dark:bg-sky-500/10'
                    : 'border-[color:var(--line)] hover:border-[color:var(--line-strong)] dark:hover:border-white/20'
                }`}
              >
                <span className="font-semibold text-xs text-[color:var(--ink)] group-hover:text-[color:var(--info)] dark:group-hover:text-sky-400 flex items-center gap-1.5">
                  📊 {t.roleDecision}
                </span>
                <span className="text-micro text-[color:var(--muted)] block font-normal leading-normal">
                  {t.roleDecisionSub}
                </span>
              </button>
            </div>
            {t.step1Tip && (
              <div className="text-micro text-[color:var(--ink-2)] bg-[color:var(--panel-2)] p-2.5 rounded-xl border border-[color:var(--line)] leading-relaxed">
                {t.step1Tip}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Investigation Case Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-[color:var(--ink)]">
              {t.step2Title}
            </h4>
            <p className="text-xs text-[color:var(--ink-2)] leading-relaxed font-normal">
              {t.step2Desc}
            </p>
            <div className="space-y-2 pt-1">
              {presets.map(preset => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset.id)}
                    className={`apple-card p-3.5 flex items-center justify-between cursor-pointer border transition-[color,background-color,border-color,box-shadow,transform,filter] ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/80 dark:border-sky-400 dark:bg-sky-500/15 shadow-sm'
                        : 'border-[color:var(--line)] hover:border-[color:var(--line-strong)] dark:hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className={`font-semibold text-xs transition-colors flex items-center gap-2 ${
                        isSelected ? 'text-[color:var(--info)] dark:text-sky-300' : 'text-[color:var(--ink)]'
                      }`}>
                        {preset.label}
                      </span>
                      <span className="text-micro text-[color:var(--muted)] block font-normal leading-normal">
                        {preset.sub}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-[color:var(--line-strong)] flex items-center justify-center text-[color:var(--muted)]">
                          <Sparkles className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {t.step2Tip && (
              <div className="text-micro text-[color:var(--ink-2)] bg-[color:var(--panel-2)] p-2.5 rounded-xl border border-[color:var(--line)] leading-relaxed">
                {t.step2Tip}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Synthesis & Health Action */}
        {step === 3 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-[color:var(--ink)]">
              {t.step3Title}
            </h4>
            <p className="text-xs text-[color:var(--ink-2)] leading-relaxed font-normal">
              {t.step3Desc}
            </p>

            {/* Selected Investigation Brief Card */}
            <div className="p-4 rounded-2xl bg-[color:var(--panel-2)] dark:bg-[color:var(--surface-2)] border border-sky-300 dark:border-sky-400/30 space-y-3">
              <div className="flex items-center justify-between border-b border-[color:var(--line)] pb-2">
                <span className="font-semibold text-xs text-[color:var(--info)] dark:text-sky-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[color:var(--info)] dark:text-sky-400" />
                  {activePreset.label}
                </span>
                <span className="text-2xs uppercase font-mono px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-400/10 text-[color:var(--info)] dark:text-sky-300 border border-sky-200 dark:border-sky-400/20">
                  {isAr ? 'حالة التحقيق المختارة' : 'Selected Case'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-start gap-2 text-[color:var(--ink-2)]">
                  <MapPin className="w-3.5 h-3.5 text-[color:var(--danger)] dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[color:var(--muted)] text-micro block">{isAr ? 'المحافظة المستهدفة:' : 'Target Governorate:'}</span>
                    <span className="text-[color:var(--ink)] font-medium">{activePreset.gov}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-[color:var(--ink-2)]">
                  <Activity className="w-3.5 h-3.5 text-[color:var(--warn)] dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[color:var(--muted)] text-micro block">{isAr ? 'رصد أقمار ناسا المتسارع:' : 'NASA Satellite Telemetry:'}</span>
                    <span className="text-[color:var(--ink)] font-medium">{activePreset.metric}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-[color:var(--ink-2)]">
                  <Stethoscope className="w-3.5 h-3.5 text-[color:var(--ok)] dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[color:var(--muted)] text-micro block">{isAr ? 'التخصص الطبي الأكثر حاجة واستبقاءً:' : 'Priority Retention Specialty:'}</span>
                    <span className="text-[color:var(--ok)] dark:text-emerald-300 font-semibold">{activePreset.specialty}</span>
                  </div>
                </div>
              </div>

              <div className="text-micro text-[color:var(--ink-2)] bg-[color:var(--panel)] dark:bg-black/30 p-2.5 rounded-xl border border-[color:var(--line)] leading-relaxed">
                {activePreset.impact}
              </div>
            </div>

            {t.step3Tip && (
              <div className="text-micro text-[color:var(--warn-soft)] dark:text-amber-300/90 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-2.5 rounded-xl flex items-start gap-2 leading-relaxed">
                {t.step3Tip}
              </div>
            )}
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-[color:var(--line)]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="apple-chip px-3 py-1.5 rounded-full bg-[color:var(--panel-2)] hover:bg-[color:var(--line)] text-[color:var(--ink-2)] dark:bg-[color:var(--surface-3)] dark:hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
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
            <ShimmerButton
              onClick={handleFinish}
              className="text-xs font-semibold py-2 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-teal-500/20"
            >
              <span>{t.btnFinish || (isAr ? 'تطبيق التحقيق على المنظومة' : 'Apply Investigation')}</span>
              <Sparkles className="w-3.5 h-3.5" />
            </ShimmerButton>
          )}
        </div>
    </Modal>
  );
}
