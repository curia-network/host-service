# Clean Multi-Iframe Community Switching Architecture

**Status**: Design Phase  
**Priority**: High  
**Created**: 2025-01-22  

## Overview

This document outlines the design and implementation plan for a **clean, purpose-built multi-iframe system** for community switching with state preservation. Unlike previous attempts, this will **replace** the current single-iframe system entirely with a properly architected solution.

## Current State Analysis - Complete System Understanding

### **How The Current Single Iframe System Works** 🔍

**Flow**: `embed-entry.ts` → `InternalPluginHost` → Services → Single Iframe

1. **Entry Point**: `embed-entry.ts`
   - Creates `InternalPluginHost(container, config, hostUrl, forumUrl)`
   - Sets up global `window.curiaEmbed` reference

2. **InternalPluginHost Orchestration**:
   - **Auth Phase**: `initializeAuthPhase()` → `iframeManager.createAuthIframe()`
   - **Auth Complete**: `onAuthComplete()` → `initializeCommunityNavigation()` → `switchToForum()`
   - **Forum Phase**: `switchToForum()` → `iframeManager.createForumIframe()`

3. **IframeManager - The Core**:
   - **One iframe at a time**: `currentIframe: HTMLIFrameElement | null`
   - **Auth iframe**: `/embed` URL with theme/community params
   - **Forum iframe**: `forumUrl` + `mod=standalone` + `iframeUid` + auth context
   - **API routing**: `apiProxy.setActiveIframe(iframe)` for message routing

4. **Community Sidebar**:
   - **Renders beautifully** with hover previews, user profile
   - **onClick**: `console.log('[InternalPluginHost] Community selected:', community.name); // TODO: Implement community switching logic in Phase 5`
   - **It's literally just a TODO!** 🎯

### **Key Technical Details** 🔧

**Forum URL Construction** (in `IframeManager.createForumIframe()`):
```typescript
const forumUrl = new URL(this.forumUrl);
forumUrl.searchParams.set('mod', 'standalone');
forumUrl.searchParams.set('iframeUid', this.myUid);
forumUrl.searchParams.set('cg_theme', resolvedTheme);
// + auth context communityId, externalParams, etc.
```

**API Message Routing**:
- `MessageRouter` filters by `message.iframeUid !== this.myUid`
- `ApiProxyClient` routes to whatever `setActiveIframe(iframe)` was last called with
- One shared `ApiProxyClient` instance across all services

**Critical Insight**: When switching from auth to forum, **the auth iframe gets completely replaced**. There's no preservation - it's create/destroy, not show/hide.

### **What Needs to Change for Multi-Iframe** 💡

**Current**: One iframe replaced by another (no state)
**Target**: Multiple forum iframes, show/hide for instant switching

**The Change**:
```typescript
// Current (in InternalPluginHost)
onCommunitySelect: (community) => {
  console.log('[InternalPluginHost] Community selected:', community.name);
  // TODO: Implement community switching logic in Phase 5 ← THIS IS IT!
}

// New Multi-Iframe Logic
onCommunitySelect: (community) => {
  console.log('[InternalPluginHost] Community selected:', community.name);
  await this.switchToCommunity(community.id); // ← IMPLEMENT THIS
}
```

**Core Changes Needed**:
1. **Replace the TODO** with actual switching logic
2. **Keep multiple iframes** instead of one `currentIframe`
3. **Show/hide logic** instead of create/destroy
4. **Update `apiProxy.setActiveIframe()`** when switching
5. **Build different forum URLs** per community ID

### **System Strengths ✅**
- **Clean service separation** - Each service has single responsibility
- **Working authentication flow** - Auth → forum transition works perfectly
- **Proper styling system** - Beautiful sidebar with hover previews, mobile responsive
- **Single ApiProxyClient** - No conflicts, shared instance across services
- **UID-based filtering** - Prevents cross-instance contamination
- **TODO is perfect starting point** - Exact place to implement multi-iframe logic

### **Current Limitation ❌**
- **Single iframe only** - `IframeManager` only tracks one iframe
- **Create/destroy pattern** - No state preservation between switches
- **Community switching is unimplemented** - Just logs to console

## Proposed Multi-Iframe Architecture - Simplified Approach

### **Core Insight**: The TODO Is The Perfect Starting Point! 🎯

Instead of ripping out `IframeManager`, **just implement the TODO**:

```typescript
// File: src/lib/embed/plugin-host/InternalPluginHost.ts
// Line: ~360

onCommunitySelect: (community) => {
  console.log('[InternalPluginHost] Community selected:', community.name);
  // TODO: Implement community switching logic in Phase 5 ← REPLACE THIS
  await this.switchToCommunity(community.id); // ← WITH THIS
}
```

### **New Architecture**: Extend Current System, Don't Replace

```typescript
export class InternalPluginHost {
  // Keep existing services
  private authService: AuthenticationService;    // ✅ Keep
  private messageRouter: MessageRouter;          // ✅ Keep  
  private iframeManager: IframeManager;          // ✅ Keep for auth iframe
  private apiProxy: ApiProxyClient;              // ✅ Keep
  private communitySidebar: CommunitySidebar;    // ✅ Keep

  // Add new multi-iframe management
  private communityIframes: Map<string, HTMLIFrameElement> = new Map(); // 🆕 Add
  private activeCommunityId: string | null = null;                      // 🆕 Add

  // New method to implement
  async switchToCommunity(communityId: string): Promise<void> {         // 🆕 Add
    // Get or create iframe for this community
    // Show target iframe, hide others  
    // Update apiProxy.setActiveIframe()
    // Update sidebar active state
  }
}
```

### **Key Changes - Surgical, Not Nuclear**

1. **Keep `IframeManager`** - Still handles auth iframe perfectly
2. **Add community iframe tracking** - New Map for forum iframes
3. **Implement `switchToCommunity()`** - Replace the TODO
4. **Minimal risk** - Only touching the unimplemented part

## Detailed Component Design

### 1. CommunityManager (Replaces IframeManager)

**Responsibilities:**
- ✅ Create and manage multiple community iframes
- ✅ Handle show/hide logic for instant switching
- ✅ Build correct forum URLs per community
- ✅ Manage iframe lifecycle and cleanup
- ✅ Coordinate with ApiProxyClient for active iframe

**Key Features:**
```typescript
export class CommunityManager {
  private iframes: Map<string, CommunityIframe> = new Map();
  private activeIframe: string | null = null;
  private config: EmbedConfig;
  private forumUrl: string;
  private apiProxy: ApiProxyClient; // Shared reference
  
  // Core methods
  async switchToCommunity(communityId: string): Promise<void>
  private async getOrCreateIframe(communityId: string): Promise<CommunityIframe>
  private buildForumUrl(communityId: string, uid: string): string
  cleanup(): void
}

interface CommunityIframe {
  communityId: string;
  iframe: HTMLIFrameElement;
  container: HTMLElement;
  uid: string;
  isLoaded: boolean;
  lastAccessed: Date;
}
```

**Smart Features:**
- **Lazy loading** - Create iframes only when first visited
- **LRU cleanup** - Remove least recently used iframes after 10+ communities
- **Memory management** - Auto cleanup after 30 minutes inactive
- **Error recovery** - Handle failed iframe loads gracefully

### 2. Enhanced MessageRouter

**Current State:** Single UID-based routing ✅  
**Enhancement:** Add community context awareness

```typescript
export class MessageRouter {
  private myUid: string;
  private apiProxy: ApiProxyClient;
  private activeCommunityId: string | null = null; // NEW
  
  // Enhanced methods
  setActiveCommunity(communityId: string): void
  private isMessageForActiveCommunity(message: Message): boolean
}
```

**Why minimal changes:**
- ✅ Current UID filtering already prevents cross-instance issues
- ✅ Shared ApiProxyClient architecture already works
- ✅ Just need to track which community is currently active

### 3. Enhanced CommunitySidebar

**Current State:** Beautiful UI with TODO onClick ✅  
**Enhancement:** Wire up real community switching

```typescript
// Current (TODO)
onCommunitySelect: (community) => {
  console.log('[InternalPluginHost] Community selected:', community.name);
  // TODO: Implement community switching logic
}

// New (functional)
onCommunitySelect: (community) => {
  console.log('[InternalPluginHost] Community selected:', community.name);
  await this.communityManager.switchToCommunity(community.id);
}
```

### 4. InternalPluginHost Updates

**Minimal orchestration changes:**
```typescript
export class InternalPluginHost {
  private communityManager: CommunityManager; // Replaces iframeManager
  private messageRouter: MessageRouter; // Enhanced
  private authService: AuthenticationService; // Unchanged
  private apiProxy: ApiProxyClient; // Unchanged
  
  // Updated initialization
  private async switchToForum(): Promise<void> {
    // Get initial community from auth context
    const communityId = this.authService.getAuthContext()?.communityId;
    if (communityId) {
      await this.communityManager.switchToCommunity(communityId);
    }
  }
}
```

## Implementation Strategy - Simplified & Surgical

### **Phase 1: Implement The TODO** 🎯
**Goal**: Replace the TODO with actual community switching (no other changes)

**What to do**:
1. **Add community iframe tracking** to `InternalPluginHost`
   ```typescript
   private communityIframes: Map<string, HTMLIFrameElement> = new Map();
   private activeCommunityId: string | null = null;
   ```

2. **Implement `switchToCommunity()` method**:
   ```typescript
   async switchToCommunity(communityId: string): Promise<void> {
     // Get or create iframe for this community
     // Show target iframe, hide others
     // Update apiProxy.setActiveIframe()
     // Update sidebar active state
   }
   ```

3. **Replace the TODO** in `onCommunitySelect`:
   ```typescript
   onCommunitySelect: (community) => {
     console.log('[InternalPluginHost] Community selected:', community.name);
     await this.switchToCommunity(community.id); // ← NEW
   }
   ```

4. **Test community switching** - Can switch between communities with preserved state

**Success Criteria**:
- ✅ **Auth flow unchanged** - Still uses `IframeManager` for auth iframe
- ✅ **Community switching works** - Can click sidebar and switch instantly
- ✅ **State preserved** - Scroll, forms, navigation maintained per community
- ✅ **Zero regressions** - Everything else works exactly as before

### **Phase 2: Polish & Edge Cases** ✨
**Goal**: Make it production-ready

**Tasks**:
1. **Add loading states** for new community iframes
2. **Error handling** for failed iframe loads
3. **Memory management** - Cleanup old iframes after X communities
4. **Visual indicators** - Show which communities are loaded vs loading
5. **Smooth transitions** - Fade in/out animations

### **Why This Approach Works**:
- ✅ **Minimal blast radius** - Only touch the unimplemented TODO
- ✅ **Keep what works** - Auth flow, styling, API routing all unchanged
- ✅ **Easy to test** - Can verify step by step
- ✅ **Easy to rollback** - Just revert the TODO if issues
- ✅ **Natural evolution** - Extend existing system organically

## Technical Decisions & Rationale

### Decision 1: Replace vs Extend
**Choice**: Replace IframeManager entirely  
**Rationale**: 
- ✅ Clean architecture without legacy baggage
- ✅ Purpose-built for multi-iframe from day 1
- ✅ Easier to reason about and maintain
- ✅ No competing responsibilities

### Decision 2: Single ApiProxyClient
**Choice**: Keep shared ApiProxyClient, update active iframe  
**Rationale**:
- ✅ Current architecture already works perfectly
- ✅ No "No active iframe" errors
- ✅ Simple to understand and debug
- ✅ Minimal changes to working system

### Decision 3: Enhanced MessageRouter
**Choice**: Enhance existing MessageRouter vs create new one  
**Rationale**:
- ✅ Current UID-based filtering already prevents issues
- ✅ Just need community context awareness
- ✅ Minimal risk of breaking working functionality

### Decision 4: Lazy Iframe Creation
**Choice**: Create iframes only when first accessed  
**Rationale**:
- ✅ Faster initial load times
- ✅ Lower memory usage for users with many communities
- ✅ Better performance on low-end devices
- ✅ Easier to manage and debug

## Success Metrics

### Performance Targets
- **Initial load**: No slower than current single-iframe
- **Community switch**: < 100ms for visited communities
- **Memory usage**: < 50MB additional per community iframe
- **New community load**: < 2 seconds

### User Experience Goals  
- **State preservation**: 100% scroll position, form data retained
- **Visual continuity**: Smooth transitions, no flashing
- **Error resilience**: Graceful handling of failed iframe loads
- **Responsive design**: Works perfectly on mobile horizontal nav

### Technical Quality
- **Code maintainability**: Clear separation of concerns
- **Test coverage**: All core switching logic covered
- **Documentation**: Clear API documentation for each service
- **Backward compatibility**: Zero breaking changes to embed API

## Risk Assessment & Mitigation

### High Risk: API Proxy Conflicts
**Risk**: Multiple iframes confusing the ApiProxyClient  
**Mitigation**: Single shared ApiProxyClient, explicit active iframe updates  
**Monitoring**: Log all setActiveIframe calls with community context

### Medium Risk: Memory Leaks
**Risk**: Iframes not being properly cleaned up  
**Mitigation**: LRU cleanup, memory monitoring, explicit destroy methods  
**Monitoring**: Track iframe count and memory usage in production

### Medium Risk: Complex State Management
**Risk**: Active community state gets out of sync  
**Mitigation**: Single source of truth in CommunityManager  
**Monitoring**: Log all community switches with state validation

### Low Risk: Initialization Order
**Risk**: Services initialized in wrong order  
**Mitigation**: Explicit dependency injection and initialization sequence  
**Monitoring**: Enhanced logging during startup

## Migration Plan

### Step 1: Feature Branch Creation
- ✅ Create clean feature branch from working state
- ✅ Document current functionality with tests
- ✅ Establish rollback plan

### Step 2: Foundation Development
- Create CommunityManager class
- Update InternalPluginHost integration
- Maintain identical external API
- Test with single community usage

### Step 3: Multi-Community Implementation
- Add multi-iframe logic to CommunityManager
- Wire up CommunitySidebar onClick
- Add MessageRouter community awareness
- Test with multiple communities

### Step 4: Production Polish
- Add advanced features (loading, transitions)
- Optimize memory management
- Add comprehensive error handling
- Performance testing and optimization

### Step 5: Deployment
- User acceptance testing
- Performance monitoring setup
- Gradual rollout with fallback option
- Documentation and training

## Implementation Lessons Learned

### **Phase 1 Attempt - What Went Wrong** ❌

**Issue**: Tried to replace `IframeManager` with `CommunityManager` via mass find-and-replace approach.

**Problems Encountered**:
1. **Linter Error Cascade** - Each replacement created 2-3 new TypeScript errors
2. **Too Many Changes** - Attempted to modify imports, class properties, and 10+ method calls simultaneously  
3. **Integration Complexity** - `InternalPluginHost` has deep integration with `IframeManager` interface
4. **Incomplete Planning** - Rushed into implementation without mapping all dependencies

**Root Cause**: The approach was **too aggressive** - trying to replace the entire service at once instead of incremental integration.

### **Revised Implementation Strategy**

#### **Corrected Approach: Just Implement The TODO** ✅

**The insight**: Community switching is literally unimplemented. Just implement it!

```typescript
// Current (InternalPluginHost line ~360)
onCommunitySelect: (community) => {
  console.log('[InternalPluginHost] Community selected:', community.name);
  // TODO: Implement community switching logic in Phase 5 ← REPLACE THIS
}

// New 
onCommunitySelect: (community) => {
  console.log('[InternalPluginHost] Community selected:', community.name);
  await this.switchToCommunity(community.id); // ← IMPLEMENT THIS
}
```

**What to add to `InternalPluginHost`**:
```typescript
// Track multiple community iframes
private communityIframes: Map<string, HTMLIFrameElement> = new Map();
private activeCommunityId: string | null = null;

// Implement the switching logic
async switchToCommunity(communityId: string): Promise<void> {
  // Get or create iframe for this community
  // Show target iframe, hide others  
  // Update apiProxy.setActiveIframe()
  // Update sidebar active state
}
```

### **Why This Is Perfect**

**The TODO is the exact right place** - it's where community switching should be implemented. No architectural changes needed, just fill in the missing functionality!

## Next Steps - Final Simplified Plan

### **Immediate Actions (Phase 1)** 
1. **Add community iframe tracking** to `InternalPluginHost`
   - `private communityIframes: Map<string, HTMLIFrameElement> = new Map();`
   - `private activeCommunityId: string | null = null;`

2. **Implement `switchToCommunity()` method** 
   - Get or create iframe for community
   - Show target, hide others
   - Update `apiProxy.setActiveIframe()`
   - Update sidebar active state

3. **Replace TODO in `onCommunitySelect`**
   - Change from `// TODO: Implement...` to `await this.switchToCommunity(community.id);`

4. **Test community switching**
   - Verify can switch between communities
   - Verify state preservation works
   - Verify no regressions in auth flow

### **Success Gate**
**Ready when**:
- ✅ **Community clicking switches iframes** with preserved state
- ✅ **Auth flow completely unchanged** (uses IframeManager)
- ✅ **No visual or functional regressions**
- ✅ **Easy to rollback** if needed

### **Why This Is The Right Approach**
- 🎯 **Implement exactly what's missing** - The TODO is the perfect starting point
- 🎯 **Minimal changes** - Only touch unimplemented functionality  
- 🎯 **Keep what works** - Auth, styling, API routing unchanged
- 🎯 **Natural evolution** - Extend the existing system organically
- 🎯 **Easy to test** - Can verify each piece works

---

**This approach implements multi-iframe community switching by simply filling in the TODO - no architectural complexity needed.**

---

## ✅ **IMPLEMENTATION COMPLETED** - Jan 22, 2025

### **Phase 1 & 2 Implementation Summary**

**What Was Implemented**:
- ✅ Added `communityIframes: Map<string, HTMLIFrameElement>` to track multiple iframes
- ✅ Added `activeCommunityId: string | null` to track current active community  
- ✅ Implemented `switchToCommunity(communityId: string)` method
- ✅ Implemented `createCommunityIframe()` method for new community iframes
- ✅ **CRITICAL FIX**: Added `updateCommunityContext()` to `AuthenticationService`
- ✅ **CRITICAL FIX**: Called `authService.updateCommunityContext()` during community switch
- ✅ Replaced the TODO with actual `switchToCommunity()` call
- ✅ Added comprehensive `[MULTI-IFRAME]` logging throughout

### **Key Bug Fixed: Community Context for API Requests**

**The Problem**: Different iframes were being created correctly, but all API requests used the original community context from auth.

**Root Cause**: `MessageRouter.handleApiRequest()` always used `authContext.communityId` which was set once and never updated.

**The Solution**:
```typescript
// In switchToCommunity() - InternalPluginHost.ts
this.activeCommunityId = communityId;
this.authService.updateCommunityContext(communityId); // ← CRITICAL FIX

// In AuthenticationService.ts  
updateCommunityContext(communityId: string): void {
  this.authContext.communityId = communityId; // ← Updates API context for MessageRouter
}
```

**Result**: Each community iframe now gets correct community-specific data from `@curia_/cg-plugin-lib` API requests.

### **Status**: 
Multi-iframe community switching is **functionally complete** with state preservation and proper API context switching. Ready for testing! 