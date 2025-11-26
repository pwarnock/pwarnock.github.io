# STYLE_GUIDE Consolidation Analysis

## Files to Consolidate

### From style-guide/ directory (8 files):

1. **01-project-architecture.md** (48 lines)
   - Directory structure (content/, layouts/)
   - Template hierarchy
   - URL structure

2. **02-design-system.md** (272 lines)
   - Color hierarchy and typography scale
   - Component patterns (cards, sections, single pages)
   - Theme-aware color system (DaisyUI variables)
   - Color/alpha standards (rgba vs oklch)
   - Gradient text styles
   - Hero card color implementation
   - Hero carousel system (detailed)

3. **03-content-guidelines.md** (411 lines) - VERY LARGE
   - Front matter structure
   - Custom HTML pages
   - Voice and tone (CRITICAL: first-person)
   - Content organization (blog, portfolio, tools, static)
   - Page bundles (recommended for blog posts)
   - Blog post creation guidelines (required fields, validation)
   - Image guidelines (storage, frontmatter, usage patterns)
   - Heading structure (NO H1 in content, CRITICAL)
   - Portfolio frontmatter structure
   - Validation checks and common errors

4. **04-template-conventions.md** (81 lines)
   - [TO READ]

5. **05-css-guidelines.md** (242 lines)
   - [TO READ]

6. **06-development-workflow.md** (92 lines)
   - [TO READ]

7. **07-performance-guidelines.md** (22 lines)
   - [TO READ]

8. **08-accessibility-standards.md** (31 lines)
   - [TO READ]

### Related files (to check for duplication):

- **CSS_VARIABLES_DESIGN_SYSTEM.md** (243 lines)
  - Likely duplicates 02-design-system.md content

## Consolidation Strategy

1. **Read all 8 files** to understand structure and content
2. **Read CSS_VARIABLES_DESIGN_SYSTEM.md** to check for duplication
3. **Map duplicates and conflicts** (like deployment consolidation)
4. **Create master STYLE_GUIDE.md** with all content organized
5. **Archive source files** to docs/\_archived/development/style-guide/
6. **Update docs/README.md** index

## Preliminary Observations

**Size**: 8 files = 1,199 lines (likely 30-40% redundancy)

**Structure**: Files are already numbered 01-08, suggesting they're meant to be
a sequence that could be merged into one master doc.

**Key sections identified so far**:

- Architecture/structure
- Design system (colors, typography, components)
- Content guidelines (critical voice/tone rules, validation)
- Template conventions
- CSS guidelines
- Development workflow
- Performance
- Accessibility standards

**Potential redundancy**:

- CSS_VARIABLES likely duplicates design-system color content
- Multiple mentions of DaisyUI theme variables across files
- Component patterns might appear in multiple files

**Next**: Read remaining 5 files and CSS_VARIABLES to complete the analysis.
