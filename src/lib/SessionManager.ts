/**
 * SessionManager - Centralized session management for Curia
 * 
 * Replaces scattered localStorage usage with a unified system that supports:
 * - Multi-account sessions (ENS, Universal Profile, Anonymous)
 * - Database-backed session persistence
 * - Cross-tab synchronization
 * - Automatic token rotation handling
 * - Bulletproof error recovery
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SessionData {
  sessionToken: string;
  userId: string;
  identityType: 'ens' | 'universal_profile' | 'anonymous';
  walletAddress?: string;
  ensName?: string;
  upAddress?: string;
  name?: string;
  profileImageUrl?: string;
  expiresAt: Date;
  lastAccessedAt: Date;
  isActive: boolean;
}

export interface SessionStorage {
  activeSessions: SessionData[];
  activeSessionToken: string | null;
  lastSyncedAt: number;
  version: number; // For migration handling
}

export type SessionChangeListener = (
  sessions: SessionData[], 
  activeToken: string | null,
  activeSession: SessionData | null
) => void;

// ============================================================================
// CORE SESSION MANAGER CLASS
// ============================================================================

export class SessionManager {
  private static instance: SessionManager;
  private static readonly STORAGE_KEY = 'curia_sessions';
  private static readonly LEGACY_TOKEN_KEY = 'curia_session_token';
  private static readonly STORAGE_VERSION = 1;
  private static readonly SYNC_INTERVAL = 30_000; // 30 seconds
  
  private storage: SessionStorage;
  private listeners: Set<SessionChangeListener> = new Set();
  private syncInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  private constructor() {
    this.storage = this.loadFromStorage();
    this.setupStorageListener();
    this.setupPeriodicSync();
    this.migrateLegacySession();
    this.isInitialized = true;
    
    console.log('[SessionManager] Initialized with', this.storage.activeSessions.length, 'sessions');
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // ============================================================================
  // CORE SESSION OPERATIONS
  // ============================================================================

  /**
   * Add a new session to the manager
   */
  public async addSession(sessionData: Omit<SessionData, 'lastAccessedAt'>): Promise<void> {
    try {
      const session: SessionData = {
        ...sessionData,
        lastAccessedAt: new Date(),
        expiresAt: new Date(sessionData.expiresAt),
      };

      if (!this.validateSession(session)) {
        throw new Error('Invalid session data provided');
      }

      // Remove existing session with same token (if any)
      this.storage.activeSessions = this.storage.activeSessions.filter(
        s => s.sessionToken !== session.sessionToken
      );

      // Add new session
      this.storage.activeSessions.push(session);

      // Set as active if it's the first session
      if (!this.storage.activeSessionToken) {
        this.storage.activeSessionToken = session.sessionToken;
      }

      this.saveToStorage();
      this.broadcastChange();
      this.notifyListeners();

      console.log('[SessionManager] Session added:', session.identityType, session.userId);
    } catch (error) {
      console.error('[SessionManager] Failed to add session:', error);
      throw error;
    }
  }

  /**
   * Remove a session by token
   */
  public async removeSession(sessionToken: string): Promise<void> {
    try {
      const sessionExists = this.storage.activeSessions.some(s => s.sessionToken === sessionToken);
      
      if (!sessionExists) {
        console.warn('[SessionManager] Attempted to remove non-existent session:', sessionToken);
        return;
      }

      // Remove session
      this.storage.activeSessions = this.storage.activeSessions.filter(
        s => s.sessionToken !== sessionToken
      );

      // Update active session if we removed the active one
      if (this.storage.activeSessionToken === sessionToken) {
        this.storage.activeSessionToken = this.storage.activeSessions[0]?.sessionToken || null;
      }

      this.saveToStorage();
      this.broadcastChange();
      this.notifyListeners();

      console.log('[SessionManager] Session removed:', sessionToken);
    } catch (error) {
      console.error('[SessionManager] Failed to remove session:', error);
      throw error;
    }
  }

  /**
   * Set the active session
   */
  public async setActiveSession(sessionToken: string): Promise<void> {
    try {
      const session = this.getSessionByToken(sessionToken);
      if (!session) {
        throw new Error(`Session not found: ${sessionToken}`);
      }

      if (!session.isActive || session.expiresAt <= new Date()) {
        throw new Error('Cannot activate expired or inactive session');
      }

      this.storage.activeSessionToken = sessionToken;
      
      // Update last accessed time
      session.lastAccessedAt = new Date();

      this.saveToStorage();
      this.broadcastChange();
      this.notifyListeners();

      console.log('[SessionManager] Active session changed:', session.identityType, session.userId);
    } catch (error) {
      console.error('[SessionManager] Failed to set active session:', error);
      throw error;
    }
  }

  /**
   * Remove the active session (logout)
   */
  public async removeActiveSession(): Promise<void> {
    try {
      if (!this.storage.activeSessionToken) {
        console.warn('[SessionManager] No active session to remove');
        return;
      }

      await this.removeSession(this.storage.activeSessionToken);
      console.log('[SessionManager] Active session removed (logout)');
    } catch (error) {
      console.error('[SessionManager] Failed to remove active session:', error);
      throw error;
    }
  }

  /**
   * Clear all sessions (full logout)
   */
  public async clearAllSessions(): Promise<void> {
    try {
      this.storage.activeSessions = [];
      this.storage.activeSessionToken = null;
      this.storage.lastSyncedAt = Date.now();

      this.saveToStorage();
      this.broadcastChange();
      this.notifyListeners();

      console.log('[SessionManager] All sessions cleared');
    } catch (error) {
      console.error('[SessionManager] Failed to clear all sessions:', error);
      throw error;
    }
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  public getActiveSession(): SessionData | null {
    if (!this.storage.activeSessionToken) return null;
    
    const session = this.getSessionByToken(this.storage.activeSessionToken);
    if (!session || !session.isActive || session.expiresAt <= new Date()) {
      // Clean up expired or invalid active session
      this.storage.activeSessionToken = null;
      this.saveToStorage();
      return null;
    }
    
    return session;
  }

  public getActiveToken(): string | null {
    const activeSession = this.getActiveSession();
    return activeSession?.sessionToken || null;
  }

  public getAllSessions(): SessionData[] {
    // Filter out expired sessions
    const validSessions = this.storage.activeSessions.filter(
      session => session.isActive && session.expiresAt > new Date()
    );

    // Update storage if we filtered out expired sessions
    if (validSessions.length !== this.storage.activeSessions.length) {
      this.storage.activeSessions = validSessions;
      this.saveToStorage();
    }

    return validSessions;
  }

  public getSessionByToken(token: string): SessionData | null {
    return this.storage.activeSessions.find(s => s.sessionToken === token) || null;
  }

  public getSessionsByIdentityType(type: 'ens' | 'universal_profile' | 'anonymous'): SessionData[] {
    return this.getAllSessions().filter(s => s.identityType === type);
  }

  public isAuthenticated(): boolean {
    return this.getActiveSession() !== null;
  }

  // ============================================================================
  // REACTIVITY & EVENTS
  // ============================================================================

  public subscribe(callback: SessionChangeListener): () => void {
    this.listeners.add(callback);
    
    // Immediately call with current state
    if (this.isInitialized) {
      callback(this.getAllSessions(), this.getActiveToken(), this.getActiveSession());
    }
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    const sessions = this.getAllSessions();
    const activeToken = this.getActiveToken();
    const activeSession = this.getActiveSession();
    
    this.listeners.forEach(callback => {
      try {
        callback(sessions, activeToken, activeSession);
      } catch (error) {
        console.error('[SessionManager] Listener error:', error);
      }
    });
  }

  // ============================================================================
  // PERSISTENCE & STORAGE
  // ============================================================================

  private loadFromStorage(): SessionStorage {
    try {
      // ✅ Browser-only check to prevent SSR errors
      if (typeof window === 'undefined') {
        console.log('[SessionManager] SSR environment detected, using default storage');
        return this.getDefaultStorage();
      }

      const stored = localStorage.getItem(SessionManager.STORAGE_KEY);
      if (!stored) {
        return this.getDefaultStorage();
      }

      const parsed: SessionStorage = JSON.parse(stored);
      
      // Validate and sanitize storage
      return this.sanitizeStorage(parsed);
    } catch (error) {
      console.error('[SessionManager] Failed to load from storage, using defaults:', error);
      return this.getDefaultStorage();
    }
  }

  private saveToStorage(): void {
    try {
      // ✅ Browser-only check to prevent SSR errors
      if (typeof window === 'undefined') {
        console.log('[SessionManager] SSR environment detected, skipping storage save');
        return;
      }

      const serialized = JSON.stringify({
        ...this.storage,
        lastSyncedAt: Date.now(),
      });
      
      localStorage.setItem(SessionManager.STORAGE_KEY, serialized);
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        console.error('[SessionManager] localStorage quota exceeded, clearing old sessions');
        this.handleStorageQuotaExceeded();
      } else {
        console.error('[SessionManager] Failed to save to storage:', error);
      }
    }
  }

  private getDefaultStorage(): SessionStorage {
    return {
      activeSessions: [],
      activeSessionToken: null,
      lastSyncedAt: Date.now(),
      version: SessionManager.STORAGE_VERSION,
    };
  }

  private sanitizeStorage(storage: SessionStorage): SessionStorage {
    try {
      // Ensure version compatibility
      if (!storage.version || storage.version < SessionManager.STORAGE_VERSION) {
        console.log('[SessionManager] Migrating storage to version', SessionManager.STORAGE_VERSION);
        storage.version = SessionManager.STORAGE_VERSION;
      }

      // Validate and filter sessions
      const validSessions = (storage.activeSessions || [])
        .map(session => ({
          ...session,
          expiresAt: new Date(session.expiresAt),
          lastAccessedAt: new Date(session.lastAccessedAt),
        }))
        .filter(this.validateSession);

      // Ensure active session is still valid
      const activeStillValid = validSessions.some(
        s => s.sessionToken === storage.activeSessionToken
      );

      return {
        activeSessions: validSessions,
        activeSessionToken: activeStillValid 
          ? storage.activeSessionToken 
          : (validSessions[0]?.sessionToken || null),
        lastSyncedAt: storage.lastSyncedAt || Date.now(),
        version: SessionManager.STORAGE_VERSION,
      };
    } catch (error) {
      console.error('[SessionManager] Storage sanitization failed:', error);
      return this.getDefaultStorage();
    }
  }

  private validateSession(session: SessionData): boolean {
    try {
      return (
        typeof session.sessionToken === 'string' &&
        session.sessionToken.length > 10 &&
        typeof session.userId === 'string' &&
        session.userId.length > 0 &&
        ['ens', 'universal_profile', 'anonymous'].includes(session.identityType) &&
        session.expiresAt instanceof Date &&
        session.expiresAt > new Date() &&
        typeof session.isActive === 'boolean' &&
        session.isActive
      );
    } catch {
      return false;
    }
  }

  private handleStorageQuotaExceeded(): void {
    try {
      // Remove oldest sessions first, keeping at least the active one
      const sorted = this.storage.activeSessions.sort(
        (a, b) => a.lastAccessedAt.getTime() - b.lastAccessedAt.getTime()
      );

      const activeToken = this.storage.activeSessionToken;
      const keepSessions = sorted.filter(s => s.sessionToken === activeToken).slice(-3); // Keep last 3
      
      this.storage.activeSessions = keepSessions;
      this.saveToStorage();
      
      console.log('[SessionManager] Cleaned up old sessions due to storage quota');
    } catch (error) {
      console.error('[SessionManager] Failed to handle storage quota:', error);
      
      // Last resort: clear everything (browser-only)
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SessionManager.STORAGE_KEY);
      }
      this.storage = this.getDefaultStorage();
    }
  }

  // ============================================================================
  // CROSS-TAB SYNCHRONIZATION
  // ============================================================================

  private setupStorageListener(): void {
    if (typeof window === 'undefined') return;

    // Listen for localStorage changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === SessionManager.STORAGE_KEY && e.newValue) {
        try {
          const newStorage: SessionStorage = JSON.parse(e.newValue);
          this.storage = this.sanitizeStorage(newStorage);
          this.notifyListeners();
          console.log('[SessionManager] Cross-tab sync: Session state updated from other tab');
        } catch (error) {
          console.error('[SessionManager] Cross-tab sync failed:', error);
        }
      }
    });

    // Listen for custom session events (same-tab updates)
    window.addEventListener('curia-session-change', () => {
      this.storage = this.loadFromStorage();
      this.notifyListeners();
    });
  }

  private broadcastChange(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('curia-session-change', {
        detail: {
          activeToken: this.getActiveToken(),
          sessionCount: this.storage.activeSessions.length,
        }
      }));
    }
  }

  // ============================================================================
  // DATABASE SYNCHRONIZATION
  // ============================================================================

  private setupPeriodicSync(): void {
    if (typeof window === 'undefined') return;

    // Sync on initialization if we have sessions
    if (this.storage.activeSessions.length > 0) {
      this.syncWithDatabase();
    }

    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      if (this.storage.activeSessions.length > 0) {
        this.syncWithDatabase();
      }
    }, SessionManager.SYNC_INTERVAL);
  }

  public async syncWithDatabase(): Promise<void> {
    try {
      const activeToken = this.getActiveToken();
      if (!activeToken) {
        console.log('[SessionManager] No active session for database sync');
        return;
      }

      const response = await fetch('/api/auth/sessions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${activeToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('[SessionManager] Database sync failed:', response.status, response.statusText);
        return;
      }

      const dbSessions: SessionData[] = await response.json();
      
      // Merge database sessions with localStorage cache
      const mergedSessions = this.mergeSessionStates(this.storage.activeSessions, dbSessions);
      
      this.storage.activeSessions = mergedSessions;
      this.storage.lastSyncedAt = Date.now();
      this.saveToStorage();
      this.notifyListeners();

      console.log('[SessionManager] Database sync completed:', mergedSessions.length, 'sessions');
    } catch (error) {
      console.error('[SessionManager] Database sync error:', error);
      // Graceful degradation - continue with localStorage cache
    }
  }

  private mergeSessionStates(localSessions: SessionData[], dbSessions: SessionData[]): SessionData[] {
    const sessionMap = new Map<string, SessionData>();

    // Start with database sessions (source of truth for metadata)
    for (const session of dbSessions) {
      sessionMap.set(session.sessionToken, {
        ...session,
        expiresAt: new Date(session.expiresAt),
        lastAccessedAt: new Date(session.lastAccessedAt),
      });
    }

    // Override with localStorage cache for active session context
    for (const session of localSessions) {
      const existing = sessionMap.get(session.sessionToken);
      if (existing) {
        // Keep database metadata but preserve localStorage context
        sessionMap.set(session.sessionToken, {
          ...existing,
          lastAccessedAt: session.lastAccessedAt, // Keep local access time
        });
      }
    }

    return Array.from(sessionMap.values());
  }

  // ============================================================================
  // LEGACY MIGRATION
  // ============================================================================

  private migrateLegacySession(): void {
    try {
      // ✅ Browser-only check to prevent SSR errors
      if (typeof window === 'undefined') {
        console.log('[SessionManager] SSR environment detected, skipping legacy migration');
        return;
      }

      const legacyToken = localStorage.getItem(SessionManager.LEGACY_TOKEN_KEY);
      if (!legacyToken || this.storage.activeSessions.length > 0) {
        return; // No migration needed
      }

      console.log('[SessionManager] Migrating legacy session token');

      // Create a placeholder session that will be validated by the next database sync
      const legacySession: SessionData = {
        sessionToken: legacyToken,
        userId: 'legacy-migration', // Will be updated by database sync
        identityType: 'anonymous', // Will be updated by database sync
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        lastAccessedAt: new Date(),
        isActive: true,
      };

      this.storage.activeSessions = [legacySession];
      this.storage.activeSessionToken = legacyToken;
      this.saveToStorage();

      // Remove legacy token
      localStorage.removeItem(SessionManager.LEGACY_TOKEN_KEY);
      
      // Trigger immediate database sync to validate and populate session data
      this.syncWithDatabase();

      console.log('[SessionManager] Legacy session migration completed');
    } catch (error) {
      console.error('[SessionManager] Legacy migration failed:', error);
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.listeners.clear();
    console.log('[SessionManager] Destroyed');
  }
}

// ============================================================================
// SINGLETON INSTANCE & CONVENIENCE EXPORTS
// ============================================================================

export const sessionManager = SessionManager.getInstance();

// Convenience functions for simple use cases
export const getSessionToken = (): string | null => sessionManager.getActiveToken();
export const setSessionToken = (sessionData: Omit<SessionData, 'lastAccessedAt'>): Promise<void> => sessionManager.addSession(sessionData);
export const clearSessionToken = (): Promise<void> => sessionManager.removeActiveSession();
export const isAuthenticated = (): boolean => sessionManager.isAuthenticated(); 