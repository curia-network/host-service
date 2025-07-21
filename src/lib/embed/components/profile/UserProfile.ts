/**
 * UserProfile Component
 * Renders the user profile section at the bottom of the sidebar
 * 
 * Extracted from InternalPluginHost.ts for better maintainability
 * Handles: avatar display, identity indicators, profile menu interactions
 */

import { getGradientClass, getGradientStyle, getUserInitials, getIdentityIcon } from '../../styling';

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

export interface UserProfileOptions {
  userProfile: UserProfile;
  onMenuAction?: (action: string) => void;
}

export class UserProfileComponent {
  private userProfile: UserProfile;
  private options: UserProfileOptions;
  private element: HTMLElement | null = null;
  private profileMenuElement: HTMLElement | null = null;

  constructor(options: UserProfileOptions) {
    this.userProfile = options.userProfile;
    this.options = options;
  }

  render(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'user-profile-section';
    
    const avatar = document.createElement('div');
    avatar.className = 'user-profile-avatar';

    // Create avatar content (image or fallback)
    if (this.userProfile.profilePictureUrl) {
      this.addUserImage(avatar);
    } else {
      this.addUserAvatarFallback(avatar);
    }

    // Add identity type indicator
    this.addIdentityIndicator(avatar);

    // Profile menu interactions - click-based
    this.setupMenuInteractions(avatar);

    section.appendChild(avatar);
    this.element = section;
    return section;
  }

  private addUserImage(avatar: HTMLElement): void {
    const img = document.createElement('img');
    img.src = this.userProfile.profilePictureUrl!;
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
  }

  private addUserAvatarFallback(avatar: HTMLElement): void {
    const name = this.userProfile.name || 'User';
    const gradientClass = getGradientClass(name);
    
    // Set gradient background
    avatar.style.background = getGradientStyle(gradientClass);
    
    // Add initials
    const initials = document.createElement('span');
    initials.textContent = getUserInitials(name);
    initials.style.cssText = `
      color: white;
      font-weight: 600;
      font-size: 18px;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    avatar.appendChild(initials);
  }

  private addIdentityIndicator(avatar: HTMLElement): void {
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

    indicator.textContent = getIdentityIcon(this.userProfile.identityType || 'anonymous');
    avatar.appendChild(indicator);
  }

  private setupMenuInteractions(avatar: HTMLElement): void {
    const showMenu = () => {
      if (this.profileMenuElement) return; // Already open

      this.profileMenuElement = this.createUserProfileMenu(avatar);
      if (this.profileMenuElement) {
        document.body.appendChild(this.profileMenuElement);
        
        requestAnimationFrame(() => {
          this.profileMenuElement?.classList.add('show');
        });
      }
    };

    const hideMenu = () => {
      if (this.profileMenuElement) {
        this.profileMenuElement.classList.remove('show');
        setTimeout(() => {
          if (this.profileMenuElement && document.body.contains(this.profileMenuElement)) {
            document.body.removeChild(this.profileMenuElement);
          }
          this.profileMenuElement = null;
        }, 200);
      }
    };

    // Click to toggle menu
    avatar.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.profileMenuElement) {
        hideMenu();
      } else {
        showMenu();
      }
    });

    // Click outside to close menu
    document.addEventListener('click', (e) => {
      if (this.profileMenuElement && 
          !this.profileMenuElement.contains(e.target as Node) && 
          !avatar.contains(e.target as Node)) {
        hideMenu();
      }
    });
  }

  private createUserProfileMenu(triggerElement: HTMLElement): HTMLElement {
    // This would be a complex method, so for now I'll create a placeholder
    // In a more complete refactoring, this would be extracted to a separate ProfileMenu component
    const menu = document.createElement('div');
    menu.className = 'user-profile-menu';
    
    // Position menu relative to trigger element
    this.positionMenu(menu, triggerElement);

    // Add rich menu content with avatar and detailed identity info
    const userName = this.userProfile.name || 'Anonymous User';
    const hasProfileImage = !!this.userProfile.profilePictureUrl;
    const gradientClass = this.getGradientClass(userName);
    const gradientStyle = this.getGradientStyle(gradientClass);
    
    menu.innerHTML = `
      <div class="profile-menu-header">
        <div class="profile-menu-avatar" style="background: ${hasProfileImage ? 'transparent' : gradientStyle}">
          ${hasProfileImage ? 
            `<img src="${this.userProfile.profilePictureUrl}" alt="${userName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">` :
            `<span style="color: white; font-weight: 600; font-size: 18px;">${this.getUserInitials(userName)}</span>`
          }
        </div>
        <div class="profile-menu-info">
          <h4>${userName}</h4>
          <p>${this.getIdentityLabel()}</p>
        </div>
      </div>
      
      <div class="profile-menu-actions">
        <button class="profile-menu-action" data-action="settings">
          <div class="profile-menu-action-icon">⚙️</div>
          <span>Settings</span>
        </button>
        <button class="profile-menu-action" data-action="switch-account">
          <div class="profile-menu-action-icon">🔄</div>
          <span>Switch Account</span>
        </button>
        <button class="profile-menu-action" data-action="sign-out">
          <div class="profile-menu-action-icon">🚪</div>
          <span>Sign Out</span>
        </button>
      </div>
    `;

    // Add click handlers for menu actions
    menu.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const action = target.closest('[data-action]')?.getAttribute('data-action');
      if (action && this.options.onMenuAction) {
        this.options.onMenuAction(action);
      }
    });

    return menu;
  }

  private positionMenu(menu: HTMLElement, triggerElement: HTMLElement): void {
    const rect = triggerElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 320;
    const spacing = 8;
    
    // Position menu ABOVE the button using BOTTOM positioning
    let left = rect.right + spacing;
    let bottom = viewportHeight - rect.top + spacing;

    // Adjust if menu would go off-screen horizontally
    if (left + menuWidth > viewportWidth - spacing) {
      left = rect.left - menuWidth - spacing;
    }
    
    if (left < spacing) {
      left = spacing;
    }

    menu.style.left = `${left}px`;
    menu.style.bottom = `${bottom}px`;
  }

  private getIdentityColor(): string {
    switch (this.userProfile.identityType) {
      case 'ens': return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'universal_profile': return 'linear-gradient(135deg, #ec4899, #be185d)';
      case 'anonymous': return 'linear-gradient(135deg, #6b7280, #4b5563)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  }

  private getIdentityLabel(): string {
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

  private getUserInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  /**
   * Cleanup method for removing event listeners and DOM elements
   */
  destroy(): void {
    if (this.profileMenuElement) {
      this.profileMenuElement.remove();
      this.profileMenuElement = null;
    }
    this.element = null;
  }
} 