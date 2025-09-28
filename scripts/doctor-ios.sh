#!/usr/bin/env bash
set -euo pipefail

echo "# iOS Environment Doctor"

echo "\n## Xcode"
if command -v xcodebuild >/dev/null 2>&1; then
  xcodebuild -version || true
else
  echo "xcodebuild: NOT FOUND (install Xcode from the App Store)"
fi

echo "\n## CocoaPods"
if command -v pod >/dev/null 2>&1; then
  pod --version || true
else
  echo "pod: NOT FOUND (sudo gem install cocoapods)"
fi

echo "\n## Bundler (optional)"
if command -v bundle >/dev/null 2>&1; then
  bundle --version || true
else
  echo "bundle: not installed"
fi

echo "\n## iOS Pods status"
if [ -d "ios" ]; then
  cd ios
  if [ -f "Podfile.lock" ]; then
    echo "Podfile.lock present"
    echo "Pods installed: $(ls -1 Pods 2>/dev/null | wc -l | tr -d ' ')"
  else
    echo "Podfile.lock missing — run: pod install"
  fi
else
  echo "ios directory not found"
fi

