import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

test.describe('Build Configuration Tests', () => {
  test('CSS build process works correctly', async () => {
    // Test that Hugo builds CSS correctly through PostCSS
    try {
      const output = execSync('hugo --gc --minify --enableGitInfo', {
        encoding: 'utf8',
        cwd: process.cwd(),
      });

      expect(output).toContain('Total in');
      expect(existsSync('./public/css/main.css')).toBe(true);

      // Check generated CSS contains expected content
      const cssContent = readFileSync('./public/css/main.css', 'utf8');
      expect(cssContent).toContain('daisyui');
      expect(cssContent).toContain('tailwindcss');
    } catch (error: any) {
      throw new Error(`CSS build failed: ${error.message}`);
    }
  });

  test('Hugo build process works correctly', async () => {
    try {
      const output = execSync('hugo --gc --minify --enableGitInfo', {
        encoding: 'utf8',
        cwd: process.cwd(),
      });

      expect(output).toContain('Total in');
      expect(existsSync('./public')).toBe(true);
      expect(existsSync('./public/index.html')).toBe(true);

      // Check critical files exist
      const criticalFiles = ['public/css/main.css', 'public/index.html', 'public/sitemap.xml'];

      for (const file of criticalFiles) {
        expect(existsSync(file)).toBe(true);
      }
    } catch (error: any) {
      throw new Error(`Hugo build failed: ${error.message}`);
    }
  });

  test('CSS imports resolve correctly', async () => {
    // Test that all CSS imports can be resolved
    const mainCssPath = './assets/css/main.css';
    const mainCssContent = readFileSync(mainCssPath, 'utf8');

    // Extract all @import statements
    const imports = mainCssContent.match(/@import ['"][^'"]+['"];/g) || [];

    for (const importStatement of imports) {
      const filePath = importStatement.match(/@import ['"]([^'"]+)['"];/)![1];
      const fullPath = join(process.cwd(), filePath);

      expect(existsSync(fullPath)).toBe(true);
    }
  });

  test('PostCSS configuration is valid', async () => {
    try {
      // Test PostCSS config by checking Hugo can process it
      const output = execSync('hugo --gc --minify --enableGitInfo', {
        encoding: 'utf8',
        cwd: process.cwd(),
      });
      expect(output).toContain('Total in');
    } catch (error: any) {
      throw new Error(`PostCSS/Hugo build error: ${error.message}`);
    }
  });

  test('Build output is optimized', async () => {
    // Build site first
    execSync('hugo --gc --minify --enableGitInfo', { encoding: 'utf8', cwd: process.cwd() });

    // Check CSS is minified
    const cssContent = readFileSync('./public/css/main.css', 'utf8');
    const cssSizeKB = Buffer.byteLength(cssContent, 'utf8') / 1024;

    // CSS should be reasonably sized (adjust threshold as needed)
    expect(cssSizeKB).toBeLessThan(500); // Less than 500KB

    // Check HTML is minified
    const indexHtml = readFileSync('./public/index.html', 'utf8');
    expect(indexHtml).not.toContain('  '); // No double spaces (indicates minification)
  });
});
