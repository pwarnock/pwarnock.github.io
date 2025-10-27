#!/bin/bash

# Accessibility Testing Script
# This script helps validate accessibility improvements

echo "🔍 Running Accessibility Tests..."
echo "================================"

# Check for common accessibility issues
echo "1. Checking for missing alt text..."
find . -name "*.html" -not -path "./node_modules/*" -not -path "./public/*" -exec grep -l "<img" {} \; | while read file; do
    echo "Checking $file..."
    grep -n "<img" "$file" | grep -v "alt=" && echo "⚠️  Found img without alt text in $file"
done

echo ""
echo "2. Checking for proper heading hierarchy..."
find . -name "*.html" -not -path "./node_modules/*" -not -path "./public/*" -exec grep -l "<h[1-6]" {} \; | while read file; do
    echo "Checking $file..."
    # This is a simple check - you might want to use a more sophisticated tool
    h1_count=$(grep -c "<h1" "$file" 2>/dev/null || echo "0")
    if [ "$h1_count" -gt 1 ]; then
        echo "⚠️  Multiple H1 tags found in $file"
    fi
done

echo ""
echo "3. Checking for form labels..."
find . -name "*.html" -not -path "./node_modules/*" -not -path "./public/*" -exec grep -l "<input" {} \; | while read file; do
    echo "Checking $file..."
    # Look for inputs that might need labels (excluding hidden, submit, button, and aria-hidden inputs)
    grep -n "<input" "$file" | grep -v "type=\"hidden\"" | grep -v "type=\"submit\"" | grep -v "type=\"button\"" | grep -v "aria-hidden" | while read line; do
        input_id=$(echo "$line" | grep -o 'id="[^"]*"' | sed 's/id="//;s/"//')
        if [ -n "$input_id" ]; then
            # Check if there's a corresponding label
            if ! grep -q "for=\"$input_id\"" "$file"; then
                echo "⚠️  Input with id='$input_id' may need a label in $file"
            fi
        else
            # Check for aria-label or aria-labelledby
            if ! echo "$line" | grep -q "aria-label=" && ! echo "$line" | grep -q "aria-labelledby="; then
                echo "⚠️  Found input without proper labeling in $file: $line"
            fi
        fi
    done
done

echo ""
echo "4. Checking for ARIA landmarks..."
find . -name "*.html" -not -path "./node_modules/*" -not -path "./public/*" -exec grep -l "role=" {} \; | while read file; do
    echo "Found ARIA roles in $file"
done

echo ""
echo "5. Checking for skip links..."
find . -name "*.html" -not -path "./node_modules/*" -not -path "./public/*" -exec grep -l "Skip to" {} \; | while read file; do
    echo "✅ Found skip link in $file"
done

echo ""
echo "6. Checking for focus management..."
find . -name "*.css" -not -path "./node_modules/*" -not -path "./public/*" -exec grep -l ":focus" {} \; | while read file; do
    echo "✅ Found focus styles in $file"
done

echo ""
echo "7. Checking for reduced motion support..."
find . -name "*.css" -not -path "./node_modules/*" -not -path "./public/*" -exec grep -l "prefers-reduced-motion" {} \; | while read file; do
    echo "✅ Found reduced motion support in $file"
done

echo ""
echo "8. Checking for color scheme meta tag..."
find . -name "*.html" -not -path "./node_modules/*" -not -path "./public/*" -exec grep -l "color-scheme" {} \; | while read file; do
    echo "✅ Found color scheme meta tag in $file"
done

echo ""
echo "🎯 Accessibility Test Complete!"
echo ""
echo "Recommendations:"
echo "- Install axe-core for automated accessibility testing"
echo "- Test with screen readers (NVDA, VoiceOver, JAWS)"
echo "- Test keyboard navigation thoroughly"
echo "- Validate color contrast with tools like WebAIM Contrast Checker"
echo "- Test with real assistive technology users"