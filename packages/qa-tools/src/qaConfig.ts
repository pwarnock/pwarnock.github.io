/**
 * QA Modes Configuration (v1.0)
 *
 * This file encodes the spec for QA modes, path rules, and policy versions.
 * It is intended to be imported by the selector and runner.
 */

export const qaPolicyVersion = '1.0.0';
export const a11yPolicyVersion = '1.0.0-content-qa';

/**
 * Path classification rules (v1)
 */
export const pathRules = {
  // Content-eligible patterns (allow content_fast_path)
  allowedContentPatterns: [
    'content/**',
    'static/img/**',
    'static/images/**',
    'static/**/*.jpg',
    'static/**/*.jpeg',
    'static/**/*.png',
    'static/**/*.webp',
    'static/**/*.gif',
    'static/**/*.svg',
    'static/**/*.pdf',
  ] as const,

  // Non-content patterns (force full)
  nonContentPatterns: [
    'layouts/**',
    'assets/**',
    'src/**',
    'scripts/**',
    'tests/**',
    'test/**',
    'config/**',
    '.github/**',
    '.cody/**',
    '.husky/**',
    // Root configs
    'hugo.toml',
    'tailwind.config.js',
    'postcss.config.cjs',
    'playwright.config.ts',
    'vitest.config.ts',
    'lighthouserc.js',
    'package.json',
    'package-lock.json',
    'bun.lock',
    'ecosystem.config.cjs',
    '.htmltest.yml',
  ] as const,

  // A11y-critical data patterns (force full)
  a11yCriticalDataPatterns: [
    'data/nav.*',
    'data/navigation.*',
    'data/navigation/**',
    'data/footer.*',
    'data/forms/**',
    'data/aria/**',
  ] as const,
} as const;

/**
 * QA Mode definitions (v1)
 */
export type Step = {
  id: string;
  description: string;
  command: string;
  critical: boolean;
};

export type Mode = {
  id: 'content_fast_path' | 'full';
  name: string;
  description: string;
  steps: readonly Step[];
};

export const modes: Record<'content_fast_path' | 'full', Mode> = {
  content_fast_path: {
    id: 'content_fast_path',
    name: 'Content Fast-Path QA',
    description:
      'Fast but safe QA for clearly content-only changes, including build, SEO, and a11y checks on representative pages.',
    steps: [
      {
        id: 'content_build',
        description: 'Fast content build.',
        command: 'bun run build:content',
        critical: true,
      },
      {
        id: 'seo_fast',
        description: 'SEO metadata checks on core pages.',
        command: 'bunx playwright test tests/seo-metadata.spec.ts',
        critical: true,
      },
      {
        id: 'a11y_fast',
        description:
          'A11y smoke for home, one article, one listing, and (if any) an interactive page.',
        command: 'bunx playwright test tests/accessibility-critical.spec.ts',
        critical: true,
      },
    ],
  },
  full: {
    id: 'full',
    name: 'Full QA',
    description:
      'Comprehensive QA for infra/template/code/config changes: build, SEO, full a11y coverage, E2E, performance, and visual regression.',
    steps: [
      {
        id: 'site_build_full',
        description: 'Full/infra build.',
        command: 'bun run build:infra',
        critical: true,
      },
      {
        id: 'seo_full',
        description: 'Full SEO test suite.',
        command: 'bunx playwright test tests/seo-metadata.spec.ts',
        critical: true,
      },
      {
        id: 'a11y_full',
        description: 'Full a11y suite.',
        command: 'bunx playwright test tests/accessibility-critical.spec.ts',
        critical: true,
      },
      {
        id: 'e2e_journeys',
        description: 'End-to-end user journey tests.',
        command: 'bunx playwright test tests/e2e-journeys.spec.ts',
        critical: true,
      },
      {
        id: 'visual_regression',
        description: 'Visual regression checks.',
        command: 'bunx playwright test tests/visual-regression.spec.ts',
        critical: true,
      },
      {
        id: 'performance',
        description: 'Performance checks.',
        command: 'bunx playwright test tests/performance.spec.ts',
        critical: false, // adjust as needed
      },
      {
        id: 'go_bdd',
        description: 'Go/BDD tests under test/.',
        command: 'cd test && go test ./...',
        critical: true,
      },
    ],
  },
};

/**
 * Default mode and fallback
 */
export const defaultMode = 'full' as const;
export const fallbackOnErrorMode = 'full' as const;
