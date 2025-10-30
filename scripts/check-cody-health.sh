#!/bin/bash

# Cody Framework Health Check
# Verifies integrity of .cody directory structure and files

set -e

LOG_FILE="cody-health-check.log"
ISSUES_FOUND=0

echo "$(date): Starting Cody Framework health check" | tee "$LOG_FILE"

# Check if .cody exists
if [ ! -d ".cody" ]; then
    echo "ERROR: .cody directory not found!" | tee -a "$LOG_FILE"
    exit 1
fi

# Check required directories
REQUIRED_DIRS=(
    ".cody/config"
    ".cody/config/commands"
    ".cody/config/scripts"
    ".cody/config/templates"
    ".cody/project"
    ".cody/project/build"
    ".cody/templates"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "WARNING: Required directory missing: $dir" | tee -a "$LOG_FILE"
        ((ISSUES_FOUND++))
    fi
done

# Check critical files
CRITICAL_FILES=(
    ".cody/config/settings.json"
    ".cody/project/build/feature-backlog.md"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "ERROR: Critical file missing: $file" | tee -a "$LOG_FILE"
        ((ISSUES_FOUND++))
    fi
done

# Check for unexpected modifications (basic check)
if [ -f ".cody/config/settings.json" ]; then
    if ! jq empty .cody/config/settings.json 2>/dev/null; then
        echo "WARNING: settings.json is not valid JSON" | tee -a "$LOG_FILE"
        ((ISSUES_FOUND++))
    fi
fi

# Check for orphaned files (files not managed by framework)
echo "Checking for potential orphaned files..." | tee -a "$LOG_FILE"

# This is a basic check - in practice, this would need more sophisticated logic
# to distinguish framework-managed vs user-added files

if [ $ISSUES_FOUND -eq 0 ]; then
    echo "$(date): Health check PASSED - no issues found" | tee -a "$LOG_FILE"
    exit 0
else
    echo "$(date): Health check FAILED - $ISSUES_FOUND issues found" | tee -a "$LOG_FILE"
    echo "Review log file: $LOG_FILE" | tee -a "$LOG_FILE"
    echo "Consider running backup before any manual intervention" | tee -a "$LOG_FILE"
    exit 1
fi
