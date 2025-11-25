# Android Blank Screen Investigation & Fix

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

Reference: `PLANS.md` — plan maintained per repository guidelines.

## Purpose / Big Picture

Users see a white screen when launching the Android build. Goal: identify and resolve the regression so the React Native app renders the expected UI on Android debug/development builds.

## Progress

- [x] (2025-10-29 17:40Z) Attempted to launch Android dev build; Metro running on port 8082 but no emulator/device attached (`adb devices` empty), so reproduction pending.
- [x] (2025-10-29 17:55Z) Started Pixel_9a emulator, reran dev client; captured `ReactNativeJNI` logcat errors showing packager connection failure (`failed to connect ... port 8081`) leading to white screen.
- [x] (2025-10-29 18:05Z) Implemented `scripts/ensure-adb-reverse.js` with polling to auto-run `adb reverse` before builds and wired into `npm run android`.
- [x] (2025-10-29 18:15Z) Validated automation: `npm run android` now reports reversed port for emulator; white screen resolved once bundle loads.

## Surprises & Discoveries

- Observation: Android dev client fails to load bundle due to unreachable Metro port (`failed to connect ... port 8081`), resulting in white screen.  
  Evidence: `adb logcat` from Pixel_9a emulator (2025-10-29 17:55Z).

## Decision Log

- Decision: Automate `adb reverse` before running Android builds to guarantee Metro port accessibility without manual steps.  
  Rationale: Prevents silent white screen failures when emulator/device cannot reach host packager.  
  Date/Author: 2025-10-29 / Codex.

## Outcomes & Retrospective

- Android dev builds no longer stall on a white screen; the reverse tunnel is ensured before launching the app, keeping developer workflow reliable.

## Context and Orientation

- Recent Android build changes: patched `@react-native-menu/menu`, Gradle Kotlin 2.1.20, Expo SDK 54.
- Dev client requires Metro on host port 8081; without `adb reverse`, emulator cannot resolve host IPs reliably on some networks.

## Plan of Work

1. Reproduce the issue with emulator + Metro, collect logcat output.
2. Confirm root cause (packager connection failure) and document evidence.
3. Implement automation that ensures `adb reverse tcp:<port> tcp:<port>` before build launch, honoring custom port env vars when present.
4. Add regression tests for helper logic (port resolution & device parsing).
5. Validate fix (`npm run android`, logcat) and update CHANGELOG.

## Concrete Steps

1. `tmux new-session -d -s metro 'cd /Users/mvneves/dev/MOBILE/chat-dns && npm start -- --clear'`
2. `tmux new-session -d -s androidrun 'cd /Users/mvneves/dev/MOBILE/chat-dns && npm run android'`
3. `tmux new-session -d -s logcat 'adb logcat -v time ReactNative:V ReactNativeJS:V Expo:V *:S'`
4. Implement `scripts/ensure-adb-reverse.js` + helpers, update `package.json`.
5. Add Jest unit tests (`__tests__/adbReverse.spec.js`).
6. Run `npm test -- --testPathPattern=adbReverse.spec.js` and `npm run lint:ast-grep`.
7. Re-run `npm run android` to confirm reverse log and UI renders.
8. Update CHANGELOG (`Unreleased` > Android) summarizing fix.

## Validation and Acceptance

- Android app launches showing main UI (no blank screen) on emulator/device.
- `npm test -- --testPathPattern=adbReverse.spec.js` passes.
- `npm run lint:ast-grep` passes.
- CHANGELOG updated with fix summary.

## Idempotence and Recovery

- Script is safe to re-run; if no devices detected after polling, it exits without failure.
- If Expo CLI starts a device later, re-running `npm run android` re-applies the reverse.

## Artifacts and Notes

- Logcat snippet (2025-10-29 17:55Z) captured `ReactNativeJNI` websocket failure prior to fix.
- Post-fix `npm run android` output shows `[ensure-adb-reverse] Reversed tcp:8081 on emulator-5554`.

---

Revision 2025-10-29 18:15Z: Investigation complete; automation + tests landed, validation documented.
