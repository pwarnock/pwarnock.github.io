import { test, expect } from '@playwright/test';
import { logger } from './logfire.setup';

test.describe('SEO & Metadata Validation', () => {
  // Core pages to check
  const pagesToCheck = ['/', '/blog/', '/about/', '/portfolio/', '/tools/'];

  for (const path of pagesToCheck) {
    test(`validate metadata for ${path}`, async ({ page, baseURL }) => {
      await logger.span(`SEO Check: ${path}`, {
        attributes: { path },
        callback: async () => {
          const response = await page.goto(path);
          expect(response?.status()).toBe(200);
          await page.waitForLoadState('domcontentloaded');

          // 1. Title Validation
          const title = await page.title();
          expect(title).not.toBe('');
          if (path !== '/') {
            // Most pages should have suffix, homepage might differ depending on config
            // Adjust regex as needed for your site template
            expect(title).toMatch(/\| Peter Warnock$/);
          }

          // 2. Meta Description
          const description = await page
            .locator('meta[name="description"]')
            .getAttribute('content');
          expect(description).toBeTruthy();
          expect(description?.length).toBeGreaterThan(10);
          expect(description?.length).toBeLessThan(300); // Reasonable max length

          // 3. Canonical URL
          const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
          expect(canonical).toBeTruthy();
          // Canonical should usually be absolute
          expect(canonical).toMatch(/^https?:\/\//);

          // 4. Open Graph Tags
          const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
          const ogDesc = await page
            .locator('meta[property="og:description"]')
            .getAttribute('content');
          const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
          const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');

          expect(ogTitle).toBeTruthy();
          expect(ogDesc).toBeTruthy();
          expect(ogUrl).toBeTruthy();
          // Image is optional but recommended
          if (ogImage) {
            expect(ogImage).toMatch(/^https?:\/\//); // Should be absolute URL
          } else {
            logger.warning(`Missing og:image for ${path}`);
          }

          // 5. Twitter Card
          const twitterCard = await page
            .locator('meta[name="twitter:card"]')
            .getAttribute('content');
          expect(twitterCard).toBeTruthy(); // usually 'summary' or 'summary_large_image'

          // 6. Viewport
          const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
          expect(viewport).toContain('width=device-width');

          // Log success
          logger.info('SEO Metadata Verified', {
            path,
            title,
            description_length: description?.length,
            has_og_image: !!ogImage,
            canonical,
          });
        },
      });
    });
  }

  test('validate sitemap.xml', async ({ request, baseURL }) => {
    await logger.span('SEO Check: sitemap.xml', {
      attributes: { type: 'sitemap' },
      callback: async () => {
        const response = await request.get('/sitemap.xml');
        expect(response.status()).toBe(200);
        const body = await response.text();

        // Basic XML validation
        expect(body).toContain('<?xml');
        expect(body).toContain('<urlset');
        expect(body).toContain('<url>');

        // Check if core pages are present (using baseURL if relative, or regex)
        // Sitemaps usually contain full URLs. Hugo generates absolute URLs based on config.
        // We check for paths, as the domain might differ between dev/prod builds.
        expect(body).toContain('/blog/');
        expect(body).toContain('/about/');

        logger.info('Sitemap verified', { size_bytes: body.length });
      },
    });
  });

  test('validate robots.txt', async ({ request }) => {
    await logger.span('SEO Check: robots.txt', {
      attributes: { type: 'robots' },
      callback: async () => {
        const response = await request.get('/robots.txt');
        expect(response.status()).toBe(200);
        const body = await response.text();

        expect(body).toContain('User-agent: *');
        // Should allow access or have specific disallows
        // Should link to sitemap
        expect(body).toContain('Sitemap:');

        logger.info('robots.txt verified', { content: body });
      },
    });
  });
});
