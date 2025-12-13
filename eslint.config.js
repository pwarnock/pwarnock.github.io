import js from '@eslint/js';
import security from 'eslint-plugin-security';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    plugins: {
      security,
    },
    rules: {
      ...security.configs.recommended.rules,
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'warn',
      'security/detect-non-literal-fs-filename': 'off', // Too noisy for build scripts
    },
  },
  // Node.js scripts and config files
  {
    files: [
      'scripts/**/*.js',
      'scripts/**/*.cjs',
      '*.config.js',
      '*.config.cjs',
      'ecosystem.config.cjs',
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        Bun: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off',
      'max-len': [
        'error',
        { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true },
      ],
    },
  },
  // Browser scripts
  {
    files: ['static/js/**/*.js', 'assets/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'warn',
    },
  },
  // Analytics script - allow console for debugging
  {
    files: ['static/js/analytics.js'],
    rules: {
      'no-console': 'off',
    },
  },
  // Test files
  {
    files: ['tests/**/*.js', 'test/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
  {
    ignores: [
      'node_modules/',
      'public/',
      'resources/',
      '.hugo_cache/',
      'static/js/vendor/',
      'assets/js/alpinejs.min.js', // Minified third-party
    ],
  },
];
