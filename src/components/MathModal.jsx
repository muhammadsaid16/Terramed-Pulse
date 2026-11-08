import React from 'react';
import { X, Calculator } from 'lucide-react';

export default function MathModal({ isOpen, onClose, t }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-3xl border border-slate-200/90 dark:border-white/10 rounded-3xl max-w-2xl w-full p-6 sm:p-8 modal-spring space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-white">
              {t.mathModalTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="apple-chip p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:text-white/50 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Linear Regression & t-test */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] space-y-2">
          <h4 className="font-semibold text-sky-700 dark:text-sky-300 text-xs">
            {t.mathLinearTitle}
          </h4>
          <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed font-normal">
            {t.mathLinearBody}
          </p>
          <div className="p-3 bg-white dark:bg-black/40 rounded-xl font-mono text-micro text-sky-800 dark:text-sky-200 border border-slate-200/80 dark:border-white/5 overflow-x-auto shadow-2xs dark:shadow-none">
            m = Σ(x - x̄)(y - ȳ) / Σ(x - x̄)² | SE(m) = √[SS_res / (df · Σ(x - x̄)²)] | CI_95 = m ± t_(crit) · SE(m)
          </div>
        </div>

        {/* Section 2: Mann-Kendall Test */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] space-y-2">
          <h4 className="font-semibold text-sky-700 dark:text-sky-300 text-xs">
            {t.mathMKTitle}
          </h4>
          <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed font-normal">
            {t.mathMKBody}
          </p>
          <div className="p-3 bg-white dark:bg-black/40 rounded-xl font-mono text-micro text-sky-800 dark:text-sky-200 border border-slate-200/80 dark:border-white/5 overflow-x-auto shadow-2xs dark:shadow-none">
            S = Σ Σ sgn(x_j - x_k) | Var(S) = [n(n-1)(2n+5) - Σ t(t-1)(2t+5)] / 18 | Z = (S ± 1) / √Var(S)
          </div>
        </div>

        {/* Section 3: Health Need Index Equation */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] space-y-2">
          <h4 className="font-semibold text-sky-700 dark:text-sky-300 text-xs">
            {t.mathHNITitle}
          </h4>
          <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed font-normal">
            {t.mathHNIBody}
          </p>
          <div className="p-3 bg-white dark:bg-black/40 rounded-xl font-mono text-micro text-sky-800 dark:text-sky-200 border border-slate-200/80 dark:border-white/5 overflow-x-auto shadow-2xs dark:shadow-none">
            HNI = (0.35 · EPI) + (0.30 · PPI) + (0.20 · FSI) + (0.15 · WNI)
          </div>
        </div>

        {/* Section 4: Bayesian Workforce Need */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] space-y-2">
          <h4 className="font-semibold text-sky-700 dark:text-sky-300 text-xs">
            {t.mathWNITitle}
          </h4>
          <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed font-normal">
            {t.mathWNIBody}
          </p>
          <div className="p-3 bg-white dark:bg-black/40 rounded-xl font-mono text-micro text-sky-800 dark:text-sky-200 border border-slate-200/80 dark:border-white/5 overflow-x-auto shadow-2xs dark:shadow-none">
            WNI_post = (n_prior · WNI_prior + Σ w_i · Score_i) / (n_prior + N_obs)
          </div>
        </div>

        {/* Section 5: Climate-Sensitive ER Pressure Model */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] space-y-2">
          <h4 className="font-semibold text-sky-700 dark:text-sky-300 text-xs">
            {t.mathERPressureTitle}
          </h4>
          <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed font-normal">
            {t.mathERPressureBody}
          </p>
          <div className="p-3 bg-white dark:bg-black/40 rounded-xl font-mono text-micro text-sky-800 dark:text-sky-200 border border-slate-200/80 dark:border-white/5 overflow-x-auto shadow-2xs dark:shadow-none">
            {t.mathERPressureEquation}
          </div>
        </div>

        {/* Section 6: Three-Study Meta-Synthesis */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] space-y-2">
          <h4 className="font-semibold text-sky-700 dark:text-sky-300 text-xs">
            {t.mathStudiesTitle}
          </h4>
          <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed font-normal">
            {t.mathStudiesBody}
          </p>
        </div>

        <div className="pt-2 text-right rtl:text-left">
          <button
            onClick={onClose}
            className="apple-btn-primary px-5 py-2 text-xs font-semibold"
          >
            {t.btnGotIt}
          </button>
        </div>

      </div>
    </div>
  );
}
