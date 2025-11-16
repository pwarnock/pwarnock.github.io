import { test, expect } from '@playwright/test';

interface PerformanceMetrics {
  domContentLoaded: number;
  loadComplete: number;
  firstByte: number;
  totalResources: number;
  memory: {
    used: number;
    total: number;
    limit: number;
  } | null;
}

interface WebVitals {
  LCP: number;
  FID: number;
  CLS: number;
  FCP: number;
}

interface BundleInfo {
  url: string;
  size: number;
  sizeKB: number;
}

interface ImageInfo {
  url: string;
  size: number;
  sizeKB: number;
  format: string;
}

test.describe('Performance Benchmarking', () => {
  test('homepage performance metrics @performance', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Core Web Vitals
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      return {
        // Load timing
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstByte: navigation.responseStart - navigation.requestStart,

        // Resource timing
        totalResources: performance.getEntriesByType('resource').length,

        // Memory usage (if available)
        memory: (performance as any).memory
          ? {
              used: (performance as any).memory.usedJSHeapSize,
              total: (performance as any).memory.totalJSHeapSize,
              limit: (performance as any).memory.jsHeapSizeLimit,
            }
          : null,
      };
    });

    console.log('Performance Metrics:', metrics);
    console.log('Total page load time:', loadTime, 'ms');

    // Performance assertions
    expect(loadTime).toBeLessThan(3000); // Page should load in under 3 seconds
    expect(metrics.firstByte).toBeLessThan(1000); // TTFB under 1 second
    expect(metrics.domContentLoaded).toBeLessThan(2000); // DOM ready under 2 seconds

    // Log results for benchmarking
    test.info().annotations.push({
      type: 'performance',
      description: `Load time: ${loadTime}ms, TTFB: ${metrics.firstByte}ms`,
    });
  });

  test('resource loading performance @performance', async ({ page }) => {
    const responses: any[] = [];

    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        headers: response.headers(),
        timing: response.request().timing(),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Analyze resource loading
    const resourceAnalysis = {
      totalRequests: responses.length,
      imageRequests: responses.filter(r => r.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)).length,
      cssRequests: responses.filter(r => r.url.match(/\.css$/i)).length,
      jsRequests: responses.filter(r => r.url.match(/\.js$/i)).length,
      failedRequests: responses.filter(r => r.status >= 400).length,
      totalSize: responses.reduce(
        (sum, r) => sum + (parseInt(r.headers['content-length']) || 0),
        0
      ),
    };

    console.log('Resource Analysis:', resourceAnalysis);

    // Resource performance assertions
    expect(resourceAnalysis.failedRequests).toBe(0);
    expect(resourceAnalysis.totalRequests).toBeLessThan(50); // Reasonable request count
    expect(resourceAnalysis.imageRequests).toBeLessThan(20); // Not too many images
  });

  test('Core Web Vitals @performance', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be fully interactive
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow for any lazy loading

    // Get Web Vitals metrics
    const webVitals = await page.evaluate(() => {
      return new Promise<WebVitals>(resolve => {
        // Simulate Web Vitals measurement
        const vitals: WebVitals = {
          LCP: 0, // Largest Contentful Paint
          FID: 0, // First Input Delay
          CLS: 0, // Cumulative Layout Shift
          FCP: 0, // First Contentful Paint
        };

        // FCP
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        if (fcpEntry) {
          vitals.FCP = fcpEntry.startTime;
        }

        // LCP (simplified measurement)
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.LCP = lastEntry.startTime;
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });

        // CLS (simplified measurement)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          vitals.CLS = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Return after a short delay to collect metrics
        setTimeout(() => resolve(vitals), 3000);
      });
    });

    console.log('Core Web Vitals:', webVitals);

    // Web Vitals assertions (based on Google's recommendations)
    expect(webVitals.FCP).toBeLessThan(1800); // First Contentful Paint < 1.8s
    expect(webVitals.LCP).toBeLessThan(2500); // Largest Contentful Paint < 2.5s
    expect(webVitals.CLS).toBeLessThan(0.1); // Cumulative Layout Shift < 0.1
  });

  test('bundle size analysis @performance', async ({ page }) => {
    const jsBundles: BundleInfo[] = [];
    const cssBundles: BundleInfo[] = [];

    page.on('response', async response => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';

      if (url.match(/\.js$/i) && contentType.includes('javascript')) {
        const buffer = await response.body();
        jsBundles.push({
          url,
          size: buffer.length,
          sizeKB: Math.round((buffer.length / 1024) * 100) / 100,
        });
      }

      if (url.match(/\.css$/i) && contentType.includes('css')) {
        const buffer = await response.body();
        cssBundles.push({
          url,
          size: buffer.length,
          sizeKB: Math.round((buffer.length / 1024) * 100) / 100,
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const totalJSSize = jsBundles.reduce((sum, bundle) => sum + bundle.size, 0);
    const totalCSSSize = cssBundles.reduce((sum, bundle) => sum + bundle.size, 0);

    console.log('JS Bundles:', jsBundles);
    console.log('CSS Bundles:', cssBundles);
    console.log('Total JS size:', Math.round(totalJSSize / 1024), 'KB');
    console.log('Total CSS size:', Math.round(totalCSSSize / 1024), 'KB');

    // Bundle size assertions
    expect(totalJSSize).toBeLessThan(500 * 1024); // JS under 500KB
    expect(totalCSSSize).toBeLessThan(100 * 1024); // CSS under 100KB
  });

  test('caching headers @performance', async ({ page }) => {
    const responses: any[] = [];

    page.on('response', response => {
      const headers = response.headers();
      responses.push({
        url: response.url(),
        cacheControl: headers['cache-control'],
        expires: headers.expires,
        etag: headers.etag,
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const staticResources = responses.filter(r =>
      r.url.match(/\.(css|js|png|jpg|jpeg|gif|webp|svg|woff2?)$/i)
    );

    const resourcesWithCaching = staticResources.filter(
      r =>
        r.cacheControl &&
        (r.cacheControl.includes('max-age') || r.cacheControl.includes('immutable'))
    );

    console.log(
      'Static resources with caching:',
      resourcesWithCaching.length,
      '/',
      staticResources.length
    );

    // At least 80% of static resources should have proper caching
    expect(resourcesWithCaching.length / staticResources.length).toBeGreaterThan(0.8);
  });

  test('image optimization @performance', async ({ page }) => {
    const images: ImageInfo[] = [];

    page.on('response', async response => {
      if (response.url().match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        const buffer = await response.body();
        images.push({
          url: response.url(),
          size: buffer.length,
          sizeKB: Math.round((buffer.length / 1024) * 100) / 100,
          format: response.url().split('.').pop()?.toLowerCase() || '',
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log('Images:', images);

    // Image optimization assertions
    images.forEach(img => {
      // No image should be larger than 500KB
      expect(img.sizeKB).toBeLessThan(500);

      // Prefer modern formats
      if (img.format === 'webp') {
        console.log(`✅ Modern format: ${img.url}`);
      }
    });

    // Total image size should be reasonable
    const totalImageSize = images.reduce((sum, img) => sum + img.size, 0);
    expect(totalImageSize).toBeLessThan(2 * 1024 * 1024); // Under 2MB total
  });
});
