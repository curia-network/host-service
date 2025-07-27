# QR Login Feature Research & Implementation Roadmap

**Created:** January 2025  
**Status:** Research Phase  
**Priority:** Medium  

## 📋 **EXECUTIVE SUMMARY**

This document outlines the research and implementation strategy for adding QR code login functionality to the Curia platform. The feature will enable users to:

1. **Generate QR codes** from any device via the user profile menu
2. **Scan QR codes** on mobile/tablet devices during the initial login flow
3. **Transfer all active sessions** from one device to another securely
4. **Maintain session synchronization** across multiple devices

---

## 🔍 **CURRENT STATE ANALYSIS**

### **Authentication Architecture Overview**

#### **Session Management System**
- **Multi-session support**: Users can maintain multiple active sessions (ENS, Universal Profile, Anonymous)
- **Database persistence**: Sessions stored in `authentication_sessions` table with 30-day expiration
- **Cross-tab sync**: Uses `SessionManager` with localStorage + BroadcastChannel
- **Token structure**: JWT tokens containing user identity and community context

```typescript
interface SessionData {
  sessionToken: string;
  userId: string; // Format: "ens:vitalik.eth" or "up:0x123..."
  identityType: 'ens' | 'universal_profile' | 'anonymous';
  walletAddress?: string;
  ensName?: string;
  upAddress?: string;
  name?: string;
  profileImageUrl?: string;
  expiresAt: Date;
  lastAccessedAt: Date;
  isActive: boolean;
}
```

#### **Current Authentication Flow**
1. **Challenge Generation**: `/api/auth/generate-challenge` creates timestamped challenge
2. **Wallet Signing**: User signs challenge with wallet (ENS/UP)
3. **Signature Verification**: `/api/auth/verify-signature` validates signature
4. **Session Creation**: Atomic transaction creates user + session
5. **Token Distribution**: JWT token stored in SessionManager
6. **Cross-tab Sync**: BroadcastChannel notifies other tabs

#### **Session Storage Architecture**
```typescript
// SessionManager stores in localStorage under 'curia_sessions'
interface SessionStorage {
  activeSessions: SessionData[];
  activeSessionToken: string | null;
  lastSyncedAt: number;
  version: number;
}
```

### **Current User Profile Menu Actions**
```typescript
// Desktop: UserProfileComponent
// Mobile: MobileProfileDrawer
// Current actions: 'add-session', 'sign-out', 'switch-session', 'settings'
```

---

## 🛠️ **TECHNICAL REQUIREMENTS**

### **QR Code Generation Dependencies**

#### **Recommended Library: `qrcode`**
```bash
yarn add qrcode
yarn add @types/qrcode --dev
```

**Why `qrcode`:**
- ✅ Lightweight (45KB gzipped)
- ✅ Browser + Node.js support
- ✅ Canvas, SVG, and data URL output
- ✅ TypeScript support
- ✅ High customization options
- ✅ Error correction levels

**Alternative: `qr-code-generator`**
- Smaller footprint (20KB)
- Less features but sufficient for basic use

#### **QR Code Generation Implementation**
```typescript
import QRCode from 'qrcode';

async function generateSessionTransferQR(transferToken: string): Promise<string> {
  const transferUrl = `${window.location.origin}/transfer-session?token=${transferToken}`;
  
  return await QRCode.toDataURL(transferUrl, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.92,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    width: 256
  });
}
```

---

## 🔐 **SIMPLIFIED SECURITY ARCHITECTURE**

### **Direct Session Transfer System**

#### **No Backend Required! 🎉**
- **Direct QR encoding**: Session data encoded directly into QR code
- **Local storage transfer**: Direct localStorage-to-localStorage transfer  
- **No APIs needed**: No server-side token generation or validation
- **Real-time transfer**: Immediate session import on QR scan

#### **Security Through Simplicity**
- **Minimal attack surface**: No server-side token storage
- **Ephemeral transfer**: QR code expires when dialog closes
- **Local validation**: SessionManager handles session validation
- **User-controlled**: Transfer only happens when user explicitly scans

#### **Session Data Encoding**
```typescript
interface QRTransferData {
  sessions: SessionData[];
  timestamp: number;
  version: string;
  sourceDevice?: string;
}

function encodeSessionsForQR(sessions: SessionData[]): string {
  const transferData: QRTransferData = {
    sessions: sessions.filter(s => s.isActive && s.expiresAt > new Date()),
    timestamp: Date.now(),
    version: '1.0',
    sourceDevice: navigator.userAgent.slice(0, 50) // Optional device info
  };
  
  return JSON.stringify(transferData);
}

async function generateSessionQR(sessions: SessionData[]): Promise<string> {
  const dataString = encodeSessionsForQR(sessions);
  return await QRCode.toDataURL(dataString, {
    errorCorrectionLevel: 'M',
    width: 256
  });
}
```

---

## 📱 **DEVICE-SPECIFIC IMPLEMENTATION**

### **Mobile/Tablet Detection Strategy**

#### **Enhanced Mobile Detection**
```typescript
// Extend existing responsive utils
export function isMobileOrTablet(): boolean {
  const userAgent = navigator.userAgent || navigator.vendor;
  const isMobileWidth = window.innerWidth < 1024; // Tablet breakpoint
  const isTouchDevice = 'ontouchstart' in window;
  
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isUserAgentMobile = mobileRegex.test(userAgent);
  
  return (isMobileWidth && isTouchDevice) || isUserAgentMobile;
}

export function canScanQRCode(): boolean {
  return isMobileOrTablet() && 'mediaDevices' in navigator;
}

export function canGenerateQRCode(): boolean {
  return true; // All devices can generate QR codes
}
```

### **Authentication Flow Modifications**

#### **Current Embed Authentication Flow**
```
1. User visits embed route: /embed
2. AuthenticationStep component renders
3. Options: ENS, Universal Profile, Anonymous
4. User selects identity type
5. Wallet connection + signature
6. Session creation
```

#### **Enhanced Flow with QR Login**
```
1. User visits embed route: /embed
2. AuthenticationStep component renders
3. Enhanced options:
   - ENS Wallet
   - Universal Profile  
   - Anonymous
   - 📱 [Mobile/Tablet Only] "Login with QR Code"
4. QR Login flow (mobile/tablet only):
   a. Show QR scanner interface
   b. Scan QR code from another device
   c. Validate transfer token
   d. Import all sessions from source device
   e. Set active session
```

---

## 🎨 **USER EXPERIENCE FLOWS**

### **Flow 1: Generate QR Code (Any Device → Mobile/Tablet)**

#### **Scenario**: User wants to login to their phone using their laptop
```
👤 User on Laptop (Has Active Sessions)
1. Click profile avatar in community sidebar
2. See menu with: "Add Account", "Sign Out", "🔲 Share Login QR"
3. Click "Share Login QR"
4. Modal opens with:
   - QR code display
   - "Scan this code with your phone to login"
   - "Code expires in 4:32"
   - List of sessions that will be transferred
5. User scans with phone camera

📱 User on Phone (New Device)
1. Opens camera app or QR scanner
2. Scans QR code
3. Redirected to: host-service.com/transfer-session?token=ABC123
4. Page detects mobile device
5. Shows session transfer confirmation:
   - "Login from [Device Name]?"
   - List of accounts being transferred
   - "Confirm Transfer" button
6. Click confirm
7. All sessions imported to phone
8. Redirected to last active community
```

### **Flow 2: QR Scanner in Embed Login (Mobile/Tablet Only)**

#### **Scenario**: New user on mobile wants to login using QR from friend's device
```
📱 New User on Phone
1. Visits community embed on mobile
2. Sees login options:
   - Connect ENS Wallet
   - Connect Universal Profile
   - Continue as Guest
   - 📱 "Login with QR Code" (mobile only!)
3. Taps "Login with QR Code"
4. Camera permission requested
5. QR scanner interface opens
6. User scans QR code from friend's device
7. Sessions transferred and user logged in

💻 Friend on Desktop/Laptop
1. Generates QR code from profile menu
2. Shows QR to new user for scanning
```

### **Flow 3: Phone-to-Phone Transfer**

#### **Scenario**: User wants to transfer sessions from old phone to new phone
```
📱 Old Phone (Source)
1. Open profile menu
2. Tap "Share Login QR"
3. Show QR code

📱 New Phone (Target)  
1. During login flow, tap "Login with QR Code"
2. Scan QR code from old phone
3. Sessions transferred to new phone
```

---

## 🎯 **PHASE 1 FOCUS: PROFILE MENU QR GENERATION**

### **Priority Implementation: "Share Login QR" Feature**

Based on user feedback, we're prioritizing the profile menu QR generation feature first. This will allow users on any device to generate QR codes for session transfer.

#### **Core Requirements:**
- ✅ Available on all devices (desktop, tablet, mobile)
- ✅ Access session data via existing SessionManager
- ✅ Generate QR code containing transfer token
- ✅ Display in responsive dialog component
- ✅ Use existing Radix/shadcn UI components

---

## 🔧 **PROFILE MENU QR IMPLEMENTATION SPEC**

### **1. SessionManager Integration**

#### **1.1 Reading Session Data**
```typescript
// Leverage existing SessionManager methods
import { SessionManager } from '@/lib/SessionManager';

// Get all active sessions for QR generation
const sessionManager = SessionManager.getInstance();
const activeSessions = sessionManager.getAllSessions();
const activeToken = sessionManager.getActiveToken();

// Filter valid sessions for transfer
const transferableSessions = activeSessions.filter(session => 
  session.isActive && 
  session.expiresAt > new Date() &&
  session.sessionToken
);
```

#### **1.2 Session Data Structure for Transfer**
```typescript
interface SessionTransferPayload {
  sessions: {
    sessionToken: string;
    userId: string;
    identityType: 'ens' | 'universal_profile' | 'anonymous';
    name?: string;
    profileImageUrl?: string;
    walletAddress?: string;
    ensName?: string;
    upAddress?: string;
  }[];
  transferToken: string;
  expiresAt: number;
  sourceDevice: string;
}
```

### **2. QR Code Generation Component**

#### **2.1 QRCodeGenerator Utility**
```typescript
// src/lib/embed/components/qr/QRCodeGenerator.ts
import QRCode from 'qrcode';

export class QRCodeGenerator {
  /**
   * Generate QR code containing session data directly
   * @param sessions - Array of SessionData to transfer
   * @returns Data URL for QR code image
   */
  static async generateSessionTransferQR(sessions: SessionData[]): Promise<string> {
    const transferData = {
      sessions: sessions.filter(s => s.isActive && s.expiresAt > new Date()),
      timestamp: Date.now(),
      version: '1.0'
    };
    
    const dataString = JSON.stringify(transferData);
    
    return await QRCode.toDataURL(dataString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
  }

  /**
   * Parse session data from QR code scan
   * @param qrData - Scanned QR code data string
   * @returns Parsed session transfer data
   */
  static parseSessionTransferData(qrData: string): QRTransferData {
    try {
      const parsed = JSON.parse(qrData);
      // Validate structure
      if (!parsed.sessions || !Array.isArray(parsed.sessions)) {
        throw new Error('Invalid QR code format');
      }
      return parsed;
    } catch (error) {
      throw new Error('Failed to parse QR code data');
    }
  }
}
```

#### **2.2 QR Code Dialog Component**
```typescript
// src/lib/embed/components/qr/QRCodeDialog.ts
export interface QRCodeDialogOptions {
  sessions: SessionData[];
  onClose: () => void;
}

export class QRCodeDialog {
  private options: QRCodeDialogOptions;
  private dialogElement: HTMLElement | null = null;
  
  constructor(options: QRCodeDialogOptions) {
    this.options = options;
  }

  /**
   * Show QR code dialog with session transfer info
   */
  async show(): Promise<void> {
    const qrDataUrl = await QRCodeGenerator.generateSessionTransferQR(this.options.transferToken);
    const transferUrl = QRCodeGenerator.generateTransferUrl(this.options.transferToken);
    
    this.dialogElement = this.createDialog(qrDataUrl, transferUrl);
    document.body.appendChild(this.dialogElement);
    
    // Focus trap and escape handling
    this.setupEventHandlers();
  }

  /**
   * Hide and cleanup dialog
   */
  hide(): void {
    if (this.dialogElement) {
      this.dialogElement.remove();
      this.dialogElement = null;
    }
  }

  private createDialog(qrDataUrl: string, transferUrl: string): HTMLElement {
    // Create responsive dialog with:
    // - QR code image
    // - Session count info
    // - Expiry countdown
    // - Manual URL sharing option
    // - Close button
  }
}
```

### **3. Profile Menu Integration**

#### **3.1 Enhanced Menu Actions**
```typescript
// Update UserProfileComponent.createMenuActions()
private createMenuActions(): string {
  const sessionCount = this.sessionManager.getAllSessions().length;
  const hasTransferableSessions = sessionCount > 0;
  
  return `
    <div class="profile-menu-actions">
      <button class="profile-menu-action" data-action="add-session">
        <div class="profile-menu-action-icon">➕</div>
        <span>Add Another Account</span>
      </button>
      ${hasTransferableSessions ? `
        <button class="profile-menu-action" data-action="share-qr">
          <div class="profile-menu-action-icon">📱</div>
          <span>Share Login QR</span>
          <div class="profile-menu-action-badge">${sessionCount}</div>
        </button>
      ` : ''}
      <button class="profile-menu-action" data-action="sign-out">
        <div class="profile-menu-action-icon">🚪</div>
        <span>Sign Out</span>
      </button>
    </div>
  `;
}
```

#### **3.2 Action Handler Enhancement**
```typescript
// Update action handler in UserProfileComponent
private attachMenuHandlers(menu: HTMLElement): void {
  menu.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    const actionElement = target.closest('[data-action]') as HTMLElement;
    
    if (!actionElement) return;
    
    const action = actionElement.getAttribute('data-action');
    
    if (action === 'share-qr') {
      await this.handleShareQR();
    } else if (action === 'switch-session') {
      // Existing session switch logic
    } else if (this.options.onMenuAction) {
      this.options.onMenuAction(action);
    }
  });
}

private async handleShareQR(): Promise<void> {
  try {
    // 1. Get transferable sessions
    const sessions = this.sessionManager.getAllSessions()
      .filter(s => s.isActive && s.expiresAt > new Date());
    
    if (sessions.length === 0) {
      // Show error: no sessions to transfer
      console.warn('[UserProfile] No active sessions to transfer');
      return;
    }

    // 2. Show QR dialog with session data directly
    const qrDialog = new QRCodeDialog({
      sessions,
      onClose: () => qrDialog.hide()
    });
    
    await qrDialog.show();
    
  } catch (error) {
    console.error('[UserProfile] QR generation failed:', error);
    // Show error message to user
  }
}
```

### **4. Responsive Dialog Design**

#### **4.1 Mobile-First Dialog**
```scss
// QR Dialog responsive styles
.qr-transfer-dialog {
  // Mobile (default)
  width: 90vw;
  max-width: 400px;
  max-height: 90vh;
  
  .qr-code-container {
    padding: 1rem;
    
    .qr-image {
      width: 100%;
      max-width: 256px;
      height: auto;
      border-radius: 8px;
    }
  }
  
  // Tablet and up
  @media (min-width: 768px) {
    width: 480px;
    max-height: 600px;
    
    .qr-code-container {
      padding: 1.5rem;
      
      .qr-image {
        max-width: 320px;
      }
    }
  }
  
  // Desktop
  @media (min-width: 1024px) {
    width: 520px;
    
    .qr-code-container {
      padding: 2rem;
    }
  }
}
```

#### **4.2 Dialog Content Structure**
```html
<div class="qr-transfer-dialog">
  <div class="dialog-header">
    <h3>Share Login QR Code</h3>
    <button class="dialog-close">×</button>
  </div>
  
  <div class="dialog-content">
    <div class="qr-code-container">
      <img src="data:image/png;base64,..." alt="QR Code" class="qr-image" />
    </div>
    
    <div class="transfer-info">
      <p class="session-count">
        📱 Transferring {{ sessionCount }} account{{ sessionCount > 1 ? 's' : '' }}
      </p>
      <p class="expiry-timer">
        ⏱️ Expires in <span class="countdown">4:32</span>
      </p>
    </div>
    
    <div class="manual-share">
      <button class="copy-url-btn">
        📋 Copy Link Instead
      </button>
    </div>
  </div>
</div>
```

---

## 🛣️ **FOCUSED IMPLEMENTATION ROADMAP**

### **Week 1: Core QR Generation (Priority)**

#### **Day 1-2: QR Infrastructure**
1. ✅ QR dependencies installed (`qrcode` + types)
2. Create `QRCodeGenerator` utility class
3. Create basic `QRCodeDialog` component
4. Test QR generation with mock data

#### **Day 3-4: Profile Menu Integration**  
1. Update `UserProfileComponent.createMenuActions()`
2. Add "Share Login QR" action handler
3. Integrate with existing SessionManager
4. Add session filtering logic

#### **Day 5-7: Dialog Implementation**
1. Build responsive dialog component
2. Add countdown timer for expiry
3. Implement copy-to-clipboard functionality
4. Style for mobile/desktop compatibility

### **Week 2: QR Scanner Implementation** 

#### **Day 1-3: Camera Integration**
1. Add QR scanner to mobile/tablet login flow
2. Implement getUserMedia for camera access
3. Add QR code detection and parsing
4. Connect to SessionManager for session import

#### **Day 4-5: Testing & Polish**
1. Test QR generation across devices
2. Test QR scanning on different mobile devices
3. Verify session data transfer accuracy
4. Error handling and edge cases

### **Week 3: Mobile Profile Drawer**

#### **Day 1-2: Mobile Integration**
1. Update `MobileProfileDrawer.renderActions()`
2. Ensure QR dialog works on mobile
3. Test touch interactions

#### **Day 3-5: Final Testing**
1. Cross-device QR generation testing
2. Performance optimization
3. Accessibility compliance
4. User acceptance testing

---

## 🔧 **IMPLEMENTATION ROADMAP (FULL FEATURE)**

### **Phase 1: QR Code Infrastructure (Week 1)** ✅ PRIORITY

#### **1.1 Dependencies & Core Components** ✅ COMPLETED
```typescript
// ✅ Added to package.json
{
  "dependencies": {
    "qrcode": "^1.5.4"
  },
  "devDependencies": {
    "@types/qrcode": "^1.5.5"
  }
}
```

#### **1.2 QR Code Generation Component**
```typescript
// src/lib/embed/components/qr/QRCodeGenerator.ts
export class QRCodeGenerator {
  static async generateTransferQR(transferToken: string): Promise<string>
  static generateTransferUrl(transferToken: string): string
}

// src/lib/embed/components/qr/QRCodeDialog.ts
export class QRCodeDialog {
  // Modal component for showing QR code + transfer info
}
```

#### **1.3 Enhanced Device Detection**
```typescript
// src/lib/embed/utils/responsive.ts
export function isMobileOrTablet(): boolean
export function canScanQRCode(): boolean  
export function canGenerateQRCode(): boolean
```

### **Phase 2: QR Scanner Implementation (Week 2)**

#### **2.1 Camera Integration**
```typescript
// Camera access and QR detection
// Mobile/tablet camera integration
// QR code parsing and validation
```

#### **2.2 QR Scanner Component**
```typescript
// src/lib/embed/components/qr/QRScanner.ts
export class QRScanner {
  static async requestCameraPermission(): Promise<boolean>
  static async startScanning(): Promise<void>
  static onQRDetected(callback: (data: string) => void): void
  static stopScanning(): void
}

// Integration with authentication flow
// Camera permission handling
// QR code detection and parsing
```

#### **2.3 Session Import Logic**
```typescript
// SessionManager integration for importing scanned sessions
// Validation of QR data structure
// Merge strategy for existing sessions
// Error handling for invalid QR codes
```

### **Phase 3: Profile Menu Integration (Week 2)**

#### **3.1 Desktop Profile Menu**
```typescript
// Update UserProfileComponent.createMenuActions()
// Add "Share Login QR" action for devices with active sessions
```

#### **3.2 Mobile Profile Drawer**
```typescript
// Update MobileProfileDrawer.renderActions()
// Add "Share Login QR" action
```

#### **3.3 Action Handler**
```typescript
// Handle 'generate-qr' action
// Show QRCodeModal with transfer token
```

### **Phase 4: Embed Login Enhancement (Week 2-3)**

#### **4.1 AuthenticationStep Enhancement**
```typescript
// src/components/embed/AuthenticationStep.tsx
// Add conditional "Login with QR Code" option for mobile/tablet
```

#### **4.2 QR Scanner Component**
```typescript
// src/components/embed/QRScannerStep.tsx
// Camera interface for scanning QR codes
// Integration with getUserMedia API
```

#### **4.3 Session Transfer Landing Page**
```typescript
// src/app/transfer-session/page.tsx
// Landing page for QR code transfers
// Device detection and session claiming
```

### **Phase 5: SessionManager Integration (Week 3)**

#### **5.1 Transfer Token Management**
```typescript
// SessionManager.generateTransferToken()
// SessionManager.claimSessions(token)
// SessionManager.handleTransferredSessions()
```

#### **5.2 Cross-Device Synchronization**
```typescript
// Update session sync logic
// Handle session import from transfer tokens
// Merge transferred sessions with existing ones
```

### **Phase 6: Testing & Polish (Week 3-4)**

#### **6.1 Cross-Device Testing**
- Desktop → Mobile transfer
- Mobile → Mobile transfer  
- Tablet → Phone transfer
- Error handling and edge cases

#### **6.2 Security Testing**
- Token expiration handling
- Rate limiting validation
- Device fingerprinting accuracy
- Replay attack prevention

#### **6.3 UX Polish**
- Loading states and animations
- Error messaging
- Success confirmations
- Accessibility compliance

---

## 🚨 **EDGE CASES & ERROR HANDLING**

### **Security Edge Cases**
1. **Expired tokens**: Clear error message, regenerate option
2. **Used tokens**: "This QR code has already been used"
3. **Rate limiting**: "Too many transfer requests, try again in X minutes"
4. **Invalid tokens**: "Invalid or corrupted QR code"

### **Device Edge Cases**
1. **Camera permissions denied**: Fallback to manual token entry
2. **No camera available**: Hide QR scanner option
3. **Network failures**: Retry mechanism with exponential backoff
4. **Session conflicts**: Merge strategy for duplicate sessions

### **UX Edge Cases**
1. **No active sessions**: Disable QR generation
2. **Single session**: Still allow transfer for consistency
3. **Anonymous sessions**: Include with clear labeling
4. **Expired sessions**: Filter out before transfer

---

## 🎯 **SUCCESS METRICS**

### **Technical Metrics**
- QR code generation time < 500ms
- Session transfer completion rate > 95%
- Token validation time < 200ms
- Cross-device sync accuracy 100%

### **User Experience Metrics**
- Transfer flow completion rate > 80%
- Time to complete transfer < 30 seconds
- User error rate < 5%
- Support ticket reduction for login issues

---

## 🔮 **FUTURE ENHANCEMENTS**

### **Phase 2 Features**
1. **Batch transfers**: Transfer specific sessions, not all
2. **Device management**: View/revoke sessions per device
3. **Transfer history**: Log of all QR transfers
4. **Push notifications**: Notify source device of successful transfer

### **Advanced Features**
1. **NFC transfer**: Alternative to QR codes for supported devices
2. **Bluetooth transfer**: Local device-to-device transfer
3. **Time-limited sessions**: Temporary access sessions
4. **Group transfers**: Share sessions with multiple users

---

## 📊 **IMPLEMENTATION ESTIMATE**

### **Development Timeline**
- **Week 1**: QR generation and profile menu integration
- **Week 2**: QR scanner for mobile/tablet login
- **Week 3**: Testing, polish, and mobile profile drawer
- **Total**: 2-3 weeks maximum

### **Technical Complexity**
- **QR Generation**: Low complexity ✅
- **Session data encoding**: Low complexity ✅
- **QR Scanner implementation**: Medium complexity
- **Cross-device testing**: Medium complexity

---

## ❓ **OPEN QUESTIONS**

### **Technical Questions**
1. Should we support partial session transfers (select specific accounts)?
2. How should we handle session conflicts when devices have overlapping sessions?
3. Should QR codes include session metadata for preview before transfer?
4. What's our strategy for handling different Common Ground plugin versions?

### **UX Questions**
1. Should the QR code modal show which sessions will be transferred?
2. How should we handle the case where a user scans their own QR code?
3. Should we support QR code sharing via other apps (SMS, email, etc.)?
4. What's the optimal QR code size for different screen sizes?

### **Security Questions**
1. Should we implement additional 2FA for sensitive session transfers?
2. How should we handle transfers between different Common Ground environments?
3. Should we log transfer events for audit purposes?
4. What's our policy for transfers involving admin/moderator sessions?

---

## 📚 **REFERENCES**

- [SessionManager Architecture](./session-manager-phase1-complete.md)
- [Authentication Flow Analysis](./auth-complete-enhancement-roadmap.md)
- [Mobile UI Implementation](./mobile-community-sidebar-implementation-roadmap.md)
- [Security Hardening Plan](./cors-security-hardening-plan.md)
- [Cross-Domain Session Research](./cross-domain-session-persistence-research.md) 