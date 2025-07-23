/**
 * MobileBottomNav Component
 * Bottom navigation bar for mobile devices
 * 
 * Displays burger menu + community indicator, messages stub, notifications stub, and profile menu
 */

import { UserCommunityMembership } from '../sidebar/CommunityItem';
import { UserProfile } from '../profile/UserProfile';
import { getGradientStyle, getGradientClass, getIconForCommunity } from '../../styling';

export interface MobileBottomNavOptions {
  communities: UserCommunityMembership[];
  currentCommunityId: string;
  userProfile: UserProfile;
  onCommunityMenuClick: () => void;
  onProfileMenuClick: () => void;
}

export class MobileBottomNav {
  private communities: UserCommunityMembership[];
  private currentCommunityId: string;
  private userProfile: UserProfile;
  private options: MobileBottomNavOptions;
  private element: HTMLElement | null = null;

  constructor(options: MobileBottomNavOptions) {
    this.communities = options.communities;
    this.currentCommunityId = options.currentCommunityId;
    this.userProfile = options.userProfile;
    this.options = options;
  }

  render(): HTMLElement {
    const bottomNav = document.createElement('div');
    bottomNav.className = 'curia-mobile-bottom-nav';

    // 1. Community burger menu (left)
    const communitySection = this.renderCommunityBurger();
    bottomNav.appendChild(communitySection);

    // 2. Messages stub (center-left)
    const messagesSection = this.renderMessagesStub();
    bottomNav.appendChild(messagesSection);

    // 3. Notifications stub (center-right)  
    const notificationsSection = this.renderNotificationsStub();
    bottomNav.appendChild(notificationsSection);

    // 4. Profile menu (right)
    const profileSection = this.renderProfileMenu();
    bottomNav.appendChild(profileSection);

    this.element = bottomNav;
    return bottomNav;
  }

  private renderCommunityBurger(): HTMLElement {
    const currentCommunity = this.communities.find(c => c.id === this.currentCommunityId);
    
    const section = document.createElement('div');
    section.className = 'mobile-nav-section';
    
    const burger = document.createElement('div');
    burger.className = 'mobile-community-burger';
    
    // Burger/menu icon
    const burgerIcon = document.createElement('div');
    burgerIcon.className = 'mobile-burger-icon';
    burgerIcon.innerHTML = '☰'; // Hamburger icon
    
    // Community indicator (small version of current community)
    const indicator = document.createElement('div');
    indicator.className = 'mobile-community-indicator';
    
    if (currentCommunity?.logoUrl) {
      const img = document.createElement('img');
      img.src = currentCommunity.logoUrl;
      img.alt = currentCommunity.name;
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: inherit;
      `;
      indicator.appendChild(img);
    } else if (currentCommunity) {
      // Gradient fallback
      const gradientClass = getGradientClass(currentCommunity.name);
      indicator.style.background = getGradientStyle(gradientClass);
      
      const icon = document.createElement('span');
      icon.textContent = getIconForCommunity(currentCommunity.name);
      indicator.appendChild(icon);
    }
    
    burger.appendChild(burgerIcon);
    burger.appendChild(indicator);
    section.appendChild(burger);
    
    // Click handler to open community picker
    section.addEventListener('click', () => {
      this.options.onCommunityMenuClick();
    });
    
    return section;
  }

  private renderMessagesStub(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'mobile-nav-section inactive';
    
    const icon = document.createElement('div');
    icon.className = 'mobile-stub-icon';
    icon.innerHTML = '💬'; // Messages icon
    
    section.appendChild(icon);
    return section;
  }

  private renderNotificationsStub(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'mobile-nav-section inactive';
    
    const icon = document.createElement('div');
    icon.className = 'mobile-stub-icon';
    icon.innerHTML = '🔔'; // Notification bell
    
    section.appendChild(icon);
    return section;
  }

  private renderProfileMenu(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'mobile-nav-section';
    
    const profileSection = document.createElement('div');
    profileSection.className = 'mobile-profile-section';
    
    // Profile avatar
    const avatar = document.createElement('div');
    avatar.className = 'mobile-profile-avatar';
    
    if (this.userProfile.profilePictureUrl) {
      const img = document.createElement('img');
      img.src = this.userProfile.profilePictureUrl;
      img.alt = this.userProfile.name;
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: inherit;
      `;
      avatar.appendChild(img);
    } else {
      // Gradient fallback with initials
      const name = this.userProfile.name || 'User';
      const gradientClass = getGradientClass(name);
      avatar.style.background = getGradientStyle(gradientClass);
      
      const initials = document.createElement('span');
      initials.textContent = this.getUserInitials(name);
      initials.style.cssText = `
        color: white;
        font-weight: 600;
        font-size: 12px;
        font-family: system-ui, -apple-system, sans-serif;
      `;
      avatar.appendChild(initials);
    }
    
    // Dropdown indicator
    const dropdown = document.createElement('div');
    dropdown.className = 'mobile-profile-dropdown';
    dropdown.innerHTML = '▾';
    
    profileSection.appendChild(avatar);
    profileSection.appendChild(dropdown);
    section.appendChild(profileSection);
    
    // Click handler for profile menu
    section.addEventListener('click', () => {
      this.options.onProfileMenuClick();
    });
    
    return section;
  }

  private getUserInitials(name: string): string {
    if (!name) return '?';
    
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    
    return words
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  }

  /**
   * Update the active community display
   */
  updateActiveCommunity(communityId: string): void {
    this.currentCommunityId = communityId;
    
    if (this.element) {
      // Re-render community burger section (first child)
      const burgerSection = this.element.children[0];
      if (burgerSection) {
        const newSection = this.renderCommunityBurger();
        burgerSection.replaceWith(newSection);
      }
    }
  }

  /**
   * Update communities list
   */
  updateCommunities(communities: UserCommunityMembership[]): void {
    this.communities = communities;
    this.updateActiveCommunity(this.currentCommunityId);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.element = null;
  }
} 