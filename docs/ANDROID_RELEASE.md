# Android release checklist

This document tracks the manual steps for preparing and shipping an Android build.

## Pre-flight

- Ensure `main` is green (CI passing).
- Ensure versions are consistent:
  - `package.json` version (source of truth)
  - `android/app/build.gradle` (`versionName` / `versionCode`)
  - `app.json` (`expo.version`)
- Ensure dependencies are Expo-SDK compatible:
  - Run `expo install --fix`
  - Run `bun run test` and `bun run lint`

## Build

Typical options:

- Local Android build: `bun run android`
- EAS build (recommended for store builds): `eas build --platform android --profile production`

### Release signing (required for Play Store)

This repo intentionally does **not** commit signing credentials.

Supported signing inputs (in order):

1) Injected signing (CI/EAS): Gradle properties:
   - `android.injected.signing.store.file`
   - `android.injected.signing.store.password`
   - `android.injected.signing.key.alias`
   - `android.injected.signing.key.password`

2) Local developer signing (never commit):
   - `android/keystore.properties` or `keystore.properties` at repo root (ignored by git)
   - Or `MYAPP_UPLOAD_*` Gradle properties (`gradle.properties` / CI secrets)

If no signing is provided, `./gradlew :app:assembleRelease` will generate an **unsigned**
APK (`app-release-unsigned.apk`). This is expected for local verification and prevents
accidentally producing a debug-signed “release”.

## Release

- Upload to Google Play Console (internal testing first, then production).
- Validate:
  - Install/launch on a physical device
  - Network/DNS flows work as expected
  - No unexpected runtime logs in production mode

For detailed Google Play Store publishing instructions, see:
**[ANDROID_GOOGLE_PLAY_STORE.md](./ANDROID_GOOGLE_PLAY_STORE.md)**

## Notes

- Latest release tag: `v4.0.0`
