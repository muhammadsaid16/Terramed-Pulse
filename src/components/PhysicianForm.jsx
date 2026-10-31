import React, { useState } from 'react';
import { Edit3, Send, CheckCircle2, MapPin, Building, Database } from 'lucide-react';
import { SPECIALTY_SHORT_LABELS, specialtyLabel } from '../lib/specialties';
import { LIMITS } from '../lib/reportLimits';

export default function PhysicianForm({
  reports,
  communityReports = [],
  onAddReport,
  governorates,
  selectedGov,
  preselectedSpecialty,
  lang,
  t,
  syncStatus = { state: 'local' },
  onOpenDbModal
}) {
  const syncState = syncStatus?.state || 'local';
  const syncBadge = {
    local: t.dbBadgeLocal,
    pending: t.syncPending,
    read_blocked: t.syncSubmitOnly,
    rate_limited: t.syncRateLimited,
    rejected: t.syncRejected,
    unreachable: t.syncUnreachable,
    error: t.syncError
  }[syncState] || t.syncError;
  // The badge describes the endpoint, not this report: `read_blocked` is the shipped
  // posture (writes accepted, reads do not exist), and it is the only state that colours
  // the chip green. A 201 on one submission never changes it, because one successful
  // write does not prove the app can talk to the store in general.
  const writesEnabled = syncState === 'read_blocked';
  const [activeFeedTab, setActiveFeedTab] = useState('local');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formData, setFormData] = useState({
    doctor: '',
    specialty: preselectedSpecialty || 'nephrology',
    gov: selectedGov || '',
    hospital: '',
    considering_migration: 'hesitant',
    primary_reason: 'salary',
    needed_support: 'incentive',
    severity: 4,
    comment: ''
  });

  const [errors, setErrors] = useState({});
  const [errorNonce, setErrorNonce] = useState(0);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const required = (field) => (lang === 'ar' ? `هذا الحقل مطلوب: ${field}` : `${field} is required`);
    if (!isAnonymous && !formData.doctor.trim()) newErrors.doctor = required(t.inputDoctorName);
    if (!formData.gov) newErrors.gov = required(t.inputGov);
    if (!formData.hospital.trim()) newErrors.hospital = required(lang === 'ar' ? 'المستشفى' : 'Hospital');
    if (!formData.comment.trim()) newErrors.comment = required(lang === 'ar' ? 'التعليق' : 'Comment');

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setErrorNonce(n => n + 1);
      return;
    }
    setErrors({});

    const submittedDocName = isAnonymous || !formData.doctor.trim()
      ? (t.anonymousDoctorName || (lang === 'ar' ? 'طبيب مجهول' : 'Anonymous Physician'))
      : formData.doctor.trim();

    const newReport = {
      id: `report-${Date.now()}`,
      doctor: submittedDocName,
      specialty: formData.specialty,
      gov: formData.gov,
      hospital: formData.hospital.trim(),
      considering_migration: formData.considering_migration,
      primary_reason: formData.primary_reason,
      needed_support: formData.needed_support,
      severity: Number(formData.severity),
      comment: formData.comment.trim(),
      date: new Date().toISOString().split('T')[0]
    };

    const result = await onAddReport(newReport);
    const state = result?.state;

    // The toast names the storage the report actually landed in. A rejected or
    // rate-limited cloud write is reported as such even though the local copy succeeded;
    // the quota gets its own sentence because "error" would send a physician to look for
    // a bug when the real answer is "wait a minute".
    setToastMessage(
      state === 'ok'
        ? t.submitToastCloud
        : state === 'local'
          ? t.submitToastLocalMode
          : state === 'rate_limited'
            ? t.submitToastRateLimited
            : t.submitToastLocalOnly
    );
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
    <section id="section-physicians" className="bento-card p-5 sm:p-8 mb-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <Edit3 className="w-4 h-4 text-sky-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
              {t.module3Title}
            </h2>
          </div>
          <p className="text-xs text-white/50 font-normal mt-1">
            {t.module3Subtitle}
          </p>
        </div>
        <span className="satellite-chip text-emerald-300 bg-emerald-950/40 border-emerald-800/40">
          {t.feedBadge}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: In-Page Form (5 cols) */}
        <div className="lg:col-span-5 apple-card p-6 space-y-4">
          <h3 className="font-semibold text-xs text-white/80">
            {t.formTitle}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Doctor Name & Governorate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-micro font-medium text-white/50 block mb-1">
                  {t.inputDoctorName}
                </label>
                <input
                  type="text"
                  maxLength={LIMITS.doctor}
                  placeholder={isAnonymous ? (t.anonymousDoctorName || 'Anonymous Physician') : t.phDoctorName}
                  disabled={isAnonymous}
                  value={isAnonymous ? '' : formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className={`w-full bg-[#0E1320] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/30 transition-colors ${isAnonymous ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => {
                      setIsAnonymous(e.target.checked);
                      if (e.target.checked) setErrors(prev => ({ ...prev, doctor: undefined }));
                    }}
                    className="rounded border-white/20 bg-[#0E1320] text-sky-400 focus:ring-0 w-3 h-3"
                  />
                  <span className="text-2xs text-white/50">{t.anonymousToggle}</span>
                </label>
              </div>

              <div>
                <label className="text-micro font-medium text-white/50 block mb-1">
                  {t.inputGov}
                </label>
                <select
                  value={formData.gov}
                  onChange={(e) => setFormData({ ...formData, gov: e.target.value })}
                  className="w-full bg-[#0E1320] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                >
                  <option value="" disabled>
                    {lang === 'ar' ? 'اختر محافظة' : 'Select governorate'}
                  </option>
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
                <label className="text-micro font-medium text-white/50 block mb-1">
                  {t.inputSpecialty}
                </label>
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full bg-[#0E1320] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                >
                  {SPECIALTY_SHORT_LABELS.map(spec => (
                    <option key={spec.id} value={spec.id}>
                      {lang === 'ar' ? spec.ar : spec.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-micro font-medium text-white/50 block mb-1">
                  {t.inputHospital}
                </label>
                <input
                  type="text"
                  maxLength={LIMITS.hospital}
                  placeholder={t.phHospital}
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  className="w-full bg-[#0E1320] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            {/* Migration Intent (Apple Segmented Style) */}
            <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/[0.08] space-y-2">
              <label className="text-micro font-medium text-white/70 block">
                {t.inputMigration}
              </label>
              <div className="apple-segmented-track grid grid-cols-3 gap-1">
                {[
                  { id: 'yes', label: t.migrationYes, color: 'text-rose-300' },
                  { id: 'hesitant', label: t.migrationHesitant, color: 'text-amber-300' },
                  { id: 'no', label: t.migrationNo, color: 'text-emerald-300' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, considering_migration: opt.id })}
                    className={`apple-chip py-2 px-1 rounded-full text-xs font-medium transition-all text-center whitespace-nowrap ${
                      formData.considering_migration === opt.id
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Driver */}
            <div>
              <label className="text-micro font-medium text-white/50 block mb-1">
                {t.inputReason}
              </label>
              <select
                value={formData.primary_reason}
                onChange={(e) => setFormData({ ...formData, primary_reason: e.target.value })}
                className="w-full bg-[#0E1320] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/30"
              >
                <option value="salary">{t.reasonSalary}</option>
                <option value="burnout">{t.reasonBurnout}</option>
                <option value="equipment">{t.reasonEquipment}</option>
                <option value="workload">{t.reasonWorkload}</option>
                <option value="training">{t.reasonTraining}</option>
              </select>
            </div>

            {/* Needed Support */}
            <div>
              <label className="text-micro font-medium text-white/50 block mb-1">
                {t.inputSupport}
              </label>
              <select
                value={formData.needed_support}
                onChange={(e) => setFormData({ ...formData, needed_support: e.target.value })}
                className="w-full bg-[#0E1320] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/30"
              >
                <option value="incentive">{t.supportIncentive}</option>
                <option value="equipment">{t.supportEquipment}</option>
                <option value="training">{t.supportTraining}</option>
                <option value="housing">{t.supportHousing}</option>
              </select>
            </div>

            {/* Severity Rating */}
            <div>
              <label className="text-micro font-medium text-white/50 block mb-1">
                {t.inputSeverity}
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: Number(e.target.value) })}
                className="w-full bg-[#0E1320] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/30"
              >
                <option value={5}>{t.severity5}</option>
                <option value={4}>{t.severity4}</option>
                <option value={3}>{t.severity3}</option>
                <option value={2}>{t.severity2}</option>
                <option value={1}>{t.severity1}</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-micro font-medium text-white/50 block mb-1">
                {t.inputComment}
              </label>
              <textarea
                rows={2}
                maxLength={LIMITS.comment}
                placeholder={t.phComment}
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="w-full bg-[#0E1320] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/30 resize-none font-normal"
              />
              {formData.comment.length > LIMITS.comment * 0.8 && (
                <span className="block text-right text-2xs text-white/40 tabular-nums mt-1" dir="ltr">
                  {formData.comment.length} / {LIMITS.comment}
                </span>
              )}
            </div>

            {Object.keys(errors).length > 0 && (
              <div key={errorNonce} className="enter-shake text-micro text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2 space-y-1">
                {Object.values(errors).map((msg, i) => (
                  <div key={i}>{msg}</div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="apple-btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-black" />
              <span>{t.btnSubmitReport}</span>
            </button>

          </form>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-3 bg-white/[0.08] border border-white/15 rounded-xl text-xs text-white flex items-center gap-2 shadow-xl enter-success-pop">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

        </div>

        {/* Right: Live Reports Feed (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1 flex-wrap gap-2">
            <span className="text-xs font-semibold text-white/90">
              {t.reportsFeedTitle}
            </span>
            <div className="flex items-center gap-2">
              {/* Submission endpoint status + posture view */}
              <button
                type="button"
                onClick={onOpenDbModal}
                className={`inline-flex items-center gap-1.5 text-micro font-medium px-2.5 py-0.5 rounded-full border transition-all ${
                  writesEnabled
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20 shadow-sm'
                    : syncState === 'pending'
                      ? 'bg-sky-500/10 text-sky-300 border-sky-500/25'
                      : 'bg-white/[0.04] text-white/70 border-white/10 hover:bg-white/[0.08]'
                }`}
                title={t.dbBadgeTooltip}
              >
                <Database className={`w-3 h-3 ${writesEnabled ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span>{syncBadge}</span>
                <span className="text-2xs text-white/40">⚙</span>
              </button>

              {communityReports.length > 0 ? (
                <div className="flex items-center bg-white/[0.04] p-0.5 rounded-full border border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveFeedTab('local')}
                    className={`text-micro font-medium px-2.5 py-0.5 rounded-full transition-all ${
                      activeFeedTab === 'local'
                        ? 'bg-white/[0.12] text-white shadow-sm'
                        : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    {t.feedSubLocal} ({reports.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFeedTab('community')}
                    className={`text-micro font-medium px-2.5 py-0.5 rounded-full transition-all ${
                      activeFeedTab === 'community'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                        : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    {t.communityFeedBadge} ({communityReports.length})
                  </button>
                </div>
              ) : (
                <span className="text-micro text-white/60 font-medium bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-white/10">
                  {t.feedSubLocal} ({reports.length})
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
            {((activeFeedTab === 'community' && communityReports.length > 0) ? communityReports : reports).length === 0 && (
              <div className="py-12 px-5 text-center rounded-2xl border border-dashed border-white/12 bg-white/[0.02]">
                <p className="text-sm font-semibold text-white/70">{t.feedEmptyTitle}</p>
                <p className="text-xs text-white/45 mt-2 leading-relaxed max-w-md mx-auto">
                  {activeFeedTab === 'community' ? t.communityFeedDesc : t.feedEmptySub}
                </p>
              </div>
            )}
            {((activeFeedTab === 'community' && communityReports.length > 0) ? communityReports : reports).map((rep, idx) => {
              const govKey = rep.gov;
              const govObj = governorates?.[govKey];
              const govName = govObj ? (lang === 'ar' ? govObj.name_ar : govObj.name_en) : govKey;
              const docName = rep.doctor || t.anonymousDoctorName || (lang === 'ar' ? 'طبيب مجهول' : 'Anonymous Physician');
              const hospitalName = rep.hospital;
              const isMigrating = (rep.considering_migration || '').toLowerCase() === 'yes';
              const repDate = rep.date || '-';

              const displaySpecialty = specialtyLabel(rep.specialty, lang);

              return (
                <div
                  key={rep.id || idx}
                  className="apple-card p-4 space-y-2.5 enter-pop"
                  style={{ animationDelay: `${Math.min(idx, 10) * 20}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">
                        {docName}
                      </span>
                      <span className="text-2xs font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-white/70 border border-white/10">
                        {displaySpecialty}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMigrating && (
                        <span className="text-2xs font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          {t.migrationIntentBadge}
                        </span>
                      )}
                      <span className="text-2xs text-white/40 tabular-nums">
                        {repDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-micro text-white/50">
                    <span className="flex items-center gap-1 text-sky-400 font-medium">
                      <MapPin className="w-3 h-3" />
                      {govName}
                    </span>
                    <span className="flex items-center gap-1 truncate text-white/40">
                      <Building className="w-3 h-3" />
                      {hospitalName}
                    </span>
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.05] font-normal">
                    "{rep.comment}"
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
