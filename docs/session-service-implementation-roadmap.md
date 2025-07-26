# Session Service Implementation Roadmap

**Date**: January 25, 2025  
**Goal**: Implement dedicated session service iframe + optimize auth iframe reuse  
**Timeline**: 2-3 weeks  
**Status**: Ready to Begin

## 🎯 **Overview**

**Primary Goal**: Create a persistent hidden iframe (`curia.network/session-service`) that handles ALL session operations, solving cross-domain localStorage isolation.

**Secondary Goal**: Clean up orphaned auth iframes with simple DOM cleanup (no complex reuse logic).

---

## 📋 **Phase 1: Session Service Infrastructure** (Week 1)

### **Step 1.1: Create Session Service Endpoint** 
**Duration**: 1 day  
**Files**: `host-service/src/app/session-service/page.tsx`, `host-service/src/app/session-service/layout.tsx`

#### **1.1.1 Create Session Service Page**
```typescript
// host-service/src/app/session-service/page.tsx
'use client';

import React from 'react';
import { SessionServiceProvider } from '@/lib/embed/services/SessionServiceProvider';

export default function SessionServicePage() {
  return (
    <div style={{ display: 'none' }}>
      <SessionServiceProvider />
    </div>
  );
}
```

#### **1.1.2 Create Session Service Layout**
```typescript
// host-service/src/app/session-service/layout.tsx
export default function SessionServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
```

#### **1.1.3 Test Endpoint**
- Visit `http://localhost:3001/session-service`
- Should render minimal hidden service
- Verify no console errors

---

### **Step 1.2: Session Service Core** 
**Duration**: 2 days  
**Files**: `host-service/src/lib/embed/services/SessionService.ts`, `host-service/src/lib/embed/services/SessionServiceProvider.tsx`

#### **1.2.1 Session Service Provider Component**
```typescript
// host-service/src/lib/embed/services/SessionServiceProvider.tsx
'use client';

import React, { useEffect } from 'react';
import { SessionService } from './SessionService';

export const SessionServiceProvider: React.FC = () => {
  useEffect(() => {
    console.log('[SessionServiceProvider] Initializing session service');
    
    const sessionService = new SessionService();
    sessionService.initialize();
    
    return () => {
      sessionService.destroy();
    };
  }, []);

  return (
    <div id="session-service-active" style={{ display: 'none' }}>
      Session Service Active
    </div>
  );
};
```

#### **1.2.2 Session Service Core Class**
```typescript
// host-service/src/lib/embed/services/SessionService.ts
import { sessionManager } from '@/lib/SessionManager';

interface SessionServiceMessage {
  type: 'session-operation';
  operation: string;
  data?: any;
  requestId: string;
}

interface SessionServiceResponse {
  type: 'session-operation-response';
  requestId: string;
  success: boolean;
  data?: any;
  error?: string;
}

export class SessionService {
  private initialized = false;

  public initialize(): void {
    if (this.initialized) return;
    
    console.log('[SessionService] Initializing session service');
    
    // Listen for messages from parent windows
    window.addEventListener('message', this.handleMessage.bind(this));
    
    // Notify parent that service is ready
    this.notifyReady();
    
    this.initialized = true;
    console.log('[SessionService] Session service ready');
  }

  public destroy(): void {
    window.removeEventListener('message', this.handleMessage.bind(this));
    this.initialized = false;
  }

  private async handleMessage(event: MessageEvent): Promise<void> {
    if (!event.data || event.data.type !== 'session-operation') {
      return;
    }

    const message = event.data as SessionServiceMessage;
    console.log('[SessionService] Received operation:', message.operation);

    try {
      const result = await this.executeOperation(message.operation, message.data);
      this.sendResponse(event.source as Window, message.requestId, true, result);
    } catch (error) {
      console.error('[SessionService] Operation failed:', error);
      this.sendResponse(event.source as Window, message.requestId, false, null, error.message);
    }
  }

  private async executeOperation(operation: string, data?: any): Promise<any> {
    switch (operation) {
      case 'addSession':
        return sessionManager.addSession(data.session);
      
      case 'removeSession':
        return sessionManager.removeSession(data.sessionId);
      
      case 'syncWithDatabase':
        return sessionManager.syncWithDatabase();
      
      case 'getAllSessions':
        return sessionManager.getAllSessions();
      
      case 'getActiveSession':
        return sessionManager.getActiveSession();
      
      case 'setActiveSession':
        return sessionManager.setActiveSession(data.sessionId);
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  private sendResponse(
    targetWindow: Window, 
    requestId: string, 
    success: boolean, 
    data?: any, 
    error?: string
  ): void {
    const response: SessionServiceResponse = {
      type: 'session-operation-response',
      requestId,
      success,
      data,
      error
    };

    targetWindow.postMessage(response, '*');
  }

  private notifyReady(): void {
    // Notify all possible parent windows
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'session-service-ready',
        timestamp: Date.now()
      }, '*');
    }
  }
}
```

---

### **Step 1.3: Session Service Proxy (Parent)** 
**Duration**: 2 days  
**Files**: `host-service/src/lib/embed/services/SessionServiceProxy.ts`

#### **1.3.1 Session Service Proxy Implementation**
```typescript
// host-service/src/lib/embed/services/SessionServiceProxy.ts
interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

export class SessionServiceProxy {
  private iframe: HTMLIFrameElement;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private isReady = false;
  private readyPromise: Promise<void>;
  private readyResolve: (() => void) | null = null;

  constructor(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
    
    // Setup ready promise
    this.readyPromise = new Promise((resolve) => {
      this.readyResolve = resolve;
    });

    // Listen for responses
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  public async waitForReady(): Promise<void> {
    return this.readyPromise;
  }

  public async addSession(session: any): Promise<void> {
    return this.sendRequest('addSession', { session });
  }

  public async removeSession(sessionId: string): Promise<void> {
    return this.sendRequest('removeSession', { sessionId });
  }

  public async syncWithDatabase(): Promise<any> {
    return this.sendRequest('syncWithDatabase');
  }

  public async getAllSessions(): Promise<any[]> {
    return this.sendRequest('getAllSessions');
  }

  public async getActiveSession(): Promise<any> {
    return this.sendRequest('getActiveSession');
  }

  public async setActiveSession(sessionId: string): Promise<void> {
    return this.sendRequest('setActiveSession', { sessionId });
  }

  private async sendRequest(operation: string, data?: any): Promise<any> {
    await this.waitForReady();

    const requestId = this.generateRequestId();
    
    return new Promise((resolve, reject) => {
      // Setup timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Session service request timeout: ${operation}`));
      }, 10000);

      this.pendingRequests.set(requestId, { resolve, reject, timeout });

      // Send message to iframe
      this.iframe.contentWindow?.postMessage({
        type: 'session-operation',
        operation,
        data,
        requestId
      }, '*');
    });
  }

  private handleMessage(event: MessageEvent): void {
    if (!event.data) return;

    // Handle ready notification
    if (event.data.type === 'session-service-ready') {
      console.log('[SessionServiceProxy] Session service is ready');
      this.isReady = true;
      if (this.readyResolve) {
        this.readyResolve();
        this.readyResolve = null;
      }
      return;
    }

    // Handle operation responses
    if (event.data.type === 'session-operation-response') {
      const { requestId, success, data, error } = event.data;
      const pendingRequest = this.pendingRequests.get(requestId);
      
      if (pendingRequest) {
        clearTimeout(pendingRequest.timeout);
        this.pendingRequests.delete(requestId);
        
        if (success) {
          pendingRequest.resolve(data);
        } else {
          pendingRequest.reject(new Error(error || 'Unknown session service error'));
        }
      }
    }
  }

  private generateRequestId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public destroy(): void {
    // Clear any pending requests
    this.pendingRequests.forEach((request) => {
      clearTimeout(request.timeout);
      request.reject(new Error('Session service proxy destroyed'));
    });
    this.pendingRequests.clear();

    window.removeEventListener('message', this.handleMessage.bind(this));
  }
}
```

---

## 📋 **Phase 2: Integration with Current Architecture** (Week 2)

### **Step 2.1: Update InternalPluginHost** 
**Duration**: 2 days  
**Files**: `host-service/src/lib/embed/plugin-host/InternalPluginHost.ts`

#### **2.1.1 Add Session Service iframe Creation**
```typescript
// Add to InternalPluginHost class

private sessionServiceIframe: HTMLIFrameElement | null = null;
private sessionServiceProxy: SessionServiceProxy | null = null;

constructor(container: HTMLElement, config: EmbedConfig, hostServiceUrl: string, forumUrl: string, publicKey: string) {
  // ... existing initialization ...

  // 🚀 NEW: Create session service iframe FIRST
  this.createSessionServiceIframe();

  // ... rest of initialization ...
}

private createSessionServiceIframe(): void {
  console.log('[InternalPluginHost] Creating session service iframe');
  
  const iframe = document.createElement('iframe');
  iframe.src = `${this.hostServiceUrl}/session-service`;
  iframe.style.display = 'none';
  iframe.style.position = 'absolute';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('data-purpose', 'session-service');
  
  // Append to document body (not container) to persist across reloads
  document.body.appendChild(iframe);
  
  this.sessionServiceIframe = iframe;
  this.sessionServiceProxy = new SessionServiceProxy(iframe);
  
  console.log('[InternalPluginHost] Session service iframe created');
}

// Update destroy method to cleanup session service
public destroy(): void {
  // ... existing cleanup ...

  // Cleanup session service
  if (this.sessionServiceProxy) {
    this.sessionServiceProxy.destroy();
    this.sessionServiceProxy = null;
  }
  
  if (this.sessionServiceIframe) {
    if (this.sessionServiceIframe.parentNode) {
      this.sessionServiceIframe.parentNode.removeChild(this.sessionServiceIframe);
    }
    this.sessionServiceIframe = null;
  }

  // ... rest of cleanup ...
}
```

#### **2.1.2 Configure SessionManager to Use Service**
```typescript
// Update constructor after session service creation

constructor(...) {
  // Create session service iframe first
  this.createSessionServiceIframe();

  // Configure SessionManager to use session service
  this.configureSessionManagerWithService();

  // ... rest of initialization ...
}

private async configureSessionManagerWithService(): Promise<void> {
  if (!this.sessionServiceProxy) {
    console.warn('[InternalPluginHost] No session service proxy available');
    return;
  }

  try {
    // Wait for service to be ready
    await this.sessionServiceProxy.waitForReady();
    
    // Configure SessionManager to use service
    sessionManager.configureWithService(this.sessionServiceProxy);
    
    console.log('[InternalPluginHost] SessionManager configured with session service');
  } catch (error) {
    console.error('[InternalPluginHost] Failed to configure session service:', error);
    // SessionManager will fall back to local mode
  }
}
```

---

### **Step 2.2: Refactor SessionManager** 
**Duration**: 3 days  
**Files**: `host-service/src/lib/SessionManager.ts`

#### **2.2.1 Add Service Mode to SessionManager**
```typescript
// Add to SessionManager class

private serviceProxy: SessionServiceProxy | null = null;
private mode: 'local' | 'service' = 'local';

public configureWithService(proxy: SessionServiceProxy): void {
  this.serviceProxy = proxy;
  this.mode = 'service';
  console.log('[SessionManager] Configured to use session service');
}

// Update all main methods to use service when available
public async addSession(sessionData: SessionData): Promise<void> {
  if (this.mode === 'service' && this.serviceProxy) {
    console.log('[SessionManager] Adding session via service');
    return this.serviceProxy.addSession(sessionData);
  }

  // Fallback to local mode
  console.log('[SessionManager] Adding session locally (service not available)');
  return this.addSessionLocal(sessionData);
}

public async removeSession(sessionId: string): Promise<void> {
  if (this.mode === 'service' && this.serviceProxy) {
    return this.serviceProxy.removeSession(sessionId);
  }

  return this.removeSessionLocal(sessionId);
}

public async syncWithDatabase(): Promise<void> {
  if (this.mode === 'service' && this.serviceProxy) {
    return this.serviceProxy.syncWithDatabase();
  }

  return this.syncWithDatabaseLocal();
}

public getAllSessions(): SessionData[] {
  if (this.mode === 'service' && this.serviceProxy) {
    // For synchronous methods, we'll need to cache or make them async
    // For now, return local cache
    console.warn('[SessionManager] getAllSessions called in service mode - returning local cache');
  }

  return this.storage.activeSessions;
}

// Rename existing methods to *Local variants
private async addSessionLocal(sessionData: SessionData): Promise<void> {
  // ... existing implementation ...
}

private async removeSessionLocal(sessionId: string): Promise<void> {
  // ... existing implementation ...
}

private async syncWithDatabaseLocal(): Promise<void> {
  // ... existing implementation ...
}
```

---

### **Step 2.3: Test Basic Integration** 
**Duration**: 1 day

#### **2.3.1 Test Session Service Creation**
- Verify session service iframe is created
- Check that service becomes ready
- Confirm no console errors

#### **2.3.2 Test Basic Session Operations**
- Add a session via service
- Verify it persists in service iframe's localStorage
- Test session retrieval

---

## 📋 **Phase 3: Simple Auth iframe Cleanup** (During Phase 2)

### **Step 3.1: Add Auth iframe Cleanup** 
**Duration**: 1 day  
**Files**: `host-service/src/lib/embed/plugin-host/InternalPluginHost.ts`

#### **3.1.1 Current Auth iframe Issues**
- Auth iframes become orphaned after forum phase (remain in DOM but unused)
- Need simple cleanup when switching phases
- No complex pooling/reuse - just proper DOM cleanup

#### **3.1.2 Add Cleanup to switchToForum()**
```typescript
// Add to InternalPluginHost.switchToForum()

private async switchToForum(): Promise<void> {
  console.log('[InternalPluginHost] Switching to forum phase via services');
  
  // 🚀 NEW: Clean up auth iframe before forum setup
  this.cleanupCurrentAuthIframe();
  
  const authContext = this.authService.getAuthContext();
  if (!authContext) {
    console.error('[InternalPluginHost] Cannot switch to forum - no auth context');
    return;
  }

  // ... existing forum setup logic ...
}

private cleanupCurrentAuthIframe(): void {
  // Find and remove auth iframes in current container
  const authIframes = this.container.querySelectorAll('iframe[src*="/embed"]');
  authIframes.forEach(iframe => {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
      console.log('[InternalPluginHost] Auth iframe cleaned up');
    }
  });
}
```

#### **3.1.3 Add Cleanup to Session Switching**
```typescript
// Improve session switching cleanup

private async onSessionSwitch(newSessionData: any): Promise<void> {
  console.log('[InternalPluginHost] Session switch with proper cleanup');
  
  // Clean up current state
  this.cleanupCurrentIframes();
  this.resetUIState();
  
  // Start fresh with new session
  this.initializeAuthPhase();
}

private cleanupCurrentIframes(): void {
  // Clean up auth iframes
  this.cleanupCurrentAuthIframe();
  
  // Hide forum iframes (keep them for potential reuse within same session)
  this.communityIframes.forEach((iframe) => {
    iframe.style.display = 'none';
  });
}

private resetUIState(): void {
  if (this.communitySidebar) {
    this.communitySidebar.destroy();
    this.communitySidebar = null;
  }
  this.embedContainer = null;
}
```

#### **3.1.4 Add Data Attributes for Better Tracking**
```typescript
// When creating auth iframes, add identifying attributes
// In IframeManager.createAuthIframe()

const iframe = document.createElement('iframe');
iframe.src = authUrl.toString();
iframe.setAttribute('data-purpose', 'auth');
iframe.setAttribute('data-session-id', sessionId || 'unknown');
iframe.setAttribute('data-created', Date.now().toString());

// Makes cleanup more precise and debuggable
```

---

## 📋 **Phase 4: Testing & Polish** (Week 3)

### **Step 4.1: Cross-Domain Testing** 
**Duration**: 2 days

#### **4.1.1 Test Environments**
- `localhost:3001` (same domain)
- `neocities.org` (third-party domain)
- Custom test domain

#### **4.1.2 Test Scenarios**
- Session creation and persistence
- Session switching
- Page refresh behavior
- Cross-tab synchronization
- Community switching
- Auth iframe reuse

### **Step 4.2: Error Handling & Fallbacks** 
**Duration**: 2 days

#### **4.2.1 Session Service Fallbacks**
```typescript
// Add robust fallback handling

public async addSession(sessionData: SessionData): Promise<void> {
  if (this.mode === 'service' && this.serviceProxy) {
    try {
      return await this.serviceProxy.addSession(sessionData);
    } catch (error) {
      console.warn('[SessionManager] Service failed, falling back to local:', error);
      return this.addSessionLocal(sessionData);
    }
  }

  return this.addSessionLocal(sessionData);
}
```

#### **4.2.2 Auth iframe Cleanup Error Handling**
```typescript
// Add error handling to cleanup

private cleanupCurrentAuthIframe(): void {
  try {
    const authIframes = this.container.querySelectorAll('iframe[src*="/embed"]');
    authIframes.forEach(iframe => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
        console.log('[InternalPluginHost] Auth iframe cleaned up');
      }
    });
  } catch (error) {
    console.warn('[InternalPluginHost] Auth iframe cleanup failed:', error);
    // Continue anyway - not critical
  }
}
```

### **Step 4.3: Performance Optimization** 
**Duration**: 1 day

#### **4.3.1 Message Batching**
```typescript
// Batch multiple session operations
private batchOperations(operations: SessionOperation[]): Promise<any[]> {
  // ... batch logic ...
}
```

#### **4.3.2 Caching**
```typescript
// Cache frequently accessed session data
private sessionCache: Map<string, SessionData> = new Map();
```

### **Step 4.4: Documentation & Cleanup** 
**Duration**: 1 day

#### **4.4.1 Update Documentation**
- Update session management docs
- Add troubleshooting guide
- Document new APIs

#### **4.4.2 Remove Debug Code**
- Clean up console logs
- Remove temporary testing code
- Optimize bundle size

---

## 🎯 **Expected Outcomes**

### **✅ Session Persistence**
- Sessions work on all domains (neocities, localhost, any third-party)
- No more "(fallback)" in profile menu
- Consistent database sync across iframe phases

### **✅ Performance Improvements**
- Clean DOM (no orphaned auth iframes)
- Proper resource cleanup
- Better memory management

### **✅ Architectural Benefits**
- Clean separation of concerns
- Testable session service
- Scalable for future session features

---

## 🚧 **Implementation Notes**

### **Critical Points**
1. **Session service iframe must be created FIRST** - before any other operations
2. **Always append session service to document.body** - not the container (survives reloads)
3. **Robust fallback logic** - local mode when service fails
4. **Proper cleanup** - prevent memory leaks from orphaned iframes

### **Testing Checklist**
- [ ] Session service iframe loads correctly
- [ ] Session operations work via service
- [ ] Fallback to local mode works
- [ ] Auth iframe cleanup works properly
- [ ] Cross-domain persistence works
- [ ] No orphaned iframes remain in DOM

### **Risk Mitigation**
- **Backward compatibility**: Existing SessionManager API unchanged
- **Graceful degradation**: Falls back to current behavior if service fails
- **Incremental rollout**: Can be enabled/disabled via feature flag

This roadmap provides a comprehensive path to solving the cross-domain session persistence issue while optimizing the overall iframe architecture for better performance and resource management. 