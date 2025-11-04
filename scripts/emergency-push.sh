#!/bin/bash

# Emergency push script - bypasses pre-push guardrail
# Use only in emergency situations when immediate deployment is required

echo "🚨 EMERGENCY PUSH MODE"
echo "======================="
echo ""
echo "⚠️  WARNING: This bypasses the push guardrail!"
echo "⚠️  Only use in emergency situations!"
echo ""
echo "This will push changes WITHOUT confirmation."
echo ""

read -p "Are you sure you want to proceed? Type 'emergency' to confirm: " confirm

if [ "$confirm" != "emergency" ]; then
    echo "❌ Emergency push cancelled."
    exit 1
fi

echo ""
echo "🔄 Pushing with --no-verify flag..."
git push --no-verify

echo ""
echo "✅ Emergency push completed."
