# IRC Provisioning Endpoint Migration Research

## Overview
Moving the `/api/irc-user-provision` endpoint from curia (port 3000) to host-service (port 3001) to support standalone mode IRC provisioning via iframe-api-proxy.

## Current Status
- **Problem**: iframe-api-proxy calls `localhost:3001/api/irc-user-provision` but endpoint exists on `localhost:3000`
- **Solution**: Move the entire endpoint to host-service and adapt for host-service authentication

## Research Phase
- [ ] Analyze current IRC provisioning endpoint structure
- [ ] Identify dependencies and authentication differences
- [ ] Map migration requirements
- [ ] Create step-by-step implementation plan

---

## Analysis Results

### Current Endpoint Location
`/Users/florian/Git/curia/curia/src/app/api/irc-user-provision/route.ts`

### Key Dependencies Identified

#### 1. Authentication System Differences
**Curia (source):**
- Uses `withAuth` middleware with JWT Bearer tokens
- JWT payload contains: `sub` (userId), `name`, `cid` (communityId), etc.
- Direct JWT validation with `JWT_SECRET`

**Host-service (target):**
- Uses `PluginHost.processApiRequest()` pattern
- CORS validation with `validateOriginOrError()`
- No JWT middleware - uses plugin request format
- Authentication context from `body.userId` and `body.communityId`

#### 2. Core Dependencies
- `SojuAdminService` - IRC bouncer admin operations (HTTP client)
- `@curia_/curia-chat-modal` - Username/password generation utilities
- Environment variables: `SOJU_SIDECAR_URL`, `SOJU_ADMIN_API_TOKEN`

#### 3. Request/Response Format Differences
**Curia format:**
```typescript
// Auth via JWT Bearer token
// Response: { success, ircUsername, ircPassword, networkName }
```

**Host-service format:**
```typescript
// Auth via plugin request body: { userId, communityId, method }
// Response: { data, success, error }
```

---

## Migration Roadmap

### Phase 1: Copy and Setup Infrastructure
1. **Create new API route**: `/Users/florian/Git/curia/host-service/src/app/api/irc-user-provision/route.ts`
2. **Copy dependencies**: 
   - Install `@curia_/curia-chat-modal` in host-service
   - Copy `SojuAdminService.ts` to host-service
3. **Environment setup**: Ensure `SOJU_SIDECAR_URL` and `SOJU_ADMIN_API_TOKEN` in host-service

### Phase 2: Adapt Authentication
1. **Remove JWT middleware**: Replace `withAuth` with host-service CORS pattern
2. **Adapt user context**: Extract user data from plugin request body instead of JWT
3. **Add CORS support**: Use `applyCorsHeaders`, `validateOriginOrError`, `createCorsPreflightResponse`

### Phase 3: Adapt Request/Response Format
1. **Request handling**: Accept plugin format `{ method: 'getIrcCredentials', userId, communityId }`
2. **Response format**: Wrap in host-service format `{ data: {...}, success, error }`
3. **Error handling**: Use host-service error response pattern

### Phase 4: Integration Testing
1. **Test iframe-api-proxy**: Verify calls to `localhost:3001/api/irc-user-provision` work
2. **Test authentication**: Ensure plugin request authentication works
3. **Test IRC provisioning**: Verify Soju admin service integration works

---

## Implementation Steps

### Step 1: Infrastructure Setup
```bash
# Copy the endpoint file
cp /Users/florian/Git/curia/curia/src/app/api/irc-user-provision/route.ts \
   /Users/florian/Git/curia/host-service/src/app/api/irc-user-provision/route.ts

# Copy SojuAdminService
cp /Users/florian/Git/curia/curia/src/lib/SojuAdminService.ts \
   /Users/florian/Git/curia/host-service/src/lib/SojuAdminService.ts

# Install chat modal package in host-service
cd /Users/florian/Git/curia/host-service
yarn add @curia_/curia-chat-modal
```

### Step 2: Code Adaptations
1. **Replace imports**: Change curia-specific imports to host-service equivalents
2. **Remove JWT auth**: Replace `withAuth` with CORS pattern from `/api/user/route.ts`
3. **Adapt user extraction**: Get user data from request body instead of JWT
4. **Wrap response**: Use host-service response format

### Step 3: Environment Variables
Ensure host-service has:
```env
SOJU_SIDECAR_URL=http://localhost:3003
SOJU_ADMIN_API_TOKEN=your_token_here
```

---

## Code Changes Required

### Main Changes to route.ts:
1. **Remove**: `import { withAuth, AuthenticatedRequest }`
2. **Add**: CORS utilities from host-service
3. **Replace**: `withAuth(handler)` → standard Next.js POST function
4. **Change**: User extraction from JWT → request body
5. **Wrap**: Response in `{ data, success, error }` format

### Response Format Change:
```typescript
// Before (curia)
return NextResponse.json({
  success: true,
  ircUsername,
  ircPassword,
  networkName: 'commonground'
});

// After (host-service)
return applyCorsHeaders(NextResponse.json({
  data: {
    ircUsername,
    ircPassword, 
    networkName: 'commonground'
  },
  success: true,
  error: null
}), origin);
```

---

## Next Steps

1. **Execute Step 1**: Copy files and install dependencies
2. **Execute Step 2**: Adapt authentication and request handling
3. **Execute Step 3**: Configure environment variables
4. **Test integration**: Verify iframe-api-proxy → host-service → Soju flow works
5. **Clean up**: Remove old mock code if any exists
