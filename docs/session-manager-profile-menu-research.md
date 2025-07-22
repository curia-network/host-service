# Session Manager Profile Menu Integration Research

## Project Requirements

**Goal**: Integrate SessionManager with user profile menu to show:
1. All active sessions (freshest per identity type) below current session
2. Visual distinction between active vs available sessions  
3. Click-to-activate functionality for inactive sessions
4. "Add session" row that overlays iframe with new session creation component

## Research Phase 1: Session Manager Analysis ✅

### SessionManager Architecture Study
- Location: `src/lib/SessionManager.ts`
- Key methods to understand:
  - `getAllSessions()` - Get all valid sessions
  - `getActiveSession()` - Get currently active session
  - `setActiveSession(token)` - Switch active session
  - `addSession(sessionData)` - Add new session
  - `subscribe(callback)` - Listen for session changes

### Session Data Structure
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

### Key Insights
- Sessions are managed centrally with cross-tab synchronization
- Multiple sessions per identity type are supported
- "Freshest per identity type" means most recently accessed
- Active session switching updates `activeSessionToken`

### React Hooks Available
- `useSessionManager()` - Full functionality (allSessions, activeSession, switchToSession, etc.)
- `useAccountSwitcher()` - Specialized for multi-account UI (accountOptions, switchToAccount, etc.)
- `useAuth()` - Simple auth state (isAuthenticated, activeToken, etc.)

### Existing UI Components Found
- `AccountSwitcher` (`src/components/session/AccountSwitcher.tsx`) - Beautiful multi-account dropdown
- Uses Radix UI DropdownMenu with perfect styling patterns
- Shows active session with visual distinction (bg-blue-50 border-l-2 border-blue-500)
- AccountAvatar component with identity badges
- "Add Account" functionality placeholder

## Research Phase 2: Current Profile Menu Components ✅

### Existing Components Found
- ✅ `UserProfileComponent` (`src/lib/embed/components/profile/UserProfile.ts`) - Main profile widget in sidebar
- ✅ `AccountSwitcher` (`src/components/session/AccountSwitcher.tsx`) - Multi-account dropdown UI  
- ✅ Community sidebar pattern via `CommunitySidebar` class
- ✅ `EmbedUserWidget` pattern for simple user display

### Current Profile Menu Structure
**Location**: Community sidebar bottom-right user avatar
**Trigger**: Click on user profile avatar
**Menu Items**:
```typescript
// Current actions in user profile menu
<button data-action="settings">⚙️ Settings</button>
<button data-action="switch-account">🔄 Switch Account</button> 
<button data-action="sign-out">🚪 Sign Out</button>
```

### UI Component Patterns Found
- ✅ **Card header style**: `.profile-menu-header` with avatar + info layout  
- ✅ **Visual distinction**: Active sessions use `bg-blue-50 border-l-2 border-blue-500`
- ✅ **Portal pattern**: Menus use `document.body.appendChild()` with positioning
- ✅ **Click handlers**: `menu.addEventListener('click')` with `data-action` attributes

## Research Phase 3: Integration Points ✅

### Where Profile Menu Appears
- ✅ **Community sidebar user section** - Main location in `UserProfileComponent.createUserProfileMenu()`
- ✅ **Embed top bar user widget** - `EmbedUserWidget` (simple logout button)
- ✅ **Main app user menu** - `AccountSwitcher` component (full dropdown)
- ❌ No other profile menus found

### Session Creation Flow Integration
- ✅ **New session creation**: Currently handled via auth flow (`/embed` → authentication steps)
- ✅ **Overlay pattern**: Profile menus use portal pattern with `position: fixed`
- ✅ **Iframe interaction**: Profile menu actions route through `InternalPluginHost.handleMenuAction()`
- ✅ **Authentication flow**: Full embed auth flow available for "Add Account" functionality

### Current Menu Action Handler Flow
```typescript
UserProfileComponent → onMenuAction(action) → 
CommunitySidebar → options.onMenuAction(action) →
InternalPluginHost → handleMenuAction(action)
```

## Implementation Strategy ✅

### Current "Switch Account" Action Flow
The current `switch-account` action in the profile menu triggers `addAccount()` → `resetToInitialState()` which:
1. Clears the current session completely
2. Resets iframe to auth phase
3. Forces full re-authentication

**This is NOT what we want** - we want to preserve existing sessions and show them in the menu.

### Proposed Enhanced Profile Menu
**Location**: Replace `UserProfileComponent.createUserProfileMenu()` in `src/lib/embed/components/profile/UserProfile.ts`

```typescript
// Instead of current simple menu:
<button data-action="switch-account">🔄 Switch Account</button>

// New enhanced menu structure:
<div class="profile-menu-header">
  {/* Current active session display */}
</div>

<div class="profile-menu-sessions">
  {/* List of all sessions with freshest per identity type */}
  {/* Each session row clickable to switch */}
  {/* Visual distinction for active vs available */}
</div>

<div class="profile-menu-actions">
  <button data-action="add-session">➕ Add Another Account</button>
  <button data-action="settings">⚙️ Settings</button>
  <button data-action="sign-out">🚪 Sign Out</button>
</div>
```

### Key Functions Available from SessionManager
- `sessionManager.getAllSessions()` - Get all valid sessions
- `sessionManager.getSessionsByIdentityType(type)` - Filter by ENS/UP/Anonymous
- `sessionManager.setActiveSession(token)` - Switch active session
- `sessionManager.addSession(sessionData)` - Add new session

### Integration Point
The menu action handler in `InternalPluginHost.handleMenuAction()` needs to:
1. Handle `switch-session:${sessionToken}` actions (already implemented!)
2. Handle `add-session` action with overlay/iframe approach

## Questions & Clarifications Needed

### Session Management
1. **Freshest per identity type**: Should we show max 3 sessions (one per type) or all sessions grouped by type?
2. **Session filtering**: Should expired/inactive sessions be hidden or shown differently?
3. **Session switching**: Should switching sessions reload the current iframe or preserve state?

### UI/UX Design
4. **Visual distinction**: What specific visual cues for active vs inactive sessions? (border, opacity, checkmark, etc.)
5. **Card header style**: Which specific card header style should be replicated?
6. **Menu positioning**: Where exactly should these session rows appear in the current menu?

### New Session Creation
7. **Overlay behavior**: Should the overlay completely cover the iframe or be a modal dialog?
8. **Authentication flow**: Should it use the same auth steps as embed or a simplified version?
9. **Session creation**: Should it create a session immediately or go through full auth verification?

### Technical Implementation
10. **State management**: How to coordinate between profile menu, session manager, and iframe switching?
11. **Cross-tab sync**: How to handle session changes from other tabs in the profile menu?
12. **Performance**: How to efficiently track and update session freshness?

---

## 🎯 User Requirements - FINAL ✅

### **Confirmed Design Decisions**
1. **Session Display**: Show **ALL sessions** grouped by identity type, newest first within each type
2. **Visual Design**: Inactive sessions **dimmed**, professional look  
3. **Add Session**: **Modal overlay** (like existing embed auth), **auth-only mode** (no community selection)
4. **Community Context**: **All sessions share** current community context, **preserve iframe state**

## 📋 **Deep Architecture Analysis**

### **Critical Files & Patterns Discovered**

#### **1. Profile Menu Location** (`src/lib/embed/components/profile/UserProfile.ts`)
**Current Pattern:**
```javascript
// Vanilla JS/DOM - NOT React
private createUserProfileMenu(triggerElement: HTMLElement): HTMLElement {
  const menu = document.createElement('div');
  menu.className = 'user-profile-menu';
  // Fixed position portal pattern
  document.body.appendChild(menu);
  // Click handler with data-action pattern
  menu.addEventListener('click', (e) => {
    const action = target.closest('[data-action]')?.getAttribute('data-action');
    if (action && this.options.onMenuAction) {
      this.options.onMenuAction(action);
    }
  });
}
```

#### **2. Modal Overlay Pattern** (PERFECT for Add Session!)
**Existing Pattern**: `/embed` route creates full-screen modal iframe
- Used in `IframeManager.createAuthIframe()` 
- Already supports `mode=auth-only` parameter
- Creates modal that covers entire embed container
- Handles auth completion via PostMessage

#### **3. SessionManager Access** (Key Bridge Issue)
**Challenge**: `UserProfile.ts` is vanilla JS, but needs SessionManager data
**Solution**: Direct access via `sessionManager.getAllSessions()` and `sessionManager.subscribe()`

#### **4. Existing CSS Architecture** (`src/lib/embed/styling/profile-menu.css`)
**Found Classes Ready to Extend:**
- `.profile-menu-accounts` - Section for additional accounts
- `.profile-menu-account` - Individual session row styling  
- `.profile-account-avatar` - Avatar styling
- Already has hover states and transitions

## 🛠️ **Implementation Roadmap**

### **Phase 1: Enhanced Profile Menu** (Core Feature)
**File**: `src/lib/embed/components/profile/UserProfile.ts`

#### **Step 1.1: Add Session Management Infrastructure**
```javascript
private sessionManager = sessionManager; // Import and store reference  
private sessionSubscription: (() => void) | null = null;
private allSessions: SessionData[] = [];
private activeSessionToken: string | null = null;

constructor() {
  this.setupSessionSubscription();
}
```

#### **Step 1.2: Session Data Management**
```javascript
private setupSessionSubscription(): void {
  this.sessionSubscription = this.sessionManager.subscribe((sessions, activeToken) => {
    this.allSessions = sessions;
    this.activeSessionToken = activeToken;
    this.refreshProfileMenu(); // Update menu when sessions change
  });
}

private groupSessionsByType(): Record<string, SessionData[]> {
  return {
    ens: this.allSessions.filter(s => s.identityType === 'ens')
           .sort((a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime()),
    universal_profile: this.allSessions.filter(s => s.identityType === 'universal_profile')
                        .sort((a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime()),
    anonymous: this.allSessions.filter(s => s.identityType === 'anonymous')
                .sort((a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime())
  };
}
```

#### **Step 1.3: Enhanced Menu Creation**
```javascript
private createUserProfileMenu(): HTMLElement {
  const menu = document.createElement('div');
  menu.className = 'user-profile-menu';
  
  // Current active session header (existing pattern)
  menu.appendChild(this.createMenuHeader());
  
  // NEW: All sessions list
  menu.appendChild(this.createSessionsList());
  
  // Actions (modified)
  menu.appendChild(this.createMenuActions());
  
  return menu;
}

private createSessionsList(): HTMLElement {
  const sessionsContainer = document.createElement('div');
  sessionsContainer.className = 'profile-menu-sessions';
  
  const groupedSessions = this.groupSessionsByType();
  
  // Create sections for each identity type that has sessions
  ['ens', 'universal_profile', 'anonymous'].forEach(type => {
    const sessions = groupedSessions[type];
    if (sessions.length > 0) {
      sessionsContainer.appendChild(
        this.createIdentityTypeSection(type, sessions)
      );
    }
  });
  
  return sessionsContainer;
}

private createIdentityTypeSection(type: string, sessions: SessionData[]): HTMLElement {
  const section = document.createElement('div');
  section.className = 'profile-menu-identity-section';
  
  // Section title
  const title = document.createElement('div');
  title.className = 'profile-menu-section-title';
  title.textContent = this.getIdentityTypeLabel(type);
  section.appendChild(title);
  
  // Session rows
  sessions.forEach(session => {
    section.appendChild(this.createSessionRow(session));
  });
  
  return section;
}

private createSessionRow(session: SessionData): HTMLElement {
  const row = document.createElement('button');
  row.className = `profile-menu-account ${session.sessionToken === this.activeSessionToken ? 'active' : 'inactive'}`;
  row.setAttribute('data-action', `switch-session:${session.sessionToken}`);
  
  // Avatar
  const avatar = document.createElement('div'); 
  avatar.className = 'profile-account-avatar';
  // ... avatar content based on session.identityType and session.profileImageUrl
  
  // Session info
  const info = document.createElement('div');
  info.className = 'profile-account-info';
  info.innerHTML = `
    <div class="profile-account-name">${session.name || this.getDisplayName(session)}</div>
    <div class="profile-account-type">${this.getIdentityTypeLabel(session.identityType)}</div>
  `;
  
  row.appendChild(avatar);
  row.appendChild(info);
  
  return row;
}
```

### **Phase 2: Add Session Modal** (New Feature)
**Files**: `src/lib/embed/plugin-host/InternalPluginHost.ts` + new modal component

#### **Step 2.1: Handle Add Session Action**
```javascript
// In InternalPluginHost.handleMenuAction()
private handleMenuAction(action: string): void {
  // ... existing actions
  if (action === 'add-session') {
    this.showAddSessionModal();
  }
}

private showAddSessionModal(): void {
  console.log('[InternalPluginHost] Showing add session modal');
  
  // Create modal overlay
  this.addSessionModal = this.createAddSessionModal();
  document.body.appendChild(this.addSessionModal);
  
  // Show modal
  requestAnimationFrame(() => {
    this.addSessionModal.classList.add('show');
  });
}
```

#### **Step 2.2: Create Auth-Only Modal**
```javascript
private createAddSessionModal(): HTMLElement {
  const modal = document.createElement('div');
  modal.className = 'add-session-modal';
  
  // Full-screen overlay
  modal.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  // Modal content (auth iframe container)
  const modalContent = document.createElement('div');
  modalContent.className = 'add-session-modal-content';
  modalContent.style.cssText = `
    width: 90%;
    max-width: 400px;
    height: 500px;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  `;
  
  // Create auth-only iframe
  const authIframe = this.createAddSessionIframe();
  modalContent.appendChild(authIframe);
  
  modal.appendChild(modalContent);
  return modal;
}

private createAddSessionIframe(): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  
  // Build auth-only URL
  const authUrl = new URL(`${this.iframeManager['hostServiceUrl']}/embed`);
  authUrl.searchParams.set('mode', 'auth-only');
  authUrl.searchParams.set('theme', this.config.theme || 'light');
  if (this.config.backgroundColor) {
    authUrl.searchParams.set('background_color', this.config.backgroundColor);
  }
  
  iframe.src = authUrl.toString();
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
  `;
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
  
  return iframe;
}
```

#### **Step 2.3: Handle Auth Completion**
```javascript
private setupAddSessionMessageListener(): void {
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'curia-auth-complete' && 
        event.data?.mode === 'auth-only' &&
        this.addSessionModal) {
      
      console.log('[InternalPluginHost] Add session completed:', event.data);
      
      // Close modal
      this.hideAddSessionModal();
      
      // Session is automatically added to SessionManager by the auth flow
      // Profile menu will update automatically via subscription
    }
  });
}

private hideAddSessionModal(): void {
  if (this.addSessionModal) {
    this.addSessionModal.classList.remove('show');
    setTimeout(() => {
      if (this.addSessionModal && document.body.contains(this.addSessionModal)) {
        document.body.removeChild(this.addSessionModal);
      }
      this.addSessionModal = null;
    }, 300);
  }
}
```

### **Phase 3: Enhanced CSS Styling**
**File**: `src/lib/embed/styling/profile-menu.css`

#### **Step 3.1: Session List Styles**
```css
.profile-menu-sessions {
  margin: 16px 0 8px 0;
  border-top: 1px solid var(--preview-border);
  padding-top: 16px;
}

.profile-menu-identity-section {
  margin-bottom: 16px;
}

.profile-menu-identity-section:last-child {
  margin-bottom: 0;
}

.profile-menu-account.active {
  background: rgba(59, 130, 246, 0.1);
  border-left: 3px solid #3b82f6;
}

.profile-menu-account.inactive {
  opacity: 0.6;
  filter: grayscale(0.3);
}

.profile-menu-account.inactive:hover {
  opacity: 1;
  filter: none;
  background: var(--item-hover-bg);
}
```

#### **Step 3.2: Modal Styles**
```css
.add-session-modal {
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-session-modal.show {
  opacity: 1;
  transform: scale(1);
}

.add-session-modal-content {
  transform: translateY(20px);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-session-modal.show .add-session-modal-content {
  transform: translateY(0);
}
```

### **Phase 4: Error Handling & Edge Cases**

#### **Step 4.1: Session Switch Error Handling**
- Handle failed session switches gracefully
- Show loading states during switching
- Fallback to previous session on error

#### **Step 4.2: Cross-Tab Coordination**  
- Handle sessions added/removed in other tabs
- Update menu in real-time via subscription
- Prevent duplicate modal instances

#### **Step 4.3: Menu Size Management**
- Handle many sessions with scrollable area
- Responsive behavior for different screen sizes
- Proper positioning with overflow handling

---

## 🎯 **Implementation Issues & Solutions**

### **Issue 1: SessionManager Bridge in Vanilla JS**
**Problem**: `UserProfile.ts` is vanilla JS but needs ReactiveSessionManager  
**Solution**: Direct import and subscription: `import { sessionManager } from '../../SessionManager'`

### **Issue 2: Real-time Menu Updates**  
**Problem**: Menu needs to update when sessions change in other tabs  
**Solution**: Subscribe to SessionManager and recreate menu sections dynamically

### **Issue 3: Modal Z-Index Conflicts**
**Problem**: Modal needs to appear above iframe content and sidebar  
**Solution**: Use `z-index: 999999` and portal to `document.body`

### **Issue 4: Session Row Click Handling**
**Problem**: Need to handle clicks on session rows for switching  
**Solution**: Use existing `data-action="switch-session:${token}"` pattern

### **Issue 5: Menu Size with Many Sessions**
**Problem**: Menu might become too large with many sessions  
**Solution**: Fixed height container with scrollable session list area

---

## Research Progress ✅
- [x] Initial requirements analysis  
- [x] SessionManager deep dive
- [x] Profile menu component discovery
- [x] UI patterns analysis
- [x] Integration point mapping
- [x] Current implementation analysis
- [x] Modal overlay pattern analysis
- [x] Implementation issue identification
- [x] Complete step-by-step roadmap
- [x] Ready for implementation! 🚀 