# DNSChat Engineering ExecPlan: Guidelines Verification + Data Deletion + Docs Alignment (2026-01-04)

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.

PLANS.md is not present in this repository. This document is therefore the sole execution plan for this work and must remain self-contained.

## Purpose / Big Picture

Ensure DNSChat is verified against all GUIDELINES-REF documents, aligns with current mobile best practices, and provides a clear user-facing path to delete locally stored data. The work also refreshes release/store documentation so a reviewer can trust that docs reflect the current app and toolchain.

## Goal and Non-Goals

The goal is to confirm guideline compliance, verify source code and CI workflows, implement a clear data deletion action in Settings, and update release/store docs to reflect current versions, commands, and assets. Success means a reviewer can run the documented commands, see the code changes, and validate that app data can be deleted from Settings.

Non-goals include shipping to app stores, producing new marketing assets, or making large UI/UX redesigns beyond the Settings actions necessary for data deletion and documentation accuracy.

## Progress

- [x] (2026-01-04 19:20Z) Reviewed GUIDELINES-REF index and core guidance (PRAGMATIC, SECURITY, DEV, SOFTWARE-ENGINEERING, LOG, AUDIT, REACT, TYPESCRIPT, MOBILE, EXPO, IOS, BUN, DESIGN-UI-UX).
- [x] (2026-01-04 19:20Z) Reviewed GitHub workflows (ci.yml, codeql.yml, gitleaks.yml) and verified no lockfile cache assumptions remain.
- [x] (2026-01-04 19:20Z) Verified source-level configuration for React Compiler and production console stripping in babel.config.js.
- [x] (2026-01-04 19:45Z) Implemented Settings “Clear Data” action that clears chats and DNS logs, with confirmation and error handling.
- [x] (2026-01-04 19:45Z) Updated release/store docs to match current version, package identifiers, assets, and Bun-first commands.
- [x] (2026-01-04 19:46Z) Added privacy policy document and linked it from store docs.
- [x] (2026-01-04 19:46Z) Updated CHANGELOG + docs index to reflect this ExecPlan and changes.
- [x] (2026-01-04 19:47Z) Ran verification commands and captured results.
- [x] (2026-01-04 19:47Z) Finalized Outcomes & Retrospective with evidence and follow-ups.

## Surprises & Discoveries

- Observation: The Glass Settings “Clear Cache” action is currently a placeholder and does not clear data. Evidence: src/navigation/screens/GlassSettings.tsx handleClearCache contains only a comment and success alert.
- Observation: Play Store and App Store documentation reference outdated versions, package identifiers, and asset locations. Evidence: docs/ANDROID_GOOGLE_PLAY_STORE.md and docs/App_store/Apple_App_Store/AppStoreConnect.md.
- Observation: App documentation still references npm commands despite Bun being the default toolchain. Evidence: docs/technical/SPECIFICATION.md and docs/troubleshooting/COMMON-ISSUES.md.
- Observation: Settings tests that render the classic Settings screen required ChatContext mocking once Clear Data used ChatContext. Evidence: settings.haptics-toggle.spec.tsx and settings.language-toggle.spec.tsx updated to mock useChat.

## Decision Log

- Decision: Implement a single “Clear Data” action that removes chats and DNS logs from local storage and refreshes in-memory state. Rationale: aligns with data deletion requirements and avoids introducing new settings persistence paths. Date/Author: 2026-01-04 / Codex.
- Decision: Refresh store and release docs to match current app identifiers and Bun-first commands. Rationale: aligns docs with repo tooling and avoids misleading submission guidance. Date/Author: 2026-01-04 / Codex.

## Outcomes & Retrospective

Settings now provides a clear local data deletion action that removes chat history and DNS logs and refreshes chat state. Store and release documentation is updated to align with current identifiers, assets, and Bun commands. A privacy policy is now tracked in-repo and linked from store docs. Lint and tests pass with the updated Settings mocks and translations.

## Current State

DNSChat is an Expo SDK 54 React Native app that sends short prompts via DNS TXT queries and stores chats and DNS logs locally. React Compiler is enabled in app.json and configured in babel.config.js. Production console stripping is already configured with transform-remove-console excluding warn/error. GitHub Actions uses Bun for installs in the root and npm ci for the dns-native module, with pinned actions and concurrency limits.

## Context and Orientation

Key files and modules:

- babel.config.js: React Compiler + production console stripping.
- app.json: experiments.reactCompiler and platform identifiers.
- src/navigation/screens/GlassSettings.tsx and src/navigation/screens/Settings.tsx: user settings screens.
- src/services/storageService.ts: chat persistence, includes clearAllChats().
- src/services/dnsLogService.ts: DNS logs persistence, includes clearLogs().
- src/context/ChatContext.tsx: loadChats() for refreshing in-memory chat state.
- docs/ANDROID_GOOGLE_PLAY_STORE.md, docs/ANDROID_RELEASE.md, docs/App_store/Apple_App_Store/AppStoreConnect.md, docs/App_store/Apple_App_Store/TESTFLIGHT.md: release/store documentation.
- docs/technical/SPECIFICATION.md and docs/troubleshooting/COMMON-ISSUES.md: operational guidance.

## Proposed Approach

Option A: Documentation-only update (no code changes). This is lowest risk but leaves the data deletion action unimplemented.

Option B: Minimal remediation (implement Clear Data, update docs, add privacy policy, update changelog). This closes compliance gaps without large refactors. This option is selected.

Option C: Full store readiness (new marketing assets, App Store metadata refresh, release automation). This is high effort and depends on external accounts; not selected.

## Architecture / Data Flow Changes

Add a Settings action that calls StorageService.clearAllChats() and DNSLogService.clearLogs() and then refreshes chat state via ChatContext.loadChats(). This is local-only and does not change the DNS query pipeline or remote network behavior.

## Phased Plan with Milestones

Phase 0: Discovery and constraints. Confirm guidelines applicability, review workflows and settings screens, and document required changes in this ExecPlan. Acceptance: Progress reflects completed discovery; constraints and non-goals are explicit.

Phase 1: Implementation. Add a “Clear Data” action to settings screens, wire up storage/log clearing, add translations, and update docs (release/store guidance, troubleshooting, specification) to reflect Bun and current versions. Acceptance: user can trigger data deletion from Settings, docs match current identifiers and commands, and privacy policy exists.

Phase 2: Verification and closeout. Run lint/tests, capture results in Artifacts, update CHANGELOG and docs/README, and complete Outcomes & Retrospective. Acceptance: verification commands pass or are explicitly documented with results and warnings.

## Testing Strategy

Run the existing lint and test suites (`bun run lint`, `bun run test`). If UI changes are made in Settings, rely on existing Jest tests that import Settings.tsx; add new tests only if failures reveal gaps.

## Observability

No new telemetry pipelines are introduced. Use existing devWarn logging for any Clear Data failures. Settings actions remain local and do not emit network traffic.

## Rollout Plan + Rollback Plan

Rollout is a standard code change with documentation updates. If regressions occur, revert the commit and re-run `bun run sync-versions:dry` if version metadata changes are introduced. No data migrations are required.

## Risks and Mitigations

- Risk: Clearing logs may surprise users who expect audit history. Mitigation: explicit confirmation dialog and clear copy.
- Risk: Documentation edits could drift from actual store requirements. Mitigation: tie docs to actual repo assets and mark external steps as manual.
- Risk: Local data deletion could leave UI in a stale state. Mitigation: call ChatContext.loadChats() after clearing.

## Open Questions

None. External store submissions and asset creation remain out of scope.

## Plan of Work

Implement a “Clear Data” action in Settings screens that clears chat storage and DNS logs, then refreshes chat state. Update translations to match the new action and confirmation messages. Refresh store/release docs to match current package identifiers, versioning, assets, and Bun-first commands. Add a privacy policy document describing local storage and DNS query behavior. Update CHANGELOG and docs/README, run verification commands, and record outputs here.

## Concrete Steps

Run from repo root:

    bun run lint
    bun run test

## Validation and Acceptance

- Settings includes a clear data action that removes local chats and DNS logs and refreshes the chat list.
- Documentation for Play Store, App Store, and release workflow reflects current identifiers and Bun commands.
- Privacy policy exists and is linked from store docs.
- Lint and tests pass or are documented with precise results.

## Idempotence and Recovery

The Clear Data action is idempotent and safe to run multiple times; it clears storage keys and reloads state. Documentation updates are reversible via git. No migrations are introduced.

## Artifacts and Notes

Verification results (2026-01-04):

    bun run lint
    Result: PASS (ast-grep scan completed with exit code 0)

    bun run test
    Result: PASS (64 suites passed, 1 skipped; 702 tests passed, 13 skipped)

## Interfaces and Dependencies

- StorageService.clearAllChats(): used to remove stored chat payloads.
- DNSLogService.clearLogs(): used to remove stored DNS logs.
- ChatContext.loadChats(): used to refresh in-memory state after clearing.
- Settings screens: src/navigation/screens/GlassSettings.tsx, src/navigation/screens/Settings.tsx.

## Change Notes

- (2026-01-04) Initial ExecPlan created to satisfy guidelines re-verification, data deletion, and documentation alignment requirements.
- (2026-01-04) Updated Progress, Outcomes, and Artifacts after implementing Clear Data action, docs refresh, privacy policy, and running lint/tests.
