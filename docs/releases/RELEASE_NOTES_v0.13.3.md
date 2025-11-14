# Release Notes v0.13.3

## 🐛 Bug Fixes

### CSS Architecture & Build System

- **Fixed CSS import error** that was causing TUI to freeze during development
- **Updated Tailwind CSS integration** from v3 to v4 plugin system
- **Fixed DaisyUI v5 compatibility** with proper `@plugin` directive usage
- **Resolved Hugo build path resolution** for modular CSS imports

### Technical Changes

- **Modularized CSS architecture** into organized directory structure:
  - `framework/` - Core imports and base styles
  - `design-system/` - Tokens and utilities
  - `components/` - Button, badge, card, icon, focus styles
  - `layout/` - Hero, responsive, embed styles
  - `content/` - Prose, code, table styles
- **Updated import paths** to work with Hugo's root-relative CSS processing
- **Streamlined build process** - removed separate CSS build step, rely on Hugo
- **Verified DaisyUI classes** are properly included in final CSS output

## 🔧 Development Experience

- **Fixed development server startup** - no more CSS import errors
- **Maintained backward compatibility** - all existing DaisyUI classes work
- **Improved build reliability** - consistent CSS processing across environments

## 📦 Dependencies

- **Tailwind CSS v4.1.16** - Latest version with new plugin system
- **DaisyUI v5.3.10** - Full compatibility with Tailwind v4
- **@tailwindcss/typography v0.5.19** - Content styling maintained

---

## 🚀 Installation & Usage

No changes required - this is a bug fix release that maintains full backward
compatibility.

```bash
# Development server works as expected
bun run dev:legacy

# Production builds complete successfully
bun run build:production
```

---

**Release Type**: Patch  
**Compatibility**: Fully backward compatible  
**Breaking Changes**: None
