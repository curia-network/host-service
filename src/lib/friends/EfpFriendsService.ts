import { FriendInfo } from '../DataProvider';

/**
 * EFP API response structure (from existing codebase patterns)
 */
interface EFPFollowRecord {
  version: number;
  record_type: string;
  data: string;
  address: string;
  tags: string[];
}

/**
 * EFP API following response structure
 */
interface EFPFollowingResponse {
  following: EFPFollowRecord[];
}

/**
 * ENS resolution result for friend metadata
 */
interface ENSProfile {
  name: string | null;
  avatar: string | null;
}

/**
 * Cache entry for EFP friends data
 */
interface EFPFriendsCache {
  friends: FriendInfo[];
  cachedAt: Date;
  expiresAt: Date;
}

/**
 * Service for fetching EFP (Ethereum Follow Protocol) friends data
 * Leverages existing EFP API patterns from the codebase
 */
export class EfpFriendsService {
  private static readonly EFP_API_BASE = 'https://api.ethfollow.xyz/api/v1';
  private static readonly ENS_DATA_API = 'https://api.ensdata.net';
  private static readonly CHUNK_SIZE = 1000; // Match existing pagination pattern
  private static readonly CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour cache
  private static readonly MAX_RETRIES = 3;
  
  // In-memory cache (will be enhanced with database caching later)
  private cache: Map<string, EFPFriendsCache> = new Map();

  /**
   * Fetch user's following list from EFP API with pagination
   * Uses existing EFP API patterns from EthereumProfileContext and verification.ts
   */
  async fetchUserFollowing(ethAddress: string): Promise<FriendInfo[]> {
    console.log(`[EfpFriendsService] Fetching following list for ${ethAddress}`);
    
    if (!this.isValidEthereumAddress(ethAddress)) {
      console.warn(`[EfpFriendsService] Invalid Ethereum address: ${ethAddress}`);
      return [];
    }

    const friends: FriendInfo[] = [];
    let offset = 0;
    let hasMore = true;
    let retryCount = 0;

    while (hasMore && friends.length < 10000) { // Reasonable limit to prevent infinite loops
      try {
        console.log(`[EfpFriendsService] Fetching chunk ${offset}-${offset + EfpFriendsService.CHUNK_SIZE}`);
        
        const response = await fetch(
          `${EfpFriendsService.EFP_API_BASE}/users/${ethAddress}/following?limit=${EfpFriendsService.CHUNK_SIZE}&offset=${offset}`
        );

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limiting - wait and retry
            await this.waitWithBackoff(retryCount);
            retryCount++;
            if (retryCount >= EfpFriendsService.MAX_RETRIES) {
              console.error(`[EfpFriendsService] Max retries exceeded for ${ethAddress}`);
              break;
            }
            continue;
          }
          throw new Error(`EFP API error: ${response.status} ${response.statusText}`);
        }

        const data: EFPFollowingResponse = await response.json();
        const followingList = data.following || [];
        
        console.log(`[EfpFriendsService] Chunk ${offset}: ${followingList.length} items`);

        if (followingList.length === 0) {
          hasMore = false;
          break;
        }

        // Process chunk and convert to FriendInfo format
        const chunkFriends = await this.processFollowingChunk(followingList);
        friends.push(...chunkFriends);

        // Prepare for next iteration
        offset += EfpFriendsService.CHUNK_SIZE;
        retryCount = 0; // Reset retry count on successful request

        // Rate limiting: small delay between requests
        await this.delay(100);

      } catch (error) {
        console.error(`[EfpFriendsService] Error fetching chunk ${offset}:`, error);
        
        retryCount++;
        if (retryCount >= EfpFriendsService.MAX_RETRIES) {
          console.error(`[EfpFriendsService] Max retries exceeded, stopping fetch for ${ethAddress}`);
          break;
        }
        
        await this.waitWithBackoff(retryCount);
      }
    }

    console.log(`[EfpFriendsService] ✅ Fetched ${friends.length} friends for ${ethAddress}`);
    return friends;
  }

  /**
   * Fetch friends with caching layer
   * Checks cache first, fetches from API if stale/missing
   */
  async fetchWithCache(ethAddress: string, userId: string): Promise<FriendInfo[]> {
    console.log(`[EfpFriendsService] Fetching friends with cache for ${ethAddress} (userId: ${userId})`);

    // Check cache first
    const cacheKey = `${ethAddress.toLowerCase()}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && new Date() < cached.expiresAt) {
      console.log(`[EfpFriendsService] ✅ Cache hit for ${ethAddress}, ${cached.friends.length} friends`);
      return cached.friends;
    }

    // Cache miss or expired - fetch fresh data
    console.log(`[EfpFriendsService] Cache miss/expired for ${ethAddress}, fetching from API`);
    
    try {
      const friends = await this.fetchUserFollowing(ethAddress);
      
      // Update cache
      this.cache.set(cacheKey, {
        friends,
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() + EfpFriendsService.CACHE_DURATION_MS)
      });
      
      console.log(`[EfpFriendsService] ✅ Cached ${friends.length} friends for ${ethAddress}`);
      return friends;
      
    } catch (error) {
      console.error(`[EfpFriendsService] Failed to fetch friends for ${ethAddress}:`, error);
      
      // Return stale cache if available as fallback
      if (cached) {
        console.log(`[EfpFriendsService] Returning stale cache as fallback: ${cached.friends.length} friends`);
        return cached.friends;
      }
      
      // No cache available, return empty array
      console.log(`[EfpFriendsService] No cache available, returning empty friends list`);
      return [];
    }
  }

  /**
   * Process a chunk of EFP following records and convert to FriendInfo format
   */
  private async processFollowingChunk(followingList: EFPFollowRecord[]): Promise<FriendInfo[]> {
    const friends: FriendInfo[] = [];
    
    // Process in smaller batches to avoid overwhelming ENS API
    const batchSize = 10;
    for (let i = 0; i < followingList.length; i += batchSize) {
      const batch = followingList.slice(i, i + batchSize);
      const batchPromises = batch.map(record => this.convertToFriendInfo(record));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            friends.push(result.value);
          } else {
            console.warn(`[EfpFriendsService] Failed to process friend ${batch[index].address}:`, 
              result.status === 'rejected' ? result.reason : 'null result');
          }
        });
        
        // Rate limiting between batches
        if (i + batchSize < followingList.length) {
          await this.delay(200);
        }
        
      } catch (error) {
        console.error(`[EfpFriendsService] Error processing batch ${i}-${i + batchSize}:`, error);
      }
    }
    
    return friends;
  }

  /**
   * Convert EFP record to FriendInfo format
   * Uses ENS resolution for names and avatars
   */
  private async convertToFriendInfo(record: EFPFollowRecord): Promise<FriendInfo | null> {
    try {
      // Get the address (could be in 'address' or 'data' field)
      const friendAddress = record.address || record.data;
      if (!friendAddress || !this.isValidEthereumAddress(friendAddress)) {
        return null;
      }

      // Try to resolve ENS name and avatar
      const ensProfile = await this.resolveENSProfile(friendAddress);
      
      // Create FriendInfo with fallback to address if no ENS name
      const friendInfo: FriendInfo = {
        id: friendAddress.toLowerCase(), // Use address as unique ID
        name: ensProfile.name || this.formatAddress(friendAddress), // ENS name or shortened address
        imageUrl: ensProfile.avatar || undefined // ENS avatar if available
      };

      return friendInfo;
      
    } catch (error) {
      console.warn(`[EfpFriendsService] Error converting EFP record to FriendInfo:`, error);
      return null;
    }
  }

  /**
   * Resolve ENS name and avatar for an Ethereum address
   * Uses ENSData.net API (same pattern as existing ensResolution.ts)
   */
  private async resolveENSProfile(address: string): Promise<ENSProfile> {
    try {
      console.log(`[EfpFriendsService] Resolving ENS for ${address}`);
      
      const response = await fetch(`${EfpFriendsService.ENS_DATA_API}/${address}`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          name: data.ens || null, // Use 'ens' field instead of 'name'
          avatar: data.avatar || null
        };
      }
      
      return { name: null, avatar: null };
      
    } catch (error) {
      console.warn(`[EfpFriendsService] ENS resolution failed for ${address}:`, error);
      return { name: null, avatar: null };
    }
  }

  /**
   * Format Ethereum address for display (show first 6 and last 4 characters)
   */
  private formatAddress(address: string): string {
    if (address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Validate Ethereum address format
   */
  private isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Exponential backoff for retries
   */
  private async waitWithBackoff(retryCount: number): Promise<void> {
    const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
    console.log(`[EfpFriendsService] Waiting ${backoffMs}ms before retry ${retryCount + 1}`);
    await this.delay(backoffMs);
  }

  /**
   * Clear cache for a specific address (useful for manual refresh)
   */
  clearCache(ethAddress: string): void {
    const cacheKey = ethAddress.toLowerCase();
    this.cache.delete(cacheKey);
    console.log(`[EfpFriendsService] Cleared cache for ${ethAddress}`);
  }

  /**
   * Get cache stats for debugging
   */
  getCacheStats(): { size: number; entries: Array<{ address: string; friendsCount: number; cachedAt: Date; expiresAt: Date }> } {
    const entries = Array.from(this.cache.entries()).map(([address, cache]) => ({
      address,
      friendsCount: cache.friends.length,
      cachedAt: cache.cachedAt,
      expiresAt: cache.expiresAt
    }));

    return {
      size: this.cache.size,
      entries
    };
  }
}