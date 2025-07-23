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
import { injectStyles } from '../../styling';

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
    
    // Inject CSS styles from proper CSS files!
    injectStyles();
    
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