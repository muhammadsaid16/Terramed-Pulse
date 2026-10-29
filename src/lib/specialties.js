// Two distinct label registers, both load-bearing:
// SHORT is used by the report form and the live feed; FULL is used by the impact matcher cards.
// The strings differ on purpose — do not merge them.

export const SPECIALTY_SHORT_LABELS = [
  { id: 'nephrology', en: 'Nephrology', ar: 'كلى وغسيل كلوي' },
  { id: 'pulmonology', en: 'Pulmonology', ar: 'أمراض صدرية' },
  { id: 'cardiology', en: 'Cardiology', ar: 'أمراض قلب' },
  { id: 'emergency', en: 'Emergency & Critical', ar: 'طوارئ ورعاية حرجة' },
  { id: 'pediatrics', en: 'Pediatrics', ar: 'طب أطفال' },
  { id: 'geriatrics', en: 'Geriatrics', ar: 'طب مسنين' },
  { id: 'dermatology_ophthalmology', en: 'Derm / Eye', ar: 'جلدية وعيون' },
  { id: 'occupational_preventive', en: 'Occupational', ar: 'صحة مهنية وطب أسرة' }
];

const SHORT_BY_ID = new Map(SPECIALTY_SHORT_LABELS.map(s => [s.id, s]));

// FULL, in the same eight ids. It lives here rather than in the component that renders
// it because the id set is the submission vocabulary: a fourth typed copy of these
// keys is how the form, the matcher and the database drifted apart once already.
// Only the icons stay with the component, since they belong to lucide, not to the
// contract. (A third register exists in src/lib/chartAdapters.js — five axis-width
// abbreviations, a chart selection rather than the full vocabulary, and deliberately
// not reconciled with these two.)
export const SPECIALTY_FULL_LABELS = [
  { id: 'nephrology', en: 'Nephrology', ar: 'أمراض الكلى والغسيل الكلوي' },
  { id: 'pulmonology', en: 'Pulmonology', ar: 'الأمراض الصدرية والجهاز التنفسي' },
  { id: 'cardiology', en: 'Cardiology', ar: 'أمراض القلب والأوعية الدموية' },
  { id: 'emergency', en: 'Emergency & Critical Care', ar: 'طب الطوارئ والحالات الحرجة' },
  { id: 'pediatrics', en: 'Pediatrics', ar: 'طب الأطفال وحديثي الولادة' },
  { id: 'geriatrics', en: 'Geriatrics', ar: 'طب وصحة المسنين' },
  { id: 'dermatology_ophthalmology', en: 'Derm / Ophthalmology', ar: 'الجلدية والعيون' },
  { id: 'occupational_preventive', en: 'Occupational & Preventive', ar: 'الطب المهني والوقائي وطب الأسرة' }
];

export function specialtyLabel(id, lang) {
  const spec = SHORT_BY_ID.get(id);
  return spec ? (spec[lang] ?? id) : id;
}
