interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

export class SessionServiceProxy {
  private iframe: HTMLIFrameElement;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private isReady = false;
  private readyPromise: Promise<void>;
  private readyResolve: (() => void) | null = null;

  constructor(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
    
    // Setup ready promise
    this.readyPromise = new Promise((resolve) => {
      this.readyResolve = resolve;
    });

    // Listen for responses
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  public async waitForReady(): Promise<void> {
    return this.readyPromise;
  }

  public async addSession(session: any): Promise<void> {
    return this.sendRequest('addSession', { session });
  }

  public async removeSession(sessionId: string): Promise<void> {
    return this.sendRequest('removeSession', { sessionId });
  }

  public async syncWithDatabase(): Promise<any> {
    return this.sendRequest('syncWithDatabase');
  }

  public async getAllSessions(): Promise<any[]> {
    try {
      return await this.sendRequest('getAllSessions');
    } catch (error) {
      console.error('[SessionServiceProxy] getAllSessions failed:', error);
      throw error;
    }
  }

  public async getActiveSession(): Promise<any> {
    return this.sendRequest('getActiveSession');
  }

  public async setActiveSession(sessionId: string): Promise<void> {
    return this.sendRequest('setActiveSession', { sessionId });
  }

  private async sendRequest(operation: string, data?: any): Promise<any> {
    await this.waitForReady();

    // Check if iframe is accessible
    if (!this.iframe.contentWindow) {
      throw new Error(`Session service iframe not accessible for operation: ${operation}`);
    }

    const requestId = this.generateRequestId();
    
    return new Promise((resolve, reject) => {
      // Setup timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Session service request timeout: ${operation}`));
      }, 10000);

      this.pendingRequests.set(requestId, { resolve, reject, timeout });

      // Send message to iframe - now we know contentWindow exists
      this.iframe.contentWindow!.postMessage({
        type: 'session-operation',
        operation,
        data,
        requestId
      }, '*');
    });
  }

  private handleMessage(event: MessageEvent): void {
    if (!event.data) return;

    // Handle ready notification
    if (event.data.type === 'session-service-ready') {
      console.log('[SessionServiceProxy] Session service is ready');
      this.isReady = true;
      if (this.readyResolve) {
        this.readyResolve();
        this.readyResolve = null;
      }
      return;
    }

    // Handle operation responses
    if (event.data.type === 'session-operation-response') {
      const { requestId, success, data, error } = event.data;
      const pendingRequest = this.pendingRequests.get(requestId);
      
      if (pendingRequest) {
        clearTimeout(pendingRequest.timeout);
        this.pendingRequests.delete(requestId);
        
        if (success) {
          pendingRequest.resolve(data);
        } else {
          pendingRequest.reject(new Error(error || 'Unknown session service error'));
        }
      }
    }
  }

  private generateRequestId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public destroy(): void {
    // Clear any pending requests
    this.pendingRequests.forEach((request) => {
      clearTimeout(request.timeout);
      request.reject(new Error('Session service proxy destroyed'));
    });
    this.pendingRequests.clear();

    window.removeEventListener('message', this.handleMessage.bind(this));
  }
} 