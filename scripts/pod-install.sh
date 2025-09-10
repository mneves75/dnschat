#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")"/.. && pwd)"
IOS_DIR="$DIR/ios"

# Run CocoaPods environment checks first
"$DIR/scripts/check-cocoapods.sh" || {
  echo "[pod-install] Warning: CocoaPods environment check failed"
}

cd "$IOS_DIR"

# 1) Prefer Bundler when Gemfile exists (determinístico)
if [[ -f "Gemfile" ]]; then
  echo "[pod-install] Using Bundler (Gemfile detected)"
  set +e
  bundle install
  bundle exec pod install
  RC=$?
  set -e
  if [[ $RC -eq 0 ]]; then
    exit 0
  fi
  echo "[pod-install] Bundler path failed (rc=$RC). Falling back to direct CocoaPods."
fi

# 2) Prefer exact shim for CocoaPods 1.15.2
if pod _1.15.2_ --version >/dev/null 2>&1; then
  echo "[pod-install] Using shim: pod _1.15.2_ install"
  pod _1.15.2_ install
  exit $?
fi

# 3) Last resort: system 'pod install' (may be 1.16.x on host)
SYS_VER="$(pod --version 2>/dev/null || echo unknown)"
echo "[pod-install] Warning: using system 'pod install' (version: ${SYS_VER})"
pod install
