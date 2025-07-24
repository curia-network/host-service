/**
 * AuthenticationService
 * Handles all authentication flows, session management, and user data fetching
 * 
 * Extracted from InternalPluginHost for better separation of concerns
 * Responsibilities:
 * - Initialize auth phase and create auth iframe
 * - Handle auth completion and session establishment
 * - Fetch user communities and profile data
 * - Handle session switching and cross-tab synchronization
 * - Manage sign-out and session cleanup
 */

import { sessionManager } from '../../../SessionManager';
import { ApiProxyClient } from '@curia_/iframe-api-proxy';

export interface InternalAuthContext {
  userId: string;
  communityId: string;
  sessionToken?: string;
  externalParams?: Record<string, string>;
  parentUrl?: string;
}

export interface UserCommunityMembership {
  id: string;
  name: string;
  logoUrl: string | null;
  userRole: 'member' | 'moderator' | 'admin' | 'owner';
  isMember: boolean;
}

export interface UserProfile {
  userId: string;
  name: string;
  profilePictureUrl: string | null;
  identityType: 'ens' | 'universal_profile' | 'anonymous';
  walletAddress: string | null;
  ensDomain: string | null;
  upAddress: string | null;
  isAnonymous: boolean;
}

export interface AuthConfig {
  theme?: string;
  backgroundColor?: string;
  community?: string;
  mode?: string;
  parentUrl?: string;
  externalParams?: Record<string, string>;
  width?: string;
  height?: string;
  borderRadius?: string;
}

export interface AuthenticationCallbacks {
  onAuthComplete?: (authData: any, context: InternalAuthContext) => Promise<void>;
  onSessionSwitch?: (profile: UserProfile) => Promise<void>;
  onSignOut?: () => void;
  onCrossTabSessionUpdate?: () => void;
}

export class AuthenticationService {
  private hostServiceUrl: string;
  private authContext: InternalAuthContext | null = null;
  private callbacks: AuthenticationCallbacks;
  private sessionListener?: (event: MessageEvent) => void;
  private crossTabListener?: (event: Event) => void;
  private sessionManagerSubscription?: () => void;
  private lastActiveSessionToken: string | null = null;
  private apiProxy: ApiProxyClient | null = null;  // 🆕 NEW - For CSP-compliant API calls

  constructor(
    hostServiceUrl: string, 
    callbacks: AuthenticationCallbacks = {},
    apiProxy?: ApiProxyClient  // 🆕 NEW - Optional API proxy for CSP compliance
  ) {
    this.hostServiceUrl = hostServiceUrl;
    this.callbacks = callbacks;
    this.apiProxy = apiProxy || null;  // 🆕 NEW - Store the API proxy instance
    
    // Subscribe to SessionManager changes to trigger session switching
    this.setupSessionManagerSubscription();
    
    console.log('[AuthenticationService] Initialized');
  }

  /**
   * Get current authentication context
   */
  getAuthContext(): InternalAuthContext | null {
    return this.authContext;
  }

  /**
   * Make API call with retry logic and exponential backoff
   * Handles the race condition where forum iframe is created but ApiProxyServer isn't ready yet
   */
  private async makeApiCallWithRetry(
    method: 'getUserCommunities' | 'getUserProfile', 
    params: any, 
    maxRetries: number = 3
  ): Promise<any> {
    if (!this.apiProxy || !this.authContext) {
      throw new Error('API proxy or auth context not available');
    }

    console.log(`[AuthenticationService] 🔄 Starting API proxy calls for ${method} (max ${maxRetries} attempts)`);
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[AuthenticationService] 🎯 API proxy attempt ${attempt}/${maxRetries} for ${method}`);
        
        const response = await this.apiProxy.makeApiRequest({
          method,
          userId: this.authContext.userId,
          communityId: this.authContext.communityId,
          params
        });

        if (response.success) {
          console.log(`[AuthenticationService] ✅ API proxy SUCCESS for ${method} on attempt ${attempt}/${maxRetries}`);
          return response;
        } else {
          throw new Error(response.error || `API request failed for ${method}`);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          console.log(`[AuthenticationService] ❌ API proxy FINAL FAILURE for ${method} after ${maxRetries} attempts:`, lastError.message);
          break;
        }

        // Exponential backoff: 250ms, 500ms, 1000ms (max 1s to keep UI responsive)
        const delay = Math.min(250 * Math.pow(2, attempt - 1), 1000);
        console.log(`[AuthenticationService] ⏳ API proxy attempt ${attempt} failed for ${method}, retrying in ${delay}ms:`, lastError.message);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error(`API proxy failed after ${maxRetries} attempts for ${method}`);
  }

  /**
   * Create and configure auth iframe
   */
  createAuthIframe(config: AuthConfig, container: HTMLElement): HTMLIFrameElement {
    console.log('[AuthenticationService] Creating auth iframe');
    
    // Build auth iframe URL with theme and community parameters
    const authUrl = new URL(`${this.hostServiceUrl}/embed`);
    authUrl.searchParams.set('theme', config.theme || 'light');
    
    if (config.backgroundColor) {
      authUrl.searchParams.set('background_color', config.backgroundColor);
    }
    if (config.community) {
      authUrl.searchParams.set('community', config.community);
      console.log('[AuthenticationService] Adding community parameter:', config.community);
    }
    if (config.mode) {
      authUrl.searchParams.set('mode', config.mode);
      console.log('[AuthenticationService] Adding mode parameter:', config.mode);
    }
    
    // Add parent URL to auth iframe
    if (config.parentUrl) {
      const encodedParentUrl = encodeURIComponent(config.parentUrl);
      authUrl.searchParams.set('cg_parent_url', encodedParentUrl);
      console.log('[AuthenticationService] Adding parent URL:', config.parentUrl);
    }
    
    // Add external parameters from parent page
    if (config.externalParams) {
      console.log('[AuthenticationService] Adding external parameters:', config.externalParams);
      for (const [key, value] of Object.entries(config.externalParams)) {
        authUrl.searchParams.set(key, value);
      }
    }
    
    // Create auth iframe
    const iframe = document.createElement('iframe');
    iframe.src = authUrl.toString();
    iframe.style.width = config.width || '100%';
    iframe.style.height = config.height || '700px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = config.borderRadius || '8px';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
    iframe.setAttribute('allow', this.getIframePermissions());
    
    console.log('[AuthenticationService] Auth iframe created with theme:', config.theme);
    return iframe;
  }

  /**
   * Handle authentication completion from iframe
   */
  async handleAuthCompletion(authData: any): Promise<void> {
    console.log('[AuthenticationService] Auth completion received:', authData);
    
    // Store auth context including external parameters and parent URL
    this.authContext = {
      userId: authData.userId,
      communityId: authData.communityId,
      sessionToken: authData.sessionToken,
      externalParams: authData.externalParams,
      parentUrl: authData.parentUrl
    };
    
    console.log('[AuthenticationService] Auth context set:', this.authContext);
    
    // Notify parent about auth completion
    if (this.callbacks.onAuthComplete) {
      await this.callbacks.onAuthComplete(authData, this.authContext);
    }
  }

  /**
   * Fetch user's community memberships
   * Direct API call (will work on non-CSP sites, may fail on strict CSP sites)
   */
  async fetchUserCommunities(): Promise<UserCommunityMembership[]> {
    try {
      console.log('[AuthenticationService] Fetching user communities...');
      
      if (!this.authContext?.sessionToken) {
        console.log('[AuthenticationService] No session token available');
        return [];
      }

      // 🎯 API PROXY ONLY: No fallback to direct fetch for cleaner testing
      if (this.apiProxy && this.authContext) {
        try {
          console.log('[AuthenticationService] Using API proxy with retry logic for communities');
          const proxyResponse = await this.makeApiCallWithRetry('getUserCommunities', {
            sessionToken: this.authContext.sessionToken
          });

          if (proxyResponse.data?.userCommunities) {
            console.log('[AuthenticationService] API proxy success:', proxyResponse.data.userCommunities.length, 'communities');
            return proxyResponse.data.userCommunities.map((community: any) => ({
              id: community.id,
              name: community.name,
              logoUrl: community.logoUrl || null,
              userRole: community.userRole || 'member',
              isMember: community.isMember
            }));
          }
        } catch (proxyError) {
          console.log('[AuthenticationService] 🚫 API proxy failed after all retries for communities:', proxyError);
          console.log('[AuthenticationService] 🚫 Giving up on community fetch - returning empty list');
          return [];
        }
      }

      console.log('[AuthenticationService] 🚫 No API proxy available - returning empty communities');
      return [];
    } catch (error) {
      console.error('[AuthenticationService] Error fetching user communities:', error);
      return [];
    }
  }

  /**
   * Fetch user profile information
   * Direct API call (will work on non-CSP sites, may fail on strict CSP sites)
   */
  async fetchUserProfile(): Promise<UserProfile | null> {
    try {
      if (!this.authContext?.sessionToken) {
        console.log('[AuthenticationService] No session token for user profile fetch');
        return null;
      }

      // 🎯 API PROXY ONLY: No fallback to direct fetch for cleaner testing
      if (this.apiProxy && this.authContext) {
        try {
          console.log('[AuthenticationService] Using API proxy with retry logic for profile');
          const proxyResponse = await this.makeApiCallWithRetry('getUserProfile', {
            sessionToken: this.authContext.sessionToken
          });

          if (proxyResponse.data?.user) {
            console.log('[AuthenticationService] API proxy profile success');
            return {
              userId: proxyResponse.data.user.user_id,
              name: proxyResponse.data.user.name,
              profilePictureUrl: proxyResponse.data.user.profile_picture_url || null,
              identityType: proxyResponse.data.user.identity_type || 'anonymous',
              walletAddress: proxyResponse.data.user.wallet_address || null,
              ensDomain: proxyResponse.data.user.ens_domain || null,
              upAddress: proxyResponse.data.user.up_address || null,
              isAnonymous: proxyResponse.data.user.is_anonymous
            };
          }
        } catch (proxyError) {
          console.log('[AuthenticationService] 🚫 API proxy failed after all retries for profile:', proxyError);
          console.log('[AuthenticationService] 🚫 Giving up on profile fetch - returning null');
          return null;
        }
      }

      console.log('[AuthenticationService] 🚫 No API proxy available - returning null profile');
      return null;
    } catch (error) {
      console.error('[AuthenticationService] Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Handle session switching (e.g., from account switcher)
   */
  async handleSessionSwitch(): Promise<void> {
    console.log('[AuthenticationService] Handling session switch');
    
    try {
      // Get the new active session
      const activeSession = sessionManager.getActiveSession();
      if (!activeSession) {
        console.log('[AuthenticationService] No active session after switch');
        if (this.callbacks.onSignOut) {
          this.callbacks.onSignOut();
        }
        return;
      }

      // Update user profile from session
      const userProfile: UserProfile = {
        userId: activeSession.userId,
        name: activeSession.name || 'Anonymous User',
        profilePictureUrl: activeSession.profileImageUrl || null,
        identityType: activeSession.identityType,
        walletAddress: activeSession.walletAddress || null,
        ensDomain: activeSession.ensName || null,
        upAddress: activeSession.upAddress || null,
        isAnonymous: activeSession.identityType === 'anonymous',
      };

      // Notify parent about session switch
      if (this.callbacks.onSessionSwitch) {
        await this.callbacks.onSessionSwitch(userProfile);
      }

      console.log('[AuthenticationService] Session switch completed');
      
    } catch (error) {
      console.error('[AuthenticationService] Failed to handle session switch:', error);
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    console.log('[AuthenticationService] Signing out user');
    
    // Clear auth context
    this.authContext = null;
    
    // Clear session using SessionManager
    try {
      await sessionManager.removeActiveSession();
      console.log('[AuthenticationService] Session cleared via SessionManager');
    } catch (error) {
      console.error('[AuthenticationService] Failed to clear session:', error);
    }
    
    // Notify parent
    if (this.callbacks.onSignOut) {
      this.callbacks.onSignOut();
    }
  }

  /**
   * Subscribe to SessionManager changes to handle session switching
   * Only triggers when the ACTIVE SESSION actually changes (not just any session data)
   */
  private setupSessionManagerSubscription(): void {
    this.sessionManagerSubscription = sessionManager.subscribe((sessions, activeToken, activeSession) => {
      // Only trigger handleSessionSwitch if:
      // 1. We have an auth context (i.e., we're in an active embed, not just initializing)
      // 2. The active session token has actually changed (not just session data updates)
      if (this.authContext && activeToken !== this.lastActiveSessionToken) {
        console.log('[AuthenticationService] Active session changed from', this.lastActiveSessionToken, 'to', activeToken);
        console.log('[AuthenticationService] Triggering session switch (full reload)');
        
        // Update tracked token BEFORE triggering reload (since reload destroys this instance)
        this.lastActiveSessionToken = activeToken;
        
        this.handleSessionSwitch();
      } else if (activeToken !== this.lastActiveSessionToken) {
        // Update tracked token even if we don't have auth context yet (initialization)
        console.log('[AuthenticationService] Active session token updated (no auth context yet):', activeToken);
        this.lastActiveSessionToken = activeToken;
      }
    });
  }

  /**
   * Setup cross-tab session synchronization
   */
  setupCrossTabSessionListener(): void {
    // Listen for session changes from other tabs
    this.sessionListener = (event: MessageEvent) => {
      if (event.data?.type === 'session-updated') {
        console.log('[AuthenticationService] Cross-tab session update detected');
        if (this.callbacks.onCrossTabSessionUpdate) {
          this.callbacks.onCrossTabSessionUpdate();
        }
      }
    };

    window.addEventListener('message', this.sessionListener);
    
    // Listen for specific SessionManager cross-tab events (not all storage changes)
    const crossTabListener = (event: Event) => {
      // Only respond to SessionManager's specific cross-tab events
      if (event instanceof CustomEvent && event.type === 'curia-session-change') {
        console.log('[AuthenticationService] Cross-tab session change detected via custom event');
        if (this.callbacks.onCrossTabSessionUpdate) {
          this.callbacks.onCrossTabSessionUpdate();
        }
      }
    };
    
    // Store reference for cleanup
    this.crossTabListener = crossTabListener;
    window.addEventListener('curia-session-change', crossTabListener);
    
    console.log('[AuthenticationService] Cross-tab session listener setup (using custom events)');
  }

  /**
   * Get iframe permissions string
   */
  private getIframePermissions(): string {
    return 'camera; microphone; geolocation; clipboard-write; clipboard-read; payment; autoplay; fullscreen';
  }

  /**
   * Update the active community context for API requests
   */
  updateCommunityContext(communityId: string): void {
    if (!this.authContext) {
      console.error('[AuthenticationService] Cannot update community context - no auth context available');
      return;
    }

    const previousCommunityId = this.authContext.communityId;
    this.authContext.communityId = communityId;
    
    console.log(`[MULTI-IFRAME] [AuthenticationService] Community context updated:`);
    console.log(`[MULTI-IFRAME] [AuthenticationService]   Previous: ${previousCommunityId}`);
    console.log(`[MULTI-IFRAME] [AuthenticationService]   New: ${communityId}`);
    console.log(`[MULTI-IFRAME] [AuthenticationService] API requests will now use community: ${communityId}`);
  }

  /**
   * Clean up listeners and resources
   */
  destroy(): void {
    if (this.sessionListener) {
      window.removeEventListener('message', this.sessionListener);
      this.sessionListener = undefined;
    }
    
    if (this.crossTabListener) {
      window.removeEventListener('curia-session-change', this.crossTabListener);
      this.crossTabListener = undefined;
    }
    
    if (this.sessionManagerSubscription) {
      this.sessionManagerSubscription();
      this.sessionManagerSubscription = undefined;
    }
    
    this.authContext = null;
    console.log('[AuthenticationService] Destroyed and cleaned up listeners');
  }
} 