/**
 * Internal Plugin Host - Self-contained plugin hosting within embed script
 * 
 * This class embeds all ClientPluginHost functionality directly into the embed script,
 * making it completely self-contained so customers don't need to implement any logic.
 * 
 * Responsibilities:
 * 1. Handle auth completion from embed iframe
 * 2. Manage iframe switching (auth → forum)
 * 3. Route API requests from forum to host service
 * 4. Maintain auth context throughout session
 */

import { EmbedConfig } from '../types/EmbedTypes';
import { ApiProxyClient } from '@curia_/iframe-api-proxy';

/**
 * Authentication context for API requests
 */
export interface InternalAuthContext {
  userId: string;
  communityId: string;
  sessionToken?: string;
  externalParams?: Record<string, string>;
  parentUrl?: string;
}

/**
 * User's community membership info
 */
export interface UserCommunityMembership {
  id: string;
  name: string;
  logoUrl: string | null;
  userRole: 'member' | 'moderator' | 'admin' | 'owner';
  isMember: boolean;
}

/**
 * Beautiful Discord-style community navigation sidebar
 */
class CommunityNavigationUI {
  private communities: UserCommunityMembership[];
  private currentCommunityId: string;
  private container: HTMLElement | null = null;

  constructor(communities: UserCommunityMembership[], currentCommunityId: string) {
    this.communities = communities;
    this.currentCommunityId = currentCommunityId;
  }

  render(): HTMLElement {
    const nav = document.createElement('div');
    nav.className = 'curia-community-nav';
    
    // Beautiful inset sidebar styling with gradients
    nav.style.cssText = `
      width: 80px;
      background: linear-gradient(135deg, 
        var(--sidebar-bg-from, #f8fafc) 0%, 
        var(--sidebar-bg-to, #f1f5f9) 100%);
      border-right: 1px solid var(--sidebar-border, rgba(148, 163, 184, 0.2));
      box-shadow: 
        inset 2px 0 4px rgba(0, 0, 0, 0.05),
        inset 0 2px 4px rgba(0, 0, 0, 0.03);
      display: flex;
      flex-direction: column;
      padding: 16px;
      gap: 14px;
      overflow-y: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      position: relative;
    `;
    
    // Add comprehensive styling for dark/light modes and hover effects
    const globalStyles = document.createElement('style');
    globalStyles.textContent = `
      .curia-community-nav::-webkit-scrollbar { display: none; }
      
      /* Dark mode variables */
      [data-theme="dark"] .curia-community-nav,
      .dark .curia-community-nav {
        --sidebar-bg-from: #1e293b;
        --sidebar-bg-to: #0f172a;
        --sidebar-border: rgba(71, 85, 105, 0.3);
        --item-hover-bg: rgba(255, 255, 255, 0.1);
        --item-active-border: #3b82f6;
        --item-active-shadow: rgba(59, 130, 246, 0.3);
        --preview-bg: #1e293b;
        --preview-border: rgba(71, 85, 105, 0.4);
        --preview-text: #e2e8f0;
        --preview-text-muted: #94a3b8;
      }
      
      /* Light mode variables */
      .curia-community-nav {
        --sidebar-bg-from: #f8fafc;
        --sidebar-bg-to: #f1f5f9;
        --sidebar-border: rgba(148, 163, 184, 0.2);
        --item-hover-bg: rgba(255, 255, 255, 0.8);
        --item-active-border: #3b82f6;
        --item-active-shadow: rgba(59, 130, 246, 0.2);
        --preview-bg: #ffffff;
        --preview-border: rgba(148, 163, 184, 0.2);
        --preview-text: #1e293b;
        --preview-text-muted: #64748b;
      }
      
      /* Community item hover effects */
      .community-item:hover::after {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: 14px;
        background: var(--item-hover-bg);
        z-index: -1;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      /* Preview card styling */
      .community-preview {
        position: absolute;
        left: 88px;
        top: 0;
        min-width: 220px;
        max-width: 280px;
        background: var(--preview-bg);
        border: 1px solid var(--preview-border);
        border-radius: 12px;
        padding: 16px;
        box-shadow: 
          0 10px 25px rgba(0, 0, 0, 0.1),
          0 4px 12px rgba(0, 0, 0, 0.08);
        z-index: 1000;
        opacity: 0;
        transform: translateX(-8px) scale(0.95);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
        backdrop-filter: blur(12px);
      }
      
      .community-preview.show {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
      
      .community-preview-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      
      .community-preview-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
      }
      
      .community-preview-info h4 {
        color: var(--preview-text);
        font-weight: 600;
        font-size: 16px;
        margin: 0 0 4px 0;
        line-height: 1.2;
      }
      
      .community-preview-info p {
        color: var(--preview-text-muted);
        font-size: 14px;
        margin: 0;
        line-height: 1.3;
      }
      
      .community-preview-stats {
        display: flex;
        gap: 16px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--preview-border);
      }
      
      .community-preview-stat {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--preview-text-muted);
        font-size: 13px;
      }
    `;
    document.head.appendChild(globalStyles);
    
    this.communities.forEach(community => {
      const item = this.renderCommunityItem(community);
      nav.appendChild(item);
    });
    
    this.container = nav;
    return nav;
  }

  private renderCommunityItem(community: UserCommunityMembership): HTMLElement {
    const item = document.createElement('div');
    const isActive = community.id === this.currentCommunityId;
    
    item.className = `community-item ${isActive ? 'active' : ''}`;
    
    // Perfect 48x48 squircle styling
    item.style.cssText = `
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      user-select: none;
      border: ${isActive ? '2px solid var(--item-active-border)' : '2px solid transparent'};
      box-shadow: ${isActive ? 
        '0 4px 12px var(--item-active-shadow), 0 0 0 1px var(--item-active-border)' : 
        '0 2px 8px rgba(0, 0, 0, 0.1)'
      };
    `;

    // Create the beautiful background (logo or gradient + emoji)
    if (community.logoUrl) {
      // Use community logo with perfect squircle fit
      const logo = document.createElement('img');
      logo.src = community.logoUrl;
      logo.alt = community.name;
      logo.style.cssText = `
        width: calc(100% - 4px);
        height: calc(100% - 4px);
        object-fit: cover;
        border-radius: 10px;
        margin: 2px;
      `;
      logo.onerror = () => {
        // Fallback to gradient + emoji if image fails
        item.removeChild(logo);
        this.addGradientFallback(item, community);
      };
      item.appendChild(logo);
    } else {
      // Use gradient + emoji fallback (same as API logic)
      this.addGradientFallback(item, community);
    }

    // Role badge for admins/owners - updated positioning
    if (community.userRole === 'admin' || community.userRole === 'owner') {
      const badge = document.createElement('div');
      badge.style.cssText = `
        position: absolute;
        bottom: -3px;
        right: -3px;
        width: 18px;
        height: 18px;
        background: linear-gradient(135deg, #10b981, #059669);
        border: 2px solid var(--sidebar-bg-from, #f8fafc);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        z-index: 10;
      `;
      
      badge.textContent = community.userRole === 'owner' ? '👑' : '⚡';
      item.appendChild(badge);
    }

    // Enhanced hover effects with preview
    let hoverTimeout: NodeJS.Timeout;
    let previewElement: HTMLElement | null = null;

    item.addEventListener('mouseenter', () => {
      // Visual hover effect
      if (!isActive) {
        item.style.transform = 'scale(1.08) translateY(-1px)';
        item.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
      }

             // Show preview card after slight delay
       hoverTimeout = setTimeout(() => {
         previewElement = this.createPreviewCard(community);
         if (previewElement) {
           item.appendChild(previewElement);
           
           // Trigger animation
           requestAnimationFrame(() => {
             previewElement?.classList.add('show');
           });
         }
       }, 500);
    });

    item.addEventListener('mouseleave', () => {
      // Clear timeout
      clearTimeout(hoverTimeout);
      
      // Remove preview
      if (previewElement) {
        previewElement.classList.remove('show');
        setTimeout(() => {
          if (previewElement && previewElement.parentElement) {
            previewElement.parentElement.removeChild(previewElement);
          }
          previewElement = null;
        }, 200);
      }

      // Reset visual state
      if (!isActive) {
        item.style.transform = 'scale(1) translateY(0)';
        item.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      }
    });

    return item;
  }

  private addGradientFallback(item: HTMLElement, community: UserCommunityMembership): void {
    // Generate gradient class and icon using same logic as API
    const gradientClass = this.getGradientClass(community.name);
    const icon = this.getIconForCommunity(community.name);
    
    // Set gradient background
    item.style.background = this.getGradientStyle(gradientClass);
    
    // Add emoji icon
    const iconSpan = document.createElement('span');
    iconSpan.textContent = icon;
    iconSpan.style.cssText = `
      font-size: 24px;
      line-height: 1;
    `;
    item.appendChild(iconSpan);
  }

  private getGradientClass(name: string): string {
    const gradients = [
      'gradient-pink-purple',
      'gradient-blue-cyan', 
      'gradient-emerald-teal',
      'gradient-orange-pink',
      'gradient-purple-blue',
      'gradient-cyan-emerald'
    ];
    
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  }

  private getIconForCommunity(name: string): string {
    const lowercaseName = name.toLowerCase();
    
    if (lowercaseName.includes('lukso')) return '🆙';
    if (lowercaseName.includes('ethereum')) return '⟠';
    if (lowercaseName.includes('defi') || lowercaseName.includes('governance')) return '🏛️';
    if (lowercaseName.includes('nft') || lowercaseName.includes('art')) return '🎨';
    if (lowercaseName.includes('gaming')) return '🎮';
    if (lowercaseName.includes('dao')) return '🏛️';
    if (lowercaseName.includes('social')) return '👥';
    if (lowercaseName.includes('tech')) return '🔧';
    if (lowercaseName.includes('crypto')) return '💎';
    
    // Default icons for variety
    const defaultIcons = ['🌟', '🚀', '💫', '🔮', '⚡', '🌈', '🎯', '🎪'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return defaultIcons[hash % defaultIcons.length];
  }

  private getGradientStyle(gradientClass: string): string {
    const gradientMap: Record<string, string> = {
      'gradient-pink-purple': 'linear-gradient(135deg, #ec4899, #8b5cf6)',
      'gradient-blue-cyan': 'linear-gradient(135deg, #3b82f6, #06b6d4)',
      'gradient-emerald-teal': 'linear-gradient(135deg, #10b981, #14b8a6)',
      'gradient-orange-pink': 'linear-gradient(135deg, #f97316, #ec4899)',
      'gradient-purple-blue': 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
      'gradient-cyan-emerald': 'linear-gradient(135deg, #06b6d4, #10b981)'
    };
    
    return gradientMap[gradientClass] || gradientMap['gradient-blue-cyan'];
  }

  private createPreviewCard(community: UserCommunityMembership): HTMLElement {
    const preview = document.createElement('div');
    preview.className = 'community-preview';
    
    // Generate same visual styling as the main icon
    const gradientClass = this.getGradientClass(community.name);
    const icon = this.getIconForCommunity(community.name);
    
    preview.innerHTML = `
      <div class="community-preview-header">
        <div class="community-preview-icon" style="background: ${this.getGradientStyle(gradientClass)}">
          ${community.logoUrl ? 
            `<img src="${community.logoUrl}" alt="${community.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">` :
            `<span style="font-size: 18px;">${icon}</span>`
          }
        </div>
        <div class="community-preview-info">
          <h4>${community.name}</h4>
          <p>Member since joining</p>
        </div>
      </div>
      <div class="community-preview-stats">
        <div class="community-preview-stat">
          <span>👤</span>
          <span>Your role: ${community.userRole}</span>
        </div>
        <div class="community-preview-stat">
          <span>⚡</span>
          <span>Active member</span>
        </div>
      </div>
    `;
    
    return preview;
  }
}

/**
 * Message types for internal communication
 */
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
 * Internal Plugin Host - completely self-contained within embed script
 */
export class InternalPluginHost {
  private container: HTMLElement;
  private config: EmbedConfig;
  private authContext: InternalAuthContext | null = null;
  private currentIframe: HTMLIFrameElement | null = null;
  private myUid: string; // Instance-specific UID (not singleton)
  private hostServiceUrl: string;
  private forumUrl: string;
  private messageListener: ((event: MessageEvent) => void) | null = null;
  private apiProxy: ApiProxyClient;
  private communityNavigation: CommunityNavigationUI | null = null;
  private userCommunities: UserCommunityMembership[] = [];
  private embedContainer: HTMLElement | null = null;

  constructor(container: HTMLElement, config: EmbedConfig, hostServiceUrl: string, forumUrl: string) {
    this.container = container;
    this.config = config;
    this.hostServiceUrl = hostServiceUrl;
    this.forumUrl = forumUrl;
    this.myUid = this.generateIframeUid(); // Generate instance-specific UID
    
    // Initialize API proxy client
    this.apiProxy = new ApiProxyClient({
      debug: true,
      defaultTimeout: 10000,
      maxRetries: 3
    });
    
    this.setupMessageListener();
    this.initializeAuthPhase();
  }

  /**
   * Initialize auth phase - load embed iframe for authentication
   */
  private initializeAuthPhase(): void {
    console.log('[InternalPluginHost] Initializing auth phase');
    
    // Build auth iframe URL with theme and community parameters
    const authUrl = new URL(`${this.hostServiceUrl}/embed`);
    authUrl.searchParams.set('theme', this.config.theme || 'light');
    if (this.config.backgroundColor) {
      authUrl.searchParams.set('background_color', this.config.backgroundColor);
    }
    if (this.config.community) {
      authUrl.searchParams.set('community', this.config.community);
      console.log('[InternalPluginHost] Adding community parameter to auth iframe:', this.config.community);
    }
    if (this.config.mode) {
      authUrl.searchParams.set('mode', this.config.mode);
      console.log('[InternalPluginHost] Adding mode parameter to auth iframe:', this.config.mode);
    }
    
    // Add parent URL to auth iframe
    if (this.config.parentUrl) {
      const encodedParentUrl = encodeURIComponent(this.config.parentUrl);
      authUrl.searchParams.set('cg_parent_url', encodedParentUrl);
      console.log('[InternalPluginHost] Adding parent URL to auth iframe:', this.config.parentUrl);
    }
    
    // Add external parameters from parent page
    if (this.config.externalParams) {
      console.log('[InternalPluginHost] Adding external parameters to auth iframe:', this.config.externalParams);
      for (const [key, value] of Object.entries(this.config.externalParams)) {
        authUrl.searchParams.set(key, value);
      }
    }
    
    // Create auth iframe
    const iframe = document.createElement('iframe');
    iframe.src = authUrl.toString();
    iframe.style.width = this.config.width || '100%';
    iframe.style.height = this.config.height || '700px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = this.config.borderRadius || '8px';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
    iframe.setAttribute('allow', getIframePermissions());
    
    // Add iframe to container
    this.container.appendChild(iframe);
    this.currentIframe = iframe;
    
    console.log('[InternalPluginHost] Auth iframe loaded with theme:', this.config.theme);
  }

  /**
   * Set up message listener for all plugin communication
   */
  private setupMessageListener(): void {
    // Store listener reference for proper cleanup
    this.messageListener = (event: MessageEvent) => {
      this.handleMessage(event);
    };
    
    window.addEventListener('message', this.messageListener);
    console.log('[InternalPluginHost] Message listener attached for UID:', this.myUid);
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
      await this.handleAuthCompletion(event.data);
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
      console.log('[InternalPluginHost] Forum initialized');
      return;
    }
  }

  /**
   * Handle auth completion and switch to forum
   */
  private async handleAuthCompletion(authData: any): Promise<void> {
    console.log('[InternalPluginHost] Auth completion received:', authData);
    
    // Store auth context including external parameters and parent URL
    this.authContext = {
      userId: authData.userId,
      communityId: authData.communityId,
      sessionToken: authData.sessionToken,
      externalParams: authData.externalParams,
      parentUrl: authData.parentUrl || this.config.parentUrl
    };
    
    console.log('[InternalPluginHost] Auth context set:', this.authContext);
    
    // Check for auth-only mode
    if (authData.mode === 'auth-only') {
      console.log('[InternalPluginHost] 🎯 Auth-only mode detected - NOT switching to forum');
      console.log('[InternalPluginHost] Auth-only flow complete - embed stays on auth-complete step');
      return; // Don't switch to forum in auth-only mode
    }
    
    // Initialize community navigation
    await this.initializeCommunityNavigation();
    
    // Normal flow: switch to forum phase
    console.log('[InternalPluginHost] Normal mode - switching to forum');
    await this.switchToForum();
  }

  /**
   * Fetch user's community memberships
   */
  private async fetchUserCommunities(): Promise<UserCommunityMembership[]> {
    try {
      console.log('[InternalPluginHost] Fetching user communities...');
      
      if (!this.authContext?.sessionToken) {
        console.log('[InternalPluginHost] No session token available');
        return [];
      }

      // Make direct fetch call to /api/communities with auth
      const response = await fetch(`${this.hostServiceUrl}/api/communities`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authContext.sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('[InternalPluginHost] Failed to fetch communities:', response.status);
        return [];
      }

      const data = await response.json();
      
      if (data.userCommunities && Array.isArray(data.userCommunities)) {
        console.log('[InternalPluginHost] Fetched user communities:', data.userCommunities.length);
        return data.userCommunities.map((community: any) => ({
          id: community.id,
          name: community.name,
          logoUrl: community.logoUrl,
          userRole: community.userRole,
          isMember: community.isMember
        }));
      }

      return [];
    } catch (error) {
      console.error('[InternalPluginHost] Error fetching user communities:', error);
      return [];
    }
  }

  /**
   * Initialize community navigation if user has multiple communities
   */
  private async initializeCommunityNavigation(): Promise<void> {
    this.userCommunities = await this.fetchUserCommunities();
    
    // Only show navigation if user has 2+ communities
    if (this.userCommunities.length < 2) {
      console.log('[InternalPluginHost] User has <2 communities, hiding navigation');
      return;
    }
    
    console.log('[InternalPluginHost] User has', this.userCommunities.length, 'communities, showing navigation');
    
    // Create community navigation (no click handlers for now)
    this.communityNavigation = new CommunityNavigationUI(
      this.userCommunities,
      this.authContext?.communityId || ''
    );
  }

  /**
   * Setup container layout based on whether sidebar should be shown
   */
  private setupContainerLayout(): void {
    if (this.communityNavigation) {
      // Create embed container with sidebar + iframe layout
      this.embedContainer = document.createElement('div');
      this.embedContainer.className = 'curia-embed-container';
      this.embedContainer.style.cssText = `
        display: flex;
        width: ${this.config.width || '100%'};
        height: ${this.config.height || '700px'};
        border-radius: ${this.config.borderRadius || '8px'};
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      `;

      // Add navigation sidebar
      const navElement = this.communityNavigation.render();
      this.embedContainer.appendChild(navElement);

      // Add iframe container
      const iframeContainer = document.createElement('div');
      iframeContainer.className = 'curia-iframe-container';
      iframeContainer.style.cssText = `
        flex: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
      `;
      this.embedContainer.appendChild(iframeContainer);

      // Replace container content
      this.container.innerHTML = '';
      this.container.appendChild(this.embedContainer);
    } else {
      // No sidebar needed - use container directly
      this.container.innerHTML = '';
      this.embedContainer = null;
    }
  }

  /**
   * Switch iframe from auth to forum
   */
  private async switchToForum(): Promise<void> {
    console.log('[InternalPluginHost] Switching to forum phase');
    
    if (!this.authContext) {
      console.error('[InternalPluginHost] Cannot switch to forum - no auth context');
      return;
    }

    // Setup container layout (sidebar + iframe or just iframe)
    this.setupContainerLayout();

    // Build forum URL with parameters
    const forumUrl = new URL(this.forumUrl);
    forumUrl.searchParams.set('mod', 'standalone');
    
    // Theme resolution
    let resolvedTheme = this.config.theme || 'light';
    if (resolvedTheme === 'auto') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        resolvedTheme = 'dark';
      } else {
        resolvedTheme = 'light';
      }
      console.log('[InternalPluginHost] Resolved auto theme to:', resolvedTheme);
    }
    
    forumUrl.searchParams.set('cg_theme', resolvedTheme);
    if (this.config.backgroundColor) {
      forumUrl.searchParams.set('cg_bg_color', this.config.backgroundColor);
    }
    forumUrl.searchParams.set('iframeUid', this.myUid);
    
    // Add parent URL parameter ONLY if community is pre-specified
    if (this.config.community && this.config.parentUrl) {
      const encodedParentUrl = encodeURIComponent(this.config.parentUrl);
      forumUrl.searchParams.set('cg_parent_url', encodedParentUrl);
      console.log('[InternalPluginHost] Adding parent URL (community pre-specified):', this.config.parentUrl);
    } else if (!this.config.community) {
      console.log('[InternalPluginHost] Skipping parent URL (no community pre-specified)');
    }
    
    // Add external parameters to forum URL
    if (this.authContext?.externalParams) {
      console.log('[InternalPluginHost] Adding external parameters to forum iframe:', this.authContext.externalParams);
      for (const [key, value] of Object.entries(this.authContext.externalParams)) {
        forumUrl.searchParams.set(key, value);
      }
    }
    
    console.log('[InternalPluginHost] Forum URL:', forumUrl.toString());
    
    // Create forum iframe
    const iframe = document.createElement('iframe');
    iframe.src = forumUrl.toString();
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = this.config.borderRadius || '8px';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
    iframe.setAttribute('allow', getIframePermissions());
    
    // Add iframe to appropriate container
    const iframeContainer = this.embedContainer?.querySelector('.curia-iframe-container') || this.container;
    iframeContainer.appendChild(iframe);
    this.currentIframe = iframe;
    
    // Set forum iframe as active iframe for API proxy
    this.apiProxy.setActiveIframe(iframe);
    console.log('[InternalPluginHost] API proxy client configured for forum iframe');
    
    console.log('[InternalPluginHost] Forum iframe loaded');
  }

  /**
   * Handle API requests from forum
   */
  private async handleApiRequest(message: InternalPluginMessage, source: Window): Promise<void> {
    try {
      console.log('[InternalPluginHost] API request:', message.method, message.params);
      
      // Validate auth context
      if (!this.authContext) {
        throw new Error('No authentication context available');
      }

      // Instance-based UID filtering - only handle our own messages
      if (message.iframeUid !== this.myUid) {
        // Silently ignore messages from other embed instances
        return;
      }

      // Validate method is provided and supported
      if (!message.method || !['getUserInfo', 'getUserFriends', 'getContextData', 'getCommunityInfo', 'giveRole'].includes(message.method)) {
        throw new Error(`Unknown API method: ${message.method}`);
      }

      // Use API proxy client to make request (bypasses CSP restrictions)
      console.log('[InternalPluginHost] Making API request via proxy:', message.method);
      const result = await this.apiProxy.makeApiRequest({
        method: message.method as any,
        params: message.params,
        communityId: this.authContext.communityId,
        userId: this.authContext.userId
      });

      console.log('[InternalPluginHost] API proxy response:', result);
      
      if (result.success) {
        // Send successful response
        this.sendResponse(source, message, result.data);
      } else {
        throw new Error(result.error || 'API request failed');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[InternalPluginHost] API error:', errorMessage);
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
  }

  /**
   * Generate unique iframe UID
   */
  private generateIframeUid(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${timestamp}${random}`.substring(0, 10);
  }

  /**
   * Cleanup when embed is destroyed
   */
  public destroy(): void {
    // Remove iframe
    if (this.currentIframe && this.currentIframe.parentElement) {
      this.currentIframe.parentElement.removeChild(this.currentIframe);
    }
    
    // Remove message listener to prevent stale listeners
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
      console.log('[InternalPluginHost] Message listener removed');
    }
    
    // Clean up API proxy client
    if (this.apiProxy) {
      this.apiProxy.destroy();
      console.log('[InternalPluginHost] API proxy client destroyed');
    }
    
    // Clear state
    this.currentIframe = null;
    this.authContext = null;
    // myUid stays - it's not nullable and helps identify this instance in logs
    
    console.log('[InternalPluginHost] Destroyed instance with UID:', this.myUid);
  }
}

 