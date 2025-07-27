/**
 * QRScanner Component
 * 
 * Camera-based QR code scanner for session transfer.
 * Uses getUserMedia for camera access and jsQR for QR code detection.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface QRScannerProps {
  onQRScanned: (qrData: string) => void;
  onClose: () => void;
  onError: (error: string) => void;
  isActive: boolean;
}

export interface QRScannerState {
  isScanning: boolean;
  hasPermission: boolean | null;
  error: string | null;
  instruction: string;
  isLoading: boolean;
}

// ============================================================================
// QR SCANNER COMPONENT
// ============================================================================

export const QRScanner: React.FC<QRScannerProps> = ({
  onQRScanned,
  onClose,
  onError,
  isActive
}) => {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  // State
  const [state, setState] = useState<QRScannerState>({
    isScanning: false,
    hasPermission: null,
    error: null,
    instruction: 'Requesting camera permission...',
    isLoading: true
  });

  // ============================================================================
  // CAMERA MANAGEMENT
  // ============================================================================

  const startCamera = useCallback(async () => {
    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null, 
        instruction: 'Starting camera...' 
      }));

      // Request camera access (prefer back camera)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Back camera preferred
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        setState(prev => ({
          ...prev,
          hasPermission: true,
          isLoading: false,
          instruction: 'Point your camera at the QR code'
        }));

        // Start scanning loop
        startScanning();
      }

    } catch (error) {
      console.error('[QRScanner] Camera access failed:', error);
      
      let errorMessage = 'Camera access failed';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported in this browser.';
        }
      }

      setState(prev => ({
        ...prev,
        hasPermission: false,
        isLoading: false,
        error: errorMessage,
        instruction: 'Camera access required'
      }));

      onError(errorMessage);
    }
  }, [onError]);

  const stopCamera = useCallback(() => {
    // Stop animation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isScanning: false,
      isLoading: false
    }));
  }, []);

  // ============================================================================
  // QR CODE SCANNING
  // ============================================================================

  const startScanning = useCallback(() => {
    setState(prev => ({ ...prev, isScanning: true }));
    scanFrame();
  }, []);

  const scanFrame = useCallback(() => {
    if (!state.isScanning || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      // Continue scanning
      animationRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR scanning
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Scan for QR code using jsQR
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert' // Performance optimization
    });

    if (qrCode) {
      // QR code found!
      console.log('[QRScanner] QR code detected:', qrCode.data.substring(0, 100) + '...');
      
      setState(prev => ({
        ...prev,
        isScanning: false,
        instruction: 'QR code detected! Processing...'
      }));

      // Stop scanning and notify parent
      stopCamera();
      onQRScanned(qrCode.data);
    } else {
      // Continue scanning
      animationRef.current = requestAnimationFrame(scanFrame);
    }
  }, [state.isScanning, onQRScanned, stopCamera]);

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [isActive, startCamera, stopCamera]);

  // Update scanFrame dependency
  useEffect(() => {
    if (state.isScanning) {
      animationRef.current = requestAnimationFrame(scanFrame);
    }
  }, [state.isScanning, scanFrame]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isActive) {
    return null;
  }

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-backdrop" onClick={onClose} />
      
      <div className="qr-scanner-container">
        {/* Header */}
        <div className="qr-scanner-header">
          <h3 className="qr-scanner-title">Scan QR Code</h3>
          <button 
            className="qr-scanner-close"
            onClick={onClose}
            aria-label="Close QR scanner"
          >
            ×
          </button>
        </div>

        {/* Camera View */}
        <div className="qr-scanner-camera">
          {state.isLoading && (
            <div className="qr-scanner-loading">
              <div className="qr-scanner-spinner" />
              <p>Starting camera...</p>
            </div>
          )}

          {state.hasPermission === false && (
            <div className="qr-scanner-error">
              <div className="qr-scanner-error-icon">📷</div>
              <p className="qr-scanner-error-message">{state.error}</p>
              <button 
                className="qr-scanner-retry"
                onClick={startCamera}
              >
                Try Again
              </button>
            </div>
          )}

          {state.hasPermission && (
            <>
              <video 
                ref={videoRef}
                className="qr-scanner-video"
                playsInline
                muted
              />
              
              {/* Scanning overlay */}
              <div className="qr-scanner-overlay-ui">
                <div className="qr-scanner-frame">
                  <div className="qr-scanner-corner qr-scanner-corner-tl" />
                  <div className="qr-scanner-corner qr-scanner-corner-tr" />
                  <div className="qr-scanner-corner qr-scanner-corner-bl" />
                  <div className="qr-scanner-corner qr-scanner-corner-br" />
                </div>
                
                {state.isScanning && (
                  <div className="qr-scanner-scan-line" />
                )}
              </div>
            </>
          )}

          {/* Hidden canvas for image processing */}
          <canvas 
            ref={canvasRef}
            className="qr-scanner-canvas"
            style={{ display: 'none' }}
          />
        </div>

        {/* Instructions */}
        <div className="qr-scanner-instructions">
          <p>{state.instruction}</p>
          {state.isScanning && (
            <p className="qr-scanner-hint">
              Make sure the QR code is clearly visible and well-lit
            </p>
          )}
        </div>

        {/* Cancel Button */}
        <div className="qr-scanner-actions">
          <button 
            className="qr-scanner-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}; 