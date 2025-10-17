---
title: "Render Hook Tests"
date: 2025-10-13T00:00:00-07:00
draft: false
description: "Testing and demonstrating Hugo's render hooks for custom link and image rendering in Markdown content."
---

# Render Hook Test Page

This page tests the custom Hugo render hook for link handling. The render hook automatically processes external links and supports bracket-based overrides.

## Standard External Links (Auto New Tab)

These links should automatically open in new tabs with nofollow:

- [GitHub](https://github.com) - Should open in new tab with nofollow
- [Google](https://google.com) - Should open in new tab with nofollow  
- [Stack Overflow](https://stackoverflow.com) - Should open in new tab with nofollow

## Internal Links (No Special Treatment)

These links should remain unchanged (no target="_blank", no nofollow):

- [Home Page](/) - Should not open in new tab
- [Tools Directory](/tools/) - Should not open in new tab
- [Search Page](/search/) - Should not open in new tab

## Links with Bracket Overrides

### Prevent External Link from Opening in New Tab
[[nt]Example.com](https://example.com) - External link that should NOT open in new tab

### Force Internal Link to Open in New Tab
[[ot]About Page](/search/) - Internal link that SHOULD open in new tab

### Control Nofollow Behavior
[[nf]Partner Website](https://partner-site.com) - External link with forced nofollow
[[f]Trusted Docs](https://docs.mysite.com) - External link with nofollow prevented

### Combined Controls
[[nt][f]Special External Link](https://special-site.com) - External link that won't open in new tab and won't have nofollow

## Mixed Protocol Links

- [HTTP Link](https://httpforever.com) - HTTPS external link
- [Protocol Relative Link](https://example.com) - Use explicit HTTPS instead of protocol-relative

## Edge Cases

- [Link with Title](https://example.com "Example Title") - External link with title attribute
- [Link with Emphasis](https://example.com) - External link with markdown in text
- **Bold Link Text** - External link with markdown formatting

## Expected Behavior Summary

| Link Type | Expected Result |
|-----------|----------------|
| External https:// | target="_blank" rel="nofollow noopener noreferrer" |
| External http:// | target="_blank" rel="nofollow noopener noreferrer" |
| Internal /path | No special attributes |
| [nt]External | No target="_blank" |
| [ot]Internal | target="_blank" |
| [nf]Any | Forces nofollow |
| [f]External | No nofollow attribute |

## Testing Instructions

1. Build the site: `hugo server -D`
2. Open this page in browser
3. Right-click each link and inspect element
4. Verify attributes match expected behavior
5. Test actual link behavior (new tab vs same tab)