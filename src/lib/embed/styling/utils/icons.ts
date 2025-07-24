/**
 * Lucide Icons Utility
 * Beautiful, consistent SVG icons for the mobile navigation
 * All icons are 24x24 and support CSS theming via currentColor
 */

export interface IconOptions {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Render an SVG icon with consistent styling
 */
function renderIcon(svgContent: string, options: IconOptions = {}): string {
  const { size = 20, className = '', color = 'currentColor' } = options;
  
  return `<svg 
    width="${size}" 
    height="${size}" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="${color}" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    class="lucide-icon ${className}"
    style="display: inline-block; vertical-align: middle;"
  >${svgContent}</svg>`;
}

/**
 * Mobile Navigation Icons
 */
export const MobileIcons = {
  // Search - magnifying glass
  search: (options?: IconOptions) => renderIcon(
    '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
    options
  ),

  // Messages - message square  
  messages: (options?: IconOptions) => renderIcon(
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    options
  ),

  // Notifications - bell
  notifications: (options?: IconOptions) => renderIcon(
    '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    options
  ),

  // Chevron Down - for collapse
  chevronDown: (options?: IconOptions) => renderIcon(
    '<path d="m6 9 6 6 6-6"/>',
    options
  ),

  // Chevron Up - for expand  
  chevronUp: (options?: IconOptions) => renderIcon(
    '<path d="m18 15-6-6-6 6"/>',
    options
  )
};

/**
 * Get icon HTML string for direct innerHTML usage
 */
export function getIconHTML(iconName: keyof typeof MobileIcons, options?: IconOptions): string {
  return MobileIcons[iconName](options);
}

// ==========================================
// EXISTING COMMUNITY ICON FUNCTIONS
// (Preserving original functionality)
// ==========================================

/**
 * Get emoji icon for community based on name
 */
export function getIconForCommunity(name: string): string {
  // Clean the name for better matching
  const cleanName = name.toLowerCase().trim();
  
  // Direct matches for common terms
  if (cleanName.includes('dev') || cleanName.includes('code') || cleanName.includes('tech')) return '💻';
  if (cleanName.includes('art') || cleanName.includes('design') || cleanName.includes('creative')) return '🎨';
  if (cleanName.includes('music') || cleanName.includes('audio') || cleanName.includes('sound')) return '🎵';
  if (cleanName.includes('game') || cleanName.includes('gaming') || cleanName.includes('play')) return '🎮';
  if (cleanName.includes('book') || cleanName.includes('read') || cleanName.includes('literature')) return '📚';
  if (cleanName.includes('food') || cleanName.includes('cook') || cleanName.includes('recipe')) return '🍽️';
  if (cleanName.includes('travel') || cleanName.includes('explore') || cleanName.includes('adventure')) return '🌍';
  if (cleanName.includes('fitness') || cleanName.includes('gym') || cleanName.includes('workout')) return '💪';
  if (cleanName.includes('photo') || cleanName.includes('camera') || cleanName.includes('picture')) return '📸';
  if (cleanName.includes('film') || cleanName.includes('movie') || cleanName.includes('cinema')) return '🎬';
  if (cleanName.includes('science') || cleanName.includes('research') || cleanName.includes('lab')) return '🔬';
  if (cleanName.includes('crypto') || cleanName.includes('bitcoin') || cleanName.includes('blockchain')) return '₿';
  if (cleanName.includes('nft') || cleanName.includes('collectible') || cleanName.includes('token')) return '🖼️';
  if (cleanName.includes('dao') || cleanName.includes('governance') || cleanName.includes('vote')) return '🏛️';
  if (cleanName.includes('defi') || cleanName.includes('finance') || cleanName.includes('trading')) return '💰';
  
  // Fallback based on first letter hash
  const icons = [
    '🚀', '⭐', '🌟', '✨', '🔥', '⚡', '💎', '🎯',
    '🎪', '🎭', '🎨', '🎵', '🎮', '🏆', '🌈', '🦄',
    '🐉', '🦋', '🌺', '🍀', '🌙', '☀️', '🔮', '💫'
  ];
  
  // Use first character for consistent selection
  const charCode = name.charCodeAt(0) || 0;
  return icons[charCode % icons.length];
}

/**
 * Get user initials from name
 */
export function getUserInitials(name: string): string {
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
 * Identity type icons
 */
export function getIdentityIcon(identityType: string): string {
  const iconMap: Record<string, string> = {
    'ens': '🏷️',
    'universal_profile': '🆔', 
    'anonymous': '👤'
  };
  
  return iconMap[identityType] || '👤';
}

/**
 * All available fallback icons
 */
export const FALLBACK_ICONS = [
  '🚀', '⭐', '🌟', '✨', '🔥', '⚡', '💎', '🎯',
  '🎪', '🎭', '🎨', '🎵', '🎮', '🏆', '🌈', '🦄',
  '🐉', '🦋', '🌺', '🍀', '🌙', '☀️', '🔮', '💫'
] as const;

export type FallbackIcon = typeof FALLBACK_ICONS[number]; 