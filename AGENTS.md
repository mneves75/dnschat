# Repository Guidelines

## Project Structure & Modules

- `src/`: App code (TypeScript). Key areas: `components/`, `navigation/`, `context/`, `services/` (e.g., `src/services/dnsService.ts`), `utils/`, `assets/`.
- `modules/dns-native/`: Native DNS TXT module (iOS/Android) with its own tests and build config.
- Platform: `ios/`, `android/` (native build artifacts), `app.json`, `eas.json`.
- Tooling: `scripts/` (e.g., `sync-versions.js`, `fix-cocoapods.sh`), `test-dns-simple.js` (DNS smoke test), `index.tsx` (entry).

## Build, Test, and Development Commands

- `npm start`: Start Expo dev server (dev client).
- `npm run ios`: Build/run iOS (ensure `pod install` in `ios/`).
- `npm run android`: Build/run Android with Java 17 (uses path in script). Use `./android-java17.sh` if needed.
- `npm run web`: Run web preview.
- `node test-dns-simple.js`: DNS connectivity smoke test through `DNSService`.
- `npm run sync-versions` / `:dry`: Sync and preview version numbers across app and module.
- Native module tests: `cd modules/dns-native && npm test` (unit), `npm run test:integration` (device/simulator required).

## Coding Style & Naming Conventions

- TypeScript strict mode (see `tsconfig.json`). Prefer functional React components and hooks.
- Indentation: 2 spaces. No `any`; define interfaces/types in `src/types/`.
- Files: Components `PascalCase.tsx` in `src/components/`; screens in `src/navigation/screens/`; contexts as `*Context.tsx`; services as `*Service.ts`.
- Formatting: Use Prettier defaults (`npx prettier --write .`). Lint native module with ESLint (`cd modules/dns-native && npm run lint`).

## Testing Guidelines

- App smoke: `node test-dns-simple.js` (expect TXT response or informative error).
- Native module: Jest tests live in `modules/dns-native/__tests__/` (`*.test.ts`). Aim to cover parsing and error paths.
- Add targeted tests for new logic (e.g., response parsing, logging). Keep tests deterministic; mock network where possible.

## Commit & Pull Request Guidelines

- Conventional commits: `feat(dns): ...`, `fix(ios): ...`, `docs(...): ...`.
- Branch names: `feature/...`, `fix/...`, `docs/...`.
- PRs include: problem, solution, test evidence (logs/screenshots), affected platforms, and any version bumps (`npm run sync-versions`). Link related issues.

## Security & Configuration Tips

- Do not commit secrets or API keys. Default DNS server is defined in `dnsService` (`ch.at`).
- Android requires Java 17; verify with `java -version`. iOS builds may need `cd ios && pod install`.
- Networks may block DNS port 53; test fallbacks (TCP/HTTPS) and capture logs from the app’s Logs screen.
