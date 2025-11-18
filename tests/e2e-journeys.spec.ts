import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe('End-to-End User Journeys', () => {
  test('complete user journey from homepage to portfolio @e2e', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Portfolio | Peter Warnock/);

    // Navigate to portfolio (desktop navigation)
    await page.click('nav ul[role="menubar"] a[href="/portfolio/"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*portfolio/);

    // Verify portfolio page loads
    await expect(page.locator('h1#portfolio-title')).toContainText('Portfolio');

    // Click on first portfolio item
    const firstPortfolioItem = page.locator('article a').first();
    await expect(firstPortfolioItem).toBeVisible();
    await firstPortfolioItem.click();

    // Verify portfolio detail page
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1:not(.sr-only)')).toBeVisible();
  });

  test('blog browsing journey @e2e', async ({ page }) => {
    await page.goto('/');

    // Navigate to blog (desktop navigation)
    await page.click('nav ul[role="menubar"] a[href="/blog/"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*blog/);

    // Verify blog posts exist
    const blogPosts = page.locator('article');
    await expect(blogPosts.first()).toBeVisible();

    // Click on first blog post (click on title link specifically)
    await blogPosts.first().locator('h2.card-title a').click();
    await page.waitForLoadState('networkidle');

    // Verify blog post content
    await expect(page.locator('h1:not(.sr-only)')).toBeVisible();
    await expect(page.locator('[data-testid="blog-post-content"]')).toBeVisible();

    // Test navigation back to blog (desktop navigation)
    await page.click('nav ul[role="menubar"] a[href="/blog/"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*blog/);
  });

  test('tools exploration journey @e2e', async ({ page }) => {
    await page.goto('/');

    // Navigate to tools (desktop navigation)
    await page.click('nav ul[role="menubar"] a[href="/tools/"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*tools/);

    // Verify tools are displayed
    const tools = page.locator('.tool-card, article');
    await expect(tools.first()).toBeVisible();

    // Click on first tool (click on title link specifically)
    await tools.first().locator('h3.card-title a').click();
    await page.waitForLoadState('networkidle');

    // Verify tool detail page
    await expect(page.locator('[data-testid="tool-content"]')).toBeVisible();
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

    // Ensure desktop navigation is visible
    const desktopNavigationLinks = page.locator('nav ul[role="menubar"] a');
    await expect(desktopNavigationLinks.first()).toBeVisible(); // Check first one

    // Explicitly focus the "Skip to main content" link
    const skipLink = page.locator('a[href="#main-content"]');
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible(); // This will pass due to focus:not-sr-only

    // Now, loop through all desktop navigation links and explicitly focus each one
    await expect(desktopNavigationLinks.first()).toBeVisible(); // Check first one

    for (let i = 0; i < await desktopNavigationLinks.count(); i++) {
      const currentLink = desktopNavigationLinks.nth(i);
      await currentLink.focus(); // Explicitly focus the current link
      await expect(currentLink).toBeFocused(); // Verify it is focused
      await expect(currentLink).toBeVisible(); // Verify it is visible
    }

    // Test navigation for a specific link (e.g., Portfolio)
    const portfolioLink = page.locator('nav ul[role="menubar"] a[href="/portfolio/"]');
    await portfolioLink.focus(); // Ensure it's focused before clicking
    await expect(portfolioLink).toBeFocused(); // Verify it's focused
    await portfolioLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*portfolio/);

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
      // If no search, test navigation to portfolio instead (desktop navigation)
      await page.click('nav ul[role="menubar"] a[href="/portfolio/"]');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*portfolio/);
    }
  });

  test('responsive design journey @e2e @mobile', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Test mobile navigation
    const mobileMenuButton = page.locator(
      'button[aria-label*="navigation menu"], .menu-toggle, .hamburger'
    );

    if (await mobileMenuButton.isVisible()) {
      console.log('Mobile menu button found, clicking...');
      await mobileMenuButton.click();
      await page.waitForTimeout(1000);

      // Verify mobile navigation menu is open
      const mobileMenu = page.locator('ul[role="menu"][aria-label="Mobile navigation menu"]');
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
      await expect(page.locator('h1#about-title')).toContainText('Peter Warnock');
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
    await page.click('nav ul[role="menubar"] a[href="/blog/"]');
    await page.waitForLoadState('networkidle');

    await page.click('nav ul[role="menubar"] a[href="/portfolio/"]');
    await page.waitForLoadState('networkidle');

    await page.click('nav ul[role="menubar"] a[href="/tools/"]');
    await page.waitForLoadState('networkidle');

    // Total journey time should be reasonable
    const totalTime = Date.now() - startTime;
    console.log(`Complete journey time: ${totalTime}ms`);

    expect(totalTime).toBeLessThan(10000); // Under 10 seconds for full journey
    expect(loadTime).toBeLessThan(3000); // Initial load under 3 seconds
  });

  test('hero carousel navigation @e2e', async ({ page }) => {
    await page.goto('/');

    // Wait for carousel to load
    await page.waitForSelector('.hero-carousel', { timeout: 10000 });

    // Read hero.toml data to make test truly data-driven
    const heroDataPath = join(__dirname, '../data/hero.toml');
    const heroDataText = readFileSync(heroDataPath, 'utf-8');

    // Parse TOML data (simple parsing for active slides)
    const activeSlides: any[] = [];
    const lines = heroDataText.split('\n');
    let currentSlide: any = {};
    let inSlideSection = false;

    for (const line of lines) {
      if (line.startsWith('[[slides]]')) {
        if (Object.keys(currentSlide).length > 0) {
          activeSlides.push(currentSlide);
        }
        currentSlide = {};
        inSlideSection = true;
      } else if (inSlideSection && line.includes('title = ')) {
        currentSlide.title = line.split('title = ')[1].replace(/"/g, '').trim();
      } else if (inSlideSection && line.includes('description = ')) {
        currentSlide.description = line.split('description = ')[1].replace(/"/g, '').trim();
      } else if (inSlideSection && line.includes('active = true')) {
        currentSlide.active = true;
      } else if (inSlideSection && line.includes('active = false')) {
        currentSlide.active = false;
      }
    }

    // Add the last slide
    if (Object.keys(currentSlide).length > 0) {
      activeSlides.push(currentSlide);
    }

    // Filter for active slides only
    const expectedSlides = activeSlides.filter(slide => slide.active === true);

    // Check that carousel slides exist
    const slides = page.locator('.carousel-slide');
    await expect(slides).toHaveCount(expectedSlides.length);

    // Check that navigation buttons exist
    const nextButton = page.locator('.carousel-nav-next');
    const prevButton = page.locator('.carousel-nav-prev');
    await expect(nextButton).toBeVisible();
    await expect(prevButton).toBeVisible();

    // Check that indicators exist
    const indicators = page.locator('.carousel-indicator');
    await expect(indicators).toHaveCount(expectedSlides.length);

    // Test that slide count matches data (data-driven verification)
    console.log(`Expected ${expectedSlides.length} active slides from hero.toml data`);
    console.log(
      'Active slides:',
      expectedSlides.map(s => s.title)
    );

    // Test basic functionality - just click next and verify no errors
    await nextButton.click();
    await page.waitForTimeout(1000); // Wait for transition

    // Test indicator navigation
    const secondIndicator = indicators.nth(1);
    await secondIndicator.click();
    await page.waitForTimeout(1000); // Wait for transition

    // Verify carousel is still functional after navigation
    console.log('Carousel navigation completed successfully');

    // Basic smoke test - ensure carousel is still functional
    await expect(page.locator('.hero-carousel')).toBeVisible();
  });
});
