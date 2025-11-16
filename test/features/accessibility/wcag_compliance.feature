Feature: WCAG Compliance

  Scenario: Homepage meets WCAG 2.1 AA standards
    Given I navigate to the "home" page
    And the page should load successfully
    When I run WCAG 2.1 AA accessibility validation
    Then I should see no critical accessibility violations
    And I should see no serious accessibility violations

  Scenario: Blog page meets WCAG 2.1 AA standards
    Given I navigate to the "blog" page
    And the page should load successfully
    When I run WCAG 2.1 AA accessibility validation
    Then I should see no critical accessibility violations
    And I should see no serious accessibility violations

  Scenario: Portfolio page meets WCAG 2.1 AA standards
    Given I navigate to the "portfolio" page
    And the page should load successfully
    When I run WCAG 2.1 AA accessibility validation
    Then I should see no critical accessibility violations
    And I should see no serious accessibility violations