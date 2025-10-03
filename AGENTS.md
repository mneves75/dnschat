# Repository Guidelines

Companion checklist for automation agents and humans. See `CLAUDE.md` for narrative guidance and links to official sources.

## Project structure

- `src/`: TypeScript application code (components, navigation, contexts, services, theme, i18n, utils).
- `modules/dns-native/`: Swift/Java TurboModule exposing native DNS TXT transport with Jest unit/integration tests.
- `ios/`, `android/`: Generated native projects; keep build settings here (Hermes, Fabric toggles, signing).
- Configuration: `app.config.ts`, `eas.json`, `scripts/` utilities (`sync-versions.js`, `fix-cocoapods.sh`, DNS harness).
- Documentation: `docs/` (Apple references, modernization plans, technical reviews).

## Core commands

| Purpose | Command | Notes |
| --- | --- | --- |
| Dev server | `npm start` | Launch Expo dev client (Metro). |
| iOS run | `npm run ios` | Regenerates native project + runs `pod install`; ensure CocoaPods ≥1.15. |
| Android run | `npm run android` | Requires Java 17 (`./android-java17.sh` sets `JAVA_HOME`). |
| Web preview | `npm run web` | Expo web bundler. |
| DNS smoke test | `node test-dns-simple.js "hello"` | Confirms TXT transport fallback path. |
| Version sync | `npm run sync-versions[:dry]` | Align marketing/build numbers across configs. |
| Native module tests | `cd modules/dns-native && npm test` / `npm run test:integration` | Integration run expects simulator/device. |

## Coding conventions

- **Language**: TypeScript strict mode; declare types in `src/types/` when sharing across modules.
- **Components**: Functional React components, 2-space indent, StyleSheet.create for styles, safe-area padding via `react-native-safe-area-context`.
- **Files**: `PascalCase.tsx` for components/screens, `*Context.tsx` for contexts, `*Service.ts` for service modules.
- **Formatting/lint**: Run Prettier (`npx prettier --write .`) and native module ESLint (`cd modules/dns-native && npm run lint`) before PRs.

## Testing & QA

- Unit: `npm test` (root) and `modules/dns-native && npm test` (native module).
- Integration: `modules/dns-native && npm run test:integration` (requires device/simulator).
- Manual DNS validation: Settings screen → Transport Test or `node test-dns-simple.js` CLI.
- Add deterministic tests when patching parsing, sanitisation, or logging logic; mock network IO.

## Workflow expectations

- Branch naming: `feature/...`, `fix/...`, `docs/...` (align with GitHub labels).
- Commits: Conventional (`feat(dns): ...`, `fix(ios): ...`, `docs(handbook): ...`).
- PR checklist:
  1. Describe problem + solution + affected platforms.
  2. Attach logs/screenshots for visual or device changes.
  3. Run `npm test` (and platform-specific tests when touching native code).
  4. Execute `npm run sync-versions:dry` when adjusting marketing/build numbers.
- Version bumps must flow through CHANGELOG + `sync-versions` script.

## Security & configuration

- Never commit secrets/API keys. DNS defaults live in `src/services/dnsService.ts` (`ch.at`).
- Android builds demand Java 17; verify with `java -version` before Gradle tasks.
- When adjusting safe areas, rely on `react-native-safe-area-context` (Expo includes it by default). [1]
- Corporate networks may block UDP 53—test fallback transports (TCP/HTTPS) and review Logs tab output before escalating.

## Reference docs

- `CLAUDE.md`: High-level onboarding, setup, troubleshooting.
- `TECH_REVIEW.md`: Architecture, dependency inventory, pipeline snapshot, OPEN_QUESTIONS.
- `PLAN_MODERNIZATION.md`: Phased roadmap, risks, rollback, compliance.
- `docs/apple/` & `docs/EXPO_REACT_NATIVE_DOCS/`: Platform-specific guidance (SwiftUI, Liquid Glass, Expo migration notes).

[1]: https://github.com/th3rdwave/react-native-safe-area-context
