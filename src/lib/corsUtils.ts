import { NextResponse } from 'next/server';

/**
 * CORS Security Utilities
 * Centralized CORS handling for all API endpoints
 * 
 * This utility restricts API access to only trusted Curia domains,
 * replacing the vulnerable wildcard (*) CORS pattern.
 */

interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  maxAge?: number;
  allowCredentials?: boolean;
}

const DEFAULT_CORS_CONFIG: CorsConfig = {
  allowedOrigins: [
    process.env.NEXT_PUBLIC_CURIA_FORUM_URL || '',
    process.env.NEXT_PUBLIC_HOST_SERVICE_URL || '',
    // Support for additional production domains
    ...(process.env.ADDITIONAL_ALLOWED_ORIGINS?.split(',') || [])
  ].filter(Boolean), // Remove empty strings
  allowedMethods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
  allowCredentials: false
};

/**
 * Validate if origin is allowed to access the API
 * @param origin - The origin header from the request
 * @param config - Optional custom CORS configuration
 * @returns true if origin is allowed, false otherwise
 */
export function isOriginAllowed(origin: string, config?: Partial<CorsConfig>): boolean {
  const { allowedOrigins } = { ...DEFAULT_CORS_CONFIG, ...config };
  
  if (!origin) return false;
  
  // Exact match for security - no wildcards or subdomain matching
  return allowedOrigins.includes(origin);
}

/**
 * Get CORS headers for response
 * @param origin - The origin header from the request
 * @param config - Optional custom CORS configuration
 * @returns Object containing CORS headers
 */
export function getCorsHeaders(origin: string, config?: Partial<CorsConfig>): Record<string, string> {
  const finalConfig = { ...DEFAULT_CORS_CONFIG, ...config };
  
  // Only allow origin if it's in our allowlist, otherwise explicitly deny
  const corsOrigin = isOriginAllowed(origin, finalConfig) ? origin : 'null';
  
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': finalConfig.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': finalConfig.allowedHeaders.join(', '),
    'Access-Control-Max-Age': finalConfig.maxAge?.toString() || '86400',
    ...(finalConfig.allowCredentials && { 'Access-Control-Allow-Credentials': 'true' })
  };
}

/**
 * Apply CORS headers to NextResponse
 * @param response - The NextResponse to add headers to
 * @param origin - The origin header from the request
 * @param config - Optional custom CORS configuration
 * @returns The response with CORS headers applied
 */
export function applyCorsHeaders(
  response: NextResponse, 
  origin: string, 
  config?: Partial<CorsConfig>
): NextResponse {
  const headers = getCorsHeaders(origin, config);
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Create CORS preflight response for OPTIONS requests
 * @param origin - The origin header from the request
 * @param config - Optional custom CORS configuration
 * @returns NextResponse for preflight requests
 */
export function createCorsPreflightResponse(
  origin: string, 
  config?: Partial<CorsConfig>
): NextResponse {
  const headers = getCorsHeaders(origin, config);
  
  return new NextResponse(null, {
    status: 200,
    headers
  });
}

/**
 * Create CORS error response for blocked origins
 * @param origin - The blocked origin
 * @returns NextResponse with 403 status and security error
 */
export function createCorsErrorResponse(origin: string): NextResponse {
  // Log the blocked attempt for security monitoring
  console.warn(`[CORS Security] Blocked request from unauthorized origin: ${origin}`);
  
  return NextResponse.json(
    { 
      success: false, 
      error: 'Origin not allowed',
      message: 'This API endpoint only accepts requests from authorized Curia domains',
      // Don't expose all allowed origins for security reasons in production
      ...(process.env.NODE_ENV === 'development' && { 
        allowedOrigins: DEFAULT_CORS_CONFIG.allowedOrigins 
      })
    },
    { 
      status: 403,
      headers: {
        'Access-Control-Allow-Origin': 'null', // Explicitly deny
        'Access-Control-Allow-Methods': 'OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    }
  );
}

/**
 * Helper function to validate origin early in request processing
 * Use this for high-security endpoints like authentication
 * @param origin - The origin header from the request
 * @returns NextResponse with 403 error if origin is not allowed, null if allowed
 */
export function validateOriginOrError(origin: string): NextResponse | null {
  if (origin && !isOriginAllowed(origin)) {
    return createCorsErrorResponse(origin);
  }
  return null;
}

/**
 * Get debug information about CORS configuration
 * Only available in development mode for security
 * @returns Object with CORS configuration details
 */
export function getCorsDebugInfo(): object | null {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return {
    allowedOrigins: DEFAULT_CORS_CONFIG.allowedOrigins,
    environment: process.env.NODE_ENV,
    forumUrl: process.env.NEXT_PUBLIC_CURIA_FORUM_URL,
    hostUrl: process.env.NEXT_PUBLIC_HOST_SERVICE_URL,
    additionalOrigins: process.env.ADDITIONAL_ALLOWED_ORIGINS?.split(',') || []
  };
} 