# Repository Guidelines

## Project Structure & Module Organization
The Expo Router entry point lives in `app/`; screens are grouped by route folders such as `app/(tabs)/` and modal flows in `app/modal.tsx`. Shared UI primitives and hooks live in `components/`, with Jest examples in `components/__tests__/`. Static config and theming constants sit inside `constants/`, while fonts and images are under `assets/`. Supplementary product notes and prototypes belong in `DOCS/`. Root configuration is driven by `app.json`, `tsconfig.json`, and the Expo `package.json`; update these in lockstep when introducing new platforms or modules.

## Build, Test, and Development Commands
Run `npm install` once per clone to sync dependencies. `npm start` launches the Expo dev server with QR codes for devices. Use `npm run ios` and `npm run android` to open the app in local simulators; ensure Xcode is provisioned and Android builds run against Java 17 (`export JAVA_HOME=$(/usr/libexec/java_home -v 17)`). `npm run web` provides a quick browser preview. When you need a clean environment, start with `npx expo start --clear`.

## Coding Style & Naming Conventions
Write components and routes in TypeScript/TSX with 2-space indentation. Follow PascalCase for components (`components/EditScreenInfo.tsx`), camelCase for hooks (`components/useColorScheme.ts`), and kebab-case for route groups when Expo requires it (e.g., `(tabs)`). Re-export shared types from `constants/` or dedicated modules to avoid `any`. Format before commits with `npx prettier --write .`, and keep imports path-mapped via the `@` alias defined in `tsconfig.json`.

## Testing Guidelines
UI tests live beside their components in `__tests__` folders; mirror the component name plus the `-test` suffix. Use Jest with the Expo preset: run `npx expo test` for ad-hoc checks, or invoke `npx jest components/__tests__/StyledText-test.js` once `jest-expo` is installed. Keep tests deterministic by mocking network calls and timers.

## Commit & Pull Request Guidelines
Adopt Conventional Commits (`feat(ui): add message banner`) and branch names like `feature/new-tabs` or `fix/android-build`. PRs should describe the user impact, list commands executed, attach screenshots for UI tweaks, and link any tracking issues. Confirm `npm run ios` or `npm run web` logs are clean before requesting review and mention any platform limitations.

## Security & Configuration Tips
Do not commit secrets, API tokens, or device certificates. Prefer `.env.local` for environment-specific overrides. When touching native code or CI, restage by running `npx expo-doctor` and re-validate connectivity before shipping. Keep simulator caches cleared if DNS-related features misbehave (`npx expo start --clear`).
