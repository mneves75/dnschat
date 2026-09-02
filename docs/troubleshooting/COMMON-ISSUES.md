# Common issues

This is a short, current troubleshooting guide for DNSChat.

If you want the most signal for DNS failures, use the in-app Logs screen first.

## Setup

### Expo CLI / dev server

Symptoms:

- `expo: command not found`
- app launches but cannot connect to Metro

Fix:

```bash
pnpm run start
```

If you insist on calling Expo directly:

```bash
pnpm exec expo --version
```

### Node version

This repo supports Node 22.13+ and the Node 24 LTS line. Use the `.node-version`
pin (`24`); React Native and Metro require Node 22.13+ on the Node 22 line, and Node 26 is outside the
supported engine range because the installed React Compiler healthcheck does
not load correctly there.

```bash
node -v
```

## iOS

### App exits immediately on iOS 27 after a successful device launch command

Symptom:

- `devicectl` reports that the application launched, but it immediately returns
  to the Home Screen.
- The device crash report ends in
  `___UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption_block_invoke`
  with `EXC_BREAKPOINT` / `SIGTRAP`.

Cause:

- iOS 27 requires apps linked with the iOS 27 SDK to adopt the scene-based
  lifecycle. Expo SDK 57.0.4 still ships the earlier app-delegate bootstrap, so
  DNSChat carries the required scene bridge locally until that support reaches
  its Expo release line.

Fix:

- Keep `UIApplicationSceneManifest` and `SceneDelegate` in sync across
  `ios/DNSChat/Info.plist` and `ios/DNSChat/AppDelegate.swift`.
- Do not run `expo prebuild --clean` until the installed Expo release carries
  equivalent scene support; it regenerates native bootstrap files and can
  remove this local bridge. The `iosSceneLifecycle` contract test detects that
  drift.
- A successful launch command is not sufficient evidence. Use `--console`,
  verify that the process remains alive, and inspect `systemCrashLogs` when it
  exits.

### CocoaPods drift / Swift type missing

Symptom:

- Swift compile fails with missing symbols/types after changing JS deps

Fix:

```bash
pnpm run verify:ios-pods
pnpm run ios
```

If pods are corrupted:

```bash
pnpm run fix-pods
pnpm run clean-ios
```

## Android

### Wrong Java version

Symptom:

- Gradle errors that look like "unsupported class file major version ..."

Fix:

```bash
pnpm run android
```

`pnpm run android` will try to select Java 17 (prefers an existing valid
`JAVA_HOME`, then macOS `/usr/libexec/java_home -v 17`, then common Homebrew
locations). If your Java is elsewhere, set `JAVA_HOME` to a Java 17 install and
re-run `pnpm run android`.

Diagnostics:

```bash
pnpm run verify:android
```

### local.properties points to a missing Android SDK

Symptom:

- Gradle warns: `sdk.dir property in local.properties file. Problem: Directory does not exist`
- `pnpm run verify:android` reports `android/local.properties sdk.dir points to a missing directory`

Fix:

- Update `android/local.properties` to point at your SDK, or delete it and let Android Studio regenerate it.
- Prefer environment variables for portability (especially in CI):
  - `ANDROID_SDK_ROOT` or `ANDROID_HOME`

Example (macOS default):

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
```

## DNS / networking

### "All DNS transport methods failed"

What it usually means:

- the active network blocks DNS (UDP/TCP) on port 53, or DNS server is unreachable

Fix checklist:

1. Switch networks (WiFi <-> cellular, try a different WiFi).
2. Confirm your selected DNS server is reachable on that network.
3. Use the in-app Logs screen to see which transport failed (native/udp/tcp) and why.

Quick terminal sanity check:

```bash
node test-dns-simple.js "Hello world"
```

### Web preview

Web builds cannot query custom DNS servers on port 53 from the browser, so Web
uses Mock DNS.
