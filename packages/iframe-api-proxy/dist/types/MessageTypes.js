"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageType = void 0;
exports.isProxyApiRequest = isProxyApiRequest;
exports.isProxyApiResponse = isProxyApiResponse;
exports.isForumApiRequest = isForumApiRequest;
exports.isProxyError = isProxyError;
exports.generateRequestId = generateRequestId;
exports.createErrorMessage = createErrorMessage;
exports.createProxyRequest = createProxyRequest;
exports.createProxyResponse = createProxyResponse;
var MessageType;
(function (MessageType) {
    MessageType["API_REQUEST"] = "api_request";
    MessageType["API_RESPONSE"] = "api_response";
    MessageType["PROXY_API_REQUEST"] = "proxy-api-request";
    MessageType["PROXY_API_RESPONSE"] = "proxy-api-response";
    MessageType["PROXY_ERROR"] = "proxy-error";
    MessageType["PROXY_INIT"] = "proxy-init";
    MessageType["PROXY_READY"] = "proxy-ready";
})(MessageType || (exports.MessageType = MessageType = {}));
function isProxyApiRequest(message) {
    return message?.type === MessageType.PROXY_API_REQUEST &&
        message?.requestId &&
        message?.endpoint &&
        message?.payload;
}
function isProxyApiResponse(message) {
    return message?.type === MessageType.PROXY_API_RESPONSE &&
        message?.requestId &&
        message?.response;
}
function isForumApiRequest(message) {
    return message?.type === MessageType.API_REQUEST &&
        message?.requestId &&
        message?.iframeUid &&
        message?.method;
}
function isProxyError(message) {
    return message?.type === MessageType.PROXY_ERROR &&
        message?.requestId &&
        message?.error;
}
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function createErrorMessage(requestId, error, originalRequestId) {
    const message = {
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
function createProxyRequest(requestId, endpoint, payload) {
    return {
        type: MessageType.PROXY_API_REQUEST,
        requestId,
        endpoint,
        payload,
        timestamp: Date.now()
    };
}
function createProxyResponse(requestId, response) {
    return {
        type: MessageType.PROXY_API_RESPONSE,
        requestId,
        response,
        timestamp: Date.now()
    };
}
//# sourceMappingURL=MessageTypes.js.map