/**
 * Safe Theme Hook - Works with or without ThemeProvider
 * 
 * In embed context: Falls back to detecting theme from document element
 * In main app context: Uses the ThemeProvider normally
 */

import { useTheme } from '@/contexts/ThemeContext';

interface SafeThemeResult {
  resolvedTheme: 'light' | 'dark';
  setTheme?: (theme: 'light' | 'dark' | 'system') => void;
}

export function useSafeTheme(): SafeThemeResult {
  try {
    // Try to use the main ThemeProvider
    const { resolvedTheme, setTheme } = useTheme();
    return { resolvedTheme, setTheme };
  } catch (error) {
    // If ThemeProvider is not available (embed context), detect theme from document
    const detectThemeFromDocument = (): 'light' | 'dark' => {
      // Check for CSS class first (set by EmbedThemeProvider)
      if (document.documentElement.classList.contains('dark')) {
        return 'dark';
      }
      if (document.documentElement.classList.contains('light')) {
        return 'light';
      }
      
      // Check for data attribute (set by EmbedThemeProvider)
      const dataTheme = document.documentElement.getAttribute('data-theme');
      if (dataTheme === 'dark' || dataTheme === 'light') {
        return dataTheme;
      }
      
      // Final fallback: detect system preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      // Ultimate fallback
      return 'light';
    };

    return {
      resolvedTheme: detectThemeFromDocument(),
      // No setTheme in embed context - theme is controlled by EmbedThemeProvider
    };
  }
} 