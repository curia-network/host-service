# Community Sidebar Architecture Research

## 🎯 **Vision: Discord-Style Community Navigation**

### **Core Concept**
A Discord-style persistent sidebar that shows **only communities the user is already a member of**, enabling quick switching between their existing communities.

### **Key Insights**
- **Members-only approach**: Only show communities user belongs to (no discovery)
- **Conditional visibility**: Hide sidebar entirely if user has 0-1 communities
- **Trivial switching**: Reuse existing community loading logic for switches
- **Minimal new infrastructure**: Leverage existing `/api/communities` endpoint

---

## 🏗️ **UI Architecture Options**

### **Option 1: Left Sidebar (Discord Style)**
```
┌─────────────────────────────────────────────────────┐
│ ┌─────┐                                             │
│ │ C1  │  ← Community avatars in vertical sidebar     │
│ │ C2  │                                             │
│ │ C3* │  ← * = currently active                     │
│ │ C4  │                                             │
│ │ +   │  ← "Browse more communities"                │
│ └─────┘                                             │
│          Forum Iframe Content                       │
│          (current community)                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Pros**: Familiar UX, always visible, scales well
**Cons**: Takes horizontal space, might not work on narrow embeds

### **Option 2: Top Bar**
```
┌─────────────────────────────────────────────────────┐
│ [C1] [C2] [C3*] [C4] [+] ← Community tabs           │
├─────────────────────────────────────────────────────┤
│                                                     │
│          Forum Iframe Content                       │
│          (current community)                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Pros**: Horizontal layout works well, familiar tab pattern
**Cons**: Limited space for community names/logos

### **Option 3: Floating Button + Dropdown**
```
┌─────────────────────────────────────────────────────┐
│                                          ┌─────────┐│
│          Forum Iframe Content            │Community││
│          (current community)             │Switcher ││
│                                          │   ⬇    ││
│                                          └─────────┘│
└─────────────────────────────────────────────────────┘
```

**Pros**: Minimal space usage, works in any embed size
**Cons**: Less discoverable, requires click to see options

---

## 🎨 **Recommended Approach: Adaptive Sidebar**

### **Smart Layout Based on Embed Dimensions**
```typescript
// InternalPluginHost logic
const embedWidth = this.config.width;
const embedHeight = this.config.height;

if (embedWidth >= 800) {
  // Use left sidebar for wide embeds
  this.renderLeftSidebar();
} else if (embedHeight >= 600) {
  // Use top bar for narrow but tall embeds  
  this.renderTopBar();
} else {
  // Use floating button for small embeds
  this.renderFloatingButton();
}
```

### **UI Component Structure**
```
Customer Page Container (InternalPluginHost manages)
├── Community Navigation UI (rendered by parent)
│   ├── Community List Component
│   ├── Active Community Indicator  
│   ├── Join/Switch Logic Handler
│   └── Loading/Error States
└── Forum Iframe (community content)
```

---

## 🔄 **Community Switching Logic Flow**

### **Current State Detection**
```typescript
interface CommunityState {
  communityId: string;
  communityName: string;
  userMembership: 'member' | 'admin' | 'none';  // none = not a member
  gatingRequirements?: GatingConfig;
  userMeetsRequirements: boolean;
}
```

### **Simplified Click Handling**
```typescript
async handleCommunityClick(targetCommunityId: string) {
  // User is guaranteed to be a member (sidebar only shows member communities)
  await this.switchToCommunity(targetCommunityId);
}

async switchToCommunity(communityId: string) {
  // Update auth context
  this.authContext.communityId = communityId;
  
  // Rebuild forum URL with new community
  const forumUrl = this.buildForumUrl(communityId);
  
  // Switch iframe (reuse existing logic)
  this.currentIframe.src = forumUrl;
}
```

### **No Complex Flow Needed**
- **Direct switch only**: User is guaranteed to be a member
- **No permission checking**: Already validated by membership
- **No joining logic**: Not needed for members-only sidebar

---

## 🛠️ **Technical Implementation**

### **InternalPluginHost Extensions**

#### **New Responsibilities**
```typescript
class InternalPluginHost {
  // ... existing properties
  private communityNavigation: CommunityNavigationUI;
  private allCommunities: CommunityInfo[] = [];
  
  constructor(...) {
    // ... existing setup
    this.initializeCommunityNavigation();
  }
  
  private async initializeCommunityNavigation() {
    // Load user's community memberships only
    const response = await this.apiProxy.makeApiRequest({
      method: 'getUserCommunities', // New method or enhanced getUserInfo
      userId: this.authContext.userId
    });
    
    // Only show sidebar if user has 2+ communities
    if (response.userCommunities.length < 2) {
      console.log('[InternalPluginHost] User has <2 communities, hiding sidebar');
      return; // No sidebar needed
    }
    
    // Render navigation UI alongside iframe
    this.communityNavigation = new CommunityNavigationUI({
      communities: response.userCommunities,
      currentCommunity: this.authContext?.communityId,
      onCommunityClick: this.handleCommunitySwitch.bind(this)
    });
    
    this.renderNavigationUI();
  }
}
```

#### **Container Layout Management**
```typescript
private renderNavigationUI() {
  // Create container for navigation + iframe
  const embedContainer = document.createElement('div');
  embedContainer.className = 'curia-embed-container';
  
  // Add navigation UI
  const navElement = this.communityNavigation.render();
  embedContainer.appendChild(navElement);
  
  // Add iframe container
  const iframeContainer = document.createElement('div');
  iframeContainer.className = 'curia-iframe-container';
  embedContainer.appendChild(iframeContainer);
  
  // Replace original container content
  this.container.innerHTML = '';
  this.container.appendChild(embedContainer);
  
  // Move iframe to new container
  iframeContainer.appendChild(this.currentIframe);
}
```

### **API Endpoints (Existing is Perfect!)**

#### **Existing `/api/communities` Already Provides Everything**
```typescript
// Current endpoint returns exactly what we need:
{
  userCommunities: [
    {
      id: string,
      name: string,
      logoUrl: string,
      userRole: 'member' | 'admin' | 'owner',
      isMember: true
    }
  ],
  isAuthenticated: boolean
}
```

#### **No New Endpoints Needed**
- ✅ User's community memberships: `/api/communities` (authenticated)
- ✅ Community switching: Reuse existing forum loading logic
- ✅ Authentication: Already handled in existing endpoints

### **Community Navigation UI Component**

#### **React-like Structure (Vanilla JS)**
```typescript
class CommunityNavigationUI {
  private communities: CommunityInfo[];
  private currentCommunityId: string;
  private onCommunityClick: (id: string) => void;
  
  render(): HTMLElement {
    const nav = document.createElement('div');
    nav.className = 'curia-community-nav';
    
    this.communities.forEach(community => {
      const item = this.renderCommunityItem(community);
      nav.appendChild(item);
    });
    
    return nav;
  }
  
  private renderCommunityItem(community: CommunityInfo): HTMLElement {
    const item = document.createElement('div');
    item.className = `community-item ${community.id === this.currentCommunityId ? 'active' : ''}`;
    
    // Community logo
    const logo = document.createElement('img');
    logo.src = community.logo_url || '/default-logo.svg';
    logo.alt = community.name;
    
    // Community name (for larger layouts)
    const name = document.createElement('span');
    name.textContent = community.name;
    
    // Click handler
    item.addEventListener('click', () => {
      this.onCommunityClick(community.id);
    });
    
    item.appendChild(logo);
    item.appendChild(name);
    
    return item;
  }
}
```

---

## 🔄 **Integration with Existing Systems**

### **Leverage Community Selection Logic**
```typescript
// Reuse the community selection flow from /embed route
async joinAndSwitchToCommunity(communityId: string) {
  // Use existing community joining logic
  const joinResult = await this.joinCommunity(communityId);
  
  if (joinResult.success) {
    // Update auth context
    this.authContext.communityId = communityId;
    
    // Switch iframe to new community
    await this.switchToForum(); // Reuse existing forum switching
  } else {
    // Handle join failure
    this.showJoinError(joinResult.error);
  }
}
```

### **Auth Context Updates**
```typescript
interface InternalAuthContext {
  // ... existing properties
  userCommunities: UserCommunityMembership[];  // User's memberships
  allCommunities: CommunityInfo[];             // All available communities
  activeCommunityId: string;                   // Currently active community
}
```

### **Message Types for Forum Communication**
```typescript
enum InternalMessageType {
  // ... existing types
  COMMUNITY_SWITCH_REQUEST = 'community_switch_request',
  COMMUNITY_JOINED = 'community_joined',
  COMMUNITY_SWITCH_COMPLETE = 'community_switch_complete'
}
```

---

## 🎨 **Visual Design Considerations**

### **Community Indicators**
- **Active State**: Clear highlight for currently active community
- **User Role**: Small badge showing admin/owner status if applicable
- **Community Logo**: Use community logo_url or fallback icon

### **Responsive Behavior**
```css
.curia-embed-container {
  display: flex;
  width: 100%;
  height: 100%;
}

/* Wide layout - left sidebar */
@media (min-width: 800px) {
  .curia-community-nav {
    width: 80px;
    flex-direction: column;
    border-right: 1px solid var(--border-color);
  }
  
  .curia-iframe-container {
    flex: 1;
  }
}

/* Narrow layout - top bar */
@media (max-width: 799px) {
  .curia-embed-container {
    flex-direction: column;
  }
  
  .curia-community-nav {
    height: 60px;
    flex-direction: row;
    border-bottom: 1px solid var(--border-color);
    overflow-x: auto;
  }
}
```

### **Theme Integration**
- Use customer's embed theme settings
- Match forum iframe styling
- Support light/dark/auto theme modes

---

## 📊 **Performance Considerations**

### **Simple Loading Strategy**
```typescript
// Single API call for user's communities
const userCommunities = await this.loadUserCommunities();

// No background loading needed - sidebar only shows user's communities
if (userCommunities.length >= 2) {
  this.renderSidebar(userCommunities);
}
```

### **Caching Strategy**
- Cache community list for session duration
- Update cache when user joins new community
- Periodic background refresh for community changes

### **Minimal Network Requests**
```typescript
// Single API call for all community data
GET /api/communities?include=gating,membership&userId=current
```

---

## 🔍 **Key Implementation Questions**

### **1. Layout Priority**
- **Start with left sidebar for wide embeds?**
- **What's the minimum width threshold for sidebar vs. top bar?**
- **Should we allow customers to configure the layout preference?**

### **2. Community Ordering Strategy**
- **Recent activity order** (last_visited_at DESC) like Discord?
- **Alphabetical order** for consistency?
- **User-customizable order** (future enhancement)?

### **3. Sidebar Visibility Logic**
- **Hide for 0-1 communities** - confirmed
- **Show immediately when user gets 2nd community?**
- **Remember collapsed/expanded state?**

### **4. State Persistence**
- **Remember user's last visited community for future sessions?**
- **Persist sidebar collapsed/expanded state?**
- **How to handle concurrent community switches across multiple tabs?**

---

## 🚀 **Streamlined Development Roadmap**

### **Phase 1: Core Sidebar (1-2 weeks)**
1. **Enhance existing API** - Add user communities to current endpoints
2. **Sidebar UI component** - Simple Discord-style vertical list
3. **Conditional rendering** - Show only for users with 2+ communities
4. **Basic community switching** - Direct iframe URL changes

### **Phase 2: Polish & Responsive (1 week)**
1. **Responsive layout** - Sidebar for wide, top bar for narrow embeds
2. **Visual polish** - Active states, hover effects, smooth transitions
3. **Role indicators** - Show admin/owner badges
4. **Error handling** - Network failures, loading states

### **Phase 3: UX Enhancements (1 week)**
1. **Smart ordering** - Recent activity or user preference
2. **Sidebar state persistence** - Remember collapsed/expanded
3. **Performance optimization** - Caching, minimal re-renders
4. **Accessibility** - Keyboard navigation, screen readers

### **Phase 4: Future Enhancements (Future)**
1. **Community settings per sidebar** - Custom names, reordering
2. **Notification indicators** - Unread counts, activity dots
3. **Quick actions** - Right-click context menus
4. **Integration with forum features** - Bookmarks, recent posts

---

## 📋 **MVP Specification Summary**

### **Core Requirements**
1. **Discord-style left sidebar** showing user's community avatars
2. **Conditional visibility** - only show if user has 2+ communities  
3. **Simple switching** - click community → iframe loads that community
4. **Responsive fallback** - top bar for narrow embeds
5. **Minimal API changes** - leverage existing `/api/communities` endpoint

### **Technical Implementation**
- **InternalPluginHost extension** - manage sidebar UI alongside iframe
- **API integration** - use existing authenticated `/api/communities` call
- **Container restructure** - flexbox layout with sidebar + iframe
- **CSS responsive design** - adaptive based on embed dimensions

### **Success Metrics**
- Users with multiple community memberships can switch instantly
- No performance regression on single-community embeds
- Sidebar integrates seamlessly with existing embed theming
- Zero breaking changes to existing embed functionality

This focused approach provides **immediate value for multi-community users** while requiring **minimal new infrastructure** and leveraging our **proven embed architecture**. 