import { GraphQLClient, gql } from 'graphql-request';
import { ethers } from 'ethers';
import ERC725 from '@erc725/erc725.js';
import { ERC725YDataKeys } from '@lukso/lsp-smart-contracts';
import { FriendInfo, UPProfile, CacheEntry, GraphQLFollowRecord, LSP3ProfileMetadata } from './types';

/**
 * Service for fetching Universal Profile friends using LUKSO's GraphQL indexer
 * with RPC fallback and LSP3 profile resolution
 */
export class UpFriendsService {
  private static readonly LUKSO_GRAPHQL_URL = process.env.LUKSO_GRAPHQL_URL || 'https://envio.lukso-mainnet.universal.tech/v1/graphql';
  private static readonly LUKSO_RPC_URL = process.env.LUKSO_RPC_URL || 'https://rpc.mainnet.lukso.network';
  private static readonly LUKSO_IPFS_GATEWAY = process.env.LUKSO_IPFS_GATEWAY_URL || 'https://api.universalprofile.cloud/ipfs/';
  
  // LSP26 Follower Registry Contract (LUKSO mainnet)
  private static readonly LSP26_CONTRACT_ADDRESS = '0xf01103E5a9909Fc0DBe8166dA7085e0285daDDcA';
  
  private static readonly CHUNK_SIZE = 100; // Process UP following in chunks
  private static readonly CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour cache
  private static readonly PROFILE_CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hour cache for profiles
  private static readonly MAX_RETRIES = 3;
  
  private graphqlClient: GraphQLClient;
  private provider: ethers.providers.JsonRpcProvider;
  private lsp26Contract: ethers.Contract;
  private cache = new Map<string, CacheEntry>();
  private profileCache = new Map<string, { profile: UPProfile; timestamp: number }>();
  private schemaDiscovered = false;
  private followingQueryStructure: string | null = null;

  constructor() {
    console.log(`[UpFriendsService] Initializing with GraphQL: ${UpFriendsService.LUKSO_GRAPHQL_URL}`);
    
    // Initialize GraphQL client
    this.graphqlClient = new GraphQLClient(UpFriendsService.LUKSO_GRAPHQL_URL);

    // Initialize RPC provider and LSP26 contract for fallback
    // LUKSO mainnet configuration (Chain ID: 42)
    const luksoNetwork = {
      name: 'lukso-mainnet',
      chainId: 42,
      ensAddress: undefined // LUKSO doesn't use ENS
    };

    this.provider = new ethers.providers.JsonRpcProvider({
      url: UpFriendsService.LUKSO_RPC_URL,
      timeout: 30000 // 30 second timeout
    }, luksoNetwork);
    
    console.log(`[UpFriendsService] 🌐 Configured LUKSO RPC: ${UpFriendsService.LUKSO_RPC_URL} (Chain ID: 42)`);
    
    // LSP26 contract ABI (minimal for our needs)
    const lsp26ABI = [
      'function followingCount(address) view returns (uint256)',
      'function getFollowsByIndex(address, uint256, uint256) view returns (address[])',
      'function followerCount(address) view returns (uint256)',
      'function isFollowing(address, address) view returns (bool)'
    ];
    
    this.lsp26Contract = new ethers.Contract(
      UpFriendsService.LSP26_CONTRACT_ADDRESS,
      lsp26ABI,
      this.provider
    );
  }

  /**
   * Main entry point: Fetch friends for a Universal Profile with caching
   */
  async fetchWithCache(upAddress: string, userId: string): Promise<FriendInfo[]> {
    console.log(`[UpFriendsService] Fetching friends for UP: ${upAddress} (User: ${userId})`);

    // Validate UP address format
    if (!this.isValidEthereumAddress(upAddress)) {
      console.error(`[UpFriendsService] Invalid UP address format: ${upAddress}`);
      return [];
    }

    // Check cache first
    const cached = this.cache.get(upAddress);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < UpFriendsService.CACHE_DURATION_MS) {
      console.log(`[UpFriendsService] ✅ Cache hit for ${upAddress} (${cached.data.length} friends)`);
      return cached.data;
    }

    try {
      // Fetch fresh data from LUKSO (GraphQL first, RPC fallback)
      const friends = await this.fetchUserFollowing(upAddress);
      
      // Update cache
      this.cache.set(upAddress, {
        data: friends,
        timestamp: now,
        userId
      });

      console.log(`[UpFriendsService] ✅ Successfully fetched ${friends.length} friends for ${upAddress}`);
      return friends;

    } catch (error) {
      console.error(`[UpFriendsService] ❌ Error fetching UP friends for ${upAddress}:`, error);

      // Return stale cache if available as fallback
      if (cached) {
        console.warn(`[UpFriendsService] ⚠️ Using stale cache for ${upAddress}`);
        return cached.data;
      }

      // No cache available, return empty array
      return [];
    }
  }

  /**
   * Fetch following list using GraphQL (primary) with RPC fallback
   */
  private async fetchUserFollowing(upAddress: string): Promise<FriendInfo[]> {
    console.log(`[UpFriendsService] 🔍 Querying following list for ${upAddress}`);

    try {
      // Try GraphQL first (recommended approach)
      const followingAddresses = await this.fetchFollowingFromGraphQL(upAddress);
      console.log(`[UpFriendsService] ✅ GraphQL returned ${followingAddresses.length} following addresses`);
      
      // Convert addresses to friend info with profile resolution
      return await this.convertAddressesToFriends(followingAddresses);
      
    } catch (graphqlError: unknown) {
      const graphqlErrorMessage = graphqlError instanceof Error ? graphqlError.message : 'Unknown GraphQL error';
      console.warn(`[UpFriendsService] ⚠️ GraphQL query failed, falling back to RPC:`, graphqlError);
      
      try {
        // Fallback to direct RPC contract calls
        const followingAddresses = await this.fetchFollowingFromContract(upAddress);
        console.log(`[UpFriendsService] ✅ RPC fallback returned ${followingAddresses.length} following addresses`);
        
        return await this.convertAddressesToFriends(followingAddresses);
        
      } catch (rpcError: unknown) {
        const rpcErrorMessage = rpcError instanceof Error ? rpcError.message : 'Unknown RPC error';
        console.error(`[UpFriendsService] ❌ Both GraphQL and RPC failed:`, rpcError);
        throw new Error(`Failed to fetch following list: GraphQL (${graphqlErrorMessage}), RPC (${rpcErrorMessage})`);
      }
    }
  }

  /**
   * Fetch following list from GraphQL indexer (primary method)
   */
  private async fetchFollowingFromGraphQL(upAddress: string): Promise<string[]> {
    console.log(`[UpFriendsService] 🔍 Querying GraphQL indexer for ${upAddress}`);

    // Track current query address for filtering
    this.currentQueryAddress = upAddress;

    // Discover schema structure on first use
    if (!this.schemaDiscovered) {
      await this.discoverGraphQLSchema();
    }

    // If we couldn't discover the schema, throw error to trigger RPC fallback
    if (!this.followingQueryStructure) {
      throw new Error('GraphQL schema discovery failed - no suitable query structure found');
    }

    try {
      // Execute the discovered query structure
      const variables = { 
        upAddress: upAddress.toLowerCase(),
        limit: 1000 // Large limit for initial implementation
      };

      console.log(`[UpFriendsService] 🚀 Executing GraphQL query with variables:`, variables);
      const response = await this.graphqlClient.request(this.followingQueryStructure, variables);
      console.log(`[UpFriendsService] 📥 GraphQL response:`, JSON.stringify(response, null, 2));

      // Extract addresses from response (structure depends on actual schema)
      const followRecords: GraphQLFollowRecord[] = this.extractFollowRecordsFromResponse(response);
      const addresses = followRecords.map(record => record.address);

      console.log(`[UpFriendsService] ✅ Extracted ${addresses.length} following addresses from GraphQL`);
      return addresses;

    } catch (error) {
      console.error(`[UpFriendsService] ❌ GraphQL query execution failed:`, error);
      throw error;
    }
  }

  /**
   * Discover GraphQL schema structure to build appropriate queries
   */
  private async discoverGraphQLSchema(): Promise<void> {
    console.log(`[UpFriendsService] 🔍 Discovering GraphQL schema structure...`);

    try {
      // Enhanced introspection to discover Follow table structure
      const FOLLOW_TABLE_INTROSPECTION = gql`
        query FollowTableIntrospection {
          __schema {
            types {
              name
              fields {
                name
                type {
                  name
                  kind
                  ofType {
                    name
                    kind
                  }
                }
              }
            }
          }
        }
      `;

      const introspectionResult: any = await this.graphqlClient.request(FOLLOW_TABLE_INTROSPECTION);
      const allTypes = introspectionResult.__schema.types;

      console.log(`[UpFriendsService] 📊 Total schema types found: ${allTypes.length}`);

      // Find the Follow table type
      const followType = allTypes.find((type: any) => type.name === 'Follow');
      if (followType && followType.fields) {
        console.log(`[UpFriendsService] 📋 Follow table fields:`, followType.fields.map((f: any) => f.name));
        
        // Look for common field names that might represent the follower and followed addresses
        const hasFollower = followType.fields.some((f: any) => f.name.toLowerCase().includes('follower'));
        const hasFollowed = followType.fields.some((f: any) => f.name.toLowerCase().includes('followed'));
        const hasAddress = followType.fields.some((f: any) => f.name.toLowerCase().includes('address'));
        const hasTarget = followType.fields.some((f: any) => f.name.toLowerCase().includes('target'));

        console.log(`[UpFriendsService] 🔍 Follow table analysis: follower=${hasFollower}, followed=${hasFollowed}, address=${hasAddress}, target=${hasTarget}`);

        // Try different query structures based on discovered schema
        if (hasFollower) {
          // Use the correct field names discovered from schema introspection
          this.followingQueryStructure = gql`
            query GetFollowing($upAddress: String!, $limit: Int) {
              Follow(where: { follower_id: { _eq: $upAddress } }, limit: $limit) {
                follower_id
                followee_id
                createdTimestamp
              }
            }
          `;
          console.log(`[UpFriendsService] ✅ Built corrected query for Follow table with follower_id/followee_id`);
        }
      }

      // Fallback: Try basic introspection if Follow table introspection didn't work
      if (!this.followingQueryStructure) {
        const BASIC_INTROSPECTION = gql`
          query BasicIntrospection {
            __schema {
              queryType {
                fields {
                  name
                  description
                  args {
                    name
                    type {
                      name
                      kind
                    }
                  }
                }
              }
            }
          }
        `;

        const basicResult: any = await this.graphqlClient.request(BASIC_INTROSPECTION);
        const queryFields = basicResult.__schema.queryType.fields;

        console.log(`[UpFriendsService] Available query fields:`, queryFields.map((f: any) => f.name));

        // Look for follow-related queries
        const possibleFollowQueries = queryFields.filter((field: any) => 
          field.name.toLowerCase().includes('follow') || 
          field.name.toLowerCase().includes('social') ||
          field.name.toLowerCase().includes('connection')
        );

        if (possibleFollowQueries.length > 0) {
          console.log(`[UpFriendsService] Found potential follow queries:`, possibleFollowQueries.map((f: any) => f.name));
          
          // Use the Follow query with correct field names
          this.followingQueryStructure = gql`
            query GetFollowing($upAddress: String!, $limit: Int) {
              Follow(where: { follower_id: { _eq: $upAddress } }, limit: $limit) {
                follower_id
                followee_id
                createdTimestamp
              }
            }
          `;

          console.log(`[UpFriendsService] ✅ Built fallback query structure for Follow`);
        }
      }

      this.schemaDiscovered = true;

    } catch (error) {
      console.error(`[UpFriendsService] ❌ Schema discovery failed:`, error);
      this.schemaDiscovered = true; // Mark as attempted to avoid retry loops
    }
  }

  /**
   * Extract follow records from GraphQL response (adaptable to different schemas)
   */
  private extractFollowRecordsFromResponse(response: any): GraphQLFollowRecord[] {
    console.log(`[UpFriendsService] 🔍 Processing GraphQL response...`);

    // Check for Follow array in response
    if (response.Follow && Array.isArray(response.Follow)) {
      const followData = response.Follow;
      console.log(`[UpFriendsService] 📋 Found Follow array with ${followData.length} items`);
      
      // Log a sample item to understand the structure
      if (followData.length > 0) {
        console.log(`[UpFriendsService] 📝 Sample Follow item:`, followData[0]);
      }
      
      // Extract addresses using the correct field names from LUKSO schema
      const followRecords = followData.map((item: any) => ({
        address: item.followee_id, // The address being followed
        follower: item.follower_id, // The follower (should match our query address)
        followedAt: item.createdTimestamp
      })).filter((record: any) => record.address); // Filter out invalid records

      console.log(`[UpFriendsService] ✅ Extracted ${followRecords.length} follow records`);
      
      // Validate that follower matches our query address (additional safety check)
      const upAddress = this.getCurrentQueryAddress();
      if (upAddress) {
        const validRecords = followRecords.filter((record: any) => 
          record.follower && record.follower.toLowerCase() === upAddress.toLowerCase()
        );
        
        if (validRecords.length !== followRecords.length) {
          console.warn(`[UpFriendsService] ⚠️ Filtered ${followRecords.length - validRecords.length} records with mismatched follower`);
        }
        
        console.log(`[UpFriendsService] 🔍 Validated ${validRecords.length} records where ${upAddress} is the follower`);
        return validRecords;
      }
      
      return followRecords;
    }

    // Fallback: try to find any array in the response
    const possibleKeys = Object.keys(response);
    console.log(`[UpFriendsService] ⚠️ 'Follow' key not found. Available keys:`, possibleKeys);

    for (const key of possibleKeys) {
      const data = response[key];
      if (Array.isArray(data) && data.length > 0) {
        console.log(`[UpFriendsService] 📋 Trying array "${key}" with ${data.length} items`);
        console.log(`[UpFriendsService] 📝 Sample item from ${key}:`, data[0]);
        
        // Try to extract with flexible field names (backwards compatibility)
        const followRecords = data.map((item: any) => {
          const address = item.followee_id || 
                         item.address || 
                         item.followed || 
                         item.target || 
                         item.to ||
                         item.following ||
                         item.followee;
          
          const follower = item.follower_id ||
                          item.follower || 
                          item.from ||
                          item.followerAddress;
          
          return {
            address,
            follower,
            followedAt: item.createdTimestamp || item.followedAt || item.created_at || item.timestamp
          };
        }).filter((record: any) => record.address);

        if (followRecords.length > 0) {
          console.log(`[UpFriendsService] ✅ Extracted ${followRecords.length} records from fallback method`);
          return followRecords;
        }
      }
    }

    console.warn(`[UpFriendsService] ⚠️ Could not extract follow records from response`);
    return [];
  }

  // Helper to track current query address for filtering
  private currentQueryAddress: string | null = null;

  private getCurrentQueryAddress(): string | null {
    return this.currentQueryAddress;
  }

  /**
   * Fetch following list from LSP26 contract (RPC fallback)
   */
  private async fetchFollowingFromContract(upAddress: string): Promise<string[]> {
    console.log(`[UpFriendsService] 🔍 Querying LSP26 contract for ${upAddress}`);

    try {
      // First, test the RPC connection
      console.log(`[UpFriendsService] 🧪 Testing LUKSO RPC connection...`);
      const network = await this.provider.getNetwork();
      console.log(`[UpFriendsService] ✅ Connected to network:`, network);

      // Test if the contract exists
      const contractCode = await this.provider.getCode(UpFriendsService.LSP26_CONTRACT_ADDRESS);
      if (contractCode === '0x') {
        throw new Error(`LSP26 contract not found at ${UpFriendsService.LSP26_CONTRACT_ADDRESS}`);
      }
      console.log(`[UpFriendsService] ✅ LSP26 contract found at ${UpFriendsService.LSP26_CONTRACT_ADDRESS}`);

      // Get total following count
      console.log(`[UpFriendsService] 📊 Checking following count for ${upAddress}...`);
      const followingCount = await this.lsp26Contract.followingCount(upAddress);
      const totalFollowing = followingCount.toNumber();

      console.log(`[UpFriendsService] 📊 Found ${totalFollowing} following connections`);

      if (totalFollowing === 0) {
        return [];
      }

      // Fetch following addresses in chunks
      const allAddresses: string[] = [];
      
      for (let offset = 0; offset < totalFollowing; offset += UpFriendsService.CHUNK_SIZE) {
        const endIndex = Math.min(offset + UpFriendsService.CHUNK_SIZE - 1, totalFollowing - 1);
        
        console.log(`[UpFriendsService] Fetching addresses ${offset} to ${endIndex}`);
        
        const addresses = await this.lsp26Contract.getFollowsByIndex(upAddress, offset, endIndex);
        allAddresses.push(...addresses);

        // Rate limiting
        if (endIndex < totalFollowing - 1) {
          await this.delay(100); // Small delay between chunks
        }
      }

      console.log(`[UpFriendsService] ✅ Retrieved ${allAddresses.length} addresses from LSP26 contract`);
      return allAddresses.filter(addr => addr !== ethers.constants.AddressZero);

    } catch (error) {
      console.error(`[UpFriendsService] ❌ Error fetching from LSP26 contract:`, error);
      
      // Log additional debugging information
      if (error instanceof Error) {
        console.error(`[UpFriendsService] 🔍 Error details: ${error.message}`);
        if (error.message.includes('could not detect network')) {
          console.error(`[UpFriendsService] 🌐 Network detection failed. RPC URL: ${UpFriendsService.LUKSO_RPC_URL}`);
          console.error(`[UpFriendsService] 💡 Suggestion: Check if LUKSO_RPC_URL environment variable is set correctly`);
        }
      }
      
      throw error;
    }
  }

  /**
   * Convert UP addresses to FriendInfo with batch profile resolution
   */
  private async convertAddressesToFriends(addresses: string[]): Promise<FriendInfo[]> {
    console.log(`[UpFriendsService] 🔄 Converting ${addresses.length} addresses to FriendInfo`);

    if (addresses.length === 0) {
      return [];
    }

    // Batch resolve profiles for efficiency
    const profileMap = await this.batchResolveProfiles(addresses);
    
    // Convert addresses to FriendInfo using resolved profiles
    const friends: FriendInfo[] = addresses.map(address => {
      const profile = profileMap.get(address);
      
      return {
        id: address,
        name: profile?.name || this.formatAddress(address),
        image: profile?.avatar || undefined // TODO: Add avatar support
      };
    });

    console.log(`[UpFriendsService] ✅ Successfully converted ${friends.length}/${addresses.length} addresses`);
    return friends;
  }

  /**
   * Batch resolve UP profiles using GraphQL for optimal performance
   */
  private async batchResolveProfiles(addresses: string[]): Promise<Map<string, UPProfile>> {
    console.log(`[UpFriendsService] 📦 Batch resolving ${addresses.length} UP profiles`);
    
    const profileMap = new Map<string, UPProfile>();
    const now = Date.now();
    
    // Check cache first and collect uncached addresses
    const uncachedAddresses: string[] = [];
    
    for (const address of addresses) {
      const cached = this.profileCache.get(address);
      if (cached && (now - cached.timestamp) < UpFriendsService.PROFILE_CACHE_DURATION_MS) {
        profileMap.set(address, cached.profile);
      } else {
        uncachedAddresses.push(address);
      }
    }
    
    console.log(`[UpFriendsService] 💾 Found ${profileMap.size} cached profiles, fetching ${uncachedAddresses.length} from GraphQL`);
    
    if (uncachedAddresses.length === 0) {
      return profileMap;
    }

    try {
      // Batch query uncached profiles from GraphQL
      const BATCH_PROFILE_QUERY = gql`
        query GetBatchProfiles($addresses: [String!]!) {
          Profile(where: { id: { _in: $addresses } }) {
            id
            name
            fullName
            description
          }
        }
      `;

      const variables = { 
        addresses: uncachedAddresses.map(addr => addr.toLowerCase()) 
      };
      
      const response: any = await this.graphqlClient.request(BATCH_PROFILE_QUERY, variables);

      if (response.Profile && Array.isArray(response.Profile)) {
        // Process found profiles
        response.Profile.forEach((profileData: any) => {
          const address = profileData.id; // GraphQL returns lowercase
          const originalAddress = addresses.find(addr => addr.toLowerCase() === address);
          
          if (originalAddress) {
            const profile: UPProfile = {
              name: profileData.name || profileData.fullName || null,
              avatar: null, // TODO: Add avatar resolution
              description: profileData.description || null
            };
            
            profileMap.set(originalAddress, profile);
            
            // Cache the profile
            this.profileCache.set(originalAddress, {
              profile,
              timestamp: now
            });
          }
        });
        
        console.log(`[UpFriendsService] ✅ Resolved ${response.Profile.length} profiles via batch GraphQL`);
      }
      
      // Add empty profiles for addresses not found in GraphQL
      for (const address of uncachedAddresses) {
        if (!profileMap.has(address)) {
          const emptyProfile: UPProfile = { name: null, avatar: null };
          profileMap.set(address, emptyProfile);
          
          // Cache the empty profile to avoid repeated lookups
          this.profileCache.set(address, {
            profile: emptyProfile,
            timestamp: now
          });
        }
      }
      
    } catch (error) {
      console.error(`[UpFriendsService] ❌ Batch profile resolution failed:`, error);
      
      // Add fallback profiles for all uncached addresses
      for (const address of uncachedAddresses) {
        if (!profileMap.has(address)) {
          const fallbackProfile: UPProfile = { name: null, avatar: null };
          profileMap.set(address, fallbackProfile);
          
          // Cache the fallback to avoid repeated failures
          this.profileCache.set(address, {
            profile: fallbackProfile,
            timestamp: now
          });
        }
      }
    }
    
    return profileMap;
  }

  /**
   * Convert single UP address to FriendInfo
   */
  private async convertAddressToFriendInfo(upAddress: string): Promise<FriendInfo | null> {
    try {
      // Resolve UP profile data (name and avatar)
      const upProfile = await this.resolveUPProfile(upAddress);

      const friendInfo: FriendInfo = {
        id: upAddress,
        name: upProfile.name || this.formatAddress(upAddress),
        image: upProfile.avatar || undefined
      };

      return friendInfo;

    } catch (error) {
      console.error(`[UpFriendsService] ❌ Error converting UP ${upAddress}:`, error);
      
      // Return basic info with formatted address as fallback
      return {
        id: upAddress,
        name: this.formatAddress(upAddress)
      };
    }
  }

  /**
   * Resolve Universal Profile data using LUKSO GraphQL indexer (replaces ERC725.js)
   */
  private async resolveUPProfile(upAddress: string): Promise<UPProfile> {
    // Check profile cache first
    const cached = this.profileCache.get(upAddress);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < UpFriendsService.PROFILE_CACHE_DURATION_MS) {
      return cached.profile;
    }

    try {
      console.log(`[UpFriendsService] 🔍 Resolving UP profile via GraphQL for ${upAddress}`);

      // Query profile data from LUKSO GraphQL indexer
      const PROFILE_QUERY = gql`
        query GetProfile($upAddress: String!) {
          Profile(where: { id: { _eq: $upAddress } }) {
            id
            name
            fullName
            description
          }
        }
      `;

      const variables = { upAddress: upAddress.toLowerCase() };
      const response: any = await this.graphqlClient.request(PROFILE_QUERY, variables);

      if (response.Profile && response.Profile.length > 0) {
        const profileData = response.Profile[0];
        
        const profile: UPProfile = {
          name: profileData.name || profileData.fullName || null,
          avatar: null, // TODO: Add avatar resolution in next iteration
          description: profileData.description || null
        };

        // Cache the profile
        this.profileCache.set(upAddress, {
          profile,
          timestamp: now
        });

        console.log(`[UpFriendsService] ✅ Resolved profile via GraphQL: ${profile.name} (${upAddress})`);
        return profile;
      }

      // No profile data found
      const emptyProfile: UPProfile = { name: null, avatar: null };
      this.profileCache.set(upAddress, { profile: emptyProfile, timestamp: now });
      return emptyProfile;

    } catch (error) {
      console.warn(`[UpFriendsService] ⚠️ GraphQL profile resolution failed for ${upAddress}:`, error);
      const emptyProfile: UPProfile = { name: null, avatar: null };
      this.profileCache.set(upAddress, { profile: emptyProfile, timestamp: now });
      return emptyProfile;
    }
  }

  /**
   * Extract avatar URL from LSP3 metadata
   */
  private extractAvatarUrl(lsp3Profile: any): string | null {
    // Try profileImage first (most common)
    if (lsp3Profile?.profileImage && Array.isArray(lsp3Profile.profileImage)) {
      const profileImage = lsp3Profile.profileImage[0]; // Use first image
      if (profileImage?.url) {
        return this.resolveIpfsUrl(profileImage.url);
      }
    }

    // Fallback to avatar field
    if (lsp3Profile?.avatar && Array.isArray(lsp3Profile.avatar)) {
      const avatar = lsp3Profile.avatar[0]; // Use first avatar
      if (avatar?.url) {
        return this.resolveIpfsUrl(avatar.url);
      }
    }

    return null;
  }

  /**
   * Convert IPFS URLs to HTTP gateway URLs
   */
  private resolveIpfsUrl(url: string): string {
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', UpFriendsService.LUKSO_IPFS_GATEWAY);
    }
    return url; // Already HTTP or other format
  }

  /**
   * Utility: Format address for display
   */
  private formatAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Utility: Split array into chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Utility: Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Utility: Check if address is valid Ethereum address
   */
  private isValidEthereumAddress(address: string): boolean {
    return ethers.utils.isAddress(address);
  }
}