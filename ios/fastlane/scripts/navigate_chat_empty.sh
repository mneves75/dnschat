#!/bin/bash
# Navigate to empty chat state
# Usage: bash navigate_chat_empty.sh <simulator-udid>

UDID=$1

if [ -z "$UDID" ]; then
    echo "Error: Simulator UDID required"
    exit 1
fi

echo "Navigating to empty chat state..."

# Wait for app to load
sleep 2

# If onboarding is shown, skip it
# Tap "Get Started" button if present
axe describe-ui --udid "$UDID" 2>&1 | grep -q "Get Started" && \
    axe tap --text "Get Started" --udid "$UDID" 2>/dev/null || true

sleep 1

# Navigate to chat tab (should be default, but ensure we're there)
# Tap "Chat" tab if needed
axe describe-ui --udid "$UDID" 2>&1 | grep -q "Chat" && \
    axe tap --text "Chat" --udid "$UDID" 2>/dev/null || true

sleep 1

# Check if we're on chat list or empty state
# If on chat list, tap "New Chat" to get to empty state
if axe describe-ui --udid "$UDID" 2>&1 | grep -q "New Chat"; then
    echo "On chat list, creating new chat..."
    axe tap --text "New Chat" --udid "$UDID"
    sleep 2
fi

# Should now be on empty chat state
echo "Navigation complete - empty chat state ready"
