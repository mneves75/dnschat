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
bun run start
```

If you insist on calling Expo directly:

```bash
bunx expo --version
```

### Node version

This repo expects Node 18+.

```bash
node -v
```

## iOS

### CocoaPods drift / Swift type missing

Symptom:

- Swift compile fails with missing symbols/types after changing JS deps

Fix:

```bash
bun run verify:ios-pods
bun run ios
```

If pods are corrupted:

```bash
bun run fix-pods
bun run clean-ios
```

## Android

### Wrong Java version

Symptom:

- Gradle errors that look like "unsupported class file major version ..."

Fix:

```bash
bun run android
```

`bun run android` will try to select Java 17 (prefers an existing valid
`JAVA_HOME`, then macOS `/usr/libexec/java_home -v 17`, then common Homebrew
locations). If your Java is elsewhere, set `JAVA_HOME` to a Java 17 install and
re-run `bun run android`.

Diagnostics:

```bash
bun run verify:android
```

### local.properties points to a missing Android SDK

Symptom:

- Gradle warns: `sdk.dir property in local.properties file. Problem: Directory does not exist`
- `bun run verify:android` reports `android/local.properties sdk.dir points to a missing directory`

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
