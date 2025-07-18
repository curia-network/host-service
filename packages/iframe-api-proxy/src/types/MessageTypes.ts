/**
 * Message Types - PostMessage protocol for iframe communication
 * 
 * Defines the message structure for communication between:
 * - Customer page (InternalPluginHost)
 * - Auth iframe (/embed route)
 * - Forum iframe (forum application)
 */

import { ApiRequest, ApiResponse } from './ApiTypes';

/**
 * Message types used in the proxy system
 */
export enum MessageType {
  // Original forum → host communication
  API_REQUEST = 'api_request',
  API_RESPONSE = 'api_response',
  
  // New proxy communication
  PROXY_API_REQUEST = 'proxy-api-request',
  PROXY_API_RESPONSE = 'proxy-api-response',
  
  // Error handling
  PROXY_ERROR = 'proxy-error',
  
  // Initialization
  PROXY_INIT = 'proxy-init',
  PROXY_READY = 'proxy-ready'
}

/**
 * Base message interface
 */
export interface BaseMessage {
  type: MessageType;
  requestId: string;
  timestamp?: number;
}

/**
 * Message from forum iframe to InternalPluginHost
 * (Original API request from forum)
 */
export interface ForumApiRequestMessage extends BaseMessage {
  type: MessageType.API_REQUEST;
  iframeUid: string;
  method: string;
  params?: any;
}

/**
 * Message from InternalPluginHost to active iframe
 * (Proxy request to iframe for API call)
 */
export interface ProxyApiRequestMessage extends BaseMessage {
  type: MessageType.PROXY_API_REQUEST;
  endpoint: string;
  payload: ApiRequest;
}

/**
 * Message from active iframe to InternalPluginHost
 * (Proxy response with API result)
 */
export interface ProxyApiResponseMessage extends BaseMessage {
  type: MessageType.PROXY_API_RESPONSE;
  response: ApiResponse;
}

/**
 * Message from InternalPluginHost to forum iframe
 * (Final API response back to forum)
 */
export interface ForumApiResponseMessage extends BaseMessage {
  type: MessageType.API_RESPONSE;
  iframeUid: string;
  data?: any;
  error?: string;
}

/**
 * Error message for proxy failures
 */
export interface ProxyErrorMessage extends BaseMessage {
  type: MessageType.PROXY_ERROR;
  error: string;
  originalRequestId?: string;
}

/**
 * Initialization messages
 */
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

/**
 * Union type for all proxy messages
 */
export type ProxyMessage = 
  | ForumApiRequestMessage
  | ProxyApiRequestMessage
  | ProxyApiResponseMessage
  | ForumApiResponseMessage
  | ProxyErrorMessage
  | ProxyInitMessage
  | ProxyReadyMessage;

/**
 * Type guards for message validation
 */
export function isProxyApiRequest(message: any): message is ProxyApiRequestMessage {
  return message?.type === MessageType.PROXY_API_REQUEST && 
         message?.requestId && 
         message?.endpoint && 
         message?.payload;
}

export function isProxyApiResponse(message: any): message is ProxyApiResponseMessage {
  return message?.type === MessageType.PROXY_API_RESPONSE && 
         message?.requestId && 
         message?.response;
}

export function isForumApiRequest(message: any): message is ForumApiRequestMessage {
  return message?.type === MessageType.API_REQUEST && 
         message?.requestId && 
         message?.iframeUid && 
         message?.method;
}

export function isProxyError(message: any): message is ProxyErrorMessage {
  return message?.type === MessageType.PROXY_ERROR && 
         message?.requestId && 
         message?.error;
}

/**
 * Helper function to generate unique request IDs
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper function to create error message
 */
export function createErrorMessage(requestId: string, error: string, originalRequestId?: string): ProxyErrorMessage {
  const message: ProxyErrorMessage = {
    type: MessageType.PROXY_ERROR,
    requestId,
    error,
    timestamp: Date.now()
  };
  
  if (originalRequestId) {
    message.originalRequestId = originalRequestId;
  }
  
  return message;
}

/**
 * Helper function to create proxy request message
 */
export function createProxyRequest(requestId: string, endpoint: string, payload: ApiRequest): ProxyApiRequestMessage {
  return {
    type: MessageType.PROXY_API_REQUEST,
    requestId,
    endpoint,
    payload,
    timestamp: Date.now()
  };
}

/**
 * Helper function to create proxy response message
 */
export function createProxyResponse(requestId: string, response: ApiResponse): ProxyApiResponseMessage {
  return {
    type: MessageType.PROXY_API_RESPONSE,
    requestId,
    response,
    timestamp: Date.now()
  };
} 