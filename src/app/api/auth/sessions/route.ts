/**
 * Sessions API - Database synchronization for SessionManager
 * 
 * GET /api/auth/sessions - Fetch all active sessions for the current user
 * This endpoint is used by the SessionManager to sync localStorage cache with database state
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { 
  applyCorsHeaders, 
  validateOriginOrError, 
  createCorsPreflightResponse 
} from '@/lib/corsUtils';

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ============================================================================
// SESSION DATA INTERFACES
// ============================================================================

interface DatabaseSession {
  id: string;
  user_id: string;
  session_token: string;
  identity_type: 'ens' | 'universal_profile' | 'anonymous';
  wallet_address: string | null;
  signed_message: string;
  signature: string;
  created_at: string;
  expires_at: string;
  last_accessed_at: string;
  is_active: boolean;
}

interface SessionData {
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

// ============================================================================
// SESSION VALIDATION
// ============================================================================

async function validateSessionToken(sessionToken: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
  try {
    const query = `
      SELECT user_id, expires_at, is_active 
      FROM authentication_sessions 
      WHERE session_token = $1
    `;
    
    const result = await pool.query(query, [sessionToken]);
    
    if (result.rows.length === 0) {
      return { valid: false, error: 'Session not found' };
    }
    
    const session = result.rows[0];
    
    // Check if session is active
    if (!session.is_active) {
      return { valid: false, error: 'Session is inactive' };
    }
    
    // Check if session is expired
    const expiresAt = new Date(session.expires_at);
    if (expiresAt <= new Date()) {
      return { valid: false, error: 'Session expired' };
    }
    
    return { valid: true, userId: session.user_id };
  } catch (error) {
    console.error('[validateSessionToken] Database error:', error);
    return { valid: false, error: 'Database validation failed' };
  }
}

// ============================================================================
// USER PROFILE ENRICHMENT
// ============================================================================

async function enrichSessionWithUserData(session: DatabaseSession): Promise<SessionData> {
  try {
    // Get user profile data
    const userQuery = `
      SELECT name, profile_picture_url, ens_domain, up_address 
      FROM users 
      WHERE user_id = $1
    `;
    
    const userResult = await pool.query(userQuery, [session.user_id]);
    const userData = userResult.rows[0] || {};
    
    return {
      sessionToken: session.session_token,
      userId: session.user_id,
      identityType: session.identity_type,
      walletAddress: session.wallet_address || undefined,
      ensName: userData.ens_domain || undefined,
      upAddress: userData.up_address || undefined,
      name: userData.name || undefined,
      profileImageUrl: userData.profile_picture_url || undefined,
      expiresAt: new Date(session.expires_at),
      lastAccessedAt: new Date(session.last_accessed_at),
      isActive: session.is_active,
    };
  } catch (error) {
    console.error('[enrichSessionWithUserData] Error enriching session:', error);
    
    // Return basic session data if enrichment fails
    return {
      sessionToken: session.session_token,
      userId: session.user_id,
      identityType: session.identity_type,
      walletAddress: session.wallet_address || undefined,
      expiresAt: new Date(session.expires_at),
      lastAccessedAt: new Date(session.last_accessed_at),
      isActive: session.is_active,
    };
  }
}

// ============================================================================
// GET SESSIONS ENDPOINT
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Get request origin for CORS validation
    const origin = request.headers.get('origin') || '';
    
    // 🔐 NEW: Early origin validation for authentication endpoint
    const corsError = validateOriginOrError(origin);
    if (corsError) {
      return corsError;
    }
    
    // Extract session token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }
    
    const sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Validate the session token
    const validation = await validateSessionToken(sessionToken);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid session' },
        { status: 401 }
      );
    }
    
    const userId = validation.userId!;
    
    // Fetch all active sessions for this user
    const sessionsQuery = `
      SELECT 
        id,
        user_id,
        session_token,
        identity_type,
        wallet_address,
        signed_message,
        signature,
        created_at,
        expires_at,
        last_accessed_at,
        is_active
      FROM authentication_sessions
      WHERE user_id = $1 
        AND is_active = true 
        AND expires_at > NOW()
      ORDER BY last_accessed_at DESC
    `;
    
    const sessionsResult = await pool.query(sessionsQuery, [userId]);
    const dbSessions: DatabaseSession[] = sessionsResult.rows;
    
    // Update last_accessed_at for the current session
    await pool.query(
      'UPDATE authentication_sessions SET last_accessed_at = NOW() WHERE session_token = $1',
      [sessionToken]
    );
    
    // Enrich sessions with user profile data
    const enrichedSessions: SessionData[] = await Promise.all(
      dbSessions.map(session => enrichSessionWithUserData(session))
    );
    
    console.log(`[GET /api/auth/sessions] Retrieved ${enrichedSessions.length} sessions for user ${userId}`);
    
    const response = NextResponse.json(enrichedSessions);
    
    // 🔐 NEW: Apply secure CORS headers
    return applyCorsHeaders(response, origin);
    
  } catch (error) {
    console.error('[GET /api/auth/sessions] Error:', error);
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    
    // 🔐 NEW: Apply secure CORS headers to error response
    const origin = request.headers.get('origin') || '';
    return applyCorsHeaders(errorResponse, origin);
  }
}

// ============================================================================
// POST SESSIONS ENDPOINT (FOR FUTURE USE)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // This endpoint could be used for creating new sessions directly
    // For now, we use the existing verify-signature endpoint
    return NextResponse.json(
      { error: 'Use /api/auth/verify-signature to create new sessions' },
      { status: 405 }
    );
  } catch (error) {
    console.error('[POST /api/auth/sessions] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE SESSIONS ENDPOINT (FOR FUTURE USE)
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    // Extract session token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }
    
    const sessionToken = authHeader.substring(7);
    
    // Validate the session token
    const validation = await validateSessionToken(sessionToken);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid session' },
        { status: 401 }
      );
    }
    
    const { sessionTokenToDelete } = await request.json();
    
    if (!sessionTokenToDelete) {
      return NextResponse.json(
        { error: 'Missing sessionToken in request body' },
        { status: 400 }
      );
    }
    
    const userId = validation.userId!;
    
    // Verify the session to delete belongs to the same user
    const checkQuery = `
      SELECT user_id FROM authentication_sessions 
      WHERE session_token = $1 AND user_id = $2
    `;
    
    const checkResult = await pool.query(checkQuery, [sessionTokenToDelete, userId]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 404 }
      );
    }
    
    // Deactivate the session (soft delete)
    const deleteQuery = `
      UPDATE authentication_sessions 
      SET is_active = false, last_accessed_at = NOW()
      WHERE session_token = $1
    `;
    
    await pool.query(deleteQuery, [sessionTokenToDelete]);
    
    console.log(`[DELETE /api/auth/sessions] Deactivated session ${sessionTokenToDelete} for user ${userId}`);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('[DELETE /api/auth/sessions] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 🔐 NEW: Handle OPTIONS requests with secure CORS
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  return createCorsPreflightResponse(origin);
} 