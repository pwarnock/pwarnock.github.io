import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Disable file parallelism to prevent race conditions from shared singleton state
    // (paths.ts caches config based on process.cwd(), which tests modify)
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/__tests__/**'],
    },
  },
  resolve: {
    alias: {
      '@pwarnock/shared': path.resolve(__dirname, '../../shared/src'),
    },
  },
});
