/**
 * API Proxy Server - Iframe component
 * 
 * Runs inside iframes (auth or forum) and handles API requests
 * from the customer page by making actual API calls to the host service.
 */

import { ApiRequest, ApiResponse } from '../types/ApiTypes';
import { 
  ProxyApiRequestMessage,
  isProxyApiRequest,
  createProxyResponse
} from '../types/MessageTypes';
import { 
  ProxyServerConfig, 
  ProxyServerStatus, 
  ProxyErrorType, 
  mergeServerConfig,
  validateServerConfig,
  createProxyError,
  isOriginAllowed
} from '../types/ProxyTypes';

/**
 * API Proxy Server
 * 
 * Handles API proxy requests from the customer page by making
 * actual API calls to the host service and returning responses.
 */
export class ApiProxyServer {
  private config: Required<ProxyServerConfig>;
  private isInitialized: boolean = false;
  private messageListener: ((event: MessageEvent) => void) | null = null;
  
  // Statistics
  private requestCount = 0;
  private errorCount = 0;
  private startTime = Date.now();
  private lastRequestTime = 0;

  constructor(config: ProxyServerConfig) {
    validateServerConfig(config);
    this.config = mergeServerConfig(config);
    this.initialize();
  }

  /**
   * Initialize the proxy server
   */
  private initialize(): void {
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

  /**
   * Set up message listener for proxy requests
   */
  private setupMessageListener(): void {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }

    this.messageListener = (event: MessageEvent) => {
      // Security check: validate origin if configured
      if (this.config.allowedOrigins.length > 0) {
        if (!isOriginAllowed(event.origin, this.config.allowedOrigins)) {
          if (this.config.debug) {
            console.warn('[ApiProxyServer] Request from unauthorized origin:', event.origin);
          }
          return;
        }
      }

      if (!event.data || typeof event.data !== 'object') {
        return;
      }

      // Handle proxy API requests
      if (isProxyApiRequest(event.data)) {
        this.handleProxyRequest(event.data, event.source as Window);
      }
    };

    window.addEventListener('message', this.messageListener);
  }

  /**
   * Handle incoming proxy API request
   */
  private async handleProxyRequest(message: ProxyApiRequestMessage, source: Window): Promise<void> {
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
      // Make API request to host service
      const response = await this.makeApiRequest(message.endpoint, message.payload);
      
      // Send successful response back to client
      this.sendSuccessResponse(source, message.requestId, response);
      
    } catch (error) {
      this.errorCount++;
      
      if (this.config.debug) {
        console.error('[ApiProxyServer] API request failed:', {
          requestId: message.requestId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      // Send error response back to client
      this.sendErrorResponse(source, message.requestId, error);
    }
  }

  /**
   * Make API request to host service
   */
  private async makeApiRequest(endpoint: string, payload: ApiRequest): Promise<ApiResponse> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers
      },
      body: JSON.stringify(payload)
    };

    // Add timeout if supported
    if (this.config.timeout > 0) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      requestOptions.signal = controller.signal;
      
      try {
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);
        return await this.processResponse(response);
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } else {
      const response = await fetch(url, requestOptions);
      return await this.processResponse(response);
    }
  }

  /**
   * Process API response from host service
   */
  private async processResponse(response: Response): Promise<ApiResponse> {
    if (!response.ok) {
      throw createProxyError(
        ProxyErrorType.NETWORK_ERROR,
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    let data: any;
    try {
      data = await response.json();
    } catch (error) {
      throw createProxyError(
        ProxyErrorType.INVALID_RESPONSE,
        'Invalid JSON response from API'
      );
    }

    // Validate response structure
    if (typeof data !== 'object' || data === null) {
      throw createProxyError(
        ProxyErrorType.INVALID_RESPONSE,
        'Invalid response format from API'
      );
    }

    return data;
  }

  /**
   * Send successful response back to client
   */
  private sendSuccessResponse(source: Window, requestId: string, response: ApiResponse): void {
    const message = createProxyResponse(requestId, response);
    source.postMessage(message, '*');

    if (this.config.debug) {
      console.log('[ApiProxyServer] Success response sent:', {
        requestId,
        success: response.success
      });
    }
  }

  /**
   * Send error response back to client
   */
  private sendErrorResponse(source: Window, requestId: string, error: any): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const response: ApiResponse = {
      success: false,
      error: errorMessage
    };

    const message = createProxyResponse(requestId, response);
    source.postMessage(message, '*');

    if (this.config.debug) {
      console.log('[ApiProxyServer] Error response sent:', {
        requestId,
        error: errorMessage
      });
    }
  }

  /**
   * Get proxy server status
   */
  public getStatus(): ProxyServerStatus {
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

  /**
   * Destroy the proxy server
   */
  public destroy(): void {
    // Remove message listener
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