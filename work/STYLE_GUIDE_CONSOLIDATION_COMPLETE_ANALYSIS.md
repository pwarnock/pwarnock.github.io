# STYLE_GUIDE Consolidation - Complete Analysis

Date: November 17, 2025  
Status: Analysis Complete - Ready for Consolidation

## Files to Consolidate

### Main style-guide/ files (8 files, 1,199 lines):
1. **01-project-architecture.md** (48 lines) - Directory/template structure
2. **02-design-system.md** (272 lines) - Colors, typography, components, hero carousel
3. **03-content-guidelines.md** (411 lines) - Frontmatter, voice/tone, blog/portfolio, validation
4. **04-template-conventions.md** (81 lines) - Naming, organization, template logic
5. **05-css-guidelines.md** (242 lines) - CSS strategy, BEM, organization, processing
6. **06-development-workflow.md** (92 lines) - New content, templates, Bun, testing
7. **07-performance-guidelines.md** (22 lines) - Image, template, build optimization
8. **08-accessibility-standards.md** (31 lines) - Semantic HTML, contrast, a11y

### Related file (separate concern):
- **CSS_VARIABLES_DESIGN_SYSTEM.md** (243 lines) - Should be archived or merged

**Total: 1,442 lines (8 + CSS_VARIABLES file)**

---

## Duplicate Content Analysis

### 1. **Design System / CSS Variables Duplication**

**02-design-system.md** covers:
- Color hierarchy and DaisyUI theme variables
- Typography scale
- Component patterns
- Theme-aware color system with oklch() notation
- Hero carousel system (detailed)

**CSS_VARIABLES_DESIGN_SYSTEM.md** covers:
- DaisyUI's CSS variable system (duplicate)
- Component usage (buttons, icons, spacing) - overlaps with design-system
- File structure (future-looking, not currently implemented)
- Implementation notes and best practices
- Troubleshooting

**Conflict**: CSS_VARIABLES is higher-level guidance; 02-design-system is more detailed
- 02-design-system has CRITICAL production guidance on hero cards (forbids CSS variables)
- CSS_VARIABLES prescribes theming with CSS variables
- These seem to have conflicting approaches

**Decision**: Keep 02-design-system as authoritative (it has CRITICAL callouts about what NOT to do). Archive CSS_VARIABLES or merge selectively.

---

### 2. **Heading Structure - Appears in Multiple Places**

**03-content-guidelines.md** (lines 286-374):
- **CRITICAL: No H1 Titles in Markdown Content** (2 sections with emphasis)
- Heading structure guidelines
- Template H1 display
- Correct/incorrect structure examples

**08-accessibility-standards.md** (lines 5-17):
- **CRITICAL: Only ONE H1 per page** (1 section)
- Semantic HTML section with heading hierarchy
- Heading best practices
- Never: H1 titles in markdown

**Overlap**: Both emphasize the same critical rule but with different emphasis
- 03-content-guidelines is more detailed (multiple examples, why, validation)
- 08-accessibility-standards is brief (only mentions the rule)

**Decision**: Consolidate into one comprehensive section. 03-content-guidelines version is more detailed and should be primary source.

---

### 3. **CSS Organization & Linting**

**05-css-guidelines.md** (lines 3-15):
- Separation of concerns principle
- assets/css/main.css vs templates
- Why: prevents CSS bloat, enables tree-shaking

**05-css-guidelines.md** (lines 165-188):
- Linting strategy: source vs generated
- Ignoring generated CSS from linting
- Why: Tailwind generates patterns that violate standard linting

**CSS_VARIABLES_DESIGN_SYSTEM.md** (lines 85-103):
- File structure (components/, layout/, content/)
- NOT currently implemented (aspirational)

**Overlap**: Both describe CSS organization but at different levels
- 05-css-guidelines is practical and current
- CSS_VARIABLES describes future structure

**Decision**: Keep 05-css-guidelines as authoritative. Archive CSS_VARIABLES.

---

### 4. **DaisyUI Component Usage**

**02-design-system.md** (lines 50-75):
- DaisyUI theme variables section
- Theme-aware CSS with oklch()
- Hero card color implementation (PRODUCTION-APPROVED vs FORBIDDEN)

**CSS_VARIABLES_DESIGN_SYSTEM.md** (lines 46-83):
- DaisyUI component classes usage
- Buttons, icons, spacing examples
- More detailed examples but generic

**Overlap**: Both cover DaisyUI but different contexts
- 02-design-system is hero-card specific with critical guidance
- CSS_VARIABLES is general component usage

**Decision**: Keep both but consolidate: 02-design-system has production lessons, CSS_VARIABLES has examples. Merge into comprehensive DaisyUI section.

---

### 5. **Accessibility & a11y**

**08-accessibility-standards.md** (31 lines):
- Semantic HTML
- Heading hierarchy (also in 03-content-guidelines)
- Color contrast (WCAG AA)
- Screen reader support

**03-content-guidelines.md** (lines 286-374):
- Heading structure (detailed, with examples)
- NO H1 in markdown (critical rule)

**Overlap**: Heading hierarchy appears in both
- 08 is brief standards; 03 is detailed content-specific

**Decision**: 08 is about standards (keep); 03 is about implementation (detailed). Keep both but clarify that 03 supplements 08 with implementation details.

---

## Potential Conflicts to Resolve

### Conflict 1: CSS Variable Approach
- **02-design-system**: Says use DaisyUI semantic classes for hero cards (NOT CSS variables)
- **CSS_VARIABLES_DESIGN_SYSTEM**: Prescribes using CSS variables for theming

**Resolution**: Production site uses 02-design-system approach. This is correct and should be authoritative. CSS_VARIABLES represents aspirational future refactoring.

### Conflict 2: File Structure
- **CSS_VARIABLES**: Describes hypothetical structure (components/, layout/, content/)
- **05-css-guidelines**: Describes actual current structure

**Resolution**: 05-css-guidelines is actual. CSS_VARIABLES is aspirational. Archive CSS_VARIABLES or clearly mark as future.

### Conflict 3: Voice/Tone (Critical)
- **03-content-guidelines**: "CRITICAL: Use First-Person Voice (I/me)"
- Enforced with examples and validation

**Decision**: This is correct for personal portfolio. Keep as critical requirement.

---

## Content Distribution (What Goes Where)

### STYLE_GUIDE.md Should Contain:

1. **Project Architecture** (from 01)
   - Directory structure
   - Template hierarchy
   - URL structure

2. **Design System** (from 02, with CSS_VARIABLES merged)
   - Color hierarchy and typography
   - Component patterns
   - DaisyUI theme variables (PRODUCTION-APPROVED approach)
   - Hero carousel system
   - Color/alpha standards
   - Gradient text styles

3. **CSS Guidelines** (from 05)
   - CSS organization strategy (separation of concerns)
   - BEM naming convention
   - Vendor prefixes policy
   - Responsive design
   - Color usage
   - CSS build & processing
   - Linting strategy (source vs generated)
   - Design system architecture

4. **Template Conventions** (from 04)
   - Naming conventions
   - Partial organization
   - Template logic patterns
   - Code block rendering
   - Data-driven components

5. **Content Guidelines** (from 03)
   - Front matter structure
   - **CRITICAL: First-person voice**
   - Content organization
   - Page bundles
   - Blog post guidelines
   - Image guidelines
   - **CRITICAL: No H1 in markdown**
   - Portfolio frontmatter
   - Validation

6. **Development Workflow** (from 06)
   - Adding new content
   - Modifying templates
   - Adding components
   - Bun package management
   - Maintenance guidelines
   - Testing

7. **Performance Guidelines** (from 07)
   - Image optimization
   - Template efficiency
   - Build optimization

8. **Accessibility Standards** (from 08)
   - Semantic HTML
   - Heading hierarchy
   - Color contrast
   - Screen reader support

---

## Files to Archive

### Archive these files (consolidated into STYLE_GUIDE.md):
- ✅ `docs/development/style-guide/01-project-architecture.md`
- ✅ `docs/development/style-guide/02-design-system.md`
- ✅ `docs/development/style-guide/03-content-guidelines.md`
- ✅ `docs/development/style-guide/04-template-conventions.md`
- ✅ `docs/development/style-guide/05-css-guidelines.md`
- ✅ `docs/development/style-guide/06-development-workflow.md`
- ✅ `docs/development/style-guide/07-performance-guidelines.md`
- ✅ `docs/development/style-guide/08-accessibility-standards.md`
- ✅ `docs/development/CSS_VARIABLES_DESIGN_SYSTEM.md` (aspirational structure, superseded)

### Delete directory:
- `docs/development/style-guide/` (after archival)

---

## Consolidation Approach

**Method**: Full merge into single comprehensive STYLE_GUIDE.md maintaining all detail

**Structure**:
```
STYLE_GUIDE.md
├── Table of Contents (with quick links)
├── 1. Project Architecture
├── 2. Design System
├── 3. CSS Guidelines  
├── 4. Template Conventions
├── 5. Content Guidelines
├── 6. Development Workflow
├── 7. Performance Guidelines
├── 8. Accessibility Standards
└── See Also (references)
```

**Key Principles**:
- ✅ Preserve ALL critical callouts (CRITICAL: First-person, No H1, etc.)
- ✅ Keep detailed sections (hero carousel, blog validation, BEM, etc.)
- ✅ Merge duplicate sections (heading hierarchy, DaisyUI approach)
- ✅ Resolve conflicts with production-first approach
- ✅ Mark aspirational content clearly (future refactoring)
- ✅ Maintain cross-references between sections

---

## Consolidation Statistics

| Metric | Value |
|--------|-------|
| Source files | 9 (8 style-guide + CSS_VARIABLES) |
| Original lines | 1,442 lines |
| Expected consolidated | ~1,200-1,300 lines (~80% - minimal dedup) |
| Redundancy expected | 10-15% (mostly heading structure + DaisyUI approach) |
| Information loss | 0% (all critical content preserved) |

---

## Next Steps

1. ✅ Consolidation analysis complete
2. Create comprehensive STYLE_GUIDE.md (merge 8 files + CSS_VARIABLES)
3. Move style-guide/ directory to _archived/
4. Archive CSS_VARIABLES_DESIGN_SYSTEM.md
5. Update docs/README.md index
6. Commit consolidation
