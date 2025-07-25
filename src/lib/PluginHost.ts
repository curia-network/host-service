/**
 * PluginHost - Server-side plugin communication manager
 * 
 * This class handles:
 * 1. Plugin configuration and metadata management
 * 2. Request signature validation using @curia_/cg-plugin-lib-host
 * 3. API method routing to data providers
 * 4. Response formatting for plugin consumption
 */

import { DataProvider } from './DataProvider';
import { CgPluginLibHost } from '@curia_/cg-plugin-lib-host';

/**
 * Plugin configuration interface
 */
export interface PluginConfig {
  /** Plugin URL */
  url: string;
  /** Community ID this plugin instance serves */
  communityId: string;
  /** Allowed origins for CORS */
  allowedOrigins?: string[];
  /** Plugin-specific settings */
  settings?: Record<string, any>;
}

/**
 * Standard API request interface from plugins
 */
export interface PluginApiRequest {
  method: string;
  params?: any;
  signature?: string;
  timestamp?: number;
  communityId: string;
  userId?: string;
  requestId?: string; // For request correlation and debugging
}

/**
 * Standard API response interface to plugins
 */
export interface PluginApiResponse<T = any> {
  data: T;
  success: boolean;
  error?: string;
}

/**
 * Server-side plugin host that validates and routes API requests
 */
export class PluginHost {
  private dataProvider: DataProvider;

  constructor(dataProvider: DataProvider) {
    this.dataProvider = dataProvider;
  }

  /**
   * Process an API request from a plugin
   * 
   * @param request - The API request
   * @returns Promise<PluginApiResponse>
   */
  public async processApiRequest(request: PluginApiRequest): Promise<PluginApiResponse> {
    try {
      // Validate request structure
      if (!request.method || !request.communityId) {
        return {
          data: null,
          success: false,
          error: 'Invalid request: missing method or communityId'
        };
      }

      // 🔐 SIGNATURE VALIDATION: Verify request is from trusted plugin
      console.log('[PluginHost] 🔐 Validating signature for request:', {
        method: request.method,
        hasSignature: !!request.signature,
        requestId: request.requestId || 'no-id',
        timestamp: new Date().toISOString()
      });

      if (!request.signature) {
        console.warn('[PluginHost] ❌ Request rejected: No signature provided');
        return {
          data: null,
          success: false,
          error: 'Request rejected: Missing signature'
        };
      }

      try {
        const isValidSignature = await this.verifyPluginSignature(request, request.signature);
        
        if (!isValidSignature) {
          console.warn('[PluginHost] ❌ Request rejected: Invalid signature');
          return {
            data: null,
            success: false,
            error: 'Request rejected: Invalid signature'
          };
        }

        console.log('[PluginHost] ✅ Signature validation passed');
      } catch (error) {
        console.error('[PluginHost] ❌ Signature validation failed:', error);
        return {
          data: null,
          success: false,
          error: 'Request rejected: Signature validation error'
        };
      }
      
      // Route to appropriate API handler
      let responseData: any;
      
      switch (request.method) {
        case 'getUserInfo':
          responseData = await this.dataProvider.getUserInfo(
            request.userId || 'default_user', 
            request.communityId
          );
          break;
          
        case 'getContextData':
          responseData = await this.dataProvider.getContextData(
            request.userId || 'default_user',
            request.communityId
          );
          break;
          
        case 'getCommunityInfo':
          responseData = await this.dataProvider.getCommunityInfo(request.communityId);
          break;
          
        case 'getUserFriends':
          const { limit, offset } = request.params || {};
          responseData = await this.dataProvider.getUserFriends(
            request.userId || 'default_user',
            request.communityId,
            limit || 10, 
            offset || 0
          );
          break;
          
        case 'giveRole':
          const { roleId, userId: targetUserId } = request.params || {};
          responseData = await this.dataProvider.giveRole(
            request.userId || 'default_user',
            targetUserId,
            roleId,
            request.communityId
          );
          break;
          
        default:
          return {
            data: null,
            success: false,
            error: `Unknown API method: ${request.method}`
          };
      }

      return {
        data: responseData,
        success: true
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        data: null,
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Validate plugin request signature using curia's public key
   * 
   * @param request - The request to validate  
   * @param signature - The signature to verify
   * @returns Promise<boolean> - Whether the signature is valid
   */
  private async verifyPluginSignature(request: any, signature: string): Promise<boolean> {
    try {
      // Get curia's public key from environment
      const curiaPublicKey = process.env.NEXT_PUBLIC_CURIA_PUBKEY;
      if (!curiaPublicKey) {
        console.error('[PluginHost] ❌ CURIA_PUBKEY not found in environment');
        return false;
      }

      // Get host-service's private key (CgPluginLibHost requires both keys for initialization)
      const hostPrivateKey = process.env.NEXT_PRIVATE_PRIVKEY;
      if (!hostPrivateKey) {
        console.error('[PluginHost] ❌ HOST_PRIVATE_KEY not found in environment');
        return false;
      }

      // Initialize the verification library with both keys
      // Note: For testing, keys are identical between host-service and curia
      const verifier = await CgPluginLibHost.initialize(hostPrivateKey, curiaPublicKey);
      
      // Verify the signature against the request data
      const isValid = await verifier.verifySignature(request, signature);
      
      console.log('[PluginHost] 🔐 Signature verification result:', isValid);
      return isValid;
      
    } catch (error) {
      console.error('[PluginHost] ❌ Signature verification error:', error);
      return false;
    }
  }

  /**
   * Validate plugin request signature (legacy method - now delegates to verifyPluginSignature)
   * 
   * @param request - The request to validate
   * @returns Promise<boolean>
   */
  private async validateSignature(request: PluginApiRequest): Promise<boolean> {
    if (!request.signature || !request.timestamp) {
      console.warn('[PluginHost] Request missing signature or timestamp');
      return false;
    }

    // Check timestamp to prevent replay attacks (5 minute window)
    const now = Date.now();
    const requestTime = request.timestamp;
    const timeDiff = Math.abs(now - requestTime);
    
    if (timeDiff > 5 * 60 * 1000) { // 5 minutes
      console.warn('[PluginHost] Request timestamp too old:', { 
        now, requestTime, diffMinutes: timeDiff / (60 * 1000) 
      });
      return false;
    }

    // Use the new signature verification method
    return this.verifyPluginSignature(request, request.signature);
  }

  /**
   * Validate CORS origin
   * 
   * @param origin - Request origin
   * @param allowedOrigins - Allowed origins for this plugin
   * @returns boolean
   */
  public validateOrigin(origin: string, allowedOrigins: string[] = []): boolean {
    // Allow all origins if none specified (development mode)
    if (allowedOrigins.length === 0) {
      return true;
    }
    
    // Check if origin is in allowed list
    return allowedOrigins.includes(origin) || allowedOrigins.includes('*');
  }
} 