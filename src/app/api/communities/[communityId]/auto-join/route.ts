/**
 * Community Auto-Join API Route
 * 
 * POST /api/communities/[communityId]/auto-join
 * 
 * Automatically creates or updates user membership when they visit a community.
 * Uses UPSERT pattern to handle both new memberships and visit tracking.
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
// INTERFACES
// ============================================================================

interface CommunitySettings {
  is_public: boolean;
  requires_approval: boolean;
  name: string;
}

interface MembershipResult {
  communityId: string;
  communityName: string;
  role: string;
  status: string;
  visitCount: number;
  lastVisitedAt: string;
  isNewMember: boolean;
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
    
    if (!session.is_active) {
      return { valid: false, error: 'Session is inactive' };
    }
    
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
// COMMUNITY VALIDATION
// ============================================================================

async function getCommunitySettings(client: any, communityId: string): Promise<CommunitySettings | null> {
  try {
    const communityQuery = `
      SELECT is_public, requires_approval, name 
      FROM communities 
      WHERE id = $1
    `;
    
    const result = await client.query(communityQuery, [communityId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('[getCommunitySettings] Database error:', error);
    throw error;
  }
}

// ============================================================================
// MEMBERSHIP UPSERT
// ============================================================================

async function upsertMembership(
  client: any, 
  userId: string, 
  communityId: string, 
  membershipStatus: string
): Promise<MembershipResult> {
  try {
    const upsertQuery = `
      INSERT INTO user_communities (user_id, community_id, role, status, first_visited_at, last_visited_at, visit_count)
      VALUES ($1, $2, 'member', $3, NOW(), NOW(), 1)
      ON CONFLICT (user_id, community_id) 
      DO UPDATE SET 
        last_visited_at = NOW(),
        visit_count = user_communities.visit_count + 1,
        status = CASE 
          WHEN user_communities.status = 'banned' THEN 'banned'
          WHEN user_communities.status = 'left' THEN $3
          ELSE user_communities.status 
        END,
        updated_at = NOW()
      RETURNING *, (visit_count = 1) as is_new_member
    `;

    const result = await client.query(upsertQuery, [userId, communityId, membershipStatus]);
    const membership = result.rows[0];

    return {
      communityId: membership.community_id,
      communityName: '', // Will be filled by caller
      role: membership.role,
      status: membership.status,
      visitCount: membership.visit_count,
      lastVisitedAt: membership.last_visited_at,
      isNewMember: membership.is_new_member
    };
  } catch (error) {
    console.error('[upsertMembership] Database error:', error);
    throw error;
  }
}

// ============================================================================
// POST AUTO-JOIN ENDPOINT
// ============================================================================

export async function POST(request: NextRequest, { params }: { params: Promise<{ communityId: string }> }) {
  try {
    // Get request origin for CORS validation
    const origin = request.headers.get('origin') || '';
    
    // 🔐 Origin validation for data protection
    const corsError = validateOriginOrError(origin);
    if (corsError) {
      return corsError;
    }
    
    const client = await pool.connect();
    
    try {
      // 🔐 Helper function to create secure CORS-enabled error response
      const createErrorResponse = (error: string, status: number) => {
        const response = NextResponse.json({ error }, { status });
        return applyCorsHeaders(response, origin);
      };

      // 1. Validate community ID parameter
      const { communityId } = await params;
      if (!communityId) {
        return createErrorResponse('Community ID is required', 400);
      }

      // 2. Authenticate user (same pattern as sessions/route.ts)
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return createErrorResponse('Missing or invalid authorization header', 401);
      }

      const sessionToken = authHeader.substring(7);
      
      // 3. Validate session token
      const validation = await validateSessionToken(sessionToken);
      if (!validation.valid) {
        return createErrorResponse(validation.error || 'Invalid session', 401);
      }

      const userId = validation.userId!;
      console.log(`[auto-join] Processing auto-join for user ${userId} to community ${communityId}`);

      // 4. Check community settings
      const community = await getCommunitySettings(client, communityId);
      if (!community) {
        return createErrorResponse('Community not found', 404);
      }

      // 5. Determine membership status based on community settings
      let membershipStatus = 'active';
      
      // If community requires approval, set to pending (unless it's also public)
      if (community.requires_approval && !community.is_public) {
        membershipStatus = 'pending';
        console.log(`[auto-join] Community ${communityId} requires approval, setting status to pending`);
      }

      // 6. UPSERT membership
      const membershipResult = await upsertMembership(client, userId, communityId, membershipStatus);
      membershipResult.communityName = community.name;

      // 7. Update last accessed time for the session
      await client.query(
        'UPDATE authentication_sessions SET last_accessed_at = NOW() WHERE session_token = $1',
        [sessionToken]
      );

      // 8. Log the result
      if (membershipResult.isNewMember) {
        console.log(`[auto-join] ✅ User ${userId} auto-joined community ${communityId} with status ${membershipResult.status}`);
      } else {
        console.log(`[auto-join] 🔄 Updated visit for user ${userId} in community ${communityId} (visit #${membershipResult.visitCount})`);
      }

      // 9. Return success response
      const response = NextResponse.json({
        success: true,
        membership: membershipResult
      });

      return applyCorsHeaders(response, origin);

    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('[auto-join] Error:', error);
    const errorResponse = NextResponse.json(
      { error: 'Auto-join failed' },
      { status: 500 }
    );
    
    // 🔐 Apply secure CORS headers to error response
    const origin = request.headers.get('origin') || '';
    return applyCorsHeaders(errorResponse, origin);
  }
}

// ============================================================================
// METHOD NOT ALLOWED
// ============================================================================

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to auto-join a community.' },
    { status: 405 }
  );
}

// ============================================================================
// OPTIONS ENDPOINT
// ============================================================================

// 🔐 Handle OPTIONS requests with secure CORS
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  return createCorsPreflightResponse(origin);
} 