/**
 * @curia/iframe-api-proxy - Main exports
 * 
 * API proxy system for iframe-based applications to bypass CSP restrictions.
 * Provides client-side (customer page) and server-side (iframe) components.
 */

// Core client components
export { ApiProxyClient } from './client/ApiProxyClient';

// Core server components
export { ApiProxyServer } from './server/ApiProxyServer';

// Import for use in helper functions
import { ApiProxyClient } from './client/ApiProxyClient';
import { ApiProxyServer } from './server/ApiProxyServer';

// Type definitions
export type {
  // API types
  ApiRequest,
  ApiResponse,
  ApiMethod,
  ApiRequestUnion,
  GetUserInfoRequest,
  GetUserFriendsRequest,
  GetContextDataRequest,
  GetCommunityInfoRequest,
  GiveRoleRequest
} from './types/ApiTypes';

export {
  // API utilities (non-type exports)
  API_ENDPOINTS,
  getEndpointForMethod,
  validateApiRequest
} from './types/ApiTypes';

export type {
  // Message types
  MessageType,
  BaseMessage,
  ForumApiRequestMessage,
  ProxyApiRequestMessage,
  ProxyApiResponseMessage,
  ForumApiResponseMessage,
  ProxyErrorMessage,
  ProxyInitMessage,
  ProxyReadyMessage,
  ProxyMessage
} from './types/MessageTypes';

export {
  // Message utilities (non-type exports)
  isProxyApiRequest,
  isProxyApiResponse,
  isForumApiRequest,
  isProxyError,
  generateRequestId,
  createErrorMessage,
  createProxyRequest,
  createProxyResponse
} from './types/MessageTypes';

export type {
  // Proxy configuration types
  ProxyClientConfig,
  ProxyServerConfig,
  ProxyClientStatus,
  ProxyServerStatus,
  ProxyError,
  ProxyErrorType,
  PendingRequest,
  RequestTimeout
} from './types/ProxyTypes';

export {
  // Proxy utilities (non-type exports)
  DEFAULT_CLIENT_CONFIG,
  DEFAULT_SERVER_CONFIG,
  createProxyError,
  mergeClientConfig,
  mergeServerConfig,
  validateServerConfig,
  isOriginAllowed
} from './types/ProxyTypes';

// Version information
export const VERSION = '1.0.0';

// Package information
export const PACKAGE_NAME = '@curia_/iframe-api-proxy';

/**
 * Quick start helper for client-side integration
 */
export function createProxyClient(config?: Partial<import('./types/ProxyTypes').ProxyClientConfig>): ApiProxyClient {
  return new ApiProxyClient(config);
}

/**
 * Quick start helper for server-side integration
 */
export function createProxyServer(config: import('./types/ProxyTypes').ProxyServerConfig): ApiProxyServer {
  return new ApiProxyServer(config);
}

/**
 * Package metadata
 */
export const METADATA = {
  name: PACKAGE_NAME,
  version: VERSION,
  description: 'API proxy system for iframe-based applications to bypass CSP restrictions',
  repository: 'https://github.com/curia/host-service/tree/main/packages/iframe-api-proxy',
  documentation: 'https://github.com/curia/host-service/blob/main/packages/iframe-api-proxy/README.md'
} as const; 