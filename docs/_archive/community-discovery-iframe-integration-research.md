# Community Discovery Iframe Integration Research

**Status**: Research Phase  
**Priority**: High - Plus Button Implementation  
**Created**: 2025-01-23  

## Executive Summary

Research into integrating a community discovery iframe with our existing multi-iframe community switching infrastructure. The goal is to reuse the vanilla embed app's community selection UI when users click the plus button in the community sidebar.

## Current System Analysis

### **Existing PostMessage Infrastructure** ✅

Our current auth completion flow:

```typescript
// 1. Embed app sends completion message
const message = {
  type: 'curia-auth-complete',
  mode: config.mode || 'full',
  userId,
  communityId,
  sessionToken,
  identityType,
  externalParams,
  parentUrl,
  timestamp: new Date().toISOString()
};
window.parent.postMessage(message, '*');

// 2. MessageRouter receives and routes
private async handleMessage(event: MessageEvent): Promise<void> {
  if (event.data.type === 'curia-auth-complete') {
    if (this.callbacks.onAuthComplete) {
      await this.callbacks.onAuthComplete(event.data);
    }
    return;
  }
}

// 3. InternalPluginHost handles via onMessageAuthComplete
private async onMessageAuthComplete(authData: any): Promise<void> {
  await this.authService.handleAuthCompletion(authData);
  // → Triggers community navigation and forum switch
}
```

### **Existing Multi-Iframe Infrastructure** ✅

We already have robust community switching:

```typescript
// Community iframe management
private communityIframes: Map<string, HTMLIFrameElement> = new Map();
private activeCommunityId: string | null = null;

// Community switching method
private async switchToCommunity(communityId: string): Promise<void> {
  // 1. Get or create iframe for target community
  // 2. Show target iframe, hide others  
  // 3. Update API proxy routing
  // 4. Update auth context
  // 5. Start polling for community join detection
}
```

## Proposed Integration Strategy

### **1. Community Discovery Flow**

```
User clicks plus button in sidebar
    ↓ Create discovery iframe: /embed (vanilla, no special mode)
    ↓ Embed detects existing session → skip auth steps
    ↓ Jump straight to CommunitySelectionStep  
    ↓ User browses communities with search/filters
    ↓ User selects community → embed sends curia-auth-complete
    ↓ Parent distinguishes discovery vs normal auth
    ↓ Close discovery iframe + call switchToCommunity(selectedId)
    ↓ Community polling detects join + updates sidebar
```

### **2. Community Discovery Mode Implementation** ✅

**Solution**: New `community-discovery` mode with dedicated message type for clean separation.

#### **Discovery Mode Configuration**
```typescript
// In plus button click handler
const discoveryUrl = new URL(`${this.hostServiceUrl}/embed`);
discoveryUrl.searchParams.set('mode', 'community-discovery'); // NEW MODE
discoveryUrl.searchParams.set('theme', this.config.theme || 'light');
if (this.config.backgroundColor) {
  discoveryUrl.searchParams.set('background_color', this.config.backgroundColor);
}
```

#### **Embed App Mode Handling**
```typescript
// In embed app - add to existing mode checks
const config: EmbedConfig = {
  mode: (searchParams.get('mode') as 'full' | 'auth-only' | 'secure-auth' | 'community-discovery') || 'full',
  // ... other config
};

// Add to handleCommunitySelected callback
if (config.mode === 'community-discovery') {
  console.log('[Embed] Community discovery mode - sending discovery completion message');
  this.sendCommunityDiscoveryMessage(userId, communityId, sessionToken, profileData?.type);
  setCurrentStep('auth-complete');
  return;
}
```

#### **New Discovery Message Type**
```typescript
// New method in embed app
const sendCommunityDiscoveryMessage = useCallback((userId: string, communityId: string, sessionToken?: string, identityType?: string) => {
  const message = {
    type: 'curia-community-discovery-complete', // DEDICATED MESSAGE TYPE
    userId,
    communityId,
    sessionToken,
    identityType,
    timestamp: new Date().toISOString()
  };
  
  window.parent.postMessage(message, '*');
}, []);
```

### **3. Discovery Iframe Lifecycle Management**

#### **Iframe Creation & Positioning**
```typescript
// In CommunitySidebar plus button click handler
private createDiscoveryIframe(): HTMLIFrameElement {
  const discoveryUrl = new URL(`${this.hostServiceUrl}/embed`);
  discoveryUrl.searchParams.set('theme', this.config.theme || 'light');
  
  const iframe = document.createElement('iframe');
  iframe.src = discoveryUrl.toString();
  iframe.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 700px;
    border: none;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    z-index: 999999;
    background: white;
  `;
  
  // Add overlay background
  const overlay = this.createOverlay();
  document.body.appendChild(overlay);
  document.body.appendChild(iframe);
  
  return iframe; 
}
```

#### **Overlay & Modal Behavior** ✅
```typescript
private createOverlay(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 999998;
    backdrop-filter: blur(4px);
  `;
  
  // Close on overlay click (user can dismiss discovery modal)
  overlay.addEventListener('click', () => {
    this.closeDiscoveryIframe();
  });
  
  return overlay;
}

private setupModalCloseHandlers(iframe: HTMLIFrameElement, overlay: HTMLElement): void {
  // ESC key to close modal
  const escapeHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.closeDiscoveryIframe();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
  
  // Close button in iframe (optional)
  // The discovery iframe could also send a 'close-discovery' message
}

private closeDiscoveryIframe(): void {
  // Remove modal and overlay from DOM
  const existingIframe = document.querySelector('[data-discovery-iframe]');
  const existingOverlay = document.querySelector('[data-discovery-overlay]');
  
  if (existingIframe) existingIframe.remove();
  if (existingOverlay) existingOverlay.remove();
  
  console.log('[CommunitySidebar] Discovery modal closed');
}
```

### **4. Enhanced Message Handling**

#### **New Message Handler in MessageRouter**
```typescript
// Add to handleMessage method
if (event.data.type === 'curia-community-discovery-complete') {
  if (this.callbacks.onCommunityDiscoveryComplete) {
    await this.callbacks.onCommunityDiscoveryComplete(event.data);
  }
  return;
}
```

#### **New Callback Interface**
```typescript
export interface MessageRouterCallbacks {
  onAuthComplete?: (authData: any) => Promise<void>;
  onForumInit?: () => void;
  getAuthContext?: () => InternalAuthContext | null;
  onCommunitySwitchRequest?: (communityId: string, options?: any) => Promise<any>;
  onCommunityDiscoveryComplete?: (discoveryData: any) => Promise<void>; // NEW
}
```

#### **Discovery Handler in InternalPluginHost**
```typescript
private async handleCommunityDiscoveryComplete(discoveryData: any): Promise<void> {
  console.log('[InternalPluginHost] Community discovery completed:', discoveryData);
  
  const { communityId } = discoveryData;
  
  try {
    // 1. Close discovery iframe and overlay
    this.closeDiscoveryIframe();
    
    // 2. Switch to selected community using existing infrastructure
    await this.switchToCommunity(communityId);
    
    console.log('[InternalPluginHost] Discovery-driven community switch completed');
  } catch (error) {
    console.error('[InternalPluginHost] Discovery community switch failed:', error);
  }
}
```

## Integration Points & Modifications Required

### **1. CommunitySidebar Plus Button** 
- **File**: `src/lib/embed/components/sidebar/CommunitySidebar.ts`
- **Change**: Replace placeholder click handler with discovery iframe creation

### **2. MessageRouter Enhancement**
- **File**: `src/lib/embed/services/messaging/MessageRouter.ts`  
- **Change**: Add `curia-community-discovery-complete` message handling

### **3. InternalPluginHost Discovery Handler**
- **File**: `src/lib/embed/plugin-host/InternalPluginHost.ts`
- **Change**: Add discovery completion handler and iframe lifecycle management

### **4. Embed App Message Enhancement** 
- **File**: `src/app/embed/page.tsx`
- **Change**: Send new message type for community discovery completion

## Complete Step-by-Step Implementation Roadmap

### **Phase 1: Embed App Discovery Mode** (0.5 days)
**Goal**: Add `community-discovery` mode to embed app

#### **Step 1.1: Add Discovery Mode to EmbedConfig Type**
**File**: `src/types/embed.ts`
```typescript
export type EmbedMode = 'full' | 'auth-only' | 'secure-auth' | 'community-discovery';
```

#### **Step 1.2: Update Embed Config Parsing**
**File**: `src/app/embed/page.tsx`
```typescript
const config: EmbedConfig = {
  mode: (searchParams.get('mode') as EmbedMode) || 'full',
  // ... existing config
};
```

#### **Step 1.3: Add Discovery Message Handler**
**File**: `src/app/embed/page.tsx`
```typescript
// Add new callback function
const sendCommunityDiscoveryMessage = useCallback((userId: string, communityId: string, sessionToken?: string, identityType?: string) => {
  const message = {
    type: 'curia-community-discovery-complete',
    userId,
    communityId,
    sessionToken,
    identityType,
    timestamp: new Date().toISOString()
  };
  
  window.parent.postMessage(message, '*');
}, []);

// Update handleCommunitySelected callback
if (config.mode === 'community-discovery') {
  console.log('[Embed] Community discovery mode - sending discovery completion message');
  sendCommunityDiscoveryMessage(userId, communityId, sessionToken, profileData?.type);
  setCurrentStep('auth-complete');
  return;
}
```

#### **Step 1.4: Test Discovery Mode**
- Load `/embed?mode=community-discovery` manually
- Verify it skips to community selection (if session exists)
- Verify discovery message is sent on community selection
- **Expected**: Console log showing discovery completion message

---

### **Phase 2: Message Routing Infrastructure** (0.5 days)  
**Goal**: Handle discovery completion messages in host service

#### **Step 2.1: Add Discovery Callback to MessageRouter**
**File**: `src/lib/embed/services/messaging/MessageRouter.ts`
```typescript
export interface MessageRouterCallbacks {
  // ... existing callbacks
  onCommunityDiscoveryComplete?: (discoveryData: any) => Promise<void>;
}

// Add to handleMessage method
if (event.data.type === 'curia-community-discovery-complete') {
  if (this.callbacks.onCommunityDiscoveryComplete) {
    await this.callbacks.onCommunityDiscoveryComplete(event.data);
  }
  return;
}
```

#### **Step 2.2: Add Discovery Handler to InternalPluginHost**
**File**: `src/lib/embed/plugin-host/InternalPluginHost.ts`
```typescript
// Add to MessageRouter initialization
this.messageRouter = new MessageRouter(
  this.iframeManager.getUid(),
  this.apiProxy,
  {
    // ... existing callbacks
    onCommunityDiscoveryComplete: this.handleCommunityDiscoveryComplete.bind(this)
  }
);

// Add discovery handler method
private async handleCommunityDiscoveryComplete(discoveryData: any): Promise<void> {
  console.log('[InternalPluginHost] Community discovery completed:', discoveryData);
  
  const { communityId } = discoveryData;
  
  try {
    // 1. Close discovery modal
    this.closeDiscoveryModal();
    
    // 2. Switch to selected community
    await this.switchToCommunity(communityId);
    
    console.log('[InternalPluginHost] Discovery-to-community switch completed');
  } catch (error) {
    console.error('[InternalPluginHost] Discovery community switch failed:', error);
  }
}
```

#### **Step 2.3: Test Message Flow**
- Open browser console
- Manually send discovery message via `window.postMessage`
- Verify message reaches InternalPluginHost handler
- **Expected**: Console log showing discovery message received

---

### **Phase 3: Discovery Modal Implementation** (1 day)
**Goal**: Create modal iframe system for community discovery

#### **Step 3.1: Add Modal State to InternalPluginHost**
**File**: `src/lib/embed/plugin-host/InternalPluginHost.ts`
```typescript
// Add to class properties
private discoveryModal: {
  iframe: HTMLIFrameElement | null;
  overlay: HTMLElement | null;
} = { iframe: null, overlay: null };
```

#### **Step 3.2: Implement Modal Creation Methods**
**File**: `src/lib/embed/plugin-host/InternalPluginHost.ts`
```typescript
private createDiscoveryModal(): void {
  // Prevent multiple modals
  if (this.discoveryModal.iframe) {
    console.log('[InternalPluginHost] Discovery modal already exists');
    return;
  }

  // Create overlay
  const overlay = document.createElement('div');
  overlay.setAttribute('data-discovery-overlay', 'true');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 999998;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  // Create discovery iframe
  const discoveryUrl = new URL(`${this.hostServiceUrl}/embed`);
  discoveryUrl.searchParams.set('mode', 'community-discovery');
  discoveryUrl.searchParams.set('theme', this.config.theme || 'light');
  if (this.config.backgroundColor) {
    discoveryUrl.searchParams.set('background_color', this.config.backgroundColor);
  }

  const iframe = document.createElement('iframe');
  iframe.setAttribute('data-discovery-iframe', 'true');
  iframe.src = discoveryUrl.toString();
  iframe.style.cssText = `
    width: min(600px, 90vw);
    height: min(700px, 90vh);
    border: none;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    background: white;
  `;
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');

  // Setup close handlers
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) { // Only close on overlay click, not iframe click
      this.closeDiscoveryModal();
    }
  });

  const escapeHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.closeDiscoveryModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);

  // Add to DOM
  overlay.appendChild(iframe);
  document.body.appendChild(overlay);

  // Store references
  this.discoveryModal.iframe = iframe;
  this.discoveryModal.overlay = overlay;

  console.log('[InternalPluginHost] Discovery modal created');
}

private closeDiscoveryModal(): void {
  if (this.discoveryModal.overlay) {
    this.discoveryModal.overlay.remove();
  }
  
  this.discoveryModal.iframe = null;
  this.discoveryModal.overlay = null;
  
  console.log('[InternalPluginHost] Discovery modal closed');
}
```

#### **Step 3.3: Test Modal Creation**
- Add temporary button to test modal creation
- Verify modal appears with proper styling
- Test overlay click and ESC key closing
- **Expected**: Modal iframe loads discovery mode successfully

---

### **Phase 4: Plus Button Integration** (0.5 days)
**Goal**: Wire plus button to open discovery modal

#### **Step 4.1: Pass Modal Creation Function to CommunitySidebar**
**File**: `src/lib/embed/plugin-host/InternalPluginHost.ts`
```typescript
// Update CommunitySidebar creation
this.communitySidebar = new CommunitySidebar({
  // ... existing options
  onDiscoveryRequest: () => this.createDiscoveryModal()
});
```

#### **Step 4.2: Add Discovery Callback to CommunitySidebar**
**File**: `src/lib/embed/components/sidebar/CommunitySidebar.ts`
```typescript
export interface CommunitySidebarOptions {
  // ... existing options
  onDiscoveryRequest?: () => void;
}

// Update plus icon click handler
plusIcon.addEventListener('click', () => {
  console.log('[CommunitySidebar] Plus icon clicked - opening community discovery');
  if (this.options.onDiscoveryRequest) {
    this.options.onDiscoveryRequest();
  }
});
```

#### **Step 4.3: Test Complete Flow**
- Click plus button in sidebar
- Verify discovery modal opens
- Select a community in modal
- Verify modal closes and community switch occurs
- Verify sidebar updates with new community
- **Expected**: Complete end-to-end discovery flow works

---

### **Phase 5: Polish & Error Handling** (0.5 days)
**Goal**: Add loading states, error handling, and responsive behavior

#### **Step 5.1: Add Loading State to Modal**
**File**: `src/lib/embed/plugin-host/InternalPluginHost.ts`
```typescript
// Add loading indicator while iframe loads
const loadingIndicator = document.createElement('div');
loadingIndicator.style.cssText = `
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-family: system-ui, sans-serif;
`;
loadingIndicator.textContent = 'Loading communities...';
overlay.appendChild(loadingIndicator);

// Remove loading when iframe loads
iframe.addEventListener('load', () => {
  loadingIndicator.remove();
});
```

#### **Step 5.2: Add Error Handling**
```typescript
// Handle iframe load errors
iframe.addEventListener('error', () => {
  console.error('[InternalPluginHost] Discovery iframe failed to load');
  this.closeDiscoveryModal();
  // Could show error toast here
});

// Add timeout for discovery completion
const discoveryTimeout = setTimeout(() => {
  console.warn('[InternalPluginHost] Discovery modal timeout - closing');
  this.closeDiscoveryModal();
}, 60000); // 1 minute timeout
```

#### **Step 5.3: Add Mobile Responsive Behavior**
```typescript
// Update iframe styling for mobile
iframe.style.cssText = `
  width: min(600px, 95vw);
  height: min(700px, 95vh);
  border: none;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  background: white;
  
  @media (max-width: 768px) {
    width: 95vw;
    height: 90vh;
    border-radius: 8px;
  }
`;
```

#### **Step 5.4: Final Testing**
- Test on desktop and mobile
- Test error scenarios (network issues, etc.)
- Test keyboard navigation and accessibility
- Verify no memory leaks from modal creation/destruction
- **Expected**: Robust, polished community discovery experience

---

## **Implementation Success Criteria**

### **Phase 1 Complete**: ✅ Discovery mode works in embed app
### **Phase 2 Complete**: ✅ Discovery messages reach host service  
### **Phase 3 Complete**: ✅ Modal iframe creation/destruction works
### **Phase 4 Complete**: ✅ Plus button opens discovery modal
### **Phase 5 Complete**: ✅ Polished UX with error handling

## **Total Implementation Time**: ~2.5 days

This roadmap provides clear, testable milestones for implementing the complete community discovery feature using your existing multi-iframe infrastructure.

## Key Questions & Concerns

### **🤔 Main Technical Questions**

1. **Iframe Positioning Strategy**: 
   - Fixed modal overlay vs sidebar replacement?
   - How to handle mobile responsive behavior?

2. **Session Context Passing**:
   - Does discovery iframe automatically inherit session context?
   - Any special parameters needed for discovery flow?

3. **Error Handling**:
   - What if discovery iframe fails to load?
   - How to handle community selection errors gracefully?

4. **Performance Considerations**:
   - Should we pre-load discovery iframe or create on-demand?
   - Memory cleanup when discovery iframe is destroyed?

### **🎯 Architecture Validation**

1. **Reusability**: ✅ Vanilla embed reuse is clean and maintainable
2. **Message Flow**: ✅ Existing postMessage infrastructure is robust  
3. **Community Switching**: ✅ Existing switchToCommunity handles all edge cases
4. **Session Management**: ✅ Automatic session detection works perfectly

### **⚠️ Potential Risks**

1. **Z-Index Conflicts**: Discovery modal might conflict with customer page elements
2. **CSP Restrictions**: Some customer sites might block iframe creation  
3. **Mobile UX**: Fixed modal might not work well on small screens
4. **Session Edge Cases**: Race conditions between discovery and main app

## Recommended Next Steps

### **Immediate Actions**

1. **✅ Validate Message Flow**: Test that discovery completion messages work
2. **✅ Prototype Modal Iframe**: Build basic discovery iframe creation/destruction  
3. **✅ Wire Plus Button**: Connect plus button to discovery flow
4. **✅ End-to-End Test**: Verify complete discovery → community switch flow

### **Follow-up Improvements**

1. **Enhanced UX**: Loading states, animations, error messages
2. **Mobile Optimization**: Responsive modal behavior
3. **Accessibility**: Keyboard navigation, screen reader support  
4. **Performance**: Iframe pre-loading and memory optimization

## Success Criteria

### **Functional Requirements** ✅
- ✅ Plus button opens beautiful community discovery UI
- ✅ User can search/filter available communities  
- ✅ Community selection triggers seamless switching
- ✅ Discovery modal closes after selection
- ✅ Sidebar updates with new community membership

### **Technical Requirements** ✅  
- ✅ Reuses existing embed app (no duplication)
- ✅ Integrates with multi-iframe switching infrastructure
- ✅ Handles all edge cases (permissions, partnerships, etc.)
- ✅ Clean message passing with proper disambiguation
- ✅ No memory leaks from iframe lifecycle management

### **User Experience Requirements** ✅
- ✅ Seamless modal appearance/disappearance  
- ✅ Consistent theming with parent application
- ✅ Responsive behavior across devices
- ✅ Clear loading and error states
- ✅ Intuitive close behavior (overlay click, ESC key)

---

**This approach leverages our existing robust infrastructure while providing a premium community discovery experience with minimal code duplication.** 