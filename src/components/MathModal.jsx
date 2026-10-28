import React from 'react';
import { HelpCircle, X, CheckCircle, Calculator } from 'lucide-react';

export default function MathModal({ isOpen, onClose, t }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="bg-space-950 border border-white/15 rounded-3xl max-w-2xl w-full p-6 modal-spring space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-slate-100">
              {t.mathModalTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="apple-chip p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Linear Regression & t-test */}
        <div className="p-4 bg-space-900 rounded-2xl border border-white/5 space-y-2">
          <h4 className="font-bold text-teal-300 text-xs">
            {t.mathLinearTitle}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {t.mathLinearBody}
          </p>
          <div className="p-2.5 bg-space-950 rounded-xl font-mono text-[11px] text-teal-200 border border-white/5 overflow-x-auto">
            m = Σ(x - x̄)(y - ȳ) / Σ(x - x̄)² | SE(m) = √[SS_res / (df · Σ(x - x̄)²)] | CI_95 = m ± t_(crit) · SE(m)
          </div>
        </div>

        {/* Section 2: Mann-Kendall Test */}
        <div className="p-4 bg-space-900 rounded-2xl border border-white/5 space-y-2">
          <h4 className="font-bold text-teal-300 text-xs">
            {t.mathMKTitle}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {t.mathMKBody}
          </p>
          <div className="p-2.5 bg-space-950 rounded-xl font-mono text-[11px] text-teal-200 border border-white/5 overflow-x-auto">
            S = Σ Σ sgn(x_j - x_k) | Var(S) = [n(n-1)(2n+5) - Σ t(t-1)(2t+5)] / 18 | Z = (S ± 1) / √Var(S)
          </div>
        </div>

        {/* Section 3: Health Need Index Equation */}
        <div className="p-4 bg-space-900 rounded-2xl border border-white/5 space-y-2">
          <h4 className="font-bold text-teal-300 text-xs">
            {t.mathHNITitle}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {t.mathHNIBody}
          </p>
          <div className="p-2.5 bg-space-950 rounded-xl font-mono text-[11px] text-rose-300 border border-white/5">
            HNI = 0.35 · EPI + 0.30 · PPI + 0.20 · FSI + 0.15 · WNI (Normalized [0, 100])
          </div>
        </div>

        {/* Footer Confirmation */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="apple-btn px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
}
