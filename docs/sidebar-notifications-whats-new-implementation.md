# Sidebar Notifications → What's New Page Implementation

## 🎯 **Goal**
Add a **notifications command** from the host service sidebar that opens the **"What's New" page** in the respective community forum when triggered. This follows the same pattern as the existing search command but navigates to a specific page instead of toggling a modal.

## 📋 **Current State Analysis**

### **What's New Page (Already Exists)**
- **Location**: `curia/src/app/whats-new/page.tsx`
- **URL Route**: `/whats-new` 
- **Functionality**: Shows user activity across communities (comments, reactions, new posts)
- **Features**:
  - Community selector (current + partner communities)
  - Cross-community activity tracking
  - Real-time activity categorization
  - Pagination and filtering

### **Current Sidebar System (Search Command)**
- **Flow**: `Sidebar Button → MessageRouter → PostMessage → SidebarActionListener → Action`
- **Search Implementation**: Toggle GlobalSearchModal (open/close)
- **Notifications Button**: Already exists but sends placeholder action

### **Current Files with Notifications Placeholder**
```typescript
// host-service/src/lib/embed/components/sidebar/CommunitySidebar.ts
case 'notifications':
  this.messageRouter.sendSidebarAction('notifications');
  break;

// curia/src/components/SidebarActionListener.tsx  
case 'notifications':
  console.log('[SidebarActionListener] Notifications action received - not implemented yet');
  // TODO: Implement notifications interface when available
  break;
```

## 🔄 **Proposed Implementation Flow**

```
[Sidebar Notifications Button Click] 
    ↓
[CommunitySidebar.handleNavItemClick('notifications')] 
    ↓
[MessageRouter.sendSidebarAction('notifications')] 
    ↓
[Gets active iframe via getActiveIframe callback]
    ↓
[Sends postMessage to iframe]
    ↓
[SidebarActionListener receives message]
    ↓
[Calls router.push('/whats-new') - Navigate to What's New page]
```

## 📁 **Files to Modify**

### **1. Curia Forum App (Navigation Logic)**

#### **`curia/src/components/SidebarActionListener.tsx`**
- **Current**: Placeholder log message
- **Update**: Add navigation logic using Next.js router
- **Implementation**:
  ```typescript
  case 'notifications':
    try {
      console.log('[SidebarActionListener] Opening What\'s New page');
      router.push(preserveCgParams('/whats-new'));
    } catch (error) {
      console.error('[SidebarActionListener] Failed to navigate to What\'s New:', error);
    }
    break;
  ```

### **2. Host Service (Command Structure - Already Exists)**

#### **`host-service/src/lib/embed/components/sidebar/CommunitySidebar.ts`**
- **Current**: Already implemented (lines 561-563)
- **Status**: ✅ **No changes needed**

#### **`host-service/src/lib/embed/components/mobile/MobileBottomNav.ts`**
- **Current**: Already implemented (lines 197-216) 
- **Status**: ✅ **No changes needed**

#### **`host-service/src/lib/embed/plugin-host/InternalPluginHost.ts`**
- **Current**: MessageRouter integration already exists
- **Status**: ✅ **No changes needed**

## 🛠 **Technical Implementation Details**

### **Navigation Method**
- **Library**: Next.js `useRouter` from `'next/navigation'`
- **Method**: `router.push('/whats-new')`
- **Behavior**: Standard Next.js client-side navigation

### **URL Structure**
- **Base Route**: `/whats-new`
- **Query Parameters**: Community selection handled by page's internal state
- **Community Context**: Automatically uses current community from JWT

### **Integration Points**
- **Message Type**: `sidebar_action` (existing)
- **Action Name**: `notifications` (existing)
- **Payload**: None required (page is self-contained)

## 🎚️ **Feature Comparison**

| Feature | Search Command | Notifications Command |
|---------|---------------|----------------------|
| **Trigger** | Sidebar button + Cmd+K | Sidebar button only |
| **Action Type** | Toggle modal | Navigate to page |
| **Implementation** | Modal state management | Router navigation |
| **Payload** | Optional search query | None required |
| **Reversible** | Yes (close modal) | Yes (browser back) |

## ✅ **Implementation Complete**

### **Phase 1: Core Implementation** ✅ **DONE**
1. ✅ **Import Dependencies** in `SidebarActionListener.tsx`
   ```typescript
   import { useRouter } from 'next/navigation';
   import { preserveCgParams } from '@/utils/urlBuilder';
   ```

2. ✅ **Add Router Hook** in component
   ```typescript
   const router = useRouter();
   ```

3. ✅ **Update Notifications Case** in message handler
   ```typescript
   case 'notifications':
     try {
       console.log('[SidebarActionListener] Opening What\'s New page');
       router.push(preserveCgParams('/whats-new'));
     } catch (error) {
       console.error('[SidebarActionListener] Failed to navigate to What\'s New:', error);
     }
     break;
   ```

### **Phase 2: Testing & Validation**
1. **Test Button Functionality**: Verify sidebar button triggers navigation
2. **Test Mobile Touch**: Verify mobile bottom nav works
3. **Test Cross-Community**: Verify page loads correctly for all communities
4. **Test Error Handling**: Verify graceful fallback if navigation fails

### **Phase 3: Documentation Update**
1. **Update Research Docs**: Document new functionality in `sidebar-iframe-communication-research.md`
2. **Update Code Comments**: Remove "TODO" comments and add implementation notes

## 🔍 **Edge Cases & Considerations**

### **Navigation Context**
- **Community Selection**: Page automatically detects current community from user JWT
- **Cross-Community**: User can switch communities within the What's New page UI
- **Permissions**: Page respects community partnerships for cross-community activity

### **Error Handling**
- **Navigation Failure**: Graceful fallback with console error
- **Page Load Issues**: What's New page has built-in loading states
- **Missing Data**: Page handles empty states and first-time users

### **Performance**
- **Page Load**: What's New page is already optimized with React Query caching
- **Data Fetching**: Existing API endpoints with 30-second stale time
- **Navigation Speed**: Standard Next.js client-side routing (instant)

## 🎯 **Success Criteria**

1. ✅ **Sidebar Button**: Clicking notifications button navigates to What's New page
2. ✅ **Mobile Touch**: Touch on mobile notifications button works identically  
3. ✅ **Page Load**: What's New page loads correctly with user's current community
4. ✅ **Community Context**: Page shows activity for the correct community
5. ✅ **Error Handling**: Failed navigation attempts are logged and handled gracefully

## 📊 **Risk Assessment**

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Navigation Failure** | Low | Graceful error handling + console logs |
| **Page Load Issues** | Low | What's New page has robust error boundaries |
| **Community Context** | Low | JWT-based community detection is reliable |
| **Mobile Compatibility** | Low | Existing mobile touch handlers proven |

## 🔮 **Future Enhancements**

### **Potential Improvements**
1. **Deep Linking**: Support navigating to specific activity categories
   - Example: `/whats-new?category=comments_on_my_posts&showOnlyNew=true`

2. **Notification Badges**: Show unread count on sidebar notifications button
   - Requires: Activity count API integration

3. **Keyboard Shortcut**: Add global shortcut for notifications (e.g., Cmd+Shift+N)
   - Similar to existing Cmd+K for search

4. **Community Parameter**: Support opening What's New for specific communities
   - Example: `router.push('/whats-new?communityId=xyz')`

---

## 🚀 **PHASE 2: MODAL TRANSFORMATION** 

### **New Requirements (Phase 2)**
After successful Phase 1 implementation, the following enhancements are now required:

1. **Remove What's New from sidebar menu** - no longer accessible as standalone page
2. **Convert to modal overlay system** - overlays current page instead of navigation
3. **Desktop**: Full-height sidebar sliding in from left
4. **Mobile**: Bottom drawer (80% max height, content-dependent)
5. **Toggle behavior**: Open if closed, close if open (like search)
6. **Notification-style UI**: Streamlined feed rather than complex categorization

### **🔍 Current State Analysis (Phase 2)**

#### **What's New Sidebar Link (To Remove)**
```tsx
// curia/src/components/layout/Sidebar.tsx (lines 310-360)
<Link href={buildUrl('/whats-new')} className="...">
  <Bell size={16} />
  <span>What's New</span>
  <div className="...">NEW</div>
</Link>
```

#### **Existing Modal Patterns (To Follow)**
```tsx
// GlobalSearchModal pattern:
// 1. Context for state management (GlobalSearchContext)
// 2. createPortal for overlay rendering
// 3. Toggle behavior: isOpen, openModal, closeModal
// 4. Backdrop with blur + click-to-close
// 5. Responsive sizing and animations
```

#### **Available UI Components & Animation Systems**
- ✅ **Dialog/DialogContent** (Radix UI) - for backdrop and portal
- ✅ **Card/CardContent** - for content styling  
- ✅ **createPortal** - for rendering outside component tree
- ✅ **Animation Classes**: `animate-in`, `slide-in-from-left-*`, `slide-in-from-bottom-*`, `fade-in`, `duration-*`
- ✅ **Animation Components**: `SlideInFromLeft`, `SlideInFromRight` in `animations.tsx`
- ✅ **Mobile Detection**: `useIsDesktop` hook (used in GlobalSearchModal)
- ✅ **Responsive Patterns**: `max-h-[80vh]`, `sm:`, `md:`, etc.
- ❌ **Sheet/Drawer** - not available, but animation patterns exist for custom implementation

### **🏗️ Implementation Architecture**

#### **1. Context Layer (WhatsNewContext)**
```tsx
// curia/src/contexts/WhatsNewContext.tsx
interface WhatsNewContextType {
  isNotificationsOpen: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
}

export function WhatsNewProvider({ children }: { children: React.ReactNode }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const openNotifications = useCallback(() => setIsNotificationsOpen(true), []);
  const closeNotifications = useCallback(() => setIsNotificationsOpen(false), []);
  
  return (
    <WhatsNewContext.Provider value={{
      isNotificationsOpen,
      openNotifications,
      closeNotifications
    }}>
      {children}
    </WhatsNewContext.Provider>
  );
}
```

#### **2. Modal Component (WhatsNewModal)**
```tsx
// curia/src/components/whats-new/WhatsNewModal.tsx
import { createPortal } from 'react-dom';
import { useWhatsNew } from '@/contexts/WhatsNewContext';
import { cn } from '@/lib/utils';

// Hook to detect desktop (reuse from GlobalSearchModal)
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= 768 && !('ontouchstart' in window));
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  return isDesktop;
};

export function WhatsNewModal() {
  const { isNotificationsOpen, closeNotifications } = useWhatsNew();
  const isDesktop = useIsDesktop();
  
  // Body scroll lock (pattern from ModalContainer)
  useEffect(() => {
    if (isNotificationsOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isNotificationsOpen]);
  
  if (!isNotificationsOpen) return null;
  
  return createPortal(
    <>
      {/* Backdrop - Same pattern as GlobalSearchModal */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={closeNotifications}
        onTouchMove={(e) => e.preventDefault()}
        onWheel={(e) => e.preventDefault()}
      />
      
      {/* Modal Content - Responsive Design */}
      <div className={cn(
        "fixed z-50 bg-background shadow-2xl border overscroll-contain",
        isDesktop
          ? // Desktop: Left sidebar (384px = w-96)
            "left-0 top-0 bottom-0 w-96 rounded-r-2xl animate-in slide-in-from-left-5 fade-in-0 duration-300"
          : // Mobile: Bottom drawer
            "left-0 right-0 bottom-0 max-h-[80vh] rounded-t-2xl animate-in slide-in-from-bottom-4 fade-in-0 duration-300"
      )}>
        <WhatsNewContent />
      </div>
    </>,
    document.body
  );
}
```

#### **3. Content Component (WhatsNewContent)**
```tsx
// Reuse existing What's New logic but in streamlined modal format
// - Community selector at top
// - Simplified notification feed (less categorization)
// - Infinite scroll or pagination
// - Activity items with navigation
```

#### **4. Integration Updates**

##### **SidebarActionListener (Toggle Behavior)**
```tsx
// curia/src/components/SidebarActionListener.tsx
import { useWhatsNew } from '@/contexts/WhatsNewContext';

case 'notifications':
  try {
    console.log('[SidebarActionListener] Toggling notifications modal');
    if (isNotificationsOpen) {
      closeNotifications();
    } else {
      openNotifications();
    }
  } catch (error) {
    console.error('[SidebarActionListener] Failed to toggle notifications:', error);
  }
  break;
```

##### **Sidebar Link Removal**
```tsx
// curia/src/components/layout/Sidebar.tsx
// Remove lines 310-360 (What's New link)
// Remove isWhatsNewPage logic and related state
```

##### **Provider Integration**
```tsx
// curia/src/app/layout.tsx or main provider wrapper
<WhatsNewProvider>
  <GlobalSearchProvider>
    {/* existing app structure */}
  </GlobalSearchProvider>
</WhatsNewProvider>
```

### **📱 Responsive Design Specifications**

#### **Desktop (≥768px)**
- **Position**: Fixed left sidebar
- **Width**: `384px` (w-96)
- **Height**: Full viewport height
- **Animation**: `slide-in-from-left`
- **Backdrop**: Blur overlay with click-to-close
- **Scrolling**: Internal scroll within sidebar

#### **Mobile (<768px)**
- **Position**: Fixed bottom drawer
- **Width**: Full width (left-0 right-0)
- **Height**: Max 80vh, content-dependent minimum
- **Animation**: `slide-in-from-bottom`
- **Handle**: Optional drag handle for better UX
- **Scrolling**: Internal scroll within drawer

### **🔄 Data Architecture**

#### **API Reuse Strategy**
- ✅ **Reuse existing API**: `/api/me/whats-new` endpoints
- ✅ **Reuse React Query logic**: Existing hooks and queries
- ✅ **Reuse component logic**: Activity items, formatting, navigation
- 🆕 **Simplified UI**: Less complex categorization, more notification-like

#### **State Management**
```tsx
// Modal-specific state (in WhatsNewModal component)
const [selectedCommunityId, setSelectedCommunityId] = useState(user?.cid || '');
const [isLoading, setIsLoading] = useState(false);

// Reuse existing hooks from What's New page
const { data: summaryData } = useQuery(['whatsNewSummary', selectedCommunityId]);
const { data: activitiesData } = useQuery(['whatsNewActivities', selectedCommunityId]);
```

### **🚀 Implementation Steps (Phase 2)**

#### **Step 1: Context and State Management**
1. Create `WhatsNewContext.tsx` with open/close state
2. Add provider to app layout
3. Create `useWhatsNew` hook

#### **Step 2: Modal Component Structure** 
1. Create `WhatsNewModal.tsx` with portal and responsive layout
2. Add mobile detection and conditional rendering
3. Implement backdrop and click-to-close behavior

#### **Step 3: Content Migration**
1. Extract reusable components from existing What's New page
2. Create simplified `WhatsNewContent.tsx` for modal
3. Implement streamlined notification feed UI

#### **Step 4: Integration and Cleanup**
1. Update `SidebarActionListener.tsx` for toggle behavior
2. Remove What's New link from `Sidebar.tsx`
3. Add modal to main app layout

#### **Step 5: Polish and Testing**
1. Fine-tune animations and responsive behavior
2. Test toggle functionality on desktop and mobile
3. Verify backdrop, keyboard, and accessibility behavior

### **⚠️ Technical Considerations & Questions**

#### **🤔 Open Questions**
1. **Content Height Strategy**: Should mobile drawer have a minimum height, or always content-dependent?
2. **Animation Performance**: Should we use CSS transitions or Framer Motion for smoother animations?
3. **Keyboard Navigation**: Should we support Escape key to close? Arrow key navigation?
4. **Initial Load**: Should modal content be lazy-loaded or pre-fetched when sidebar command is available?
5. **Community Context**: Should the modal remember the last selected community across sessions?

#### **🚨 Potential Challenges**
1. **Z-index Management**: Ensuring modal appears above all content without conflicts
2. **Mobile Safari Issues**: Bottom drawer might conflict with Safari's bottom bar
3. **Animation Conflicts**: Ensuring smooth animations don't interfere with backdrop
4. **Touch Gestures**: Mobile users might expect swipe-to-close functionality
5. **Performance**: Large activity feeds might need virtualization for smooth scrolling

#### **🛡️ Risk Mitigation**
1. **Fallback Strategy**: If modal fails to open, could still navigate to `/whats-new` as backup
2. **Progressive Enhancement**: Start with basic modal, add advanced animations later
3. **Mobile Testing**: Extensive testing on various mobile devices and browsers
4. **Accessibility**: Ensure screen reader compatibility and keyboard navigation

### **📊 Implementation Effort Estimate**

| Component | Complexity | Time Estimate |
|-----------|------------|---------------|
| WhatsNewContext | Low | 1 hour |
| WhatsNewModal (structure) | Medium | 3 hours |
| Content migration | Medium | 4 hours |
| Responsive design | High | 6 hours |
| Toggle integration | Low | 1 hour |
| Sidebar cleanup | Low | 0.5 hours |
| Testing & polish | Medium | 3 hours |
| **TOTAL** | **Medium-High** | **~18.5 hours** |

---

## 📝 **Summary**

**Phase 1** ✅ **Complete**: Basic navigation from notifications button to What's New page with proper CG parameter preservation.

**Phase 2** 🚀 **Proposed**: Transform into a sophisticated modal overlay system with:
- **Toggle behavior** like search modal
- **Responsive design** (desktop sidebar + mobile drawer)
- **Streamlined notification UI** for better user experience
- **Complete removal** of standalone page access

This creates a more integrated, modern notification system that feels native to the forum experience rather than a separate page.