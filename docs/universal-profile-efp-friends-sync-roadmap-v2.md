# Universal Profile & EFP Friends Sync - Simplified Roadmap v2

## 🎯 **OBJECTIVE**
Enable the host service to deliver **real friend data** from Universal Profile (LUKSO) and ENS/EFP (Ethereum) accounts when the forum embed requests user friends via the existing `getUserFriends` API.

## 🧠 **KEY ARCHITECTURAL INSIGHT** 
**Data Flow**: Host service fetches friends directly from external EFP/UP APIs on-demand when forum requests `getUserFriends()` → Returns fresh data → No database population needed (database serves different purposes).

**Caching Strategy**: For v1, direct API calls with in-memory caching. Future enhancement: Redis-based caching layer for all "ephemeral chain data" (EFP friends, UP metadata, etc.) - much more appropriate than database caching.

## 🔄 **SIMPLIFIED DATA FLOW**

### **Current State (Broken)**
```
Forum: getUserFriends(ensUser123) 
  → DatabaseDataProvider: SELECT * FROM user_friends WHERE user_id='ensUser123'
  → Returns: [] (empty - no friends data)
```

### **Phase 1 Target (EFP Working)**
```
Forum: getUserFriends(ensUser123)
  → DatabaseDataProvider: Check user type → ENS user detected
  → DatabaseDataProvider: EfpFriendsService.fetchWithCache(0x1234...)
  → EfpFriendsService: Fetch from EFP API → Convert to FriendInfo[]
  → Returns: [50 real EFP friends] ✅
```

### **Phase 2 Target (Both Working)**  
```
Forum: getUserFriends(upUser456)
  → DatabaseDataProvider: Check user type → UP user detected
  → DatabaseDataProvider: UpFriendsService.fetchWithCache(0x5678...)
  → UpFriendsService: Fetch from LUKSO contracts → Convert to FriendInfo[]
  → Returns: [25 real UP friends] ✅
```

### **Phase 3 Target (Redis Optimized)**
```
Forum: getUserFriends(ensUser123)
  → DatabaseDataProvider: Check Redis cache first
  → Cache hit: Return cached friends (sub-10ms response)
  → Cache miss: Fetch from API → Update cache → Return friends
```

## 📋 **REVISED ROADMAP (SIMPLIFIED)**

### **🔥 PHASE 1: EFP Foundation**
**Goal**: ENS users get real EFP friends data via direct API calls

1. ✅ **EfpFriendsService** - COMPLETE
   - Fetch friends from EFP API with pagination, rate limiting, retries
   - ENS resolution for names/avatars using ensdata.net
   - In-memory caching with graceful fallback to stale data

2. 🔲 **Enhance DatabaseDataProvider.getUserFriends()**
   - Detect ENS users by checking `identity_type = 'ens'` and `wallet_address` 
   - For ENS users: call `EfpFriendsService.fetchWithCache(walletAddress, userId)`
   - For other users: return existing behavior (empty friends or cached data)
   - **ZERO forum changes needed** - existing API just returns better data

3. 🔲 **Integration Testing**
   - Test ENS user gets EFP friends data in forum  
   - Test UP/anonymous users get existing behavior (unchanged)
   - Test error handling when EFP API is down (fallback to stale cache)

### **🔥 PHASE 2: Universal Profile Integration**
**Goal**: UP users get real LUKSO friends data

4. 🔲 **Create UpFriendsService**
   - Fetch following relationships from LSP26 Following Registry contracts
   - Resolve LSP3 metadata for UP names and avatars  
   - Handle LUKSO RPC calls with similar patterns to EfpFriendsService
   - In-memory caching with graceful fallback

5. 🔲 **Enhance DatabaseDataProvider.getUserFriends() for UP**
   - Detect UP users by checking `identity_type = 'universal_profile'` and `up_address`
   - For UP users: call `UpFriendsService.fetchWithCache(upAddress, userId)`
   - Handle mixed scenarios (users with both ENS and UP identities)

6. 🔲 **Cross-Chain Testing**
   - Test both ENS and UP users get their respective friends
   - Test users with multiple identity types
   - Test error handling across both services

### **🚀 PHASE 3: Performance & Caching (FUTURE)**
**Goal**: Redis-based caching for all ephemeral chain data

7. 🔲 **Redis Caching Layer** 
   - Implement `ChainDataCache` service with Redis backend
   - Cache EFP friends, UP friends, ENS metadata, UP metadata
   - Configurable TTL for different data types (friends: 1hr, metadata: 6hr)  
   - Replace in-memory caching in both EfpFriendsService and UpFriendsService

8. 🔲 **Advanced Features**
   - Background refresh for popular users to keep cache warm
   - Bulk prefetching for active communities
   - Cache warming strategies and analytics

## 🔧 **TECHNICAL BENEFITS**

- ✅ **Zero breaking changes** - existing forum API calls just work better
- ✅ **Incremental rollout** - ENS first, then UP, then caching optimizations
- ✅ **Future-ready** - Redis caching will benefit all chain data, not just friends
- ✅ **Clean separation** - Database for persistent app data, Redis for ephemeral chain data
- ✅ **Simple v1** - Direct API calls, no complex caching logic initially

## 🚫 **EXPLICITLY REMOVED FROM SCOPE**
- ❌ Database caching (redundant when both services share same DB)
- ❌ Complex cache invalidation strategies in v1
- ❌ Common Ground friends merging (out of scope per user feedback)  
- ❌ Over-engineering the initial implementation

## 🎯 **IMMEDIATE NEXT STEPS**

**Step 2**: Enhance `DatabaseDataProvider.getUserFriends()` to detect ENS users and call `EfpFriendsService`
**Step 3**: Integration testing to ensure forum gets real friends data
**Step 4**: Create `UpFriendsService` with similar patterns to `EfpFriendsService`

**Ready to proceed with Step 2!** 🚀