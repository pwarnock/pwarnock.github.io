# Portfolio Card Navigation - Alternative Solutions

## Current Implementation (Dynamic Grid)
- **File**: `layouts/partials/sections/portfolio.html` & `layouts/portfolio/list.html`
- **Approach**: Dynamic CSS Grid with calculated button count
- **Benefits**: Equal width distribution, no wrapping, adapts to 1-3 buttons
- **Code**:
```html
{{ $buttonCount := 3 }}
{{ if not .Params.live_url }}{{ $buttonCount = sub $buttonCount 1 }}{{ end }}
{{ if not .Params.github_url }}{{ $buttonCount = sub $buttonCount 1 }}{{ end }}
<div class="grid gap-2 pt-4" style="grid-template-columns: repeat({{ $buttonCount }}, 1fr);">
  <!-- Buttons with btn-sm w-full classes -->
</div>
```

## Previous Working Iteration (Flex with Override)
- **Approach**: DaisyUI card-actions with CSS override
- **Benefits**: Maintains DaisyUI semantics, simpler structure
- **Key Components**:
  1. **CSS Override** (in `assets/css/main.css`):
  ```css
  .card-actions-no-wrap {
    flex-wrap: nowrap !important;
    gap: 0.5rem;
  }
  ```
  2. **HTML Structure**:
  ```html
  <div class="card-actions justify-end pt-4 card-actions-no-wrap">
    <a class="btn btn-primary btn-square btn-xs">Live</a>
    <a class="btn btn-outline btn-square btn-xs">Code</a>
    <a class="btn btn-ghost btn-square btn-xs">Details</a>
  </div>
  ```

## Alternative Solutions Considered

### 1. Standard Flex Container
```html
<div class="flex justify-end gap-1 pt-4">
  <!-- btn-square btn-xs buttons -->
</div>
```
- **Pros**: Simple, no custom CSS needed
- **Cons**: May still wrap depending on content width

### 2. DaisyUI Join Component
```html
<div class="join">
  <a class="btn btn-primary btn-xs join-item">Live</a>
  <a class="btn btn-outline btn-xs join-item">Code</a>
</div>
```
- **Pros**: DaisyUI native component
- **Cons**: Can cause layout constraints, joining may not be desired

### 3. Custom Grid with Fixed Columns
```html
<div class="grid grid-cols-3 gap-1 pt-4">
  <!-- Buttons with conditional rendering -->
</div>
```
- **Pros**: Predictable layout
- **Cons**: Empty grid cells when buttons missing

## Decision Factors

### Choose Dynamic Grid when:
- Want equal width distribution regardless of button count
- Need consistent spacing across all cards
- Prefer modern CSS Grid approach

### Choose Flex Override when:
- Want to maintain DaisyUI card-actions semantics
- Prefer simpler button structure
- Don't need equal width distribution

### Choose Standard Flex when:
- Want simplest solution
- Cards have consistent button counts
- Minimal custom CSS preferred

## Implementation Notes

- **Button Sizes**: `btn-xs` for compact, `btn-sm` for better visibility
- **Icon Sizes**: `w-3 h-3` for btn-xs, `w-4 h-4` for btn-sm
- **Spacing**: `gap-1` (0.25rem) for tight, `gap-2` (0.5rem) for comfortable
- **Padding**: `pt-4` provides separation from content above

## Theme Compatibility

All solutions work with DaisyUI themes:
- **Dynamic Grid**: Fully compatible
- **Flex Override**: Maintains DaisyUI styling
- **Standard Flex**: Uses DaisyUI button classes only

## Accessibility

All approaches maintain:
- Proper `aria-label` attributes
- Semantic button/link elements
- Keyboard navigation support
- Screen reader compatibility