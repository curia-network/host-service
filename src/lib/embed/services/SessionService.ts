import { sessionManager } from '@/lib/SessionManager';

interface SessionServiceMessage {
  type: 'session-operation';
  operation: string;
  data?: any;
  requestId: string;
}

interface SessionServiceResponse {
  type: 'session-operation-response';
  requestId: string;
  success: boolean;
  data?: any;
  error?: string;
}

export class SessionService {
  private initialized = false;

  public initialize(): void {
    if (this.initialized) return;
    
    console.log('[SessionService] Initializing session service');
    
    // Listen for messages from parent windows
    window.addEventListener('message', this.handleMessage.bind(this));
    
    // Notify parent that service is ready
    this.notifyReady();
    
    this.initialized = true;
    console.log('[SessionService] Session service ready');
  }

  public destroy(): void {
    window.removeEventListener('message', this.handleMessage.bind(this));
    this.initialized = false;
  }

  private async handleMessage(event: MessageEvent): Promise<void> {
    if (!event.data || event.data.type !== 'session-operation') {
      return;
    }

    const message = event.data as SessionServiceMessage;
    console.log('[SessionService] Received operation:', message.operation);

    try {
      const result = await this.executeOperation(message.operation, message.data);
      this.sendResponse(event.source as Window, message.requestId, true, result);
    } catch (error) {
      console.error('[SessionService] Operation failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.sendResponse(event.source as Window, message.requestId, false, null, errorMessage);
    }
  }

  private async executeOperation(operation: string, data?: any): Promise<any> {
    switch (operation) {
      case 'addSession':
        return sessionManager.addSession(data.session);
      
      case 'removeSession':
        return sessionManager.removeSession(data.sessionId);
      
      case 'syncWithDatabase':
        return sessionManager.syncWithDatabase();
      
      case 'getAllSessions':
        return sessionManager.getAllSessions();
      
      case 'getActiveSession':
        return sessionManager.getActiveSession();
      
      case 'setActiveSession':
        return sessionManager.setActiveSession(data.sessionId);
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  private sendResponse(
    targetWindow: Window, 
    requestId: string, 
    success: boolean, 
    data?: any, 
    error?: string
  ): void {
    const response: SessionServiceResponse = {
      type: 'session-operation-response',
      requestId,
      success,
      data,
      error
    };

    targetWindow.postMessage(response, '*');
  }

  private notifyReady(): void {
    // Notify all possible parent windows
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'session-service-ready',
        timestamp: Date.now()
      }, '*');
    }
  }
} 