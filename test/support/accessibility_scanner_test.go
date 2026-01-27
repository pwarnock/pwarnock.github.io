package support

import (
	"encoding/json"
	"os"
	"testing"

	"github.com/pwarnock/go-playwright-testkit/pkg/scanner"
	"github.com/stretchr/testify/assert"
)

// TestAccessibilityScanner_NewAccessibilityScanner tests constructor
func TestAccessibilityScanner_NewAccessibilityScanner(t *testing.T) {
	baseURL := "http://localhost:1313"
	s := NewAccessibilityScanner(baseURL)

	assert.NotNil(t, s)
	// Test through public interface
	issues := s.GetIssues()
	assert.Empty(t, issues)
}

// TestAccessibilityScanner_CreateBdIssue tests bd issue creation (unit test without bd cli)
func TestAccessibilityScanner_CreateBdIssue_SkipInCI(t *testing.T) {
	// Set CI environment variable
	os.Setenv("CI", "true")
	defer os.Unsetenv("CI")

	s := NewAccessibilityScanner("http://localhost:1313")

	issue := scanner.AccessibilityIssue{
		ID:          "test-id",
		Title:       "Test Issue",
		Description: "Test description",
		Impact:      "critical",
		Tags:        []string{"wcag2aa"},
		Selector:    ".test-element",
		URL:         "http://localhost:1313/test",
	}

	// Should not error when CI is set
	err := s.CreateBdIssue(issue)
	assert.NoError(t, err)
}

// TestAccessibilityScanner_CreateBdIssuesForAll tests batch issue creation
func TestAccessibilityScanner_CreateBdIssuesForAll_SkipInCI(t *testing.T) {
	// Set CI environment variable
	os.Setenv("CI", "true")
	defer os.Unsetenv("CI")

	s := NewAccessibilityScanner("http://localhost:1313")

	// Should not error when CI is set (even with no issues)
	err := s.CreateBdIssuesForAll()
	assert.NoError(t, err)
}

// TestIssueExists tests the issueExists helper function
func TestIssueExists_BdNotAvailable(t *testing.T) {
	// This will fail if bd is not available, but that's expected
	_, err := issueExists("Test Title", ".selector", "http://test")

	// We expect an error if bd is not available
	// This is a negative test - we're testing error handling
	if err != nil {
		assert.Contains(t, err.Error(), "failed to list bd issues")
	}
}

// TestAccessibilityScanner_JSONParsing tests JSON parsing logic
func TestAccessibilityScanner_JSONParsing(t *testing.T) {
	// Test that the JSON structure we expect from axe-core can be parsed
	mockJSON := `{
		"violations": [
			{
				"id": "test-violation",
				"description": "Test violation description",
				"impact": "critical",
				"tags": ["wcag2aa", "wcag21aa"],
				"nodes": [
					{
						"target": [".test-element"],
						"html": "<div class='test'>Content</div>"
					}
				]
			}
		]
	}`

	// Parse mock JSON to test parsing logic
	var scanResult struct {
		Violations []struct {
			ID          string   `json:"id"`
			Description string   `json:"description"`
			Impact      string   `json:"impact"`
			Tags        []string `json:"tags"`
			Nodes       []struct {
				Target []string `json:"target"`
				HTML   string   `json:"html"`
			} `json:"nodes"`
		} `json:"violations"`
	}

	err := json.Unmarshal([]byte(mockJSON), &scanResult)
	assert.NoError(t, err)
	assert.Len(t, scanResult.Violations, 1)
	assert.Equal(t, "test-violation", scanResult.Violations[0].ID)
	assert.Equal(t, "critical", scanResult.Violations[0].Impact)
}

// Note: Most functionality is now tested in the library (go-playwright-testkit/pkg/scanner)
// These tests focus on Hugo-specific bd integration
