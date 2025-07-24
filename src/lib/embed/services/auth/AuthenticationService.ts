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
import { ApiProxyClient } from '@curia_/iframe-api-proxy'; // 🎯 Correct import path

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
  private apiProxy: ApiProxyClient | null = null; // Added apiProxy property

  constructor(
    hostServiceUrl: string, 
    callbacks: AuthenticationCallbacks = {},
    apiProxy?: ApiProxyClient // 🎯 Accept the working API proxy instance
  ) {
    this.hostServiceUrl = hostServiceUrl;
    this.callbacks = callbacks;
    this.apiProxy = apiProxy || null; // 🎯 Store the working proxy
    
    // Subscribe to SessionManager changes to trigger session switching
    this.setupSessionManagerSubscription();
    
    console.log('[AuthenticationService] Initialized', { 
      hasApiProxy: !!this.apiProxy // 🎯 Log proxy availability
    });
  }

  /**
   * Get current authentication context
   */
  getAuthContext(): InternalAuthContext | null {
    return this.authContext;
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
   * Uses API proxy when available (CSP-safe), falls back to direct fetch for non-CSP sites
   */
  async fetchUserCommunities(): Promise<UserCommunityMembership[]> {
    try {
      console.log('[AuthenticationService] Fetching user communities...');
      
      if (!this.authContext?.sessionToken) {
        console.log('[AuthenticationService] No session token available');
        return [];
      }

      // 🎯 Try API proxy first (CSP-safe) - using the WORKING pattern from MessageRouter
      if (this.apiProxy) {
        console.log('[AuthenticationService] Using API proxy for getUserCommunities (CSP-safe)');
        try {
          const result = await this.apiProxy.makeApiRequest({
            method: 'getUserCommunities' as any,
            params: {},
            communityId: this.authContext.communityId,
            userId: this.authContext.userId
          });

          if (result.success && result.data?.userCommunities) {
            console.log('[AuthenticationService] API proxy success:', result.data.userCommunities.length, 'communities');
            return result.data.userCommunities.map((community: any) => ({
              id: community.id,
              name: community.name,
              logoUrl: community.logoUrl || null,
              userRole: community.userRole || 'member',
              isMember: community.isMember
            }));
          } else {
            console.warn('[AuthenticationService] API proxy result failed:', result.error);
            // Fall through to direct fetch
          }
        } catch (proxyError) {
          console.warn('[AuthenticationService] API proxy error, falling back to direct fetch:', proxyError);
          // Fall through to direct fetch
        }
      }

      // 🔄 Fallback: Direct fetch (will fail on CSP sites but works elsewhere)
      console.log('[AuthenticationService] Using direct fetch for communities (may fail on CSP sites)');
      const response = await fetch(`${this.hostServiceUrl}/api/communities`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authContext.sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('[AuthenticationService] Failed to fetch communities:', response.status);
        return [];
      }

      const data = await response.json();
      
      if (data.userCommunities && Array.isArray(data.userCommunities)) {
        console.log('[AuthenticationService] Direct fetch success:', data.userCommunities.length, 'communities');
        return data.userCommunities.map((community: any) => ({
          id: community.id,
          name: community.name,
          logoUrl: community.logoUrl || null,
          userRole: community.userRole || 'member',
          isMember: community.isMember
        }));
      }

      return [];
    } catch (error) {
      console.error('[AuthenticationService] Error fetching user communities:', error);
      return [];
    }
  }

  /**
   * Fetch user profile information
   * Uses API proxy when available (CSP-safe), falls back to direct fetch for non-CSP sites
   */
  async fetchUserProfile(): Promise<UserProfile | null> {
    try {
      if (!this.authContext?.sessionToken) {
        console.log('[AuthenticationService] No session token for user profile fetch');
        return null;
      }

      // 🎯 Try API proxy first (CSP-safe) - using the WORKING pattern from MessageRouter
      if (this.apiProxy) {
        console.log('[AuthenticationService] Using API proxy for getUserProfile (CSP-safe)');
        try {
          const result = await this.apiProxy.makeApiRequest({
            method: 'getUserProfile' as any,
            params: { sessionToken: this.authContext.sessionToken },
            communityId: this.authContext.communityId,
            userId: this.authContext.userId
          });

          if (result.success && result.data?.user) {
            console.log('[AuthenticationService] API proxy profile success');
            return {
              userId: result.data.user.user_id,
              name: result.data.user.name,
              profilePictureUrl: result.data.user.profile_picture_url || null,
              identityType: result.data.user.identity_type || 'anonymous',
              walletAddress: result.data.user.wallet_address || null,
              ensDomain: result.data.user.ens_domain || null,
              upAddress: result.data.user.up_address || null,
              isAnonymous: result.data.user.is_anonymous
            };
          } else {
            console.warn('[AuthenticationService] API proxy profile failed:', result.error);
            // Fall through to direct fetch
          }
        } catch (proxyError) {
          console.warn('[AuthenticationService] API proxy profile error, falling back to direct fetch:', proxyError);
          // Fall through to direct fetch
        }
      }

      // 🔄 Fallback: Direct fetch (will fail on CSP sites but works elsewhere)
      console.log('[AuthenticationService] Using direct fetch for profile (may fail on CSP sites)');
      const response = await fetch(`${this.hostServiceUrl}/api/auth/validate-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionToken: this.authContext.sessionToken
        })
      });

      if (!response.ok) {
        console.error('[AuthenticationService] Failed to fetch user profile:', response.status);
        return null;
      }

      const data = await response.json();
      
      if (data.user) {
        console.log('[AuthenticationService] Direct fetch profile success');
        return {
          userId: data.user.user_id,
          name: data.user.name,
          profilePictureUrl: data.user.profile_picture_url || null,
          identityType: data.user.identity_type || 'anonymous',
          walletAddress: data.user.wallet_address || null,
          ensDomain: data.user.ens_domain || null,
          upAddress: data.user.up_address || null,
          isAnonymous: data.user.is_anonymous
        };
      }

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