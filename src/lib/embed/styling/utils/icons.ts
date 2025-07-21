/**
 * Icon utilities for community representations
 * Extracted from InternalPluginHost.ts for better maintainability
 */

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