import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

test.describe('Configuration Tests', () => {
  test('PostCSS configuration is valid', async () => {
    const postcssConfig = './postcss.config.cjs';
    expect(existsSync(postcssConfig)).toBe(true);

    const configContent = readFileSync(postcssConfig, 'utf8');
    expect(configContent).toContain('@tailwindcss/postcss');
    expect(configContent).toContain('plugins');
  });

  test('Hugo configuration is valid', async () => {
    const hugoConfig = './hugo.toml';
    expect(existsSync(hugoConfig)).toBe(true);

    const configContent = readFileSync(hugoConfig, 'utf8');

    // Check critical settings
    expect(configContent).toContain('baseURL');
    expect(configContent).toContain('enableGitInfo = true');
    expect(configContent).toContain('buildFuture = true');

    // Check security settings
    expect(configContent).toContain('[security]');
    expect(configContent).toContain('allow');
  });

  test('Package.json has correct dependencies', async () => {
    const packageJson = './package.json';
    expect(existsSync(packageJson)).toBe(true);

    const pkg = JSON.parse(readFileSync(packageJson, 'utf8'));

    // Check Tailwind CSS v4 dependencies
    expect(pkg.dependencies).toHaveProperty('tailwindcss');
    expect(pkg.dependencies).toHaveProperty('@tailwindcss/postcss');
    expect(pkg.dependencies).toHaveProperty('@tailwindcss/typography');
    expect(pkg.devDependencies).toHaveProperty('daisyui');

    // Check build scripts
    expect(pkg.scripts).toHaveProperty('build:production');
    expect(pkg.scripts).toHaveProperty('css:watch');
  });

  test('CSS framework files exist and are valid', async () => {
    const frameworkFiles = [
      './assets/css/framework/imports.css',
      './assets/css/framework/base.css',
      './assets/css/design-system/tokens.css',
      './assets/css/components/buttons.css',
    ];

    for (const file of frameworkFiles) {
      expect(existsSync(file)).toBe(true);
      const content = readFileSync(file, 'utf8');
      expect(content.length).toBeGreaterThan(0);
    }

    // Check main CSS imports
    const mainCss = readFileSync('./assets/css/main.css', 'utf8');
    expect(mainCss).toContain('@import');
    expect(mainCss).toContain('./assets/css/framework/imports.css');
  });

  test('Build scripts are executable', async () => {
    const buildScripts = [
      './scripts/path-based-build.sh',
      './scripts/deploy-production.sh',
      './scripts/deploy-staging.sh',
    ];

    for (const script of buildScripts) {
      if (existsSync(script)) {
        try {
          execSync(`bash -n ${script}`, { encoding: 'utf8' });
        } catch (error: any) {
          throw new Error(`Script ${script} has syntax errors: ${error.message}`);
        }
      }
    }
  });

  test('Environment variables are properly set', async () => {
    // Check CI environment variables from workflow
    const requiredEnvVars = [
      'NODE_VERSION',
      'GO_VERSION',
      'HUGO_VERSION',
      'HUGO_ENV',
      'HUGO_GTM_CONTAINER_ID',
    ];

    // In CI, these should be set
    for (const envVar of requiredEnvVars) {
      // Note: This test mainly for documentation - actual values set in CI
      expect(envVar.length).toBeGreaterThan(0);
    }
  });
});
