# Changelog

All notable changes to DNSChat will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## Unreleased

### Fixed
- Keep `ios/DNSChat.xcodeproj/project.pbxproj` portable by ensuring `DEVELOPMENT_TEAM` stays empty (developers should configure signing locally, not in the repo).

## 3.2.0 - 2025-12-15

### Added
- Public repo hardening gates (CI + policy tests) to enforce release invariants:
  - Secrets scanning via gitleaks
  - No emoji in tracked files
  - No private URLs/internal endpoints in tracked files
  - Deterministic iOS pods lockfile behavior
  - Deterministic version syncing across iOS/Android/Expo config

### Changed
- DNS server configuration is now strict allowlist-only with canonical normalization and port rejection, and invalid persisted values are coerced back to the safe default during migration.
- Logging is gated behind a dev-only helper to keep production runtime output quiet and predictable.
