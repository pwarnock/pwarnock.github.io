---
title: "Bracket Code Reference"
date: 2024-01-15
draft: false
description: "Quick reference for render hook bracket codes"
---

# Render Hook Bracket Codes

Quick reference for controlling link behavior with bracket codes:

## Bracket Codes

Place these codes at the beginning of your link text:

- `[nt]` - **No Tab**: Prevents external links from opening in new tab
- `[ot]` - **Open Tab**: Forces any link to open in new tab  
- `[nf]` - **No Follow**: Forces nofollow attribute
- `[f]` - **Follow**: Prevents nofollow attribute (only uses noopener)

## Examples

```markdown
[[nt]Example.com](https://example.com)                    <!-- External, no new tab -->
[[ot]Tools Page](/tools/)                                   <!-- Internal, new tab -->
[[nf]Partner Site](https://partner.com)                    <!-- Forces nofollow -->
[[f]Trusted Docs](https://docs.mysite.com)                 <!-- No nofollow -->
[[nt][f]Special Link](https://special.com)            <!-- No tab, no nofollow -->
```

## Default Behavior

Without bracket codes:
- External links (http:// or https://) automatically get `target="_blank"` and `rel="nofollow noopener noreferrer"`
- Internal links (/path) remain unchanged