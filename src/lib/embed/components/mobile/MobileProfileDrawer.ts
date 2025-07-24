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
import { sessionManager, SessionData } from '../../../SessionManager';

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
  
  // SessionManager integration (same as desktop)
  private sessionManager = sessionManager;
  private sessionSubscription: (() => void) | null = null;
  private allSessions: SessionData[] = [];

  constructor(options: MobileProfileDrawerOptions) {
    this.userProfile = options.userProfile;
    this.options = options;
    
    // Subscribe to session changes for reactive menu updates (same as desktop)
    this.sessionSubscription = this.sessionManager.subscribe((sessions, activeToken, activeSession) => {
      this.allSessions = sessions;
      this.refreshDrawer();
    });
    
    // Initial load of sessions
    this.allSessions = this.sessionManager.getAllSessions();
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

  /**
   * Refresh drawer when sessions change (same as desktop)
   */
  private refreshDrawer(): void {
    if (this.isVisible && this.element) {
      // Re-render profile section with updated session data
      const profileSection = this.element.querySelector('.mobile-profile-drawer-profile');
      if (profileSection) {
        const newProfile = this.renderProfileSection();
        profileSection.replaceWith(newProfile);
      }
      
      // Re-render actions section with updated session data  
      const actionsSection = this.element.querySelector('.mobile-profile-drawer-actions');
      if (actionsSection) {
        const newActions = this.renderActions();
        actionsSection.replaceWith(newActions);
      }
    }
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
    closeButton.innerHTML = '⌄'; // Down chevron - suggests collapse
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
    
    // Get current active session from SessionManager (same as desktop)
    const activeSession = this.sessionManager.getActiveSession();
    const userName = activeSession?.name || this.userProfile.name || 'Unknown User';
    const profileImageUrl = activeSession?.profileImageUrl || this.userProfile.profilePictureUrl;
    const identityType = activeSession?.identityType || this.userProfile.identityType || 'anonymous';
    
    // Profile avatar
    const avatar = document.createElement('div');
    avatar.className = 'mobile-profile-drawer-avatar';
    
    if (profileImageUrl) {
      const img = document.createElement('img');
      img.src = profileImageUrl;
      img.alt = userName;
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: inherit;
      `;
      avatar.appendChild(img);
    } else {
      // Gradient fallback with initials
      const gradientClass = getGradientClass(userName);
      avatar.style.background = getGradientStyle(gradientClass);
      
      const initials = document.createElement('span');
      initials.textContent = this.getUserInitials(userName);
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
    name.textContent = userName;
    
    const type = document.createElement('p');
    type.className = 'mobile-profile-drawer-type';
    type.textContent = this.getIdentityTypeLabel(identityType) + ' • Active';
    
    info.appendChild(name);
    info.appendChild(type);
    
    section.appendChild(avatar);
    section.appendChild(info);
    
    return section;
  }

  private renderActions(): HTMLElement {
    const actions = document.createElement('div');
    actions.className = 'mobile-profile-drawer-actions';
    
    // Available Sessions section (same as desktop)
    const activeToken = this.sessionManager.getActiveToken();
    const inactiveSessions = this.allSessions.filter(session => 
      session.sessionToken !== activeToken
    );
    
    if (inactiveSessions.length > 0) {
      const sessionSection = document.createElement('div');
      sessionSection.className = 'mobile-profile-drawer-section';
      
      const sessionTitle = document.createElement('div');
      sessionTitle.className = 'mobile-profile-drawer-section-title';
      sessionTitle.textContent = 'Available Accounts';
      sessionSection.appendChild(sessionTitle);
      
      // Render each inactive session
      inactiveSessions.forEach(session => {
        const sessionItem = this.renderSessionItem(session);
        sessionSection.appendChild(sessionItem);
      });
      
      actions.appendChild(sessionSection);
    }
    
    // Actions section (same as desktop)
    const actionsSection = document.createElement('div');
    actionsSection.className = 'mobile-profile-drawer-section';
    
    const actionsTitle = document.createElement('div');
    actionsTitle.className = 'mobile-profile-drawer-section-title';
    actionsTitle.textContent = 'Actions';
    actionsSection.appendChild(actionsTitle);
    
    // Add Another Account (same action as desktop)
    const addAccount = this.renderAction({
      icon: '➕',
      text: 'Add Another Account',
      action: 'add-session'
    });
    actionsSection.appendChild(addAccount);
    
    // Settings (same action as desktop)
    const settings = this.renderAction({
      icon: '⚙️',
      text: 'Settings',
      action: 'settings'
    });
    actionsSection.appendChild(settings);
    
    // Sign Out (same action as desktop)
    const signOut = this.renderAction({
      icon: '🚪',
      text: 'Sign Out',
      action: 'sign-out',
      destructive: true
    });
    actionsSection.appendChild(signOut);
    
    actions.appendChild(actionsSection);
    
    return actions;
  }

  private renderSessionItem(session: SessionData): HTMLElement {
    const item = document.createElement('div');
    item.className = 'mobile-profile-drawer-action';
    
    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'mobile-profile-drawer-action-icon';
    avatar.style.cssText = `
      width: 32px;
      height: 32px;
      border-radius: 8px;
      overflow: hidden;
    `;
    
    if (session.profileImageUrl) {
      const img = document.createElement('img');
      img.src = session.profileImageUrl;
      img.alt = session.name || 'User';
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: inherit;
      `;
      avatar.appendChild(img);
    } else {
      // Gradient fallback
      const name = session.name || 'User';
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
    
    // Session info
    const info = document.createElement('div');
    info.style.cssText = 'flex: 1; min-width: 0;';
    
    const name = document.createElement('div');
    name.className = 'mobile-profile-drawer-action-text';
    name.textContent = session.name || 'Unknown User';
    name.style.cssText = 'margin-bottom: 2px; font-size: 14px;';
    
    const type = document.createElement('div');
    type.style.cssText = 'font-size: 12px; color: var(--preview-text-muted); font-weight: normal;';
    type.textContent = this.getIdentityTypeLabel(session.identityType);
    
    info.appendChild(name);
    info.appendChild(type);
    
    item.appendChild(avatar);
    item.appendChild(info);
    
    // Click handler for session switching (same as desktop)
    item.addEventListener('click', () => {
      this.handleSessionSwitch(session.sessionToken);
    });
    
    return item;
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
   * Get identity type label for display (same as desktop)
   */
  private getIdentityTypeLabel(identityType: 'ens' | 'universal_profile' | 'anonymous'): string {
    switch (identityType) {
      case 'ens':
        return 'ENS';
      case 'universal_profile':
        return 'Universal Profile';
      case 'anonymous':
        return 'Guest';
      default:
        return 'User';
    }
  }

  /**
   * Handle session switching (same as desktop)
   */
  private async handleSessionSwitch(sessionToken: string): Promise<void> {
    try {
      console.log('[MobileProfileDrawer] Switching to session:', sessionToken);
      await this.sessionManager.setActiveSession(sessionToken);
      
      // Drawer will refresh automatically via subscription
      console.log('[MobileProfileDrawer] Session switch completed');
    } catch (error) {
      console.error('[MobileProfileDrawer] Failed to switch session:', error);
    }
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
   * Cleanup (same as desktop)
   */
  destroy(): void {
    // Cleanup session subscription
    if (this.sessionSubscription) {
      this.sessionSubscription();
      this.sessionSubscription = null;
    }
    
    this.hide();
  }
} 