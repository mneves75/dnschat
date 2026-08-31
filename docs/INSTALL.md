# Installation

This repo builds DNSChat `4.3.6` build `84` (React Native `0.86.3`, Expo SDK `57`, React `19.2.3`).

Prereqs:

- Node.js 22.23.1+
- Git
- iOS: macOS + Xcode 26.4+ (iOS 16.4+ simulator/device)
- Android: Java 17 + Android Studio/SDK (API 24+)

## Clone + install

```bash
git clone <repository-url>
cd dnschat
pnpm install
```

Notes:

- `pnpm install` runs `pnpm run prepare` which installs a `.git/hooks/pre-commit`
  hook (verify pods + lint + tests).
- iOS pods drift guardrail exists. Run `pnpm run verify:ios-pods` if you touch
  native deps and expect `ios/Podfile.lock` changes.

## Run

```bash
# Dev server
pnpm run start

# iOS (Expo run:ios)
pnpm run ios

# Android (Expo run:android). Script selects Java 17 when available.
pnpm run android

# Web preview (Mock DNS only)
pnpm run web
```

## Platform notes

### iOS

- Default path: `pnpm run ios` (Expo prebuild + Xcode build).
- CocoaPods is still needed because this repo has native modules.
- Simulator builds do not require code signing.
- Device builds require a local signing team/profile (this repo keeps `DEVELOPMENT_TEAM` empty for public distribution).
- For a full physical-device install, build and install the compiled native app.
  Expo Go is not a valid substitute because DNSChat depends on native modules.
- Keep device names, device identifiers, local user paths, profile names,
  certificate IDs, team IDs, and tester group names out of public docs. Use
  placeholders in runbooks and keep exact release evidence in private notes.
- Last verified CLI environment: Xcode `26.6` (`17F113`) on `2026-06-30`.

If pods are broken:

```bash
pnpm run fix-pods
pnpm run clean-ios
```

If you need a deeper CocoaPods cleanup (slower, more destructive):

```bash
pnpm run fix-pods --deep
```

If your `ios/Podfile.lock` is corrupted and you must regenerate it:

```bash
pnpm run fix-pods --reset-lock
```

Verify pods lockfile sync:

```bash
pnpm run verify:ios-pods
```

Native iOS build smoke:

```bash
# Pick a simulator from: xcodebuild -workspace ios/DNSChat.xcworkspace -scheme DNSChat -showdestinations
xcodebuild clean build \
  -workspace ios/DNSChat.xcworkspace \
  -scheme DNSChat \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 17'

# Release compile/archive smoke without local signing credentials
xcodebuild clean build \
  -workspace ios/DNSChat.xcworkspace \
  -scheme DNSChat \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  CODE_SIGNING_ALLOWED=NO

xcodebuild clean archive \
  -workspace ios/DNSChat.xcworkspace \
  -scheme DNSChat \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath /tmp/DNSChat.xcarchive \
  CODE_SIGNING_ALLOWED=NO
```

Physical-device build/install shape:

```bash
# Use the real device identifier from xcrun xctrace list devices.
xcodebuild clean build \
  -workspace ios/DNSChat.xcworkspace \
  -scheme DNSChat \
  -configuration Release \
  -destination 'platform=iOS,id=<DEVICE_ID>' \
  DEVELOPMENT_TEAM=<TEAM_ID> \
  CODE_SIGN_STYLE=Manual \
  PROVISIONING_PROFILE_SPECIFIER='<DEVELOPMENT_PROFILE>' \
  CODE_SIGN_IDENTITY='Apple Development'

xcrun devicectl device install app \
  --device <COREDEVICE_ID> \
  <DERIVED_DATA>/Build/Products/Release-iphoneos/DNSChat.app
```

Latest validated TestFlight release: version `4.2.3` build `77`.
Physical-device evidence on
`2026-07-10` covers build `76`, which sustained normal, cold `dnschat://`, and
foreground `dnschat://` launches after the iOS 27 `UIScene` repair. Build `77`
completed its signed archive, IPA export, TestFlight upload, `VALID` processing,
and strict validation with `0` errors and `0` warnings. It was not separately
installed on the physical device and is not attached to an App Store version.

The latest uploaded TestFlight evidence is version `4.2.3` build `77`, processed
`VALID` on `2026-07-10` with bilingual test notes and non-exempt encryption set
to `false`. App Store version validation is blocked because no `4.2.3` iOS
version record exists. App Store Connect identifiers, signing identifiers,
tester group names, local paths, and device identifiers are intentionally
omitted from public docs.

Signed TestFlight release shape:

```bash
xcodebuild clean archive \
  -workspace ios/DNSChat.xcworkspace \
  -scheme DNSChat \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath /tmp/DNSChat.xcarchive \
  DEVELOPMENT_TEAM=<TEAM_ID> \
  CODE_SIGN_STYLE=Manual \
  PROVISIONING_PROFILE_SPECIFIER='<APP_STORE_PROFILE>' \
  CODE_SIGN_IDENTITY='iPhone Distribution'

xcodebuild -exportArchive \
  -archivePath /tmp/DNSChat.xcarchive \
  -exportPath /tmp/DNSChat-export \
  -exportOptionsPlist /tmp/DNSChat-ExportOptions.plist

asc publish testflight \
  --app <APP_ID> \
  --ipa /tmp/DNSChat-export/DNSChat.ipa \
  --version <VERSION> \
  --build-number <BUILD> \
  --group <GROUPS> \
  --wait
```

If `codesign` hangs after importing a new distribution certificate, use a local
build keychain for that signing identity, unlock it, set the key partition list,
make it first in `security list-keychains`, and pass
`OTHER_CODE_SIGN_FLAGS='--keychain <keychain path>'` to `xcodebuild archive`.
Keep all certificates, private keys, `.p12` files, provisioning profiles, and
keychains out of git.

`xcodebuild test` is not currently a native gate because the `DNSChat` scheme has
no XCTest bundles. Use `pnpm run test` for the app test suite until a native test
target is added.

If Xcode script phases report a missing Node binary, check the ignored local file
`ios/.xcode.env.local`. The tracked fallback in `ios/.xcode.env` uses
`command -v node`, but a stale local override can point Xcode at a removed Node
version.

### Android

You need Java 17. If you do not have it:

```bash
brew install openjdk@17
```

`pnpm run android` behavior:

- Runs `scripts/ensure-adb-reverse.js` (so Metro can be reached from device/emulator).
- If `JAVA_HOME` is already set and valid, it uses it.
- On macOS, it tries `/usr/libexec/java_home -v 17`.
- Then it falls back to common Homebrew OpenJDK 17 locations (Apple Silicon + Intel).

If your Java is installed elsewhere, set `JAVA_HOME` appropriately and re-run
`pnpm run android`.

Basic diagnostics:

```bash
pnpm run verify:android
```

Full pre-commit/release gate:

```bash
pnpm run verify:all
```

`pnpm run verify:android-16kb` requires native Android build artifacts first; run
it after `pnpm run android` or an equivalent release/debug build has produced
native `.so` files.

## DNS smoke tests

Quick check (no React Native runtime required):

```bash
node test-dns-simple.js "Hello world"
node test-dns-simple.js "Hello world" --local-server
```

Full harness (UDP/TCP transports):

```bash
pnpm run dns:harness --message "Hello world"
pnpm run dns:harness --message "Hello world" --local-server
```
