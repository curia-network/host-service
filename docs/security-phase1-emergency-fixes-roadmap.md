# 🚨 Security Phase 1: Emergency Fixes Roadmap

**Date**: January 2025  
**Status**: 📋 **Planning Phase**  
**Goal**: Activate existing security infrastructure to prevent critical vulnerabilities  
**Risk Level**: CRITICAL - Production system currently has no authentication

---

## 🎯 **Executive Summary**

**Current State**: Sophisticated cryptographic security system exists but is **completely disabled**  
**Target State**: Activate signature validation, restrict CORS, secure credential storage  
**Timeline**: 1-2 days (emergency fixes)  
**Impact**: Transform from "no security" to "production-ready security"

---

## 🏗️ **What We're Actually "Activating"**

### **Existing Security Infrastructure (Currently Disabled)**

**✅ Already Built & Ready:**
- `@curia_/cg-plugin-lib-host` package with full signature verification
- `@curia_/cg-plugin-lib` package with message signing capabilities  
- RSA public/private key infrastructure in .env files
- CORS origin validation functions (`isOriginAllowed`)
- PostMessage security patterns (just need to add specific origins)

**❌ Currently Bypassed:**
```typescript
// TODO: Validate signature using @curia_/cg-plugin-lib-host
// For now, we'll skip signature validation during development
```

**The Reality:** We have a **complete cryptographic system** but it's commented out with TODOs.

---

## 🔧 **Phase 1: Critical Vulnerabilities (Emergency Fixes)**

### **Fix #1: Enable Signature Validation**
**Files**: `host-service/src/lib/PluginHost.ts:75-76`  
**Current**: All API requests accepted without validation  
**Target**: Every plugin request must be cryptographically signed and verified

### **Fix #2: Restrict CORS Origins** 
**Files**: 17+ API route files with `Access-Control-Allow-Origin: '*'`  
**Current**: Any website can call our APIs  
**Target**: Only specific origins (localhost:3000, localhost:3001, production domains)

### **Fix #3: Secure Credential Storage**
**Files**: `.env` files with hardcoded private keys  
**Current**: Private keys in version control  
**Target**: Environment variables with proper secrets management

---

## 📋 **Prerequisites & Preparation**

### **Step 0: Pre-Implementation Checklist**

#### **🔍 Inventory Existing Security Assets**
- [ ] Verify `@curia_/cg-plugin-lib-host` package is installed and working
- [ ] Confirm public/private key pairs in `.env` files are valid
- [ ] Identify all API routes that need CORS restriction  
- [ ] Map all `postMessage` calls that need origin specification

#### **🔑 Key Infrastructure Requirements**
- [ ] **Public Key Exchange**: How do host-service and curia share public keys?
- [ ] **Origin Whitelist**: What are the allowed origins for each environment?
- [ ] **Secrets Management**: Where will production private keys be stored?
- [ ] **Error Handling**: How do we handle signature validation failures gracefully?

#### **🧪 Testing Environment Setup**
- [ ] Local development with signature validation enabled
- [ ] CORS testing with restricted origins
- [ ] Fallback mechanisms if signature validation fails

---

## 🛠️ **Implementation Plan**

### **Phase 1A: Enable Signature Validation (Day 1)**

#### **Step 1.1: Activate CgPluginLibHost**
**Location**: `host-service/src/lib/PluginHost.ts:75-76`

**Current Code:**
```typescript
// TODO: Validate signature using @curia_/cg-plugin-lib-host
// For now, we'll skip signature validation during development
```

**Target Implementation:**
```typescript
// Import the signature validation library
import { CgPluginLibHost } from '@curia_/cg-plugin-lib-host';

// In handleRequest method:
try {
  // Validate signature before processing request
  const isValid = await CgPluginLibHost.verifySignature({
    message: request,
    signature: request.signature,
    publicKey: this.getPluginPublicKey(request.pluginId)
  });
  
  if (!isValid) {
    return {
      success: false,
      error: 'Invalid signature - request rejected',
      code: 'SIGNATURE_INVALID'
    };
  }
  
  // Continue with existing request processing...
} catch (error) {
  console.error('[PluginHost] Signature validation error:', error);
  return {
    success: false,
    error: 'Signature validation failed',
    code: 'SIGNATURE_ERROR'
  };
}
```

**Key Questions:**
1. **How does `CgPluginLibHost.verifySignature()` work?** Need to examine the API
2. **Where do we get the plugin's public key?** Need public key exchange mechanism
3. **What's the message format for signatures?** Need to understand expected structure

#### **Step 1.2: Public Key Management**
**Challenge**: host-service needs to know each plugin's public key

**Options:**
1. **Static Configuration**: Hardcode known plugin public keys
2. **Dynamic Exchange**: Implement handshake protocol
3. **Environment Variables**: Store public keys in config

**Recommended Approach**: Start with static config, evolve to dynamic

#### **Step 1.3: Error Handling & Fallbacks**
**Critical**: What happens when signature validation fails?

**Error Scenarios:**
- Invalid signature → Reject request with clear error
- Missing signature → Reject request  
- Malformed signature → Reject request
- Public key not found → Reject request
- Signature validation service down → **THIS IS THE BIG QUESTION**

### **Phase 1B: Restrict CORS Origins (Day 2)**

#### **Step 1.4: Origin Whitelist Configuration**
**Create environment-specific origin lists:**

```typescript
// config/cors.ts
const ALLOWED_ORIGINS = {
  development: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  production: [
    'https://your-production-domain.com',
    'https://curia.network',
    // Add actual production origins
  ]
};
```

#### **Step 1.5: Systematic CORS Fix**
**Replace 17+ instances of:**
```typescript
response.headers.set('Access-Control-Allow-Origin', origin || '*');
```

**With:**
```typescript
const allowedOrigins = ALLOWED_ORIGINS[process.env.NODE_ENV] || [];
const isAllowed = allowedOrigins.includes(origin);
response.headers.set('Access-Control-Allow-Origin', isAllowed ? origin : 'null');
```

#### **Step 1.6: PostMessage Origin Specification**
**Replace 8+ instances of:**
```typescript
window.parent.postMessage(message, '*');
```

**With:**
```typescript
const targetOrigin = process.env.NEXT_PUBLIC_HOST_SERVICE_URL || 'http://localhost:3001';
window.parent.postMessage(message, targetOrigin);
```

### **Phase 1C: Secure Credential Storage (Day 2)**

#### **Step 1.7: Extract Private Keys from .env**
**Current**: Private keys hardcoded in `.env` files  
**Target**: Environment variables or secrets management

**Migration Steps:**
1. Move private keys to environment variables
2. Update code to read from `process.env.PRIVATE_KEY`
3. Remove keys from version control
4. Document secrets management for production

---

## 🧪 **Testing & Debugging Strategy**

### **Debugging Signature Validation**

#### **Debug Scenarios:**
1. **Valid Signature Success**: Request with correct signature should pass
2. **Invalid Signature Failure**: Tampered request should be rejected  
3. **Missing Signature Failure**: Unsigned request should be rejected
4. **Malformed Signature**: Garbage signature should be rejected gracefully

#### **Debug Tools Needed:**
```typescript
// Add debug logging for signature validation
console.log('[PluginHost] Validating signature for:', {
  pluginId: request.pluginId,
  method: request.method,
  hasSignature: !!request.signature,
  signatureLength: request.signature?.length,
  publicKeyAvailable: !!this.getPluginPublicKey(request.pluginId)
});
```

#### **Test Plan:**
1. **Enable signature validation in development**
2. **Test with curia plugin making real requests**
3. **Intentionally break signatures to test rejection**
4. **Monitor logs for validation attempts**

### **Debugging CORS Restrictions**

#### **CORS Debug Scenarios:**
1. **Localhost Access**: `localhost:3000` → `localhost:3001` should work
2. **Foreign Origin**: Random website should be blocked
3. **Preflight Requests**: OPTIONS requests should work
4. **Different Ports**: Test various port combinations

#### **Debug Tools:**
```typescript
// Add CORS debug logging
console.log('[CORS] Request from origin:', origin, {
  allowed: allowedOrigins,
  isAllowed: allowedOrigins.includes(origin),
  userAgent: request.headers.get('user-agent')
});
```

### **Debugging PostMessage Origins**

#### **Test PostMessage Communication:**
1. **Parent-Child Communication**: host-service ↔ curia iframe
2. **Cross-Origin Validation**: Messages should only go to expected origins
3. **Origin Mismatch**: Verify messages to wrong origins are blocked

---

## 🚨 **Risk Assessment & Rollback Plan**

### **Implementation Risks**

#### **High Risk: Signature Validation Breaking Everything**
**Symptom**: All plugin requests start failing  
**Root Cause**: Signature validation too strict or incorrectly implemented  
**Mitigation**: Feature flag to disable signature validation
**Rollback**: Comment out signature validation, return to TODO state

#### **Medium Risk: CORS Breaking Frontend**
**Symptom**: Frontend can't call APIs  
**Origin Issue**: Missing localhost origins or incorrect port numbers  
**Mitigation**: Start with permissive origins, gradually restrict
**Rollback**: Temporarily add `'*'` back to specific failing routes

#### **Low Risk: PostMessage Origin Issues**
**Symptom**: Iframe communication broken  
**Root Cause**: Wrong target origins specified  
**Mitigation**: Add fallback to current domain  
**Rollback**: Revert to `'*'` for PostMessage only

### **Production Deployment Strategy**

#### **Staged Rollout:**
1. **Development**: Full security enabled, extensive testing
2. **Staging**: Production-like environment with real traffic patterns  
3. **Production**: Blue-green deployment with immediate rollback capability

#### **Monitoring & Alerts:**
- API request failure rate spikes
- CORS rejection increases  
- Signature validation failure patterns
- User authentication issues

---

## 📊 **Success Criteria**

### **Phase 1 Complete When:**
- [ ] All plugin requests require valid signatures
- [ ] All API routes have restricted CORS origins
- [ ] Private keys moved out of version control
- [ ] No security vulnerabilities in audit categories 1-3
- [ ] All existing functionality still works
- [ ] Comprehensive debugging/monitoring in place

### **Acceptance Tests:**
- [ ] Valid plugin request with signature: **SUCCESS** 
- [ ] Invalid plugin request: **REJECTED with clear error**
- [ ] Foreign origin API request: **BLOCKED by CORS**
- [ ] Localhost communication: **WORKS normally**  
- [ ] Production secrets: **Not in code repository**

---

## 🔄 **Next Phase Preview**

**Phase 2 (Week 2-3)**: 
- Public key exchange automation
- Iframe sandbox restrictions  
- Session token logging cleanup
- Memory leak fixes

**Phase 3 (Month 2)**:
- Zero-trust architecture
- Request rate limiting  
- Security monitoring
- Complete security audit

---

## ❓ **Critical Questions for Implementation**

### **Before We Start:**
1. **Public Key Storage**: Where should plugin public keys be stored?
2. **Signature Format**: What's the expected signature message format?
3. **Error UX**: How should signature validation failures appear to users?
4. **Performance**: What's the performance impact of signature validation?
5. **Backward Compatibility**: Do we need to support unsigned requests temporarily?

### **Production Readiness:**
1. **Secrets Management**: What system for production private keys?
2. **Origin Whitelist**: What are the actual production domains?
3. **Monitoring**: What alerts do we need for security events?
4. **Incident Response**: What's the plan if security is breached?

---

**🚨 CRITICAL**: This phase transforms the system from "no security" to "full security". Extensive testing required before production deployment. 