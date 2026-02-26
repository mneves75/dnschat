# Installation

This repo builds DNSChat `4.0.3` (React Native `0.83.2`, Expo SDK `55.0.0`).

Prereqs:

- Node.js 18+
- Git
- iOS: macOS + Xcode 15+ (iOS 16+ simulator/device)
- Android: Java 17 + Android Studio/SDK (API 24+)

## Clone + install

```bash
git clone https://github.com/mneves75/dnschat.git
cd dnschat
bun install
```

Notes:

- `bun install` runs `bun run prepare` which installs a `.git/hooks/pre-commit`
  hook (verify pods + lint + tests).
- iOS pods drift guardrail exists. Run `bun run verify:ios-pods` if you touch
  native deps and expect `ios/Podfile.lock` changes.

## Run

```bash
# Dev server (Expo dev-client)
bun run start

# iOS (Expo run:ios)
bun run ios

# Android (Expo run:android). Script selects Java 17 when available.
bun run android

# Web preview (Mock DNS only)
bun run web
```

## Platform notes

### iOS

- Default path: `bun run ios` (Expo prebuild + Xcode build).
- CocoaPods is still needed because this repo has native modules.
- Simulator builds do not require code signing.
- Device builds require you to pick your own signing team in Xcode (this repo keeps `DEVELOPMENT_TEAM` empty for public distribution).
  If pods are broken:

```bash
bun run fix-pods
bun run clean-ios
```

If you need a deeper CocoaPods cleanup (slower, more destructive):

```bash
bun run fix-pods -- --deep
```

If your `ios/Podfile.lock` is corrupted and you must regenerate it:

```bash
bun run fix-pods -- --reset-lock
```

Verify pods lockfile sync:

```bash
bun run verify:ios-pods
```

### Android

You need Java 17. If you do not have it:

```bash
brew install openjdk@17
```

`bun run android` behavior:

- Runs `scripts/ensure-adb-reverse.js` (so Metro can be reached from device/emulator).
- If `JAVA_HOME` is already set and valid, it uses it.
- On macOS, it tries `/usr/libexec/java_home -v 17`.
- Then it falls back to common Homebrew OpenJDK 17 locations (Apple Silicon + Intel).

If your Java is installed elsewhere, set `JAVA_HOME` appropriately and re-run
`bun run android`.

Basic diagnostics:

```bash
bun run verify:android
```

## DNS smoke tests

Quick check (no React Native runtime required):

```bash
node test-dns-simple.js "Hello world"
node test-dns-simple.js "Hello world" --local-server
```

Full harness (UDP/TCP transports):

```bash
bun run dns:harness -- --message "Hello world"
bun run dns:harness -- --message "Hello world" --local-server
```
