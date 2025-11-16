package support

import (
	"fmt"
	"log"

	"github.com/playwright-community/playwright-go"
)

// Browser manages Playwright browser instance
type Browser struct {
	instance playwright.Browser
	page     playwright.Page
	context  playwright.BrowserContext
}

// NewBrowser creates a new browser instance
func NewBrowser() (*Browser, error) {
	pw, err := playwright.Run()
	if err != nil {
		return nil, fmt.Errorf("could not start Playwright: %w", err)
	}

	browser, err := pw.Chromium.Launch(playwright.BrowserTypeLaunchOptions{
		Headless: playwright.Bool(false), // Set to true for CI
	})
	if err != nil {
		return nil, fmt.Errorf("could not launch browser: %w", err)
	}

	context, err := browser.NewContext()
	if err != nil {
		return nil, fmt.Errorf("could not create browser context: %w", err)
	}

	page, err := context.NewPage()
	if err != nil {
		return nil, fmt.Errorf("could not create page: %w", err)
	}

	return &Browser{
		instance: browser,
		context:  context,
		page:     page,
	}, nil
}

// Close closes browser instance
func (b *Browser) Close() error {
	var lastErr error

	// Close page first if it exists
	if b.page != nil {
		if err := b.page.Close(); err != nil {
			log.Printf("Error closing page: %v", err)
			lastErr = err
		}
		b.page = nil
	}

	// Close browser context
	if b.context != nil {
		if err := b.context.Close(); err != nil {
			log.Printf("Error closing browser context: %v", err)
			lastErr = err
		}
		b.context = nil
	}

	// Close browser instance
	if b.instance != nil {
		if err := b.instance.Close(); err != nil {
			log.Printf("Error closing browser: %v", err)
			lastErr = err
		}
		b.instance = nil
	}

	return lastErr
}

// NavigateTo navigates to a specific URL
func (b *Browser) NavigateTo(url string) error {
	_, err := b.page.Goto(url, playwright.PageGotoOptions{
		WaitUntil: playwright.WaitUntilStateNetworkidle,
		Timeout:   playwright.Float(30000), // 30 second timeout
	})
	if err != nil {
		return fmt.Errorf("could not navigate to %s: %w", url, err)
	}
	return nil
}

// GetURL returns current page URL
func (b *Browser) GetURL() string {
	url := b.page.URL()
	return url
}

// ClickElement clicks an element by selector
func (b *Browser) ClickElement(selector string) error {
	err := b.page.Click(selector, playwright.PageClickOptions{
		Timeout: playwright.Float(5000), // 5 second timeout
	})
	if err != nil {
		return fmt.Errorf("could not click element %s: %w", selector, err)
	}
	return nil
}

// WaitForSelector waits for an element to be visible
func (b *Browser) WaitForSelector(selector string) error {
	_, err := b.page.WaitForSelector(selector, playwright.PageWaitForSelectorOptions{
		State:   playwright.WaitForSelectorStateVisible,
		Timeout: playwright.Float(5000), // 5 second timeout
	})
	if err != nil {
		return fmt.Errorf("element %s not found: %w", selector, err)
	}
	return nil
}

// IsElementVisible checks if an element is visible
func (b *Browser) IsElementVisible(selector string) (bool, error) {
	visible, err := b.page.IsVisible(selector)
	if err != nil {
		return false, fmt.Errorf("could not check visibility of %s: %w", selector, err)
	}
	return visible, nil
}

// TakeScreenshot takes a screenshot of current page
func (b *Browser) TakeScreenshot(path string) error {
	_, err := b.page.Screenshot(playwright.PageScreenshotOptions{
		Path:     playwright.String(path),
		FullPage: playwright.Bool(true),
	})
	if err != nil {
		return fmt.Errorf("could not take screenshot: %w", err)
	}
	return nil
}

// WaitForPageLoad waits for page to load completely
func (b *Browser) WaitForPageLoad() error {
	err := b.page.WaitForLoadState(playwright.PageWaitForLoadStateOptions{
		State: playwright.LoadStateNetworkidle,
	})
	if err != nil {
		return fmt.Errorf("page did not load completely: %w", err)
	}
	return nil
}

// GetPage returns Playwright page instance
func (b *Browser) GetPage() playwright.Page {
	return b.page
}

// SetViewport sets browser viewport dimensions
func (b *Browser) SetViewport(width, height int64) error {
	err := b.page.SetViewportSize(int(width), int(height))
	if err != nil {
		return fmt.Errorf("could not set viewport to %dx%d: %w", width, height, err)
	}
	return nil
}

// Evaluate executes JavaScript in the page context
func (b *Browser) Evaluate(jsScript string) (interface{}, error) {
	result, err := b.page.Evaluate(jsScript)
	if err != nil {
		return nil, fmt.Errorf("could not evaluate JavaScript: %w", err)
	}
	return result, nil
}

// WaitForFunction waits for a JavaScript function to return truthy
func (b *Browser) WaitForFunction(jsFunction string) error {
	_, err := b.page.WaitForFunction(jsFunction, nil, playwright.PageWaitForFunctionOptions{
		Timeout: playwright.Float(5000), // 5 second timeout
	})
	if err != nil {
		return fmt.Errorf("function did not return truthy value: %w", err)
	}
	return nil
}
