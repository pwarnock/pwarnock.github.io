---
title: 'Getting Started with Hugo and Daisy UI'
date: 2025-01-15T10:00:00Z
draft: false
tags: ['Hugo', 'Daisy UI', 'Web Development']
author: 'Peter Warnock'
---

# Getting Started with Hugo and Daisy UI

In this post, I'll share my experience setting up a new personal website using
Hugo static site generator combined with Daisy UI component library.

## Why Hugo?

Hugo is an excellent choice for personal blogs and portfolios because:

- **Lightning fast** build times
- **Zero JavaScript** required for basic functionality
- **Rich templating** system
- **Great documentation** and community support

## Adding Daisy UI

Daisy UI brings the power of Tailwind CSS with pre-built components:

```bash
npm install -D daisyui@latest
```

Then configure your `tailwind.config.js`:

```javascript
module.exports = {
  content: ['./layouts/**/*.{html,htm}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
};
```

## Sample Components

Here are some Daisy UI components I'm using:

### Alert Component

<div class="alert alert-info">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
  <span>This is an info alert component.</span>
</div>

### Card Component

<div class="card w-96 bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">Sample Card</h2>
    <p>Cards are great for displaying related information together.</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Learn More</button>
    </div>
  </div>
</div>

## Conclusion

Combining Hugo with Daisy UI gives you the best of both worlds - fast static
sites with modern, responsive components. I'm excited to continue building out
this site!

---

_Tags: Hugo, Daisy UI, Web Development_
