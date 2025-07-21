/**
 * Gradient utilities for community icons
 * Extracted from InternalPluginHost.ts for better maintainability
 */

/**
 * Get gradient class based on community name
 */
export function getGradientClass(name: string): string {
  // Simple hash function to get consistent gradient based on name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Map to gradient classes (8 beautiful gradients)
  const gradients = [
    'gradient-blue',     // Blue to indigo
    'gradient-purple',   // Purple to pink
    'gradient-green',    // Green to teal
    'gradient-orange',   // Orange to red
    'gradient-cyan',     // Cyan to blue
    'gradient-pink',     // Pink to rose
    'gradient-yellow',   // Yellow to orange
    'gradient-teal'      // Teal to green
  ];

  return gradients[Math.abs(hash) % gradients.length];
}

/**
 * Get CSS gradient style for a gradient class
 */
export function getGradientStyle(gradientClass: string): string {
  const gradientMap: Record<string, string> = {
    'gradient-blue': 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    'gradient-purple': 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    'gradient-green': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    'gradient-orange': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    'gradient-cyan': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    'gradient-pink': 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    'gradient-yellow': 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
    'gradient-teal': 'linear-gradient(135deg, #14b8a6 0%, #10b981 100%)'
  };

  return gradientMap[gradientClass] || gradientMap['gradient-blue'];
}

/**
 * All available gradient classes for reference
 */
export const GRADIENT_CLASSES = [
  'gradient-blue',
  'gradient-purple', 
  'gradient-green',
  'gradient-orange',
  'gradient-cyan',
  'gradient-pink',
  'gradient-yellow',
  'gradient-teal'
] as const;

export type GradientClass = typeof GRADIENT_CLASSES[number]; 