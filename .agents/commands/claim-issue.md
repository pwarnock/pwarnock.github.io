# Claim Issue Command

Start work on an issue.

## Usage
```
/claim-issue bd-40
/claim-issue bd-40 "Starting implementation"
```

## What It Does
- Updates issue status to in_progress
- Sets active task in session state
- Loads context for that issue

## Next Steps
Work on the issue, then: `/close-issue bd-40`

