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
import { FrontendSignatureValidator } from '../signature';

export enum InternalMessageType {
  API_REQUEST = 'api_request',
  API_RESPONSE = 'api_response',
  INIT = 'init',
  ERROR = 'error',
  SIDEBAR_ACTION = 'sidebar_action'  // 🆕 NEW - For sending sidebar actions to forum
}

export interface InternalPluginMessage {
  type: InternalMessageType;
  iframeUid: string;
  requestId: string;
  method?: string;
  params?: any;
  data?: any;
  error?: string;
  signature?: string;
  timestamp?: number; // ✅ Add timestamp field to match signed data
}

/**
 * Extends InternalPluginMessage for sidebar actions
 */
interface SidebarActionMessage extends InternalPluginMessage {
  type: InternalMessageType.SIDEBAR_ACTION;
  action: 'search' | 'messages' | 'notifications';
  payload?: any;
}

export interface MessageRouterCallbacks {
  onAuthComplete?: (data: any) => Promise<void>;
  onForumInit?: () => void;
  getAuthContext?: () => InternalAuthContext | null;
  onCommunitySwitchRequest?: (communityId: string, options?: any) => Promise<any>;
  onCommunityDiscoveryComplete?: (data: any) => Promise<void>;
  onAddSessionComplete?: (data: any) => Promise<void>;
  onApiProxyReady?: (iframeWindow: Window) => void;
  getActiveIframe?: () => HTMLIFrameElement | null;  // 🆕 NEW - Get currently active iframe
}

export class MessageRouter {
  private apiProxy: ApiProxyClient;
  private callbacks: MessageRouterCallbacks;
  private messageListener?: (event: MessageEvent) => void;
  private myUid: string;
  private signatureValidator: FrontendSignatureValidator;

  constructor(
    myUid: string,
    apiProxy: ApiProxyClient,
    callbacks: MessageRouterCallbacks = {},
    publicKey?: string
  ) {
    // Use the shared API proxy client (don't create a new one!)
    this.apiProxy = apiProxy;
    this.myUid = myUid;
    this.callbacks = callbacks;
    
    // Initialize signature validator for frontend validation
    if (publicKey) {
      // Use provided public key (for embed script)
      this.signatureValidator = FrontendSignatureValidator.fromPublicKey(publicKey);
    } else {
      // Use environment variable (for Next.js components)
      this.signatureValidator = FrontendSignatureValidator.fromEnvironment();
    }
    
    console.log('[MessageRouter] Initialized with shared API proxy client and signature validator');
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

    // Handle API proxy ready notification from iframe
    if (event.data.type === 'curia-api-proxy-ready') {
      console.log('[MessageRouter] API proxy ready notification received');
      if (this.callbacks.onApiProxyReady) {
        this.callbacks.onApiProxyReady(event.source as Window);
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

      // 🔐 FRONTEND SIGNATURE VALIDATION: Validate iframe request before transformation
      if (message.signature) {
        console.log('[MessageRouter] 🔐 Validating signature (frontend Web Crypto API)');
        
        // 🔍 SPECIAL DEBUG for getUserFriends method
        if (message.method === 'getUserFriends') {
          console.log('[MessageRouter] 🔍 DEBUG getUserFriends - Full message:', JSON.stringify(message, null, 2));
          console.log('[MessageRouter] 🔍 DEBUG getUserFriends - Params structure:', {
            params: message.params,
            paramsType: typeof message.params,
            paramsKeys: message.params ? Object.keys(message.params) : 'no params'
          });
        }
        
        try {
          // Reconstruct original signed data (what CgPluginLib actually signed)
          const originalSignedData: any = {
            method: message.method,
            iframeUid: message.iframeUid,
            requestId: message.requestId,
            timestamp: message.timestamp // ✅ Use timestamp from message
          };
          
          // Only include params if it exists and is not undefined (matches signing behavior)
          if (message.params !== undefined) {
            originalSignedData.params = message.params;
          }

          // 🔍 DEBUG: Log exactly what we're validating
          console.log('[MessageRouter] 🔍 DEBUG - Message received:', JSON.stringify(message, null, 2));
          console.log('[MessageRouter] 🔍 DEBUG - Data for validation:', JSON.stringify(originalSignedData, null, 2));
          console.log('[MessageRouter] 🔍 DEBUG - Signature length:', message.signature?.length);

          // 🔍 EXTRA DEBUG for getUserFriends
          if (message.method === 'getUserFriends') {
            console.log('[MessageRouter] 🔍 DEBUG getUserFriends - About to validate signature with data:', JSON.stringify(originalSignedData, null, 2));
          }

          // Validate signature using browser-native Web Crypto API
          const isValid = await this.signatureValidator.validateSignature(originalSignedData, message.signature);
          
          if (!isValid) {
            // 🔍 EXTRA DEBUG for getUserFriends failures
            if (message.method === 'getUserFriends') {
              console.error('[MessageRouter] ❌ getUserFriends signature validation FAILED');
              console.error('[MessageRouter] ❌ Failed data:', JSON.stringify(originalSignedData, null, 2));
              console.error('[MessageRouter] ❌ Failed signature:', message.signature);
            }
            throw new Error('Invalid signature - request rejected');
          }
          
          console.log('[MessageRouter] ✅ Frontend signature validation passed');
          
          // 🔍 SUCCESS DEBUG for getUserFriends
          if (message.method === 'getUserFriends') {
            console.log('[MessageRouter] 🎉 getUserFriends signature validation PASSED!');
          }
        } catch (error) {
          console.error('[MessageRouter] ❌ Frontend signature validation failed:', error);
          
          // 🔍 EXTRA DEBUG for getUserFriends failures
          if (message.method === 'getUserFriends') {
            console.error('[MessageRouter] ❌ getUserFriends signature validation ERROR:', error);
          }
          
          this.sendError(source, message, `Signature validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return;
        }
      } else {
        // No signature means this should be an internal call, but iframe requests should always have signatures
        console.warn('[MessageRouter] ⚠️ No signature provided for iframe request - this might be a security issue');
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
      console.log('[MessageRouter] Signature present:', !!message.signature);
      console.log(`[MULTI-IFRAME] [MessageRouter] API request "${message.method}" using community context: ${authContext.communityId}`);
      
      const result = await this.apiProxy.makeApiRequest({
        method: message.method as any,
        params: message.params,
        communityId: authContext.communityId,
        userId: authContext.userId,
        signature: message.signature
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
      'switchCommunity',
      'getUserCommunities',  // 🎯 For fetchUserCommunities() - bypasses CSP
      'getUserProfile',      // 🎯 For fetchUserProfile() - bypasses CSP
      'getIrcCredentials'    // 🎯 For IRC chat functionality - handled directly by PluginHost
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
   * Send a sidebar action to the currently active iframe
   */
  sendSidebarAction(action: 'search' | 'messages' | 'notifications', payload?: any): void {
    // Get the currently active iframe from callback
    const activeIframe = this.callbacks.getActiveIframe?.();
    if (!activeIframe) {
      console.warn('[MessageRouter] No active iframe available for sidebar action:', action);
      return;
    }

    // Create sidebar action message
    const message: SidebarActionMessage = {
      type: InternalMessageType.SIDEBAR_ACTION,
      action,
      payload,
      iframeUid: this.myUid,
      requestId: `sidebar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Send to active iframe
    this.sendMessageToIframe(activeIframe, message);
    console.log(`[MessageRouter] Sidebar action sent: ${action}`, payload);
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