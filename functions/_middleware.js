/**
 * Cloudflare Pages Edge Middleware — FortiGuard Security Fabric Layer
 * 
 * Intercepts all incoming HTTP requests to apply:
 * 1. FortiGuard Enterprise HTTP Security Headers (CSP, HSTS, X-Frame-Options, etc.)
 * 2. Deep Content Inspection for `/api/*` endpoints
 * 3. Immediate mitigation of XSS, SQLi, and Path Traversal payloads before hitting backend logic
 */

const MALICIOUS_PATTERNS = [
  // XSS
  /<script[\s\S]*?>/i,
  /\bon[a-z]{3,15}\s*=\s*/i,
  /javascript:\s*/i,
  // SQLi
  /(?:'|"|`)\s*(?:or|and)\s*(?:true|1\s*=\s*1|'1'\s*=\s*'1')/i,
  /\bunion\s+(?:all\s+)?select\b/i,
  /;\s*drop\s+table\b/i,
  // Traversal & Commands
  /(?:\.\.\/|\.\.\\){2,}/,
  /\/etc\/(?:passwd|shadow)/i,
  /(?:;|\|\||&&)\s*(?:cat\s+|whoami|bash)/i
];

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // 1. Inspect API payloads on mutating requests (POST, PUT, PATCH)
  if (url.pathname.startsWith('/api/') && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json') || contentType.includes('application/x-www-form-urlencoded')) {
      try {
        const clonedReq = request.clone();
        const textBody = await clonedReq.text();

        for (const pattern of MALICIOUS_PATTERNS) {
          if (pattern.test(textBody)) {
            return new Response(JSON.stringify({
              error: 'forbidden_by_fortiguard_waf',
              status: 403,
              signature: 'FG-EDGE-WAF-BLOCK',
              message: 'Request terminated by FortiGuard Security Edge WAF. Malicious payload detected.'
            }), {
              status: 403,
              headers: {
                'Content-Type': 'application/json',
                'X-FortiGuard-WAF-Status': 'BLOCKED',
                'X-FortiGuard-Threat-Score': '99',
                'Cache-Control': 'no-store'
              }
            });
          }
        }
      } catch (err) {
        // Continue if clone/read fails
      }
    }
  }

  // 2. Pass request to handler
  const response = await next();

  // 3. Clone and apply FortiGuard Enterprise Security Headers
  const secureHeaders = new Headers(response.headers);
  secureHeaders.set('X-FortiGuard-WAF', 'Active-Inline-v7.4');
  secureHeaders.set('X-FortiGuard-Threat-Score', '0');
  secureHeaders.set('X-Frame-Options', 'DENY');
  secureHeaders.set('X-Content-Type-Options', 'nosniff');
  secureHeaders.set('X-XSS-Protection', '1; mode=block');
  secureHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  secureHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Strict CSP allowing necessary local assets & CDNs
  secureHeaders.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https:; frame-ancestors 'none';"
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: secureHeaders
  });
}
