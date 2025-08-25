# Repository Guidelines

## Project Structure & Module Organization
- `src/`: App code — components, navigation, context, services, types.
- `src/services/__tests__/`: Service unit/integration tests (`*.test.ts`).
- `modules/dns-native/`: Native DNS module (Android Java, iOS Swift) with its own `__tests__`.
- `ios/` and `android/`: Native projects; iOS includes `DNSNative`.
- `assets/`, `icons/`: Images and static assets.

## Build, Test, and Development Commands
- `npm start`: Launch Expo dev server (dev client).
- `npm run ios`: Build/run iOS (requires Xcode and CocoaPods).
- `npm run android`: Build/run Android using Java 17 (env set in script).
- `npm run web`: Start web target.
- `npm run sync-versions` | `:dry`: Sync versions across app, iOS, Android.
- `npm run fix-pods` / `npm run clean-ios`: Resolve CocoaPods issues / clean iOS build.
- DNS checks: `node test-dns-simple.js`, `node test-debug-logging.js`.

## Coding Style & Naming Conventions
- **Language**: TypeScript (strict); React Native with functional components.
- **Indentation**: 2 spaces; max line length ~100 chars.
- **Naming**: Components `PascalCase` (`MessageList.tsx`), hooks/context `camelCase` files, services `camelCase` (`dnsService.ts`).
- **Files**: UI in `src/components`, business logic in `src/services`, screens in `src/navigation/screens`.
- **Formatting**: Prefer Prettier — `npx prettier --check .`; type-check with `npx tsc --noEmit`.

## Testing Guidelines
- **Unit/Integration**: Jest-style tests live in `src/services/__tests__` and `modules/dns-native/__tests__` (`*.test.ts`). If Jest is configured, run `npx jest`.
- **Manual DNS tests**: `node test-dns-simple.js "Hello"` and `node test-sdk54-features.js`.
- **Expectations**: Cover core paths in `dnsService`, `dnsLogService`, and native module boundaries. Prefer deterministic tests with mocked network.
- **Naming**: `featureName.behavior.test.ts`.

## Commit & Pull Request Guidelines
- **Commits**: Conventional Commits. Examples:
  - `feat(dns): add TCP fallback`
  - `fix(ios): resolve CocoaPods XCFramework issue`
  - `docs(readme): clarify quick start`
- **Branches**: `feature/...`, `fix/...`, `docs/...`.
- **PRs**: Include problem, solution, testing (iOS/Android/Web), linked issues, and screenshots/logs for UI or DNS logs for networking. Keep PRs focused and small.

## Security & Configuration Tips
- Use Java 17 for Android builds; run iOS `pod install` after dependency changes.
- Do not commit secrets; sanitize logs before sharing. Prefer DNS-over-HTTPS only on restricted networks.
- Follow fallback order in code (Native → UDP → TCP → DoH → Mock) and verify behavior via Logs tab.

