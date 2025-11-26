import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Helper function to recursively get all HTML files
function getHtmlFiles(dir: string): string[] {
  const files: string[] = [];
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getHtmlFiles(fullPath));
    } else if (item.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Helper function to recursively get all markdown files
function getMdFiles(dir: string): string[] {
  const files: string[] = [];
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getMdFiles(fullPath));
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

test.describe('Placeholder and Development Artifact Detection', () => {
  test('detect hardcoded feature flag conditions', async () => {
    // Check for hardcoded {{ if true }} or {{ if false }} in templates
    const templateFiles = getHtmlFiles('layouts');
    const violations: Array<{ file: string; line: number; content: string }> = [];

    for (const file of templateFiles) {
      const content = readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Check for hardcoded conditions
        if (/\{\{\s*if\s+(true|false)\s*\}\}/.test(line)) {
          violations.push({
            file,
            line: index + 1,
            content: line.trim(),
          });
        }
      });
    }

    if (violations.length > 0) {
      console.log('HARDCODED_FEATURE_FLAGS:');
      console.log(JSON.stringify(violations, null, 2));
    }

    expect(violations.length).toBe(0);
  });

  test('detect feature flag inconsistencies', async () => {
    // Check if feature flags in data/ have corresponding template checks
    const featureFlagFile = 'data/feature-flags.toml';
    const content = readFileSync(featureFlagFile, 'utf8');

    // Extract feature flag names
    const flagMatches = content.matchAll(/\[flags\.([^\]]+)\]/g);
    const flagNames = Array.from(flagMatches, (match: RegExpMatchArray) => match[1]);

    const templateFiles = getHtmlFiles('layouts');
    const implementedFlags = new Set<string>();

    for (const file of templateFiles) {
      const fileContent = readFileSync(file, 'utf8');

      flagNames.forEach(flagName => {
        // Check if template references feature flag
        const flagPattern = new RegExp(`site\\.Params\\.Flags\\.${flagName}`, 'i');
        if (flagPattern.test(fileContent)) {
          implementedFlags.add(flagName);
        }
      });
    }

    const unimplementedFlags = flagNames.filter(flag => !implementedFlags.has(flag));

    if (unimplementedFlags.length > 0) {
      console.log('UNIMPLEMENTED_FEATURE_FLAGS:');
      console.log(JSON.stringify(unimplementedFlags, null, 2));
    }

    // Allow some flags to be unimplemented (future features)
    expect(unimplementedFlags.length).toBeLessThan(3);
  });

  test('detect problematic placeholder content', async () => {
    const contentFiles = getMdFiles('content');
    const templateFiles = getHtmlFiles('layouts');
    const allFiles = [...contentFiles, ...templateFiles];

    const problematicPatterns = [
      {
        name: 'RENAME_ME_FILES',
        pattern: /rename-me/i,
        severity: 'error',
      },
      {
        name: 'TODO_COMMENTS',
        pattern: /<!--\s*TODO\s*:/i,
        severity: 'warning',
      },
      {
        name: 'FIXME_COMMENTS',
        pattern: /<!--\s*FIXME\s*:/i,
        severity: 'error',
      },
      {
        name: 'HACK_COMMENTS',
        pattern: /<!--\s*HACK\s*:/i,
        severity: 'warning',
      },
      {
        name: 'XXX_COMMENTS',
        pattern: /<!--\s*XXX\s*:/i,
        severity: 'error',
      },
      {
        name: 'LOREM_IPSUM',
        pattern: /lorem ipsum/i,
        severity: 'warning',
      },
      {
        name: 'PLACEHOLDER_IMAGES',
        pattern: /placeholder\.(jpg|jpeg|png|gif|webp)/i,
        severity: 'error',
      },
    ];

    const violations: Array<{
      type: string;
      file: string;
      line: number;
      content: string;
      severity: string;
    }> = [];

    for (const file of allFiles) {
      const content = readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        problematicPatterns.forEach(pattern => {
          if (pattern.pattern.test(line)) {
            violations.push({
              type: pattern.name,
              file,
              line: index + 1,
              content: line.trim(),
              severity: pattern.severity,
            });
          }
        });
      });
    }

    if (violations.length > 0) {
      console.log('PLACEHOLDER_VIOLATIONS:');
      console.log(JSON.stringify(violations, null, 2));
    }

    // Separate error vs warning counts
    const errors = violations.filter(v => v.severity === 'error');
    const warnings = violations.filter(v => v.severity === 'warning');

    expect(errors.length).toBe(0);
    expect(warnings.length).toBeLessThan(5); // Allow some warnings
  });

  test('detect missing alt text for images', async ({ page, request }) => {
    // This is a more comprehensive version of existing test
    const sitemapResponse = await request.get('/sitemap.xml');
    const sitemapBody = await sitemapResponse.text();

    const urlMatches = sitemapBody.match(/<loc>(https?:\/\/[^<]+)<\/loc>/g) || [];
    const urls = urlMatches.map(match => match.replace(/<loc>(https?:\/\/[^<]+)<\/loc>/, ''));

    const pagesToCheck = urls.slice(0, 5); // Check first 5 pages
    const imagesWithoutAlt: Array<{ page: string; src: string }> = [];

    for (const url of pagesToCheck) {
      const relativePath = url.replace(process.env.BASE_URL || 'http://localhost:1313', '');
      await page.goto(relativePath);

      const images = await page.locator('img').all();

      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');

        if (!alt || alt.trim() === '') {
          imagesWithoutAlt.push({
            page: relativePath,
            src: src || 'unknown',
          });
        }
      }
    }

    if (imagesWithoutAlt.length > 0) {
      console.log('MISSING_ALT_TEXT:');
      console.log(JSON.stringify(imagesWithoutAlt, null, 2));
    }

    expect(imagesWithoutAlt.length).toBeLessThan(3);
  });

  test('detect console.log statements in production', async ({ page }) => {
    // Check for console.log statements that shouldn't be in production
    const pagesToCheck = ['/', '/blog/', '/portfolio/'];
    const consoleLogs: Array<{ page: string; message: string }> = [];

    for (const pagePath of pagesToCheck) {
      const pageLogs: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'log' || msg.type() === 'info') {
          pageLogs.push(msg.text());
        }
      });

      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      pageLogs.forEach(log => {
        // Filter out legitimate logs
        if (!log.includes('[CookieConsent]') && !log.includes('[Analytics]')) {
          consoleLogs.push({
            page: pagePath,
            message: log,
          });
        }
      });
    }

    if (consoleLogs.length > 0) {
      console.log('CONSOLE_LOGS:');
      console.log(JSON.stringify(consoleLogs, null, 2));
    }

    expect(consoleLogs.length).toBe(0);
  });

  test('detect broken internal links in content', async ({ page, request }) => {
    const contentFiles = getMdFiles('content');
    const brokenLinks: Array<{ file: string; link: string }> = [];

    for (const file of contentFiles) {
      const content = readFileSync(file, 'utf8');

      // Find markdown links
      const linkMatches = content.matchAll(/\[([^\]]*)\]\(([^)]+)\)/g);

      for (const match of linkMatches) {
        const link = match[2] as string;

        // Check internal links
        if (link.startsWith('/') && !link.startsWith('//')) {
          try {
            const response = await request.get(link);
            if (response.status() >= 400) {
              brokenLinks.push({
                file,
                link,
              });
            }
          } catch (error) {
            brokenLinks.push({
              file,
              link,
            });
          }
        }
      }
    }

    if (brokenLinks.length > 0) {
      console.log('BROKEN_INTERNAL_LINKS:');
      console.log(JSON.stringify(brokenLinks, null, 2));
    }

    expect(brokenLinks.length).toBeLessThan(2);
  });
});
