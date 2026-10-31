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
      <div className="border-b border-white/[0.08] pb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Stethoscope className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
              {t?.module3Title || (isAr ? 'الوحدة 3: مرصد القوى البشرية الصحية واستبقاء الأطباء' : 'Module 3: Healthcare Workforce & Physician Retention Observatory')}
            </h2>
          </div>
          <p className="text-xs text-white/60 font-normal max-w-3xl leading-relaxed">
            {t?.module3Subtitle || (isAr
              ? 'تحليل تجريبي محكّم لدراسات هجرة الأطباء (منظمة الصحة العالمية، جامعة أكسفورد، MDPI) ومؤشرات التوزيع الجغرافي للجهاز المركزي للتعبئة العامة والإحصاء — مبني بنسبة 100% على بيانات رصدية موثقة ودراسات سريرية منشورة.'
              : 'Empirical synthesis of peer-reviewed physician migration cohorts (WHO EMHJ, Oxford University Press, MDPI) and CAPMAS healthcare capacity benchmarks — 100% founded on published empirical cohorts and official census records.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="satellite-chip text-emerald-300 bg-emerald-950/40 border-emerald-800/40 text-[11px] font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'بيانات محكّمة وتعداد رسمي 100%' : '100% Empirical & Official Censuses'}</span>
          </span>
        </div>
      </div>

      {/* Top Evidence Stat Cards (Synthesis of 1,735 Egyptian Physicians) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Stat 1: Total Cohort */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-sky-500/30 transition-all space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
              {isAr ? 'إجمالي عينة الأطباء المستطلعة' : 'Surveyed Physician Cohort'}
            </span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white telemetry-mono">
            1,735 <span className="text-xs font-normal text-white/50">{isAr ? 'طبيباً مصرياً' : 'MDs in Egypt'}</span>
          </div>
          <div className="text-[11px] text-sky-400/90 font-medium flex items-center gap-1">
            <span>WHO ($n=885$) + Oxford ($400$) + MDPI ($450$)</span>
          </div>
        </div>

        {/* Stat 2: Stay Willingness */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 transition-all space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
              {isAr ? 'الاستعداد للبقاء حال تحسين المنظومة' : 'Willingness to Stay (If Improved)'}
            </span>
            <HeartPulse className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 telemetry-mono">
            97.4%
          </div>
          <div className="text-[11px] text-white/60 font-normal">
            {isAr ? 'من الأطباء المقيمين مستعدون للبقاء (الصحة العالمية)' : 'Of resident physicians ready to stay (WHO EMHJ)'}
          </div>
        </div>

        {/* Stat 3: Return Intent */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/30 transition-all space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
              {isAr ? 'نية العودة لخدمة مصر بعد التدريب' : 'Intent to Return After Training'}
            </span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 telemetry-mono">
            81.8%
          </div>
          <div className="text-[11px] text-white/60 font-normal">
            {isAr ? 'رغبة وطنية للعودة بعلم متقدم (جامعة أكسفورد)' : 'Patriotic desire to return with expertise (Oxford)'}
          </div>
        </div>

        {/* Stat 4: Dissatisfaction Multiplier */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/30 transition-all space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
              {isAr ? 'تأثير بيئة العمل على الهجرة' : 'Work Dissatisfaction Impact'}
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 telemetry-mono">
            20.0× <span className="text-xs font-normal text-white/50">{isAr ? 'أرجحية (OR)' : 'Odds Ratio'}</span>
          </div>
          <div className="text-[11px] text-white/60 font-normal">
            {isAr ? 'تضاعف رغبة الهجرة لسوء بيئة العمل (MDPI 2025)' : 'Multiplied emigration intent from hospital distress'}
          </div>
        </div>

      </div>

      {/* Main Observatory Grid: Working Conditions & CAPMAS Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Frontline Clinical Working Conditions (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Card: WHO Working Conditions Breakdown */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <FileCheck className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-semibold text-white">
                  {isAr ? 'بيئة العمل الميدانية للأطباء (دراسة الصحة العالمية، n=885)' : 'Frontline Working Conditions (WHO EMHJ Cohort, n=885)'}
                </h3>
              </div>
              <span className="text-[10px] text-white/40 telemetry-mono">
                EMHJ 2021;27(12)
              </span>
            </div>

            <p className="text-xs text-white/70 leading-relaxed font-normal">
              {isAr
                ? 'تكشف البيانات الرصدية المحكّمة أن رغبة الأطباء في الهجرة ليست رفضاً للوطن، بل ناتجة عن ضغوط بيئة عمل قاسية يمكن علاجها بقرارات سياساتية محددة:'
                : 'Empirical data demonstrates that physician emigration intent is not a rejection of their country, but a direct consequence of severe working conditions that actionable policy can remediate:'}
            </p>

            {/* Metrics Breakdown Bars */}
            <div className="space-y-3 pt-1">
              
              {/* Item 1: Salary Satisfaction */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80 font-medium">
                    {isAr ? 'الرضا عن الرواتب والأجور المقابلة للمخاطر:' : 'Satisfaction with Salary & Risk Compensation:'}
                  </span>
                  <span className="font-semibold text-rose-400 telemetry-mono">
                    1.0% {isAr ? '(99% غير راضين)' : '(99% dissatisfied)'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '1%' }} />
                </div>
              </div>

              {/* Item 2: Physical Assaults in Hospitals */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80 font-medium">
                    {isAr ? 'التعرض لاعتداء جسدي مباشر أثناء العمل:' : 'Experienced Direct Physical Assault on Duty:'}
                  </span>
                  <span className="font-semibold text-rose-400 telemetry-mono">
                    35.4%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '35.4%' }} />
                </div>
              </div>

              {/* Item 3: Verbal Abuse */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80 font-medium">
                    {isAr ? 'التعرض للسب والإهانة اللفظية بالمنشأة:' : 'Experienced Verbal Abuse in Facility:'}
                  </span>
                  <span className="font-semibold text-amber-400 telemetry-mono">
                    55.5%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '55.5%' }} />
                </div>
              </div>

              {/* Item 4: Medical Supplies Adequacy */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80 font-medium">
                    {isAr ? 'توفر أجهزة ومستلزمات طبية كافية بالاستقبال:' : 'Adequate Medical Supplies & Consumables:'}
                  </span>
                  <span className="font-semibold text-sky-400 telemetry-mono">
                    19.3% {isAr ? '(80.7% عجز مستلزمات)' : '(80.7% deficit)'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: '19.3%' }} />
                </div>
              </div>

              {/* Item 5: Moonlighting in Private Sector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80 font-medium">
                    {isAr ? 'الاضطرار للعمل بالقطاع الخاص لتأمين المعيشة:' : 'Forced Moonlighting in Private Sector:'}
                  </span>
                  <span className="font-semibold text-purple-400 telemetry-mono">
                    52.8%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '52.8%' }} />
                </div>
              </div>

              {/* Item 6: Research Opportunities Seeking */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80 font-medium">
                    {isAr ? 'الهجرة بحثاً عن زمالات وتدريب سريري وبحثي:' : 'Emigration to Access Postgraduate Training/Research:'}
                  </span>
                  <span className="font-semibold text-emerald-400 telemetry-mono">
                    87.2%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '87.2%' }} />
                </div>
              </div>

            </div>
          </div>

          {/* Card: Actionable Policy Levers (Connecting Evidence to Solutions) */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Scale className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-semibold text-white">
                {isAr ? 'حزم السياسات المبنية على الأدلة لمعالجة دوافع الهجرة' : 'Evidence-Based Levers Addressing Root Emigration Drivers'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCUMENTED_MIGRATION_DRIVERS.slice(0, 4).map((driver) => (
                <div key={driver.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white/90">
                      {isAr ? driver.ar : driver.en}
                    </span>
                  </div>
                  <div className="text-[10px] text-rose-300/90 font-medium">
                    {isAr ? `الشاهد الرصدي: ${driver.evidence_stat_ar}` : `Empirical Finding: ${driver.evidence_stat}`}
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-[11px] text-emerald-300 font-medium">
                    {isAr ? `الحل الموصى به: ${driver.policy_lever_ar}` : `Actionable Lever: ${driver.policy_lever}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: CAPMAS Regional Healthcare Capacity & Studies (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Card: CAPMAS Regional Healthcare Density */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Building2 className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-semibold text-white">
                  {isAr ? 'التوزيع الإقليمي للكوادر (بيانات التعبئة والإحصاء)' : 'Regional Healthcare Capacity (CAPMAS Censuses)'}
                </h3>
              </div>
              <span className="text-[10px] text-white/40 telemetry-mono">
                CAPMAS 2024
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
                        ? 'bg-sky-500 text-black font-semibold shadow-lg shadow-sky-500/20'
                        : 'bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    {isAr ? g.name_ar : g.name_en}
                  </button>
                );
              })}
            </div>

            {/* Selected Governorate Profile */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-xs font-semibold text-white">
                    {isAr ? currentGov?.name_ar : currentGov?.name_en}
                  </span>
                </div>
                <span className="text-[11px] text-white/50 telemetry-mono">
                  {isAr
                    ? `${(currentGov?.demographics?.population / 1000000).toFixed(1)} مليون نسمة`
                    : `${(currentGov?.demographics?.population / 1000000).toFixed(1)}M citizens`}
                </span>
              </div>

              {/* Indicator: Physicians per 10k vs WHO Standard */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70">
                    {isAr ? 'كثافة الأطباء (لكل 10 آلاف مواطن):' : 'Physicians per 10k population:'}
                  </span>
                  <span className={`font-bold telemetry-mono ${
                    (currentGov?.demographics?.physicians_per_10k || 0) < 10 ? 'text-rose-400' : 'text-sky-300'
                  }`}>
                    {currentGov?.demographics?.physicians_per_10k || '—'} / 10k
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/40">
                  <span>{isAr ? 'الحد الأدنى لمنظمة الصحة العالمية:' : 'WHO minimum threshold:'}</span>
                  <span className="text-emerald-400/80 telemetry-mono">23.0 / 10k</span>
                </div>
                {/* Shortage visualization bar */}
                <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full ${
                      (currentGov?.demographics?.physicians_per_10k || 0) < 10 ? 'bg-rose-500' : 'bg-sky-400'
                    }`}
                    style={{
                      width: `${Math.min(100, ((currentGov?.demographics?.physicians_per_10k || 0) / 23.0) * 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Indicator: Hospital Beds per 10k */}
              <div className="flex items-center justify-between text-xs border-t border-white/[0.04] pt-2">
                <span className="text-white/70">
                  {isAr ? 'أسرة المستشفيات (لكل 10 آلاف مواطن):' : 'Hospital beds per 10k:'}
                </span>
                <span className="font-semibold text-white telemetry-mono">
                  {currentGov?.demographics?.hospital_beds_per_10k || '—'} / 10k
                </span>
              </div>

              {/* Indicator: Facility Shortage Index (FSI) */}
              <div className="flex items-center justify-between text-xs border-t border-white/[0.04] pt-2">
                <span className="text-white/70">
                  {isAr ? 'مؤشر عجز المنشآت الصحية (FSI):' : 'Facility Shortage Index (FSI):'}
                </span>
                <span className="font-semibold text-amber-400 telemetry-mono">
                  {currentGov?.baseline_indices?.fsi || '—'} / 100
                </span>
              </div>

              {/* Indicator: Environmental Pressure Index (EPI) */}
              <div className="flex items-center justify-between text-xs border-t border-white/[0.04] pt-2">
                <span className="text-white/70">
                  {isAr ? 'مؤشر الإجهاد البيئي والحراري (EPI):' : 'Environmental Pressure Index (EPI):'}
                </span>
                <span className="font-semibold text-rose-400 telemetry-mono">
                  {currentGov?.baseline_indices?.epi || '—'} / 100
                </span>
              </div>

            </div>

            {/* Regional Contrast Callout */}
            <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-800/30 text-xs text-sky-200/90 leading-relaxed">
              <span className="font-semibold block mb-1">
                {isAr ? 'فجوة التوزيع الجغرافي العادلة:' : 'Geographic Disparity Insight:'}
              </span>
              {isAr
                ? 'تكشف سجلات التعبئة والإحصاء أن القاهرة تضم 16.5 طبيباً لكل 10 آلاف مواطن، بينما تنحدر الكثافة في أسوان إلى 5.4 طبيباً فقط لكل 10 آلاف مواطن، رغم أنها الأكثر تعرضاً لموجات الإجهاد الحراري وأمراض الكلى والجفاف، مما يبرز أهمية حوافز الاستبقاء الإقليمية.'
                : 'Official census records show Cairo has 16.5 physicians per 10k residents, whereas Aswan drops to only 5.4 per 10k despite bearing Egypt’s highest heatwave and renal stress burden, underscoring the necessity of location-based retention stipends.'}
            </div>
          </div>

          {/* Card: Peer-Reviewed Scientific References */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <BookOpen className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-semibold text-white">
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
                  className="block p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-all group"
                >
                  <div className="flex items-center justify-between text-white/90 group-hover:text-sky-300 font-medium">
                    <span>{isAr ? study.journal_ar : study.journal_en} ({study.year})</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 shrink-0" />
                  </div>
                  <div className="text-[11px] text-white/50 mt-1 line-clamp-2">
                    {study.citation}
                  </div>
                </a>
              ))}

              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-white/70">
                <span className="font-medium text-white/90 block">
                  {isAr
                    ? 'الجهاز المركزي للتعبئة العامة والإحصاء (CAPMAS)'
                    : 'Central Agency for Public Mobilization & Statistics (CAPMAS)'}
                </span>
                <span className="text-[11px] text-white/50 block mt-1">
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
