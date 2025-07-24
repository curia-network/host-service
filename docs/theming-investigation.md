# Theming Investigation - Embed System Deep Dive

**Date**: December 2024  
**Status**: Investigation in Progress  
**Goal**: Identify and document all theming inconsistencies in the embed system

## 🎯 **Problem Statement**

The embed theming system has multiple inconsistencies and chaos:

1. **No independent theming system** - Embed relies on external `data-theme` attributes
2. **Mixed theming approaches** - `.dark` class vs `data-theme="dark"` attribute confusion  
3. **Component-specific issues**:
   - Community sidebar shows light mode when `data-theme="dark"`
   - Top status bar has independent theming behavior
   - Profile menu required both `.dark` class AND `data-theme` to work
4. **Storage conflicts** - No embed-specific localStorage, conflicts with landing page
5. **Missing functionality** - Need dark/light switcher in user profile menu

## 🔍 **Investigation Findings**

### **Current Theming Architecture**

#### **Data Sources Found:**
- [x] `data-theme="light/dark/auto"` attribute (external) - Used in script tag, read by parseEmbedConfig()
- [x] CSS classes (`.dark`, `.light`) - Applied by ThemeContext and EmbedThemeProvider  
- [x] System preferences detection - `window.matchMedia('(prefers-color-scheme: dark)')`
- [x] localStorage keys:
  - `'curia-theme'` - Main app theme (used by ThemeContext)
  - `'curia-resolved-theme'` - Cached resolved theme
  - `'curia-embed-theme'` - **PLANNED but not implemented** (from research doc)

#### **Component Theming Status:**

| Component | Theming Method | Issues Found | Status |
|-----------|---------------|--------------|---------|
| **Embed Bundle** | CSS injectStyles() | Uses bundled CSS with `.dark` selectors | ✅ Working |
| **Embed Pages** | EmbedThemeProvider | Uses `.dark` class on documentElement | ✅ Working |
| **Main App** | ThemeContext | Uses `.dark` class OR `data-theme` attribute | ✅ Working |
| **Community Sidebar** | Bundled CSS | Uses both `[data-theme="dark"]` AND `.dark` selectors | 🚨 **Issue Found** |
| **Profile Menu** | Manual setAttribute | Requires both `[data-theme="dark"]` AND `.dark` | 🚨 **Issue Found** |
| **Status Bar** | Next.js page context | Uses EmbedThemeProvider (independent of bundle) | ✅ Actually working |

### **Code Patterns Found**

#### **CSS Selectors:**
```css
/* Pattern 1: Data attribute only - Used in some components */
[data-theme="dark"] .user-profile-menu { }

/* Pattern 2: Class only - Used by EmbedThemeProvider/ThemeContext */  
.dark .curia-community-nav { }

/* Pattern 3: Combined (what SHOULD work everywhere) */
.dark .component, [data-theme="dark"] .component { }
```

#### **JavaScript Theme Detection:**
```javascript
// Embed bundle approach (UserProfile.ts)
const scripts = document.querySelectorAll('script[data-theme]');
const theme = scripts[i].getAttribute('data-theme');

// Next.js page approach (EmbedThemeProvider)
document.documentElement.classList.add(resolvedTheme); // 'dark' or 'light'

// Main app approach (ThemeContext)  
document.documentElement.classList.add(resolved); // 'dark' or 'light'
// OR (conditionally)
document.documentElement.setAttribute('data-theme', resolved);
```

#### **localStorage Usage:**
```javascript
// Main app theme storage
localStorage.setItem('curia-theme', theme);
localStorage.setItem('curia-resolved-theme', resolved);

// Embed theme storage (PLANNED but not implemented)
localStorage.setItem('curia-embed-theme', theme); // From research doc
```

---

## 📋 **Investigation Log**

### **Round 1: Initial Codebase Search**
- **Date**: December 2024
- **Method**: Semantic search for theming patterns
- **Findings**: 
  - Found existing comprehensive research in `docs/embed-theme-switcher-research.md`
  - Current architecture has Main App theme vs Embed theme separation
  - EmbedThemeProvider only applies URL theme, no localStorage persistence
  - Profile menu requires both `.dark` class AND `[data-theme="dark"]` selector

### **Round 2: Direct Pattern Matching**  
- **Date**: December 2024
- **Method**: Grep for specific CSS/JS patterns
- **Findings**:
  - **localStorage theme keys found:**
    - `localStorage.getItem('curia-theme')` in ThemeContext.tsx (main app)
    - No embed-specific localStorage implementation found yet
  - **`data-theme` usage:**
    - Profile menu: `menu.setAttribute('data-theme', 'dark')` in UserProfile.ts
    - Script parsing: `script.getAttribute('data-theme')` in EmbedConfig.ts
    - ThemeContext: `document.documentElement.setAttribute('data-theme', resolved)` (conditional)
  - **`.dark` class usage:**
    - CSS files extensively use both `.dark` and `[data-theme="dark"]` selectors

### **Round 3: Component-Specific Analysis**
- **Date**: December 2024  
- **Method**: Focused investigation of broken components
- **Findings**:
  - **Community Sidebar issue found!** - CSS uses both selectors but bundle may not set correct classes
  - **Profile Menu issue confirmed** - Requires both `data-theme` attribute AND `.dark` class
  - **Status Bar not broken** - Actually uses EmbedThemeProvider correctly
  - **Core issue**: Embed bundle vs Next.js app theming mismatch
  - **Bundle context** - Injects CSS but doesn't set document classes like Next.js pages do

---

## 🎨 **ROOT CAUSE ANALYSIS**

### **🔥 THE CORE ISSUE - CONTEXT MISMATCH**

The theming chaos stems from a **fundamental architectural discrepancy**:

#### **Embed Bundle Context** (embed.js):
- ✅ Injects CSS with both `.dark` and `[data-theme="dark"]` selectors
- ❌ **NEVER sets `document.documentElement` classes or attributes**
- ❌ Components detect theme from `script[data-theme]` attributes manually
- ❌ Profile menu sets `data-theme` on **itself**, not document

#### **Next.js Page Context** (/embed route):
- ✅ `EmbedThemeProvider` sets `document.documentElement.classList.add('dark')`
- ✅ Status bar works perfectly because it's in Next.js context
- ✅ CSS selectors work because document has `.dark` class

### **🚨 THE DISCREPANCY**

```javascript
// ❌ EMBED BUNDLE (broken)
// CSS: .dark .curia-community-nav { }
// Reality: document.documentElement has NO .dark class
// Result: Sidebar shows light mode even with data-theme="dark"

// ✅ NEXT.JS PAGES (working) 
// CSS: .dark .curia-community-nav { }
// Reality: document.documentElement.classList.add('dark')
// Result: Everything works perfectly
```

## 🎨 **Proposed Solution Architecture**

### **1. Unified Theme System**
- [x] **CRITICAL**: Make embed bundle set `document.documentElement` classes like Next.js pages
- [ ] Independent localStorage key for embed (`curia-embed-theme`)
- [ ] Proper fallback chain: localStorage → data-attribute → system → default

### **2. Consistent CSS Architecture**  
- [x] **Already correct**: CSS uses both `.dark` and `[data-theme="dark"]` selectors
- [ ] **FIX**: Ensure embed bundle applies theme to `document.documentElement`
- [ ] Remove manual `data-theme` workarounds in UserProfile.ts

### **3. Theme Switcher Integration**
- [ ] Add toggle to user profile menu
- [ ] Persist theme choice in embed localStorage  
- [ ] Update all components dynamically
- [ ] **CRITICAL**: Update `document.documentElement` classes when theme changes

---

## 🚨 **Critical Issues to Fix**

### **PRIMARY ISSUE (Fixes 1, 2, 4):**
1. **📍 Embed Bundle Document Context** - Bundle doesn't set `document.documentElement` classes
   - **Impact**: Sidebar, profile menu, all components broken in bundle context
   - **Fix**: Add `document.documentElement.classList.add(resolvedTheme)` to embed bundle

### **SECONDARY ISSUES:**
2. **Profile Menu Workaround** - Remove manual `data-theme` setAttribute once document classes work
3. **~~Status Bar Independence~~** - ✅ **ACTUALLY WORKING** (in Next.js context)
4. **Storage System** - Implement independent `curia-embed-theme` localStorage 
5. **Missing Toggle** - Add theme switcher to user profile menu

---

## 📊 **Investigation Status**

- [x] **Codebase Search Complete**
- [x] **Pattern Documentation Complete** 
- [x] **Component Analysis Complete**
- [x] **Solution Design Complete**
- [x] **Root Cause Identified**
- [ ] **Ready for Implementation**

## 📋 **IMPLEMENTATION ROADMAP**

### **Phase 1: Fix Core Context Mismatch (HIGH PRIORITY)**
1. **Add Document Theme Classes to Embed Bundle**
   - Modify `InternalPluginHost` to set `document.documentElement.classList.add(resolvedTheme)`
   - Ensure theme resolution happens early in initialization
   - Test community sidebar and profile menu fix

### **Phase 2: Clean Up Workarounds (MEDIUM PRIORITY)**  
2. **Remove Manual data-theme Attributes**
   - Remove `menu.setAttribute('data-theme', 'dark')` from UserProfile.ts
   - Rely on document-level classes instead

### **Phase 3: Add User Theme Preferences (LOW PRIORITY)**
3. **Implement Independent Theme System**
   - Add `curia-embed-theme` localStorage
   - Add theme toggle to profile menu
   - Handle theme switching with iframe reloads

**🎯 EXPECTED RESULT**: All theming issues will be resolved once embed bundle sets document classes like Next.js pages do. 