/**
 * QRDataDisplay Component
 * 
 * Displays decoded QR data for user review before importing sessions.
 * Shows session information in a user-friendly format.
 */

import React from 'react';
import { QRCodeGenerator, type QRTransferData } from './QRCodeGenerator';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface QRDataDisplayProps {
  qrData: string;
  onImport: (transferData: QRTransferData) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

interface ParsedData {
  transferData: QRTransferData | null;
  error: string | null;
  rawData: string;
}

// ============================================================================
// QR DATA DISPLAY COMPONENT
// ============================================================================

export const QRDataDisplay: React.FC<QRDataDisplayProps> = ({
  qrData,
  onImport,
  onCancel,
  isProcessing = false
}) => {
  // Parse QR data
  const parsedData: ParsedData = React.useMemo(() => {
    try {
      const transferData = QRCodeGenerator.parseScannedQR(qrData);
      return {
        transferData,
        error: null,
        rawData: qrData
      };
    } catch (error) {
      return {
        transferData: null,
        error: error instanceof Error ? error.message : 'Failed to parse QR data',
        rawData: qrData
      };
    }
  }, [qrData]);

  const handleImport = () => {
    if (parsedData.transferData) {
      onImport(parsedData.transferData);
    }
  };

  return (
    <div className="qr-data-display-overlay">
      <div className="qr-data-display-backdrop" onClick={onCancel} />
      
      <div className="qr-data-display-container">
        {/* Header */}
        <div className="qr-data-display-header">
          <h3 className="qr-data-display-title">
            {parsedData.error ? 'QR Scan Error' : 'Review Session Data'}
          </h3>
          <button 
            className="qr-data-display-close"
            onClick={onCancel}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="qr-data-display-content">
          {parsedData.error ? (
            // Error State
            <div className="qr-data-display-error">
              <div className="qr-data-display-error-icon">⚠️</div>
              <h4>Invalid QR Code</h4>
              <p>{parsedData.error}</p>
              
              {/* Show raw data for debugging */}
              <details className="qr-data-display-raw">
                <summary>Raw QR Data</summary>
                <pre>{parsedData.rawData.substring(0, 500)}...</pre>
              </details>
            </div>
          ) : (
            // Success State
            <div className="qr-data-display-success">
              <div className="qr-data-display-summary">
                <div className="qr-data-display-icon">✅</div>
                <h4>QR Code Scanned Successfully</h4>
                <p>
                  Found <strong>{parsedData.transferData?.sessions.length || 0}</strong> session(s) 
                  to transfer from another device.
                </p>
              </div>

              {/* Session List */}
              {parsedData.transferData?.sessions && (
                <div className="qr-data-display-sessions">
                  <h5>Sessions to Import:</h5>
                  {parsedData.transferData.sessions.map((session, index) => (
                    <div key={index} className="qr-data-display-session">
                      <div className="qr-data-display-session-avatar">
                        {session.profileImageUrl ? (
                          <img 
                            src={session.profileImageUrl} 
                            alt={session.name || 'Profile'} 
                            className="qr-data-display-avatar-img"
                          />
                        ) : (
                          <div className="qr-data-display-avatar-fallback">
                            {(session.name || session.userId || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <div className="qr-data-display-session-info">
                        <div className="qr-data-display-session-name">
                          {session.name || session.ensName || 'Unnamed Account'}
                        </div>
                        <div className="qr-data-display-session-type">
                          {session.identityType === 'ens' && '🏷️ ENS Domain'}
                          {session.identityType === 'universal_profile' && '🔗 Universal Profile'}
                          {session.identityType === 'anonymous' && '👤 Guest Account'}
                        </div>
                        {session.walletAddress && (
                          <div className="qr-data-display-session-address">
                            {session.walletAddress.substring(0, 8)}...{session.walletAddress.substring(-6)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Metadata */}
              {parsedData.transferData && (
                <div className="qr-data-display-metadata">
                  <div className="qr-data-display-meta-item">
                    <span>Transfer Time:</span>
                    <span>{new Date(parsedData.transferData.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="qr-data-display-meta-item">
                    <span>Version:</span>
                    <span>{parsedData.transferData.version}</span>
                  </div>
                  {parsedData.transferData.sourceDevice && (
                    <div className="qr-data-display-meta-item">
                      <span>Source Device:</span>
                      <span>{parsedData.transferData.sourceDevice}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="qr-data-display-actions">
          {parsedData.error ? (
            <button 
              className="qr-data-display-button qr-data-display-button-secondary"
              onClick={onCancel}
            >
              Close
            </button>
          ) : (
            <>
              <button 
                className="qr-data-display-button qr-data-display-button-secondary"
                onClick={onCancel}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className="qr-data-display-button qr-data-display-button-primary"
                onClick={handleImport}
                disabled={isProcessing || !parsedData.transferData}
              >
                {isProcessing ? 'Importing...' : 'Import Sessions'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 