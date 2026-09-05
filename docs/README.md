# DNSChat docs

Developer documentation for DNSChat. Code is the source of truth — these docs explain *why* and *how it fits together*.

## Start here

- `docs/INSTALL.md` — setup, build, and verification commands
- `docs/architecture/SYSTEM-ARCHITECTURE.md` — what talks to what
- `docs/technical/DNS-PROTOCOL-SPEC.md` — DNS query/response rules (current behavior)
- `docs/technical/SPECIFICATION.md` — product behavior + repo invariants
- `docs/plans/SDK56_UPGRADE_PLAN.md` — SDK 56 upgrade plan and verification gate
- `docs/plans/EXPO_UI_COMPONENT_MIGRATION_PLAN.md` - Expo UI adoption decision
  and migration plan
- `docs/e2e-axe-feature-coverage.md` — AXe simulator E2E feature checklist
  and runner notes
- `docs/technical/CHAT-TEMPLATE-2026-REVIEW.md` — 2026 chat-template review plan and applied repairs
- `docs/technical/SCREEN-MOUNT-PERF.md` — per-screen mount budget, measurement protocol, current baseline
- `docs/troubleshooting/COMMON-ISSUES.md` — known issues and fixes

## Reference

- `docs/technical/EXPO-DOCTOR-CONFIGURATION.md` — why specific Expo Doctor warnings are intentional
- `docs/data-inventory.md` — on-device data storage, retention, encryption
- `docs/model-registry.md` — model usage policy (currently: none)
- `docs/public-release-redaction.md` — public-doc redaction policy and release
  evidence split

## Verification and release state

Current candidate proof and known blockers live in `MEMORY.md`; older build
results do not establish the state of a newer binary. The September audit plan
and its decisions are in `docs/technical/AUDIT-PLAN-2026-09.md`.

Use `docs/agents/development.md` for focused checks, full gates, compiled-app QA,
profiling and worktree isolation. Runtime verification defaults to Argent; the
AXe checklist above is a documented fallback. There is no configured iOS XCTest
target. Privacy and unauthenticated-DNS production decisions are tracked in
`SECURITY.md` and `docs/model-registry.md`.

## Release

- `docs/ANDROID_RELEASE.md` — Android release checklist + signing
- `docs/ANDROID_GOOGLE_PLAY_STORE.md` — Play Store publishing guide
- `docs/App_store/Apple_App_Store/AppStoreConnect.md` — App Store listing materials
- `docs/App_store/Apple_App_Store/TESTFLIGHT.md` — TestFlight upload steps

## External

- React Native: https://reactnative.dev/docs/getting-started
- Expo: https://docs.expo.dev/
- Expo Router: https://docs.expo.dev/router/introduction/
- DNS RFC 1035: https://www.rfc-editor.org/rfc/rfc1035
- DNS-over-TCP RFC 7766: https://www.rfc-editor.org/rfc/rfc7766
