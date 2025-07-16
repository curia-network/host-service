# Curia Query Parameter Passthrough Research

## Overview

This document outlines the implementation plan for enabling the embed system to detect `curia_*` query parameters from the parent page URL and pass them down to the embedded iframe applications.

## Current Architecture

### Embed System Flow
```
Customer Site (https://example.com/page?curia_highlight=comment-123)
    ↓ Include <script src="/embed.js">
Embed Script (public/embed.js)
    ↓ Reads data-* attributes only
InternalPluginHost
    ↓ Creates iframe: /embed?theme=light&community=...
Auth Phase (/embed)
    ↓ User authenticates
    ↓ PostMessage: curia-auth-complete
    ↓ Switch to forum iframe
Forum Phase (forum.curia.network/c/community?mod=standalone&cg_theme=light)
    ↓ Full forum functionality
```

### Problem Statement
Currently, the embed system only reads configuration from `data-*` attributes on the script tag. External sites cannot dynamically pass contextual information (like deep-link targets, user preferences, or page context) to the embedded forum through URL parameters.

## Proposed Feature

### Goal
Enable external sites to pass data to embedded Curia applications by adding `curia_*` query parameters to their page URLs.

### Example Use Cases
1. **Deep Linking**: `?curia_highlight=comment-123` → Forum scrolls to specific comment
2. **User Context**: `?curia_author=vitalik.eth` → Forum shows author's profile
3. **Topic Focus**: `?curia_topic=governance` → Forum filters to governance discussions
4. **Embed Behavior**: `?curia_theme=dark` → Override default theme from URL
5. **Analytics**: `?curia_source=newsletter` → Track embed usage source

### URL Examples
```
https://example.com/blog-post?curia_highlight=comment-123&curia_author=vitalik.eth
                              ↓ becomes ↓
https://host.com/embed?theme=light&ext_highlight=comment-123&ext_author=vitalik.eth
```

## Implementation Plan

### Phase 1: Parameter Detection and Parsing

**Files to Modify:**
- `src/lib/embed/embed-entry.ts`
- `src/lib/embed/core/EmbedConfig.ts` 
- `src/lib/embed/types/EmbedTypes.ts`

**Changes:**
1. Add URL parameter detection function in `embed-entry.ts`
2. Extract `curia_*` parameters from parent page URL
3. Strip `curia_` prefix and optionally add `ext_` prefix
4. Include external parameters in `EmbedConfig` interface
5. Pass external parameters to `InternalPluginHost`

### Phase 2: Parameter Passthrough to Auth Phase

**Files to Modify:**
- `src/lib/embed/plugin-host/InternalPluginHost.ts`
- `src/app/embed/page.tsx`

**Changes:**
1. Include external parameters in auth iframe URL
2. Update embed route to handle external parameters
3. Store external parameters in embed state
4. Pass external parameters through auth completion message

### Phase 3: Parameter Passthrough to Forum Phase

**Files to Modify:**
- `src/lib/embed/plugin-host/InternalPluginHost.ts`

**Changes:**
1. Include external parameters in forum iframe URL  
2. Ensure external parameters reach final forum application
3. Test end-to-end parameter flow

### Phase 4: Documentation and Testing

**Files to Create/Modify:**
- `docs/embed-parameters.md` - User documentation
- Test cases for parameter detection
- Example implementations

## Technical Implementation Details

### 1. URL Parameter Detection

**Location:** `src/lib/embed/embed-entry.ts`

```typescript
function extractCuriaParameters(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const curiaParams: Record<string, string> = {};
  
  for (const [key, value] of params) {
    if (key.startsWith('curia_')) {
      const cleanKey = key.substring(6); // Remove 'curia_' prefix
      const externalKey = `ext_${cleanKey}`; // Add 'ext_' prefix
      curiaParams[externalKey] = value;
    }
  }
  
  return curiaParams;
}
```

### 2. Enhanced EmbedConfig Interface

**Location:** `src/lib/embed/types/EmbedTypes.ts`

```typescript
export interface EmbedConfig {
  // Existing properties...
  community: string | null;
  theme: 'light' | 'dark' | 'auto';
  backgroundColor?: string;
  borderRadius?: string;
  container: string | null;
  height: string;
  width: string;
  mode?: 'full' | 'auth-only';
  
  // New property for external parameters
  externalParams?: Record<string, string>;
}
```

### 3. Parameter Passthrough in InternalPluginHost

**Location:** `src/lib/embed/plugin-host/InternalPluginHost.ts`

```typescript
private initializeAuthPhase(): void {
  const authUrl = new URL(`${this.hostServiceUrl}/embed`);
  
  // Existing parameters...
  authUrl.searchParams.set('theme', this.config.theme || 'light');
  if (this.config.community) {
    authUrl.searchParams.set('community', this.config.community);
  }
  
  // New: Add external parameters
  if (this.config.externalParams) {
    for (const [key, value] of Object.entries(this.config.externalParams)) {
      authUrl.searchParams.set(key, value);
    }
  }
  
  // Create iframe with enhanced URL...
}
```

### 4. Forum Phase Parameter Passthrough

**Location:** `src/lib/embed/plugin-host/InternalPluginHost.ts`

```typescript
private async switchToForum(): Promise<void> {
  const forumUrl = new URL(this.forumUrl);
  
  // Existing parameters...
  forumUrl.searchParams.set('mod', 'standalone');
  forumUrl.searchParams.set('cg_theme', resolvedTheme);
  
  // New: Add external parameters
  if (this.config.externalParams) {
    for (const [key, value] of Object.entries(this.config.externalParams)) {
      forumUrl.searchParams.set(key, value);
    }
  }
  
  // Create forum iframe with enhanced URL...
}
```

### 5. Embed Route Enhancement

**Location:** `src/app/embed/page.tsx`

```typescript
const EmbedContent: React.FC = () => {
  const searchParams = useSearchParams();
  
  // Extract external parameters
  const externalParams: Record<string, string> = {};
  for (const [key, value] of searchParams) {
    if (key.startsWith('ext_')) {
      externalParams[key] = value;
    }
  }
  
  // Pass external parameters through auth completion
  const sendAuthCompleteMessage = useCallback((userId: string, communityId: string, sessionToken?: string, identityType?: string) => {
    const message = {
      type: 'curia-auth-complete',
      userId,
      communityId,
      sessionToken,
      identityType,
      externalParams, // Include external parameters
      timestamp: new Date().toISOString()
    };
    
    window.parent.postMessage(message, '*');
  }, [externalParams]);
  
  // Rest of component...
};
```

## Build System Integration

### Build Script Enhancement

**Location:** `scripts/build-embed-bundled.ts`

No changes required - the current esbuild process will automatically bundle the enhanced TypeScript code.

### Testing the Build

```bash
# Build updated embed script
yarn build:embed

# Test parameter detection
# Visit: http://localhost:3001/demo?curia_highlight=comment-123&curia_author=vitalik.eth
```

## Parameter Naming Convention

### Input Format (Customer Page)
```
https://example.com/page?curia_highlight=comment-123&curia_author=vitalik.eth
```

### Internal Format (Embed → Auth)
```
https://host.com/embed?theme=light&ext_highlight=comment-123&ext_author=vitalik.eth
```

### Final Format (Auth → Forum)
```
https://forum.curia.network/c/community?mod=standalone&ext_highlight=comment-123&ext_author=vitalik.eth
```

## Security Considerations

### Parameter Validation
- Validate parameter names (alphanumeric + underscore only)
- Limit parameter value length (e.g., 1000 characters)
- Sanitize parameter values to prevent XSS

### URL Length Limits
- Monitor total URL length to avoid browser limits (~2000 characters)
- Consider parameter prioritization if limits are reached

### Origin Validation
- Ensure parameters only come from expected domains
- Log parameter usage for debugging and analytics

## Testing Strategy

### Unit Tests
- Parameter extraction logic
- URL building with external parameters
- Parameter validation and sanitization

### Integration Tests
- End-to-end parameter flow: Customer page → Auth → Forum
- Parameter persistence through auth completion
- Error handling for invalid parameters

### Manual Testing
- Test various parameter combinations
- Verify parameter availability in forum application
- Test parameter behavior across different embed modes

## Migration and Rollout

### Backward Compatibility
- Feature is additive - existing embeds continue working
- No breaking changes to current API

### Rollout Plan
1. **Phase 1**: Deploy parameter detection (no behavioral changes)
2. **Phase 2**: Enable parameter passthrough to auth phase
3. **Phase 3**: Enable parameter passthrough to forum phase
4. **Phase 4**: Document feature and notify customers

## Documentation Requirements

### Customer Documentation
- How to use `curia_*` parameters
- Available parameter names and formats
- Examples and use cases

### Developer Documentation
- Technical implementation details
- Parameter flow diagram
- Debugging guide

## Success Metrics

### Technical Metrics
- Parameter detection accuracy (100% for valid formats)
- Parameter passthrough success rate
- No performance impact on embed load time

### Business Metrics
- Customer adoption of parameter feature
- Use case diversity (deep linking, personalization, analytics)
- Forum engagement improvement with contextual parameters

## Future Enhancements

### Dynamic Parameter Updates
- Allow parameter updates without page reload
- JavaScript API for parameter manipulation

### Parameter Preprocessing
- Transform parameters based on embed configuration
- Support for parameter aliases and mappings

### Analytics Integration
- Track parameter usage patterns
- Provide insights on customer parameter adoption

## Conclusion

This implementation will enable a powerful new capability for Curia embeds while maintaining backward compatibility and security. The feature allows external sites to pass contextual information to embedded forums, enabling deep linking, personalization, and enhanced user experiences.

The modular approach ensures each phase can be implemented and tested independently, reducing risk and enabling iterative improvements. 