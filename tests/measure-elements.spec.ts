import { test, expect } from '@playwright/test';

test('measure combined height of logo and hero banner', async ({ page }) => {
  // Navigate to the page
  await page.goto('https://peterwarnock.com/build-your-own-radar/');

  // Wait for the elements to be visible
  const logo = page.locator('.input-sheet__logo');
  const heroBanner = page.locator('.hero-banner');

  await expect(logo).toBeVisible();
  // heroBanner might not be visible depending on the viewport or implementation,
  // but we should at least ensure it's attached if we want to measure it.
  // If it's a critical part of the layout, it should probably be visible.
  // Let's assume it should be visible for now, or at least attached.
  // If it's not visible, bounding box might be null.

  // Get bounding boxes
  const logoBox = await logo.boundingBox();
  const heroBannerBox = await heroBanner.boundingBox();

  if (!logoBox) {
    console.error('Could not find bounding box for .input-sheet__logo');
    return;
  }

  if (!heroBannerBox) {
    console.error('Could not find bounding box for .hero-banner');
    return;
  }

  const combinedHeight = logoBox.height + heroBannerBox.height;

  console.log(`Height of .input-sheet__logo: ${logoBox.height}px`);
  console.log(`Height of .hero-banner: ${heroBannerBox.height}px`);
  console.log(`Combined height: ${combinedHeight}px`);
});
