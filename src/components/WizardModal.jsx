import React, { useState } from 'react';
import { Compass, X, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

export default function WizardModal({ isOpen, onClose, t, onApplyPreset }) {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleFinish = (presetId) => {
    onApplyPreset(presetId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="bg-space-950 border border-white/15 rounded-3xl max-w-xl w-full p-6 modal-spring space-y-5 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-slate-100">
              {t.wizardTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="apple-chip p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-6 rtl:space-x-reverse py-1">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div
                className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center transition-all ${
                  step === s
                    ? 'bg-teal-500 text-slate-950 shadow-apple-glow ring-2 ring-teal-300'
                    : step > s
                    ? 'bg-teal-900 text-teal-300'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-10 h-0.5 ${step > s ? 'bg-teal-500' : 'bg-slate-800'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-teal-300">
              {t.step1Title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.step1Desc}
            </p>
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-white/5 text-xs text-slate-400 leading-relaxed">
              {t.step1Tip}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setStep(2)}
                className="apple-chip p-2.5 rounded-xl bg-space-900 border border-rose-500/30 text-rose-300 text-xs font-bold text-left rtl:text-right"
              >
                🔥 Upper Egypt Heat Stress
              </button>
              <button
                onClick={() => setStep(2)}
                className="apple-chip p-2.5 rounded-xl bg-space-900 border border-teal-500/30 text-teal-300 text-xs font-bold text-left rtl:text-right"
              >
                🌊 Nile Delta Moisture & Dust
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-teal-300">
              {t.step2Title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.step2Desc}
            </p>
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-white/5 text-xs text-slate-400 leading-relaxed">
              {t.step2Tip}
            </div>

            <div className="p-3 bg-teal-950/40 rounded-xl border border-teal-500/30 text-xs text-teal-200">
              <b>Statistical Engine Rule:</b> Slope $\beta$ is computed along with Mann-Kendall test to confirm trends at $\alpha = 0.05$ (95% confidence).
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-teal-300">
              {t.step3Title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.step3Desc}
            </p>
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-white/5 text-xs text-slate-400 leading-relaxed">
              {t.step3Tip}
            </div>

            <div className="p-3 bg-gradient-to-r from-teal-950/60 to-slate-900 rounded-xl border border-teal-500/30 flex items-center justify-between">
              <span className="text-xs text-slate-200 font-bold">Apply Recommended Case:</span>
              <button
                onClick={() => handleFinish(1)}
                className="apple-btn px-3 py-1.5 bg-teal-500 text-slate-950 font-black text-xs rounded-lg flex items-center gap-1 shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Flagship Upper Egypt</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <button
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1}
            className={`apple-btn px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
              step === 1 ? 'opacity-30 cursor-not-allowed text-slate-500' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>{t.btnPrev}</span>
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(prev => Math.min(3, prev + 1))}
              className="apple-btn px-5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20"
            >
              <span>{t.btnNext}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          ) : (
            <button
              onClick={() => handleFinish(1)}
              className="apple-btn px-5 py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-apple-glow"
            >
              <span>{t.btnFinish}</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
