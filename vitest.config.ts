import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./packages/agents/src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/', 'tests/', '**/*.spec.ts', '**/*.test.ts'],
    },
    // Include tests from all workspaces
    include: [
      'packages/agents/src/**/*.{test,spec}.ts',
      'packages/qa-tools/src/**/*.{test,spec}.ts',
      'shared/src/**/*.{test,spec}.ts',
    ],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'tests/', 'test/'],
  },
});
