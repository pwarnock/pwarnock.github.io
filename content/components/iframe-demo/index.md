---
title: 'Smart Iframe Integration'
date: 2025-11-19
draft: false
description:
  'Demonstrating secure, responsive embedding of external applications using Web
  Components.'
---

<script type="module" src="/js/smart-iframe.js"></script>

## Live Demo: Tech Radar

This example embeds the
[Build Your Own Radar](https://peterwarnock.com/build-your-own-radar/)
application, automatically loaded with this site's tool data. It also auto-hides
the "Powered by Thoughtworks" banner when viewed on the production domain.

<smart-iframe 
  src="https://peterwarnock.com/build-your-own-radar/?documentId=https://peterwarnock.com/tools/radar.json" 
  title="Peter Warnock Tech Radar" 
  breakout
  dev-crop="305"
  height="800px"> </smart-iframe>

## Why use a Custom Wrapper?

While standard `<iframe>` tags are functional, wrapping them in a Web Component
(`<smart-iframe>`) offers significant architectural advantages for a static
site.

### Pros (Strengths)

1.  **Improved User Experience (UX)**
    - **Loading States:** The component displays a native loading
      spinner/skeleton until the external content is fully ready, preventing the
      "white box" flash.
    - **Smooth Transitions:** Content fades in gently once loaded.

2.  **Enhanced Security Defaults**
    - **Sandboxing:** The component enforces `sandbox` attributes by default
      (`allow-scripts`, `allow-same-origin`), blocking external sites from
      hijacking the top-level window or triggering alerts/downloads
      automatically.

3.  **Performance**
    - **Lazy Loading:** Enforces `loading="lazy"` to ensure off-screen iframes
      do not consume bandwidth until the user scrolls to them.
    - **Resource Management:** Can easily be extended to "unload" the iframe
      (remove from DOM) when scrolled out of view to save memory.

4.  **Responsive Sizing**
    - Handles CSS aspect ratios and container queries better than raw HTML
      iframes, ensuring the embed fits mobile screens correctly.

### Cons (Trade-offs)

1.  **Memory Overhead**
    - Even with a wrapper, every iframe creates a new browser context (new
      document, new JS heap). Embedding multiple heavy apps (like Next.js or 3D
      scenes) on one page will increase memory usage significantly.

2.  **SEO Limitations**
    - Search engines generally do not index content inside an iframe as part of
      the parent page. The content is "seen" but attributed to the source URL,
      not your page.

3.  **Style Isolation (Double-Edged Sword)**
    - **Pro:** Your site's CSS cannot break the app.
    - **Con:** You cannot style the app to match your site (e.g., dark mode
      sync) without complex Cross-Document Messaging (`postMessage`).
