#!/bin/bash

# Review blog template with OpenCode server (already running)
set -e

OPENCODE_URL="http://localhost:4096"
TEMPLATE_FILE="/Users/peter/github/pwarnock.github.io/layouts/_default/single.html"

echo "🚀 Blog Template Review with OpenCode"
echo ""

# Create session
echo "📝 Creating session..."
SESSION_RESPONSE=$(curl -s -X POST "$OPENCODE_URL/session" \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "build",
    "model": {
      "providerID": "anthropic",
      "modelID": "claude-3-5-haiku-20241022"
    }
  }')

SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.id')
echo "✓ Session: $SESSION_ID"
echo ""

# Send file + request
echo "📤 Sending template for review..."
curl -s -X POST "$OPENCODE_URL/session/$SESSION_ID/message" \
  -H "Content-Type: application/json" \
  -d '{
    "parts": [
      {
        "type": "text",
        "text": "Review this Hugo blog post template for aesthetics and UX improvements. Provide specific CSS/HTML suggestions to improve:\n1. Visual hierarchy and spacing\n2. Mobile vs desktop readability\n3. Button/tag/link styling\n4. Dark/light theme consistency\n5. Component reusability\n6. Typography sizing\n\nBe practical and actionable."
      },
      {
        "type": "file",
        "url": "file://'"$TEMPLATE_FILE"'",
        "filename": "single.html",
        "mime": "text/html"
      }
    ]
  }' > /dev/null

echo "✓ Request sent"
echo ""
echo "─── Response ───"
echo ""

# Poll for completion
MAX_ATTEMPTS=120
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  SESSION_DATA=$(curl -s "$OPENCODE_URL/session/$SESSION_ID")
  STATUS=$(echo "$SESSION_DATA" | jq -r '.status // empty')

  if [ "$STATUS" = "completed" ]; then
    # Get messages
    MESSAGES=$(echo "$SESSION_DATA" | jq -r '.messages[]?.content // empty')
    if [ ! -z "$MESSAGES" ]; then
      echo "$MESSAGES"
    fi

    echo ""
    echo "─────────────"
    COST=$(echo "$SESSION_DATA" | jq -r '.cost // "N/A"')
    TOKENS=$(echo "$SESSION_DATA" | jq -r '.usage.totalTokens // "N/A"')
    echo "✓ Completed"
    echo "💰 Cost: \$$COST"
    echo "📊 Tokens: $TOKENS"
    exit 0
  fi

  ATTEMPT=$((ATTEMPT + 1))
  sleep 1
done

echo "❌ Timeout waiting for response"
exit 1
