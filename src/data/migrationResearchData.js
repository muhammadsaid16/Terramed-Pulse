/**
 * TerraPulse: Stay & Build Egypt — Peer-Reviewed Physician Migration Evidence
 * 
 * Sourced directly from published scientific literature on Egyptian medical brain drain:
 * 1. Kabbash et al. (WHO Eastern Mediterranean Health Journal, 2021)
 * 2. Fouad, Fahmy, Abdel Hady, Elsabagh (International Health / Oxford University Press, 2015)
 * 3. Ismail & Chun (MDPI Societies / Social Sciences, 2025)
 * 
 * Used across the Policy Lab and Decision Support system to replace speculative guesswork
 * with verified empirical evidence.
 */

export const MIGRATION_RESEARCH_STUDIES = [
  {
    id: "who_emhj_2021",
    citation: "Kabbash I, El-Sallamy R, Zayed H, Alkhyate I, Omar A, Abdo S. The brain drain: why medical students and young physicians want to leave Egypt. East Mediterr Health J. 2021;27(12):1195–1202.",
    doi: "https://doi.org/10.26719/emhj.21.050",
    journal: "WHO Eastern Mediterranean Health Journal (EMHJ)",
    journal_en: "WHO Eastern Mediterranean Health Journal (EMHJ)",
    journal_ar: "المجلة الصحية لشرق المتوسط (منظمة الصحة العالمية)",
    year: 2021,
    cohort: "Medical students (5th & 6th year) and junior resident physicians (Tanta and Kafr El-Sheikh University Hospitals)",
    cohort_en: "Medical students (5th & 6th year) and junior resident physicians (Tanta and Kafr El-Sheikh University Hospitals)",
    cohort_ar: "طلاب كليات الطب (السنوات النهائية) والأطباء المقيمون (مستشفيات طنطا وكفر الشيخ الجامعية)",
    sample_size: 885,
    key_findings: {
      migration_intent_pct: 89.4,
      retention_willingness_if_improved_pct: 97.4, // Residents willing to stay if health sector improves
      students_willingness_to_stay_pct: 82.1,
      salary_satisfaction_pct: 1.0,
      salary_perceived_risk_appropriate_pct: 6.0,
      moonlighting_in_private_sector_pct: 52.8,
      societal_appreciation_felt_pct: 38.5,
      country_appreciation_felt_pct: 4.9,
      verbal_abuse_experienced_pct: 55.5,
      physical_assault_experienced_pct: 35.4,
      workplace_felt_safe_pct: 48.8,
      medical_supplies_adequate_pct: 19.3,
      emigration_for_research_opportunities_pct: 87.2
    },
    narrative_en: "89.4% of surveyed young physicians and medical students considered emigration. Critically, 97.4% of resident doctors declared they would reverse their decision to leave if health sector working conditions, safety, and compensation improved.",
    narrative_ar: "89.4% من شباب الأطباء وطلاب الطب فكروا في الهجرة. لكن النتيجة الأهم هي أن 97.4% من الأطباء المقيمين مستعدون لتغيير قرارهم والبقاء في مصر إذا تحسنت بيئة العمل والأمان ومنظومة الأجور في القطاع الصحي."
  },
  {
    id: "oxford_int_health_2015",
    citation: "Fouad YA, Fahmy YM, Abdel Hady SM, Elsabagh AE. Egyptian future physicians are packing to leave but may be willing to return. Int Health. 2015;7(3):190–194.",
    doi: "https://doi.org/10.1093/inthealth/ihu082",
    journal: "International Health (Oxford University Press / Royal Society of Tropical Medicine)",
    journal_en: "International Health (Oxford University Press)",
    journal_ar: "مجلة الصحة الدولية (جامعة أكسفورد)",
    year: 2015,
    cohort: "Medical students at Ain Shams University Faculty of Medicine",
    cohort_en: "Medical students at Ain Shams University Faculty of Medicine",
    cohort_ar: "طلاب السنوات النهائية بكلية الطب بجامعة عين شمس",
    sample_size: 400,
    key_findings: {
      migration_intent_pct: 85.7,
      plan_to_return_after_training_pct: 81.8,
      primary_pull_factor: "Belonging, family ties, and patriotic desire to serve the home country (Stay & Build)",
      primary_push_factor: "Seeking high-standard postgraduate clinical training and scientific research infrastructure"
    },
    narrative_en: "85.7% intended to pursue postgraduate medical training abroad, yet 81.8% explicitly intended to return to Egypt to serve their home country, demonstrating that strategic retention policies can harness circular migration.",
    narrative_ar: "أعرب 85.7% عن نيتهم السفر لتلقي تدريب طبي متقدم بالخارج، ومع ذلك أكد 81.8% منهم عزمهم العودة لخدمة مصر بعد انتهاء التدريب، مما يثبت أن الدافع الوطني والانتماء يمثلان الركيزة الأساسية لاستراتيجية 'ابقَ وابنِ'."
  },
  {
    id: "mdpi_societies_2025",
    citation: "Ismail HA, Chun S. The Brain Drain of Egyptian Physicians and Its Driving Factors: A Cross-Sectional Study. Soc Sci. 2025;14(5):295.",
    doi: "https://doi.org/10.3390/soc14050295",
    journal: "MDPI Social Sciences",
    journal_en: "MDPI Social Sciences",
    journal_ar: "مجلة العلوم الاجتماعية (MDPI)",
    year: 2025,
    cohort: "Actively practicing Egyptian physicians living and working in Egypt",
    cohort_en: "Actively practicing Egyptian physicians living and working in Egypt",
    cohort_ar: "أطباء ممارسون مصريون يعملون فعلياً داخل مستشفيات ووحدات مصر الصحية",
    sample_size: 450,
    key_findings: {
      active_migration_intent_pct: 66.4,
      work_dissatisfaction_odds_ratio: 20.0, // 20 times more likely to emigrate with low work satisfaction
      younger_physicians_vulnerability: "Statistically significant higher migration propensity among younger junior doctors and lower economic status"
    },
    narrative_en: "66.4% of actively practicing physicians reported considering working abroad. Workplace dissatisfaction was the dominant predictive factor: physicians dissatisfied with hospital conditions were 20 times more likely to seek emigration.",
    narrative_ar: "أكد 66.4% من الأطباء الممارسين في مصر تفكيرهم الفعلي بالعمل خارج البلاد. وكان عدم الرضا عن بيئة العمل في المستشفيات العامل الحاسم الأول، حيث زاد احتمال الرغبة في الهجرة بمقدار 20 ضعفاً لدى الأطباء غير الراضين عن بيئة العمل."
  }
];

/** Core synthesized migration drivers for the decision-support system */
export const DOCUMENTED_MIGRATION_DRIVERS = [
  {
    id: "financial",
    en: "Financial Compensation & Wage Disparity",
    ar: "تدني الأجور وغياب الحوافز العادلة",
    evidence_stat: "1.0% satisfaction with salary (WHO EMHJ)",
    evidence_stat_ar: "1.0% فقط راضون عن الرواتب (دراسة الصحة العالمية)",
    policy_lever: "Specialty Retention Stipends (+40% to +100%)",
    policy_lever_ar: "حوافز استبقاء التخصصات النادرة والمناطق النائية"
  },
  {
    id: "workplace_safety",
    en: "Workplace Safety & Hospital Assaults",
    ar: "الاعتداءات على الفرق الطبية والأمان الميداني",
    evidence_stat: "55.5% verbal abuse, 35.4% physical assault (WHO EMHJ)",
    evidence_stat_ar: "55.5% اعتداء لفظي و35.4% اعتداء جسدي",
    policy_lever: "Hospital Security & Medical Liability Legislation",
    policy_lever_ar: "تأمين المنشآت الطبية وقانون المسؤولية الطبية"
  },
  {
    id: "equipment_shortage",
    en: "Medical Equipment & Consumable Shortages",
    ar: "عجز الأجهزة والمستلزمات الطبية في الاستقبال",
    evidence_stat: "Only 19.3% adequate supplies (WHO EMHJ)",
    evidence_stat_ar: "19.3% فقط يرون توفر مستلزمات كافية",
    policy_lever: "Supply Chain & Critical Care Re-equipment",
    policy_lever_ar: "إعادة تجهيز وحدات الرعاية الحرجة والغسيل الكلوي"
  },
  {
    id: "training_research",
    en: "Postgraduate Training & Research Facilities",
    ar: "فرص التدريب التخصصي والبحث العلمي",
    evidence_stat: "87.2% cite research/training as push factor (WHO EMHJ)",
    evidence_stat_ar: "87.2% يهاجرون بحثاً عن تدريب وبحث أفضل",
    policy_lever: "Accredited Fellowship & Protected Research Hours",
    policy_lever_ar: "زمالات تدريبية معتمدة وساعات بحثية مدفوعة"
  },
  {
    id: "workload_burnout",
    en: "Excessive Workload & Moonlighting",
    ar: "ساعات العمل المفرطة واضطرار العمل الإضافي",
    evidence_stat: "52.8% moonlight in private sector to survive (WHO EMHJ)",
    evidence_stat_ar: "52.8% يعملون بالقطاع الخاص لتعويض الدخل",
    policy_lever: "Shift Caps (max 24h) & Primary Care Decentralization",
    policy_lever_ar: "تحديد ساعات المناوبة وتوسيع الرعاية الأولية"
  }
];
