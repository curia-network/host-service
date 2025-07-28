# Community Switching via CG Plugin Lib - Implementation Research

**Status**: Research Phase  
**Priority**: High  
**Created**: 2025-01-22  

## Executive Summary

Research into implementing community switching functionality via CG plugin lib calls, evaluating two approaches:
1. **Repurposing existing `cg.navigate()` function** (currently unused)
2. **Introducing new `cg.switchCommunity()` function** with library modifications

## Current System Architecture Understanding

### Multi-Iframe Loading & Message Routing System

The Curia embed uses a sophisticated multi-layered architecture:

```
Customer Page (https://example.com)
    ↓ Embed Script (embed.js)
InternalPluginHost (Customer Page Context)
    ↓ PostMessage API Requests 
MessageRouter (UID-based filtering)
    ↓ ApiProxyClient Routing
ApiProxyServer (Auth/Forum Iframe - same domain)
    ↓ Direct API Calls
Host Service APIs (/api/user, /api/community, etc.)
    ↓ PostgreSQL Database
[Response flows back through same chain]
```

#### Key Components:
- **InternalPluginHost**: Central orchestrator managing iframe lifecycle and message routing
- **MessageRouter**: Handles PostMessage communication with UID-based filtering to prevent cross-instance contamination  
- **IframeManager**: Manages iframe creation, URL building, and DOM management
- **ApiProxyClient**: CSP-compliant API routing between customer sites and host service
- **CommunitySidebar**: Beautiful UI component with hover previews and user profile

### Role of the Three CG Plugin Libraries

#### 1. `@curia_/iframe-api-proxy` (v1.0.0)
**Purpose**: CSP-compliant API communication
**Current Usage**: Active - core to the messaging system
```typescript
// In InternalPluginHost
this.apiProxy = new ApiProxyClient({
  debug: true,
  defaultTimeout: 10000,
  maxRetries: 3
});

// Routes API requests from forum iframe to host service
const result = await this.apiProxy.makeApiRequest({
  method: message.method,
  params: message.params,
  communityId: authContext.communityId,
  userId: authContext.userId
});
```

**Technical Details**:
- `ApiProxyClient` runs in customer page context (bypasses CSP restrictions)
- `ApiProxyServer` runs in auth/forum iframe (same domain as APIs)
- Enables PostMessage-based API routing for security compliance

#### 2. `@curia_/cg-plugin-lib-host` (v1.0.1)  
**Purpose**: Server-side request validation and signing
**Current Usage**: Limited - mostly TODO comments
```typescript
// In PluginHost.ts
// TODO: Validate signature using @curia_/cg-plugin-lib-host
// For now, we'll skip signature validation during development

// In /api/sign route  
// TODO: Use the actual @curia_/cg-plugin-lib-host for signing
// const signedRequest = await CgPluginLibHost.signRequest(body, { privateKey, keyId });
```

**Intended Role**: Cryptographic request signing and validation for plugin communication security

#### 3. `@curia_/cg-plugin-lib` (v1.0.6)
**Purpose**: Client-side API calls from forum application
**Current Usage**: Expected to be used by external forum app
```typescript
// Expected usage in forum app (separate repo)
const cglib = new CgPluginLib();
const userInfo = await cglib.getUserInfo();
const communities = await cglib.getCommunityInfo();
```

**Context**: This would be imported by the actual forum application running in the iframe to make API calls back to the host service.

## Current Community Switching Implementation Status

### ✅ What's Already Built

**Beautiful Community Sidebar**: Fully functional UI with hover previews
```typescript
// In CommunitySidebar.ts - ALREADY WORKING
this.communitySidebar = new CommunitySidebar({
  communities,
  currentCommunityId: this.authService.getAuthContext()?.communityId || '',
  userProfile: profile,
  onCommunitySelect: (community) => {
    console.log('[InternalPluginHost] Community selected:', community.name);
    console.log(`[MULTI-IFRAME] Community selection triggered for: ${community.id}`);
    this.switchToCommunity(community.id).catch(error => {
      console.error(`[MULTI-IFRAME] Failed to switch to community ${community.id}:`, error);
    });
  }
});
```

**Multi-Iframe Management**: Already implemented!
```typescript
// In InternalPluginHost.ts - ALREADY WORKING  
private communityIframes: Map<string, HTMLIFrameElement> = new Map();
private activeCommunityId: string | null = null;

private async switchToCommunity(communityId: string): Promise<void> {
  // Get or create iframe for target community
  let targetIframe = this.communityIframes.get(communityId);
  
  if (!targetIframe) {
    targetIframe = this.createCommunityIframe(communityId, authContext);
    this.communityIframes.set(communityId, targetIframe);
  }

  // Show target iframe, hide others
  if (this.activeCommunityId) {
    const currentIframe = this.communityIframes.get(this.activeCommunityId);
    if (currentIframe) currentIframe.style.display = 'none';
  }
  
  targetIframe.style.display = 'block';
  
  // Update API proxy routing
  this.apiProxy.setActiveIframe(targetIframe);
  
  // Update internal state
  this.activeCommunityId = communityId;
  this.authService.updateCommunityContext(communityId);
  this.communitySidebar.updateActiveCommunity(communityId);
}
```

**Database Foundation**: Perfect schema already exists
```sql
-- user_communities table provides everything needed
SELECT c.id, c.name, c.logo_url, uc.role
FROM user_communities uc
JOIN communities c ON uc.community_id = c.id  
WHERE uc.user_id = $1 AND uc.status = 'active';
```

### 🤔 What's Missing: The CG Navigate Connection

**Current Gap**: The forum application (running in iframe) has no way to programmatically trigger community switches. It can only be done via the sidebar UI.

**Missing Link**: Forum app needs a function like:
```typescript
// This doesn't exist yet in cg-plugin-lib
await cglib.navigate.switchCommunity('target-community-id');
// OR
await cglib.switchCommunity('target-community-id', { 
  boardId: 123, 
  postId: 456 
});
```

## Two Implementation Approaches

### Approach 1: Repurpose Existing `cg.navigate()` 

**Current Status**: CG Navigate appears to be unused/legacy
```typescript
// From cg-navigate-specs.md
communitySwitcher(targetCommunityId: string, options?: {
  boardId?: number,
  postId?: number, 
  commentId?: number
})
```

**Advantages**:
- ✅ Function already exists in specification
- ✅ No breaking changes to library API  
- ✅ Semantic fit - navigation between communities
- ✅ Can extend with deep linking options

**Implementation**:
1. **Forum App Calls**: `cglib.navigate(targetCommunityId, options)`
2. **PostMessage to Host**: New message type `COMMUNITY_NAVIGATION_REQUEST`
3. **InternalPluginHost**: Route to existing `switchToCommunity()` method
4. **Response**: Confirmation of switch completion

**Technical Flow**:
```typescript
// 1. Forum app (iframe) calls
await cglib.navigate('community-xyz', { boardId: 123 });

// 2. cg-plugin-lib sends PostMessage
window.parent.postMessage({
  type: 'COMMUNITY_NAVIGATION_REQUEST',
  targetCommunityId: 'community-xyz',  
  options: { boardId: 123 },
  iframeUid: this.uid,
  requestId: generateId()
}, '*');

// 3. MessageRouter in InternalPluginHost
if (message.type === 'COMMUNITY_NAVIGATION_REQUEST') {
  await this.switchToCommunity(message.targetCommunityId);
}
```

### Approach 2: New `cg.switchCommunity()` Function

**Rationale**: More explicit, purpose-built API for community switching

**Advantages**: 
- ✅ Clear, unambiguous function name
- ✅ Can be optimized specifically for community switching  
- ✅ Separate from any legacy navigate functionality
- ✅ Future-proof for community-specific features

**Implementation**:
1. **Modify cg-plugin-lib**: Add new `switchCommunity()` method
2. **Modify cg-plugin-lib-host**: Add message type and validation
3. **Update host service**: Handle new message type
4. **Deploy library updates**: Version bump and distribution

**Technical Implementation**:
```typescript
// 1. Add to @curia_/cg-plugin-lib
export class CgPluginLib {
  async switchCommunity(
    targetCommunityId: string, 
    options?: {
      boardId?: number;
      postId?: number;
      preserveScroll?: boolean;
      transition?: 'instant' | 'fade';
    }
  ): Promise<{success: boolean, community: CommunityInfo}> {
    return this.sendMessage({
      type: 'COMMUNITY_SWITCH_REQUEST',
      targetCommunityId,
      options,
      timestamp: Date.now()
    });
  }
}

// 2. Handle in MessageRouter  
if (message.type === 'COMMUNITY_SWITCH_REQUEST') {
  const result = await this.handleCommunitySwitchRequest(message);
  this.sendResponse(source, message, result);
}
```

## Analysis & Recommendation

### Technical Feasibility Assessment

**Both approaches are technically straightforward** because:
- ✅ Multi-iframe switching logic is already implemented
- ✅ Community sidebar UI already works perfectly  
- ✅ Database schema and APIs are ready
- ✅ Message routing infrastructure exists
- ✅ Authentication context management works

**Key Insight**: This is primarily a **messaging/API surface** problem, not an architecture problem.

### Recommendation: **Approach 1 - Repurpose `cg.navigate()`**

**Rationale**:

1. **Faster Implementation**: No library modifications needed if navigate exists
2. **Semantic Fit**: Navigation between communities is exactly what this is
3. **Lower Risk**: Reuses existing patterns and terminology  
4. **Legacy Compatibility**: If navigate exists but unused, this gives it purpose

**Implementation Plan**:

#### Phase 1: Message Type Addition (1-2 days)
```typescript
// Add to MessageRouter in InternalPluginHost
enum InternalMessageType {
  // ... existing types
  COMMUNITY_NAVIGATION_REQUEST = 'community_navigation_request',
  COMMUNITY_NAVIGATION_RESPONSE = 'community_navigation_response'
}

// Handle the new message type
if (message.type === InternalMessageType.COMMUNITY_NAVIGATION_REQUEST) {
  await this.handleCommunityNavigation(message);
}
```

#### Phase 2: Forum Integration (2-3 days)
```typescript
// Update cg-plugin-lib to send navigation messages
// (either modify existing navigate() or add the message sending)
cglib.navigate = async (communityId, options = {}) => {
  return await this.sendMessage({
    type: 'COMMUNITY_NAVIGATION_REQUEST',
    targetCommunityId: communityId,
    options: options
  });
};
```

#### Phase 3: Testing & Validation (1-2 days)
- Test community switching from forum app
- Verify state preservation works  
- Test error scenarios (invalid community, no access, etc.)
- Performance testing with multiple iframes

### Alternative: **Approach 2 if Navigate Doesn't Exist**

If investigation reveals that `cg.navigate()` doesn't actually exist or is problematic:

1. **Add new `switchCommunity()` to cg-plugin-lib**
2. **Version bump to v1.0.7**  
3. **Update both local library repos**
4. **Deploy and test**

**Timeline**: 3-5 days (includes library modification and testing)

## Implementation Prerequisites

### Local Library Setup
```bash
# Ensure local libraries are ready for modification
cd /Users/florian/Git/curia/cg-plugin-lib
yarn install
yarn build

cd /Users/florian/Git/curia/cg-plugin-lib-host  
yarn install
yarn build

# Link them to host-service for testing
cd /Users/florian/Git/curia/host-service
yarn link @curia_/cg-plugin-lib
yarn link @curia_/cg-plugin-lib-host
```

### Investigation Tasks
1. **Examine cg-plugin-lib source**: Does `navigate()` function exist?
2. **Check current API surface**: What methods are currently available?
3. **Review message types**: What PostMessage types are already supported?
4. **Test forum integration**: Can the forum app currently make API calls?

## Success Criteria

### Functional Requirements
- ✅ Forum app can programmatically switch communities
- ✅ State preservation works (scroll position, form data, etc.)
- ✅ Error handling for invalid communities/permissions  
- ✅ Loading states during community switches
- ✅ Deep linking support (optional board/post targeting)

### Technical Requirements  
- ✅ No regressions in existing multi-iframe functionality
- ✅ Proper message filtering (UID-based isolation)
- ✅ API proxy routing updates correctly
- ✅ Memory management (iframe cleanup after threshold)
- ✅ Performance acceptable with 5+ communities

### User Experience Requirements
- ✅ Instant switching (no loading screens)
- ✅ Visual feedback during transitions
- ✅ Context preservation where appropriate
- ✅ Graceful error states with user-friendly messages

## Investigation Results ✅

### Local CG Plugin Library Analysis

**Location**: `/Users/florian/Git/curia/cg-plugin-lib` (v1.0.6)

**Key Findings**:

1. **Navigate Function EXISTS** ✅
```typescript
// In CgPluginLib.ts - lines ~178-188
public navigate(url: string): void {
  if (!this.config) {
    throw new Error('Plugin not initialized');
  }

  console.log(`[CgPluginLib] Navigating to: ${url}`);
  
  // Navigate the current window to the URL
  window.location.href = url;
}
```

2. **Current API Surface** - Well-defined interface:
   - `getUserInfo()` ✅ 
   - `getCommunityInfo()` ✅
   - `getUserFriends(limit, offset)` ✅
   - `giveRole(roleId, userId)` ✅
   - `getContextData()` ✅ 
   - `navigate(url)` ✅ **← CAN BE EXTENDED**

3. **Message System Ready**: 
   - PostMessage protocol implemented
   - Request/response correlation with requestId
   - Timeout handling and cleanup
   - Signature validation placeholder

4. **Perfect Extension Point**: 
   - Navigate function is basic (just `window.location.href`)
   - Can be enhanced to detect community switching patterns
   - Already has the infrastructure for PostMessage communication

## Final Recommendation: **New Purpose-Built `switchCommunity()` Function** 🎯

**Rationale**:
- ✅ **Clear, explicit API** - No confusion about what this function does
- ✅ **Purpose-built parameters** - Designed specifically for community switching needs
- ✅ **Separation of concerns** - Internal navigation vs. community switching are different
- ✅ **Future-proof** - Can extend with community-specific options without conflicts

## Complete End-to-End Implementation Roadmap

### Function Signature Design
```typescript
/**
 * Switch to a different community in the embedded forum
 * 
 * @param communityId - Target community ID to switch to
 * @param options - Optional navigation parameters
 * @returns Promise<SwitchCommunityResponse> - Success/failure result
 */
public async switchCommunity(
  communityId: string, 
  options?: {
    /** Optional board ID to navigate to within target community */
    boardId?: number;
    /** Optional post ID to navigate to within target community */
    postId?: number;
    /** Whether to preserve current scroll position during switch */
    preserveScroll?: boolean;
    /** Transition animation type */
    transition?: 'instant' | 'fade' | 'slide';
  }
): Promise<{
  success: boolean;
  communityInfo?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  error?: string;
}>
```

### **Phase 1: Update @curia_/cg-plugin-lib** (1-2 days)

#### 1.1 Add New Function to CgPluginLib Class
```typescript
// In /Users/florian/Git/curia/cg-plugin-lib/src/CgPluginLib.ts

/**
 * Switch to a different community - MUST be consistent with other API methods
 */
public async switchCommunity(
  communityId: string,
  options?: {
    boardId?: number;
    postId?: number;
    preserveScroll?: boolean;
    transition?: 'instant' | 'fade' | 'slide';
  }
): Promise<ApiResponse<SwitchCommunityResponsePayload>> {
  return this.makeApiRequest('switchCommunity', { 
    communityId, 
    options 
  });
}
```

#### 1.2 Add Types to types.ts
```typescript
// In /Users/florian/Git/curia/cg-plugin-lib/src/types.ts

/**
 * Response payload for community switching
 */
export interface SwitchCommunityResponsePayload {
  /** Target community information */
  communityInfo: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  /** Whether user has required permissions in target community */
  hasAccess: boolean;
  /** Switched successfully */
  switched: boolean;
}
```

#### 1.3 Build and Test Library
```bash
cd /Users/florian/Git/curia/cg-plugin-lib
yarn build
# Test that new function compiles and exports correctly
```

### **Phase 2: Update @curia_/cg-plugin-lib-host** (1 day)

#### 2.1 Add Method Validation
```typescript
// In /Users/florian/Git/curia/cg-plugin-lib-host/src/validation.ts (or equivalent)

// Add 'switchCommunity' to list of valid methods
const VALID_API_METHODS = [
  'getUserInfo',
  'getCommunityInfo',
  'getUserFriends', 
  'getContextData',
  'giveRole',
  'switchCommunity' // <- Add this
];
```

#### 2.2 Add Request Signing Support
```typescript
// Ensure switchCommunity requests can be signed like other API methods
// This should work automatically if existing signing infrastructure is method-agnostic
```

### **Phase 3: Update Host Service MessageRouter** (1 day)

#### 3.1 Add Message Type
```typescript
// In src/lib/embed/services/messaging/MessageRouter.ts

enum InternalMessageType {
  API_REQUEST = 'api_request',
  API_RESPONSE = 'api_response',
  INIT = 'init',
  ERROR = 'error',
  COMMUNITY_SWITCH = 'community_switch' // <- Add this
}
```

#### 3.2 Add Method Handler
```typescript
// In MessageRouter.handleApiRequest()

switch (message.method) {
  case 'getUserInfo':
    // ... existing
  case 'getCommunityInfo':
    // ... existing  
  case 'switchCommunity':
    await this.handleCommunitySwitchRequest(message, source);
    return;
  // ... other methods
}

private async handleCommunitySwitchRequest(
  message: InternalPluginMessage, 
  source: Window
): Promise<void> {
  try {
    const { communityId, options } = message.params;
    
    // Validate user has access to target community
    const authContext = this.callbacks.getAuthContext?.();
    if (!authContext) {
      throw new Error('No authentication context available');
    }

    // Route to existing community switching logic
    if (this.callbacks.onCommunitySwitchRequest) {
      const result = await this.callbacks.onCommunitySwitchRequest(communityId, options);
      this.sendResponse(source, message, result);
    } else {
      throw new Error('Community switching not supported');
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Community switch failed';
    this.sendError(source, message, errorMessage);
  }
}
```

#### 3.3 Add Callback Interface
```typescript
// In MessageRouter types
export interface MessageRouterCallbacks {
  onAuthComplete?: (data: any) => Promise<void>;
  onForumInit?: () => void;
  getAuthContext?: () => InternalAuthContext | null;
  onCommunitySwitchRequest?: (communityId: string, options?: any) => Promise<SwitchCommunityResponsePayload>; // <- Add this
}
```

### **Phase 4: Update InternalPluginHost** (1 day)

#### 4.1 Wire Up the Callback
```typescript
// In src/lib/embed/plugin-host/InternalPluginHost.ts constructor

this.messageRouter = new MessageRouter(
  this.iframeManager.getUid(),
  this.apiProxy,
  {
    onAuthComplete: this.onMessageAuthComplete.bind(this),
    onForumInit: this.onForumInit.bind(this),
    getAuthContext: () => this.authService.getAuthContext(),
    onCommunitySwitchRequest: this.handleCommunitySwitchRequest.bind(this) // <- Add this
  }
);
```

#### 4.2 Implement Handler
```typescript
// In InternalPluginHost class

private async handleCommunitySwitchRequest(
  communityId: string, 
  options?: any
): Promise<SwitchCommunityResponsePayload> {
  console.log(`[InternalPluginHost] Community switch requested: ${communityId}`, options);

  // Use existing switchToCommunity logic!
  await this.switchToCommunity(communityId);

  // Get community info for response
  const authContext = this.authService.getAuthContext();
  const communities = await this.authService.fetchUserCommunities();
  const targetCommunity = communities.find(c => c.id === communityId);

  if (!targetCommunity) {
    throw new Error(`Community ${communityId} not found or not accessible`);
  }

  return {
    communityInfo: {
      id: targetCommunity.id,
      name: targetCommunity.name,
      logoUrl: targetCommunity.logo_url
    },
    hasAccess: true,
    switched: true
  };
}
```

### **Phase 5: @curia_/iframe-api-proxy Analysis** (1 hour)

#### 5.1 Review Current Implementation
The iframe-api-proxy handles PostMessage routing between:
- Customer page (ApiProxyClient) 
- Auth/Forum iframe (ApiProxyServer)

#### 5.2 Assessment
**No changes needed** because:
- ✅ It's method-agnostic - handles any API request
- ✅ `switchCommunity` will flow through existing `makeApiRequest` infrastructure  
- ✅ Message routing is based on request/response correlation, not method names

### **Phase 6: End-to-End Testing** (1 day)

#### 6.1 Link Local Libraries
```bash
cd /Users/florian/Git/curia/host-service
yarn link @curia_/cg-plugin-lib
yarn link @curia_/cg-plugin-lib-host

# Rebuild embed script with new library
yarn build:embed
```

#### 6.2 Test Scenarios
1. **Basic switching**: `cglib.switchCommunity('community-abc')`
2. **With options**: `cglib.switchCommunity('community-xyz', { boardId: 123 })`
3. **Error handling**: Switch to non-existent/unauthorized community
4. **Backward compatibility**: Ensure existing API methods still work

#### 6.3 Verify Multi-Iframe Behavior
- Existing iframe hidden, new iframe shown
- API proxy routing updated correctly
- Sidebar active state updated
- State preservation works

## **Total Timeline: 5-6 days**

**Day 1-2**: Update cg-plugin-lib with new function and types
**Day 3**: Update cg-plugin-lib-host validation  
**Day 4**: Update host service MessageRouter and InternalPluginHost
**Day 5**: Testing and debugging
**Day 6**: Documentation and edge case handling

## **Version Management**
- Bump @curia_/cg-plugin-lib to v1.0.7
- Bump @curia_/cg-plugin-lib-host to v1.0.2  
- Update host-service package.json dependencies

## Success Criteria ✅

### **Functional Requirements**
- ✅ Forum app can call `cglib.switchCommunity(communityId, options)`
- ✅ Function returns Promise with success/error information
- ✅ Supports deep linking (boardId, postId parameters)
- ✅ Error handling for unauthorized communities
- ✅ State preservation during switches

### **Technical Requirements**
- ✅ Uses existing PostMessage infrastructure (`makeApiRequest`)
- ✅ Integrates with existing multi-iframe logic (`switchToCommunity`) 
- ✅ No breaking changes to existing API methods
- ✅ Proper request signing via cg-plugin-lib-host
- ✅ Method-agnostic iframe-api-proxy continues to work

### **User Experience Requirements** 
- ✅ Instant switching (no loading screens)
- ✅ Graceful error states with meaningful messages
- ✅ Optional transition animations
- ✅ Scroll position preservation option

## Implementation Readiness Assessment

### **What's Already Built** ✅
- ✅ **Multi-iframe switching logic** (`InternalPluginHost.switchToCommunity()`)
- ✅ **Community sidebar and UI** (fully functional)
- ✅ **PostMessage infrastructure** (`makeApiRequest`, MessageRouter)
- ✅ **Authentication and validation** (user community access)
- ✅ **Database schema** (user_communities table)

### **What Needs Building** 📝
- 📝 **New API method** in cg-plugin-lib (`switchCommunity`)
- 📝 **Message handler** in MessageRouter (`handleCommunitySwitchRequest`)  
- 📝 **Response types** and validation
- 📝 **Integration wiring** between components

### **Risk Assessment: LOW** ✅
- ✅ **Follows existing patterns** - Same as getUserInfo, getCommunityInfo
- ✅ **No architectural changes** - Uses existing message routing
- ✅ **Backward compatible** - No impact on existing functionality
- ✅ **Battle-tested foundation** - Multi-iframe logic already works

**🚀 Ready for implementation - comprehensive plan complete!** 