# Refactoring Plan: single.html

## Identified Spacing Patterns (24 instances)

### Responsive Margin-Bottom (Pattern 2)
| Line | Current | Replacement | Type |
|------|---------|-------------|------|
| 12 | `mb-6` | `style="margin-bottom: var(--space-6)"` | Simple |
| 20 | `mb-12 lg:mb-16` | `.mb-responsive-lg` | Responsive |
| 26 | `mb-6` | `style="margin-bottom: var(--space-6)"` | Simple |
| 37 | `mb-6 lg:mb-8` | `.mb-responsive-md` | Responsive |
| 43 | `mb-8` | `style="margin-bottom: var(--space-8)"` | Simple |
| 71 | `mt-16 lg:mt-20` | `.mt-responsive-lg` | Responsive |
| 73 | `mb-8` | `style="margin-bottom: var(--space-8)"` | Simple |
| 85 | `mb-4` | `style="margin-bottom: var(--space-4)"` | Simple |
| 122 | `mb-4` | `style="margin-bottom: var(--space-4)"` | Simple |

### Responsive Padding (Pattern 3)
| Line | Current | Replacement | Type |
|------|---------|-------------|------|
| 24 | `p-8 lg:p-12` | `.p-responsive-md` | Responsive |
| 65 | `p-4` (in prose) | Keep as is | Special case |
| 81 | `p-8 lg:p-10` | `.p-responsive-sm` | Responsive |
| 121 | `p-8 lg:p-10` | `.p-responsive-sm` | Responsive |

### Pixel Padding (Pattern 3b)
| Line | Current | Replacement | Type |
|------|---------|-------------|------|
| 26 | `px-4 py-2` | `style="padding: var(--space-2) var(--space-4)"` | Simple |
| 65 | `p-4 rounded-lg` (prose) | `style="padding: var(--space-4)"` | Simple |
| 75 | `px-4` | `style="padding-left: var(--space-4); padding-right: var(--space-4)"` | Simple |

### Gap Utilities (Pattern 4)
| Line | Current | Replacement | Type |
|------|---------|-------------|------|
| 26 | `gap-2` | `style="gap: var(--space-2)"` | Simple |
| 43 | `gap-2` | `style="gap: var(--space-2)"` | Simple |
| 82 | `gap-8` | `style="gap: var(--space-8)"` | Simple |
| 86 | `gap-2` | `style="gap: var(--space-2)"` | Simple |
| 96 | `gap-3` | `style="gap: var(--space-3)"` | Simple |

---

## Required CSS Classes (for main.css)

```css
/* Responsive margin-bottom */
.mb-responsive-lg {
  margin-bottom: var(--space-12);
}

@media (min-width: 1024px) {
  .mb-responsive-lg {
    margin-bottom: var(--space-16);
  }
}

.mb-responsive-md {
  margin-bottom: var(--space-6);
}

@media (min-width: 1024px) {
  .mb-responsive-md {
    margin-bottom: var(--space-8);
  }
}

/* Responsive margin-top */
.mt-responsive-lg {
  margin-top: var(--space-16);
}

@media (min-width: 1024px) {
  .mt-responsive-lg {
    margin-top: var(--space-20);
  }
}

/* Responsive padding */
.p-responsive-md {
  padding: var(--space-8);
}

@media (min-width: 1024px) {
  .p-responsive-md {
    padding: var(--space-12);
  }
}

.p-responsive-sm {
  padding: var(--space-8);
}

@media (min-width: 1024px) {
  .p-responsive-sm {
    padding: var(--space-10);
  }
}
```

---

## Implementation Steps

1. **Add CSS classes to main.css** — Define .mb-responsive-*, .mt-responsive-*, .p-responsive-* classes
2. **Replace responsive classes** — Use new CSS classes for responsive spacing
3. **Convert simple spacing to inline styles** — Use style attribute for non-responsive utilities
4. **Test responsiveness** — Verify all breakpoints work correctly
5. **Visual validation** — Check page at mobile, tablet, desktop sizes

---

## Special Cases

### Line 65 (Prose blockquote)
Current: `prose-blockquote:p-4`
Status: Keep as is (Tailwind prose modifier, not direct spacing class)

### Line 65 (Prose code)
Current: `prose-code:px-1`
Status: Keep as is (Tailwind prose modifier)

---

## Expected Outcome

- ✅ All 24 hardcoded spacing utilities replaced
- ✅ Visual appearance identical to before
- ✅ Responsive behavior preserved
- ✅ CSS cleaner with token-based approach
- ✅ Template cleaner without hardcoded Tailwind utilities
