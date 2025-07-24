/**
 * Internal Plugin Host - Self-contained plugin hosting within embed script
 * 
 * This class embeds all ClientPluginHost functionality directly into the embed script,
 * making it completely self-contained so customers don't need to implement any logic.
 * 
 * Updated to use SessionManager instead of localStorage for session management.
 * 
 * Responsibilities:
 * 1. Handle auth completion from embed iframe
 * 2. Manage iframe switching (auth → forum)
 * 3. Route API requests from forum to host service
 * 4. Maintain auth context throughout session
 */

import { EmbedConfig } from '../types/EmbedTypes';
import { ApiProxyClient } from '@curia_/iframe-api-proxy';
import { sessionManager } from '../../SessionManager';
import { CommunitySidebar } from '../components';
import {
  AuthenticationService,
  AuthenticationCallbacks,
  InternalAuthContext,
  UserCommunityMembership,
  UserProfile,
  MessageRouter,
  MessageRouterCallbacks,
  IframeManager,
  IframeManagerCallbacks
} from '../services';

// Interface definitions moved to services - imported above

enum InternalMessageType {
  API_REQUEST = 'api_request',
  API_RESPONSE = 'api_response',
  INIT = 'init',
  ERROR = 'error'
}

/**
 * Internal plugin message interface
 */
interface InternalPluginMessage {
  type: InternalMessageType;
  iframeUid: string;
  requestId: string;
  method?: string;
  params?: any;
  data?: any;
  error?: string;
}

/**
 * Get iframe permissions for forum functionality
 */
function getIframePermissions(): string {
  return [
    'clipboard-write *',
    'clipboard-read *', 
    'fullscreen *',
    'web-share *',
    'autoplay *',
    'picture-in-picture *',
    'payment *',
    'encrypted-media *',
    'storage-access *',
    'camera *',
    'microphone *',
    'geolocation *'
  ].join('; ');
}

/**
 * Internal Plugin Host - Lean orchestrator using service layer architecture
 * 
 * Responsibilities:
 * - Coordinate between services
 * - Manage overall embed lifecycle
 * - Handle UI component composition
 * - Orchestrate phase transitions (auth → forum)
 */
export class InternalPluginHost {
  private container: HTMLElement;
  private config: EmbedConfig;
  private hostServiceUrl: string;
  private forumUrl: string;
  
  // Service Layer - Injected Dependencies
  private authService: AuthenticationService;
  private messageRouter: MessageRouter;
  private iframeManager: IframeManager;
  private apiProxy: ApiProxyClient;
  
  // UI State
  private communitySidebar: CommunitySidebar | null = null;
  private embedContainer: HTMLElement | null = null;
  
  // Discovery Modal State
  private discoveryModal: HTMLElement | null = null;
  private discoveryIframe: HTMLIFrameElement | null = null;
  
  // Add Session Modal State
  private addSessionModal: HTMLElement | null = null;
  private addSessionIframe: HTMLIFrameElement | null = null;
  
  // Multi-iframe community switching
  private communityIframes: Map<string, HTMLIFrameElement> = new Map();
  private activeCommunityId: string | null = null;
  
  // Community polling for sidebar refresh (covers both initial load and switchCommunity joins)
  private communityPollingTimer: NodeJS.Timeout | null = null;
  private lastKnownCommunities: UserCommunityMembership[] = [];
  
  // Cross-tab update throttling
  private lastCrossTabReload: number = 0;
  private readonly CROSS_TAB_RELOAD_THROTTLE = 2000; // 2 seconds

  constructor(container: HTMLElement, config: EmbedConfig, hostServiceUrl: string, forumUrl: string) {
    this.container = container;
    this.config = config;
    this.hostServiceUrl = hostServiceUrl;
    this.forumUrl = forumUrl;
    
    // Initialize API proxy
    this.apiProxy = new ApiProxyClient({
      debug: true,
      defaultTimeout: 10000,
      maxRetries: 3
    });
    
    // Initialize services with dependency injection
    // Note: Create IframeManager first to get UID for MessageRouter
    this.iframeManager = new IframeManager(
      hostServiceUrl,
      forumUrl,
      this.apiProxy,
      {
        onIframeSwitch: this.onIframeSwitch.bind(this)
      }
    );
    
    this.authService = new AuthenticationService(hostServiceUrl, {
      onAuthComplete: this.onAuthComplete.bind(this),
      onSessionSwitch: this.onSessionSwitch.bind(this),
      onSignOut: this.onSignOut.bind(this),
      onCrossTabSessionUpdate: this.onCrossTabUpdate.bind(this)
    });
    
    this.messageRouter = new MessageRouter(
      this.iframeManager.getUid(),
      this.apiProxy, // Share the same ApiProxyClient instance!
      {
        onAuthComplete: this.onMessageAuthComplete.bind(this),
        onForumInit: this.onForumInit.bind(this),
        getAuthContext: () => this.authService.getAuthContext(),
        onCommunitySwitchRequest: this.handleCommunitySwitchRequest.bind(this),
        onCommunityDiscoveryComplete: this.handleCommunityDiscoveryComplete.bind(this),
        onAddSessionComplete: this.handleAddSessionComplete.bind(this)
      }
    );
    
    // Initialize the embed
    this.initialize();
    
    console.log(`[MULTI-IFRAME] InternalPluginHost initialized with multi-iframe community switching support`);
  }

  /**
   * Initialize the embed - start with auth phase
   */
  private initialize(): void {
    console.log('[InternalPluginHost] Initializing embed');
    
    // Setup message listener and cross-tab sync
    this.messageRouter.setupMessageListener();
    this.authService.setupCrossTabSessionListener();
    
    // Create and display auth iframe
    this.initializeAuthPhase();
  }

  // ============================================================================
  // SERVICE CALLBACK HANDLERS - Orchestration Logic
  // ============================================================================

  /**
   * Handle authentication completion from auth service (with context)
   */
  private async onAuthComplete(authData: any, context: InternalAuthContext): Promise<void> {
    console.log('[InternalPluginHost] Auth completion received from service');
    
    // Check for auth-only mode
    if (authData.mode === 'auth-only') {
      console.log('[InternalPluginHost] Auth-only mode - staying on auth phase');
      return;
    }
    
    // Initialize community navigation
    await this.initializeCommunityNavigation();
    
    // Switch to forum phase
    console.log('[InternalPluginHost] Switching to forum phase');
    await this.switchToForum();
  }

  /**
   * Handle authentication completion from message router (without context)
   */
  private async onMessageAuthComplete(authData: any): Promise<void> {
    console.log('[InternalPluginHost] Auth completion received from message router');
    
    // Delegate to auth service handler
    await this.authService.handleAuthCompletion(authData);
  }

  /**
   * Handle session switching from auth service
   * Performs full embed reload to ensure new session context is properly applied
   */
  private async onSessionSwitch(profile: UserProfile): Promise<void> {
    console.log('[InternalPluginHost] Session switch detected - performing full embed reload');
    console.log('[InternalPluginHost] New session profile:', profile);
    
    // Perform full reload to pick up new session context
    this.reloadForSessionSwitch();
  }

  /**
   * Handle sign out from auth service
   */
  private onSignOut(): void {
    console.log('[InternalPluginHost] Sign out received from service');
    this.resetToInitialState();
  }

  /**
   * Handle cross-tab session updates with throttling
   */
  private onCrossTabUpdate(): void {
    console.log('[InternalPluginHost] Cross-tab update received from service');
    
    // Throttle rapid successive cross-tab updates
    const now = Date.now();
    if (now - this.lastCrossTabReload < this.CROSS_TAB_RELOAD_THROTTLE) {
      console.log('[InternalPluginHost] Cross-tab update throttled - too recent');
      return;
    }

    // Get current auth context to check if we actually need to reload
    const currentAuthContext = this.authService.getAuthContext();
    if (!currentAuthContext) {
      console.log('[InternalPluginHost] No auth context - skipping cross-tab update');
      return;
    }

    // Only reload if we're in the forum phase (have an iframe that needs session updates)
    const currentIframe = this.iframeManager.getCurrentIframe();
    if (currentIframe && currentIframe.src.includes('mod=standalone')) {
      console.log('[InternalPluginHost] Reloading forum iframe due to cross-tab session change');
      this.lastCrossTabReload = now;
      this.iframeManager.reloadCurrentIframe();
    } else {
      console.log('[InternalPluginHost] Auth phase - no reload needed for cross-tab update');
    }
  }

  /**
   * Handle forum initialization
   */
  private onForumInit(): void {
    console.log('[InternalPluginHost] Forum initialized');
  }

  /**
   * Handle iframe switching
   */
  private onIframeSwitch(iframe: HTMLIFrameElement, type: 'auth' | 'forum'): void {
    console.log(`[InternalPluginHost] Iframe switched to: ${type}`, {
      iframeSrc: iframe.src,
      hasContentWindow: !!iframe.contentWindow,
      iframeUid: this.iframeManager.getUid()
    });
    
    // Could add additional logic here for iframe lifecycle management
    // For now, the services handle the specifics
  }

  // ============================================================================
  // ORCHESTRATION METHODS - Compose services for complex operations
  // ============================================================================

  /**
   * Initialize auth phase - now delegates to IframeManager service
   */
  private initializeAuthPhase(): void {
    console.log('[InternalPluginHost] Initializing auth phase via service');
    
    // Apply config dimensions to the main container first
    this.applyContainerDimensions();
    
    // Create auth iframe using service
    const iframe = this.iframeManager.createAuthIframe(this.config);
    
    // Add iframe to container
    this.container.appendChild(iframe);
    
    console.log('[InternalPluginHost] Auth iframe created and added to container');
  }

  /**
   * Get theme-aware background color based on config and system preferences
   */
  private getThemeAwareBackground(): string {
    // If background color is explicitly set in config, use that
    if (this.config.backgroundColor) {
      return this.config.backgroundColor;
    }
    
    // Determine theme
    let resolvedTheme = this.config.theme || 'light';
    if (resolvedTheme === 'auto') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        resolvedTheme = 'dark';
      } else {
        resolvedTheme = 'light';
      }
    }
    
    // Return theme-appropriate background
    return resolvedTheme === 'dark' ? '#0f172a' : '#ffffff';
  }

  /**
   * Apply config dimensions to the main container element
   */
  private applyContainerDimensions(): void {
    console.log('[InternalPluginHost] Applying container dimensions:', {
      width: this.config.width,
      height: this.config.height
    });
    
    // Apply width and height from config to the main container
    this.container.style.width = this.config.width || '100%';
    this.container.style.height = this.config.height || '600px';
    
    // Ensure the container has proper display properties
    if (!this.container.style.display) {
      this.container.style.display = 'block';
    }
    
    // Add border radius if specified
    if (this.config.borderRadius) {
      this.container.style.borderRadius = this.config.borderRadius;
      this.container.style.overflow = 'hidden';
    }
    
    console.log('[InternalPluginHost] Container dimensions applied');
  }

  /**
   * Initialize community navigation if user has multiple communities
   */
  private async initializeCommunityNavigation(): Promise<void> {
    console.log('[InternalPluginHost] Initializing community navigation');
    
    // Fetch both user communities and profile data from service
    const [communities, profile] = await Promise.all([
      this.authService.fetchUserCommunities(),
      this.authService.fetchUserProfile()
    ]);
    
    // Always show sidebar - adapt content based on community count
    console.log('[InternalPluginHost] User has', communities.length, 'communities, showing navigation');
    console.log(`[MULTI-IFRAME] Community navigation initialized - switching enabled for ${communities.length} communities`);
    
    // Create community sidebar with user profile and menu action handler
    this.communitySidebar = new CommunitySidebar({
      communities,
      currentCommunityId: this.authService.getAuthContext()?.communityId || '',
      userProfile: profile,
      onCommunitySelect: (community) => {
        console.log('[InternalPluginHost] Community selected:', community.name);
        console.log(`[MULTI-IFRAME] Community selection triggered for: ${community.id} (${community.name})`);
        this.switchToCommunity(community.id).catch(error => {
          console.error(`[MULTI-IFRAME] Failed to switch to community ${community.id}:`, error);
        });
      },
      onMenuAction: (action: string) => this.handleMenuAction(action),
      getIframeStatus: (communityId: string) => this.hasIframeLoaded(communityId),
      onPlusButtonClick: () => this.openDiscoveryModal(),
      embedContainer: this.embedContainer || undefined // 🎯 Pass embed container for mobile boundary respect (null → undefined)
    });

    // Start initial 5-second polling to catch immediate community joins
    this.startCommunityPolling('initial');
  }

  /**
   * Start 5-second community polling (DRY implementation)
   * Used for both initial load and switchCommunity scenarios
   */
  private startCommunityPolling(reason: 'initial' | 'community-switch'): void {
    console.log(`[InternalPluginHost] Starting 5-second community polling (${reason})`);
    
    // Stop any existing polling first
    this.stopCommunityPolling();
    
    let pollCount = 0;
    const maxPolls = 5;
    
    this.communityPollingTimer = setInterval(async () => {
      pollCount++;
      console.log(`[InternalPluginHost] Community refresh poll ${pollCount}/${maxPolls} (${reason})`);
      
      try {
        await this.refreshCommunitySidebar();
      } catch (error) {
        console.error('[InternalPluginHost] Failed to refresh communities during polling:', error);
      }
      
      // Stop polling after 5 iterations
      if (pollCount >= maxPolls) {
        console.log(`[InternalPluginHost] Polling completed (${reason}), switching to event-driven updates`);
        this.stopCommunityPolling();
      }
    }, 1000); // Poll every second for 5 seconds
  }

  /**
   * Stop the community polling timer
   */
  private stopCommunityPolling(): void {
    if (this.communityPollingTimer) {
      clearInterval(this.communityPollingTimer);
      this.communityPollingTimer = null;
    }
  }

  /**
   * Refresh the community sidebar with fresh data (with flickering prevention)
   * Used by both initial polling and switchCommunity events
   */
  private async refreshCommunitySidebar(): Promise<void> {
    if (!this.communitySidebar) return;
    
    try {
      const freshCommunities = await this.authService.fetchUserCommunities();
      
      // 🎯 FLICKERING FIX: Only update UI if communities actually changed
      if (this.hasCommunitiesChanged(freshCommunities, this.lastKnownCommunities)) {
        this.communitySidebar.updateCommunities(freshCommunities);
        this.lastKnownCommunities = freshCommunities;
        console.log(`[InternalPluginHost] Sidebar updated with ${freshCommunities.length} communities (changes detected)`);
      } else {
        console.log(`[InternalPluginHost] No community changes detected, skipping UI update`);
      }
    } catch (error) {
      console.error('[InternalPluginHost] Failed to refresh community sidebar:', error);
    }
  }

  /**
   * Compare two community arrays to detect actual changes
   * Prevents unnecessary UI flickering during polling
   */
  private hasCommunitiesChanged(
    newCommunities: UserCommunityMembership[], 
    oldCommunities: UserCommunityMembership[]
  ): boolean {
    // Different lengths = definitely changed
    if (newCommunities.length !== oldCommunities.length) {
      return true;
    }
    
    // Check if any community IDs are different
    const newIds = new Set(newCommunities.map(c => c.id));
    const oldIds = new Set(oldCommunities.map(c => c.id));
    
    // Compare sets
    if (newIds.size !== oldIds.size) return true;
    
    for (const id of newIds) {
      if (!oldIds.has(id)) return true;
    }
    
    return false;
  }

  /**
   * Setup container layout - always use flex layout with sidebar
   */
  private setupContainerLayout(): void {
    // Always create flex container with sidebar + iframe layout
      this.embedContainer = document.createElement('div');
      this.embedContainer.className = 'curia-embed-container';
    
    // Use config dimensions for the embed container - raw CSS values
    const configWidth = this.config.width || '100%';
    const configHeight = this.config.height || '600px';
    
    console.log('[InternalPluginHost] Setting up container layout with dimensions:', {
      width: configWidth,
      height: configHeight,
      configHeight: this.config.height
    });
    
          // Get theme-aware background color
    const themeBackground = this.getThemeAwareBackground();
    
    this.embedContainer.style.cssText = `
      display: flex;
      width: ${configWidth};
      height: ${configHeight};
      background: ${themeBackground};
      border-radius: ${this.config.borderRadius || '8px'};
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      position: relative; /* 🎯 Positioning context for mobile modals */
    `;

    // Add navigation sidebar (always present)
    const navElement = this.communitySidebar!.render();
      this.embedContainer.appendChild(navElement);

      // Add iframe container
      const iframeContainer = document.createElement('div');
      iframeContainer.className = 'curia-iframe-container';
          iframeContainer.style.cssText = `
      flex: 1;
      display: flex;
      position: relative;
      background: ${themeBackground};
      align-items: stretch;
    `;
    
      this.embedContainer.appendChild(iframeContainer);

        // Replace original container content
    this.container.innerHTML = '';
    this.container.appendChild(this.embedContainer);
    
    // 🎯 UPDATE SIDEBAR: Pass embedContainer reference for mobile boundary respect
    if (this.communitySidebar) {
      this.communitySidebar.updateEmbedContainer(this.embedContainer);
    }
  }

  /**
   * Switch to forum phase using services
   */
  private async switchToForum(): Promise<void> {
    console.log('[InternalPluginHost] Switching to forum phase via services');
    
    const authContext = this.authService.getAuthContext();
    if (!authContext) {
      console.error('[InternalPluginHost] Cannot switch to forum - no auth context');
      return;
    }

    // Setup container layout (sidebar + iframe or just iframe)
    this.setupContainerLayout();

    // Get the iframe container
    const iframeContainer = this.embedContainer?.querySelector('.curia-iframe-container') || this.container;
    
    // Create forum iframe using service
    const initialIframe = this.iframeManager.createForumIframe(
      this.config,
      authContext,
      iframeContainer as HTMLElement
    );
    
    // Track the initial forum iframe for community switching
    if (authContext.communityId) {
      console.log(`[MULTI-IFRAME] Tracking initial forum iframe for community: ${authContext.communityId}`);
      this.communityIframes.set(authContext.communityId, initialIframe);
      this.activeCommunityId = authContext.communityId;
      console.log(`[MULTI-IFRAME] Set active community to: ${authContext.communityId}`);
    } else {
      console.log(`[MULTI-IFRAME] No community ID in auth context - initial iframe not tracked`);
    }
    
    console.log('[InternalPluginHost] Forum phase setup complete');
  }

  /**
   * Switch to a specific community with state preservation
   * Implements the TODO for community switching
   */
  private async switchToCommunity(communityId: string): Promise<void> {
    console.log(`[MULTI-IFRAME] Starting community switch to: ${communityId}`);
    console.log(`[MULTI-IFRAME] Current active community: ${this.activeCommunityId}`);
    console.log(`[MULTI-IFRAME] Total community iframes tracked: ${this.communityIframes.size}`);

    // Don't switch if already on this community
    if (this.activeCommunityId === communityId) {
      console.log(`[MULTI-IFRAME] Already on community ${communityId}, skipping switch`);
      return;
    }

    // Get auth context for building forum URLs
    const authContext = this.authService.getAuthContext();
    if (!authContext) {
      console.error(`[MULTI-IFRAME] No auth context available for community switch`);
      return;
    }

    // Get or create iframe for target community
    let targetIframe = this.communityIframes.get(communityId);
    
    if (!targetIframe) {
      console.log(`[MULTI-IFRAME] Creating new iframe for community: ${communityId}`);
      targetIframe = this.createCommunityIframe(communityId, authContext);
      this.communityIframes.set(communityId, targetIframe);
      console.log(`[MULTI-IFRAME] New iframe created and stored for community: ${communityId}`);
    } else {
      console.log(`[MULTI-IFRAME] Using existing iframe for community: ${communityId}`);
    }

    // Hide current active iframe if exists
    if (this.activeCommunityId) {
      const currentIframe = this.communityIframes.get(this.activeCommunityId);
      if (currentIframe) {
        currentIframe.style.display = 'none';
        console.log(`[MULTI-IFRAME] Hidden iframe for community: ${this.activeCommunityId}`);
      }
    }

    // Show target iframe
    targetIframe.style.display = 'block';
    console.log(`[MULTI-IFRAME] Showing iframe for community: ${communityId}`);

    // Update API proxy to route to new active iframe
    this.apiProxy.setActiveIframe(targetIframe);
    console.log(`[MULTI-IFRAME] API proxy updated to route to community: ${communityId}`);

    // Update internal state
    this.activeCommunityId = communityId;

    // ✅ CRITICAL FIX: Update auth context so API requests use correct community
    this.authService.updateCommunityContext(communityId);

    // Update sidebar active state
    if (this.communitySidebar) {
      this.communitySidebar.updateActiveCommunity(communityId);
      // Refresh online indicators after iframe status might have changed
      this.communitySidebar.updateOnlineIndicators();
      console.log(`[MULTI-IFRAME] Sidebar updated to show active community: ${communityId}`);
    }

    console.log(`[MULTI-IFRAME] Community switch completed successfully to: ${communityId}`);
  }

  /**
   * Create a new forum iframe for a specific community
   * Based on IframeManager.createForumIframe logic but for community switching
   */
  private createCommunityIframe(communityId: string, authContext: InternalAuthContext): HTMLIFrameElement {
    console.log(`[MULTI-IFRAME] Creating iframe for community: ${communityId}`);

    // Get iframe container (same as in switchToForum)
    const iframeContainer = this.embedContainer?.querySelector('.curia-iframe-container') || this.container;

    // Build forum URL with community-specific parameters (similar to IframeManager.createForumIframe)
    const forumUrl = new URL(this.iframeManager['forumUrl']); // Access private property
    forumUrl.searchParams.set('mod', 'standalone');
    forumUrl.searchParams.set('iframeUid', this.iframeManager.getUid());

    // Add community ID to URL
    forumUrl.searchParams.set('community', communityId);

    // Theme resolution (copied from IframeManager)
    let resolvedTheme = this.config.theme || 'light';
    if (resolvedTheme === 'auto') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        resolvedTheme = 'dark';
      } else {
        resolvedTheme = 'light';
      }
      console.log(`[MULTI-IFRAME] Resolved auto theme to: ${resolvedTheme}`);
    }
    
    forumUrl.searchParams.set('cg_theme', resolvedTheme);
    if (this.config.backgroundColor) {
      forumUrl.searchParams.set('cg_bg_color', this.config.backgroundColor);
    }

    // Add parent URL parameter if community is pre-specified
    if (this.config.community && this.config.parentUrl) {
      const encodedParentUrl = encodeURIComponent(this.config.parentUrl);
      forumUrl.searchParams.set('cg_parent_url', encodedParentUrl);
      console.log(`[MULTI-IFRAME] Adding parent URL for community: ${this.config.parentUrl}`);
    }

    // Add external parameters to forum URL
    if (authContext.externalParams) {
      console.log(`[MULTI-IFRAME] Adding external parameters:`, authContext.externalParams);
      for (const [key, value] of Object.entries(authContext.externalParams)) {
        forumUrl.searchParams.set(key, value);
      }
    }

    console.log(`[MULTI-IFRAME] Forum URL for community ${communityId}:`, forumUrl.toString());

    // Create iframe element (copied styling from IframeManager.createForumIframe)
    const iframe = document.createElement('iframe');
    iframe.src = forumUrl.toString();
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.margin = '0';
    iframe.style.padding = '0';
    iframe.style.display = 'none'; // Start hidden
    iframe.style.verticalAlign = 'top';
    
    // Apply border radius (only right side since sidebar is on left)
    const borderRadius = this.config.borderRadius || '8px';
    iframe.style.borderRadius = `0 ${borderRadius} ${borderRadius} 0`;
    
    // Set security attributes
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
    iframe.setAttribute('allow', this.getIframePermissions());

    // Add data attributes for debugging
    iframe.setAttribute('data-community-id', communityId);
    iframe.setAttribute('data-iframe-uid', this.iframeManager.getUid());

    console.log(`[MULTI-IFRAME] Iframe element created for community: ${communityId}`);

    // Add to DOM
    (iframeContainer as HTMLElement).appendChild(iframe);
    console.log(`[MULTI-IFRAME] Iframe added to DOM for community: ${communityId}`);

    return iframe;
  }

  /**
   * Get iframe permissions (copied from IframeManager)
   */
  private getIframePermissions(): string {
    return [
      'clipboard-write *',
      'clipboard-read *', 
      'fullscreen *',
      'web-share *',
      'autoplay *',
      'picture-in-picture *',
      'payment *',
      'encrypted-media *',
      'storage-access *',
      'camera *',
      'microphone *',
      'geolocation *'
    ].join('; ');
  }

  /**
   * Simple method to check if a community has an iframe loaded
   */
  private hasIframeLoaded(communityId: string): boolean {
    return this.communityIframes.has(communityId);
  }

  /**
   * Handle menu actions from community sidebar
   */
  private handleMenuAction(action: string): void {
    console.log('[InternalPluginHost] Menu action:', action);
    
    if (action === 'add-session') {
      this.openAddSessionModal();
    } else if (action === 'sign-out') {
      this.authService.signOut();
    } else if (action.startsWith('switch-session:')) {
      const sessionToken = action.replace('switch-session:', '');
      console.log('[InternalPluginHost] Switching to session:', sessionToken);
      sessionManager.setActiveSession(sessionToken).catch(error => {
        console.error('[InternalPluginHost] Failed to switch session:', error);
      });
    } else if (action === 'switch-account') {
      // DEPRECATED: Use session switching in profile menu instead
      console.log('[InternalPluginHost] Switch account deprecated - use session switching');
    } else if (action === 'settings') {
      console.log('[InternalPluginHost] Settings (placeholder)');
    }
  }

  /**
   * Handle community switch requests from forum app
   */
  private async handleCommunitySwitchRequest(
    communityId: string, 
    options?: any
  ): Promise<any> {
    console.log(`[InternalPluginHost] Community switch requested: ${communityId}`, options);

    try {
      // Use existing switchToCommunity logic!
      await this.switchToCommunity(communityId);

      // 🔄 START POLLING: User will join community during iframe load, so start polling to detect it
      this.startCommunityPolling('community-switch');

      const result = {
        switched: true,
        communityId: communityId
      };

      console.log(`[InternalPluginHost] Community switch completed successfully:`, result);
      return result;

    } catch (error) {
      console.error(`[InternalPluginHost] Community switch failed:`, error);
      throw error;
    }
  }

  /**
   * Open discovery modal with community discovery iframe
   */
  private openDiscoveryModal(): void {
    console.log('[InternalPluginHost] Opening community discovery modal');
    
    // Close existing modal if open
    this.closeDiscoveryModal();
    
    // Create modal overlay
    this.discoveryModal = document.createElement('div');
    this.discoveryModal.className = 'curia-discovery-modal-overlay';
    this.discoveryModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
    `;
    
    // Create modal content container
    const modalContent = document.createElement('div');
    modalContent.className = 'curia-discovery-modal-content';
    modalContent.style.cssText = `
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      height: 80%;
      max-height: 700px;
      position: relative;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      overflow: hidden;
    `;
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(0, 0, 0, 0.1);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      font-size: 20px;
      cursor: pointer;
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;
    `;
    
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.background = 'rgba(0, 0, 0, 0.2)';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.background = 'rgba(0, 0, 0, 0.1)';
    });
    closeButton.addEventListener('click', () => {
      this.closeDiscoveryModal();
    });
    
    // Create discovery iframe
    this.discoveryIframe = document.createElement('iframe');
    this.discoveryIframe.src = `${window.location.origin}/embed?mode=community-discovery`;
    this.discoveryIframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 12px;
    `;
    this.discoveryIframe.allow = getIframePermissions();
    
    // Assemble modal
    modalContent.appendChild(closeButton);
    modalContent.appendChild(this.discoveryIframe);
    this.discoveryModal.appendChild(modalContent);
    
    // Close modal on overlay click
    this.discoveryModal.addEventListener('click', (e) => {
      if (e.target === this.discoveryModal) {
        this.closeDiscoveryModal();
      }
    });
    
    // Add to DOM
    document.body.appendChild(this.discoveryModal);
    
    console.log('[InternalPluginHost] Discovery modal opened successfully');
  }

  /**
   * Close discovery modal and cleanup
   */
  private closeDiscoveryModal(): void {
    if (this.discoveryModal) {
      console.log('[InternalPluginHost] Closing discovery modal');
      document.body.removeChild(this.discoveryModal);
      this.discoveryModal = null;
      this.discoveryIframe = null;
    }
  }

  /**
   * Handle community discovery completion from discovery iframe
   */
  private async handleCommunityDiscoveryComplete(discoveryData: any): Promise<void> {
    console.log('[InternalPluginHost] Community discovery completed:', discoveryData);
    
    const { communityId } = discoveryData;
    
    try {
      // 1. Close discovery modal
      this.closeDiscoveryModal();
      
      // 2. Switch to selected community using existing infrastructure
      await this.switchToCommunity(communityId);
      
      // 3. 🔄 START POLLING: User will join community during iframe load, so start polling to detect it
      this.startCommunityPolling('community-switch');
      
      console.log('[InternalPluginHost] Discovery-to-community switch completed');
    } catch (error) {
      console.error('[InternalPluginHost] Discovery community switch failed:', error);
    }
  }

  /**
   * Handle add session completion from add-session iframe
   */
  private async handleAddSessionComplete(sessionMessage: any): Promise<void> {
    console.log('[InternalPluginHost] Add session completed:', sessionMessage);
    
    const { sessionData } = sessionMessage;
    
    try {
      // 1. Close add session modal
      this.closeAddSessionModal();
      
      // 2. Check if session already exists (profile components create sessions during auth)
      const existingSession = sessionManager.getSessionByToken(sessionData.sessionToken);
      
      if (existingSession) {
        // Session already exists, just activate it
        console.log('[InternalPluginHost] 🔧 Session already exists, just activating:', sessionData.sessionToken);
        await sessionManager.setActiveSession(sessionData.sessionToken);
      } else {
        // Session doesn't exist, create it
        console.log('[InternalPluginHost] 🔧 Creating new session:', sessionData.sessionToken);
        await sessionManager.addSession({
          sessionToken: sessionData.sessionToken,
          userId: sessionData.userId,
          identityType: sessionData.identityType,
          walletAddress: sessionData.walletAddress,
          ensName: sessionData.ensName,
          upAddress: sessionData.upAddress,
          name: sessionData.name,
          profileImageUrl: sessionData.profileImageUrl,
          expiresAt: new Date(sessionData.expiresAt),
          isActive: true,
        });
      }
      
      console.log('[InternalPluginHost] New session activated');
    } catch (error) {
      console.error('[InternalPluginHost] Failed to handle new session:', error);
    }
  }

  /**
   * Open add session modal with add-session iframe
   */
  private openAddSessionModal(): void {
    console.log('[InternalPluginHost] Opening add session modal');
    
    // Close existing modal if open
    this.closeAddSessionModal();
    
    // Create modal overlay
    this.addSessionModal = document.createElement('div');
    this.addSessionModal.className = 'curia-add-session-modal-overlay';
    this.addSessionModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
    `;
    
    // Create modal content container
    const modalContent = document.createElement('div');
    modalContent.className = 'curia-add-session-modal-content';
    modalContent.style.cssText = `
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      height: 80%;
      max-height: 700px;
      position: relative;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      overflow: hidden;
    `;
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(0, 0, 0, 0.1);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      font-size: 20px;
      cursor: pointer;
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;
    `;
    
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.background = 'rgba(0, 0, 0, 0.2)';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.background = 'rgba(0, 0, 0, 0.1)';
    });
    closeButton.addEventListener('click', () => {
      this.closeAddSessionModal();
    });
    
    // Create add session iframe
    this.addSessionIframe = document.createElement('iframe');
    this.addSessionIframe.src = `${window.location.origin}/embed?mode=add-session`;
    this.addSessionIframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 12px;
    `;
    this.addSessionIframe.allow = getIframePermissions();
    
    // Assemble modal
    modalContent.appendChild(closeButton);
    modalContent.appendChild(this.addSessionIframe);
    this.addSessionModal.appendChild(modalContent);
    
    // Close modal on overlay click
    this.addSessionModal.addEventListener('click', (e) => {
      if (e.target === this.addSessionModal) {
        this.closeAddSessionModal();
      }
    });
    
    // Add to DOM
    document.body.appendChild(this.addSessionModal);
    
    console.log('[InternalPluginHost] Add session modal opened successfully');
  }

  /**
   * Close add session modal and cleanup
   */
  private closeAddSessionModal(): void {
    if (this.addSessionModal) {
      console.log('[InternalPluginHost] Closing add session modal');
      document.body.removeChild(this.addSessionModal);
      this.addSessionModal = null;
      this.addSessionIframe = null;
    }
  }

  /**
   * Add account: Reset to initial state for new auth
   */
  private addAccount(): void {
    console.log('[InternalPluginHost] Add account - resetting to initial state');
        this.resetToInitialState();
  }

  /**
   * Reload embed for session switching - TRUE FULL RELOAD
   * Destroys current instance and creates brand new one (like page refresh)
   */
  private reloadForSessionSwitch(): void {
    console.log('[InternalPluginHost] Performing TRUE FULL RELOAD for session switch');
    console.log('[InternalPluginHost] This will destroy current instance and create fresh one');
    
    // Store parameters needed for recreation
    const container = this.container;
    const config = { ...this.config }; // ✅ Create copy to avoid mutation
    const hostServiceUrl = this.hostServiceUrl;
    const forumUrl = this.forumUrl;
    
    // 🎯 PRESERVE COMMUNITY CONTEXT!
    if (this.activeCommunityId) {
      console.log('[InternalPluginHost] Preserving community context:', this.activeCommunityId);
      config.community = this.activeCommunityId; // ✅ Override with current community
    }
    
    // 1. Completely destroy current instance (cleanup all state and services)
    this.destroy();
    
    // 2. Create brand new InternalPluginHost instance (fresh start)
    console.log('[InternalPluginHost] Creating fresh InternalPluginHost instance');
    const newInstance = new InternalPluginHost(container, config, hostServiceUrl, forumUrl);
    
    // 3. Update global reference if it exists (for window.curiaEmbed.destroy() etc)
    if (window.curiaEmbed) {
      console.log('[InternalPluginHost] Updating global curiaEmbed reference');
      window.curiaEmbed = newInstance;
    }
    
    console.log('[InternalPluginHost] TRUE FULL RELOAD complete - fresh instance will authenticate with new session');
  }

  /**
   * Reset to initial state - start over with auth
   */
  private resetToInitialState(): void {
    console.log('[InternalPluginHost] Resetting to initial state');
    
    // Clean up iframe-related elements
    this.iframeManager.cleanupPortalElements();
    
    // Reset UI state
    this.communitySidebar = null;
    this.embedContainer = null;
    
    // Clear session using SessionManager
    try {
      sessionManager.removeActiveSession().catch(error => {
        console.error('[InternalPluginHost] Failed to clear session via SessionManager:', error);
      });
      console.log('[InternalPluginHost] Session cleared via SessionManager');
    } catch (error) {
      console.error('[InternalPluginHost] SessionManager clear error:', error);
    }
    
    // Recreate clean auth iframe
    this.container.innerHTML = '';
    this.initializeAuthPhase();
    
    console.log('[InternalPluginHost] Reset to initial state complete');
  }

  /**
   * Cleanup when embed is destroyed
   */
  public destroy(): void {
    console.log('[InternalPluginHost] Destroying plugin host');
    
    // Destroy services
    if (this.authService) {
      this.authService.destroy();
    }
    
    if (this.messageRouter) {
      this.messageRouter.destroy();
    }
    
    if (this.iframeManager) {
      this.iframeManager.destroy();
    }
    
    // Destroy community sidebar
    if (this.communitySidebar) {
      this.communitySidebar.destroy();
      this.communitySidebar = null;
    }
    
    // Clean up community iframes
    console.log(`[MULTI-IFRAME] Cleaning up ${this.communityIframes.size} community iframes`);
    this.communityIframes.forEach((iframe, communityId) => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      console.log(`[MULTI-IFRAME] Removed iframe for community: ${communityId}`);
    });
    this.communityIframes.clear();
    this.activeCommunityId = null;
    console.log(`[MULTI-IFRAME] Community iframe cleanup complete`);
    
    // Clear container
    this.container.innerHTML = '';
    this.embedContainer = null;
    
    console.log('[InternalPluginHost] Plugin host destroyed');
  }
}

 