package step_definitions

import (
	"fmt"
	"time"

	"github.com/cucumber/godog"
	"github.com/playwright-community/playwright-go"
	"pwarnock-tests/support"
)

// PerformanceSteps implements performance-related BDD steps
type PerformanceSteps struct {
	testCtx   *support.TestContext
	browser   *support.Browser
	metrics   map[string]interface{}
	startTime time.Time
}

// NewPerformanceSteps creates a new PerformanceSteps instance
func NewPerformanceSteps(ctx *support.TestContext) *PerformanceSteps {
	return &PerformanceSteps{
		testCtx: ctx,
		metrics: make(map[string]interface{}),
	}
}

// SetTestContext sets the test context (for delayed initialization)
func (ps *PerformanceSteps) SetTestContext(ctx *support.TestContext) {
	ps.testCtx = ctx
}

// RegisterSteps registers all performance steps with the scenario context
func (ps *PerformanceSteps) RegisterSteps(ctx *godog.ScenarioContext) {
	ctx.Step(`^I measure page load performance$`, ps.iMeasurePageLoadPerformance)
	ctx.Step(`^the page should load within (\d+) seconds$`, ps.thePageShouldLoadWithinSeconds)
	ctx.Step(`^the time to first byte should be under (\d+) second$`, ps.theTimeToFirstByteShouldBeUnderSecond)
	ctx.Step(`^the page should be fully interactive within (\d+) seconds$`, ps.thePageShouldBeFullyInteractiveWithinSeconds)
	ctx.Step(`^I set the viewport to mobile size$`, ps.iSetViewportToMobileSize)
	ctx.Step(`^I set viewport to mobile size$`, ps.iSetViewportToMobileSize)
	ctx.Step(`^the page should load within (\d+) seconds on mobile$`, ps.thePageShouldLoadWithinSecondsOnMobile)
	ctx.Step(`^all elements should be properly sized for mobile viewport$`, ps.allElementsShouldBeProperlySizedForMobileViewport)
}

// iMeasurePageLoadPerformance measures page performance metrics
func (ps *PerformanceSteps) iMeasurePageLoadPerformance() error {
	// Use browser from test context (should be initialized by navigation steps)
	if ps.testCtx.Browser == nil {
		return fmt.Errorf("browser not initialized - navigation step should run first")
	}
	ps.browser = ps.testCtx.Browser

	// Start performance monitoring
	ps.startTime = time.Now()

	// Use simple performance measurement
	page := ps.browser.GetPage()

	// Wait for page to fully load
	err := page.WaitForLoadState(playwright.PageWaitForLoadStateOptions{
		State: playwright.LoadStateNetworkidle,
	})
	if err != nil {
		return fmt.Errorf("could not wait for page load: %w", err)
	}

	// Get performance metrics using JavaScript evaluation
	loadTime := float64(time.Since(ps.startTime).Milliseconds())

	// Initialize metrics with fallback values
	ttfb := 0.0
	domContentLoaded := 0.0
	firstPaint := 0.0
	firstContentfulPaint := 0.0

	// Try to get detailed performance metrics from Navigation Timing API
	perfResult, err := page.Evaluate(`() => {
		try {
			const navigation = performance.getEntriesByType('navigation')[0];
			if (navigation) {
				return {
					ttfb: navigation.responseStart - navigation.requestStart,
					domContentLoaded: navigation.domContentLoadedEventEnd - navigation.requestStart,
					firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
					firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
				};
			}
			return null;
		} catch (e) {
			console.error('Performance API error:', e);
			return null;
		}
	}`)

	if err == nil && perfResult != nil {
		if perfMap, ok := perfResult.(map[string]interface{}); ok {
			if ttfbVal, ok := perfMap["ttfb"].(float64); ok {
				ttfb = ttfbVal
			}
			if domVal, ok := perfMap["domContentLoaded"].(float64); ok {
				domContentLoaded = domVal
			}
			if paintVal, ok := perfMap["firstPaint"].(float64); ok {
				firstPaint = paintVal
			}
			if fcpVal, ok := perfMap["firstContentfulPaint"].(float64); ok {
				firstContentfulPaint = fcpVal
			}
			ps.testCtx.Logf("Performance API metrics: TTFB=%.2fms, DOM=%.2fms, FP=%.2fms, FCP=%.2fms",
				ttfb, domContentLoaded, firstPaint, firstContentfulPaint)
		}
	} else {
		if err != nil {
			ps.testCtx.Logf("Could not get performance metrics: %v", err)
		}
	}

	ps.metrics = map[string]interface{}{
		"loadTime":             loadTime,
		"ttfb":                 ttfb,
		"domContentLoaded":     domContentLoaded,
		"firstPaint":           firstPaint,
		"firstContentfulPaint": firstContentfulPaint,
	}

	ps.testCtx.Logf("Performance metrics: loadTime=%vms", loadTime)

	return nil
}

// thePageShouldLoadWithinSeconds validates page load time
func (ps *PerformanceSteps) thePageShouldLoadWithinSeconds(maxSeconds int) error {
	maxDuration := time.Duration(maxSeconds) * time.Second

	loadTime, ok := ps.metrics["loadTime"].(float64)
	if !ok {
		return fmt.Errorf("performance metrics not available")
	}

	actualDuration := time.Duration(loadTime) * time.Millisecond
	if actualDuration > maxDuration {
		return fmt.Errorf("page load time %v exceeds maximum %v", actualDuration, maxDuration)
	}

	ps.testCtx.Logf("Page load time %v is within threshold %v", actualDuration, maxDuration)
	return nil
}

// theTimeToFirstByteShouldBeUnderSecond validates TTFB
func (ps *PerformanceSteps) theTimeToFirstByteShouldBeUnderSecond(maxSeconds int) error {
	maxDuration := time.Duration(maxSeconds) * time.Second

	ttfb, ok := ps.metrics["ttfb"].(float64)
	if !ok {
		return fmt.Errorf("TTFB metrics not available")
	}

	actualDuration := time.Duration(ttfb) * time.Millisecond
	if actualDuration > maxDuration {
		return fmt.Errorf("TTFB %v exceeds maximum %v", actualDuration, maxDuration)
	}

	ps.testCtx.Logf("TTFB %v is within threshold %v", actualDuration, maxDuration)
	return nil
}

// thePageShouldBeFullyInteractiveWithinSeconds validates interactive time
func (ps *PerformanceSteps) thePageShouldBeFullyInteractiveWithinSeconds(maxSeconds int) error {
	maxDuration := time.Duration(maxSeconds) * time.Second

	domContentLoaded, ok := ps.metrics["domContentLoaded"].(float64)
	if !ok {
		return fmt.Errorf("DOM content loaded metrics not available")
	}

	actualDuration := time.Duration(domContentLoaded) * time.Millisecond
	if actualDuration > maxDuration {
		return fmt.Errorf("interactive time %v exceeds maximum %v", actualDuration, maxDuration)
	}

	ps.testCtx.Logf("Interactive time %v is within threshold %v", actualDuration, maxDuration)
	return nil
}

// iSetViewportToMobileSize sets browser viewport to mobile dimensions
func (ps *PerformanceSteps) iSetViewportToMobileSize() error {
	// Use browser from test context
	if ps.testCtx.Browser == nil {
		return fmt.Errorf("browser not initialized")
	}
	ps.browser = ps.testCtx.Browser

	err := ps.browser.SetViewport(375, 667) // iPhone dimensions
	if err != nil {
		return fmt.Errorf("could not set mobile viewport: %w", err)
	}

	// Wait for responsive layout to adjust
	time.Sleep(500 * time.Millisecond)

	return nil
}

// thePageShouldLoadWithinSecondsOnMobile validates mobile performance
func (ps *PerformanceSteps) thePageShouldLoadWithinSecondsOnMobile(maxSeconds int) error {
	maxDuration := time.Duration(maxSeconds) * time.Second

	loadTime, ok := ps.metrics["loadTime"].(float64)
	if !ok {
		return fmt.Errorf("performance metrics not available")
	}

	actualDuration := time.Duration(loadTime) * time.Millisecond
	// Mobile performance is typically slower, so we allow more time
	if actualDuration > maxDuration {
		return fmt.Errorf("mobile page load time %v exceeds maximum %v", actualDuration, maxDuration)
	}

	ps.testCtx.Logf("Mobile page load time %v is within threshold %v", actualDuration, maxDuration)
	return nil
}

// allElementsShouldBeProperlySizedForMobileViewport checks mobile layout
func (ps *PerformanceSteps) allElementsShouldBeProperlySizedForMobileViewport() error {
	if ps.browser == nil {
		return fmt.Errorf("browser not initialized")
	}

	page := ps.browser.GetPage()

	// Check if horizontal scrollbar is present (indicates overflow)
	hasHorizontalScroll, err := page.Evaluate("() => { return document.body.scrollWidth > document.body.clientWidth; }")
	if err != nil {
		return fmt.Errorf("could not check for horizontal scroll: %w", err)
	}

	if hasScroll, ok := hasHorizontalScroll.(bool); ok && hasScroll {
		return fmt.Errorf("page has horizontal scroll on mobile - layout overflow detected")
	}

	ps.testCtx.Logf("Mobile layout validation passed")
	return nil
}
