/**
 * SessionCheckStep - Validates existing authentication sessions
 * 
 * Updated to use SessionManager instead of direct localStorage access.
 * Handles token rotation and session cleanup through the centralized system.
 */

import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { SessionCheckStepProps } from '@/types/embed';
import { sessionManager } from '@/lib/SessionManager';

export const SessionCheckStep: React.FC<SessionCheckStepProps> = ({ 
  config,
  onSessionResult 
}) => {
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get active session from SessionManager instead of localStorage
        const activeSession = sessionManager.getActiveSession();
        
        if (!activeSession) {
          console.log('[SessionCheckStep] No active session found');
          onSessionResult(false);
          return;
        }

        console.log('[SessionCheckStep] Checking session:', activeSession.identityType, activeSession.userId);

        // In secure-auth mode, reject anonymous sessions immediately
        if (config.mode === 'secure-auth' && activeSession.identityType === 'anonymous') {
          console.log('[SessionCheckStep] Rejecting anonymous session in secure-auth mode');
          await sessionManager.removeActiveSession();
          onSessionResult(false);
          return;
        }

        // Validate session with server
        const response = await fetch('/api/auth/validate-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken: activeSession.sessionToken })
        });

        if (!response.ok) {
          console.log('[SessionCheckStep] Session validation failed:', response.status);
          await sessionManager.removeActiveSession();
          onSessionResult(false);
          return;
        }

        const data = await response.json();
        
        if (!data.isValid || !data.user) {
          console.log('[SessionCheckStep] Invalid session or missing user data');
          await sessionManager.removeActiveSession();
          onSessionResult(false);
          return;
        }

        // Handle token rotation if server provided a new token
        if (data.token && data.token !== activeSession.sessionToken) {
          console.log('[SessionCheckStep] 🔄 Token rotated, updating session');
          
          try {
            // Add updated session with new token
            await sessionManager.addSession({
              ...activeSession,
              sessionToken: data.token,
              // Update with any additional data from server
              userId: data.user.user_id || activeSession.userId,
              identityType: data.user.identity_type || activeSession.identityType,
              walletAddress: data.user.wallet_address || activeSession.walletAddress,
              ensName: data.user.ens_domain || activeSession.ensName,
              upAddress: data.user.up_address || activeSession.upAddress,
              name: data.user.name || activeSession.name,
              profileImageUrl: data.user.profile_picture_url || activeSession.profileImageUrl,
            });

            // Remove old session
            await sessionManager.removeSession(activeSession.sessionToken);
            
            console.log('[SessionCheckStep] ✅ Token rotation completed');
          } catch (error) {
            console.error('[SessionCheckStep] Token rotation failed:', error);
            // Continue with validation even if rotation failed
          }
        }

        // Double-check secure-auth mode after potential session updates
        if (config.mode === 'secure-auth' && data.user.identity_type === 'anonymous') {
          console.log('[SessionCheckStep] Server returned anonymous user in secure-auth mode, removing session');
          await sessionManager.removeActiveSession();
          onSessionResult(false);
          return;
        }

        console.log('[SessionCheckStep] ✅ Session validated successfully:', data.user.identity_type);
        
        // Pass both session validity AND user data
        onSessionResult(true, data.user);
        
      } catch (error) {
        console.error('[SessionCheckStep] Session check error:', error);
        
        // Clean up session on error
        try {
          await sessionManager.removeActiveSession();
        } catch (cleanupError) {
          console.error('[SessionCheckStep] Failed to cleanup session after error:', cleanupError);
        }
        
        onSessionResult(false);
      }
    };

    // Small delay to allow SessionManager to initialize
    const timer = setTimeout(checkSession, 500);
    return () => clearTimeout(timer);
  }, [config.mode, onSessionResult]);

  return (
    <div className="embed-step">
      <Card className="embed-card embed-card--sm">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="relative">
              <Shield className="w-16 h-16 mx-auto text-blue-600 animate-pulse" />
              <div className="pulse-ring w-16 h-16 mx-auto border-blue-300"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Checking Authentication</h3>
              <p className="text-sm text-muted-foreground">Verifying your session...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 