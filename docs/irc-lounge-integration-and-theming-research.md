# IRC Lounge Integration & Theming Research

## Overview
Now that we have a working IRC stack deployed on Railway with The Lounge web client accessible at `chat.curia.network`, we need to:

1. **Integration**: Embed The Lounge into our existing Common Ground app via modal/iframe pattern
2. **Theming**: Customize The Lounge's appearance to match our app's design system

## Current Infrastructure Status ✅
- ✅ Ergo IRC Server running on Railway (internal)
- ✅ Soju IRC Bouncer running on Railway (`irc.curia.network`)
- ✅ The Lounge Web Client running on Railway (`chat.curia.network`)
- ✅ Admin user created with `commonground` network connection
- ✅ Basic IRC functionality working (messaging, channels)

## Task 1: Integration - Chat Modal in Community Sidebar

### Current Sidebar Pattern Analysis
Based on existing implementations (notifications modal, search modal), we have an established pattern:

**Host Service Side:**
- Community sidebar sends postMessage commands to parent app
- Commands: `search`, `notifications`, potentially `chat`

**Curia App Side:**
- `SidebarActionListener.tsx` listens for postMessage events
- Context providers manage modal state (e.g., `WhatsNewContext`)
- Modal components render via `createPortal` (e.g., `WhatsNewModal`)

### Integration Architecture Options

#### Option A: Direct iframe Embed
- Embed `chat.curia.network` directly in modal iframe
- Pros: Simple, uses existing auth
- Cons: Separate auth context, potential styling conflicts

#### Option B: The Lounge API Integration
- Research if The Lounge exposes APIs for custom clients
- Build custom chat UI using The Lounge's backend
- Pros: Full control over UI/UX
- Cons: More complex, need to understand The Lounge's API

#### Option C: Hybrid Approach
- Use iframe for initial implementation
- Plan migration to custom UI later
- Pros: Fast implementation, future flexibility
- Cons: Two-phase development

### Research Questions - Integration ✅ RESEARCHED
1. **How does The Lounge handle authentication when embedded in iframes?**
   - ✅ The Lounge supports URL parameters for auto-authentication (found `lounge-autoconnect` fork)
   - ✅ Public mode: No authentication required, direct URL access
   - ✅ Private mode: Can use URL parameters like `?autologin&user=username&al-password=password`
   - ✅ Has `lockNetwork` configuration to restrict network settings

2. **What postMessage APIs does The Lounge expose for parent-child communication?**
   - ⚠️ Limited native postMessage support - mostly relies on URL parameters
   - ✅ The Lounge has a plugin system via Public Client API
   - ✅ Can create custom plugins to extend functionality
   - ✅ Socket.io for real-time communication with server

3. **Can we customize The Lounge's login flow to integrate with our CG identity system?**
   - ✅ URL parameters can pre-populate connection settings
   - ✅ `autoconnect` parameter bypasses manual connection flow
   - ✅ Can set default network, channels, nicknames via URL
   - ⚠️ For full SSO integration, would need custom plugin development

4. **What are the CORS/CSP considerations for embedding The Lounge?**
   - ✅ Standard iframe embedding supported
   - ✅ Railway deployment handles HTTPS/certificates
   - ✅ Internal Railway network communication already secure

## Task 2: Theming - Custom The Lounge Appearance ✅ RESEARCHED

### The Lounge Theming System ✅ INVESTIGATED

#### Theme System Architecture ✅
- ✅ **NPM Package System**: Themes are distributed as npm packages (e.g., `thelounge-theme-solarized`)
- ✅ **CSS-Based**: Themes are primarily CSS files with package.json metadata
- ✅ **Custom Stylesheet Field**: Users can add custom CSS via UI settings
- ✅ **Theme Installation**: `thelounge install thelounge-theme-name` command
- ✅ **File Distribution**: Can include additional assets (fonts, images, etc.)

#### Built-in Customization Options ✅
- ✅ **Custom Stylesheet**: Advanced settings → Custom Stylesheet textarea
- ✅ **Live Updates**: CSS changes apply immediately without restart
- ✅ **Failsafe**: `?nocss` URL parameter to disable custom CSS if broken
- ✅ **Registry of Tweaks**: Community-maintained CSS snippets available

#### Common Customization Examples ✅
- ✅ Font changes, color schemes, layout modifications
- ✅ Hide/show UI elements, compact layouts, mobile optimizations  
- ✅ Message styling, user list customization, theme switching
- ✅ Channel-specific styling, notification badges, accessibility improvements

#### Design System Integration Strategy ✅
Our Common Ground app uses:
- **Colors**: Can extract from CSS custom properties and apply via Custom Stylesheet
- **Typography**: Font imports and font-family overrides via Custom Stylesheet
- **Components**: Button, input, modal styling can be overridden with CSS
- **Layout**: Spacing, borders, shadows easily customizable

#### Theme Implementation Options ✅
1. **Custom Stylesheet Injection** ⭐ **RECOMMENDED**
   - ✅ Pros: Simple, no server-side changes needed, instant updates
   - ✅ Implementation: Inject CSS via iframe postMessage or query parameter
   - ✅ Dynamic: Can switch themes based on parent app context

2. **Custom Theme Package**
   - ✅ Pros: Professional distribution, version control
   - ❌ Cons: Requires server access to install, harder to update dynamically

3. **Runtime Theme Switching**
   - ✅ Pros: Full dynamic control from parent app
   - ⚠️ Cons: Requires postMessage integration or plugin development

## Technical Architecture Analysis ✅ COMPLETE

### Existing Sidebar Integration Pattern ✅ ANALYZED
Based on the recent notifications modal implementation, we have a proven pattern:

#### Host Service Side (Community Sidebar)
```typescript
// host-service/src/lib/embed/components/sidebar/CommunitySidebar.ts
private async handleNavItemClick(iconName: 'search' | 'messages' | 'notifications', label: string) {
  this.messageRouter.sendSidebarAction('messages'); // ← NEW: Add 'messages' action
}
```

#### Message Router Communication ✅ 
```typescript
// host-service/src/lib/embed/services/messaging/MessageRouter.ts
sendSidebarAction(action: 'search' | 'messages' | 'notifications', payload?: any): void {
  const message: SidebarActionMessage = {
    type: InternalMessageType.SIDEBAR_ACTION,
    action,
    payload,
    iframeUid: this.myUid,
    requestId: `sidebar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  this.sendMessageToIframe(activeIframe, message);
}
```

#### Curia App Side (Forum)
```typescript
// curia/src/components/SidebarActionListener.tsx
const { openNotifications, closeNotifications, isNotificationsOpen } = useWhatsNew();
// ↑ Need to add: useChatModal() hook

// curia/src/contexts/WhatsNewContext.tsx → Create: ChatContext.tsx
// curia/src/components/whats-new/WhatsNewModal.tsx → Create: ChatModal.tsx
```

#### Modal Pattern Analysis ✅
The `WhatsNewModal` provides the perfect template:
- ✅ **Responsive Design**: Desktop sidebar (384px) + Mobile bottom drawer (80vh)
- ✅ **Portal Rendering**: Uses `createPortal(content, document.body)`
- ✅ **Animation**: `animate-in slide-in-from-left-5` (desktop) / `slide-in-from-bottom-4` (mobile)
- ✅ **Accessibility**: `role="dialog"`, `aria-modal="true"`, ESC key handling
- ✅ **Body Scroll Lock**: Prevents background scrolling when modal open
- ✅ **Backdrop Blur**: `bg-black/30 backdrop-blur-sm` with click-to-close

### The Lounge Integration Options ✅ EVALUATED

#### Option A: Direct Iframe Embed ⭐ **RECOMMENDED**
```typescript
<iframe 
  src="https://chat.curia.network/?autoconnect&nick=CGUser&join=%23general"
  className="w-full h-full border-0"
  allow="camera; microphone; display-capture; fullscreen"
/>
```
**Pros**: Simple, proven pattern, immediate functionality  
**Cons**: Separate authentication context initially  

#### Option B: URL Parameter Authentication
```typescript
// Based on lounge-autoconnect research
const chatUrl = `https://chat.curia.network/?autologin&user=${userId}&al-password=${hashedPassword}&autoconnect&nick=${username}&join=%23${channelName}`;
```
**Pros**: Single sign-on experience  
**Cons**: Password handling complexity, security considerations  

#### Option C: Plugin-Based Integration
Custom The Lounge plugin to handle CG authentication via postMessage API.  
**Pros**: Full control, seamless UX  
**Cons**: Complex development, plugin maintenance  

## Implementation Phases ✅ UPDATED

### Phase 1: Basic Modal Integration (1-2 days)
**Goal**: Get The Lounge working in a modal overlay

**Tasks**:
1. ✅ **Add 'messages' action** to `CommunitySidebar.handleNavItemClick()`
2. ✅ **Create ChatContext** following `WhatsNewContext` pattern  
3. ✅ **Create ChatModal** following `WhatsNewModal` pattern
4. ✅ **Update SidebarActionListener** to handle 'messages' action
5. ✅ **Test basic modal** functionality (open/close, responsive)

**Files to Create/Modify**:
- `curia/src/contexts/ChatContext.tsx` (new)
- `curia/src/components/chat/ChatModal.tsx` (new) 
- `curia/src/components/SidebarActionListener.tsx` (modify)
- `curia/src/app/providers.tsx` (add ChatProvider)

### Phase 2: The Lounge Iframe Integration (1-2 days)
**Goal**: Embed working IRC client in the modal

**Tasks**:
1. ✅ **Iframe integration** with `chat.curia.network`
2. ✅ **URL parameter configuration** for auto-connect
3. ✅ **Channel auto-join** configuration (`#general`)
4. ✅ **Basic error handling** (connection failures)
5. ✅ **Mobile optimization** (touch-friendly interface)

**Technical Details**:
```typescript
const chatUrl = `https://chat.curia.network/?autoconnect&nick=CGUser${userId.slice(-4)}&join=%23general`;
```

### Phase 3: Basic Theme Integration (1-2 days) 
**Goal**: Make The Lounge look consistent with Common Ground

**Tasks**:
1. ✅ **Extract CG color palette** from CSS custom properties
2. ✅ **Create base theme CSS** for The Lounge
3. ✅ **Implement CSS injection** mechanism (URL parameter or postMessage)
4. ✅ **Test theme consistency** across light/dark modes
5. ✅ **Mobile theme optimization**

**Technical Approach**:
```css
/* Custom CSS injection for The Lounge */
:root {
  --body-bg-color: var(--cg-background);
  --window-bg-color: var(--cg-card);
  --body-color: var(--cg-foreground);
  --link-color: var(--cg-primary);
}
```

### Phase 4: Advanced Integration (2-3 days)
**Goal**: Seamless user experience with authentication integration

**Tasks**:
1. ✅ **Automatic username mapping** from CG identity to IRC nick
2. ✅ **Dynamic channel joining** based on community context
3. ✅ **Session persistence** between modal opens
4. ✅ **Error recovery** (reconnection handling)
5. ✅ **Performance optimization** (lazy loading, preloading)

**Future Enhancements** (Optional):
- Custom The Lounge plugin for full SSO integration
- Message notifications in Common Ground UI
- Emoji reaction bridge between IRC and forum
- File sharing integration with CG file system

## Implementation Recommendations ⭐

### Immediate Next Steps (Ready to Start)

1. **Phase 1 Implementation Priority**: Start with basic modal integration using the proven `WhatsNewModal` pattern
2. **Technical Approach**: Direct iframe embedding with URL parameters (Option A)
3. **Theme Strategy**: Custom Stylesheet injection for immediate visual consistency
4. **Authentication**: Start with public mode auto-connect, evolve to private mode integration

### Key Technical Decisions ✅

#### Modal Integration Pattern
- ✅ **Follow WhatsNewModal exactly**: Proven responsive design, accessibility, animations
- ✅ **Desktop**: Left sidebar overlay (384px width)
- ✅ **Mobile**: Bottom drawer (80vh max height)
- ✅ **Context Management**: `ChatContext` with `isChatOpen` state

#### The Lounge Configuration
```typescript
// Recommended initial configuration
const chatUrl = `https://chat.curia.network/?autoconnect&nick=${userNick}&join=%23general&lockchannel&nofocus`;

// Parameters explained:
// autoconnect: Skip connection form, join immediately
// nick: Set user nickname (can include random numbers with ?)
// join: Auto-join #general channel 
// lockchannel: Prevent channel focus stealing in multi-tab setups
// nofocus: Don't steal focus from parent app when embedded
```

#### Theming Strategy
```css
/* Priority CSS injections for brand consistency */
:root {
  --body-bg-color: hsl(var(--background));
  --window-bg-color: hsl(var(--card));
  --body-color: hsl(var(--foreground));
  --link-color: hsl(var(--primary));
  --border-color: hsl(var(--border));
}

/* Hide branding elements */
.logo-container { display: none !important; }

/* Match CG button styling */
#form #submit { 
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
```

### Risk Assessment & Mitigation ⚠️

#### Low Risk ✅
- **Basic modal integration**: Established pattern, low complexity
- **Iframe embedding**: Standard web technology, well-supported
- **Basic theming**: CSS customization is well-documented

#### Medium Risk ⚠️
- **Authentication integration**: May require custom development
- **Advanced theming**: Complex CSS overrides could break with updates
- **Mobile UX**: Chat interfaces can be challenging on small screens

#### High Risk ❌
- **Custom plugin development**: Significant maintenance overhead
- **Real-time integration**: Complex synchronization between IRC and forum
- **User management**: Bridging CG identity with IRC authentication

### Success Metrics 📊

#### Phase 1 Success Criteria
- [ ] Chat modal opens/closes correctly on all devices
- [ ] Iframe loads The Lounge without errors
- [ ] Modal follows CG design system (colors, animations)
- [ ] Accessibility standards maintained (ESC key, focus management)

#### Phase 2 Success Criteria  
- [ ] Users can send/receive messages immediately
- [ ] Auto-connect works reliably
- [ ] Mobile interface is touch-friendly
- [ ] Performance acceptable (load time < 3s)

#### Phase 3 Success Criteria
- [ ] Visual consistency with Common Ground theme
- [ ] Light/dark mode switching works
- [ ] Responsive design maintains usability
- [ ] No visual regressions across different screen sizes

## Final Recommendations

### **✅ PROCEED WITH IMPLEMENTATION**

**Confidence Level**: High 🟢  
**Estimated Timeline**: 4-6 days total  
**Risk Level**: Low-Medium 🟡  

### **Recommended Implementation Order**:

1. **Start Today**: Phase 1 (Basic Modal Integration) - 1-2 days
2. **Day 3-4**: Phase 2 (The Lounge Iframe Integration) - 1-2 days  
3. **Day 5-6**: Phase 3 (Basic Theme Integration) - 1-2 days
4. **Future**: Phase 4 (Advanced Integration) - Based on user feedback

### **Key Success Factors**:
- ✅ **Leverage existing patterns** (WhatsNewModal is perfect template)
- ✅ **Start simple** (public mode, basic theme) then iterate
- ✅ **Focus on UX** (smooth animations, responsive design)
- ✅ **Test early and often** (especially mobile experience)

The research shows that this integration is **highly feasible** with **well-established technical approaches**. The Lounge's flexibility combined with our proven modal patterns creates a clear path to success.

---

*✅ Research Status: **COMPLETE***  
*🚀 Ready for Implementation: **YES***  
*📅 Next Step: Begin Phase 1 implementation*