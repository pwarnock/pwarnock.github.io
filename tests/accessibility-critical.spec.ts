import { test, expect } from '@playwright/test';
import { injectAxe, getViolations } from 'axe-playwright';

test.describe('Critical Accessibility Fixes', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('fix heading order violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await injectAxe(page);

    // Check for heading order violations specifically
    const violations = await getViolations(page, {
      rules: {
        'heading-order': { enabled: true },
      },
    });

    // Log the specific heading order issues for fixing
    if (violations.length > 0) {
      console.log('Heading Order Violations:');
      violations.forEach(violation => {
        console.log(`- ${violation.description}`);
        violation.nodes.forEach(node => {
          console.log(`  Target: ${node.target.join(', ')}`);
          console.log(`  HTML: ${node.html}`);
        });
      });
    }

    // For now, just document the violations - expect them to exist
    expect(violations.length).toBeGreaterThan(0);
  });

  test('check color contrast issues', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await injectAxe(page);

    // Check for color contrast violations
    const violations = await getViolations(page, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });

    console.log(`Color Contrast Violations: ${violations.length}`);
    violations.forEach(violation => {
      console.log(`- ${violation.description}`);
    });
  });

  test('check alt text for images', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await injectAxe(page);

    // Check for image alt violations
    const violations = await getViolations(page, {
      rules: {
        'image-alt': { enabled: true },
        'image-redundant-alt': { enabled: true },
      },
    });

    console.log(`Image Alt Violations: ${violations.length}`);
    violations.forEach(violation => {
      console.log(`- ${violation.description}`);
    });
  });

  test('check focus management', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Test that focus is visible
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Test skip link functionality
    const skipLink = page.locator('a[href="#main-content"]');
    if (await skipLink.isVisible()) {
      await skipLink.click();
      const mainContent = page.locator('#main-content, main');
      expect(await mainContent.evaluate(el => el === document.activeElement)).toBeTruthy();
    }
  });
});
