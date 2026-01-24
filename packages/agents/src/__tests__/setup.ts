/**
 * Vitest Global Setup for Agent Tests
 *
 * Ensures test artifacts are cleaned up after test runs
 */

import fs from 'fs/promises';
import path from 'path';
import { afterAll, beforeAll } from 'vitest';

const TEST_ARTIFACT_PATTERNS = [
  // Portfolio test artifacts
  'content/portfolio/*-test',
  'content/portfolio/test-*',
  'content/portfolio/analytics-*',
  'content/portfolio/api-*',
  'content/portfolio/backend-*',
  'content/portfolio/cicd-*',
  'content/portfolio/complex-*',
  'content/portfolio/dashboard-*',
  'content/portfolio/data-*',
  'content/portfolio/draft-*',
  'content/portfolio/e-commerce-*',
  'content/portfolio/empty-*',
  'content/portfolio/general-*',
  'content/portfolio/ios-*',
  'content/portfolio/linked-*',
  'content/portfolio/minimal-*',
  'content/portfolio/mobile-*',
  'content/portfolio/open-source-*',
  'content/portfolio/performance-*',
  'content/portfolio/professional-*',
  'content/portfolio/project-with-*',
  'content/portfolio/reviewable-*',
  'content/portfolio/session*',
  'content/portfolio/standalone-*',
  'content/portfolio/valid-*',
  'content/portfolio/web-*',
  // Tech radar test artifacts
  'content/tools/*-test',
  'content/tools/test-*',
  'content/tools/ecosystem-*',
  'content/tools/my-amazing-*',
  'content/tools/this-is-an-*',
  // Temp directories
  'tmp/test-*',
];

/**
 * Clean up test artifacts matching patterns
 */
async function cleanupTestArtifacts(): Promise<void> {
  const projectRoot = process.cwd();

  for (const pattern of TEST_ARTIFACT_PATTERNS) {
    const baseDir = path.dirname(pattern);
    const prefix = path.basename(pattern).replace('*', '');
    const fullBaseDir = path.join(projectRoot, baseDir);

    try {
      const entries = await fs.readdir(fullBaseDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith(prefix.replace('-', ''))) {
          const fullPath = path.join(fullBaseDir, entry.name);
          try {
            await fs.rm(fullPath, { recursive: true, force: true });
          } catch {
            // Ignore errors for individual directories
          }
        }
      }
    } catch {
      // Directory doesn't exist, skip
    }
  }
}

// Register global cleanup
beforeAll(async () => {
  // Clean up any leftover artifacts from previous test runs
  await cleanupTestArtifacts();
});

afterAll(async () => {
  // Clean up artifacts created during this test run
  await cleanupTestArtifacts();
});

export { cleanupTestArtifacts };
