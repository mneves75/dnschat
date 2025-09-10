#!/usr/bin/env bash
set -euo pipefail

REQUIRED_VERSION="1.15.2"

log()  { printf '%s\n' "[check-cocoapods] $*"; }
fail() { log "$*"; exit 3; }

if [[ "${CP_ALLOW_ANY:-}" == "1" ]]; then
  log "Skipping check (CP_ALLOW_ANY=1)."
  exit 0
fi

if ! command -v pod >/dev/null 2>&1; then
  echo
  fail "CocoaPods not found. Install: gem install cocoapods -v ${REQUIRED_VERSION}"
fi

INSTALLED_VERSION="$(pod --version | tr -d $'\r')"
if [[ "${INSTALLED_VERSION}" != "${REQUIRED_VERSION}" ]]; then
  echo
  log "Detected CocoaPods ${INSTALLED_VERSION}. Required: ${REQUIRED_VERSION}."
  log "Global:  gem uninstall cocoapods -aIx && gem install cocoapods -v ${REQUIRED_VERSION}"
  log "Bundler: cd ios && bundle install && bundle exec pod install"
  echo
  fail "Set CP_ALLOW_ANY=1 to bypass (not recommended)."
fi

log "OK: ${INSTALLED_VERSION}"
