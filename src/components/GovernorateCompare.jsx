import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeftRight, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import { prefersReducedMotion } from '../lib/motionTokens';

const INDEX_ROWS = [
  { key: 'hni', labelKey: 'compareHni', tone: 'bg-[color:var(--accent)]' },
  { key: 'epi', labelKey: 'compareEpi', tone: 'bg-[color:var(--accent)]' },
  { key: 'ppi', labelKey: 'comparePpi', tone: 'bg-[color:var(--accent)]' },
  { key: 'fsi', labelKey: 'compareFsi', tone: 'bg-[color:var(--accent)]' },
  { key: 'wni', labelKey: 'compareWni', tone: 'bg-[color:var(--accent)]' }
];

function getIndex(gov, key) {
  const indices = gov?.baseline_indices || {};
  const value = key === 'wni' ? (indices.wni ?? indices.wni_prior) : indices[key];
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function formatNumber(value, lang) {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(value);
}

export default function GovernorateCompare({ governorates, lang, t, onSelectGov }) {
  const isAr = lang === 'ar';
  const options = useMemo(
    () => Object.values(governorates || {}).sort((a, b) => a.name_en.localeCompare(b.name_en)),
    [governorates]
  );
  const [govA, setGovA] = useState('cairo');
  const [govB, setGovB] = useState('aswan');
  const sectionRef = useRef(null);
  const barRefs = useRef({});
  const cardRefs = useRef([]);

  const a = governorates?.[govA] || options[0];
  const b = governorates?.[govB] || options[1] || options[0];

  useLayoutEffect(() => {
    if (!sectionRef.current) return undefined;
    if (prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRefs.current.filter(Boolean),
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.32, ease: 'power3.out', stagger: 0.06, overwrite: true }
      );

      Object.values(barRefs.current).filter(Boolean).forEach((bar, index) => {
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: isAr ? 'right center' : 'left center',
            duration: 0.55,
            ease: 'power3.out',
            delay: index * 0.025,
            overwrite: true
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [govA, govB, lang, isAr]);

  if (!a || !b) return null;

  const higherA = getIndex(a, 'hni') >= getIndex(b, 'hni');
  const cards = [
    { gov: a, side: 'a', higher: higherA },
    { gov: b, side: 'b', higher: !higherA }
  ];

  const renderCard = ({ gov, side, higher }, cardIndex) => {
    const name = isAr ? gov.name_ar : gov.name_en;
    return (
      <div
        key={gov.id}
        ref={(node) => { cardRefs.current[cardIndex] = node; }}
        className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-2)] p-4 space-y-4"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-2xs font-mono uppercase tracking-[0.16em] text-[color:var(--muted)]">
              {side === 'a' ? t.compareGovA : t.compareGovB}
            </div>
            <label className="sr-only" htmlFor={`compare-${side}`}>
              {side === 'a' ? t.compareGovA : t.compareGovB}
            </label>
            <select
              id={`compare-${side}`}
              value={gov.id}
              onChange={(event) => {
                if (side === 'a') setGovA(event.target.value);
                else setGovB(event.target.value);
              }}
              className="mt-1.5 w-full rounded-lg border border-[color:var(--line-strong)] bg-[color:var(--panel)] dark:bg-[#0b1120] px-2.5 py-1.5 text-xs font-semibold text-[color:var(--ink)]"
            >
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {isAr ? option.name_ar : option.name_en}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => onSelectGov?.(gov.id)}
            className="apple-chip px-2 py-1 text-2xs font-semibold text-[color:var(--info)] dark:text-sky-300"
          >
            {t.compareFocus}
          </button>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-2xs text-[color:var(--muted)]">{t.compareHni}</div>
            <div className="telemetry-mono text-2xl font-bold text-[color:var(--ink)]">
              {formatNumber(getIndex(gov, 'hni'), lang)}
            </div>
          </div>
          {higher && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-2xs font-semibold text-[color:var(--warn)] dark:text-amber-300">
              <TrendingUp className="h-3 w-3" />
              {t.compareHigherNeed}
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          {INDEX_ROWS.map((row) => {
            const value = getIndex(gov, row.key);
            return (
              <div key={row.key}>
                <div className="mb-1 flex items-center justify-between gap-2 text-2xs text-[color:var(--muted)]">
                  <span>{t[row.labelKey]}</span>
                  <span className="font-mono font-semibold text-[color:var(--ink-2)]">{formatNumber(value, lang)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--line)]">
                  <div
                    ref={(node) => { barRefs.current[`${side}-${row.key}`] = node; }}
                    className={`h-full rounded-full ${row.tone}`}
                    style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-[color:var(--line)] pt-3 text-2xs">
          <div>
            <div className="text-[color:var(--muted)]">{t.comparePopulation}</div>
            <div className="mt-0.5 font-mono font-semibold text-[color:var(--ink-2)]">
              {formatNumber(gov.demographics?.population ?? 0, lang)}
            </div>
          </div>
          <div>
            <div className="text-[color:var(--muted)]">{t.comparePhysicians}</div>
            <div className="mt-0.5 font-mono font-semibold text-[color:var(--ink-2)]">
              {formatNumber(gov.demographics?.physicians_per_10k ?? 0, lang)}
            </div>
          </div>
          <div>
            <div className="text-[color:var(--muted)]">{t.compareBeds}</div>
            <div className="mt-0.5 font-mono font-semibold text-[color:var(--ink-2)]">
              {formatNumber(gov.demographics?.hospital_beds_per_10k ?? 0, lang)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="section-compare" ref={sectionRef} className="bento-card p-5 sm:p-7 mb-8 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[color:var(--line)] pb-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200 bg-sky-100 text-[color:var(--info)] dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-400">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-[color:var(--ink)] sm:text-xl">
              {t.compareTitle}
            </h2>
            <p className="mt-1 text-micro font-normal text-[color:var(--ink-2)]">
              {t.compareSubtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {cards.map(renderCard)}
      </div>
    </section>
  );
}
