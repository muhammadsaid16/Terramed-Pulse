import React, { useState } from 'react';
import { Compass, X, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

export default function WizardModal({ isOpen, onClose, t, onApplyPreset }) {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleFinish = (presetId) => {
    onApplyPreset(presetId);
    onClose();
  };

  const presets = [
    {
      id: 1,
      label: t.demo1,
      sub: t.demoSub1
    },
    {
      id: 2,
      label: t.demo2,
      sub: t.demoSub2
    },
    {
      id: 3,
      label: t.demo3,
      sub: t.demoSub3
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="bg-[#090C15]/95 backdrop-blur-3xl border border-white/12 rounded-3xl max-w-xl w-full p-6 modal-spring space-y-5 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
              <Compass className="w-4 h-4 text-sky-400" />
            </div>
            <h3 className="font-semibold text-base text-white">
              {t.wizardTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="apple-chip p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator (Apple Segmented Track) */}
        <div className="flex items-center justify-center space-x-6 rtl:space-x-reverse py-1">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div
                className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                  step === s
                    ? 'bg-white text-black shadow-sm'
                    : step > s
                    ? 'bg-white/20 text-white'
                    : 'bg-white/[0.06] text-white/40'
                }`}
              >
                {step > s ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-white/30' : 'bg-white/[0.06]'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-white">
              {t.step1Title}
            </h4>
            <p className="text-xs text-white/60 leading-relaxed font-normal">
              {t.step1Desc}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="apple-card p-4 text-left rtl:text-right space-y-1.5 group"
              >
                <span className="font-semibold text-xs text-white group-hover:text-sky-400 flex items-center gap-1.5">
                  🩺 {t.rolePhysician}
                </span>
                <span className="text-[11px] text-white/50 block font-normal leading-normal">
                  {t.rolePhysicianSub}
                </span>
              </button>

              <button
                onClick={() => setStep(2)}
                className="apple-card p-4 text-left rtl:text-right space-y-1.5 group"
              >
                <span className="font-semibold text-xs text-white group-hover:text-sky-400 flex items-center gap-1.5">
                  📊 {t.roleDecision}
                </span>
                <span className="text-[11px] text-white/50 block font-normal leading-normal">
                  {t.roleDecisionSub}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-white">
              {t.step2Title}
            </h4>
            <p className="text-xs text-white/60 leading-relaxed font-normal">
              {t.step2Desc}
            </p>
            <div className="space-y-2 pt-1">
              {presets.map(preset => (
                <div
                  key={preset.id}
                  onClick={() => handleFinish(preset.id)}
                  className="apple-card p-3.5 flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <span className="font-semibold text-xs text-white group-hover:text-sky-400 transition-colors">
                      {preset.label}
                    </span>
                    <span className="text-[11px] text-white/50 block mt-0.5 font-normal">
                      {preset.sub}
                    </span>
                  </div>
                  <Sparkles className="w-4 h-4 text-white/30 group-hover:text-sky-400 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="apple-chip px-3 py-1.5 rounded-full bg-white/[0.06] text-white/70 hover:text-white text-xs font-medium flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{t.btnBack}</span>
            </button>
          ) : <div />}

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="apple-btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5"
            >
              <span>{t.btnNext}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 text-black" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
