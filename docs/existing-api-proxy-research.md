# Existing API Proxy Research & Analysis

**Created**: 2025-01-22  
**Status**: Research Phase  
**Purpose**: Understand current API proxy success patterns before implementing CSP fix  

## 🎯 **EXECUTIVE SUMMARY**

The `@curia_/iframe-api-proxy` is **ALREADY WORKING SUCCESSFULLY** in our system! The CSP issue is not that the proxy doesn't work - it's that **TWO SPECIFIC API CALLS** are bypassing the proxy system and making direct fetch() calls from the customer page context.

## 🏗️ **CURRENT WORKING ARCHITECTURE**

### **The Three-Layer System**

```
Layer 1: Customer Website (https://customer.com - Strict CSP)
├── InternalPluginHost (embed.js)
│   ├── ApiProxyClient ✅ WORKING
│   └── MessageRouter ✅ WORKING

Layer 2: Auth/Forum Iframe (https://curia.network - Same Domain)  
├── ApiProxyServer ✅ WORKING
└── Direct API Access ✅ WORKING

Layer 3: Host Service APIs
├── /api/user ✅ WORKING VIA PROXY
├── /api/community ✅ WORKING VIA PROXY  
└── /api/communities ❌ BYPASSING PROXY (CSP VIOLATION)
└── /api/auth/validate-session ❌ BYPASSING PROXY (CSP VIOLATION)
```

## 🔍 **DETAILED ANALYSIS OF WORKING COMPONENTS**

### **1. ApiProxyClient (Customer Page Context)**

**Location**: `@curia_/iframe-api-proxy` package  
**Instantiation**: `InternalPluginHost.constructor()`

```typescript
// src/lib/embed/plugin-host/InternalPluginHost.ts:119-123
this.apiProxy = new ApiProxyClient({
  debug: true,
  defaultTimeout: 10000,
  maxRetries: 3
});
```

**Key Methods**:
- `makeApiRequest(request)` - Routes API calls through active iframe
- `setActiveIframe(iframe)` - Tells proxy which iframe to route through

**Success Pattern**: ✅ **ALREADY WORKING for forum API calls**

### **2. ApiProxyServer (Iframe Context)**

**Location**: `src/app/embed/page.tsx:32-58`  
**Purpose**: Runs inside auth/forum iframe to handle proxied requests

```typescript
// ApiProxyServerComponent in embed page
const ApiProxyServerComponent: React.FC = () => {
  React.useEffect(() => {
    const proxyServer = new ApiProxyServer({
      baseUrl: process.env.NEXT_PUBLIC_HOST_SERVICE_URL || 'https://curia.network',
      debug: true,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('[Embed] API proxy server initialized:', proxyServer.getStatus());
    return () => proxyServer.destroy();
  }, []);

  return null;
};
```

**Success Pattern**: ✅ **ALREADY WORKING - receives proxy requests from customer page**

### **3. MessageRouter (Request Handler)**

**Location**: `src/lib/embed/services/messaging/MessageRouter.ts:122-195`  
**Purpose**: Handles API requests from forum iframe and routes through proxy

```typescript
// The WORKING flow for forum API requests
private async handleApiRequest(message: InternalPluginMessage, source: Window): Promise<void> {
  // ... auth context validation ...

  // 🎯 THIS IS THE WORKING PATTERN!
  const result = await this.apiProxy.makeApiRequest({
    method: message.method as any,
    params: message.params,
    communityId: authContext.communityId,
    userId: authContext.userId
  });

  if (result.success) {
    this.sendResponse(source, message, result.data);
  } else {
    throw new Error(result.error || 'API request failed');
  }
}
```

**Supported Methods**: ✅ **ALREADY WORKING**
- `getUserInfo` 
- `getUserFriends`
- `getContextData`
- `getCommunityInfo`
- `giveRole`
- `switchCommunity`

## ❌ **THE CSP PROBLEM: BYPASSING THE WORKING SYSTEM**

### **Root Cause Analysis**

The CSP violations are NOT caused by the API proxy failing. They're caused by **AuthenticationService making direct fetch() calls** instead of using the working proxy system.

### **Violating Code #1: fetchUserCommunities()**

**Location**: `src/lib/embed/services/auth/AuthenticationService.ts:169-177`

```typescript
// ❌ DIRECT FETCH - BYPASSES PROXY SYSTEM
const response = await fetch(`${this.hostServiceUrl}/api/communities`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${this.authContext.sessionToken}`,
    'Content-Type': 'application/json'
  }
});
```

**Why This Fails**: 
- Runs in customer page context (Layer 1)
- Customer CSP blocks outbound requests to curia.network
- Should route through proxy like forum API calls do

### **Violating Code #2: fetchUserProfile()**

**Location**: `src/lib/embed/services/auth/AuthenticationService.ts:225-233`

```typescript
// ❌ DIRECT FETCH - BYPASSES PROXY SYSTEM  
const response = await fetch(`${this.hostServiceUrl}/api/auth/validate-session`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionToken: this.authContext.sessionToken })
});
```

**Why This Fails**:
- Same issue - direct fetch from customer page context
- CSP blocks the request
- Should use proxy system

## 💡 **THE SOLUTION: USE THE WORKING PATTERN**

### **What We Should Do**

**Instead of**: Direct fetch() calls from AuthenticationService  
**Do**: Route through the EXISTING working proxy system

### **Step 1: Add Missing API Methods**

**Location**: `src/lib/embed/services/messaging/MessageRouter.ts:225-235`

```typescript
private isMethodSupported(method: string): boolean {
  const supportedMethods = [
    'getUserInfo',
    'getUserFriends', 
    'getContextData',
    'getCommunityInfo',
    'giveRole',
    'switchCommunity',
    'getUserCommunities',  // 🆕 ADD THIS
    'getUserProfile'       // 🆕 ADD THIS
  ];
  
  return supportedMethods.includes(method);
}
```

### **Step 2: AuthenticationService Uses Proxy**

Instead of direct fetch(), use the working ApiProxyClient pattern:

```typescript
// ✅ WORKING PATTERN (like MessageRouter does)
async fetchUserCommunities(): Promise<UserCommunityMembership[]> {
  if (this.apiProxy) {
    const result = await this.apiProxy.makeApiRequest({
      method: 'getUserCommunities' as any,
      params: {},
      communityId: this.authContext.communityId,
      userId: this.authContext.userId
    });
    
    if (result.success) {
      return result.data.userCommunities;
    }
  }
  
  // Fallback to direct fetch (for non-CSP sites)
  return this.directFetchCommunities();
}
```

### **Step 3: Inject ApiProxy into AuthenticationService**

**Location**: `src/lib/embed/plugin-host/InternalPluginHost.ts:137-142`

```typescript
this.authService = new AuthenticationService(hostServiceUrl, {
  onAuthComplete: this.onAuthComplete.bind(this),
  onSessionSwitch: this.onSessionSwitch.bind(this),
  onSignOut: this.onSignOut.bind(this),
  onCrossTabSessionUpdate: this.onCrossTabUpdate.bind(this)
}, this.apiProxy); // 🆕 PASS THE WORKING PROXY INSTANCE
```

## 🎯 **WHY THIS WILL WORK**

### **Evidence: Existing Success**

1. **Forum API Calls Work**: The proxy successfully routes forum requests
2. **Same Architecture**: We'll use identical patterns for auth requests  
3. **Same Infrastructure**: ApiProxyServer is already running in embed iframe
4. **Same Flow**: PostMessage → iframe → API → response → PostMessage

### **No Timing Issues**

The working system proves there are no fundamental timing issues:
- `MessageRouter.handleApiRequest()` successfully uses `this.apiProxy.makeApiRequest()`
- Forum iframe calls work immediately after iframe creation
- ApiProxyServer initializes correctly in embed iframe

### **Transparent Integration**

```typescript
// Current (broken on CSP sites)
const communities = await authService.fetchUserCommunities();

// After fix (works everywhere) 
const communities = await authService.fetchUserCommunities(); // SAME API!
```

No changes to calling code - just internal routing changes.

## 🚨 **CRITICAL INSIGHTS**

### **What I Got Wrong Initially**

1. **❌ "API proxy needs iframe first"** - FALSE! It works immediately
2. **❌ "Need timing delays"** - FALSE! MessageRouter proves it works sync
3. **❌ "Need to change app flow"** - FALSE! Just route differently internally

### **What The Code Shows**

1. **✅ Proxy system is production-ready** - Forum uses it successfully
2. **✅ No timing issues exist** - MessageRouter calls work immediately  
3. **✅ Just need consistency** - Use same pattern for auth calls

## 📋 **IMPLEMENTATION PLAN**

### **Phase 1: Add API Methods** ⏱️ 5 minutes
- Add `getUserCommunities` and `getUserProfile` to supported methods
- Test that MessageRouter accepts these methods

### **Phase 2: Inject Proxy** ⏱️ 5 minutes  
- Pass ApiProxyClient to AuthenticationService constructor
- Update constructor signature

### **Phase 3: Route Through Proxy** ⏱️ 15 minutes
- Modify `fetchUserCommunities()` to try proxy first, fallback to direct
- Modify `fetchUserProfile()` to try proxy first, fallback to direct
- Handle response mapping

### **Phase 4: Test & Deploy** ⏱️ 10 minutes
- Test on neocities.org (strict CSP)
- Verify fallback works on non-CSP sites
- Build and deploy embed.js

**Total Time**: ~35 minutes (not days!)

## 🎉 **EXPECTED OUTCOME**

### **Before (CSP Violation)**
```
embed.js: Fetch API cannot load https://curia.network/api/communities
embed.js: Fetch API cannot load https://curia.network/api/auth/validate-session  
ERROR: Refused to connect because it violates CSP
```

### **After (CSP Compliant)**
```
[AuthenticationService] Using API proxy for getUserCommunities (CSP-safe)
[AuthenticationService] API proxy success: 3 communities
[AuthenticationService] Using API proxy for getUserProfile (CSP-safe)
[AuthenticationService] API proxy profile success
✅ Community sidebar loads properly
✅ User profile displays correctly  
✅ All functionality works on strict CSP sites
```

## 🔬 **TECHNICAL VALIDATION**

### **The Working Evidence**

Looking at the existing codebase, here's proof the system works:

1. **MessageRouter.handleApiRequest()** - Successfully routes `getUserInfo`, `getCommunityInfo` etc.
2. **ApiProxyClient.makeApiRequest()** - Successfully routes to active iframe  
3. **ApiProxyServer initialization** - Successfully handles proxy requests in iframe
4. **Forum functionality** - Users can interact with forum features (proves API proxy works)

### **The Missing Piece**

Only **2 specific API calls** are bypassing this working system:
- `/api/communities` (should be `getUserCommunities`)
- `/api/auth/validate-session` (should be `getUserProfile`)

Fix those 2 calls = fix the CSP issue. That's it!

## 🏁 **CONCLUSION**

**The API proxy system is NOT broken - it's working perfectly!**

We just need to **use the existing working pattern** for the 2 API calls that are currently bypassing it. This is a 35-minute fix, not a multi-day architecture redesign.

The proof is in the code: `MessageRouter.handleApiRequest()` is successfully routing API calls through the proxy right now. We just need `AuthenticationService` to do the same thing. 