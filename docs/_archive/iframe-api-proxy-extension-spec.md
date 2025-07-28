# Iframe API Proxy Extension Specification

**Created**: 2025-01-22  
**Status**: Planning Phase  
**Purpose**: Extend `@curia_/iframe-api-proxy` to support CSP-compliant community and profile fetching  
**Target Package**: `/Users/florian/Git/curia/iframe-api-proxy`

## 🎯 **EXECUTIVE SUMMARY**

Extend the existing iframe API proxy system to support `getUserCommunities` and `getUserProfile` methods, enabling CSP-compliant community sidebar initialization on strict CSP sites like Neocities.

**Current Issue**: `AuthenticationService` makes direct fetch calls that violate CSP policies  
**Solution**: Route these calls through the existing working iframe API proxy system

---

## 📊 **CURRENT STATE ANALYSIS**

### **✅ Working Methods (v1.0.0)**
```typescript
// ApiTypes.ts - Current supported methods
export type ApiMethod = 
  | 'getUserInfo'      // → /api/user
  | 'getUserFriends'   // → /api/user  
  | 'getContextData'   // → /api/user
  | 'getCommunityInfo' // → /api/community
  | 'giveRole';        // → /api/community
```

### **❌ Missing Methods (Need to Add)**
```typescript
// What we need for sidebar initialization
  | 'getUserCommunities'  // → /api/communities 
  | 'getUserProfile';     // → /api/auth/validate-session
```

### **🚨 Current CSP Violations**
```javascript
// AuthenticationService.ts - These calls fail on strict CSP
fetch(`${this.hostServiceUrl}/api/communities`, { ... })     // ❌ Blocked
fetch(`${this.hostServiceUrl}/api/auth/validate-session`, { ... }) // ❌ Blocked
```

---

## 🔧 **IMPLEMENTATION SPECIFICATION**

### **Phase 1: Package Extension**

#### **1.1 Update API Types** 
**File**: `iframe-api-proxy/src/types/ApiTypes.ts`

```typescript
// 🆕 ADD: New method types to ApiMethod union
export type ApiMethod = 
  | 'getUserInfo'
  | 'getUserFriends' 
  | 'getContextData'
  | 'getCommunityInfo'
  | 'giveRole'
  | 'getUserCommunities'  // 🆕 NEW - For sidebar community list
  | 'getUserProfile';     // 🆕 NEW - For sidebar user profile

// 🆕 ADD: New endpoint mappings
export const API_ENDPOINTS: Record<string, string> = {
  getUserInfo: '/api/user',
  getUserFriends: '/api/user',
  getContextData: '/api/user',
  getCommunityInfo: '/api/community',
  giveRole: '/api/community',
  getUserCommunities: '/api/communities',        // 🆕 Maps to GET /api/communities
  getUserProfile: '/api/auth/validate-session'   // 🆕 Maps to POST /api/auth/validate-session
};

// 🆕 ADD: New request interfaces
export interface GetUserCommunitiesRequest extends ApiRequest {
  method: 'getUserCommunities';
  params?: { 
    sessionToken: string;  // Required for authentication
  };
}

export interface GetUserProfileRequest extends ApiRequest {
  method: 'getUserProfile';
  params?: { 
    sessionToken: string;  // Required for authentication
  };
}

// 🆕 ADD: Update union type
export type ApiRequestUnion = 
  | GetUserInfoRequest
  | GetUserFriendsRequest
  | GetContextDataRequest
  | GetCommunityInfoRequest
  | GiveRoleRequest
  | GetUserCommunitiesRequest  // 🆕 NEW
  | GetUserProfileRequest;     // 🆕 NEW
```

#### **1.2 Update Server Implementation**
**File**: `iframe-api-proxy/src/server/ApiProxyServer.ts`

```typescript
// 🔧 MODIFY: makeApiRequest method to handle different HTTP methods
private async makeApiRequest(endpoint: string, payload: ApiRequest): Promise<ApiResponse> {
  const url = `${this.config.baseUrl}${endpoint}`;
  
  // 🆕 NEW: Determine HTTP method and request format based on endpoint
  let requestOptions: RequestInit;
  
  if (endpoint === '/api/communities') {
    // GET request with Authorization header for communities
    requestOptions = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${payload.params?.sessionToken}`,
        'Content-Type': 'application/json',
        ...this.config.headers
      }
    };
  } else if (endpoint === '/api/auth/validate-session') {
    // POST request with sessionToken in body for profile
    requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers
      },
      body: JSON.stringify({
        sessionToken: payload.params?.sessionToken
      })
    };
  } else {
    // 🔄 EXISTING: Standard POST format for plugin methods
    requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers
      },
      body: JSON.stringify(payload)
    };
  }

  // 🔄 EXISTING: Timeout handling logic (unchanged)
  if (this.config.timeout > 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    requestOptions.signal = controller.signal;
    
    try {
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);
      return await this.processResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } else {
    const response = await fetch(url, requestOptions);
    return await this.processResponse(response);
  }
}
```

#### **1.3 Update Package Version**
**File**: `iframe-api-proxy/package.json`

```json
{
  "name": "@curia_/iframe-api-proxy",
  "version": "1.1.0",  // 🆕 BUMP: Version for new methods
  "description": "API proxy system for iframe-based applications to bypass CSP restrictions"
}
```

#### **1.4 Build Package**
```bash
# In iframe-api-proxy directory
cd /Users/florian/Git/curia/iframe-api-proxy
npm run build
```

---

### **Phase 2: Host Service Integration**

#### **2.1 Update Package Dependency**
**File**: `host-service/package.json`

```json
{
  "dependencies": {
    "@curia_/iframe-api-proxy": "^1.1.0"  // 🆕 UPDATE: Bump to new version
  }
}
```

#### **2.2 Update MessageRouter Support**
**File**: `host-service/src/lib/embed/services/messaging/MessageRouter.ts`

```typescript
// 🆕 ADD: New methods to supported list
private isMethodSupported(method: string): boolean {
  const supportedMethods = [
    'getUserInfo',
    'getUserFriends', 
    'getContextData',
    'getCommunityInfo',
    'giveRole',
    'switchCommunity',
    'getUserCommunities',  // 🆕 NEW - Community sidebar data
    'getUserProfile'       // 🆕 NEW - User profile data
  ];
  
  return supportedMethods.includes(method);
}
```

#### **2.3 Restore API Proxy Usage in AuthenticationService**
**File**: `host-service/src/lib/embed/services/auth/AuthenticationService.ts`

```typescript
// 🔄 RESTORE: ApiProxyClient import and usage
import { sessionManager } from '../../../SessionManager';
import { ApiProxyClient } from '@curia_/iframe-api-proxy'; // 🔄 RESTORE

export class AuthenticationService {
  private apiProxy: ApiProxyClient | null = null; // 🔄 RESTORE

  constructor(
    hostServiceUrl: string, 
    callbacks: AuthenticationCallbacks = {},
    apiProxy?: ApiProxyClient // 🔄 RESTORE
  ) {
    this.hostServiceUrl = hostServiceUrl;
    this.callbacks = callbacks;
    this.apiProxy = apiProxy || null; // 🔄 RESTORE
    
    this.setupSessionManagerSubscription();
    console.log('[AuthenticationService] Initialized', { 
      hasApiProxy: !!this.apiProxy 
    });
  }

  // 🔧 MODIFY: Use API proxy with new method
  async fetchUserCommunities(): Promise<UserCommunityMembership[]> {
    try {
      console.log('[AuthenticationService] Fetching user communities...');
      
      if (!this.authContext?.sessionToken) {
        console.log('[AuthenticationService] No session token available');
        return [];
      }

      // 🆕 NEW: Try API proxy first (CSP-safe)
      if (this.apiProxy) {
        console.log('[AuthenticationService] Using API proxy for getUserCommunities (CSP-safe)');
        try {
          const result = await this.apiProxy.makeApiRequest({
            method: 'getUserCommunities', // 🆕 NEW: Now supported method
            params: { sessionToken: this.authContext.sessionToken },
            communityId: this.authContext.communityId,
            userId: this.authContext.userId
          });

          if (result.success && result.data?.userCommunities) {
            console.log('[AuthenticationService] API proxy success:', result.data.userCommunities.length, 'communities');
            return result.data.userCommunities.map((community: any) => ({
              id: community.id,
              name: community.name,
              logoUrl: community.logoUrl || null,
              userRole: community.userRole || 'member',
              isMember: community.isMember
            }));
          }
        } catch (proxyError) {
          console.warn('[AuthenticationService] API proxy error, falling back to direct fetch:', proxyError);
        }
      }

      // 🔄 FALLBACK: Direct fetch (for non-CSP sites)
      return await this.directFetchCommunities();
    } catch (error) {
      console.error('[AuthenticationService] Error fetching user communities:', error);
      return [];
    }
  }

  // 🔧 MODIFY: Use API proxy with new method
  async fetchUserProfile(): Promise<UserProfile | null> {
    try {
      if (!this.authContext?.sessionToken) {
        return null;
      }

      // 🆕 NEW: Try API proxy first (CSP-safe)
      if (this.apiProxy) {
        console.log('[AuthenticationService] Using API proxy for getUserProfile (CSP-safe)');
        try {
          const result = await this.apiProxy.makeApiRequest({
            method: 'getUserProfile', // 🆕 NEW: Now supported method
            params: { sessionToken: this.authContext.sessionToken },
            communityId: this.authContext.communityId,
            userId: this.authContext.userId
          });

          if (result.success && result.data?.user) {
            console.log('[AuthenticationService] API proxy profile success');
            return {
              userId: result.data.user.user_id,
              name: result.data.user.name,
              profilePictureUrl: result.data.user.profile_picture_url || null,
              identityType: result.data.user.identity_type || 'anonymous',
              walletAddress: result.data.user.wallet_address || null,
              ensDomain: result.data.user.ens_domain || null,
              upAddress: result.data.user.up_address || null,
              isAnonymous: result.data.user.is_anonymous
            };
          }
        } catch (proxyError) {
          console.warn('[AuthenticationService] API proxy profile error, falling back to direct fetch:', proxyError);
        }
      }

      // 🔄 FALLBACK: Direct fetch (for non-CSP sites)
      return await this.directFetchProfile();
    } catch (error) {
      console.error('[AuthenticationService] Error fetching user profile:', error);
      return null;
    }
  }
}
```

#### **2.4 Restore Constructor Injection**
**File**: `host-service/src/lib/embed/plugin-host/InternalPluginHost.ts`

```typescript
// 🔄 RESTORE: Pass API proxy to AuthenticationService
this.authService = new AuthenticationService(hostServiceUrl, {
  onAuthComplete: this.onAuthComplete.bind(this),
  onSessionSwitch: this.onSessionSwitch.bind(this),
  onSignOut: this.onSignOut.bind(this),
  onCrossTabSessionUpdate: this.onCrossTabUpdate.bind(this)
}, this.apiProxy); // 🔄 RESTORE: API proxy injection
```

---

### **Phase 3: Testing & Deployment**

#### **3.1 Local Testing**
```bash
# Test package build
cd /Users/florian/Git/curia/iframe-api-proxy
npm run build
npm run test

# Test host service integration
cd /Users/florian/Git/curia/host-service
yarn install  # Should pull new version
npx tsc --noEmit  # Check for TypeScript errors
yarn build:embed  # Build new embed.js
```

#### **3.2 CSP Environment Testing**
**Target**: Test on `curia-boards.neocities.org` (strict CSP)

**Expected Results**:
- ✅ No "Invalid API request format" errors
- ✅ No CSS loading from customer domain 
- ✅ Community sidebar loads properly
- ✅ User profile displays correctly
- ✅ API calls route through iframe proxy

#### **3.3 Fallback Testing**
**Target**: Test on non-CSP sites (localhost, regular hosting)

**Expected Results**:
- ✅ API proxy works when iframe available
- ✅ Direct fetch fallback works when proxy fails
- ✅ No breaking changes to existing functionality

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Package Extension**
- [ ] 1.1 Update `ApiTypes.ts` with new methods and interfaces
- [ ] 1.2 Modify `ApiProxyServer.ts` for different HTTP methods
- [ ] 1.3 Bump package version to 1.1.0
- [ ] 1.4 Build and test package locally

### **Phase 2: Host Service Integration**
- [ ] 2.1 Update package dependency in `package.json`
- [ ] 2.2 Add new methods to `MessageRouter` supported list
- [ ] 2.3 Restore API proxy usage in `AuthenticationService`
- [ ] 2.4 Restore constructor injection in `InternalPluginHost`

### **Phase 3: Testing & Deployment**
- [ ] 3.1 Local TypeScript and build testing
- [ ] 3.2 Strict CSP environment testing (Neocities)
- [ ] 3.3 Fallback functionality testing
- [ ] 3.4 Production deployment

---

## 🎯 **SUCCESS CRITERIA**

### **✅ CSP Compliance**
- Community sidebar loads on strict CSP sites without errors
- No direct fetch calls from customer page context
- All API requests route through iframe proxy

### **✅ Backwards Compatibility**
- Existing forum API calls continue working
- No breaking changes to plugin communication
- Fallback behavior for non-CSP sites

### **✅ Type Safety**
- Full TypeScript support for new methods
- Proper request/response type validation
- No TypeScript compilation errors

---

## 🚨 **RISKS & MITIGATION**

### **Risk 1: HTTP Method Complexity**
**Issue**: New endpoints use different HTTP methods (GET vs POST)  
**Mitigation**: Add endpoint-specific request formatting in `ApiProxyServer`

### **Risk 2: Authentication Format Differences**
**Issue**: New endpoints expect different auth formats (header vs body)  
**Mitigation**: Handle authentication per-endpoint in proxy server

### **Risk 3: Breaking Changes**
**Issue**: Package changes could break existing functionality  
**Mitigation**: Comprehensive testing of existing methods before deployment

---

## 📈 **FUTURE ENHANCEMENTS**

### **Version 1.2.0 Possibilities**
- Add more authentication-related methods
- Support for batch API requests
- Enhanced error handling and retry logic
- Performance monitoring and analytics

### **Architecture Improvements**
- Unified request format across all endpoints
- Better TypeScript inference for method-specific params
- Plugin-based endpoint handling system

---

**Next Step**: Begin Phase 1 implementation with `ApiTypes.ts` updates 