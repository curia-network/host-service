# @curia_/iframe-api-proxy

API proxy system for iframe-based applications to bypass CSP (Content Security Policy) restrictions.

## 🎯 Problem Solved

When embedding iframe applications on customer websites, strict CSP policies prevent direct API calls from the customer page to external domains. This package provides a robust solution by routing API requests through same-domain iframes.

### ❌ Current Problem (CSP Violation)
```
Customer Website (strict CSP)
    ↓ embed.js tries to call API
fetch(https://api.example.com) ← BLOCKED by CSP
```

### ✅ Solution (CSP Compliant)
```
Customer Website
    ↓ embed.js uses proxy
PostMessage → iframe (same domain)
    ↓ iframe makes API call
fetch(https://api.example.com) ← ALLOWED
    ↓ response via PostMessage
Customer Website ← API Response
```

## 🚀 Quick Start

### Install
```bash
yarn add @curia_/iframe-api-proxy
```

### Client-Side Usage (Customer Page)
```typescript
import { ApiProxyClient } from '@curia_/iframe-api-proxy';

// Initialize proxy client
const proxyClient = new ApiProxyClient({
  debug: true,
  defaultTimeout: 10000
});

// Set active iframe for API requests
proxyClient.setActiveIframe(myIframeElement);

// Make API request (proxied through iframe)
const response = await proxyClient.makeApiRequest({
  method: 'getUserInfo',
  userId: 'user123',
  communityId: 'community456'
});
```

### Server-Side Usage (Inside Iframe)
```typescript
import { ApiProxyServer } from '@curia_/iframe-api-proxy';

// Initialize proxy server
const proxyServer = new ApiProxyServer({
  baseUrl: 'https://api.example.com',
  debug: true
});

// Server automatically handles incoming proxy requests
// and makes actual API calls to the baseUrl
```

## 📋 API Reference

### ApiProxyClient

Client-side component that runs in the customer page context.

#### Constructor
```typescript
new ApiProxyClient(config?: ProxyClientConfig)
```

#### Methods
- `setActiveIframe(iframe: HTMLIFrameElement)` - Set the active iframe for API requests
- `makeApiRequest(request: ApiRequest)` - Make an API request through the proxy
- `getStatus()` - Get proxy client status and statistics
- `destroy()` - Clean up resources

#### Configuration
```typescript
interface ProxyClientConfig {
  defaultTimeout?: number;    // Default: 10000ms
  maxRetries?: number;        // Default: 3
  retryDelay?: number;        // Default: 1000ms
  debug?: boolean;           // Default: false
  requestIdPrefix?: string;  // Default: 'proxy'
}
```

### ApiProxyServer

Server-side component that runs inside iframe contexts.

#### Constructor
```typescript
new ApiProxyServer(config: ProxyServerConfig)
```

#### Methods
- `getStatus()` - Get proxy server status and statistics
- `destroy()` - Clean up resources

#### Configuration
```typescript
interface ProxyServerConfig {
  baseUrl: string;                    // Required: API base URL
  timeout?: number;                   // Default: 30000ms
  debug?: boolean;                    // Default: false
  headers?: Record<string, string>;   // Custom headers
  allowedOrigins?: string[];          // Security whitelist
  serverId?: string;                  // Custom server ID
}
```

## 🔧 Integration Examples

### Example 1: Host Service Integration

```typescript
// In your embed script (customer page)
import { ApiProxyClient } from '@curia_/iframe-api-proxy';

class InternalPluginHost {
  private apiProxy: ApiProxyClient;

  constructor() {
    this.apiProxy = new ApiProxyClient({ debug: true });
  }

  private async handleApiRequest(request: any): Promise<any> {
    // Use proxy instead of direct fetch
    return await this.apiProxy.makeApiRequest(request);
  }

  private switchToForum(iframe: HTMLIFrameElement): void {
    // Set active iframe for API proxy
    this.apiProxy.setActiveIframe(iframe);
  }
}
```

### Example 2: Iframe Application Integration

```typescript
// In your iframe application
import { ApiProxyServer } from '@curia_/iframe-api-proxy';

// Initialize when iframe loads
if (window !== window.parent) {
  const proxyServer = new ApiProxyServer({
    baseUrl: 'https://api.example.com',
    debug: true
  });
  
  // Server automatically handles proxy requests
  console.log('Proxy server ready:', proxyServer.getStatus());
}
```

## 🛡️ Security Features

- **Origin Validation**: Whitelist allowed origins for security
- **Request Validation**: Type-safe API request validation
- **Timeout Protection**: Configurable request timeouts
- **Error Handling**: Comprehensive error types and handling
- **Message Validation**: Secure PostMessage communication

## 📊 Monitoring & Debugging

### Debug Mode
```typescript
const client = new ApiProxyClient({ debug: true });
const server = new ApiProxyServer({ baseUrl: 'https://api.example.com', debug: true });
```

### Status Monitoring
```typescript
// Client status
const clientStatus = client.getStatus();
console.log('Pending requests:', clientStatus.pendingRequestCount);
console.log('Average response time:', clientStatus.averageResponseTime);

// Server status
const serverStatus = server.getStatus();
console.log('Total requests:', serverStatus.requestCount);
console.log('Error count:', serverStatus.errorCount);
```

## 🔄 Message Flow

```
1. Forum iframe → ApiProxyClient (via PostMessage)
2. ApiProxyClient → Active iframe (via PostMessage)
3. Active iframe → ApiProxyServer (internal handling)
4. ApiProxyServer → API endpoint (via fetch)
5. API endpoint → ApiProxyServer (HTTP response)
6. ApiProxyServer → ApiProxyClient (via PostMessage)
7. ApiProxyClient → Forum iframe (via PostMessage)
```

## 📈 Performance

- **Minimal Overhead**: <100ms additional latency
- **Efficient Routing**: Direct PostMessage communication
- **Smart Retry Logic**: Automatic retry with exponential backoff
- **Resource Cleanup**: Automatic timeout and memory management

## 🎯 Use Cases

- **Iframe-based Forums**: Bypass CSP for API calls
- **Embedded Widgets**: Customer site integration
- **Cross-domain Applications**: Secure API proxying
- **Plugin Systems**: Third-party application hosting

## 🤝 Contributing

This package is part of the Curia ecosystem. For contributions:

1. Fork the repository
2. Create your feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Related Packages

- `@curia/host-service` - Host service for community forums
- `@curia/forum-app` - Forum application
- `@curia/embed-sdk` - Embedding SDK for customers

---

**Built with ❤️ by the Curia team** 