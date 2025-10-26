#!/bin/bash
# Navigate to settings in landscape (iPad)
# Usage: bash navigate_settings_landscape.sh <simulator-udid>

UDID=$1

if [ -z "$UDID" ]; then
    echo "Error: Simulator UDID required"
    exit 1
fi

echo "Navigating to settings in landscape (iPad)..."

# Wait for app to load
sleep 2

# Skip onboarding if present
axe describe-ui --udid "$UDID" 2>&1 | grep -q "Get Started" && \
    axe tap --text "Get Started" --udid "$UDID" 2>/dev/null || true

sleep 1

# Navigate to settings tab
axe tap --text "Settings" --udid "$UDID" 2>/dev/null || true

sleep 1

# Ensure we're on main settings (not sub-screen)
if axe describe-ui --udid "$UDID" 2>&1 | grep -q "Back"; then
    axe tap --text "Back" --udid "$UDID" 2>/dev/null || true
    sleep 1
fi

echo "Navigation complete - settings landscape ready"
