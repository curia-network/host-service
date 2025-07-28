# Embed Theme Switcher Research & Implementation Plan

**Status**: Research Complete - Ready for Implementation  
**Priority**: High  
**Created**: 2025-01-22  

## 🎯 Executive Summary

This document outlines the design and implementation plan for adding a **dark/light mode switcher** to the embed system's user profile menu. The solution provides independent theme management for embeds while respecting embed creator preferences and user overrides with multi-iframe coordination.

---

## 🔍 Current Theming Architecture Analysis

### **Data Attribute Flow**
```typescript
// 1. Embed Creator Sets Theme Preference
<script data-theme="light" src="/embed.js"></script>

// 2. parseEmbedConfig() reads data-theme
const config: EmbedConfig = {
  theme: (script.getAttribute('data-theme') as 'light' | 'dark' | 'auto') || 'light'
};

// 3. Theme flows to all iframe creation points
authUrl.searchParams.set('theme', config.theme || 'light');      // Auth iframe
forumUrl.searchParams.set('cg_theme', resolvedTheme);            // Forum iframes
```

### **Theme Resolution Logic**
**Current Resolution** (in `IframeManager.createForumIframe()`):
```typescript
// Theme resolution happens at iframe creation time
let resolvedTheme = config.theme || 'light';
if (resolvedTheme === 'auto') {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    resolvedTheme = 'dark';
  } else {
    resolvedTheme = 'light';
  }
  console.log('[IframeManager] Resolved auto theme to:', resolvedTheme);
}
```

**Current Theme Storage**:
- **Main App**: `localStorage.setItem('curia-theme', theme)` - Used by landing pages
- **Embed Pages**: `EmbedThemeProvider` applies theme from URL only (no persistence)
- **No Embed-Specific User Preferences** - Currently missing!

### **Multi-Iframe Theme Coordination**
**Current State**: All iframes use same theme from `this.config.theme`
```typescript
// All community iframes get same theme
forumUrl.searchParams.set('cg_theme', resolvedTheme);  // Same for all communities
this.communityIframes.set(communityId, iframe);       // No per-iframe theme tracking
```

**Critical Insight**: Theme changes require **iframe reload** - no dynamic switching possible.

### **User Profile Menu Infrastructure**
**Menu Action Flow**:
```typescript
// User clicks theme toggle in profile menu
UserProfileComponent.createUserProfileMenu() 
  → data-action="toggle-theme" 
  → menu.addEventListener('click') 
  → this.options.onMenuAction(action)
  → CommunitySidebar passes to InternalPluginHost
  → InternalPluginHost.handleMenuAction(action)
```

**Current Menu Actions**:
- `'settings'` - Placeholder
- `'switch-account'` - Account switching
- `'sign-out'` - User logout

---

## 🚨 User Experience Requirements Analysis

### **Theme Priority Logic** (as specified):
1. **User Preference Override** - If user has set theme preference → use that
2. **Embed Creator Default** - Otherwise use `data-theme` attribute  
3. **System Fallback** - Default to 'light' if nothing specified

### **Coherent UX Flow**:
```typescript
// Priority Resolution Logic
function resolveEmbedTheme(): 'light' | 'dark' | 'auto' {
  // 1. Check for user preference (highest priority)
  const userPreference = localStorage.getItem('curia-embed-theme');
  if (userPreference && ['light', 'dark', 'auto'].includes(userPreference)) {
    return userPreference as 'light' | 'dark' | 'auto';
  }
  
  // 2. Fall back to embed creator's preference
  const embedCreatorTheme = this.config.theme; // From data-theme attribute
  return embedCreatorTheme || 'light';
}
```

### **Independence from Main App**:
- **Separate Storage Key**: `'curia-embed-theme'` ≠ `'curia-theme'` 
- **No Conflicts**: Main landing page theme separate from embed theme
- **Embed-Specific**: User theme preference applies only to embed experiences

---

## 🛠 Implementation Plan

### **Phase 1: Theme Persistence & Resolution Enhancement**

#### **1.1 Add Embed-Specific Theme Storage**
```typescript
// New theme storage utilities in InternalPluginHost
private getStoredUserTheme(): 'light' | 'dark' | 'auto' | null {
  return localStorage.getItem('curia-embed-theme') as 'light' | 'dark' | 'auto' | null;
}

private setStoredUserTheme(theme: 'light' | 'dark' | 'auto'): void {
  localStorage.setItem('curia-embed-theme', theme);
}
```

#### **1.2 Update Theme Resolution Logic**
```typescript
// Enhanced theme resolution with user preference priority
private resolveEffectiveTheme(): 'light' | 'dark' | 'auto' {
  // Priority 1: User preference override
  const userPreference = this.getStoredUserTheme();
  if (userPreference) {
    console.log('[InternalPluginHost] Using user theme preference:', userPreference);
    return userPreference;
  }
  
  // Priority 2: Embed creator preference (data-theme)
  const creatorPreference = this.config.theme;
  console.log('[InternalPluginHost] Using embed creator theme:', creatorPreference);
  return creatorPreference || 'light';
}
```

#### **1.3 Initialize Theme at Startup**
```typescript
// Update InternalPluginHost constructor
constructor(container: HTMLElement, config: EmbedConfig, hostServiceUrl: string, forumUrl: string) {
  this.container = container;
  this.config = config;
  
  // Apply user theme preference override to config
  const effectiveTheme = this.resolveEffectiveTheme();
  if (effectiveTheme !== config.theme) {
    console.log('[InternalPluginHost] Overriding config theme with user preference:', {
      original: config.theme,
      override: effectiveTheme
    });
    this.config.theme = effectiveTheme;
  }
  
  // ... rest of initialization
}
```

### **Phase 2: User Profile Menu Enhancement**

#### **2.1 Add Theme Toggle to Menu**
```typescript
// Update UserProfileComponent.createUserProfileMenu()
<div class="profile-menu-actions">
  <button class="profile-menu-action" data-action="toggle-theme">
    <div class="profile-menu-action-icon">${this.getThemeIcon()}</div>
    <span>${this.getThemeLabel()}</span>
  </button>
  <button class="profile-menu-action" data-action="settings">
    <div class="profile-menu-action-icon">⚙️</div>
    <span>Settings</span>
  </button>
  <!-- ... existing actions -->
</div>
```

#### **2.2 Dynamic Theme Icon & Label**
```typescript
// Add to UserProfileComponent
private getThemeIcon(): string {
  const currentTheme = this.getCurrentResolvedTheme();
  return currentTheme === 'dark' ? '☀️' : '🌙';
}

private getThemeLabel(): string {
  const currentTheme = this.getCurrentResolvedTheme();
  return currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
}

private getCurrentResolvedTheme(): 'light' | 'dark' {
  // Implementation to get current resolved theme from InternalPluginHost
  return 'light'; // Placeholder
}
```

### **Phase 3: Multi-Iframe Theme Switching**

#### **3.1 Theme Switch Handler**
```typescript
// Add to InternalPluginHost.handleMenuAction()
private handleMenuAction(action: string): void {
  console.log('[InternalPluginHost] Menu action:', action);
  
  if (action === 'toggle-theme') {
    this.handleThemeToggle();
  } else if (action === 'sign-out') {
    this.authService.signOut();
  }
  // ... existing actions
}

private async handleThemeToggle(): Promise<void> {
  console.log('[InternalPluginHost] Theme toggle requested');
  
  // Determine new theme (simple toggle for now)
  const currentTheme = this.resolveEffectiveTheme();
  const currentResolved = this.resolveAutoTheme(currentTheme);
  const newTheme: 'light' | 'dark' = currentResolved === 'dark' ? 'light' : 'dark';
  
  console.log('[InternalPluginHost] Theme switching:', { currentTheme, currentResolved, newTheme });
  
  // Apply theme switch
  await this.switchTheme(newTheme);
}
```

#### **3.2 Theme Switch Implementation**
```typescript
// Core theme switching logic
private async switchTheme(newTheme: 'light' | 'dark' | 'auto'): Promise<void> {
  console.log('[InternalPluginHost] Switching theme to:', newTheme);
  
  // 1. Store user preference
  this.setStoredUserTheme(newTheme);
  
  // 2. Update config
  this.config.theme = newTheme;
  
  // 3. Update sidebar theme immediately (if possible)
  this.updateSidebarTheme(newTheme);
  
  // 4. Reload all community iframes with new theme
  await this.reloadAllCommunityIframes();
  
  // 5. Update sidebar menu labels
  this.refreshUserProfileMenu();
  
  console.log('[InternalPluginHost] Theme switch completed');
}
```

#### **3.3 Multi-Iframe Reload Logic**
```typescript
// Reload all existing iframes with new theme
private async reloadAllCommunityIframes(): Promise<void> {
  console.log('[InternalPluginHost] Reloading all community iframes with new theme');
  
  const activeBeforeReload = this.activeCommunityId;
  
  // Reload each community iframe
  for (const [communityId, iframe] of this.communityIframes) {
    await this.reloadCommunityIframe(communityId, iframe);
  }
  
  // Ensure active community remains active after reloads
  if (activeBeforeReload && this.communityIframes.has(activeBeforeReload)) {
    const activeIframe = this.communityIframes.get(activeBeforeReload);
    if (activeIframe) {
      activeIframe.style.display = 'block';
      this.apiProxy.setActiveIframe(activeIframe);
    }
  }
  
  console.log('[InternalPluginHost] All community iframes reloaded');
}

private async reloadCommunityIframe(communityId: string, existingIframe: HTMLIFrameElement): Promise<void> {
  console.log(`[InternalPluginHost] Reloading community iframe: ${communityId}`);
  
  // Get auth context for URL building
  const authContext = this.authService.getAuthContext();
  if (!authContext) {
    console.error(`[InternalPluginHost] Cannot reload iframe - no auth context`);
    return;
  }
  
  // Build new URL with updated theme
  const forumUrl = new URL(this.iframeManager['forumUrl']);
  forumUrl.searchParams.set('mod', 'standalone');
  forumUrl.searchParams.set('iframeUid', this.iframeManager.getUid());
  forumUrl.searchParams.set('community', communityId);
  
  // Apply new theme resolution
  const resolvedTheme = this.resolveAutoTheme(this.config.theme);
  forumUrl.searchParams.set('cg_theme', resolvedTheme);
  
  // ... add other parameters (background, parent URL, external params)
  
  // Update iframe src (triggers reload)
  existingIframe.src = forumUrl.toString();
  
  console.log(`[InternalPluginHost] Community iframe reloaded: ${communityId} with theme: ${resolvedTheme}`);
}
```

### **Phase 4: Sidebar Theme Updates**

#### **4.1 Immediate Sidebar Theme Application**
```typescript
// Apply theme to sidebar CSS variables immediately (no reload needed)
private updateSidebarTheme(newTheme: 'light' | 'dark' | 'auto'): void {
  const resolvedTheme = this.resolveAutoTheme(newTheme);
  
  // Apply theme class to sidebar container
  if (this.embedContainer) {
    this.embedContainer.classList.remove('light', 'dark');
    this.embedContainer.classList.add(resolvedTheme);
  }
  
  // Update sidebar CSS custom properties if needed
  const sidebarElement = this.embedContainer?.querySelector('.curia-community-nav');
  if (sidebarElement) {
    sidebarElement.setAttribute('data-theme', resolvedTheme);
  }
}
```

#### **4.2 Menu Label Refresh**
```typescript
// Update menu labels after theme change
private refreshUserProfileMenu(): void {
  if (this.communitySidebar?.userProfileComponent) {
    // Force menu recreation on next open with updated labels
    this.communitySidebar.userProfileComponent.closeMenu();
  }
}
```

---

## ⚡ Key Technical Considerations

### **Theme Storage Isolation**
```typescript
// Completely separate from main app theme
'curia-embed-theme' !== 'curia-theme' // ✅ No conflicts
```

### **Multi-iframe State Preservation**
```typescript
// Active community must remain active during theme switch
const activeBeforeReload = this.activeCommunityId;
await this.reloadAllCommunityIframes();
// Restore active community after all reloads complete
```

### **Theme Resolution Performance**
```typescript
// Cache resolved theme to avoid repeated media query checks
private cachedResolvedTheme: 'light' | 'dark' | null = null;
private resolveAutoTheme(theme: 'light' | 'dark' | 'auto'): 'light' | 'dark' {
  if (theme !== 'auto') return theme;
  
  if (!this.cachedResolvedTheme) {
    this.cachedResolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  return this.cachedResolvedTheme;
}
```

### **URL Parameter Consistency**
```typescript
// Ensure all iframe URLs use consistent theme parameters
forumUrl.searchParams.set('cg_theme', resolvedTheme);        // Forum URLs
authUrl.searchParams.set('theme', resolvedTheme);           // Auth URLs
```

---

## 🎨 User Experience Flow

### **Theme Priority Resolution**
```
1. User clicks theme toggle in profile menu
2. Check current effective theme:
   - User stored preference (localStorage) OR
   - Embed creator preference (data-theme) OR  
   - Default ('light')
3. Toggle to opposite theme
4. Store new user preference (overrides embed creator)
5. Reload all iframes with new theme
6. Update sidebar theme immediately
```

### **Visual Feedback During Switch**
- **Immediate**: Sidebar theme updates instantly
- **Loading**: Brief iframe reloads (2-3 seconds)
- **Complete**: All iframes display in new theme
- **Persistent**: User preference persists across embed instances

---

## ✅ Benefits of This Approach

1. **✅ Respects embed creator preferences** - `data-theme` is default
2. **✅ User preference override** - Stored choice takes priority  
3. **✅ Clean separation** - No conflicts with main app theme
4. **✅ Multi-iframe coordination** - All community iframes switch together
5. **✅ State preservation** - Active community remains active during switch
6. **✅ Existing infrastructure** - Reuses current menu system and service architecture
7. **✅ Simple toggle UX** - Just light/dark toggle for now (can extend to auto later)

---

## 🚀 Next Steps for Implementation

### **Immediate Actions**:
1. **Phase 1**: Implement theme storage and resolution logic
2. **Phase 2**: Add theme toggle to user profile menu
3. **Phase 3**: Implement multi-iframe reload system  
4. **Phase 4**: Add sidebar theme updates and polish

### **Future Enhancements**:
- **Auto Theme Support**: Add system preference detection
- **Transition Animations**: Smooth fade during iframe reloads
- **Performance**: Optimize reload sequence for better UX
- **Settings Page**: More granular theme controls

---

## ❓ Questions Resolved

1. **Theme Storage**: ✅ `'curia-embed-theme'` localStorage key
2. **Menu Placement**: ✅ Theme toggle in user profile menu
3. **Loading UX**: ✅ Immediate sidebar updates, brief iframe reloads
4. **Auto Theme**: ✅ Support planned for future (start with light/dark toggle)
5. **Transition**: ✅ Instant sidebar switch, iframe reloads (can add transitions later)

**Ready to proceed with implementation!** 🚀 