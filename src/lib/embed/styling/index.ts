/**
 * Main styling module for Curia embed components
 * Handles CSS injection and provides utility functions
 */

export * from './utils';

// Import CSS files as text strings (esbuild loader: '.css': 'text')
import stylesCSS from './styles.css';
import sidebarCSS from './sidebar.css';
import previewCSS from './preview.css';
import profileMenuCSS from './profile-menu.css';
import mobileCSS from './mobile.css';
import lightThemeCSS from './themes/light.css';
import darkThemeCSS from './themes/dark.css';

/**
 * Get all CSS content as a string
 */
function getCSSContent(): string {
  // Combine all CSS files in the correct order
  return [
    stylesCSS,      // Main CSS entry point
    sidebarCSS,     // Base sidebar component styles
    previewCSS,     // Community preview styles
    profileMenuCSS, // Profile menu styles
    mobileCSS,      // Mobile responsive styles
    lightThemeCSS,  // Light theme (default)
    darkThemeCSS    // Dark theme overrides
  ].join('\n\n');
}

/**
 * Inject all CSS styles into the document head
 * Should be called once when initializing the embed
 */
export function injectStyles(): void {
  // Check if styles are already injected
  const existingStyles = document.head.querySelector('#curia-embed-styles');
  if (existingStyles) {
    return; // Already injected
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'curia-embed-styles';
  styleElement.textContent = getCSSContent();
  document.head.appendChild(styleElement);
}

/**
 * Remove injected styles from document
 * Useful for cleanup
 */
export function removeStyles(): void {
  const existingStyles = document.head.querySelector('#curia-embed-styles');
  if (existingStyles) {
    existingStyles.remove();
  }
} 