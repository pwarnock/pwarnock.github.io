Feature: Navigation and Accessibility

  Scenario: Navigate to blog page
    Given I navigate to the "home" page
    And the page should load successfully
    When I click the "Blog" link in navigation
    Then I should be on the "blog" page

  Scenario: Navigate to portfolio page
    Given I navigate to the "home" page
    And the page should load successfully
    When I click the "Portfolio" link in navigation
    Then I should be on the "portfolio" page

  Scenario: Homepage accessibility validation
    Given I navigate to the "home" page
    And the page should load successfully
    And I should see no accessibility violations