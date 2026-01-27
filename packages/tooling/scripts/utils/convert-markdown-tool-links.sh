#!/bin/bash

# Convert markdown tool links to shortcodes
# Usage: ./scripts/convert-markdown-tool-links.sh

set -e

CONTENT_DIR="content/blog/posts"

echo "🔄 Converting markdown tool links to {{< tool-link >}} shortcodes..."
echo ""

converted=0
for post_dir in "$CONTENT_DIR"/*; do
  if [ -d "$post_dir" ]; then
    post_file="$post_dir/index.md"
    if [ -f "$post_file" ]; then
      basename=$(basename "$post_dir")
      
      # Find all markdown links to /tools/
      if grep -q "\[.*\]([/]tools/" "$post_file"; then
        echo "📝 $basename"
        
        # Extract and convert each link
        while IFS= read -r line; do
          # Match pattern: [Text](/tools/slug/)
          if [[ $line =~ \[([^\]]+)\]\(\/tools\/([^\/]+)\/?\) ]]; then
            text="${BASH_REMATCH[1]}"
            slug="${BASH_REMATCH[2]}"
            
            echo "  ✓ [$text](/tools/$slug/) → {{< tool-link \"$slug\" \"$text\" >}}"
            
            # Replace in file (sed with proper escaping)
            sed -i '' "s|\[${text}\]([/]tools/${slug}/)|{{< tool-link \"${slug}\" \"${text}\" >}}|g" "$post_file"
            
            converted=$((converted + 1))
          fi
        done < <(grep "\[.*\]([/]tools/" "$post_file")
      fi
    fi
  fi
done

echo ""
echo "✅ Conversion complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Links converted: $converted"
echo ""
echo "Next: Run 'bun run validate:links' to verify all conversions"
