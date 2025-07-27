/**
 * Device detection utilities for QR scanner targeting
 * 
 * Determines when to show QR scanner option based on device type and capabilities.
 * QR scanner should only appear on mobile phones and tablets with camera access.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface DeviceCapabilities {
  hasCamera: boolean;
  hasTouchScreen: boolean;
  isTouch: boolean;
  userAgent: string;
}

// ============================================================================
// DEVICE DETECTION FUNCTIONS
// ============================================================================

/**
 * Detect device type based on user agent string
 * @param userAgent - Optional user agent string (defaults to navigator.userAgent)
 * @returns Device type classification
 */
export function detectDeviceType(userAgent?: string): DeviceType {
  const ua = (userAgent || navigator.userAgent).toLowerCase();
  
  // Tablet detection (wider screens with touch)
  // iPad, Android tablets, Windows tablets, etc.
  if (/tablet|ipad|playbook|silk|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  
  // Mobile detection (phones with touch)
  // iPhone, Android phones, Windows Phone, BlackBerry, etc.
  if (/mobile|iphone|ipod|android.*mobi|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(ua)) {
    return 'mobile';
  }
  
  // Default to desktop
  return 'desktop';
}

/**
 * Check if device is mobile or tablet
 * @returns True if device is mobile or tablet
 */
export function isMobileOrTablet(): boolean {
  const deviceType = detectDeviceType();
  return deviceType === 'mobile' || deviceType === 'tablet';
}

/**
 * Check if device is specifically mobile (not tablet)
 * @returns True if device is mobile phone
 */
export function isMobile(): boolean {
  return detectDeviceType() === 'mobile';
}

/**
 * Check if device is specifically tablet (not mobile)
 * @returns True if device is tablet
 */
export function isTablet(): boolean {
  return detectDeviceType() === 'tablet';
}

/**
 * Check if device is desktop
 * @returns True if device is desktop
 */
export function isDesktop(): boolean {
  return detectDeviceType() === 'desktop';
}

// ============================================================================
// CAMERA DETECTION
// ============================================================================

/**
 * Check if device has camera access available
 * @returns True if getUserMedia is supported
 */
export function hasCamera(): boolean {
  return !!(
    navigator.mediaDevices && 
    navigator.mediaDevices.getUserMedia &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );
}

/**
 * Check if device supports video input (more specific camera check)
 * @returns Promise that resolves to true if camera is available
 */
export async function hasCameraAsync(): Promise<boolean> {
  try {
    if (!hasCamera()) return false;
    
    // Try to enumerate devices to check for video input
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === 'videoinput');
  } catch (error) {
    console.warn('[DeviceDetection] Camera detection failed:', error);
    return false;
  }
}

// ============================================================================
// TOUCH DETECTION
// ============================================================================

/**
 * Check if device has touch screen capability
 * @returns True if touch is supported
 */
export function hasTouchScreen(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (window as any).DocumentTouch && document instanceof (window as any).DocumentTouch
  );
}

// ============================================================================
// QR SCANNER ELIGIBILITY
// ============================================================================

/**
 * Determine if QR scanner should be shown to user
 * 
 * Criteria:
 * - Device must be mobile or tablet (not desktop)
 * - Device must have camera access
 * - Browser must support getUserMedia
 * 
 * @returns True if QR scanner option should be displayed
 */
export function shouldShowQRScanner(): boolean {
  // Must be mobile or tablet
  if (!isMobileOrTablet()) {
    return false;
  }
  
  // Must have camera support
  if (!hasCamera()) {
    return false;
  }
  
  return true;
}

/**
 * Async version of shouldShowQRScanner with more thorough camera detection
 * @returns Promise that resolves to true if QR scanner should be shown
 */
export async function shouldShowQRScannerAsync(): Promise<boolean> {
  // Must be mobile or tablet
  if (!isMobileOrTablet()) {
    return false;
  }
  
  // Must have camera access
  if (!(await hasCameraAsync())) {
    return false;
  }
  
  return true;
}

// ============================================================================
// DEVICE CAPABILITIES
// ============================================================================

/**
 * Get comprehensive device capabilities
 * @returns Object with device capabilities
 */
export function getDeviceCapabilities(): DeviceCapabilities {
  return {
    hasCamera: hasCamera(),
    hasTouchScreen: hasTouchScreen(),
    isTouch: hasTouchScreen(), // Alias for convenience
    userAgent: navigator.userAgent
  };
}

/**
 * Get device info string for debugging/logging
 * @returns Human-readable device info
 */
export function getDeviceInfo(): string {
  const type = detectDeviceType();
  const capabilities = getDeviceCapabilities();
  
  return `${type} (${capabilities.hasCamera ? 'camera' : 'no-camera'}, ${capabilities.hasTouchScreen ? 'touch' : 'no-touch'})`;
}

// ============================================================================
// RESPONSIVE HELPERS
// ============================================================================

/**
 * Get device type with viewport consideration
 * Combines user agent detection with screen size
 * @returns More accurate device type considering both UA and viewport
 */
export function getResponsiveDeviceType(): DeviceType {
  const uaDeviceType = detectDeviceType();
  const viewportWidth = window.innerWidth;
  
  // If UA says desktop but viewport is small, might be mobile browser in desktop mode
  if (uaDeviceType === 'desktop' && viewportWidth < 768) {
    return 'mobile';
  }
  
  // If UA says mobile but viewport is large, might be tablet
  if (uaDeviceType === 'mobile' && viewportWidth >= 768) {
    return 'tablet';
  }
  
  return uaDeviceType;
}

/**
 * Check if current context is suitable for QR scanning
 * Considers device type, camera, permissions, and user experience
 * @returns True if context is good for QR scanning
 */
export function isQRScanningContext(): boolean {
  // Must pass basic eligibility
  if (!shouldShowQRScanner()) {
    return false;
  }
  
  // Additional UX considerations
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  
  // Viewport should be reasonable for camera scanning
  if (viewport.width < 320 || viewport.height < 240) {
    return false;
  }
  
  // Check if we're in a reasonable orientation (portrait preferred for QR scanning)
  const isPortrait = viewport.height > viewport.width;
  const isLandscapeTablet = isTablet() && !isPortrait;
  
  // Allow landscape tablets, they have enough screen real estate
  return isPortrait || isLandscapeTablet;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEVICE_BREAKPOINTS = {
  MOBILE_MAX: 767,
  TABLET_MIN: 768,
  TABLET_MAX: 1023,
  DESKTOP_MIN: 1024
} as const;

export const QR_SCANNER_REQUIREMENTS = {
  MIN_VIEWPORT_WIDTH: 320,
  MIN_VIEWPORT_HEIGHT: 240,
  PREFERRED_ORIENTATION: 'portrait'
} as const; 