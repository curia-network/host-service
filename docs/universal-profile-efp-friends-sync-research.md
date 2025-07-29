# Universal Profile & EFP Friends Sync Research

**Research Date:** January 2025  
**Status:** Implementation Ready  
**Priority:** High

## 🎯 **OBJECTIVE**

Implement proper friend sync into the host service to deliver real friend data for Universal Profile and ENS/EFP accounts when the forum embed requests user friend information via the existing `getUserFriends` API.

**Key Simplification:** No Common Ground friends integration needed - pure UP/EFP approach only.

## 🏗️ **CURRENT ARCHITECTURE ANALYSIS**

### **Existing Data Flow**
```
Forum (getUserFriends request) → Host Service → MessageRouter → API Route → DatabaseDataProvider → Returns mock/empty data
```

### **Current Implementation Status**
- ✅ **Host Service API**: `getUserFriends` method exists and works
- ✅ **Message Routing**: MessageRouter handles friend requests correctly
- ⚠️ **Data Source**: Currently returns empty/mock data for UP/EFP users
- ⚠️ **Missing**: External API integration (EFP/UP) in the host service

### **Current Database Schema**
```sql
CREATE TABLE "user_friends" (
  "id" integer PRIMARY KEY,
  "user_id" text NOT NULL,
  "friend_user_id" text NOT NULL,
  "friend_name" text NOT NULL,
  "friend_image_url" text,
  "friendship_status" text DEFAULT 'active',
  "synced_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
  -- ... indexes and constraints
);
```

## 🎯 **SOLUTION ARCHITECTURE**

### **Core Principle**
- **Host Service as Smart Proxy**: Host service fetches friends from external sources when forum requests them
- **ENS Users** → Host service fetches from EFP API
- **Universal Profile Users** → Host service fetches from UP contracts  
- **Caching Layer**: Database used for performance caching, not primary storage

### **NEW Data Flow**
```
Forum Request → Host Service → Detect Identity Type → Fetch from EFP/UP → Cache & Return
```

### **Implementation Strategy**
1. **Enhance DatabaseDataProvider.getUserFriends()** to fetch from external sources
2. **Add caching layer** to avoid repeated API calls
3. **Identity detection** from user metadata (ENS vs UP)
4. **Fallback to cache** if external API fails

## 📋 **DETAILED IMPLEMENTATION ROADMAP**

### **PHASE 1: EFP Friends Integration** 🔷

#### **1.1 EFP Following Fetcher Service**
**File:** `host-service/src/lib/friends/EfpFriendsService.ts`

```typescript
export class EfpFriendsService {
  private static readonly EFP_API_BASE = 'https://api.ethfollow.xyz/api/v1';
  
  async fetchUserFollowing(ethAddress: string): Promise<FriendInfo[]> {
    // Paginated fetch of all following relationships
    // Convert EFP format to host service FriendInfo format
    // Return directly to caller (no database storage)
  }
  
  async fetchWithCache(ethAddress: string, userId: string): Promise<FriendInfo[]> {
    // Check cache first, fetch from API if stale/missing
    // Update cache after successful fetch
  }
}
```

**Key Features:**
- ✅ Real-time API fetching when forum requests friends
- ✅ Pagination handling (1000 records per request)
- ✅ Rate limiting and error handling
- ✅ Smart caching to avoid repeated API calls

#### **1.2 EFP Data Format**
```typescript
interface EfpFriend {
  address: string;          // Ethereum address
  ensName?: string;         // ENS domain if available
  avatar?: string;          // ENS avatar or default
  followedAt?: Date;        // When following relationship started
}
```

### **PHASE 2: Universal Profile Friends Integration** 🔶

#### **2.1 Universal Profile Following Service**
**File:** `host-service/src/lib/friends/UniversalProfileFriendsService.ts`

```typescript
export class UniversalProfileFriendsService {
  async fetchUserFollowing(upAddress: string): Promise<FriendInfo[]> {
    // Query LSP26 following registry
    // Resolve UP metadata for names/avatars
    // Return directly to caller (no database storage)
  }
  
  async fetchWithCache(upAddress: string, userId: string): Promise<FriendInfo[]> {
    // Check cache first, fetch from contracts if stale/missing
    // Update cache after successful fetch
  }
}
```

**Data Sources:**
- **LSP26 Following Registry**: On-chain following relationships
- **UP Metadata**: LSP3 profile data for names/avatars
- **LUKSO RPC**: Direct contract calls for efficiency

#### **2.2 UP Data Format**
```typescript
interface UpFriend {
  upAddress: string;        // Universal Profile address
  name?: string;            // From LSP3 metadata
  avatar?: string;          // From LSP3 metadata  
  followedAt?: Date;        // From LSP26 registry
}
```

### **PHASE 3: Enhanced DatabaseDataProvider** 🔸

#### **3.1 Enhanced getUserFriends Method**
**File:** `host-service/src/lib/DataProvider.ts` (modify existing)

```typescript
export class DatabaseDataProvider extends DataProvider {
  constructor(
    private efpService: EfpFriendsService,
    private upService: UniversalProfileFriendsService
  ) {}

  async getUserFriends(userId: string, communityId: string, limit: number, offset: number): Promise<ApiResponse<{ friends: FriendInfo[] }>> {
    try {
      // Get user identity information
      const userInfo = await this.getUserInfo(userId, communityId);
      
      if (userInfo.data?.identity_type === 'ens' && userInfo.data?.wallet_address) {
        const friends = await this.efpService.fetchWithCache(userInfo.data.wallet_address, userId);
        return { data: { friends: this.paginateFriends(friends, limit, offset) }, success: true };
      }
      
      if (userInfo.data?.identity_type === 'universal_profile' && userInfo.data?.up_address) {
        const friends = await this.upService.fetchWithCache(userInfo.data.up_address, userId);
        return { data: { friends: this.paginateFriends(friends, limit, offset) }, success: true };
      }
      
      // Fallback: anonymous/legacy users get empty friends list
      return { data: { friends: [] }, success: true };
      
    } catch (error) {
      // Fallback to cached data if external APIs fail
      return await this.getFriendsFromCache(userId, limit, offset);
    }
  }
}
```

#### **3.2 Enhanced Database Schema (For Caching)**
```sql
-- Enhance existing user_friends table for caching
ALTER TABLE user_friends ADD COLUMN friend_source TEXT CHECK (friend_source IN ('efp', 'universal_profile'));
ALTER TABLE user_friends ADD COLUMN external_address TEXT; -- ETH address or UP address
ALTER TABLE user_friends ADD COLUMN cached_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP; -- Cache timestamp
ALTER TABLE user_friends ADD COLUMN metadata JSONB DEFAULT '{}'; -- ENS names, avatars, etc.

-- Performance indexes for caching
CREATE INDEX idx_user_friends_source ON user_friends(friend_source);
CREATE INDEX idx_user_friends_external_addr ON user_friends(external_address);
CREATE INDEX idx_user_friends_cache_time ON user_friends(user_id, cached_at); -- For cache invalidation
```

### **PHASE 4: Caching & Performance Optimization** 🔹

#### **4.1 Smart Caching Strategy**
**Cache Invalidation Rules:**
- **Cache Duration**: 1 hour for active users, 24 hours for inactive
- **Cache Miss**: Fetch from external API and update cache
- **API Failure**: Serve stale cache data if available
- **Manual Refresh**: Clear cache and force fresh fetch

#### **4.2 Performance Optimizations**
**File:** `host-service/src/lib/friends/FriendsCacheManager.ts`

```typescript
export class FriendsCacheManager {
  async getCachedFriends(userId: string): Promise<FriendInfo[] | null> {
    // Check if cache is fresh enough to serve
  }
  
  async updateCache(userId: string, friends: FriendInfo[], source: string): Promise<void> {
    // Update cache with fresh data from external API
  }
  
  async isCacheStale(userId: string): Promise<boolean> {
    // Determine if cache needs refresh
  }
}
```

**Performance Strategy:**
- ✅ **Smart Caching**: Avoid repeated API calls
- ✅ **Graceful Degradation**: Serve cached data if APIs fail
- ✅ **Rate Limiting**: Respect external API limits
- ✅ **Pagination**: Handle large friend lists efficiently

### **PHASE 5: Testing & Deployment** 🔺

#### **5.1 Integration Testing**
**Test Scenarios:**
- ✅ ENS user requests friends → EFP API called → Friends returned
- ✅ UP user requests friends → LSP26 contracts called → Friends returned  
- ✅ Anonymous user requests friends → Empty list returned
- ✅ API failure → Cached data served (if available)
- ✅ Large friend lists → Pagination works correctly

#### **5.2 Performance Testing**
**Load Testing:**
- ✅ **Response Time**: <2 seconds for friend list requests
- ✅ **Cache Hit Rate**: >80% for repeated requests
- ✅ **Rate Limiting**: Respect EFP API limits (avoid 429 errors)
- ✅ **Concurrent Users**: Handle multiple friend requests simultaneously

#### **5.3 Manual Cache Management API** (Optional)
**New Endpoint:** `POST /api/friends/refresh`

```typescript
interface RefreshRequest {
  userId: string;
  force?: boolean; // Force refresh even if cache is fresh
}

interface RefreshResponse {
  success: boolean;
  friendsCount: number;
  source: 'efp' | 'universal_profile' | 'cache' | 'none';
  cacheUpdated: boolean;
}
```

## 🔧 **TECHNICAL SPECIFICATIONS**

### **EFP API Integration**
- **Base URL**: `https://api.ethfollow.xyz/api/v1`
- **Endpoint**: `/users/{address}/following?limit=1000&offset={offset}`
- **Rate Limits**: Respect API rate limits with exponential backoff
- **Data Format**: JSON array of following relationships

### **Universal Profile Integration**
- **LSP26 Registry**: Query following relationships on-chain
- **LSP3 Metadata**: Fetch profile names/avatars via LUKSO RPC
- **Batch Processing**: Group contract calls for efficiency
- **Caching**: Cache UP metadata to reduce RPC calls

### **Database Optimization**
- **Partitioning**: Consider partitioning by `friend_source` for large datasets
- **Indexing**: Optimized indexes for pagination and lookup performance
- **Cleanup**: Automatic cleanup of stale friendship data

## 🚀 **IMPLEMENTATION PHASES**

### **Phase 1: EFP Foundation (Week 1)**
1. ✅ Research complete
2. 🔲 Create EFP friends service with API integration
3. 🔲 Database schema updates for caching
4. 🔲 Enhance DatabaseDataProvider.getUserFriends() for ENS users

### **Phase 2: Universal Profile Integration (Week 2)**
1. 🔲 Create UP friends service with LSP26 registry
2. 🔲 UP metadata resolution (LSP3)
3. 🔲 Enhance DatabaseDataProvider.getUserFriends() for UP users
4. 🔲 Unified error handling and fallbacks

### **Phase 3: Caching & Performance (Week 3)**
1. 🔲 Implement smart caching layer
2. 🔲 Cache invalidation strategies
3. 🔲 Rate limiting for external APIs
4. 🔲 Graceful degradation on API failures

### **Phase 4: Testing & Deployment (Week 4)**
1. 🔲 End-to-end integration testing
2. 🔲 Performance testing and optimization
3. 🔲 Load testing with concurrent users
4. 🔲 Production deployment and monitoring

## 🎯 **SUCCESS METRICS**

### **Functional Requirements**
- ✅ ENS users see their EFP following list as friends
- ✅ UP users see their UP following list as friends  
- ✅ Friends data loads in forum via existing `getUserFriends` API
- ✅ Sync performance: <30 seconds for 1000 friends
- ✅ Data freshness: Auto-sync within 24 hours

### **Technical Requirements**
- ✅ Zero breaking changes to existing host service API
- ✅ Backward compatibility with current forum requests
- ✅ Graceful degradation for unsupported identity types
- ✅ Rate limiting compliance with external APIs

## 🔍 **APPENDIX: Current Code Analysis**

### **Existing API Flow**
```typescript
// Forum Request (via MessageRouter)
getUserFriends(userId, communityId, limit, offset)

// Current DatabaseDataProvider implementation
SELECT friend_user_id, friend_name, friend_image_url 
FROM user_friends 
WHERE user_id = $1 AND friendship_status = 'active'
ORDER BY friend_name LIMIT $2 OFFSET $3
```

### **Host Service Enhancement Required**
The existing `getUserFriends` implementation in `DatabaseDataProvider` needs to be enhanced to:
1. **Detect user identity type** (ENS vs UP vs anonymous)  
2. **Fetch from external sources** (EFP API or UP contracts)
3. **Implement caching** for performance
4. **Handle failures gracefully** with fallback to cached data

### **Forum Integration (Unchanged)**
The forum already requests friends via:
```typescript
const response = await this.apiProxyClient.makeRequest('getUserFriends', {
  userId: currentUserId,
  communityId: communityId,
  params: { limit: 10, offset: 0 }
});
```

**This continues to work unchanged** - it will receive real friend data instead of empty results, but the host service does the smart fetching behind the scenes.

---

**Next Steps:** Ready to begin Phase 1 implementation with EFP friends service creation. 