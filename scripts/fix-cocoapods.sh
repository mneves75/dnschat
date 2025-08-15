#!/bin/bash

# Fix CocoaPods sandbox sync issues permanently
# This script performs a comprehensive cleanup and reinstall of CocoaPods dependencies

set -e

echo "🛠️  Fixing CocoaPods sandbox sync issues..."

# Navigate to iOS directory
cd "$(dirname "$0")/../ios"

echo "📁 Current directory: $(pwd)"

# Step 1: Remove existing pods and caches
echo "🧹 Cleaning existing CocoaPods installation..."
rm -rf Pods/
rm -rf Podfile.lock
rm -rf build/

# Step 2: Clean CocoaPods cache
echo "🗑️  Cleaning CocoaPods cache..."
pod cache clean --all

# Step 3: Clean Xcode derived data
echo "🗑️  Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/DNSChat-*

# Step 4: Clean iOS build artifacts
echo "🗑️  Cleaning iOS build artifacts..."
rm -rf ~/Library/Caches/org.carthage.CarthageKit/DerivedData/
rm -rf ~/Library/Caches/CocoaPods/

# Step 5: Update CocoaPods if needed
echo "🔄 Updating CocoaPods..."
pod --version
# Uncomment if you want to update CocoaPods automatically
# gem install cocoapods

# Step 6: Deintegrate and reintegrate (if needed)
echo "🔄 Deintegrating CocoaPods..."
pod deintegrate --verbose || echo "No previous integration found"

# Step 7: Fresh pod install
echo "📦 Installing pods..."
pod install --verbose

echo "✅ CocoaPods fix completed successfully!"
echo ""
echo "💡 Usage in the future:"
echo "   - Run this script whenever you see sandbox sync errors"
echo "   - Use 'npm run fix-pods' for quick access"
echo ""
echo "🚀 You can now build your iOS app without sandbox sync issues!"