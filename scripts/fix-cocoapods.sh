#!/bin/bash

# Fix CocoaPods sandbox sync issues.
# Default mode is deterministic: keep Podfile.lock and just reinstall Pods.
# Optional flags allow deeper cleanup when required.

set -euo pipefail

RESET_LOCK=0
DEEP_CLEAN=0

for arg in "$@"; do
  case "$arg" in
    --reset-lock) RESET_LOCK=1 ;;
    --deep) DEEP_CLEAN=1 ;;
  esac
done

echo "Fixing CocoaPods sandbox sync issues..."

# Navigate to iOS directory
cd "$(dirname "$0")/../ios"

echo "Current directory: $(pwd)"

# Step 1: Remove existing pods
echo "Cleaning existing Pods installation..."
rm -rf Pods/
rm -rf build/

if [ "$RESET_LOCK" -eq 1 ]; then
  echo "Resetting Podfile.lock (non-deterministic, use only if lockfile is broken)..."
  rm -rf Podfile.lock
fi

if [ "$DEEP_CLEAN" -eq 1 ]; then
  # Step 2: Clean CocoaPods cache
  echo "Cleaning CocoaPods cache (deep mode)..."
  pod cache clean --all

  # Step 3: Clean Xcode derived data
  echo "Cleaning Xcode derived data (deep mode)..."
  rm -rf ~/Library/Developer/Xcode/DerivedData/DNSChat-*

  # Step 4: Clean iOS build artifacts
  echo "Cleaning iOS build artifacts (deep mode)..."
  rm -rf ~/Library/Caches/org.carthage.CarthageKit/DerivedData/
  rm -rf ~/Library/Caches/CocoaPods/
fi

# Step 5: Update CocoaPods if needed
echo "Updating CocoaPods..."
pod --version
# Uncomment if you want to update CocoaPods automatically
# gem install cocoapods

if [ "$DEEP_CLEAN" -eq 1 ]; then
  # Step 6: Deintegrate and reintegrate (deep mode)
  echo "Deintegrating CocoaPods (deep mode)..."
  pod deintegrate --verbose || echo "No previous integration found"
fi

# Step 7: Fresh pod install
echo "Installing pods..."
pod install --verbose

echo "CocoaPods fix completed successfully!"
echo ""
echo "Usage in the future:"
echo "   - Run this script whenever you see sandbox sync errors"
echo "   - Use 'npm run fix-pods' for quick access"
echo "   - For deep cleanup: npm run fix-pods -- --deep"
echo "   - If Podfile.lock is corrupted: npm run fix-pods -- --reset-lock"
echo ""
echo "You can now build your iOS app without sandbox sync issues!"
