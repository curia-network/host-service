# CORS Security Hardening Plan

**Created**: 2025-01-25  
**Status**: Research & Planning Phase  
**Purpose**: Restrict CORS headers from wildcard (*) to specific allowed origins  

## 🎯 **EXECUTIVE SUMMARY**

Currently, **ALL host service API endpoints** use overly permissive CORS headers (`origin || '*'`), allowing any website to make requests. With signature validation now working, we can safely restrict CORS to only allow requests from our own forum domain (`NEXT_PUBLIC_CURIA_FORUM_URL`).

**Current State**: All APIs accept requests from any origin  
**Proposed State**: APIs only accept requests from verified Curia forum domains  

---

## 🚨 **CURRENT SECURITY ISSUE**

### **Affected Endpoints (All use `origin || '*'`)**

```bash
src/app/api/auth/validate-session/route.ts    # Session validation
src/app/api/auth/generate-challenge/route.ts  # Auth challenges  
src/app/api/auth/create-anonymous/route.ts    # Anonymous auth
src/app/api/auth/verify-signature/route.ts    # Signature verification
src/app/api/communities/route.ts              # Community listings
src/app/api/user/route.ts                     # User data
src/app/api/community/route.ts                # Community actions
```

### **Current CORS Pattern (Vulnerable)**

```typescript
// ❌ CURRENT: Too permissive
const origin = request.headers.get('origin') || '';
response.headers.set('Access-Control-Allow-Origin', origin || '*');
```

**Risk**: Any malicious website can make requests to our APIs and potentially:
- Enumerate communities and user data
- Attempt authentication flows
- Probe for vulnerabilities
- Perform CSRF-style attacks

---

## 🔐 **PROPOSED SECURITY HARDENING**

### **New CORS Pattern (Secure)**

```typescript
// ✅ PROPOSED: Restricted to allowed origins
const origin = request.headers.get('origin') || '';
const allowedOrigins = [
  process.env.NEXT_PUBLIC_CURIA_FORUM_URL,
  process.env.NEXT_PUBLIC_HOST_SERVICE_URL, // Self-requests
  // Add production domains as needed
];

const corsOrigin = allowedOrigins.includes(origin) ? origin : null;
response.headers.set('Access-Control-Allow-Origin', corsOrigin || 'null');
```

### **Environment Variables Available**

```bash
# ✅ Already defined in .env
NEXT_PUBLIC_CURIA_FORUM_URL=http://localhost:3000
NEXT_PUBLIC_HOST_SERVICE_URL=http://localhost:3001
```

---

## 🛠️ **IMPLEMENTATION PLAN**

### **Phase 1: Create CORS Utility Function**

**File**: `host-service/src/lib/corsUtils.ts`

```typescript
/**
 * CORS Security Utilities
 * Centralized CORS handling for all API endpoints
 */

interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  maxAge?: number;
  allowCredentials?: boolean;
}

const DEFAULT_CORS_CONFIG: CorsConfig = {
  allowedOrigins: [
    process.env.NEXT_PUBLIC_CURIA_FORUM_URL || '',
    process.env.NEXT_PUBLIC_HOST_SERVICE_URL || '',
  ].filter(Boolean), // Remove empty strings
  allowedMethods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
  allowCredentials: false
};

/**
 * Validate if origin is allowed
 */
export function isOriginAllowed(origin: string, config?: Partial<CorsConfig>): boolean {
  const { allowedOrigins } = { ...DEFAULT_CORS_CONFIG, ...config };
  
  if (!origin) return false;
  
  // Exact match for security
  return allowedOrigins.includes(origin);
}

/**
 * Get CORS headers for response
 */
export function getCorsHeaders(origin: string, config?: Partial<CorsConfig>): Record<string, string> {
  const finalConfig = { ...DEFAULT_CORS_CONFIG, ...config };
  
  const corsOrigin = isOriginAllowed(origin, finalConfig) ? origin : 'null';
  
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': finalConfig.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': finalConfig.allowedHeaders.join(', '),
    'Access-Control-Max-Age': finalConfig.maxAge?.toString() || '86400',
    ...(finalConfig.allowCredentials && { 'Access-Control-Allow-Credentials': 'true' })
  };
}

/**
 * Apply CORS headers to NextResponse
 */
export function applyCorsHeaders(
  response: NextResponse, 
  origin: string, 
  config?: Partial<CorsConfig>
): NextResponse {
  const headers = getCorsHeaders(origin, config);
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Create CORS preflight response
 */
export function createCorsPreflightResponse(
  origin: string, 
  config?: Partial<CorsConfig>
): NextResponse {
  const headers = getCorsHeaders(origin, config);
  
  return new NextResponse(null, {
    status: 200,
    headers
  });
}

/**
 * Create CORS error response (for blocked origins)
 */
export function createCorsErrorResponse(origin: string): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Origin not allowed',
      allowedOrigins: DEFAULT_CORS_CONFIG.allowedOrigins 
    },
    { 
      status: 403,
      headers: {
        'Access-Control-Allow-Origin': 'null', // Explicitly deny
      }
    }
  );
}
```

### **Phase 2: Update API Endpoints**

**Pattern for all endpoints**:

```typescript
// BEFORE (vulnerable):
const origin = request.headers.get('origin') || '';
response.headers.set('Access-Control-Allow-Origin', origin || '*');

// AFTER (secure):
import { applyCorsHeaders, isOriginAllowed, createCorsErrorResponse } from '../../../lib/corsUtils';

const origin = request.headers.get('origin') || '';

// Early origin validation for high-security endpoints
if (origin && !isOriginAllowed(origin)) {
  return createCorsErrorResponse(origin);
}

// ... existing logic ...

// Apply secure CORS headers
return applyCorsHeaders(response, origin);
```

### **Phase 3: Specific Endpoint Updates**

**Priority 1: Authentication Endpoints (Highest Risk)**
- `src/app/api/auth/verify-signature/route.ts`
- `src/app/api/auth/validate-session/route.ts`
- `src/app/api/auth/generate-challenge/route.ts`
- `src/app/api/auth/create-anonymous/route.ts`

**Priority 2: Data Endpoints**
- `src/app/api/communities/route.ts`
- `src/app/api/user/route.ts`
- `src/app/api/community/route.ts`

**Example Update (auth/verify-signature/route.ts)**:

```typescript
import { 
  applyCorsHeaders, 
  isOriginAllowed, 
  createCorsErrorResponse,
  createCorsPreflightResponse 
} from '../../../lib/corsUtils';

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin') || '';
    
    // 🆕 NEW: Early origin validation for auth endpoints
    if (origin && !isOriginAllowed(origin)) {
      console.warn(`[auth] Blocked request from unauthorized origin: ${origin}`);
      return createCorsErrorResponse(origin);
    }
    
    // ... existing auth logic ...
    
    const response = NextResponse.json(responseData);
    
    // 🆕 NEW: Apply secure CORS headers
    return applyCorsHeaders(response, origin);
    
  } catch (error) {
    const errorResponse = NextResponse.json({/* error data */});
    return applyCorsHeaders(errorResponse, origin);
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  return createCorsPreflightResponse(origin);
}
```

---

## 🚀 **MIGRATION STRATEGY**

### **Phase A: Preparation (Week 1)**
1. **Create corsUtils.ts** utility functions
2. **Add environment variable validation**
3. **Create unit tests** for CORS utilities
4. **Document allowed origins** for production

### **Phase B: Gradual Rollout (Week 2)**
1. **Start with auth endpoints** (highest risk)
2. **Deploy with logging** to monitor blocked requests
3. **Validate iframe-api-proxy** still works
4. **Monitor for legitimate blocked requests**

### **Phase C: Full Deployment (Week 3)**
1. **Update all remaining endpoints**
2. **Add production domain allowlist**
3. **Remove old CORS code**
4. **Update documentation**

### **Phase D: Monitoring (Ongoing)**
1. **Monitor CORS block logs**
2. **Alert on unauthorized access attempts**
3. **Regular security reviews**

---

## 🔧 **CONFIGURATION OPTIONS**

### **Development Environment**
```typescript
// .env.development
NEXT_PUBLIC_CURIA_FORUM_URL=http://localhost:3000
NEXT_PUBLIC_HOST_SERVICE_URL=http://localhost:3001

// Allows both local forum and host service
```

### **Production Environment**
```typescript
// .env.production
NEXT_PUBLIC_CURIA_FORUM_URL=https://forum.curia.network
NEXT_PUBLIC_HOST_SERVICE_URL=https://curia.network

// Additional production domains if needed:
// ADDITIONAL_ALLOWED_ORIGINS=https://app.curia.network,https://embed.curia.network
```

### **Flexible Configuration**
```typescript
// Support for multiple environments
const allowedOrigins = [
  process.env.NEXT_PUBLIC_CURIA_FORUM_URL,
  process.env.NEXT_PUBLIC_HOST_SERVICE_URL,
  ...(process.env.ADDITIONAL_ALLOWED_ORIGINS?.split(',') || [])
].filter(Boolean);
```

---

## 🧪 **TESTING STRATEGY**

### **Unit Tests**
```typescript
describe('CORS Utilities', () => {
  it('should allow requests from forum URL', () => {
    expect(isOriginAllowed('http://localhost:3000')).toBe(true);
  });

  it('should block requests from unauthorized origins', () => {
    expect(isOriginAllowed('https://malicious.com')).toBe(false);
  });

  it('should generate correct CORS headers', () => {
    const headers = getCorsHeaders('http://localhost:3000');
    expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000');
  });
});
```

### **Integration Tests**
```typescript
describe('API CORS Security', () => {
  it('should accept requests from allowed origins', async () => {
    const response = await fetch('/api/communities', {
      headers: { 'Origin': 'http://localhost:3000' }
    });
    expect(response.status).not.toBe(403);
  });

  it('should block requests from disallowed origins', async () => {
    const response = await fetch('/api/communities', {
      headers: { 'Origin': 'https://malicious.com' }
    });
    expect(response.status).toBe(403);
  });
});
```

### **Manual Testing Checklist**
- [ ] Forum iframe can make API requests
- [ ] Direct browser requests work from forum domain
- [ ] Requests from other domains are blocked
- [ ] OPTIONS preflight requests work correctly
- [ ] Error responses include proper CORS headers

---

## 📊 **SECURITY BENEFITS**

### **Before (Current State)**
```
❌ Any website can call APIs
❌ No origin validation
❌ Potential for CSRF attacks
❌ Data enumeration possible
❌ No audit trail of blocked requests
```

### **After (Hardened State)**
```
✅ Only trusted domains can call APIs
✅ Strict origin validation
✅ CSRF protection via origin checking
✅ Protected against data enumeration
✅ Logging of unauthorized access attempts
✅ Centralized CORS configuration
```

---

## 🚨 **RISKS & CONSIDERATIONS**

### **Breaking Changes**
- **iframe-api-proxy**: Must originate from allowed domain (should be fine)
- **Third-party integrations**: May need explicit allowlisting
- **Development setup**: Local domains must match env vars

### **Monitoring Required**
- **Blocked request logging**: Identify legitimate requests being blocked
- **Error rate monitoring**: Watch for increased 403 errors
- **Performance impact**: Minimal overhead from origin checking

### **Rollback Plan**
- **Keep old CORS code commented** during initial rollout
- **Feature flag approach**: Environment variable to enable/disable strict CORS
- **Quick rollback**: Simple code change to restore wildcard behavior

---

## 🎯 **SUCCESS CRITERIA**

### **Security Improvements**
- ✅ **Zero unauthorized domains** can access APIs
- ✅ **All legitimate requests** continue to work
- ✅ **CORS errors logged** for security monitoring
- ✅ **iframe-api-proxy functionality** preserved

### **Operational Requirements**
- ✅ **Zero downtime deployment**
- ✅ **Easy configuration** via environment variables
- ✅ **Clear error messages** for debugging
- ✅ **Performance maintained** (minimal overhead)

---

## 📚 **IMPLEMENTATION REFERENCES**

### **Current Vulnerable Pattern**
```typescript
// Found in ALL 7 API endpoints:
response.headers.set('Access-Control-Allow-Origin', origin || '*');
```

### **Files Requiring Updates**
1. `src/app/api/auth/validate-session/route.ts` (3 instances)
2. `src/app/api/auth/generate-challenge/route.ts` (3 instances)  
3. `src/app/api/auth/create-anonymous/route.ts` (3 instances)
4. `src/app/api/auth/verify-signature/route.ts` (3 instances)
5. `src/app/api/communities/route.ts` (11 instances)
6. `src/app/api/user/route.ts` (4 instances)
7. `src/app/api/community/route.ts` (4 instances)

**Total**: 31 CORS header modifications across 7 endpoints

---

## 🚧 **IMPLEMENTATION TIMELINE**

### **Week 1: Foundation**
- Create `corsUtils.ts` with secure CORS functions
- Add comprehensive unit tests
- Validate environment variable configuration

### **Week 2: High-Priority Rollout**
- Update all authentication endpoints first
- Deploy with extensive logging
- Monitor for any blocked legitimate requests

### **Week 3: Complete Rollout**
- Update remaining data endpoints  
- Add production domain configuration
- Complete testing and validation

### **Week 4: Monitoring & Optimization**
- Set up security monitoring dashboards
- Document security improvements
- Plan for regular security reviews

---

**This CORS hardening will significantly improve the security posture of the host service by restricting API access to only trusted Curia domains, while maintaining full functionality for legitimate iframe-api-proxy requests.** 