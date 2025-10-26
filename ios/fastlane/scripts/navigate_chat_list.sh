#!/bin/bash
# Navigate to chat list screen
# Usage: bash navigate_chat_list.sh <simulator-udid>

UDID=$1

if [ -z "$UDID" ]; then
    echo "Error: Simulator UDID required"
    exit 1
fi

echo "Navigating to chat list..."

# Wait for app to load
sleep 2

# Skip onboarding if present
axe describe-ui --udid "$UDID" 2>&1 | grep -q "Get Started" && \
    axe tap --text "Get Started" --udid "$UDID" 2>/dev/null || true

sleep 1

# Navigate to chat list tab (should show "Chats" or "Chat List")
# Try different tab names
axe tap --text "Chats" --udid "$UDID" 2>/dev/null || \
    axe tap --text "Chat List" --udid "$UDID" 2>/dev/null || \
    axe tap --text "Chat" --udid "$UDID" 2>/dev/null || true

sleep 1

# If we're in a chat, go back to list
if axe describe-ui --udid "$UDID" 2>&1 | grep -q "Back"; then
    echo "In chat, going back to list..."
    axe tap --text "Back" --udid "$UDID" 2>/dev/null || true
    sleep 1
fi

echo "Navigation complete - chat list ready"
