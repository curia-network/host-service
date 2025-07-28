# Parent URL Parameter Research & Implementation Plan

## Problem Statement

The embedded forum iframe cannot access the parent page URL due to cross-origin restrictions. This breaks the sharing functionality when community hosting URL is not configured - it falls back to the iframe's own URL instead of the parent site's URL.

## Current Architecture

### Forum Iframe Creation Flow
```
Customer Page: https://example.com/blog-post
    ↓ embed.js runs in parent context
InternalPluginHost.initializeAuthPhase()
    ↓ creates auth iframe: /embed?theme=light&community=...
User authenticates
    ↓ handleAuthCompletion() called
InternalPluginHost.switchToForum()
    ↓ creates forum iframe: forum.curia.network/c/community?mod=standalone&cg_theme=light
```

### Key Location: `switchToForum()` Method

**File**: `src/lib/embed/plugin-host/InternalPluginHost.ts`  
**Lines**: ~245-285 (forum iframe creation)

```typescript
private async switchToForum(): Promise<void> {
  // Build forum URL with parameters
  const forumUrl = new URL(this.forumUrl);
  forumUrl.searchParams.set('mod', 'standalone');
  forumUrl.searchParams.set('cg_theme', resolvedTheme);
  forumUrl.searchParams.set('iframeUid', this.myUid);
  
  // Create forum iframe
  const iframe = document.createElement('iframe');
  iframe.src = forumUrl.toString(); // ← Need to add parent_url here
}
```

## Solution Design

### 1. Parent URL Access
The embed script runs in the parent page context and has access to `window.location.href`. We need to:
- Capture the parent URL during embed initialization
- Pass it through to the forum iframe creation

### 2. Parameter Name
- **Parameter**: `parent_url`
- **Value**: URL-encoded parent page URL
- **Purpose**: Enable forum to generate share links pointing to parent site

### 3. Integration Points

#### A. Embed Initialization
**File**: `src/lib/embed/embed-entry.ts`
- Capture `window.location.href` during initialization
- Store in config or pass to InternalPluginHost

#### B. Forum Iframe Creation
**File**: `src/lib/embed/plugin-host/InternalPluginHost.ts`
- Add `parent_url` parameter to forum URL
- URL-encode the parent page URL

#### C. Handle URL Changes (Future)
- For SPA sites where URL changes without page reload
- Consider postMessage updates or iframe src changes

## Implementation Plan

### Phase 1: Basic Parent URL Passing

**Files to Modify:**
- `src/lib/embed/embed-entry.ts` - Capture parent URL
- `src/lib/embed/plugin-host/InternalPluginHost.ts` - Add to forum URL

**Changes:**
1. Store parent URL in InternalPluginHost constructor
2. Add `parent_url` parameter to forum iframe URL
3. URL-encode the parent page URL

### Phase 2: Integration with Existing Parameter System

**Files to Modify:**
- `src/lib/embed/types/EmbedTypes.ts` - Add parentUrl to EmbedConfig
- `src/app/embed/page.tsx` - Handle parent URL in auth phase

**Changes:**
1. Add `parentUrl` property to EmbedConfig interface
2. Pass parent URL through authentication flow
3. Maintain consistency with existing parameter system

### Phase 3: Advanced Features (Future)

**Potential Enhancements:**
- Dynamic URL updates for SPA sites
- Parent URL validation and sanitization
- Fallback handling for missing parent URL

## Technical Implementation

### 1. Capture Parent URL in Embed Entry

**Location**: `src/lib/embed/embed-entry.ts`

```typescript
// Main embed initialization function
function initializeEmbed() {
  console.log('[Embed] Initializing Curia embed script...');

  try {
    // Capture parent page URL
    const parentUrl = window.location.href;
    console.log('[Embed] Parent page URL:', parentUrl);
    
    // Extract external parameters from parent page URL
    const externalParams = extractCuriaParameters();
    
    // Parse configuration from script attributes
    const config = parseEmbedConfig(EMBED_SCRIPT_ELEMENT);
    
    // Add parent URL to config
    config.parentUrl = parentUrl;
    
    // Add external parameters to config
    if (Object.keys(externalParams).length > 0) {
      config.externalParams = externalParams;
    }
    
    // Create embed instance with parent URL
    const embedInstance = new InternalPluginHost(
      container,
      config,
      CURIA_HOST_URL,
      CURIA_FORUM_URL
    );
  } catch (error) {
    console.error('[Embed] Failed to initialize embed:', error);
  }
}
```

### 2. Update EmbedConfig Interface

**Location**: `src/lib/embed/types/EmbedTypes.ts`

```typescript
export interface EmbedConfig {
  community: string | null;
  theme: 'light' | 'dark' | 'auto';
  backgroundColor?: string;
  borderRadius?: string;
  container: string | null;
  height: string;
  width: string;
  mode?: 'full' | 'auth-only';
  externalParams?: Record<string, string>;
  parentUrl?: string; // New property
}
```

### 3. Add Parent URL to Forum Iframe

**Location**: `src/lib/embed/plugin-host/InternalPluginHost.ts`

```typescript
private async switchToForum(): Promise<void> {
  console.log('[InternalPluginHost] Switching to forum phase');
  
  if (!this.authContext) {
    console.error('[InternalPluginHost] Cannot switch to forum - no auth context');
    return;
  }

  // Build forum URL with parameters
  const forumUrl = new URL(this.forumUrl);
  forumUrl.searchParams.set('mod', 'standalone');
  forumUrl.searchParams.set('cg_theme', resolvedTheme);
  forumUrl.searchParams.set('iframeUid', this.myUid);
  
  // Add parent URL parameter
  if (this.config.parentUrl) {
    const encodedParentUrl = encodeURIComponent(this.config.parentUrl);
    forumUrl.searchParams.set('parent_url', encodedParentUrl);
    console.log('[InternalPluginHost] Adding parent URL to forum iframe:', this.config.parentUrl);
  }
  
  // Add external parameters to forum URL
  if (this.authContext.externalParams) {
    console.log('[InternalPluginHost] Adding external parameters to forum iframe:', this.authContext.externalParams);
    for (const [key, value] of Object.entries(this.authContext.externalParams)) {
      forumUrl.searchParams.set(key, value);
    }
  }
  
  console.log('[InternalPluginHost] Forum URL:', forumUrl.toString());
  
  // Create forum iframe
  const iframe = document.createElement('iframe');
  iframe.src = forumUrl.toString();
  // ... rest of iframe creation
}
```

### 4. Pass Parent URL Through Auth Flow

**Location**: `src/app/embed/page.tsx`

```typescript
// Send auth completion message to parent
const sendAuthCompleteMessage = useCallback((userId: string, communityId: string, sessionToken?: string, identityType?: string) => {
  // Extract parent URL from URL parameters (if passed through)
  const parentUrl = searchParams.get('parent_url');
  
  const message = {
    type: 'curia-auth-complete',
    mode: config.mode || 'full',
    userId,
    communityId,
    sessionToken,
    identityType,
    externalParams,
    parentUrl: parentUrl ? decodeURIComponent(parentUrl) : undefined,
    timestamp: new Date().toISOString()
  };
  
  window.parent.postMessage(message, '*');
}, [config.mode, externalParams, searchParams]);
```

### 5. Update Auth Context

**Location**: `src/lib/embed/plugin-host/InternalPluginHost.ts`

```typescript
export interface InternalAuthContext {
  userId: string;
  communityId: string;
  sessionToken?: string;
  externalParams?: Record<string, string>;
  parentUrl?: string; // New property
}

private async handleAuthCompletion(authData: any): Promise<void> {
  console.log('[InternalPluginHost] Auth completion received:', authData);
  
  // Store auth context including parent URL
  this.authContext = {
    userId: authData.userId,
    communityId: authData.communityId,
    sessionToken: authData.sessionToken,
    externalParams: authData.externalParams,
    parentUrl: authData.parentUrl || this.config.parentUrl
  };
  
  console.log('[InternalPluginHost] Auth context set:', this.authContext);
  
  // Continue with forum switching...
}
```

## URL Examples

### Before Implementation
```
Customer Page: https://example.com/blog-post
Forum Iframe: https://forum.curia.network/c/community?mod=standalone&cg_theme=light
```

### After Implementation
```
Customer Page: https://example.com/blog-post
Forum Iframe: https://forum.curia.network/c/community?mod=standalone&cg_theme=light&parent_url=https%3A%2F%2Fexample.com%2Fblog-post
```

### Complex Example with External Parameters
```
Customer Page: https://example.com/blog-post?curia_highlight=comment-123
Forum Iframe: https://forum.curia.network/c/community?mod=standalone&cg_theme=light&parent_url=https%3A%2F%2Fexample.com%2Fblog-post%3Fcuria_highlight%3Dcomment-123&ext_highlight=comment-123
```

## Security Considerations

### URL Validation
- Validate parent URL format to prevent XSS
- Limit URL length to prevent denial of service
- Sanitize URL components before passing to iframe

### Origin Validation
- Consider validating parent URL origin against allowed domains
- Log parent URLs for security monitoring
- Implement rate limiting for suspicious patterns

## Testing Strategy

### Unit Tests
- Test parent URL capture in different environments
- Test URL encoding/decoding functionality
- Test parameter integration with existing system

### Integration Tests
- Test parent URL passing through auth flow
- Test forum iframe receives correct parent URL
- Test URL parameter combinations

### Manual Testing
- Test on different customer sites
- Test with various URL formats and parameters
- Test sharing functionality in embedded forum

## Performance Considerations

### Minimal Impact
- URL capture is instantaneous (`window.location.href`)
- URL encoding adds minimal processing overhead
- Parameter addition doesn't affect iframe load time

### URL Length
- Monitor total URL length to avoid browser limits
- Consider URL shortening for very long parent URLs
- Implement parameter prioritization if needed

## Rollout Plan

### Phase 1: Core Implementation
1. Implement parent URL capture and passing
2. Test with development environment
3. Verify forum receives parent URL parameter

### Phase 2: Integration Testing
1. Test with staging environment
2. Verify sharing functionality works correctly
3. Test with different customer site configurations

### Phase 3: Production Deployment
1. Deploy to production environment
2. Monitor for issues and performance impact
3. Gather feedback from forum application team

## Success Metrics

### Technical Metrics
- Parent URL successfully passed in 100% of cases
- No performance degradation in embed load time
- No increase in error rates

### Business Metrics
- Improved sharing functionality for embedded forums
- Better user experience for communities without custom hosting
- Reduced support tickets related to sharing issues

## Future Enhancements

### Dynamic URL Updates
- Handle SPA navigation in parent page
- Update iframe src when parent URL changes
- Implement postMessage for URL updates

### Advanced URL Handling
- URL normalization and canonicalization
- Support for URL fragments and complex parameters
- Custom URL transformation rules

### Analytics Integration
- Track parent URL usage patterns
- Monitor sharing behavior improvements
- Analyze customer adoption rates

## Conclusion

This implementation will enable the embedded forum to access the parent page URL, fixing the sharing functionality issue. The solution is:

- **Simple**: Captures `window.location.href` during embed initialization
- **Secure**: URL-encoded and validated for safety
- **Compatible**: Integrates seamlessly with existing parameter system
- **Performant**: Minimal overhead and no impact on load times
- **Extensible**: Foundation for future URL-related features

The change will improve the user experience for embedded forums by enabling proper share links that point to the parent site instead of the iframe URL. 