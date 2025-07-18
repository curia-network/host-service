/**
 * API Types - Shared interfaces for all API operations
 * 
 * These types match the existing host service API structure
 * and ensure type safety across the proxy system.
 */

/**
 * Base API request interface
 */
export interface ApiRequest {
  method: string;
  params?: Record<string, any>;
  userId: string;
  communityId: string;
}

/**
 * Base API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * API method types that can be proxied
 */
export type ApiMethod = 
  | 'getUserInfo'
  | 'getUserFriends'
  | 'getContextData'
  | 'getCommunityInfo'
  | 'giveRole';

/**
 * API endpoint mapping
 */
export const API_ENDPOINTS: Record<string, string> = {
  getUserInfo: '/api/user',
  getUserFriends: '/api/user',
  getContextData: '/api/user',
  getCommunityInfo: '/api/community',
  giveRole: '/api/community'
};

/**
 * User API method types
 */
export interface GetUserInfoRequest extends ApiRequest {
  method: 'getUserInfo';
}

export interface GetUserFriendsRequest extends ApiRequest {
  method: 'getUserFriends';
  params: {
    limit?: number;
    offset?: number;
  };
}

export interface GetContextDataRequest extends ApiRequest {
  method: 'getContextData';
}

/**
 * Community API method types
 */
export interface GetCommunityInfoRequest extends ApiRequest {
  method: 'getCommunityInfo';
}

export interface GiveRoleRequest extends ApiRequest {
  method: 'giveRole';
  params: {
    roleId: string;
    userId: string;
  };
}

/**
 * Union type for all API requests
 */
export type ApiRequestUnion = 
  | GetUserInfoRequest
  | GetUserFriendsRequest
  | GetContextDataRequest
  | GetCommunityInfoRequest
  | GiveRoleRequest;

/**
 * Helper function to get API endpoint for a method
 */
export function getEndpointForMethod(method: ApiMethod): string {
  const endpoint = API_ENDPOINTS[method];
  if (!endpoint) {
    throw new Error(`Unknown API method: ${method}`);
  }
  return endpoint;
}

/**
 * Helper function to validate API request
 */
export function validateApiRequest(request: ApiRequest): request is ApiRequestUnion {
  return !!(
    request.method &&
    request.userId &&
    request.communityId &&
    API_ENDPOINTS[request.method]
  );
} 