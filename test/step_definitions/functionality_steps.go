package step_definitions

import (
	"fmt"
	"strings"
	"time"

	"github.com/cucumber/godog"
	"pwarnock-tests/support"
)

// NavigationSteps implements navigation-related BDD steps
type NavigationSteps struct {
	testCtx *support.TestContext
	browser *support.Browser
}

// NewNavigationSteps creates a new NavigationSteps instance
func NewNavigationSteps(ctx *support.TestContext) *NavigationSteps {
	return &NavigationSteps{
		testCtx: ctx,
		browser: nil, // Will be set after browser creation
	}
}

// SetTestContext sets the test context (for delayed initialization)
func (ns *NavigationSteps) SetTestContext(ctx *support.TestContext) {
	ns.testCtx = ctx
}

// RegisterSteps registers all navigation steps with the scenario context
func (ns *NavigationSteps) RegisterSteps(ctx *godog.ScenarioContext) {
	ctx.Step(`^I navigate to "([^"]*)" page$`, ns.iNavigateToThePage)
	ctx.Step(`^I navigate to the "([^"]*)" page$`, ns.iNavigateToThePage)
	ctx.Step(`^the page should load successfully$`, ns.thePageShouldLoadSuccessfully)
	ctx.Step(`^I should see no accessibility violations$`, ns.iShouldSeeNoAccessibilityViolations)
	ctx.Step(`^I click "([^"]*)" link in navigation$`, ns.iClickTheLinkInNavigation)
	ctx.Step(`^I click the "([^"]*)" link in navigation$`, ns.iClickTheLinkInNavigation)
	ctx.Step(`^I should be on "([^"]*)" page$`, ns.iShouldBeOnPage)
	ctx.Step(`^I should be on "([^"]*)" page$`, ns.iShouldBeOnPage)
	ctx.Step(`^I should be on the "([^"]*)" page$`, ns.iShouldBeOnPage)
}

// iNavigateToThePage navigates to a specific page
func (ns *NavigationSteps) iNavigateToThePage(pageName string) error {
	// Create browser instance if not exists
	if ns.browser == nil {
		browser, err := support.NewBrowser()
		if err != nil {
			return fmt.Errorf("failed to create browser: %w", err)
		}
		ns.browser = browser
		// Store browser in test context so other step definitions can access it
		ns.testCtx.Browser = browser
	}

	// Navigate to page
	url := ns.testCtx.GetPageURL(pageName)
	err := ns.browser.NavigateTo(url)
	if err != nil {
		return fmt.Errorf("could not navigate to %s: %w", url, err)
	}

	return nil
}

// thePageShouldLoadSuccessfully verifies the page loaded without errors
func (ns *NavigationSteps) thePageShouldLoadSuccessfully() error {
	if ns.browser == nil {
		return fmt.Errorf("browser not initialized")
	}

	// Check if we have a valid page title
	page := ns.browser.GetPage()
	title, err := page.Title()
	if err != nil {
		return fmt.Errorf("could not get page title: %w", err)
	}

	if title == "" {
		return fmt.Errorf("page title is empty - page may not have loaded properly")
	}

	// Check if we're not on an error page
	url := ns.browser.GetURL()
	if url == "" {
		return fmt.Errorf("could not get current URL")
	}

	if strings.Contains(url, "404") || strings.Contains(url, "error") {
		return fmt.Errorf("page appears to be an error page: %s", url)
	}

	return nil
}

// iShouldSeeNoAccessibilityViolations performs basic accessibility check
func (ns *NavigationSteps) iShouldSeeNoAccessibilityViolations() error {
	if ns.browser == nil {
		return fmt.Errorf("browser not initialized")
	}

	page := ns.browser.GetPage()

	// Inject axe into the page
	_, err := page.Evaluate(`(function() {
		return new Promise((resolve, reject) => {
			if (typeof axe === 'undefined') {
				const script = document.createElement('script');
				script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js';
				script.onload = () => resolve();
				script.onerror = () => reject(new Error('Failed to load axe-core'));
				document.head.appendChild(script);
			} else {
				resolve();
			}
		});
	})()`)
	if err != nil {
		return fmt.Errorf("failed to inject axe: %w", err)
	}

	// Wait for axe to load
	err = ns.browser.WaitForFunction("() => typeof axe !== 'undefined'")
	if err != nil {
		return fmt.Errorf("axe did not load: %w", err)
	}

	// Run axe
	result, err := page.Evaluate(`axe.run(document, {
		reporter: 'v2',
		runOnly: {
			type: 'tag',
			values: ['wcag2a', 'wcag2aa', 'wcag21aa']
		}
	})`)
	if err != nil {
		return fmt.Errorf("failed to run axe: %w", err)
	}

	// Check for violations
	if resultMap, ok := result.(map[string]interface{}); ok {
		if violations, ok := resultMap["violations"].([]interface{}); ok {
			if len(violations) > 0 {
				// Use structured logging for accessibility violations
				if ns.testCtx.StructuredLogger != nil {
					ns.testCtx.StructuredLogger.LogAccessibility(violations)
				}
				return fmt.Errorf("found %d accessibility violations", len(violations))
			}
		}
	}

	return nil
}

// iClickTheLinkInNavigation clicks a navigation link
func (ns *NavigationSteps) iClickTheLinkInNavigation(linkText string) error {
	if ns.browser == nil {
		return fmt.Errorf("browser not initialized")
	}

	// Try different selectors for navigation links (mobile and desktop)
	selectors := []string{
		// Simple text-based selectors
		fmt.Sprintf(`text=%s`, linkText),
		// Desktop navigation (links in menu)
		fmt.Sprintf(`.menu-horizontal a:has-text("%s")`, linkText),
		fmt.Sprintf(`nav .menu-horizontal a:has-text("%s")`, linkText),
		// Mobile navigation (dropdown menu)
		fmt.Sprintf(`nav .dropdown-content a:has-text("%s")`, linkText),
		fmt.Sprintf(`.dropdown-content a:has-text("%s")`, linkText),
		// Fallback with href
		fmt.Sprintf(`a[href*="%s"]`, strings.ToLower(linkText)),
	}

	var lastErr error
	for _, selector := range selectors {
		// Wait for element to be available
		err := ns.browser.WaitForSelector(selector)
		if err == nil {
			// Element found, click it
			err = ns.browser.ClickElement(selector)
			if err == nil {
				// Wait a moment for navigation to start
				time.Sleep(100 * time.Millisecond)
				return nil
			}
		} else {
			lastErr = err
		}
	}

	return fmt.Errorf("could not find or click navigation link '%s': %w", linkText, lastErr)
}

// iShouldBeOnPage checks if we're on the expected page
func (ns *NavigationSteps) iShouldBeOnPage(pageName string) error {
	if ns.browser == nil {
		return fmt.Errorf("browser not initialized")
	}

	expectedURL := ns.testCtx.GetPageURL(pageName)
	currentURL := ns.browser.GetURL()
	if currentURL == "" {
		return fmt.Errorf("could not get current URL")
	}

	// Normalize URLs for comparison
	if !strings.HasSuffix(currentURL, "/") {
		currentURL += "/"
	}

	if !strings.Contains(currentURL, strings.TrimSuffix(expectedURL, "/")) {
		return fmt.Errorf("expected to be on %s but was on %s", expectedURL, currentURL)
	}

	return nil
}
