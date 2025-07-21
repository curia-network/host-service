/**
 * CommunityPreview Component
 * Handles hover preview cards for community items
 * 
 * Extracted from InternalPluginHost.ts for better maintainability
 * Uses portal pattern for document-level rendering to avoid z-index issues
 */

import { getGradientClass, getGradientStyle, getIconForCommunity } from '../../styling';
import { UserCommunityMembership } from './CommunityItem';

export class CommunityPreview {
  private community: UserCommunityMembership;
  private triggerElement: HTMLElement;
  private previewElement: HTMLElement | null = null;

  constructor(community: UserCommunityMembership, triggerElement: HTMLElement) {
    this.community = community;
    this.triggerElement = triggerElement;
  }

  show(): HTMLElement {
    const preview = document.createElement('div');
    preview.className = 'community-preview';
    
    // Position the preview card relative to trigger element
    this.positionPreview(preview);
    
    // Generate same visual styling as the main icon
    const gradientClass = getGradientClass(this.community.name);
    const icon = getIconForCommunity(this.community.name);
    
    preview.innerHTML = `
      <div class="community-preview-header">
        <div class="community-preview-icon" style="background: ${getGradientStyle(gradientClass)}">
          ${this.community.logoUrl ? 
            `<img src="${this.community.logoUrl}" alt="${this.community.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">` :
            `<span style="font-size: 18px;">${icon}</span>`
          }
        </div>
        <div class="community-preview-info">
          <h4>${this.community.name}</h4>
          <p>Role: ${this.formatRole(this.community.userRole)}</p>
        </div>
      </div>
      
      <div class="community-preview-stats">
        <div class="community-preview-stat">
          <span>👥</span>
          <span>Community</span>
        </div>
        <div class="community-preview-stat">
          <span>✨</span>
          <span>${this.community.isMember ? 'Member' : 'Visitor'}</span>
        </div>
      </div>
    `;

    // Portal pattern - append to document.body to escape stacking context
    document.body.appendChild(preview);
    
    // Trigger animation
    requestAnimationFrame(() => {
      preview.classList.add('show');
    });

    this.previewElement = preview;
    return preview;
  }

  hide(): void {
    if (this.previewElement) {
      this.previewElement.classList.remove('show');
      
      // Clean up after animation
      setTimeout(() => {
        if (this.previewElement && document.body.contains(this.previewElement)) {
          document.body.removeChild(this.previewElement);
        }
        this.previewElement = null;
      }, 200);
    }
  }

  private positionPreview(preview: HTMLElement): void {
    // Get absolute position of trigger button
    const rect = this.triggerElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const previewWidth = 280; // max-width from CSS
    const spacing = 16; // spacing from trigger

    // Position preview to the right of trigger with some spacing
    let left = rect.right + spacing;
    let top = rect.top;

    // Adjust if preview would go off-screen horizontally
    if (left + previewWidth > viewportWidth - spacing) {
      // Position to the left of trigger instead
      left = rect.left - previewWidth - spacing;
    }

    // Adjust if preview would go off-screen vertically
    const previewHeight = 120; // estimated height
    if (top + previewHeight > viewportHeight - spacing) {
      top = viewportHeight - previewHeight - spacing;
    }

    // Ensure preview doesn't go above viewport
    if (top < spacing) {
      top = spacing;
    }

    preview.style.left = `${Math.max(spacing, left)}px`;
    preview.style.top = `${Math.max(spacing, top)}px`;
  }

  private formatRole(role: string): string {
    switch (role) {
      case 'owner': return '👑 Owner';
      case 'admin': return '⚡ Admin';
      case 'moderator': return '🛡️ Moderator';
      case 'member': return '👤 Member';
      default: return '👤 Member';
    }
  }
}

/**
 * Preview Manager - Handles global preview state
 * Ensures only one preview is shown at a time
 */
export class CommunityPreviewManager {
  private static instance: CommunityPreviewManager;
  private currentPreview: CommunityPreview | null = null;

  static getInstance(): CommunityPreviewManager {
    if (!CommunityPreviewManager.instance) {
      CommunityPreviewManager.instance = new CommunityPreviewManager();
    }
    return CommunityPreviewManager.instance;
  }

  showPreview(community: UserCommunityMembership, triggerElement: HTMLElement): void {
    // Hide any existing preview
    this.hidePreview();

    // Create and show new preview
    this.currentPreview = new CommunityPreview(community, triggerElement);
    this.currentPreview.show();
  }

  hidePreview(): void {
    if (this.currentPreview) {
      this.currentPreview.hide();
      this.currentPreview = null;
    }
  }
} 