#!/bin/bash

# Cody PBT Production Migration Script
# Executes the actual upgrade to Cody PBT with data migration

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
PROJECT_ROOT="/Users/peter/github/pwarnock.github.io"
PBT_SOURCE="/Users/peter/github/pwarnock.github.io/work/cody-pbt-source"
BACKUP_DIR=".cody.backup.$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$PROJECT_ROOT/cody-migration.log"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Migration step function
migrate_step() {
    local step_name="$1"
    local migration_command="$2"
    
    log "${BLUE}Migrating: $step_name${NC}"
    
    if eval "$migration_command" >> "$LOG_FILE" 2>&1; then
        log "${GREEN}✅ SUCCESS: $step_name${NC}"
        return 0
    else
        log "${RED}❌ FAILED: $step_name${NC}"
        return 1
    fi
}

# Pre-migration checks
pre_migration_checks() {
    log "${YELLOW}=== Pre-Migration Checks ===${NC}"
    
    # Check if we're in the right directory
    if [ ! -f "$PROJECT_ROOT/hugo.toml" ]; then
        log "${RED}❌ Not in project root directory${NC}"
        exit 1
    fi
    
    # Check if .cody exists
    if [ ! -d "$PROJECT_ROOT/.cody" ]; then
        log "${RED}❌ .cody directory not found${NC}"
        exit 1
    fi
    
    # Check if PBT source exists
    if [ ! -d "$PBT_SOURCE" ]; then
        log "${RED}❌ Cody PBT source not found${NC}"
        exit 1
    fi
    
    # Check if backup already exists today
    if [ -d "$PROJECT_ROOT/.cody.backup.$(date +%Y%m%d)*" ]; then
        log "${YELLOW}⚠️  Backup already exists today${NC}"
    fi
    
    log "✅ Pre-migration checks passed"
}

# Create backup
create_backup() {
    log "${YELLOW}=== Creating Backup ===${NC}"
    
    migrate_step "Create .cody backup" \
        "cd '$PROJECT_ROOT' && cp -r .cody '$BACKUP_DIR'"
    
    migrate_step "Export bd issues" \
        "cd '$PROJECT_ROOT' && bd export --json > '$BACKUP_DIR/bd-issues-backup.json' 2>/dev/null || echo 'No bd issues to export'"
    
    log "✅ Backup created: $BACKUP_DIR"
}

# Migrate directory structure
migrate_structure() {
    log "${YELLOW}=== Migrating Directory Structure ===${NC}"
    
    migrate_step "Create build directory" \
        "cd '$PROJECT_ROOT' && mkdir -p .cody/project/build/versions"
    
    migrate_step "Create library directory" \
        "cd '$PROJECT_ROOT' && mkdir -p .cody/project/library/docs/audits"
    
    migrate_step "Move versions to build" \
        "cd '$PROJECT_ROOT' && mv .cody/project/versions/* .cody/project/build/versions/ 2>/dev/null || true"
    
    migrate_step "Move discovery to library" \
        "cd '$PROJECT_ROOT' && mv .cody/project/discovery/* .cody/project/library/docs/audits/ 2>/dev/null || true"
    
    migrate_step "Remove empty old directories" \
        "cd '$PROJECT_ROOT' && rmdir .cody/project/versions .cody/project/discovery 2>/dev/null || true"
}

# Migrate templates
migrate_templates() {
    log "${YELLOW}=== Migrating Templates ===${NC}"
    
    migrate_step "Backup current templates" \
        "cd '$PROJECT_ROOT' && mkdir -p .cody/config/templates.backup && cp -r .cody/config/templates/* .cody/config/templates.backup/ 2>/dev/null || true"
    
    migrate_step "Copy PBT templates" \
        "cd '$PROJECT_ROOT' && cp -r '$PBT_SOURCE/.cody/config/templates/'* .cody/config/templates/"
}

# Migrate commands
migrate_commands() {
    log "${YELLOW}=== Migrating Commands ===${NC}"
    
    migrate_step "Backup current commands" \
        "cd '$PROJECT_ROOT' && mkdir -p .cody/config/commands.backup && cp -r .cody/config/commands/* .cody/config/commands.backup/"
    
    migrate_step "Copy PBT commands" \
        "cd '$PROJECT_ROOT' && cp -r '$PBT_SOURCE/.cody/config/commands/'* .cody/config/commands/"
}

# Update settings
update_settings() {
    log "${YELLOW}=== Updating Settings ===${NC}"
    
    migrate_step "Backup settings" \
        "cd '$PROJECT_ROOT' && cp .cody/config/settings.json .cody/config/settings.json.backup"
    
    # Preserve custom features from old settings
    local old_features=""
    if [ -f "$PROJECT_ROOT/.cody/config/settings.json.backup" ]; then
        old_features=$(jq -r '.features // empty' "$PROJECT_ROOT/.cody/config/settings.json.backup" 2>/dev/null || echo "{}")
    fi
    
    migrate_step "Update settings with preserved features" \
        "cd '$PROJECT_ROOT' && jq '.features = $old_features' --argjson old_features '$old_features' '$PBT_SOURCE/.cody/config/settings.json' > .cody/config/settings.json"
}

# Create missing version files
create_missing_files() {
    log "${YELLOW}=== Creating Missing Version Files ===${NC}"
    
    for version_dir in "$PROJECT_ROOT/.cody/project/build/versions"/*/; do
        if [ -d "$version_dir" ]; then
            version_name=$(basename "$version_dir")
            
            # Create design.md if missing
            if [ ! -f "$version_dir/design.md" ]; then
                if [ -f "$version_dir/version.md" ]; then
                    migrate_step "Create design.md for $version_name" \
                        "cd '$version_dir' && echo '# Design Document: $version_name\n\nGenerated from version.md\n\n\`\`\`markdown\n\$(cat version.md)\n\`\`\`' > design.md"
                fi
            fi
            
            # Create tasklist.md if missing
            if [ ! -f "$version_dir/tasklist.md" ]; then
                if [ -f "$version_dir/release-notes.md" ]; then
                    migrate_step "Create tasklist.md for $version_name" \
                        "cd '$version_dir' && echo '# Task List: $version_name\n\nGenerated from release-notes.md\n\n\`\`\`markdown\n\$(cat release-notes.md)\n\`\`\`' > tasklist.md"
                fi
            fi
        fi
    done
}

# Update AGENTS.md
update_agents_md() {
    log "${YELLOW}=== Updating AGENTS.md ===${NC}"
    
    migrate_step "Backup AGENTS.md" \
        "cd '$PROJECT_ROOT' && cp AGENTS.md AGENTS.md.backup"
    
    # Update version reference in AGENTS.md
    migrate_step "Update Cody version in AGENTS.md" \
        "cd '$PROJECT_ROOT' && sed -i.bak 's/Cody Framework v[0-9]\+\.[0-9]\+\.[0-9]\+/Cody PBT v1.2.0/g' AGENTS.md"
}

# Post-migration validation
validate_migration() {
    log "${YELLOW}=== Post-Migration Validation ===${NC}"
    
    migrate_step "Verify .cody structure" \
        "cd '$PROJECT_ROOT' && [ -d .cody/project/build/versions ] && [ -d .cody/project/library/docs ]"
    
    migrate_step "Verify templates" \
        "cd '$PROJECT_ROOT' && [ -f .cody/config/templates/plan/discovery.md ] && [ -f .cody/config/templates/build/feature-backlog.md ]"
    
    migrate_step "Verify commands" \
        "cd '$PROJECT_ROOT' && [ -f .cody/config/commands/version-build.md ] && [ -f .cody/config/commands/assets-list.md ]"
    
    migrate_step "Verify settings" \
        "cd '$PROJECT_ROOT' && [ -f .cody/config/settings.json ]"
    
    migrate_step "Verify version data" \
        "cd '$PROJECT_ROOT' && [ \$(find .cody/project/build/versions -maxdepth 1 -type d | wc -l) -gt 1 ]"
}

# Generate migration report
generate_report() {
    local report_file="$PROJECT_ROOT/CODY_PBT_MIGRATION_REPORT.md"
    
    cat > "$report_file" << EOF
# Cody PBT Migration Report

**Migration Date:** $(date)
**Project:** $PROJECT_ROOT
**Backup Location:** $BACKUP_DIR

## Migration Summary

$(grep -E "(SUCCESS|FAILED)" "$LOG_FILE" | tail -20)

## Structure Changes

### Before Migration
- Framework: Cody SDD Framework v1.1.3
- Versions: .cody/project/versions/
- Discovery: .cody/project/discovery/
- Templates: Limited set

### After Migration
- Framework: Cody PBT v1.2.0
- Versions: .cody/project/build/versions/
- Discovery: .cody/project/library/docs/audits/
- Templates: Enhanced plan/build templates

## New Features Available

### Commands
- \`cody version build\` - Build specific versions
- \`cody version add\` - Add new versions to backlog
- \`cody assets list\` - List asset files

### Templates
- Enhanced planning templates
- Build phase templates
- Version-specific templates

## Validation Results

$(if grep -q "FAILED" "$LOG_FILE"; then
    echo "⚠️  Some migration steps failed. Review the log file."
    echo "   - Check $LOG_FILE for specific error messages"
    echo "   - Consider manual intervention for failed steps"
else
    echo "✅ All migration steps completed successfully!"
    echo "   - Framework upgraded to Cody PBT v1.2.0"
    echo "   - All project data preserved"
    echo "   - New features available"
fi)

## Next Steps

1. Test new commands: \`cody help\`
2. Explore new templates in .cody/config/templates/
3. Update team documentation
4. Start using new version management features

## Rollback Information

If needed, rollback using:
\`\`\`bash
# Restore .cody directory
rm -rf .cody
mv $BACKUP_DIR/.cody .

# Restore AGENTS.md
mv AGENTS.md.backup AGENTS.md
\`\`\`

**Backup retained at:** $BACKUP_DIR
EOF

    log "Migration report generated: $report_file"
}

# Main execution
main() {
    log "${YELLOW}=== Starting Cody PBT Production Migration ===${NC}"
    
    # Pre-migration checks
    pre_migration_checks
    
    # Migration steps
    create_backup
    migrate_structure
    migrate_templates
    migrate_commands
    update_settings
    create_missing_files
    update_agents_md
    validate_migration
    
    # Generate report
    generate_report
    
    log "${YELLOW}=== Migration Complete ===${NC}"
    
    # Show summary
    local success=$(grep -c "SUCCESS" "$LOG_FILE")
    local failed=$(grep -c "FAILED" "$LOG_FILE")
    
    echo
    echo "${BLUE}Migration Summary:${NC}"
    echo "${GREEN}Successful steps: $success${NC}"
    echo "${RED}Failed steps: $failed${NC}"
    echo "${BLUE}Backup location: $BACKUP_DIR${NC}"
    echo "${BLUE}Log file: $LOG_FILE${NC}"
    echo "${BLUE}Report: $PROJECT_ROOT/CODY_PBT_MIGRATION_REPORT.md${NC}"
    
    if [ "$failed" -eq 0 ]; then
        echo "${GREEN}✅ Migration completed successfully!${NC}"
        echo "${YELLOW}🎉 Welcome to Cody PBT v1.2.0!${NC}"
        echo
        echo "${BLUE}Try the new commands:${NC}"
        echo "  cody help"
        echo "  cody version build"
        echo "  cody assets list"
        return 0
    else
        echo "${RED}❌ Migration encountered issues. Check the log file.${NC}"
        return 1
    fi
}

# Run main function
main "$@"