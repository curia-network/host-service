/**
 * QRCodeGenerator - Utility for generating QR codes containing session transfer data
 * 
 * Handles encoding session data directly into QR codes for cross-device transfer.
 * No backend required - sessions are encoded as JSON directly into the QR code.
 */

import QRCode from 'qrcode';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface QRTransferData {
  sessions: SessionTransferData[];
  timestamp: number;
  version: string;
  sourceDevice?: string;
}

export interface SessionTransferData {
  sessionToken: string;
  userId: string;
  identityType: 'ens' | 'universal_profile' | 'anonymous';
  walletAddress?: string;
  ensName?: string;
  upAddress?: string;
  name?: string;
  profileImageUrl?: string;
  expiresAt: string; // ISO string for JSON serialization
  lastAccessedAt: string; // ISO string for JSON serialization
  isActive: boolean;
}

export interface QRGenerationOptions {
  width?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

// ============================================================================
// QR CODE GENERATOR CLASS
// ============================================================================

export class QRCodeGenerator {
  private static readonly DEFAULT_OPTIONS: Required<QRGenerationOptions> = {
    width: 256,
    errorCorrectionLevel: 'M',
    margin: 1,
    darkColor: '#000000',
    lightColor: '#FFFFFF'
  };

  /**
   * Generate QR code containing session data directly
   * @param sessions - Array of session data to transfer
   * @param options - QR code generation options
   * @returns Data URL for QR code image
   */
  static async generateSessionTransferQR(
    sessions: SessionTransferData[], 
    options: QRGenerationOptions = {}
  ): Promise<string> {
    try {
      // Filter out expired or inactive sessions
      const validSessions = this.filterValidSessions(sessions);
      
      if (validSessions.length === 0) {
        throw new Error('No valid sessions to transfer');
      }

      // Create transfer data structure
      const transferData: QRTransferData = {
        sessions: validSessions,
        timestamp: Date.now(),
        version: '1.0',
        sourceDevice: this.getDeviceInfo()
      };

      // Encode as JSON string
      const dataString = JSON.stringify(transferData);
      
      // Generate QR code with full options
      const finalOptions = { ...this.DEFAULT_OPTIONS, ...options };
      
      const qrDataUrl = await QRCode.toDataURL(dataString, {
        errorCorrectionLevel: finalOptions.errorCorrectionLevel,
        width: finalOptions.width,
        margin: finalOptions.margin,
        color: {
          dark: finalOptions.darkColor,
          light: finalOptions.lightColor
        }
      });
      
      return qrDataUrl;

    } catch (error) {
      console.error('[QRCodeGenerator] Failed to generate QR code:', error);
      throw new Error(`QR generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse session data from QR code scan
   * @param qrData - Scanned QR code data string
   * @returns Parsed session transfer data
   */
  static parseScannedQR(qrData: string): QRTransferData {
    return this.parseSessionTransferData(qrData);
  }

  /**
   * Parse session data from QR code scan
   * @param qrData - Scanned QR code data string
   * @returns Parsed session transfer data
   */
  static parseSessionTransferData(qrData: string): QRTransferData {
    try {
      const parsed = JSON.parse(qrData);
      
      // Validate required structure
      if (!this.isValidTransferData(parsed)) {
        throw new Error('Invalid QR code format - missing required fields');
      }

      return parsed;
    } catch (error) {
      console.error('[QRCodeGenerator] Failed to parse QR data:', error);
      throw new Error(`QR parsing failed: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  }

  /**
   * Convert SessionManager session data to transfer format
   * @param sessionData - SessionData from SessionManager
   * @returns Session data formatted for transfer
   */
  static convertToTransferFormat(sessionData: any): SessionTransferData {
    return {
      sessionToken: sessionData.sessionToken,
      userId: sessionData.userId,
      identityType: sessionData.identityType,
      walletAddress: sessionData.walletAddress,
      ensName: sessionData.ensName,
      upAddress: sessionData.upAddress,
      name: sessionData.name,
      profileImageUrl: sessionData.profileImageUrl,
      expiresAt: sessionData.expiresAt instanceof Date 
        ? sessionData.expiresAt.toISOString() 
        : sessionData.expiresAt,
      lastAccessedAt: sessionData.lastAccessedAt instanceof Date 
        ? sessionData.lastAccessedAt.toISOString() 
        : sessionData.lastAccessedAt,
      isActive: sessionData.isActive
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Filter out expired or inactive sessions
   */
  private static filterValidSessions(sessions: SessionTransferData[]): SessionTransferData[] {
    const now = new Date();
    
    return sessions.filter(session => {
      // Check if session is active
      if (!session.isActive) return false;
      
      // Check if session is not expired
      const expiresAt = new Date(session.expiresAt);
      if (expiresAt <= now) return false;
      
      // Check if required fields exist
      if (!session.sessionToken || !session.userId) return false;
      
      return true;
    });
  }

  /**
   * Validate QR transfer data structure
   */
  private static isValidTransferData(data: any): data is QRTransferData {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.sessions) &&
      typeof data.timestamp === 'number' &&
      typeof data.version === 'string' &&
      data.sessions.every((session: any) => 
        session.sessionToken && 
        session.userId && 
        session.identityType
      )
    );
  }

  /**
   * Get basic device information for debugging
   */
  private static getDeviceInfo(): string {
    try {
      const userAgent = navigator.userAgent;
      return userAgent.slice(0, 50); // Truncate for QR size
    } catch (error) {
      return 'Unknown Device';
    }
  }

  /**
   * Estimate QR code data size
   * @param data - Transfer data to measure
   * @returns Size in bytes
   */
  static estimateDataSize(data: QRTransferData): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  /**
   * Check if data size is within QR code limits
   * @param data - Transfer data to check
   * @returns Whether data fits in QR code
   */
  static isDataSizeValid(data: QRTransferData): boolean {
    const size = this.estimateDataSize(data);
    // QR codes with error correction level M can handle ~1800 bytes
    return size < 1500; // Conservative limit
  }
} 