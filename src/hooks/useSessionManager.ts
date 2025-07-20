/**
 * React hooks for Curia session management
 * 
 * Provides reactive session state that automatically updates when sessions change.
 * Replaces scattered localStorage usage with a clean, centralized API.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { sessionManager, SessionData, SessionChangeListener } from '../lib/SessionManager';

// ============================================================================
// CORE HOOK TYPES
// ============================================================================

export interface SessionState {
  // Current active session
  activeSession: SessionData | null;
  activeToken: string | null;
  isAuthenticated: boolean;
  
  // All sessions
  allSessions: SessionData[];
  sessionCount: number;
  
  // Convenience getters
  ensSession: SessionData | null;
  upSession: SessionData | null;
  anonymousSession: SessionData | null;
  
  // Loading states
  isLoading: boolean;
  isSyncing: boolean;
}

export interface SessionActions {
  // Session management
  addSession: (sessionData: Omit<SessionData, 'lastAccessedAt'>) => Promise<void>;
  removeSession: (sessionToken: string) => Promise<void>;
  switchToSession: (sessionToken: string) => Promise<void>;
  
  // Logout actions
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  
  // Database sync
  syncSessions: () => Promise<void>;
  
  // Convenience actions
  handleTokenRotation: (newToken: string, sessionData: Partial<SessionData>) => Promise<void>;
}

export interface UseSessionManagerReturn extends SessionState, SessionActions {}

// ============================================================================
// MAIN SESSION MANAGER HOOK
// ============================================================================

/**
 * Main session management hook with full functionality
 */
export function useSessionManager(): UseSessionManagerReturn {
  // ===== STATE =====
  
  const [allSessions, setAllSessions] = useState<SessionData[]>([]);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // ===== DERIVED STATE =====
  
  const sessionState = useMemo((): SessionState => {
    const ensSession = allSessions.find(s => s.identityType === 'ens') || null;
    const upSession = allSessions.find(s => s.identityType === 'universal_profile') || null;
    const anonymousSession = allSessions.find(s => s.identityType === 'anonymous') || null;

    return {
      activeSession,
      activeToken,
      isAuthenticated: activeSession !== null,
      allSessions,
      sessionCount: allSessions.length,
      ensSession,
      upSession,
      anonymousSession,
      isLoading,
      isSyncing,
    };
  }, [allSessions, activeToken, activeSession, isLoading, isSyncing]);

  // ===== SESSION LISTENER =====
  
  useEffect(() => {
    const handleSessionChange: SessionChangeListener = (sessions, token, session) => {
      setAllSessions(sessions);
      setActiveToken(token);
      setActiveSession(session);
      setIsLoading(false);
    };

    // Subscribe to session changes
    const unsubscribe = sessionManager.subscribe(handleSessionChange);
    
    return unsubscribe;
  }, []);

  // ===== ACTIONS =====
  
  const addSession = useCallback(async (sessionData: Omit<SessionData, 'lastAccessedAt'>) => {
    try {
      setIsLoading(true);
      await sessionManager.addSession(sessionData);
    } catch (error) {
      console.error('[useSessionManager] Failed to add session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeSession = useCallback(async (sessionToken: string) => {
    try {
      setIsLoading(true);
      await sessionManager.removeSession(sessionToken);
    } catch (error) {
      console.error('[useSessionManager] Failed to remove session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const switchToSession = useCallback(async (sessionToken: string) => {
    try {
      setIsLoading(true);
      await sessionManager.setActiveSession(sessionToken);
    } catch (error) {
      console.error('[useSessionManager] Failed to switch session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await sessionManager.removeActiveSession();
    } catch (error) {
      console.error('[useSessionManager] Failed to logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      setIsLoading(true);
      await sessionManager.clearAllSessions();
    } catch (error) {
      console.error('[useSessionManager] Failed to logout all:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncSessions = useCallback(async () => {
    try {
      setIsSyncing(true);
      await sessionManager.syncWithDatabase();
    } catch (error) {
      console.error('[useSessionManager] Failed to sync sessions:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleTokenRotation = useCallback(async (
    newToken: string, 
    sessionData: Partial<SessionData> = {}
  ) => {
    try {
      setIsLoading(true);
      
      // Get current session to update
      const currentSession = sessionManager.getActiveSession();
      if (!currentSession) {
        throw new Error('No active session to rotate token for');
      }

      // Remove old session
      await sessionManager.removeSession(currentSession.sessionToken);
      
      // Add new session with updated token
      await sessionManager.addSession({
        ...currentSession,
        ...sessionData,
        sessionToken: newToken,
      });

      console.log('[useSessionManager] Token rotation completed:', newToken.substring(0, 10) + '...');
    } catch (error) {
      console.error('[useSessionManager] Token rotation failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ===== RETURN COMBINED STATE & ACTIONS =====
  
  return {
    ...sessionState,
    addSession,
    removeSession,
    switchToSession,
    logout,
    logoutAll,
    syncSessions,
    handleTokenRotation,
  };
}

// ============================================================================
// SIMPLIFIED AUTH HOOK (BACKWARD COMPATIBILITY)
// ============================================================================

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  activeSession: SessionData | null;
  isLoading: boolean;
}

export interface AuthActions {
  setToken: (sessionData: Omit<SessionData, 'lastAccessedAt'>) => Promise<void>;
  clearToken: () => Promise<void>;
  handleTokenRotation: (newToken: string) => Promise<void>;
}

export interface UseAuthReturn extends AuthState, AuthActions {}

/**
 * Simplified auth hook for components that just need basic authentication state
 * Provides backward compatibility with existing useAuth usage patterns
 */
export function useAuth(): UseAuthReturn {
  const {
    isAuthenticated,
    activeToken,
    activeSession,
    isLoading,
    addSession,
    logout,
    handleTokenRotation,
  } = useSessionManager();

  const setToken = useCallback(async (sessionData: Omit<SessionData, 'lastAccessedAt'>) => {
    await addSession(sessionData);
  }, [addSession]);

  const clearToken = useCallback(async () => {
    await logout();
  }, [logout]);

  const handleTokenRotationSimple = useCallback(async (newToken: string) => {
    if (!activeSession) {
      throw new Error('No active session for token rotation');
    }
    
    await handleTokenRotation(newToken, {
      sessionToken: newToken,
    });
  }, [activeSession, handleTokenRotation]);

  return {
    isAuthenticated,
    token: activeToken,
    activeSession,
    isLoading,
    setToken,
    clearToken,
    handleTokenRotation: handleTokenRotationSimple,
  };
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook for getting sessions by identity type
 */
export function useSessionsByType(type: 'ens' | 'universal_profile' | 'anonymous') {
  const { allSessions } = useSessionManager();
  
  const sessionsByType = useMemo(() => {
    return allSessions.filter(session => session.identityType === type);
  }, [allSessions, type]);

  const hasSessionOfType = sessionsByType.length > 0;
  const activeSessionOfType = sessionsByType.find(s => 
    sessionManager.getActiveToken() === s.sessionToken
  ) || null;

  return {
    sessions: sessionsByType,
    hasSession: hasSessionOfType,
    activeSession: activeSessionOfType,
    count: sessionsByType.length,
  };
}

/**
 * Hook for multi-account switching functionality
 */
export function useAccountSwitcher() {
  const {
    allSessions,
    activeSession,
    switchToSession,
    removeSession,
    isLoading,
  } = useSessionManager();

  const switchToAccount = useCallback(async (sessionToken: string) => {
    if (sessionToken === activeSession?.sessionToken) {
      console.log('[useAccountSwitcher] Already on this account');
      return;
    }
    
    await switchToSession(sessionToken);
  }, [activeSession?.sessionToken, switchToSession]);

  const removeAccount = useCallback(async (sessionToken: string) => {
    await removeSession(sessionToken);
  }, [removeSession]);

  const accountOptions = useMemo(() => {
    return allSessions.map(session => ({
      sessionToken: session.sessionToken,
      identityType: session.identityType,
      displayName: getSessionDisplayName(session),
      isActive: session.sessionToken === activeSession?.sessionToken,
      walletAddress: session.walletAddress,
      ensName: session.ensName,
      upAddress: session.upAddress,
    }));
  }, [allSessions, activeSession?.sessionToken]);

  return {
    accountOptions,
    activeAccount: activeSession,
    switchToAccount,
    removeAccount,
    isLoading,
    hasMultipleAccounts: allSessions.length > 1,
  };
}

/**
 * Hook for session synchronization status
 */
export function useSessionSync() {
  const { isSyncing, syncSessions } = useSessionManager();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const sync = useCallback(async () => {
    try {
      setSyncError(null);
      await syncSessions();
      setLastSyncTime(new Date());
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
      throw error;
    }
  }, [syncSessions]);

  return {
    isSyncing,
    lastSyncTime,
    syncError,
    sync,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getSessionDisplayName(session: SessionData): string {
  if (session.name) {
    return session.name;
  }
  
  switch (session.identityType) {
    case 'ens':
      return session.ensName || `ENS ${session.walletAddress?.slice(-6)}`;
    case 'universal_profile':
      return `UP ${session.upAddress?.slice(-6)}`;
    case 'anonymous':
      return `Anonymous ${session.sessionToken.slice(-6)}`;
    default:
      return 'Unknown Account';
  }
}

// ============================================================================
// LEGACY EXPORTS (FOR MIGRATION COMPATIBILITY)
// ============================================================================

/**
 * @deprecated Use useAuth() instead
 */
export const useAuthLegacy = useAuth;

/**
 * @deprecated Use useSessionManager() instead
 */
export const useSession = useSessionManager; 