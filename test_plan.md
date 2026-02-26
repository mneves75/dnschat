# Expo SDK 55 Migration Test Plan

## Scope
Upgrade DNSChat from Expo SDK 54 to SDK 55 with compatible iOS/Android native integration and CI checks.

## Success Criteria
- Functional: App compiles for iOS and Android on SDK 55 dependency graph.
- Observable: Expo Doctor reports no blocking issues.
- Quality gates: Lint, unit tests, typed routes verification, pod sync verification, Android setup checks, React Compiler checks pass.

## Verification Matrix
- `CI=1 bunx expo-doctor@latest` => PASS
- `bun run lint` => PASS
- `bun run test` => PASS
- `bun run verify:typed-routes` => PASS
- `bun run verify:ios-pods` => PASS
- `bun run verify:android` => PASS
- `bun run verify:react-compiler` => PASS
- `bun run verify:android-16kb` => PASS
- `cd modules/dns-native && npm test` => PASS
- `xcodebuild -workspace ios/DNSChat.xcworkspace -scheme DNSChat -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' build` => PASS
- `cd android && JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home ./gradlew :app:assembleDebug` => PASS
