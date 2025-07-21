/**
 * IframeManager Service
 * Handles iframe lifecycle, creation, URL building, and DOM management
 * 
 * Extracted from InternalPluginHost for better separation of concerns
 * Responsibilities:
 * - Create and configure auth iframes
 * - Create and configure forum iframes
 * - Generate unique iframe UIDs
 * - Handle iframe URL building with parameters
 * - Manage iframe permissions and security attributes
 * - Clean up iframe-related DOM elements
 * - Handle iframe switching between auth and forum phases
 */

import { ApiProxyClient } from '@curia_/iframe-api-proxy';
import { InternalAuthContext } from '../auth/AuthenticationService';
import { EmbedConfig } from '../../types/EmbedTypes';

export interface IframeManagerCallbacks {
  onIframeSwitch?: (iframe: HTMLIFrameElement, type: 'auth' | 'forum') => void;
}

export class IframeManager {
  private hostServiceUrl: string;
  private forumUrl: string;
  private apiProxy: ApiProxyClient;
  private callbacks: IframeManagerCallbacks;
  private currentIframe: HTMLIFrameElement | null = null;
  private myUid: string;

  constructor(
    hostServiceUrl: string,
    forumUrl: string,
    apiProxy: ApiProxyClient,
    callbacks: IframeManagerCallbacks = {}
  ) {
    this.hostServiceUrl = hostServiceUrl;
    this.forumUrl = forumUrl;
    this.apiProxy = apiProxy;
    this.callbacks = callbacks;
    this.myUid = this.generateIframeUid();
  }

  /**
   * Get the current iframe UID
   */
  getUid(): string {
    return this.myUid;
  }

  /**
   * Get the currently active iframe
   */
  getCurrentIframe(): HTMLIFrameElement | null {
    return this.currentIframe;
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
   * Create auth iframe with proper configuration
   */
  createAuthIframe(config: EmbedConfig): HTMLIFrameElement {
    console.log('[IframeManager] Creating auth iframe');
    
    // Build auth iframe URL
    const authUrl = new URL(`${this.hostServiceUrl}/embed`);
    authUrl.searchParams.set('theme', config.theme || 'light');
    
    if (config.backgroundColor) {
      authUrl.searchParams.set('background_color', config.backgroundColor);
    }
    if (config.community) {
      authUrl.searchParams.set('community', config.community);
    }
    if (config.mode) {
      authUrl.searchParams.set('mode', config.mode);
    }
    
    // Add parent URL to auth iframe
    if (config.parentUrl) {
      const encodedParentUrl = encodeURIComponent(config.parentUrl);
      authUrl.searchParams.set('cg_parent_url', encodedParentUrl);
    }
    
    // Add external parameters from parent page
    if (config.externalParams) {
      for (const [key, value] of Object.entries(config.externalParams)) {
        authUrl.searchParams.set(key, value);
      }
    }
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = authUrl.toString();
    iframe.style.width = config.width || '100%';
    iframe.style.height = config.height || '700px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = config.borderRadius || '8px';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
    iframe.setAttribute('allow', this.getIframePermissions());
    
    this.currentIframe = iframe;
    
    // Notify callback
    if (this.callbacks.onIframeSwitch) {
      this.callbacks.onIframeSwitch(iframe, 'auth');
    }
    
    console.log('[IframeManager] Auth iframe created');
    return iframe;
  }

  /**
   * Create forum iframe with auth context and configuration
   */
  createForumIframe(
    config: EmbedConfig,
    authContext: InternalAuthContext,
    targetContainer: HTMLElement
  ): HTMLIFrameElement {
    console.log('[IframeManager] Creating forum iframe');
    
    // Build forum URL with parameters
    const forumUrl = new URL(this.forumUrl);
    forumUrl.searchParams.set('mod', 'standalone');
    
    // Theme resolution
    let resolvedTheme = config.theme || 'light';
    if (resolvedTheme === 'auto') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        resolvedTheme = 'dark';
      } else {
        resolvedTheme = 'light';
      }
      console.log('[IframeManager] Resolved auto theme to:', resolvedTheme);
    }
    
    forumUrl.searchParams.set('cg_theme', resolvedTheme);
    if (config.backgroundColor) {
      forumUrl.searchParams.set('cg_bg_color', config.backgroundColor);
    }
    forumUrl.searchParams.set('iframeUid', this.myUid);
    
    // Add parent URL parameter ONLY if community is pre-specified
    if (config.community && config.parentUrl) {
      const encodedParentUrl = encodeURIComponent(config.parentUrl);
      forumUrl.searchParams.set('cg_parent_url', encodedParentUrl);
      console.log('[IframeManager] Adding parent URL (community pre-specified):', config.parentUrl);
    }
    
    // Add external parameters to forum URL
    if (authContext.externalParams) {
      console.log('[IframeManager] Adding external parameters to forum iframe:', authContext.externalParams);
      for (const [key, value] of Object.entries(authContext.externalParams)) {
        forumUrl.searchParams.set(key, value);
      }
    }
    
    console.log('[IframeManager] Forum URL:', forumUrl.toString());
    
    // Create forum iframe - use 100% to fill the properly-sized container
    const iframe = document.createElement('iframe');
    iframe.src = forumUrl.toString();
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.margin = '0';
    iframe.style.padding = '0';
    iframe.style.display = 'block';
    iframe.style.verticalAlign = 'top';
    // Only apply border radius to right side since sidebar is always present on left
    const borderRadius = config.borderRadius || '8px';
    iframe.style.borderRadius = `0 ${borderRadius} ${borderRadius} 0`;
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
    iframe.setAttribute('allow', this.getIframePermissions());
    
    console.log('[IframeManager] Forum iframe set to fill container (100% x 100%)');
    
    // Add iframe to container
    targetContainer.appendChild(iframe);
    this.currentIframe = iframe;
    
    // Set forum iframe as active iframe for API proxy
    this.apiProxy.setActiveIframe(iframe);
    console.log('[IframeManager] API proxy client configured for forum iframe:', {
      iframeSrc: iframe.src,
      hasContentWindow: !!iframe.contentWindow
    });
    
    // Notify callback
    if (this.callbacks.onIframeSwitch) {
      this.callbacks.onIframeSwitch(iframe, 'forum');
    }
    
    console.log('[IframeManager] Forum iframe created and added to container');
    return iframe;
  }

  /**
   * Reload the current iframe (useful for session switches)
   */
  reloadCurrentIframe(): void {
    if (this.currentIframe) {
      console.log('[IframeManager] Reloading current iframe');
      const currentSrc = this.currentIframe.src;
      this.currentIframe.src = currentSrc;
    }
  }

  /**
   * Update iframe with new URL parameters
   */
  updateIframeUrl(iframe: HTMLIFrameElement, newParams: Record<string, string>): void {
    const url = new URL(iframe.src);
    
    // Add new parameters
    for (const [key, value] of Object.entries(newParams)) {
      url.searchParams.set(key, value);
    }
    
    iframe.src = url.toString();
    console.log('[IframeManager] Updated iframe URL with new parameters');
  }

  /**
   * Clean up iframe-related portal elements
   */
  cleanupPortalElements(): void {
    console.log('[IframeManager] Cleaning up iframe portal elements');
    
    // Clean up portal elements (community previews, user profile menu)
    const portals = document.querySelectorAll('.community-preview, .user-profile-menu');
    portals.forEach(portal => {
      console.log('[IframeManager] Removing portal element:', portal.className);
      portal.remove();
    });
    
    console.log('[IframeManager] Portal elements cleanup complete');
  }

  /**
   * Remove current iframe and clean up references
   */
  removeCurrentIframe(): void {
    if (this.currentIframe) {
      console.log('[IframeManager] Removing current iframe');
      
      // Remove from DOM
      if (this.currentIframe.parentNode) {
        this.currentIframe.parentNode.removeChild(this.currentIframe);
      }
      
      // Clear reference
      this.currentIframe = null;
      
      console.log('[IframeManager] Current iframe removed');
    }
  }

  /**
   * Get iframe permissions string for security attributes
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
   * Regenerate UID (useful for new sessions)
   */
  regenerateUid(): string {
    this.myUid = this.generateIframeUid();
    console.log('[IframeManager] Generated new UID:', this.myUid);
    return this.myUid;
  }

  /**
   * Clean up resources and references
   */
  destroy(): void {
    console.log('[IframeManager] Destroying iframe manager');
    
    // Clean up portal elements
    this.cleanupPortalElements();
    
    // Remove current iframe
    this.removeCurrentIframe();
    
    console.log('[IframeManager] Iframe manager destroyed');
  }
} 