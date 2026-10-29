import React, { useState } from 'react';
import { Edit3, Send, CheckCircle2, MapPin, Building, Database } from 'lucide-react';
import { SPECIALTY_SHORT_LABELS, specialtyLabel } from '../lib/specialties';
import { LIMITS } from '../lib/reportLimits';

export default function PhysicianForm({
  reports,
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newReport = {
      id: `report-${Date.now()}`,
      doctor: formData.doctor.trim() || (t.defaultDoctor),
      specialty: formData.specialty,
      gov: formData.gov,
      hospital: formData.hospital.trim() || (t.defaultHospital),
      considering_migration: formData.considering_migration,
      primary_reason: formData.primary_reason,
      needed_support: formData.needed_support,
      severity: Number(formData.severity),
      comment: formData.comment.trim() || (t.defaultComment),
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
                <label className="text-[11px] font-medium text-white/50 block mb-1">
                  {t.inputDoctorName}
                </label>
                <input
                  type="text"
                  maxLength={LIMITS.doctor}
                  placeholder={t.phDoctorName}
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full bg-[#0E1320] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-white/50 block mb-1">
                  {t.inputGov}
                </label>
                <select
                  value={formData.gov}
                  onChange={(e) => setFormData({ ...formData, gov: e.target.value })}
                  className="w-full bg-[#0E1320] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/30"
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
                <label className="text-[11px] font-medium text-white/50 block mb-1">
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
                <label className="text-[11px] font-medium text-white/50 block mb-1">
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
              <label className="text-[11px] font-medium text-white/70 block">
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
              <label className="text-[11px] font-medium text-white/50 block mb-1">
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
              <label className="text-[11px] font-medium text-white/50 block mb-1">
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
              <label className="text-[11px] font-medium text-white/50 block mb-1">
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
              <label className="text-[11px] font-medium text-white/50 block mb-1">
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
                <span className="block text-right text-[10px] text-white/40 tabular-nums mt-1" dir="ltr">
                  {formData.comment.length} / {LIMITS.comment}
                </span>
              )}
            </div>

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
            <div className="p-3 bg-white/[0.08] border border-white/15 rounded-xl text-xs text-white flex items-center gap-2 shadow-xl animate-fade-in">
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
                className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full border transition-all ${
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
                <span className="text-[10px] text-white/40">⚙</span>
              </button>

              <span className="text-[11px] text-white/60 font-medium bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-white/10">
                {/* Always the local label. There is no read endpoint, so no state of the
                    badge — including a live one — makes this list anyone else's. */}
                {t.feedSubLocal} ({reports.length})
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
            {reports.map((rep, idx) => {
              const govKey = rep.gov || rep.governorate;
              const govObj = governorates?.[govKey];
              const govName = govObj ? (lang === 'ar' ? govObj.name_ar : govObj.name_en) : govKey;
              const docName = rep.doctor || `${t.consultantPrefix}${idx + 1}`;
              const hospitalName = rep.hospital || `${t.hospitalFallbackPrefix}${govName}`;
              const isMigrating = (rep.considering_migration || '').toLowerCase() === 'yes';
              const repDate = rep.date || `2026-0${(idx % 5) + 4}-${10 + (idx % 18)}`;

              const displaySpecialty = specialtyLabel(rep.specialty, lang);

              return (
                <div
                  key={rep.id || idx}
                  className="apple-card p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">
                        {docName}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-white/70 border border-white/10">
                        {displaySpecialty}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMigrating && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          {t.migrationIntentBadge}
                        </span>
                      )}
                      <span className="text-[10px] text-white/40 tabular-nums">
                        {repDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-white/50">
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
