# CG Navigate System Research & Analysis

## 🎯 **Current System Architecture**

### **Overview**
The Curia embed system uses a sophisticated iframe-based architecture where the `InternalPluginHost` acts as a bridge between the embedded forum application and the host service APIs.

### **Core Components**

#### **1. InternalPluginHost.ts - The Central Orchestrator**
Located in `src/lib/embed/plugin-host/InternalPluginHost.ts`, this class manages:

- **Iframe Lifecycle**: Auth iframe → Forum iframe transition
- **Message Routing**: PostMessage communication between forum and host service
- **Auth Context**: Maintains user session across iframe switches
- **API Proxying**: Routes API requests through CSP-compliant proxy system

#### **2. Current Message Flow**
```
Forum Iframe (curia.network/forum)
    ↓ PostMessage API Request
InternalPluginHost (Customer Page Context)
    ↓ API Proxy Client
API Proxy Server (Embed Iframe)
    ↓ Direct API Call
Host Service APIs (/api/user, /api/community)
    ↓ Database Response
[Response flows back through same chain]
```

#### **3. Authentication Context Management**
```typescript
interface InternalAuthContext {
  userId: string;           // Current user ID
  communityId: string;      // Active community context
  sessionToken?: string;    // Session authentication
  externalParams?: Record<string, string>; // Customer page params
  parentUrl?: string;       // Parent page URL
}
```

### **Current API Methods Supported**

#### **User APIs (`/api/user`)**
- `getUserInfo` - Get user profile data
- `getUserFriends` - Get paginated friend lists  
- `getContextData` - Get plugin context and assignable roles

#### **Community APIs (`/api/community`)**
- `getCommunityInfo` - Get community details and roles
- `giveRole` - Assign roles to users

### **Message Communication Protocol**

#### **Message Types**
```typescript
enum InternalMessageType {
  API_REQUEST = 'api_request',    // Forum → Host
  API_RESPONSE = 'api_response',  // Host → Forum
  INIT = 'init',                  // Forum initialization
  ERROR = 'error'                 // Error responses
}
```

#### **Instance Isolation**
- Each embed instance generates unique `iframeUid`
- Prevents message cross-talk between multiple embeds on same page
- Messages filtered by UID before processing

#### **Security Features**
- Sandbox iframe permissions with specific allow list
- CSP-compliant API routing through same-domain proxy
- Origin validation for PostMessage communication
- Request timeout protection and retry logic

---

## 🔄 **Current Navigation Limitations**

### **Single Community Context Lock**
- Each embed instance is artificially bound to one community during auth
- No mechanism for cross-community navigation within user's memberships
- Forum app loads with pre-determined community context and can't switch

### **Static Iframe URLs**
- Forum iframe URL is built once during auth completion
- No dynamic URL updates for community switching
- Would require full iframe reload to change community

### **User Multi-Community Access Unused**
- Database already tracks user memberships across communities (`user_communities`)
- Users often belong to multiple communities on same instance
- No navigation system to leverage these existing memberships

---

## 📋 **Proposed CG Navigate Specs Analysis**

### **From Forum Team Perspective**
The `cg-navigate-specs.md` proposes a `communitySwitcher` function with:

```typescript
communitySwitcher(targetCommunityId: string, options?: {
  boardId?: number,
  postId?: number, 
  commentId?: number
})
```

### **Refined Core Features**
1. **User Membership Validation**
   - Check if user has active membership in target community
   - Validate user's role in target community for board access
   - Simple membership-based access control

2. **Seamless Community Switching**
   - Build complete URL path for target community
   - Handle deep linking to specific boards/posts
   - Execute iframe context switching (URL change or SPA routing)

3. **Clean Error Handling**
   - No membership in target community
   - Role-based board visibility restrictions
   - Missing content graceful handling
   - Network/loading error states

### **Integration Points**
- Single function call from forum app
- Automatic error states with user-friendly messages
- Built-in loading states during navigation
- Parent app integration for potential tabbed browsing

---

## 🏗️ **Implementation Architecture Analysis**

### **Required Host Service Changes**

#### **New API Endpoints Needed**
```typescript
// User community navigation APIs
GET /api/user/communities                    // Get user's community memberships
POST /api/community/switch-context           // Switch active community context
GET /api/community/:communityId/access-info  // Get user's access level in community

// Enhanced existing endpoints
GET /api/user/getUserInfo?communityId=:id    // Context-aware user info
GET /api/community/getCommunityInfo/:id      // Any community user has access to
```

#### **Database Usage (No Extensions Needed)**
- Leverage existing `user_communities` table for membership validation
- Use existing `users` and `communities` tables for access control
- Simple role-based validation without partnership complexity

### **InternalPluginHost Extensions**

#### **New Message Types**
```typescript
enum InternalMessageType {
  // ... existing types
  COMMUNITY_SWITCH_REQUEST = 'community_switch_request',
  COMMUNITY_SWITCH_RESPONSE = 'community_switch_response',
  NAVIGATION_PERMISSION_CHECK = 'navigation_permission_check'
}
```

#### **Enhanced Auth Context**
```typescript
interface InternalAuthContext {
  // ... existing properties
  userCommunities?: UserCommunityMembership[];  // User's community memberships
  activeCommunityId: string;                    // Currently active community
  availableNavigation?: CommunityNavInfo[];     // Communities user can navigate to
}

interface UserCommunityMembership {
  communityId: string;
  role: 'member' | 'moderator' | 'admin' | 'owner';
  status: 'active' | 'pending' | 'banned' | 'left';
  communityName: string;
  communityLogo?: string;
}
```

### **Forum App Integration Points**

#### **CG Plugin Lib Changes**
The forum app currently uses `@curia_/cg-plugin-lib` for API communication. Would need:

1. **New Navigation Methods**
   ```typescript
   // In cg-plugin-lib
   cglib.navigation.switchCommunity(targetCommunityId, options)
   cglib.navigation.validateAccess(targetCommunityId)
   cglib.navigation.getAvailableCommunities()
   ```

2. **Event Handling**
   ```typescript
   cglib.on('navigation.communityChanged', (newCommunity) => {
     // Forum app handles community context change
   });
   ```

---

## 🤔 **Technical Challenges & Considerations**

### **1. Iframe URL Management**
**Challenge**: Forum iframe URL contains community context in path/params
**Solutions**:
- Dynamic iframe URL updates (may cause page reload)
- Single-page routing within forum app
- Community context switching without iframe reload

### **2. Authentication Context Expansion**
**Challenge**: Current auth context is single-community focused
**Considerations**:
- Session token remains valid across user's communities
- Identity requirements are instance-level, not community-level
- Simple membership-based access rather than complex permissions

### **3. State Management Complexity**
**Challenge**: Multiple communities, multiple permission levels
**Considerations**:
- Caching community info and partnerships
- Real-time permission updates
- Error state management across navigation

### **4. Performance Implications**
**Challenge**: Additional API calls for community switching
**Optimizations**:
- Pre-fetch user's community memberships during auth
- Cache community list in auth context for instant switching
- Lazy load community-specific data only when switching

### **5. User Experience Consistency**
**Challenge**: Different communities may have different themes/settings
**Considerations**:
- Theme inheritance vs. community-specific themes
- URL structure consistency
- Loading states during navigation

---

## 📊 **Database Schema - Perfect Foundation Exists**

### **Core Table: `user_communities` (All We Need!)**
```sql
CREATE TABLE "public"."user_communities" (
    "user_id" text NOT NULL,
    "community_id" text NOT NULL,
    "role" character varying(20) DEFAULT 'member',
    "status" character varying(20) DEFAULT 'active',
    -- ... other fields
);
```

**This table already provides everything needed**:
- **User membership validation**: Check if user has active membership
- **Role-based access**: Different permissions based on role
- **Status filtering**: Only navigate to 'active' memberships
- **Multi-community support**: Users can belong to multiple communities

### **Supporting Tables (Already Perfect)**
- **`communities`**: Community info (name, logo, settings)
- **`users`**: User authentication and identity
- **`boards`**: Board-level access within communities

### **Navigation Query Examples**
```sql
-- Get user's navigable communities
SELECT c.id, c.name, c.logo_url, uc.role
FROM user_communities uc
JOIN communities c ON uc.community_id = c.id  
WHERE uc.user_id = $1 AND uc.status = 'active';

-- Validate user access to specific community
SELECT uc.role 
FROM user_communities uc
WHERE uc.user_id = $1 AND uc.community_id = $2 AND uc.status = 'active';
```

---

## 🎯 **Recommended Implementation Strategy**

### **Phase 1: Foundation (Host Service)**
1. Create user community membership APIs
2. Add community switching context endpoints  
3. Extend existing API methods to support multi-community context

### **Phase 2: Plugin Host Integration**
1. Add community switching message types to InternalPluginHost
2. Implement membership-based navigation validation
3. Add iframe URL management for community switches

### **Phase 3: Plugin Lib Updates**
1. Update `@curia_/cg-plugin-lib` with navigation methods
2. Add community switching events and state management
3. Update forum app to use new navigation APIs

### **Phase 4: UX Enhancement**
1. Add loading states and error handling
2. Implement community switcher UI components
3. Add navigation history and breadcrumbs

---

## 🔍 **Key Questions for Implementation**

### **Architecture Decisions**
1. **Iframe Reload vs. SPA Navigation**: Should community switching reload the iframe or use client-side routing?
2. **Permission Caching**: How long should partnership permissions be cached?
3. **Error Recovery**: How should failed navigation attempts be handled?

### **User Experience**
1. **Context Preservation**: Should user's position (board/post) be preserved across communities?
2. **Theme Inheritance**: Should target community's theme override current theme?
3. **Breadcrumb Navigation**: How should users navigate back to source community?

### **Security & Performance**
1. **Membership Validation**: Real-time vs. cached membership checking?
2. **API Rate Limiting**: How to prevent rapid community switching abuse?
3. **Context Management**: How to handle state across multiple communities?

---

## 📝 **Next Steps for Research**

1. **Audit User Multi-Community Data**: Review how many users belong to multiple communities
2. **API Performance Testing**: Measure current API response times for scaling considerations
3. **Forum App Navigation Patterns**: Study how the forum currently handles internal navigation
4. **Customer Use Cases**: Define specific navigation scenarios customers need

This research forms the foundation for implementing cross-community navigation while maintaining the security and performance characteristics of the current system. 