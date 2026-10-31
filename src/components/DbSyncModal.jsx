import React, { useState, useEffect } from 'react';
import { Database, X, Check, Copy, RefreshCw, ShieldCheck, EyeOff } from 'lucide-react';
import { getSyncStatus, SQL_TABLE_SCHEMA } from '../lib/dbService';

// An endpoint-and-posture view, not a credential form. There is nothing to paste here:
// the browser holds no database credential, and the secret lives in a Cloudflare
// configuration the physician running this build will never see. What this modal answers
// is "where do my reports go, and what can anyone else do with them".
export default function DbSyncModal({ isOpen, onClose, lang = 'en', syncStatus = { state: 'local' } }) {
  const isAr = lang === 'ar';
  const [copiedSql, setCopiedSql] = useState(false);
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  const state = syncStatus?.state || 'local';
  const writesEnabled = state === 'read_blocked';
  const pending = state === 'pending';
  // The posture above is the endpoint's. This is the caller's own last outcome, kept
  // separate on purpose: being rate-limited does not make the write path untrue.
  const lastResult = syncStatus?.lastResult || null;
  const refused = lastResult === 'rate_limited' || lastResult === 'rejected';

  useEffect(() => {
    if (!isOpen) return undefined;
    setLastCheck(null);
    // The overlay is a real dialog: it blocks the page behind it, so the keyboard has
    // to be able to leave it. Discovered by trying to click past it in a browser.
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleRecheck = async () => {
    setChecking(true);
    const result = await getSyncStatus();
    setLastCheck(result);
    setChecking(false);
  };

  const handleCopySql = () => {
    try {
      navigator.clipboard.writeText(SQL_TABLE_SCHEMA);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      // Clipboard permission denied; the text below is already selectable.
    }
  };

  if (!isOpen) return null;

  const verdict = lastCheck
    ? (lastCheck.state === 'read_blocked'
        ? (isAr ? 'نقطة الإرسال تقبل البلاغات ولا تقرأ شيئاً.' : 'The endpoint accepts submissions and reads nothing.')
        : `${isAr ? 'نقطة الإرسال: ' : 'Endpoint: '}${lastCheck.state}${lastCheck.detail ? `: ${lastCheck.detail}` : ''}`)
    : null;

  // Named per outcome rather than echoing the internal token: a physician reading this
  // needs to know whether their report exists in the cloud, not what the code calls it.
  const refusedThis = lastResult === 'rate_limited'
    ? (isAr
        ? 'بلغ هذا العنوان حده من الإرسالات في الدقيقة الجارية'
        : 'this address has already used its submissions for the current minute')
    : (isAr ? 'رفض المُدقِّق محتوى هذا البلاغ' : 'the submission validator refused this payload');

  const lines = [
    {
      icon: ShieldCheck,
      text: writesEnabled
        ? (isAr
            ? 'الإرسال مُفعّل: كل بلاغ يُكتب في Neon عبر دالة Pages بصلاحيات role إضافة فقط.'
            : 'Writes enabled: each report is inserted into Neon through a Pages Function that holds an INSERT-only role.')
        : (isAr
            ? 'الإرسال غير متاح حالياً؛ البلاغات تُحفظ على هذا الجهاز فقط.'
            : 'Writes unavailable right now; reports stay on this device only.')
    },
    {
      icon: EyeOff,
      text: isAr
        ? 'القراءة محجوبة بالتصميم: لا يوجد أي مسار لإرجاع بلاغات الآخرين إلى المتصفح.'
        : 'Reads are disabled by design: there is no path that returns anyone else\u2019s reports to a browser.'
    },
    {
      icon: Database,
      text: isAr
        ? 'لا يحتفظ المتصفح بأي مفتاح قاعدة بيانات. فالمفتاح يعني وصولاً لصاحب قاعدة البيانات كله.'
        : 'The browser holds no database credential. One would be owner-level access to the whole database.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div
        className="bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-3xl border border-slate-200/90 dark:border-white/12 rounded-3xl max-w-2xl w-full p-6 sm:p-8 modal-spring space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                {isAr ? 'نقطة إرسال البلاغات' : 'Report Submission Endpoint'}
              </h3>
              <p className="text-micro text-slate-500 dark:text-white/50">
                {isAr
                  ? 'Neon (Postgres) خلف دالة Cloudflare Pages: مسار كتابة فقط'
                  : 'Neon (Postgres) behind a Cloudflare Pages Function: write path only'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="apple-chip p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:text-white/50 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current posture pill */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
          writesEnabled
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-500/30 dark:text-emerald-300'
            : pending
              ? 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/20 dark:border-sky-500/30 dark:text-sky-300'
              : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-500/30 dark:text-amber-300'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              {writesEnabled && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                writesEnabled ? 'bg-emerald-500 dark:bg-emerald-400' : pending ? 'bg-sky-500 dark:bg-sky-400' : 'bg-amber-500 dark:bg-amber-400'
              }`}></span>
            </span>
            <div className="text-xs">
              <span className="font-semibold">
                {writesEnabled
                  ? (isAr ? 'مسار الكتابة متصل' : 'Write path live')
                  : pending
                    ? (isAr ? 'جارٍ التحقق…' : 'Checking the endpoint…')
                    : (isAr ? 'وضع المحليات المحلي' : 'Local mode (this device)')}
              </span>
              <span className="text-2xs block opacity-75 font-mono" dir="ltr">
                {isAr ? '/api/status' : `${state} · reads: none exist`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRecheck}
            disabled={checking}
            className="text-micro px-2.5 py-1 rounded-lg bg-slate-200/80 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white/80 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
            {isAr ? 'إعادة الفحص' : 'Re-check'}
          </button>
        </div>

        {refused && (
          <div className="p-3 rounded-xl text-xs bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/25 dark:text-amber-200 leading-relaxed">
            {isAr
              ? `لم يصل بلاغك الأخير إلى السحابة: ${refusedThis}، وهو محفوظ على هذا الجهاز وحده. هذا يصف إرسالك أنت، لا نقطة الإرسال${
                  writesEnabled ? '، وما زالت الكتابة متاحة.' : '، ونقطة الإرسال غير متاحة حالياً أيضاً.'}`
              : `Your last report did not reach the cloud: ${refusedThis}, it is saved on this device alone. That describes your submission, not the endpoint${
                  writesEnabled ? ', which is still accepting writes.' : ', and the endpoint is unavailable right now as well.'}`}
          </div>
        )}

        {verdict && (
          <div className="p-3 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-700 dark:bg-white/[0.04] dark:border-white/10 dark:text-white/80 leading-relaxed">
            {verdict}
          </div>
        )}

        {/* What this topology actually guarantees */}
        <div className="text-xs text-slate-600 dark:text-white/70 leading-relaxed bg-slate-50 dark:bg-white/[0.02] p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] space-y-2.5">
          <p>
            {isAr ? (
              <>
                يعمل <b>TerraPulse</b> دون خادم خاص به بالنسبة للبيانات والخرائط والمخططات: المؤشرات تُحسب من بذور مدمجة وتُعرض بلا شبكة. مسار البلاغات هو الاستثناء الوحيد: <span className="text-slate-900 dark:text-white font-medium">متصفح ثابت ← دالة Pages ← Neon</span>، والدالة هي الكيان الوحيد المسموح له بالكتابة.
              </>
            ) : (
              <>
                <b>TerraPulse</b> needs no server for its data, map and charts: indicators compute from the embedded satellite dataset and render with no network. The report feed is the one exception: <span className="text-slate-900 dark:text-white font-medium">static browser → Pages Function → Neon</span>, and the function is the only thing allowed to write.
              </>
            )}
          </p>
          <ul className="space-y-2">
            {lines.map((line, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <line.icon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400/80" />
                <span>{line.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Schema, for whoever holds the database console */}
        <div className="pt-2 border-t border-slate-200/80 dark:border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-micro font-medium text-slate-600 dark:text-white/60">
              {isAr
                ? 'نفس ملف db/migrations/0001_neon_physician_reports.sql: يُنفَّذ في محرر Neon SQL:'
                : 'Verbatim from db/migrations/0001_neon_physician_reports.sql, run in the Neon SQL Editor:'}
            </span>
            <button
              type="button"
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 text-micro font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/10 dark:text-white/80 dark:border-white/10 transition-colors shrink-0"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300">{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-white/60" />
                  <span>{isAr ? 'نسخ كود SQL' : 'Copy SQL'}</span>
                </>
              )}
            </button>
          </div>

          <p className="text-micro text-slate-500 dark:text-white/45 leading-relaxed">
            {isAr
              ? 'يقرأ هذا الملف أي جدول موجود مسبقاً ويرفض التعديل عليه بدل الصمت. بعد التطبيق تُنشأ كلمة مرور للـ role web_writer من محرر SQL أو لوحة Neon، ثم توضع في Cloudflare كـ Secret باسم NEON_URL مع IP_SALT، ولا تضع أيّاً منهما في متغيّرات VITE_* لأن أي قيمة VITE تُدمج في الحزمة العامة.'
              : 'The file reads whatever table already exists and refuses to adapt to it rather than proceeding silently. After it is applied, set the web_writer password in the SQL Editor or the Neon dashboard, then attach it to Cloudflare as the NEON_URL secret alongside IP_SALT, and never as a VITE_* variable, because every VITE value is inlined into the public bundle.'}
          </p>

          <pre
            dir="ltr"
            className="p-3 bg-slate-900 text-emerald-400 dark:bg-black/50 dark:text-emerald-300/80 rounded-xl font-mono text-2xs border border-slate-800 dark:border-white/5 overflow-x-auto max-h-32 select-all"
          >
            {SQL_TABLE_SCHEMA}
          </pre>
        </div>
      </div>
    </div>
  );
}
