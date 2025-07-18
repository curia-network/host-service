export { ApiProxyClient } from './client/ApiProxyClient';
export { ApiProxyServer } from './server/ApiProxyServer';
import { ApiProxyClient } from './client/ApiProxyClient';
import { ApiProxyServer } from './server/ApiProxyServer';
export { ApiRequest, ApiResponse, ApiMethod, ApiRequestUnion, GetUserInfoRequest, GetUserFriendsRequest, GetContextDataRequest, GetCommunityInfoRequest, GiveRoleRequest, API_ENDPOINTS, getEndpointForMethod, validateApiRequest } from './types/ApiTypes';
export { MessageType, BaseMessage, ForumApiRequestMessage, ProxyApiRequestMessage, ProxyApiResponseMessage, ForumApiResponseMessage, ProxyErrorMessage, ProxyInitMessage, ProxyReadyMessage, ProxyMessage, isProxyApiRequest, isProxyApiResponse, isForumApiRequest, isProxyError, generateRequestId, createErrorMessage, createProxyRequest, createProxyResponse } from './types/MessageTypes';
export { ProxyClientConfig, ProxyServerConfig, ProxyClientStatus, ProxyServerStatus, ProxyError, ProxyErrorType, PendingRequest, RequestTimeout, DEFAULT_CLIENT_CONFIG, DEFAULT_SERVER_CONFIG, createProxyError, mergeClientConfig, mergeServerConfig, validateServerConfig, isOriginAllowed } from './types/ProxyTypes';
export declare const VERSION = "1.0.0";
export declare const PACKAGE_NAME = "@curia/iframe-api-proxy";
export declare function createProxyClient(config?: Partial<import('./types/ProxyTypes').ProxyClientConfig>): ApiProxyClient;
export declare function createProxyServer(config: import('./types/ProxyTypes').ProxyServerConfig): ApiProxyServer;
export declare const METADATA: {
    readonly name: "@curia/iframe-api-proxy";
    readonly version: "1.0.0";
    readonly description: "API proxy system for iframe-based applications to bypass CSP restrictions";
    readonly repository: "https://github.com/curia/host-service/tree/main/packages/iframe-api-proxy";
    readonly documentation: "https://github.com/curia/host-service/blob/main/packages/iframe-api-proxy/README.md";
};
