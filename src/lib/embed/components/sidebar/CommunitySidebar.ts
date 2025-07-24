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
import { MobileBottomNav } from '../mobile/MobileBottomNav';
import { MobileCommunityPicker } from '../mobile/MobileCommunityPicker';
import { MobileProfileDrawer } from '../mobile/MobileProfileDrawer';
import { injectStyles } from '../../styling';
import { getIconHTML } from '../../styling/utils/icons';
import { isMobileViewport, addResizeListener } from '../../utils/responsive';

export interface CommunitySidebarOptions {
  communities: UserCommunityMembership[];
  currentCommunityId: string;
  userProfile: UserProfile | null;
  onCommunitySelect?: (community: UserCommunityMembership) => void;
  onMenuAction?: (action: string) => void;
  getIframeStatus?: (communityId: string) => boolean; // Simple function to check if iframe is loaded
  onPlusButtonClick?: () => void; // Callback for plus button click (community discovery)
  embedContainer?: HTMLElement; // 🎯 Container for modal boundaries - no more hijacking!
}

export class CommunitySidebar {
  private communities: UserCommunityMembership[];
  private currentCommunityId: string;
  private userProfile: UserProfile | null;
  private options: CommunitySidebarOptions;
  private embedContainer: HTMLElement | null = null; // 🎯 Reference to embed container for boundary respect
  
  private container: HTMLElement | null = null;
  private communityItems: CommunityItem[] = [];
  private userProfileComponent: UserProfileComponent | null = null;
  private previewManager: CommunityPreviewManager;
  
  // Mobile-specific properties
  private mobileBottomNav: MobileBottomNav | null = null;
  private mobileCommunityPicker: MobileCommunityPicker | null = null;
  private mobileProfileDrawer: MobileProfileDrawer | null = null;
  private isMobile: boolean = false;
  private resizeCleanup: (() => void) | null = null;

  constructor(options: CommunitySidebarOptions) {
    this.communities = options.communities;
    this.currentCommunityId = options.currentCommunityId;
    this.userProfile = options.userProfile;
    this.options = options;
    this.embedContainer = options.embedContainer || null; // 🎯 Store embed container reference
    this.previewManager = CommunityPreviewManager.getInstance();
    
    // Initialize mobile state
    this.isMobile = isMobileViewport();
    
    // Set up responsive listener
    this.resizeCleanup = addResizeListener((isMobile) => {
      if (this.isMobile !== isMobile) {
        this.isMobile = isMobile;
        this.handleViewportChange();
      }
    });
  }

  render(): HTMLElement {
    // Inject CSS styles from proper CSS files!
    injectStyles();
    
    if (this.isMobile) {
      return this.renderMobile();
    } else {
      return this.renderDesktop();
    }
  }

  private renderDesktop(): HTMLElement {
    const nav = document.createElement('div');
    nav.className = 'curia-community-nav';
    
    // 🎨 Add logo section at the top
    const logoSection = this.renderLogoSection();
    nav.appendChild(logoSection);
    
    // 🚀 Add navigation items section (search, messages, notifications)
    const navItemsSection = this.renderNavigationItems();
    nav.appendChild(navItemsSection);
    
    // ➖ Add divider
    const divider = this.renderDivider();
    nav.appendChild(divider);
    
    // 🏠 Create scrollable community list container
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

  private renderMobile(): HTMLElement {
    // Create wrapper container for mobile layout
    const wrapper = document.createElement('div');
    wrapper.className = 'curia-mobile-wrapper';
    
    if (this.userProfile) {
      // Create mobile community picker modal
      this.mobileCommunityPicker = new MobileCommunityPicker({
        communities: this.communities,
        currentCommunityId: this.currentCommunityId,
        onCommunitySelect: (community) => {
          console.log('[CommunitySidebar] Community selected:', community.name);
          // Hide modal first
          if (this.mobileCommunityPicker) {
            this.mobileCommunityPicker.hide();
          }
          // Then trigger community selection
          if (this.options.onCommunitySelect) {
            this.options.onCommunitySelect(community);
          }
        },
        onClose: () => {
          console.log('[CommunitySidebar] Mobile community picker closed');
          if (this.mobileCommunityPicker) {
            this.mobileCommunityPicker.hide();
          }
        },
        onPlusButtonClick: () => {
          console.log('[CommunitySidebar] Mobile plus button clicked - same as desktop');
          // Same callback as desktop
          if (this.options.onPlusButtonClick) {
            this.options.onPlusButtonClick();
          }
        },
        embedContainer: this.embedContainer || undefined // 🎯 Pass embed container for boundary respect (null → undefined)
      });

      // Create mobile profile drawer
      this.mobileProfileDrawer = new MobileProfileDrawer({
        userProfile: this.userProfile,
        onMenuAction: (action) => {
          console.log('[CommunitySidebar] Profile action:', action);
          // Hide drawer first
          if (this.mobileProfileDrawer) {
            this.mobileProfileDrawer.hide();
          }
          // Then trigger action
          if (this.options.onMenuAction) {
            this.options.onMenuAction(action);
          }
        },
        onClose: () => {
          console.log('[CommunitySidebar] Mobile profile drawer closed');
          if (this.mobileProfileDrawer) {
            this.mobileProfileDrawer.hide();
          }
        },
        embedContainer: this.embedContainer || undefined // 🎯 Pass embed container for boundary respect (null → undefined)
      });

      // Create mobile bottom navigation
      this.mobileBottomNav = new MobileBottomNav({
        communities: this.communities,
        currentCommunityId: this.currentCommunityId,
        userProfile: this.userProfile,
        onCommunityMenuClick: () => {
          console.log('[CommunitySidebar] Mobile community menu clicked - showing picker');
          if (this.mobileCommunityPicker) {
            this.mobileCommunityPicker.show();
          }
        },
        onProfileMenuClick: () => {
          console.log('[CommunitySidebar] Mobile profile menu clicked - showing drawer');
          if (this.mobileProfileDrawer) {
            this.mobileProfileDrawer.show();
          }
        }
      });
      
      const bottomNavElement = this.mobileBottomNav.render();
      wrapper.appendChild(bottomNavElement);
    }
    
    this.container = wrapper; 
    return wrapper;
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
      font-size: 24px;
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
   * Handle viewport changes between mobile and desktop
   */
  private handleViewportChange(): void {
    // Force re-render when viewport changes
    if (this.container && this.container.parentNode) {
      const parent = this.container.parentNode;
      const newElement = this.render();
      parent.replaceChild(newElement, this.container);
    }
  }

  /**
   * Update which community is currently active
   */
  updateActiveCommunity(communityId: string): void {
    if (this.currentCommunityId === communityId) return;

    this.currentCommunityId = communityId;

    if (this.isMobile) {
      // Update mobile bottom nav
      if (this.mobileBottomNav) {
        this.mobileBottomNav.updateActiveCommunity(communityId);
      }
      // Update mobile community picker
      if (this.mobileCommunityPicker) {
        this.mobileCommunityPicker.updateCommunities(this.communities, communityId);
      }
    } else {
      // Update desktop community items
      this.communityItems.forEach(item => {
        const isActive = item['community'].id === communityId; // Access private property
        item.updateActiveState(isActive);
      });
    }
  }

  /**
   * Update the community list with new data
   */
  updateCommunities(communities: UserCommunityMembership[]): void {
    this.communities = communities;
    
    if (this.isMobile) {
      // Update mobile bottom nav
      if (this.mobileBottomNav) {
        this.mobileBottomNav.updateCommunities(communities);
      }
      // Update mobile community picker
      if (this.mobileCommunityPicker) {
        this.mobileCommunityPicker.updateCommunities(communities, this.currentCommunityId);
      }
    } else {
      // Update desktop sidebar
      if (this.container) {
        const communityListContainer = this.container.querySelector('.community-list-container');
        if (communityListContainer) {
          // Clear existing items
          communityListContainer.innerHTML = '';
          this.renderCommunityItems(communityListContainer as HTMLElement);
        }
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
    
    if (this.isMobile) {
      // Update mobile profile drawer
      if (this.mobileProfileDrawer) {
        this.mobileProfileDrawer.updateUserProfile(userProfile);
      }
    } else {
      // Update desktop profile component
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
  }



  /**
   * Update the embed container reference for mobile component boundaries
   * Called after embedContainer is created in InternalPluginHost
   */
  updateEmbedContainer(embedContainer: HTMLElement): void {
    console.log('[CommunitySidebar] Updating embed container reference for mobile boundaries');
    this.embedContainer = embedContainer;
    
    // Update existing mobile components with the new container reference
    if (this.mobileCommunityPicker) {
      (this.mobileCommunityPicker as any).embedContainer = embedContainer;
    }
    
    if (this.mobileProfileDrawer) {
      (this.mobileProfileDrawer as any).embedContainer = embedContainer;
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

    // Cleanup mobile bottom nav
    if (this.mobileBottomNav) {
      this.mobileBottomNav.destroy();
      this.mobileBottomNav = null;
    }

    // Cleanup mobile community picker
    if (this.mobileCommunityPicker) {
      this.mobileCommunityPicker.destroy();
      this.mobileCommunityPicker = null;
    }

    // Cleanup mobile profile drawer
    if (this.mobileProfileDrawer) {
      this.mobileProfileDrawer.destroy();
      this.mobileProfileDrawer = null;
    }

    // Cleanup resize listener
    if (this.resizeCleanup) {
      this.resizeCleanup();
      this.resizeCleanup = null;
    }

    // Hide any open preview
    this.previewManager.hidePreview();

    this.container = null;
  }

  /**
   * Render the Curia logo section at the top of the sidebar
   */
  private renderLogoSection(): HTMLElement {
    const logoSection = document.createElement('div');
    logoSection.className = 'sidebar-logo-section';
    
    const logoImg = document.createElement('img');
    logoImg.src = '/curia.webp'; // 🎨 Using public/curia.webp
    logoImg.alt = 'Curia';
    logoImg.className = 'sidebar-logo-img';
    
    logoSection.appendChild(logoImg);
    return logoSection;
  }

  /**
   * Render navigation items (search, messages, notifications)
   */
  private renderNavigationItems(): HTMLElement {
    const navSection = document.createElement('div');
    navSection.className = 'sidebar-nav-section';
    
    // 🔍 Search
    const searchItem = this.createNavItem('search', 'Search');
    navSection.appendChild(searchItem);
    
    // 💬 Messages (Direct Messages)
    const messagesItem = this.createNavItem('messages', 'Direct Messages');
    navSection.appendChild(messagesItem);
    
    // 🔔 Notifications
    const notificationsItem = this.createNavItem('notifications', 'Notifications');
    navSection.appendChild(notificationsItem);
    
    return navSection;
  }

  /**
   * Create a navigation item with icon and hover functionality
   */
  private createNavItem(iconName: 'search' | 'messages' | 'notifications', label: string): HTMLElement {
    const item = document.createElement('div');
    item.className = 'sidebar-nav-item';
    item.title = label;
    
    const iconContainer = document.createElement('div');
    iconContainer.className = 'sidebar-nav-icon';
    iconContainer.innerHTML = getIconHTML(iconName, { size: 20 });
    
    item.appendChild(iconContainer);
    
    // Add click handler (stub for now)
    item.addEventListener('click', () => {
      console.log(`[CommunitySidebar] ${label} clicked - functionality not implemented yet`);
    });
    
    return item;
  }

  /**
   * Render divider between nav items and community list
   */
  private renderDivider(): HTMLElement {
    const divider = document.createElement('div');
    divider.className = 'sidebar-divider';
    return divider;
  }
} 