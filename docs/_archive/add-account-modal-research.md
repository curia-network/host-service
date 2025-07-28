# Add Account Modal - Technical Research & Specification

## 📋 **Project Goal**
Implement an "Add Account" button in the account switcher that opens a modal allowing users to authenticate with additional account types (ENS, UP, Anonymous) while filtering out already-connected types.

## 🎯 **User Experience Requirements**

### Target Flow
1. User clicks "Add Account" in account switcher
2. Modal opens with filtered auth options (only show unavailable types)
3. User completes authentication in modal context
4. Modal closes, account switcher refreshes with new session
5. User can immediately switch to new account

### Session Filtering Logic - REFINED

**Previous (Too Restrictive)**:
- ❌ Only show ENS if no ENS session exists
- ❌ Only show UP if no UP session exists  
- ❌ Always show Anonymous (replace existing)

**New (Multi-Account Friendly)**:
- ✅ **ENS**: Always available - user can connect multiple ENS domains
- ✅ **Universal Profile**: Always available - user can connect multiple UP addresses  
- ✅ **Anonymous**: Always available - creates fresh anonymous session

**Smart Session Management**:
1. **Multiple ENS Sessions**: Group by domain name, show latest per domain
2. **Multiple UP Sessions**: Group by UP address, show latest per address
3. **Anonymous Sessions**: Only keep the most recent one (auto-cleanup old ones)
4. **Account Switcher**: Show all unique identities, not all sessions

### Account Switcher Display Logic

**Instead of**: "Show freshest session of each type"
**New Logic**: "Show all unique identities with smart grouping"

```typescript
interface AccountGroup {
  identityType: 'ens' | 'universal_profile' | 'anonymous';
  primaryIdentifier: string; // ENS domain, UP address, or 'anonymous'
  displayName: string;
  profileImageUrl?: string;
  sessions: SessionData[]; // All sessions for this identity
  activeSession: SessionData; // Most recent session for this identity
}

// Example account switcher state:
[
  {
    identityType: 'ens',
    primaryIdentifier: 'alice.eth',
    displayName: 'alice.eth',
    sessions: [session1, session2], // Multiple sessions for same domain
    activeSession: session2 // Most recent
  },
  {
    identityType: 'ens', 
    primaryIdentifier: 'alice-dao.eth',
    displayName: 'alice-dao.eth',
    sessions: [session3],
    activeSession: session3
  },
  {
    identityType: 'universal_profile',
    primaryIdentifier: '0x123...UP1',
    displayName: 'Personal UP',
    sessions: [session4],
    activeSession: session4
  },
  {
    identityType: 'anonymous',
    primaryIdentifier: 'anonymous',
    displayName: 'Guest User',
    sessions: [session5], // Only most recent anonymous
    activeSession: session5
  }
]
```

### SessionManager Implications

**Current SessionManager**: Stores flat list of sessions
**Needed Enhancement**: Smart grouping and identity management

```typescript
// New SessionManager methods needed:
class SessionManager {
  // Current methods work fine for storage
  
  // New grouping methods:
  getAccountGroups(): AccountGroup[] {
    // Group sessions by identity type + primary identifier
    // Return unique identities with their latest sessions
  }
  
  addSessionToIdentity(newSession: SessionData): Promise<void> {
    // Add session and auto-cleanup old sessions for same identity
    // For anonymous: remove all previous anonymous sessions
    // For ENS/UP: keep all but cleanup expired ones
  }
  
  getActiveAccountGroup(): AccountGroup | null {
    // Get the account group containing the active session
  }
  
  switchToAccountGroup(primaryIdentifier: string): Promise<void> {
    // Switch to the latest session for a given identity
  }
}
```

### Updated Modal Behavior

**Add Account Modal**: 
- ✅ Always shows all 3 options (ENS, UP, Anonymous)
- ✅ No filtering needed - all types always available
- ✅ ENS flow: User can connect any ENS domain (even if they have others)
- ✅ UP flow: User can connect any UP address (even if they have others)  
- ✅ Anonymous: Creates fresh session, auto-cleans old anonymous sessions

**Account Switcher**:
- ✅ Shows unique identities, not all sessions
- ✅ Groups multiple sessions per identity
- ✅ Click identity = switch to latest session for that identity
- ✅ Shows clear identity labels (domain names, UP addresses)

## 🧩 **Component Architecture Analysis**

### Current Auth Flow Components
```
AuthenticationStep.tsx
├── Anonymous auth (direct backend call)
├── ENS flow → EthereumProfileProvider → EthereumConnection
└── UP flow → UniversalProfileProvider → UniversalProfileConnection
```

### Key Dependencies
- `EthereumProfileProvider` + RainbowKit for ENS
- `UniversalProfileProvider` + window.lukso for UP
- Direct API calls for Anonymous
- SessionManager for session storage

## 🔍 **Provider Isolation Analysis - FINDINGS**

### ✅ **Good News: Providers Support Isolation**

1. **EthereumProfileProvider** already supports isolation:
   ```typescript
   export const EthereumProfileProvider: React.FC<{ 
     children, 
     storageKey = 'host_service_ethereum_profile' // ✅ Configurable storage key
   }> = ({ children, storageKey }) => {
     return (
       <EthereumWagmiProvider storageKey={storageKey}> {/* ✅ Passes storage key down */}
         <EthereumProfileProviderInternal>
           {children}
         </EthereumProfileProviderInternal>
       </EthereumWagmiProvider>
     );
   };
   ```

2. **UniversalProfileProvider** uses global state but should be fine:
   ```typescript
   // Uses window.lukso directly - global but should work with multiple instances
   // State is self-contained within each provider instance
   // No external storage keys or persistent state conflicts
   ```

### ⚠️ **Potential Issues Identified**

1. **Context Conflicts**: Multiple providers might work, but RainbowKit modal states could conflict
2. **Global Wallet State**: window.lukso and window.ethereum are global - rapid connections might interfere
3. **Event Listeners**: Each provider sets up event listeners - potential for double handling

### 🧪 **Required Testing**

```typescript
// Test scenario we need to validate:
<EthereumProfileProvider storageKey="main_embed">
  {/* Main embed auth flow */}
</EthereumProfileProvider>

// Simultaneously:
<Modal>
  <EthereumProfileProvider storageKey="add_account_modal">
    {/* Add account modal flow */}
  </EthereumProfileProvider>
</Modal>
```

## 🚨 **Critical Complexity Areas**

### 1. InternalPluginHost Context Issues ⚠️
**Current Problem**: InternalPluginHost doesn't use any React providers - it's pure vanilla JS!

```typescript
// InternalPluginHost.ts is NOT a React component!
export class InternalPluginHost {
  // Pure vanilla JavaScript/TypeScript class
  // No React context, no providers, no JSX
}
```

**Modal Implementation Challenge**: 
- Auth components expect React context with providers
- Modal needs to be rendered in DOM but InternalPluginHost is vanilla JS
- Need bridge between vanilla JS and React components

### 2. DOM Integration Complexity
**Problem**: How do we render React modal from vanilla JS class?

**Options**:
1. **React Portal** - Render modal in document.body from vanilla JS
2. **Vanilla JS Modal** - Reimplement auth logic without React
3. **Hybrid Approach** - Minimal vanilla wrapper around React components

### 3. State Management Between Contexts
**Problem**: InternalPluginHost manages session state, but React modal needs access

**Current Pattern**:
```typescript
// InternalPluginHost manages:
- sessionManager.getSessions()
- userProfile state
- auth context

// React modal would need:
- Access to existing sessions for filtering
- Ability to add new sessions
- Callback to update InternalPluginHost UI
```

## 🔍 **Implementation Approaches - REVISED**

### ❌ Approach A: Component Extraction + Modal Wrapper
**Problem**: InternalPluginHost is vanilla JS, not React - major architecture mismatch

### ❌ Approach B: Modal-Embedded Auth Flow  
**Problem**: Same issue - can't embed React components in vanilla JS context easily

### ✅ **Approach C: Vanilla-React Bridge Pattern (RECOMMENDED)**
**Strategy**: Create minimal vanilla JS modal that renders React auth components via ReactDOM.render

**Architecture**:
```typescript
InternalPluginHost (vanilla JS)
├── createAddAccountModal() // vanilla JS function
└── VanillaModalBridge
    ├── React.createElement(AddAccountModal) 
    └── ReactDOM.render() into modal DOM element
```

**Benefits**:
- Preserves existing vanilla JS architecture
- Allows React component reuse
- Clean separation of concerns
- No major refactoring needed

### 📋 **Vanilla-React Bridge Implementation Plan**

1. **Create vanilla modal container** in InternalPluginHost
2. **ReactDOM.render** auth components into modal
3. **Provider isolation** with unique storage keys
4. **Callback system** for modal ↔ host communication
5. **Cleanup** via ReactDOM.unmountComponentAtNode

## 🧪 **Technical Validation Questions - UPDATED**

### Provider Isolation (Lower Risk Now)
1. ✅ EthereumProfileProvider supports storageKey isolation
2. ✅ UniversalProfileProvider appears safe for multiple instances  
3. ⚠️ Need to test RainbowKit modal conflicts in practice

### Vanilla-React Integration (Higher Risk)
1. How do we pass session data from vanilla JS to React modal?
2. How do we handle React auth success callbacks in vanilla context?
3. What's the proper cleanup pattern for dynamically rendered React components?
4. How do we handle React error boundaries in vanilla-rendered context?

### Modal Integration (Medium Risk)
1. What's the ideal modal size for constrained auth flows?
2. How do we handle z-index conflicts with existing UI?
3. How do we prevent modal backdrop clicks from interfering with wallet popups?

## 📋 **Research Tasks - UPDATED PRIORITIES**

### Phase 1: Multi-Account SessionManager Enhancement (HIGH PRIORITY)
- [ ] Design AccountGroup interface and session grouping logic
- [ ] Implement session grouping methods in SessionManager
- [ ] Test multi-session scenarios (multiple ENS domains, multiple UPs)
- [ ] Design anonymous session cleanup strategy

### Phase 2: Vanilla-React Bridge Testing (HIGH PRIORITY)
- [ ] Test ReactDOM.render into vanilla-created DOM element  
- [ ] Test provider isolation with different storage keys
- [ ] Test auth component rendering in constrained modal space
- [ ] Design callback system for vanilla ↔ React communication

### Phase 3: Account Switcher UI Redesign (MEDIUM PRIORITY)
- [ ] Design account group display UI (instead of flat session list)
- [ ] Test identity grouping and switching logic
- [ ] Design clear identity labels and visual hierarchy
- [ ] Test account switcher with multiple identities

### Phase 4: Modal Integration Testing (LOWER PRIORITY)  
- [ ] Test modal z-index with wallet popups
- [ ] Test modal sizing for auth flows  
- [ ] Test RainbowKit modal conflicts with main embed
- [ ] Design modal backdrop and focus management

## 🎯 **Success Criteria - UPDATED**

### Technical Requirements
- [ ] Vanilla JS can render React components in modal
- [ ] No provider state conflicts between main embed and modal
- [ ] Clean modal lifecycle (open/close/cleanup)
- [ ] Successful session addition and UI refresh

### User Experience Requirements
- [ ] Smooth modal open/close animations
- [ ] Familiar auth UI consistent with main embed
- [ ] Immediate account switcher refresh after adding account
- [ ] No interference with existing embed functionality

## 🔄 **Next Steps - REVISED AGAIN**

1. **SessionManager Multi-Account Enhancement** - Add session grouping logic
2. **Account Switcher UI Update** - Support grouped identities display
3. **Vanilla-React Bridge Prototype** - Test modal integration pattern
4. **Add Account Modal Implementation** - Always show all auth options

---

## 📝 **Key Insight #1: Architecture Mismatch Discovered**

The biggest finding is that **InternalPluginHost is vanilla JavaScript**, not React. This changes the entire implementation approach from "React modal with auth components" to "vanilla JS modal bridge that renders React components".

This actually might be **simpler than expected** - we just need a clean bridge pattern instead of complex React context isolation.

## 📝 **Key Insight #2: Multi-Account Reality**

Your insight completely changes the session management approach:

**Before**: "One ENS session, one UP session, one anonymous session"
**After**: "Multiple identities per type, grouped by unique identifier"

This actually **simplifies the modal** (no filtering needed) but **adds complexity to SessionManager** (grouping logic needed).

**Impact on Implementation**:
- ✅ **Modal becomes simpler** - always show all 3 auth types
- ⚠️ **SessionManager needs enhancement** - add grouping methods
- ⚠️ **Account switcher needs redesign** - show identities, not sessions
- ✅ **User experience becomes much better** - supports real-world usage patterns

## 🎯 **Combined Impact: Simpler Than Expected**

**The two insights actually work together to simplify implementation**:

1. **No complex filtering logic needed** - modal always shows all auth types
2. **No complex React context isolation** - vanilla JS bridge is cleaner
3. **Clear separation of concerns** - SessionManager handles grouping, modal handles auth
4. **Better user experience** - supports real multi-account workflows

**Implementation becomes**:
- SessionManager enhancement (grouping logic)
- Simple vanilla JS modal + React auth components
- Account switcher redesign (show identities)
- Always-available "Add Account" button

*This document will be updated as we research each area and make implementation decisions.* 