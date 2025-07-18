"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.METADATA = exports.PACKAGE_NAME = exports.VERSION = exports.isOriginAllowed = exports.validateServerConfig = exports.mergeServerConfig = exports.mergeClientConfig = exports.createProxyError = exports.DEFAULT_SERVER_CONFIG = exports.DEFAULT_CLIENT_CONFIG = exports.ProxyErrorType = exports.createProxyResponse = exports.createProxyRequest = exports.createErrorMessage = exports.generateRequestId = exports.isProxyError = exports.isForumApiRequest = exports.isProxyApiResponse = exports.isProxyApiRequest = exports.MessageType = exports.validateApiRequest = exports.getEndpointForMethod = exports.API_ENDPOINTS = exports.ApiProxyServer = exports.ApiProxyClient = void 0;
exports.createProxyClient = createProxyClient;
exports.createProxyServer = createProxyServer;
var ApiProxyClient_1 = require("./client/ApiProxyClient");
Object.defineProperty(exports, "ApiProxyClient", { enumerable: true, get: function () { return ApiProxyClient_1.ApiProxyClient; } });
var ApiProxyServer_1 = require("./server/ApiProxyServer");
Object.defineProperty(exports, "ApiProxyServer", { enumerable: true, get: function () { return ApiProxyServer_1.ApiProxyServer; } });
const ApiProxyClient_2 = require("./client/ApiProxyClient");
const ApiProxyServer_2 = require("./server/ApiProxyServer");
var ApiTypes_1 = require("./types/ApiTypes");
Object.defineProperty(exports, "API_ENDPOINTS", { enumerable: true, get: function () { return ApiTypes_1.API_ENDPOINTS; } });
Object.defineProperty(exports, "getEndpointForMethod", { enumerable: true, get: function () { return ApiTypes_1.getEndpointForMethod; } });
Object.defineProperty(exports, "validateApiRequest", { enumerable: true, get: function () { return ApiTypes_1.validateApiRequest; } });
var MessageTypes_1 = require("./types/MessageTypes");
Object.defineProperty(exports, "MessageType", { enumerable: true, get: function () { return MessageTypes_1.MessageType; } });
Object.defineProperty(exports, "isProxyApiRequest", { enumerable: true, get: function () { return MessageTypes_1.isProxyApiRequest; } });
Object.defineProperty(exports, "isProxyApiResponse", { enumerable: true, get: function () { return MessageTypes_1.isProxyApiResponse; } });
Object.defineProperty(exports, "isForumApiRequest", { enumerable: true, get: function () { return MessageTypes_1.isForumApiRequest; } });
Object.defineProperty(exports, "isProxyError", { enumerable: true, get: function () { return MessageTypes_1.isProxyError; } });
Object.defineProperty(exports, "generateRequestId", { enumerable: true, get: function () { return MessageTypes_1.generateRequestId; } });
Object.defineProperty(exports, "createErrorMessage", { enumerable: true, get: function () { return MessageTypes_1.createErrorMessage; } });
Object.defineProperty(exports, "createProxyRequest", { enumerable: true, get: function () { return MessageTypes_1.createProxyRequest; } });
Object.defineProperty(exports, "createProxyResponse", { enumerable: true, get: function () { return MessageTypes_1.createProxyResponse; } });
var ProxyTypes_1 = require("./types/ProxyTypes");
Object.defineProperty(exports, "ProxyErrorType", { enumerable: true, get: function () { return ProxyTypes_1.ProxyErrorType; } });
Object.defineProperty(exports, "DEFAULT_CLIENT_CONFIG", { enumerable: true, get: function () { return ProxyTypes_1.DEFAULT_CLIENT_CONFIG; } });
Object.defineProperty(exports, "DEFAULT_SERVER_CONFIG", { enumerable: true, get: function () { return ProxyTypes_1.DEFAULT_SERVER_CONFIG; } });
Object.defineProperty(exports, "createProxyError", { enumerable: true, get: function () { return ProxyTypes_1.createProxyError; } });
Object.defineProperty(exports, "mergeClientConfig", { enumerable: true, get: function () { return ProxyTypes_1.mergeClientConfig; } });
Object.defineProperty(exports, "mergeServerConfig", { enumerable: true, get: function () { return ProxyTypes_1.mergeServerConfig; } });
Object.defineProperty(exports, "validateServerConfig", { enumerable: true, get: function () { return ProxyTypes_1.validateServerConfig; } });
Object.defineProperty(exports, "isOriginAllowed", { enumerable: true, get: function () { return ProxyTypes_1.isOriginAllowed; } });
exports.VERSION = '1.0.0';
exports.PACKAGE_NAME = '@curia/iframe-api-proxy';
function createProxyClient(config) {
    return new ApiProxyClient_2.ApiProxyClient(config);
}
function createProxyServer(config) {
    return new ApiProxyServer_2.ApiProxyServer(config);
}
exports.METADATA = {
    name: exports.PACKAGE_NAME,
    version: exports.VERSION,
    description: 'API proxy system for iframe-based applications to bypass CSP restrictions',
    repository: 'https://github.com/curia/host-service/tree/main/packages/iframe-api-proxy',
    documentation: 'https://github.com/curia/host-service/blob/main/packages/iframe-api-proxy/README.md'
};
//# sourceMappingURL=index.js.map