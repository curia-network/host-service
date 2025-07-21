/**
 * CommunityItem Component
 * Renders individual community icons in the sidebar
 * 
 * Extracted from InternalPluginHost.ts for better maintainability
 * Handles: logo display, gradient fallbacks, role badges, hover effects
 */

import { getGradientClass, getGradientStyle, getIconForCommunity } from '../../styling';

export interface UserCommunityMembership {
  id: string;
  name: string;
  logoUrl: string | null;
  userRole: 'member' | 'moderator' | 'admin' | 'owner';
  isMember: boolean;
}

export interface CommunityItemOptions {
  community: UserCommunityMembership;
  isActive: boolean;
  hasIframeLoaded?: boolean; // Simple flag: true = iframe in memory, false = not loaded
  onHover?: (community: UserCommunityMembership, element: HTMLElement) => void;
  onHoverEnd?: () => void;
  onClick?: (community: UserCommunityMembership) => void;
}

export class CommunityItem {
  private community: UserCommunityMembership;
  private isActive: boolean;
  private options: CommunityItemOptions;
  private element: HTMLElement | null = null;
  private hoverTimeout: NodeJS.Timeout | null = null;

  constructor(options: CommunityItemOptions) {
    this.community = options.community;
    this.isActive = options.isActive;
    this.options = options;
  }

  render(): HTMLElement {
    const item = document.createElement('div');
    item.className = `community-item ${this.isActive ? 'active' : ''}`;

    // Create the beautiful background (logo or gradient + emoji)
    if (this.community.logoUrl) {
      this.addCommunityLogo(item);
    } else {
      this.addGradientFallback(item);
    }

    // Enhanced hover effects
    this.addHoverEffects(item);

    // Simple online indicator (tiny green dot if iframe loaded)
    this.addOnlineIndicator(item);

    // Click handler
    if (this.options.onClick) {
      item.addEventListener('click', () => {
        this.options.onClick?.(this.community);
      });
    }

    this.element = item;
    return item;
  }

  private addCommunityLogo(item: HTMLElement): void {
    const logo = document.createElement('img');
    logo.src = this.community.logoUrl!;
    logo.alt = this.community.name;
    logo.className = 'community-icon-image';
    
    logo.onerror = () => {
      // Fallback to gradient + emoji if image fails
      item.removeChild(logo);
      this.addGradientFallback(item);
    };
    
    item.appendChild(logo);
  }

  private addGradientFallback(item: HTMLElement): void {
    // Generate gradient class and icon using same logic as API
    const gradientClass = getGradientClass(this.community.name);
    const icon = getIconForCommunity(this.community.name);
    
    // Set gradient background
    item.style.background = getGradientStyle(gradientClass);
    
    // Add emoji icon
    const iconSpan = document.createElement('span');
    iconSpan.textContent = icon;
    iconSpan.className = 'community-icon-emoji';
    item.appendChild(iconSpan);
  }



  private addHoverEffects(item: HTMLElement): void {
    item.addEventListener('mouseenter', () => {
      // Show preview card after slight delay (but not for active community)
      if (!this.isActive && this.options.onHover) {
        this.hoverTimeout = setTimeout(() => {
          this.options.onHover?.(this.community, item);
        }, 500);
      }
    });

    item.addEventListener('mouseleave', () => {
      // Clear timeout
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
      
      // Notify parent about hover end
      this.options.onHoverEnd?.();
    });
  }

  private addOnlineIndicator(item: HTMLElement): void {
    // Only show indicator if iframe is loaded
    if (!this.options.hasIframeLoaded) {
      return;
    }

    console.log(`[MULTI-IFRAME] [OnlineIndicator] Adding online dot for community: ${this.community.name}`);

    const indicator = document.createElement('div');
    indicator.className = 'online-indicator';
    indicator.style.cssText = `
      position: absolute;
      top: 2px;
      right: 2px;
      width: 8px;
      height: 8px;
      background: #10b981;
      border: 1.5px solid var(--sidebar-bg-from, #f8fafc);
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      z-index: 10;
    `;
    
    item.appendChild(indicator);
  }

  /**
   * Update the active state of this community item
   */
  updateActiveState(isActive: boolean): void {
    if (this.isActive === isActive) return;
    
    this.isActive = isActive;
    
    if (this.element) {
      if (isActive) {
        this.element.classList.add('active');
      } else {
        this.element.classList.remove('active');
      }
    }
  }

  /**
   * Cleanup method for removing event listeners
   */
  destroy(): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    
    this.element = null;
  }
} 