# Community Sidebar Implementation Roadmap

## 🎯 **Project Overview**

Implement a responsive community navigation system that provides:
- **Desktop**: Fixed 80×600px Discord-style vertical sidebar
- **Mobile**: Bottom navigation bar with slide-up community picker modal
- **Core functionality**: Community switching with click handlers and iframe URL updates

---

## 📐 **Design Specifications**

### **Desktop Layout (≥768px)**
```
┌─────┬─────────────────────────────────────┐
│ C1  │                                     │
│ C2* │         Forum Iframe                │
│ C3  │         Content                     │
│ ... │                                     │
│     │                                     │
│ ──  │                                     │
│ 👤  │                                     │
└─────┴─────────────────────────────────────┘
```
- **Sidebar**: 80px width × 600px height (fixed, never resize)
- **Community Icons**: 48×48px (fixed size, scrollable list)
- **Profile**: Fixed at bottom with account switcher

### **Mobile Layout (<768px)**
```
┌─────────────────────────────────────────┐
│                                         │
│         Forum Iframe Content           │
│                                         │
├─────────────────────────────────────────┤
│ [C2*] Community    [👤]     [≡ Menu]   │
└─────────────────────────────────────────┘
```
- **Bottom Nav**: 60px height, full width
- **Current Community**: Icon + name (left)
- **Profile Avatar**: Center
- **Menu Button**: Right (opens community picker)

### **Mobile Community Picker Modal**
```
┌─────────────────────────────────────────┐
│           Darkened Background           │
│  ┌─────────────────────────────────────┐│
│  │        Choose Community             ││
│  │                                     ││
│  │    ○  ○  ○  ○  ○                   ││
│  │    ○  ○  ○  ○                     ││
│  │                                     ││
│  │              [Close]                ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```
- **Slide-up animation** from bottom
- **Grid layout** for community icons (56×56px touch-friendly)
- **Backdrop dismiss** functionality

---

## 🚀 **Implementation Roadmap**

### **Phase 1: Fix Desktop Sizing Issues** (Priority: Critical)

#### **Step 1.1: Remove Flexible Sizing from Navigation Container**
**File**: `src/lib/embed/plugin-host/InternalPluginHost.ts`

**Current Problem**:
```typescript
// Lines ~79-85: Current flexible styling
nav.style.cssText = `
  width: 80px;
  // Missing fixed height constraints
`;
```

**Fix**:
```typescript
nav.style.cssText = `
  width: 80px;
  height: 600px;           /* NEW: Fixed height */
  min-height: 600px;       /* NEW: Prevent shrinking */
  max-height: 600px;       /* NEW: Prevent growing */
  flex-shrink: 0;          /* NEW: Don't shrink in parent flex */
  flex-grow: 0;            /* NEW: Don't grow */
  /* ... existing styling ... */
`;
```

#### **Step 1.2: Fix Community List Container Flexbox**
**File**: Same file, lines ~411-420

**Current Problem**:
```css
.community-list-container {
  flex: 1;                 /* PROBLEM: Causes shrinking */
  overflow-y: auto;
}
```

**Fix**:
```css
.community-list-container {
  flex: none;              /* Remove all flex behavior */
  height: 480px;           /* Fixed height (600px - profile - padding) */
  min-height: 480px;       /* Prevent shrinking */
  max-height: 480px;       /* Prevent growing */
  overflow-y: auto;        /* Keep scrolling */
  /* ... existing styling ... */
}
```

#### **Step 1.3: Fix Profile Section Height**
**File**: Same file, lines ~440-448

**Fix**:
```css
.user-profile-section {
  flex-shrink: 0;          /* Keep existing */
  height: 88px;            /* Fixed height */
  min-height: 88px;        /* Prevent shrinking */
  /* ... existing styling ... */
}
```

**Testing**: Resize browser window → community icons should stay 48×48px

---

### **Phase 2: Responsive Design Implementation** (Priority: High)

#### **Step 2.1: Add CSS Media Queries**
**File**: `src/lib/embed/plugin-host/InternalPluginHost.ts` - Global styles section

**Add Responsive CSS**:
```css
/* Desktop: Fixed sidebar */
@media (min-width: 768px) {
  .curia-community-nav {
    display: flex;
    flex-direction: column;
    position: relative;
  }
  
  .mobile-bottom-nav { display: none; }
  .mobile-community-modal { display: none; }
}

/* Mobile: Bottom nav */
@media (max-width: 767px) {
  .curia-community-nav { display: none; }
  
  .mobile-bottom-nav {
    display: flex;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: var(--sidebar-bg-from);
    border-top: 1px solid var(--sidebar-border);
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    z-index: 1000;
  }
  
  .curia-iframe-container {
    padding-bottom: 60px; /* Account for bottom nav */
  }
}
```

#### **Step 2.2: Create Mobile Bottom Nav Component**
**File**: Same file, add new method to `CommunityNavigationUI`

```typescript
private renderMobileBottomNav(): HTMLElement {
  const bottomNav = document.createElement('div');
  bottomNav.className = 'mobile-bottom-nav';
  
  // Current community display
  const currentCommunity = this.communities.find(c => c.id === this.currentCommunityId);
  const currentCommunityEl = document.createElement('div');
  currentCommunityEl.className = 'mobile-current-community';
  currentCommunityEl.innerHTML = `
    <div class="mobile-community-icon">${this.getCommunityIcon(currentCommunity)}</div>
    <span class="mobile-community-name">${currentCommunity?.name || 'Select Community'}</span>
  `;
  
  // Profile avatar
  const profileEl = this.renderMobileProfileAvatar();
  
  // Menu trigger button
  const menuTrigger = document.createElement('button');
  menuTrigger.className = 'mobile-menu-trigger';
  menuTrigger.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
  `;
  
  // Add click handler for menu
  menuTrigger.addEventListener('click', () => {
    this.showMobileCommunityModal();
  });
  
  bottomNav.appendChild(currentCommunityEl);
  bottomNav.appendChild(profileEl);
  bottomNav.appendChild(menuTrigger);
  
  return bottomNav;
}
```

#### **Step 2.3: Create Mobile Community Picker Modal**
**File**: Same file, add modal creation method

```typescript
private showMobileCommunityModal(): void {
  const modal = this.createMobileCommunityModal();
  document.body.appendChild(modal);
  
  // Trigger slide-up animation
  requestAnimationFrame(() => {
    modal.classList.add('show');
  });
}

private createMobileCommunityModal(): HTMLElement {
  const modal = document.createElement('div');
  modal.className = 'mobile-community-modal';
  
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>Choose Community</h3>
        <button class="modal-close">×</button>
      </div>
      <div class="modal-grid">
        ${this.communities.map(community => `
          <div class="modal-community-item ${community.id === this.currentCommunityId ? 'active' : ''}" 
               data-community-id="${community.id}">
            <div class="modal-community-icon">${this.getCommunityIcon(community)}</div>
            <span class="modal-community-name">${community.name}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // Add event listeners
  this.attachModalEventListeners(modal);
  
  return modal;
}
```

#### **Step 2.4: Add Mobile Modal Styling**
**File**: Same file, add to global styles

```css
/* Mobile modal styles */
.mobile-community-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999999;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-community-modal.show {
  transform: translateY(0);
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 70vh;
  background: var(--preview-bg);
  border-radius: 20px 20px 0 0;
  padding: 20px;
}

.modal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 16px;
  max-height: 50vh;
  overflow-y: auto;
  margin-top: 20px;
}

.modal-community-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-community-item:hover {
  background: var(--item-hover-bg);
  transform: translateY(-2px);
}

.modal-community-item.active {
  background: var(--item-active-bg);
  border: 2px solid var(--item-active-border);
}

.modal-community-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

### **Phase 3: Responsive Layout Integration** (Priority: High)

#### **Step 3.1: Update Main Render Method**
**File**: Same file, modify `CommunityNavigationUI.render()`

```typescript
render(): HTMLElement {
  // Check screen size to determine layout
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    return this.renderMobileBottomNav();
  } else {
    return this.renderDesktopSidebar();
  }
}

private renderDesktopSidebar(): HTMLElement {
  // Current desktop sidebar logic (existing code)
  // ... all existing nav.style.cssText and community list code
}
```

#### **Step 3.2: Update Container Layout for Mobile**
**File**: Same file, modify `setupContainerLayout()` in `InternalPluginHost`

```typescript
private setupContainerLayout(): void {
  if (this.communityNavigation) {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      this.setupMobileLayout();
    } else {
      this.setupDesktopLayout();
    }
  }
}

private setupMobileLayout(): void {
  // Create embed container without sidebar
  this.embedContainer = document.createElement('div');
  this.embedContainer.className = 'curia-embed-container mobile';
  this.embedContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    width: ${this.config.width || '100%'};
    height: ${this.config.height || '700px'};
    position: relative;
  `;
  
  // Add iframe container
  const iframeContainer = document.createElement('div');
  iframeContainer.className = 'curia-iframe-container';
  iframeContainer.style.cssText = `
    flex: 1;
    position: relative;
    padding-bottom: 60px; /* Space for bottom nav */
  `;
  
  // Add mobile bottom nav to iframe container
  const mobileNav = this.communityNavigation.render();
  iframeContainer.appendChild(mobileNav);
  
  this.embedContainer.appendChild(iframeContainer);
  this.container.innerHTML = '';
  this.container.appendChild(this.embedContainer);
}

private setupDesktopLayout(): void {
  // Existing desktop layout code (sidebar + iframe)
  // ... current setupContainerLayout logic
}
```

#### **Step 3.3: Add Window Resize Handler**
**File**: Same file, add to `InternalPluginHost` constructor

```typescript
// In constructor, add resize listener
window.addEventListener('resize', () => {
  this.handleResize();
});

private handleResize(): void {
  if (this.communityNavigation && this.embedContainer) {
    const wasMobile = this.embedContainer.classList.contains('mobile');
    const isMobile = window.innerWidth < 768;
    
    if (wasMobile !== isMobile) {
      // Layout change needed - re-render
      this.setupContainerLayout();
      
      if (this.currentIframe) {
        // Re-append iframe to new container
        const iframeContainer = this.embedContainer.querySelector('.curia-iframe-container');
        iframeContainer?.appendChild(this.currentIframe);
      }
    }
  }
}
```

---

### **Phase 4: Testing & Polish** (Priority: Medium)

#### **Step 4.1: Manual Testing Checklist**

**Desktop Tests**:
- [ ] Sidebar stays 80×600px when resizing browser
- [ ] Community icons stay 48×48px when resizing
- [ ] Scrolling works with 10+ communities
- [ ] Profile menu works correctly
- [ ] Hover effects work on community icons

**Mobile Tests**:
- [ ] Bottom nav appears on screens <768px
- [ ] Current community displays correctly
- [ ] Menu button opens modal with slide-up animation
- [ ] Community grid shows all communities
- [ ] Profile avatar opens account switcher
- [ ] Backdrop dismiss works

**Responsive Tests**:
- [ ] Resize from desktop → mobile: layout switches
- [ ] Resize from mobile → desktop: layout switches
- [ ] No visual glitches during transitions
- [ ] Community state persists across layout changes

#### **Step 4.2: Error Handling & Edge Cases**

**Add Error States**:
- Loading states during community switches
- Network error handling
- Empty community list handling
- Invalid community ID handling

**Accessibility Improvements**:
- ARIA labels for buttons
- Keyboard navigation support
- Screen reader announcements
- Focus management in modal

#### **Step 4.3: Performance Optimization**

**Optimize Rendering**:
- Debounce resize events
- Virtual scrolling for 100+ communities
- Image loading optimization
- Memory cleanup on component destroy

---

### **Phase 5: Community Click Handlers & Switching Logic** (Priority: Final)

> **Note**: This phase implements the actual community switching functionality. The exact implementation will be determined based on the overall navigation system architecture.

#### **Step 5.1: Implement Missing Click Event Listeners**
**File**: `src/lib/embed/plugin-host/InternalPluginHost.ts` - `renderCommunityItem()` method

**Current Issue**: No click handlers on community items

**Add Click Handler**:
```typescript
// In renderCommunityItem(), after hover event listeners
item.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (community.id !== this.currentCommunityId) {
    this.handleCommunitySwitch(community.id);
  }
});
```

#### **Step 5.2: Implement Community Switch Logic**
**File**: Same file, add new method to `CommunityNavigationUI` class

```typescript
private async handleCommunitySwitch(targetCommunityId: string): Promise<void> {
  console.log('[CommunityNavigationUI] Switching to community:', targetCommunityId);
  
  try {
    // Update current community ID
    this.currentCommunityId = targetCommunityId;
    
    // Re-render navigation to show new active state
    this.refreshNavigation();
    
    // Notify parent (InternalPluginHost) about the switch
    if (this.onMenuAction) {
      this.onMenuAction(`community-switch:${targetCommunityId}`);
    }
    
  } catch (error) {
    console.error('[CommunityNavigationUI] Failed to switch community:', error);
  }
}
```

#### **Step 5.3: Handle Community Switch in InternalPluginHost**
**File**: Same file, update `handleMenuAction()` method

```typescript
private handleMenuAction(action: string): void {
  if (action.startsWith('community-switch:')) {
    const targetCommunityId = action.split(':')[1];
    this.switchToCommunity(targetCommunityId);
  } else {
    // ... existing switch cases
  }
}

private async switchToCommunity(communityId: string): Promise<void> {
  console.log('[InternalPluginHost] Switching iframe to community:', communityId);
  
  // Update auth context
  if (this.authContext) {
    this.authContext.communityId = communityId;
  }
  
  // Rebuild forum URL with new community context
  if (this.currentIframe) {
    const currentSrc = new URL(this.currentIframe.src);
    // Update community-related parameters if needed
    this.currentIframe.src = currentSrc.toString();
  }
}
```

**Testing**: Click different communities → iframe should switch content

---

## 📋 **Success Criteria**

### **Core Functionality** ✅
- [ ] Community icons never resize/squish regardless of window size
- [ ] Clicking community successfully switches iframe content
- [ ] Desktop: Fixed 80×600px sidebar with scrollable list
- [ ] Mobile: Bottom nav with slide-up community picker

### **Visual Polish** ✅
- [ ] Smooth animations (slide-up, hover effects)
- [ ] Consistent 48×48px community icons (56×56px in mobile modal)
- [ ] Proper active states and visual feedback
- [ ] Dark/light mode support maintained

### **User Experience** ✅
- [ ] Intuitive mobile touch interactions
- [ ] Fast community switching (<200ms)
- [ ] Responsive layout changes feel natural
- [ ] No layout shifts or visual glitches

### **Technical Quality** ✅
- [ ] Clean, maintainable code structure
- [ ] Proper TypeScript types
- [ ] Memory leak prevention
- [ ] Cross-browser compatibility (Chrome, Safari, Firefox)

---

## 🚀 **Deployment Strategy**

### **Staging Rollout**
1. **Internal testing** on development environment
2. **QA testing** with various screen sizes and devices  
3. **Limited beta** with select communities
4. **Full production** deployment

### **Rollback Plan**
- Feature flag to disable new sidebar
- Fallback to current implementation
- Database rollback not needed (UI-only changes)

### **Monitoring**
- Track community switching usage analytics
- Monitor for JavaScript errors
- Collect user feedback on mobile experience

---

## 📚 **Related Documentation**
- [Community Sidebar Architecture](./community-sidebar-architecture.md)
- [Current DB Schema](./current-db-schema.md)
- [CG Navigate System Research](./cg-navigate-system-research.md) 