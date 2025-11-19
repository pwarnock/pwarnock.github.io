---
title: 'Shadow DOM Isolation Demo'
date: 2025-11-19
draft: false
description:
  'Demonstrates how Shadow DOM encapsulates styles and scripts in a simulated
  cross-domain environment.'
summary:
  'A live demo showing CSS and DOM isolation between a host page and a remote
  web component.'
---

<script type="module" src="/js/remote-component.js"></script>

## Overview

This demo illustrates **Shadow DOM encapsulation**, a key feature of Web
Components that allows them to operate safely on any page without style
conflicts.

### Live Demo

<div class="p-8 my-8 bg-base-200 rounded-xl border border-base-300">
  <!-- Host Page Context -->
  <div class="mb-8">
    <h2 class="text-primary border-b-2 border-primary pb-2 mb-4">Host Page Context</h2>
    <p class="mb-4">I am content on the host page. My styles are global.</p>
    <button class="btn btn-primary" onclick="alert('I am a local button on the host page')">Host Button</button>
  </div>

  <!-- Remote Component -->

<remote-component></remote-component>

</div>

### Key Observations

1.  **CSS Isolation**: The host page's blue H2 styles do not affect the
    component's orange H2. Conversely, the component's styles do not leak out.
2.  **DOM Isolation**: Scripts on the host page cannot easily query elements
    inside the component's Shadow DOM.
