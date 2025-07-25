/**
 * Embed Script Entry Point
 * 
 * This is the main entry point for the embed.js bundle.
 * It imports the actual TypeScript classes and creates a self-contained script.
 */

import { EmbedConfig } from './types/EmbedTypes';
import { parseEmbedConfig } from './core/EmbedConfig';
import { InternalPluginHost } from './plugin-host/InternalPluginHost';

// Use global interface from EmbedTypes (avoids circular import issues)
// window.curiaEmbed will be InternalPluginHost but typed as any

// Get environment values (injected at build time via esbuild define)
declare const CURIA_HOST_URL: string;
declare const CURIA_FORUM_URL: string;
declare const CURIA_PUBLIC_KEY: string;

// Capture script element during initial execution when document.currentScript works
const EMBED_SCRIPT_ELEMENT = document.currentScript as HTMLScriptElement;

// Validate that we have the script element
if (!EMBED_SCRIPT_ELEMENT) {
  console.error('[Embed] Failed to capture script element during initialization');
}

/**
 * Extract curia_* parameters from parent page URL
 * Converts curia_highlight=comment-123 to ext_highlight=comment-123
 */
function extractCuriaParameters(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const curiaParams: Record<string, string> = {};
  
  console.log('[Embed] Checking parent page URL for curia_* parameters:', window.location.search);
  
  for (const [key, value] of params) {
    if (key.startsWith('curia_')) {
      const cleanKey = key.substring(6); // Remove 'curia_' prefix
      const externalKey = `ext_${cleanKey}`; // Add 'ext_' prefix
      curiaParams[externalKey] = value;
      console.log(`[Embed] Found curia parameter: ${key}=${value} → ${externalKey}=${value}`);
    }
  }
  
  return curiaParams;
}

/**
 * Strip curia_* parameters from parent page URL
 * Preserves all other query parameters but removes our internal curia_* params
 */
function stripCuriaParameters(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Collect all curia_* parameter keys to delete
    const keysToDelete: string[] = [];
    for (const [key] of urlObj.searchParams) {
      if (key.startsWith('curia_')) {
        keysToDelete.push(key);
      }
    }
    
    // Delete all curia_* parameters
    for (const key of keysToDelete) {
      urlObj.searchParams.delete(key);
    }
    
    if (keysToDelete.length > 0) {
      console.log('[Embed] Stripped curia_* parameters:', keysToDelete);
    }
    
    return urlObj.toString();
  } catch (error) {
    console.warn('[Embed] Failed to parse parent URL, using original:', url);
    return url;
  }
}

// Main embed initialization function
function initializeEmbed() {
  console.log('[Embed] Initializing Curia embed script...');

  try {
    // Capture parent page URL and strip curia_* parameters to prevent recursion
    const rawParentUrl = window.location.href;
    const parentUrl = stripCuriaParameters(rawParentUrl);
    console.log('[Embed] Raw parent page URL:', rawParentUrl);
    console.log('[Embed] Clean parent page URL (curia_* stripped):', parentUrl);
    
    // Extract external parameters from parent page URL
    const externalParams = extractCuriaParameters();
    
    // Parse configuration from script attributes using captured script element
    // If capture failed, parseEmbedConfig will try document.currentScript as fallback
    const config = parseEmbedConfig(EMBED_SCRIPT_ELEMENT);
    
    // Add parent URL to config
    config.parentUrl = parentUrl;
    
    // Add external parameters to config
    if (Object.keys(externalParams).length > 0) {
      config.externalParams = externalParams;
      console.log('[Embed] External parameters added to config:', externalParams);
    }
    
    console.log('[Embed] Final parsed config:', config);

    // Find or create target container
    const containerId = config.container || 'curia-forum';
    let container = document.getElementById(containerId);
    
    if (!container) {
      console.log(`[Embed] Container "${containerId}" not found, creating it`);
      container = document.createElement('div');
      container.id = containerId;
      
      // Try to insert next to script element, otherwise append to body
      if (EMBED_SCRIPT_ELEMENT?.parentNode) {
        EMBED_SCRIPT_ELEMENT.parentNode.insertBefore(container, EMBED_SCRIPT_ELEMENT.nextSibling);
      } else {
        console.warn('[Embed] No script element available, appending container to body');
        document.body.appendChild(container);
      }
    }

    // Clean up any existing embed instance
    if (window.curiaEmbed) {
      console.log('[Embed] Cleaning up existing embed instance');
      window.curiaEmbed.destroy();
      delete window.curiaEmbed;
    }

    // Create new embed instance using the real TypeScript class
    console.log('[Embed] Creating InternalPluginHost instance');
    const embedInstance = new InternalPluginHost(
      container,
      config,
      CURIA_HOST_URL,
      CURIA_FORUM_URL,
      CURIA_PUBLIC_KEY
    );

    // Store global reference for cleanup
    window.curiaEmbed = embedInstance;
    
    console.log('[Embed] Embed initialized successfully');
    
  } catch (error) {
    console.error('[Embed] Failed to initialize embed:', error);
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEmbed);
} else {
  // DOM already loaded, initialize immediately
  initializeEmbed();
} 