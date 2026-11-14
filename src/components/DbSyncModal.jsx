import React, { useState, useEffect } from 'react';
import { Database, Check, Copy, RefreshCw, ShieldCheck, EyeOff } from 'lucide-react';
import Modal from './ui/Modal';
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
  }, [isOpen]);

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAr ? 'نقطة إرسال البلاغات' : 'Report Submission Endpoint'}
      titleId="db-sync-title"
      panelClassName="max-w-2xl"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Database className="w-5 h-5 text-[color:var(--ok)] dark:text-emerald-400" />
        </div>
        <p className="text-micro text-[color:var(--muted)]">
          {isAr
            ? 'Neon (Postgres) خلف دالة Cloudflare Pages: مسار كتابة فقط'
            : 'Neon (Postgres) behind a Cloudflare Pages Function: write path only'}
        </p>
      </div>

        {/* Current posture pill */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
          writesEnabled
            ? 'bg-emerald-50 border-emerald-200 text-[color:var(--ok-soft)] dark:bg-emerald-950/20 dark:border-emerald-500/30 dark:text-emerald-300'
            : pending
              ? 'bg-sky-50 border-sky-200 text-[color:var(--info-soft)] dark:bg-sky-950/20 dark:border-sky-500/30 dark:text-sky-300'
              : 'bg-amber-50 border-amber-200 text-[color:var(--warn-soft)] dark:bg-amber-950/20 dark:border-amber-500/30 dark:text-amber-300'
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
            className="text-micro px-2.5 py-1 rounded-lg bg-[color:var(--line)] hover:bg-[color:var(--line)] text-[color:var(--ink)] dark:bg-[color:var(--surface-4)] dark:hover:bg-[color:var(--surface-4)] transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
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
          <div className="p-3 rounded-xl text-xs bg-[color:var(--panel-2)] border border-[color:var(--line)] text-[color:var(--ink-2)] dark:bg-[color:var(--surface-2)] leading-relaxed">
            {verdict}
          </div>
        )}

        {/* What this topology actually guarantees */}
        <div className="text-xs text-[color:var(--ink-2)] leading-relaxed bg-[color:var(--panel-2)] p-3.5 rounded-2xl border border-[color:var(--line)] space-y-2.5">
          <p>
            {isAr ? (
              <>
                يعمل <b className="font-mono tracking-[0.15em]" dir="ltr">TERRAMED PULSE</b> دون خادم خاص به بالنسبة للبيانات والخرائط والمخططات: المؤشرات تُحسب من بذور مدمجة وتُعرض بلا شبكة. مسار البلاغات هو الاستثناء الوحيد: <span className="text-[color:var(--ink)] font-medium">متصفح ثابت ← دالة Pages ← Neon</span>، والدالة هي الكيان الوحيد المسموح له بالكتابة.
              </>
            ) : (
              <>
                <b className="font-mono tracking-[0.15em]" dir="ltr">TERRAMED PULSE</b> needs no server for its data, map and charts: indicators compute from the embedded satellite dataset and render with no network. The report feed is the one exception: <span className="text-[color:var(--ink)] font-medium">static browser → Pages Function → Neon</span>, and the function is the only thing allowed to write.
              </>
            )}
          </p>
          <ul className="space-y-2">
            {lines.map((line, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <line.icon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[color:var(--ok)] dark:text-emerald-400/80" />
                <span>{line.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Schema, for whoever holds the database console */}
        <div className="pt-2 border-t border-[color:var(--line)] space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-micro font-medium text-[color:var(--ink-2)]">
              {isAr
                ? 'نفس ملف db/migrations/0001_neon_physician_reports.sql: يُنفَّذ في محرر Neon SQL:'
                : 'Verbatim from db/migrations/0001_neon_physician_reports.sql, run in the Neon SQL Editor:'}
            </span>
            <button
              type="button"
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 text-micro font-medium px-2.5 py-1 rounded-lg bg-[color:var(--panel-2)] hover:bg-[color:var(--line)] text-[color:var(--ink)] border border-[color:var(--line)] dark:bg-[color:var(--surface-3)] dark:hover:bg-[color:var(--surface-4)] transition-colors shrink-0"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[color:var(--ok)] dark:text-emerald-400" />
                  <span className="text-[color:var(--ok)] dark:text-emerald-300">{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[color:var(--muted)]" />
                  <span>{isAr ? 'نسخ كود SQL' : 'Copy SQL'}</span>
                </>
              )}
            </button>
          </div>

          <p className="text-micro text-[color:var(--muted)] leading-relaxed">
            {isAr
              ? 'يقرأ هذا الملف أي جدول موجود مسبقاً ويرفض التعديل عليه بدل الصمت. بعد التطبيق تُنشأ كلمة مرور للـ role web_writer من محرر SQL أو لوحة Neon، ثم توضع في Cloudflare كـ Secret باسم NEON_URL مع IP_SALT، ولا تضع أيّاً منهما في متغيّرات VITE_* لأن أي قيمة VITE تُدمج في الحزمة العامة.'
              : 'The file reads whatever table already exists and refuses to adapt to it rather than proceeding silently. After it is applied, set the web_writer password in the SQL Editor or the Neon dashboard, then attach it to Cloudflare as the NEON_URL secret alongside IP_SALT, and never as a VITE_* variable, because every VITE value is inlined into the public bundle.'}
          </p>

          <pre
            dir="ltr"
            className="p-3 bg-[color:var(--ink)] text-emerald-400 dark:bg-black/50 rounded-xl font-mono text-2xs border border-[color:var(--line-strong)] overflow-x-auto max-h-32 select-all"
          >
            {SQL_TABLE_SCHEMA}
          </pre>
        </div>
    </Modal>
  );
}
