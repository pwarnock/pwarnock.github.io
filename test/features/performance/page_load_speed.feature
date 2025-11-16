Feature: Page Load Performance

  Scenario: Homepage should load within performance thresholds
    Given I navigate to "home" page
    When I measure page load performance
    Then the page should load within 3 seconds
    And the time to first byte should be under 1 second
    And the page should be fully interactive within 3 seconds

  Scenario: Blog page should load within performance thresholds
    Given I navigate to "blog" page
    When I measure page load performance
    Then the page should load within 3 seconds
    And the time to first byte should be under 1 second
    And the page should be fully interactive within 3 seconds

  Scenario: Mobile responsiveness performance
    Given I navigate to "home" page
    When I set viewport to mobile size
    And I measure page load performance
    Then the page should load within 4 seconds on mobile
    And all elements should be properly sized for mobile viewport