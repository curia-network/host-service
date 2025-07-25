/**
 * AuthCompleteStep - Enhanced "Entering Community" Experience
 * 
 * This step appears after the user has completed authentication and community selection.
 * It shows an engaging "Entering [Community Name]" message with community branding
 * before the parent switches the iframe to the forum.
 */

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AuthCompleteStepProps } from '@/types/embed';
import { cn } from '@/lib/utils';

export const AuthCompleteStep: React.FC<AuthCompleteStepProps> = ({ 
  config, 
  profileData,
  communityId,
  selectedCommunity
}) => {
  // Auto-resize iframe for this step
  useEffect(() => {
    const message = {
      type: 'curia-resize',
      height: 400
    };
    
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, '*');
    }
  }, []);

  // If we have community data, show the enhanced "Entering Community" experience
  if (selectedCommunity) {
    return (
      <div className="embed-step">
        <Card className="embed-card embed-card--lg">
          <CardHeader className="text-center pb-6">
            {/* Community Logo/Icon */}
            <div className="flex justify-center mb-6">
              <div className={cn("embed-header-icon animate-pulse", selectedCommunity.logoUrl ? "" : selectedCommunity.gradientClass)}>
                {selectedCommunity.logoUrl ? (
                  <img 
                    src={selectedCommunity.logoUrl} 
                    alt={selectedCommunity.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">{selectedCommunity.icon}</span>
                )}
              </div>
            </div>

            {/* Main Title */}
            <CardTitle className="text-2xl embed-gradient-text mb-4">
              Entering {selectedCommunity.name}
            </CardTitle>

            {/* Progress Message */}
            <CardDescription className="text-base mb-6">
              Preparing your community experience...
            </CardDescription>
            
            {/* Enhanced Loading Animation */}
            <div className="flex justify-center">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Fallback: If no community data is available, show a generic loading state
  // This handles edge cases where community data might not be passed through
  return (
    <div className="embed-step">
      <Card className="embed-card embed-card--sm">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            
            {/* Loading Icon */}
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                Almost there!
              </h3>
              <p className="text-sm text-muted-foreground">
                Loading your community forum...
              </p>
            </div>

            {/* Loading Indicator */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 