'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from "@/contexts/ThemeContext";

interface ConditionalThemeProviderProps {
  children: React.ReactNode;
}

export function ConditionalThemeProvider({ children }: ConditionalThemeProviderProps) {
  const pathname = usePathname();
  
  // Skip ThemeProvider for embed routes to prevent dual provider conflict
  // EmbedThemeProvider will handle theming exclusively for embed pages
  if (pathname === '/embed') {
    return <>{children}</>;
  }
  
  // Apply main app ThemeProvider for all other routes
  return (
    <ThemeProvider
      defaultTheme="system"
      enableSystem
      attribute="class"
    >
      {children}
    </ThemeProvider>
  );
} 