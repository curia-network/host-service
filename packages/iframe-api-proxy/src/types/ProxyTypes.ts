/**
 * Proxy Types - Configuration and setup types for the proxy system
 * 
 * Defines configuration interfaces for both client and server
 * components of the API proxy system.
 */

/**
 * Configuration for the API proxy client (customer page)
 */
export interface ProxyClientConfig {
  /** Default timeout for API requests in milliseconds */
  defaultTimeout?: number;
  
  /** Maximum number of retry attempts for failed requests */
  maxRetries?: number;
  
  /** Retry delay in milliseconds */
  retryDelay?: number;
  
  /** Whether to log debug messages */
  debug?: boolean;
  
  /** Custom request ID prefix */
  requestIdPrefix?: string;
}

/**
 * Configuration for the API proxy server (iframe)
 */
export interface ProxyServerConfig {
  /** Base URL for API requests */
  baseUrl: string;
  
  /** Request timeout in milliseconds */
  timeout?: number;
  
  /** Whether to log debug messages */
  debug?: boolean;
  
  /** Custom headers to include in API requests */
  headers?: Record<string, string>;
  
  /** Allowed origins for security (empty array = allow all) */
  allowedOrigins?: string[];
  
  /** Custom server ID for identification */
  serverId?: string;
}

/**
 * Default configurations
 */
export const DEFAULT_CLIENT_CONFIG: Required<ProxyClientConfig> = {
  defaultTimeout: 10000, // 10 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  debug: false,
  requestIdPrefix: 'proxy'
};

export const DEFAULT_SERVER_CONFIG: Required<Omit<ProxyServerConfig, 'baseUrl'>> = {
  timeout: 30000, // 30 seconds
  debug: false,
  headers: {},
  allowedOrigins: [],
  serverId: `server_${Date.now()}`
};

/**
 * Request timeout information
 */
export interface RequestTimeout {
  requestId: string;
  timeoutId: NodeJS.Timeout;
  startTime: number;
  timeoutMs: number;
}

/**
 * Pending request information
 */
export interface PendingRequest {
  requestId: string;
  resolve: (response: any) => void;
  reject: (error: Error) => void;
  startTime: number;
  retryCount: number;
  originalRequest: any;
}

/**
 * Proxy client status
 */
export interface ProxyClientStatus {
  isInitialized: boolean;
  activeIframeCount: number;
  pendingRequestCount: number;
  totalRequestCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastActivityTime: number;
}

/**
 * Proxy server status
 */
export interface ProxyServerStatus {
  isInitialized: boolean;
  serverId: string;
  baseUrl: string;
  requestCount: number;
  errorCount: number;
  startTime: number;
  lastRequestTime: number;
}

/**
 * Error types for the proxy system
 */
export enum ProxyErrorType {
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  NO_ACTIVE_IFRAME = 'NO_ACTIVE_IFRAME',
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Proxy error interface
 */
export interface ProxyError extends Error {
  type: ProxyErrorType;
  requestId?: string;
  originalError?: Error;
  timestamp: number;
}

/**
 * Helper function to create proxy error
 */
export function createProxyError(
  type: ProxyErrorType,
  message: string,
  requestId?: string,
  originalError?: Error
): ProxyError {
  const error = new Error(message) as ProxyError;
  error.type = type;
  error.timestamp = Date.now();
  
  if (requestId) {
    error.requestId = requestId;
  }
  
  if (originalError) {
    error.originalError = originalError;
  }
  
  return error;
}

/**
 * Helper function to merge client config with defaults
 */
export function mergeClientConfig(config?: Partial<ProxyClientConfig>): Required<ProxyClientConfig> {
  return {
    ...DEFAULT_CLIENT_CONFIG,
    ...config
  };
}

/**
 * Helper function to merge server config with defaults
 */
export function mergeServerConfig(config: ProxyServerConfig): Required<ProxyServerConfig> {
  return {
    ...DEFAULT_SERVER_CONFIG,
    ...config
  };
}

/**
 * Helper function to validate server config
 */
export function validateServerConfig(config: ProxyServerConfig): void {
  if (!config.baseUrl) {
    throw new Error('baseUrl is required for proxy server configuration');
  }
  
  if (!config.baseUrl.startsWith('http')) {
    throw new Error('baseUrl must be a valid HTTP/HTTPS URL');
  }
  
  if (config.timeout && config.timeout < 1000) {
    throw new Error('timeout must be at least 1000ms');
  }
}

/**
 * Helper function to check if origin is allowed
 */
export function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  // If no allowed origins specified, allow all
  if (allowedOrigins.length === 0) {
    return true;
  }
  
  // Check exact match
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  
  // Check wildcard patterns
  return allowedOrigins.some(allowed => {
    if (allowed.includes('*')) {
      const pattern = allowed.replace(/\*/g, '.*');
      return new RegExp(`^${pattern}$`).test(origin);
    }
    return false;
  });
} 