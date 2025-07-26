# Iframe API Proxy Signature Integration Research

**Created**: 2025-01-25  
**Status**: Research Phase  
**Purpose**: Design end-to-end signature validation for iframe-api-proxy system  

## 🎯 **EXECUTIVE SUMMARY**

This document outlines the complete implementation strategy for adding cryptographic signature validation to the `@curia_/iframe-api-proxy` system. This would provide **end-to-end signature validation** for all API communications, extending the proven plugin signature system to internal host service communications.

**Current State**: iframe-api-proxy bypasses CSP restrictions but lacks signature validation  
**Proposed State**: iframe-api-proxy with full signature validation matching plugin security standards  

---

## 📋 **PROBLEM STATEMENT**

### **Current Security Gap**

The iframe-api-proxy system currently has **two security levels**:

1. **✅ Plugin → Host Service**: Full signature validation (CgPluginLib → PluginHost)
2. **❌ Host Service → Backend**: No signature validation (ApiProxyClient → ApiProxyServer)

**Result**: Internal API calls (communities list, session validation) are unsigned and create a security vulnerability.

### **Why This Matters Now**

With the plugin signature system working perfectly, we have:
- ✅ **Proven patterns**: Data normalization, RSA-2048 signing, timestamp handling
- ✅ **Stable infrastructure**: Working postMessage communication with signatures
- ✅ **Security requirements**: Need for comprehensive API protection

---

## 🏗️ **CURRENT ARCHITECTURE ANALYSIS**

### **Iframe API Proxy Data Flow**

```
Customer Website (https://customer.com - Strict CSP)
├── InternalPluginHost (embed.js)
│   ├── ApiProxyClient ← INTEGRATION POINT #1 (Add Signing)
│   └── MessageRouter
│       ↓ PostMessage with ProxyApiRequestMessage
Iframe (https://curia.network)  
├── ApiProxyServer ← INTEGRATION POINT #2 (Add Validation)
│   ↓ Direct HTTP fetch() calls
└── Host Service APIs ← INTEGRATION POINT #3 (Backend Validation)
```

### **Key Code Locations**

**Client Side (Customer Page):**
- **File**: `iframe-api-proxy/src/client/ApiProxyClient.ts`
- **Method**: `makeApiRequest()` (lines 120-180)
- **Integration Point**: Add signing before sending ProxyApiRequestMessage

**Server Side (Iframe):**
- **File**: `iframe-api-proxy/src/server/ApiProxyServer.ts`  
- **Method**: `handleRequest()` (lines 95-150)
- **Integration Point**: Add signature validation before making API calls

**Message Types:**
- **File**: `iframe-api-proxy/src/types/MessageTypes.ts`
- **Integration Point**: Extend ProxyApiRequestMessage with signature field

---

## 🔐 **PROPOSED SIGNATURE SYSTEM**

### **Core Design Principles**

1. **Reuse Proven Patterns**: Leverage existing plugin signature system architecture
2. **Same Cryptography**: RSA-2048 + SHA-256 + RSASSA-PKCS1-v1_5 
3. **Minimal Changes**: Extend existing interfaces, don't rebuild
4. **Backward Compatibility**: Support unsigned mode during migration
5. **Configuration Driven**: Enable/disable via environment variables

### **Data Flow with Signatures**

```
Customer Website
├── InternalPluginHost
│   ├── ApiProxyClient.makeApiRequest()
│   │   ├── 1. Create signing data: {method, userId, communityId, timestamp}
│   │   ├── 2. Sign via fetch('/api/sign') call to Curia
│   │   ├── 3. Add signature to ProxyApiRequestMessage
│   │   └── 4. Send signed message via postMessage
│       ↓ PostMessage with SIGNED ProxyApiRequestMessage
Iframe 
├── ApiProxyServer.handleRequest()
│   ├── 5. Extract signature from ProxyApiRequestMessage
│   ├── 6. Reconstruct original signing data
│   ├── 7. Validate signature using Web Crypto API
│   ├── 8. Only proceed if signature valid
│   └── 9. Make API call with validated request
└── Host Service APIs (receives validated requests)
```

---

## 🛠️ **DETAILED IMPLEMENTATION PLAN**

### **Phase 1: Message Type Extensions**

**File**: `iframe-api-proxy/src/types/MessageTypes.ts`

```typescript
/**
 * Extended message with signature support
 */
export interface ProxyApiRequestMessage extends BaseMessage {
  type: MessageType.PROXY_API_REQUEST;
  endpoint: string;
  payload: ApiRequest;
  signature?: string;        // ← NEW: Cryptographic signature
  signatureData?: {          // ← NEW: Metadata for validation
    algorithm: string;       // "RSA-2048"
    hash: string;           // "SHA-256"
    timestamp: number;      // For replay protection
  };
}
```

**Integration Point**: Extend existing message structure without breaking changes

### **Phase 2: Client-Side Signing (ApiProxyClient)**

**File**: `iframe-api-proxy/src/client/ApiProxyClient.ts`

**Method**: `makeApiRequest()` - Insert signing logic before message send

```typescript
/**
 * Enhanced makeApiRequest with signature support
 */
public async makeApiRequest(request: ApiRequest): Promise<ApiResponse> {
  // ... existing validation logic ...

  const requestId = generateRequestId();
  const startTime = Date.now();

  // 🆕 NEW: Sign the request if signing is enabled
  let signature: string | undefined;
  let signatureData: any = undefined;
  
  if (this.config.enableSigning) {
    const signingResult = await this.signRequest(request, requestId, startTime);
    signature = signingResult.signature;
    signatureData = signingResult.metadata;
  }

  // Create proxy request message with signature
  const proxyMessage: ProxyApiRequestMessage = {
    type: MessageType.PROXY_API_REQUEST,
    requestId,
    endpoint: getEndpointForMethod(request.method),
    payload: request,
    signature,           // ← NEW
    signatureData,       // ← NEW
    timestamp: startTime
  };

  // ... rest of existing logic ...
}

/**
 * Sign API request using host signing service
 */
private async signRequest(
  request: ApiRequest, 
  requestId: string, 
  timestamp: number
): Promise<{signature: string, metadata: any}> {
  
  // Prepare signing data (match plugin system format)
  const signingData = {
    method: request.method,
    userId: request.userId,
    communityId: request.communityId,
    params: request.params,
    requestId,
    timestamp
  };

  // Call signing service (reuse existing infrastructure)
  const response = await fetch(this.config.signEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signingData)
  });

  if (!response.ok) {
    throw new Error(`Signing failed: ${response.status}`);
  }

  const result = await response.json();
  
  return {
    signature: result.signature,
    metadata: {
      algorithm: 'RSA-2048',
      hash: 'SHA-256', 
      timestamp
    }
  };
}
```

**Configuration Extension**:

```typescript
export interface ProxyClientConfig {
  // ... existing config ...
  
  /** Enable signature validation */
  enableSigning?: boolean;
  
  /** Signing endpoint URL */
  signEndpoint?: string;
  
  /** Public key for verification */
  publicKey?: string;
}
```

**Integration Point**: Insert in `makeApiRequest()` method after line 140 (before `sendRequestToIframe()`)

### **Phase 3: Server-Side Validation (ApiProxyServer)**

**File**: `iframe-api-proxy/src/server/ApiProxyServer.ts`

**Method**: `handleRequest()` - Insert validation logic before API call

```typescript
/**
 * Enhanced handleRequest with signature validation
 */
private async handleRequest(
  message: ProxyApiRequestMessage, 
  source: Window
): Promise<void> {
  
  // 🆕 NEW: Validate signature if present
  if (this.config.requireSignatures || message.signature) {
    const isValid = await this.validateSignature(message);
    
    if (!isValid) {
      console.error('[ApiProxyServer] ❌ Signature validation failed');
      this.sendErrorResponse(source, message.requestId, 
        createProxyError(ProxyErrorType.SIGNATURE_VALIDATION_FAILED, 
                        'Request signature validation failed'));
      return;
    }
    
    if (this.config.debug) {
      console.log('[ApiProxyServer] ✅ Signature validation passed');
    }
  }

  // ... existing API call logic ...
}

/**
 * Validate request signature using Web Crypto API
 */
private async validateSignature(message: ProxyApiRequestMessage): Promise<boolean> {
  if (!message.signature || !message.signatureData) {
    return false;
  }

  try {
    // Initialize signature validator (reuse existing class)
    if (!this.signatureValidator) {
      this.signatureValidator = new FrontendSignatureValidator(this.config.publicKey);
      await this.signatureValidator.initialize();
    }

    // Reconstruct original signing data
    const originalData = {
      method: message.payload.method,
      userId: message.payload.userId,
      communityId: message.payload.communityId,
      params: message.payload.params,
      requestId: message.requestId,
      timestamp: message.signatureData.timestamp
    };

    // Apply same data normalization as plugin system
    const isValid = await this.signatureValidator.validateSignature(
      originalData, 
      message.signature
    );

    return isValid;

  } catch (error) {
    console.error('[ApiProxyServer] Signature validation error:', error);
    return false;
  }
}
```

**Configuration Extension**:

```typescript
export interface ProxyServerConfig {
  // ... existing config ...
  
  /** Require signature validation for all requests */
  requireSignatures?: boolean;
  
  /** Public key for signature verification */
  publicKey?: string;
  
  /** Allow mixed signed/unsigned during migration */
  allowUnsignedRequests?: boolean;
}
```

**Integration Point**: Insert in `handleRequest()` method after line 115 (before `makeApiRequest()`)

### **Phase 4: Error Handling Extensions**

**File**: `iframe-api-proxy/src/types/ProxyTypes.ts`

```typescript
export enum ProxyErrorType {
  // ... existing types ...
  
  SIGNATURE_VALIDATION_FAILED = 'signature-validation-failed',
  SIGNING_SERVICE_ERROR = 'signing-service-error',
  MISSING_SIGNATURE = 'missing-signature',
  INVALID_SIGNATURE_FORMAT = 'invalid-signature-format'
}
```

---

## 🔧 **INTEGRATION POINTS DETAILED**

### **Integration Point #1: ApiProxyClient.makeApiRequest()**

**File**: `iframe-api-proxy/src/client/ApiProxyClient.ts`  
**Line**: 140 (before `sendRequestToIframe()` call)

```typescript
// EXISTING CODE:
this.setupRequestTimeout(requestId);

// 🆕 INSERT HERE: Signing logic
if (this.config.enableSigning) {
  const signingResult = await this.signRequest(request, requestId, startTime);
  // Add signature to proxy message
}

// EXISTING CODE:
this.sendRequestToIframe(requestId, request);
```

### **Integration Point #2: ApiProxyServer.handleRequest()**

**File**: `iframe-api-proxy/src/server/ApiProxyServer.ts`  
**Line**: 115 (before `makeApiRequest()` call)

```typescript
// EXISTING CODE: 
if (this.config.debug) {
  console.log('[ApiProxyServer] Processing API request:', {
    // ... debug info
  });
}

// 🆕 INSERT HERE: Signature validation
if (this.config.requireSignatures || message.signature) {
  const isValid = await this.validateSignature(message);
  if (!isValid) {
    this.sendErrorResponse(source, message.requestId, error);
    return;
  }
}

// EXISTING CODE:
try {
  const response = await this.makeApiRequest(message.endpoint, message.payload);
  // ...
}
```

### **Integration Point #3: Message Type Extensions**

**File**: `iframe-api-proxy/src/types/MessageTypes.ts`  
**Line**: 45 (ProxyApiRequestMessage interface)

```typescript
export interface ProxyApiRequestMessage extends BaseMessage {
  type: MessageType.PROXY_API_REQUEST;
  endpoint: string;
  payload: ApiRequest;
  signature?: string;        // ← ADD THIS
  signatureData?: {          // ← ADD THIS
    algorithm: string;
    hash: string;
    timestamp: number;
  };
}
```

---

## 🚀 **MIGRATION STRATEGY**

### **Phase A: Backward Compatible Extension**

1. **Add signature fields as optional** to all interfaces
2. **Default signing disabled** in configuration
3. **Deploy without breaking existing functionality**

### **Phase B: Gradual Enablement**

1. **Enable signing in development** environment
2. **Test with both signed and unsigned requests**
3. **Monitor for performance and stability**

### **Phase C: Production Rollout**

1. **Enable signing in production** with `allowUnsignedRequests: true`
2. **Monitor signature validation success rates**
3. **Gradually enforce signatures only**

### **Phase D: Full Security**

1. **Set `requireSignatures: true`** in production
2. **Remove unsigned request support**
3. **Complete end-to-end signature validation**

---

## 🔐 **SECURITY CONSIDERATIONS**

### **Key Management**

- **Reuse existing RSA-2048 keypair** from plugin system
- **Same environment variables**: `NEXT_PUBLIC_CURIA_PUBKEY`, `NEXT_PRIVATE_PRIVKEY`
- **Centralized signing service**: Use existing `/api/sign` endpoint

### **Replay Protection**

- **Timestamp validation**: Reject requests older than 5 minutes
- **Request ID uniqueness**: Prevent duplicate request processing
- **Nonce support**: Add optional nonce field for enhanced security

### **Performance Impact**

- **Signing overhead**: ~10-20ms per request (acceptable for internal APIs)
- **Validation overhead**: ~5-10ms per request (minimal impact)
- **Caching**: Cache signature validator instances for performance

### **Error Handling**

- **Graceful degradation**: Log signature failures, don't break functionality during migration
- **Detailed logging**: Include signature validation details for debugging
- **Monitoring**: Track signature success/failure rates

---

## 📊 **TESTING STRATEGY**

### **Unit Tests**

```typescript
describe('ApiProxyClient Signing', () => {
  it('should sign requests when signing enabled', async () => {
    // Test signing integration
  });

  it('should handle signing service failures gracefully', async () => {
    // Test error handling
  });
});

describe('ApiProxyServer Validation', () => {
  it('should validate signatures correctly', async () => {
    // Test validation logic
  });

  it('should reject invalid signatures', async () => {
    // Test security enforcement
  });
});
```

### **Integration Tests**

```typescript
describe('End-to-End Signature Flow', () => {
  it('should complete full signed request cycle', async () => {
    // Test complete client → server → API flow
  });

  it('should handle mixed signed/unsigned requests', async () => {
    // Test migration compatibility
  });
});
```

---

## 🎯 **SUCCESS CRITERIA**

### **Functional Requirements**

- ✅ **All API requests signed** with RSA-2048 signatures
- ✅ **All signatures validated** before API execution
- ✅ **Backward compatibility** during migration
- ✅ **Performance maintained** (<50ms overhead per request)

### **Security Requirements**

- ✅ **No unsigned requests** reach backend in production
- ✅ **Replay protection** via timestamp validation
- ✅ **Same security level** as plugin system
- ✅ **Comprehensive error logging** for security monitoring

### **Operational Requirements**

- ✅ **Zero downtime deployment** via gradual rollout
- ✅ **Monitoring dashboards** for signature success rates
- ✅ **Easy configuration** via environment variables
- ✅ **Debug tooling** for troubleshooting signature issues

---

## 📚 **IMPLEMENTATION REFERENCES**

### **Existing Code to Reuse**

1. **CgPluginLibHost**: `cg-plugin-lib-host/src/CgPluginLibHost.ts`
   - `signRequest()` method for signing logic
   - `sortObjectKeys()` for data normalization

2. **FrontendSignatureValidator**: `host-service/src/lib/embed/services/signature/FrontendSignatureValidator.ts`
   - `validateSignature()` method for validation
   - `normalizeSignedData()` for data preparation

3. **MessageRouter**: `host-service/src/lib/embed/services/messaging/MessageRouter.ts`
   - Signature validation patterns and error handling

### **Configuration Examples**

**Development Configuration**:
```typescript
// ApiProxyClient config
{
  enableSigning: true,
  signEndpoint: 'http://localhost:3000/api/sign',
  debug: true
}

// ApiProxyServer config  
{
  requireSignatures: false,
  allowUnsignedRequests: true,
  publicKey: process.env.NEXT_PUBLIC_CURIA_PUBKEY,
  debug: true
}
```

**Production Configuration**:
```typescript
// ApiProxyClient config
{
  enableSigning: true,
  signEndpoint: 'https://curia.network/api/sign',
  debug: false
}

// ApiProxyServer config
{
  requireSignatures: true,
  allowUnsignedRequests: false, 
  publicKey: process.env.NEXT_PUBLIC_CURIA_PUBKEY,
  debug: false
}
```

---

## 🚧 **IMPLEMENTATION TIMELINE**

### **Week 1: Foundation**
- Extend message types with signature fields
- Add configuration options to both client and server
- Implement basic signing logic in ApiProxyClient

### **Week 2: Core Implementation** 
- Implement signature validation in ApiProxyServer
- Add error handling and logging
- Create unit tests for signing and validation

### **Week 3: Integration & Testing**
- End-to-end testing with signed requests
- Performance testing and optimization
- Migration strategy validation

### **Week 4: Deployment**
- Deploy with signing disabled (backward compatibility)
- Gradual enablement in development
- Production rollout planning

---

## 🎉 **EXPECTED OUTCOMES**

### **Security Benefits**
- **100% API request validation** via cryptographic signatures
- **Unified security model** across all communication layers
- **Protection against request tampering** and replay attacks
- **Comprehensive audit trail** of all API access

### **Architecture Benefits**
- **Consistent security patterns** across plugin and proxy systems
- **Reusable signature infrastructure** for future features
- **Flexible configuration** supporting various deployment scenarios
- **Maintainable codebase** with proven security patterns

### **Operational Benefits**
- **Enhanced security monitoring** via signature validation metrics
- **Simplified security model** with unified authentication approach
- **Future-proof architecture** ready for additional security requirements
- **Developer confidence** in API security across all layers

---

**This implementation would complete the security architecture started with the plugin signature system and provide comprehensive end-to-end protection for all API communications in the Curia ecosystem.** 