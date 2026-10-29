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

export function specialtyLabel(id, lang) {
  const spec = SHORT_BY_ID.get(id);
  return spec ? (spec[lang] ?? id) : id;
}
