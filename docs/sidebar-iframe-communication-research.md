# Sidebar-Iframe Communication Research

## IMPLEMENTATION COMPLETE ✅

**Status**: Successfully implemented one-directional sidebar communication using MessageRouter extension.

**Architecture Decision**: Abandoned the complex bidirectional `@curia_/iframe-commands` package in favor of extending the existing `MessageRouter` infrastructure.

## 🎯 FINAL IMPLEMENTATION

### **Host Service (MessageRouter Extension)**

1. **Extended InternalMessageType enum**:
   ```typescript
   export enum InternalMessageType {
     API_REQUEST = 'api_request',
     API_RESPONSE = 'api_response',
     INIT = 'init',
     ERROR = 'error',
     SIDEBAR_ACTION = 'sidebar_action'  // 🆕 NEW
   }
   ```

2. **Added SidebarActionMessage interface**:
   ```typescript
   interface SidebarActionMessage extends InternalPluginMessage {
     type: InternalMessageType.SIDEBAR_ACTION;
     action: 'search' | 'messages' | 'notifications';
     payload?: any;
   }
   ```

3. **Added sendSidebarAction method to MessageRouter**:
   ```typescript
   sendSidebarAction(action: 'search' | 'messages' | 'notifications', payload?: any): void {
     const activeIframe = this.callbacks.getActiveIframe?.();
     if (!activeIframe) {
       console.warn('[MessageRouter] No active iframe available for sidebar action:', action);
       return;
     }

     const message: SidebarActionMessage = {
       type: InternalMessageType.SIDEBAR_ACTION,
       action,
       payload,
       iframeUid: this.myUid,
       requestId: `sidebar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
     };

     this.sendMessageToIframe(activeIframe, message);
     console.log(`[MessageRouter] Sidebar action sent: ${action}`, payload);
   }
   ```

4. **Updated CommunitySidebar** to use MessageRouter instead of console.log stubs:
   ```typescript
   // In CommunitySidebarOptions interface
   messageRouter?: MessageRouter;

   // In handleNavItemClick method
   switch (iconName) {
     case 'search':
       this.messageRouter.sendSidebarAction('search');
       break;
     case 'messages':
       this.messageRouter.sendSidebarAction('messages');
       break;
     case 'notifications':
       this.messageRouter.sendSidebarAction('notifications');
       break;
   }
   ```

### **Forum Service (Simple Listener)**

1. **Created SidebarActionListener component**:
   ```typescript
   export const SidebarActionListener: React.FC = () => {
     const { openSearch } = useGlobalSearch();

     useEffect(() => {
       const handleMessage = (event: MessageEvent) => {
         if (!event.data || event.data.type !== 'sidebar_action') {
           return;
         }

         const { action, payload } = event.data;
         
         switch (action) {
           case 'search':
             openSearch({
               initialQuery: payload?.searchQuery || '',
               autoExpandForm: false
             });
             break;
           case 'messages':
             // TODO: Implement messages interface
             break;
           case 'notifications':
             // TODO: Implement notifications interface
             break;
         }
       };

       window.addEventListener('message', handleMessage);
       return () => window.removeEventListener('message', handleMessage);
     }, [openSearch]);

     return null;
   };
   ```

2. **Added to layout.tsx** inside Providers for GlobalSearchContext access.

## 🚀 BENEFITS OF THIS APPROACH

1. **Leverages Existing Infrastructure**: Uses the robust `MessageRouter` with its UID-based routing and multi-iframe management
2. **Simple & Clean**: No complex package, no bidirectional complexity, no response handling
3. **Perfect for Use Case**: Sidebar actions just trigger forum features - no response needed
4. **Easy to Extend**: Adding new sidebar actions is trivial
5. **Consistent with Architecture**: Follows existing patterns in the codebase

## 🎯 CURRENT FUNCTIONALITY

- ✅ **Search Button**: Opens GlobalSearchModal in forum
- 🚧 **Messages Button**: Placeholder (ready for implementation)
- 🚧 **Notifications Button**: Placeholder (ready for implementation)

## 🔄 MESSAGE FLOW

```
[Sidebar Button Click] 
    ↓
[CommunitySidebar.handleNavItemClick()] 
    ↓
[MessageRouter.sendSidebarAction()] 
    ↓
[Gets active iframe via getActiveIframe callback]
    ↓
[Sends postMessage to iframe]
    ↓
[SidebarActionListener receives message]
    ↓
[Triggers appropriate forum action]
```

## 📝 NEXT STEPS

1. **Implement Messages Interface**: Add messages functionality to forum and wire up the action
2. **Implement Notifications Interface**: Add notifications functionality to forum and wire up the action  
3. **Add Keyboard Shortcuts**: Consider adding global Cmd+K support in host service
4. **Enhanced Payloads**: Add support for passing search queries or other parameters

---

## ARCHIVE: Previous Research

<details>
<summary>Original complex approach (abandoned)</summary>

### CRITICAL ISSUES DISCOVERED IN IMPLEMENTATION

During initial implementation, we discovered that the sidebar communication needs to work with the **multi-iframe system** where:

1. **Multiple iframes exist simultaneously** - one per community the user has joined
2. **Only one iframe is active/visible** at a time  
3. **Users can switch between communities** via the sidebar
4. **Each iframe has a unique `iframeUid`** for message routing

The existing `MessageRouter` already handles this complexity with:
- **UID-based message filtering** (`message.iframeUid !== this.myUid`)
- **Active iframe management** via `ApiProxyClient.setActiveIframe()` 
- **Signature validation** for security
- **Error handling and logging**

### REQUIRED ARCHITECTURAL CHANGES

Instead of creating a new communication channel, we should **extend the existing `MessageRouter`**:

1. **Add new message types** to `InternalMessageType` enum:
   ```typescript
   SIDEBAR_ACTION = 'sidebar_action',
   SIDEBAR_ACTION_RESPONSE = 'sidebar_action_response'  // If responses needed
   ```

2. **Extend message interface**:
   ```typescript
   interface SidebarActionMessage extends InternalPluginMessage {
     type: InternalMessageType.SIDEBAR_ACTION;
     action: 'search' | 'messages' | 'notifications';
     payload?: any;
   }
   ```

3. **Add method to MessageRouter**:
   ```typescript
   sendSidebarAction(action: string, payload?: any): void {
     // Use existing iframe routing and UID system
   }
   ```

4. **Forum receives via existing postMessage listener** - no new infrastructure needed

This approach:
- ✅ **Leverages existing multi-iframe routing**
- ✅ **Reuses UID filtering and security** 
- ✅ **Minimal code changes** to both repos
- ✅ **Consistent with current architecture**

</details> 