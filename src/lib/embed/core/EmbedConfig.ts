/**
 * Embed Configuration Module
 * 
 * Handles parsing configuration from script data attributes
 */

import { EmbedConfig } from '../types/EmbedTypes';

/**
 * Parse configuration from script data attributes
 */
export function parseEmbedConfig(scriptElement?: HTMLScriptElement): EmbedConfig {
  // Get the script element - either passed in or from document.currentScript
  const script = scriptElement || (document.currentScript as HTMLScriptElement);
  if (!script) {
    throw new Error('[Curia] Could not find script element');
  }

  // Read configuration from data attributes
  const config: EmbedConfig = {
    community: script.getAttribute('data-community') || null,
    theme: (script.getAttribute('data-theme') as 'light' | 'dark' | 'auto') || 'light',
    backgroundColor: script.getAttribute('data-background-color') || undefined,
    borderRadius: script.getAttribute('data-border-radius') || undefined,
    container: script.getAttribute('data-container') || null,
    height: script.getAttribute('data-height') || '600px',
    width: script.getAttribute('data-width') || '100%',
    mode: (script.getAttribute('data-mode') as 'full' | 'auth-only') || 'full'
  };

  console.log('[Curia] Parsed embed config:', config);
  return config;
}

/**
 * Validate embed configuration
 */
export function validateEmbedConfig(config: EmbedConfig): void {
  // Validate theme
  if (config.theme !== 'light' && config.theme !== 'dark' && config.theme !== 'auto') {
    console.warn('[Curia] Invalid theme, using light:', config.theme);
    config.theme = 'light';
  }

  // Validate background color (if provided)
  if (config.backgroundColor && !config.backgroundColor.match(/^#[0-9A-Fa-f]{6}$/)) {
    console.warn('[Curia] Invalid background color format, removing:', config.backgroundColor);
    config.backgroundColor = undefined;
  }

  // Validate height format
  if (config.height && !config.height.match(/^\d+(px|%|vh|em|rem)$/)) {
    console.warn('[Curia] Invalid height format, using 600px:', config.height);
    config.height = '600px';
  }

  // Validate width format
  if (config.width && !config.width.match(/^\d+(px|%|vw|em|rem)$/)) {
    console.warn('[Curia] Invalid width format, using 100%:', config.width);
    config.width = '100%';
  }
}

/**
 * Generate embed script configuration JavaScript
 */
export function generateConfigCode(config: EmbedConfig): string {
  return `
  // Get the script element that loaded this code
  const script = document.currentScript;
  if (!script) {
    console.error('[Curia] Could not find script element');
    return;
  }

  // Read configuration from data attributes
  const config = {
    community: script.getAttribute('data-community') || null,
    theme: script.getAttribute('data-theme') || 'light',
    backgroundColor: script.getAttribute('data-background-color') || undefined,
    borderRadius: script.getAttribute('data-border-radius') || undefined,
    container: script.getAttribute('data-container') || null,
    height: script.getAttribute('data-height') || '600px',
    width: script.getAttribute('data-width') || '100%'
  };

  console.log('[Curia] Initializing embed with config:', config);
  `;
} 