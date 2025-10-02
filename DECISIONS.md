# Modernization Decisions (2025-10-02)

1. **Version Authority** – `CHANGELOG.md` remains source of truth. Run `npm run sync-versions` (non-dry) at release time so `package.json`, `app.json`, and native projects align to `2.0.1`.
2. **React Native New Architecture** – Keep enabled across platforms (already true in `app.json`, Podfile, and `android/gradle.properties`). All native modules must remain TurboModule-compatible.
3. **Liquid Glass Scope** – Official support targets iOS 17+. Update native wrappers to fall back gracefully below 17 and remove iOS 26 assumptions.
4. **Observability Stack** – Adopt Sentry (`@sentry/react-native` via Expo plugin) for crash reporting and performance tracing; DNS telemetry continues via in-app logs.
5. **E2E Automation** – Implement Detox (Android & iOS) with a smoke test covering onboarding → chat send path. Integrate into CI once pipeline exists.
6. **Documentation Ownership** – Mobile Platform team (maintainer: `@mvneves`) approves future updates to `docs/apple/` and modernization docs; note responsibility in `CLAUDE.md`.
