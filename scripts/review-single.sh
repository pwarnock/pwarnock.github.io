#!/bin/bash

TEMPLATE="/Users/peter/github/pwarnock.github.io/layouts/_default/single.html"
API="http://127.0.0.1:56979"

# Create session
SESSION_ID=$(curl -s -X POST "$API/session" \
  -H "Content-Type: application/json" \
  -d '{"title":"Review single.html"}' | jq -r '.id')

echo "📝 Session: $SESSION_ID"
echo ""

# Send message with file
curl -s -X POST "$API/session/$SESSION_ID/message" \
  -H "Content-Type: application/json" \
  -d '{
    "parts": [{
      "type": "text",
      "text": "Review this Hugo blog template. Focus on template structure, logic, and any issues."
    }, {
      "type": "file",
      "url": "file://'"$TEMPLATE"'",
      "filename": "single.html",
      "mime": "text/html"
    }]
  }' > /dev/null

echo "⏳ Waiting for response..."
echo ""

# Poll for messages
for i in {1..120}; do
  MESSAGES=$(curl -s "$API/session/$SESSION_ID/message" | jq '.[-1].info.role // empty' 2>/dev/null)

  if [ "$MESSAGES" = '"assistant"' ]; then
    # Got assistant response
    curl -s "$API/session/$SESSION_ID/message" | jq -r '.[-1].parts[] | select(.type=="text") | .text'
    break
  fi

  sleep 1
done
