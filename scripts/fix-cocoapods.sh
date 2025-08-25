#!/bin/bash

# Fix CocoaPods sandbox sync issues and Xcode PIF session problems
# This script performs a comprehensive cleanup:
# - Terminates stale Xcode build services (PIF session resets)
# - Cleans Xcode caches (DerivedData, ModuleCache, SwiftPM, Xcode cache)
# - Resets CocoaPods (deintegrate, cache clean, fresh install)

set -e

echo "🛠️  Fixing CocoaPods/Xcode build environment (Pods + PIF) ..."

# Step 0: Stop stale Xcode build services (safe; Xcode will respawn)
echo "⛔ Stopping stale Xcode/Build services (if any)..."
pkill -f 'Xcode' || true
pkill -f 'xcodebuild' || true
pkill -f 'XCBBuildService' || true
pkill -f 'XCBuild' || true
pkill -f 'SourceKit' || true
sleep 1

# Toolchain info (helpful diagnostics)
echo "🧰 Xcode toolchain:"
xcodebuild -version || true
xcode-select -p || true

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

# Step 3: Clean Xcode caches (PIF/session related)
echo "🗑️  Cleaning Xcode DerivedData (all projects)..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*

echo "🗑️  Cleaning Xcode ModuleCache.noindex..."
rm -rf ~/Library/Developer/Xcode/ModuleCache.noindex/*

echo "🗑️  Cleaning Swift Package Manager caches..."
rm -rf ~/Library/Developer/Xcode/SourcePackages/*
rm -rf ~/Library/Caches/org.swift.swiftpm/*

echo "🗑️  Cleaning Xcode general caches..."
rm -rf ~/Library/Caches/com.apple.dt.Xcode/*

echo "🧽 Removing Package.resolved files (if present)..."
# From ios directory, search project root and ios for Package.resolved
find .. -name "Package.resolved" -print -exec rm -f {} \; 2>/dev/null || true

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

echo "✅ CocoaPods/Xcode cleanup completed successfully!"
echo ""
echo "💡 Usage in the future:"
echo "   - Run this script if you see sandbox sync or PIF session errors"
echo "   - Use 'npm run fix-pods' for quick access"
echo ""
echo "🚀 Now open 'ios/DNSChat.xcworkspace' and build (try a simulator first)."
