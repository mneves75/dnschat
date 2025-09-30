# Code Quality Sprint Plan — Fresh Eyes Audit (2025-09-30)

This pass revisits the codebase after the 2.1.0 release to spot obvious bugs, regressions, or confusing patterns. Focus areas: navigation, liquid-glass surfaces, DNS transport pipeline, and release/version hygiene.

## Key Observations

- **Version metadata drift**
  - android/iOS builds bumped, but `ios/Podfile.lock` and some docs (SECURITY.md, CONTRIBUTING.md, VERSION_MANAGEMENT.md) still advertise 2.0.x.
  - `package-lock.json` now points at 2.1.0, but pods weren’t updated; risk of App Store metadata mismatch.

- **Floating glass tab bar**
  - Works on iOS, but Android now has no active-state ripple (custom bar is skipped). Confirm the fallback styling still matches design.
  - `tabBarIcon` slot returns React elements that may be undefined (if route omits icon); need null-safe fallback to avoid blank tabs.

- **Glass Debug screen**
  - `Pressable` demo button is a no-op; consider adding real tactile feedback (haptics) or remove to avoid confusion.
  - Diagnostics doesn’t expose `supportsMaterial` flags beyond SwiftUI; add more data for Android (e.g., Compose tessellation) or hide irrelevant rows.

- **Settings UI**
  - `SectionCard` wraps everything with `accessibilityRole="summary"`, but Expo best practice is `accessibilityRole="header"` + `accessibilityHint` on child controls. The summary role may confuse screen readers.
  - DNS server saving still uses blocking `Alert` for success; replace with in-app toast/snackbar for better UX.

- **Native DNS retries**
  - iOS retry loop handles `noRecordsFound`, but Android legacies still throw immediately. Align behavior for parity.
  - Consider exponential backoff rather than fixed 200 ms sleeps to avoid collisions on poor networks.

- **Testing**
  - Glass tab bar logic lacks unit tests; add a simple renderer test to assert visible tabs map to route list and `tabPress` fires.
  - DNS retry logic on iOS should get instrumentation coverage (e.g., inject mock resolver and assert retries).

## TODO

- [x] Sync version markers (Podfile.lock, SECURITY.md, CONTRIBUTING.md, VERSION_MANAGEMENT.md, app store docs) to 2.1.0.
- [x] Add null-safe fallback for `tabBarIcon` when routes omit icons; verify Android ripple styling.
- [x] Give the Glass Debug “Tap Effect” button meaningful behavior (log, haptic, or remove) and expose platform-specific capability rows responsibly.
- [x] Review `SectionCard` accessibility roles; ensure VoiceOver announces headers and control hints correctly.
- [x] Extend native DNS retry semantics to Android legacy resolver, mirroring iOS retry count/backoff.
- [x] Author regression tests for the floating glass tab bar (React Navigation mapping) and iOS DNS retry path.

Owners should triage the version sync first (blocking release packaging), then tackle DNS parity and accessibility improvements in the next sprint.
