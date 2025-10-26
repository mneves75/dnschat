#!/bin/bash
# Navigate to chat screen in landscape (iPad)
# Usage: bash navigate_chat_landscape.sh <simulator-udid>

UDID=$1

if [ -z "$UDID" ]; then
    echo "Error: Simulator UDID required"
    exit 1
fi

echo "Navigating to chat in landscape (iPad)..."

# Wait for app to load
sleep 2

# Skip onboarding if present
axe describe-ui --udid "$UDID" 2>&1 | grep -q "Get Started" && \
    axe tap --text "Get Started" --udid "$UDID" 2>/dev/null || true

sleep 1

# Navigate to chat tab
axe tap --text "Chat" --udid "$UDID" 2>/dev/null || true

sleep 1

# Create new chat if needed
if axe describe-ui --udid "$UDID" 2>&1 | grep -q "New Chat"; then
    echo "Creating new chat..."
    axe tap --text "New Chat" --udid "$UDID"
    sleep 2
fi

# Send a message to show conversation in landscape
axe tap --placeholder "Ask me anything..." --udid "$UDID" 2>/dev/null || true
sleep 1
axe type --text "Show me how DNS works on a tablet display" --udid "$UDID"
sleep 1
axe tap --text "Send" --udid "$UDID" 2>/dev/null || true

sleep 3

echo "Navigation complete - chat landscape ready"
