"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiProxyClient = void 0;
const ApiTypes_1 = require("../types/ApiTypes");
const MessageTypes_1 = require("../types/MessageTypes");
const ProxyTypes_1 = require("../types/ProxyTypes");
class ApiProxyClient {
    constructor(config) {
        this.isInitialized = false;
        this.activeIframe = null;
        this.pendingRequests = new Map();
        this.requestTimeouts = new Map();
        this.messageListener = null;
        this.totalRequests = 0;
        this.totalErrors = 0;
        this.responseTimes = [];
        this.lastActivityTime = 0;
        this.config = (0, ProxyTypes_1.mergeClientConfig)(config);
        this.initialize();
    }
    initialize() {
        this.setupMessageListener();
        this.isInitialized = true;
        if (this.config.debug) {
            console.log('[ApiProxyClient] Initialized with config:', this.config);
        }
    }
    setupMessageListener() {
        if (this.messageListener) {
            window.removeEventListener('message', this.messageListener);
        }
        this.messageListener = (event) => {
            if (!event.data || typeof event.data !== 'object') {
                return;
            }
            if ((0, MessageTypes_1.isProxyApiResponse)(event.data)) {
                this.handleProxyResponse(event.data);
            }
            if ((0, MessageTypes_1.isProxyError)(event.data)) {
                this.handleProxyError(event.data);
            }
        };
        window.addEventListener('message', this.messageListener);
    }
    setActiveIframe(iframe) {
        this.activeIframe = iframe;
        if (this.config.debug) {
            console.log('[ApiProxyClient] Active iframe set:', iframe.src);
        }
    }
    clearActiveIframe() {
        this.activeIframe = null;
        if (this.config.debug) {
            console.log('[ApiProxyClient] Active iframe cleared');
        }
    }
    async makeApiRequest(request) {
        if (!this.isInitialized) {
            throw (0, ProxyTypes_1.createProxyError)(ProxyTypes_1.ProxyErrorType.INITIALIZATION_ERROR, 'Proxy client not initialized');
        }
        if (!this.activeIframe) {
            throw (0, ProxyTypes_1.createProxyError)(ProxyTypes_1.ProxyErrorType.NO_ACTIVE_IFRAME, 'No active iframe available for API requests');
        }
        if (!(0, ApiTypes_1.validateApiRequest)(request)) {
            throw (0, ProxyTypes_1.createProxyError)(ProxyTypes_1.ProxyErrorType.INVALID_REQUEST, 'Invalid API request format');
        }
        const requestId = (0, MessageTypes_1.generateRequestId)();
        const startTime = Date.now();
        this.totalRequests++;
        this.lastActivityTime = startTime;
        return new Promise((resolve, reject) => {
            try {
                const pendingRequest = {
                    requestId,
                    resolve,
                    reject,
                    startTime,
                    retryCount: 0,
                    originalRequest: request
                };
                this.pendingRequests.set(requestId, pendingRequest);
                this.setupRequestTimeout(requestId);
                this.sendRequestToIframe(requestId, request);
                if (this.config.debug) {
                    console.log('[ApiProxyClient] API request sent:', {
                        requestId,
                        method: request.method,
                        userId: request.userId,
                        communityId: request.communityId
                    });
                }
            }
            catch (error) {
                this.cleanupRequest(requestId);
                reject(error);
            }
        });
    }
    sendRequestToIframe(requestId, request) {
        if (!this.activeIframe?.contentWindow) {
            throw (0, ProxyTypes_1.createProxyError)(ProxyTypes_1.ProxyErrorType.NO_ACTIVE_IFRAME, 'Active iframe content window not available');
        }
        const endpoint = (0, ApiTypes_1.getEndpointForMethod)(request.method);
        const message = (0, MessageTypes_1.createProxyRequest)(requestId, endpoint, request);
        this.activeIframe.contentWindow.postMessage(message, '*');
    }
    setupRequestTimeout(requestId) {
        const timeoutId = setTimeout(() => {
            this.handleRequestTimeout(requestId);
        }, this.config.defaultTimeout);
        this.requestTimeouts.set(requestId, {
            requestId,
            timeoutId,
            startTime: Date.now(),
            timeoutMs: this.config.defaultTimeout
        });
    }
    handleRequestTimeout(requestId) {
        const pendingRequest = this.pendingRequests.get(requestId);
        if (!pendingRequest) {
            return;
        }
        const error = (0, ProxyTypes_1.createProxyError)(ProxyTypes_1.ProxyErrorType.TIMEOUT, `Request timeout after ${this.config.defaultTimeout}ms`, requestId);
        this.handleRequestError(requestId, error);
    }
    handleProxyResponse(message) {
        const pendingRequest = this.pendingRequests.get(message.requestId);
        if (!pendingRequest) {
            if (this.config.debug) {
                console.warn('[ApiProxyClient] Received response for unknown request:', message.requestId);
            }
            return;
        }
        const responseTime = Date.now() - pendingRequest.startTime;
        this.responseTimes.push(responseTime);
        if (this.responseTimes.length > 100) {
            this.responseTimes.shift();
        }
        this.cleanupRequest(message.requestId);
        pendingRequest.resolve(message.response);
        if (this.config.debug) {
            console.log('[ApiProxyClient] API response received:', {
                requestId: message.requestId,
                responseTime: `${responseTime}ms`,
                success: message.response.success
            });
        }
    }
    handleProxyError(message) {
        const error = (0, ProxyTypes_1.createProxyError)(ProxyTypes_1.ProxyErrorType.NETWORK_ERROR, message.error, message.requestId);
        this.handleRequestError(message.requestId, error);
    }
    handleRequestError(requestId, error) {
        const pendingRequest = this.pendingRequests.get(requestId);
        if (!pendingRequest) {
            return;
        }
        this.totalErrors++;
        this.cleanupRequest(requestId);
        if (pendingRequest.retryCount < this.config.maxRetries) {
            this.retryRequest(pendingRequest, error);
        }
        else {
            pendingRequest.reject(error);
        }
    }
    retryRequest(pendingRequest, lastError) {
        pendingRequest.retryCount++;
        if (this.config.debug) {
            console.log('[ApiProxyClient] Retrying request:', {
                requestId: pendingRequest.requestId,
                retryCount: pendingRequest.retryCount,
                lastError: lastError.message
            });
        }
        setTimeout(() => {
            if (this.activeIframe) {
                this.pendingRequests.set(pendingRequest.requestId, pendingRequest);
                this.setupRequestTimeout(pendingRequest.requestId);
                this.sendRequestToIframe(pendingRequest.requestId, pendingRequest.originalRequest);
            }
            else {
                pendingRequest.reject(lastError);
            }
        }, this.config.retryDelay);
    }
    cleanupRequest(requestId) {
        this.pendingRequests.delete(requestId);
        const timeout = this.requestTimeouts.get(requestId);
        if (timeout) {
            clearTimeout(timeout.timeoutId);
            this.requestTimeouts.delete(requestId);
        }
    }
    getStatus() {
        const averageResponseTime = this.responseTimes.length > 0
            ? this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
            : 0;
        return {
            isInitialized: this.isInitialized,
            activeIframeCount: this.activeIframe ? 1 : 0,
            pendingRequestCount: this.pendingRequests.size,
            totalRequestCount: this.totalRequests,
            errorCount: this.totalErrors,
            averageResponseTime: Math.round(averageResponseTime),
            lastActivityTime: this.lastActivityTime
        };
    }
    destroy() {
        this.pendingRequests.forEach(request => {
            request.reject((0, ProxyTypes_1.createProxyError)(ProxyTypes_1.ProxyErrorType.INITIALIZATION_ERROR, 'Proxy client destroyed'));
        });
        this.pendingRequests.clear();
        this.requestTimeouts.forEach(timeout => {
            clearTimeout(timeout.timeoutId);
        });
        this.requestTimeouts.clear();
        if (this.messageListener) {
            window.removeEventListener('message', this.messageListener);
            this.messageListener = null;
        }
        this.activeIframe = null;
        this.isInitialized = false;
        if (this.config.debug) {
            console.log('[ApiProxyClient] Destroyed');
        }
    }
}
exports.ApiProxyClient = ApiProxyClient;
//# sourceMappingURL=ApiProxyClient.js.map