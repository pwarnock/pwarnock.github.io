# Template Conventions

## Naming Conventions

- **Files**: kebab-case (e.g., `content-card.html`)
- **Classes**: BEM-style (e.g., `content-card__title`)
- **IDs**: kebab-case for unique elements
- **Variables**: camelCase in Go templates

## Partial Organization

- `partials/components/` - Reusable UI components
- `partials/sections/` - Page section layouts
- `partials/` - Site-wide elements (header, footer)

## Template Logic

- Use `with` blocks for safe variable access
- Conditional rendering with `if` statements
- Loop through collections with `range`
- Pass context explicitly to partials

### Data-Driven Reusable Components

For components that render different content types (blog, portfolio, tools, etc.):

1. **Design for flexibility**: Accept a `section` parameter to control behavior
2. **Use conditional logic**: Branch on the section type to handle different data structures
3. **Configure via parameters**: Pass colors, headings, CTA text, and URLs as dict parameters
4. **Example pattern**:
   ```go-template
   {{ $section := .section }}
   {{ $color := .color | default "accent" }}
   
   {{ if eq $section "blog" }}
     <!-- Blog-specific rendering -->
   {{ else if eq $section "portfolio" }}
     <!-- Portfolio-specific rendering -->
   {{ end }}
   ```
5. **Benefits**: Eliminates duplication, maintains consistent styling, simplifies maintenance
6. **Reference**: See `hero-featured-item.html` for complete implementation handling blog/portfolio/tools sections with different metadata and layouts

## Code Block Rendering

### Custom Code Block Handler (render-codeblock.html)

Code blocks are rendered through Hugo's custom markup override system with
daisyUI styling:

```markdown
# In your content, use standard fenced code blocks with language indicator

\`\`\`bash bd ready --json bd create "Task" -t task \`\`\`
```

### Rendering

- Automatically wrapped in semantic `<figure>` elements
- Language label displayed in figcaption header
- Styled with daisyUI base colors and tokens
- Syntax highlighting via Hugo's goldmark (github style)
- Line numbers enabled by default

### CSS Classes Applied (assets/css/main.css)

```css
.code-block           /* Figure wrapper with bg-base-200 */
.code-block figcaption /* Language label with bg-base-300 */
.code-block pre       /* Code area with bg-base-100 */
.code-block code      /* Code text with theme colors */
```

### Implementation

- Override file: `layouts/_default/_markup/render-codeblock.html`
- Styles: `assets/css/main.css` (lines 616-635)
- Applied to all content types (blog, portfolio, tools)
- DRY and consistent across entire site
