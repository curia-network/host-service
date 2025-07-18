/**
 * API Proxy Client - Customer page component
 * 
 * Runs in the customer page context and proxies API requests
 * through active iframes to bypass CSP restrictions.
 */

import { 
  ApiRequest, 
  ApiResponse, 
  getEndpointForMethod, 
  validateApiRequest 
} from '../types/ApiTypes';
import { 
  ProxyApiResponseMessage,
  isProxyApiResponse,
  isProxyError,
  generateRequestId,
  createProxyRequest 
} from '../types/MessageTypes';
import { 
  ProxyClientConfig, 
  ProxyClientStatus, 
  ProxyError, 
  ProxyErrorType, 
  PendingRequest, 
  RequestTimeout,
  mergeClientConfig,
  createProxyError 
} from '../types/ProxyTypes';

/**
 * API Proxy Client
 * 
 * Handles API requests from forum iframes by proxying them through
 * the active iframe (auth or forum) to bypass CSP restrictions.
 */
export class ApiProxyClient {
  private config: Required<ProxyClientConfig>;
  private isInitialized: boolean = false;
  private activeIframe: HTMLIFrameElement | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private requestTimeouts = new Map<string, RequestTimeout>();
  private messageListener: ((event: MessageEvent) => void) | null = null;
  
  // Statistics
  private totalRequests = 0;
  private totalErrors = 0;
  private responseTimes: number[] = [];
  private lastActivityTime = 0;

  constructor(config?: Partial<ProxyClientConfig>) {
    this.config = mergeClientConfig(config);
    this.initialize();
  }

  /**
   * Initialize the proxy client
   */
  private initialize(): void {
    this.setupMessageListener();
    this.isInitialized = true;
    
    if (this.config.debug) {
      console.log('[ApiProxyClient] Initialized with config:', this.config);
    }
  }

  /**
   * Set up the message listener for iframe communication
   */
  private setupMessageListener(): void {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }

    this.messageListener = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') {
        return;
      }

      // Handle proxy API responses
      if (isProxyApiResponse(event.data)) {
        this.handleProxyResponse(event.data);
      }
      
      // Handle proxy errors
      if (isProxyError(event.data)) {
        this.handleProxyError(event.data);
      }
    };

    window.addEventListener('message', this.messageListener);
  }

  /**
   * Set the active iframe for API requests
   */
  public setActiveIframe(iframe: HTMLIFrameElement): void {
    this.activeIframe = iframe;
    
    if (this.config.debug) {
      console.log('[ApiProxyClient] Active iframe set:', iframe.src);
    }
  }

  /**
   * Clear the active iframe
   */
  public clearActiveIframe(): void {
    this.activeIframe = null;
    
    if (this.config.debug) {
      console.log('[ApiProxyClient] Active iframe cleared');
    }
  }

  /**
   * Make an API request through the active iframe
   */
  public async makeApiRequest(request: ApiRequest): Promise<ApiResponse> {
    if (!this.isInitialized) {
      throw createProxyError(
        ProxyErrorType.INITIALIZATION_ERROR,
        'Proxy client not initialized'
      );
    }

    if (!this.activeIframe) {
      throw createProxyError(
        ProxyErrorType.NO_ACTIVE_IFRAME,
        'No active iframe available for API requests'
      );
    }

    if (!validateApiRequest(request)) {
      throw createProxyError(
        ProxyErrorType.INVALID_REQUEST,
        'Invalid API request format'
      );
    }

    const requestId = generateRequestId();
    const startTime = Date.now();
    this.totalRequests++;
    this.lastActivityTime = startTime;

    return new Promise((resolve, reject) => {
      try {
        // Store pending request
        const pendingRequest: PendingRequest = {
          requestId,
          resolve,
          reject,
          startTime,
          retryCount: 0,
          originalRequest: request
        };
        
        this.pendingRequests.set(requestId, pendingRequest);
        
        // Set up timeout
        this.setupRequestTimeout(requestId);
        
        // Send request to active iframe
        this.sendRequestToIframe(requestId, request);
        
        if (this.config.debug) {
          console.log('[ApiProxyClient] API request sent:', {
            requestId,
            method: request.method,
            userId: request.userId,
            communityId: request.communityId
          });
        }
        
      } catch (error) {
        this.cleanupRequest(requestId);
        reject(error);
      }
    });
  }

  /**
   * Send request to the active iframe
   */
  private sendRequestToIframe(requestId: string, request: ApiRequest): void {
    if (!this.activeIframe?.contentWindow) {
      throw createProxyError(
        ProxyErrorType.NO_ACTIVE_IFRAME,
        'Active iframe content window not available'
      );
    }

    const endpoint = getEndpointForMethod(request.method as any);
    const message = createProxyRequest(requestId, endpoint, request);
    
    this.activeIframe.contentWindow.postMessage(message, '*');
  }

  /**
   * Set up request timeout
   */
  private setupRequestTimeout(requestId: string): void {
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

  /**
   * Handle request timeout
   */
  private handleRequestTimeout(requestId: string): void {
    const pendingRequest = this.pendingRequests.get(requestId);
    if (!pendingRequest) {
      return;
    }

    const error = createProxyError(
      ProxyErrorType.TIMEOUT,
      `Request timeout after ${this.config.defaultTimeout}ms`,
      requestId
    );

    this.handleRequestError(requestId, error);
  }

  /**
   * Handle proxy response from iframe
   */
  private handleProxyResponse(message: ProxyApiResponseMessage): void {
    const pendingRequest = this.pendingRequests.get(message.requestId);
    if (!pendingRequest) {
      if (this.config.debug) {
        console.warn('[ApiProxyClient] Received response for unknown request:', message.requestId);
      }
      return;
    }

    const responseTime = Date.now() - pendingRequest.startTime;
    this.responseTimes.push(responseTime);
    
    // Keep only last 100 response times for average calculation
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

  /**
   * Handle proxy error from iframe
   */
  private handleProxyError(message: any): void {
    const error = createProxyError(
      ProxyErrorType.NETWORK_ERROR,
      message.error,
      message.requestId
    );

    this.handleRequestError(message.requestId, error);
  }

  /**
   * Handle request error
   */
  private handleRequestError(requestId: string, error: ProxyError): void {
    const pendingRequest = this.pendingRequests.get(requestId);
    if (!pendingRequest) {
      return;
    }

    this.totalErrors++;
    this.cleanupRequest(requestId);
    
    // Check if we should retry
    if (pendingRequest.retryCount < this.config.maxRetries) {
      this.retryRequest(pendingRequest, error);
    } else {
      pendingRequest.reject(error);
    }
  }

  /**
   * Retry a failed request
   */
  private retryRequest(pendingRequest: PendingRequest, lastError: ProxyError): void {
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
      } else {
        pendingRequest.reject(lastError);
      }
    }, this.config.retryDelay);
  }

  /**
   * Clean up request resources
   */
  private cleanupRequest(requestId: string): void {
    this.pendingRequests.delete(requestId);
    
    const timeout = this.requestTimeouts.get(requestId);
    if (timeout) {
      clearTimeout(timeout.timeoutId);
      this.requestTimeouts.delete(requestId);
    }
  }

  /**
   * Get proxy client status
   */
  public getStatus(): ProxyClientStatus {
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

  /**
   * Destroy the proxy client
   */
  public destroy(): void {
    // Clear all pending requests
    this.pendingRequests.forEach(request => {
      request.reject(createProxyError(
        ProxyErrorType.INITIALIZATION_ERROR,
        'Proxy client destroyed'
      ));
    });
    this.pendingRequests.clear();

    // Clear all timeouts
    this.requestTimeouts.forEach(timeout => {
      clearTimeout(timeout.timeoutId);
    });
    this.requestTimeouts.clear();

    // Remove message listener
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }

    // Clear active iframe
    this.activeIframe = null;
    this.isInitialized = false;

    if (this.config.debug) {
      console.log('[ApiProxyClient] Destroyed');
    }
  }
} 