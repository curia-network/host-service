Perfect! Here's the refined ideal spec:

## Refined Community Switcher Spec

**Core Function:**
```typescript
communitySwitcher(targetCommunityId: string, options?: {
  boardId?: number,
  postId?: number, 
  commentId?: number,
  // future: userId?, searchQuery?, etc.
})
```

**Magic It Should Handle Internally:**

**Permission Validation:**
- Check target community's `identity_type` gating against current user's identity
- Validate role-based board visibility if `boardId` provided
- Return clear error states for permission failures

**URL Construction & Navigation:**
- Build complete URL path for target community + optional deep links
- Execute iframe URL change (triggering parent app context switch)
- Handle page reload gracefully as part of community context change

**Error Handling:**
- **Identity gating failures**: Clear messaging when user lacks required identity type
- **Role visibility failures**: Appropriate fallbacks for restricted boards  
- **Missing content**: Graceful handling of non-existent boards/posts
- **Partnership validation**: Ensure communities are actually partnered

**Developer Experience:**
- Single function call with zero configuration
- Automatic error states with user-friendly messages
- Built-in loading states during navigation
- Future-proof parameter expansion

**Parent App Integration:**
- Designed to work with potential tabbed browsing system
- Clean iframe URL changes that parent can track
- Context preservation hooks for future multi-tab functionality

**Key Benefit:** You call `communitySwitcher("target-community")` and it handles all identity checking, URL building, and iframe navigation automatically.