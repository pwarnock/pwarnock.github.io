---
title: 'DaisyUI - Component Library for Tailwind CSS'
date: 2025-11-15T21:25:00-08:00
description: 'DaisyUI is a component library that adds beautiful, accessible UI components
  to Tailwind CSS, enabling rapid development of modern web interfaces with
  semantic class names.'
summary: 'DaisyUI is a component library that adds beautiful, accessible UI components
  to Tailwind CSS, enabling rapid development of modern web interfaces with
  semantic class names.'
tags: ['css', 'ui-components', 'tailwind-css', 'frontend', 'design-system', 'accessibility']
image: '/images/tools/daisyui-component-library-for-tailwind-css.png'
draft: false
---

DaisyUI is a component library that brings beautiful, accessible UI components
to Tailwind CSS. It provides semantic class names for common UI patterns,
enabling rapid development of modern web interfaces while maintaining the
utility-first approach of Tailwind CSS.


## 🎯 **Core Philosophy**

### **Semantic Classes**

- **Component-based** class names instead of utilities
- **Consistent naming** conventions
- **Intuitive API** for rapid development
- **Maintainable** and readable code

### **Tailwind Integration**

- **Pure Tailwind CSS** under the hood
- **No JavaScript** dependencies
- **Customizable** through Tailwind configuration
- **Theme-aware** components

### **Accessibility First**

- **WCAG compliant** components
- **Keyboard navigation** support
- **Screen reader** compatible
- **Focus management** built-in

## 🚀 **Component Categories**

### **Layout Components**

```html
<!-- Container -->
<div class="container mx-auto">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- Content -->
  </div>
</div>

<!-- Card -->
<div class="card w-96 bg-base-100 shadow-xl">
  <figure><div class="h-32 bg-base-200"></div></figure>
  <div class="card-body">
    <h2 class="card-title">Card Title</h2>
    <p>Card content goes here.</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Buy Now</button>
    </div>
  </div>
</div>
```

### **Form Components**

```html
<!-- Input -->
<div class="form-control w-full max-w-xs">
  <label class="label">
    <span class="label-text">Email</span>
  </label>
  <input type="email" placeholder="Enter email" class="input input-bordered" />
  <label class="label">
    <span class="label-text-alt">Bottom label</span>
  </label>
</div>

<!-- Select -->
<select class="select select-bordered w-full max-w-xs">
  <option disabled selected>Choose option</option>
  <option>Option 1</option>
  <option>Option 2</option>
</select>

<!-- Checkbox -->
<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text">Remember me</span>
    <input type="checkbox" class="checkbox" />
  </label>
</div>
```

### **Button Components**

```html
<!-- Basic buttons -->
<button class="btn">Default</button>
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-accent">Accent</button>

<!-- Button sizes -->
<button class="btn btn-lg">Large</button>
<button class="btn btn-sm">Small</button>
<button class="btn btn-xs">Extra Small</button>

<!-- Button states -->
<button class="btn btn-primary loading">Loading</button>
<button class="btn" disabled>Disabled</button>
```

### **Navigation Components**

```html
<!-- Navbar -->
<div class="navbar bg-base-100">
  <div class="navbar-start">
    <div class="dropdown">
      <label tabindex="0" class="btn btn-ghost lg:hidden">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h8m-8 6h16"
          />
        </svg>
      </label>
      <ul
        tabindex="0"
        class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
      >
        <li><a>Item 1</a></li>
        <li><a>Item 2</a></li>
      </ul>
    </div>
    <a class="btn btn-ghost normal-case text-xl">DaisyUI</a>
  </div>
  <div class="navbar-center hidden lg:flex">
    <ul class="menu menu-horizontal px-1">
      <li><a>Item 1</a></li>
      <li><a>Item 2</a></li>
    </ul>
  </div>
</div>
```

## 🛠️ **Advanced Features**

### **Modal Components**

```html
<!-- Modal trigger -->
<label for="my-modal" class="btn">Open Modal</label>

<!-- Modal -->
<input type="checkbox" id="my-modal" class="modal-toggle" />
<div class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Hello!</h3>
    <p class="py-4">This is a modal dialog.</p>
    <div class="modal-action">
      <label for="my-modal" class="btn">Close</label>
    </div>
  </div>
</div>
```

### **Data Display**

```html
<!-- Table -->
<div class="overflow-x-auto">
  <table class="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Job</th>
        <th>Favorite Color</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Cy Ganderton</td>
        <td>Quality Control Specialist</td>
        <td>Blue</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Stats -->
<div class="stats shadow">
  <div class="stat">
    <div class="stat-figure text-primary">
      <svg class="inline-block w-8 h-8 stroke-current" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    </div>
    <div class="stat-title">Total Page Views</div>
    <div class="stat-value text-primary">89,400</div>
    <div class="stat-desc">21% more than last month</div>
  </div>
</div>
```

### **Feedback Components**

```html
<!-- Alert -->
<div class="alert alert-success">
  <svg class="stroke-current shrink-0 h-6 w-6" viewBox="0 0 24 24">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
  <span>Success! Task completed.</span>
</div>

<!-- Loading -->
<div class="flex items-center space-x-2">
  <div class="loading loading-spinner loading-md"></div>
  <span>Loading...</span>
</div>

<!-- Progress -->
<progress class="progress progress-primary w-56" value="70" max="100"></progress>
```

## 🎨 **Theming System**

### **Built-in Themes**

```javascript
// tailwind.config.js
module.exports = {
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      'light',
      'dark',
      'cupcake',
      'bumblebee',
      'emerald',
      'corporate',
      'synthwave',
      'retro',
      'cyberpunk',
      'valentine',
      'halloween',
      'garden',
      'forest',
      'aqua',
      'lofi',
      'pastel',
      'fantasy',
      'wireframe',
      'black',
      'luxury',
      'dracula',
      'cmyk',
      'autumn',
      'business',
      'acid',
      'lemonade',
      'night',
      'coffee',
      'winter',
    ],
  },
};
```

### **Custom Themes**

```javascript
// tailwind.config.js
module.exports = {
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#1e40af',
          secondary: '#7c3aed',
          accent: '#ea580c',
          neutral: '#1f2937',
          'base-100': '#ffffff',
          info: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
    ],
  },
};
```

### **Theme Switching**

```html
<!-- Theme controller -->
<div class="dropdown">
  <label tabindex="0" class="btn m-1">
    Theme
    <svg
      class="fill-current w-3 h-3 ml-1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 2048 2048"
    >
      <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
    </svg>
  </label>
  <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
    <li><a data-set-theme="light">Light</a></li>
    <li><a data-set-theme="dark">Dark</a></li>
    <li><a data-set-theme="cupcake">Cupcake</a></li>
  </ul>
</div>
```

## 🔧 **Configuration**

### **Tailwind Config**

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    styled: true,
    themes: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: '',
    darkTheme: 'dark',
  },
};
```

### **CSS Imports**

```css
/* main.css */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Optional: Import DaisyUI base styles */
@import 'daisyui/dist/full.css';
```

## 📱 **Responsive Design**

### **Breakpoint Classes**

```html
<!-- Responsive visibility -->
<div class="block md:hidden">Visible on mobile only</div>
<div class="hidden md:block">Visible on desktop only</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="card">Item 1</div>
  <div class="card">Item 2</div>
  <div class="card">Item 3</div>
</div>

<!-- Responsive text -->
<h2 class="text-2xl md:text-4xl lg:text-6xl">Responsive Heading</h2>
```

### **Mobile-First Components**

```html
<!-- Drawer for mobile navigation -->
<div class="drawer">
  <input id="my-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <!-- Page content -->
  </div>
  <div class="drawer-side">
    <label for="my-drawer" class="drawer-overlay"></label>
    <ul class="menu p-4 w-80 bg-base-100 text-base-content">
      <li><a>Sidebar Item 1</a></li>
      <li><a>Sidebar Item 2</a></li>
    </ul>
  </div>
</div>
```

## 🎯 **Best Practices**

### **Component Composition**

```html
<!-- Combine components semantically -->
<div class="hero min-h-screen bg-base-200">
  <div class="hero-content flex-col lg:flex-row">
    <div class="max-w-sm rounded-lg shadow-2xl bg-base-200 h-64 w-64"></div>
    <div>
      <h2 class="text-5xl font-bold">Hero Title</h2>
      <p class="py-6">Hero description text.</p>
      <button class="btn btn-primary">Get Started</button>
    </div>
  </div>
</div>
```

### **Customization**

```html
<!-- Override with Tailwind utilities -->
<button class="btn btn-primary bg-red-500 hover:bg-red-600">Custom Button</button>

<!-- Use data attributes for JavaScript -->
<button class="btn" data-action="save">Save Changes</button>
```

### **Accessibility**

```html
<!-- Semantic HTML with ARIA -->
<button class="btn btn-primary" aria-label="Save document">
  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
    />
  </svg>
  Save
</button>
```

## 🚀 **Getting Started**

### **Installation**

```bash
# Install DaisyUI
npm install -D daisyui@latest

# Or with Tailwind CSS
npm install -D tailwindcss daisyui@latest
```

### **Basic Setup**

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
};
```

### **HTML Template**

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DaisyUI App</title>
    <link href="#" rel="stylesheet" />
  </head>
  <body>
    <div class="navbar bg-base-100">
      <a class="btn btn-ghost normal-case text-xl">DaisyUI</a>
    </div>

    <div class="container mx-auto p-4">
      <button class="btn btn-primary">Hello World</button>
    </div>
  </body>
</html>
```

## 🔮 **Advanced Usage**

### **Custom Components**

```javascript
// Create custom component classes
// tailwind.config.js
module.exports = {
  plugins: [require('daisyui')],
  daisyui: {
    styled: true,
    themes: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: 'daisy-',
  },
};
```

### **Plugin Development**

```javascript
// daisyui plugin
const plugin = require('tailwindcss/plugin');

module.exports = plugin(function ({ addComponents, theme }) {
  addComponents({
    '.btn-custom': {
      '@apply btn btn-primary rounded-full px-8 py-3 text-lg font-semibold': {},
      '&:hover': {
        '@apply btn-secondary': {},
      },
    },
  });
});
```

## 📊 **Performance & Bundle Size**

### **Tree Shaking**

- **Only includes** used components
- **Minimal CSS** output
- **Optimized** for production builds
- **No JavaScript** runtime overhead

### **Bundle Analysis**

```bash
# Analyze bundle size
npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch

# Purge unused CSS
module.exports = {
  content: ["./src/**/*.{html,js}"],
  plugins: [require("daisyui")],
}
```

## 🌟 **Community & Ecosystem**

### **Themes & Extensions**

- **Community themes** on daisyui.com/themes
- **Custom themes** generator
- **Theme marketplace** for sharing
- **Plugin ecosystem** growing

### **Integration Examples**

- **React** with Tailwind CSS
- **Vue.js** with Vite
- **Next.js** with App Router
- **Svelte** with SvelteKit
- **Astro** static site generation

### **Learning Resources**

- **Official documentation** with examples
- **Component playground** for experimentation
- **Theme customizer** for visual design
- **Community Discord** for support

---

**Website**: [daisyui.com](https://daisyui.com)
**GitHub**: [saadeghi/daisyui](https://github.com/saadeghi/daisyui)
**Documentation**: [daisyui.com/docs](https://daisyui.com/docs)
**Themes**: [daisyui.com/themes](https://daisyui.com/themes)
