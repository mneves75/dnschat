# Installation

This repo builds DNSChat `3.2.1` (React Native `0.81.5`, Expo SDK `54.0.29`).

Prereqs:

- Node.js 18+
- Git
- iOS: macOS + Xcode 15+ (iOS 16+ simulator/device)
- Android: Java 17 + Android Studio/SDK (API 21+)

## Clone + install

```bash
git clone https://github.com/mneves75/dnschat.git
cd dnschat
npm install
```

Notes:

- `npm install` runs `npm run prepare` which installs a `.git/hooks/pre-commit`
  hook (verify pods + lint + tests).
- iOS pods drift guardrail exists. Run `npm run verify:ios-pods` if you touch
  native deps and expect `ios/Podfile.lock` changes.

## Run

```bash
# Dev server (Expo dev-client)
npm start

# iOS (Expo run:ios)
npm run ios

# Android (Expo run:android). Script sets JAVA_HOME to OpenJDK 17 (Homebrew path).
npm run android

# Web preview (Mock DNS only)
npm run web
```

## Platform notes

### iOS

- Default path: `npm run ios` (Expo prebuild + Xcode build).
- CocoaPods is still needed because this repo has native modules.
- Simulator builds do not require code signing.
- Device builds require you to pick your own signing team in Xcode (this repo keeps `DEVELOPMENT_TEAM` empty for public distribution).
  If pods are broken:

```bash
npm run fix-pods
npm run clean-ios
```

If you need a deeper CocoaPods cleanup (slower, more destructive):

```bash
npm run fix-pods -- --deep
```

If your `ios/Podfile.lock` is corrupted and you must regenerate it:

```bash
npm run fix-pods -- --reset-lock
```

Verify pods lockfile sync:

```bash
npm run verify:ios-pods
```

### Android

You need Java 17. If you do not have it:

```bash
brew install openjdk@17
```

`npm run android` sets:

- `JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home`
- `PATH=/opt/homebrew/opt/openjdk@17/bin:$PATH`

If you are not on macOS or your Java is installed elsewhere, set `JAVA_HOME`
appropriately and run `expo run:android` manually.

Basic diagnostics:

```bash
npm run verify:android
```

## DNS smoke tests

Quick check (no React Native runtime required):

```bash
node test-dns-simple.js "Hello world"
```

Full harness (UDP/TCP transports):

```bash
npm run dns:harness -- --message "Hello world"
```
