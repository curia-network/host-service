"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyErrorType = exports.DEFAULT_SERVER_CONFIG = exports.DEFAULT_CLIENT_CONFIG = void 0;
exports.createProxyError = createProxyError;
exports.mergeClientConfig = mergeClientConfig;
exports.mergeServerConfig = mergeServerConfig;
exports.validateServerConfig = validateServerConfig;
exports.isOriginAllowed = isOriginAllowed;
exports.DEFAULT_CLIENT_CONFIG = {
    defaultTimeout: 10000,
    maxRetries: 3,
    retryDelay: 1000,
    debug: false,
    requestIdPrefix: 'proxy'
};
exports.DEFAULT_SERVER_CONFIG = {
    timeout: 30000,
    debug: false,
    headers: {},
    allowedOrigins: [],
    serverId: `server_${Date.now()}`
};
var ProxyErrorType;
(function (ProxyErrorType) {
    ProxyErrorType["TIMEOUT"] = "TIMEOUT";
    ProxyErrorType["NETWORK_ERROR"] = "NETWORK_ERROR";
    ProxyErrorType["INVALID_REQUEST"] = "INVALID_REQUEST";
    ProxyErrorType["INVALID_RESPONSE"] = "INVALID_RESPONSE";
    ProxyErrorType["NO_ACTIVE_IFRAME"] = "NO_ACTIVE_IFRAME";
    ProxyErrorType["INITIALIZATION_ERROR"] = "INITIALIZATION_ERROR";
    ProxyErrorType["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    ProxyErrorType["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(ProxyErrorType || (exports.ProxyErrorType = ProxyErrorType = {}));
function createProxyError(type, message, requestId, originalError) {
    const error = new Error(message);
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
function mergeClientConfig(config) {
    return {
        ...exports.DEFAULT_CLIENT_CONFIG,
        ...config
    };
}
function mergeServerConfig(config) {
    return {
        ...exports.DEFAULT_SERVER_CONFIG,
        ...config
    };
}
function validateServerConfig(config) {
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
function isOriginAllowed(origin, allowedOrigins) {
    if (allowedOrigins.length === 0) {
        return true;
    }
    if (allowedOrigins.includes(origin)) {
        return true;
    }
    return allowedOrigins.some(allowed => {
        if (allowed.includes('*')) {
            const pattern = allowed.replace(/\*/g, '.*');
            return new RegExp(`^${pattern}$`).test(origin);
        }
        return false;
    });
}
//# sourceMappingURL=ProxyTypes.js.map