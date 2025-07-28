# Curia Session Management Architecture Research

## 🎯 **Executive Summary**

**Current Problem**: Session token management is scattered across **18+ files** with multiple uncoordinated localStorage patterns, leading to inconsistent state management, missed token rotations, and poor user experience.

**Solution**: Design a centralized **SessionManager** system that handles all authentication state with database-backed sessions, multi-account support, and bulletproof cross-tab synchronization.

---

## 📊 **Current localStorage Usage Audit**

### **Complete Pattern Analysis**

```typescript
// Session Authentication (Primary Issue)
localStorage.getItem('curia_session_token')     // 8 files
localStorage.setItem('curia_session_token', token)  // 8 files  
localStorage.removeItem('curia_session_token')  // 6 files

// Universal Profile Context (Secondary Issue)
localStorage.getItem('upAddress')               // 0 files (just context)
localStorage.setItem('upAddress', address)     // 2 files
localStorage.removeItem('upAddress')           // 1 file

// Theme Management (Separate Concern)
localStorage.getItem('curia-theme')            // 1 file
localStorage.setItem('curia-theme', theme)     // 1 file
localStorage.setItem('curia-resolved-theme', resolved) // 1 file

// Debug/Development
localStorage.setItem('curia_debug', 'true')    // 2 files (docs)

// Wagmi Wallet Storage (External Library)
storage: window.localStorage                   // 1 file
```

### **Critical Files with Session Token Usage**

#### **Authentication Flow Components**
1. **`src/hooks/useAuth.ts`** - Primary auth hook with hacky localStorage patching
2. **`src/hooks/useCommunities.ts`** - Community fetching with token fallback
3. **`src/components/embed/SessionCheckStep.tsx`** - Session validation + token rotation
4. **`src/components/embed/AuthenticationStep.tsx`** - New session creation
5. **`src/components/embed/SignatureVerificationStep.tsx`** - Token storage after signature
6. **`src/components/embed/CommunitySelectionStep.tsx`** - Token fallback logic
7. **`src/components/embed/EmbedUserWidget.tsx`** - Logout functionality
8. **`src/app/embed/page.tsx`** - Main embed orchestration

#### **Profile Authentication Components**  
9. **`src/components/ethereum/EthereumProfileDisplay.tsx`** - ENS auth completion
10. **`src/components/universal-profile/UPProfileDisplay.tsx`** - UP auth completion
11. **`src/components/configurator/CreateCommunityModal.tsx`** - Authenticated operations

#### **Core Infrastructure**
12. **`src/lib/embed/plugin-host/InternalPluginHost.ts`** - Logout + iframe management
13. **`src/app/get-started/client.tsx`** - Demo page auth handling

#### **Universal Profile Context (Separate Issue)**
14. **`src/contexts/UniversalProfileContext.tsx`** - UP address persistence

---

## 🏗️ **Database Schema Analysis**

### **Existing `authentication_sessions` Table**
```sql
CREATE TABLE "authentication_sessions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" text NOT NULL REFERENCES users(user_id),
    "session_token" text UNIQUE NOT NULL,
    "identity_type" varchar(20) NOT NULL CHECK (identity_type IN ('ens', 'universal_profile', 'anonymous')),
    "wallet_address" text,
    "signed_message" text NOT NULL,
    "signature" text NOT NULL,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "expires_at" timestamptz NOT NULL,
    "last_accessed_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "is_active" boolean DEFAULT true
);
```

**Perfect for multi-session support!** Contains:
- ✅ **Multiple sessions per user** - No unique constraints on user_id
- ✅ **30-day expiration** - Built-in session lifecycle
- ✅ **Identity type tracking** - ENS, UP, anonymous support
- ✅ **Wallet address mapping** - For session context
- ✅ **Activity tracking** - last_accessed_at for usage patterns
- ✅ **Active/inactive states** - Soft session termination

---

## 🎨 **Proposed SessionManager Architecture**

### **Core Design Principles**

1. **Database-First**: Sessions live in PostgreSQL, localStorage is just a cache
2. **Multi-Account Native**: Support switching between ENS, UP, anonymous identities  
3. **Zero Conflicts**: Single source of truth eliminates localStorage chaos
4. **Reactive Updates**: Real-time UI updates when sessions change
5. **Cross-Tab Sync**: Perfect synchronization across browser tabs
6. **Bulletproof Offline**: Graceful degradation when database unavailable

### **SessionManager API Design**

```typescript
// ============================================================================
// CORE SESSION MANAGER CLASS
// ============================================================================

interface SessionData {
  sessionToken: string;
  userId: string;
  identityType: 'ens' | 'universal_profile' | 'anonymous';
  walletAddress?: string;
  ensName?: string;
  upAddress?: string;
  expiresAt: Date;
  isActive: boolean;
}

interface SessionStorage {
  activeSessions: SessionData[];
  activeSessionToken: string | null;
  lastSyncedAt: number;
}

class SessionManager {
  private static instance: SessionManager;
  private static readonly STORAGE_KEY = 'curia_sessions';
  private storage: SessionStorage;
  private listeners: Set<(sessions: SessionData[], activeToken: string | null) => void>;
  
  // ===== CORE OPERATIONS =====
  
  async addSession(sessionData: SessionData): Promise<void>
  async removeSession(sessionToken: string): Promise<void>  
  async setActiveSession(sessionToken: string): Promise<void>
  async removeActiveSession(): Promise<void>
  
  // ===== GETTERS =====
  
  getActiveSession(): SessionData | null
  getActiveToken(): string | null
  getAllSessions(): SessionData[]
  getSessionByToken(token: string): SessionData | null
  getSessionsByIdentityType(type: 'ens' | 'universal_profile' | 'anonymous'): SessionData[]
  
  // ===== REACTIVITY =====
  
  subscribe(callback: SessionChangeListener): () => void
  notifyListeners(): void
  
  // ===== PERSISTENCE =====
  
  private saveToStorage(): void
  private loadFromStorage(): SessionStorage
  private syncWithDatabase(): Promise<void>
  
  // ===== CROSS-TAB SYNC =====
  
  private setupStorageListener(): void
  private broadcastChange(): void
}

// ============================================================================
// REACT HOOKS
// ============================================================================

interface UseSessionManagerReturn {
  // Current State
  activeSession: SessionData | null;
  activeToken: string | null;
  allSessions: SessionData[];
  isAuthenticated: boolean;
  
  // Actions
  addSession: (session: SessionData) => Promise<void>;
  switchToSession: (token: string) => Promise<void>;
  removeSession: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Convenience Getters
  ensAccount: SessionData | null;
  upAccount: SessionData | null;
  anonymousAccount: SessionData | null;
}

function useSessionManager(): UseSessionManagerReturn;
function useAuth(): Pick<UseSessionManagerReturn, 'isAuthenticated' | 'activeToken' | 'activeSession'>;
```

### **Multi-Account User Experience**

```typescript
// ============================================================================
// BEAUTIFUL ACCOUNT SWITCHING UI
// ============================================================================

const AccountSwitcher = () => {
  const { allSessions, activeSession, switchToSession, removeSession } = useSessionManager();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar session={activeSession} />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent>
        {allSessions.map(session => (
          <DropdownMenuItem 
            key={session.sessionToken}
            onClick={() => switchToSession(session.sessionToken)}
            className={session.sessionToken === activeSession?.sessionToken ? 'bg-blue-50' : ''}
          >
            <div className="flex items-center gap-3">
              <IdentityIcon type={session.identityType} />
              <div>
                <div className="font-medium">{getDisplayName(session)}</div>
                <div className="text-sm text-gray-500">{getIdentityLabel(session)}</div>
              </div>
              {session.sessionToken === activeSession?.sessionToken && (
                <Badge variant="secondary">Active</Badge>
              )}
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => initiateNewAuthentication()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

---

## 🔄 **Migration Strategy**

### **Phase 1: Create SessionManager Infrastructure**

1. **Create `src/lib/SessionManager.ts`** - Core session management class
2. **Create `src/hooks/useSessionManager.ts`** - React hooks with reactivity
3. **Add database sync methods** - Background sync with authentication_sessions table
4. **Add cross-tab synchronization** - localStorage events + custom event system

### **Phase 2: Replace Core Authentication Components**

**Priority Order (High Risk → Low Risk):**

1. **`useAuth.ts`** - Replace the hacky localStorage patching with clean SessionManager
2. **`SessionCheckStep.tsx`** - Database-first session validation with localStorage fallback
3. **`AuthenticationStep.tsx`** - Store new sessions via SessionManager.addSession()
4. **`SignatureVerificationStep.tsx`** - Replace direct localStorage with SessionManager
5. **`EmbedUserWidget.tsx`** - Use SessionManager.removeActiveSession() for logout

### **Phase 3: Update Profile Authentication**

6. **`EthereumProfileDisplay.tsx`** - Use SessionManager.addSession() after ENS verification
7. **`UPProfileDisplay.tsx`** - Use SessionManager.addSession() after UP verification  
8. **`CommunitySelectionStep.tsx`** - Remove localStorage fallback, use SessionManager.getActiveToken()

### **Phase 4: Infrastructure Integration**

9. **`InternalPluginHost.ts`** - Use SessionManager for logout + session management
10. **`CreateCommunityModal.tsx`** - Use SessionManager.getActiveToken() for authenticated calls
11. **`useCommunities.ts`** - Remove direct localStorage access
12. **`embed/page.tsx`** - Remove localStorage calls, use SessionManager state
13. **`get-started/client.tsx`** - Replace auth handling with SessionManager

### **Phase 5: Clean Up Universal Profile Context**

14. **`UniversalProfileContext.tsx`** - Remove upAddress localStorage entirely
    - **Migration**: Move existing upAddress to active session if exists
    - **New Approach**: UP address comes from active session data
    - **Context Role**: Pure wallet connection state, no persistence

---

## 🛠️ **Implementation Details**

### **localStorage Management Strategy**

```typescript
// ============================================================================
// CENTRALIZED STORAGE SCHEMA
// ============================================================================

interface SessionStorage {
  activeSessions: SessionData[];      // All active sessions across identities
  activeSessionToken: string | null;  // Currently selected session
  lastSyncedAt: number;               // Last database sync timestamp
}

// Single localStorage key replaces all session-related keys:
// ❌ OLD: 'curia_session_token', 'upAddress', scattered tokens
// ✅ NEW: 'curia_sessions' (complete session state)

private static readonly STORAGE_KEY = 'curia_sessions';
private static readonly SYNC_INTERVAL = 30_000; // 30 seconds

// ============================================================================
// ERROR RECOVERY & VALIDATION
// ============================================================================

private validateSession(session: SessionData): boolean {
  return (
    session.sessionToken?.length > 10 &&
    session.userId?.length > 0 &&
    ['ens', 'universal_profile', 'anonymous'].includes(session.identityType) &&
    session.expiresAt > new Date()
  );
}

private sanitizeStorage(storage: SessionStorage): SessionStorage {
  const validSessions = storage.activeSessions.filter(this.validateSession);
  const activeStillValid = validSessions.some(s => s.sessionToken === storage.activeSessionToken);
  
  return {
    activeSessions: validSessions,
    activeSessionToken: activeStillValid ? storage.activeSessionToken : (validSessions[0]?.sessionToken || null),
    lastSyncedAt: storage.lastSyncedAt || Date.now()
  };
}
```

### **Database Synchronization**

```typescript
// ============================================================================
// HYBRID OFFLINE/ONLINE STRATEGY
// ============================================================================

async syncWithDatabase(): Promise<void> {
  try {
    // 1. Fetch latest sessions from database
    const response = await fetch('/api/auth/sessions', {
      headers: { 'Authorization': `Bearer ${this.getActiveToken()}` }
    });
    
    if (!response.ok) {
      console.warn('[SessionManager] Database sync failed, using localStorage cache');
      return;
    }
    
    const dbSessions: SessionData[] = await response.json();
    
    // 2. Merge with localStorage cache (localStorage wins for active session)
    const mergedSessions = this.mergeSessionStates(this.storage.activeSessions, dbSessions);
    
    // 3. Update storage with merged state
    this.storage.activeSessions = mergedSessions;
    this.storage.lastSyncedAt = Date.now();
    this.saveToStorage();
    this.notifyListeners();
    
  } catch (error) {
    console.error('[SessionManager] Database sync error:', error);
    // Graceful degradation - continue with localStorage cache
  }
}

private mergeSessionStates(localSessions: SessionData[], dbSessions: SessionData[]): SessionData[] {
  const sessionMap = new Map<string, SessionData>();
  
  // Start with database sessions (source of truth for metadata)
  for (const session of dbSessions) {
    sessionMap.set(session.sessionToken, session);
  }
  
  // Override with localStorage cache for active session
  for (const session of localSessions) {
    if (session.sessionToken === this.storage.activeSessionToken) {
      sessionMap.set(session.sessionToken, session); // localStorage wins for active
    }
  }
  
  return Array.from(sessionMap.values());
}
```

### **Cross-Tab Synchronization**

```typescript
// ============================================================================
// PERFECT CROSS-TAB SYNC
// ============================================================================

private setupStorageListener(): void {
  if (typeof window === 'undefined') return;
  
  // Listen for localStorage changes from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key === SessionManager.STORAGE_KEY && e.newValue) {
      try {
        const newStorage: SessionStorage = JSON.parse(e.newValue);
        this.storage = this.sanitizeStorage(newStorage);
        this.notifyListeners();
        console.log('[SessionManager] Cross-tab sync: Session state updated');
      } catch (error) {
        console.error('[SessionManager] Cross-tab sync failed:', error);
      }
    }
  });
  
  // Listen for custom session events (same-tab updates)
  window.addEventListener('curia-session-change', () => {
    this.loadFromStorage();
    this.notifyListeners();
  });
}

private broadcastChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('curia-session-change'));
  }
}

async setActiveSession(sessionToken: string): Promise<void> {
  const session = this.getSessionByToken(sessionToken);
  if (!session) {
    throw new Error(`Session not found: ${sessionToken}`);
  }
  
  this.storage.activeSessionToken = sessionToken;
  this.saveToStorage();
  this.broadcastChange(); // 🔥 Instant cross-tab sync
  this.notifyListeners();
  
  console.log('[SessionManager] Active session changed:', session.identityType);
}
```

---

## 🧪 **Testing Strategy**

### **Test Coverage Areas**

```typescript
// ============================================================================
// COMPREHENSIVE TEST SUITE
// ============================================================================

describe('SessionManager', () => {
  beforeEach(() => localStorage.clear());
  
  describe('Core Operations', () => {
    it('creates new sessions correctly');
    it('switches between multiple sessions');
    it('removes sessions safely');
    it('handles session expiration');
  });
  
  describe('Error Recovery', () => {
    it('recovers from corrupted localStorage');
    it('handles localStorage quota exceeded');
    it('validates session data integrity');
    it('gracefully handles database unavailability');
  });
  
  describe('Cross-Tab Synchronization', () => {
    it('syncs session changes across tabs');
    it('handles concurrent session modifications');
    it('broadcasts logout events correctly');
  });
  
  describe('Migration', () => {
    it('migrates legacy curia_session_token');
    it('migrates upAddress to session data');
    it('handles partial migration states');
  });
  
  describe('React Integration', () => {
    it('triggers re-renders on session changes');
    it('useAuth hook returns correct state');
    it('useSessionManager provides full API');
  });
});
```

---

## 🎯 **Success Criteria**

### **Technical Goals**

- ✅ **Zero localStorage conflicts** - Single `curia_sessions` key replaces scattered tokens
- ✅ **Perfect cross-tab sync** - Logout in one tab instantly updates all tabs
- ✅ **Multi-account support** - Switch between ENS, UP, anonymous seamlessly
- ✅ **Database synchronization** - Online sessions backed by PostgreSQL
- ✅ **Graceful offline** - Continue working when database unavailable
- ✅ **Token rotation handling** - Automatic updates when backend rotates tokens
- ✅ **Clean component APIs** - `useAuth()`, `useSessionManager()` hooks
- ✅ **Bulletproof error recovery** - Handle localStorage corruption, quota issues

### **User Experience Goals**

- ✅ **Instant account switching** - Click to switch between connected wallets
- ✅ **Persistent sessions** - Stay logged in across browser restarts  
- ✅ **Cross-device sync** - Database-backed sessions work across devices
- ✅ **Visual session indicators** - Clear UI showing active account
- ✅ **Seamless migration** - Existing users see zero disruption

### **Developer Experience Goals**

- ✅ **Single API surface** - All session operations through SessionManager
- ✅ **TypeScript safety** - Full type coverage for session data
- ✅ **React integration** - Hooks trigger re-renders automatically
- ✅ **Debugging support** - Clear console logs for session state changes
- ✅ **Test coverage** - Comprehensive test suite for edge cases

---

## 🚀 **Next Steps**

1. **Finalize this research document** - Review and approve architecture
2. **Create SessionManager implementation** - Build core class with full functionality
3. **Build React hooks** - useSessionManager and useAuth with reactivity
4. **Implement database sync** - Background sync with authentication_sessions table
5. **Migration strategy execution** - Phase-by-phase replacement of localStorage usage
6. **Add account switching UI** - Beautiful multi-account user experience
7. **Comprehensive testing** - Unit tests + integration tests + E2E testing
8. **Documentation** - API docs + migration guide + troubleshooting guide

**This architecture completely solves the localStorage chaos while adding powerful multi-account capabilities that elevate the entire user experience.** 