# Bidirectional PostMessage Communication Specification

## 🎯 **Objective**
Establish a comprehensive 2-way communication protocol between the host-service embed and Curia forum iframe to:
1. Replace inefficient polling with event-driven community join notifications
2. Enable parent-triggered actions in the forum (e.g., opening search modal)

---

## 🚨 **Problem We're Solving**

**Current Issue**: The host-service embed runs **25 API calls every time it loads** (5 polls × 1 second × 5 seconds) to detect if a user has joined new communities. This is causing:
- High CPU usage and hot computers
- Unnecessary API spam 
- Poor performance at scale

**Root Cause**: The Curia forum (inside iframe) and the host-service sidebar (in parent frame) don't communicate when community joins happen.

---

## 📤 **Required PostMessage Implementation**

### **When to Send**
Send a postMessage **immediately after** a user successfully joins a community in the Curia forum.

This includes:
- ✅ Joining a community via community discovery modal
- ✅ Joining a community via direct link/invitation
- ✅ Joining a community via any other mechanism in the forum
- ❌ NOT when just viewing/browsing a community without joining

### **Message Structure**
```typescript
// Send this message from Curia forum iframe to parent
window.parent.postMessage({
  type: 'curia-community-joined',
  data: {
    userId: string,           // Current user's ID
    communityId: string,      // ID of the newly joined community
    community: {              // Full community object
      id: string,
      name: string,
      description?: string,
      icon?: string,
      logoUrl?: string,
      gradientClass?: string,
      memberCount: number,
      userRole: string,       // User's role in this community ('member', 'admin', etc.)
      isPublic: boolean,
      // ... any other community properties your forum has
    },
    timestamp: number,        // Date.now() when join occurred
    sessionToken?: string     // Current session token if available
  }
}, '*');
```

### **Example Implementation**
```typescript
// In your community join success handler:
async function handleCommunityJoinSuccess(communityId: string, fullCommunityObject: Community) {
  try {
    // Send notification to parent embed
    window.parent.postMessage({
      type: 'curia-community-joined',
      data: {
        userId: getCurrentUserId(),
        communityId: communityId,
        community: fullCommunityObject,
        timestamp: Date.now(),
        sessionToken: getCurrentSessionToken()
      }
    }, '*');
    
    console.log('[Curia] Notified parent of community join:', communityId);
  } catch (error) {
    console.error('[Curia] Failed to notify parent of community join:', error);
    // Don't throw - this is just a notification
  }
}
```

---

## 📥 **How Host-Service Will Handle It**

The host-service embed will listen for these messages and update the sidebar immediately:

```typescript
// This replaces the polling entirely
window.addEventListener('message', (event) => {
  if (event.data?.type === 'curia-community-joined') {
    const { communityId, community } = event.data.data;
    
    // Add new community to sidebar instantly
    this.communitySidebar?.addCommunity(community);
    
    console.log('[Host-Service] Community join detected:', community.name);
  }
});
```

---

## 🎯 **Critical Requirements**

### **1. Timing**
- Send the message **AFTER** the join is confirmed successful
- Send **BEFORE** any UI redirects or page changes
- Send **EVERY TIME** a join happens (even if user rejoins the same community)

### **2. Data Quality**
- The `community` object must contain **all fields needed for sidebar rendering**
- The `userRole` must reflect the user's **actual role** in the newly joined community
- The `memberCount` should be **up-to-date** (incremented)

### **3. Error Handling**  
- If postMessage fails, **don't block the user flow**
- Log errors but continue with normal community join process
- The embed should still work even if postMessage is broken

### **4. Security**
- Use `window.parent.postMessage(message, '*')` for maximum compatibility
- Don't include sensitive data (passwords, private keys, etc.)
- Session tokens are OK since they're already shared in auth flow

---

## 🧪 **Testing Checklist**

Please test these scenarios and confirm postMessage is sent:

- [ ] **Community Discovery**: User joins via discovery modal in embed
- [ ] **Direct Links**: User joins via direct community invitation link  
- [ ] **Search Results**: User joins community found via search
- [ ] **Existing Member**: User rejoins a community they previously left
- [ ] **Multiple Joins**: User joins multiple communities in succession
- [ ] **Error Recovery**: Join fails then succeeds - only send on success

---

## 🚀 **Performance Impact**

**Before**: 25 API calls per embed load
**After**: 0 polling calls + 1 instant notification per actual join

**Expected Results**:
- 🔥 Eliminates CPU-intensive polling 
- ⚡ Instant sidebar updates (no 5-second delay)
- 📉 Massive reduction in unnecessary API traffic
- 🧊 Cooler computers for developers

---

## 🔄 **Bidirectional Communication Protocol**

### **Direction 2: Parent → Curia Forum (Command System)**

The parent embed should be able to trigger actions in the Curia forum iframe using a command-based messaging system.

### **Command Message Structure**
```typescript
// Send from parent to Curia forum iframe
const iframe = document.querySelector('iframe[data-curia-iframe]');
iframe.contentWindow.postMessage({
  type: 'curia-command',
  data: {
    command: string,          // Command identifier
    params?: any,             // Optional command parameters
    requestId: string,        // Unique ID for tracking responses
    timestamp: number         // Date.now() when command sent
  }
}, '*');
```

### **Command Response Structure**
```typescript
// Send from Curia forum back to parent
window.parent.postMessage({
  type: 'curia-command-response',
  data: {
    requestId: string,        // Matches the original request
    command: string,          // Echo of the command
    success: boolean,         // Whether command executed successfully
    data?: any,              // Optional response data
    error?: string,          // Error message if success = false
    timestamp: number        // Date.now() when response sent
  }
}, '*');
```

---

## 🔍 **Command Implementation: Open Search Modal**

### **Parent Side (Host-Service)**
```typescript
class CuriaIframeController {
  private pendingCommands = new Map<string, { resolve: Function, reject: Function }>();
  
  async openSearchModal(): Promise<void> {
    const requestId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      // Track the pending command
      this.pendingCommands.set(requestId, { resolve, reject });
      
      // Send command to iframe
      this.iframe.contentWindow.postMessage({
        type: 'curia-command',
        data: {
          command: 'open-search',
          requestId,
          timestamp: Date.now()
        }
      }, '*');
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (this.pendingCommands.has(requestId)) {
          this.pendingCommands.delete(requestId);
          reject(new Error('Command timeout: open-search'));
        }
      }, 5000);
    });
  }
  
  handleCommandResponse(response: any): void {
    const { requestId, success, error } = response.data;
    const pending = this.pendingCommands.get(requestId);
    
    if (pending) {
      this.pendingCommands.delete(requestId);
      if (success) {
        pending.resolve();
      } else {
        pending.reject(new Error(error || 'Command failed'));
      }
    }
  }
}

// Usage example:
try {
  await curiaController.openSearchModal();
  console.log('[Host-Service] Search modal opened successfully');
} catch (error) {
  console.error('[Host-Service] Failed to open search modal:', error);
}
```

### **Forum Side (Curia Implementation)**
```typescript
// Listen for commands from parent
window.addEventListener('message', (event) => {
  if (event.data?.type === 'curia-command') {
    handleParentCommand(event.data.data);
  }
});

async function handleParentCommand(commandData: any): Promise<void> {
  const { command, requestId, params } = commandData;
  
  try {
    let result: any = null;
    
    switch (command) {
      case 'open-search':
        result = await executeOpenSearch();
        break;
      
      case 'focus-composer':
        result = await executeFocusComposer(params);
        break;
      
      case 'navigate-to-post':
        result = await executeNavigateToPost(params?.postId);
        break;
      
      default:
        throw new Error(`Unknown command: ${command}`);
    }
    
    // Send success response
    window.parent.postMessage({
      type: 'curia-command-response',
      data: {
        requestId,
        command,
        success: true,
        data: result,
        timestamp: Date.now()
      }
    }, '*');
    
  } catch (error) {
    // Send error response
    window.parent.postMessage({
      type: 'curia-command-response',
      data: {
        requestId,
        command,
        success: false,
        error: error.message,
        timestamp: Date.now()
      }
    }, '*');
  }
}

// Command implementations
async function executeOpenSearch(): Promise<void> {
  // Open your global search modal
  const searchModal = document.querySelector('[data-search-modal]');
  if (searchModal) {
    searchModal.classList.add('open');
    // Focus search input if available
    const searchInput = searchModal.querySelector('input[type="search"]');
    if (searchInput) {
      searchInput.focus();
    }
  } else {
    throw new Error('Search modal not found');
  }
}

async function executeFocusComposer(params?: any): Promise<void> {
  // Focus the post composer
  const composer = document.querySelector('[data-composer]');
  if (composer) {
    composer.scrollIntoView({ behavior: 'smooth' });
    const textArea = composer.querySelector('textarea');
    if (textArea) {
      textArea.focus();
    }
  } else {
    throw new Error('Composer not found');
  }
}

async function executeNavigateToPost(postId?: string): Promise<void> {
  if (!postId) {
    throw new Error('Post ID required');
  }
  
  // Navigate to specific post
  const postElement = document.querySelector(`[data-post-id="${postId}"]`);
  if (postElement) {
    postElement.scrollIntoView({ behavior: 'smooth' });
  } else {
    // If post not visible, navigate via router
    window.location.hash = `#post-${postId}`;
  }
}
```

---

## 📋 **Supported Commands (Expandable)**

### **Phase 1: Essential Commands**
- `open-search` - Open global search modal
- `focus-composer` - Focus the post composer
- `navigate-to-post` - Scroll to or navigate to specific post

### **Phase 2: Advanced Commands**
- `open-user-profile` - Open user profile modal
- `trigger-notification` - Show notification/toast
- `set-theme` - Switch between light/dark theme
- `refresh-content` - Refresh current view

### **Phase 3: Integration Commands**
- `export-data` - Export user's content
- `import-content` - Import external content
- `sync-settings` - Synchronize settings with parent

---

## 🔧 **Implementation Guidelines**

### **Error Handling**
- Always respond to commands (success or failure)
- Include meaningful error messages
- Don't throw errors that break the user experience
- Log failed commands for debugging

### **Timeout Handling**
- Parent should timeout commands after 5 seconds
- Forum should respond within 3 seconds maximum
- Include fallback behaviors for failed commands

### **Security Considerations**
- Validate all command parameters before execution
- Sanitize any user input passed through commands
- Don't expose sensitive operations through commands
- Consider rate limiting for command frequency

---

## 🧪 **Extended Testing Checklist**

### **Community Join Events (Direction 1)**
- [ ] **Community Discovery**: User joins via discovery modal in embed
- [ ] **Direct Links**: User joins via direct community invitation link  
- [ ] **Search Results**: User joins community found via search
- [ ] **Existing Member**: User rejoins a community they previously left
- [ ] **Multiple Joins**: User joins multiple communities in succession
- [ ] **Error Recovery**: Join fails then succeeds - only send on success

### **Command System (Direction 2)**
- [ ] **Open Search**: Parent triggers search modal, receives success response
- [ ] **Command Timeout**: Parent handles timeout when forum doesn't respond
- [ ] **Invalid Command**: Forum responds with error for unknown commands
- [ ] **Rapid Commands**: Multiple commands sent quickly are handled correctly
- [ ] **Forum Not Ready**: Commands sent before forum loads are handled gracefully
- [ ] **Connection Lost**: Commands continue working after iframe reload

---

## 💬 **Questions for Curia Agent**

### **Community Join Events (Direction 1)**
1. **Where in your codebase** do community joins get processed? (We need to add the postMessage there)

2. **What does your community object structure look like?** (We need to match the fields)

3. **Do you have access to the current user context** when processing joins? (We need userId and userRole)

4. **Are there different types of community joins** we should handle differently?

### **Command System (Direction 2)**
5. **How do you currently open your global search modal?** (We need to know the DOM selectors/methods)

6. **Do you have existing modal/dialog management systems** we should integrate with?

7. **What's your post composer structure?** (For focus-composer command implementation)

8. **How do you handle navigation to specific posts?** (For navigate-to-post command)

9. **Do you have any existing postMessage patterns** we should follow for consistency?

10. **Are there other actions you'd like to trigger from the parent embed?** (Future command ideas)

---

## 🔗 **Related Context**

- **File causing performance issues**: `host-service/src/lib/embed/plugin-host/InternalPluginHost.ts:656`
- **Current polling code**: `startCommunityPolling()` method
- **Sidebar update method**: `CommunitySidebar.updateCommunities()`
- **Performance audit**: `host-service/docs/performance-optimization-audit.md`

---

## 🚀 **Implementation Phases**

### **Phase 1: Community Join Events (Critical)**
Implement `curia-community-joined` notifications to eliminate the 25 API calls per embed load causing performance issues.

### **Phase 2: Basic Command System**
Implement `curia-command` and `curia-command-response` protocol with the `open-search` command as the first example.

### **Phase 3: Extended Commands**
Add additional commands like `focus-composer`, `navigate-to-post`, etc. based on embed integration needs.

---

**Once Phase 1 is implemented, we can completely remove the community polling and eliminate the major performance bottleneck. Phase 2 opens up powerful integration possibilities for enhanced user experiences across the embed ecosystem.** 