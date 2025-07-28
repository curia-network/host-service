# Curia Embed Parameters Guide

## Overview

Curia embeds now support passing contextual information from your page to the embedded forum through URL parameters. This enables powerful features like deep linking, user context, and personalized experiences.

## How It Works

Add `curia_*` parameters to your page URL, and they'll automatically be passed to the embedded forum:

```
https://yoursite.com/page?curia_highlight=comment-123&curia_author=vitalik.eth
                          ↓ automatically becomes ↓
Forum receives: ext_highlight=comment-123&ext_author=vitalik.eth
```

## Quick Start

### 1. Basic Setup
Your existing embed code works unchanged:

```html
<div id="my-forum"></div>
<script 
  src="https://your-host.com/embed.js"
  data-community="my-community"
  data-theme="light"
  async>
</script>
```

### 2. Add Parameters to Your Page
Simply add `curia_*` parameters to any page URL where your forum is embedded:

```
https://yoursite.com/blog-post?curia_highlight=comment-123
https://yoursite.com/governance?curia_topic=proposal-42
https://yoursite.com/profile?curia_author=vitalik.eth
```

### 3. Parameters Reach Your Forum
The forum application will receive these parameters with `ext_` prefix:

```
Forum URL: https://forum.curia.network/c/community?ext_highlight=comment-123
```

## Parameter Examples

### Deep Linking
```
?curia_highlight=comment-123    → Forum scrolls to specific comment
?curia_post=post-456           → Forum opens specific post
?curia_thread=thread-789       → Forum shows specific thread
```

### User Context
```
?curia_author=vitalik.eth      → Forum shows author's profile
?curia_user=user-123           → Forum loads user-specific view
?curia_profile=profile-456     → Forum displays profile information
```

### Content Filtering
```
?curia_topic=governance        → Forum filters to governance discussions
?curia_category=announcements  → Forum shows announcements category
?curia_tag=important          → Forum filters by tag
```

### Embed Behavior
```
?curia_theme=dark             → Override default theme
?curia_view=compact           → Use compact view mode
?curia_sort=newest           → Sort by newest first
```

### Analytics & Tracking
```
?curia_source=newsletter      → Track where users came from
?curia_campaign=launch-week   → Track marketing campaigns
?curia_ref=homepage          → Track referral sources
```

## Implementation Guide

### For Static Sites
Add parameters directly to your page URLs:

```html
<!-- Blog post with highlighted comment -->
<a href="/blog/post-1?curia_highlight=comment-123">
  View Discussion
</a>

<!-- Governance page with topic filter -->
<a href="/governance?curia_topic=proposal-42">
  Governance Forum
</a>
```

### For Dynamic Sites
Build URLs programmatically:

```javascript
// JavaScript example
const forumUrl = new URL(window.location.href);
forumUrl.searchParams.set('curia_highlight', 'comment-123');
forumUrl.searchParams.set('curia_author', 'vitalik.eth');

// Navigate to page with parameters
window.location.href = forumUrl.toString();
```

```php
// PHP example
$forumUrl = $_SERVER['REQUEST_URI'];
$params = [
    'curia_highlight' => 'comment-123',
    'curia_author' => 'vitalik.eth'
];

$finalUrl = $forumUrl . '?' . http_build_query($params);
```

### For React Applications
```jsx
// React Router example
import { useSearchParams } from 'react-router-dom';

function BlogPost() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const highlightComment = (commentId) => {
    setSearchParams({ curia_highlight: commentId });
  };
  
  return (
    <div>
      <button onClick={() => highlightComment('comment-123')}>
        Highlight Comment
      </button>
      
      {/* Your Curia embed */}
      <div id="forum-container"></div>
    </div>
  );
}
```

## Parameter Format

### Naming Rules
- **Must start with `curia_`** - Only parameters with this prefix are recognized
- **Alphanumeric and underscore only** - Use letters, numbers, and underscores
- **Case sensitive** - `curia_highlight` and `CURIA_HIGHLIGHT` are different

### Value Format
- **URL encoded** - Special characters are automatically URL encoded
- **String values** - All values are treated as strings
- **Length limit** - Keep values under 1000 characters

### Examples of Valid Parameters
```
✅ curia_highlight=comment-123
✅ curia_author=vitalik.eth
✅ curia_topic=governance
✅ curia_user_id=12345
✅ curia_view_mode=compact
```

### Examples of Invalid Parameters
```
❌ highlight=comment-123        (missing curia_ prefix)
❌ curia-highlight=comment-123  (dash instead of underscore)
❌ curia_highlight=comment@123  (special characters not URL encoded)
```

## Multiple Parameters

You can use multiple parameters together:

```
https://yoursite.com/page?curia_highlight=comment-123&curia_author=vitalik.eth&curia_source=newsletter
```

All parameters will be passed to the forum:
```
Forum receives: ext_highlight=comment-123&ext_author=vitalik.eth&ext_source=newsletter
```

## Security & Privacy

### Parameter Validation
- Parameters are validated for format and length
- Invalid parameters are silently ignored
- No sensitive data should be passed in URL parameters

### URL Length Limits
- Keep total URL length under 2000 characters
- Parameters are prioritized if URL becomes too long
- Consider using shorter parameter names for complex data

### Best Practices
```
✅ Use short, descriptive parameter names
✅ Keep parameter values concise
✅ Avoid sensitive information in URLs
✅ Use URL encoding for special characters

❌ Don't pass passwords or tokens
❌ Don't pass large amounts of data
❌ Don't rely on parameters for security
```

## Troubleshooting

### Parameters Not Working?

1. **Check the prefix**: Ensure parameters start with `curia_`
2. **Check the format**: Use underscores, not dashes
3. **Check the console**: Look for `[Embed]` debug messages
4. **Check URL encoding**: Special characters should be encoded

### Debug Mode
Enable debug logging in your browser console to see parameter detection:

```javascript
// In browser console
localStorage.setItem('curia_debug', 'true');
```

Look for these debug messages:
```
[Embed] Checking parent page URL for curia_* parameters
[Embed] Found curia parameter: curia_highlight=comment-123 → ext_highlight=comment-123
[Embed] External parameters added to config: {ext_highlight: "comment-123"}
```

### Common Issues

#### Parameters Not Detected
- **Cause**: Parameters don't start with `curia_`
- **Solution**: Add `curia_` prefix to all parameters

#### Parameters Not Reaching Forum
- **Cause**: Forum application doesn't handle `ext_*` parameters
- **Solution**: Update forum application to process external parameters

#### Special Characters Broken
- **Cause**: URL parameters not properly encoded
- **Solution**: Use `encodeURIComponent()` in JavaScript or equivalent in other languages

## Advanced Usage

### Dynamic Parameter Updates
Update parameters without page reload:

```javascript
function updateForumParameters(params) {
  const url = new URL(window.location.href);
  
  // Clear existing curia parameters
  for (const [key] of url.searchParams) {
    if (key.startsWith('curia_')) {
      url.searchParams.delete(key);
    }
  }
  
  // Add new parameters
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(`curia_${key}`, value);
  }
  
  // Update URL without reload
  window.history.replaceState({}, '', url.toString());
  
  // Reinitialize embed with new parameters
  if (window.curiaEmbed) {
    window.curiaEmbed.destroy();
    // Embed will reinitialize with new parameters
  }
}

// Usage
updateForumParameters({
  highlight: 'comment-456',
  author: 'vitalik.eth'
});
```

### Parameter Preprocessing
Transform parameters before they reach the forum:

```javascript
// Custom parameter mapping
const parameterMap = {
  'curia_user': 'ext_author',
  'curia_comment': 'ext_highlight',
  'curia_section': 'ext_category'
};

function preprocessParameters() {
  const url = new URL(window.location.href);
  
  for (const [oldKey, newKey] of Object.entries(parameterMap)) {
    const value = url.searchParams.get(oldKey);
    if (value) {
      url.searchParams.delete(oldKey);
      url.searchParams.set(newKey.replace('ext_', 'curia_'), value);
    }
  }
  
  window.history.replaceState({}, '', url.toString());
}
```

## Integration Examples

### With Analytics
```javascript
// Track parameter usage
function trackForumParameters() {
  const params = new URLSearchParams(window.location.search);
  const curiaParams = {};
  
  for (const [key, value] of params) {
    if (key.startsWith('curia_')) {
      curiaParams[key] = value;
    }
  }
  
  if (Object.keys(curiaParams).length > 0) {
    // Send to analytics
    gtag('event', 'curia_parameters_used', {
      parameters: curiaParams
    });
  }
}
```

### With URL Shorteners
```javascript
// Preserve parameters when using URL shorteners
function createShortUrl(baseUrl, params) {
  const url = new URL(baseUrl);
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(`curia_${key}`, value);
  }
  
  return url.toString();
}

// Usage
const shortUrl = createShortUrl('https://yoursite.com/blog', {
  highlight: 'comment-123',
  author: 'vitalik.eth'
});
```

## Support

### Getting Help
- Check the [troubleshooting section](#troubleshooting) above
- Enable debug mode to see parameter detection
- Check browser console for error messages

### Reporting Issues
When reporting issues, include:
- Your embed code
- The URL with parameters
- Browser console messages
- Expected vs actual behavior

## Migration Guide

### From v1.x to v2.x
No changes required - parameter support is backward compatible.

### Upgrading Existing Embeds
1. No embed code changes needed
2. Simply add `curia_*` parameters to your URLs
3. Parameters will automatically be detected and passed through

This feature is designed to be completely non-breaking and additive to your existing embed implementation. 