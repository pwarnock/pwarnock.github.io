#!/bin/bash

# Cody PBT Migration Test Script
# Tests the upgrade process on isolated copy

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
TEST_DIR="/Users/peter/github/pwarnock.github.io/work/cody-pbt-test"
PBT_SOURCE="/Users/peter/github/pwarnock.github.io/work/cody-pbt-source"
LOG_FILE="$TEST_DIR/migration-test.log"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Test function
test_step() {
    local step_name="$1"
    local test_command="$2"
    
    log "${BLUE}Testing: $step_name${NC}"
    
    if eval "$test_command" >> "$LOG_FILE" 2>&1; then
        log "${GREEN}✅ PASS: $step_name${NC}"
        return 0
    else
        log "${RED}❌ FAIL: $step_name${NC}"
        return 1
    fi
}

# Initialize test environment
init_test_env() {
    log "${YELLOW}=== Initializing Test Environment ===${NC}"
    
    # Clean test directory
    rm -rf "$TEST_DIR"
    mkdir -p "$TEST_DIR"
    
    # Copy current .cody to test
    cp -r "/Users/peter/github/pwarnock.github.io/.cody" "$TEST_DIR/"
    
    # Copy PBT source
    cp -r "$PBT_SOURCE" "$TEST_DIR/cody-pbt-source"
    
    log "Test environment initialized"
}

# Test backup creation
test_backup() {
    test_step "Backup Creation" \
        "cd '$TEST_DIR' && mkdir -p .cody.backup.test && cp -r .cody .cody.backup.test/"
}

# Test directory structure migration
test_structure_migration() {
    test_step "Create Build Directory" \
        "cd '$TEST_DIR' && mkdir -p .cody/project/build/versions"
    
    test_step "Create Library Directory" \
        "cd '$TEST_DIR' && mkdir -p .cody/project/library/docs/audits"
    
    test_step "Move Versions to Build" \
        "cd '$TEST_DIR' && mv .cody/project/versions/* .cody/project/build/versions/ 2>/dev/null || true"
    
    test_step "Move Discovery to Library" \
        "cd '$TEST_DIR' && mv .cody/project/discovery/* .cody/project/library/docs/audits/ 2>/dev/null || true"
}

# Test template migration
test_template_migration() {
    test_step "Backup Current Templates" \
        "cd '$TEST_DIR' && mkdir -p .cody/config/templates.backup && cp -r .cody/config/templates/* .cody/config/templates.backup/ 2>/dev/null || true"
    
    test_step "Copy PBT Templates" \
        "cd '$TEST_DIR' && cp -r cody-pbt-source/.cody/config/templates/* .cody/config/templates/"
}

# Test command migration
test_command_migration() {
    test_step "Backup Current Commands" \
        "cd '$TEST_DIR' && mkdir -p .cody/config/commands.backup && cp -r .cody/config/commands/* .cody/config/commands.backup/"
    
    test_step "Copy PBT Commands" \
        "cd '$TEST_DIR' && cp -r cody-pbt-source/.cody/config/commands/* .cody/config/commands/"
}

# Test settings update
test_settings_update() {
    test_step "Backup Settings" \
        "cd '$TEST_DIR' && cp .cody/config/settings.json .cody/config/settings.json.backup"
    
    test_step "Update Settings" \
        "cd '$TEST_DIR' && cat cody-pbt-source/.cody/config/settings.json > .cody/config/settings.json"
}

# Test data integrity
test_data_integrity() {
    test_step "Verify Version Count" \
        "cd '$TEST_DIR' && [ \$(find .cody/project/build/versions -maxdepth 1 -type d | wc -l) -gt 1 ]"
    
    test_step "Verify Discovery Documents" \
        "cd '$TEST_DIR' && [ \$(find .cody/project/library/docs/audits -name '*.md' | wc -l) -gt 0 ]"
    
    test_step "Verify Planning Documents" \
        "cd '$TEST_DIR' && [ -f .cody/project/plan/discovery.md ] && [ -f .cody/project/plan/prd.md ] && [ -f .cody/project/plan/plan.md ]"
}

# Test template functionality
test_template_functionality() {
    test_step "Check Plan Templates" \
        "cd '$TEST_DIR' && [ -f .cody/config/templates/plan/discovery.md ] && [ -f .cody/config/templates/plan/prd.md ] && [ -f .cody/config/templates/plan/plan.md ]"
    
    test_step "Check Build Templates" \
        "cd '$TEST_DIR' && [ -f .cody/config/templates/build/feature-backlog.md ] && [ -f .cody/config/templates/build/release-notes.md ]"
    
    test_step "Check Version Templates" \
        "cd '$TEST_DIR' && [ -f .cody/config/templates/build/version/design.md ] && [ -f .cody/config/templates/build/version/tasklist.md ] && [ -f .cody/config/templates/build/version/retrospective.md ]"
}

# Test command availability
test_command_availability() {
    test_step "Check Core Commands" \
        "cd '$TEST_DIR' && [ -f .cody/config/commands/help.md ] && [ -f .cody/config/commands/plan.md ] && [ -f .cody/config/commands/build.md ]"
    
    test_step "Check New Commands" \
        "cd '$TEST_DIR' && [ -f .cody/config/commands/version-build.md ] && [ -f .cody/config/commands/version-add.md ] && [ -f .cody/config/commands/assets-list.md ]"
}

# Generate test report
generate_report() {
    local report_file="$TEST_DIR/migration-test-report.md"
    
    cat > "$report_file" << EOF
# Cody PBT Migration Test Report

**Test Date:** $(date)
**Test Environment:** $TEST_DIR

## Test Summary

$(grep -E "(PASS|FAIL)" "$LOG_FILE" | tail -20)

## Directory Structure After Migration

\`\`\`
$(cd "$TEST_DIR" && find .cody -type f -name "*.md" | head -20)
\`\`\`

## Settings Comparison

### Before Migration
\`\`\`json
$(cat "$TEST_DIR/.cody/config/settings.json.backup" 2>/dev/null || echo "Not available")
\`\`\`

### After Migration
\`\`\`json
$(cat "$TEST_DIR/.cody/config/settings.json" 2>/dev/null || echo "Not available")
\`\`\`

## Recommendations

$(if grep -q "FAIL" "$LOG_FILE"; then
    echo "⚠️  Some tests failed. Review the log file for details."
    echo "   - Check $LOG_FILE for specific error messages"
    echo "   - Verify all prerequisites are met"
    echo "   - Consider manual intervention for failed steps"
else
    echo "✅ All tests passed! Ready for production migration."
    echo "   - Review the migrated structure"
    echo "   - Test commands in actual environment"
    echo "   - Proceed with production migration"
fi)
EOF

    log "Test report generated: $report_file"
}

# Main execution
main() {
    log "${YELLOW}=== Starting Cody PBT Migration Test ===${NC}"
    
    # Initialize
    init_test_env
    
    # Run tests
    test_backup
    test_structure_migration
    test_template_migration
    test_command_migration
    test_settings_update
    test_data_integrity
    test_template_functionality
    test_command_availability
    
    # Generate report
    generate_report
    
    log "${YELLOW}=== Migration Test Complete ===${NC}"
    
    # Show summary
    local passed=$(grep -c "PASS" "$LOG_FILE")
    local failed=$(grep -c "FAIL" "$LOG_FILE")
    
    echo
    echo "${BLUE}Test Summary:${NC}"
    echo "${GREEN}Passed: $passed${NC}"
    echo "${RED}Failed: $failed${NC}"
    echo "${BLUE}Log file: $LOG_FILE${NC}"
    echo "${BLUE}Report: $TEST_DIR/migration-test-report.md${NC}"
    
    if [ "$failed" -eq 0 ]; then
        echo "${GREEN}✅ Ready for production migration!${NC}"
        return 0
    else
        echo "${RED}❌ Fix failures before production migration${NC}"
        return 1
    fi
}

# Run main function
main "$@"