# Reusable Component Partials

This directory contains reusable Hugo partial components to reduce duplication and maintain consistency across the site.

## Components Overview

### Core Components

#### `card.html`
A flexible card component for displaying content with optional links, badges, and footers.

**Parameters:**
- `class` - Additional CSS classes
- `title` - Card title text
- `title_id` - ID for title (for accessibility)
- `content` - Card content HTML
- `footer` - Card footer content HTML
- `href` - Link URL (makes entire card clickable)
- `badge` - Badge text
- `badge_class` - Badge CSS classes (default: "badge-outline")
- `role` - ARIA role (default: "article")
- `aria_labelledby` - ARIA labelledby attribute

**Example:**
```hugo
{{ partial "components/card.html" (dict 
  "title" "My Card Title"
  "content" "Card content goes here"
  "href" "/my-page"
  "badge" "Featured"
)}}
```

#### `section-header.html`
Standardized section header with title, subtitle, and divider.

**Parameters:**
- `title` - Section title
- `subtitle` - Section subtitle/description
- `title_id` - ID for title (for accessibility)
- `divider_class` - Divider CSS classes (default: "divider-primary")
- `container_class` - Additional container classes

**Example:**
```hugo
{{ partial "components/section-header.html" (dict 
  "title" "Featured Projects"
  "subtitle" "Recent work and personal projects"
  "divider_class" "divider-secondary"
)}}
```

#### `button.html`
Reusable button component with optional icons.

**Parameters:**
- `href` - Button URL/link
- `text` - Button text
- `class` - Additional CSS classes
- `icon` - SVG icon content (optional)
- `icon_position` - "left" or "right" (default: "right")
- `aria_label` - ARIA label for accessibility
- `target` - Link target (default: "_self")

**Example:**
```hugo
{{ partial "components/button.html" (dict 
  "href" "/about"
  "text" "Learn More"
  "class" "btn-primary"
  "icon" `<svg>...</svg>`
)}}
```

#### `badge-list.html`
Displays a list of badges/tags.

**Parameters:**
- `items` - Array of badge items
- `class` - Additional CSS classes for container
- `badge_class` - Badge CSS classes (default: "badge-outline")
- `badge_size` - Badge size (default: "badge-xs sm:badge-sm")

**Example:**
```hugo
{{ partial "components/badge-list.html" (dict 
  "items" (slice "React" "Vue" "Angular")
  "badge_class" "badge-primary"
)}}
```

### Specialized Components

#### `hero-card.html`
Specialized card for hero section with gradient borders and backdrop blur.

**Parameters:**
- `title` - Card title
- `title_id` - ID for title (for accessibility)
- `content` - Card content
- `badge` - Badge text
- `color_class` - Color class (primary, secondary, accent)
- `class` - Additional CSS classes

#### `expertise-card.html`
Card for expertise sections with icons and technology badges.

**Parameters:**
- `title` - Card title
- `title_id` - ID for title (for accessibility)
- `content` - Card content
- `icon` - SVG icon content
- `icon_bg_class` - Icon background class (default: "bg-primary/10")
- `icon_text_class` - Icon text class (default: "text-primary")
- `technologies` - Array of technology badges
- `class` - Additional CSS classes

#### `content-card.html`
High-level component for blog posts and portfolio items.

**Parameters:**
- `page` - Hugo page object
- `type` - "post" or "portfolio" (affects styling)
- `show_date` - Whether to show date (default: true for posts)
- `show_reading_time` - Whether to show reading time (default: true for posts)
- `show_technologies` - Whether to show technologies (default: true for portfolio)
- `summary_override` - Override for summary text

#### `content-card-footer.html`
Footer component for content cards with metadata and action buttons.

**Parameters:**
- `page` - Hugo page object
- `type` - "post" or "portfolio"
- `show_date` - Whether to show date
- `show_reading_time` - Whether to show reading time
- `show_technologies` - Whether to show technologies
- `color_class` - Color class for button (primary/secondary)

## Usage Guidelines

1. **Consistency**: Use these components instead of writing custom HTML for common patterns
2. **Accessibility**: Always provide `title_id` for cards when possible for screen readers
3. **Flexibility**: Components accept optional parameters - only provide what you need
4. **Documentation**: Each component includes inline parameter documentation
5. **Testing**: Test components across different screen sizes and devices

## Benefits

- **Reduced Duplication**: Common patterns are defined once and reused
- **Consistency**: Ensures uniform styling and behavior across the site
- **Maintainability**: Changes to components propagate to all usages
- **Accessibility**: Built-in ARIA attributes and semantic HTML
- **Flexibility**: Parameterized design allows for customization

## Migration Notes

The following sections have been migrated to use reusable components:
- Hero section cards → `hero-card.html`
- Expertise cards → `expertise-card.html`
- Portfolio items → `content-card.html`
- Blog posts → `content-card.html`
- Section headers → `section-header.html`
- Action buttons → `button.html`