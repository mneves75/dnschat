# Repository Guidelines

This guide outlines how to work effectively in this repository: where things live, how to build/test, and how to contribute changes.

## Project Structure & Module Organization

- `src/`: App code (components, navigation, context, services, types).
- `src/services/__tests__/`: Jest unit/integration tests (`*.test.ts`).
- `modules/dns-native/`: Native DNS (Android Java, iOS Swift) with its own `__tests__`.
- `ios/`, `android/`: Native projects; iOS includes `DNSNative`.
- `assets/`, `icons/`: Images and static assets.

## Build, Test, and Development Commands

- `npm start`: Launch Expo dev server (dev client).
- `npm run ios`: Build/run iOS (Xcode + CocoaPods).
- `npm run android`: Build/run Android (Java 17).
- `npm run web`: Start web target.
- `npm run sync-versions` (`:dry`): Sync app/iOS/Android versions.
- `npm run fix-pods` / `npm run clean-ios`: Resolve CocoaPods issues / clean iOS build.
- DNS checks: `node test-dns-simple.js`, `node test-debug-logging.js`.
- `npm run typecheck`: Type-check core code (services/utils).
- `npm run typecheck:tests`: Type-check service tests only.
- `npm run typecheck:full`: Full repo type-check (may surface WIP UI errors).

## Coding Style & Naming Conventions

- Language: TypeScript (strict); React Native functional components.
- Indentation: 2 spaces; line length ~100 chars.
- Names: Components PascalCase (e.g., `MessageList.tsx`); hooks/services camelCase (e.g., `dnsService.ts`).
- Files: UI in `src/components`; business logic in `src/services`; screens in `src/navigation/screens`.
- Tools: Prettier `npx prettier --check .`; type-check via `npm run typecheck` or full with `npm run typecheck:full`.

## Testing Guidelines

- Framework: Jest (if configured)—run `npx jest`.
- Manual DNS: `node test-dns-simple.js "Hello"`, `node test-sdk54-features.js`.
- Coverage: Core paths in `dnsService`, `dnsLogService`, and native module boundaries; prefer deterministic tests with mocked network.
- Naming: `featureName.behavior.test.ts`.

## Commit & Pull Request Guidelines

- Commits: Conventional Commits (e.g., `feat(dns): add TCP fallback`, `fix(ios): resolve CocoaPods XCFramework issue`).
- Branches: `feature/...`, `fix/...`, `docs/...`.
- PRs: Describe problem + solution; include testing across iOS/Android/Web, linked issues, and screenshots/DNS logs. Keep PRs focused and small.

## Security & Configuration Tips

- Use Java 17 for Android; run `pod install` after dependency changes.
- Do not commit secrets; sanitize logs. Prefer DoH only on restricted networks.
- Fallback order: Native → UDP → TCP → DoH → Mock; verify behavior via Logs tab.
