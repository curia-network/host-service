import { ApiRequest, ApiResponse } from './ApiTypes';
export declare enum MessageType {
    API_REQUEST = "api_request",
    API_RESPONSE = "api_response",
    PROXY_API_REQUEST = "proxy-api-request",
    PROXY_API_RESPONSE = "proxy-api-response",
    PROXY_ERROR = "proxy-error",
    PROXY_INIT = "proxy-init",
    PROXY_READY = "proxy-ready"
}
export interface BaseMessage {
    type: MessageType;
    requestId: string;
    timestamp?: number;
}
export interface ForumApiRequestMessage extends BaseMessage {
    type: MessageType.API_REQUEST;
    iframeUid: string;
    method: string;
    params?: any;
}
export interface ProxyApiRequestMessage extends BaseMessage {
    type: MessageType.PROXY_API_REQUEST;
    endpoint: string;
    payload: ApiRequest;
}
export interface ProxyApiResponseMessage extends BaseMessage {
    type: MessageType.PROXY_API_RESPONSE;
    response: ApiResponse;
}
export interface ForumApiResponseMessage extends BaseMessage {
    type: MessageType.API_RESPONSE;
    iframeUid: string;
    data?: any;
    error?: string;
}
export interface ProxyErrorMessage extends BaseMessage {
    type: MessageType.PROXY_ERROR;
    error: string;
    originalRequestId?: string;
}
export interface ProxyInitMessage extends BaseMessage {
    type: MessageType.PROXY_INIT;
    config: {
        baseUrl: string;
        timeout?: number;
    };
}
export interface ProxyReadyMessage extends BaseMessage {
    type: MessageType.PROXY_READY;
    serverId: string;
}
export type ProxyMessage = ForumApiRequestMessage | ProxyApiRequestMessage | ProxyApiResponseMessage | ForumApiResponseMessage | ProxyErrorMessage | ProxyInitMessage | ProxyReadyMessage;
export declare function isProxyApiRequest(message: any): message is ProxyApiRequestMessage;
export declare function isProxyApiResponse(message: any): message is ProxyApiResponseMessage;
export declare function isForumApiRequest(message: any): message is ForumApiRequestMessage;
export declare function isProxyError(message: any): message is ProxyErrorMessage;
export declare function generateRequestId(): string;
export declare function createErrorMessage(requestId: string, error: string, originalRequestId?: string): ProxyErrorMessage;
export declare function createProxyRequest(requestId: string, endpoint: string, payload: ApiRequest): ProxyApiRequestMessage;
export declare function createProxyResponse(requestId: string, response: ApiResponse): ProxyApiResponseMessage;
