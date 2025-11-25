import { test, expect } from '@playwright/test';
import { logger } from './logfire.setup';

test.describe('Content Validation', () => {
  test('validate internal links', async ({ page, request, baseURL }) => {
    await logger.span('Content Check: Internal Links', {
      attributes: { type: 'link_validation' },
      callback: async () => {
        // Get sitemap to find all pages
        const sitemapResponse = await request.get('/sitemap.xml');
        expect(sitemapResponse.status()).toBe(200);
        const sitemapBody = await sitemapResponse.text();

        // Extract URLs from sitemap
        const urlMatches = sitemapBody.match(/<loc>(https?:\/\/[^<]+)<\/loc>/g) || [];
        const urls = urlMatches.map(match => match.replace(/<loc>(https?:\/\/[^<]+)<\/loc>/, ''));

        console.log(`Found ${urls.length} pages to check`);

        let brokenLinks = 0;
        let checkedLinks = 0;

        // Check a sample of pages (to avoid timeout)
        const pagesToCheck = urls.slice(0, 5); // Check first 5 pages

        for (const url of pagesToCheck) {
          const relativePath = url.replace(baseURL, '');
          console.log(`Checking links on: ${relativePath}`);

          const response = await page.goto(relativePath);
          expect(response?.status()).toBe(200);

          // Find all internal links
          const links = await page
            .locator('a[href^="/"], a[href^="' + baseURL.replace(/^https?:\/\//, '') + '"]')
            .all();

          for (const link of links) {
            const href = await link.getAttribute('href');
            if (
              href &&
              !href.startsWith('#') &&
              !href.startsWith('mailto:') &&
              !href.startsWith('tel:')
            ) {
              checkedLinks++;

              // Convert relative to absolute if needed
              const fullUrl = href.startsWith('/') ? baseURL + href : href;

              // Only check internal links
              if (fullUrl.startsWith(baseURL)) {
                try {
                  const linkResponse = await request.get(fullUrl.replace(baseURL, ''));
                  if (linkResponse.status() >= 400) {
                    brokenLinks++;
                    logger.warning(`Broken link found`, {
                      from: relativePath,
                      to: fullUrl,
                      status: linkResponse.status(),
                    });
                  }
                } catch (error) {
                  // Some links might be external or special cases
                }
              }
            }
          }
        }

        logger.info('Internal link validation completed', {
          pages_checked: pagesToCheck.length,
          links_checked: checkedLinks,
          broken_links: brokenLinks,
          broken_percentage: checkedLinks > 0 ? ((brokenLinks / checkedLinks) * 100).toFixed(2) : 0,
        });

        // Allow some broken links due to dynamic content
        expect(brokenLinks).toBeLessThan(5);
        expect(checkedLinks).toBeGreaterThan(0);
      },
    });
  });

  test('audit image alt text', async ({ page, request, baseURL }) => {
    await logger.span('Content Check: Image Alt Text', {
      attributes: { type: 'accessibility' },
      callback: async () => {
        // Check key pages for images
        const pagesToCheck = ['/', '/blog/', '/portfolio/', '/tools/'];

        let totalImages = 0;
        let imagesWithAlt = 0;
        let imagesWithoutAlt = 0;

        for (const pagePath of pagesToCheck) {
          const response = await page.goto(pagePath);
          expect(response?.status()).toBe(200);

          // Find all images
          const images = await page.locator('img').all();

          for (const img of images) {
            totalImages++;
            const alt = await img.getAttribute('alt');
            const src = await img.getAttribute('src');

            if (alt && alt.trim() !== '') {
              imagesWithAlt++;
            } else {
              imagesWithoutAlt++;
              logger.warning(`Missing alt text`, {
                page: pagePath,
                image_src: src,
              });
            }
          }
        }

        logger.info('Image alt text audit completed', {
          pages_checked: pagesToCheck.length,
          total_images: totalImages,
          images_with_alt: imagesWithAlt,
          images_without_alt: imagesWithoutAlt,
          alt_coverage_percentage:
            totalImages > 0 ? ((imagesWithAlt / totalImages) * 100).toFixed(2) : 100,
        });

        // Expect high alt text coverage
        const altCoverage = totalImages > 0 ? imagesWithAlt / totalImages : 1;
        expect(altCoverage).toBeGreaterThan(0.8); // 80% coverage minimum
        expect(imagesWithoutAlt).toBeLessThan(5); // Max 5 images without alt
      },
    });
  });

  test('check for stale content', async ({ page, request }) => {
    await logger.span('Content Check: Stale Content', {
      attributes: { type: 'freshness' },
      callback: async () => {
        // Check blog posts for very old dates
        const blogResponse = await page.goto('/blog/');
        expect(blogResponse?.status()).toBe(200);

        // Find blog post dates (this depends on your site structure)
        const dateElements = await page.locator('time[datetime], .date, .post-date').all();

        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        let stalePosts = 0;

        for (const dateElement of dateElements) {
          const dateText = await dateElement.textContent();
          const datetime = await dateElement.getAttribute('datetime');

          // Try to parse date
          const dateValue = datetime || dateText;
          if (dateValue) {
            const postDate = new Date(dateValue);
            if (postDate < oneYearAgo) {
              stalePosts++;
              logger.info('Stale content found', {
                date: postDate.toISOString(),
                age_years: ((now - postDate) / (1000 * 60 * 60 * 24 * 365)).toFixed(1),
              });
            }
          }
        }

        logger.info('Stale content check completed', {
          total_posts: dateElements.length,
          stale_posts: stalePosts,
          stale_percentage:
            dateElements.length > 0 ? ((stalePosts / dateElements.length) * 100).toFixed(2) : 0,
        });

        // This is informational - no hard failure unless too many stale posts
        expect(dateElements.length).toBeGreaterThan(0);
      },
    });
  });

  test('validate image optimization', async ({ page, request }) => {
    await logger.span('Content Check: Image Optimization', {
      attributes: { type: 'performance' },
      callback: async () => {
        // Check images on key pages
        const pagesToCheck = ['/', '/portfolio/'];

        let totalImages = 0;
        let oversizedImages = 0;
        let unoptimizedFormats = 0;

        for (const pagePath of pagesToCheck) {
          const response = await page.goto(pagePath);
          expect(response?.status()).toBe(200);

          const images = await page.locator('img').all();

          for (const img of images) {
            totalImages++;
            const src = await img.getAttribute('src');

            if (src && !src.startsWith('data:')) {
              // Check file extension
              const isOptimizedFormat = /\.(webp|avif)$/i.test(src);
              if (!isOptimizedFormat) {
                unoptimizedFormats++;
              }

              // Try to get image size (this is approximate)
              try {
                const imgResponse = await request.get(src);
                const contentLength = imgResponse.headers()['content-length'];
                if (contentLength) {
                  const sizeKB = parseInt(contentLength) / 1024;
                  // Flag images larger than 500KB
                  if (sizeKB > 500) {
                    oversizedImages++;
                    logger.warning('Large image found', {
                      src,
                      size_kb: sizeKB.toFixed(2),
                    });
                  }
                }
              } catch (error) {
                // External images or other issues
              }
            }
          }
        }

        logger.info('Image optimization check completed', {
          pages_checked: pagesToCheck.length,
          total_images: totalImages,
          oversized_images: oversizedImages,
          unoptimized_formats: unoptimizedFormats,
          optimization_score:
            totalImages > 0
              ? (
                  ((totalImages - oversizedImages - unoptimizedFormats) / totalImages) *
                  100
                ).toFixed(2)
              : 100,
        });

        // Expect reasonable optimization
        expect(oversizedImages).toBeLessThan(3);
        expect(totalImages).toBeGreaterThan(0);
      },
    });
  });

  test('report broken links in CI', async ({ page, request, baseURL }) => {
    await logger.span('Content Check: CI Link Report', {
      attributes: { type: 'ci_report' },
      callback: async () => {
        // This test generates a report for CI consumption
        const sitemapResponse = await request.get('/sitemap.xml');
        const sitemapBody = await sitemapResponse.text();

        const urlMatches = sitemapBody.match(/<loc>(https?:\/\/[^<]+)<\/loc>/g) || [];
        const urls = urlMatches.map(match => match.replace(/<loc>(https?:\/\/[^<]+)<\/loc>/, ''));

        const report = {
          timestamp: new Date().toISOString(),
          total_pages: urls.length,
          pages_checked: Math.min(urls.length, 3), // Limit for CI speed
          broken_links: [],
          missing_alt_text: [],
          optimization_issues: [],
        };

        // Check first 3 pages for CI report
        const pagesToCheck = urls.slice(0, 3);

        for (const url of pagesToCheck) {
          const relativePath = url.replace(baseURL, '');
          await page.goto(relativePath);

          // Check for broken links (simplified)
          const links = await page.locator('a[href^="/"]').all();
          for (const link of links.slice(0, 10)) {
            // Limit checks
            const href = await link.getAttribute('href');
            if (href) {
              try {
                const linkResponse = await request.get(href);
                if (linkResponse.status() >= 400) {
                  report.broken_links.push({
                    from: relativePath,
                    to: href,
                    status: linkResponse.status(),
                  });
                }
              } catch (error) {
                // Skip external or problematic links
              }
            }
          }

          // Check for missing alt text
          const images = await page.locator('img').all();
          for (const img of images.slice(0, 5)) {
            // Limit checks
            const alt = await img.getAttribute('alt');
            const src = await img.getAttribute('src');
            if (!alt || alt.trim() === '') {
              report.missing_alt_text.push({
                page: relativePath,
                image_src: src,
              });
            }
          }
        }

        // Log report for CI parsing
        console.log('CONTENT_VALIDATION_REPORT:');
        console.log(JSON.stringify(report, null, 2));

        logger.info('CI content validation report generated', {
          broken_links_count: report.broken_links.length,
          missing_alt_count: report.missing_alt_text.length,
          total_issues: report.broken_links.length + report.missing_alt_text.length,
        });

        // CI should fail if too many issues
        const totalIssues = report.broken_links.length + report.missing_alt_text.length;
        expect(totalIssues).toBeLessThan(10);
      },
    });
  });
});
