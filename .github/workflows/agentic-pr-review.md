---
on:
  pull_request:
    types: [opened, synchronize]
permissions:
  contents: read
  pull-requests: write
engine: claude
tools:
  github:
    toolset: [pull_requests]
safe-outputs:
  add-comment:
    max: 3
    timeout_minutes: 10
---
# PR Review Assistant

Review the pull request changes for:
- Code quality and best practices
- Potential bugs or security issues
- Missing tests for new functionality
