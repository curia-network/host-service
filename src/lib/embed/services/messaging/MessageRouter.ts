/**
 * MessageRouter Service
 * Handles all iframe messaging, API routing, and inter-frame communication
 * 
 * Extracted from InternalPluginHost for better separation of concerns
 * Responsibilities:
 * - Set up message listeners for iframe communication
 * - Route API requests from iframe to host service via proxy
 * - Handle authentication completion messages
 * - Send responses and errors back to iframes
 * - Manage message routing between multiple embed instances
 */

import { ApiProxyClient } from '@curia_/iframe-api-proxy';
import { InternalAuthContext } from '../auth/AuthenticationService';

export enum InternalMessageType {
  API_REQUEST = 'api_request',
  API_RESPONSE = 'api_response',
  INIT = 'init',
  ERROR = 'error'
}

export interface InternalPluginMessage {
  type: InternalMessageType;
  iframeUid: string;
  requestId: string;
  method?: string;
  params?: any;
  data?: any;
  error?: string;
}

export interface MessageRouterCallbacks {
  onAuthComplete?: (authData: any) => Promise<void>;
  onForumInit?: () => void;
  getAuthContext?: () => InternalAuthContext | null;
  onCommunitySwitchRequest?: (communityId: string, options?: any) => Promise<any>;
  onCommunityDiscoveryComplete?: (discoveryData: any) => Promise<void>;
  onAddSessionComplete?: (sessionData: any) => Promise<void>;
}

export class MessageRouter {
  private apiProxy: ApiProxyClient;
  private callbacks: MessageRouterCallbacks;
  private messageListener?: (event: MessageEvent) => void;
  private myUid: string;

  constructor(
    myUid: string,
    apiProxy: ApiProxyClient,
    callbacks: MessageRouterCallbacks = {}
  ) {
    // Use the shared API proxy client (don't create a new one!)
    this.apiProxy = apiProxy;
    this.myUid = myUid;
    this.callbacks = callbacks;
    
    console.log('[MessageRouter] Initialized with shared API proxy client');
  }

  /**
   * Set up message listener for all plugin communication
   */
  setupMessageListener(): void {
    // Store listener reference for proper cleanup
    this.messageListener = (event: MessageEvent) => {
      this.handleMessage(event);
    };
    
    window.addEventListener('message', this.messageListener);
    console.log('[MessageRouter] Message listener attached for UID:', this.myUid);
  }

  /**
   * Handle all incoming messages
   */
  private async handleMessage(event: MessageEvent): Promise<void> {
    if (!event.data || typeof event.data !== 'object') {
      return;
    }

    // Handle auth completion from embed iframe
    if (event.data.type === 'curia-auth-complete') {
      if (this.callbacks.onAuthComplete) {
        await this.callbacks.onAuthComplete(event.data);
      }
      return;
    }

    // Handle community discovery completion from embed iframe
    if (event.data.type === 'curia-community-discovery-complete') {
      if (this.callbacks.onCommunityDiscoveryComplete) {
        await this.callbacks.onCommunityDiscoveryComplete(event.data);
      }
      return;
    }

    // Handle add session completion from embed iframe
    if (event.data.type === 'curia-add-session-complete') {
      if (this.callbacks.onAddSessionComplete) {
        await this.callbacks.onAddSessionComplete(event.data);
      }
      return;
    }

    // Handle API requests from forum
    const message = event.data as InternalPluginMessage;
    if (message.type === InternalMessageType.API_REQUEST) {
      await this.handleApiRequest(message, event.source as Window);
      return;
    }

    // Handle other message types
    if (message.type === InternalMessageType.INIT) {
      console.log('[MessageRouter] Forum initialized');
      if (this.callbacks.onForumInit) {
        this.callbacks.onForumInit();
      }
      return;
    }
  }

  /**
   * Handle API requests from forum iframe
   */
  private async handleApiRequest(message: InternalPluginMessage, source: Window): Promise<void> {
    try {
      console.log('[MessageRouter] API request:', message.method, message.params);
      
      // Get auth context from callback
      const authContext = this.callbacks.getAuthContext?.();
      if (!authContext) {
        throw new Error('No authentication context available');
      }

      // Instance-based UID filtering - only handle our own messages
      if (message.iframeUid !== this.myUid) {
        // Silently ignore messages from other embed instances
        return;
      }

      // Validate method is provided and supported
      if (!message.method || !this.isMethodSupported(message.method)) {
        throw new Error(`Unknown API method: ${message.method}`);
      }

      // Handle community switching requests locally (not via API proxy)
      if (message.method === 'switchCommunity') {
        console.log('[MessageRouter] Handling community switch request:', message.params);
        
        if (!this.callbacks.onCommunitySwitchRequest) {
          throw new Error('Community switching not supported - no callback registered');
        }

        const { communityId, options } = message.params;
        if (!communityId) {
          throw new Error('Missing communityId parameter for community switch');
        }

        const switchResult = await this.callbacks.onCommunitySwitchRequest(communityId, options);
        this.sendResponse(source, message, switchResult);
        return;
      }

      // Use API proxy client to make request (bypasses CSP restrictions)
      console.log('[MessageRouter] Making API request via proxy:', message.method);
      console.log('[MessageRouter] Auth context:', {
        communityId: authContext.communityId,
        userId: authContext.userId
      });
      console.log(`[MULTI-IFRAME] [MessageRouter] API request "${message.method}" using community context: ${authContext.communityId}`);
      
      const result = await this.apiProxy.makeApiRequest({
        method: message.method as any,
        params: message.params,
        communityId: authContext.communityId,
        userId: authContext.userId
      });

      console.log('[MessageRouter] API proxy response:', result);
      
      if (result.success) {
        // Send successful response
        this.sendResponse(source, message, result.data);
      } else {
        throw new Error(result.error || 'API request failed');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[MessageRouter] API error:', errorMessage);
      this.sendError(source, message, errorMessage);
    }
  }

  /**
   * Send successful response to forum
   */
  private sendResponse(source: Window, originalMessage: InternalPluginMessage, data: any): void {
    const response: InternalPluginMessage = {
      type: InternalMessageType.API_RESPONSE,
      iframeUid: originalMessage.iframeUid,
      requestId: originalMessage.requestId,
      data: data
    };
    
    source.postMessage(response, '*');
    console.log('[MessageRouter] Response sent for request:', originalMessage.requestId);
  }

  /**
   * Send error response to forum
   */
  private sendError(source: Window, originalMessage: InternalPluginMessage, error: string): void {
    const response: InternalPluginMessage = {
      type: InternalMessageType.API_RESPONSE,
      iframeUid: originalMessage.iframeUid,
      requestId: originalMessage.requestId,
      error: error
    };
    
    source.postMessage(response, '*');
    console.log('[MessageRouter] Error response sent for request:', originalMessage.requestId, error);
  }

  /**
   * Check if API method is supported
   */
  private isMethodSupported(method: string): boolean {
    const supportedMethods = [
      'getUserInfo',
      'getUserFriends', 
      'getContextData',
      'getCommunityInfo',
      'giveRole',
      'switchCommunity'
    ];
    
    return supportedMethods.includes(method);
  }

  /**
   * Send a message to an iframe
   */
  sendMessageToIframe(iframe: HTMLIFrameElement, message: InternalPluginMessage): void {
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage(message, '*');
      console.log('[MessageRouter] Message sent to iframe:', message.type, message.requestId);
    }
  }

  /**
   * Update the unique identifier for this embed instance
   */
  updateUid(newUid: string): void {
    this.myUid = newUid;
    console.log('[MessageRouter] UID updated to:', newUid);
  }

  /**
   * Clean up message listeners and resources
   */
  destroy(): void {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = undefined;
      console.log('[MessageRouter] Message listener removed');
    }
  }
} 