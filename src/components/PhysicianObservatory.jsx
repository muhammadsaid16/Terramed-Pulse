import React, { useState } from 'react';
import {
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
import SectionHeader from './SectionHeader';

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
      <SectionHeader
        index="03"
        title={t?.module3Title || (isAr ? 'الوحدة 3: مرصد القوى البشرية الصحية واستبقاء الأطباء' : 'Module 3: Healthcare Workforce & Physician Retention Observatory')}
        subtitle={t?.module3Subtitle || (isAr
          ? 'تحليل تجريبي محكّم لدراسات هجرة الأطباء (منظمة الصحة العالمية، جامعة أكسفورد، MDPI) ومؤشرات التوزيع الجغرافي للجهاز المركزي للتعبئة العامة والإحصاء: مبني بنسبة 100% على بيانات رصدية موثقة ودراسات سريرية منشورة.'
          : 'Empirical synthesis of peer-reviewed physician migration cohorts (WHO EMHJ, Oxford University Press, MDPI) and CAPMAS healthcare capacity benchmarks, 100% founded on published empirical cohorts and official census records.')}
        right={
          <span className="satellite-chip flex items-center gap-1.5 px-2.5 py-1 text-micro font-medium text-[color:var(--ok)] dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--ok)] dark:text-emerald-400" />
            <span>{isAr ? 'بيانات محكّمة وتعداد رسمي 100%' : '100% Empirical & Official Censuses'}</span>
          </span>
        }
      />

      {/* Top Evidence Stat Cards (3-Study Academic Meta-Synthesis) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Stat 1: Academic Meta-Synthesis */}
        <SpotlightCard className="p-4 rounded-xl bg-[color:var(--panel-2)] border border-[color:var(--line)] hover:border-sky-500/40 dark:bg-[color:var(--surface-2)] dark:hover:border-sky-500/30 transition-[border-color,box-shadow] flex flex-col justify-between space-y-1 shadow-sm enter-pop">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-micro font-medium text-[color:var(--muted)] uppercase tracking-wider">
                {isAr ? 'تحليل مرجعي أكاديمي مجمّع' : 'Academic Meta-Synthesis'}
              </span>
              <Users className="w-4 h-4 text-[color:var(--info)] dark:text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-[color:var(--ink)] telemetry-mono mt-1 flex items-baseline gap-1">
              <NumberTicker value={3} /> <span className="text-xs font-normal text-[color:var(--muted)]">{isAr ? 'دراسات أكاديمية محكّمة' : 'Peer-Reviewed Studies'}</span>
            </div>
            <div className="text-micro text-[color:var(--ink-2)] font-normal mt-1 leading-relaxed">
              {isAr
                ? 'تحليل مرجعي مجمّع لـ 3 دراسات أكاديمية منشورة (EMHJ 2021 / Social Sciences 2025) لرصد دوافع الهجرة لدى الأطباء الشبان والكوادر الطبية في مصر.'
                : 'Reference meta-synthesis of 3 published academic studies (WHO EMHJ 2021 & Social Sciences 2025) analyzing emigration drivers among young Egyptian physicians and clinical trainees.'}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-[color:var(--line)] text-2xs text-[color:var(--muted)] font-medium">
            <span className="text-[color:var(--info)] dark:text-sky-400 font-semibold">{t.sourcePrefix || 'المصدر:'}</span> {isAr ? 'EMHJ 2021 / Social Sciences 2025' : 'WHO EMHJ 2021 / Social Sciences 2025'}
          </div>
        </SpotlightCard>

        {/* Stat 2: Stay Willingness */}
        <SpotlightCard style={{ animationDelay: '40ms' }} className="p-4 rounded-xl bg-[color:var(--panel-2)] border border-[color:var(--line)] hover:border-emerald-500/40 dark:bg-[color:var(--surface-2)] dark:hover:border-emerald-500/30 transition-[border-color,box-shadow] flex flex-col justify-between space-y-1 shadow-sm enter-pop">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-micro font-medium text-[color:var(--muted)] uppercase tracking-wider">
                {isAr ? 'الاستعداد للبقاء حال تحسين المنظومة' : 'Willingness to Stay (If Improved)'}
              </span>
              <HeartPulse className="w-4 h-4 text-[color:var(--ok)] dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-[color:var(--ok)] dark:text-emerald-400 telemetry-mono mt-1">
              <NumberTicker value={97.4} suffix="%" decimalPlaces={1} />
            </div>
            <div className="text-micro text-[color:var(--ink-2)] font-normal mt-1">
              {isAr ? 'من الأطباء المقيمين مستعدون للبقاء (الصحة العالمية)' : 'Of resident physicians ready to stay (WHO EMHJ)'}
            </div>
          </div>
          <a
            href={whoStudy?.pubmed || whoStudy?.doi || "https://pubmed.ncbi.nlm.nih.gov/34927710/"}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 pt-2 border-t border-[color:var(--line)] text-2xs text-[color:var(--ok)] dark:text-emerald-400/90 font-medium flex items-center justify-between hover:underline"
          >
            <span><span className="text-[color:var(--muted)]">{t.sourcePrefix || 'المصدر:'}</span> WHO EMHJ 2021 (n=885)</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </SpotlightCard>

        {/* Stat 3: Return Intent */}
        <SpotlightCard style={{ animationDelay: '80ms' }} className="p-4 rounded-xl bg-[color:var(--panel-2)] border border-[color:var(--line)] hover:border-amber-500/40 dark:bg-[color:var(--surface-2)] dark:hover:border-amber-500/30 transition-[border-color,box-shadow] flex flex-col justify-between space-y-1 shadow-sm enter-pop">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-micro font-medium text-[color:var(--muted)] uppercase tracking-wider">
                {isAr ? 'نية العودة لخدمة مصر بعد التدريب' : 'Intent to Return After Training'}
              </span>
              <TrendingUp className="w-4 h-4 text-[color:var(--warn)] dark:text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-[color:var(--warn)] dark:text-amber-400 telemetry-mono mt-1">
              <NumberTicker value={81.8} suffix="%" decimalPlaces={1} />
            </div>
            <div className="text-micro text-[color:var(--ink-2)] font-normal mt-1">
              {isAr ? 'رغبة وطنية للعودة بعلم متقدم (جامعة أكسفورد)' : 'Patriotic desire to return with expertise (Oxford)'}
            </div>
          </div>
          <a
            href={oxfordStudy?.pubmed || oxfordStudy?.doi || "https://pubmed.ncbi.nlm.nih.gov/25256738/"}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 pt-2 border-t border-[color:var(--line)] text-2xs text-[color:var(--warn)] dark:text-amber-400/90 font-medium flex items-center justify-between hover:underline"
          >
            <span><span className="text-[color:var(--muted)]">{t.sourcePrefix || 'المصدر:'}</span> Oxford Int Health 2015 (n=400)</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </SpotlightCard>

        {/* Stat 4: Dissatisfaction Multiplier */}
        <SpotlightCard style={{ animationDelay: '120ms' }} className="p-4 rounded-xl bg-[color:var(--panel-2)] border border-[color:var(--line)] hover:border-rose-500/40 dark:bg-[color:var(--surface-2)] dark:hover:border-rose-500/30 transition-[border-color,box-shadow] flex flex-col justify-between space-y-1 shadow-sm enter-pop">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-micro font-medium text-[color:var(--muted)] uppercase tracking-wider">
                {isAr ? 'تأثير بيئة العمل على الهجرة' : 'Work Dissatisfaction Impact'}
              </span>
              <ShieldAlert className="w-4 h-4 text-[color:var(--danger)] dark:text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-[color:var(--danger)] dark:text-rose-400 telemetry-mono mt-1 flex items-baseline gap-1">
              <NumberTicker value={20.0} suffix="×" decimalPlaces={1} /> <span className="text-xs font-normal text-[color:var(--muted)]">{isAr ? 'أرجحية (OR)' : 'Odds Ratio'}</span>
            </div>
            <div className="text-micro text-[color:var(--ink-2)] font-normal mt-1">
              {isAr ? 'تضاعف رغبة الهجرة لسوء بيئة العمل (MDPI 2025)' : 'Multiplied emigration intent from hospital distress'}
            </div>
          </div>
          <a
            href={mdpiStudy?.repec || mdpiStudy?.url || mdpiStudy?.doi || "https://ideas.repec.org/a/gam/jscscx/v14y2025i5p295-d1653586.html"}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 pt-2 border-t border-[color:var(--line)] text-2xs text-[color:var(--danger)] dark:text-rose-400/90 font-medium flex items-center justify-between hover:underline"
          >
            <span><span className="text-[color:var(--muted)]">{t.sourcePrefix || 'المصدر:'}</span> MDPI Soc Sci 2025 (n=450)</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </SpotlightCard>
      </div>

      {/* Main Observatory Grid: Working Conditions & CAPMAS Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Frontline Clinical Working Conditions (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Card: WHO Working Conditions Breakdown */}
          <SpotlightCard className="p-5 rounded-2xl bg-[color:var(--panel-2)] border border-[color:var(--line)] dark:bg-[color:var(--surface-2)] space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-sky-100 text-[color:var(--info)] border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20">
                  <FileCheck className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-semibold text-[color:var(--ink)]">
                  {isAr ? 'بيئة العمل الميدانية للأطباء (دراسة الصحة العالمية، n=885)' : 'Frontline Working Conditions (WHO EMHJ Cohort, n=885)'}
                </h3>
              </div>
              <span className="text-2xs text-[color:var(--muted)] telemetry-mono">
                EMHJ 2021;27(12)
              </span>
            </div>

            <p className="text-xs text-[color:var(--ink-2)] leading-relaxed font-normal">
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
                <span className="text-2xs text-[color:var(--muted)] block font-medium">
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
                <span className="text-2xs text-[color:var(--muted)] block font-medium">
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
                <span className="text-2xs text-[color:var(--muted)] block font-medium">
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
                <span className="text-2xs text-[color:var(--muted)] block font-medium">
                  {isAr ? 'المصدر: منظمة الصحة العالمية EMHJ 2021 وسجلات التعبئة والإحصاء 2024' : 'Source: WHO EMHJ 2021 & CAPMAS Health Census 2024'}
                </span>
              </div>

              <div className="space-y-0.5">
                <GlowProgressBar
                  value={52.8}
                  label={isAr ? 'الاضطرار للعمل بالقطاع الخاص لتأمين المعيشة:' : 'Forced Moonlighting in Private Sector:'}
                  valueText="52.8%"
                  gradientFrom="from-amber-500"
                  gradientTo="to-orange-500"
                  glowColor="shadow-amber-500/25"
                />
                <span className="text-2xs text-[color:var(--muted)] block font-medium">
                  {isAr ? 'المصدر: دراسة منظمة الصحة العالمية EMHJ 2021 (عينة 885 طبيباً)' : 'Source: WHO EMHJ 2021 (n=885 Egyptian MDs)'}
                </span>
              </div>

              <div className="space-y-0.5">
                <GlowProgressBar
                  value={87.2}
                  label={isAr ? 'الهجرة بحثاً عن زمالات وتدريب سريري وبحثي:' : 'Emigration to Access Postgraduate Training/Research:'}
                  valueText="87.2%"
                  gradientFrom="from-rose-500"
                  gradientTo="to-orange-500"
                  glowColor="shadow-rose-500/25"
                />
                <span className="text-2xs text-[color:var(--muted)] block font-medium">
                  {isAr ? 'المصدر: دراسة منظمة الصحة العالمية EMHJ 2021 (عينة 885 طبيباً)' : 'Source: WHO EMHJ 2021 (n=885 Egyptian MDs)'}
                </span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card: Actionable Policy Levers (Connecting Evidence to Solutions) */}
          <SpotlightCard className="p-5 rounded-2xl bg-[color:var(--panel-2)] border border-[color:var(--line)] dark:bg-[color:var(--surface-2)] space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-[color:var(--line)] mb-3">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-[color:var(--ok)] border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                <Scale className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-semibold text-[color:var(--ink)]">
                {isAr ? 'حزم السياسات المبنية على الأدلة لمعالجة دوافع الهجرة' : 'Evidence-Based Levers Addressing Root Emigration Drivers'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCUMENTED_MIGRATION_DRIVERS.slice(0, 4).map((driver) => (
                <div key={driver.id} className="p-3.5 rounded-xl bg-[color:var(--panel)] border border-[color:var(--line)] dark:bg-[color:var(--surface-2)] space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-micro font-semibold text-[color:var(--ink)]">
                      {isAr ? driver.ar : driver.en}
                    </span>
                  </div>
                  <div className="text-2xs text-[color:var(--danger)] dark:text-rose-300/90 font-medium">
                    {isAr ? `الشاهد الرصدي: ${driver.evidence_stat_ar}` : `Empirical Finding: ${driver.evidence_stat}`}
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[color:var(--ok-soft)] dark:bg-emerald-950/20 dark:border-emerald-800/30 dark:text-emerald-300 text-micro font-medium">
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
          <div className="p-5 rounded-2xl bg-[color:var(--panel-2)] border border-[color:var(--line)] dark:bg-[color:var(--surface-2)] space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[color:var(--line)] mb-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-sky-100 text-[color:var(--info)] border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20">
                  <Building2 className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-semibold text-[color:var(--ink)]">
                  {isAr ? 'التوزيع الإقليمي للكوادر (بيانات التعبئة والإحصاء)' : 'Regional Healthcare Capacity (CAPMAS Censuses)'}
                </h3>
              </div>
              <span className="text-2xs text-[color:var(--info)] dark:text-sky-300 telemetry-mono font-medium">
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
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-[color:var(--inverse-bg)] text-[color:var(--inverse-fg)] font-semibold shadow-sm'
                        : 'bg-[color:var(--panel)] text-[color:var(--ink-2)] hover:bg-[color:var(--panel-2)] border border-[color:var(--line)] dark:bg-[color:var(--surface-2)] dark:hover:bg-[color:var(--surface-3)] dark:hover:text-white'
                    }`}
                  >
                    {isAr ? g.name_ar : g.name_en}
                  </button>
                );
              })}
            </div>

            {/* Selected Governorate Profile using 21st.dev SpotlightCard */}
            <SpotlightCard className="p-4 rounded-xl bg-[color:var(--panel)] dark:bg-black/30 border border-[color:var(--line)] space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-[color:var(--line)] pb-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[color:var(--info)] dark:text-sky-400" />
                  <span className="text-xs font-semibold text-[color:var(--ink)]">
                    {isAr ? currentGov?.name_ar : currentGov?.name_en}
                  </span>
                </div>
                <span className="text-micro text-[color:var(--muted)] telemetry-mono">
                  {isAr
                    ? `${(currentGov?.demographics?.population / 1000000).toFixed(1)} مليون نسمة`
                    : `${(currentGov?.demographics?.population / 1000000).toFixed(1)}M citizens`}
                </span>
              </div>

              {/* Indicator: Physicians per 10k vs WHO Standard */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[color:var(--ink-2)]">
                    {isAr ? 'كثافة الأطباء (لكل 10 آلاف مواطن):' : 'Physicians per 10k population:'}
                  </span>
                  <span className={`font-bold telemetry-mono ${
                    (currentGov?.demographics?.physicians_per_10k || 0) < 10 ? 'text-[color:var(--danger)] dark:text-rose-400' : 'text-[color:var(--info)] dark:text-sky-300'
                  }`}>
                    {currentGov?.demographics?.physicians_per_10k || '-'} / 10k
                  </span>
                </div>
                <div className="flex items-center justify-between text-2xs text-[color:var(--muted)]">
                  <span>{isAr ? 'الحد الأدنى لمنظمة الصحة العالمية:' : 'WHO minimum threshold:'}</span>
                  <span className="text-[color:var(--ok)] dark:text-emerald-400/80 telemetry-mono">23.0 / 10k</span>
                </div>
                {/* Shortage visualization bar */}
                <div className="w-full h-1.5 rounded-full bg-[color:var(--line)] overflow-hidden mt-1">
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
              <div className="flex items-center justify-between text-xs border-t border-[color:var(--line)] pt-2">
                <span className="text-[color:var(--ink-2)]">
                  {isAr ? 'أسرة المستشفيات (لكل 10 آلاف مواطن):' : 'Hospital beds per 10k:'}
                </span>
                <span className="font-semibold text-[color:var(--ink)] telemetry-mono">
                  {currentGov?.demographics?.hospital_beds_per_10k || '-'} / 10k
                </span>
              </div>

              {/* Indicator: Facility Shortage Index (FSI) */}
              <div className="flex items-center justify-between text-xs border-t border-[color:var(--line)] pt-2">
                <span className="text-[color:var(--ink-2)]">
                  {isAr ? 'مؤشر عجز المنشآت الصحية (FSI):' : 'Facility Shortage Index (FSI):'}
                </span>
                <span className="font-semibold text-[color:var(--warn)] dark:text-amber-400 telemetry-mono">
                  {currentGov?.baseline_indices?.fsi || '-'} / 100
                </span>
              </div>

              {/* Indicator: Environmental Pressure Index (EPI) */}
              <div className="flex items-center justify-between text-xs border-t border-[color:var(--line)] pt-2">
                <span className="text-[color:var(--ink-2)]">
                  {isAr ? 'مؤشر الإجهاد البيئي والحراري (EPI):' : 'Environmental Pressure Index (EPI):'}
                </span>
                <span className="font-semibold text-[color:var(--danger)] dark:text-rose-400 telemetry-mono">
                  {currentGov?.baseline_indices?.epi || '-'} / 100
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
          <div className="p-5 rounded-2xl bg-[color:var(--panel-2)] border border-[color:var(--line)] dark:bg-[color:var(--surface-2)] space-y-3 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-[color:var(--line)] mb-1">
              <span className="p-1.5 rounded-lg bg-purple-100 text-purple-600 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
                <BookOpen className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-semibold text-[color:var(--ink)]">
                {isAr ? 'المراجع العلمية المحكمة وبيانات التعداد' : 'Peer-Reviewed Literature & Census Sources'}
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              {MIGRATION_RESEARCH_STUDIES.map(study => (
                <div
                  key={study.id}
                  className="p-2.5 rounded-lg bg-[color:var(--panel)] border border-[color:var(--line)] dark:bg-[color:var(--surface-2)] transition-colors shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2 text-[color:var(--ink)] font-medium">
                    <a
                      href={study.url || study.doi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[color:var(--info)] dark:hover:text-sky-400 hover:underline transition-colors flex items-center gap-1.5"
                    >
                      <span>{isAr ? study.journal_ar : study.journal_en} ({study.year})</span>
                    </a>
                    <div className="flex items-center gap-2 shrink-0">
                      {study.pubmed && (
                        <a
                          href={study.pubmed}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-2xs text-[color:var(--ok)] hover:text-[color:var(--ok)] dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold flex items-center gap-0.5 hover:underline"
                        >
                          <span>PubMed</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {study.researchgate && (
                        <a
                          href={study.researchgate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-2xs text-[color:var(--info)] font-medium flex items-center gap-0.5 hover:underline"
                        >
                          <span>ResearchGate</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <a
                        href={study.url || study.doi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xs text-[color:var(--info)] hover:text-[color:var(--info)] dark:text-sky-400 dark:hover:text-sky-300 font-medium flex items-center gap-0.5 hover:underline"
                      >
                        <span>{study.id === 'mdpi_societies_2025' ? (isAr ? 'المستودع الأكاديمي' : 'Open Access') : 'DOI'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <a
                    href={study.url || study.doi}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-micro text-[color:var(--muted)] mt-1 line-clamp-2 hover:text-[color:var(--ink-2)] dark:hover:text-white/80 block cursor-pointer transition-colors"
                  >
                    {study.citation}
                  </a>
                </div>
              ))}

              <div className="p-2.5 rounded-lg bg-[color:var(--panel)] border border-[color:var(--line)] dark:bg-[color:var(--surface-2)] text-[color:var(--ink-2)] shadow-xs">
                <span className="font-medium text-[color:var(--ink)] block">
                  {isAr
                    ? 'الجهاز المركزي للتعبئة العامة والإحصاء (CAPMAS)'
                    : 'Central Agency for Public Mobilization & Statistics (CAPMAS)'}
                </span>
                <span className="text-micro text-[color:var(--muted)] block mt-1">
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
