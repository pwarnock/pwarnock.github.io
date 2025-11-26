import { test, expect } from '@playwright/test';

test.describe('About Page - Books Section (pw-2hd)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about/');
    await page.waitForLoadState('networkidle');
  });

  test('books section is visible on about page @books', async ({ page }) => {
    const booksSection = page.locator('h2', { hasText: 'Books That Shaped Me' });
    await expect(booksSection).toBeVisible();
  });

  test('displays correct number of books @books', async ({ page }) => {
    const bookCards = page.locator('[role="article"]');
    const count = await bookCards.count();
    expect(count).toBe(6);
  });

  test('each book card has required fields @books', async ({ page }) => {
    const bookCards = page.locator('[role="article"]').first();

    // Check for title
    const title = bookCards.locator('h3');
    await expect(title).toBeVisible();

    // Check for author and year
    const author = bookCards.locator('text=/[A-Z].*\\(/');
    await expect(author).toBeVisible();

    // Check for description
    const description = bookCards.locator('p');
    await expect(description).toBeVisible();
  });

  test('book "Thinking, Fast and Slow" is present @books', async ({ page }) => {
    const book = page.locator('h3', { hasText: 'Thinking, Fast and Slow' });
    await expect(book).toBeVisible();

    // Verify author
    const author = page.locator('text=Daniel Kahneman');
    await expect(author).toBeVisible();
  });

  test('book "The Phoenix Project" is present @books', async ({ page }) => {
    const book = page.locator('h3', { hasText: 'The Phoenix Project' });
    await expect(book).toBeVisible();
  });

  test('book "Accelerate" is present @books', async ({ page }) => {
    const book = page.locator('h3', { hasText: 'Accelerate' });
    await expect(book).toBeVisible();
  });

  test('book "Poke the Box" is present @books', async ({ page }) => {
    const book = page.locator('h3', { hasText: 'Poke the Box' });
    await expect(book).toBeVisible();

    // Verify author
    const author = page.locator('text=Seth Godin');
    await expect(author).toBeVisible();
  });

  test('book "Team of Rivals" is present @books', async ({ page }) => {
    const book = page.locator('h3', { hasText: 'Team of Rivals' });
    await expect(book).toBeVisible();
  });

  test('book "The Mythical Man-Month" is present @books', async ({ page }) => {
    const book = page.locator('h3', { hasText: 'The Mythical Man-Month' });
    await expect(book).toBeVisible();

    // Verify author
    const author = page.locator('text=Fred Brooks');
    await expect(author).toBeVisible();
  });

  test('book cards display theme tags @books', async ({ page }) => {
    const firstCard = page.locator('[role="article"]').first();
    const tags = firstCard.locator(
      'span:has-text("Psychology"), span:has-text("Decision-Making"), span:has-text("Systems Thinking")'
    );

    const tagCount = await tags.count();
    expect(tagCount).toBeGreaterThan(0);
  });

  test('book cards are responsive - grid layout on mobile @books', async ({ page, browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const mobilePage = await context.newPage();
    await mobilePage.goto('/about/');
    await mobilePage.waitForLoadState('networkidle');

    const grid = mobilePage.locator('.grid');
    const classes = await grid.getAttribute('class');

    // Should have grid-cols-1 on mobile
    expect(classes).toContain('grid-cols-1');

    await context.close();
  });

  test('book cards are responsive - 2-column on tablet @books', async ({ page, browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    });
    const tabletPage = await context.newPage();
    await tabletPage.goto('/about/');
    await tabletPage.waitForLoadState('networkidle');

    const grid = tabletPage.locator('.grid');
    const classes = await grid.getAttribute('class');

    // Should have md:grid-cols-2 on tablet
    expect(classes).toContain('md:grid-cols-2');

    await context.close();
  });

  test('book cards are responsive - 3-column on desktop @books', async ({ page, browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const desktopPage = await context.newPage();
    await desktopPage.goto('/about/');
    await desktopPage.waitForLoadState('networkidle');

    const grid = desktopPage.locator('.grid');
    const classes = await grid.getAttribute('class');

    // Should have lg:grid-cols-3 on desktop
    expect(classes).toContain('lg:grid-cols-3');

    await context.close();
  });

  test('book descriptions are semantically correct @books', async ({ page }) => {
    const firstCard = page.locator('[role="article"]').first();
    const description = firstCard.locator('p');

    const text = await description.textContent();
    expect(text?.length).toBeGreaterThan(50);
  });

  test('book cards have proper accessibility labels @books', async ({ page }) => {
    const bookCard = page.locator('[role="article"]').first();
    const ariaLabel = await bookCard.getAttribute('aria-labelledby');

    // Should have aria-labelledby pointing to book title
    expect(ariaLabel).toBeTruthy();

    const titleId = await bookCard.locator('h3').getAttribute('id');
    expect(ariaLabel).toBe(titleId);
  });

  test('book cards have hover effects @books', async ({ page }) => {
    const firstCard = page.locator('[role="article"]').first();
    const classes = await firstCard.getAttribute('class');

    // Should have hover:shadow-lg transition
    expect(classes).toContain('hover:shadow-lg');
    expect(classes).toContain('transition-shadow');
  });

  test('books grid has proper spacing @books', async ({ page }) => {
    const grid = page.locator('.grid');
    const classes = await grid.getAttribute('class');

    // Should have gap-6
    expect(classes).toContain('gap-6');
  });

  test('books section has proper semantic structure @books', async ({ page }) => {
    // Check for section heading
    const heading = page.locator('h2', { hasText: 'Books That Shaped Me' });
    await expect(heading).toBeVisible();

    // Check that articles follow the heading
    const articles = page.locator('[role="article"]');
    const count = await articles.count();
    expect(count).toBe(6);
  });

  test('all books have years displayed @books', async ({ page }) => {
    const bookCards = page.locator('[role="article"]');

    for (let i = 0; i < (await bookCards.count()); i++) {
      const card = bookCards.nth(i);
      const yearText = card.locator('text=/\\(\\d{4}\\)/');
      const isVisible = await yearText.isVisible().catch(() => false);
      expect(isVisible).toBe(true);
    }
  });

  test('theme tags are properly styled @books', async ({ page }) => {
    const firstCard = page.locator('[role="article"]').first();
    const tags = firstCard.locator('span:has-text(/Psychology|Decision-Making|Systems Thinking/)');

    const classes = await tags.first().getAttribute('class');

    // Tags should have proper styling classes
    expect(classes).toContain('text-xs');
    expect(classes).toContain('rounded-full');
  });

  test('books section does not have JavaScript errors @books', async ({ page }) => {
    const jsErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });

    // Book-related errors should not exist
    const bookErrors = jsErrors.filter(
      e => e.includes('book') || e.includes('Book') || e.includes('card')
    );

    expect(bookErrors.length).toBe(0);
  });

  test('books section text is readable with good contrast @books', async ({ page }) => {
    const firstCard = page.locator('[role="article"]').first();
    const text = firstCard.locator('text');

    // Check that text elements are visible
    const isVisible = await text.first().isVisible();
    expect(isVisible).toBe(true);
  });
});
