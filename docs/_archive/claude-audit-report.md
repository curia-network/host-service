 🚨 CURIA ECOSYSTEM SECURITY & ARCHITECTURE AUDIT REPORT

  EXECUTIVE SUMMARY

  Your suspicions were absolutely correct - there are indeed GAPING security holes throughout the system. The "untethering" from Common Ground created a
  cryptographically sophisticated facade that completely bypasses all security validations in production. This is a high-risk scenario disguised as a secure system.

  ---
  🏗️ ARCHITECTURE OVERVIEW

  Component Ecosystem

  Customer Website
      ↓ (embed script)
  host-service (localhost:3001)
      ↓ (iframe embed)
  curia (localhost:3000)
      ↓ (postMessage API)
  iframe-api-proxy ← cg-plugin-lib → cg-plugin-lib-host
      ↓ (crypto signing)
  [SUPPOSED TO VALIDATE SIGNATURES BUT DOESN'T]

  Original Common Ground vs Curia

  - Common Ground: Plugins sign requests → Host validates signatures → Access granted
  - Curia: Plugins sign requests → Host ignores signatures → Access granted anyway

  ---
  🔥 CRITICAL SECURITY VULNERABILITIES

  1. SIGNATURE VALIDATION COMPLETELY DISABLED

  Severity: CRITICAL
  Location: host-service/src/lib/PluginHost.ts:75-76

  // TODO: Validate signature using @curia_/cg-plugin-lib-host
  // For now, we'll skip signature validation during development

  The Problem:
  - All plugin requests are accepted without signature verification
  - The entire cryptographic signing infrastructure exists but is bypassed
  - No actual security between plugins and host service
  - Attackers can make arbitrary API calls by mimicking the message format

  Impact: Complete bypass of authentication - anyone can call any API method

  2. NO PUBLIC KEY VALIDATION BETWEEN COMPONENTS

  Severity: CRITICAL

  You correctly identified this - host-service and curia don't share public keys:
  - host-service doesn't know forum iframe's public key
  - curia doesn't know host service's public key
  - Components communicate freely without mutual authentication
  - No certificate/public key exchange mechanism

  3. WIDE-OPEN CORS POLICIES

  Severity: HIGH
  Location: Multiple files

  // In ApiProxyServer:
  if (allowedOrigins.length === 0) {
    return true; // Allow all origins during development
  }

  // In API routes:
  response.headers.set('Access-Control-Allow-Origin', origin || '*');

  Issues:
  - Default configuration allows ALL origins (*)
  - No origin validation in development mode
  - Missing CORS preflight validation
  - Headers allow all methods and headers

  4. IFRAME SANDBOX BYPASS

  Severity: HIGH
  Location: host-service/src/lib/embed/services/auth/AuthenticationService.ts:221

  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');

  Problem: allow-popups-to-escape-sandbox completely defeats iframe sandboxing
  - Allows embedded content to open unrestricted popups
  - Bypasses all sandbox security restrictions
  - Creates XSS attack vectors

  5. POSTMESSAGE WITHOUT ORIGIN VALIDATION

  Severity: HIGH
  Locations: Throughout iframe-api-proxy

  source.postMessage(message, '*'); // Sends to any origin
  window.parent.postMessage(data, '*'); // No target origin specified

  Issues:
  - Messages sent to wildcard origins (*)
  - No validation of message sender origins
  - Susceptible to iframe injection attacks
  - Cross-frame data leakage

  6. SESSION TOKEN EXPOSURE

  Severity: MEDIUM-HIGH
  Location: API proxy logs

  console.log('[AuthenticationService] Auth context set:', this.authContext);
  // Logs contain: sessionToken: '2034f22427424b5df69ec8fa9167427766c1efe1a0063da3234cf069e8718fc8'

  Problem: Session tokens logged in plaintext to browser console

  ---
  ⚡ PERFORMANCE CRITICAL ISSUES

  1. CATASTROPHIC RETRY STORM

  Severity: CRITICAL
  Location: AuthenticationService.ts:96-174

  19 API requests in 3 seconds per user authentication:
  - Phase 1: 10 requests (every 50ms)
  - Phase 2: 4 requests (every 100ms)
  - Phase 3: 4 requests (every 200ms)
  - Phase 4: 1 final request

  Impact:
  - DDoS-like behavior on your own API
  - Server overwhelm with concurrent users
  - Expensive API rate limiting bypass
  - Poor user experience

  2. MEMORY LEAKS IN IFRAME MANAGEMENT

  Severity: HIGH

  - Event listeners not cleaned up properly
  - Iframe references persist after destruction
  - API proxy pending requests accumulate
  - Cross-tab session listeners multiply

  3. MASSIVE CODE DUPLICATION

  Severity: MEDIUM

  Entire curia/ codebase duplicated as curia-cg/:
  - 339-line files identical between projects
  - Double bundle sizes
  - Maintenance nightmare
  - Inconsistent bug fixes

  ---
  🏚️ CODE QUALITY DISASTERS

  1. ABANDONED TODO ARCHITECTURE

  Critical TODOs never implemented:

  // TODO: Validate signature using @curia_/cg-plugin-lib-host
  // TODO: Implement local UP verification logic
  // TODO: Add caching strategy (Redis/memory cache)
  // TODO: Implement signature validation

  30+ critical TODOs across security-sensitive areas

  2. INCONSISTENT ERROR HANDLING

  - Mix of custom errors and generic throws
  - No centralized error logging
  - Errors expose internal system details
  - Missing error boundaries

  3. TYPE SAFETY ABANDONED

  // Excessive `any` usage:
  params?: any;
  data?: any;
  settings?: Record<string, any>;

  50+ instances of any types in security-critical paths

  ---
  🎯 HIGH-IMPACT IMPROVEMENTS

  IMMEDIATE (DO TODAY)

  1. Enable Signature Validation

  // In PluginHost.ts:75 - REMOVE these lines:
  // TODO: Validate signature using @curia_/cg-plugin-lib-host
  // For now, we'll skip signature validation during development

  // ADD this implementation:
  const isValid = await CgPluginLibHost.verifySignature(request);
  if (!isValid) {
    return { success: false, error: 'Invalid signature' };
  }

  2. Fix CORS Immediately

  // Replace ALL wildcard CORS:
  response.headers.set('Access-Control-Allow-Origin', '*');
  // With explicit origins:
  response.headers.set('Access-Control-Allow-Origin',
    process.env.ALLOWED_ORIGINS || 'https://your-production-domain.com');

  3. Restrict Iframe Sandbox

  // REMOVE this dangerous permission:
  'allow-popups-to-escape-sandbox'
  // Use restrictive sandbox:
  'allow-scripts allow-same-origin allow-forms'

  4. Add Origin Validation

  // In all postMessage calls:
  iframe.contentWindow.postMessage(message, 'https://specific-origin.com');
  // NOT:
  iframe.contentWindow.postMessage(message, '*');

  CRITICAL (THIS WEEK)

  5. Reduce Retry Madness

  Replace 19-attempt retry with reasonable exponential backoff:
  const delays = [100, 300, 700, 1500]; // 4 attempts max

  6. Implement Public Key Exchange

  Create secure handshake between host-service and curia:
  interface ComponentHandshake {
    publicKey: string;
    componentId: string;
    timestamp: number;
    signature: string; // Self-signed with private key
  }

  7. Fix Memory Leaks

  Add proper cleanup in all service destructors:
  destroy(): void {
    this.messageListener && window.removeEventListener('message', this.messageListener);
    this.sessionSubscription?.();
    this.pendingRequests.clear();
  }

  HIGH-IMPACT (THIS MONTH)

  8. Eliminate Code Duplication

  - Extract shared services into @curia_/shared-services package
  - Create single source of truth for authentication
  - Implement monorepo architecture

  9. Add Request Rate Limiting

  class RateLimiter {
    private requests = new Map<string, number[]>();

    isAllowed(identifier: string, maxRequests = 5, windowMs = 60000): boolean {
      // Implementation
    }
  }

  10. Implement Security Headers

  // Add to all API responses:
  'Content-Security-Policy': "default-src 'self'; frame-ancestors 'self'"
  'X-Frame-Options': 'SAMEORIGIN'
  'X-Content-Type-Options': 'nosniff'
  'Referrer-Policy': 'strict-origin-when-cross-origin'

  ---
  🏆 LONG-TERM ARCHITECTURAL IMPROVEMENTS

  1. Implement Zero-Trust Architecture

  - Every component validates every other component
  - Public key infrastructure (PKI) between all services
  - Mutual TLS for service-to-service communication

  2. Message Authentication Codes (MAC)

  interface SecureMessage {
    payload: any;
    timestamp: number;
    hmac: string; // HMAC-SHA256 of payload + timestamp + shared secret
  }

  3. Add Security Monitoring

  - Log all authentication attempts
  - Monitor for signature validation failures
  - Alert on suspicious cross-origin requests

  4. Implement Content Security Policy

  - Restrict iframe sources
  - Block inline scripts
  - Prevent XSS attacks

  ---
  🚨 RISK ASSESSMENT

  CURRENT RISK LEVEL: CRITICAL

  | Vulnerability           | Severity | Exploitability | Impact                 |
  |-------------------------|----------|----------------|------------------------|
  | No signature validation | Critical | Trivial        | Complete system bypass |
  | CORS wildcard           | High     | Easy           | Data exfiltration      |
  | Iframe sandbox bypass   | High     | Medium         | XSS attacks            |
  | Session token logging   | Medium   | Easy           | Token theft            |

  EXPLOIT SCENARIOS

  1. Plugin Impersonation Attack

  // Attacker can call any API without valid signatures:
  window.parent.postMessage({
    type: 'api_request',
    method: 'giveRole',
    params: { roleId: 'admin', userId: 'attacker' }
  }, '*');

  2. Cross-Origin Data Theft

  // Malicious site can read iframe data:
  iframe.contentWindow.postMessage({ type: 'get_session_token' }, '*');

  3. Iframe Escape Attack

  // Sandbox bypass allows unrestricted popup:
  window.open('javascript:alert(parent.sessionToken)', '_blank');

  ---
  VERDICT

  You're running a sophisticated cryptographic system with all security turned off. It's like building a bank vault and leaving the door wide open with a sign
  saying "free money inside."

  The good news: The security infrastructure exists - you just need to enable it.

  The bad news: You're currently completely vulnerable to trivial attacks.

  Priority: Fix signature validation and CORS TODAY. Everything else can wait, but those two issues are critical vulnerabilities in production.