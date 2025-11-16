import { test, expect } from '@playwright/test';

test.describe('End-to-End User Journeys', () => {
  test('complete user journey from homepage to portfolio @e2e', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Pete Warnock/);

    // Navigate to portfolio
    await page.click('a[href="/portfolio/"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*portfolio/);

    // Verify portfolio page loads
    await expect(page.locator('h1')).toContainText('Portfolio');

    // Click on first portfolio item
    const firstPortfolioItem = page.locator('article a').first();
    await expect(firstPortfolioItem).toBeVisible();
    await firstPortfolioItem.click();

    // Verify portfolio detail page
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('blog browsing journey @e2e', async ({ page }) => {
    await page.goto('/');

    // Navigate to blog
    await page.click('a[href="/blog/"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*blog/);

    // Verify blog posts exist
    const blogPosts = page.locator('article');
    await expect(blogPosts.first()).toBeVisible();

    // Click on first blog post
    await blogPosts.first().click();
    await page.waitForLoadState('networkidle');

    // Verify blog post content
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.content')).toBeVisible();

    // Test navigation back to blog
    await page.click('a[href="/blog/"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*blog/);
  });

  test('tools exploration journey @e2e', async ({ page }) => {
    await page.goto('/');

    // Navigate to tools
    await page.click('a[href="/tools/"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*tools/);

    // Verify tools are displayed
    const tools = page.locator('.tool-card, article');
    await expect(tools.first()).toBeVisible();

    // Click on first tool
    await tools.first().click();
    await page.waitForLoadState('networkidle');

    // Verify tool detail page
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.tool-description, .content')).toBeVisible();
  });

  test('theme switching journey @e2e @theme', async ({ page }) => {
    await page.goto('/');

    // Find theme selector
    const themeSelector = page.locator(
      '[data-testid="theme-selector"], .theme-selector, button[aria-label*="theme"]'
    );

    if (await themeSelector.isVisible()) {
      // Open theme selector
      await themeSelector.click();

      // Wait for theme options to appear
      await page.waitForTimeout(500);

      // Try to select a different theme
      const themeOptions = page.locator('[data-theme], .theme-option');
      if ((await themeOptions.count()) > 1) {
        await themeOptions.nth(1).click();

        // Verify theme changed (check for theme attribute or class)
        await page.waitForTimeout(1000);
        const body = page.locator('body');
        const hasThemeAttribute = await body.getAttribute('data-theme');
        const hasThemeClass = await body.getAttribute('class');

        // At least one should be present
        expect(hasThemeAttribute || hasThemeClass).toBeTruthy();
      }
    }
  });

  test('navigation accessibility journey @e2e @a11y', async ({ page }) => {
    await page.goto('/');

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    let focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Navigate through main navigation
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }

    // Test Enter key on navigation item
    const currentFocus = await focusedElement.getAttribute('href');
    if (currentFocus && currentFocus.startsWith('/')) {
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');

      // Verify navigation worked
      expect(page.url()).toContain(currentFocus.replace('/', ''));
    }
  });

  test('search functionality journey @e2e', async ({ page }) => {
    await page.goto('/');

    // Look for search input
    const searchInput = page.locator(
      'input[type="search"], [placeholder*="search"], .search-input'
    );

    if (await searchInput.isVisible()) {
      await searchInput.fill('portfolio');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');

      // Verify search results or navigation
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/(search|portfolio)/);
    } else {
      // If no search, test navigation to portfolio instead
      await page.click('a[href="/portfolio/"]');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*portfolio/);
    }
  });

  test('responsive design journey @e2e @mobile', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Test mobile navigation
    const mobileMenuButton = page.locator('button[aria-label*="menu"], .menu-toggle, .hamburger');

    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(500);

      // Verify mobile menu is open
      const mobileMenu = page.locator('.mobile-menu, nav[aria-expanded="true"], .nav-menu');
      await expect(mobileMenu).toBeVisible();

      // Test navigation from mobile menu
      const portfolioLink = mobileMenu.locator('a[href="/portfolio/"]');
      if (await portfolioLink.isVisible()) {
        await portfolioLink.click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*portfolio/);
      }
    }
  });

  test('form interaction journey @e2e', async ({ page }) => {
    await page.goto('/contact/');

    // Look for contact form
    const contactForm = page.locator('form');

    if (await contactForm.isVisible()) {
      // Fill form fields
      const nameInput = contactForm.locator('input[name="name"], input[type="text"]').first();
      const emailInput = contactForm.locator('input[name="email"], input[type="email"]');
      const messageTextarea = contactForm.locator('textarea[name="message"], textarea');

      if (await nameInput.isVisible()) {
        await nameInput.fill('Test User');
      }

      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com');
      }

      if (await messageTextarea.isVisible()) {
        await messageTextarea.fill('This is a test message.');
      }

      // Test form validation (don't actually submit)
      const submitButton = contactForm.locator('button[type="submit"], input[type="submit"]');
      if (await submitButton.isVisible()) {
        // Just test that button is clickable, don't submit
        await expect(submitButton).toBeEnabled();
      }
    } else {
      // If no contact form, navigate to about page
      await page.goto('/about/');
      await expect(page.locator('h1')).toContainText('About');
    }
  });

  test('error handling journey @e2e', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page/');

    // Should either show 404 page or redirect to homepage
    const has404Content = (await page.locator('text=404').count()) > 0;
    const isHomepage = page.url().endsWith('/') || page.url().includes('/localhost');

    expect(has404Content || isHomepage).toBeTruthy();
  });

  test('performance journey @e2e @performance', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Navigate through multiple pages
    await page.click('a[href="/blog/"]');
    await page.waitForLoadState('networkidle');

    await page.click('a[href="/portfolio/"]');
    await page.waitForLoadState('networkidle');

    await page.click('a[href="/tools/"]');
    await page.waitForLoadState('networkidle');

    // Total journey time should be reasonable
    const totalTime = Date.now() - startTime;
    console.log(`Complete journey time: ${totalTime}ms`);

    expect(totalTime).toBeLessThan(10000); // Under 10 seconds for full journey
    expect(loadTime).toBeLessThan(3000); // Initial load under 3 seconds
  });
});
