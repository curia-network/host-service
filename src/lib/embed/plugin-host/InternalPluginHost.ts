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
 * User profile information from authentication
 */
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

/**
 * Beautiful Discord-style community navigation sidebar
 */
class CommunityNavigationUI {
  private communities: UserCommunityMembership[];
  private currentCommunityId: string;
  private userProfile: UserProfile | null;
  private onMenuAction?: (action: string) => void;
  private container: HTMLElement | null = null;

  constructor(communities: UserCommunityMembership[], currentCommunityId: string, userProfile: UserProfile | null, onMenuAction?: (action: string) => void) {
    this.communities = communities;
    this.currentCommunityId = currentCommunityId;
    this.userProfile = userProfile;
    this.onMenuAction = onMenuAction;
  }

  render(): HTMLElement {
    const nav = document.createElement('div');
    nav.className = 'curia-community-nav';
    
    // All styling is now handled by CSS classes - much cleaner!
    
    // Add comprehensive styling for dark/light modes and hover effects
    const globalStyles = document.createElement('style');
    globalStyles.textContent = `
             .curia-community-nav {
         /* 
          * Responsive Design System using rem units
          * Benefits: Scales with user's font preferences, accessible, maintainable
          * All values scale proportionally if user changes browser font size
          */
         
         /* Responsive sidebar dimensions */
         --sidebar-width: 5rem;        /* 80px @ 16px base */
         --sidebar-height: 37.5rem;    /* 600px @ 16px base */
         --sidebar-padding: 1rem;      /* 16px @ 16px base */
         
         /* Community icon dimensions */
         --icon-size: 3rem;            /* 48px @ 16px base */
         --icon-image-size: 2.75rem;   /* 44px @ 16px base */
         --icon-emoji-size: 1.5rem;    /* 24px @ 16px base */
         --icon-border-radius: 0.75rem; /* 12px @ 16px base */
         
         /* Consistent spacing system */
         --space-xs: 0.5rem;           /* 8px */
         --space-sm: 0.75rem;          /* 12px */
         --space-md: 1rem;             /* 16px */
         --space-lg: 1.25rem;          /* 20px */
         
         /* Profile section */
         --profile-height: 5.5rem;     /* 88px @ 16px base */
         
         /* Main sidebar layout */
         width: var(--sidebar-width);
         height: var(--sidebar-height);
         min-height: var(--sidebar-height);
         max-height: var(--sidebar-height);
         flex-shrink: 0;
         flex-grow: 0;
         background: linear-gradient(135deg, 
           var(--sidebar-bg-from, #f8fafc) 0%, 
           var(--sidebar-bg-to, #f1f5f9) 100%);
         border-right: 1px solid var(--sidebar-border, rgba(148, 163, 184, 0.2));
         box-shadow: 
           inset 0.125rem 0 0.25rem rgba(0, 0, 0, 0.05),
           inset 0 0.125rem 0.25rem rgba(0, 0, 0, 0.03);
         display: flex;
         flex-direction: column;
         padding: var(--sidebar-padding);
         position: relative;
       }
      
      .curia-community-nav::-webkit-scrollbar { display: none; }
      
      /* Dark mode variables */
      [data-theme="dark"] .curia-community-nav,
      .dark .curia-community-nav {
        --sidebar-bg-from: #1e293b;
        --sidebar-bg-to: #0f172a;
        --sidebar-border: rgba(71, 85, 105, 0.3);
        --item-bg: rgba(30, 41, 59, 0.8);
        --item-hover-bg: rgba(30, 41, 59, 0.95);
        --item-active-bg: rgba(59, 130, 246, 0.2);
        --item-active-border: rgba(59, 130, 246, 0.4);
        --item-active-shadow: rgba(59, 130, 246, 0.3);
        --preview-bg: rgba(30, 41, 59, 0.95);
        --preview-border: rgba(71, 85, 105, 0.3);
        --preview-text: #f1f5f9;
        --preview-text-muted: #94a3b8;
      }
      
      /* Light mode variables */
      .curia-community-nav {
        --sidebar-bg-from: #f8fafc;
        --sidebar-bg-to: #f1f5f9;
        --sidebar-border: rgba(148, 163, 184, 0.2);
        --item-bg: rgba(255, 255, 255, 0.8);
        --item-hover-bg: rgba(255, 255, 255, 0.95);
        --item-active-bg: rgba(59, 130, 246, 0.1);
        --item-active-border: rgba(59, 130, 246, 0.3);
        --item-active-shadow: rgba(59, 130, 246, 0.2);
        --preview-bg: rgba(255, 255, 255, 0.95);
        --preview-border: rgba(148, 163, 184, 0.2);
        --preview-text: #1f2937;
        --preview-text-muted: #6b7280;
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
      
      /* Preview card styling - Portal pattern for document-level rendering */
      .community-preview {
        position: fixed;
        min-width: 220px;
        max-width: 280px;
        background: var(--preview-bg);
        border: 1px solid var(--preview-border);
        border-radius: 12px;
        padding: 16px;
        box-shadow: 
          0 20px 40px rgba(0, 0, 0, 0.15),
          0 8px 16px rgba(0, 0, 0, 0.1);
        z-index: 999999;
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



       .user-profile-avatar {
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
         border: 2px solid transparent;
         box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
       }

       .user-profile-avatar:hover {
         transform: scale(1.08) translateY(-1px);
         box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
       }

       /* Profile menu styling - Portal pattern */
       .user-profile-menu {
         position: fixed;
         min-width: 280px;
         max-width: 320px;
         background: var(--preview-bg);
         border: 1px solid var(--preview-border);
         border-radius: 12px;
         padding: 16px;
         box-shadow: 
           0 20px 40px rgba(0, 0, 0, 0.15),
           0 8px 16px rgba(0, 0, 0, 0.1);
         z-index: 999999;
         opacity: 0;
         transform: translateX(-8px) scale(0.95);
         transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
         pointer-events: none;
         backdrop-filter: blur(12px);
       }

       .user-profile-menu.show {
         opacity: 1;
         transform: translateX(0) scale(1);
         pointer-events: auto;
       }

       .profile-menu-header {
         display: flex;
         align-items: center;
         gap: 12px;
         margin-bottom: 16px;
         padding-bottom: 16px;
         border-bottom: 1px solid var(--preview-border);
       }

       .profile-menu-avatar {
         width: 48px;
         height: 48px;
         border-radius: 12px;
         display: flex;
         align-items: center;
         justify-content: center;
         flex-shrink: 0;
       }

       .profile-menu-info h4 {
         color: var(--preview-text);
         font-weight: 600;
         font-size: 16px;
         margin: 0 0 4px 0;
         line-height: 1.2;
       }

       .profile-menu-info p {
         color: var(--preview-text-muted);
         font-size: 14px;
         margin: 0;
         line-height: 1.3;
       }

       .profile-menu-actions {
         display: flex;
         flex-direction: column;
         gap: 8px;
       }

       .profile-menu-action {
         display: flex;
         align-items: center;
         gap: 12px;
         padding: 12px;
         border-radius: 8px;
         background: transparent;
         border: none;
         cursor: pointer;
         transition: all 0.2s ease;
         color: var(--preview-text);
         font-size: 14px;
         text-align: left;
         width: 100%;
       }

       .profile-menu-action:hover {
         background: var(--item-hover-bg);
       }

       .profile-menu-action-icon {
         width: 20px;
         height: 20px;
         display: flex;
         align-items: center;
         justify-content: center;
         color: var(--preview-text-muted);
       }

       /* Account Switcher Styles */
       .profile-menu-accounts {
         margin: 16px 0;
         padding-top: 16px;
         border-top: 1px solid var(--preview-border);
       }

       .profile-menu-section-title {
         color: var(--preview-text-muted);
         font-size: 12px;
         font-weight: 600;
         text-transform: uppercase;
         letter-spacing: 0.5px;
         margin-bottom: 12px;
         padding: 0 4px;
       }

       .profile-menu-account {
         display: flex;
         align-items: center;
         gap: 12px;
         padding: 10px 8px;
         border-radius: 8px;
         background: transparent;
         border: none;
         cursor: pointer;
         transition: all 0.2s ease;
         color: var(--preview-text);
         font-size: 14px;
         text-align: left;
         width: 100%;
         margin-bottom: 4px;
       }

       .profile-menu-account:hover {
         background: var(--item-hover-bg);
         transform: translateX(2px);
       }

       .profile-account-avatar {
         width: 32px;
         height: 32px;
         border-radius: 8px;
         display: flex;
         align-items: center;
         justify-content: center;
         flex-shrink: 0;
         border: 2px solid rgba(255, 255, 255, 0.1);
       }

       .profile-account-info {
         flex: 1;
         min-width: 0;
       }

       .profile-account-name {
         color: var(--preview-text);
         font-weight: 500;
         font-size: 14px;
         margin: 0 0 2px 0;
         line-height: 1.2;
         white-space: nowrap;
         overflow: hidden;
         text-overflow: ellipsis;
       }

       .profile-account-type {
         color: var(--preview-text-muted);
         font-size: 12px;
         margin: 0;
         line-height: 1.2;
         white-space: nowrap;
         overflow: hidden;
         text-overflow: ellipsis;
       }

       /* Community list container - scrollable */
       .community-list-container {
         flex: 1;
         height: 0; /* Force flex to work properly */
         overflow-y: auto;
         scrollbar-width: thin;
         scrollbar-color: var(--sidebar-border) transparent;
         padding: 0 0.25rem;
         margin: 0 -0.25rem;
         display: flex;
         flex-direction: column;
         gap: 0.875rem;
       }

       /* Community item styling */
       .community-item {
         width: var(--icon-size);
         height: var(--icon-size);
         min-width: var(--icon-size);
         min-height: var(--icon-size);
         max-width: var(--icon-size);
         max-height: var(--icon-size);
         border-radius: var(--icon-border-radius);
         display: flex;
         align-items: center;
         justify-content: center;
         cursor: pointer;
         transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
         position: relative;
         overflow: hidden;
         user-select: none;
         flex-shrink: 0;
         border: 0.125rem solid transparent;
         box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1);
       }

       .community-item.active {
         border-color: var(--item-active-border);
         box-shadow: 0 0.25rem 0.75rem var(--item-active-shadow), 0 0 0 0.0625rem var(--item-active-border);
       }

       .community-item:hover:not(.active) {
         transform: scale(1.08) translateY(-0.0625rem);
         box-shadow: 0 0.375rem 1.25rem rgba(0, 0, 0, 0.15);
       }

       /* Community icon image */
       .community-icon-image {
         width: var(--icon-image-size);
         height: var(--icon-image-size);
         object-fit: cover;
         border-radius: 0.625rem;
         margin: 0.125rem;
         flex-shrink: 0;
       }

       /* Community icon emoji */
       .community-icon-emoji {
         font-size: var(--icon-emoji-size);
         line-height: 1;
         width: var(--icon-emoji-size);
         height: var(--icon-emoji-size);
         display: flex;
         align-items: center;
         justify-content: center;
         flex-shrink: 0;
       }

       .community-list-container::-webkit-scrollbar {
         width: 0.375rem;
       }

       .community-list-container::-webkit-scrollbar-track {
         background: transparent;
       }

       .community-list-container::-webkit-scrollbar-thumb {
         background: var(--sidebar-border);
         border-radius: 0.1875rem;
       }

       .community-list-container::-webkit-scrollbar-thumb:hover {
         background: var(--preview-text-muted);
       }

       /* User profile section styling - fixed at bottom */
       .user-profile-section {
         margin-top: var(--space-md);
         padding-top: var(--space-md);
         border-top: 1px solid var(--sidebar-border, rgba(148, 163, 184, 0.2));
         flex-shrink: 0;
         height: var(--profile-height);
         min-height: var(--profile-height);
       }
     `;
     document.head.appendChild(globalStyles);
    
    // Create scrollable community list container
    const communityListContainer = document.createElement('div');
    communityListContainer.className = 'community-list-container';
    
    // Add communities to scrollable container
    this.communities.forEach(community => {
      const item = this.renderCommunityItem(community);
      communityListContainer.appendChild(item);
    });
    
    nav.appendChild(communityListContainer);

    // Add user profile section at the bottom (fixed)
    if (this.userProfile) {
      const userSection = this.renderUserProfileSection();
      nav.appendChild(userSection);
    }
    
    this.container = nav;
    return nav;
  }

  private renderCommunityItem(community: UserCommunityMembership): HTMLElement {
    const item = document.createElement('div');
    const isActive = community.id === this.currentCommunityId;
    
    item.className = `community-item ${isActive ? 'active' : ''}`;

    // Create the beautiful background (logo or gradient + emoji)
    if (community.logoUrl) {
      // Use community logo with perfect squircle fit
      const logo = document.createElement('img');
      logo.src = community.logoUrl;
      logo.alt = community.name;
      logo.className = 'community-icon-image';
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
      // Show preview card after slight delay (but not for active community)
      if (!isActive) {
        hoverTimeout = setTimeout(() => {
          previewElement = this.createPreviewCard(community, item);
          if (previewElement) {
            // Portal pattern - append to document.body to escape stacking context
            document.body.appendChild(previewElement);
            
            // Trigger animation
            requestAnimationFrame(() => {
              previewElement?.classList.add('show');
            });
          }
        }, 500);
      }
    });

    item.addEventListener('mouseleave', () => {
      // Clear timeout
      clearTimeout(hoverTimeout);
      
      // Remove preview with portal cleanup
      if (previewElement) {
        previewElement.classList.remove('show');
        setTimeout(() => {
          if (previewElement && document.body.contains(previewElement)) {
            document.body.removeChild(previewElement);
          }
          previewElement = null;
        }, 200);
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
    iconSpan.className = 'community-icon-emoji';
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

  private createPreviewCard(community: UserCommunityMembership, triggerElement: HTMLElement): HTMLElement {
    const preview = document.createElement('div');
    preview.className = 'community-preview';
    
    // Calculate perfect positioning using viewport coordinates
    const rect = triggerElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cardWidth = 280; // max-width from CSS
    const cardHeight = 120; // estimated height
    
    // Position to the right of the trigger, with smart viewport awareness
    let left = rect.right + 12; // 12px gap from sidebar
    let top = rect.top + (rect.height / 2) - (cardHeight / 2); // Center vertically
    
    // Smart viewport boundary detection
    if (left + cardWidth > viewportWidth - 16) {
      // Not enough space on right, show on left
      left = rect.left - cardWidth - 12;
    }
    
    if (top < 16) {
      // Too close to top, align with trigger top
      top = rect.top;
    } else if (top + cardHeight > viewportHeight - 16) {
      // Too close to bottom, align with trigger bottom
      top = rect.bottom - cardHeight;
    }
    
    // Apply calculated positioning
    preview.style.left = `${Math.max(16, left)}px`;
    preview.style.top = `${Math.max(16, top)}px`;
    
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

  private renderUserProfileSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'user-profile-section';
    
    const avatar = document.createElement('div');
    avatar.className = 'user-profile-avatar';

    // Create avatar content (image or fallback)
    if (this.userProfile?.profilePictureUrl) {
      const img = document.createElement('img');
      img.src = this.userProfile.profilePictureUrl;
      img.alt = this.userProfile.name;
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: inherit;
      `;
      img.onerror = () => {
        // Fallback to gradient + initials if image fails
        avatar.removeChild(img);
        this.addUserAvatarFallback(avatar);
      };
      avatar.appendChild(img);
    } else {
      // Use gradient + initials fallback
      this.addUserAvatarFallback(avatar);
    }

    // Add identity type indicator
    this.addIdentityIndicator(avatar);

    // Profile menu interactions - click-based
    let profileMenuElement: HTMLElement | null = null;

    const showMenu = () => {
      if (profileMenuElement) return; // Already open

      profileMenuElement = this.createUserProfileMenu(avatar);
      if (profileMenuElement) {
        document.body.appendChild(profileMenuElement);
        
        // Add menu hover handlers to keep it open
        profileMenuElement.addEventListener('mouseenter', () => {
          // Keep menu open when hovering over it
        });
        
        profileMenuElement.addEventListener('mouseleave', () => {
          // Keep menu open even when leaving (only close on click outside)
        });
        
        requestAnimationFrame(() => {
          profileMenuElement?.classList.add('show');
        });
      }
    };

    const hideMenu = () => {
      if (profileMenuElement) {
        profileMenuElement.classList.remove('show');
        setTimeout(() => {
          if (profileMenuElement && document.body.contains(profileMenuElement)) {
            document.body.removeChild(profileMenuElement);
          }
          profileMenuElement = null;
        }, 200);
      }
    };

    // Click to toggle menu
    avatar.addEventListener('click', (e) => {
      e.stopPropagation();
      if (profileMenuElement) {
        hideMenu();
      } else {
        showMenu();
      }
    });

    // Click outside to close menu
    document.addEventListener('click', (e) => {
      if (profileMenuElement && !profileMenuElement.contains(e.target as Node) && !avatar.contains(e.target as Node)) {
        hideMenu();
      }
    });

    section.appendChild(avatar);
    return section;
  }

  private addUserAvatarFallback(avatar: HTMLElement): void {
    const name = this.userProfile?.name || 'User';
    const gradientClass = this.getGradientClass(name);
    
    // Set gradient background
    avatar.style.background = this.getGradientStyle(gradientClass);
    
    // Add initials
    const initials = document.createElement('span');
    initials.textContent = this.getUserInitials(name);
    initials.style.cssText = `
      color: white;
      font-weight: 600;
      font-size: 18px;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    avatar.appendChild(initials);
  }

  private addIdentityIndicator(avatar: HTMLElement): void {
    if (!this.userProfile) return;

    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 18px;
      height: 18px;
      border: 2px solid var(--sidebar-bg-from, #f8fafc);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      background: ${this.getIdentityColor()};
    `;

    indicator.textContent = this.getIdentityIcon();
    avatar.appendChild(indicator);
  }

  private getIdentityColor(): string {
    switch (this.userProfile?.identityType) {
      case 'ens': return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'universal_profile': return 'linear-gradient(135deg, #ec4899, #be185d)';
      case 'anonymous': return 'linear-gradient(135deg, #6b7280, #4b5563)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  }

  private getIdentityIcon(): string {
    switch (this.userProfile?.identityType) {
      case 'ens': return '⟠';
      case 'universal_profile': return '🆙';
      case 'anonymous': return '👤';
      default: return '👤';
    }
  }

  private getUserInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  private createUserProfileMenu(triggerElement: HTMLElement): HTMLElement {
    const menu = document.createElement('div');
    menu.className = 'user-profile-menu';
    
    // Get absolute position of trigger button
    const rect = triggerElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 320;
    const spacing = 8; // Gap between button and menu
    
    // Position menu ABOVE the button using BOTTOM positioning (duh!)
    let left = rect.right + spacing;
    let bottom = viewportHeight - rect.top + spacing; // Menu bottom is spacing pixels above button top
    
    // Handle right edge overflow - flip to left side of button
    if (left + menuWidth > viewportWidth - 16) {
      left = rect.left - menuWidth - spacing;
    }
    
    menu.style.left = `${left}px`;
    menu.style.bottom = `${bottom}px`;

    // Create menu content with account switcher
    const allSessions = sessionManager.getAllSessions();
    const activeSession = sessionManager.getActiveSession();
    const otherSessions = allSessions.filter(s => s.sessionToken !== activeSession?.sessionToken);
    
    menu.innerHTML = `
      <div class="profile-menu-header">
        <div class="profile-menu-avatar" style="background: ${this.userProfile?.profilePictureUrl ? 'transparent' : this.getGradientStyle(this.getGradientClass(this.userProfile?.name || 'User'))}">
          ${this.userProfile?.profilePictureUrl ? 
            `<img src="${this.userProfile.profilePictureUrl}" alt="${this.userProfile.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">` :
            `<span style="color: white; font-weight: 600; font-size: 18px;">${this.getUserInitials(this.userProfile?.name || 'User')}</span>`
          }
        </div>
        <div class="profile-menu-info">
          <h4>${this.userProfile?.name || 'Anonymous User'}</h4>
          <p>${this.getIdentityLabel()}</p>
        </div>
      </div>
      
      <div class="profile-menu-accounts">
        <div class="profile-menu-section-title">
          Accounts (${allSessions.length} active)
        </div>
        
        ${otherSessions.length > 0 ? `
          <div style="margin-bottom: 8px; color: var(--preview-text-muted); font-size: 11px; padding: 0 4px;">
            Switch to:
          </div>
          ${otherSessions.map(session => `
            <button class="profile-menu-account" data-action="switch-to-session" data-session-token="${session.sessionToken}">
              <div class="profile-account-avatar" style="background: ${session.profileImageUrl ? 'transparent' : this.getGradientStyle(this.getGradientClass(session.name || 'User'))}">
                ${session.profileImageUrl ? 
                  `<img src="${session.profileImageUrl}" alt="${session.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">` :
                  `<span style="color: white; font-weight: 500; font-size: 12px;">${this.getUserInitials(session.name || 'User')}</span>`
                }
              </div>
              <div class="profile-account-info">
                <div class="profile-account-name">${session.name || 'Anonymous'}</div>
                <div class="profile-account-type">${this.getSessionTypeLabel(session)}</div>
              </div>
            </button>
          `).join('')}
        ` : `
          <div style="margin-bottom: 8px; color: var(--preview-text-muted); font-size: 11px; padding: 0 4px;">
            Only one account connected
          </div>
        `}
        
        <button class="profile-menu-action" data-action="add-account" style="margin-top: 8px; font-size: 12px; padding: 8px 12px;">
          <div class="profile-menu-action-icon">➕</div>
          <span>Add Account</span>
        </button>
      </div>
      
      <div class="profile-menu-actions">
        <button class="profile-menu-action" data-action="settings">
          <div class="profile-menu-action-icon">⚙️</div>
          <span>Settings</span>
        </button>
        <button class="profile-menu-action" data-action="sign-out">
          <div class="profile-menu-action-icon">🚪</div>
          <span>Sign Out</span>
        </button>
      </div>
    `;
    
    // Add event listeners for menu actions and session switching
    menu.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const button = target.closest('.profile-menu-action, .profile-menu-account') as HTMLElement;
      if (!button) return;
      
      const action = button.getAttribute('data-action');
      
      if (action === 'switch-to-session') {
        const sessionToken = button.getAttribute('data-session-token');
        if (sessionToken) {
          this.switchToSession(sessionToken);
        }
      } else if (action === 'add-account') {
        this.addAccount();
      } else if (action && this.onMenuAction) {
        this.onMenuAction(action);
      }
    });
    
    return menu;
  }

  private getIdentityLabel(): string {
    if (!this.userProfile) return 'Unknown';
    
    switch (this.userProfile.identityType) {
      case 'ens':
        return this.userProfile.ensDomain ? `ENS: ${this.userProfile.ensDomain}` : 'ENS Domain';
      case 'universal_profile':
        return this.userProfile.upAddress ? `UP: ${this.userProfile.upAddress.slice(0, 6)}...${this.userProfile.upAddress.slice(-4)}` : 'Universal Profile';
      case 'anonymous':
        return 'Anonymous Session';
      default:
        return 'User Account';
    }
  }

  private getSessionTypeLabel(session: any): string {
    if (session.isAnonymous) {
      return 'Anonymous';
    }
    if (session.identityType === 'ens') {
      return `ENS: ${session.ensDomain || 'N/A'}`;
    }
    if (session.identityType === 'universal_profile') {
      return `UP: ${session.upAddress || 'N/A'}`;
    }
    return 'User Account';
  }

  /**
   * Switch to a different active session
   */
  private async switchToSession(sessionToken: string): Promise<void> {
    try {
      console.log('[CommunityNavigationUI] Switching to session:', sessionToken);
      
      // Use SessionManager to switch active session
      await sessionManager.setActiveSession(sessionToken);
      
      console.log('[CommunityNavigationUI] ✅ Session switched successfully');
      
      // Notify parent about session change (this will trigger UI updates)
      if (this.onMenuAction) {
        this.onMenuAction('session-switched');
      }
      
    } catch (error) {
      console.error('[CommunityNavigationUI] Failed to switch session:', error);
    }
  }

  /**
   * Add a new account: Open auth iframe
   */
  private addAccount(): void {
    console.log('[CommunityNavigationUI] Adding new account - opening auth iframe');
    // This will trigger the initializeAuthPhase logic, which will handle the auth flow
    // and then call handleAuthCompletion, which will re-render the menu with the new session.
    // No need to call initializeCommunityNavigation here, as it's only for multiple communities.
    // The add-account button is a direct action to add a new session.
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
  private userProfile: UserProfile | null = null;
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
    this.setupCrossTabSessionListener();
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
   * Fetch user profile information
   */
  private async fetchUserProfile(): Promise<UserProfile | null> {
    try {
      if (!this.authContext?.sessionToken) {
        console.log('[InternalPluginHost] No session token for user profile fetch');
        return null;
      }

      // Use the validate-session endpoint to get user profile data
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
        console.error('[InternalPluginHost] Failed to fetch user profile:', response.status);
        return null;
      }

      const data = await response.json();
      
      if (data.user) {
        return {
          userId: data.user.user_id,
          name: data.user.name,
          profilePictureUrl: data.user.profile_picture_url,
          identityType: data.user.identity_type,
          walletAddress: data.user.wallet_address,
          ensDomain: data.user.ens_domain,
          upAddress: data.user.up_address,
          isAnonymous: data.user.is_anonymous
        };
      }

      return null;
    } catch (error) {
      console.error('[InternalPluginHost] Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Initialize community navigation if user has multiple communities
   */
  private async initializeCommunityNavigation(): Promise<void> {
    // Fetch both user communities and profile data
    const [communities, profile] = await Promise.all([
      this.fetchUserCommunities(),
      this.fetchUserProfile()
    ]);
    
    this.userCommunities = communities;
    this.userProfile = profile;
    
    // Only show navigation if user has 2+ communities
    if (this.userCommunities.length < 2) {
      console.log('[InternalPluginHost] User has <2 communities, hiding navigation');
      return;
    }
    
    console.log('[InternalPluginHost] User has', this.userCommunities.length, 'communities, showing navigation');
    
    // Create community navigation with user profile and menu action handler
    this.communityNavigation = new CommunityNavigationUI(
      this.userCommunities,
      this.authContext?.communityId || '',
      this.userProfile,
      (action: string) => this.handleMenuAction(action)
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
      // Ensure minimum height for sidebar (37.5rem = 600px @ 16px base)
      const configHeight = this.config.height || '43.75rem'; // 700px default
      const minSidebarHeight = '37.5rem'; // 600px
      
      this.embedContainer.style.cssText = `
        display: flex;
        width: ${this.config.width || '100%'};
        height: ${configHeight};
        min-height: ${minSidebarHeight};
        border-radius: ${this.config.borderRadius || '0.5rem'};
        overflow: hidden;
        box-shadow: 0 0.25rem 0.375rem rgba(0, 0, 0, 0.1);
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
   * Setup cross-tab session change listener (simple approach)
   */
  private setupCrossTabSessionListener(): void {
    // Listen for SessionManager's cross-tab sync events
    window.addEventListener('curia-session-change', () => {
      console.log('[InternalPluginHost] Cross-tab session change detected, updating UI');
      
      // Simple approach: Force iframe reload on any cross-tab session change
      if (this.currentIframe) {
        console.log('[InternalPluginHost] Reloading iframe due to cross-tab session change');
        const currentSrc = this.currentIframe.src;
        this.currentIframe.src = currentSrc;
      }
      
      // Update user profile from new active session
      const activeSession = sessionManager.getActiveSession();
      if (activeSession && this.userProfile) {
        this.userProfile = {
          userId: activeSession.userId,
          name: activeSession.name || 'Anonymous User',
          profilePictureUrl: activeSession.profileImageUrl || null,
          identityType: activeSession.identityType,
          walletAddress: activeSession.walletAddress || null,
          ensDomain: activeSession.ensName || null,
          upAddress: activeSession.upAddress || null,
          isAnonymous: activeSession.identityType === 'anonymous',
        };
      }
      
      console.log('[InternalPluginHost] ✅ Cross-tab session change handled');
    });
    
    console.log('[InternalPluginHost] ✅ Cross-tab session listener setup (simple approach)');
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

  /**
   * Handle menu action clicks from the user profile menu
   */
  private handleMenuAction(action: string): void {
    switch (action) {
      case 'sign-out':
        this.signOut();
        break;
      case 'session-switched':
        this.handleSessionSwitch();
        break;
      case 'settings':
        this.openSettings();
        break;
      case 'add-account':
        this.addAccount();
        break;
      default:
        console.log('[InternalPluginHost] Unknown menu action:', action);
    }
  }

  /**
   * Handle session switch: Update user profile and refresh UI
   */
  private async handleSessionSwitch(): Promise<void> {
    console.log('[InternalPluginHost] Handling session switch - updating user profile');
    
    try {
      // Get the new active session
      const activeSession = sessionManager.getActiveSession();
      if (!activeSession) {
        console.log('[InternalPluginHost] No active session after switch, resetting to auth');
        this.resetToInitialState();
        return;
      }

      // Update user profile from session
      this.userProfile = {
        userId: activeSession.userId,
        name: activeSession.name || 'Anonymous User',
        profilePictureUrl: activeSession.profileImageUrl || null,
        identityType: activeSession.identityType,
        walletAddress: activeSession.walletAddress || null,
        ensDomain: activeSession.ensName || null,
        upAddress: activeSession.upAddress || null,
        isAnonymous: activeSession.identityType === 'anonymous',
      };

      // Refresh community navigation with new user profile
      if (this.communityNavigation) {
        this.communityNavigation = new CommunityNavigationUI(
          this.userCommunities,
          this.authContext?.communityId || '',
          this.userProfile,
          (action: string) => this.handleMenuAction(action)
        );
        
        // Re-render the navigation
        const existingNav = this.embedContainer?.querySelector('.curia-community-nav');
        if (existingNav) {
          const newNav = this.communityNavigation.render();
          existingNav.replaceWith(newNav);
        }
      }

      // ✅ OPTION A: Force iframe reload to prevent crashes from session hot-swap
      if (this.currentIframe) {
        console.log('[InternalPluginHost] Forcing iframe reload due to session switch');
        
        // Simple force reload - just reset the src to trigger fresh load
        const currentSrc = this.currentIframe.src;
        this.currentIframe.src = currentSrc;
        
        console.log('[InternalPluginHost] ✅ Iframe reloaded with new session context');
      }

      console.log('[InternalPluginHost] ✅ Session switch completed, UI updated');
      
    } catch (error) {
      console.error('[InternalPluginHost] Failed to handle session switch:', error);
    }
  }

  /**
   * Sign out: Complete reset to initial state
   */
  private signOut(): void {
    console.log('[InternalPluginHost] Signing out user - performing complete reset');
    this.resetToInitialState();
  }

  /**
   * Open settings: Placeholder for future implementation
   */
  private openSettings(): void {
    console.log('[InternalPluginHost] Opening settings (placeholder)');
    // TODO: Implement settings modal or navigation
  }

  /**
   * Add a new account: Open auth iframe
   */
  private addAccount(): void {
    console.log('[InternalPluginHost] Adding new account - opening auth iframe');
    // This will trigger the initializeAuthPhase logic, which will handle the auth flow
    // and then call handleAuthCompletion, which will re-render the menu with the new session.
    // No need to call initializeCommunityNavigation here, as it's only for multiple communities.
    // The add-account button is a direct action to add a new session.
  }

  /**
   * Complete reset to initial state - clean up all forum-phase artifacts
   */
  private resetToInitialState(): void {
    console.log('[InternalPluginHost] Resetting to initial state');
    
    // 1. Clean up all forum phase DOM elements
    this.cleanupForumPhase();
    
    // 2. Reset all state variables
    this.communityNavigation = null;
    this.userCommunities = [];
    this.userProfile = null;
    this.embedContainer = null;
    this.authContext = null;
    this.currentIframe = null;
    
    // 3. Clear session using SessionManager instead of localStorage
    try {
      sessionManager.removeActiveSession().catch(error => {
        console.error('[InternalPluginHost] Failed to clear session via SessionManager:', error);
      });
      console.log('[InternalPluginHost] ✅ Session cleared via SessionManager');
    } catch (error) {
      console.error('[InternalPluginHost] SessionManager clear error:', error);
    }
    
    // 4. Recreate clean auth iframe
    this.container.innerHTML = '';
    this.initializeAuthPhase();
  }

  /**
   * Clean up all forum phase artifacts
   */
  private cleanupForumPhase(): void {
    console.log('[InternalPluginHost] Cleaning up forum phase artifacts');
    
    // Clean up portal elements (community previews, user profile menu)
    const portals = document.querySelectorAll('.community-preview, .user-profile-menu');
    portals.forEach(portal => {
      console.log('[InternalPluginHost] Removing portal element:', portal.className);
      portal.remove();
    });
    
    // Note: API proxy iframe reference will be reset when new iframe is set
    // No need to explicitly clear it as setActiveIframe will be called with new iframe
    
    console.log('[InternalPluginHost] Forum phase cleanup complete');
  }
}

 