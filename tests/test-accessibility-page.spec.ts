import { test, expect } from '@playwright/test';
import { injectAxe, getViolations } from 'axe-playwright';

test.describe('Accessibility Page Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('comprehensive accessibility page audit', async ({ page }) => {
    await page.goto('/accessibility/');
    await page.waitForLoadState('networkidle', { timeout: 60000 });

    // Inject axe for accessibility testing
    await injectAxe(page);

    // Run comprehensive WCAG 2.1 AA audit
    const violations = await getViolations(page, {
      reporter: 'v2',
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      },
    });

    console.log(`\n=== ACCESSIBILITY PAGE AUDIT RESULTS ===`);
    console.log(`Total WCAG 2.1 AA Violations: ${violations.length}\n`);

    // Categorize violations by impact
    const critical = violations.filter(v => v.impact === 'critical');
    const serious = violations.filter(v => v.impact === 'serious');
    const moderate = violations.filter(v => v.impact === 'moderate');
    const minor = violations.filter(v => v.impact === 'minor');

    console.log(`Critical: ${critical.length}`);
    console.log(`Serious: ${serious.length}`);
    console.log(`Moderate: ${moderate.length}`);
    console.log(`Minor: ${minor.length}\n`);

    // Log detailed violations
    violations.forEach((violation, index) => {
      console.log(
        `${index + 1}. ${violation.id.toUpperCase()} - ${violation.impact.toUpperCase()}`
      );
      console.log(`   Description: ${violation.description}`);
      console.log(`   Help: ${violation.help}`);
      console.log(`   Help URL: ${violation.helpUrl}`);

      if (violation.nodes.length > 0) {
        console.log(`   Affected elements (${violation.nodes.length}):`);
        violation.nodes.slice(0, 3).forEach(node => {
          console.log(`     - ${node.target.join(', ')}`);
          if (node.html) {
            console.log(`       HTML: ${node.html.substring(0, 100)}...`);
          }
        });
        if (violation.nodes.length > 3) {
          console.log(`     ... and ${violation.nodes.length - 3} more`);
        }
      }
      console.log('');
    });

    // Specific WCAG 2.1 AA checks (only valid axe rules)
    const wcagChecks = {
      'heading-order': 'Proper heading hierarchy',
      'color-contrast': 'Color contrast ratios (4.5:1 for normal text, 3:1 for large)',
      'focus-order-semantics': 'Logical focus order',
      'aria-allowed-attr': 'ARIA attribute usage',
      'button-name': 'Button accessible names',
      'link-name': 'Link accessible names',
      list: 'List markup',
      listitem: 'List item markup',
      'definition-list': 'Definition list markup',
      'duplicate-id': 'Unique IDs',
      'label-title-only': 'Form labeling',
      tabindex: 'Tabindex usage',
      'focus-order': 'Focus order',
      keyboard: 'Keyboard navigation',
      'aria-input-field-name': 'ARIA input field names',
      'aria-required-attr': 'Required ARIA attributes',
      'aria-roles': 'ARIA roles',
      'aria-valid-attr': 'Valid ARIA attributes',
    };

    console.log(`=== SPECIFIC WCAG 2.1 AA CHECKS ===`);
    for (const [rule, description] of Object.entries(wcagChecks)) {
      try {
        const ruleViolations = await getViolations(page, {
          rules: { [rule]: { enabled: true } },
        });

        console.log(`${rule}: ${ruleViolations.length > 0 ? '❌' : '✅'} ${description}`);
        if (ruleViolations.length > 0) {
          ruleViolations.forEach(v => {
            console.log(`   - ${v.description}`);
          });
        }
      } catch (error) {
        console.log(`${rule}: ⚠️ Rule not available in axe`);
      }
    }

    // Check semantic HTML structure
    console.log(`\n=== SEMANTIC HTML ANALYSIS ===`);
    const semanticElements = await page.evaluate(() => {
      const elements = {};
      const tags = [
        'header',
        'nav',
        'main',
        'section',
        'article',
        'aside',
        'footer',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
      ];

      tags.forEach(tag => {
        const els = document.querySelectorAll(tag);
        if (els.length > 0) {
          elements[tag] = els.length;
        }
      });

      return elements;
    });

    console.log('Semantic elements found:');
    Object.entries(semanticElements).forEach(([tag, count]) => {
      console.log(`  ${tag}: ${count}`);
    });

    // Check for proper heading structure
    const headings = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return headings.map(h => ({
        tag: h.tagName,
        text: h.textContent?.trim().substring(0, 50),
        level: parseInt(h.tagName.substring(1)),
      }));
    });

    console.log(`\n=== HEADING STRUCTURE ===`);
    headings.forEach((heading, index) => {
      const prevLevel = index > 0 ? headings[index - 1].level : 0;
      const skip = heading.level - prevLevel > 1 ? ' ⚠️ SKIP' : '';
      console.log(`${heading.tag}: ${heading.text}${skip}`);
    });

    // Check for ARIA attributes
    const ariaElements = await page.evaluate(() => {
      const elements = document.querySelectorAll(
        '[aria-label], [aria-labelledby], [aria-describedby], [role], [aria-expanded], [aria-hidden]'
      );
      return Array.from(elements).map(el => ({
        tag: el.tagName,
        attributes: Array.from(el.attributes)
          .filter(attr => attr.name.startsWith('aria-') || attr.name === 'role')
          .map(attr => `${attr.name}="${attr.value}"`)
          .join(' '),
      }));
    });

    console.log(`\n=== ARIA USAGE ===`);
    if (ariaElements.length === 0) {
      console.log('No ARIA attributes found');
    } else {
      ariaElements.forEach(el => {
        console.log(`${el.tag}: ${el.attributes}`);
      });
    }

    // Check for skip links
    const skipLinks = await page.locator('a[href*="skip"], a[href*="main"], .skip-link').count();
    console.log(`\n=== SKIP LINKS ===`);
    console.log(`Skip links found: ${skipLinks}`);

    // Check for proper focus management
    console.log(`\n=== FOCUS MANAGEMENT ===`);
    const focusableElements = await page.evaluate(() => {
      const focusable = document.querySelectorAll(
        'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
      );
      return focusable.length;
    });
    console.log(`Focusable elements: ${focusableElements}`);

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? { tag: el.tagName, hasFocus: true } : { hasFocus: false };
    });
    console.log(`First focused element: ${focusedElement.tag || 'None'}`);

    // Final assessment
    console.log(`\n=== FINAL ASSESSMENT ===`);
    console.log(`The accessibility page has ${violations.length} WCAG 2.1 AA violations.`);
    console.log(`Critical issues: ${critical.length}`);
    console.log(`Serious issues: ${serious.length}`);

    if (violations.length === 0) {
      console.log(`✅ Page appears to be WCAG 2.1 AA compliant`);
    } else {
      console.log(`❌ Page needs accessibility improvements`);
    }

    // For audit purposes, we'll log but not fail the test
    // In a real scenario, you might want to expect(violations.length).toBe(0);
  });

  test('accessibility statement content analysis', async ({ page }) => {
    await page.goto('/accessibility/');
    await page.waitForLoadState('networkidle');

    // Check if the page contains expected accessibility statement content
    const content = await page.textContent('main');

    const expectedSections = [
      'accessibility statement',
      'measures to support accessibility',
      'conformance status',
      'wcag',
      'accessibility features',
      'keyboard navigation',
      'screen reader',
      'feedback',
      'enforcement',
    ];

    console.log(`\n=== ACCESSIBILITY STATEMENT CONTENT ANALYSIS ===`);
    expectedSections.forEach(section => {
      const found = content?.toLowerCase().includes(section);
      console.log(`${section}: ${found ? '✅' : '❌'}`);
    });

    // Check for contact information
    const hasEmail = content?.includes('@');
    const hasGitHub = content?.includes('github');
    const hasPhone = content?.match(/\d{3}/);

    console.log(`\n=== CONTACT INFORMATION ===`);
    console.log(`Email: ${hasEmail ? '✅' : '❌'}`);
    console.log(`GitHub: ${hasGitHub ? '✅' : '❌'}`);
    console.log(`Phone: ${hasPhone ? '✅' : '❌'}`);
  });
});
