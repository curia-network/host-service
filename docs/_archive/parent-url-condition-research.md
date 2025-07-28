# Parent URL Condition Research: Only Add When Community is Pre-specified

## Research Question
Can we easily add a condition to only include the `parent_url` parameter when the embed has a `data-community` attribute defined?

## Finding: ✅ YES - Very Easy to Implement

### Current Data Flow
```
Script Tag: <script data-community="my-community" src="/embed.js">
    ↓ parseEmbedConfig() reads data-community
EmbedConfig: { community: "my-community" | null }
    ↓ passed to InternalPluginHost constructor
InternalPluginHost: this.config.community
    ↓ accessed in switchToForum() method
Forum Iframe Creation: where parent_url would be added
```

### Key Discovery
The `data-community` attribute is already parsed and stored as `config.community` in the `EmbedConfig` interface:

**File**: `src/lib/embed/core/EmbedConfig.ts`
```typescript
const config: EmbedConfig = {
  community: script.getAttribute('data-community') || null,
  // ... other attributes
};
```

### Implementation Location
The condition can be added in `switchToForum()` method in `InternalPluginHost.ts`:

**Current Code** (lines ~245-285):
```typescript
private async switchToForum(): Promise<void> {
  // Build forum URL with parameters
  const forumUrl = new URL(this.forumUrl);
  forumUrl.searchParams.set('mod', 'standalone');
  forumUrl.searchParams.set('cg_theme', resolvedTheme);
  forumUrl.searchParams.set('iframeUid', this.myUid);
  
  // Add external parameters to forum URL
  if (this.authContext.externalParams) {
    for (const [key, value] of Object.entries(this.authContext.externalParams)) {
      forumUrl.searchParams.set(key, value);
    }
  }
  
  // CREATE FORUM IFRAME HERE
}
```

### Proposed Implementation
```typescript
private async switchToForum(): Promise<void> {
  // Build forum URL with parameters
  const forumUrl = new URL(this.forumUrl);
  forumUrl.searchParams.set('mod', 'standalone');
  forumUrl.searchParams.set('cg_theme', resolvedTheme);
  forumUrl.searchParams.set('iframeUid', this.myUid);
  
  // Add parent URL parameter ONLY if community is pre-specified
  if (this.config.community && this.config.parentUrl) {
    const encodedParentUrl = encodeURIComponent(this.config.parentUrl);
    forumUrl.searchParams.set('parent_url', encodedParentUrl);
    console.log('[InternalPluginHost] Adding parent URL (community pre-specified):', this.config.parentUrl);
  } else if (!this.config.community) {
    console.log('[InternalPluginHost] Skipping parent URL (no community pre-specified)');
  }
  
  // Add external parameters to forum URL
  if (this.authContext.externalParams) {
    for (const [key, value] of Object.entries(this.authContext.externalParams)) {
      forumUrl.searchParams.set(key, value);
    }
  }
  
  // CREATE FORUM IFRAME HERE
}
```

## Use Case Analysis

### ✅ With data-community (Parent URL Added)
```html
<script 
  src="/embed.js"
  data-community="my-dao"
  data-theme="light">
</script>
```
**Result**: Forum iframe gets `parent_url` parameter
**Reasoning**: User will definitely end up in "my-dao" community, so parent URL is reliable

### ❌ Without data-community (Parent URL Skipped)
```html
<script 
  src="/embed.js"
  data-theme="light">
</script>
```
**Result**: Forum iframe does NOT get `parent_url` parameter
**Reasoning**: User goes through community selection, final community is unpredictable

## Technical Implementation

### Single Condition Check
The implementation requires only one additional condition:
```typescript
if (this.config.community && this.config.parentUrl) {
  // Add parent URL parameter
}
```

### Logic Flow
1. **Check if community is pre-specified**: `this.config.community` is not null
2. **Check if parent URL is available**: `this.config.parentUrl` exists
3. **Add parameter only if both conditions are met**

### No Breaking Changes
- Existing embeds without `data-community` continue working (no parent URL added)
- Existing embeds with `data-community` get the new functionality
- The condition is completely additive

## Benefits of This Approach

### 1. **Predictable Community Context**
- Parent URL is only added when we know exactly which community the user will end up in
- No risk of parent URL being associated with wrong community

### 2. **Reliable Sharing Links**
- Share links will point to the correct parent page that hosts the specific community
- No confusion about which community the shared link should load

### 3. **Simple Implementation**
- Single condition check in one location
- No complex logic or edge case handling needed
- Easy to test and debug

### 4. **Backward Compatible**
- Embeds without `data-community` work exactly as before
- No changes to existing customer implementations

## Edge Cases Handled

### Community Selection Flow
```html
<!-- Without data-community -->
<script src="/embed.js">
```
**Flow**: Auth → Community Selection → Forum
**Parent URL**: Not added (correct - user picks community)

### Direct Community Flow
```html
<!-- With data-community -->
<script data-community="governance" src="/embed.js">
```
**Flow**: Auth → Forum (governance community)
**Parent URL**: Added (correct - predictable community)

### Mixed Parameters
```html
<!-- With community + external params -->
<script data-community="dao" src="/embed.js">
```
**URL**: `?curia_highlight=comment-123`
**Result**: Both `parent_url` and `ext_highlight` parameters added

## Testing Strategy

### Test Cases
1. **With data-community**: Verify parent URL is added
2. **Without data-community**: Verify parent URL is skipped
3. **Mixed scenarios**: Test with various combinations of attributes
4. **Edge cases**: Test with empty/invalid community values

### Debug Logging
The implementation includes clear logging:
```
[InternalPluginHost] Adding parent URL (community pre-specified): https://example.com/page
[InternalPluginHost] Skipping parent URL (no community pre-specified)
```

## Implementation Effort

### Complexity: **Very Low**
- Single condition check
- No new interfaces or types needed
- No changes to existing parameter system

### Files to Modify: **1 File**
- `src/lib/embed/plugin-host/InternalPluginHost.ts`

### Lines of Code: **~5 lines**
- Add condition check
- Add logging statements

### Testing Time: **~15 minutes**
- Test both scenarios locally
- Verify correct behavior

## Security Considerations

### URL Validation
Since parent URL is only added when community is pre-specified, the security profile is actually improved:
- Reduced attack surface (fewer cases where parent URL is used)
- More predictable behavior for security analysis

### No Additional Risks
The condition doesn't introduce new security considerations beyond the base parent URL feature.

## Conclusion

### ✅ **Highly Feasible**
The condition is extremely easy to implement and makes perfect sense from both technical and UX perspectives.

### ✅ **Clean Implementation**
The solution integrates seamlessly with existing code and requires minimal changes.

### ✅ **Logical Business Rule**
The condition aligns perfectly with the use case - parent URL is only reliable when the community is predictable.

### ✅ **No Downsides**
The implementation has zero negative impact on existing functionality and reduces complexity for edge cases.

## Recommendation

**Implement the condition immediately** - it's a simple one-line check that makes the feature more robust and predictable. 