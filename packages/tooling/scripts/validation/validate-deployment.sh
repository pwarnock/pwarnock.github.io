#!/bin/bash
# Deployment validation script
# Performs comprehensive checks before and after deployments

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are available
check_tools() {
    local required_tools=("git" "hugo" "bun" "node")
    
    log_info "Checking required tools..."
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Required tool not found: $tool"
            return 1
        fi
    done
    log_success "All required tools available"
}

# Validate Git state
validate_git_state() {
    log_info "Validating Git state..."
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        log_error "Uncommitted changes detected"
        git status --short
        return 1
    fi
    
    # Check remote is up to date
    git fetch upstream --quiet
    local current_branch=$(git branch --show-current)
    
    if [ "$current_branch" = "main" ] && ! git merge-base --is-ancestor HEAD upstream/main; then
        log_error "Local $current_branch is behind upstream/main"
        return 1
    fi
    
    log_success "Git state valid"
}

# Validate CSS processing
validate_css() {
    log_info "Validating CSS processing..."
    
    # Check for unprocessed CSS directives
    if [ -f "static/css/main.css" ]; then
        if grep -E "@import|@plugin|@tailwind" static/css/main.css > /dev/null; then
            log_error "CSS contains unprocessed directives"
            grep -E "@import|@plugin|@tailwind" static/css/main.css | head -5
            return 1
        fi
        
        # Verify CSS has actual content (not just directives)
        local line_count=$(wc -l < static/css/main.css)
        if [ "$line_count" -lt 100 ]; then
            log_warning "CSS file seems too small ($line_count lines)"
        fi
        
        log_success "CSS validation passed"
    else
        log_warning "CSS file not found: static/css/main.css"
    fi
}

# Validate Hugo configuration
validate_hugo_config() {
    local env="$1"
    
    log_info "Validating Hugo configuration for $env environment..."
    
    case "$env" in
        "development")
            if ! grep -q "baseURL = \"http://localhost" config/development/hugo.toml; then
                log_error "Development baseURL not correctly configured"
                return 1
            fi
            ;;
        "staging")
            # Staging should have a valid domain
            if ! grep -q "baseURL = " config/staging/hugo.toml 2>/dev/null; then
                log_warning "No staging-specific Hugo config found"
            fi
            ;;
        "production")
            if ! grep -q "baseURL = \"https://peterwarnock.com" config/production/hugo.toml; then
                log_error "Production baseURL not correctly configured"
                return 1
            fi
            if ! grep -q "googleAnalytics" config/production/hugo.toml; then
                log_error "Google Analytics not configured in production"
                return 1
            fi
            ;;
    esac
    
    log_success "Hugo config validated for $env"
}

# Validate build output
validate_build_output() {
    log_info "Validating build output..."
    
    if [ ! -d "public" ]; then
        log_error "Build directory 'public' not found"
        return 1
    fi
    
    # Check for critical files
    local critical_files=("public/index.html" "public/css/main.css" "public/about/index.html")
    
    for file in "${critical_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "Critical file missing: $file"
            return 1
        fi
    done
    
    # Count HTML files
    local html_count=$(find public -name "*.html" | wc -l)
    log_info "Generated $html_count HTML files"
    
    if [ "$html_count" -lt 10 ]; then
        log_error "Build produced fewer than 10 HTML files (got $html_count)"
        return 1
    fi
    
    log_success "Build output validation passed"
}

# Validate security
validate_security() {
    log_info "Running security validation..."
    
    # Check for hardcoded URLs (except allowed domains)
    local hardcoded=$(grep -r "http://" content/ 2>/dev/null || true)
    if [ -n "$hardcoded" ]; then
        log_warning "Hardcoded HTTP URLs found in content (should use HTTPS):"
        echo "$hardcoded" | head -3
    fi
    
    # Check for exposed secrets
    if grep -r "password\|secret\|token\|api_key" content/ 2>/dev/null | grep -v "^Binary"; then
        log_error "Potential secrets found in content"
        return 1
    fi
    
    log_success "Security validation passed"
}

# Validate accessibility
validate_accessibility() {
    log_info "Checking for accessibility issues..."
    
    # Look for common a11y issues
    local issues=0
    
    # Check for alt text on images
    if grep -r "<img[^>]*>" public/ 2>/dev/null | grep -v "alt=" | wc -l | grep -qv "^0$"; then
        log_warning "Some images missing alt text"
        issues=$((issues + 1))
    fi
    
    # Check for language declaration
    if ! grep -q "lang=\"en\"" public/index.html; then
        log_warning "Language attribute not set on HTML root"
        issues=$((issues + 1))
    fi
    
    if [ $issues -eq 0 ]; then
        log_success "Accessibility checks passed"
    else
        log_warning "Found $issues accessibility warnings"
    fi
}

# Validate links
validate_links() {
    log_info "Validating internal links..."
    
    local broken_links=0
    
    # Check for broken internal links
    find public -name "*.html" -exec grep -H 'href="/' {} \; 2>/dev/null | while read line; do
        file=$(echo "$line" | cut -d: -f1)
        href=$(echo "$line" | sed -n 's/.*href="\([^"]*\)".*/\1/p')
        
        if [[ "$href" == /* && ! "$href" == "//"* ]]; then
            # Remove query string and fragment
            path="${href%%\?*}"
            path="${path%%#*}"
            
            # Check if file exists
            target_file="public${path}"
            target_index="public${path}/index.html"
            
            if [ ! -f "$target_file" ] && [ ! -f "$target_index" ]; then
                log_warning "Broken link in $(basename $file): $href"
                broken_links=$((broken_links + 1))
            fi
        fi
    done
    
    if [ $broken_links -eq 0 ]; then
        log_success "Link validation passed - no broken links"
    else
        log_warning "Found $broken_links broken internal links"
    fi
}

# Validate environment-specific settings
validate_environment() {
    local env="$1"
    
    log_info "Validating environment-specific settings for $env..."
    
    case "$env" in
        "staging")
            # Staging should have analytics disabled or pointing to test GA
            if grep -q "googleAnalytics = \"G-" config/staging/hugo.toml 2>/dev/null; then
                log_warning "Staging has production analytics enabled"
            fi
            ;;
        "production")
            # Production must have analytics enabled
            if ! grep -q "googleAnalytics = \"G-" config/production/hugo.toml; then
                log_error "Production analytics not configured"
                return 1
            fi
            ;;
    esac
    
    log_success "Environment validation passed for $env"
}

# Comprehensive pre-deployment check
pre_deployment_check() {
    local env="$1"
    
    echo -e "${BLUE}🔍 Pre-Deployment Validation for $env${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo ""
    
    check_tools || return 1
    validate_git_state || return 1
    validate_hugo_config "$env" || return 1
    validate_css || return 1
    validate_security || return 1
    
    echo ""
    log_success "Pre-deployment validation passed"
}

# Comprehensive post-deployment check
post_deployment_check() {
    local env="$1"
    local site_url="$2"
    
    echo -e "${BLUE}✅ Post-Deployment Validation for $env${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo ""
    
    validate_build_output || return 1
    validate_accessibility || return 1
    validate_links || return 1
    validate_environment "$env" || return 1
    
    if [ -n "$site_url" ]; then
        log_info "Checking site availability at $site_url..."
        if command -v curl &> /dev/null; then
            if curl -sf "$site_url" > /dev/null 2>&1; then
                log_success "Site is accessible: $site_url"
            else
                log_warning "Could not reach site: $site_url (may be in progress)"
            fi
        fi
    fi
    
    echo ""
    log_success "Post-deployment validation passed"
}

# Show help
show_help() {
    echo "Deployment Validation Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  pre ENV              Run pre-deployment checks for ENV (staging|production)"
    echo "  post ENV [URL]       Run post-deployment checks for ENV with optional site URL"
    echo "  full ENV [URL]       Run all checks for ENV"
    echo ""
    echo "Examples:"
    echo "  $0 pre staging"
    echo "  $0 post production https://peterwarnock.com"
    echo "  $0 full staging http://staging.example.com"
}

# Main
if [ $# -eq 0 ]; then
    show_help
    exit 1
fi

case "$1" in
    pre)
        pre_deployment_check "${2:-staging}"
        ;;
    post)
        post_deployment_check "${2:-staging}" "${3:-}"
        ;;
    full)
        pre_deployment_check "${2:-staging}" && post_deployment_check "${2:-staging}" "${3:-}"
        ;;
    -h|--help)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
