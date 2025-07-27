/**
 * QRCodeDialog - Responsive dialog component for displaying QR codes
 * 
 * Handles QR code display with session transfer information, countdown timer,
 * and responsive design for mobile/desktop compatibility.
 */

import { QRCodeGenerator, type SessionTransferData } from './QRCodeGenerator';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface QRCodeDialogOptions {
  sessions: SessionTransferData[];
  onClose?: () => void;
  title?: string;
  showCopyButton?: boolean;
}

// ============================================================================
// QR CODE DIALOG CLASS
// ============================================================================

export class QRCodeDialog {
  private options: QRCodeDialogOptions;
  private dialogElement: HTMLElement | null = null;
  private backdropElement: HTMLElement | null = null;
  private qrDataUrl: string | null = null;
  private isVisible: boolean = false;

  constructor(options: QRCodeDialogOptions) {
    this.options = {
      title: 'Share Login QR Code',
      showCopyButton: true,
      ...options
    };
  }

  /**
   * Show the QR code dialog
   */
  async show(): Promise<void> {
    try {
      // Generate QR code
      console.log('[QRCodeDialog] Generating QR code for', this.options.sessions.length, 'sessions');
      this.qrDataUrl = await QRCodeGenerator.generateSessionTransferQR(this.options.sessions);

      // Create and show dialog
      this.createDialog();
      this.appendToDocument();
      this.setupEventHandlers();
      
      // Animate in
      setTimeout(() => {
        if (this.backdropElement) {
          this.backdropElement.classList.add('qr-dialog-backdrop-visible');
        }
        if (this.dialogElement) {
          this.dialogElement.classList.add('qr-dialog-visible');
        }
      }, 10);

      this.isVisible = true;
      
      // Focus trap
      this.focusDialog();

    } catch (error) {
      console.error('[QRCodeDialog] Failed to show dialog:', error);
      throw new Error(`Failed to display QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Hide the QR code dialog
   */
  hide(): void {
    if (!this.isVisible) return;

    // Animate out
    if (this.backdropElement) {
      this.backdropElement.classList.remove('qr-dialog-backdrop-visible');
    }
    if (this.dialogElement) {
      this.dialogElement.classList.remove('qr-dialog-visible');
    }

    // Remove after animation
    setTimeout(() => {
      this.cleanup();
    }, 200); // Match CSS transition duration

    this.isVisible = false;

    // Call onClose callback
    if (this.options.onClose) {
      this.options.onClose();
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Create the dialog DOM structure
   */
  private createDialog(): void {
    // Create backdrop
    this.backdropElement = document.createElement('div');
    this.backdropElement.className = 'qr-dialog-backdrop';

    // Create dialog container
    this.dialogElement = document.createElement('div');
    this.dialogElement.className = 'qr-dialog';
    this.dialogElement.setAttribute('role', 'dialog');
    this.dialogElement.setAttribute('aria-modal', 'true');
    this.dialogElement.setAttribute('aria-labelledby', 'qr-dialog-title');

    // Build dialog content
    this.dialogElement.innerHTML = this.createDialogHTML();

    // Append dialog to backdrop
    this.backdropElement.appendChild(this.dialogElement);
  }

  /**
   * Create the dialog HTML content
   */
  private createDialogHTML(): string {
    const sessionCount = this.options.sessions.length;
    const sessionText = sessionCount === 1 ? 'account' : 'accounts';

    return `
      <div class="qr-dialog-header">
        <h3 id="qr-dialog-title" class="qr-dialog-title">
          ${this.options.title}
        </h3>
        <button class="qr-dialog-close" aria-label="Close dialog">
          ×
        </button>
      </div>

      <div class="qr-dialog-content">
        <div class="qr-code-container">
          <img 
            src="${this.qrDataUrl}" 
            alt="QR Code for session transfer" 
            class="qr-code-image"
          />
        </div>

        <div class="qr-transfer-info">
          <p class="qr-session-count">
            📱 Transferring ${sessionCount} ${sessionText}
          </p>
          <p class="qr-instructions">
            Scan this code with your mobile device to transfer your login sessions
          </p>
        </div>

        ${this.options.showCopyButton ? `
          <div class="qr-actions">
            <button class="qr-copy-button">
              📋 Copy Sessions Data
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Append dialog to document
   */
  private appendToDocument(): void {
    if (this.backdropElement) {
      document.body.appendChild(this.backdropElement);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.backdropElement || !this.dialogElement) return;

    // Close button
    const closeButton = this.dialogElement.querySelector('.qr-dialog-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.hide());
    }

    // Copy button
    const copyButton = this.dialogElement.querySelector('.qr-copy-button');
    if (copyButton && this.options.showCopyButton) {
      copyButton.addEventListener('click', () => this.handleCopyData());
    }

    // Backdrop click to close
    this.backdropElement.addEventListener('click', (e) => {
      if (e.target === this.backdropElement) {
        this.hide();
      }
    });

    // Escape key to close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hide();
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
  }

  /**
   * Handle copy sessions data
   */
  private async handleCopyData(): Promise<void> {
    try {
      const transferData = {
        sessions: this.options.sessions,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      const dataString = JSON.stringify(transferData, null, 2);
      
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(dataString);
        console.log('[QRCodeDialog] Session data copied to clipboard');
        
        // Show success feedback
        this.showCopySuccess();
      } else {
        // Fallback for older browsers
        this.fallbackCopyToClipboard(dataString);
      }
    } catch (error) {
      console.error('[QRCodeDialog] Failed to copy data:', error);
      this.showCopyError();
    }
  }

  /**
   * Show copy success feedback
   */
  private showCopySuccess(): void {
    const copyButton = this.dialogElement?.querySelector('.qr-copy-button');
    if (copyButton) {
      const originalText = copyButton.textContent;
      copyButton.textContent = '✅ Copied!';
      copyButton.setAttribute('disabled', 'true');
      
      setTimeout(() => {
        copyButton.textContent = originalText;
        copyButton.removeAttribute('disabled');
      }, 2000);
    }
  }

  /**
   * Show copy error feedback
   */
  private showCopyError(): void {
    const copyButton = this.dialogElement?.querySelector('.qr-copy-button');
    if (copyButton) {
      const originalText = copyButton.textContent;
      copyButton.textContent = '❌ Copy failed';
      
      setTimeout(() => {
        copyButton.textContent = originalText;
      }, 2000);
    }
  }

  /**
   * Fallback copy method for older browsers
   */
  private fallbackCopyToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showCopySuccess();
    } catch (error) {
      console.error('[QRCodeDialog] Fallback copy failed:', error);
      this.showCopyError();
    } finally {
      document.body.removeChild(textArea);
    }
  }

  /**
   * Focus the dialog for accessibility
   */
  private focusDialog(): void {
    if (this.dialogElement) {
      this.dialogElement.focus();
    }
  }

  /**
   * Cleanup dialog and restore page state
   */
  private cleanup(): void {
    // Remove from DOM
    if (this.backdropElement && this.backdropElement.parentNode) {
      this.backdropElement.parentNode.removeChild(this.backdropElement);
    }

    // Restore body scroll
    document.body.style.overflow = '';

    // Clear references
    this.dialogElement = null;
    this.backdropElement = null;
    this.qrDataUrl = null;
  }

  /**
   * Check if dialog is currently visible
   */
  isOpen(): boolean {
    return this.isVisible;
  }
} 