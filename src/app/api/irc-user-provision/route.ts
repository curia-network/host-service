/**
 * IRC User Provisioning API Route - Host Service Version
 * 
 * This endpoint provisions IRC users for chat functionality via the iframe-api-proxy.
 * Adapted from curia to work with host-service authentication and response patterns.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { sojuAdminService } from '../../../lib/SojuAdminService';
import { 
  generateIrcUsername, 
  generateIrcNickname,
  generateSecurePassword
} from '@curia_/curia-chat-modal';
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
// API RESPONSE FORMAT
// ============================================================================

// ApiResponse format expected by iframe-api-proxy

export async function POST(request: NextRequest) {
  try {
    // Get request origin for CORS validation
    const origin = request.headers.get('origin') || '';
    
    // 🔐 Origin validation for data protection
    const corsError = validateOriginOrError(origin);
    if (corsError) {
      return corsError;
    }
    
    // Parse the request body
    const body = await request.json();
    
    // 🔐 Helper function to create secure CORS-enabled error response
    const createErrorResponse = (error: string, status: number): NextResponse => {
      // Return raw error message - iframe-api-proxy will wrap it in ApiResponse format
      const response = NextResponse.json({ error }, { status });
      
      return applyCorsHeaders(response, origin);
    };

    // Validate required fields
    if (!body.method || !body.communityId || !body.userId) {
      return createErrorResponse('Missing required fields: method, communityId, userId', 400);
    }

    // Only handle getIrcCredentials method
    if (body.method !== 'getIrcCredentials') {
      return createErrorResponse(`Invalid method for IRC provisioning endpoint: ${body.method}`, 400);
    }

    // Extract user data from request body (instead of JWT)
    const userId = body.userId;
    const communityId = body.communityId;
    
    // Query database to get the user's real name
    let userName: string;
    try {
      const userQuery = `SELECT name FROM users WHERE user_id = $1`;
      const userResult = await pool.query(userQuery, [userId]);
      
      if (userResult.rows.length > 0 && userResult.rows[0].name) {
        userName = userResult.rows[0].name;
        console.log('[IRC Provision] Found user name in database:', userName);
      } else {
        // Fallback: create a clean username from userId
        userName = `user_${userId.slice(-8)}`;
        console.log('[IRC Provision] No name found, using fallback:', userName);
      }
    } catch (dbError) {
      console.warn('[IRC Provision] Database query failed, using fallback:', dbError);
      userName = `user_${userId.slice(-8)}`;
    }

    console.log('[IRC Provision] Processing IRC provisioning request:', {
      userId,
      userName,
      communityId,
      method: body.method,
      timestamp: new Date().toISOString()
    });

    try {
      // Generate IRC username (avoid conflicts)
      const ircUsername = generateIrcUsername(userName, userId);
      
      // Generate IRC-compliant nickname (stricter rules than username)
      const ircNickname = generateIrcNickname(userName);
      
      // Generate secure password for IRC
      const ircPassword = generateSecurePassword();

      // Provision user (create or update) via admin interface (no restart needed!)
      const provisionResult = await sojuAdminService.provisionUser({
        ircUsername,
        ircPassword,
        nickname: ircNickname,
        realname: ircUsername // Use the cleaned/truncated username as realname
      });

      if (!provisionResult.success) {
        throw new Error(`Failed to provision user: ${provisionResult.error}`);
      }

      console.log('[IRC Provision] Successfully provisioned IRC user via admin interface:', {
        ircUsername,
        userId,
        userName,
        communityId,
        networkName: 'commonground',
        timestamp: new Date().toISOString()
      });

      // Prepare raw credentials data (iframe-api-proxy will wrap it)
      const credentialsData = {
        ircUsername,
        ircPassword, // Plain password for The Lounge login
        networkName: 'commonground'
      };
      
      // 🔍 BACKEND_IRC_DEBUG: Log exactly what we're sending
      console.log('🔍 BACKEND_IRC_DEBUG - Sending raw credentials to iframe-api-proxy:', {
        credentialsData,
        dataKeys: Object.keys(credentialsData),
        note: 'iframe-api-proxy will wrap this in ApiResponse format',
        timestamp: new Date().toISOString()
      });

      // Return raw credentials - iframe-api-proxy will wrap in ApiResponse format
      const successResponse = NextResponse.json(credentialsData);
      
      return applyCorsHeaders(successResponse, origin);
      
    } catch (error) {
      console.error('[IRC Provision] Error provisioning IRC user:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        userName,
        communityId,
        timestamp: new Date().toISOString()
      });
      
      // Return user-friendly error message
      const userMessage = error instanceof Error && error.message.includes('connection') 
        ? 'Unable to connect to chat service. Please try again.'
        : 'Failed to set up chat access. Please try again or contact support.';
        
      return createErrorResponse(userMessage, 500);
    }
    
  } catch (error) {
    console.error('[IRC Provision] Error processing request:', error);
    
    // Return raw error - iframe-api-proxy will wrap it in ApiResponse format  
    const errorResponse = NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
    
    // Apply CORS headers to error response
    const origin = request.headers.get('origin') || '';
    return applyCorsHeaders(errorResponse, origin);
  }
}

export async function GET() {
  return NextResponse.json({
    error: 'Method not allowed. Use POST for IRC provisioning requests.'
  }, { status: 405 });
}

// Handle OPTIONS requests with secure CORS
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  return createCorsPreflightResponse(origin);
}