# Progress - Expo SDK 55 Migration + v4.0.3 Release Prep

## Current State
- Branch: `chore/expo-sdk55-migration`
- Worktree: `/Users/mneves/dev/MOBILE/chat-dns-sdk55`

## Completed
- Upgraded Expo/RN dependency stack to SDK 55-compatible versions.
- Removed obsolete Expo config fields (`newArchEnabled`, `edgeToEdgeEnabled`) from `app.json`.
- Updated iOS `AppDelegate.swift` for SDK 55 APIs.
- Updated Android `MainApplication.kt` host wiring for SDK 55 setup.
- Reworked typed-routes verifier for expo-router 55 fallback path.
- Removed SDK54 patch-package patches that no longer apply; preserved required menu patch.
- Fixed iOS runtime startup warnings/errors:
  - Removed root `React.StrictMode` wrapper in `app/_layout.tsx`.
  - Removed `useIsFocused` dependency from `GlassChatList` startup load path.
- Bumped app version to `4.0.3` and build number to `33` via `bun run sync-versions -- --bump-build`.
- Updated release/documentation set (`CHANGELOG.md`, `README.md`, `docs/*`, `CLAUDE.md`) to reflect SDK55 + v4.0.3.

## Verification
- All required migration + runtime checks are passing (see `test_plan.md`).
- iOS simulator runtime logs confirmed absence of:
  - `Couldn't find a navigation object`
  - `findHostInstance_DEPRECATED`

## Remaining
- Stage, commit, and push the release-prep updates.
- Publish build to TestFlight via `asc` CLI workflow.
