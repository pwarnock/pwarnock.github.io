/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './layouts/**/*.html',
    './themes/**/*.html',
    './content/**/*.md',
    './assets/**/*.js',
    './static/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["light", "dark", "halloween"],
  },
  safelist: ['badge', 'badge-primary', 'badge-secondary', 'badge-accent', 'badge-neutral', 'badge-info', 'badge-success', 'badge-warning', 'badge-error', 'badge-ghost'],
}
