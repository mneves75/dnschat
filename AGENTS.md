# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the Expo/React Native app. Key subfolders: `components/`, `navigation/`, `context/`, `services/` (e.g., `dnsService.ts`), `utils/`, and `assets/`.
- `modules/dns-native/` contains the shared DNS bridge (TypeScript plus `ios/` and `android/` native code). Native platform folders live under `ios/` and `android/`.
- `scripts/` provides maintenance utilities (`sync-versions.js`, `fix-cocoapods.sh`). `test-dns-simple.js` is the DNS smoke test entry point.
- Tests reside in `__tests__/` for app-level checks and `modules/dns-native/__tests__/` for bridge unit coverage.

## Build, Test, and Development Commands
- `npm start` – launches the Expo dev server (Dev Client enabled).
- `npm run ios` / `npm run android` – builds and runs the native app; ensure `cd ios && pod install` and Java 17 (use `./android-java17.sh`).
- `npm run web` – quick web preview of the client.
- `node test-dns-simple.js` – validates DNS connectivity through `DNSService`.
- `cd modules/dns-native && npm test` – runs Jest unit tests for the native module; `npm run test:integration` targets device/simulator.

## Coding Style & Naming Conventions
- TypeScript strict mode; avoid `any`. Define shared types in `src/types/`.
- Use functional React components and hooks. Screens live in `src/navigation/screens/` with PascalCase filenames.
- Indentation is two spaces. Run `npx prettier --write .` before submitting. Native module code follows Swift concurrency best practices and Android Kotlin/Java style guides.

## Testing Guidelines
- Write deterministic tests; mock network layers when feasible.
- Name Jest files `*.test.ts[x]` and colocate with the feature when practical.
- Ensure new DNS parsing or logging logic is covered in `modules/dns-native/__tests__/` or `src/services/__tests__/`.
- Capture evidence (logs/screenshots) when running `test-dns-simple.js` for regressions.

## Commit & Pull Request Guidelines
- Use Conventional Commits (e.g., `feat(dns): add doh fallback`, `fix(ios): guard resolver cleanup`). Branch naming: `feature/...`, `fix/...`, `docs/...`.
- PRs should include problem statement, solution summary, test evidence, affected platforms, and note any version bumps via `npm run sync-versions`.
- Confirm Expo plugins remain the source of truth for native modules; avoid committing stale generated files.

## Security & Configuration Tips
- Never commit secrets or API keys. Default resolver is `ch.at`; custom servers must pass `validateDNSServer` checks.
- Be mindful of networks blocking UDP 53—test TCP/HTTPS fallbacks and log anomalies through the in-app Logs screen.
