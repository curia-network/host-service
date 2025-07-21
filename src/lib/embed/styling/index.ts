/**
 * Main styling module for Curia embed components
 * Handles CSS injection and provides utility functions
 */

export * from './utils';

/**
 * Get all CSS content as a string
 * This will be replaced with actual CSS content when we update the plugin host
 */
function getCSSContent(): string {
  // For now, return empty string - we'll inject this inline in the refactored component
  // TODO: Replace with actual CSS bundling when we have proper build setup
  return '';
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