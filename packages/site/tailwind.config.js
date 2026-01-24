/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./content/**/*.md', './layouts/**/*.html', './themes/**/*.html'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: true,
  },
};
