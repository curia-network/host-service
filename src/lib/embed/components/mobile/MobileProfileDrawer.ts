/**
 * MobileProfileDrawer Component
 * Full-screen drawer for user profile management on mobile devices
 * 
 * Features:
 * - Slide-up animation from bottom
 * - Session management and account switching
 * - Dark backdrop with blur effect
 * - Dismiss on backdrop click or close button
 */

import { UserProfile } from '../profile/UserProfile';
import { getGradientStyle, getGradientClass } from '../../styling';

export interface MobileProfileDrawerOptions {
  userProfile: UserProfile;
  onMenuAction: (action: string) => void;
  onClose: () => void;
}

export class MobileProfileDrawer {
  private userProfile: UserProfile;
  private options: MobileProfileDrawerOptions;
  private element: HTMLElement | null = null;
  private isVisible: boolean = false;

  constructor(options: MobileProfileDrawerOptions) {
    this.userProfile = options.userProfile;
    this.options = options;
  }

  show(): void {
    if (this.isVisible) return;
    
    this.isVisible = true;
    const modal = this.render();
    document.body.appendChild(modal);
    
    // Trigger animation after DOM insertion
    requestAnimationFrame(() => {
      modal.classList.add('mobile-profile-drawer-visible');
    });
  }

  hide(): void {
    if (!this.isVisible || !this.element) return;
    
    this.isVisible = false;
    this.element.classList.remove('mobile-profile-drawer-visible');
    
    // Remove from DOM after animation completes
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      this.element = null;
    }, 300); // Match CSS animation duration
  }

  private render(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'mobile-profile-drawer-overlay';
    
    // Backdrop - clicking dismisses modal
    const backdrop = document.createElement('div');
    backdrop.className = 'mobile-profile-drawer-backdrop';
    backdrop.addEventListener('click', () => {
      this.options.onClose();
    });
    
    // Modal content
    const content = document.createElement('div');
    content.className = 'mobile-profile-drawer-content';
    
    // Prevent content clicks from dismissing modal
    content.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Header with title and close button
    const header = this.renderHeader();
    content.appendChild(header);
    
    // Profile section
    const profile = this.renderProfileSection();
    content.appendChild(profile);
    
    // Actions section
    const actions = this.renderActions();
    content.appendChild(actions);
    
    modal.appendChild(backdrop);
    modal.appendChild(content);
    
    this.element = modal;
    return modal;
  }

  private renderHeader(): HTMLElement {
    const header = document.createElement('div');
    header.className = 'mobile-profile-drawer-header';
    
    const title = document.createElement('h2');
    title.className = 'mobile-profile-drawer-title';
    title.textContent = 'Profile';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'mobile-profile-drawer-close';
    closeButton.innerHTML = '×';
    closeButton.addEventListener('click', () => {
      this.options.onClose();
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    return header;
  }

  private renderProfileSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'mobile-profile-drawer-profile';
    
    // Profile avatar
    const avatar = document.createElement('div');
    avatar.className = 'mobile-profile-drawer-avatar';
    
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
        font-size: 24px;
        font-family: system-ui, -apple-system, sans-serif;
      `;
      avatar.appendChild(initials);
    }
    
    // Profile info
    const info = document.createElement('div');
    info.className = 'mobile-profile-drawer-info';
    
    const name = document.createElement('h3');
    name.className = 'mobile-profile-drawer-name';
    name.textContent = this.userProfile.name || 'Unknown User';
    
    const type = document.createElement('p');
    type.className = 'mobile-profile-drawer-type';
    type.textContent = this.userProfile.type === 'ens' ? 'ENS Account' : 'Anonymous Account';
    
    info.appendChild(name);
    info.appendChild(type);
    
    section.appendChild(avatar);
    section.appendChild(info);
    
    return section;
  }

  private renderActions(): HTMLElement {
    const actions = document.createElement('div');
    actions.className = 'mobile-profile-drawer-actions';
    
    // Session management section
    const sessionSection = document.createElement('div');
    sessionSection.className = 'mobile-profile-drawer-section';
    
    const sessionTitle = document.createElement('div');
    sessionTitle.className = 'mobile-profile-drawer-section-title';
    sessionTitle.textContent = 'Account Management';
    
    sessionSection.appendChild(sessionTitle);
    
    // Switch account action
    const switchAccount = this.renderAction({
      icon: '🔄',
      text: 'Switch Account',
      action: 'switch-account'
    });
    sessionSection.appendChild(switchAccount);
    
    // Create anonymous account action
    const createAnonymous = this.renderAction({
      icon: '👤',
      text: 'Create Anonymous Account',
      action: 'create-anonymous'
    });
    sessionSection.appendChild(createAnonymous);
    
    actions.appendChild(sessionSection);
    
    // Settings section
    const settingsSection = document.createElement('div');
    settingsSection.className = 'mobile-profile-drawer-section';
    
    const settingsTitle = document.createElement('div');
    settingsTitle.className = 'mobile-profile-drawer-section-title';
    settingsTitle.textContent = 'Settings';
    
    settingsSection.appendChild(settingsTitle);
    
    // Disconnect action
    const disconnect = this.renderAction({
      icon: '🚪',
      text: 'Disconnect',
      action: 'disconnect',
      destructive: true
    });
    settingsSection.appendChild(disconnect);
    
    actions.appendChild(settingsSection);
    
    return actions;
  }

  private renderAction(config: {
    icon: string;
    text: string;
    action: string;
    destructive?: boolean;
  }): HTMLElement {
    const action = document.createElement('div');
    action.className = `mobile-profile-drawer-action${config.destructive ? ' destructive' : ''}`;
    
    const icon = document.createElement('div');
    icon.className = 'mobile-profile-drawer-action-icon';
    icon.textContent = config.icon;
    
    const text = document.createElement('div');
    text.className = 'mobile-profile-drawer-action-text';
    text.textContent = config.text;
    
    action.appendChild(icon);
    action.appendChild(text);
    
    // Click handler
    action.addEventListener('click', () => {
      this.options.onMenuAction(config.action);
    });
    
    return action;
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
   * Update user profile information
   */
  updateUserProfile(userProfile: UserProfile): void {
    this.userProfile = userProfile;
    
    // Re-render if drawer is visible
    if (this.isVisible && this.element) {
      const profileSection = this.element.querySelector('.mobile-profile-drawer-profile');
      if (profileSection) {
        const newProfile = this.renderProfileSection();
        profileSection.replaceWith(newProfile);
      }
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.hide();
  }
} 