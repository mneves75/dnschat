#!/bin/bash
# Navigate to settings screen
# Usage: bash navigate_settings.sh <simulator-udid>

UDID=$1

if [ -z "$UDID" ]; then
    echo "Error: Simulator UDID required"
    exit 1
fi

echo "Navigating to settings..."

# Wait for app to load
sleep 2

# Skip onboarding if present
axe describe-ui --udid "$UDID" 2>&1 | grep -q "Get Started" && \
    axe tap --text "Get Started" --udid "$UDID" 2>/dev/null || true

sleep 1

# Navigate to settings tab
axe tap --text "Settings" --udid "$UDID" 2>/dev/null || true

sleep 1

# Ensure we're on settings screen (not a sub-screen)
if axe describe-ui --udid "$UDID" 2>&1 | grep -q "Back"; then
    echo "In sub-screen, going back to main settings..."
    axe tap --text "Back" --udid "$UDID" 2>/dev/null || true
    sleep 1
fi

echo "Navigation complete - settings screen ready"
