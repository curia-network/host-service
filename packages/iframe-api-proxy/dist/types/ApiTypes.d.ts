export interface ApiRequest {
    method: string;
    params?: Record<string, any>;
    userId: string;
    communityId: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}
export type ApiMethod = 'getUserInfo' | 'getUserFriends' | 'getContextData' | 'getCommunityInfo' | 'giveRole';
export declare const API_ENDPOINTS: Record<string, string>;
export interface GetUserInfoRequest extends ApiRequest {
    method: 'getUserInfo';
}
export interface GetUserFriendsRequest extends ApiRequest {
    method: 'getUserFriends';
    params: {
        limit?: number;
        offset?: number;
    };
}
export interface GetContextDataRequest extends ApiRequest {
    method: 'getContextData';
}
export interface GetCommunityInfoRequest extends ApiRequest {
    method: 'getCommunityInfo';
}
export interface GiveRoleRequest extends ApiRequest {
    method: 'giveRole';
    params: {
        roleId: string;
        userId: string;
    };
}
export type ApiRequestUnion = GetUserInfoRequest | GetUserFriendsRequest | GetContextDataRequest | GetCommunityInfoRequest | GiveRoleRequest;
export declare function getEndpointForMethod(method: ApiMethod): string;
export declare function validateApiRequest(request: ApiRequest): request is ApiRequestUnion;
