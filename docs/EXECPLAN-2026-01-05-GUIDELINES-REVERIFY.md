# DNSChat Engineering ExecPlan: Guidelines Re-Verification and Best-Practice Alignment (2026-01-05)

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.

PLANS.md is not present in this repository. This document is therefore the sole execution plan for this work and must remain self-contained.

## Purpose / Big Picture

Re-verify DNSChat against every document listed in docs/GUIDELINES-REF/GUIDELINES_INDEX.json, confirm alignment with current Expo SDK 54 and React Native best practices, and ship a fully verified documentation-and-metadata update that a reviewer can audit end-to-end. Success means a reviewer can reproduce the verification steps, observe matching version metadata across platforms, and confirm the project still builds cleanly via lint/tests.

## Goal and Non-Goals

The goal is to deliver a complete, evidence-backed re-verification pass that ties guideline compliance to observable code and documentation updates, then produce a clean patch-release metadata bump with synced version/build numbers.

Non-goals include adding new product features, performing major dependency upgrades (Expo SDK 55+), or refactoring core DNS transport logic beyond documentation alignment.

## Current State

DNSChat is an Expo dev-client React Native app using Expo SDK 54, React Native 0.81.5, and React 19.1.0. Navigation has migrated to Expo Router with a file-based app/ tree and a root layout that owns initialization and providers. Version metadata is sourced from package.json and synchronized across app.json, iOS project settings, and Android build.gradle via scripts/sync-versions.js. Production console stripping is enabled in babel.config.js. Local storage is encrypted at rest and DNS transport fallbacks are implemented in src/services/dnsService.ts.

## Proposed Approach (Options + Tradeoffs)

Option A (documentation-only verification). Review guidelines and produce a report without modifying code or release metadata. This is lowest risk but does not correct drift in version references or release docs.

Option B (verification plus metadata/documentation alignment). Review guidelines and best practices, then update changelog and release/store/docs references plus synced version metadata to keep the release footprint consistent. This is still low risk and produces a clean, auditable release record.

Option C (full alignment sweep). In addition to Option B, upgrade major dependencies or refactor architecture for new best-practice requirements. This produces maximal alignment but carries higher regression risk and exceeds the scope of a verification pass.

Chosen approach: Option B. It satisfies the verification mandate while keeping the change set reviewable and low risk.

## Architecture / Data Flow Changes

No runtime architecture changes are required. The only approved changes in this plan are metadata and documentation updates plus new or updated ExecPlan content. This keeps transport behavior, storage, and UI flows unchanged.

## Phased Plan With Milestones (Multi-Phase Todo)

Phase 0 (Discovery, constraints, and success metrics). Read every guideline document in docs/GUIDELINES-REF/GUIDELINES_INDEX.json, then evaluate applicability for this mobile Expo project. Inspect entry.tsx, app/_layout.tsx, app.json, babel.config.js, tsconfig.json, and core services (dnsService, dnsLogService, storageService) to confirm alignment with platform and security guidance. Capture any gaps or drift in Surprises & Discoveries. Success means all applicable guidelines are documented in this plan with a clear statement of compliance or gaps.

Phase 1 (Best-practice validation). Verify current external best-practice guidance for Expo SDK 54, Expo Router entry setup and typed routes, and React Native performance guidance for production logging. Cross-check that the repo is configured accordingly. Success means a reviewer can point to the exact files that implement the latest guidance and see those settings present.

Phase 2 (Release metadata and documentation alignment). Bump patch version in package.json, run sync-versions with --bump-build to update app.json, ios/DNSChat.xcodeproj/project.pbxproj, and android/app/build.gradle, then update CHANGELOG.md and release/store docs (docs/ANDROID_GOOGLE_PLAY_STORE.md, docs/ANDROID_RELEASE.md, docs/App_store/Apple_App_Store/AppStoreConnect.md, docs/App_store/Apple_App_Store/TESTFLIGHT.md). Ensure README.md and docs/INSTALL.md reflect the new version. Success means all references to the release version are consistent and the changelog includes a dated entry for the new patch release.

Phase 3 (Verification and evidence capture). Run bun run lint and bun run test, capture the outputs, and document any skipped suites or environment limitations. Success means a reviewer can reproduce the commands and observe the same pass status.

## Testing Strategy

Run the existing lint and Jest test suites. Lint validates structural rules (ast-grep) and tests validate the TypeScript + service behavior and repo policy checks. No new test cases are required because the changes are metadata and documentation updates, but the test run provides regression assurance.

## Observability

No new runtime logging is introduced. The verification plan itself provides auditability by capturing command outputs and referencing the exact files reviewed.

## Rollout Plan + Rollback Plan

Rollout is a standard patch release: update version metadata, commit documentation and changelog updates, then publish through the existing release workflow. Rollback is a git revert of the commit or a version sync to the prior version/build numbers followed by documentation rollback to the previous changelog entry.

## Risks and Mitigations

Primary risk is drift between version metadata and release documentation. This is mitigated by running sync-versions and scanning all version references during Phase 2. A secondary risk is leaving the ExecPlan incomplete; this is mitigated by updating the Progress and Outcomes & Retrospective sections with timestamps and verification evidence.

## Open Questions

None blocking.

## Progress

- [x] (2026-01-05 01:30Z) Reviewed docs/GUIDELINES-REF/GUIDELINES_INDEX.json and applicable guideline documents for this Expo + React Native repository.
- [x] (2026-01-05 01:30Z) Inspected core source/config files for alignment (entry.tsx, app/_layout.tsx, app.json, babel.config.js, tsconfig.json, dnsService/dnsLogService/storageService).
- [x] (2026-01-05 01:30Z) Validated current best-practice guidance for Expo SDK 54, Expo Router entry/typed routes, and React Native performance logging.
- [x] (2026-01-05 02:31Z) Bumped version metadata to 3.8.7 (build 27) and refreshed release/store documentation.
- [x] (2026-01-05 02:51Z) Bumped version metadata to 3.8.8 (build 28) for the staggered list bundling fix and documentation refresh.
- [x] (2026-01-05 01:30Z) Ran lint/tests and captured verification output in Artifacts.
- [x] (2026-01-05 01:30Z) Updated Outcomes & Retrospective with verification evidence.

## Surprises & Discoveries

- Observation: README and docs/INSTALL.md can drift from the package.json release version when patch releases are cut rapidly. Evidence: prior version badge and install docs references.

## Decision Log

- Decision: Choose Option B (verification + metadata/documentation alignment). Rationale: Delivers a clean, auditable release record without introducing high-risk dependency upgrades. Date/Author: 2026-01-05 / Codex.
- Decision: Bump patch version to 3.8.7 (build 27) to capture the hook import fix and documentation updates. Rationale: Release metadata should reflect the fix and agent navigation doc addition. Date/Author: 2026-01-05 / Codex.
- Decision: Bump patch version to 3.8.8 (build 28) to capture the staggered list bundling fix and release doc refresh. Rationale: The JSX parse error blocks iOS bundling and needs a recorded patch release. Date/Author: 2026-01-05 / Codex.

## Outcomes & Retrospective

All guideline and best-practice checks for this cycle are complete. Version metadata and release/store documentation are synchronized at 3.8.8 (build 28). Lint and Jest test suites pass with one skipped suite, matching prior behavior.

## Context and Orientation

DNSChat converts user prompts into DNS TXT queries and renders responses as chat output. The transport pipeline lives in src/services/dnsService.ts, logging is managed by src/services/dnsLogService.ts, and storage in src/services/storageService.ts. Navigation uses Expo Router, with entry.tsx delegating to expo-router/entry and app/_layout.tsx defining providers and initialization. Configuration and version metadata live in package.json, app.json, ios/DNSChat.xcodeproj/project.pbxproj, and android/app/build.gradle. Version synchronization uses scripts/sync-versions.js.

This verification cycle relies on the guideline set under docs/GUIDELINES-REF, especially PRAGMATIC-RULES, AGENTS, SOFTWARE-ENGINEERING-GUIDELINES, DEV-GUIDELINES, SECURITY-GUIDELINES, LOG-GUIDELINES, AUDIT-GUIDELINES, MOBILE-GUIDELINES, EXPO-GUIDELINES, REACT-GUIDELINES, REACT_USE_EFEECT-GUIDELINES, TYPESCRIPT-GUIDELINES, DESIGN-UI-UX-GUIDELINES, and BUN-GUIDELINES. Backend, web, and infra-specific guidelines are reviewed for applicability and are not required unless the project scope expands.

## Concrete Steps

Run from repo root:

    bun run sync-versions --bump-build
    bun run lint
    bun run test

If Android environment verification is required:

    bun run verify:android

## Validation and Acceptance

Acceptance requires all of the following: the guideline applicability review is documented; best-practice checks are verified in code; version metadata is synchronized across package.json, app.json, iOS, and Android; changelog and release/store docs reflect the new version; and lint/tests pass with results captured in Artifacts.

## Idempotence and Recovery

Re-running sync-versions with --bump-build is safe and only increments build numbers. All documentation edits are reversible with git. If any verification step fails, record the failure in Artifacts, revert the metadata changes, and re-run the commands after fixing the underlying issue.

## Artifacts and Notes

Verification outputs (2026-01-05):

    bun run lint
    Result: PASS (ast-grep scan completed with exit code 0)

    bun run test
    Result: PASS (65 suites, 1 skipped, 718 tests)

## Interfaces and Dependencies

No new dependencies. The only touched interfaces are release metadata and documentation files plus the ExecPlan itself.

Revision note (2026-01-05): Added the 3.8.8 patch release metadata update to record the staggered list bundling fix and documentation refresh.
