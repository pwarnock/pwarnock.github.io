#!/bin/bash

##############################################################################
# Spacing Scale Refactoring Automation Script
# 
# Purpose: Systematically replace 250+ hardcoded spacing utilities with 
#          CSS variable tokens across 30 remaining template files
#
# Usage:
#   ./refactor-spacing-scale.sh [--dry-run] [--backup] [--file <pattern>]
#
# Examples:
#   ./refactor-spacing-scale.sh --dry-run              # Test without changes
#   ./refactor-spacing-scale.sh --backup               # Backup before refactor
#   ./refactor-spacing-scale.sh --file "card-*.html"   # Refactor specific files
#
# Requires: v0.10.0-spacing-scale branch active
##############################################################################

set -e

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LAYOUTS_DIR="${PROJECT_ROOT}/layouts"
DRY_RUN=false
BACKUP=false
FILE_PATTERN="*.html"
REFACTORED_COUNT=0
REPORT_FILE="/tmp/spacing-refactor-report.txt"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

##############################################################################
# Helper Functions
##############################################################################

log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

print_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

OPTIONS:
    --dry-run           Show what would be changed without making changes
    --backup            Create backups of all files before refactoring
    --file PATTERN      Process only files matching pattern (default: *.html)
    --help              Show this help message

EXAMPLES:
    $0 --dry-run
    $0 --backup --file "components/*.html"
    $0 --file "sections/*.html"
EOF
}

##############################################################################
# Refactoring Rules
##############################################################################

# Map hardcoded utilities to CSS variables
declare -A SPACING_MAP=(
    # Margins
    ["mb-0"]="margin-bottom: var(--space-0)"
    ["mb-1"]="margin-bottom: var(--space-1)"
    ["mb-2"]="margin-bottom: var(--space-2)"
    ["mb-3"]="margin-bottom: var(--space-3)"
    ["mb-4"]="margin-bottom: var(--space-4)"
    ["mb-5"]="margin-bottom: var(--space-5)"
    ["mb-6"]="margin-bottom: var(--space-6)"
    ["mb-8"]="margin-bottom: var(--space-8)"
    ["mb-10"]="margin-bottom: var(--space-10)"
    ["mb-12"]="margin-bottom: var(--space-12)"
    ["mb-16"]="margin-bottom: var(--space-16)"
    ["mt-0"]="margin-top: var(--space-0)"
    ["mt-1"]="margin-top: var(--space-1)"
    ["mt-2"]="margin-top: var(--space-2)"
    ["mt-3"]="margin-top: var(--space-3)"
    ["mt-4"]="margin-top: var(--space-4)"
    ["mt-5"]="margin-top: var(--space-5)"
    ["mt-6"]="margin-top: var(--space-6)"
    ["mt-8"]="margin-top: var(--space-8)"
    ["mt-10"]="margin-top: var(--space-10)"
    ["mt-12"]="margin-top: var(--space-12)"
    ["mt-16"]="margin-top: var(--space-16)"
    ["ml-2"]="margin-left: var(--space-2)"
    ["ml-4"]="margin-left: var(--space-4)"
    ["mr-2"]="margin-right: var(--space-2)"
    ["mr-4"]="margin-right: var(--space-4)"
    # Padding
    ["p-2"]="padding: var(--space-2)"
    ["p-3"]="padding: var(--space-3)"
    ["p-4"]="padding: var(--space-4)"
    ["p-6"]="padding: var(--space-6)"
    ["p-8"]="padding: var(--space-8)"
    ["px-1"]="padding-left: var(--space-1); padding-right: var(--space-1)"
    ["px-2"]="padding-left: var(--space-2); padding-right: var(--space-2)"
    ["px-3"]="padding-left: var(--space-3); padding-right: var(--space-3)"
    ["px-4"]="padding-left: var(--space-4); padding-right: var(--space-4)"
    ["px-6"]="padding-left: var(--space-6); padding-right: var(--space-6)"
    ["py-1"]="padding-top: var(--space-1); padding-bottom: var(--space-1)"
    ["py-2"]="padding-top: var(--space-2); padding-bottom: var(--space-2)"
    ["py-3"]="padding-top: var(--space-3); padding-bottom: var(--space-3)"
    ["py-4"]="padding-top: var(--space-4); padding-bottom: var(--space-4)"
    # Gap
    ["gap-2"]="gap: var(--space-2)"
    ["gap-3"]="gap: var(--space-3)"
    ["gap-4"]="gap: var(--space-4)"
    ["gap-6"]="gap: var(--space-6)"
    ["gap-8"]="gap: var(--space-8)"
)

##############################################################################
# Main Refactoring Logic
##############################################################################

refactor_file() {
    local file="$1"
    local changes=0
    
    if [ ! -f "$file" ]; then
        log_error "File not found: $file"
        return 1
    fi
    
    # Create backup if requested
    if [ "$BACKUP" = true ]; then
        cp "$file" "${file}.backup"
        log_info "Backed up: $file"
    fi
    
    # Read file content
    local content=$(cat "$file")
    local original_content="$content"
    
    # Apply refactoring rules
    for utility in "${!SPACING_MAP[@]}"; do
        value="${SPACING_MAP[$utility]}"
        
        # Count occurrences
        count=$(echo "$content" | grep -c "class=\"[^\"]*\b${utility}\b" || echo 0)
        
        if [ "$count" -gt 0 ]; then
            changes=$((changes + count))
            
            if [ "$DRY_RUN" = false ]; then
                # Replace class-based utilities with inline styles
                # This is a simplified approach; complex cases need manual review
                content=$(echo "$content" | sed "s/class=\"\([^\"]*\)\b${utility}\b\([^\"]*\)\"/class=\"\1\2\" style=\"${value}\"/g")
            fi
        fi
    done
    
    # Write changes if not dry-run and changes were made
    if [ "$DRY_RUN" = false ] && [ "$changes" -gt 0 ]; then
        echo "$content" > "$file"
        REFACTORED_COUNT=$((REFACTORED_COUNT + 1))
    fi
    
    # Report
    if [ "$changes" -gt 0 ]; then
        local status="[DRY-RUN]"
        [ "$DRY_RUN" = false ] && status="[REFACTORED]"
        log_info "$status $file — $changes utilities replaced"
        echo "$status $file — $changes utilities" >> "$REPORT_FILE"
        return 0
    else
        return 1
    fi
}

##############################################################################
# Argument Parsing
##############################################################################

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            log_warn "DRY-RUN mode enabled"
            shift
            ;;
        --backup)
            BACKUP=true
            log_info "Backup enabled"
            shift
            ;;
        --file)
            FILE_PATTERN="$2"
            shift 2
            ;;
        --help)
            print_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

##############################################################################
# Execute Refactoring
##############################################################################

clear_report() {
    > "$REPORT_FILE"
}

main() {
    clear_report
    
    echo "=========================================="
    echo "Spacing Scale Refactoring"
    echo "=========================================="
    echo ""
    
    log_info "Project root: $PROJECT_ROOT"
    log_info "Processing pattern: $FILE_PATTERN"
    echo ""
    
    # Find and refactor files
    local total_files=0
    local refactored_files=0
    
    # Refactor components
    if [ -d "$LAYOUTS_DIR/partials/components" ]; then
        log_info "Refactoring components..."
        for file in "$LAYOUTS_DIR"/partials/components/$FILE_PATTERN; do
            if [ -f "$file" ]; then
                total_files=$((total_files + 1))
                if refactor_file "$file"; then
                    refactored_files=$((refactored_files + 1))
                fi
            fi
        done
    fi
    
    # Refactor sections
    if [ -d "$LAYOUTS_DIR/partials/sections" ]; then
        log_info "Refactoring sections..."
        for file in "$LAYOUTS_DIR"/partials/sections/$FILE_PATTERN; do
            if [ -f "$file" ]; then
                total_files=$((total_files + 1))
                if refactor_file "$file"; then
                    refactored_files=$((refactored_files + 1))
                fi
            fi
        done
    fi
    
    # Refactor shortcodes
    if [ -d "$LAYOUTS_DIR/shortcodes" ]; then
        log_info "Refactoring shortcodes..."
        for file in "$LAYOUTS_DIR"/shortcodes/$FILE_PATTERN; do
            if [ -f "$file" ]; then
                total_files=$((total_files + 1))
                if refactor_file "$file"; then
                    refactored_files=$((refactored_files + 1))
                fi
            fi
        done
    fi
    
    # Refactor other partials
    if [ -d "$LAYOUTS_DIR/partials" ]; then
        log_info "Refactoring other partials..."
        for file in "$LAYOUTS_DIR"/partials/$FILE_PATTERN; do
            if [ -f "$file" ] && [ ! -d "$file" ]; then
                total_files=$((total_files + 1))
                if refactor_file "$file"; then
                    refactored_files=$((refactored_files + 1))
                fi
            fi
        done
    fi
    
    echo ""
    echo "=========================================="
    echo "Summary"
    echo "=========================================="
    log_info "Total files scanned: $total_files"
    log_info "Files with changes: $refactored_files"
    
    if [ "$DRY_RUN" = true ]; then
        log_warn "DRY-RUN: No files were modified"
    else
        log_info "Refactoring complete!"
    fi
    
    echo ""
    log_info "Detailed report saved to: $REPORT_FILE"
    cat "$REPORT_FILE"
}

# Run main function
main
