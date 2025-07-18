"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ENDPOINTS = void 0;
exports.getEndpointForMethod = getEndpointForMethod;
exports.validateApiRequest = validateApiRequest;
exports.API_ENDPOINTS = {
    getUserInfo: '/api/user',
    getUserFriends: '/api/user',
    getContextData: '/api/user',
    getCommunityInfo: '/api/community',
    giveRole: '/api/community'
};
function getEndpointForMethod(method) {
    const endpoint = exports.API_ENDPOINTS[method];
    if (!endpoint) {
        throw new Error(`Unknown API method: ${method}`);
    }
    return endpoint;
}
function validateApiRequest(request) {
    return !!(request.method &&
        request.userId &&
        request.communityId &&
        exports.API_ENDPOINTS[request.method]);
}
//# sourceMappingURL=ApiTypes.js.map