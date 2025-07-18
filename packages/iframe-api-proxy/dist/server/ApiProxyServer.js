"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiProxyServer = void 0;
const MessageTypes_1 = require("../types/MessageTypes");
const ProxyTypes_1 = require("../types/ProxyTypes");
class ApiProxyServer {
    constructor(config) {
        this.isInitialized = false;
        this.messageListener = null;
        this.requestCount = 0;
        this.errorCount = 0;
        this.startTime = Date.now();
        this.lastRequestTime = 0;
        (0, ProxyTypes_1.validateServerConfig)(config);
        this.config = (0, ProxyTypes_1.mergeServerConfig)(config);
        this.initialize();
    }
    initialize() {
        this.setupMessageListener();
        this.isInitialized = true;
        if (this.config.debug) {
            console.log('[ApiProxyServer] Initialized with config:', {
                baseUrl: this.config.baseUrl,
                serverId: this.config.serverId,
                timeout: this.config.timeout,
                allowedOrigins: this.config.allowedOrigins
            });
        }
    }
    setupMessageListener() {
        if (this.messageListener) {
            window.removeEventListener('message', this.messageListener);
        }
        this.messageListener = (event) => {
            if (this.config.allowedOrigins.length > 0) {
                if (!(0, ProxyTypes_1.isOriginAllowed)(event.origin, this.config.allowedOrigins)) {
                    if (this.config.debug) {
                        console.warn('[ApiProxyServer] Request from unauthorized origin:', event.origin);
                    }
                    return;
                }
            }
            if (!event.data || typeof event.data !== 'object') {
                return;
            }
            if ((0, MessageTypes_1.isProxyApiRequest)(event.data)) {
                this.handleProxyRequest(event.data, event.source);
            }
        };
        window.addEventListener('message', this.messageListener);
    }
    async handleProxyRequest(message, source) {
        this.requestCount++;
        this.lastRequestTime = Date.now();
        if (this.config.debug) {
            console.log('[ApiProxyServer] Received proxy request:', {
                requestId: message.requestId,
                endpoint: message.endpoint,
                method: message.payload.method,
                userId: message.payload.userId,
                communityId: message.payload.communityId
            });
        }
        try {
            const response = await this.makeApiRequest(message.endpoint, message.payload);
            this.sendSuccessResponse(source, message.requestId, response);
        }
        catch (error) {
            this.errorCount++;
            if (this.config.debug) {
                console.error('[ApiProxyServer] API request failed:', {
                    requestId: message.requestId,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
            this.sendErrorResponse(source, message.requestId, error);
        }
    }
    async makeApiRequest(endpoint, payload) {
        const url = `${this.config.baseUrl}${endpoint}`;
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.config.headers
            },
            body: JSON.stringify(payload)
        };
        if (this.config.timeout > 0) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
            requestOptions.signal = controller.signal;
            try {
                const response = await fetch(url, requestOptions);
                clearTimeout(timeoutId);
                return await this.processResponse(response);
            }
            catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        }
        else {
            const response = await fetch(url, requestOptions);
            return await this.processResponse(response);
        }
    }
    async processResponse(response) {
        if (!response.ok) {
            throw (0, ProxyTypes_1.createProxyError)(ProxyTypes_1.ProxyErrorType.NETWORK_ERROR, `HTTP ${response.status}: ${response.statusText}`);
        }
        let data;
        try {
            data = await response.json();
        }
        catch (error) {
            throw (0, ProxyTypes_1.createProxyError)(ProxyTypes_1.ProxyErrorType.INVALID_RESPONSE, 'Invalid JSON response from API');
        }
        if (typeof data !== 'object' || data === null) {
            throw (0, ProxyTypes_1.createProxyError)(ProxyTypes_1.ProxyErrorType.INVALID_RESPONSE, 'Invalid response format from API');
        }
        return data;
    }
    sendSuccessResponse(source, requestId, response) {
        const message = (0, MessageTypes_1.createProxyResponse)(requestId, response);
        source.postMessage(message, '*');
        if (this.config.debug) {
            console.log('[ApiProxyServer] Success response sent:', {
                requestId,
                success: response.success
            });
        }
    }
    sendErrorResponse(source, requestId, error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const response = {
            success: false,
            error: errorMessage
        };
        const message = (0, MessageTypes_1.createProxyResponse)(requestId, response);
        source.postMessage(message, '*');
        if (this.config.debug) {
            console.log('[ApiProxyServer] Error response sent:', {
                requestId,
                error: errorMessage
            });
        }
    }
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            serverId: this.config.serverId,
            baseUrl: this.config.baseUrl,
            requestCount: this.requestCount,
            errorCount: this.errorCount,
            startTime: this.startTime,
            lastRequestTime: this.lastRequestTime
        };
    }
    destroy() {
        if (this.messageListener) {
            window.removeEventListener('message', this.messageListener);
            this.messageListener = null;
        }
        this.isInitialized = false;
        if (this.config.debug) {
            console.log('[ApiProxyServer] Destroyed');
        }
    }
}
exports.ApiProxyServer = ApiProxyServer;
//# sourceMappingURL=ApiProxyServer.js.map