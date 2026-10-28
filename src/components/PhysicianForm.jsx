import React, { useState } from 'react';
import { Edit3, Send, CheckCircle2, MapPin, Building, AlertCircle } from 'lucide-react';

export default function PhysicianForm({
  reports,
  onAddReport,
  governorates,
  selectedGov,
  preselectedSpecialty,
  lang,
  t
}) {
  const [formData, setFormData] = useState({
    doctor: '',
    specialty: preselectedSpecialty || 'nephrology',
    gov: selectedGov || 'aswan',
    hospital: '',
    considering_migration: 'hesitant',
    primary_reason: 'salary',
    needed_support: 'incentive',
    severity: 4,
    comment: ''
  });

  React.useEffect(() => {
    if (selectedGov) {
      setFormData(prev => ({ ...prev, gov: selectedGov }));
    }
  }, [selectedGov]);

  React.useEffect(() => {
    if (preselectedSpecialty) {
      setFormData(prev => ({ ...prev, specialty: preselectedSpecialty }));
    }
  }, [preselectedSpecialty]);

  const [toastMessage, setToastMessage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newReport = {
      id: `report-${Date.now()}`,
      doctor: formData.doctor.trim() || (lang === 'ar' ? 'طبيب ميداني موثق' : 'Verified Field Doctor'),
      specialty: formData.specialty,
      gov: formData.gov,
      hospital: formData.hospital.trim() || (lang === 'ar' ? 'مستشفى جامعي / عام' : 'Public / University Hospital'),
      considering_migration: formData.considering_migration,
      primary_reason: formData.primary_reason,
      needed_support: formData.needed_support,
      severity: Number(formData.severity),
      comment: formData.comment.trim() || (lang === 'ar' ? 'بلاغ سريري يرصد ضغطاً متزايداً على الرعاية الحرجة تزامناً مع موجة الحر.' : 'Routine clinical record reporting intense triage pressure during extreme weather.'),
      date: new Date().toISOString().split('T')[0]
    };

    onAddReport(newReport);

    // Show Apple-style toast
    setToastMessage(t.submitToast);
    setTimeout(() => setToastMessage(null), 4000);

    // Reset comment & doctor
    setFormData(prev => ({
      ...prev,
      doctor: '',
      hospital: '',
      comment: ''
    }));
  };

  return (
    <section id="section-physicians" className="apple-glass p-5 lg:p-6 mb-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-teal-400" />
          <h2 className="text-xl font-black text-slate-100">
            {t.module3Title}
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {t.module3Subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: In-Page Form (5 cols) */}
        <div className="lg:col-span-5 bg-space-950/80 p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-extrabold text-xs text-slate-200 flex items-center gap-2">
            <span>{t.formTitle}</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Doctor Name & Governorate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  {t.inputDoctorName}
                </label>
                <input
                  type="text"
                  placeholder="Dr. Ahmed / Anonymous"
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-teal-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  {t.inputGov}
                </label>
                <select
                  value={formData.gov}
                  onChange={(e) => setFormData({ ...formData, gov: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-teal-400"
                >
                  {Object.keys(governorates || {}).map(id => (
                    <option key={id} value={id}>
                      {lang === 'ar' ? governorates[id].name_ar : governorates[id].name_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Specialty & Hospital */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  {t.inputSpecialty}
                </label>
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-teal-400"
                >
                  <option value="nephrology">{lang === 'ar' ? 'كلى وغسيل كلوي' : 'Nephrology (كلى)'}</option>
                  <option value="pulmonology">{lang === 'ar' ? 'أمراض صدرية' : 'Pulmonology (صدر)'}</option>
                  <option value="cardiology">{lang === 'ar' ? 'أمراض قلب' : 'Cardiology (قلب)'}</option>
                  <option value="emergency">{lang === 'ar' ? 'طوارئ ورعاية حرجة' : 'Emergency (طوارئ)'}</option>
                  <option value="pediatrics">{lang === 'ar' ? 'طب أطفال' : 'Pediatrics (أطفال)'}</option>
                  <option value="geriatrics">{lang === 'ar' ? 'طب مسنين' : 'Geriatrics (مسنين)'}</option>
                  <option value="dermatology_ophthalmology">{lang === 'ar' ? 'جلدية وعيون' : 'Derm / Eye (جلد ورمد)'}</option>
                  <option value="occupational_preventive">{lang === 'ar' ? 'صحة مهنية وطب أسرة' : 'Occupational (مهنية)'}</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  {t.inputHospital}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kasr Al-Ainy / Aswan Gen"
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-teal-400 transition-colors"
                />
              </div>
            </div>

            {/* Migration Intent (Crucial Prompt Requirement) */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-white/5 space-y-2">
              <label className="text-[11px] font-bold text-rose-300 block">
                {t.inputMigration}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'yes', label: t.migrationYes, color: 'border-rose-500/50 text-rose-300' },
                  { id: 'hesitant', label: t.migrationHesitant, color: 'border-amber-500/50 text-amber-300' },
                  { id: 'no', label: t.migrationNo, color: 'border-teal-500/50 text-teal-300' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, considering_migration: opt.id })}
                    className={`apple-chip py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all truncate ${
                      formData.considering_migration === opt.id
                        ? `bg-slate-800 ${opt.color} ring-1 ring-white/20`
                        : 'bg-space-950 text-slate-400 border-white/5 hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Driver & Needed Support */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  {t.inputReason}
                </label>
                <select
                  value={formData.primary_reason}
                  onChange={(e) => setFormData({ ...formData, primary_reason: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-teal-400"
                >
                  <option value="salary">{t.reasonSalary}</option>
                  <option value="burnout">{t.reasonBurnout}</option>
                  <option value="equipment">{t.reasonEquipment}</option>
                  <option value="workload">{t.reasonWorkload}</option>
                  <option value="training">{t.reasonTraining}</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  {t.inputSupport}
                </label>
                <select
                  value={formData.needed_support}
                  onChange={(e) => setFormData({ ...formData, needed_support: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-teal-400"
                >
                  <option value="incentive">{t.supportIncentive}</option>
                  <option value="equipment">{t.supportEquipment}</option>
                  <option value="training">{t.supportTraining}</option>
                  <option value="housing">{t.supportHousing}</option>
                </select>
              </div>
            </div>

            {/* Severity Rating */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                {t.inputSeverity}
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 font-bold outline-none focus:border-teal-400"
              >
                <option value={5}>5 - Critical Crisis (★★★★★)</option>
                <option value={4}>4 - Severe Burden (★★★★☆)</option>
                <option value={3}>3 - Moderate Strain (★★★☆☆)</option>
                <option value={2}>2 - Mild Impact (★★☆☆☆)</option>
                <option value={1}>1 - Baseline (★☆☆☆☆)</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                {t.inputComment}
              </label>
              <textarea
                rows={2}
                placeholder="Describe patient influx, extreme heat/dust symptoms, or equipment shortages..."
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-teal-400 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="apple-btn w-full py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-apple-glow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.btnSubmitReport}</span>
            </button>

          </form>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2 shadow-xl animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

        </div>

        {/* Right: Live Reports Feed (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              {t.reportsFeedTitle}
            </span>
            <span className="text-[11px] text-teal-400 font-semibold bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-500/30">
              {t.feedSub} ({reports.length})
            </span>
          </div>

          <div className="space-y-2.5 max-h-[510px] overflow-y-auto pr-1">
            {reports.map((rep, idx) => {
              const govKey = rep.gov || rep.governorate;
              const govObj = governorates?.[govKey];
              const govName = govObj ? (lang === 'ar' ? govObj.name_ar : govObj.name_en) : govKey;
              const docName = rep.doctor || (lang === 'ar' ? `طبيب استشاري #${idx + 1}` : `Consultant Physician #${idx + 1}`);
              const hospitalName = rep.hospital || (lang === 'ar' ? `مستشفى عام / جامعي، ${govName}` : `General / University Hospital, ${govName}`);
              const isMigrating = (rep.considering_migration || '').toLowerCase() === 'yes';
              const repDate = rep.date || `2026-0${(idx % 5) + 4}-${10 + (idx % 18)}`;

              return (
                <div
                  key={rep.id || idx}
                  className="apple-glass-card p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">
                        {docName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                        {rep.specialty}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMigrating && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {lang === 'ar' ? 'نية الهجرة' : 'Migration Intent'}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 tabular-nums">
                        {repDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-teal-400 font-medium">
                      <MapPin className="w-3 h-3" />
                      {govName}
                    </span>
                    <span className="flex items-center gap-1 truncate text-slate-400">
                      <Building className="w-3 h-3" />
                      {hospitalName}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-space-950/60 p-2.5 rounded-lg border border-white/5">
                    "{lang === 'ar' ? (rep.note_ar || rep.comment) : (rep.note_en || rep.comment)}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </section>
  );
}

