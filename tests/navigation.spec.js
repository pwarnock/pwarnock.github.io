import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Navigation and Accessibility', () => {
  test('should navigate to the blog page and have no detectable a11y violations on the homepage', async ({
    page,
  }) => {
    // Navigate to the home page
    await page.goto('/');
    await injectAxe(page);

    // Run accessibility check on the home page
    await checkA11y(page);

    // Find and click the 'Blog' link in the navigation
    await page.getByRole('navigation').getByRole('link', { name: 'Blog' }).click();

    // Verify the URL is correct
    await expect(page).toHaveURL(/.*\/blog/);
  });

  test('should navigate to the portfolio page', async ({ page }) => {
    await page.goto('/');
    await page.locator('.navbar-center').getByRole('link', { name: 'Portfolio' }).click();
    await expect(page).toHaveURL(/.*\/portfolio/);
  });
});
