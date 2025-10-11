# Repository Guidelines

## Project Structure & Module Organization
- `src/`: TypeScript app source. Key subfolders include `components/` (UI primitives), `navigation/screens/` (Expo routes), `context/` (React providers), `services/` such as `dnsService.ts`, `utils/`, and `assets/`.
- `modules/dns-native/`: Native DNS TXT resolver with its own `package.json`, Jest tests, and integration harness.
- Platform roots `ios/` and `android/` hold native build artifacts. Run `pod install` inside `ios/` before iOS builds.
- Tooling lives in `scripts/` (e.g., `sync-versions.js`, `fix-cocoapods.sh`), plus `test-dns-simple.js` for quick DNS smoke checks.

## Build, Test, and Development Commands
- `npm start`: Launch Expo dev client.
- `npm run ios` / `npm run android`: Build and run on simulators. Android expects Java 17 (`./android-java17.sh` is available).
- `npm run web`: Web preview via Expo.
- `node test-dns-simple.js`: Resolve TXT via `DNSService`; validate connectivity before shipping.
- `npm run sync-versions` (`:dry` to preview): Align app and native module version numbers.
- `cd modules/dns-native && npm test`: Run native module unit tests; `npm run test:integration` targets a device or simulator.

## Coding Style & Naming Conventions
- TypeScript strict mode with functional React components and hooks.
- Indentation: 2 spaces; avoid `any`. Place shared types in `src/types/`.
- Components use `PascalCase.tsx`; contexts follow `*Context.tsx`; services end in `*Service.ts`.
- Format with Prettier (`npx prettier --write .`). Lint native module via `cd modules/dns-native && npm run lint`.

## Testing Guidelines
- App smoke test: `node test-dns-simple.js` (expect TXT payload or actionable error).
- Native module unit tests live under `modules/dns-native/__tests__/` and should cover parsing and failure paths.
- Keep tests deterministic; mock network layers where feasible. Add targeted tests for new logic before opening a PR.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat(dns): …`, `fix(ios): …`, `docs(readme): …`).
- Branch naming: `feature/...`, `fix/...`, `docs/...`.
- PRs document the problem, solution, and test evidence (logs, screenshots, or command output). Note affected platforms and any version syncs.
- Reference related issues and ensure `npm run sync-versions :dry` has no unexpected deltas before requesting review.

## Security & Configuration Tips
- Never commit secrets or API keys; DNS defaults live in `dnsService`.
- Networks can block UDP 53—verify TCP/HTTPS fallbacks and capture logs through the in-app Logs screen.
- Ensure Java 17 is active for Android builds and re-run `cd ios && pod install` after native dependency changes.
