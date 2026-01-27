#!/bin/bash

# Placeholder Detection Script
# Scans for placeholders and development artifacts that shouldn't be in production

set -e

echo "🔍 Scanning for placeholders and development artifacts..."

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

ERRORS_FOUND=0
WARNINGS_FOUND=0

# Function to report errors
report_error() {
    echo -e "${RED}❌ $1${NC}"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
}

# Function to report warnings
report_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
}

# Function to report success
report_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Check for hardcoded feature flags
echo "Checking for hardcoded feature flags..."
if grep -r "{{ if true }}" layouts/ 2>/dev/null; then
    report_error "Found hardcoded 'if true' conditions in templates"
else
    report_success "No hardcoded feature flags found"
fi

# Check for rename-me files
echo "Checking for rename-me files..."
RENAME_ME_FILES=$(find . -name "*rename-me*" -not -path "./.git/*" -not -path "./node_modules/*" 2>/dev/null || true)
if [ -n "$RENAME_ME_FILES" ]; then
    report_error "Found rename-me files:"
    echo "$RENAME_ME_FILES"
else
    report_success "No rename-me files found"
fi

# Check for TODO/FIXME in templates (excluding legitimate cases)
echo "Checking for TODO/FIXME in templates..."
TODO_COMMENTS=$(grep -r -i "todo\|fixme" layouts/ 2>/dev/null | grep -v "// TODO" | grep -v "# TODO" || true)
if [ -n "$TODO_COMMENTS" ]; then
    report_warning "Found TODO/FIXME comments in templates:"
    echo "$TODO_COMMENTS"
else
    report_success "No TODO/FIXME comments found in templates"
fi

# Check for placeholder images
echo "Checking for placeholder images..."
PLACEHOLDER_IMAGES=$(find . -name "*placeholder*" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" \) -not -path "./.git/*" -not -path "./node_modules/*" 2>/dev/null || true)
if [ -n "$PLACEHOLDER_IMAGES" ]; then
    report_error "Found placeholder images:"
    echo "$PLACEHOLDER_IMAGES"
else
    report_success "No placeholder images found"
fi

# Check for lorem ipsum text
echo "Checking for lorem ipsum text..."
LOREM_IPSUM=$(grep -r -i "lorem ipsum" content/ layouts/ 2>/dev/null || true)
if [ -n "$LOREM_IPSUM" ]; then
    report_warning "Found lorem ipsum text:"
    echo "$LOREM_IPSUM"
else
    report_success "No lorem ipsum text found"
fi

# Check for console.log statements in JavaScript/TypeScript files
echo "Checking for console.log statements..."
CONSOLE_LOGS=$(grep -r "console\.log" assets/js/ static/js/ src/ 2>/dev/null | grep -v "// console.log" | grep -v "// TODO" || true)
if [ -n "$CONSOLE_LOGS" ]; then
    report_warning "Found console.log statements:"
    echo "$CONSOLE_LOGS"
else
    report_success "No console.log statements found"
fi

# Check for example.com URLs that might be placeholders
echo "Checking for example.com placeholder URLs..."
EXAMPLE_COMMS=$(grep -r "example\.com" content/ layouts/ 2>/dev/null | grep -v "// example.com" | grep -v "# example.com" || true)
if [ -n "$EXAMPLE_COMMS" ]; then
    report_warning "Found example.com URLs (review if these are legitimate examples):"
    echo "$EXAMPLE_COMMS"
else
    report_success "No example.com URLs found"
fi

# Check for HACK comments
echo "Checking for HACK comments..."
HACK_COMMENTS=$(grep -r -i "hack" layouts/ assets/js/ static/js/ src/ 2>/dev/null | grep -i "// HACK\|<!-- HACK\|# HACK" || true)
if [ -n "$HACK_COMMENTS" ]; then
    report_warning "Found HACK comments:"
    echo "$HACK_COMMENTS"
else
    report_success "No HACK comments found"
fi

# Check for XXX comments
echo "Checking for XXX comments..."
XXX_COMMENTS=$(grep -r -i "xxx" layouts/ assets/js/ static/js/ src/ 2>/dev/null | grep -i "// XXX\|<!-- XXX\|# XXX" || true)
if [ -n "$XXX_COMMENTS" ]; then
    report_error "Found XXX comments:"
    echo "$XXX_COMMENTS"
else
    report_success "No XXX comments found"
fi

# Summary
echo ""
echo "📊 Scan Summary:"
echo -e "Errors: ${RED}$ERRORS_FOUND${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS_FOUND${NC}"

if [ $ERRORS_FOUND -gt 0 ]; then
    echo ""
    report_error "Scan failed with errors. Please fix before deploying."
    exit 1
elif [ $WARNINGS_FOUND -gt 0 ]; then
    echo ""
    report_warning "Scan completed with warnings. Review recommended."
    exit 0
else
    echo ""
    report_success "Scan completed successfully with no issues found."
    exit 0
fi