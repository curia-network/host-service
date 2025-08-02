# Soju Admin Commands Implementation Plan

## Overview

Replace direct PostgreSQL database manipulation with Soju's official admin commands via `sojuctl` to eliminate the need for manual service restarts when provisioning IRC users.

## Current Problem

- **Manual restart required**: When we create users directly in PostgreSQL, Soju doesn't automatically load them
- **Fragile coupling**: Direct database writes bypass Soju's business logic  
- **Maintenance overhead**: Must manually sync with Soju's schema changes
- **Error from Soju**: `user "florian_Da92" exists in the DB but hasn't been loaded by the bouncer -- a restart may help`

## Current Architecture Analysis

### Docker Setup (Local Development)
**IRC Stack** (`../docker-compose.yml`):
- `curia-irc-soju` - Soju bouncer (port 6698:6697, 8081:443)
- `curia-irc-ergo` - Ergo IRC server (port 6667, 6697)
- `curia-irc-postgres` - PostgreSQL (port 5433:5432)
- `curia-irc-lounge` - The Lounge client (port 9000:9000)

**Main App** (`curia/docker-compose.yml`):
- `postgres` - Main Curia database (port 5434:5432)
- `redis` - Redis for Socket.IO (port 6379:6379)
- `adminer` - Database admin (port 8080:8080)

**Current Issue**: Curia backend runs separately and connects to IRC PostgreSQL via `IRC_DATABASE_URL`

### Soju Container Analysis
- **sojuctl binary**: Already built and available at `/usr/bin/sojuctl` 
- **Current config**: No admin interface configured
- **Environment**: `DATABASE_URL`, `SOJU_ADMIN_USER`, `SOJU_ADMIN_PASS` already set

## Proposed Solution: Dual Environment Architecture

Implement both Unix socket (local) and TCP network (Railway) admin interfaces with automatic environment detection.

## Implementation Plan

### Phase 1: Core Admin Service Architecture

#### Step 1: Create Admin Service Abstraction
**File**: `curia/src/lib/SojuAdminService.ts` (NEW)
```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
import net from 'net';

const execAsync = promisify(exec);

export class SojuAdminService {
  private isLocalEnvironment(): boolean {
    return process.env.NODE_ENV === 'development' || 
           !process.env.RAILWAY_ENVIRONMENT_ID ||
           process.env.SOJU_ADMIN_METHOD === 'socket';
  }

  async createUser(params: {
    ircUsername: string;
    ircPassword: string;
    nickname: string;
    realname: string;
  }): Promise<void> {
    if (this.isLocalEnvironment()) {
      await this.createUserViaSojuctl(params);
    } else {
      await this.createUserViaTcp(params);
    }
  }

  async createNetwork(params: {
    ircUsername: string;
    nickname: string;
  }): Promise<void> {
    if (this.isLocalEnvironment()) {
      await this.createNetworkViaSojuctl(params);
    } else {
      await this.createNetworkViaTcp(params);
    }
  }

  private async createUserViaSojuctl(params: CreateUserParams): Promise<void> {
    const { ircUsername, ircPassword, nickname, realname } = params;
    const cmd = `sojuctl user create -username "${ircUsername}" -password "${ircPassword}" -nick "${nickname}" -realname "${realname}"`;
    
    try {
      const { stdout, stderr } = await execAsync(cmd);
      if (stderr && !stderr.includes('already exists')) {
        throw new Error(`sojuctl error: ${stderr}`);
      }
      console.log('[SojuAdmin] User created via sojuctl:', { ircUsername, stdout });
    } catch (error) {
      throw new Error(`Failed to create user via sojuctl: ${error instanceof Error ? error.message : error}`);
    }
  }

  private async createUserViaTcp(params: CreateUserParams): Promise<void> {
    const { ircUsername, ircPassword, nickname, realname } = params;
    const command = `user create -username "${ircUsername}" -password "${ircPassword}" -nick "${nickname}" -realname "${realname}"`;
    await this.sendTcpAdminCommand(command);
  }

  private async sendTcpAdminCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const adminPassword = process.env.SOJU_ADMIN_PASSWORD;
      if (!adminPassword) {
        reject(new Error('SOJU_ADMIN_PASSWORD not configured'));
        return;
      }

      const sojuHost = process.env.SOJU_ADMIN_HOST || 'curia-irc-bouncer';
      const sojuPort = parseInt(process.env.SOJU_ADMIN_PORT || '9999');

      const client = net.createConnection(sojuPort, sojuHost);
      let responseData = '';

      client.on('connect', () => {
        // IRC-style admin authentication
        client.write(`PASS ${adminPassword}\r\n`);
        client.write(`${command}\r\n`);
      });

      client.on('data', (data) => {
        responseData += data.toString();
      });

      client.on('end', () => {
        client.destroy();
        if (responseData.includes('ERROR') || responseData.includes('FAIL')) {
          reject(new Error(`Soju admin command failed: ${responseData.trim()}`));
        } else {
          resolve(responseData.trim());
        }
      });

      client.on('error', (error) => {
        reject(new Error(`TCP connection failed: ${error.message}`));
      });

      // Timeout after 10 seconds
      client.setTimeout(10000, () => {
        client.destroy();
        reject(new Error('TCP admin command timeout'));
      });
    });
  }
}
```

#### Step 2: Update Backend API Route
**File**: `curia/src/app/api/irc-user-provision/route.ts`
**Changes**: Replace direct database operations with admin service

```typescript
import { NextResponse } from 'next/server';
import { AuthenticatedRequest, withAuth } from '@/lib/withAuth';
import { SojuAdminService } from '@/lib/SojuAdminService';
import { 
  generateIrcUsername, 
  generateSecurePassword
} from '@curia_/curia-chat-modal';

const sojuAdmin = new SojuAdminService();

interface ProvisionResponse {
  success: boolean;
  ircUsername: string;
  ircPassword: string;
  networkName: string;
}

async function provisionIrcUserHandler(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const { user } = req;
    const communityId = user.cid;
    
    if (!communityId) {
      return NextResponse.json(
        { error: 'Community ID not found in authentication token' }, 
        { status: 400 }
      );
    }

    // Generate IRC credentials
    const ircUsername = generateIrcUsername(user.name || user.sub, user.sub);
    const ircPassword = generateSecurePassword();

    // Create user via admin interface (no restart needed!)
    await sojuAdmin.createUser({
      ircUsername,
      ircPassword,
      nickname: user.name || ircUsername,
      realname: user.name || ircUsername
    });

    // Create network for user
    await sojuAdmin.createNetwork({
      ircUsername,
      nickname: user.name || ircUsername
    });

    console.log('[IRC Provision] Successfully provisioned IRC user via admin interface:', {
      ircUsername,
      userId: user.sub,
      userName: user.name,
      communityId,
      networkName: 'commonground',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      ircUsername,
      ircPassword,
      networkName: 'commonground'
    } as ProvisionResponse);
    
  } catch (error) {
    console.error('[IRC Provision] Error provisioning IRC user:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      userId: req.user.sub,
      userName: req.user.name,
      timestamp: new Date().toISOString()
    });
    
    const userMessage = error instanceof Error && error.message.includes('connection') 
      ? 'Unable to connect to chat service. Please try again.'
      : 'Failed to set up chat access. Please try again or contact support.';
      
    return NextResponse.json(
      { error: userMessage, details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(provisionIrcUserHandler, false);
```

### Phase 2: Local Docker Configuration

#### Step 1: Update Soju Configuration
**File**: `curia-irc-bouncer/soju.conf`
**Change**: Add admin socket listener
```ini
# Add this line to enable admin commands via Unix socket
listen unix+admin://

# Admin configuration (configured via sojuctl after startup)
```

#### Step 2: Create Integrated Docker Compose
**File**: `docker-compose.integration.yml` (NEW)
```yaml
version: '3.9'

services:
  # Extend IRC stack with Curia backend
  curia-backend:
    build:
      context: ./curia
      dockerfile: Dockerfile.dev
    container_name: curia-backend-dev
    environment:
      NODE_ENV: development
      IRC_DATABASE_URL: "postgres://soju:soju_dev_password@curia-irc-postgres:5432/soju?sslmode=disable"
      DATABASE_URL: "postgres://plugin_user:plugin_password@curia-postgres:5432/plugin_db"
      REDIS_URL: "redis://curia-redis:6379"
      SOJU_ADMIN_METHOD: "socket"
      NEXT_PUBLIC_CHAT_BASE_URL: "http://localhost:9000"
      NEXT_PUBLIC_CURIA_BASE_URL: "http://localhost:3000"
    ports:
      - "3000:3000"
    volumes:
      - soju-admin-socket:/run/soju  # Shared admin socket
      - ./curia:/app
      - curia_node_modules:/app/node_modules
    networks:
      - irc-network
      - curia-network
    depends_on:
      curia-irc-postgres:
        condition: service_healthy
      curia-postgres:
        condition: service_healthy
      curia-redis:
        condition: service_healthy

  # Update Soju to share admin socket
  curia-irc-soju:
    extends:
      file: docker-compose.yml
      service: soju
    volumes:
      - soju_data:/var/lib/soju
      - soju-admin-socket:/run/soju  # Shared admin socket

  # Include Curia database services
  curia-postgres:
    image: pgvector/pgvector:pg17
    container_name: curia-postgres-dev
    environment:
      POSTGRES_USER: plugin_user
      POSTGRES_PASSWORD: plugin_password
      POSTGRES_DB: plugin_db
    ports:
      - "5434:5432"
    volumes:
      - curia_postgres_data:/var/lib/postgresql/data
    networks:
      - curia-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U plugin_user -d plugin_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  curia-redis:
    image: redis:7-alpine
    container_name: curia-redis-dev
    ports:
      - "6379:6379"
    volumes:
      - curia_redis_data:/data
    networks:
      - curia-network
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  irc-network:
    driver: bridge
    name: curia-irc-network
  curia-network:
    driver: bridge
    name: curia-app-network

volumes:
  soju-admin-socket:
    name: curia-soju-admin-socket
  curia_node_modules:
    name: curia-node-modules
  curia_postgres_data:
    name: curia-postgres-data
  curia_redis_data:
    name: curia-redis-data
  # Inherit IRC volumes from main docker-compose.yml
```

#### Step 3: Create Development Dockerfile
**File**: `curia/Dockerfile.dev` (NEW)
```dockerfile
FROM node:20-alpine

# Install sojuctl for admin commands
RUN apk add --no-cache ca-certificates sqlite postgresql-client git build-base

# Build sojuctl from source
ENV SOJU_VERSION=v0.8.0
RUN apk add --no-cache go && \
    git clone https://codeberg.org/emersion/soju.git /tmp/soju && \
    cd /tmp/soju && \
    git checkout $SOJU_VERSION && \
    go build -ldflags "-s -w" -o /usr/bin/sojuctl ./cmd/sojuctl && \
    rm -rf /tmp/soju && \
    apk del go

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]
```

### Phase 3: Railway Production Configuration

#### Step 1: Update Soju Config for Railway
**File**: `curia-irc-bouncer/soju.conf`
**Change**: Add conditional TCP admin interface
```ini
# Server identification
hostname irc.curia.network
title "CommonGround IRC Bouncer"

# Listeners
listen ircs://0.0.0.0:6697
listen wss://0.0.0.0:443

# Admin interface - TCP for Railway, Unix socket for local
${SOJU_ADMIN_TCP_ENABLED:+listen admin://0.0.0.0:9999}
${SOJU_ADMIN_TCP_ENABLED:+admin-password ${SOJU_ADMIN_PASSWORD}}
${SOJU_ADMIN_SOCKET_ENABLED:+listen unix+admin://}

# TLS configuration
tls /etc/soju/certs/fullchain.pem /etc/soju/certs/privkey.pem

# Database configuration (PostgreSQL)
db postgres "${DATABASE_URL}"

# Message storage
message-store db

# WebSocket/HTTP configuration
http-origin https://embed.curia.network https://curia.network
http-ingress https://irc.curia.network

# User management
enable-user-on-auth true
max-user-networks 1

# Logging
log fs /var/lib/soju/logs
```

#### Step 2: Railway Environment Variables
**Soju Service**:
- `SOJU_ADMIN_TCP_ENABLED=true`
- `SOJU_ADMIN_PASSWORD=<secure-random-password>`
- `SOJU_ADMIN_SOCKET_ENABLED=` (empty, disables Unix socket)

**Curia Backend Service**:
- `SOJU_ADMIN_METHOD=tcp`
- `SOJU_ADMIN_HOST=<soju-service-internal-url>`
- `SOJU_ADMIN_PORT=9999`
- `SOJU_ADMIN_PASSWORD=<same-secure-password>`

#### Step 3: Update Production Dockerfile
**File**: `curia/Dockerfile`
**Change**: Add sojuctl for Railway if needed (for debugging)
```dockerfile
# Add after line 22 (runtime dependencies)
RUN apk add --no-cache ca-certificates sqlite postgresql-client envsubst openssl git build-base

# Conditionally build sojuctl for Railway (if INCLUDE_SOJUCTL=true)
ARG INCLUDE_SOJUCTL=false
ENV SOJU_VERSION=v0.8.0
RUN if [ "$INCLUDE_SOJUCTL" = "true" ]; then \
    apk add --no-cache go && \
    git clone https://codeberg.org/emersion/soju.git /tmp/soju && \
    cd /tmp/soju && \
    git checkout $SOJU_VERSION && \
    go build -ldflags "-s -w" -o /usr/bin/sojuctl ./cmd/sojuctl && \
    rm -rf /tmp/soju && \
    apk del go; \
    fi
```

### Phase 4: Testing and Validation

#### Local Testing Checklist
1. **Setup**: `docker-compose -f docker-compose.integration.yml up`
2. **Socket verification**: `docker exec curia-backend-dev ls -la /run/soju/`
3. **Admin command test**: `docker exec curia-backend-dev sojuctl user list`
4. **API test**: POST to `/api/irc-user-provision`
5. **No restart test**: Verify user immediately available
6. **Login test**: Test auto-login with The Lounge

#### Railway Testing Checklist
1. **Environment setup**: Configure all Railway environment variables
2. **TCP connection test**: Verify backend can reach Soju admin port
3. **Security test**: Ensure admin port not externally accessible
4. **User creation test**: API endpoint creates users successfully
5. **Error handling test**: Test various failure scenarios
6. **Load test**: Multiple concurrent user creations

## Migration Strategy

### Phase 1: Implement and Test Locally
1. Create `SojuAdminService` abstraction
2. Set up integrated Docker Compose
3. Test Unix socket admin interface
4. Validate no restart requirements

### Phase 2: Railway Preparation
1. Add TCP admin interface to Soju config
2. Update Railway environment variables
3. Test TCP admin interface locally (simulate Railway)

### Phase 3: Gradual Production Rollout
1. Deploy Soju with TCP admin interface
2. Deploy backend with dual environment support
3. Test in Railway staging environment
4. Switch production traffic gradually

### Phase 4: Cleanup
1. Remove old direct database code
2. Clean up unused environment variables
3. Update documentation

## Security Considerations

### Local Development (Unix Socket)
- ✅ **Socket permissions**: Only accessible within Docker network
- ✅ **No network exposure**: Unix socket stays internal
- ✅ **Container isolation**: Each container has own filesystem

### Railway Production (TCP)
- ⚠️ **Admin port**: Must not be exposed externally
- ✅ **Authentication**: Strong admin password required
- ✅ **Internal network**: Railway internal service communication
- ✅ **Environment variables**: Secure credential storage

### General Security
- **Input validation**: Sanitize all IRC usernames and commands
- **Error logging**: Don't log passwords in plaintext
- **Rate limiting**: Prevent admin interface abuse
- **Command injection**: Use proper shell escaping

## Benefits Summary

1. ✅ **No manual restarts** - Users immediately available in Soju
2. ✅ **Official API** - Uses Soju's supported admin interface
3. ✅ **Environment flexibility** - Works in both local and cloud
4. ✅ **Future-proof** - No coupling to internal database schema
5. ✅ **Proper error handling** - Official command responses
6. ✅ **Development experience** - Simple Unix socket locally
7. ✅ **Production ready** - TCP interface for Railway

## Next Steps - Implementation Order

1. **Create SojuAdminService** - Core abstraction layer
2. **Local Docker integration** - Prove Unix socket concept
3. **Backend API update** - Replace database calls with admin service
4. **Railway TCP implementation** - Add production TCP interface
5. **Environment detection** - Automatic local vs production switching
6. **Comprehensive testing** - Both environments thoroughly tested
7. **Production deployment** - Gradual rollout with monitoring