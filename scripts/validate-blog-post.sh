#!/bin/bash

# Blog Post Validation Script
# Ensures all blog posts meet quality standards

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONTENT_DIR="$PROJECT_ROOT/content/blog/posts"

echo "🔍 Validating blog posts..."

# Function to validate a single blog post
validate_post() {
    local post_dir="$1"
    local index_file="$post_dir/index.md"
    
    if [[ ! -f "$index_file" ]]; then
        echo "❌ Missing index.md in $post_dir"
        return 1
    fi
    
    # Check required frontmatter fields
    local missing_fields=()
    
    if ! grep -q "^title:" "$index_file"; then
        missing_fields+=("title")
    fi
    
    if ! grep -q "^date:" "$index_file"; then
        missing_fields+=("date")
    fi
    
    if ! grep -q "^draft:" "$index_file"; then
        missing_fields+=("draft")
    fi
    
    if ! grep -q "^description:" "$index_file"; then
        missing_fields+=("description")
    fi
    
    if ! grep -q "^summary:" "$index_file"; then
        missing_fields+=("summary")
    fi
    
    if ! grep -q "^image:" "$index_file"; then
        missing_fields+=("image")
    fi
    
    if [[ ${#missing_fields[@]} -gt 0 ]]; then
        echo "❌ $(basename "$post_dir"): Missing required fields: ${missing_fields[*]}"
        echo "💡 Required fields: title, date, draft, description, summary, image"
        return 1
    fi
    
    # Check for H1 in content (should not exist)
    if grep -q "^# " "$index_file"; then
        echo "❌ $(basename "$post_dir"): Contains H1 heading in content (remove - title comes from frontmatter)"
        return 1
    fi
    
    # Check summary length (handle multi-line summaries)
    local summary=$(awk '/^summary:/{flag=1; next} flag && /^[^[:space:]]/{flag=0} flag{print}' "$index_file" | tr -d '\n"' | tr -s ' ')
    local summary_length=${#summary}
    
    if [[ $summary_length -lt 100 ]]; then
        echo "⚠️  $(basename "$post_dir"): Summary too short ($summary_length chars, recommend 150-200)"
    elif [[ $summary_length -gt 250 ]]; then
        echo "⚠️  $(basename "$post_dir"): Summary too long ($summary_length chars, recommend 150-200)"
    fi
    
    # Check for images and their paths
    # Check frontmatter image parameter
    local frontmatter_image=$(sed -n '/^image:/s/^image: *//p' "$index_file" | tr -d '"' | tr -d "'")
    if [[ -n "$frontmatter_image" ]]; then
        # Check for page bundle image first (in content directory)
        local bundle_path="$post_dir/$frontmatter_image"
        local static_path="$PROJECT_ROOT/static$frontmatter_image"
        
        if [[ -f "$bundle_path" ]]; then
            # Page bundle image found
            :
        elif [[ -f "$static_path" ]]; then
            # Static image found
            :
        else
            echo "❌ $(basename "$post_dir"): Frontmatter image not found: $frontmatter_image"
            return 1
        fi
    fi
    
    # Check content images
    if grep -q "src=\"/images/" "$index_file"; then
        local images=$(grep -o 'src="/images/[^"]*"' "$index_file" | sed 's/src="\([^"]*\)"/\1/')
        while IFS= read -r img; do
            local full_path="$PROJECT_ROOT/static$img"
            if [[ ! -f "$full_path" ]]; then
                echo "❌ $(basename "$post_dir"): Image not found: $img"
                return 1
            fi
        done <<< "$images"
    fi
    
    echo "✅ $(basename "$post_dir"): Valid"
    return 0
}

# Validate all posts or specific post
if [[ $# -eq 1 ]]; then
    # Validate specific post
    if [[ -d "$1" ]]; then
        validate_post "$1"
    else
        echo "❌ Directory not found: $1"
        exit 1
    fi
else
    # Validate all posts
    errors=0
    
    for post_dir in "$CONTENT_DIR"/*; do
        if [[ -d "$post_dir" ]]; then
            if ! validate_post "$post_dir"; then
                ((errors++))
            fi
        fi
    done
    
    if [[ $errors -gt 0 ]]; then
        echo ""
        echo "❌ Validation failed with $errors error(s)"
        exit 1
    fi
fi

echo ""
echo "✅ All blog posts validated successfully!"