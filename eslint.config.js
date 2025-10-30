import js from '@eslint/js';
import security from 'eslint-plugin-security';

export default [
  js.configs.recommended,
  {
    plugins: {
      security,
    },
    rules: {
      ...security.configs.recommended.rules,
      'security/detect-object-injection': 'off', // Too restrictive for Hugo templates
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'warn',
    },
  },
  {
    files: ['scripts/**/*.js', '*.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        global: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off', // Allow console in scripts
    },
  },
  {
    ignores: [
      'node_modules/',
      'public/',
      'resources/',
      '.hugo_cache/',
      'static/js/vendor/',
    ],
  },
];