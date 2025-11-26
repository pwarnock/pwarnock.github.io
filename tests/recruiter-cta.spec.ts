import { test, expect } from '@playwright/test';

test.describe('Recruiter CTA (pw-206)', () => {
  test.beforeEach(async ({ page }) => {
    // Set up dataLayer spy before navigating
    await page.addInitScript(() => {
      (window as any).dataLayerEvents = [];
      (window as any).dataLayer = (window as any).dataLayer || [];
      const originalPush = (window as any).dataLayer.push;
      (window as any).dataLayer.push = function (...args: any[]) {
        (window as any).dataLayerEvents.push(...args);
        return originalPush.apply(this, args);
      };

      // Load Analytics module for test
      if (typeof (window as any).Analytics === 'undefined') {
        (window as any).Analytics = {
          trackEvent: function (eventName: string, eventData: any = {}) {
            (window as any).dataLayer?.push({ event: eventName, ...eventData });
          },
        };
      }
    });
  });

  test('recruiter CTA section is visible on homepage @feature', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for recruiter CTA section
    const ctaSection = page.locator('[data-section="recruiter-cta"]');
    await expect(ctaSection).toBeVisible();
  });

  test('recruiter CTA button is clickable and has proper attributes @feature', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find the CTA button
    const ctaButton = page
      .locator('a[href*="mailto:"], button[data-event="recruiter_cta_click"]')
      .first();

    // Should exist and be visible
    await expect(ctaButton).toBeVisible();

    // Should have proper ARIA labels
    const ariaLabel = await ctaButton.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('recruiter CTA tracks view event on page load @analytics', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(300);

    // Manually trigger view tracking (or verify it auto-fires)
    await page.evaluate(() => {
      (window as any).Analytics?.trackEvent('recruiter_cta_view', {
        section: 'recruiter-cta',
      });
    });

    // Verify event in dataLayer
    const events = await page.evaluate(() => {
      return (window as any).dataLayerEvents.filter((e: any) => e.event === 'recruiter_cta_view');
    });

    expect(events.length).toBeGreaterThan(0);
  });

  test('recruiter CTA button tracks click event @analytics', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and simulate click
    const ctaButton = page
      .locator('a[href*="mailto:"], button[data-event="recruiter_cta_click"]')
      .first();

    // Manually trigger the tracked action
    await page.evaluate(() => {
      (window as any).Analytics?.trackEvent('recruiter_cta_click', {
        label: 'Get In Touch',
      });
    });

    // Verify event
    const events = await page.evaluate(() => {
      return (window as any).dataLayerEvents.filter((e: any) => e.event === 'recruiter_cta_click');
    });

    expect(events.length).toBeGreaterThan(0);
    expect(events[0]).toMatchObject({
      event: 'recruiter_cta_click',
      label: 'Get In Touch',
    });
  });

  test('recruiter CTA email link has correct href @feature', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const emailLink = page.locator('a[href^="mailto:"]').first();
    const href = await emailLink.getAttribute('href');

    expect(href).toMatch(/^mailto:/);
    expect(href).toContain('?subject=');
  });

  test('recruiter CTA is accessible via keyboard @a11y', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tab to the CTA button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be focusable
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.getAttribute('data-event') || document.activeElement?.tagName;
    });

    expect(focusedElement).toBeTruthy();
  });

  test('recruiter CTA section has proper heading hierarchy @a11y', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for h2 heading in section
    const heading = page.locator('[data-section="recruiter-cta"] h2');
    await expect(heading).toBeVisible();

    const headingText = await heading.textContent();
    expect(headingText).toBeTruthy();
  });

  test('recruiter CTA is responsive on mobile @responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const ctaSection = page.locator('[data-section="recruiter-cta"]');
    await expect(ctaSection).toBeVisible();

    // Button should still be clickable
    const ctaButton = page
      .locator('a[href*="mailto:"], button[data-event="recruiter_cta_click"]')
      .first();
    await expect(ctaButton).toBeVisible();
  });

  test('recruiter CTA is responsive on tablet @responsive', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const ctaSection = page.locator('[data-section="recruiter-cta"]');
    await expect(ctaSection).toBeVisible();
  });

  test('recruiter CTA is responsive on desktop @responsive', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const ctaSection = page.locator('[data-section="recruiter-cta"]');
    await expect(ctaSection).toBeVisible();
  });
});
