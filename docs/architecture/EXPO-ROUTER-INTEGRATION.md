# Engineering Exec Spec: Expo Router Integration (DNSChat)

Status: Implemented
Owner: Mobile
Last updated: 2026-01-04
Execution record: `docs/EXECPLAN-2026-01-04-EXPO-ROUTER-MIGRATION.md`.

## Goal

Adopt Expo Router (file-based routing) as DNSChat's navigation system across iOS, Android, and Web, while preserving current product behavior, deep-link compatibility, and the repo's security and quality constraints.

This is an execution spec and a multi-phase engineering plan. It is intentionally explicit about invariants, sequencing, verification, and rollback.

## Non-goals

- Changing DNS query behavior, sanitization, transport order, or DNS server allowlists.
- Rewriting all screens to Expo Router APIs immediately (we can keep some `@react-navigation/*` usage where it remains compatible).
- Adding new DNS transports (e.g., DNS-over-HTTPS in the TypeScript layer).
- Major UI redesign. Navigation UX should stay equivalent (tabs + stack + modal).

## Repo constraints to preserve

These are current, enforced constraints that must remain true after the migration:

- Security-first: do not add secrets, credentials, or unvalidated endpoints (see `docs/technical/SPECIFICATION.md`).
- No emoji / pictographic glyphs in tracked files (enforced by tests).
- Keep changes small and testable where possible (see `CONTRIBUTING.md` and `CLAUDE.md`).
- Web must continue to use Mock DNS by default (browsers cannot do raw DNS on port 53).

## Current state (post-implementation, 2026-01-04)

### Runtime navigation

- App entry point: `entry.tsx` imports `expo-router/entry` after bootstrap side-effects.
- Navigation implementation: Expo Router file-based routes in `app/`.
  - Tabs: Chat list, Logs, About.
  - Stack: Chat, Profile, Settings (modal), NotFound, plus DevLogs (dev-only deep link).

### Deep linking

- App scheme: `dnschat` (configured in `app.json`).
- Router linking prefixes: `dnschat://` (configured in `app.json`).
- Special deep links:
- Profile route is matched as a single path segment starting with `@` (implemented via the `/[user]` redirect shim in `app/[user].tsx`).
  - Dev logs route: `dnschat://dev/logs` (dev-only).

### Existing `app/` directory hazard (resolved)

The previous `app/(dashboard)/[threadId].ts` non-route module was relocated to `src/utils/dnsErrors.ts` and unit tests now import the new location. The `app/` directory now contains only valid route components.

### Provider + side-effect structure

`app/_layout.tsx` currently owns:

- Provider tree (GestureHandlerRootView, SafeAreaProvider, KeyboardProvider, ErrorBoundary, and app contexts).
- Onboarding gating (renders `OnboardingContainer` when not completed).
- Splash screen control (`SplashScreen.preventAutoHideAsync()` and `hideAsync()`).
- DNS log initialization and Android startup diagnostics.
- Conditional Liquid Glass wrapper on iOS when supported.

Moving to Expo Router will require relocating these responsibilities into Expo Router's root layout while preserving ordering requirements (notably `react-native-gesture-handler` import timing).

## Best-practice alignment (source of truth)

Expo Router should be installed and configured following the official Expo Router docs for:

- Installation steps (dependencies, entry point, app config scheme).
- Router API and component usage (`Link`, `router`, `useLocalSearchParams`, etc.).
- Typed routes (optional / beta): `experiments.typedRoutes`.

Key guidance to follow:

- Prefer a real `app/` file-based structure with layouts and route groups.
- Use a custom entry point when the app requires early side-effects (e.g., gesture handler import) and import `expo-router/entry` last.

## Proposed approach (chosen)

### Option A: "Big bang" migration in one PR

Pros:
- Shortest time to fully adopt Router.

Cons:
- High risk: navigation, onboarding gating, and deep links all change at once.
- Harder to bisect regressions.

### Option B: Phased migration with a hard cutover point (recommended)

We still need a cutover where `package.json`'s `main` switches to the Router entry, but everything around that cutover is prepared in prior phases to keep the cutover PR small and reversible.

Pros:
- Minimizes breakage risk.
- Keeps diffs reviewable.
- Allows dedicated validation per surface (tabs, stack routes, deep links, onboarding).

Cons:
- Requires discipline to keep phases focused.

Chosen: Option B.

## Target routing architecture

### Route map (desired)

This is the target `app/` structure after migration:

```
app/
  _layout.tsx
  +not-found.tsx
  onboarding.tsx
  (tabs)/
    _layout.tsx
    index.tsx
    logs.tsx
    about.tsx
  chat/
    [threadId].tsx
  profile/
    [user].tsx
  (modals)/
    settings.tsx
  dev/
    logs.tsx
  [user].tsx
```

Notes:

- `(tabs)` is the main app surface.
- `chat/[threadId]` replaces the current `Chat` stack screen.
- `(modals)/settings` replaces the current modal Settings screen.
- `dev/logs` preserves `dnschat://dev/logs` deep link behavior but is guarded to dev-only at runtime.
- `[user].tsx` at the root is used to preserve the historical deep link format `dnschat://@username` by redirecting to `/profile/username` when the segment begins with `@`. It should otherwise render `+not-found` behavior.

### Root providers + layout responsibilities

`app/_layout.tsx` is now the single place where the app composes:

- Providers previously created in `src/App.tsx`.
- Splash screen gating (including `hideAsync()` once onboarding state is resolved).
- Onboarding gate:
  - If onboarding is not completed and the user is not already on `/onboarding`, redirect to `/onboarding`.
  - After completion, redirect to the main tabs route.
- DNS log initialization and dev-only Android diagnostics.
- Optional Liquid Glass wrapper for iOS, if supported.

Invariants:

- Provider ordering remains stable.
- Splash screen is never hidden before onboarding state is fully resolved.
- Web still uses Mock DNS by default.

## Engineering plan (multi-phase)

This plan is designed so that each phase can be done as a separate PR if desired.

### Phase 0: Discovery and preflight (no behavior changes)

Acceptance criteria:

- A single, documented route map exists (this doc).
- All `app/` directory "pseudo-route" files are removed or relocated out of `app/`.
- Tests still pass.

Completed:

- Moved `resolveDnsErrorMessage` and related helpers into `src/utils/dnsErrors.ts`.
- Updated `__tests__/threadScreen.errors.spec.ts` imports accordingly.
- Confirmed `app/` contains only route components before Router enablement.

Verification:

- `bun run test`
- `bun run lint`

Rollback:

- Pure refactor; revert commit.

### Phase 1: Add Expo Router dependencies (no cutover yet)

Goal: Prepare dependency graph and native projects before switching the entry point.

Acceptance criteria:

- `expo-router` and required peer deps are installed via `npx expo install`.
- iOS pods and Android builds remain consistent with `bun run verify:ios-pods` and `bun run verify:android`.

Completed:

- Installed dependencies:
  - `expo-router`
  - `expo-constants`
  - `expo-status-bar`
  - Verified `expo-linking`, `react-native-safe-area-context`, `react-native-screens` remain SDK-compatible.
- Updated documentation to reflect Router dependency presence.

Verification:

- `bun run verify:ios-pods`
- `bun run verify:android`
- `bun run test`

Rollback:

- Revert dependency changes (including lockfile).

### Phase 2: Router bootstrap (introduce `app/` layouts, still no cutover)

Goal: Create Router route files so cutover becomes a small, mechanical step.

Acceptance criteria:

- `app/` contains valid route components only.
- Route tree compiles (typecheck and Metro parse).
- Not-found route exists.

Completed:

- Added the full route tree:
  - `app/_layout.tsx`
  - `app/+not-found.tsx`
  - `app/(tabs)/_layout.tsx`, `index.tsx`, `logs.tsx`, `about.tsx`
  - `app/chat/[threadId].tsx`
  - `app/profile/[user].tsx`
  - `app/(modals)/settings.tsx`
  - `app/dev/logs.tsx`
  - `app/[user].tsx` redirect shim for `@username`
- Ported the provider tree into `app/_layout.tsx` and replaced navigation with Router stack routes.
- Reused the existing screen implementations via lightweight route wrappers.

Verification:

- `bun run test`
- `bun run lint`

Rollback:

- No runtime cutover yet; safe to revert.

### Phase 3: Entry point cutover (enable Router)

Goal: Switch the app runtime to use Expo Router.

Acceptance criteria:

- The app boots into the tabs route on iOS/Android and renders the main list.
- Web build boots and navigates between routes.

Completed:

- Implemented a Router-compatible entry point in `entry.tsx` with `expo-router/entry` imported last.
- Updated `package.json` `"main"` to `entry.tsx`.
- Repurposed the previous `registerRootComponent(App)` flow to delegate to `entry.tsx`.

Verification:

- `bun run start` and open iOS/Android dev-client builds
- `bun run web` and navigate between `/`, `/logs`, `/about`

Rollback:

- Restore `package.json` `"main"` and the previous entry file.

### Phase 4: Deep link parity + redirects

Goal: Preserve existing deep link behavior, especially:

- `dnschat://dev/logs` (dev-only)
- `dnschat://@username` profile format

Acceptance criteria:

- Deep links open the correct screens on iOS/Android.
- Invalid deep links land on `+not-found`.

Completed:

- Verified app config scheme remains `dnschat` in `app.json`.
- Implemented:
  - `/dev/logs` guarded by dev-only logic (prod renders not-found).
  - `/[user]` redirect shim with `@<allowed>` validation to `/profile/<allowed>`.
- Added unit coverage for route param parsing and redirect validation.

Verification (manual):

- iOS: `npx uri-scheme open dnschat://dev/logs --ios`
- Android: `npx uri-scheme open dnschat://dev/logs --android`
- Profile: `npx uri-scheme open dnschat://@testuser --ios`

Rollback:

- Deep links are additive; revert the route shim if needed.

### Phase 5: Onboarding flow integration

Goal: Implement onboarding gating using Router navigation primitives.

Acceptance criteria:

- Fresh install path:
  - App shows onboarding until completion.
  - After completion, user lands in the main tabs route and onboarding is not shown again.
- Returning user path:
  - App goes directly to main tabs.

Completed:

- Added `app/onboarding.tsx` to render the existing `OnboardingContainer`.
- Added redirect gating in `app/_layout.tsx` based on onboarding state and kept the splash screen visible until state resolution.

Verification:

- Manual: reset onboarding in settings (or delete app storage) and re-run.

Rollback:

- Keep the previous gating logic as a fallback branch until stabilized.

### Phase 6: Navigation cleanup + dependency pruning

Goal: Remove unused React Navigation configuration and reduce maintenance surface.

Acceptance criteria:

- No dead navigation code remains.
- `src/navigation/*` is either removed or reduced to screen-only modules.
- Unused dependencies are removed if no longer needed.

Completed:

- Removed legacy navigation scaffolding:
  - `src/navigation/index.tsx`
  - `createStaticNavigation` usage
  - `react-native-bottom-tabs` dependency
- Replaced `useNavigation` calls with `router` / `useRouter` where it clarified intent.

Verification:

- `bun run test`
- `bun run lint`
- `bun run verify:ios-pods`

Rollback:

- This phase should happen only after Router is stable.

### Phase 7: Typed routes (optional, recommended)

Goal: Improve correctness and refactor safety with typed route generation.

Acceptance criteria:

- `experiments.typedRoutes` is enabled in `app.json`.
- Route types generate locally and are not committed.

Completed:

- Enabled `expo.experiments.typedRoutes` in `app.json`.
- Confirmed `expo-env.d.ts` remains gitignored.
- Updated route navigation call sites to use typed href objects for dynamic routes.

Verification:

- `npx expo start` generates route types.
- `bun run test` still passes.

Rollback:

- Disable `experiments.typedRoutes` if it causes friction or CI issues.

## Testing strategy

### Unit tests (Jest)

Add tests for:

- Redirect shim behavior for `dnschat://@username` mapping.
- Param parsing for `chat/[threadId]` (threadId must be stable and validated).
- Not-found behavior for invalid routes.

Keep tests deterministic and independent of native runtime.

### Manual smoke tests

Required after Phase 3+:

- iOS:
  - App boot
  - Tabs switching
  - Open chat thread from list
  - Open settings modal and close
  - Deep link `dnschat://@user`
  - Deep link `dnschat://dev/logs` (dev-only)
- Android:
  - Same set, plus verify no regressions with `AndroidStartupDiagnostics`.
- Web:
  - `bun run web` loads `/`, `/logs`, `/about`
  - Reload on deep path works (Router handles it)

## Observability and troubleshooting

- Preserve `DNSLogService` initialization and the Logs screen.
- Preserve existing "dev logs" and diagnostics, but keep dev-only screens guarded from production.

## Rollout and rollback

### Rollout

- Prefer shipping this in multiple PRs matching the phases above.
- Keep the "entry point cutover" PR minimal and reversible.

### Rollback

The critical rollback is always:

- Restore `package.json` `"main"` to the pre-Router entry file.
- Remove `expo-router` route files from `app/` (or keep them unused until fixed).

## Appendix: Key files to touch during implementation

- Entry: `package.json`, `entry.tsx` (legacy `index.tsx` delegates to it)
- Expo config: `app.json`
- Router routes: `app/*`
- Providers and gating: `app/_layout.tsx` is the single source of truth
- Screens: `src/navigation/screens/*` (initially reused, later migrated)
- Tests: `__tests__/*` (especially `__tests__/threadScreen.errors.spec.ts`)
