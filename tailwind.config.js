/** @type {import('tailwindcss').Config} */
module.exports = {

  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["light", "dark", "retro", "cyberpunk", "halloween"],
  },
  safelist: [
    { pattern: /^bg-base-/ },
    { pattern: /^text-base-/ },
    { pattern: /^border-base-/ },
    { pattern: /^hover:bg-base-/ },
    { pattern: /^hover:text-base-/ },
    'badge', 'badge-primary', 'badge-secondary', 'badge-accent', 'badge-neutral', 'badge-info', 'badge-success', 'badge-warning', 'badge-error', 'badge-ghost'
  ],
}
