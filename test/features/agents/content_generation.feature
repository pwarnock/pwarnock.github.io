Feature: Content Agent Generation Validation
  As a content creator
  I want generated content to pass validation
  So that I can publish high-quality content

  Scenario: Blog post validation passes for original content
    Given a blog post is generated with type "original"
    And the blog post has title "Test Blog Post"
    And the blog post has summary "This is a test summary for validation purposes."
    When the blog post is validated
    Then the validation should pass
    And the frontmatter should contain required fields
    And the content should not contain H1 headings

  Scenario: Blog post validation passes for curated content
    Given a blog post is generated with type "curated"
    And the blog post has title "Curated Resources"
    And the blog post has summary "A collection of curated resources."
    And the blog post has attribution "Original Author"
    And the blog post has source_url "https://example.com/source"
    When the blog post is validated
    Then the validation should pass
    And the frontmatter should contain attribution field
    And the frontmatter should contain source_url field

  Scenario: Portfolio entry validation passes
    Given a portfolio entry is generated
    And the portfolio has title "Test Project"
    And the portfolio has client "Test Client"
    And the portfolio has description "A test project description"
    And the portfolio has technologies "React,TypeScript,Node.js"
    And the portfolio has completion_date "2024-12"
    And the portfolio has category "Web Development"
    When the portfolio entry is validated
    Then the validation should pass
    And the frontmatter should contain all required fields
    And technologies should be an array

  Scenario: Tech radar entry validation passes for adopt ring
    Given a tech radar entry is generated
    And the radar has title "React"
    And the radar has description "A JavaScript library for building user interfaces"
    And the radar has quadrant "languages-and-frameworks"
    And the radar has ring "adopt"
    When the tech radar entry is validated
    Then the validation should pass
    And the frontmatter should contain quadrant field
    And the frontmatter should contain ring field
    And the ring value should be valid

  Scenario: Tech radar entry validation passes for hold ring
    Given a tech radar entry is generated
    And the radar has title "jQuery"
    And the radar has description "Legacy JavaScript library"
    And the radar has quadrant "languages-and-frameworks"
    And the radar has ring "hold"
    When the tech radar entry is validated
    Then the validation should pass
    And the content should contain migration guidance
