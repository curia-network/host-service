# Add New Session Modal - Technical Research & Implementation Plan

## 🎯 **Executive Summary**

**Goal**: Implement an "Add Session" button that opens a modal allowing users to authenticate with additional account types (ENS, Universal Profile, Anonymous) using the same modal pattern as the community discovery feature.

**Key Insight**: We can reuse the exact same modal infrastructure and embed mode system we just built for community discovery, but with a new `add-session` mode in the embed app.

---

## 🏗️ **Current Session Manager Architecture**

### **SessionManager Capabilities** 
✅ **Multi-Account Support**: ENS, Universal Profile, Anonymous sessions  
✅ **Session Storage**: Centralized localStorage with database sync  
✅ **Cross-Tab Sync**: Real-time updates across browser tabs  
✅ **Reactive Hooks**: `useSessionManager()`, `useAuth()`, `useAccountSwitcher()`  
✅ **Session Switching**: Instant switching between active sessions  

### **Identity Types Supported**
```typescript
interface SessionData {
  sessionToken: string;
  userId: string;
  identityType: 'ens' | 'universal_profile' | 'anonymous';
  walletAddress?: string;
  ensName?: string;
  upAddress?: string;
  name?: string;
  profileImageUrl?: string;
  expiresAt: Date;
  lastAccessedAt: Date;
  isActive: boolean;
}
```

### **Authentication Endpoints**
- **`/api/auth/create-anonymous`** - Create anonymous session (7-day expiry)
- **`/api/auth/verify-signature`** - Create ENS/UP session after wallet signing (30-day expiry)
- **`/api/auth/validate-session`** - Validate existing sessions with token rotation

---

## 🎨 **Proposed Implementation Strategy**

### **Modal Pattern Replication**
**Reference**: Community discovery modal (`openDiscoveryModal()` in `InternalPluginHost`)

We can use the **exact same modal system**:
```typescript
// Same modal infrastructure, different iframe mode
this.addSessionIframe.src = `${window.location.origin}/embed?mode=add-session`;

// Same message handling, different message type
if (event.data.type === 'curia-add-session-complete') {
  await this.handleAddSessionComplete(event.data);
}
```

### **Embed Mode Extension**
**Current**: `community-discovery` mode for community selection  
**New**: `add-session` mode for authentication

```typescript
// src/types/embed.ts
export type EmbedMode = 
  | 'full' 
  | 'auth-only' 
  | 'secure-auth' 
  | 'community-discovery'
  | 'add-session';  // ← NEW MODE

// src/app/embed/page.tsx
if (mode === 'add-session') {
  return <AddSessionFlow onComplete={sendAddSessionMessage} />;
}
```

### **Message Flow Design**
```typescript
// New message type for session completion
interface AddSessionCompleteMessage {
  type: 'curia-add-session-complete';
  sessionData: {
    sessionToken: string;
    userId: string;
    identityType: 'ens' | 'universal_profile' | 'anonymous';
    walletAddress?: string;
    ensName?: string;
    upAddress?: string;
    name?: string;
    profileImageUrl?: string;
    expiresAt: string;
  };
  timestamp: string;
}
```

---

## 🔍 **UI Integration Deep Dive**

### **Current Profile Menu Architecture** 
**Location**: `src/lib/embed/components/profile/UserProfile.ts`  
**Pattern**: Vanilla JS/DOM (not React) - creates menu using `document.createElement`  
**Portal Pattern**: Uses `document.body.appendChild()` with fixed positioning  

### **Current Menu Structure**
```html
<div class="profile-menu-header">
  <!-- Avatar + current user info -->
  <div class="profile-menu-avatar">...</div>
  <div class="profile-menu-info">
    <h4>Current User Name</h4>
    <p>Identity Type (ENS/UP/Anonymous)</p>
  </div>
</div>

<div class="profile-menu-actions">
  <button data-action="settings">⚙️ Settings</button>
  <button data-action="switch-account">🔄 Switch Account</button>  <!-- PROBLEM -->
  <button data-action="sign-out">🚪 Sign Out</button>
</div>
```

**🚨 Current Issue**: "Switch Account" calls `resetToInitialState()` which clears all sessions instead of preserving them.

### **Enhanced Menu Structure** (Proposed)
```html
<div class="profile-menu-header">
  <!-- Current active session (enhanced) -->
  <div class="profile-menu-avatar">...</div>
  <div class="profile-menu-info">
    <h4>Current User Name</h4>
    <p>Identity Type • Active</p>
  </div>
</div>

<div class="profile-menu-sessions">
  <!-- Available sessions (inactive) -->
  <div class="profile-menu-session" data-action="switch-session" data-token="token1">
    <div class="profile-session-avatar">...</div>
    <div class="profile-session-info">
      <div class="profile-session-name">Other User</div>
      <div class="profile-session-type">ENS</div>
    </div>
  </div>
  <!-- More sessions... -->
</div>

<div class="profile-menu-actions">
  <button data-action="add-session">➕ Add Another Account</button>  <!-- NEW -->
  <button data-action="settings">⚙️ Settings</button>
  <button data-action="sign-out">🚪 Sign Out</button>
</div>
```

### **SessionManager Integration Challenge**
**Issue**: `UserProfile.ts` is vanilla JS, but needs SessionManager data  
**Solution**: Direct access via `sessionManager.getAllSessions()` and reactive updates via `sessionManager.subscribe()`

### **Action Flow Enhancement**
```typescript
// Current
UserProfileComponent → onMenuAction(action) → CommunitySidebar → InternalPluginHost

// Enhanced (same flow, new actions)
data-action="add-session" → InternalPluginHost.handleMenuAction('add-session') → this.openAddSessionModal()
data-action="switch-session" + data-token → InternalPluginHost.handleMenuAction('switch-session:token') → sessionManager.setActiveSession(token)
```

---

## 🔧 **Technical Implementation Plan**

### **Phase 1: Add Session Mode in Embed App**

#### **Step 1.1: Add EmbedMode Type**
```typescript
// src/types/embed.ts
export type EmbedMode = 
  | 'full' 
  | 'auth-only' 
  | 'secure-auth' 
  | 'community-discovery'
  | 'add-session';
```

#### **Step 1.2: Create AddSessionFlow Component**
```typescript
// src/components/embed/AddSessionFlow.tsx
interface AddSessionFlowProps {
  onComplete: (sessionData: any) => void;
}

export const AddSessionFlow: React.FC<AddSessionFlowProps> = ({ onComplete }) => {
  // Show authentication options: ENS, UP, Anonymous
  // Reuse existing AuthenticationStep component
  // On auth completion, call onComplete with session data
};
```

#### **Step 1.3: Integrate into Embed Page**
```typescript
// src/app/embed/page.tsx
if (mode === 'add-session') {
  const sendAddSessionMessage = (sessionData: any) => {
    const message = {
      type: 'curia-add-session-complete',
      sessionData,
      timestamp: new Date().toISOString()
    };
    window.parent.postMessage(message, '*');
  };
  
  return <AddSessionFlow onComplete={sendAddSessionMessage} />;
}
```

### **Phase 2: Enhanced Profile Menu**

#### **Step 2.1: Add Session Management Infrastructure to UserProfile**
```typescript
// src/lib/embed/components/profile/UserProfile.ts
import { sessionManager } from '../../../SessionManager';

export class UserProfileComponent {
  private sessionManager = sessionManager;
  private sessionSubscription: (() => void) | null = null;
  private allSessions: SessionData[] = [];
  
  constructor(options: UserProfileOptions) {
    // ... existing code
    
    // Subscribe to session changes
    this.sessionSubscription = this.sessionManager.subscribe((sessions, activeToken, activeSession) => {
      this.allSessions = sessions;
      this.refreshMenu(); // Re-render menu when sessions change
    });
    
    // Initial load
    this.allSessions = this.sessionManager.getAllSessions();
  }
  
  private refreshMenu(): void {
    if (this.profileMenuElement) {
      // Close and recreate menu with updated session data
      this.hideMenu();
    }
  }
}
```

#### **Step 2.2: Enhanced Menu Creation**
```typescript
private createUserProfileMenu(triggerElement: HTMLElement): HTMLElement {
  const menu = document.createElement('div');
  menu.className = 'user-profile-menu';
  
  // Position menu
  this.positionMenu(menu, triggerElement);
  
  // Active session header (current)
  const headerHtml = this.createActiveSessionHeader();
  
  // Available sessions list (new)
  const sessionsHtml = this.createAvailableSessions();
  
  // Actions (enhanced)
  const actionsHtml = this.createMenuActions();
  
  menu.innerHTML = headerHtml + sessionsHtml + actionsHtml;
  
  // Enhanced click handlers
  this.attachMenuHandlers(menu);
  
  return menu;
}

private createAvailableSessions(): string {
  const inactiveSessions = this.allSessions.filter(session => 
    session.sessionToken !== this.sessionManager.getActiveToken()
  );
  
  if (inactiveSessions.length === 0) {
    return ''; // No available sessions section
  }
  
  const sessionsHtml = inactiveSessions.map(session => `
    <div class="profile-menu-session" data-action="switch-session" data-token="${session.sessionToken}">
      <div class="profile-session-avatar" style="background: ${this.getSessionGradient(session)}">
        ${session.profileImageUrl ? 
          `<img src="${session.profileImageUrl}" alt="${session.name}" />` :
          `<span>${this.getUserInitials(session.name || 'User')}</span>`
        }
      </div>
      <div class="profile-session-info">
        <div class="profile-session-name">${session.name || 'Unknown User'}</div>
        <div class="profile-session-type">${this.getIdentityLabel(session.identityType)}</div>
      </div>
    </div>
  `).join('');
  
  return `
    <div class="profile-menu-sessions">
      <div class="profile-menu-section-label">Available Accounts</div>
      ${sessionsHtml}
    </div>
  `;
}

private createMenuActions(): string {
  return `
    <div class="profile-menu-actions">
      <button class="profile-menu-action" data-action="add-session">
        <div class="profile-menu-action-icon">➕</div>
        <span>Add Another Account</span>
      </button>
      <button class="profile-menu-action" data-action="settings">
        <div class="profile-menu-action-icon">⚙️</div>
        <span>Settings</span>
      </button>
      <button class="profile-menu-action" data-action="sign-out">
        <div class="profile-menu-action-icon">🚪</div>
        <span>Sign Out</span>
      </button>
    </div>
  `;
}
```

#### **Step 2.3: Enhanced Action Handlers**
```typescript
private attachMenuHandlers(menu: HTMLElement): void {
  menu.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const actionElement = target.closest('[data-action]') as HTMLElement;
    
    if (!actionElement) return;
    
    const action = actionElement.getAttribute('data-action');
    const token = actionElement.getAttribute('data-token');
    
    if (action === 'switch-session' && token) {
      // Handle session switching directly
      this.handleSessionSwitch(token);
    } else if (action && this.options.onMenuAction) {
      // Handle other actions through parent
      this.options.onMenuAction(action);
    }
  });
}

private async handleSessionSwitch(sessionToken: string): Promise<void> {
  try {
    console.log('[UserProfileComponent] Switching to session:', sessionToken);
    await this.sessionManager.setActiveSession(sessionToken);
    
    // Close menu after switching
    this.hideMenu();
    
    // Menu will refresh automatically via subscription
  } catch (error) {
    console.error('[UserProfileComponent] Failed to switch session:', error);
  }
}
```

### **Phase 3: Message Routing Infrastructure**

#### **Step 3.1: Add Session Callback to MessageRouter**
```typescript
// src/lib/embed/services/messaging/MessageRouter.ts
export interface MessageRouterCallbacks {
  // ... existing callbacks
  onAddSessionComplete?: (sessionData: any) => Promise<void>;
}

// Add message handling
if (event.data.type === 'curia-add-session-complete') {
  if (this.callbacks.onAddSessionComplete) {
    await this.callbacks.onAddSessionComplete(event.data);
  }
  return;
}
```

#### **Step 3.2: Add Session Handler in InternalPluginHost**
```typescript
// src/lib/embed/plugin-host/InternalPluginHost.ts

// Add to MessageRouter initialization
this.messageRouter = new MessageRouter(
  this.iframeManager.getUid(),
  this.apiProxy,
  {
    // ... existing callbacks
    onAddSessionComplete: this.handleAddSessionComplete.bind(this)
  }
);

private async handleAddSessionComplete(sessionData: any): Promise<void> {
  console.log('[InternalPluginHost] Add session completed:', sessionData);
  
  try {
    // 1. Close add session modal
    this.closeAddSessionModal();
    
    // 2. Add new session to SessionManager
    await sessionManager.addSession({
      sessionToken: sessionData.sessionToken,
      userId: sessionData.userId,
      identityType: sessionData.identityType,
      walletAddress: sessionData.walletAddress,
      ensName: sessionData.ensName,
      upAddress: sessionData.upAddress,
      name: sessionData.name,
      profileImageUrl: sessionData.profileImageUrl,
      expiresAt: new Date(sessionData.expiresAt),
      isActive: true,
    });
    
    // 3. Switch to new session (user probably wants to use the new account)
    await sessionManager.setActiveSession(sessionData.sessionToken);
    
    console.log('[InternalPluginHost] New session added and activated');
  } catch (error) {
    console.error('[InternalPluginHost] Failed to add new session:', error);
  }
}
```

### **Phase 4: Add Session Modal Implementation**

#### **Step 4.1: Modal Methods in InternalPluginHost**
```typescript
// Add session modal state
private addSessionModal: HTMLElement | null = null;
private addSessionIframe: HTMLIFrameElement | null = null;

private openAddSessionModal(): void {
  console.log('[InternalPluginHost] Opening add session modal');
  
  // Close existing modal if open
  this.closeAddSessionModal();
  
  // Create modal overlay (same as discovery modal)
  this.addSessionModal = document.createElement('div');
  this.addSessionModal.className = 'curia-add-session-modal-overlay';
  this.addSessionModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
  `;
  
  // Create modal content container
  const modalContent = document.createElement('div');
  modalContent.className = 'curia-add-session-modal-content';
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    height: 80%;
    max-height: 700px;
    position: relative;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    overflow: hidden;
  `;
  
  // Create close button (same as discovery modal)
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.cssText = `
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(0, 0, 0, 0.1);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    font-size: 20px;
    cursor: pointer;
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
  `;
  
  closeButton.addEventListener('click', () => {
    this.closeAddSessionModal();
  });
  
  // Create add session iframe
  this.addSessionIframe = document.createElement('iframe');
  this.addSessionIframe.src = `${window.location.origin}/embed?mode=add-session`;
  this.addSessionIframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 12px;
  `;
  this.addSessionIframe.allow = getIframePermissions();
  
  // Assemble modal
  modalContent.appendChild(closeButton);
  modalContent.appendChild(this.addSessionIframe);
  this.addSessionModal.appendChild(modalContent);
  
  // Close modal on overlay click
  this.addSessionModal.addEventListener('click', (e) => {
    if (e.target === this.addSessionModal) {
      this.closeAddSessionModal();
    }
  });
  
  // Add to DOM
  document.body.appendChild(this.addSessionModal);
  
  console.log('[InternalPluginHost] Add session modal opened successfully');
}

private closeAddSessionModal(): void {
  if (this.addSessionModal) {
    console.log('[InternalPluginHost] Closing add session modal');
    document.body.removeChild(this.addSessionModal);
    this.addSessionModal = null;
    this.addSessionIframe = null;
  }
}
```

#### **Step 4.2: Enhanced Menu Action Handler**
```typescript
// src/lib/embed/plugin-host/InternalPluginHost.ts
private handleMenuAction(action: string): void {
  console.log('[InternalPluginHost] Menu action:', action);
  
  switch (action) {
    case 'add-session':
      this.openAddSessionModal();
      break;
      
    case 'settings':
      console.log('[InternalPluginHost] Settings not implemented yet');
      break;
      
    case 'switch-account':
      // DEPRECATED: Remove this - now handled directly in UserProfile
      console.log('[InternalPluginHost] Switch account deprecated - use session switching');
      break;
      
    case 'sign-out':
      this.addAccount(); // Existing logout functionality
      break;
      
    default:
      console.log('[InternalPluginHost] Unknown menu action:', action);
  }
}
```

---

## 🎯 **Key Advantages of This Approach**

### **Code Reuse** 
✅ **Same modal infrastructure** as community discovery  
✅ **Same message routing** pattern  
✅ **Same embed mode** system  
✅ **Existing auth components** (AuthenticationStep, EthereumProfileDisplay, UPProfileDisplay)  

### **Consistency** 
✅ **Modal UX** matches community discovery  
✅ **Message handling** follows established patterns  
✅ **Authentication flows** reuse existing implementations  

### **Reliability**
✅ **Tested modal system** (just implemented for discovery)  
✅ **Proven auth flows** (used throughout the app)  
✅ **Centralized session management** (SessionManager handles everything)  

---

## 🚀 **Refined Implementation Phases**

### **Phase 1: Enhanced Profile Menu** ⏱️ 45 minutes
- Add SessionManager integration to UserProfileComponent
- Create available sessions display
- Add session switching handlers
- Update menu actions (remove old switch-account, add add-session)

### **Phase 2: Add Session Mode** ⏱️ 30 minutes
- Add `add-session` to EmbedMode type
- Create AddSessionFlow component (reuse AuthenticationStep)
- Add mode handling to embed page

### **Phase 3: Message Routing** ⏱️ 20 minutes  
- Add onAddSessionComplete callback to MessageRouter
- Add handleAddSessionComplete method to InternalPluginHost
- Wire callback in MessageRouter initialization

### **Phase 4: Modal System** ⏱️ 15 minutes
- Copy discovery modal methods and rename for add-session
- Add modal state properties
- Wire add-session action to openAddSessionModal()

### **Phase 5: Polish & Testing** ⏱️ 30 minutes
- Add error handling
- Test all identity types (ENS, UP, Anonymous)
- Test session switching between multiple accounts
- Test modal dismissal and edge cases

**Total Estimated Time**: ~2.5 hours

---

## 🧪 **Testing Strategy**

### **Manual Testing Flow**
1. **Start with existing session** (anonymous/ENS/UP)
2. **Click profile avatar** → Profile menu opens
3. **Verify current session** shows as active in header
4. **Click "Add Another Account"** → Modal opens
5. **Test each identity type**:
   - Anonymous: Should create new anonymous session
   - ENS: Should connect wallet and create ENS session  
   - UP: Should connect wallet and create UP session
6. **Verify session addition** - New session appears in "Available Accounts"
7. **Test session switching** - Click inactive session to switch
8. **Test active session changes** - Profile menu header updates
9. **Test cross-tab sync** - Sessions sync across browser tabs

### **Expected Console Output**
```bash
[InternalPluginHost] Menu action: add-session
[InternalPluginHost] Opening add session modal
[Embed] Add session mode - showing authentication options
[Embed] Authentication completed - sending add session message
[InternalPluginHost] Add session completed: {identityType: "ens", ...}
[InternalPluginHost] Closing add session modal  
[SessionManager] Session added: ens user-123
[SessionManager] Active session changed: ens user-123
[UserProfileComponent] Session change detected - refreshing menu
[InternalPluginHost] New session added and activated
```

---

## 📋 **Integration Points Summary**

### **Files to Modify**
1. `src/types/embed.ts` - Add add-session mode
2. `src/app/embed/page.tsx` - Add mode handling
3. `src/components/embed/AddSessionFlow.tsx` - New component (reuse existing auth)
4. `src/lib/embed/services/messaging/MessageRouter.ts` - Add message callback
5. `src/lib/embed/plugin-host/InternalPluginHost.ts` - Add modal methods + handler + enhanced menu actions
6. `src/lib/embed/components/profile/UserProfile.ts` - **MAJOR**: Enhanced menu with session management

### **Message Types**
- `curia-add-session-complete` - New message for session completion

### **Modal Infrastructure**  
- Reuse exact same pattern as community discovery modal
- Same overlay, close button, iframe setup
- Same backdrop click and X button dismissal

### **CSS Enhancement**
- Existing CSS already supports `.profile-menu-sessions` and `.profile-menu-session`
- May need minor additions for session avatars and states

This approach provides a **consistent, reliable, and fast-to-implement** solution that leverages all our existing infrastructure while delivering a beautiful multi-account experience! 🚀 