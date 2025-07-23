/**
 * Responsive utilities for mobile/desktop detection
 */

export function isMobileViewport(): boolean {
  return window.innerWidth < 768;
}

export function isDesktopViewport(): boolean {
  return window.innerWidth >= 768;
}

export function addResizeListener(callback: (isMobile: boolean) => void): () => void {
  const handler = () => callback(isMobileViewport());
  window.addEventListener('resize', handler);
  
  // Return cleanup function
  return () => window.removeEventListener('resize', handler);
}

// Breakpoint constants
export const MOBILE_BREAKPOINT = 768; // px
export const DESKTOP_MIN_WIDTH = 768; // px 