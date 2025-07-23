/**
 * CommunitySidebar Component
 * Main sidebar component that orchestrates community items and user profile
 * 
 * Extracted from CommunityNavigationUI class for better maintainability
 * Composes CommunityItem and UserProfile components
 */

import { CommunityItem, UserCommunityMembership } from './CommunityItem';
import { CommunityPreviewManager } from './CommunityPreview';
import { UserProfileComponent, UserProfile } from '../profile/UserProfile';

export interface CommunitySidebarOptions {
  communities: UserCommunityMembership[];
  currentCommunityId: string;
  userProfile: UserProfile | null;
  onCommunitySelect?: (community: UserCommunityMembership) => void;
  onMenuAction?: (action: string) => void;
  getIframeStatus?: (communityId: string) => boolean; // Simple function to check if iframe is loaded
  onPlusButtonClick?: () => void; // Callback for plus button click (community discovery)
}

export class CommunitySidebar {
  private communities: UserCommunityMembership[];
  private currentCommunityId: string;
  private userProfile: UserProfile | null;
  private options: CommunitySidebarOptions;
  
  private container: HTMLElement | null = null;
  private communityItems: CommunityItem[] = [];
  private userProfileComponent: UserProfileComponent | null = null;
  private previewManager: CommunityPreviewManager;

  constructor(options: CommunitySidebarOptions) {
    this.communities = options.communities;
    this.currentCommunityId = options.currentCommunityId;
    this.userProfile = options.userProfile;
    this.options = options;
    this.previewManager = CommunityPreviewManager.getInstance();
  }

  render(): HTMLElement {
    const nav = document.createElement('div');
    nav.className = 'curia-community-nav';
    
    // Inject external CSS styles - much cleaner than inline!
    this.injectExternalCSS();
    
    // Create scrollable community list container
    const communityListContainer = document.createElement('div');
    communityListContainer.className = 'community-list-container';
    
    // Add communities to scrollable container
    this.renderCommunityItems(communityListContainer);
    
    nav.appendChild(communityListContainer);

    // Add user profile section at the bottom (fixed)
    if (this.userProfile) {
      const userSection = this.renderUserProfile();
      nav.appendChild(userSection);
    }
    
    this.container = nav;
    return nav;
  }

  private renderCommunityItems(container: HTMLElement): void {
    // Clear existing items
    this.communityItems.forEach(item => item.destroy());
    this.communityItems = [];

    this.communities.forEach(community => {
      const communityItem = new CommunityItem({
        community,
        isActive: community.id === this.currentCommunityId,
        hasIframeLoaded: this.options.getIframeStatus ? this.options.getIframeStatus(community.id) : false,
        onHover: (community, element) => {
          this.previewManager.showPreview(community, element);
        },
        onHoverEnd: () => {
          this.previewManager.hidePreview();
        },
        onClick: (community) => {
          if (this.options.onCommunitySelect) {
            this.options.onCommunitySelect(community);
          }
          this.updateActiveCommunity(community.id);
        }
      });

      const itemElement = communityItem.render();
      container.appendChild(itemElement);
      this.communityItems.push(communityItem);
    });
    
    // Add plus icon placeholder for discovering/creating communities
    this.addPlusIconPlaceholder(container);
  }

  /**
   * Add subtle plus icon placeholder for community discovery/creation
   */
  private addPlusIconPlaceholder(container: HTMLElement): void {
    const plusIcon = document.createElement('div');
    plusIcon.className = 'community-item plus-icon-placeholder';
    
    // Subtle styling for the plus icon
    plusIcon.style.cssText = `
      background: rgba(148, 163, 184, 0.1);
      border: 2px dashed rgba(148, 163, 184, 0.3);
      color: rgba(148, 163, 184, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      transition: all 0.25s ease;
      cursor: pointer;
    `;
    
    plusIcon.innerHTML = '+';
    
    // Hover effect
    plusIcon.addEventListener('mouseenter', () => {
      plusIcon.style.borderColor = 'rgba(59, 130, 246, 0.4)';
      plusIcon.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
      plusIcon.style.color = 'rgba(59, 130, 246, 0.8)';
      plusIcon.style.transform = 'scale(1.08) translateY(-1px)';
    });
    
    plusIcon.addEventListener('mouseleave', () => {
      plusIcon.style.borderColor = 'rgba(148, 163, 184, 0.3)';
      plusIcon.style.backgroundColor = 'rgba(148, 163, 184, 0.1)';
      plusIcon.style.color = 'rgba(148, 163, 184, 0.7)';
      plusIcon.style.transform = '';
    });
    
    // Click handler for community discovery
    plusIcon.addEventListener('click', () => {
      console.log('[CommunitySidebar] Plus icon clicked - opening community discovery');
      if (this.options.onPlusButtonClick) {
        this.options.onPlusButtonClick();
      }
    });
    
    container.appendChild(plusIcon);
  }

  private renderUserProfile(): HTMLElement {
    if (!this.userProfile) {
      throw new Error('Cannot render user profile: userProfile is null');
    }

    this.userProfileComponent = new UserProfileComponent({
      userProfile: this.userProfile,
      onMenuAction: (action) => {
        if (this.options.onMenuAction) {
          this.options.onMenuAction(action);
        }
      }
    });

    return this.userProfileComponent.render();
  }

  /**
   * Update which community is currently active
   */
  updateActiveCommunity(communityId: string): void {
    if (this.currentCommunityId === communityId) return;

    this.currentCommunityId = communityId;

    // Update all community items
    this.communityItems.forEach(item => {
      const isActive = item['community'].id === communityId; // Access private property
      item.updateActiveState(isActive);
    });
  }

  /**
   * Update the community list with new data
   */
  updateCommunities(communities: UserCommunityMembership[]): void {
    this.communities = communities;
    
    if (this.container) {
      const communityListContainer = this.container.querySelector('.community-list-container');
      if (communityListContainer) {
        // Clear existing items
        communityListContainer.innerHTML = '';
        this.renderCommunityItems(communityListContainer as HTMLElement);
      }
    }
  }

  /**
   * Update online indicators after iframe status changes
   */
  updateOnlineIndicators(): void {
    console.log(`[MULTI-IFRAME] [CommunitySidebar] Refreshing online indicators for ${this.communityItems.length} communities`);
    
    // Simple approach: re-render the community list to update indicators
    if (this.container) {
      const communityListContainer = this.container.querySelector('.community-list-container');
      if (communityListContainer) {
        communityListContainer.innerHTML = '';
        this.renderCommunityItems(communityListContainer as HTMLElement);
      }
    }
  }

  /**
   * Update user profile information
   */
  updateUserProfile(userProfile: UserProfile): void {
    this.userProfile = userProfile;
    
    if (this.container && this.userProfileComponent) {
      // Remove old profile component
      const oldProfileElement = this.container.querySelector('.user-profile-section');
      if (oldProfileElement) {
        oldProfileElement.remove();
      }
      
      // Add new profile component
      const userSection = this.renderUserProfile();
      this.container.appendChild(userSection);
    }
  }

  /**
   * Inject external CSS styles instead of massive inline CSS block
   * Much cleaner and maintainable approach
   */
  private injectExternalCSS(): void {
    // Check if styles are already injected
    const existingStyles = document.head.querySelector('#curia-embed-styles');
    if (existingStyles) {
      return; // Already injected
    }

    // For now, we'll inject the CSS content directly
    // TODO: In future, this could load from external files or be bundled
    const cssContent = this.getAllCSSContent();
    
    const styleElement = document.createElement('style');
    styleElement.id = 'curia-embed-styles';
    styleElement.textContent = cssContent;
    document.head.appendChild(styleElement);
  }

  /**
   * Get all CSS content consolidated from our external files
   * This replaces the massive inline CSS block we removed
   */
  private getAllCSSContent(): string {
    // Import our extracted CSS content
    // This is a temporary solution - in a proper build system, this would be bundled
    return `
/* Community Sidebar Styles - Extracted for maintainability */
.curia-community-nav {
  /* CSS Variables */
  --sidebar-width: 5rem;
  --sidebar-padding: 1rem;
  --icon-size: 3rem;
  --icon-image-size: 2.75rem;
  --icon-emoji-size: 1.5rem;
  --icon-border-radius: 0.75rem;
  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.25rem;
  --profile-height: 5.5rem;
  
  /* Light theme colors */
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

  /* Layout */
  width: var(--sidebar-width);
  height: 100%;
  min-height: 0;
  flex-shrink: 0;
  flex-grow: 0;
  background: linear-gradient(135deg, var(--sidebar-bg-from) 0%, var(--sidebar-bg-to) 100%);
  border-right: 1px solid var(--sidebar-border);
  box-shadow: inset 0.125rem 0 0.25rem rgba(0, 0, 0, 0.05), inset 0 0.125rem 0.25rem rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  padding: var(--sidebar-padding);
  position: relative;
}

/* Dark theme */
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

/* Community list container */
.community-list-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0.375rem 0.375rem;
  margin: 0 -0.375rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  
  /* Hide scrollbar but keep functionality */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

/* Hide webkit scrollbar */
.community-list-container::-webkit-scrollbar {
  display: none;
}

/* Community items */
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
  overflow: visible;
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

.community-icon-image {
  width: var(--icon-image-size);
  height: var(--icon-image-size);
  object-fit: cover;
  border-radius: var(--icon-border-radius);
  margin: 0.125rem;
  flex-shrink: 0;
}

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

/* User profile section */
.user-profile-section {
  margin-top: var(--space-xs);
  border-top: 1px solid var(--sidebar-border);
  flex-shrink: 0;
  height: var(--profile-height);
  min-height: var(--profile-height);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: var(--space-xs);
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

/* Preview and menu components - Beautiful premium styling restored */
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
  pointer-events: auto;
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

/* Mobile Responsive - Horizontal Bottom Nav Bar */
@media (max-width: 767px) {
  .curia-embed-container {
    flex-direction: column !important;
  }
  
  .curia-community-nav {
    /* Transform to horizontal bottom nav */
    width: 100% !important;
    height: auto !important;
    min-height: auto !important;
    flex-direction: row !important;
    border-right: none !important;
    border-top: 1px solid var(--sidebar-border) !important;
    padding: var(--space-sm) var(--space-md) !important;
    order: 2; /* Place after iframe */
  }
  
  .community-list-container {
    /* Horizontal scrolling list */
    flex-direction: row !important;
    gap: var(--space-sm) !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    padding: 0 !important;
    margin: 0 !important;
    flex: 1 !important;
    min-height: auto !important;
    
    /* Hide scrollbar on mobile too */
    scrollbar-width: none !important; /* Firefox */
    -ms-overflow-style: none !important; /* IE/Edge */
  }
  
  .community-item,
  .plus-icon-placeholder {
    /* Smaller icons for mobile */
    width: 2.5rem !important;
    height: 2.5rem !important;
    min-width: 2.5rem !important;
    min-height: 2.5rem !important;
    max-width: 2.5rem !important;
    max-height: 2.5rem !important;
    flex-shrink: 0 !important;
  }
  
  .community-icon-image {
    width: 2.25rem !important;
    height: 2.25rem !important;
  }
  
  .community-icon-emoji {
    font-size: 1.25rem !important;
  }
  
  .user-profile-section {
    /* Profile section on the right side */
    margin-top: 0 !important;
    margin-left: var(--space-md) !important;
    padding-left: var(--space-md) !important;
    padding-bottom: var(--space-xs) !important;
    border-top: none !important;
    border-left: 1px solid var(--sidebar-border) !important;
    height: auto !important;
    min-height: auto !important;
    flex-shrink: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  
  .user-profile-avatar {
    /* Smaller profile avatar */
    width: 2.5rem !important;
    height: 2.5rem !important;
  }
  
  .curia-iframe-container {
    order: 1; /* Place before nav */
    flex: 1 !important;
  }
}
    `;
  }

  /**
   * Cleanup method for removing event listeners and DOM elements
   */
  destroy(): void {
    // Cleanup community items
    this.communityItems.forEach(item => item.destroy());
    this.communityItems = [];

    // Cleanup user profile component
    if (this.userProfileComponent) {
      this.userProfileComponent.destroy();
      this.userProfileComponent = null;
    }

    // Hide any open preview
    this.previewManager.hidePreview();

    this.container = null;
  }
} 