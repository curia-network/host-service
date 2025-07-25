/**
 * Sign API Route - Handles cryptographic signing of plugin requests
 * 
 * This endpoint is called by host-service components to sign their API requests
 * using the @curia_/cg-plugin-lib-host library.
 */

import { NextRequest, NextResponse } from 'next/server';
import { CgPluginLibHost } from '@curia_/cg-plugin-lib-host';

const privateKey = process.env.NEXT_PRIVATE_PRIVKEY as string;
const publicKey = process.env.NEXT_PUBLIC_PUBKEY as string;

if (!privateKey || !publicKey) {
  throw new Error("Host service private/public keys are not set in the .env file");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[Host Sign API] Signing request:', {
      method: body.method,
      communityId: body.communityId,
      userId: body.userId
    });
    
    console.log('[SIGN DEBUG] Full request data being signed:', JSON.stringify(body, null, 2));
    
    // Initialize CgPluginLibHost with host-service's keys
    const cgPluginLibHost = await CgPluginLibHost.initialize(privateKey, publicKey);
    
    // Sign the request
    const { request: signedRequest, signature } = await cgPluginLibHost.signRequest(body);
    
    console.log('[Host Sign API] ✅ Request signed successfully');
    
    return NextResponse.json({ request: signedRequest, signature });
    
  } catch (error) {
    console.error('[Host Sign API] ❌ Error signing request:', error);
    
    return NextResponse.json(
      { error: 'Failed to sign request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 