/**
 * Embed Theme Provider - Dedicated theme provider for embed pages
 * 
 * Applies theme directly from URL parameters without localStorage pollution
 * or conflicts with the main app theme system. Theme is locked to URL param
 * and cannot be overridden by user preferences.
 */

'use client';

import React, { useEffect } from 'react';

interface EmbedThemeProviderProps {
  children: React.ReactNode;
  theme: 'light' | 'dark' | 'auto';
}

export function EmbedThemeProvider({ children, theme }: EmbedThemeProviderProps) {
  useEffect(() => {
    // Resolve theme based on URL parameter
    const resolvedTheme = theme === 'auto' ? 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
      theme;
    
    console.log('[EmbedThemeProvider] Applying theme:', { 
      requested: theme, 
      resolved: resolvedTheme,
      systemIsDark: window.matchMedia('(prefers-color-scheme: dark)').matches 
    });
    
    // Apply theme to document - BOTH CSS classes AND data attributes for full compatibility
    // Remove existing theme classes and attributes
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.removeAttribute('data-theme');
    
    // Set new theme via CSS class (for .dark/.light selectors)
    document.documentElement.classList.add(resolvedTheme);
    
    // Set new theme via data attribute (for [data-theme="dark"] selectors)
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    
    console.log('[EmbedThemeProvider] Theme applied successfully:', {
      classList: document.documentElement.classList.toString(),
      dataTheme: document.documentElement.getAttribute('data-theme')
    });
    
    // Cleanup function to restore original theme when component unmounts
    return () => {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.removeAttribute('data-theme');
      console.log('[EmbedThemeProvider] Theme cleaned up on unmount');
    };
  }, [theme]);

  return <>{children}</>;
} 