#!/bin/bash

# Review blog template with OpenCode server
# Prerequisites: opencode installed, running on port 4096

set -e

OPENCODE_URL="http://localhost:4096"
TEMPLATE_FILE="/Users/peter/github/pwarnock.github.io/layouts/_default/single.html"
SESSION_FILE="/tmp/opencode_session.txt"

echo "🚀 Starting blog template review with OpenCode..."

# Check if OpenCode server is running
if ! curl -s "$OPENCODE_URL/session" > /dev/null 2>&1; then
  echo "❌ OpenCode server not running on $OPENCODE_URL"
  echo "Start it with: opencode serve --port 4096"
  exit 1
fi

echo "✓ OpenCode server is running"

# Create session
echo "📝 Creating session..."
SESSION_ID=$(curl -s -X POST "$OPENCODE_URL/session" \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "build",
    "model": {
      "providerID": "anthropic",
      "modelID": "claude-3-5-haiku-20241022"
    }
  }' | jq -r '.id')

if [ -z "$SESSION_ID" ] || [ "$SESSION_ID" = "null" ]; then
  echo "❌ Failed to create session"
  exit 1
fi

echo "✓ Session created: $SESSION_ID"
echo "$SESSION_ID" > "$SESSION_FILE"

# Send template file + request
echo "📤 Sending template and request..."
curl -s -X POST "$OPENCODE_URL/session/$SESSION_ID/message" \
  -H "Content-Type: application/json" \
  -d '{
    "parts": [
      {
        "type": "text",
        "text": "Review this Hugo blog post template for aesthetics and UX improvements. Provide specific CSS/HTML suggestions to improve:\n1. Visual hierarchy and spacing\n2. Readability on mobile/desktop\n3. Interactive elements (buttons, tags, links)\n4. Color contrast and theme consistency\n5. Component reusability"
      },
      {
        "type": "file",
        "url": "file://'"$TEMPLATE_FILE"'",
        "filename": "single.html",
        "mime": "text/html"
      }
    ]
  }' > /dev/null

echo "✓ Request sent, streaming responses..."
echo ""
echo "─── OpenCode Response ───"
echo ""

# Stream responses
timeout 120 curl -s -N "$OPENCODE_URL/event" | while IFS= read -r line; do
  if [[ $line == "data:"* ]]; then
    json="${line#data:}"
    
    # Extract text from message updates
    if echo "$json" | jq -e '.type == "message.part.updated"' > /dev/null 2>&1; then
      if echo "$json" | jq -e '.properties.part.type == "text"' > /dev/null 2>&1; then
        echo "$json" | jq -r '.properties.part.text'
      fi
    fi
    
    # Check for completion
    if echo "$json" | jq -e '.type == "session.updated" and .properties.info.status == "completed"' > /dev/null 2>&1; then
      cost=$(echo "$json" | jq -r '.properties.info.cost // "N/A"')
      echo ""
      echo "─────────────────────"
      echo "✓ Session completed (Cost: \$$cost)"
      break
    fi
  fi
done

# Cleanup
rm -f "$SESSION_FILE"
