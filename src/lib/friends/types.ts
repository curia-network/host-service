/**
 * Shared types for Universal Profile friends synchronization
 */

export interface FriendInfo {
  id: string;        // UP address or ENS address
  name: string;      // Display name or formatted address
  image?: string;    // Avatar/profile image URL
}

export interface UPProfile {
  name: string | null;
  avatar: string | null;
  description?: string | null;
}

export interface CacheEntry {
  data: FriendInfo[];
  timestamp: number;
  userId: string;
}

export interface GraphQLFollowRecord {
  address: string;
  // May include additional fields depending on schema
  follower?: string;
  followedAt?: string;
}

export interface LSP3ProfileMetadata {
  LSP3Profile: {
    name?: string;
    description?: string;
    profileImage?: Array<{
      width: number;
      height: number;
      url: string;
      verification?: any;
    }>;
    avatar?: Array<{
      url: string;
      verification?: any;
    }>;
    tags?: string[];
    links?: Array<{
      title: string;
      url: string;
    }>;
  };
} 