#!/bin/bash
# Navigate to about screen in landscape (iPad)
# Usage: bash navigate_about_landscape.sh <simulator-udid>

UDID=$1

if [ -z "$UDID" ]; then
    echo "Error: Simulator UDID required"
    exit 1
fi

echo "Navigating to about in landscape (iPad)..."

# Wait for app to load
sleep 2

# Skip onboarding if present
axe describe-ui --udid "$UDID" 2>&1 | grep -q "Get Started" && \
    axe tap --text "Get Started" --udid "$UDID" 2>/dev/null || true

sleep 1

# Navigate to settings first
axe tap --text "Settings" --udid "$UDID" 2>/dev/null || true

sleep 1

# Tap "About"
axe tap --text "About" --udid "$UDID" 2>/dev/null || true

sleep 1

echo "Navigation complete - about landscape ready"
