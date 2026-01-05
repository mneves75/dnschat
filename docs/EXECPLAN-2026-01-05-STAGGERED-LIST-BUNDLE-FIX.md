# DNSChat ExecPlan: Fix useStaggeredList Bundling Regression (2026-01-05)

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.

PLANS.md is not present in this repository. This document is therefore the sole execution plan for this work and must remain self-contained.

## Purpose / Big Picture

Restore a clean iOS bundling pipeline by fixing the syntax error in the staggered list hook module, then ship a patch release with updated documentation so a reviewer can reproduce the fix and see that the app builds without errors. After this change, starting the app with the Expo dev client should no longer fail with a JSX parse error in `useStaggeredList`.

## Progress

- [x] (2026-01-05 02:51Z) Confirmed the iOS bundler fails due to JSX in `src/ui/hooks/useStaggeredList.ts` and identified the module extension mismatch as the root cause.
- [x] (2026-01-05 02:51Z) Restored the hook module to a `.tsx` file and normalized the import ordering so JSX parses correctly.
- [x] (2026-01-05 02:51Z) Bumped release metadata to 3.8.8 (build 28) using `scripts/sync-versions.js`.
- [x] (2026-01-05 02:51Z) Updated changelog and release/store documentation to reflect the 3.8.8 build.
- [x] (2026-01-05 02:53Z) Ran lint and Jest tests and captured evidence in Artifacts and Notes.
- [ ] Commit the patch release and push the branch.

## Surprises & Discoveries

- Observation: Metro fails when JSX appears inside a `.ts` file, producing a parser error before the app can bundle.
  Evidence: iOS bundling error pointing at `src/ui/hooks/useStaggeredList.ts` line 260 with an unexpected token on `<Animated.View>`.

## Decision Log

- Decision: Restore `useStaggeredList` to a `.tsx` module rather than rewriting JSX to `React.createElement`.
  Rationale: The file defines a React component and JSX is the most idiomatic and readable solution for React Native. Aligning the extension avoids parser errors without altering runtime logic.
  Date/Author: 2026-01-05 / Codex.

- Decision: Ship a patch release (3.8.8) for the bundling fix and documentation updates.
  Rationale: The error blocks iOS builds, so a clear patch release provides an auditable trail and clean metadata sync.
  Date/Author: 2026-01-05 / Codex.

## Outcomes & Retrospective

The bundling regression is resolved by restoring `.tsx` parsing for the staggered list hook and the release documentation is synchronized to 3.8.8. Lint and Jest tests pass; remaining work is publishing the patch commit.

## Context and Orientation

DNSChat is an Expo dev-client React Native app. The staggered list animation helpers live at `src/ui/hooks/useStaggeredList.tsx`, and list screens such as `src/navigation/screens/Logs.tsx` and `src/navigation/screens/GlassChatList.tsx` consume the `AnimatedListItem` component from that module. Version metadata flows from `package.json`, then `scripts/sync-versions.js` updates `app.json`, `ios/DNSChat.xcodeproj/project.pbxproj`, and `android/app/build.gradle`. Changelog and release documentation live in `CHANGELOG.md`, `docs/ANDROID_RELEASE.md`, `docs/ANDROID_GOOGLE_PLAY_STORE.md`, and `docs/App_store/Apple_App_Store/AppStoreConnect.md` plus `docs/App_store/Apple_App_Store/TESTFLIGHT.md`.

This plan is authored to satisfy the execution and documentation requirements in `docs/GUIDELINES-REF/EXECPLANS-GUIDELINES.md` and the repository-wide expectations in `docs/GUIDELINES-REF/SOFTWARE-ENGINEERING-GUIDELINES.md`, `docs/GUIDELINES-REF/DEV-GUIDELINES.md`, `docs/GUIDELINES-REF/MOBILE-GUIDELINES.md`, `docs/GUIDELINES-REF/EXPO-GUIDELINES.md`, `docs/GUIDELINES-REF/REACT-GUIDELINES.md`, `docs/GUIDELINES-REF/TYPESCRIPT-GUIDELINES.md`, and `docs/GUIDELINES-REF/CHANGELOG.md`.

## Plan of Work

Phase 0 is discovery and constraint capture. Read the reported bundler error, identify the precise module and line, and confirm that the file extension does not allow JSX parsing. Note any nearby consumers so the fix does not break exports. The milestone is complete when the error can be explained in plain language and mapped to a specific file path.

Phase 1 is the code fix. Restore the module extension to `.tsx` and ensure imports remain valid. Verify that the file still exports `useStaggeredList`, `useStaggeredListValues`, and `AnimatedListItem` exactly as before, and that import paths in screen modules remain unchanged.

Phase 2 is release metadata and docs alignment. Update `package.json` to the new patch version, run `bun run sync-versions --bump-build`, and update changelog plus release/store docs so every version reference matches 3.8.8 (build 28). The milestone is complete when all version references align.

Phase 3 is verification. Run `bun run lint` and `bun run test` to demonstrate that the repository still builds and tests. If local iOS build verification is available, run `bun run ios` and confirm the bundler error no longer appears. Capture results in Artifacts and Notes.

## Concrete Steps

Run the following from the repository root (`/Users/mneves/dev/MOBILE/chat-dns`):

  1) Rename the staggered list module back to TSX and ensure imports stay valid.
     Example command:
       git mv src/ui/hooks/useStaggeredList.ts src/ui/hooks/useStaggeredList.tsx

  2) Bump the patch version in `package.json` and sync metadata:
       bun run sync-versions --bump-build

  3) Update changelog and release docs for 3.8.8.

  4) Verification:
       bun run lint
       bun run test

  5) Commit and push once verification passes.

## Validation and Acceptance

Acceptance requires that the Expo bundler no longer throws a JSX parse error in `useStaggeredList`, lint and Jest tests pass, and all release docs show version 3.8.8/build 28. A reviewer should be able to run `bun run ios` or `bun run start` and see a successful bundle without the prior SyntaxError, then confirm the changelog entry and store notes reflect the fix.

## Idempotence and Recovery

Re-running the rename and version sync is safe. If anything fails, revert the commit and re-run `bun run sync-versions --bump-build` to restore the previous version/build metadata. Documentation edits can be reverted with git without impacting runtime behavior.

## Artifacts and Notes

Version sync output (2026-01-05):

  DNSChat Version Sync Script
  Source version (package.json): 3.8.8
  [sync-versions] iOS current: version=3.8.7 build=27
  [sync-versions] Android current: version=3.8.7 build=27
  [sync-versions] Build policy: bump-build flag
  Target build number: 28
  [sync-versions] app.json: 3.8.7 -> 3.8.8
  [sync-versions] iOS: 3.8.7 (27) -> 3.8.8 (28)
  [sync-versions] Android: 3.8.7 (27) -> 3.8.8 (28)

Lint output (2026-01-05):

  bun run lint
  Result: PASS (ast-grep scan completed with exit code 0)

Test output (2026-01-05):

  bun run test
  Result: PASS (65 suites, 1 skipped, 718 tests)

## Interfaces and Dependencies

No new dependencies are introduced. The public module surface remains:

  - `useStaggeredList(itemCount, options)`
  - `useStaggeredListValues(itemCount, options)`
  - `AnimatedListItem` component

All existing consumers in `src/navigation/screens/Logs.tsx` and `src/navigation/screens/GlassChatList.tsx` must continue to import from `src/ui/hooks/useStaggeredList` without changing their usage.

Revision note (2026-01-05): Initial plan created to address the `useStaggeredList` JSX bundling regression and document the 3.8.8 patch release steps.
