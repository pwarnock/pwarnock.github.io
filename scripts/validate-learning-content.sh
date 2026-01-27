#!/bin/bash
# Validates learning content for sensitive information before commit
# Part of the Teresa Torres task management system

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🔍 Validating learning content for sensitive information..."

ISSUES_FOUND=0

# Files to check
LEARNINGS_DIR=".claude/context/session/learnings"
READING_LIST=".claude/learning/reading-list.md"

# Pattern checks
check_patterns() {
    local file=$1
    local patterns=(
        # API keys and tokens
        "api[_-]?key"
        "api[_-]?token"
        "access[_-]?token"
        "secret[_-]?key"
        "password"
        "bearer[[:space:]]"

        # Common key patterns
        "['\"][A-Za-z0-9]{32,}['\"]"
        "sk-[A-Za-z0-9]{20,}"
        "ghp_[A-Za-z0-9]{36}"

        # Private URLs
        "https?://.*\.atlassian\.net"
        "https?://.*\.slack\.com"
        "https?://docs\.google\.com/.*[?&]"
        "https?://.*notion\.so"
        "https?://.*\.sharepoint\.com"

        # Email addresses (might be okay for public figures)
        "@.*\.(com|net|org|io)"
    )

    for pattern in "${patterns[@]}"; do
        if grep -iE "$pattern" "$file" > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  Potential sensitive content in $file${NC}"
            echo -e "${YELLOW}   Pattern matched: $pattern${NC}"
            grep -inE --color=always "$pattern" "$file" | head -3
            echo ""
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
        fi
    done
}

# Check learnings directory
if [ -d "$LEARNINGS_DIR" ]; then
    for file in "$LEARNINGS_DIR"/*.md; do
        if [ -f "$file" ]; then
            check_patterns "$file"
        fi
    done
else
    echo "ℹ️  No learnings directory found (this is okay)"
fi

# Check reading list
if [ -f "$READING_LIST" ]; then
    check_patterns "$READING_LIST"
else
    echo "ℹ️  No reading list found (this is okay)"
fi

# Summary
echo ""
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ No sensitive patterns detected${NC}"
    echo "Content appears safe for public commit"
    exit 0
else
    echo -e "${RED}❌ Found $ISSUES_FOUND potential issues${NC}"
    echo ""
    echo "Please review the flagged content:"
    echo "- Remove credentials and API keys"
    echo "- Replace private URLs with public alternatives"
    echo "- Generalize client/company names"
    echo "- Anonymize personal information"
    echo ""
    echo "See .claude/learning/sources/VALIDATION_GUIDELINES.md for details"
    exit 1
fi
