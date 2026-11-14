import React from 'react';
import { Calculator } from 'lucide-react';
import Modal from './ui/Modal';

export default function MathModal({ isOpen, onClose, t }) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.mathModalTitle}
      titleId="math-modal-title"
      panelClassName="max-w-2xl"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[color:var(--panel-2)] border border-[color:var(--line-strong)] flex items-center justify-center">
          <Calculator className="w-4 h-4 text-[color:var(--info)] dark:text-sky-400" />
        </div>
      </div>

        {/* Section 1: Linear Regression & t-test */}
        <div className="p-4 rounded-2xl bg-[color:var(--panel-2)] border border-[color:var(--line)] space-y-2">
          <h4 className="font-semibold text-[color:var(--info)] dark:text-sky-300 text-xs">
            {t.mathLinearTitle}
          </h4>
          <p className="text-xs text-[color:var(--ink-2)] leading-relaxed font-normal">
            {t.mathLinearBody}
          </p>
          <div className="p-3 bg-[color:var(--panel)] dark:bg-black/40 rounded-xl font-mono text-micro text-[color:var(--info-soft)] dark:text-sky-200 border border-[color:var(--line)] overflow-x-auto shadow-2xs dark:shadow-none">
            m = Σ(x - x̄)(y - ȳ) / Σ(x - x̄)² | SE(m) = √[SS_res / (df · Σ(x - x̄)²)] | CI_95 = m ± t_(crit) · SE(m)
          </div>
        </div>

        {/* Section 2: Mann-Kendall Test */}
        <div className="p-4 rounded-2xl bg-[color:var(--panel-2)] border border-[color:var(--line)] space-y-2">
          <h4 className="font-semibold text-[color:var(--info)] dark:text-sky-300 text-xs">
            {t.mathMKTitle}
          </h4>
          <p className="text-xs text-[color:var(--ink-2)] leading-relaxed font-normal">
            {t.mathMKBody}
          </p>
          <div className="p-3 bg-[color:var(--panel)] dark:bg-black/40 rounded-xl font-mono text-micro text-[color:var(--info-soft)] dark:text-sky-200 border border-[color:var(--line)] overflow-x-auto shadow-2xs dark:shadow-none">
            S = Σ Σ sgn(x_j - x_k) | Var(S) = [n(n-1)(2n+5) - Σ t(t-1)(2t+5)] / 18 | Z = (S ± 1) / √Var(S)
          </div>
        </div>

        {/* Section 3: Health Need Index Equation */}
        <div className="p-4 rounded-2xl bg-[color:var(--panel-2)] border border-[color:var(--line)] space-y-2">
          <h4 className="font-semibold text-[color:var(--info)] dark:text-sky-300 text-xs">
            {t.mathHNITitle}
          </h4>
          <p className="text-xs text-[color:var(--ink-2)] leading-relaxed font-normal">
            {t.mathHNIBody}
          </p>
          <div className="p-3 bg-[color:var(--panel)] dark:bg-black/40 rounded-xl font-mono text-micro text-[color:var(--info-soft)] dark:text-sky-200 border border-[color:var(--line)] overflow-x-auto shadow-2xs dark:shadow-none">
            HNI = (0.35 · EPI) + (0.30 · PPI) + (0.20 · FSI) + (0.15 · WNI)
          </div>
        </div>

        {/* Section 4: Bayesian Workforce Need */}
        <div className="p-4 rounded-2xl bg-[color:var(--panel-2)] border border-[color:var(--line)] space-y-2">
          <h4 className="font-semibold text-[color:var(--info)] dark:text-sky-300 text-xs">
            {t.mathWNITitle}
          </h4>
          <p className="text-xs text-[color:var(--ink-2)] leading-relaxed font-normal">
            {t.mathWNIBody}
          </p>
          <div className="p-3 bg-[color:var(--panel)] dark:bg-black/40 rounded-xl font-mono text-micro text-[color:var(--info-soft)] dark:text-sky-200 border border-[color:var(--line)] overflow-x-auto shadow-2xs dark:shadow-none">
            WNI_post = (n_prior · WNI_prior + Σ w_i · Score_i) / (n_prior + N_obs)
          </div>
        </div>

        {/* Section 5: Climate-Sensitive ER Pressure Model */}
        <div className="p-4 rounded-2xl bg-[color:var(--panel-2)] border border-[color:var(--line)] space-y-2">
          <h4 className="font-semibold text-[color:var(--info)] dark:text-sky-300 text-xs">
            {t.mathERPressureTitle}
          </h4>
          <p className="text-xs text-[color:var(--ink-2)] leading-relaxed font-normal">
            {t.mathERPressureBody}
          </p>
          <div className="p-3 bg-[color:var(--panel)] dark:bg-black/40 rounded-xl font-mono text-micro text-[color:var(--info-soft)] dark:text-sky-200 border border-[color:var(--line)] overflow-x-auto shadow-2xs dark:shadow-none">
            {t.mathERPressureEquation}
          </div>
        </div>

        {/* Section 6: Three-Study Meta-Synthesis */}
        <div className="p-4 rounded-2xl bg-[color:var(--panel-2)] border border-[color:var(--line)] space-y-2">
          <h4 className="font-semibold text-[color:var(--info)] dark:text-sky-300 text-xs">
            {t.mathStudiesTitle}
          </h4>
          <p className="text-xs text-[color:var(--ink-2)] leading-relaxed font-normal">
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
    </Modal>
  );
}
