# Accessibility Standards

## Semantic HTML

- Use proper heading hierarchy (h1-h6)
- **CRITICAL: Only ONE H1 per page** (handled by templates, not markdown)
- Implement ARIA labels where needed
- Ensure keyboard navigation
- Provide alt text for images

### Heading Best Practices

- **H1**: Page title (displayed by hero template from frontmatter)
- **H2**: Main content sections (`## Section Title`)
- **H3**: Subsections (`### Subsection`)
- **H4-H6**: Nested content as needed
- **Never**: H1 titles in markdown content (creates duplicates)

## Color Contrast

- Meet WCAG AA standards (4.5:1)
- Don't rely on color alone
- Test with color blindness simulators
- Provide focus indicators

## Screen Reader Support

- Use proper landmark elements
- Implement skip links
- Provide descriptive link text
- Test with screen readers
