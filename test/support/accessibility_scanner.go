package support

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/pwarnock/go-playwright-testkit/pkg/scanner"
)

// AccessibilityScanner wraps the library scanner with bd-specific functionality
type AccessibilityScanner struct {
	*scanner.AccessibilityScanner
}

// NewAccessibilityScanner creates a new accessibility scanner
func NewAccessibilityScanner(baseURL string) *AccessibilityScanner {
	return &AccessibilityScanner{
		AccessibilityScanner: scanner.NewAccessibilityScanner(baseURL),
	}
}

// issueExists checks if an issue with the same content already exists in bd
func issueExists(title string, selector string, url string) (bool, error) {
	cmd := exec.Command("bd", "list", "--json")
	output, err := cmd.Output()
	if err != nil {
		return false, fmt.Errorf("failed to list bd issues: %w", err)
	}

	var issues []map[string]interface{}
	if err := json.Unmarshal(output, &issues); err != nil {
		return false, fmt.Errorf("failed to parse bd issues: %w", err)
	}

	// Check if we have an open issue with the same title
	for _, issue := range issues {
		if issueTitle, ok := issue["title"].(string); ok {
			if issueTitle == title {
				if status, ok := issue["status"].(string); ok && status != "closed" {
					return true, nil
				}
			}
		}
	}

	return false, nil
}

// CreateBdIssue creates a bd issue for accessibility problems
func (as *AccessibilityScanner) CreateBdIssue(issue scanner.AccessibilityIssue) error {
	// Skip bd creation in CI environment
	if os.Getenv("CI") != "" {
		fmt.Printf("Skipping bd issue creation in CI environment for: %s\n", issue.Title)
		return nil
	}

	// Create issue title
	title := fmt.Sprintf("Accessibility Issue: %s", issue.Title)

	// Check if issue already exists
	exists, err := issueExists(title, issue.Selector, issue.URL)
	if err != nil {
		fmt.Printf("Warning: failed to check for existing issue: %v\n", err)
	}
	if exists {
		fmt.Printf("Issue already exists, skipping: %s\n", title)
		return nil
	}

	// Create issue description
	description := fmt.Sprintf("## Accessibility Issue Found\n\nURL: %s\nImpact: %s\nSelector: %s\n\nDescription: %s\n\nTags: %s\n\nThis issue was automatically created by the Go BDD accessibility scanner.",
		issue.URL,
		issue.Impact,
		issue.Selector,
		issue.Description,
		strings.Join(issue.Tags, ", "),
	)

	// Create bd issue
	args := []string{
		"create", title,
		"-t", "bug",
		"-p", "1", // High priority for accessibility
		"--description", description,
		"--json",
	}

	cmd := exec.Command("bd", args...)
	output, err := cmd.Output()
	if err != nil {
		return fmt.Errorf("failed to create bd issue: %w, output: %s", err, string(output))
	}

	fmt.Printf("Created bd issue: %s\n", string(output))
	return nil
}

// CreateBdIssuesForAll creates bd issues for all found problems
func (as *AccessibilityScanner) CreateBdIssuesForAll() error {
	for _, issue := range as.GetIssues() {
		if issue.Impact == "critical" || issue.Impact == "serious" {
			if err := as.CreateBdIssue(issue); err != nil {
				fmt.Printf("Failed to create issue for %s: %v\n", issue.Title, err)
			}
		}
	}
	return nil
}
