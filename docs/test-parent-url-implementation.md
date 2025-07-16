# Test: Parent URL Implementation

## Test Setup

### Development Server
```bash
yarn dev
```

## Test Cases

### ✅ Test 1: With data-community (Parent URL Should Be Added)

#### Test URL
```
http://localhost:3001/demo?curia_highlight=comment-123
```

#### Expected Script Tag Simulation
```html
<script 
  src="/embed.js"
  data-community="test-community"
  data-theme="light">
</script>
```

#### Expected Console Output
```
[Embed] Parent page URL captured: http://localhost:3001/demo?curia_highlight=comment-123
[Embed] Found curia parameter: curia_highlight=comment-123 → ext_highlight=comment-123
[Embed] External parameters added to config: {ext_highlight: "comment-123"}
[Embed] Final parsed config: {community: "test-community", parentUrl: "http://localhost:3001/demo?curia_highlight=comment-123", ...}
[InternalPluginHost] Adding parent URL to auth iframe: http://localhost:3001/demo?curia_highlight=comment-123
[InternalPluginHost] Adding parent URL (community pre-specified): http://localhost:3001/demo?curia_highlight=comment-123
```

#### Expected URL Flow
1. **Parent Page**: `http://localhost:3001/demo?curia_highlight=comment-123`
2. **Auth Iframe**: `http://localhost:3001/embed?theme=light&community=test-community&parent_url=http%3A%2F%2Flocalhost%3A3001%2Fdemo%3Fcuria_highlight%3Dcomment-123&ext_highlight=comment-123`
3. **Forum Iframe**: `http://forum.curia.network/c/community?mod=standalone&cg_theme=light&parent_url=http%3A%2F%2Flocalhost%3A3001%2Fdemo%3Fcuria_highlight%3Dcomment-123&ext_highlight=comment-123`

### ❌ Test 2: Without data-community (Parent URL Should Be Skipped)

#### Test URL
```
http://localhost:3001/demo?curia_highlight=comment-123
```

#### Expected Script Tag Simulation
```html
<script 
  src="/embed.js"
  data-theme="light">
</script>
```

#### Expected Console Output
```
[Embed] Parent page URL captured: http://localhost:3001/demo?curia_highlight=comment-123
[Embed] Found curia parameter: curia_highlight=comment-123 → ext_highlight=comment-123
[Embed] External parameters added to config: {ext_highlight: "comment-123"}
[Embed] Final parsed config: {community: null, parentUrl: "http://localhost:3001/demo?curia_highlight=comment-123", ...}
[InternalPluginHost] Adding parent URL to auth iframe: http://localhost:3001/demo?curia_highlight=comment-123
[InternalPluginHost] Skipping parent URL (no community pre-specified)
```

#### Expected URL Flow
1. **Parent Page**: `http://localhost:3001/demo?curia_highlight=comment-123`
2. **Auth Iframe**: `http://localhost:3001/embed?theme=light&parent_url=http%3A%2F%2Flocalhost%3A3001%2Fdemo%3Fcuria_highlight%3Dcomment-123&ext_highlight=comment-123`
3. **Forum Iframe**: `http://forum.curia.network/c/community?mod=standalone&cg_theme=light&ext_highlight=comment-123` (NO parent_url parameter)

### ✅ Test 3: Complex URL with Special Characters

#### Test URL
```
http://localhost:3001/demo?curia_highlight=comment-123&utm_source=newsletter&section=governance
```

#### Expected Script Tag Simulation
```html
<script 
  src="/embed.js"
  data-community="governance-dao"
  data-theme="dark">
</script>
```

#### Expected Result
- Parent URL properly encoded: `http%3A%2F%2Flocalhost%3A3001%2Fdemo%3Fcuria_highlight%3Dcomment-123%26utm_source%3Dnewsletter%26section%3Dgovernance`
- Only `curia_*` parameters converted to `ext_*`
- Full URL preserved in `parent_url` parameter

## Manual Testing Steps

### Step 1: Test With Community
1. Open browser console
2. Navigate to `http://localhost:3001/demo`
3. Check console for expected log messages
4. Verify parent URL is added to forum iframe

### Step 2: Test Without Community
1. Modify demo page to remove `data-community` attribute
2. Navigate to `http://localhost:3001/demo` 
3. Check console for "Skipping parent URL" message
4. Verify parent URL is NOT added to forum iframe

### Step 3: Test URL Encoding
1. Navigate to `http://localhost:3001/demo?test=hello%20world&curia_highlight=comment-123`
2. Verify URL is properly encoded in iframe parameters
3. Check that special characters are preserved

## Debug Console Commands

### Check Current Config
```javascript
// In browser console
window.curiaEmbed.config
```

### Check Auth Context
```javascript
// In browser console  
window.curiaEmbed.authContext
```

### Enable Debug Mode
```javascript
// In browser console
localStorage.setItem('curia_debug', 'true');
```

## Expected Behavior Summary

### With data-community Attribute
- ✅ Parent URL captured during initialization
- ✅ Parent URL added to auth iframe
- ✅ Parent URL passed through auth completion message
- ✅ Parent URL added to forum iframe URL
- ✅ External parameters also work correctly

### Without data-community Attribute
- ✅ Parent URL captured during initialization
- ✅ Parent URL added to auth iframe
- ✅ Parent URL passed through auth completion message
- ❌ Parent URL NOT added to forum iframe URL (by design)
- ✅ External parameters still work correctly

## Implementation Details Verification

### Check EmbedConfig Interface
- ✅ `parentUrl?: string` property added
- ✅ Available in config object throughout embed lifecycle

### Check Parameter Flow
- ✅ `window.location.href` captured in `embed-entry.ts`
- ✅ Added to config in `initializeEmbed()`
- ✅ Passed to auth iframe with URL encoding
- ✅ Extracted in embed route and passed through auth completion
- ✅ Stored in auth context
- ✅ Used in forum iframe creation with condition

### Check Condition Logic
- ✅ Only adds `parent_url` when `this.config.community` is truthy
- ✅ Logs different messages for each scenario
- ✅ URL encoding handles special characters correctly

## Error Cases to Test

### Invalid URLs
- Test with malformed URLs (should still work)
- Test with very long URLs (should be truncated if needed)
- Test with URLs containing dangerous characters (should be encoded)

### Missing Data
- Test when `window.location.href` is unavailable (edge case)
- Test when community is empty string vs null
- Test when parent URL is empty string

## Success Criteria

### ✅ Functional Requirements
- [ ] Parent URL captured correctly
- [ ] Condition logic works (only add when community specified)
- [ ] URL encoding prevents breaking iframe URLs
- [ ] Integration with existing parameter system works
- [ ] No breaking changes to existing functionality

### ✅ Technical Requirements
- [ ] Console logging provides clear debugging information
- [ ] Error handling for edge cases
- [ ] Performance impact is minimal
- [ ] Code is maintainable and well-documented

## Next Steps After Testing

1. **Manual Verification**: Run through all test cases
2. **Edge Case Testing**: Test with unusual URL formats
3. **Performance Testing**: Verify no impact on load times
4. **Documentation Update**: Update customer documentation
5. **Production Deployment**: Deploy to staging environment

## Notes

- The implementation maintains backward compatibility
- The condition makes the feature more reliable and predictable
- The URL encoding ensures security and proper parameter handling
- The feature integrates seamlessly with existing `curia_*` parameter system 