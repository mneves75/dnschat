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
  - Run `npm test` and `npm run lint`

## Build

Typical options:

- Local Android build: `npm run android`
- EAS build (recommended for store builds): `eas build --platform android --profile production`

## Release

- Upload to Google Play Console (internal testing first, then production).
- Validate:
  - Install/launch on a physical device
  - Network/DNS flows work as expected
  - No unexpected runtime logs in production mode

## Notes

- Latest release tag: `v3.2.1`
