import { ProxyServerConfig, ProxyServerStatus } from '../types/ProxyTypes';
export declare class ApiProxyServer {
    private config;
    private isInitialized;
    private messageListener;
    private requestCount;
    private errorCount;
    private startTime;
    private lastRequestTime;
    constructor(config: ProxyServerConfig);
    private initialize;
    private setupMessageListener;
    private handleProxyRequest;
    private makeApiRequest;
    private processResponse;
    private sendSuccessResponse;
    private sendErrorResponse;
    getStatus(): ProxyServerStatus;
    destroy(): void;
}
