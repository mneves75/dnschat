# DNSChat ExecPlan: Expo Router Migration and Navigation Hardening (2026-01-04)

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.

PLANS.md is not present in this repository. This document is therefore the sole execution plan for this work and must remain self-contained.

## Purpose / Big Picture

Move DNSChat to Expo Router so navigation becomes file-based, deep links are first-class, and onboarding gates are enforced in one predictable place. The user-visible result is identical tabs + stack + modal behavior with the same deep-link formats, while the codebase becomes easier to reason about and safer to evolve.

## Goal and Non-Goals

The goal is to migrate navigation to Expo Router with deep-link parity and stable onboarding gating while preserving all existing DNS and local-storage behavior. Non-goals include DNS transport changes, UI redesigns, and store submission workflows.

## Current State

Navigation now starts from `entry.tsx` with Expo Router enabled, and the route tree lives under `app/`. Provider composition, splash gating, onboarding redirects, and DNS log initialization are owned by `app/_layout.tsx`. Deep links use the `dnschat` scheme and route through the new file-based paths.

## Proposed Approach

Option A is a single large cutover that replaces navigation in one step. This is faster but harder to debug. Option B is a phased migration that prepares route files, then switches the entry point in a small and reversible step; this is the selected approach. Option C keeps the legacy navigation stack and avoids Router entirely, but it blocks typed routes and deep-link simplification.

## Architecture / Data Flow Changes

The entry point now imports `expo-router/entry` and all navigation flows are represented by file-based routes under `app/`. Navigation calls move from React Navigation screen names to Router paths, and route parameters are normalized via `src/utils/routeParams.ts` for profile and chat paths. Core DNS behavior and storage flows remain unchanged.

## Progress

- [x] (2026-01-04 21:10Z) Removed the non-route module from `app/` and relocated DNS error helpers into `src/utils/dnsErrors.ts` with updated tests.
- [x] (2026-01-04 21:12Z) Installed Expo Router dependencies and added the config plugin in `app.json`.
- [x] (2026-01-04 21:18Z) Created the full Expo Router route tree with tabs, stacks, modals, dev-only logs, and onboarding routes.
- [x] (2026-01-04 21:20Z) Cut over the entry point to `entry.tsx` and updated `package.json` to boot via Expo Router.
- [x] (2026-01-04 21:23Z) Implemented deep-link parity with `/[user]` redirects and dev-only `/dev/logs` route guards plus route param tests.
- [x] (2026-01-04 21:25Z) Replaced legacy navigation calls with Expo Router `router` helpers and removed `react-native-bottom-tabs`.
- [x] (2026-01-04 21:27Z) Enabled typed routes and updated web bundler config to Metro for Router parity.
- [x] (2026-01-04 21:30Z) Bumped version to 3.8.5 (build 25), updated CHANGELOG, and refreshed relevant docs.
- [x] (2026-01-04 21:35Z) Ran lint/tests, iOS/Android verification checks, and recorded artifacts.

## Surprises & Discoveries

- Observation: `app/(dashboard)/[threadId].ts` was a non-route module that would break Router on startup.
  Evidence: It exported only helpers and was imported by `__tests__/threadScreen.errors.spec.ts`.
- Observation: Legacy navigation used a native tabs package that is incompatible with Expo Router tabs.
  Evidence: `react-native-bottom-tabs` was only referenced by `src/navigation/index.tsx`.

## Decision Log

- Decision: Use `entry.tsx` to import `expo-router/entry` last and keep bootstrap side-effects intact.
  Rationale: preserves gesture-handler ordering and crypto bootstrap while aligning with Expo Router entry guidance.
  Date/Author: 2026-01-04 / Codex
- Decision: Implement `app/[user].tsx` as a redirect shim for `dnschat://@username` deep links.
  Rationale: preserves the historical profile link format without leaking invalid segments into profile routes.
  Date/Author: 2026-01-04 / Codex
- Decision: Remove `react-native-bottom-tabs` and rely on Expo Router tabs.
  Rationale: Expo Router requires React Navigation tabs; keeping the native tabs package would create two incompatible navigation systems.
  Date/Author: 2026-01-04 / Codex

## Outcomes & Retrospective

DNSChat now boots through Expo Router with a file-based route tree, typed routes, and a single root layout that owns providers, onboarding gating, and initialization. Deep links for `dnschat://@username` and `dnschat://dev/logs` are preserved, and navigation code no longer depends on legacy `createStaticNavigation` or native bottom tabs. Lint/tests and verification checks pass with documented warnings, and version metadata is synchronized at 3.8.5 (build 25). The migration remains reversible by restoring the legacy entry point and re-adding the old navigation scaffold.

## Context and Orientation

The app now starts from `entry.tsx`, which imports `expo-router/entry` after bootstrap side-effects. The root layout is `app/_layout.tsx`, where the provider tree, splash screen gating, onboarding redirects, and DNS log initialization live. The tab UI lives in `app/(tabs)/_layout.tsx`, and the main screens are exposed via `app/(tabs)/index.tsx`, `app/(tabs)/logs.tsx`, and `app/(tabs)/about.tsx`. The chat flow uses a dynamic route at `app/chat/[threadId].tsx`, and profile deep links use a redirect shim at `app/[user].tsx` before landing on `app/profile/[user].tsx`. Settings is now a modal route at `app/(modals)/settings.tsx`, and dev-only logs live at `app/dev/logs.tsx`.

## Phased Plan with Milestones

Phase 0 removes non-route files from `app/` and updates imports; acceptance is a clean app directory with tests still passing. Phase 1 installs Router dependencies and verifies Expo configuration compatibility; acceptance is clean installs and verification commands. Phase 2 adds the full route tree and ports provider composition to `app/_layout.tsx`; acceptance is a compilable route tree with the same screen implementations. Phase 3 cuts over the entry point to `entry.tsx`; acceptance is successful app boot into tabs on all platforms. Phase 4 restores deep-link parity with redirect shims and dev-only route guards; acceptance is correct routing for `dnschat://@username` and `dnschat://dev/logs`. Phase 5 adds onboarding gating in the root layout; acceptance is onboarding shown on fresh install and hidden after completion. Phase 6 removes legacy navigation scaffolding and replaces navigation calls; acceptance is no `createStaticNavigation` or `react-native-bottom-tabs` usage. Phase 7 enables typed routes and Metro web bundling; acceptance is typed routes generated locally and web navigation working.

## Testing Strategy

Run `bun run lint` and `bun run test` for unit coverage, then validate deep links and onboarding behavior manually on iOS and Android. Use `bun run verify:ios-pods` and `bun run verify:android` to confirm platform configuration health.

## Observability

No new telemetry is added. Existing logs and error boundaries remain in place, and production console stripping remains enabled for non-error logs.

## Rollout Plan

Ship via a dev-client build first, validate on-device navigation and deep links, then proceed with normal release tagging and store build workflows.

## Rollback Plan

Restore the legacy entry point in `package.json`, re-add the old navigation scaffold, and remove Router routes if regressions appear.

## Risks and Mitigations

Navigation regressions are the primary risk; mitigate with manual deep-link checks and smoke tests on iOS and Android. Typed routes can introduce tooling friction; mitigate by keeping generated files gitignored. Removal of `react-native-bottom-tabs` can leave stale CocoaPods entries; mitigate by regenerating `ios/Podfile.lock` on macOS if needed.

## Open Questions

None blocking. Manual deep-link and onboarding smoke tests remain pending.

## Concrete Steps

Run from repository root:

    bun run lint
    bun run test
    bun run verify:ios-pods
    bun run verify:android
    bun run sync-versions:dry

If version metadata changes are required:

    bun run sync-versions -- --bump-build

## Validation and Acceptance

The app must boot to the tabs view, allow creating and opening chats, and open Settings as a modal. Deep links must resolve as follows: `dnschat://@username` opens the profile route and `dnschat://dev/logs` opens the dev logs screen only in development builds. Onboarding must display on a fresh install and redirect to tabs on completion. Tests and lint must pass, and version metadata should be synchronized across package.json, app.json, iOS, and Android.

## Idempotence and Recovery

All steps are additive or reversible. If Router causes regressions, restore `package.json` `"main"` to the legacy entry, re-add the old navigation scaffold, and remove the Router routes. Version bumps are reversible by re-running `bun run sync-versions` with the prior version.

## Artifacts and Notes

Verification outputs (2026-01-04):

    bun run lint
    Result: PASS (ast-grep scan completed with exit code 0)

    bun run test
    Result: PASS (65 suites passed, 1 skipped; 706 tests passed, 13 skipped)
    Note: Console warn emitted during encryptionService.key.spec.ts for expected SecureStore fallback.

    bun run verify:ios-pods
    Result: PASS (verify-ios-pods-sync: OK)

    bun run verify:android
    Result: PASS with warnings
      - android/local.properties sdk.dir points to a missing directory
      - Metro bundler not running on port 8081
      - No Android devices or emulators connected

    bun run sync-versions:dry
    Result: PASS (all versions synchronized at 3.8.5 build 25)

Manual checks pending:

    - Deep-link validation via uri-scheme (iOS/Android)
    - On-device onboarding flow smoke test

## Interfaces and Dependencies

This migration relies on `expo-router`, `expo-constants`, and `expo-status-bar`. The core route parameter helpers live in `src/utils/routeParams.ts`, and the DNS error helpers now live in `src/utils/dnsErrors.ts`. The root layout is defined in `app/_layout.tsx`, with tab navigation in `app/(tabs)/_layout.tsx` and modal navigation in `app/(modals)/settings.tsx`.
