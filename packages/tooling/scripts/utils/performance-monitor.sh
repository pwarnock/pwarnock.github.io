#!/bin/bash

# Hugo Performance Monitor
# Monitors build performance and provides optimization suggestions

set -e

echo "🚀 Hugo Performance Monitor"
echo "============================"

# Function to time Hugo builds
time_build() {
    local build_type=$1
    local command=$2
    
    echo "📊 Timing $build_type build..."
    start_time=$(date +%s.%N)
    
    eval "$command" > /dev/null 2>&1
    
    end_time=$(date +%s.%N)
    duration=$(echo "$end_time - $start_time" | bc -l)
    
    printf "⏱️  %s build time: %.2f seconds\n" "$build_type" "$duration"
    echo "$duration"
}

# Function to analyze build output
analyze_build() {
    local build_dir=$1
    
    echo "📈 Analyzing build output..."
    
    # Count files
    total_files=$(find "$build_dir" -type f | wc -l)
    html_files=$(find "$build_dir" -name "*.html" | wc -l)
    css_files=$(find "$build_dir" -name "*.css" | wc -l)
    js_files=$(find "$build_dir" -name "*.js" | wc -l)
    image_files=$(find "$build_dir" \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.svg" \) | wc -l)
    
    echo "📄 Total files: $total_files"
    echo "🌐 HTML files: $html_files"
    echo "🎨 CSS files: $css_files"
    echo "⚡ JS files: $js_files"
    echo "📷 Image files: $image_files"
    
    # Check total size
    if command -v du >/dev/null 2>&1; then
        total_size=$(du -sh "$build_dir" | cut -f1)
        echo "💾 Total size: $total_size"
    fi
}

# Function to check cache effectiveness
check_cache() {
    echo "🗂️  Checking cache status..."
    
    cache_dir=".hugo_cache"
    if [ -d "$cache_dir" ]; then
        cache_size=$(du -sh "$cache_dir" 2>/dev/null | cut -f1 || echo "Unknown")
        echo "💽 Cache directory size: $cache_size"
        
        cache_files=$(find "$cache_dir" -type f 2>/dev/null | wc -l)
        echo "📋 Cache files: $cache_files"
    else
        echo "❌ Cache directory not found"
    fi
}

# Main execution
main() {
    # Clean previous builds
    echo "🧹 Cleaning previous builds..."
    rm -rf public
    
    # Time different build types
    echo ""
    dev_time=$(time_build "Development" "HUGO_ENV=development hugo --gc")
    echo ""
    
    rm -rf public
    prod_time=$(time_build "Production" "HUGO_ENV=production hugo --gc --minify")
    echo ""
    
    # Analyze production build
    analyze_build "public"
    echo ""
    
    # Check cache
    check_cache
    echo ""
    
    # Performance comparison
    echo "📊 Development build time: ${dev_time}s"
    echo "📊 Production build time: ${prod_time}s"
    
    # Optimization suggestions
    echo ""
    echo "💡 Optimization Suggestions:"
    
    if [ "$total_files" -gt 1000 ]; then
        echo "  • Consider reducing file count or implementing lazy loading"
    fi
    
    if [ "$js_files" -gt 10 ]; then
        echo "  • Consider bundling JavaScript files"
    fi
    
    if [ "$css_files" -gt 5 ]; then
        echo "  • Consider consolidating CSS files"
    fi
    
    echo ""
    echo "🎯 Performance monitoring complete!"
}

# Check dependencies
if ! command -v hugo >/dev/null 2>&1; then
    echo "❌ Hugo is not installed or not in PATH"
    exit 1
fi

if ! command -v bc >/dev/null 2>&1; then
    echo "⚠️  'bc' not found - some calculations may be skipped"
fi

# Run main function
main "$@"