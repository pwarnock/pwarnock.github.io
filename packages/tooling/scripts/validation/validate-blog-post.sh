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
    
    # Extract content type from frontmatter
    local content_type=$(awk '/^content_type:/{print $2}' "$index_file" | tr -d "'" | tr -d '"')
    [[ -z "$content_type" ]] && content_type="original"
    
    # Load content type requirements from data file
    local content_types_file="$PROJECT_ROOT/data/content_types.yaml"
    local required_fields=()
    local optional_fields=()
    
    # Parse YAML to get required fields for content type
    if [[ -f "$content_types_file" ]]; then
        # Simple YAML parsing for required fields
        local in_content_type=false
        local in_required=false
        local current_type=""
        
        while IFS= read -r line; do
            if [[ "$line" =~ ^[[:space:]]*([a-z_]+):[[:space:]]*$ ]]; then
                current_type="${BASH_REMATCH[1]}"
                if [[ "$current_type" == "$content_type" ]]; then
                    in_content_type=true
                else
                    in_content_type=false
                fi
                in_required=false
            elif [[ "$in_content_type" == true && "$line" =~ ^[[:space:]]*required:[[:space:]]*$ ]]; then
                in_required=true
            elif [[ "$in_required" == true && "$line" =~ ^[[:space:]]*-[[:space:]]*([a-z_]+) ]]; then
                required_fields+=("${BASH_REMATCH[1]}")
            elif [[ "$in_required" == true && "$line" =~ ^[[:space:]]*optional:[[:space:]]*$ ]]; then
                in_required=false
            fi
        done < "$content_types_file"
    fi
    
    # Always check these base fields
    local base_fields=("title" "date" "summary")
    local missing_fields=()
    
    # Check base required fields
    for field in "${base_fields[@]}"; do
        if ! grep -q "^$field:" "$index_file"; then
            missing_fields+=("$field")
        fi
    done
    
    # Check content type specific required fields
    for field in "${required_fields[@]}"; do
        if ! grep -q "^$field:" "$index_file"; then
            missing_fields+=("$field")
        fi
    done
    
    # Image field is optional - only validate if present
    # if ! grep -q "^image:" "$index_file"; then
    #     missing_fields+=("image")
    # fi
    
    if [[ ${#missing_fields[@]} -gt 0 ]]; then
        echo "❌ $(basename "$post_dir"): Missing required fields for content type '$content_type': ${missing_fields[*]}"
        echo "💡 Content type '$content_type' requires: ${base_fields[*]} ${required_fields[*]}"
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