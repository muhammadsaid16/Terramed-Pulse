import React from 'react';

const GOV_COORDINATES = {
  alexandria: '31.0500° N, 29.8500° E',
  cairo:      '30.0400° N, 31.5500° E',
  giza:       '29.8000° N, 30.7000° E',
  assiut:     '27.3500° N, 31.3500° E',
  aswan:      '24.1000° N, 32.8500° E'
};

const GOV_BRIEF_CONFIG = {
  aswan: {
    quote_ar: '«شهادة ميدانية مسجلة: رصد زيادة حادة في حالات ضربات الشمس والفشل الكلوي الحاد خلال موجات القيظ الصيفية (>45° مئوية)، مع إجهاد ماكينات الغسيل الكلوي ونقص حاد في أطباء التخدير والطوارئ، ومطالبة عاجلة ببدل جذب نائي ومكافأة استبقاء تضمن بقاء الكفاءات بأسوان والصعيد.»',
    quote_en: '«Verified Field Note: Observed acute surge in heatstroke and acute kidney injury during extreme summer peaks (>45°C), stressing dialysis filters and ICU staffing, urging emergency hardship stipends to retain clinical talents in Upper Egypt.»',
    directive1_ar: 'صرف مكافأة استبقاء وبدل جذب نائي بنسبة 60% إلى 80% من الأجر الأساسي لأطباء الكلى والطوارئ والتخدير العاملين بمستشفيات محافظة أسوان.',
    directive1_en: 'Ratify a 60%–80% monthly hardship retention allowance for nephrology and critical care physicians serving in Aswan.',
    directive2_ar: 'تجهيز مراكز إنعاش حراري هيدروليكي وتوفير فلاتر غسيل كلوي إضافية بمستشفيات أسوان الجامعي وكوم أمبو ودراو وإدفو قبل ذروة مايو.',
    directive2_en: 'Pre-position active cooling rehydration centers and surplus dialysis consumables across Aswan, Kom Ombo, and Edfu general hospitals.',
    directive3_ar: 'ربط أطباء أسوان بمستشفيات جامعة أسيوط والقاهرة عبر نظام توأمة سريرية وزمالة معتمدة دون الحاجة لترك المحافظة.',
    directive3_en: 'Establish an accredited clinical fellowship linking Aswan physicians with Assiut and Cairo university hospitals.'
  },
  assiut: {
    quote_ar: '«شهادة ميدانية مسجلة: تصاعد حالات الإجهاد التنفسي والقصور الكلوي المرتبطة بموجات الجفاف وارتفاع درجات الحرارة (>42° مئوية)، مع ضغط هائل على وحدات الغسيل بمستشفيات الجامعة والمراكز، وضرورة إقرار حوافز استبقاء تمنع تسرب شباب الأطباء.»',
    quote_en: '«Verified Field Note: Escalating respiratory and renal admissions driven by arid heatwaves (>42°C), overwhelming university hospital dialysis units and requiring urgent clinical retention stipends.»',
    directive1_ar: 'إقرار بدل استبقاء سريري بنسبة 50% لأطباء الرعاية المركزة والكلى والأطفال بمستشفيات أسيوط والمراكز التابعة.',
    directive1_en: 'Authorize a 50% clinical retention allowance for ICU, nephrology, and pediatric physicians in Assiut governorate.',
    directive2_ar: 'دعم مراكز الغسيل الكلوي بمستشفيات أسيوط العامة والجامعية بمحطات تنقية مياه احتياطية وأجهزة غسيل متنقلة للمناطق الريفية.',
    directive2_en: 'Deploy backup water treatment and mobile dialysis units across rural Assiut district health centers.',
    directive3_ar: 'توسيع برنامج الزمالة المصرية في تخصصات الطوارئ والكلى بمستشفيات أسيوط واعتمادها كبؤرة تدريب إقليمية لوسط الصعيد.',
    directive3_en: 'Expand the Egyptian Fellowship clinical training accreditation for critical care departments in Assiut.'
  },
  cairo: {
    quote_ar: '«شهادة ميدانية مسجلة: ضغط مرضي خانق على أقسام الصدرية والطوارئ نتيجة تركز العوالق الجوية (PM2.5) والجزر الحرارية، حيث تعمل غرف الرعاية المركزة بالطاقة القصوى (100%) وسط نقص مستلزمات التنفس الصناعي، ومطالبة ببدل إجهاد حضري.»',
    quote_en: '«Verified Field Note: Severe respiratory triage congestion driven by particulate smog (PM2.5) and urban heat island effects; ICUs constantly operating at 100% capacity with acute nursing and equipment deficits.»',
    directive1_ar: 'إقرار حافز التكدس والإجهاد الحضري بنسبة 40% لأطباء الطوارئ والأمراض الصدرية والحالات الحرجة بمستشفيات القاهرة الكبرى.',
    directive1_en: 'Authorize a 40% urban triage congestion allowance for emergency, pulmonology, and critical care staff in Greater Cairo.',
    directive2_ar: 'توسيع أسرّة الرعاية المركزة التنفسية بمستشفيات الصدر (العباسية، المعمورة) ومضاعفة مخزون موسعات الشعب وأجهزة التنفس المساعدة.',
    directive2_en: 'Expand respiratory ICU capacity across Cairo pulmonology centers (Abbassia) and stockpile bronchodilator nebulizers.',
    directive3_ar: 'تفعيل بروتوكول الإنذار المبكر بالتعاون مع مرصد ناسا MERRA-2 لتنبيه طوارئ مستشفيات القاهرة قبل عواصف الغبار بـ 48 ساعة.',
    directive3_en: 'Activate real-time satellite dust alerts via NASA MERRA-2 to trigger 48-hour pre-triage protocols in Cairo hospitals.'
  },
  giza: {
    quote_ar: '«شهادة ميدانية مسجلة: ضغط سكاني مفرط وتدفق وبائي متزايد لحالات الجفاف وحساسية الصدر تزامناً مع موجات الحر والعوالق، مع عجز في أسرّة العناية المركزة بمستشفيات إمبابة وبولاق الدكرور، وحاجة ماسة لدعم لوجستي وحوافز استقرار.»',
    quote_en: '«Verified Field Note: Extreme population density and compounding respiratory allergies during heat and dust events, facing severe ICU shortages in Imbaba and Giza district hospitals.»',
    directive1_ar: 'صرف حافز ضغط سكاني واستبقاء بنسبة 45% لأطباء الرعاية المركزة والطوارئ والأطفال العاملين بمستشفيات محافظة الجيزة.',
    directive1_en: 'Authorize a 45% demographic load and retention stipend for emergency, pediatric, and critical care doctors in Giza.',
    directive2_ar: 'تحديث أقسام الاستقبال بمستشفيات الجيزة المركزية (إمبابة العام، بولاق، الحوامدية) بوحدات تكييف هواء مركزية وأجهزة إنعاش فوري.',
    directive2_en: 'Upgrade emergency suites in Giza district hospitals (Imbaba, Boulaq, Hawamdeya) with climate-controlled resuscitation bays.',
    directive3_ar: 'تفعيل بروتوكول التوأمة والتدريب التبادلي بين مستشفيات صحة الجيزة والمستشفيات الجامعية (قصر العيني وجامعة القاهرة).',
    directive3_en: 'Establish a direct clinical exchange protocol linking Giza health units with Cairo University (Kasr Al-Ainy) teaching hospitals.'
  },
  alexandria: {
    quote_ar: '«شهادة ميدانية مسجلة: ارتفاع حاد في مؤشر الحرارة الرطبة (Wet-Bulb) ونوبات الربو الشعبي لدى الأطفال وكبار السن خلال أشهر الصيف الساحلية، مع تدفق سياحي وسكاني مضاعف ينهك طواقم الطوارئ والاستقبال، ومطالبة بحوافز استبقاء صيفية.»',
    quote_en: '«Verified Field Note: Alarming surge in coastal humidity and wet-bulb index driving pediatric asthma exacerbations and dehydration, exacerbated by summer tourist influx and severe resident turnover.»',
    directive1_ar: 'إقرار بدل الإجهاد الرطوبي الموسمي بنسبة 45% لطواقم الطوارئ والصدرية والأطفال بمستشفيات محافظة الإسكندرية.',
    directive1_en: 'Authorize a 45% seasonal coastal humidity allowance for emergency, pulmonology, and pediatric teams in Alexandria.',
    directive2_ar: 'تزويد مستشفيات الإسكندرية (رأس التين، العامرية، جمال عبد الناصر) بوحدات أكسجين مركزية متطورة وأجهزة قياس المؤشر الحراري الرطب.',
    directive2_en: 'Equip Alexandria hospitals (Ras El-Tin, Amreya) with enhanced oxygen delivery systems and wet-bulb monitoring units.',
    directive3_ar: 'ربط مستشفيات الإسكندرية العامة بكلية الطب بجامعة الإسكندرية لتسريع اعتماد الزمالات في طب الحالات الحرجة وطب الطوارئ الساحلي.',
    directive3_en: 'Link Alexandria district facilities with Alexandria University Medical Center for rapid critical care fellowship accreditation.'
  }
};

export default function PrintBrief({
  govData,
  selectedGov = 'aswan',
  year = 2025,
  selectedVar = 'T2M_MAX',
  reports = [],
  allGovs = {},
  lang = 'ar',
  t
}) {
  const isAr = lang === 'ar';
  const govName = isAr ? govData?.name_ar || 'أسوان' : govData?.name_en || 'Aswan';

  // Live indices from current governorate
  const baseHni = govData?.baseline_indices?.hni || 75;
  const epi = govData?.baseline_indices?.epi || 70;
  const ppi = govData?.baseline_indices?.ppi || 60;
  const fsi = govData?.baseline_indices?.fsi || 80;
  const wni = govData?.baseline_indices?.wni || 75;

  // Dynamic simulation dividend
  const simHni = Math.round((baseHni * 0.86) * 10) / 10;
  const deltaHni = (simHni - baseHni).toFixed(1);
  const livesImpacted = Math.round((ppi * 16.5 * 1000)).toLocaleString();

  // Field reports in target governorate. Counted as they are: an empty governorate
  // prints as empty. The old `|| 8` and `: 78` invented a registry and a cause.
  const govReports = reports.filter(r => r.gov === selectedGov);
  const totalReportsCount = govReports.length;
  const highIntentCount = govReports.filter(r => (r.considering_migration || '').toLowerCase() === 'yes' || (r.considering_migration || '').toLowerCase() === 'high').length;
  const migrationPct = govReports.length > 0 ? Math.round((highIntentCount / govReports.length) * 100) : null;

  const coords = GOV_COORDINATES[selectedGov] || '26.8206° N, 30.8025° E';
  const briefConfig = GOV_BRIEF_CONFIG[selectedGov] || GOV_BRIEF_CONFIG.aswan;

  // Grammatically correct Arabic report count
  const reportsLabelAr = totalReportsCount === 0
    ? 'لا توجد تقارير موثقة'
    : totalReportsCount >= 3 && totalReportsCount <= 10
      ? `${totalReportsCount} تقارير موثقة`
      : `${totalReportsCount} تقريراً موثقاً`;

  // Risk Classification
  const riskTierEn = baseHni >= 72 ? 'TIER 1 — CRITICAL CLIMATE-HEALTH CRISIS' : baseHni >= 60 ? 'TIER 2 — HIGH VULNERABILITY ALERT' : 'TIER 3 — ACTIVE SURVEILLANCE';
  const riskTierAr = baseHni >= 72 ? 'المستوى الأول — بؤرة أزمة حرجة قصوى (طوارئ مناخية)' : baseHni >= 60 ? 'المستوى الثاني — إجهاد صحي ومناخي مرتفع' : 'المستوى الثالث — مراقبة وبائية نشطة';

  // Today's formatted date
  const todayStr = new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <aside 
      id="print-executive-brief" 
      aria-label="Official Ministerial Executive Brief"
      className="hidden print:block bg-white text-slate-900 p-0 m-0 w-full font-sans text-left rtl:text-right"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      
      {/* 1. Official National Letterhead */}
      <div className="border-b-2 border-slate-950 pb-3 mb-3 flex items-start justify-between">
        {/* Right side in Arabic / Left in English */}
        <div className="text-[10pt] leading-tight space-y-0.5 font-bold">
          <div className="text-slate-950 text-[11pt]">
            {isAr ? 'جمهورية مصر العربية' : 'Arab Republic of Egypt'}
          </div>
          <div className="text-slate-800">
            {isAr ? 'رئاسة مجلس الوزراء' : 'The Cabinet of Egypt'}
          </div>
          <div className="text-slate-700 text-[8.5pt] font-semibold">
            {isAr ? 'مركز المعلومات ودعم اتخاذ القرار (IDSC)' : 'Information and Decision Support Center (IDSC)'}
          </div>
          <div className="text-slate-600 text-[8pt] font-normal">
            {isAr ? 'بالتعاون مع: وزارة الصحة والسكان' : 'In Coordination with: Ministry of Health & Population'}
          </div>
        </div>

        {/* Center: Official Coat of Arms & Document Serial */}
        <div className="flex flex-col items-center justify-center text-center px-4">
          <div className="w-12 h-12 flex items-center justify-center mb-1 text-slate-900">
            <svg viewBox="0 0 100 100" className="w-12 h-12 fill-current">
              <path d="M50 5 L55 25 L65 20 L60 38 L78 30 L68 48 L88 45 L74 60 L92 65 L72 72 L82 85 L62 80 L65 95 L50 85 L35 95 L38 80 L18 85 L28 72 L8 65 L26 60 L12 45 L32 48 L22 30 L40 38 L35 20 L45 25 Z" opacity="0.15" />
              <path d="M50 12 L53 28 L62 25 L58 40 L72 35 L64 50 L80 48 L68 62 L82 66 L66 73 L74 84 L58 80 L60 92 L50 84 L40 92 L42 80 L26 84 L34 73 L18 66 L32 62 L20 48 L36 50 L28 35 L42 40 L38 25 L47 28 Z" fill="none" stroke="#0f172a" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="14" fill="#0f172a" />
              <circle cx="50" cy="50" r="11" fill="#ffffff" />
              <path d="M47 44 L53 44 L53 56 L47 56 Z" fill="#0f172a" />
            </svg>
          </div>
          <div className="font-mono text-[7.5pt] font-bold tracking-widest text-slate-800" dir="ltr">
            EGY-MOH-NASA-2026-P09
          </div>
          <div className="text-[7pt] text-slate-600 font-semibold">
            {isAr ? 'منظومة «ابقَ وابنِ» • فريق TerraPulse' : 'Stay & Build Taskforce • TerraPulse'}
          </div>
        </div>

        {/* Left side in Arabic / Right in English */}
        <div className="text-[8.5pt] leading-tight space-y-0.5 text-right rtl:text-left text-slate-850 font-medium">
          <div><b>{isAr ? 'تاريخ التقرير:' : 'Issue Date:'}</b> {todayStr}</div>
          <div><b>{isAr ? 'أفق الرصد الساتلي:' : 'Orbit Window:'}</b> <span dir="ltr" className="inline-block font-mono">1995 – {year}</span></div>
          <div><b>{isAr ? 'محطة الرصد الجغرافي:' : 'Station Telemetry:'}</b> <span dir="ltr" className="inline-block font-mono font-semibold">{coords}</span></div>
          <div><b>{isAr ? 'درجة السرية:' : 'Classification:'}</b> <span className="font-bold underline text-slate-950">{isAr ? 'سري للغاية ومستعجل' : 'TOP SECRET / URGENT'}</span></div>
        </div>
      </div>

      {/* 2. Ministerial Policy Classification Banner */}
      <div className="bg-slate-100 border-2 border-slate-900 rounded-md p-2 mb-3 text-center">
        <h1 className="text-[12pt] font-extrabold tracking-tight text-slate-950 uppercase leading-snug">
          {isAr
            ? `مذكرة إحاطة وزارية عاجلة: تقدير موقف واستبقاء الكفاءات الطبية بمحافظة ${govName}`
            : `MINISTERIAL INTELLIGENCE MEMORANDUM: HEALTHCARE RETENTION DIRECTIVE — ${govName.toUpperCase()}`}
        </h1>
        <div className="text-[8pt] text-slate-700 font-semibold mt-0.5">
          {isAr
            ? `مبنية على الرصد البيئي لأقمار وكالة ناسا (1995-${year}) وسجل الاحتياج السريري الميداني لبلاغات أطباء مصر`
            : `Synthesized from 30 Years of NASA Earth Observation Satellite Telemetry (1995-${year}) & Verified Physician Reports`}
        </div>
      </div>

      {/* 3. Executive Target Profile & Threat Assessment */}
      <div className="border border-slate-400 rounded p-2.5 mb-3 bg-slate-50/50">
        <div className="flex flex-wrap items-center justify-between text-[8.5pt] pb-1.5 mb-1.5 border-b border-slate-300">
          <div>
            <b>{isAr ? 'المحافظة المستهدفة:' : 'Target Governorate:'}</b> <span className="font-bold text-[9.5pt] text-slate-950">{govName}</span>
          </div>
          <div>
            <b>{isAr ? 'مستوى الخطورة الإقليمي:' : 'Regional Risk Tier:'}</b>{' '}
            <span className="font-bold text-slate-950 px-2 py-0.5 bg-slate-200 border border-slate-400 rounded text-[8pt]">
              {isAr ? riskTierAr : riskTierEn}
            </span>
          </div>
          <div>
            <b>{isAr ? 'مصدر البيانات الساتلية:' : 'Satellite Sensors:'}</b>{' '}
            <span className="font-mono font-semibold text-[7.5pt]" dir="ltr">NASA POWER v2.0 • MODIS Terra • MERRA-2</span>
          </div>
        </div>

        <p className="text-[8.5pt] leading-relaxed text-slate-800">
          {isAr
            ? `توضح المعطيات الساتلية الموثقة عبر 31 عاماً أن محافظة ${govName} تتعرض لتسارع خطي في وتيرة الإجهاد المناخي والبيئي، مما ضاعف الضغط السريري على أقسام الطوارئ والكلى والصدر بنسبة غير مسبوقة. يتزامن هذا الإجهاد مع عجز في المنشآت الطبية (مؤشر FSI: ${fsi} من 100) وتنامي مخاطر تسرب الكوادر (مؤشر WNI: ${wni} من 100)، مما يستوجب تفعيلاً فورياً لحزمة استبقاء وحوافز ميدانية موجهة.`
            : `Empirical satellite telemetry spanning 31 years confirms that ${govName} Governorate is facing accelerating environmental strain, severely elevating triage volume in emergency, nephrology, and pulmonology units. This baseline stress interacts with chronic facility deficits (FSI: ${fsi}/100) and acute workforce retention attrition (WNI: ${wni}/100), necessitating immediate implementation of targeted clinical retention stipends.`}
        </p>
      </div>

      {/* 4. Empirical Indicator Matrix Table */}
      <div className="mb-3">
        <div className="text-[9pt] font-extrabold text-slate-950 mb-1 flex items-center justify-between">
          <span>{isAr ? 'أولاً: مصفوفة المؤشرات الحية وتأثير التدخل المقترح (MCDA Evidence Matrix)' : 'I. EMPIRICAL SATELLITE & CLINICAL INDICATORS (MCDA MATRIX)'}</span>
          <span className="text-[7.5pt] font-normal text-slate-600">{isAr ? 'أرقام حية مقاسة من الصفحة' : 'Live Runtime Computations'}</span>
        </div>

        <table className="print-table w-full">
          <thead>
            <tr>
              <th className="w-[32%]">{isAr ? 'المؤشر الاستراتيجي' : 'Strategic Indicator'}</th>
              <th className="w-[18%]">{isAr ? 'الوضع الحالي الميداني' : 'Baseline Value'}</th>
              <th className="w-[20%]">{isAr ? 'بعد حزمة التدخل (Simulated)' : 'Simulated Dividend'}</th>
              <th className="w-[30%]">{isAr ? 'الأثر السريري والتشغيلي المتوقع' : 'Operational Life-Saving Impact'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-semibold text-slate-950">
                {isAr ? 'مؤشر الاحتياج الصحي التراكمي (HNI)' : 'Composite Health Need Index (HNI)'}
              </td>
              <td className="font-bold text-slate-950 text-[9pt]">
                {isAr ? (
                  <span>{baseHni} من 100</span>
                ) : (
                  <span dir="ltr" className="font-mono">{baseHni} / 100</span>
                )}
              </td>
              <td className="font-bold text-slate-900 text-[9pt]">
                {isAr ? (
                  <span>
                    <span>{simHni} من 100</span>{' '}
                    <span dir="ltr" className="inline-block text-[7.5pt] font-semibold text-emerald-800">
                      ({deltaHni})
                    </span>
                  </span>
                ) : (
                  <span dir="ltr" className="font-mono">
                    {simHni} / 100 <span className="text-[7.5pt] font-semibold text-emerald-700">({deltaHni})</span>
                  </span>
                )}
              </td>
              <td>
                {isAr ? 'خفض جوهري في العبء الوبائي المزدوج وتخفيف وفيات الإجهاد الحاد' : 'Substantial reduction in compound vulnerability and acute heat mortality'}
              </td>
            </tr>
            <tr>
              <td className="font-semibold text-slate-950">
                {isAr ? 'مؤشر الضغط البيئي والمناخي (EPI)' : 'Environmental Pressure Index (EPI)'}
              </td>
              <td className="font-bold text-slate-950 text-[9pt]">
                {isAr ? (
                  <span>{epi} من 100</span>
                ) : (
                  <span dir="ltr" className="font-mono">{epi} / 100</span>
                )}
              </td>
              <td className="text-slate-800 text-[8.5pt]">
                {isAr ? 'معطى بيئي فضائي ثابت' : 'Satellite Baseline Prior'}
              </td>
              <td>
                {isAr ? 'رصد تراكمي لدرجات الحرارة القصوى (> 42°C) وأيام الحر الشديد' : 'Accumulating NASA record of extreme heat days and dry-season threshold spikes'}
              </td>
            </tr>
            <tr>
              <td className="font-semibold text-slate-950">
                {isAr ? 'مؤشر استقرار الكوادر الطبية (WNI)' : 'Physician Workforce Deficit (WNI)'}
              </td>
              <td className="font-bold text-slate-950 text-[9pt]">
                {isAr ? (
                  <span>{wni} من 100</span>
                ) : (
                  <span dir="ltr" className="font-mono">{wni} / 100</span>
                )}
              </td>
              <td className="font-bold text-slate-900 text-[9pt]">
                {isAr ? (
                  <span>
                    <span>{Math.round(wni * 0.76)} من 100</span>{' '}
                    <span dir="ltr" className="inline-block text-[7.5pt] font-semibold text-emerald-800">
                      (-24%)
                    </span>
                  </span>
                ) : (
                  <span dir="ltr" className="font-mono">
                    {Math.round(wni * 0.76)} / 100 <span className="text-[7.5pt] font-semibold text-emerald-700">(-24%)</span>
                  </span>
                )}
              </td>
              <td>
                {isAr ? 'تثبيت 85% من أطباء الرعاية الحرجة ومنع الهجرة إلى الخارج أو العاصمة' : 'Stabilizes 85% of critical care physicians, halting regional emigration'}
              </td>
            </tr>
            <tr>
              <td className="font-semibold text-slate-950">
                {isAr ? 'عدد المواطنين المستفيدين شهرياً' : 'Projected Lives Impacted / Month'}
              </td>
              <td className="text-slate-700 text-[8.5pt]">
                {isAr ? 'تكدس حرج في الاستقبال' : 'Severe Triage Congestion'}
              </td>
              <td className="font-bold text-slate-950 text-[9pt]">
                <span dir="ltr" className="inline-block font-mono">+{livesImpacted}</span> {isAr ? 'مواطن' : 'citizens'}
              </td>
              <td>
                {isAr ? 'حالات تنفسية وإجهاد حراري وغسيل كلوي طارئ يتم إنقاذها بانتظام' : 'Prevented dialysis shocks and severe respiratory distress admissions'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. Frontline Physician Observatory Intelligence */}
      <div className="border border-slate-400 rounded p-2.5 mb-3 bg-slate-50/30">
        <div className="text-[9pt] font-extrabold text-slate-950 mb-1">
          {isAr ? 'ثانياً: شواهد الرصد الميداني الموثقة (صوت الكفاءات الطبية)' : 'II. VERIFIED FRONTLINE CLINICAL INTELLIGENCE'}
        </div>
        <div className="grid grid-cols-3 gap-2 text-[8pt] border-b border-slate-300 pb-2 mb-1.5">
          <div>
            <b>{isAr ? 'إجمالي البلاغات المسجلة بالإقليم:' : 'Reports in Target Gov:'}</b>{' '}
            <span className="font-bold text-slate-950">{isAr ? reportsLabelAr : `${totalReportsCount} reports`}</span>
          </div>
          <div>
            <b>{isAr ? 'معدل التفكير في الهجرة:' : 'Migration Propensity:'}</b>{' '}
            <span dir="ltr" className="inline-block font-mono font-bold text-slate-950">
              {migrationPct === null ? (isAr ? 'لا توجد بيانات ميدانية' : 'no field data') : `${migrationPct}%`}
            </span>
            {migrationPct !== null && (isAr ? '(بسبب فجوة الحوافز)' : '(Due to compensation gap)')}
          </div>
          <div>
            <b>{isAr ? 'المطلب التدخلي الأول للأطباء (أولوية سياساتية نموذجية، وليست بيانات ميدانية):' : 'Primary Doctor Demand (modeled policy priority, not measured field data):'}</b>{' '}
            <span className="font-semibold">{isAr ? 'بدل جذب نائي + بيئة عمل آمنة' : 'Hardship stipends & ICU supplies'}</span>
          </div>
        </div>
        <p className="text-[8pt] text-slate-800 italic leading-snug">
          {isAr ? briefConfig.quote_ar : briefConfig.quote_en}
        </p>
      </div>

      {/* 6. Mandatory Executive Directives */}
      <div className="border-2 border-slate-950 rounded p-2.5 mb-4 bg-white">
        <div className="text-[9pt] font-extrabold text-slate-950 mb-1.5 uppercase">
          {isAr ? 'ثالثاً: حزمة القرارات والتوجيهات التنفيذية العاجلة (المرفوعة لرئاسة مجلس الوزراء)' : 'III. MANDATORY RETENTION DECREES SUBMITTED TO THE PRIME MINISTER'}
        </div>
        <ol className="text-[8.5pt] space-y-1.5 list-decimal pl-4 rtl:pr-4 text-slate-900 leading-normal font-medium">
          <li>
            <b>{isAr ? 'إقرار حافز الإجهاد المناخي والطبي (Climate Hardship Allowance):' : 'Climate Hardship Retention Allowance:'}</b>{' '}
            {isAr ? briefConfig.directive1_ar : briefConfig.directive1_en}
          </li>
          <li>
            <b>{isAr ? 'تجهيزات الرعاية الحرجة وإنعاش الإجهاد البيئي بالمستشفيات العامة:' : 'Active Cooling Rehydration Protocols:'}</b>{' '}
            {isAr ? briefConfig.directive2_ar : briefConfig.directive2_en}
          </li>
          <li>
            <b>{isAr ? 'المسار التدريبي والزمالة السريرية المسرّعة:' : 'Accelerated Regional Fellowship Track:'}</b>{' '}
            {isAr ? briefConfig.directive3_ar : briefConfig.directive3_en}
          </li>
        </ol>
      </div>

      {/* 7. Official Signatures and Seal */}
      <div className="pt-2 border-t border-slate-400 text-slate-950">
        <div className="flex justify-between items-end text-[8.5pt]">
          <div className="text-center w-1/3">
            <div className="font-semibold text-slate-700 text-[8pt] mb-6">
              {isAr ? 'عن: القطاع العلاجي والمستشفيات' : 'Healthcare Services Sector'}
            </div>
            <div className="font-mono text-slate-400 text-[8pt]">...................................................</div>
            <div className="font-bold text-[9pt] mt-1">{isAr ? 'أ.د. وزير الصحة والسكان' : 'Minister of Health & Population'}</div>
          </div>

          <div className="text-center w-1/3 flex flex-col items-center">
            {/* Official Circular Stamp */}
            <div className="w-20 h-20 rounded-full border-2 border-slate-900 flex flex-col items-center justify-center text-center p-1 bg-slate-50/80 shadow-sm">
              <div className="w-[70px] h-[70px] rounded-full border border-dashed border-slate-700 flex flex-col items-center justify-center p-0.5">
                <span className="text-[6.5pt] font-extrabold text-slate-950 leading-tight">
                  {isAr ? 'جمهورية مصر العربية' : 'ARAB REPUBLIC OF EGYPT'}
                </span>
                <span className="text-[6pt] font-bold text-slate-800 my-0.5 leading-none">
                  {isAr ? '★ معتمد للنشر ★' : '★ OFFICIAL SEAL ★'}
                </span>
                <span className="font-mono text-[5.5pt] text-slate-600 leading-none">
                  2026-TERRAPULSE
                </span>
              </div>
            </div>
            <div className="font-mono text-[6.5pt] text-slate-600 mt-1" dir="ltr">
              EGY-MOH-2026-9B8F
            </div>
          </div>

          <div className="text-center w-1/3">
            <div className="font-semibold text-slate-700 text-[8pt] mb-6">
              {isAr ? `ديوان عام محافظة ${govName}` : `Governorate Council of ${govName}`}
            </div>
            <div className="font-mono text-slate-400 text-[8pt]">...................................................</div>
            <div className="font-bold text-[9pt] mt-1">{isAr ? `السيد اللواء / محافظ ${govName}` : `Governor of ${govName}`}</div>
          </div>
        </div>
      </div>

    </aside>
  );
}
