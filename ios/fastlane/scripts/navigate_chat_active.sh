#!/bin/bash
# Navigate to active chat with messages
# Usage: bash navigate_chat_active.sh <simulator-udid>

UDID=$1

if [ -z "$UDID" ]; then
    echo "Error: Simulator UDID required"
    exit 1
fi

echo "Navigating to active chat state..."

# Wait for app to load
sleep 2

# Skip onboarding if present
axe describe-ui --udid "$UDID" 2>&1 | grep -q "Get Started" && \
    axe tap --text "Get Started" --udid "$UDID" 2>/dev/null || true

sleep 1

# Navigate to chat tab
axe describe-ui --udid "$UDID" 2>&1 | grep -q "Chat" && \
    axe tap --text "Chat" --udid "$UDID" 2>/dev/null || true

sleep 1

# Create new chat if on chat list
if axe describe-ui --udid "$UDID" 2>&1 | grep -q "New Chat"; then
    echo "Creating new chat..."
    axe tap --text "New Chat" --udid "$UDID"
    sleep 2
fi

# Type a message to create conversation
echo "Sending test message..."
axe tap --placeholder "Ask me anything..." --udid "$UDID" 2>/dev/null || \
    axe tap --text "Ask me anything..." --udid "$UDID" 2>/dev/null || true

sleep 1

# Type message
axe type --text "What is DNS and how does it work?" --udid "$UDID"
sleep 1

# Tap send button
# Try different ways to find send button
axe tap --text "Send" --udid "$UDID" 2>/dev/null || \
    axe tap --role "button" --index 0 --udid "$UDID" 2>/dev/null || true

sleep 3 # Wait for response

# Send another message to show conversation
axe tap --placeholder "Ask me anything..." --udid "$UDID" 2>/dev/null || true
sleep 1
axe type --text "Thanks for the explanation!" --udid "$UDID"
sleep 1
axe tap --text "Send" --udid "$UDID" 2>/dev/null || true

sleep 2

echo "Navigation complete - active chat ready"
