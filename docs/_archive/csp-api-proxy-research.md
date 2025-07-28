# CSP API Proxy Research & Implementation Plan

## Problem Statement

### ❌ Current Broken Flow (CSP Violation)
```
Customer Website (https://customer.com)
    ↓ CSP: default-src 'self'
Embed Script (embed.js)
    ↓ InternalPluginHost running in customer context
Forum Iframe → PostMessage API Request → InternalPluginHost
    ↓ fetch(https://curia.network/api/community) ← CSP BLOCKS THIS
API Response ← Host Service APIs
```

**Error**: `Fetch API cannot load https://curia.network/api/community. Refused to connect because it violates the document's Content Security Policy.`

### ✅ Proposed Solution (CSP Compliant)
```
Customer Website (https://customer.com)
    ↓ CSP: default-src 'self'
Embed Script (embed.js)
    ↓ InternalPluginHost running in customer context
Forum Iframe → PostMessage API Request → InternalPluginHost
    ↓ PostMessage API Request → Auth/Forum Iframe (same domain)
        ↓ fetch(https://curia.network/api/community) ← CSP ALLOWS THIS
API Response ← Host Service APIs
        ↓ PostMessage Response
    ↓ PostMessage Response  
Forum Iframe ← API Response
```

## Root Cause Analysis

### 1. **CORS vs CSP Confusion**
- **CORS**: Server-side policy controlling cross-origin requests ✅ **SOLVED**
- **CSP**: Client-side policy preventing outbound requests ❌ **NEW PROBLEM**

### 2. **Professional Hosting CSP Policies**
Customer sites like Neocities implement strict CSP headers:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
```

This means embed JavaScript can only make requests to the customer's own domain, not to `curia.network`.

### 3. **iframe Same-Domain Advantage**
- ✅ Auth iframe (`https://curia.network/embed`) can make API calls to `https://curia.network/api/*`
- ✅ Forum iframe (`https://forum.curia.network`) can make API calls via proxy to host-service
- ❌ Customer page JavaScript (`https://customer.com`) cannot make calls to `curia.network`

## Current Architecture Analysis

### **Applications in Our Ecosystem**

#### 1. **Host Service** (`/embed` route) - **This Repo**
- **Location**: `src/app/embed/page.tsx`
- **Purpose**: Authentication flow, community selection
- **Domain**: `curia.network`
- **Can Access APIs**: ✅ Yes (same domain)

#### 2. **Forum Application** - **Separate Repo**
- **Location**: External repository
- **Purpose**: Full forum functionality
- **Domain**: `forum.curia.network` or `curia.network/forum`
- **Can Access APIs**: ✅ Yes (with proxy)

#### 3. **Future Applications**
- Admin dashboard iframes
- Analytics dashboards
- Custom community tools

### **API Endpoints Being Called**

From analysis of `InternalPluginHost.handleApiRequest()`:

#### User APIs (`/api/user`)
- `getUserInfo` - Get user profile data
- `getUserFriends` - Get paginated friend lists
- `getContextData` - Get plugin context and assignable roles

#### Community APIs (`/api/community`)
- `getCommunityInfo` - Get community details and roles
- `giveRole` - Assign roles to users

## Proposed Solution: Unified API Proxy System

### **Architecture Overview**

#### **Shared NPM Package: `@curia/iframe-api-proxy`**
```typescript
// Package structure
@curia/iframe-api-proxy/
├── src/
│   ├── types/
│   │   ├── ApiTypes.ts           // Shared API interfaces
│   │   ├── MessageTypes.ts       // PostMessage interfaces
│   │   └── ProxyTypes.ts         // Proxy configuration
│   ├── client/
│   │   ├── ApiProxyClient.ts     // Customer page logic
│   │   └── MessageRouter.ts      // PostMessage routing
│   ├── server/
│   │   ├── ApiProxyServer.ts     // Iframe implementation
│   │   └── RequestHandler.ts     // API request handling
│   └── index.ts                  // Main exports
├── package.json
├── tsconfig.json
└── README.md
```

#### **Message Flow Protocol**
```typescript
// 1. Forum → InternalPluginHost
interface ApiRequestMessage {
  type: 'api-request';
  requestId: string;
  method: 'getUserInfo' | 'getCommunityInfo' | ...;
  params: any;
  userId: string;
  communityId: string;
}

// 2. InternalPluginHost → Active Iframe
interface ProxyRequestMessage {
  type: 'proxy-api-request';
  requestId: string;
  endpoint: '/api/user' | '/api/community';
  payload: any;
}

// 3. Active Iframe → InternalPluginHost
interface ProxyResponseMessage {
  type: 'proxy-api-response';
  requestId: string;
  success: boolean;
  data?: any;
  error?: string;
}

// 4. InternalPluginHost → Forum
interface ApiResponseMessage {
  type: 'api-response';
  requestId: string;
  success: boolean;
  data?: any;
  error?: string;
}
```

## Implementation Plan

### **Phase 1: Create Shared Package**

#### **1.1 Package Setup**
```bash
# Create new package
mkdir packages/iframe-api-proxy
cd packages/iframe-api-proxy
npm init -y
npm install typescript @types/node
```

#### **1.2 Core Types**
```typescript
// src/types/ApiTypes.ts
export interface ApiRequest {
  method: string;
  params?: any;
  userId: string;
  communityId: string;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// src/types/MessageTypes.ts
export interface ProxyRequestMessage {
  type: 'proxy-api-request';
  requestId: string;
  endpoint: string;
  payload: ApiRequest;
}

export interface ProxyResponseMessage {
  type: 'proxy-api-response';
  requestId: string;
  response: ApiResponse;
}
```

#### **1.3 Client Implementation**
```typescript
// src/client/ApiProxyClient.ts
export class ApiProxyClient {
  private activeIframe: HTMLIFrameElement | null = null;
  private pendingRequests = new Map<string, (response: any) => void>();

  constructor() {
    this.setupMessageListener();
  }

  async makeApiRequest(request: ApiRequest): Promise<ApiResponse> {
    return new Promise((resolve, reject) => {
      const requestId = this.generateRequestId();
      
      // Store promise resolver
      this.pendingRequests.set(requestId, resolve);
      
      // Send to active iframe
      this.sendToIframe({
        type: 'proxy-api-request',
        requestId,
        endpoint: this.getEndpointForMethod(request.method),
        payload: request
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 10000);
    });
  }

  setActiveIframe(iframe: HTMLIFrameElement) {
    this.activeIframe = iframe;
  }

  private handleProxyResponse(message: ProxyResponseMessage) {
    const resolver = this.pendingRequests.get(message.requestId);
    if (resolver) {
      resolver(message.response);
      this.pendingRequests.delete(message.requestId);
    }
  }
}
```

#### **1.4 Server Implementation**
```typescript
// src/server/ApiProxyServer.ts
export class ApiProxyServer {
  constructor(private baseUrl: string) {
    this.setupMessageListener();
  }

  private async handleProxyRequest(message: ProxyRequestMessage) {
    try {
      const response = await fetch(`${this.baseUrl}${message.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message.payload)
      });

      const result = await response.json();
      
      this.sendResponse(message.requestId, result);
    } catch (error) {
      this.sendError(message.requestId, error.message);
    }
  }

  private sendResponse(requestId: string, response: ApiResponse) {
    window.parent.postMessage({
      type: 'proxy-api-response',
      requestId,
      response
    }, '*');
  }
}
```

### **Phase 2: Integrate Package in Host Service**

#### **2.1 Install Package**
```bash
# In host-service repo
npm install @curia/iframe-api-proxy
```

#### **2.2 Update InternalPluginHost**
```typescript
// src/lib/embed/plugin-host/InternalPluginHost.ts
import { ApiProxyClient } from '@curia/iframe-api-proxy';

export class InternalPluginHost {
  private apiProxy: ApiProxyClient;

  constructor(...) {
    this.apiProxy = new ApiProxyClient();
    // ... existing code
  }

  private async handleApiRequest(message: InternalPluginMessage): Promise<void> {
    try {
      // Use proxy instead of direct fetch
      const response = await this.apiProxy.makeApiRequest({
        method: message.method,
        params: message.params,
        userId: this.authContext.userId,
        communityId: this.authContext.communityId
      });

      this.sendResponse(source, message, response.data);
    } catch (error) {
      this.sendError(source, message, error.message);
    }
  }

  private async switchToForum(): Promise<void> {
    // ... existing iframe creation code
    
    // Set as active iframe for API proxy
    this.apiProxy.setActiveIframe(iframe);
  }
}
```

#### **2.3 Update Embed Route**
```typescript
// src/app/embed/page.tsx
import { ApiProxyServer } from '@curia/iframe-api-proxy';

const EmbedContent: React.FC = () => {
  useEffect(() => {
    // Initialize API proxy server
    const proxyServer = new ApiProxyServer(window.location.origin);
    
    return () => proxyServer.destroy();
  }, []);

  // ... rest of component
};
```

### **Phase 3: Integrate Package in Forum App**

#### **3.1 Install Package**
```bash
# In forum repo
npm install @curia/iframe-api-proxy
```

#### **3.2 Add Proxy Server**
```typescript
// In forum app initialization
import { ApiProxyServer } from '@curia/iframe-api-proxy';

// When forum loads in iframe context
if (window !== window.parent) {
  const proxyServer = new ApiProxyServer('https://curia.network');
}
```

### **Phase 4: Testing & Deployment**

#### **4.1 Local Testing**
- Test with different CSP policies
- Verify API proxy works in both auth and forum phases
- Test error handling and timeouts

#### **4.2 Production Testing**
- Deploy to staging environment
- Test on various hosting platforms (Neocities, Netlify, Vercel)
- Load testing with multiple concurrent requests

#### **4.3 Monitoring**
- Add telemetry to track proxy performance
- Monitor error rates and timeouts
- Add fallback mechanisms

## Benefits of This Solution

### **🛡️ CSP Compliance**
- ✅ No direct API calls from customer pages
- ✅ All requests routed through same-domain iframes
- ✅ Works on any hosting platform regardless of CSP policy

### **🔄 DRY Architecture**
- ✅ Single npm package shared across all iframe apps
- ✅ Consistent API proxy logic
- ✅ Centralized type definitions and error handling

### **📈 Scalability**
- ✅ Easy to add new iframe applications
- ✅ New API endpoints automatically supported
- ✅ Version management through npm package

### **🔧 Maintainability**
- ✅ Single point of update for proxy logic
- ✅ Type-safe message passing
- ✅ Comprehensive error handling and timeouts

### **🔒 Security**
- ✅ No CORS bypass attempts
- ✅ Message validation and sanitization
- ✅ Request timeout protection

## Migration Strategy

### **Phase 1: Package Development (Week 1)**
- [ ] Create `@curia/iframe-api-proxy` package
- [ ] Implement core proxy logic
- [ ] Add comprehensive TypeScript types
- [ ] Write unit tests

### **Phase 2: Host Service Integration (Week 2)**
- [ ] Install package in host-service
- [ ] Update InternalPluginHost to use proxy
- [ ] Update embed route to handle proxy requests
- [ ] Test locally with simulated CSP

### **Phase 3: Forum Integration (Week 3)**
- [ ] Install package in forum repo
- [ ] Add proxy server initialization
- [ ] Test end-to-end API flow
- [ ] Deploy to staging

### **Phase 4: Production Deployment (Week 4)**
- [ ] Deploy to production
- [ ] Test on real customer sites with CSP
- [ ] Monitor performance and error rates
- [ ] Create documentation for future iframe apps

## Alternative Solutions Considered

### **❌ CORS Proxy Server**
- **Problem**: Still blocked by CSP
- **Complexity**: Additional infrastructure

### **❌ JSONP Fallback**
- **Problem**: Security concerns
- **Limitation**: Only GET requests

### **❌ Server-Side Rendering**
- **Problem**: Breaks real-time functionality
- **Complexity**: Complete architecture change

### **❌ Relaxed CSP Requirements**
- **Problem**: Customer sites won't change their CSP
- **Reality**: We must work within their constraints

## Success Metrics

### **Technical Metrics**
- ✅ 100% API success rate through proxy
- ✅ <100ms additional latency from proxy
- ✅ Zero CSP violations in browser console
- ✅ Support for all hosting platforms

### **Business Metrics**
- ✅ Customer deployments work on professional hosting
- ✅ Zero customer support tickets about CSP issues
- ✅ Successful embed integration on strict CSP sites

## Next Steps

1. **✅ Research Complete** - This document
2. **🔄 Create Package** - Start with Phase 1 implementation
3. **🔄 Host Service Integration** - Update InternalPluginHost
4. **🔄 Forum Integration** - Work with forum team
5. **🔄 Testing & Deployment** - Comprehensive validation

This solution provides a robust, scalable foundation for API communication that bypasses CSP restrictions while maintaining security and performance. 