import { test, expect } from '@playwright/test';
import { injectAxe, getViolations } from 'axe-playwright';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('homepage visual regression @visual', async ({ page }) => {
    await page.goto('/');

    // Wait for page to fully load with timeout
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png');

    // Take specific component screenshots
    const hero = page.locator('section.hero');
    await expect(hero).toHaveScreenshot('hero-section.png');

    const navigation = page.locator('header nav');
    await expect(navigation).toHaveScreenshot('navigation.png');
  });

  test('blog page visual regression @visual', async ({ page }) => {
    await page.goto('/blog/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await expect(page).toHaveScreenshot('blog-page.png');
  });

  test('portfolio page visual regression @visual', async ({ page }) => {
    await page.goto('/portfolio/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await expect(page).toHaveScreenshot('portfolio-page.png');
  });

  test('tools page visual regression @visual', async ({ page }) => {
    await page.goto('/tools/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await expect(page).toHaveScreenshot('tools-page.png');
  });

  test('about page visual regression @visual', async ({ page }) => {
    await page.goto('/about/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await expect(page).toHaveScreenshot('about-page.png');
  });

  test('components page visual regression @visual', async ({ page }) => {
    await page.goto('/components/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await expect(page).toHaveScreenshot('components-page.png');
  });

  test('isolation demo page visual regression @visual', async ({ page }) => {
    await page.goto('/components/isolation-demo/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Target the main content area to crop out header/footer
    const content = page.locator('main');
    await expect(content).toHaveScreenshot('isolation-demo-page.png');
  });

  test('piano demo page visual regression @visual', async ({ page }) => {
    await page.goto('/components/piano-demo/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Target the main content area
    const content = page.locator('main');
    await expect(content).toHaveScreenshot('piano-demo-page.png');
  });

  test('iframe demo page visual regression @visual', async ({ page }) => {
    await page.goto('/components/iframe-demo/');
    // Wait for the smart-iframe to be loaded (it has a loader)
    await page.waitForSelector('smart-iframe', { state: 'visible' });
    // Wait extra time for iframe content or loader to stabilize
    await page.waitForTimeout(2000);

    // Target the main content area
    const content = page.locator('main');
    await expect(content).toHaveScreenshot('iframe-demo-page.png');
  });

  test('mobile responsive visual regression @visual @mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone dimensions
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await expect(page).toHaveScreenshot('homepage-mobile.png');
  });

  test('tablet responsive visual regression @visual @tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad dimensions
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await expect(page).toHaveScreenshot('homepage-tablet.png');
  });

  test('dark mode visual regression @visual @dark', async ({ page }) => {
    // Simulate dark mode preference
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await expect(page).toHaveScreenshot('homepage-dark.png');
  });

  test('theme switching visual regression @visual @theme', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Test light theme
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page).toHaveScreenshot('theme-light.png');

    // Test dark theme
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page).toHaveScreenshot('theme-dark.png');
  });
});

test.describe('Component Visual Regression', () => {
  test('theme selector component @visual @component', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    const themeSelector = page.locator('[data-testid="theme-selector"]');
    await expect(themeSelector).toBeVisible();

    // Test closed state
    await expect(themeSelector).toHaveScreenshot('theme-selector-closed.png');

    // Test open state
    await themeSelector.click();
    await expect(themeSelector).toHaveScreenshot('theme-selector-open.png');
  });

  test('navigation component @visual @component', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    const navigation = page.locator('header nav');
    await expect(navigation).toHaveScreenshot('navigation-component.png');
  });

  test('footer component @visual @component', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    const footer = page.locator('footer');
    await expect(footer).toHaveScreenshot('footer-component.png');
  });
});

test.describe('Accessibility Visual Tests', () => {
  test('accessibility with visual checks @a11y @visual', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Inject axe and run accessibility check
    await injectAxe(page);
    const violations = await getViolations(page);

    expect(violations).toEqual([]);

    // Take screenshot for manual review
    await expect(page).toHaveScreenshot('homepage-accessibility.png');
  });

  test('focus management visual test @a11y @visual', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page).toHaveScreenshot('focus-first-element.png');

    // Navigate through focusable elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100); // Brief pause for focus animation
    }

    await expect(page).toHaveScreenshot('focus-navigation.png');
  });
});
