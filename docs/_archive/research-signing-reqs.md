Perfect! That fills in the missing pieces. Let me investigate the actual embed creation flow in host-service and the standalone parameter logic.
```bash
cd ../host-service
```
Ran tool

Ran tool
Ran tool

Perfect! Found the smoking gun. Let me examine the specific code that sets these parameters:
Read file: src/lib/embed/plugin-host/InternalPluginHost.ts
Read file: src/lib/embed/services/iframe/IframeManager.ts

```bash
cd ../curia
```
Ran tool

```bash
cd ../curia
```

Ran tool
Ran tool

```bash
find . -name "CgLibContext.tsx" -path "*/curia/*"
```

Ran tool
Read file: src/contexts/CgLibContext.tsx

Read file: curia/src/contexts/CgLibContext.tsx

Ran tool
```bash
grep -r "authFetchJson\|postMessage" src/ --include="*.ts" --include="*.tsx" | grep -v CgPluginLib | head -10
```

Read file: curia/src/utils/authFetch.ts

Perfect! Now I have the **complete picture**. Let me create a comprehensive summary with my findings:
Ran tool

Ran tool
Ran tool

Ran tool

Read file: curia/src/components/ApiProxyServerComponent.tsx

Ran tool

## 🎯 **COMPLETE INVESTIGATION FINDINGS**

Perfect! I've uncovered the **complete picture** of what's happening. Here are my conclusive findings:

---

## **1. ✅ iframeUID Generation (Confirmed)**

**Yes, you do generate iframeUIDs for each embed:**

```typescript
// host-service/src/lib/embed/services/iframe/IframeManager.ts:61
private generateIframeUid(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${timestamp}${random}`.substring(0, 10);
}
```

**Evidence**: Every embed gets a unique UID like `"1A2B3C4D5E"` and it's passed in the URL:
```typescript
forumUrl.searchParams.set('iframeUid', this.iframeManager.getUid());
```

---

## **2. ✅ Standalone Parameter (Confirmed - This is the killer)**

**Yes, host-service sets `mod=standalone` parameter:**

```typescript
// host-service/src/lib/embed/plugin-host/InternalPluginHost.ts:824
forumUrl.searchParams.set('mod', 'standalone');

// host-service/src/lib/embed/services/iframe/IframeManager.ts:140  
forumUrl.searchParams.set('mod', 'standalone');
```

**Result URL**: `https://curia.network?mod=standalone&iframeUid=ABC123&community=xyz`

---

## **3. 🔍 The Real Culprit: Dual API Architecture**

**The signature rejection issue comes from curia having TWO separate API calling mechanisms:**

### **Mechanism 1: CgPluginLib (SHOULD be signed)**
- ✅ **When embedded**: `iframeUid` present → initializes CgPluginLib → signed requests via postMessage
- ❌ **When standalone**: `mod=standalone` (unclear if this blocks initialization)

### **Mechanism 2: ApiProxyServerComponent (ALWAYS unsigned)**
- 🚨 **Always active**: Runs in `layout.tsx` for entire app
- 🚨 **Direct HTTP calls**: Makes unsigned requests to host-service via iframe-api-proxy
- 🚨 **Bypasses signatures**: Designed for CSP bypass, not cryptographic signing

**Evidence**:
```typescript
// curia/src/components/ApiProxyServerComponent.tsx:19
const proxyServer = new ApiProxyServer({
  baseUrl: process.env.NEXT_PUBLIC_HOST_SERVICE_URL || 'https://curia.network',
  // NO SIGNATURE CONFIGURATION - just makes direct HTTP calls
});
```

**Used in**: `curia/src/app/layout.tsx:61` - runs for EVERY page load

---

## **4. 🕵️ Why Unsigned Requests Reach Host-Service**

**The mystery is solved**: Even when `cgInstance` is null, the `ApiProxyServerComponent` is **always running** and making unsigned API calls to the host-service through the iframe-api-proxy mechanism.

This explains why you see `[PluginHost] ❌ Request rejected: No signature provided` - the proxy is making direct HTTP calls without any signature.

---

## **5. 💡 What I Propose (For Your Review)**

### **Option A: Disable ApiProxyServerComponent for Standalone Mode (Recommended)**
```typescript
// In layout.tsx - only initialize proxy when embedded
{!searchParams.get('mod')?.includes('standalone') && <ApiProxyServerComponent />}
```

**Pros**: ✅ Clean separation, preserves both architectures
**Cons**: ⚠️ Need to ensure authFetch handles all standalone API needs

### **Option B: Add Signature Support to ApiProxyServerComponent**
```typescript
// Enhance ApiProxyServer to sign requests before sending to host-service
const proxyServer = new ApiProxyServer({
  baseUrl: process.env.NEXT_PUBLIC_HOST_SERVICE_URL,
  signEndpoint: '/api/sign',  // Add signing capability
  publicKey: process.env.NEXT_PUBLIC_PUBKEY
});
```

**Pros**: ✅ Universal signed requests, cleaner architecture
**Cons**: ⚠️ Requires iframe-api-proxy package changes

### **Option C: Environment-Based Signature Bypass**
```typescript
// In host-service PluginHost.ts - bypass signature for ApiProxyServer requests
if (req.headers['user-agent']?.includes('ApiProxyServer') && process.env.NODE_ENV === 'development') {
  // Skip signature validation for proxy requests in dev
}
```

**Pros**: ✅ Quick fix, allows continued development  
**Cons**: ⚠️ Security bypass, not production-ready

---

## **📋 My Strong Recommendation**

**Go with Option A** - conditionally disable `ApiProxyServerComponent` when `mod=standalone`:

1. **For embedded mode**: Keep both CgPluginLib (signed) + ApiProxyServer (unsigned) working
2. **For standalone mode**: Disable ApiProxyServer, rely only on authFetch for direct API calls  
3. **Security benefit**: No unsigned requests bypass your new signature validation

**Implementation**: 5-minute change in `layout.tsx`

---

## **❓ Questions for Your Review**

1. **Approach preference**: Do you want Option A (conditional proxy) or Option B (signing proxy)?

2. **Standalone vs Embedded**: Should standalone mode work completely independently without any host-service communication?

3. **Quick fix vs proper architecture**: Option A is a quick fix - do you want a more comprehensive solution later?

The good news is we've identified the exact source of unsigned requests. Your signature validation is working perfectly - we just need to stop the ApiProxyServerComponent from bypassing it!

## 🎯 **CRITICAL UPDATE: FOUND THE REAL BUG!**

After deeper investigation, the issue is NOT that cgInstance is null or that ApiProxyServerComponent is the problem. The user was absolutely right - cgInstance exists and the forum was working before signature enforcement.

### **The Real Bug: MessageRouter is Signature-Stripping Proxy**

**What's Actually Happening:**

1. ✅ **CgPluginLib**: Creates perfectly signed postMessage requests with `signature` field
2. ✅ **PostMessage**: Sent to host-service MessageRouter with signature
3. ❌ **MessageRouter**: **STRIPS the signature** when forwarding to apiProxy 
4. ❌ **ApiProxy**: Makes unsigned HTTP calls to PluginHost
5. ❌ **PluginHost**: Correctly rejects unsigned requests

### **Evidence:**

**CgPluginLib includes signature (cg-plugin-lib/src/CgPluginLib.ts:268):**
```typescript
const message: HostMessage = {
  type: MessageType.API_REQUEST,
  iframeUid: this.config.iframeUid,
  requestId,
  method,
  params,
  signature: signedRequest.signature,  // ✅ SIGNATURE INCLUDED
};
```

**MessageRouter strips signature (host-service/src/lib/embed/services/messaging/MessageRouter.ts:181):**
```typescript
const result = await this.apiProxy.makeApiRequest({
  method: message.method as any,
  params: message.params,
  communityId: authContext.communityId,
  userId: authContext.userId
  // ❌ message.signature is NOT passed!
});
```

### **The Fix**

Add the signature parameter to the apiProxy call:

```typescript
const result = await this.apiProxy.makeApiRequest({
  method: message.method as any,
  params: message.params,
  communityId: authContext.communityId,
  userId: authContext.userId,
  signature: message.signature  // ✅ ADD THIS LINE
});
```

This explains why:
- ✅ Forum worked before signature enforcement (no validation)
- ❌ Forum breaks after signature enforcement (validation rejects unsigned calls)  
- ✅ CgPluginLib signing infrastructure works perfectly
- ❌ MessageRouter acts as unintentional signature-stripping middleware

## ✅ **FIX IMPLEMENTED**

### **Changes Made:**

**1. iframe-api-proxy package:**
- Added `signature?: string` to `ApiRequest` interface in `src/types/ApiTypes.ts`

**2. host-service package:**
- Added `signature?: string` to `InternalPluginMessage` interface in `MessageRouter.ts`
- Updated `apiProxy.makeApiRequest()` call to pass `signature: message.signature`
- Added debug logging: `console.log('[MessageRouter] Signature present:', !!message.signature)`

### **Complete Flow (Now Fixed):**

1. ✅ **CgPluginLib**: Creates signed postMessage with `signature` field
2. ✅ **PostMessage**: Sent to MessageRouter with signature
3. ✅ **MessageRouter**: Now **passes signature** to apiProxy 
4. ✅ **ApiProxyServer**: Forwards signature in HTTP request body
5. ✅ **PluginHost**: Receives request with signature → validates successfully

### **Expected Results:**
- `[MessageRouter] Signature present: true` in logs
- No more `❌ Request rejected: No signature provided` errors
- Forum loads successfully with signature validation enabled