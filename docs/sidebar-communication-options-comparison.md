# 🔄 SIDEBAR COMMUNICATION: DETAILED OPTIONS COMPARISON

Comparing **extending iframe-api-proxy** vs **creating new shared package** for sidebar-to-iframe communication.

---

## 🎯 **OPTION A: EXTEND IFRAME-API-PROXY**

### **What We'd Add to iframe-api-proxy**

#### **New Message Types** (`MessageTypes.ts`)
```typescript
export enum MessageType {
  // Existing API-focused messages...
  API_REQUEST = 'api_request',
  API_RESPONSE = 'api_response',
  PROXY_API_REQUEST = 'proxy-api-request',
  PROXY_API_RESPONSE = 'proxy-api-response',
  
  // 🆕 NEW: Sidebar action messages
  SIDEBAR_ACTION = 'sidebar_action',
  SIDEBAR_ACTION_RESPONSE = 'sidebar_action_response'
}

// 🆕 NEW: Sidebar action message interface
export interface SidebarActionMessage extends BaseMessage {
  type: MessageType.SIDEBAR_ACTION;
  action: 'search' | 'messages' | 'notifications';
  params?: {
    searchQuery?: string;
    focus?: boolean;
    [key: string]: any;
  };
}

// 🆕 NEW: Sidebar action response
export interface SidebarActionResponseMessage extends BaseMessage {
  type: MessageType.SIDEBAR_ACTION_RESPONSE;
  success: boolean;
  error?: string;
  data?: any;
}
```

#### **Client Extensions** (`ApiProxyClient.ts`)
```typescript
export class ApiProxyClient {
  // Existing API proxy methods...
  
  // 🆕 NEW: Sidebar action methods
  async sendSidebarAction(action: 'search' | 'messages' | 'notifications', params?: any): Promise<any> {
    if (!this.activeIframe) {
      throw new Error('No active iframe for sidebar action');
    }
    
    const requestId = generateRequestId();
    const message: SidebarActionMessage = {
      type: MessageType.SIDEBAR_ACTION,
      requestId,
      action,
      params,
      timestamp: Date.now()
    };
    
    return this.sendMessageAndWaitForResponse(message);
  }
  
  // Convenience methods
  async triggerSearch(searchQuery?: string): Promise<void> {
    return this.sendSidebarAction('search', { searchQuery, focus: true });
  }
  
  async openMessages(): Promise<void> {
    return this.sendSidebarAction('messages');
  }
  
  async openNotifications(): Promise<void> {
    return this.sendSidebarAction('notifications');
  }
}
```

#### **Server Extensions** (`ApiProxyServer.ts`)
```typescript
export class ApiProxyServer {
  // Existing API proxy handling...
  
  private handleMessage(event: MessageEvent): void {
    // Existing API request handling...
    
    // 🆕 NEW: Handle sidebar actions
    if (isSidebarAction(event.data)) {
      this.handleSidebarAction(event.data, event.source);
      return;
    }
  }
  
  private handleSidebarAction(message: SidebarActionMessage, source: MessageEventSource): void {
    // Emit event for the forum app to handle
    this.emit('sidebarAction', {
      action: message.action,
      params: message.params,
      requestId: message.requestId,
      respond: (success: boolean, data?: any, error?: string) => {
        const response: SidebarActionResponseMessage = {
          type: MessageType.SIDEBAR_ACTION_RESPONSE,
          requestId: message.requestId,
          success,
          data,
          error,
          timestamp: Date.now()
        };
        (source as Window).postMessage(response, '*');
      }
    });
  }
}
```

### **Usage in Host Service**
```typescript
// In CommunitySidebar.ts
import { ApiProxyClient } from '@curia_/iframe-api-proxy';

export class CommunitySidebar {
  private apiProxy: ApiProxyClient;
  
  constructor(options: CommunitySidebarOptions) {
    this.apiProxy = options.apiProxy; // Pass from InternalPluginHost
  }
  
  private async handleSearchAction(): Promise<void> {
    try {
      await this.apiProxy.triggerSearch();
    } catch (error) {
      console.error('Failed to trigger search:', error);
    }
  }
}
```

### **Usage in Forum App**
```typescript
// In forum app
import { ApiProxyServer } from '@curia_/iframe-api-proxy';

const proxyServer = new ApiProxyServer({ /* config */ });

proxyServer.on('sidebarAction', ({ action, params, respond }) => {
  switch (action) {
    case 'search':
      // Trigger global search modal
      globalSearchModal.open(params.searchQuery);
      if (params.focus) {
        globalSearchModal.focusInput();
      }
      respond(true);
      break;
      
    case 'messages':
      // Open DM interface
      messageInterface.open();
      respond(true);
      break;
      
    case 'notifications':
      // Open notifications panel
      notificationPanel.open();
      respond(true);
      break;
      
    default:
      respond(false, null, `Unknown action: ${action}`);
  }
});
```

---

## 🎯 **OPTION B: NEW SHARED PACKAGE**

### **Package Structure: `@curia/sidebar-communication`**

#### **Package Setup**
```json
{
  "name": "@curia/sidebar-communication",
  "version": "1.0.0",
  "description": "Sidebar-to-iframe communication for Curia embeds",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": ["curia", "sidebar", "iframe", "communication", "postmessage"]
}
```

#### **Message Types** (`src/types/MessageTypes.ts`)
```typescript
export enum SidebarMessageType {
  ACTION = 'sidebar_action',
  ACTION_RESPONSE = 'sidebar_action_response'
}

export interface BaseSidebarMessage {
  type: SidebarMessageType;
  requestId: string;
  timestamp?: number;
}

export interface SidebarActionMessage extends BaseSidebarMessage {
  type: SidebarMessageType.ACTION;
  action: 'search' | 'messages' | 'notifications';
  params?: {
    searchQuery?: string;
    focus?: boolean;
    [key: string]: any;
  };
}

export interface SidebarActionResponseMessage extends BaseSidebarMessage {
  type: SidebarMessageType.ACTION_RESPONSE;
  success: boolean;
  error?: string;
  data?: any;
}

export type SidebarMessage = SidebarActionMessage | SidebarActionResponseMessage;
```

#### **Client** (`src/client/SidebarClient.ts`)
```typescript
export class SidebarClient {
  private activeIframe: HTMLIFrameElement | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  
  constructor(private config: SidebarClientConfig = {}) {
    this.setupMessageListener();
  }
  
  setActiveIframe(iframe: HTMLIFrameElement): void {
    this.activeIframe = iframe;
  }
  
  async triggerSearch(searchQuery?: string): Promise<void> {
    return this.sendAction('search', { searchQuery, focus: true });
  }
  
  async openMessages(): Promise<void> {
    return this.sendAction('messages');
  }
  
  async openNotifications(): Promise<void> {
    return this.sendAction('notifications');
  }
  
  private async sendAction(action: string, params?: any): Promise<any> {
    // Implementation similar to ApiProxyClient pattern
  }
}
```

#### **Server** (`src/server/SidebarServer.ts`)
```typescript
export class SidebarServer extends EventEmitter {
  constructor(private config: SidebarServerConfig = {}) {
    super();
    this.setupMessageListener();
  }
  
  private handleMessage(event: MessageEvent): void {
    if (isSidebarAction(event.data)) {
      this.handleSidebarAction(event.data, event.source);
    }
  }
  
  private handleSidebarAction(message: SidebarActionMessage, source: MessageEventSource): void {
    this.emit('action', {
      action: message.action,
      params: message.params,
      requestId: message.requestId,
      respond: (success: boolean, data?: any, error?: string) => {
        // Send response back
      }
    });
  }
}
```

### **Usage in Host Service**
```typescript
// In host-service
import { SidebarClient } from '@curia/sidebar-communication';

export class CommunitySidebar {
  private sidebarClient: SidebarClient;
  
  constructor(options: CommunitySidebarOptions) {
    this.sidebarClient = new SidebarClient();
    this.sidebarClient.setActiveIframe(options.activeIframe);
  }
  
  private async handleSearchAction(): Promise<void> {
    await this.sidebarClient.triggerSearch();
  }
}
```

### **Usage in Forum App**
```typescript
// In forum app  
import { SidebarServer } from '@curia/sidebar-communication';

const sidebarServer = new SidebarServer();

sidebarServer.on('action', ({ action, params, respond }) => {
  // Same handling logic as Option A
});
```

---

## ⚖️ **COMPARISON TABLE**

| Aspect | **Option A: Extend iframe-api-proxy** | **Option B: New Package** |
|--------|---------------------------------------|----------------------------|
| **Conceptual Fit** | ⚠️ Mixed - adds UI commands to API proxy | ✅ Perfect - purpose-built |
| **Code Reuse** | ✅ Leverages existing infrastructure | ⚠️ Some duplication of patterns |
| **Backwards Compatibility** | ⚠️ Risk of breaking changes | ✅ No impact on existing code |
| **Package Maintenance** | ✅ One less package to maintain | ❌ Additional package overhead |
| **API Clarity** | ⚠️ Mixed concerns (API + UI) | ✅ Clear, focused API |
| **Bundle Size** | ⚠️ Larger (includes API proxy code) | ✅ Smaller, focused |
| **Learning Curve** | ⚠️ Developers need to understand API proxy | ✅ Simple, focused concepts |
| **Future Extensibility** | ⚠️ Constrained by API proxy patterns | ✅ Full control over design |
| **Separation of Concerns** | ❌ Mixes API proxy with UI commands | ✅ Clean separation |

---

## 💡 **RECOMMENDATION**

**Option B: New Shared Package** for these reasons:

1. **🎯 Purpose-built**: Designed specifically for sidebar communication
2. **🧹 Clean separation**: UI commands separate from API proxying
3. **📦 Lightweight**: Smaller bundle, focused functionality  
4. **🔮 Future-proof**: Full control over design and evolution
5. **👨‍💻 Developer clarity**: Clear, understandable API surface

**Package Name**: `@curia/sidebar-communication` 
**Size**: ~50KB (much smaller than iframe-api-proxy ~200KB)
**Maintenance**: Minimal - stable communication patterns 