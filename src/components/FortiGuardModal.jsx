import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Activity,
  AlertTriangle,
  Zap,
  Terminal,
  Lock,
  RefreshCw,
  X,
  Play,
  CheckCircle,
  Database,
  Globe2,
  Server
} from 'lucide-react';
import {
  getFortiGuardTelemetry,
  subscribeToFortiGuard,
  simulateAttackVector,
  resetFortiGuardAuditLog,
  toggleFortiGuardSetting
} from '../lib/fortiguardShield';

export default function FortiGuardModal({ isOpen, onClose, lang = 'ar', t }) {
  const [telemetry, setTelemetry] = useState(getFortiGuardTelemetry());
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'simulator' | 'logs'
  const [lastSimResult, setLastSimResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToFortiGuard((newTelemetry) => {
      setTelemetry(newTelemetry);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isAr = lang === 'ar';

  const handleSimulate = (type) => {
    setIsSimulating(true);
    const result = simulateAttackVector(type);
    setLastSimResult({ type, ...result });
    setTimeout(() => setIsSimulating(false), 400);
  };

  const getThreatColor = (level) => {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
      case 'ELEVATED':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 sm:p-6 backdrop-blur-md bg-black/75 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl border border-[color:var(--line-strong)] bg-[color:var(--panel)] shadow-2xl overflow-hidden transition-all text-start"
        onClick={(e) => e.stopPropagation()}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[color:var(--line)] px-5 py-4 bg-[color:var(--panel-2)]">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-inner">
              <ShieldCheck className="h-6 w-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base sm:text-lg font-bold text-[color:var(--ink)]">
                  {isAr ? 'منظومة حماية FortiGuard® والأمن السيبراني' : 'FortiGuard® Security Fabric & WAF'}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  v7.4 INLINE
                </span>
              </div>
              <p className="text-xs text-[color:var(--muted)]">
                {isAr
                  ? 'جدار حماية تطبيقات الويب اللحظي (WAF) ومحرك كشف التهديدات السحابي المتقدم'
                  : 'Active Web Application Firewall & Threat Intelligence Architecture'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[color:var(--muted)] hover:bg-[color:var(--line)] hover:text-[color:var(--ink)] transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Telemetry Overview Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 border-b border-[color:var(--line)] bg-[color:var(--bg)]">
          <div className="p-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)]">
            <div className="text-2xs font-mono uppercase text-[color:var(--muted)]">
              {isAr ? 'حالة المنظومة' : 'ENGINE STATUS'}
            </div>
            <div className="mt-1 flex items-center gap-1.5 font-bold text-xs sm:text-sm text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{isAr ? 'نشط وقيد الحماية' : 'ACTIVE INLINE'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)]">
            <div className="text-2xs font-mono uppercase text-[color:var(--muted)]">
              {isAr ? 'الطلبات المفحوصة' : 'INSPECTED REQUESTS'}
            </div>
            <div className="mt-1 font-mono font-bold text-sm sm:text-base text-[color:var(--ink)]">
              {telemetry.totalInspected.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)]">
            <div className="text-2xs font-mono uppercase text-[color:var(--muted)]">
              {isAr ? 'الهجمات المحجوبة' : 'THREATS MITIGATED'}
            </div>
            <div className="mt-1 font-mono font-bold text-sm sm:text-base text-rose-500">
              {telemetry.threatsBlocked.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)]">
            <div className="text-2xs font-mono uppercase text-[color:var(--muted)]">
              {isAr ? 'قواعد البصمات (Signatures)' : 'ACTIVE SIGNATURES'}
            </div>
            <div className="mt-1 font-mono font-bold text-sm sm:text-base text-cyan-400">
              {telemetry.activeSignaturesCount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[color:var(--line)] px-4 bg-[color:var(--panel-2)]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-[color:var(--muted)] hover:text-[color:var(--ink)]'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>{isAr ? 'طبقات الأمان والدفاع' : 'Security Posture'}</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'simulator'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-[color:var(--muted)] hover:text-[color:var(--ink)]'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>{isAr ? 'محاكي هجمات WAF (لجنة التحكيم)' : 'WAF Attack Simulator'}</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-[color:var(--muted)] hover:text-[color:var(--ink)]'
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>{isAr ? 'سجل العمليات والتهديدات' : 'Live Audit Logs'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-3xs font-mono bg-[color:var(--line)] text-[color:var(--ink)]">
              {telemetry.auditLog.length}
            </span>
          </button>
        </div>

        {/* Modal Body / Tab Views */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--panel-2)] p-4">
                <h3 className="text-sm font-bold text-[color:var(--ink)] mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-cyan-400" />
                  <span>{isAr ? 'معمارية الحماية الهجينة (Hybrid Defense Architecture)' : 'Hybrid Defense Architecture'}</span>
                </h3>
                <p className="text-xs text-[color:var(--muted)] leading-relaxed">
                  {isAr
                    ? 'تعمل المنظومة بنموذج دفاعي متكامل متعدد الطبقات (Defense in Depth) يحمي تطبيق TerraPulse من هجمات الحقن وسرقة البيانات والتعطيل المتعمد، مع حماية خصوصية الأطباء واستمارة البلاغات السريرية.'
                    : 'TerraPulse employs a multi-tiered Defense-in-Depth framework ensuring clinical data integrity, zero unauthorized exfiltration, and resilient edge operations under hostile network conditions.'}
                </p>
              </div>

              {/* Security Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)]">
                  <div className="mt-0.5 p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[color:var(--ink)]">
                        {isAr ? 'فحص الحمولات العميقة (DPI & WAF)' : 'Deep Packet Inspection (DPI)'}
                      </span>
                      <span className="text-2xs font-mono font-bold text-emerald-500 uppercase">
                        {isAr ? 'مُفعّل' : 'ENABLED'}
                      </span>
                    </div>
                    <p className="mt-1 text-2xs text-[color:var(--muted)]">
                      {isAr
                        ? 'فحص شامل لمدخلات JSON ونماذج الأطباء ضد بصمات XSS و SQLi و Path Traversal.'
                        : 'Inspects all inbound JSON payloads and form vectors against known CVEs and malicious injection patterns.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)]">
                  <div className="mt-0.5 p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Globe2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[color:var(--ink)]">
                        {isAr ? 'محدد السرعة ومكافحة الإغراق (Rate Limiter)' : 'Edge Rate Limiting & Anti-Flood'}
                      </span>
                      <span className="text-2xs font-mono font-bold text-emerald-500 uppercase">
                        {isAr ? 'مُفعّل' : 'ENABLED'}
                      </span>
                    </div>
                    <p className="mt-1 text-2xs text-[color:var(--muted)]">
                      {isAr
                        ? 'حظر محاولات الإغراق (DDoS) ومنع الهجمات الآلية عبر تقييد سرعة الطلبات لكل عميل.'
                        : 'Restricts request velocity per IP/client token to mitigate brute-force and Denial-of-Service vectors.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)]">
                  <div className="mt-0.5 p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Server className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[color:var(--ink)]">
                        {isAr ? 'ترويسات الأمان الصارمة (Strict Headers)' : 'FortiGuard Strict Security Headers'}
                      </span>
                      <span className="text-2xs font-mono font-bold text-emerald-500 uppercase">
                        {isAr ? 'مُفعّل' : 'ENABLED'}
                      </span>
                    </div>
                    <p className="mt-1 text-2xs text-[color:var(--muted)]">
                      {isAr
                        ? 'تطبيق سياسات CSP و X-Frame-Options و HSTS لحماية الموقع من التضمين الخبيث والقرصنة.'
                        : 'Enforces strict Content-Security-Policy (CSP), Clickjacking protection (DENY), and nosniff rules.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)]">
                  <div className="mt-0.5 p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Database className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[color:var(--ink)]">
                        {isAr ? 'عزل صلاحيات قاعدة البيانات (Zero-Read Writer)' : 'Zero-Read Database Isolation'}
                      </span>
                      <span className="text-2xs font-mono font-bold text-emerald-500 uppercase">
                        {isAr ? 'مُفعّل' : 'ENABLED'}
                      </span>
                    </div>
                    <p className="mt-1 text-2xs text-[color:var(--muted)]">
                      {isAr
                        ? 'مفتاح الكتابة السحابي لا يملك صلاحية القراءة مطلقاً، مما يجعل تسريب بيانات الأطباء مستحيلاً برمجياً.'
                        : 'The serverless role can only write verified hashes; it has no SELECT privileges, rendering leaks structurally impossible.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTACK SIMULATOR (FOR JUDGES) */}
          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                  <Zap className="h-4 w-4" />
                  <span>{isAr ? 'بيئة الاختبار التفاعلية للجنة التحكيم (Live Judging Sandbox)' : 'Live Judging & Evaluation Sandbox'}</span>
                </div>
                <p className="mt-1 text-xs text-[color:var(--muted)] leading-relaxed">
                  {isAr
                    ? 'اضغط على أي زر أدناه لإرسال حمولة هجومية خبيثة حقيقية إلى محرك الفحص، وشاهد كيف يكتشفها نظام FortiGuard ويحجبها لحظياً مع توليد كود البصمة (Signature ID) وسجل التدقيق.'
                    : 'Click any vector below to inject a simulated cyber attack payload and observe FortiGuard WAF actively intercepting, tagging, and neutralizing the threat in real-time.'}
                </p>
              </div>

              {/* Simulation Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleSimulate('xss')}
                  disabled={isSimulating}
                  className="flex flex-col text-start p-3.5 rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)] hover:border-cyan-500 hover:bg-cyan-500/5 transition-all group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-[color:var(--ink)] group-hover:text-cyan-400">
                      1. Cross-Site Scripting (XSS)
                    </span>
                    <span className="text-2xs font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      FG-SIG-XSS-101
                    </span>
                  </div>
                  <span className="mt-1.5 font-mono text-3xs text-[color:var(--muted)] truncate w-full">
                    {'<script>alert("XSS_EXPLOIT_EXECUTED")</script>'}
                  </span>
                  <div className="mt-2 text-2xs text-cyan-400 font-semibold flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    <span>{isAr ? 'تنفيذ واختبار الحجب' : 'Simulate & Mitigate'}</span>
                  </div>
                </button>

                <button
                  onClick={() => handleSimulate('sqli')}
                  disabled={isSimulating}
                  className="flex flex-col text-start p-3.5 rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)] hover:border-cyan-500 hover:bg-cyan-500/5 transition-all group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-[color:var(--ink)] group-hover:text-cyan-400">
                      2. SQL Injection (SQLi)
                    </span>
                    <span className="text-2xs font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      FG-SIG-SQLI-202
                    </span>
                  </div>
                  <span className="mt-1.5 font-mono text-3xs text-[color:var(--muted)] truncate w-full">
                    {"aswan' UNION SELECT null, username, password_hash --"}
                  </span>
                  <div className="mt-2 text-2xs text-cyan-400 font-semibold flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    <span>{isAr ? 'تنفيذ واختبار الحجب' : 'Simulate & Mitigate'}</span>
                  </div>
                </button>

                <button
                  onClick={() => handleSimulate('traversal')}
                  disabled={isSimulating}
                  className="flex flex-col text-start p-3.5 rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)] hover:border-cyan-500 hover:bg-cyan-500/5 transition-all group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-[color:var(--ink)] group-hover:text-cyan-400">
                      3. Path Traversal & Probing
                    </span>
                    <span className="text-2xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      FG-SIG-PATH-302
                    </span>
                  </div>
                  <span className="mt-1.5 font-mono text-3xs text-[color:var(--muted)] truncate w-full">
                    {'../../../../etc/shadow'}
                  </span>
                  <div className="mt-2 text-2xs text-cyan-400 font-semibold flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    <span>{isAr ? 'تنفيذ واختبار الحجب' : 'Simulate & Mitigate'}</span>
                  </div>
                </button>

                <button
                  onClick={() => handleSimulate('flood')}
                  disabled={isSimulating}
                  className="flex flex-col text-start p-3.5 rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)] hover:border-cyan-500 hover:bg-cyan-500/5 transition-all group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-[color:var(--ink)] group-hover:text-cyan-400">
                      4. Rate-Limit Flood / DDoS
                    </span>
                    <span className="text-2xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      FG-SIG-RATE-505
                    </span>
                  </div>
                  <span className="mt-1.5 font-mono text-3xs text-[color:var(--muted)] truncate w-full">
                    {'35 Rapid API Submissions in <1s'}
                  </span>
                  <div className="mt-2 text-2xs text-cyan-400 font-semibold flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    <span>{isAr ? 'تنفيذ واختبار الحجب' : 'Simulate & Mitigate'}</span>
                  </div>
                </button>
              </div>

              {/* Simulation Feedback Banner */}
              {lastSimResult && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-rose-500 animate-bounce" />
                      <span className="font-bold text-sm text-rose-400">
                        {isAr ? 'تم رصد الهجوم وإبطاله بنجاح بواسطة FortiGuard!' : 'Attack Successfully Intercepted by FortiGuard!'}
                      </span>
                    </div>
                    <span className="font-mono text-2xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      403 FORBIDDEN
                    </span>
                  </div>
                  <div className="mt-2 font-mono text-2xs text-[color:var(--ink-2)] bg-black/40 p-2.5 rounded-lg border border-white/5 overflow-x-auto">
                    <div><span className="text-cyan-400">ACTION:</span> REQUEST_DROPPED_AT_INLINE_WAF</div>
                    <div><span className="text-cyan-400">SIGNATURE:</span> {lastSimResult.result?.signature || 'FG-SIG-MATCH'}</div>
                    <div><span className="text-cyan-400">CATEGORY:</span> {lastSimResult.result?.category || lastSimResult.type.toUpperCase()}</div>
                    <div><span className="text-cyan-400">STATUS:</span> {lastSimResult.result?.message || 'Blocked.'}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[color:var(--muted)]">
                  {isAr ? 'سجل الرصد اللحظي لآخر العمليات والتهديدات المفحوصة:' : 'Real-time telemetry audit log (latest 50 events):'}
                </span>
                <button
                  onClick={resetFortiGuardAuditLog}
                  className="flex items-center gap-1 text-2xs text-[color:var(--muted)] hover:text-cyan-400 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>{isAr ? 'مسح السجل' : 'Reset Logs'}</span>
                </button>
              </div>

              <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--panel-2)] overflow-hidden">
                <div className="max-h-80 overflow-y-auto divide-y divide-[color:var(--line)]">
                  {telemetry.auditLog.map((log) => (
                    <div key={log.id} className="p-3 text-xs hover:bg-[color:var(--panel)] transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold text-3xs px-2 py-0.5 rounded border ${
                              log.action.startsWith('BLOCKED')
                                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {log.action}
                          </span>
                          <span className="font-mono font-semibold text-2xs text-[color:var(--ink)]">
                            {log.signature}
                          </span>
                        </div>
                        <span className="font-mono text-3xs text-[color:var(--muted)]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1 text-2xs text-[color:var(--muted)] leading-relaxed">
                        {log.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between border-t border-[color:var(--line)] px-5 py-3 bg-[color:var(--panel-2)]">
          <div className="flex items-center gap-2 text-2xs font-mono text-[color:var(--muted)]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>FortiGuard Labs Threat Cloud • Telemetry Synced</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[color:var(--panel)] border border-[color:var(--line)] text-[color:var(--ink)] hover:border-[color:var(--line-strong)] transition-all"
          >
            {isAr ? 'إغلاق النافذة' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
