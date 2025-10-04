# Claude Agent Handbook

Authoritative quick-start for DNSChat contributors. Keep this guide aligned with the latest stable Expo, React Native, and Apple platform guidance.

> Canonical references live in `README.md`, `TECH_REVIEW.md`, `PLAN_MODERNIZATION.md`, and this handbook. Cross-link updates instead of duplicating content.

## Overview

- **App**: DNSChat (Expo/React Native) delivering DNS TXT-based chat with native transports.
- **Current toolchain**: Expo SDK 54.0.12 (stable) with React Native 0.81.4, React 19.1, TypeScript 5.9 strict mode. [1][2]
- **Architecture highlights**: React Navigation v7 (native stack + bottom tabs), React Context providers for state, native DNS module (`modules/dns-native`) and iOS Liquid Glass wrapper (`ios/LiquidGlassNative`).
- **Design system**: Liquid Glass on iOS 17+ via `.glassEffect()` bridge; Material 3 edge-to-edge styling on Android.
- **New Architecture**: `app.config.ts` enables Fabric/TurboModules; Android builds Fabric today, Podfile currently opts iOS out—see modernization plan for alignment.

## Setup

### Tooling requirements

| Target | Required version | Notes |
| --- | --- | --- |
| Node.js | 20.19.x LTS | Aligns with Expo SDK 54 baseline. [3] |
| npm | ≥10.8.x | Ships with Node 20; repo uses `package-lock.json`. |
| Xcode | 16.x | Install command line tools + Rosetta (Apple Silicon) for simulator support. |
| Android toolchain | Android Studio Iguana, SDK Platform 35, Build Tools 35.0.0, Java 17 | `android-java17.sh` exports `JAVA_HOME` on macOS. |
| Watchman | Latest | Improves Metro performance on macOS (`brew install watchman`). |

### Repository bootstrap

```bash
npm install
npm run sync-versions:dry   # sanity-check marketing vs build numbers
npx expo-doctor             # validate Expo config/environment
node test-dns-simple.js "hello"  # DNS transport smoke test
```

### Project layout

- **App**: `src/` (components, navigation, contexts, services, theme, i18n).
- **Native modules**: `modules/dns-native` (Swift/Java TurboModule) and `ios/LiquidGlassNative` bridge.
- **Configuration**: `app.config.ts`, `eas.json`, platform folders (`ios/`, `android/`).
- **Scripts**: `npm run sync-versions`, `npm run fix-pods`, `scripts/run-dns-harness.ts`, etc.

## Development Tools & Workflows

### Code Search Tools

**IMPORTANT**: This environment provides `ast-grep` for syntax-aware structural code searching—always prefer it over plain-text tools for code pattern matching.

#### ast-grep (Structural Code Search)

Use `ast-grep` (aliased as `sg`) for syntax-aware pattern matching when searching code:

**Common languages in this project**:
```bash
# TypeScript/JavaScript (src/, config files)
ast-grep --lang typescript -p 'function $NAME($$$) { $$$ }'
ast-grep --lang tsx -p '<$COMPONENT $$$>$$$</$COMPONENT>'

# Swift (iOS native modules, LiquidGlassNative)
ast-grep --lang swift -p 'func $NAME($$$) -> $TYPE { $$$ }'
ast-grep --lang swift -p 'class $NAME: $PROTOCOL { $$$ }'

# Kotlin (Android native modules)
ast-grep --lang kotlin -p 'fun $NAME($$$): $TYPE { $$$ }'
ast-grep --lang kotlin -p 'class $NAME : $INTERFACE { $$$ }'
```

**When to use ast-grep**:
- Finding function/method definitions across the codebase
- Locating React component patterns (hooks, props, state)
- Identifying Swift protocol conformances or class hierarchies
- Searching for specific TypeScript patterns (async/await, generics, interfaces)
- Refactoring: finding all usages of a specific code structure

**Fall back to `grep`/`rg` only for**:
- Plain-text documentation searches
- Log messages or string literals
- Configuration values (JSON, YAML)
- Explicitly requested text-only searches

#### Text Search (grep/rg)

For non-code searches (docs, logs, configs):
```bash
# Search documentation
grep -r "Liquid Glass" docs/

# Search with context
grep -C 3 "error" logs/

# Case-insensitive
grep -i "expo sdk" README.md
```

### Workflow Integration

When debugging or implementing features:

1. **Find code structures**: Use `ast-grep` to locate functions, classes, components
2. **Search documentation**: Use `grep` in `docs/REF_DOC/` for API references
3. **Verify implementations**: Cross-reference `ast-grep` results with reference docs
4. **Refactor safely**: Use `ast-grep` patterns to ensure complete coverage

## Build & Release

### Local workflows

| Task | Command | Notes |
| --- | --- | --- |
| Dev client | `npm start` | Starts Metro with Expo dev client. |
| iOS device/simulator | `npm run ios` | Runs `expo run:ios`; regenerates native project and `pod install`. Podfile currently disables Fabric—see plan before toggling. |
| Android device/emulator | `npm run android` | Uses Java 17 path override. For Gradle-only builds run `./android-java17.sh && cd android && ./gradlew assembleDebug`. |
| Web preview | `npm run web` | Expo web bundler. |
| Native DNS harness | `cd modules/dns-native && npm test` (unit) / `npm run test:integration` (device required). |

### Expo Application Services

- `eas.json` profiles:
  - `development`: Dev client, Debug config, iOS simulator ready.
  - `preview`: Internal distribution, Release config, dSYM + sourcemaps for smoke tests.
  - `production`: Store distribution with Hermes dSYM archival and symbol uploads.
- iOS submit profile pre-populates Apple ID (`mvneves75@gmail.com`), ASC app ID `6740045336`, and team `N4BTRJM68S`—update secrets in EAS when rotating credentials.
- Tag releases (`git tag vX.Y.Z`) before EAS builds so OTA updates trace to git history.

### Versioning and compliance

- Keep `package.json`, `app.json`, native project versions in sync via `npm run sync-versions` (dry run first).
- **Apple**: Follow latest Xcode + 1024×1024 icon requirement and privacy manifest deadlines (effective Jan 31, 2026). [4]
- **Google Play**: Target API 35 is mandatory for new uploads after Aug 31, 2025; repo already targets 35 via `app.config.ts` but verify Gradle ext stays aligned. [5]
- **Safe areas**: Use `react-native-safe-area-context` (already installed) instead of legacy RN `SafeAreaView`. [6]

## Troubleshooting

1. **New Architecture drift** – `app.config.ts` enables Fabric/TurboModules, but `ios/Podfile` sets `ENV['RCT_NEW_ARCH_ENABLED'] = '0'`. Decide per modernization plan; inconsistent toggles cause native module crashes.
2. **DNS transport fallback** – `node test-dns-simple.js` or in-app logs show fallback order (Native → UDP → TCP → DoH). VPN/corporate networks can block UDP port 53; ensure TCP/HTTPS succeed.
3. **Native module missing** – Run `pod install` (iOS) or Gradle sync (Android) after editing `modules/dns-native` or bridge code. Ensure `RNDNSModule` is autolinked before launching the app.
4. **Version drift** – If `npm run sync-versions:dry` reports deltas, update CHANGELOG and rerun without `--dry-run` to propagate marketing/build numbers.
5. **CocoaPods hiccups** – `npm run fix-pods` removes `Pods/` and reinstalls with deterministic settings. Require CocoaPods ≥1.15 for Expo SDK 54.
6. **Expo Doctor warnings** – Common alerts include missing Java 17 or mismatched Fabric config. Resolve CLI environment issues before running `eas build`.

## FAQ

- **Where do I edit navigation?** `src/navigation/index.tsx` defines the stack/tab router; individual scenes live in `src/navigation/screens/`.
- **Persistent state lives where?** React Context providers (`src/context/*`) use AsyncStorage helpers from `src/services/storageService.ts`.
- **How do I test DNS locally?** Run `node test-dns-simple.js "message"` or use the Settings screen “Transport Test” buttons.
- **Is Expo Router supported?** No—stick to React Navigation. Avoid adding alternative routing stacks without architectural review.
- **Which iOS versions support Liquid Glass?** iOS 17+ (per Apple’s WWDC24 announcement). Bridges gate features based on runtime availability. [4]
- **Safe area utilities?** Always import from `react-native-safe-area-context`; do not use deprecated RN `SafeAreaView`. [6]

## Reference Documentation

**CRITICAL**: Always consult the latest reference documentation in `docs/REF_DOC/` before making platform-specific, framework, or AI integration decisions. This local repository contains curated, up-to-date documentation to ensure alignment with current best practices and API specifications.

### Documentation Structure

The `docs/REF_DOC/` directory contains comprehensive reference materials organized by technology:

| Directory | Technology Coverage | When to Consult |
| --- | --- | --- |
| `docs_apple/` | iOS 26, iPadOS 26, macOS 26, Swift 6.2, SwiftUI, Liquid Glass, Human Interface Guidelines, Xcode, Apple platform APIs | **Always** before iOS/macOS native module work, UI design decisions, platform feature implementations, or Apple guideline compliance checks |
| `docs_expo_dev/` | Expo SDK (latest stable + pre-release), EAS Build/Submit/Update, Expo Router, config plugins, native modules | **Always** before Expo configuration changes, EAS workflow updates, SDK upgrades, or native module integration |
| `docs_reactnative_getting-started/` | React Native architecture, New Architecture (Fabric/TurboModules), platform-specific guides, core components | **Always** before React Native version upgrades, New Architecture migrations, or cross-platform component implementations |
| `docs_ai-sdk_dev/` | AI SDK, GPT-5, Gemini 2.5, Claude models, streaming, tool calling, embeddings, UI integration patterns | **Always** before implementing AI features, model integrations, streaming responses, or generative UI patterns |

### Usage Guidelines

1. **Search locally first**: Before making architectural decisions or implementing platform features, search the relevant `docs/REF_DOC/` subdirectory to verify current API specifications, best practices, and compatibility requirements.

2. **Version alignment**: Reference docs track the latest stable releases (and documented pre-release features). Cross-reference version numbers in `package.json` and native project configs against documentation to identify upgrade paths.

3. **Platform-specific implementation**:
   - **iOS/iPadOS/macOS 26**: Check `docs_apple/apple_com_full_documentation/` for SwiftUI APIs, Liquid Glass guidelines, privacy manifest requirements, and App Store compliance.
   - **Expo SDK**: Review `docs_expo_dev/` for config schema changes, EAS workflow updates, and deprecated APIs.
   - **React Native**: Consult `docs_reactnative_getting-started/` for New Architecture migration guides, TurboModule specifications, and Fabric component patterns.
   - **AI integrations**: Reference `docs_ai-sdk_dev/` for GPT-5, Gemini 2.5, and Claude model capabilities, token limits, streaming protocols, and UI integration examples.

4. **Compliance verification**:
   - Apple platform guidelines (HIG, privacy, accessibility): `docs_apple/apple_design_human-interface-guidelines/`
   - App Store review guidelines: `docs_apple/apple_com_full_documentation/app-store/review/guidelines.md`
   - Google Play policies: Cross-reference with Android SDK documentation in `docs_apple/` (some Google policies documented alongside Apple comparisons)

5. **Search strategies**:
   - **Syntax-aware code search**: Use `ast-grep` for structural pattern matching (default to `ast-grep --lang typescript -p '<pattern>'` for TypeScript/JavaScript, `--lang swift` for Swift, `--lang kotlin` for Kotlin). Only fall back to `rg` or `grep` for plain-text searches.
   - **Text-based search**: Use `Grep` tool with contextual patterns: `Grep -i -n "Liquid Glass" path:docs/REF_DOC/docs_apple/`
   - **File discovery**: Use `Glob docs/REF_DOC/**/*liquid-glass*.md` for pattern-based file matching
   - **Comprehensive research**: Launch `Task` agent with specific documentation search scope

### Priority Decision Matrix

When multiple reference sources exist, prioritize in this order:

1. **Local `docs/REF_DOC/`** (most current, curated for this project)
2. Official online documentation (use `WebFetch` for real-time updates not yet mirrored locally)
3. Community resources (Stack Overflow, GitHub discussions) only for gap-filling after consulting 1–2

### Critical Scenarios Requiring Reference Consultation

**Before you proceed**, verify against `docs/REF_DOC/` when:

- Upgrading Expo SDK, React Native, or native dependencies
- Implementing iOS 26 Liquid Glass effects or macOS 26 features
- Integrating GPT-5, Gemini 2.5, or other AI models
- Migrating to React Native New Architecture (Fabric/TurboModules)
- Adding platform-specific native modules (Swift/Kotlin)
- Updating EAS Build/Submit workflows
- Implementing accessibility, privacy, or security features
- Resolving platform deprecation warnings
- Designing UI/UX components (consult Apple HIG, Material Design 3)
- Troubleshooting platform-specific crashes or performance issues

### Example Workflows

**Scenario**: Implementing iOS 26 Liquid Glass blur effect in chat message bubbles

1. Search `docs/REF_DOC/docs_apple/` for "Liquid Glass" implementation patterns
2. Review `apple_com_full_documentation/documentation/TechnologyOverviews/liquid-glass.md`
3. Check `apple_design_human-interface-guidelines/design/human-interface-guidelines/` for visual design specs
4. Verify iOS version requirements and fallback strategies
5. Implement with runtime availability checks per Apple guidelines

**Scenario**: Integrating GPT-5 streaming responses in chat interface

1. Review `docs/REF_DOC/docs_ai-sdk_dev/docs/ai-sdk-core/stream-text.md`
2. Check model capabilities in `docs_ai-sdk_dev/cookbook/guides/gpt-5.md`
3. Verify streaming protocol in `docs_ai-sdk_dev/docs/ai-sdk-ui/stream-protocol.md`
4. Implement with error handling per AI SDK patterns
5. Test token limits and rate limiting strategies

## References

1. Expo SDK 54 release notes: https://expo.dev/changelog/sdk-54
2. React Native 0.81 release blog: https://reactnative.dev/blog/2025/08/12/react-native-0.81
3. Expo CLI system requirements: https://docs.expo.dev/more/expo-cli/#system-requirements
4. Apple Liquid Glass & platform requirements: https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
5. Google Play target API policy: https://support.google.com/googleplay/android-developer/answer/11926878
6. `react-native-safe-area-context` documentation: https://github.com/th3rdwave/react-native-safe-area-context
