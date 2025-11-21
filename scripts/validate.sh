#!/bin/bash

# Local development validation script
# Run this before pushing to catch issues early

echo "🚀 Running local validation..."
echo "================================"

# 1. Build the site
echo "📦 Building site..."
rm -rf public
if ! bun run build; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build successful"

# 2. Run linting
echo "🔍 Running linters..."
bun run lint:yaml || exit 1
bun run lint:toml || exit 1
bun run lint:css || exit 1
echo "✅ Linting passed"

# 3. Blog post validation
echo "📝 Validating blog posts..."
if ! ./scripts/validate-blog-post.sh; then
    echo "❌ Blog post validation failed"
    exit 1
fi
echo "✅ Blog posts validated"

# 4. URL configuration validation
echo "🔒 Checking URL configuration..."
if ! ./scripts/check-hardcoded-urls.sh; then
    echo "❌ URL configuration validation failed"
    exit 1
fi
echo "✅ URL configuration validated"

# 5. CDN integrity verification
echo "🌐 Verifying CDN integrity..."
if ! ./scripts/verify-cdn-integrity.sh; then
    echo "❌ CDN integrity verification failed"
    exit 1
fi
echo "✅ CDN integrity verified"

# 6. HTML validation
echo "🔗 Running HTML validation..."

# Ensure htmltest is available
if ! command -v htmltest &> /dev/null; then
    if [ -f "$(go env GOPATH)/bin/htmltest" ]; then
        export PATH=$PATH:$(go env GOPATH)/bin
    else
        echo "⚠️ htmltest not found. Installing..."
        go install github.com/wjdp/htmltest@latest
        export PATH=$PATH:$(go env GOPATH)/bin
    fi
fi

if ! htmltest; then
    echo "❌ HTML validation failed"
    exit 1
fi
echo "✅ HTML validation passed"

# 6. SEO validation
echo "📈 Running SEO validation..."
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

if [ "$missing" -gt 0 ]; then
    echo "⚠️  WARNING: $missing pages missing meta descriptions"
    printf '%s\n' "${missing_files[@]}"
    echo "⚠️  Consider adding meta descriptions for better SEO"
else
    echo "✅ SEO check passed"
fi



# 7. Security check
echo "🔒 Running security check..."
if ! bun audit --audit-level=moderate; then
    echo "⚠️  Security vulnerabilities found"
    echo "💡 Run 'bun audit fix' to resolve"
fi

# 8. Performance check (basic)
echo "⚡ Running performance check..."
total_size=$(du -sh public | cut -f1)
page_count=$(find public -name "*.html" | wc -l)
echo "📊 Site size: $total_size"
echo "📄 Page count: $page_count"

echo "================================"
echo "✅ All validation checks passed!"
echo "🚀 Ready to push to remote"
