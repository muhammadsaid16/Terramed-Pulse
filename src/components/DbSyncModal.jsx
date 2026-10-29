import React, { useState, useEffect } from 'react';
import { Database, X, Check, Copy, AlertCircle, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getDbConfig, saveDbConfig, clearDbConfig, testDbConnection, SQL_TABLE_SCHEMA } from '../lib/dbService';

export default function DbSyncModal({ isOpen, onClose, lang = 'en', onConfigUpdated }) {
  // Hooks run unconditionally; the closed state is handled by the return below.
  const isAr = lang === 'ar';
  const [config, setConfig] = useState(getDbConfig());
  const [inputUrl, setInputUrl] = useState(config.url || '');
  const [inputKey, setInputKey] = useState(config.key || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    const current = getDbConfig();
    setConfig(current);
    setInputUrl(current.url || '');
    setInputKey(current.key || '');
    setTestResult(null);
  }, [isOpen]);

  const handleTestAndSave = async (e) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const res = await testDbConnection(inputUrl, inputKey);
    setIsTesting(false);

    if (res.ok) {
      saveDbConfig(inputUrl, inputKey);
      const updated = getDbConfig();
      setConfig(updated);
      // A readable table is not a writable one: with RLS enabled and no authenticated
      // policy PostgREST answers 200 with zero rows and rejects INSERT, so this reports
      // only what the probe actually verified.
      setTestResult({
        success: true,
        message: isAr
          ? 'تم العثور على الجدول وقراءته. الكتابة تتطلب سياسة وصول موثّقة (Supabase Auth)؛ بدونها يبقى الحفظ محلياً على هذا الجهاز.'
          : `Table reachable and readable (${res.rowCount ?? 0} row(s) returned). Writes need an authenticated RLS policy — until then TerraPulse keeps saving locally.`
      });
      if (onConfigUpdated) onConfigUpdated(updated);
    } else {
      setTestResult({
        success: false,
        message: res.error
      });
    }
  };

  const handleResetToLocal = () => {
    clearDbConfig();
    const updated = getDbConfig();
    setConfig(updated);
    setInputUrl('');
    setInputKey('');
    setTestResult({
      success: true,
      message: isAr
        ? 'تمت استعادة وضع العمل المحلي الافتراضي بنجاح (Offline Mode).'
        : 'Reset to local offline mode (seed data + browser cache).'
    });
    if (onConfigUpdated) onConfigUpdated(updated);
  };

  const handleCopySql = () => {
    try {
      navigator.clipboard.writeText(SQL_TABLE_SCHEMA);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      // fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div 
        className="bg-[#090C15]/95 backdrop-blur-3xl border border-white/12 rounded-3xl max-w-2xl w-full p-6 sm:p-8 modal-spring space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">
                {isAr ? 'إعدادات قاعدة البيانات السحابية (Supabase API)' : 'Cloud Database Sync (Supabase API)'}
              </h3>
              <p className="text-[11px] text-white/50">
                {isAr ? 'مزامنة استبيانات وبلاغات الأطباء الميدانية في الوقت الفعلي' : 'Real-time crowdsourced telemetry across clinical workstations'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="apple-chip p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Pill */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          config.isConfigured
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              {config.isConfigured && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                config.isConfigured ? 'bg-emerald-400' : 'bg-amber-400'
              }`}></span>
            </span>
            <div className="text-xs">
              <span className="font-semibold">
                {config.isConfigured
                  ? (isAr ? 'المزامنة السحابية نشطة (Supabase Connected)' : 'Live Cloud Sync Connected')
                  : (isAr ? 'وضع المحاكاة المحلي (Local Offline Mode)' : 'Local Offline Mode (Default)')}
              </span>
              <span className="text-[10px] block opacity-75 font-mono">
                {config.isConfigured
                  ? `${config.url} [${config.source}]`
                  : (isAr ? 'يتم حفظ البلاغات محلياً بالمتصفح، لا يتطلب أي مفاتيح خارجية' : 'Zero-backend offline mode active')}
              </span>
            </div>
          </div>

          {config.isConfigured && (
            <button
              onClick={handleResetToLocal}
              type="button"
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 transition-colors"
            >
              {isAr ? 'استعادة الوضع المحلي' : 'Reset to Local'}
            </button>
          )}
        </div>

        {/* Informative Explanation */}
        <div className="text-xs text-white/70 leading-relaxed font-normal bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.06]">
          {isAr ? (
            <p>
              نظام <b>TerraPulse</b> مصمم ليعمل <span className="text-white font-medium">ذاتياً 100% بدون إنترنت</span> باستخدام بذور البيانات المدمجة. إذا أردت ربط بلاغات الأطباء بقاعدة بيانات سحابية حية (مثل مسابقة ناسا أو الاستخدام الوطني المشترك)، يمكنك وضع مفتاح مشروع <b>Supabase</b> المجاني أدناه.
            </p>
          ) : (
            <p>
              <b>TerraPulse</b> operates <span className="text-white font-medium">100% offline</span> out of the box with embedded seed records. To enable live crowdsourced telemetry between multiple clinicians across Egypt, enter your free <b>Supabase</b> credentials below.
            </p>
          )}
        </div>

        {/* Connection Form */}
        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">
              {isAr ? 'رابط مشروع Supabase (Project URL):' : 'Supabase Project URL:'}
            </label>
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              dir="ltr"
              className="w-full bg-[#0E1320] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-white/30 outline-none focus:border-emerald-500/50 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">
              {isAr ? 'المفتاح العام للمشروع (Anon / Public API Key):' : 'Supabase Anon / Public API Key:'}
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              dir="ltr"
              className="w-full bg-[#0E1320] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-white/30 outline-none focus:border-emerald-500/50 transition-colors"
              required
            />
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              )}
              <div className="flex-1 leading-relaxed">
                {testResult.message}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isTesting}
              className="flex-1 apple-btn-primary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>{isAr ? 'جاري اختبار الاتصال...' : 'Testing Connection...'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-black" />
                  <span>{isAr ? 'اختبار وحفظ الاتصال' : 'Test & Save Connection'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="apple-chip py-2.5 px-5 text-xs text-white/70 hover:text-white"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </form>

        {/* 1-Click Copy SQL Schema Box */}
        <div className="pt-2 border-t border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-white/60">
              {isAr
                ? 'نفس محتوى supabase/migrations/0001_init_physician_reports.sql — الصقه في SQL Editor:'
                : 'Verbatim from supabase/migrations/0001_init_physician_reports.sql — paste into the SQL Editor:'}
            </span>
            <button
              type="button"
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/10 text-white/80 border border-white/10 transition-colors"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white/60" />
                  <span>{isAr ? 'نسخ كود SQL' : 'Copy SQL'}</span>
                </>
              )}
            </button>
          </div>

          <pre 
            dir="ltr"
            className="p-3 bg-black/50 rounded-xl font-mono text-[10px] text-emerald-300/80 border border-white/5 overflow-x-auto max-h-32 select-all"
          >
            {SQL_TABLE_SCHEMA}
          </pre>
        </div>
      </div>
    </div>
  );
}
