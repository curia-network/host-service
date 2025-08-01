# Messenger System Research & Roadmap

## Project Overview

Building a modern, Telegram-like messenger system that can operate both as a standalone application and as an integrated module within the Common Ground ecosystem.

### Core Requirements

**Functional Requirements:**
- 1:1 direct messaging
- Group chats/channels  
- Real-time messaging
- Desktop and mobile support
- Telegram-like UX/UI
- File sharing and media support
- Message history and search
- Online/offline status
- Typing indicators
- Message read receipts
- Push notifications

**Architecture Requirements:**
- **Dual Mode Operation:**
  - **Standalone Mode:** Creates own CG instance, fully independent
  - **Module Mode:** Receives CG instance from parent app (forum/host-service)
- **Integration Points:**
  - Load via forum or host-service
  - Seamless UX integration
  - Shared authentication with existing system
- **Future Extensions:**
  - AI agents as chat participants
  - Bot API for automation
  - Plugin system

## Technology Research Findings

### 1. Real-Time Communication Technologies

#### WebSockets vs Server-Sent Events (SSE)

**Research Findings:**
- **WebSockets**: Best for bidirectional communication (traditional chat)
  - Full-duplex communication
  - Lower latency for interactive applications
  - More complex to implement and scale
  - Popular libraries: Socket.IO, native WebSocket API

- **Server-Sent Events (SSE)**: Ideal for one-way streaming (AI chat responses)
  - Simpler to implement and debug
  - Automatic reconnection
  - Works better with proxies/firewalls
  - HTTP-based, easier enterprise integration
  - Used by OpenAI, DeepSeek for streaming AI responses

**Recommendation:** Hybrid approach
- WebSockets for real-time bidirectional chat
- SSE for AI assistant responses and notifications
- Socket.IO for production WebSocket implementation (handles reconnection, fallbacks)

#### Alternative Technologies
- **WebTransport**: Promising but limited browser support (not in Safari)
- **HTTP/2 Push**: Mainly for asset preloading, not chat
- **Long Polling**: Outdated, high overhead

### 2. Frontend Framework & UI Research

#### React-Based Chat UI Libraries

**Top Options Researched:**

1. **@chatscope/chat-ui-kit-react** ⭐ **RECOMMENDED**
   - 27K+ weekly downloads
   - Comprehensive chat components
   - TypeScript support
   - MIT license
   - Features: MessageList, MessageInput, ChatContainer, Conversations
   ```bash
   npm install @chatscope/chat-ui-kit-react @chatscope/chat-ui-kit-styles
   ```

2. **react-chat-elements**
   - 11K+ weekly downloads  
   - Multiple message types (text, photo, file, location, video, audio)
   - Support for reactions, threads, read receipts
   - More basic but lightweight

3. **Stream Chat React SDK**
   - Enterprise-grade but commercial
   - Excellent for reference architecture
   - Full-featured with moderation, search, etc.

4. **CometChat React UI Kit**
   - Commercial but has free tier
   - Very comprehensive feature set
   - Good for learning best practices

5. **Telegram UI Kit** (by Telegram Mini Apps)
   - Perfect for Telegram-like styling
   - React components matching Telegram interface
   - 626 GitHub stars, actively maintained
   ```bash
   npm install @telegram-apps/telegram-ui
   ```

6. **Ant Design X**
   - Specifically for AI chat applications
   - Built on Ant Design + shadcn/ui
   - TypeScript, tree-shaking support
   ```bash
   npm install @ant-design/x
   ```

#### UI Framework Decision Matrix

| Library | Telegram-like UI | AI Chat Support | TypeScript | Community | License |
|---------|------------------|-----------------|------------|-----------|---------|
| @chatscope | ⭐ Good | ⭐ Excellent | ✅ | Large | MIT |
| Telegram UI | ⭐ Perfect | ❌ Basic | ✅ | Growing | MIT |
| Ant Design X | ❌ Different | ⭐ Perfect | ✅ | Large | MIT |
| react-chat-elements | ⭐ Good | ❌ Basic | ✅ | Medium | MIT |

### 3. Backend Architecture Research

#### Telegram Architecture Analysis

Based on research into Telegram's system design:

**Key Architectural Layers:**
1. **Presentation Layer** (Android SDK, Jetpack Compose, Material Design)
2. **Application Layer** (Dependency injection, reactive programming)
3. **API Gateway** (Nginx/Envoy, REST/gRPC APIs, rate limiting)
4. **Business Logic Layer** (Microservices, messaging queues)
5. **Data Layer** (PostgreSQL, Cassandra/MongoDB, Redis cache, CDN)
6. **Communication Layer** (MTProto protocol, WebSocket, HTTP/2)
7. **Security Layer** (AES/RSA encryption, 2FA, Diffie-Hellman)
8. **Notification Layer** (FCM, message queues)
9. **Monitoring & Logging** (ELK Stack, Prometheus/Grafana)

#### Recommended Tech Stack

**Frontend:**
- Next.js (consistency with existing apps)
- TypeScript
- @chatscope/chat-ui-kit-react + Telegram UI components
- Socket.IO client
- Tailwind CSS

**Backend:**
- Next.js API routes (if integrated) OR Express.js (standalone)
- Socket.IO server
- PostgreSQL (leverage existing infrastructure)
- Redis (caching, session management)
- Message queuing: Redis Pub/Sub or Bull Queue

**Real-time:**
- Socket.IO for WebSocket management
- Server-Sent Events for AI responses
- Redis for message routing in multi-instance setup

### 4. Message Protocol Design

#### Custom Protocol vs Standards

**Options Researched:**

1. **Custom JSON Protocol** ⭐ **RECOMMENDED**
   - Simple, flexible
   - Easy to extend
   - Good for MVP

2. **XMPP (Extensible Messaging and Presence Protocol)**
   - Mature, standardized
   - XML-based, highly extensible
   - Used by large-scale systems (WhatsApp backend)
   - More complex but very scalable

3. **Matrix Protocol**
   - Decentralized, federated
   - Built-in E2E encryption
   - Higher resource requirements
   - Good for security-focused applications

4. **MTProto (Telegram's Protocol)**
   - Custom, highly optimized
   - Complex to implement
   - Overkill for most use cases

**Recommendation:** Start with custom JSON protocol, consider XMPP for future scaling

#### Message Structure Design

```typescript
interface Message {
  id: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  recipient: {
    id: string;
    type: 'user' | 'group';
  };
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mediaType?: string;
    replyTo?: string;
    edited?: boolean;
    reactions?: Array<{ emoji: string; users: string[] }>;
  };
}
```

### 5. Integration Architecture

#### Standalone vs Module Mode Implementation

**Proposed Architecture:**

```typescript
// Main app entry point
interface MessengerConfig {
  mode: 'standalone' | 'module';
  cgInstance?: CommonGroundInstance;
  theme?: 'light' | 'dark' | 'auto';
  features?: {
    aiAssistant?: boolean;
    fileSharing?: boolean;
    voiceCalls?: boolean;
    bots?: boolean;
  };
}

function initializeMessenger(config: MessengerConfig) {
  if (config.mode === 'standalone') {
    // Create own CG instance
    const cgInstance = createCGInstance();
    return new MessengerApp(cgInstance, config);
  } else {
    // Use provided CG instance
    return new MessengerModule(config.cgInstance!, config);
  }
}
```

**Integration Points:**
1. **Authentication**: Shared with parent application
2. **User Management**: Synchronized with existing user base
3. **Notifications**: Integrated with existing notification system
4. **Theming**: Consistent with parent application

### 6. Security & Privacy Research

#### End-to-End Encryption Options

1. **Signal Protocol** (libsignal)
   - Industry standard
   - Used by WhatsApp, Signal, etc.
   - Complex but very secure

2. **Matrix Olm/Megolm Libraries**
   - Open source
   - Good documentation
   - Easier to implement

3. **Custom Implementation**
   - Full control
   - Higher risk
   - Not recommended for production

**Recommendation:** Start without E2E encryption, add Matrix Olm later for secret chats

### 7. Scalability & Performance Research

#### Database Design

**Messages Table:**
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    sender_id TEXT NOT NULL,
    message_type VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'sent'
);

CREATE INDEX idx_messages_conversation_time ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
```

**Conversations Table:**
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL, -- 'direct' | 'group'
    name TEXT,
    description TEXT,
    avatar_url TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    settings JSONB DEFAULT '{}'
);
```

#### Caching Strategy

- **Redis Patterns:**
  - Active conversations: `conv:{userId}:active` (SET)
  - Recent messages: `conv:{conversationId}:messages` (LIST)
  - User presence: `user:{userId}:presence` (STRING with TTL)
  - Typing indicators: `conv:{conversationId}:typing` (SET with TTL)

#### Performance Optimizations

1. **Message Pagination**: 50 messages per page
2. **Virtual Scrolling**: For large conversation histories
3. **Message Batching**: Group rapid messages for efficiency
4. **Connection Pooling**: Database and Redis connections
5. **CDN**: For file uploads and media delivery

## Implementation Roadmap

### Phase 1: MVP Foundation (4-6 weeks)
- [ ] Project setup and architecture
- [ ] Basic real-time messaging (WebSocket/Socket.IO)
- [ ] Simple UI with @chatscope components
- [ ] Database schema and models
- [ ] User authentication integration

### Phase 2: Core Features (4-6 weeks)
- [ ] Group chat functionality
- [ ] File sharing and media support
- [ ] Message history and pagination
- [ ] Online/offline status
- [ ] Typing indicators

### Phase 3: Advanced Features (6-8 weeks)
- [ ] Message search
- [ ] Push notifications
- [ ] Mobile responsiveness
- [ ] Performance optimizations
- [ ] Admin controls and moderation

### Phase 4: Integration & Bot API (4-6 weeks)
- [ ] Standalone vs module mode implementation
- [ ] AI assistant integration
- [ ] Bot API development
- [ ] Plugin system architecture

### Phase 5: Production & Scaling (4-6 weeks)
- [ ] End-to-end encryption (optional)
- [ ] Advanced security features
- [ ] Performance monitoring
- [ ] Load testing and optimization
- [ ] Documentation and deployment

## Dependency Requirements

### Frontend Dependencies
```bash
# Core framework
npm install next react react-dom typescript

# Chat UI
npm install @chatscope/chat-ui-kit-react @chatscope/chat-ui-kit-styles
npm install @telegram-apps/telegram-ui  # For Telegram-like styling

# Real-time communication
npm install socket.io-client

# State management & utilities
npm install @tanstack/react-query zustand
npm install date-fns lucide-react clsx

# Styling
npm install tailwindcss @tailwindcss/typography
```

### Backend Dependencies
```bash
# Core framework
npm install express cors helmet compression

# Real-time communication
npm install socket.io

# Database & caching
npm install pg redis bull  # PostgreSQL, Redis, job queue

# File handling
npm install multer @aws-sdk/client-s3  # File uploads

# Authentication & security
npm install jsonwebtoken bcrypt

# Utilities
npm install uuid validator
```

## Open Questions for Discussion

1. **Framework Choice**: Should we use Next.js for consistency or consider other frameworks?
2. **Database Strategy**: Reuse existing PostgreSQL or introduce specialized message storage?
3. **Real-time Architecture**: Pure WebSockets vs hybrid approach with SSE for AI?
4. **Mobile Strategy**: Progressive Web App vs native mobile apps?
5. **Integration Complexity**: How complex should the module integration be?
6. **Bot API Design**: What level of bot functionality do we want initially?

## Risk Assessment

### Technical Risks
- **Real-time scaling**: WebSocket connections can be resource-intensive
- **Message delivery**: Ensuring reliable delivery across network issues
- **Cross-platform compatibility**: Maintaining consistent experience
- **Security vulnerabilities**: Chat systems are high-value targets

### Mitigation Strategies
- Use proven libraries (Socket.IO) with built-in reconnection
- Implement message queuing for reliability
- Progressive Web App approach for mobile compatibility
- Regular security audits and updates

## Next Steps

1. **Technology Decision**: Finalize frontend framework choice
2. **Proof of Concept**: Build minimal working prototype
3. **Architecture Review**: Validate database and API design
4. **Development Environment**: Set up development infrastructure
5. **Team Planning**: Assign responsibilities and timelines

---

*This research document will be updated as we progress through the development phases and gather more information about specific technical challenges and solutions.*