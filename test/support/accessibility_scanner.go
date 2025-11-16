package support

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"
)

// AccessibilityIssue represents an accessibility issue found by scanner
type AccessibilityIssue struct {
	ID          string            `json:"id"`
	Title       string            `json:"title"`
	Description string            `json:"description"`
	Impact      string           `json:"impact"`
	Tags        []string         `json:"tags"`
	Selector    string           `json:"selector"`
	URL         string           `json:"url"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
}

// AccessibilityScanner integrates with GitHub Accessibility Scanner
type AccessibilityScanner struct {
	baseURL    string
	issues      []AccessibilityIssue
}

// NewAccessibilityScanner creates a new accessibility scanner
func NewAccessibilityScanner(baseURL string) *AccessibilityScanner {
	return &AccessibilityScanner{
		baseURL: baseURL,
		issues:  make([]AccessibilityIssue, 0),
	}
}

// ScanPage scans a specific page for accessibility issues
func (as *AccessibilityScanner) ScanPage(url string) error {
	// For now, we'll use axe-core via CLI
	// In a full implementation, this would integrate GitHub Accessibility Scanner
	
	cmd := exec.Command("npx", "axe-core", 
		"--url", url,
		"--format", "json",
		"--tags", "wcag2a,wcag2aa,wcag21aa",
	)
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("accessibility scan failed: %w, output: %s", err, string(output))
	}
	
	// Parse results
	var scanResult struct {
		Violations []struct {
			ID          string            `json:"id"`
			Description string            `json:"description"`
			Impact      string           `json:"impact"`
			Tags        []string         `json:"tags"`
			Nodes       []struct {
				Target []string `json:"target"`
				HTML   string   `json:"html"`
			} `json:"nodes"`
		} `json:"violations"`
	}
	
	if err := json.Unmarshal(output, &scanResult); err != nil {
		return fmt.Errorf("failed to parse scan results: %w", err)
	}
	
	// Convert to our issue format
	for _, violation := range scanResult.Violations {
		for _, node := range violation.Nodes {
			selector := ""
			if len(node.Target) > 0 {
				selector = node.Target[0]
			}
			
			issue := AccessibilityIssue{
				ID:          violation.ID,
				Title:       violation.Description,
				Description: violation.Description,
				Impact:      violation.Impact,
				Tags:        violation.Tags,
				Selector:    selector,
				URL:         url,
				Metadata: map[string]interface{}{
					"html": node.HTML,
				},
			}
			
			as.issues = append(as.issues, issue)
		}
	}
	
	return nil
}

// GetIssues returns all found accessibility issues
func (as *AccessibilityScanner) GetIssues() []AccessibilityIssue {
	return as.issues
}

// GetCriticalIssues returns only critical accessibility issues
func (as *AccessibilityScanner) GetCriticalIssues() []AccessibilityIssue {
	var critical []AccessibilityIssue
	for _, issue := range as.issues {
		if issue.Impact == "critical" {
			critical = append(critical, issue)
		}
	}
	return critical
}

// GetSeriousIssues returns only serious accessibility issues
func (as *AccessibilityScanner) GetSeriousIssues() []AccessibilityIssue {
	var serious []AccessibilityIssue
	for _, issue := range as.issues {
		if issue.Impact == "serious" {
			serious = append(serious, issue)
		}
	}
	return serious
}

// CreateBdIssue creates a bd issue for accessibility problems
func (as *AccessibilityScanner) CreateBdIssue(issue AccessibilityIssue) error {
	// Create issue title
	title := fmt.Sprintf("Accessibility Issue: %s", issue.Title)
	
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
	for _, issue := range as.issues {
		if issue.Impact == "critical" || issue.Impact == "serious" {
			if err := as.CreateBdIssue(issue); err != nil {
				fmt.Printf("Failed to create issue for %s: %v\n", issue.Title, err)
			}
		}
	}
	return nil
}

// formatMetadata formats metadata for display
func (as *AccessibilityScanner) formatMetadata(metadata map[string]interface{}) string {
	if len(metadata) == 0 {
		return "No additional metadata"
	}
	
	data, err := json.MarshalIndent(metadata, "  ", "  ")
	if err != nil {
		return "Failed to format metadata"
	}
	return string(data)
}