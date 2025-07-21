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
  
  // Service Layer - Injected Dependencies
  private authService: AuthenticationService;
  private messageRouter: MessageRouter;
  private iframeManager: IframeManager;
  private apiProxy: ApiProxyClient;
  
  // UI State
  private communitySidebar: CommunitySidebar | null = null;
  private embedContainer: HTMLElement | null = null;
  
  // Cross-tab update throttling
  private lastCrossTabReload: number = 0;
  private readonly CROSS_TAB_RELOAD_THROTTLE = 2000; // 2 seconds

  constructor(container: HTMLElement, config: EmbedConfig, hostServiceUrl: string, forumUrl: string) {
    this.container = container;
    this.config = config;
    
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
        getAuthContext: () => this.authService.getAuthContext()
      }
    );
    
    // Initialize the embed
    this.initialize();
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
   */
  private async onSessionSwitch(profile: UserProfile): Promise<void> {
    console.log('[InternalPluginHost] Session switch received from service');
    
    // Update community sidebar if it exists
    if (this.communitySidebar) {
      this.communitySidebar.updateUserProfile(profile);
    }
    
    // Force iframe reload to prevent crashes from session hot-swap
    this.iframeManager.reloadCurrentIframe();
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
    
    // Create community sidebar with user profile and menu action handler
    this.communitySidebar = new CommunitySidebar({
      communities,
      currentCommunityId: this.authService.getAuthContext()?.communityId || '',
      userProfile: profile,
      onCommunitySelect: (community) => {
        console.log('[InternalPluginHost] Community selected:', community.name);
        // TODO: Implement community switching logic in Phase 5
      },
      onMenuAction: (action: string) => this.handleMenuAction(action)
    });
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
    this.iframeManager.createForumIframe(
      this.config,
      authContext,
      iframeContainer as HTMLElement
    );
    
    console.log('[InternalPluginHost] Forum phase setup complete');
  }

  /**
   * Handle menu actions from community sidebar
   */
  private handleMenuAction(action: string): void {
    console.log('[InternalPluginHost] Menu action:', action);
    
    if (action === 'sign-out') {
      this.authService.signOut();
    } else if (action.startsWith('switch-session:')) {
      const sessionToken = action.replace('switch-session:', '');
      console.log('[InternalPluginHost] Switching to session:', sessionToken);
      sessionManager.setActiveSession(sessionToken).catch(error => {
        console.error('[InternalPluginHost] Failed to switch session:', error);
      });
        } else if (action === 'switch-account') {
      this.addAccount();
    } else if (action === 'settings') {
      console.log('[InternalPluginHost] Settings (placeholder)');
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
    
    // Clear container
    this.container.innerHTML = '';
    this.embedContainer = null;
    
    console.log('[InternalPluginHost] Plugin host destroyed');
  }
}

 