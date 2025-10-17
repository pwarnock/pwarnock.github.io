# pwarnock.github.io

A Hugo-powered personal website with advanced link handling and theme customization.

## Features

### Advanced Link Handling
The site includes a custom Hugo render hook that automatically handles external links with:
- **Automatic external link detection**: Links starting with `http://` or `https://` automatically open in new tabs
- **SEO-friendly attributes**: External links get `rel="nofollow noopener noreferrer"` for security and SEO
- **Per-link control**: Use bracket codes to override default behavior:
  - `[nt]` - **No Tab**: Prevents external links from opening in new tab
  - `[ot]` - **Open Tab**: Forces any link to open in new tab  
  - `[nf]` - **No Follow**: Forces nofollow attribute
  - `[f]` - **Follow**: Prevents nofollow attribute (only uses noopener)

Example usage in Markdown:
```markdown
[[nt]Example.com](https://example.com)                    <!-- External, no new tab -->
[[ot]Tools Page](/tools/)                                   <!-- Internal, new tab -->
[[nf]Partner Site](https://partner.com)                    <!-- Forces nofollow -->
[[f]Trusted Docs](https://docs.mysite.com)                 <!-- No nofollow -->
[[nt][f]Special Link](https://special.com)            <!-- No tab, no nofollow -->
```

### Theme System
- Multiple DaisyUI themes (light, dark, retro, cyberpunk, halloween)
- Automatic theme switching based on season and system preferences
- Customizable color schemes and fonts

### Social Media Integration
- **Supported platforms**: LinkedIn, GitHub, X (Twitter), Discord, and more
- **Easy configuration**: Manage social links through data files
- **Responsive icons**: Uses Boxicons for consistent styling

### Content Management
- Blog posts with search functionality
- Tools directory with categorized listings
- Experience and project showcases
- Responsive design with TailwindCSS