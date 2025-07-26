/**
 * Community API Route - Handles community-related API requests from plugins
 * 
 * This endpoint processes getCommunityInfo and giveRole requests
 * from plugins using the PluginHost service.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PluginHost } from '../../../lib/PluginHost';
import { DatabaseDataProvider } from '../../../lib/DataProvider';
import { 
  applyCorsHeaders, 
  validateOriginOrError, 
  createCorsPreflightResponse 
} from '@/lib/corsUtils';

// Initialize the plugin host with data provider
const dataProvider = new DatabaseDataProvider();
const pluginHost = new PluginHost(dataProvider);

export async function POST(request: NextRequest) {
  try {
    // Get request origin for CORS validation
    const origin = request.headers.get('origin') || '';
    
    // 🔐 NEW: Origin validation for data protection
    const corsError = validateOriginOrError(origin);
    if (corsError) {
      return corsError;
    }
    
    // Parse the request body
    const body = await request.json();
    
    // 🔐 NEW: Helper function to create secure CORS-enabled error response
    const createErrorResponse = (error: string, status: number) => {
      const response = NextResponse.json({
        data: null,
        success: false,
        error
      }, { status });
      
      return applyCorsHeaders(response, origin);
    };
    
    // Validate required fields
    if (!body.method || !body.communityId) {
      return createErrorResponse('Missing required fields: method, communityId', 400);
    }

    // Only handle community-related methods
    if (!['getCommunityInfo', 'giveRole'].includes(body.method)) {
      return createErrorResponse(`Invalid method for community endpoint: ${body.method}`, 400);
    }

    // Validate origin (for production, check against allowed origins)
    // For development, we'll allow all origins
    if (!pluginHost.validateOrigin(origin)) {
      return createErrorResponse('Unauthorized origin', 403);
    }

    // Process the API request
    const response = await pluginHost.processApiRequest(body);
    
    // Log the request for development
    console.log('[Community API] Request processed:', {
      method: body.method,
      communityId: body.communityId,
      params: body.params,
      success: response.success
    });

    // Return response with appropriate status code and secure CORS headers
    const statusCode = response.success ? 200 : 400;
    const jsonResponse = NextResponse.json(response, { status: statusCode });
    
    // 🔐 NEW: Apply secure CORS headers
    return applyCorsHeaders(jsonResponse, origin);
    
  } catch (error) {
    console.error('[Community API] Error processing request:', error);
    
    const errorResponse = NextResponse.json({
      data: null,
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
    
    // 🔐 NEW: Apply secure CORS headers to error response
    return applyCorsHeaders(errorResponse, origin);
  }
}

export async function GET() {
  return NextResponse.json({
    data: null,
    success: false,
    error: 'Method not allowed. Use POST for API requests.'
  }, { status: 405 });
}

// 🔐 NEW: Handle OPTIONS requests with secure CORS
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  return createCorsPreflightResponse(origin);
} 