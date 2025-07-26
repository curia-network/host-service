# SessionManager Cross-Domain Behavior Audit

**Date**: January 2025  
**Issue**: SessionManager behaves differently on curia.network vs third-party domains (e.g., neocities.org)  
**Symptoms**: 
- "(fallback)" sessions on third-party domains
- Sessions "forgetting" each other 
- Inconsistent session state between user profile menu and forum iframe

## Executive Summary

The SessionManager exhibits fundamentally different behavior when embedded on third-party domains compared to curia.network. This audit identifies the root causes and proposes solutions for cross-domain session state unification.

## 1. Direct Fetch Calls Audit

### 1.1 Methodology
Systematic search for fetch calls that bypass the iframe-api-proxy and may fail silently on third-party domains due to CSP restrictions.

### 1.2 Critical Findings: Multiple Components Bypass Proxy

**🚨 HIGH PRIORITY ISSUE**: Several embed components make direct fetch calls with relative URLs that resolve to the wrong domain on third-party sites.

**Affected Components:**
- `SessionCheckStep.tsx` → `fetch('/api/auth/validate-session')` 
- `AuthenticationStep.tsx` → `fetch('/api/auth/create-anonymous')`
- `SignatureVerificationStep.tsx` → `fetch('/api/auth/generate-challenge')`, `fetch('/api/auth/verify-signature')`
- `CommunitySelectionStep.tsx` → `fetch('/api/communities')`
- Several others in `/components/auth/` and `/components/universal-profile/`

**URL Resolution Problem:**
- **On curia.network**: `/api/auth/sessions` resolves to `https://curia.network/api/auth/sessions` ✅
- **On neocities.org**: `/api/auth/sessions` resolves to `https://curia-boards.neocities.org/api/auth/sessions` ❌ (404!)

**Impact**: These calls fail silently on third-party domains, causing:
- Session validation failures → "(fallback)" display
- Authentication failures
- Community loading failures

### 1.3 SessionManager Exception
**SessionManager correctly implements dual-path logic:**
```typescript
if (this.apiProxy) {
  // Use iframe-api-proxy for CSP compliance
  const response = await this.apiProxy.makeAuthenticatedRequest('/api/auth/sessions', activeToken);
} else {
  // Fallback to direct fetch with absolute URL
  const apiUrl = this.hostServiceUrl ? `${this.hostServiceUrl}/api/auth/sessions` : '/api/auth/sessions';
  const response = await fetch(apiUrl, ...);
}
```

**However**, many components don't follow this pattern.

## 2. LocalStorage Logic Analysis

### 2.1 Current Architecture
**SessionManager Design:**
- **Singleton pattern** with domain-specific localStorage: `localStorage.getItem('curia_sessions')`
- **Key**: `'curia_sessions'` stored in the **embed domain's** localStorage
- **Periodic sync** every 30 seconds with database via API calls
- **Cross-tab sync** via `storage` events (same-domain only)

### 2.2 Domain-Specific Behavior Differences

**✅ On curia.network (same domain):**
- localStorage: `curia.network` domain
- API calls: relative URLs resolve to `curia.network/api/*` 
- SessionManager sync: Works perfectly
- Session persistence: ✅ Reliable

**❌ On neocities.org (third-party domain):**
- localStorage: `neocities.org` domain (isolated from curia.network)
- API calls: relative URLs resolve to `neocities.org/api/*` (404s!)
- SessionManager sync: Fails silently → periodic data loss
- Session persistence: ❌ Unreliable, sessions "disappear"

### 2.3 URL Resolution and Environment Variables

**NEXT_PUBLIC_HOST_SERVICE_URL Usage:**
- Properly used in: `app/embed/page.tsx`, `components/configurator/CodeGenerator.tsx`
- **Missing from many components**: Most embed components use relative URLs

**Root Cause**: Components assume they're running on the same domain as the API endpoints.

**Evidence:**
```typescript
// ❌ WRONG: Resolves to third-party domain
fetch('/api/auth/validate-session', ...)

// ✅ CORRECT: Should use absolute URL or proxy
fetch(`${process.env.NEXT_PUBLIC_HOST_SERVICE_URL}/api/auth/validate-session`, ...)
// OR
apiProxy.makeDirectRequest('/api/auth/validate-session', ...)
```

## 3. Cross-Domain Session State Challenges

### 3.1 Browser Security Model
**Domain Isolation Reality:**
- **localStorage** is strictly domain-isolated by browsers
- **curia.network** localStorage ≠ **neocities.org** localStorage  
- **iframe (`embed.curia.network`)** has its own separate localStorage
- **No native cross-domain localStorage sharing** (by design)

### 3.2 Current Synchronization Mechanisms

**Same-Domain Sync (Works on curia.network):**
```typescript
// Cross-tab sync via storage events
window.addEventListener('storage', (e) => {
  if (e.key === 'curia_sessions') {
    // Sync session state across tabs
  }
});
```

**Cross-Domain Sync (Broken on third-party domains):**
- ❌ **No iframe-to-parent session bridge**
- ❌ **No postMessage session synchronization**
- ❌ **API calls fail** due to relative URL resolution

### 3.3 Race Conditions and Timing Issues

**The 30-Second Session Loss Cycle:**
```typescript
// Every 30 seconds in SessionManager:
setInterval(() => {
  this.syncWithDatabase(); // 🚨 Can fail on third-party domains
}, 30000);

// If API call fails:
// 1. No database sessions retrieved
// 2. mergeSessionStates() gets empty dbSessions array  
// 3. localStorage gets overwritten with incomplete data
// 4. Sessions "disappear"
```

**Merge Logic Vulnerability:**
```typescript
private mergeSessionStates(localSessions: SessionData[], dbSessions: SessionData[]): SessionData[] {
  // 🚨 If dbSessions is empty due to failed API call,
  // only localSessions survive, but then periodic sync overwrites them
}
```

## 4. Proposed Solutions

### 4.1 Option A: Fix All Components to Use Proxy (Recommended)
**Scope**: Update all components making direct fetch calls to use iframe-api-proxy

**Implementation:**
```typescript
// Instead of:
const response = await fetch('/api/auth/validate-session', {/*...*/});

// Use:
const response = await apiProxy.makeDirectRequest('/api/auth/validate-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: { sessionToken }
});
```

**Pros:** ✅ Leverages existing proxy infrastructure, ✅ CSP compliant, ✅ Minimal architecture changes
**Cons:** ❌ Requires updating ~15+ components

### 4.2 Option B: iframe-based Session Storage Proxy  
**Scope**: Make iframe the authoritative session storage, sync via postMessage

**Implementation:**
- iframe stores sessions in its localStorage (`embed.curia.network` domain)
- Embed script proxies all session operations via postMessage
- SessionManager becomes a client to iframe session store

**Pros:** ✅ True cross-domain session unification, ✅ iframe has reliable API access
**Cons:** ❌ Major architectural change, ❌ Complex postMessage protocol

### 4.3 Option C: Hybrid Approach - Enhanced URL Resolution
**Scope**: Make all components domain-aware with automatic URL resolution

**Implementation:**
```typescript
// Auto-detect environment and use appropriate URLs
const apiUrl = isEmbedContext() 
  ? await proxyRequest('/api/auth/validate-session', options)
  : '/api/auth/validate-session';
```

**Pros:** ✅ Backwards compatible, ✅ Minimal component changes
**Cons:** ❌ Still complex, ❌ Requires environment detection

## 5. Implementation Recommendations

### 5.1 ✅ COMPLETED: Fixed SessionManager Race Condition
**Root Cause**: SessionManager called `syncWithDatabase()` during constructor, before `configure()` set up the API proxy and host URL.

**Solution Implemented**: Deferred initial database sync until after `configure()` is called.

**Changes Made**:
```typescript
// OLD: Sync immediately in constructor (before configuration)
private constructor() {
  this.setupPeriodicSync(); // Called syncWithDatabase() too early
}

// NEW: Defer sync until properly configured  
private constructor() {
  this.setupPeriodicTimer(); // Only setup timer, no immediate sync
}

public configure(hostServiceUrl: string, apiProxy?: any): void {
  this.hostServiceUrl = hostServiceUrl;
  this.apiProxy = apiProxy || null;
  
  // NOW trigger initial sync with proper configuration
  if (this.storage.activeSessions.length > 0) {
    this.syncWithDatabase();
  }
}
```

### 5.2 Impact
This fix should resolve:
- ✅ "(fallback)" sessions on third-party domains
- ✅ Sessions "forgetting" each other due to failed database sync
- ✅ Inconsistent session state between user profile menu and forum iframe

### 5.3 ❌ CANCELLED: Component API Call Updates
**Previous assumption was incorrect**: Components like `SessionCheckStep.tsx`, `UPProfileDisplay.tsx` run **inside the iframe** on `curia.network`, not on third-party domains. They don't have URL resolution issues.

**Actual issue was**: SessionManager initialization race condition (now fixed).

## 6. Questions for Review

### 6.1 Technical Decisions
1. **Should we update all components to use the proxy** (Option A), or implement a hybrid solution (Option C)?
2. **How should we handle components that need to work both in embed and non-embed contexts?** (e.g., shared components)
3. **Should SessionManager periodic sync be disabled on third-party domains** until API calls are fixed?

### 6.2 Architecture Questions  
1. **Do we want true cross-domain session unification** (iframe as session authority), or is fixing API calls sufficient?
2. **How should we handle the trade-off between embed performance and reliability?** (More proxy calls = slower, but more reliable)
3. **Should we implement session state fallback mechanisms** when database sync fails?

### 6.3 Implementation Questions
1. **What's the fastest path to fix the "(fallback)" issue on third-party domains?**
2. **Should we create a wrapper hook/utility** for embed API calls to reduce component complexity?
3. **How do we ensure backwards compatibility** while rolling out these changes?

---

*This document will be updated as the audit progresses.* 