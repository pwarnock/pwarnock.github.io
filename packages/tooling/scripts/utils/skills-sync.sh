#!/bin/bash

# Skills Sync Script
# On-demand sync of Letta AI skills content for agents

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SKILLS_DIR="$PROJECT_ROOT/.skills"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if degit is installed
check_degit() {
    if ! command -v degit &> /dev/null; then
        log_info "Installing degit..."
        bun add -g degit
    fi
}

# Check if skills integration is enabled
check_skills_enabled() {
    if [ -f "$PROJECT_ROOT/.cody/config/scripts/feature-flags.sh" ]; then
        SKILLS_ENABLED=$("$PROJECT_ROOT/.cody/config/scripts/feature-flags.sh" check skills_integration 2>/dev/null | grep -q "enabled" && echo "true" || echo "false")
    else
        SKILLS_ENABLED="false"
    fi
    
    if [ "$SKILLS_ENABLED" != "true" ]; then
        log_warning "Skills integration is disabled"
        log_info "Enable with: ./.cody/config/scripts/feature-flags.sh enable skills_integration"
        exit 0
    fi
}

# Sync skills content
sync_skills() {
    log_info "Checking .skills content..."
    
    if [ -d "$SKILLS_DIR" ]; then
        log_info ".skills directory already exists"
        
        # Check if it's a git repository (old submodule approach)
        if [ -d "$SKILLS_DIR/.git" ]; then
            log_warning "Detected existing git repository in .skills"
            log_info "Removing old git repository..."
            rm -rf "$SKILLS_DIR"
        else
            log_info "Updating existing .skills content..."
            rm -rf "$SKILLS_DIR"
        fi
    fi
    
    log_info "Fetching Letta AI skills content..."
    
    # Use degit to fetch the latest skills content
    cd "$PROJECT_ROOT"
    if degit "letta-ai/skills" ".skills"; then
        log_success "Successfully synced Letta AI skills content"
        log_info "Skills directory: $SKILLS_DIR"
        
        # Create a simple index to help agents understand the structure
        create_skills_index
    else
        log_error "Failed to sync skills content"
        exit 1
    fi
}

# Create a simple index of available skills
create_skills_index() {
    log_info "Creating skills index..."
    
    cat > "$SKILLS_DIR/.skills-index.md" << 'EOF'
# Letta AI Skills Index

This directory contains Letta AI skills content synced from https://github.com/letta-ai/skills.

## Structure
- Individual skill files and documentation
- Examples and implementations
- Configuration files

## Usage
These skills are available for AI agents to reference and utilize during development tasks.

## Sync Status
Last synced: $(date)
Source: https://github.com/letta-ai/skills
EOF
    
    log_success "Created skills index"
}

# Show skills status
show_status() {
    if [ -d "$SKILLS_DIR" ]; then
        log_success ".skills directory exists"
        log_info "Size: $(du -sh "$SKILLS_DIR" 2>/dev/null | cut -f1)"
        log_info "Last modified: $(stat -c %y "$SKILLS_DIR" 2>/dev/null || stat -f %Sm "$SKILLS_DIR" 2>/dev/null)"
        
        if [ -f "$SKILLS_DIR/.skills-index.md" ]; then
            log_info "Index file: $SKILLS_DIR/.skills-index.md"
        fi
    else
        log_warning ".skills directory not found"
    fi
}

# Clean up skills directory
cleanup() {
    log_info "Cleaning up .skills directory..."
    if [ -d "$SKILLS_DIR" ]; then
        rm -rf "$SKILLS_DIR"
        log_success "Removed .skills directory"
    else
        log_info "No .skills directory to clean"
    fi
}

# Main execution
main() {
    log_info "Starting skills sync..."
    
    # Check dependencies
    check_degit
    
    # Check if skills integration is enabled
    check_skills_enabled
    
    # Sync skills content
    sync_skills
    
    log_success "Skills sync completed!"
    log_info "Skills content is now available for agents"
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --status       Show current status"
        echo "  --cleanup      Remove .skills directory"
        echo "  --force        Force refresh even if already exists"
        echo
        exit 0
        ;;
    --status)
        show_status
        exit 0
        ;;
    --cleanup)
        cleanup
        exit 0
        ;;
    --force)
        log_info "Force refresh requested"
        check_degit
        check_skills_enabled
        cleanup
        sync_skills
        log_success "Force refresh completed!"
        ;;
    "")
        main
        ;;
    *)
        log_error "Unknown option: $1"
        exit 1
        ;;
esac
