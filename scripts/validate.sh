#!/bin/bash

# Local development validation script
# Run this before pushing to catch issues early

echo "🚀 Running local validation..."
echo "================================"

# 1. Build the site
echo "📦 Building site..."
if ! npm run build; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build successful"

# 2. Run linting
echo "🔍 Running linters..."
npm run lint:yaml || exit 1
npm run lint:toml || exit 1
npm run lint:css || exit 1
echo "✅ Linting passed"

# 3. HTML validation
echo "🔗 Running HTML validation..."
if ! htmlproofer ./public --allow-hash-href --check-external-hash --disable-external --ignore-urls https://peterwarnock.github.io/ --checks "Links,Images,Scripts,HTML,OpenGraph"; then
    echo "❌ HTML validation failed"
    exit 1
fi
echo "✅ HTML validation passed"

# 4. SEO validation
echo "📈 Running SEO validation..."
missing=$(find public -name "*.html" | grep -v "/page/" | xargs grep -L '<meta name="description"' | wc -l)
if [ "$missing" -gt 0 ]; then
    echo "⚠️  WARNING: $missing pages missing meta descriptions"
    find public -name "*.html" | grep -v "/page/" | xargs grep -L '<meta name="description"' | head -5
    echo "⚠️  Consider adding meta descriptions for better SEO"
else
    echo "✅ SEO check passed"
fi

# 5. Security check
echo "🔒 Running security check..."
if ! npm audit --audit-level=moderate; then
    echo "⚠️  Security vulnerabilities found"
    echo "💡 Run 'npm audit fix' to resolve"
fi

# 6. Performance check (basic)
echo "⚡ Running performance check..."
total_size=$(du -sh public | cut -f1)
page_count=$(find public -name "*.html" | wc -l)
echo "📊 Site size: $total_size"
echo "📄 Page count: $page_count"

echo "================================"
echo "✅ All validation checks passed!"
echo "🚀 Ready to push to remote"