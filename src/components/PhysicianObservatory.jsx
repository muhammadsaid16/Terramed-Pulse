import React, { useState } from 'react';
import {
  Stethoscope,
  Building2,
  ShieldAlert,
  FileCheck,
  ExternalLink,
  Users,
  Award,
  BookOpen,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Scale
} from 'lucide-react';
import SpotlightCard from './ui/SpotlightCard';
import NumberTicker from './ui/NumberTicker';
import GlowProgressBar from './ui/GlowProgressBar';
import { MIGRATION_RESEARCH_STUDIES, DOCUMENTED_MIGRATION_DRIVERS } from '../data/migrationResearchData';

export default function PhysicianObservatory({
  selectedGov,
  onSelectGov,
  governorates,
  lang,
  t
}) {
  const isAr = lang === 'ar';

  // Selected governorate for the CAPMAS capacity panel
  const activeGovKey = (selectedGov && governorates?.[selectedGov])
    ? selectedGov
    : (governorates?.['aswan'] ? 'aswan' : Object.keys(governorates || {})[0] || 'cairo');

  const currentGov = governorates?.[activeGovKey];

  // Specific WHO 2021 study metrics (n=885)
  const whoStudy = MIGRATION_RESEARCH_STUDIES.find(s => s.id === 'who_emhj_2021');
  const oxfordStudy = MIGRATION_RESEARCH_STUDIES.find(s => s.id === 'oxford_int_health_2015');
  const mdpiStudy = MIGRATION_RESEARCH_STUDIES.find(s => s.id === 'mdpi_societies_2025');

  const whoFindings = whoStudy?.key_findings || {};

  return (
    <section id="section-physicians" className="bento-card p-5 sm:p-8 mb-8 space-y-6">
      
      {/* Header bar */}
      <div className="border-b border-slate-200/80 dark:border-white/[0.08] pb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-100 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20">
              <Stethoscope className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
              {t?.module3Title || (isAr ? 'الوحدة 3: مرصد القوى البشرية الصحية واستبقاء الأطباء' : 'Module 3: Healthcare Workforce & Physician Retention Observatory')}
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-white/60 font-normal max-w-3xl leading-relaxed">
            {t?.module3Subtitle || (isAr
              ? 'تحليل تجريبي محكّم لدراسات هجرة الأطباء (منظمة الصحة العالمية، جامعة أكسفورد، MDPI) ومؤشرات التوزيع الجغرافي للجهاز المركزي للتعبئة العامة والإحصاء — مبني بنسبة 100% على بيانات رصدية موثقة ودراسات سريرية منشورة.'
              : 'Empirical synthesis of peer-reviewed physician migration cohorts (WHO EMHJ, Oxford University Press, MDPI) and CAPMAS healthcare capacity benchmarks — 100% founded on published empirical cohorts and official census records.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="satellite-chip text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800/40 text-[11px] font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isAr ? 'بيانات محكّمة وتعداد رسمي 100%' : '100% Empirical & Official Censuses'}</span>
          </span>
        </div>
      </div>

      {/* Top Evidence Stat Cards (Synthesis of 1,735 Egyptian Physicians) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Stat 1: Total Cohort */}
        <SpotlightCard className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-sky-500/40 dark:bg-white/[0.02] dark:border-white/[0.06] dark:hover:border-sky-500/30 transition-all flex flex-col justify-between space-y-1 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-white/50 uppercase tracking-wider">
                {isAr ? 'إجمالي عينة الأطباء المستطلعة' : 'Surveyed Physician Cohort'}
              </span>
              <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white telemetry-mono mt-1 flex items-baseline gap-1">
              <NumberTicker value={1735} /> <span className="text-xs font-normal text-slate-500 dark:text-white/50">{isAr ? 'طبيباً مصرياً' : 'MDs in Egypt'}</span>
            </div>
            <div className="text-[11px] text-sky-600 dark:text-sky-400/90 font-medium flex items-center gap-1 mt-1">
              <span>WHO ($n=885$) + Oxford ($400$) + MDPI ($450$)</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-white/[0.06] text-[10px] text-slate-500 dark:text-white/40 font-medium">
            <span className="text-sky-600 dark:text-sky-400 font-semibold">{t.sourcePrefix || 'المصدر:'}</span> WHO 885 + Oxford 400 + MDPI 450
          </div>
        </SpotlightCard>

        {/* Stat 2: Stay Willingness */}
        <SpotlightCard className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-emerald-500/40 dark:bg-white/[0.02] dark:border-white/[0.06] dark:hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-1 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-white/50 uppercase tracking-wider">
                {isAr ? 'الاستعداد للبقاء حال تحسين المنظومة' : 'Willingness to Stay (If Improved)'}
              </span>
              <HeartPulse className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 telemetry-mono mt-1">
              <NumberTicker value={97.4} suffix="%" decimalPlaces={1} />
            </div>
            <div className="text-[11px] text-slate-600 dark:text-white/60 font-normal mt-1">
              {isAr ? 'من الأطباء المقيمين مستعدون للبقاء (الصحة العالمية)' : 'Of resident physicians ready to stay (WHO EMHJ)'}
            </div>
          </div>
          <a
            href="https://doi.org/10.26719/emhj.21.070"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 pt-2 border-t border-slate-200/80 dark:border-white/[0.06] text-[10px] text-emerald-600 dark:text-emerald-400/90 font-medium flex items-center justify-between hover:underline"
          >
            <span><span className="text-slate-500 dark:text-white/40">{t.sourcePrefix || 'المصدر:'}</span> WHO EMHJ 2021 (n=885)</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </SpotlightCard>

        {/* Stat 3: Return Intent */}
        <SpotlightCard className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-amber-500/40 dark:bg-white/[0.02] dark:border-white/[0.06] dark:hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-1 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-white/50 uppercase tracking-wider">
                {isAr ? 'نية العودة لخدمة مصر بعد التدريب' : 'Intent to Return After Training'}
              </span>
              <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 telemetry-mono mt-1">
              <NumberTicker value={81.8} suffix="%" decimalPlaces={1} />
            </div>
            <div className="text-[11px] text-slate-600 dark:text-white/60 font-normal mt-1">
              {isAr ? 'رغبة وطنية للعودة بعلم متقدم (جامعة أكسفورد)' : 'Patriotic desire to return with expertise (Oxford)'}
            </div>
          </div>
          <a
            href="https://doi.org/10.1093/inthealth/ihv042"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 pt-2 border-t border-slate-200/80 dark:border-white/[0.06] text-[10px] text-amber-600 dark:text-amber-400/90 font-medium flex items-center justify-between hover:underline"
          >
            <span><span className="text-slate-500 dark:text-white/40">{t.sourcePrefix || 'المصدر:'}</span> Oxford Int Health 2015 (n=400)</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </SpotlightCard>

        {/* Stat 4: Dissatisfaction Multiplier */}
        <SpotlightCard className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-rose-500/40 dark:bg-white/[0.02] dark:border-white/[0.06] dark:hover:border-rose-500/30 transition-all flex flex-col justify-between space-y-1 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-white/50 uppercase tracking-wider">
                {isAr ? 'تأثير بيئة العمل على الهجرة' : 'Work Dissatisfaction Impact'}
              </span>
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 telemetry-mono mt-1 flex items-baseline gap-1">
              <NumberTicker value={20.0} suffix="×" decimalPlaces={1} /> <span className="text-xs font-normal text-slate-500 dark:text-white/50">{isAr ? 'أرجحية (OR)' : 'Odds Ratio'}</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-white/60 font-normal mt-1">
              {isAr ? 'تضاعف رغبة الهجرة لسوء بيئة العمل (MDPI 2025)' : 'Multiplied emigration intent from hospital distress'}
            </div>
          </div>
          <a
            href="https://doi.org/10.3390/soc15050112"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 pt-2 border-t border-slate-200/80 dark:border-white/[0.06] text-[10px] text-rose-600 dark:text-rose-400/90 font-medium flex items-center justify-between hover:underline"
          >
            <span><span className="text-slate-500 dark:text-white/40">{t.sourcePrefix || 'المصدر:'}</span> MDPI Societies 2025 (n=450)</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </SpotlightCard>
      </div>

      {/* Main Observatory Grid: Working Conditions & CAPMAS Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Frontline Clinical Working Conditions (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Card: WHO Working Conditions Breakdown */}
          <SpotlightCard className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-white/[0.03] dark:border-white/[0.08] space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-sky-100 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20">
                  <FileCheck className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {isAr ? 'بيئة العمل الميدانية للأطباء (دراسة الصحة العالمية، n=885)' : 'Frontline Working Conditions (WHO EMHJ Cohort, n=885)'}
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-white/40 telemetry-mono">
                EMHJ 2021;27(12)
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-white/70 leading-relaxed font-normal">
              {isAr
                ? 'تكشف البيانات الرصدية المحكّمة أن رغبة الأطباء في الهجرة ليست رفضاً للوطن، بل ناتجة عن ضغوط بيئة عمل قاسية يمكن علاجها بقرارات سياساتية محددة:'
                : 'Empirical data demonstrates that physician emigration intent is not a rejection of their country, but a direct consequence of severe working conditions that actionable policy can remediate:'}
            </p>

            {/* Metrics Breakdown Bars using 21st.dev GlowProgressBar */}
            <div className="space-y-4 pt-1">
              <div className="space-y-0.5">
                <GlowProgressBar
                  value={1.0}
                  label={isAr ? 'الرضا عن الرواتب والأجور المقابلة للمخاطر:' : 'Satisfaction with Salary & Risk Compensation:'}
                  valueText={isAr ? '1.0% (99% غير راضين)' : '1.0% (99% dissatisfied)'}
                  gradientFrom="from-rose-500"
                  gradientTo="to-red-600"
                  glowColor="shadow-rose-500/25"
                />
                <span className="text-[9px] text-slate-500 dark:text-white/40 block font-medium">
                  {isAr ? 'المصدر: دراسة منظمة الصحة العالمية EMHJ 2021 (عينة 885 طبيباً)' : 'Source: WHO EMHJ 2021 (n=885 Egyptian MDs)'}
                </span>
              </div>

              <div className="space-y-0.5">
                <GlowProgressBar
                  value={35.4}
                  label={isAr ? 'التعرض لاعتداء جسدي مباشر أثناء العمل:' : 'Experienced Direct Physical Assault on Duty:'}
                  valueText="35.4%"
                  gradientFrom="from-rose-500"
                  gradientTo="to-orange-500"
                  glowColor="shadow-rose-500/25"
                />
                <span className="text-[9px] text-slate-500 dark:text-white/40 block font-medium">
                  {isAr ? 'المصدر: دراسة منظمة الصحة العالمية EMHJ 2021 (عينة 885 طبيباً)' : 'Source: WHO EMHJ 2021 (n=885 Egyptian MDs)'}
                </span>
              </div>

              <div className="space-y-0.5">
                <GlowProgressBar
                  value={55.5}
                  label={isAr ? 'التعرض للسب والإهانة اللفظية بالمنشأة:' : 'Experienced Verbal Abuse in Facility:'}
                  valueText="55.5%"
                  gradientFrom="from-amber-500"
                  gradientTo="to-orange-500"
                  glowColor="shadow-amber-500/25"
                />
                <span className="text-[9px] text-slate-500 dark:text-white/40 block font-medium">
                  {isAr ? 'المصدر: دراسة منظمة الصحة العالمية EMHJ 2021 (عينة 885 طبيباً)' : 'Source: WHO EMHJ 2021 (n=885 Egyptian MDs)'}
                </span>
              </div>

              <div className="space-y-0.5">
                <GlowProgressBar
                  value={19.3}
                  label={isAr ? 'توفر أجهزة ومستلزمات طبية كافية بالاستقبال:' : 'Adequate Medical Supplies & Consumables:'}
                  valueText={isAr ? '19.3% (80.7% عجز مستلزمات)' : '19.3% (80.7% deficit)'}
                  gradientFrom="from-sky-500"
                  gradientTo="to-blue-600"
                  glowColor="shadow-sky-500/25"
                />
                <span className="text-[9px] text-slate-500 dark:text-white/40 block font-medium">
                  {isAr ? 'المصدر: منظمة الصحة العالمية EMHJ 2021 وسجلات التعبئة والإحصاء 2024' : 'Source: WHO EMHJ 2021 & CAPMAS Health Census 2024'}
                </span>
              </div>

              <div className="space-y-0.5">
                <GlowProgressBar
                  value={52.8}
                  label={isAr ? 'الاضطرار للعمل بالقطاع الخاص لتأمين المعيشة:' : 'Forced Moonlighting in Private Sector:'}
                  valueText="52.8%"
                  gradientFrom="from-purple-500"
                  gradientTo="to-indigo-600"
                  glowColor="shadow-purple-500/25"
                />
                <span className="text-[9px] text-slate-500 dark:text-white/40 block font-medium">
                  {isAr ? 'المصدر: دراسة منظمة الصحة العالمية EMHJ 2021 (عينة 885 طبيباً)' : 'Source: WHO EMHJ 2021 (n=885 Egyptian MDs)'}
                </span>
              </div>

              <div className="space-y-0.5">
                <GlowProgressBar
                  value={87.2}
                  label={isAr ? 'الهجرة بحثاً عن زمالات وتدريب سريري وبحثي:' : 'Emigration to Access Postgraduate Training/Research:'}
                  valueText="87.2%"
                  gradientFrom="from-emerald-500"
                  gradientTo="to-teal-600"
                  glowColor="shadow-emerald-500/25"
                />
                <span className="text-[9px] text-slate-500 dark:text-white/40 block font-medium">
                  {isAr ? 'المصدر: دراسة منظمة الصحة العالمية EMHJ 2021 (عينة 885 طبيباً)' : 'Source: WHO EMHJ 2021 (n=885 Egyptian MDs)'}
                </span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card: Actionable Policy Levers (Connecting Evidence to Solutions) */}
          <SpotlightCard className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-white/[0.03] dark:border-white/[0.08] space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                <Scale className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {isAr ? 'حزم السياسات المبنية على الأدلة لمعالجة دوافع الهجرة' : 'Evidence-Based Levers Addressing Root Emigration Drivers'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCUMENTED_MIGRATION_DRIVERS.slice(0, 4).map((driver) => (
                <div key={driver.id} className="p-3.5 rounded-xl bg-white border border-slate-200/80 dark:bg-white/[0.02] dark:border-white/[0.05] space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-900 dark:text-white/90">
                      {isAr ? driver.ar : driver.en}
                    </span>
                  </div>
                  <div className="text-[10px] text-rose-600 dark:text-rose-300/90 font-medium">
                    {isAr ? `الشاهد الرصدي: ${driver.evidence_stat_ar}` : `Empirical Finding: ${driver.evidence_stat}`}
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800/30 dark:text-emerald-300 text-[11px] font-medium">
                    {isAr ? `الحل الموصى به: ${driver.policy_lever_ar}` : `Actionable Lever: ${driver.policy_lever}`}
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>

        </div>

        {/* Right Column: CAPMAS Regional Healthcare Capacity & Studies (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Card: CAPMAS Regional Healthcare Density */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-white/[0.03] dark:border-white/[0.08] space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-sky-100 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20">
                  <Building2 className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {isAr ? 'التوزيع الإقليمي للكوادر (بيانات التعبئة والإحصاء)' : 'Regional Healthcare Capacity (CAPMAS Censuses)'}
                </h3>
              </div>
              <span className="text-[10px] text-sky-700 dark:text-sky-300 telemetry-mono font-medium">
                {isAr ? 'تعداد CAPMAS 2024' : 'CAPMAS 2024'}
              </span>
            </div>

            {/* Quick Governorate Switcher Pills */}
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(governorates || {}).map(govKey => {
                const g = governorates[govKey];
                const isSelected = govKey === activeGovKey;
                return (
                  <button
                    key={govKey}
                    onClick={() => onSelectGov && onSelectGov(govKey)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white font-semibold shadow-sm dark:bg-sky-500 dark:text-black dark:shadow-sky-500/20'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 dark:bg-white/[0.04] dark:text-white/70 dark:hover:bg-white/[0.08] dark:hover:text-white dark:border-white/[0.06]'
                    }`}
                  >
                    {isAr ? g.name_ar : g.name_en}
                  </button>
                );
              })}
            </div>

            {/* Selected Governorate Profile using 21st.dev SpotlightCard */}
            <SpotlightCard className="p-4 rounded-xl bg-white dark:bg-black/30 border border-slate-200/80 dark:border-white/[0.06] space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] pb-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {isAr ? currentGov?.name_ar : currentGov?.name_en}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-white/50 telemetry-mono">
                  {isAr
                    ? `${(currentGov?.demographics?.population / 1000000).toFixed(1)} مليون نسمة`
                    : `${(currentGov?.demographics?.population / 1000000).toFixed(1)}M citizens`}
                </span>
              </div>

              {/* Indicator: Physicians per 10k vs WHO Standard */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-white/70">
                    {isAr ? 'كثافة الأطباء (لكل 10 آلاف مواطن):' : 'Physicians per 10k population:'}
                  </span>
                  <span className={`font-bold telemetry-mono ${
                    (currentGov?.demographics?.physicians_per_10k || 0) < 10 ? 'text-rose-600 dark:text-rose-400' : 'text-sky-700 dark:text-sky-300'
                  }`}>
                    {currentGov?.demographics?.physicians_per_10k || '—'} / 10k
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-white/40">
                  <span>{isAr ? 'الحد الأدنى لمنظمة الصحة العالمية:' : 'WHO minimum threshold:'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400/80 telemetry-mono">23.0 / 10k</span>
                </div>
                {/* Shortage visualization bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.06] overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full ${
                      (currentGov?.demographics?.physicians_per_10k || 0) < 10 ? 'bg-rose-500' : 'bg-sky-500'
                    }`}
                    style={{
                      width: `${Math.min(100, ((currentGov?.demographics?.physicians_per_10k || 0) / 23.0) * 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Indicator: Hospital Beds per 10k */}
              <div className="flex items-center justify-between text-xs border-t border-slate-200/80 dark:border-white/[0.04] pt-2">
                <span className="text-slate-600 dark:text-white/70">
                  {isAr ? 'أسرة المستشفيات (لكل 10 آلاف مواطن):' : 'Hospital beds per 10k:'}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white telemetry-mono">
                  {currentGov?.demographics?.hospital_beds_per_10k || '—'} / 10k
                </span>
              </div>

              {/* Indicator: Facility Shortage Index (FSI) */}
              <div className="flex items-center justify-between text-xs border-t border-slate-200/80 dark:border-white/[0.04] pt-2">
                <span className="text-slate-600 dark:text-white/70">
                  {isAr ? 'مؤشر عجز المنشآت الصحية (FSI):' : 'Facility Shortage Index (FSI):'}
                </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400 telemetry-mono">
                  {currentGov?.baseline_indices?.fsi || '—'} / 100
                </span>
              </div>

              {/* Indicator: Environmental Pressure Index (EPI) */}
              <div className="flex items-center justify-between text-xs border-t border-slate-200/80 dark:border-white/[0.04] pt-2">
                <span className="text-slate-600 dark:text-white/70">
                  {isAr ? 'مؤشر الإجهاد البيئي والحراري (EPI):' : 'Environmental Pressure Index (EPI):'}
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400 telemetry-mono">
                  {currentGov?.baseline_indices?.epi || '—'} / 100
                </span>
              </div>

            </SpotlightCard>

            {/* Regional Contrast Callout */}
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 dark:bg-sky-950/20 dark:border-sky-800/30 dark:text-sky-200/90 leading-relaxed shadow-xs">
              <span className="font-semibold block mb-1">
                {isAr ? 'فجوة التوزيع الجغرافي العادلة:' : 'Geographic Disparity Insight:'}
              </span>
              {isAr
                ? 'تكشف سجلات التعبئة والإحصاء أن القاهرة تضم 16.5 طبيباً لكل 10 آلاف مواطن، بينما تنحدر الكثافة في أسوان إلى 5.4 طبيباً فقط لكل 10 آلاف مواطن، رغم أنها الأكثر تعرضاً لموجات الإجهاد الحراري وأمراض الكلى والجفاف، مما يبرز أهمية حوافز الاستبقاء الإقليمية.'
                : 'Official census records show Cairo has 16.5 physicians per 10k residents, whereas Aswan drops to only 5.4 per 10k despite bearing Egypt’s highest heatwave and renal stress burden, underscoring the necessity of location-based retention stipends.'}
            </div>
          </div>

          {/* Card: Peer-Reviewed Scientific References */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-white/[0.03] dark:border-white/[0.08] space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-100 text-purple-600 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
                <BookOpen className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {isAr ? 'المراجع العلمية المحكمة وبيانات التعداد' : 'Peer-Reviewed Literature & Census Sources'}
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              {MIGRATION_RESEARCH_STUDIES.map(study => (
                <a
                  key={study.id}
                  href={study.doi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200/80 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] dark:border-white/[0.04] transition-all group shadow-xs"
                >
                  <div className="flex items-center justify-between text-slate-900 dark:text-white/90 group-hover:text-sky-600 dark:group-hover:text-sky-300 font-medium">
                    <span>{isAr ? study.journal_ar : study.journal_en} ({study.year})</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 shrink-0" />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-white/50 mt-1 line-clamp-2">
                    {study.citation}
                  </div>
                </a>
              ))}

              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 dark:bg-white/[0.02] dark:border-white/[0.04] text-slate-700 dark:text-white/70 shadow-xs">
                <span className="font-medium text-slate-900 dark:text-white/90 block">
                  {isAr
                    ? 'الجهاز المركزي للتعبئة العامة والإحصاء (CAPMAS)'
                    : 'Central Agency for Public Mobilization & Statistics (CAPMAS)'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-white/50 block mt-1">
                  {isAr
                    ? 'النشرة السنوية للإحصاءات الصحية وتعداد المنشآت والأسرة والكوادر الطبية حسب المحافظات (2020–2024).'
                    : 'Annual Health Services and Medical Human Resources Census Bulletins (2020–2024).'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
