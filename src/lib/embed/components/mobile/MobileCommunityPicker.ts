/**
 * MobileCommunityPicker Component
 * Full-screen modal for community selection on mobile devices
 * 
 * Features:
 * - Slide-up animation from bottom
 * - Grid layout with touch-friendly community icons
 * - Dark backdrop with blur effect
 * - Dismiss on backdrop click or close button
 */

import { UserCommunityMembership } from '../sidebar/CommunityItem';
import { getGradientStyle, getGradientClass, getIconForCommunity, getIconHTML } from '../../styling';

export interface MobileCommunityPickerOptions {
  communities: UserCommunityMembership[];
  currentCommunityId: string;
  onCommunitySelect: (community: UserCommunityMembership) => void;
  onClose: () => void;
  onPlusButtonClick?: () => void; // Same callback as desktop
  embedContainer?: HTMLElement; // 🎯 Container for boundary-respecting modals
}

export class MobileCommunityPicker {
  private communities: UserCommunityMembership[];
  private currentCommunityId: string;
  private options: MobileCommunityPickerOptions;
  private embedContainer: HTMLElement; // 🎯 Container for boundary-respecting modals
  private element: HTMLElement | null = null;
  private isVisible: boolean = false;

  constructor(options: MobileCommunityPickerOptions) {
    this.communities = options.communities;
    this.currentCommunityId = options.currentCommunityId;
    this.options = options;
    this.embedContainer = options.embedContainer || document.body; // 🎯 Fallback to document.body for backward compatibility
  }

  show(): void {
    if (this.isVisible) return;
    
    this.isVisible = true;
    const modal = this.render();
    this.embedContainer.appendChild(modal); // 🎯 Respect embed boundaries - no more hijacking!
    
    // Trigger animation after DOM insertion
    requestAnimationFrame(() => {
      modal.classList.add('mobile-community-picker-visible');
    });
  }

  hide(): void {
    if (!this.isVisible || !this.element) return;
    
    this.isVisible = false;
    this.element.classList.remove('mobile-community-picker-visible');
    
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
    modal.className = 'mobile-community-picker-overlay';
    
    // Backdrop - clicking dismisses modal
    const backdrop = document.createElement('div');
    backdrop.className = 'mobile-community-picker-backdrop';
    backdrop.addEventListener('click', () => {
      this.options.onClose();
    });
    
    // Modal content
    const content = document.createElement('div');
    content.className = 'mobile-community-picker-content';
    
    // Prevent content clicks from dismissing modal
    content.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Header with title and close button
    const header = this.renderHeader();
    content.appendChild(header);
    
    // Communities grid
    const grid = this.renderCommunitiesGrid();
    content.appendChild(grid);
    
    // Plus button for discovery
    const plusSection = this.renderPlusButton();
    content.appendChild(plusSection);
    
    modal.appendChild(backdrop);
    modal.appendChild(content);
    
    this.element = modal;
    return modal;
  }

  private renderHeader(): HTMLElement {
    const header = document.createElement('div');
    header.className = 'mobile-community-picker-header';
    
    const title = document.createElement('h2');
    title.className = 'mobile-community-picker-title';
    title.textContent = 'Choose Community';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'mobile-community-picker-close';
    closeButton.innerHTML = getIconHTML('chevronDown', { size: 24 }); // Beautiful Lucide chevron down
    closeButton.addEventListener('click', () => {
      this.options.onClose();
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    return header;
  }

  private renderCommunitiesGrid(): HTMLElement {
    const gridContainer = document.createElement('div');
    gridContainer.className = 'mobile-community-picker-grid-container';
    
    const grid = document.createElement('div');
    grid.className = 'mobile-community-picker-grid';
    
    this.communities.forEach(community => {
      const item = this.renderCommunityItem(community);
      grid.appendChild(item);
    });
    
    gridContainer.appendChild(grid);
    return gridContainer;
  }

  private renderCommunityItem(community: UserCommunityMembership): HTMLElement {
    const item = document.createElement('div');
    item.className = 'mobile-community-picker-item';
    
    if (community.id === this.currentCommunityId) {
      item.classList.add('active');
    }
    
    // Community icon (larger for touch)
    const icon = document.createElement('div');
    icon.className = 'mobile-community-picker-icon';
    
    if (community.logoUrl) {
      const img = document.createElement('img');
      img.src = community.logoUrl;
      img.alt = community.name;
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: inherit;
      `;
      icon.appendChild(img);
    } else {
      // Gradient fallback
      const gradientClass = getGradientClass(community.name);
      icon.style.background = getGradientStyle(gradientClass);
      
      const iconSpan = document.createElement('span');
      iconSpan.textContent = getIconForCommunity(community.name);
      iconSpan.style.cssText = `
        color: white;
        font-size: 24px;
        font-weight: 600;
      `;
      icon.appendChild(iconSpan);
    }
    
    // Community name
    const name = document.createElement('div');
    name.className = 'mobile-community-picker-name';
    name.textContent = community.name;
    
    item.appendChild(icon);
    item.appendChild(name);
    
    // Click handler
    item.addEventListener('click', () => {
      this.options.onCommunitySelect(community);
    });
    
    return item;
  }

  private renderPlusButton(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'mobile-community-picker-plus-section';
    
    const plusButton = document.createElement('div');
    plusButton.className = 'mobile-community-picker-plus';
    
    const plusIcon = document.createElement('div');
    plusIcon.className = 'mobile-community-picker-plus-icon';
    plusIcon.textContent = '+';
    
    const plusText = document.createElement('div');
    plusText.className = 'mobile-community-picker-plus-text';
    plusText.textContent = 'Discover Communities';
    
    plusButton.appendChild(plusIcon);
    plusButton.appendChild(plusText);
    
    // Click handler (same as desktop)
    plusButton.addEventListener('click', () => {
      console.log('[MobileCommunityPicker] Plus button clicked - community discovery');
      if (this.options.onPlusButtonClick) {
        this.options.onPlusButtonClick();
      }
    });
    
    section.appendChild(plusButton);
    return section;
  }

  /**
   * Update communities and current selection
   */
  updateCommunities(communities: UserCommunityMembership[], currentCommunityId: string): void {
    this.communities = communities;
    this.currentCommunityId = currentCommunityId;
    
    // Re-render if modal is visible
    if (this.isVisible && this.element) {
      const gridContainer = this.element.querySelector('.mobile-community-picker-grid-container');
      if (gridContainer) {
        const newGrid = this.renderCommunitiesGrid();
        gridContainer.replaceWith(newGrid);
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