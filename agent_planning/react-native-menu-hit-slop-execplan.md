# Android Menu HitSlop Fix & Patch Hygiene

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

If PLANS.md file is checked into the repo, reference the path to that file here from the repository root and note that this document must be maintained in accordance with PLANS.md.

- Reference: `PLANS.md` (repository root) — follow ExecPlan structure and maintenance rules defined there.

## Purpose / Big Picture

Android debug builds fail when `@react-native-menu/menu` still calls legacy `setHitSlopRect`/`setOverflow` APIs removed in React Native 0.81+. We will deliver a resilient patch that targets the library sources (not build artifacts), ensure Gradle compiles cleanly against RN 0.81/Kotlin 2.1.20, and add guardrail tests so regressions surface before shipping.

## Progress

- [x] (2025-10-29 17:03Z) Reproduced/validated Gradle command path and confirmed current patch compilation succeeds; identified existing patch junk includes build artifacts.
- [x] (2025-10-29 17:12Z) Rebuilt `@react-native-menu/menu` patch with source-only diffs and deleted generated `android/build/**` hunks.
- [x] (2025-10-29 17:18Z) Added Jest regression test validating property-based hit slop and overflow overrides in patched sources.
- [x] (2025-10-29 17:26Z) Completed validation: ast-grep lint, targeted Jest regression, and Gradle assemble all green.
- [x] (2025-10-29 17:30Z) Final review complete; documented outcomes, artifacts, and ready for handoff.

## Surprises & Discoveries

- Observation: Existing patch `patches/@react-native-menu+menu+1.2.4.patch` contains numerous `android/build/**` artifacts that risk merge churn and make reviews noisy.  
  Evidence: manual inspection shows dozens of `build/intermediates/...` entries preceding the Kotlin diffs.

## Decision Log

- Decision: Keep using patch-package for the vendor override but trim the patch to only source-level changes so dependency updates stay reviewable.  
  Rationale: Minimizes maintenance burden and prevents patch reapply failures on clean installs.  
  Date/Author: 2025-10-29 / Codex.

## Outcomes & Retrospective

- Android assembleDebug succeeds against RN 0.81 toolchain after trimming the vendor patch to property overrides.
- Added Jest guard to flag any reintroduction of removed setters, giving us an automated safety net.

## Context and Orientation

- Failure surfaced during `android/gradlew app:assembleDebug` invoking task `:react-native-menu_menu:compileDebugKotlin`.
- React Native 0.81 refactored `ReactViewGroup` to expose `hitSlopRect` and `overflow` as properties instead of setter methods.
- Our repo applies vendor patches via `patch-package` (see `package.json postinstall`), with artifacts stored under `patches/`.
- Android Gradle Plugin runs with Kotlin 2.1.20; we must preserve nullability and override semantics so Kotlin compiler accepts the override.

## Plan of Work

1. Sanitize the vendor patch:
   - Remove accidental `android/build/**` hunks, keeping only functional Kotlin source modifications.
   - Confirm patch still adjusts `MenuView` (override property), `MenuViewManagerBase` (property assignments), and any other intentional edits.
2. Harden via regression test:
   - Add Jest test under `__tests__/` (e.g., `__tests__/native-menu-hitSlop.spec.ts`) that reads the `MenuView.kt` file and asserts we retain the `override var hitSlopRect` and `view.overflow = overflow` patterns.
   - Keep test fast; rely on fs read only.
3. Verification pipeline:
   - Reinstall patch (`patch-package` runs on postinstall; manual `npx patch-package` not required if patch file valid).
   - Run lint (`npm run lint:ast-grep`), Jest (targeted test + full suite if feasible), and Gradle assemble command to ensure Android build succeeds.
   - Capture key outputs for final summary.
4. Final quality pass:
   - Review code/patch for clarity.
   - Update ExecPlan sections and prepare final response with critique + validation evidence.

## Concrete Steps

1. `tmux new-session -d -s patchclean 'cd /Users/mvneves/dev/MOBILE/chat-dns && $SHELL'` to stage a workspace shell dedicated to patch editing.
2. Edit `patches/@react-native-menu+menu+1.2.4.patch` removing non-source hunks (use `apply_patch` for deterministic diff).
3. Save new Jest test file `__tests__/native-menu-hitSlop.spec.ts` asserting required Kotlin snippets exist.
4. Validation commands (run via tmux):
   - `tmux new-session -d -s lintcheck 'cd /Users/mvneves/dev/MOBILE/chat-dns && npm run lint:ast-grep'`
   - `tmux new-session -d -s jestcheck 'cd /Users/mvneves/dev/MOBILE/chat-dns && npm test -- __tests__/native-menu-hitSlop.spec.ts'`
   - `tmux new-session -d -s gradlecheck 'cd /Users/mvneves/dev/MOBILE/chat-dns/android && ./gradlew app:assembleDebug -x lint -x test --configure-on-demand --build-cache -PreactNativeDevServerPort=8081 -PreactNativeArchitectures=arm64-v8a'`

Record outputs and ensure non-zero exit codes are addressed before proceeding.

## Validation and Acceptance

- Android build: `./gradlew app:assembleDebug ...` completes with `BUILD SUCCESSFUL`.
- Jest regression test passes deterministically.
- `npm run lint:ast-grep` completes without findings (ensuring hook remains green).
- Manual inspection verifies patch file contains only intended source diffs.

## Idempotence and Recovery

- Patch edits are textual; re-running `patch-package` on install will reapply cleanly once noise removed.
- Jest regression test is read-only; safe to re-run.
- If Gradle build fails, examine `android/build/reports/problems` and revert patch adjustments (via `git checkout -- patches/...`) to retry.

## Artifacts and Notes

- Lint: `npm run lint:ast-grep` → passed (no findings).
- Jest: `npm test -- __tests__/native-menu-hitSlop.spec.ts` → 2 assertions green (watchman recrawl warning only).
- Gradle: `./gradlew app:assembleDebug -x lint -x test --configure-on-demand --build-cache -PreactNativeDevServerPort=8081 -PreactNativeArchitectures=arm64-v8a` → `BUILD SUCCESSFUL in 5s`.
## Interfaces and Dependencies

- `patches/@react-native-menu+menu+1.2.4.patch`: must define diffs for:
  - `node_modules/@react-native-menu/menu/android/src/main/java/com/reactnativemenu/MenuView.kt`
  - `node_modules/@react-native-menu/menu/android/src/main/java/com/reactnativemenu/MenuViewManagerBase.kt`
- Jest test file `__tests__/native-menu-hitSlop.spec.ts`.
- Validation commands rely on npm scripts defined in `package.json` and Gradle wrapper in `android/`.

---

Revision 2025-10-29 17:03Z: Initial plan drafted after verifying existing patch behavior and identifying cleanup scope.
