export interface ProxyClientConfig {
    defaultTimeout?: number;
    maxRetries?: number;
    retryDelay?: number;
    debug?: boolean;
    requestIdPrefix?: string;
}
export interface ProxyServerConfig {
    baseUrl: string;
    timeout?: number;
    debug?: boolean;
    headers?: Record<string, string>;
    allowedOrigins?: string[];
    serverId?: string;
}
export declare const DEFAULT_CLIENT_CONFIG: Required<ProxyClientConfig>;
export declare const DEFAULT_SERVER_CONFIG: Required<Omit<ProxyServerConfig, 'baseUrl'>>;
export interface RequestTimeout {
    requestId: string;
    timeoutId: NodeJS.Timeout;
    startTime: number;
    timeoutMs: number;
}
export interface PendingRequest {
    requestId: string;
    resolve: (response: any) => void;
    reject: (error: Error) => void;
    startTime: number;
    retryCount: number;
    originalRequest: any;
}
export interface ProxyClientStatus {
    isInitialized: boolean;
    activeIframeCount: number;
    pendingRequestCount: number;
    totalRequestCount: number;
    errorCount: number;
    averageResponseTime: number;
    lastActivityTime: number;
}
export interface ProxyServerStatus {
    isInitialized: boolean;
    serverId: string;
    baseUrl: string;
    requestCount: number;
    errorCount: number;
    startTime: number;
    lastRequestTime: number;
}
export declare enum ProxyErrorType {
    TIMEOUT = "TIMEOUT",
    NETWORK_ERROR = "NETWORK_ERROR",
    INVALID_REQUEST = "INVALID_REQUEST",
    INVALID_RESPONSE = "INVALID_RESPONSE",
    NO_ACTIVE_IFRAME = "NO_ACTIVE_IFRAME",
    INITIALIZATION_ERROR = "INITIALIZATION_ERROR",
    PERMISSION_DENIED = "PERMISSION_DENIED",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
export interface ProxyError extends Error {
    type: ProxyErrorType;
    requestId?: string;
    originalError?: Error;
    timestamp: number;
}
export declare function createProxyError(type: ProxyErrorType, message: string, requestId?: string, originalError?: Error): ProxyError;
export declare function mergeClientConfig(config?: Partial<ProxyClientConfig>): Required<ProxyClientConfig>;
export declare function mergeServerConfig(config: ProxyServerConfig): Required<ProxyServerConfig>;
export declare function validateServerConfig(config: ProxyServerConfig): void;
export declare function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean;
