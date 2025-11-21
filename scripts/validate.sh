#!/bin/bash

# Local development validation script
# Run this before pushing to catch issues early

# Check for flags
JSON_MODE=false
SKIP_BUILD=false
if [[ "$1" == "--json" ]]; then
    JSON_MODE=true
fi
if [[ "$1" == "--skip-build" || "$2" == "--skip-build" ]]; then
    SKIP_BUILD=true
fi

if [[ "$JSON_MODE" == false ]]; then
    echo "🚀 Running local validation..."
    echo "================================"
fi

# 1. Build the site (skip if requested)
if [[ "$SKIP_BUILD" == false ]]; then
    rm -rf public
    if [[ "$JSON_MODE" == true ]]; then
        bun run build >/dev/null 2>&1
        build_exit_code=$?
        if [[ $build_exit_code -ne 0 ]]; then
            echo '{"status": "error", "step": "build", "message": "Build failed"}'
            exit 1
        fi
    else
        if ! bun run build; then
            echo "❌ Build failed"
            exit 1
        fi
        echo "✅ Build successful"
    fi
fi

# 2. Run linting
if [[ "$JSON_MODE" == false ]]; then
    echo "🔍 Running linters..."
fi
if ! bun run lint:yaml; then
    if [[ "$JSON_MODE" == true ]]; then
        echo '{"status": "error", "step": "lint", "message": "YAML lint failed"}'
    fi
    exit 1
fi
if ! bun run lint:toml; then
    if [[ "$JSON_MODE" == true ]]; then
        echo '{"status": "error", "step": "lint", "message": "TOML lint failed"}'
    fi
    exit 1
fi
if ! bun run lint:css; then
    if [[ "$JSON_MODE" == true ]]; then
        echo '{"status": "error", "step": "lint", "message": "CSS lint failed"}'
    fi
    exit 1
fi
if [[ "$JSON_MODE" == false ]]; then
    echo "✅ Linting passed"
fi

# 3. Blog post validation
if [[ "$JSON_MODE" == false ]]; then
    echo "📝 Validating blog posts..."
fi
if ! ./scripts/validate-blog-post.sh; then
    if [[ "$JSON_MODE" == true ]]; then
        echo '{"status": "error", "step": "blog_validation", "message": "Blog post validation failed"}'
    else
        echo "❌ Blog post validation failed"
    fi
    exit 1
fi
if [[ "$JSON_MODE" == false ]]; then
    echo "✅ Blog posts validated"
fi

# 4. URL configuration validation
if [[ "$JSON_MODE" == false ]]; then
    echo "🔒 Checking URL configuration..."
fi
if ! ./scripts/check-hardcoded-urls.sh; then
    if [[ "$JSON_MODE" == true ]]; then
        echo '{"status": "error", "step": "url_validation", "message": "URL configuration validation failed"}'
    else
        echo "❌ URL configuration validation failed"
    fi
    exit 1
fi
if [[ "$JSON_MODE" == false ]]; then
    echo "✅ URL configuration validated"
fi

# 5. CDN integrity verification
if [[ "$JSON_MODE" == false ]]; then
    echo "🌐 Verifying CDN integrity..."
fi
if ! ./scripts/verify-cdn-integrity.sh; then
    if [[ "$JSON_MODE" == true ]]; then
        echo '{"status": "error", "step": "cdn_validation", "message": "CDN integrity verification failed"}'
    else
        echo "❌ CDN integrity verification failed"
    fi
    exit 1
fi
if [[ "$JSON_MODE" == false ]]; then
    echo "✅ CDN integrity verified"
fi

# 6. HTML validation
if [[ "$JSON_MODE" == false ]]; then
    echo "🔗 Running HTML validation..."
fi

# Ensure htmltest is available
if ! command -v htmltest &> /dev/null; then
    if [ -f "$(go env GOPATH)/bin/htmltest" ]; then
        export PATH=$PATH:$(go env GOPATH)/bin
    else
        if [[ "$JSON_MODE" == false ]]; then
            echo "⚠️ htmltest not found. Installing..."
        fi
        go install github.com/wjdp/htmltest@latest
        export PATH=$PATH:$(go env GOPATH)/bin
    fi
fi

if [[ ! -d "public" ]]; then
    if [[ "$JSON_MODE" == true ]]; then
        echo '{"status": "error", "step": "html_validation", "message": "No public directory found - site not built"}'
    else
        echo "❌ No public directory found - site not built"
    fi
    exit 1
fi

if ! htmltest; then
    if [[ "$JSON_MODE" == true ]]; then
        echo '{"status": "error", "step": "html_validation", "message": "HTML validation failed"}'
    else
        echo "❌ HTML validation failed"
    fi
    exit 1
fi
if [[ "$JSON_MODE" == false ]]; then
    echo "✅ HTML validation passed"
fi

# 6. SEO validation
if [[ "$JSON_MODE" == false ]]; then
    echo "📈 Running SEO validation..."
fi
# Find HTML files that are not pagination pages and not Hugo alias redirects
html_files=$(find public -name "*.html" | grep -v "/page/")
missing=0
missing_files=()

for file in $html_files; do
    # Skip Hugo alias/redirect pages (they have meta http-equiv="refresh")
    if grep -q 'meta http-equiv=refresh' "$file"; then
        continue
    fi

    # Skip technical/utility pages that don't need descriptions
    if echo "$file" | grep -q -E '\.(xml|json)$'; then
        continue
    fi

    # Check if the file has a meta description
    if ! grep -q '<meta name=description' "$file"; then
        missing=$((missing + 1))
        if [ ${#missing_files[@]} -lt 5 ]; then
            missing_files+=("$file")
        fi
    fi
done

if [[ "$JSON_MODE" == false ]]; then
    if [ "$missing" -gt 0 ]; then
        echo "⚠️  WARNING: $missing pages missing meta descriptions"
        printf '%s\n' "${missing_files[@]}"
        echo "⚠️  Consider adding meta descriptions for better SEO"
    else
        echo "✅ SEO check passed"
    fi

    echo "================================"
    echo "✅ All validation checks passed!"
    echo "🚀 Ready to push to remote"
else
    # Output structured JSON for machine consumption
    echo "{\"status\": \"success\", \"site_size\": \"$total_size\", \"page_count\": $page_count, \"seo_missing_descriptions\": $missing}"
fi



# 7. Security check
if [[ "$JSON_MODE" == false ]]; then
    echo "🔒 Running security check..."
fi
if ! bun audit --audit-level=moderate; then
    if [[ "$JSON_MODE" == false ]]; then
        echo "⚠️  Security vulnerabilities found"
        echo "💡 Run 'bun audit fix' to resolve"
    fi
fi

# 8. Performance check (basic)
if [[ "$JSON_MODE" == false ]]; then
    echo "⚡ Running performance check..."
fi
total_size=$(du -sh public | cut -f1)
page_count=$(find public -name "*.html" | wc -l)
if [[ "$JSON_MODE" == false ]]; then
    echo "📊 Site size: $total_size"
    echo "📄 Page count: $page_count"
    echo "================================"
    echo "✅ All validation checks passed!"
    echo "🚀 Ready to push to remote"
else
    # Output structured JSON for machine consumption
    echo "{\"status\": \"success\", \"site_size\": \"$total_size\", \"page_count\": $page_count, \"seo_missing_descriptions\": $missing}"
fi
