# Theme Switching Guide

This guide explains how to switch or add themes in this Hugo site using DaisyUI and Tailwind CSS.

## Prerequisites

- DaisyUI installed via npm.
- Tailwind CSS configured.

## Steps to Switch Themes

1. Include Theme in Tailwind Config

   Edit `tailwind.config.js` to add the desired theme to the `themes` array in the `daisyui` config.

   Example:

   ```js
   daisyui: {
     themes: ['light', 'dark', 'retro', 'cyberpunk', 'halloween'],
   },
   ```

   This includes the theme's CSS variables in the build.

2. Rebuild CSS

   Run the following command to rebuild the Tailwind CSS with the new theme included:

   ```bash
   npx tailwindcss -i ./assets/css/tailwind.css -o ./static/css/tailwind.css --minify
   ```

3. Update Switcher in HTML

   Edit `layouts/_default/baseof.html` to update the `themes` array in the Alpine.js x-data.

   Example:

   ```js
   themes: ['halloween', 'dark', 'light'],
   ```

   This controls the cycling order of the theme switcher button.

4. Set Default Theme

   In the `init()` function in `layouts/_default/baseof.html`, set the default theme.

   Example:

   ```js
   const saved = localStorage.getItem('theme') || 'halloween';
   ```

5. Test

   Refresh the site. The theme switcher button cycles through the themes in the array. The default theme loads on page load.

## Adding Custom Themes

To create a custom theme (e.g., light variant of an existing theme):

1. Add custom CSS in `assets/css/tailwind.css` with `[data-theme=custom-name]` and define the CSS variables.

   Example:

   ```scss
   [data-theme='halloween-light'] {
     --b1: 100% 0 0; // Light background
     --bc: 27.8078% 0.029596 256.847952; // Dark text
     // Other variables from the base theme
     --p: 49.12% 0.3096 275.75; // Keep halloween primary
     // etc.
   }
   ```

2. Add 'custom-name' to the themes array in `tailwind.config.js`.

3. Rebuild CSS.

4. Update the switcher as above.

## Using Themes in Components

Use DaisyUI semantic color classes like `text-primary`, `bg-secondary`, etc. They automatically adapt to the current theme.

For custom overrides, use CSS variables like `hsl(var(--color-primary))`.

## Troubleshooting

- If theme doesn't change, check if it's included in `tailwind.config.js` and CSS is rebuilt.
- Clear browser cache.
- Inspect `data-theme` attribute on `<html>`.
- Check computed styles for color classes.

## Links

- [DaisyUI Themes](https://daisyui.com/docs/themes/)
- [Tailwind CSS](https://tailwindcss.com/)
