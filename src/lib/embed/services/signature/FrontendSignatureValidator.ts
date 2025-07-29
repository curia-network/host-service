/**
 * FrontendSignatureValidator - Browser-compatible signature validation
 * 
 * Validates cryptographic signatures created by CgPluginLibHost using Web Crypto API.
 * This runs in the browser (frontend) and validates signatures BEFORE data transformation.
 * 
 * Key features:
 * - RSA-PKCS1-v1_5 with SHA-256 (matches CgPluginLibHost exactly)
 * - Identical data normalization (timestamp + recursive key sorting + JSON.stringify)
 * - Web Crypto API (browser-native, no Node.js dependencies)
 * - PEM key import with proper format handling
 * - Comprehensive error handling and logging
 */

/**
 * Interface for data that can be signature-validated
 */
export interface SignableData {
  method: string;
  iframeUid?: string;
  requestId?: string;
  params?: any;
  timestamp?: number;
  [key: string]: any;
}

/**
 * Browser-compatible signature validation service
 */
export class FrontendSignatureValidator {
  private publicKey: CryptoKey | null = null;
  private publicKeyPem: string;
  private isInitialized: boolean = false;

  /**
   * Initialize the validator with a PEM-formatted public key
   * 
   * @param publicKeyPem - RSA public key in PEM format
   */
  constructor(publicKeyPem: string) {
    this.publicKeyPem = publicKeyPem;
  }

  /**
   * Initialize the validator by importing the public key
   * This is called automatically on first validation attempt
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('[FrontendSignatureValidator] Initializing with public key...');
      
      this.publicKey = await this.importPublicKey();
      this.isInitialized = true;
      
      console.log('[FrontendSignatureValidator] ✅ Initialized successfully');
    } catch (error) {
      console.error('[FrontendSignatureValidator] ❌ Initialization failed:', error);
      throw new Error(`Failed to initialize signature validator: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate a cryptographic signature against the provided data
   * 
   * @param data - The original data that was signed
   * @param signature - Base64-encoded signature to validate
   * @returns Promise<boolean> - Whether the signature is valid
   */
  public async validateSignature(data: SignableData, signature: string): Promise<boolean> {
    try {
      // Ensure validator is initialized
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.publicKey) {
        throw new Error('Public key not available after initialization');
      }

      console.log('[FrontendSignatureValidator] 🔐 Validating signature for data:', {
        method: data.method,
        hasTimestamp: !!data.timestamp,
        dataKeys: Object.keys(data)
      });

      // 🔍 SPECIAL DEBUG for getUserFriends method
      if (data.method === 'getUserFriends') {
        console.log('[FrontendSignatureValidator] 🔍 DEBUG getUserFriends - Original data:', JSON.stringify(data, null, 2));
      }

      // Step 1: Normalize data exactly like CgPluginLibHost does
      const normalizedData = this.normalizeSignedData(data);
      
      // 🔍 DEBUG: Log normalized data and serialization
      console.log('[FrontendSignatureValidator] 🔍 DEBUG - Normalized data:', JSON.stringify(normalizedData, null, 2));
      const serializedData = JSON.stringify(normalizedData);
      console.log('[FrontendSignatureValidator] 🔍 DEBUG - Serialized data:', serializedData);
      console.log('[FrontendSignatureValidator] 🔍 DEBUG - Serialized length:', serializedData.length);
      
      // 🔍 EXTRA DEBUG for getUserFriends
      if (data.method === 'getUserFriends') {
        console.log('[FrontendSignatureValidator] 🔍 DEBUG getUserFriends - Normalized data:', JSON.stringify(normalizedData, null, 2));
        console.log('[FrontendSignatureValidator] 🔍 DEBUG getUserFriends - Serialized for validation:', serializedData);
      }
      
      // Step 2: Convert normalized data to bytes for verification
      const dataBuffer = new TextEncoder().encode(serializedData);
      
      // Step 3: Decode base64 signature to bytes
      const signatureBuffer = this.base64ToArrayBuffer(signature);
      
      // Step 4: Verify signature using Web Crypto API  
      // TODO: We need to detect the algorithm used (ECDSA vs RSA)
      // For now, let's try RSA first (original behavior)
      const signatureAlgorithm = {
        name: 'RSASSA-PKCS1-v1_5',
      };
      
      // 🔍 DEBUG algorithm being used
      console.log('[FrontendSignatureValidator] 🔍 Using signature algorithm:', JSON.stringify(signatureAlgorithm, null, 2));
      
      const isValid = await crypto.subtle.verify(
        signatureAlgorithm,
        this.publicKey,
        signatureBuffer,
        dataBuffer
      );

      console.log(`[FrontendSignatureValidator] ${isValid ? '✅' : '❌'} Signature validation result: ${isValid}`);
      
      return isValid;
    } catch (error) {
      console.error('[FrontendSignatureValidator] ❌ Signature validation error:', error);
      return false; // Invalid signature on any error
    }
  }

  /**
   * Import RSA public key from PEM format using Web Crypto API
   */
  private async importPublicKey(): Promise<CryptoKey> {
    try {
      // Extract base64 content from PEM format
      const pemHeader = '-----BEGIN PUBLIC KEY-----';
      const pemFooter = '-----END PUBLIC KEY-----';
      const pemContents = this.publicKeyPem
        .replace(pemHeader, '')
        .replace(pemFooter, '')
        .replace(/\s/g, ''); // Remove all whitespace including newlines

      if (!pemContents) {
        throw new Error('Invalid PEM format: No key content found');
      }

      // Convert base64 to ArrayBuffer
      const binaryData = atob(pemContents);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }

      // Import key using Web Crypto API
      const publicKey = await crypto.subtle.importKey(
        'spki', // Subject Public Key Info format
        bytes.buffer,
        {
          name: 'RSASSA-PKCS1-v1_5', // ✅ CONFIRMED from CgPluginLibHost
          hash: 'SHA-256',            // ✅ CONFIRMED from CgPluginLibHost
        },
        false, // Not extractable
        ['verify'] // Only for signature verification
      );

      return publicKey;
    } catch (error) {
      throw new Error(`Failed to import public key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Normalize data for signing exactly like CgPluginLibHost does
   * 
   * CRITICAL: This must match CgPluginLibHost.prepareDataForSigning() exactly!
   * 
   * Process:
   * 1. Add timestamp if not present (⚠️ Frontend receives already-signed data with timestamp)
   * 2. Sort object keys recursively 
   * 3. Return normalized object (JSON.stringify happens in validateSignature)
   */
  private normalizeSignedData(data: SignableData): any {
    // ⚠️ IMPORTANT: Frontend validation receives data that was already signed.
    // The timestamp was added during signing, so we DON'T add a new Date.now()
    // We only add timestamp if somehow missing (edge case)
    const dataWithTimestamp = {
      ...data,
      timestamp: data.timestamp || Date.now(), // Only add if missing
    };

    // Sort object keys recursively for consistent serialization
    return this.sortObjectKeys(dataWithTimestamp);
  }

  /**
   * Recursively sort object keys for consistent serialization
   * 
   * ✅ EXACT COPY of CgPluginLibHost.sortObjectKeys() method
   */
  private sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }

    const sorted: any = {};
    Object.keys(obj)
      .sort()
      .forEach(key => {
        sorted[key] = this.sortObjectKeys(obj[key]);
      });

    return sorted;
  }

  /**
   * Convert base64 string to ArrayBuffer for Web Crypto API
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    try {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    } catch (error) {
      throw new Error(`Invalid base64 signature format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Static factory method to create validator from environment variable
   * 
   * @returns FrontendSignatureValidator instance
   * @throws Error if NEXT_PUBLIC_CURIA_PUBKEY is not configured
   */
  public static fromEnvironment(): FrontendSignatureValidator {
    const publicKey = process.env.NEXT_PUBLIC_CURIA_PUBKEY;
    
    if (!publicKey) {
      throw new Error('NEXT_PUBLIC_CURIA_PUBKEY environment variable is required for signature validation');
    }

    return new FrontendSignatureValidator(publicKey);
  }

  /**
   * Static factory method to create validator from public key parameter
   * 
   * @param publicKey - RSA public key in PEM format
   * @returns FrontendSignatureValidator instance
   */
  public static fromPublicKey(publicKey: string): FrontendSignatureValidator {
    if (!publicKey) {
      throw new Error('Public key is required for signature validation');
    }

    return new FrontendSignatureValidator(publicKey);
  }

  /**
   * Check if validator is ready for use
   */
  public isReady(): boolean {
    return this.isInitialized && this.publicKey !== null;
  }
} 