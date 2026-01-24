---
title: 'Lit 3D Piano Demo'
date: 2025-11-19
draft: false
description: 'A 3D Piano component built with Lit and CSS 3D transforms.'
---

<script type="module" src="/js/lit-3d-piano.js"></script>

## Live Demo

Interact with the piano below. Click the keys to play sound (Web Audio API).

<div style="padding: 40px; text-align: center; background: #f4f4f4; border-radius: 8px;">
  <lit-3d-piano></lit-3d-piano>
</div>

### Integration Code

```html
<script type="module" src="/js/lit-3d-piano.js"></script>
<lit-3d-piano></lit-3d-piano>
```

## Credits

Inspired by [lit-3d-piano](https://github.com/rodydavis/lit-3d-piano) by Rody
Davis. This implementation is a lightweight, dependency-free adaptation using
CSS 3D transforms instead of WebGL/Three.js.
