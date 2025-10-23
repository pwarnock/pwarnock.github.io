/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './layouts/**/*.html',
    './themes/hugo-porto/layouts/**/*.html',
    './content/**/*.md',
    './assets/**/*.js',
    './static/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography'),
  ],
  daisyui: {
    themes: ["light", "dark", "retro", "cyberpunk", "halloween"],
  },
  safelist: [
    'badge', 'badge-primary', 'badge-secondary', 'badge-accent', 'badge-neutral', 
    'badge-info', 'badge-success', 'badge-warning', 'badge-error', 'badge-ghost', 
    'badge-outline', 'mr-2',
    'tooltip', 'tooltip-top', 'tooltip-bottom', 'tooltip-left', 'tooltip-right', 
    'tooltip-open', 'tooltip-primary', 'tooltip-secondary', 'tooltip-accent', 
    'tooltip-neutral', 'tooltip-info', 'tooltip-success', 'tooltip-warning', 'tooltip-error'
  ],
}
