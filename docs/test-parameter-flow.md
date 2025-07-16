# Test: Curia Parameter Flow

## Test Setup

### 1. Start Development Server
```bash
yarn dev
```

### 2. Test URLs

#### Basic Test (No Parameters)
```
http://localhost:3001/demo
```
**Expected**: Normal forum embed, no external parameters

#### Single Parameter Test
```
http://localhost:3001/demo?curia_highlight=comment-123
```
**Expected**: 
- Console shows: `[Embed] Found curia parameter: curia_highlight=comment-123 → ext_highlight=comment-123`
- Auth iframe URL includes: `ext_highlight=comment-123`
- Forum iframe URL includes: `ext_highlight=comment-123`

#### Multiple Parameters Test
```
http://localhost:3001/demo?curia_highlight=comment-123&curia_author=vitalik.eth&curia_source=newsletter
```
**Expected**:
- Console shows detection of all 3 parameters
- All parameters passed through to forum with `ext_` prefix

#### Invalid Parameters Test
```
http://localhost:3001/demo?highlight=comment-123&curia_author=vitalik.eth&invalid=test
```
**Expected**:
- Only `curia_author` parameter is detected
- `highlight` and `invalid` parameters are ignored

## Test Checklist

### ✅ Phase 1: Parameter Detection
- [ ] Parameters detected in parent page URL
- [ ] Only `curia_*` parameters are captured
- [ ] Parameters converted to `ext_*` format
- [ ] Console logging shows parameter detection

### ✅ Phase 2: Auth Phase Passthrough
- [ ] External parameters added to auth iframe URL
- [ ] Parameters visible in `/embed` route
- [ ] Parameters included in auth completion message

### ✅ Phase 3: Forum Phase Passthrough
- [ ] External parameters added to forum iframe URL
- [ ] Parameters reach final forum application
- [ ] Parameters maintained through auth flow

### ✅ Phase 4: Documentation
- [ ] User documentation created
- [ ] Test cases documented
- [ ] Troubleshooting guide provided

## Debug Console Messages

When testing, look for these console messages:

```
[Embed] Checking parent page URL for curia_* parameters: ?curia_highlight=comment-123
[Embed] Found curia parameter: curia_highlight=comment-123 → ext_highlight=comment-123
[Embed] External parameters added to config: {ext_highlight: "comment-123"}
[Embed] Final parsed config: {community: null, theme: "light", externalParams: {ext_highlight: "comment-123"}}
[InternalPluginHost] Adding external parameters to auth iframe: {ext_highlight: "comment-123"}
[InternalPluginHost] Adding external parameters to forum iframe: {ext_highlight: "comment-123"}
```

## Test Results

### Manual Testing Results
- **Date**: [Fill in when tested]
- **Browser**: [Fill in when tested]
- **Basic Test**: [Pass/Fail]
- **Single Parameter**: [Pass/Fail]
- **Multiple Parameters**: [Pass/Fail]
- **Invalid Parameters**: [Pass/Fail]

### URL Flow Verification
1. **Parent Page**: `http://localhost:3001/demo?curia_highlight=comment-123`
2. **Auth Iframe**: `http://localhost:3001/embed?theme=light&ext_highlight=comment-123`
3. **Forum Iframe**: `http://forum.curia.network/c/community?mod=standalone&ext_highlight=comment-123`

### Edge Cases
- [ ] Empty parameter values: `?curia_highlight=`
- [ ] Special characters: `?curia_highlight=comment%2D123`
- [ ] Long parameter values: `?curia_data=very-long-value...`
- [ ] Multiple same parameters: `?curia_tag=tag1&curia_tag=tag2`

## Performance Impact

### Before (Original Embed)
- **File Size**: ~10KB
- **Load Time**: [Measure]

### After (With Parameters)
- **File Size**: 14KB (+4KB)
- **Load Time**: [Measure]
- **Parameter Detection**: [Measure]

## Production Readiness

### Security Checklist
- [ ] Parameter validation implemented
- [ ] URL length limits considered
- [ ] XSS prevention measures
- [ ] No sensitive data in parameters

### Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

### Error Handling
- [ ] Invalid parameter names
- [ ] Invalid parameter values
- [ ] URL parsing errors
- [ ] Iframe communication failures

## Next Steps

1. **Complete Manual Testing**: Run through all test cases
2. **Performance Testing**: Measure impact on load times
3. **Browser Testing**: Verify cross-browser compatibility
4. **Production Deployment**: Deploy to staging environment
5. **Customer Documentation**: Share embed-parameters.md with customers

## Known Issues

### Current Limitations
- Parameters are lost on page reload if not in URL
- No parameter validation beyond basic format checks
- No parameter transformation capabilities yet

### Future Enhancements
- Parameter validation and sanitization
- Parameter transformation/mapping
- Dynamic parameter updates without page reload
- Parameter persistence across sessions 