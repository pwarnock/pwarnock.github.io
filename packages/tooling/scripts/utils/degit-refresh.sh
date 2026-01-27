#!/bin/bash

# Degit Refresh Script
# Refreshes template files from upstream repositories

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
DEGIT_CONFIG="$PROJECT_ROOT/.degit.toml"

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

# Load configuration from .degit.toml
load_config() {
    if [[ ! -f "$DEGIT_CONFIG" ]]; then
        log_warning "No .degit.toml found. Creating default configuration..."
        cat > "$DEGIT_CONFIG" << 'EOF'
# Degit Configuration
# Format: source = "target"

# Example configurations (uncomment and modify as needed):
# "github:user/repo" = "templates/user-repo"
# "github:user/repo/subdir" = "src/components/external"

# Hugo templates
# "github:the-new-dynamics/minimal-hugo-theme" = "themes/minimal"

# Tool configurations
# "github:vercel/next.js/tree/canary/examples/with-tailwindcss" = "examples/next-tailwind"
EOF
        log_info "Created default .degit.toml. Please configure it before running again."
        exit 0
    fi
}

# Backup existing files before refresh
backup_files() {
    local backup_dir="$PROJECT_ROOT/.degit-backup-$(date +%Y%m%d-%H%M%S)"
    log_info "Creating backup in $backup_dir..."
    
    mkdir -p "$backup_dir"
    
    # Read config and backup target directories
    while IFS='=' read -r source target; do
        # Skip comments and empty lines
        [[ $source =~ ^[[:space:]]*# ]] && continue
        [[ -z "$source" ]] && continue
        
        # Remove quotes and whitespace
        source=$(echo "$source" | tr -d '"' | tr -d "'" | xargs)
        target=$(echo "$target" | tr -d '"' | tr -d "'" | xargs)
        
        if [[ -n "$target" && -d "$PROJECT_ROOT/$target" ]]; then
            log_info "Backing up $target..."
            cp -r "$PROJECT_ROOT/$target" "$backup_dir/"
        fi
    done < "$DEGIT_CONFIG"
    
    log_success "Backup completed"
}

# Refresh templates using degit
refresh_templates() {
    log_info "Refreshing templates..."
    
    while IFS='=' read -r source target; do
        # Skip comments and empty lines
        [[ $source =~ ^[[:space:]]*# ]] && continue
        [[ -z "$source" ]] && continue
        
        # Remove quotes and whitespace
        source=$(echo "$source" | tr -d '"' | tr -d "'" | xargs)
        target=$(echo "$target" | tr -d '"' | tr -d "'" | xargs)
        
        if [[ -n "$source" && -n "$target" ]]; then
            log_info "Refreshing $source -> $target..."
            
            # Remove existing target directory
            if [[ -d "$PROJECT_ROOT/$target" ]]; then
                rm -rf "$PROJECT_ROOT/$target"
            fi
            
            # Use degit to download/refresh
            cd "$PROJECT_ROOT"
            degit "$source" "$target"
            
            log_success "Refreshed $target"
        fi
    done < "$DEGIT_CONFIG"
}

# Main execution
main() {
    log_info "Starting degit refresh..."
    
    # Check dependencies
    check_degit
    
    # Load configuration
    load_config
    
    # Create backup
    backup_files
    
    # Refresh templates
    refresh_templates
    
    log_success "Degit refresh completed successfully!"
    log_info "Backup files are stored in .degit-backup-* directories"
    
    # Show next steps
    echo
    log_info "Next steps:"
    echo "  1. Review the refreshed files"
    echo "  2. Test your build: bun run dev"
    echo "  3. Commit changes if everything works"
    echo "  4. Clean up old backups if needed"
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --no-backup    Skip backup creation"
        echo
        exit 0
        ;;
    --no-backup)
        log_warning "Skipping backup (not recommended)"
        check_degit
        load_config
        refresh_templates
        log_success "Degit refresh completed (no backup)"
        ;;
    "")
        main
        ;;
    *)
        log_error "Unknown option: $1"
        exit 1
        ;;
esac