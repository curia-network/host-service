/**
 * useAuth - Clean authentication hook powered by SessionManager
 * 
 * Replaces the old localStorage patching chaos with clean SessionManager delegation.
 * Maintains backward compatibility for existing components.
 */

import { useAuth as useSessionManagerAuth } from './useSessionManager';
import { sessionManager } from '../lib/SessionManager';

// ============================================================================
// MAIN AUTH HOOK (BACKWARD COMPATIBLE)
// ============================================================================

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
}

/**
 * Clean auth hook that delegates to SessionManager
 * Maintains the same API as the old useAuth for backward compatibility
 */
export function useAuth(): AuthState {
  const { isAuthenticated, token } = useSessionManagerAuth();
  
  return {
    isAuthenticated,
    token,
  };
}

// ============================================================================
// IDENTITY VALIDATION (UPDATED FOR SESSIONMANAGER)
// ============================================================================

/**
 * Validate user identity for community creation
 * Updated to use SessionManager instead of direct localStorage access
 */
export async function validateIdentityForCommunityCreation(): Promise<boolean> {
  try {
    const activeSession = sessionManager.getActiveSession();
    if (!activeSession) {
      console.log('[validateIdentityForCommunityCreation] No active session');
      return false;
    }

    // Check if user already has the required identity type
    const hasValidIdentity = activeSession.identityType === 'ens' || activeSession.identityType === 'universal_profile';
    
    if (hasValidIdentity) {
      console.log('[validateIdentityForCommunityCreation] ✅ Valid identity type:', activeSession.identityType);
      return true;
    }

    // If anonymous user, we need to validate with the server
    console.log('[validateIdentityForCommunityCreation] Validating session with server...');
    
    const response = await fetch('/api/auth/validate-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionToken: activeSession.sessionToken }),
    });

    if (!response.ok) {
      console.log('[validateIdentityForCommunityCreation] ❌ Session validation failed');
      return false;
    }

    const data = await response.json();
    
    // Handle token rotation if the server returned a new token
    if (data.token && data.token !== activeSession.sessionToken) {
      console.log('[validateIdentityForCommunityCreation] 🔄 Token rotated, updating session');
      
      try {
        // Update session with new token
        await sessionManager.addSession({
          ...activeSession,
          sessionToken: data.token,
        });
        
        // Remove old session
        await sessionManager.removeSession(activeSession.sessionToken);
      } catch (error) {
        console.error('[validateIdentityForCommunityCreation] Failed to handle token rotation:', error);
        // Continue with validation even if token rotation failed
      }
    }
    
    // Check if the validated user has the required identity type
    const isValidIdentity = data.user.identity_type === 'ens' || data.user.identity_type === 'universal_profile';
    
    if (isValidIdentity) {
      console.log('[validateIdentityForCommunityCreation] ✅ Server confirmed valid identity:', data.user.identity_type);
    } else {
      console.log('[validateIdentityForCommunityCreation] ❌ Invalid identity type:', data.user.identity_type);
    }
    
    return isValidIdentity;
    
  } catch (error) {
    console.error('[validateIdentityForCommunityCreation] Validation error:', error);
    return false;
  }
}

// ============================================================================
// LEGACY COMPATIBILITY HELPERS
// ============================================================================

/**
 * @deprecated This was the old interface. Components should migrate to useAuth() or useSessionManager()
 */
export interface LegacyAuthState {
  isAuthenticated: boolean;
  token: string | null;
}

/**
 * @deprecated Use useAuth() instead. This is kept for any remaining legacy components.
 */
export function useLegacyAuth(): LegacyAuthState {
  return useAuth();
} 