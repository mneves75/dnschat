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

## Development tools

### ast-grep (Primary Code Search)

**CRITICAL**: Use `ast-grep` for all syntax-aware code searches. Only use `grep`/`rg` for plain-text (docs/logs/configs).

```bash
# Find React components with specific patterns
ast-grep --lang tsx -p 'function $NAME() { $$$ }'

# Locate Swift functions in native modules
ast-grep --lang swift -p 'func $NAME($$$) -> $TYPE { $$$ }'

# Search Kotlin Android implementations
ast-grep --lang kotlin -p 'class $NAME : $INTERFACE { $$$ }'

# TypeScript interface definitions
ast-grep --lang typescript -p 'interface $NAME { $$$ }'
```

**Common use cases**:
- Refactoring: Find all component usages before renaming
- Debugging: Locate function definitions across modules
- Code review: Identify pattern violations (e.g., missing error handling)
- Migration: Find deprecated API usage

## Coding conventions

- **Language**: TypeScript strict mode; declare types in `src/types/` when sharing across modules.
- **Components**: Functional React components, 2-space indent, StyleSheet.create for styles, safe-area padding via `react-native-safe-area-context`.
- **Files**: `PascalCase.tsx` for components/screens, `*Context.tsx` for contexts, `*Service.ts` for service modules.
- **Formatting/lint**: Run Prettier (`npx prettier --write .`) and native module ESLint (`cd modules/dns-native && npm run lint`) before PRs.
- **Code search**: Use `ast-grep` for structural patterns, `grep` only for text searches.

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

## Reference Documentation Protocol

**MANDATORY**: Consult `docs/REF_DOC/` before platform-specific implementations, framework upgrades, or AI integrations.

### Quick Reference Map

| Technology | Directory | Priority Use Cases |
| --- | --- | --- |
| **iOS/iPadOS/macOS 26** | `docs/REF_DOC/docs_apple/` | Native modules, Liquid Glass UI, HIG compliance, App Store guidelines, Swift 6.2/SwiftUI APIs |
| **Expo SDK** | `docs/REF_DOC/docs_expo_dev/` | Config changes, EAS workflows, SDK upgrades, native module integration |
| **React Native** | `docs/REF_DOC/docs_reactnative_getting-started/` | New Architecture (Fabric/TurboModules), version upgrades, platform guides |
| **AI SDK / GPT-5 / Gemini** | `docs/REF_DOC/docs_ai-sdk_dev/` | AI features, model integrations, streaming, tool calling, embeddings |

### Workflow Rules

1. **Search `docs/REF_DOC/` FIRST** before implementing features or debugging platform issues
2. **Verify version alignment** between `package.json` deps and reference docs
3. **Consult compliance docs** (Apple HIG, App Store guidelines) in `docs_apple/apple_com_full_documentation/app-store/`
4. **Cross-reference examples** in cookbook guides (e.g., `docs_ai-sdk_dev/cookbook/guides/gpt-5.md`)

### Critical Checkpoints

Verify against `docs/REF_DOC/` when:

- ✅ Upgrading Expo SDK, React Native, or native dependencies
- ✅ Implementing iOS 26 Liquid Glass or macOS 26 features
- ✅ Integrating GPT-5, Gemini 2.5, or AI models
- ✅ Migrating to New Architecture (Fabric/TurboModules)
- ✅ Adding native Swift/Kotlin modules
- ✅ Updating EAS Build/Submit workflows
- ✅ Resolving deprecation warnings or platform crashes

### Search Tools

**Code Search (Syntax-Aware)**:
- **ast-grep**: Default tool for structural code pattern matching
  - TypeScript/JavaScript: `ast-grep --lang typescript -p '<pattern>'` or `--lang tsx`
  - Swift: `ast-grep --lang swift -p '<pattern>'`
  - Kotlin: `ast-grep --lang kotlin -p '<pattern>'`
  - Use for: finding functions, classes, components, interfaces, protocol conformances
  - **Only fall back to grep/rg for plain-text searches** (docs, logs, configs)

**Text Search (Documentation/Logs)**:
- `Grep -i "pattern" path:docs/REF_DOC/docs_apple/` - Pattern search in docs
- `Glob docs/REF_DOC/**/*keyword*.md` - File discovery
- Launch `Task` agent with scoped documentation search for deep research

## Supporting Documentation

- `CLAUDE.md`: Narrative handbook with setup, troubleshooting, detailed REF_DOC workflows.
- `TECH_REVIEW.md`: Architecture, dependency inventory, pipeline snapshot, OPEN_QUESTIONS.
- `PLAN_MODERNIZATION.md`: Phased roadmap, risks, rollback, compliance.

[1]: https://github.com/th3rdwave/react-native-safe-area-context
