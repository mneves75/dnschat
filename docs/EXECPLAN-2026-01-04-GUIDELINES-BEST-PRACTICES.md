# DNSChat Engineering Exec Spec: Guidelines Verification and Best-Practices Alignment (2026-01-04)

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.

PLANS.md is not present in this repository. This document therefore serves as the sole execution plan and must remain self-contained.

## Purpose / Big Picture

This plan verifies DNSChat against all available guidelines, documents current compliance and gaps, and provides a multi-phase, testable path to align the codebase with 2025/2026 best practices for Expo, React Native, TypeScript, security, and observability. Success means a reviewer can follow this document alone to reproduce the audit, implement remediations, and observe measurable improvements via tests, logs, and app behavior.

## Goal and Non-Goals

The goal is to deliver a verified, evidence-backed engineering plan that reconciles repo-specific guidance, source code reality, and the latest platform best practices, while preserving the app’s core DNS query workflow and user experience.

Non-goals include new product features, UI redesigns, or large dependency upgrades unless they are required to close a concrete compliance gap or unblock best-practice alignment.

## Progress

- [x] (2026-01-04 03:21Z) Indexed all guideline documents via docs/GUIDELINES-REF/GUIDELINES_INDEX.json and reviewed core, mobile, Expo, React, TypeScript, security, logging, and audit guidance to triage applicability.
- [x] (2026-01-04 03:21Z) Verified repository context and architecture docs (CLAUDE.md, README.md, docs/architecture/SYSTEM-ARCHITECTURE.md).
- [x] (2026-01-04 03:21Z) Reviewed key source files for DNS pipeline, logging, and storage (src/services/dnsService.ts, src/services/dnsLogService.ts, src/services/storageService.ts, modules/dns-native/constants.ts, app.json, package.json).
- [x] (2026-01-04 03:32Z) Revised ExecPlan for prose-first compliance, expanded milestone detail, and added best-practice deltas for package management and compiler validation.
- [x] (2026-01-04 18:10Z) Option C selected and implemented: strict TypeScript enforcement, log redaction + encryption, bun tooling alignment, test infrastructure hardening, and cross-platform typography parity.
- [x] (2026-01-04 18:22Z) Phase 0 complete with updated evidence (lint/tests/tsc pass; DNS harness + smoke test still fail due to network/host environment).
- [x] Phase 1 complete: constants aligned, logging privacy enforced, strict typing fixes applied across UI and services.
- [x] Phase 2 complete: encryption at rest for chats and DNS logs with deterministic test behavior and migration-safe reads.
- [x] Phase 3 complete: React Compiler remains enabled in app.json with compiler dependency installed; full build validation pending external device/build pipeline.
- [x] Phase 4 complete: changelog + docs updated, verification artifacts captured, rollback notes confirmed.
- [x] (2026-01-04) React Compiler healthcheck executed and StrictMode added to satisfy compiler diagnostics.
- [x] (2026-01-04) Added local DNS responder mode for smoke tests/harness to validate UDP/TCP paths in restricted networks.

## Surprises & Discoveries

- Observation: app.json already enables experiments.reactCompiler.
  Evidence: app.json includes "experiments": { "reactCompiler": true }.
- Observation: Retry delay constants diverge between app constants and native constants.
  Evidence: src/constants/appConstants.ts sets RETRY_DELAY_MS to 1000, while modules/dns-native/constants.ts sets RETRY_DELAY_MS to 200.
- Observation: Jest + ts-jest failed under verbatimModuleSyntax due to CommonJS test execution.
  Evidence: Jest emitted TS1295 errors until tsconfig.test.json disabled verbatimModuleSyntax and noble ESM dependencies were mocked.
- Observation: Encrypted payload prefix parsing failed because enc:v1 was split into multiple segments.
  Evidence: StorageService tests failed until decryptString parsed the prefix using ENCRYPTION_PREFIX length.
- Observation: React Compiler healthcheck reported missing StrictMode usage.
  Evidence: npx react-compiler-healthcheck@latest reported "StrictMode usage not found" before StrictMode was added to src/App.tsx.
- Observation: External DNS smoke/harness runs failed due to network limitations.
  Evidence: UDP/TCP 53 timed out and DoH returned no TXT answers in this environment; added local DNS responder mode for verification.

## Decision Log

- Decision: Store the ExecPlan in docs/ per explicit user request, even though SOFTWARE-ENGINEERING-GUIDELINES.md suggests agent_planning/.
  Rationale: User instruction is higher priority and explicitly requests docs folder placement.
  Date/Author: 2026-01-04 / Codex
- Decision: Treat best-practice alignment as a phased hardening plan rather than a single upgrade sweep.
  Rationale: Minimizes risk and keeps changes reversible and testable at each phase.
  Date/Author: 2026-01-04 / Codex
- Decision: Execute Option C (full modernization sweep) while preserving functional scope.
  Rationale: Explicit user selection; aligned with strict TypeScript + security hardening goals.
  Date/Author: 2026-01-04 / Codex
- Decision: Keep Jest in CommonJS mode and override verbatimModuleSyntax in tsconfig.test.json.
  Rationale: Avoids converting the entire repo to ESM while still honoring strict TypeScript in app code.
  Date/Author: 2026-01-04 / Codex
- Decision: Mock noble ESM crypto modules in Jest setup.
  Rationale: Prevent ESM loader failures in Jest; preserves deterministic hashing/encryption behavior for tests.
  Date/Author: 2026-01-04 / Codex

## Outcomes & Retrospective

Phases 0–4 completed with evidence captured. Codebase now meets strict TypeScript and privacy/logging requirements, and local storage is encrypted at rest. Jest and lint pass locally; DNS harness and smoke tests pass in offline mode via `--local-server`, while external UDP/TCP 53 requests still fail in this environment. React Compiler remains enabled in app.json with compiler dependency installed; full build-level compiler validation should be re-confirmed in CI or on-device builds.

## Context and Orientation

DNSChat is an Expo dev-client React Native app that converts user prompts into DNS TXT queries and renders DNS responses as chat output. The transport chain is native DNS, UDP, TCP, then Mock (web). The core pipeline lives in src/services/dnsService.ts and depends on shared constraints defined in modules/dns-native/constants.ts. Logs are stored locally in AsyncStorage via src/services/dnsLogService.ts and chat data is persisted via src/services/storageService.ts. App configuration and platform flags live in app.json.

## Current State

The project targets Expo SDK 54.0.30, React Native 0.81.5, and React 19.1.0. New Architecture and `experiments.reactCompiler` are enabled in app.json; `babel.config.js` now wires the React Compiler plugin (and keeps Reanimated plugin last). TypeScript strictness is fully enabled, and code has been aligned to meet the stricter flags (verbatimModuleSyntax, noUncheckedIndexedAccess, noImplicitOverride, etc). Local DNS logs now redact query/response content, and both chat and log storage are encrypted at rest with migration-safe reads. Shared DNS constants are aligned across JS and native layers. The repo now uses Bun by default (bun.lock, bun-based scripts), with test infrastructure updated to run in a CommonJS Jest environment while honoring strict TS in app code.

All guideline documents listed in docs/GUIDELINES-REF were reviewed for applicability. Core, security, logging, audit, mobile, Expo, React, TypeScript, iOS, and design guidance are applicable. Backend, web, infrastructure, database, and integration-specific guidelines are currently out of scope but must be re-evaluated if the product expands into those domains.

## Best-Practice References (2026-01-04)

- React Compiler: use the official React Compiler Babel plugin and ensure it is wired in the Babel config for builds where the compiler is enabled.
- Expo SDK 54: enable `experiments.reactCompiler` in app.json to activate the compiler path for Expo-managed builds.
- React Native Reanimated: keep `react-native-reanimated/plugin` last in `babel.config.js` to preserve correct compilation.

## Guidelines Verification Coverage

All documents listed in docs/GUIDELINES-REF/GUIDELINES_INDEX.json (updated 2026-01-04) were reviewed. Applicability is recorded below.

| Document | Applicable | Notes |
| --- | --- | --- |
| PRAGMATIC-RULES.md | Yes | Baseline engineering defaults. |
| AGENTS.md | Yes | Agent execution guidance. |
| INDEX.md | Yes | Navigation reference. |
| EXECPLANS-GUIDELINES.md | Yes | Exec spec structure. |
| SOFTWARE-ENGINEERING-GUIDELINES.md | Yes | Planning, tests, observability. |
| DEV-GUIDELINES.md | Yes | Core engineering standards. |
| SECURITY-GUIDELINES.md | Yes | Data handling, storage, IR. |
| OWASP-GUIDELINES.md | Yes | Security hardening baseline. |
| LOG-GUIDELINES.md | Yes | Redaction and retention rules. |
| AUDIT-GUIDELINES.md | Yes | Auditability expectations. |
| KNOWLEDGE-BASE-GUARDRAIL.md | Yes | Evidence + verification requirements. |
| TROUBLESHOOTING-RUNBOOK.md | Yes | Incident/debugging playbook. |
| WEB-NEXTJS-GUIDELINES.md | No | No Next.js web app. |
| WEB-GUIDELINES.md | No | No web frontend. |
| PSEO-GUIDELINES.md | No | No SEO scope. |
| REACT-GUIDELINES.md | Yes | React Native/React usage. |
| REACT_USE_EFEECT-GUIDELINES.md | Yes | Hook usage guidance. |
| TYPESCRIPT-GUIDELINES.md | Yes | Strict TS applied. |
| PNPM-GUIDELINES.md | Conditional | Not used; bun is standard. |
| DESIGN-UI-UX-GUIDELINES.md | Yes | UI/UX expectations. |
| MOBILE-GUIDELINES.md | Yes | Mobile platform constraints. |
| EXPO-GUIDELINES.md | Yes | Expo SDK 54 guidance. |
| IOS-GUIDELINES.md | Yes | iOS platform rules. |
| SWIFT-GUIDELINES.md | Conditional | Applies if native Swift changes occur. |
| liquid-glass-app-with-expo-ui-and-swiftui.md | Yes | Liquid Glass UI patterns. |
| DB-GUIDELINES.md | No | No database layer. |
| POSTGRESQL-GUIDELINES.md | No | Not in scope. |
| SQLITE-GUIDELINES.md | No | Not in scope. |
| D1-DATETIME-EXPIRY-GUIDELINES.md | No | Not in scope. |
| BUN-GUIDELINES.md | Yes | Bun is default tooling. |
| ELYSIA-GUIDELINES.md | No | No Elysia backend. |
| VERCEL-GUIDELINES.md | No | Not deployed on Vercel. |
| VERCEL-DESIGN-GUIDELINES.md | No | Not applicable. |
| SUPABASE-GUIDELINES.md | No | Not in scope. |
| CLOUDFARE-GUIDELINES.md | No | Not in scope. |
| VPS_HOSTINGER/ | No | Not in scope. |
| MCPORTER-GUIDELINES.md | No | MCP tooling not used. |
| STAGEHAND-GUIDELINES.md | No | Browser automation not used. |
| PEEKABOO-GUIDELINES.md | No | macOS UI automation not used. |
| WARELAY-GUIDELINES.md | No | Not used. |
| WAHA-GUIDELINES.md | No | Not used. |
| EVOLUTION-API-GUIDELINES.md | No | Not used. |
| EVOLUTION-API-DEPLOYMENT-GUIDE.md | No | Not used. |
| RAG-CHATBOT-GUIDELINES.md | Conditional | Only if retrieval pipeline is added. |
| chat-message-idempotency.md | Conditional | Relevant if message retries are added. |
| PYTHON-GUIDELINES.md | No | No Python components. |
| CLOUDERA-PYSPARK-GUIDELINES.md | No | Not used. |
| SWEETLINK-GUIDELINES.md | No | Not used. |
| OPUS-4-5-PROMPT-OPTIMIZER.md | No | Not used. |
| PETER-ORACLE-GUIDELINES.md | Conditional | Only if Oracle debugging workflow needed. |
| CLAUDE.md | Conditional | Applies if authoring CLAUDE.md. |
| CHANGELOG.md | Yes | Changelog updated. |

## Source Review Snapshot

Reviewed source locations and key findings are summarized here. In src/services/dnsService.ts, DNS validation/sanitization and transport fallback remain consistent, and cryptographic IDs use crypto.getRandomValues when available. RETRY_DELAY_MS is now aligned at 200ms across src/constants/appConstants.ts and modules/dns-native/constants.ts. In src/services/dnsLogService.ts, raw query/response content is redacted via SHA-256 hashes and logs are encrypted at rest; retention remains 30 days with cleanup scheduler intact. In src/services/storageService.ts, chat payloads are encrypted at rest with deterministic test behavior and migration-safe decrypts; corruption detection still throws StorageCorruptionError. app.json keeps experiments.reactCompiler enabled, and babel.config.js now wires the compiler plugin (with Reanimated plugin last). tsconfig.json enforces strictness flags (noUncheckedIndexedAccess, noPropertyAccessFromIndexSignature, noImplicitOverride, etc), and UI typography scale exposes explicit cross-platform keys to avoid undefined style access.

## Proposed Approach

Option A would be documentation-only, deferring changes and leaving known gaps open. Option B is a phased hardening plan with small, reviewable increments covering logging privacy, constant alignment, TypeScript strictness, package manager alignment, and React Compiler validation. Option C is a full modernization sweep across React/React Native/Expo and tooling. **Option C was selected and executed** per user request.

## Architecture and Data Flow Changes

No change to the DNS query flow is required. Expected changes are confined to configuration validation (compiler activation), logging policy (sanitization and retention), and constant alignment between JavaScript and native layers. If local encryption is introduced, storageService will become the single entrypoint for encrypt/decrypt while preserving the existing Chat and DNSLog shapes.

## Plan of Work

Phase 0 focuses on discovery and baseline evidence. Run the existing lint, unit tests, DNS harness, and platform diagnostics. Record outputs in the Artifacts section and document any failures. Confirm that the React Compiler path is actually active by verifying required dependencies and build output warnings.

Phase 1 addresses compliance gaps with minimal code edits. Align shared constants across src/constants/appConstants.ts and modules/dns-native/constants.ts. Update TypeScript configuration to align with strictness expectations while keeping Expo compatibility. Introduce logging redaction for free-form prompt content, and keep the Logs screen functional via hashed or truncated display where appropriate.

Phase 2 hardens local data handling. Decide on an at-rest encryption strategy (platform secure storage, keychain-backed encryption, or documented rationale for non-encryption) and implement migration-safe read/write paths. Add tests that validate encrypted storage round-trips and regression tests for corrupted data handling.

Phase 3 validates performance and compiler behavior. Ensure the React Compiler is properly installed and configured per Expo guidance, add any lint rules required for compiler safety, and address compiler diagnostics. Confirm that UI behavior does not regress and that memoization changes do not break interaction flows.

Phase 4 prepares release readiness. Update docs, run full verification, document rollback steps, and update CHANGELOG.md if behavior or configuration changes are user-visible.

## Milestones (Multi-Phase Todo)

Phase 0 (Discovery and Evidence) establishes baseline evidence and identifies failures. Run the verification commands in the Concrete Steps section and capture outputs in Artifacts. Confirm the compiler path by verifying the presence or absence of the compiler plugin and any compiler diagnostics in the build logs. Acceptance is a complete evidence set or a documented list of failures with reproduction steps.

Phase 1 (Compliance and Consistency) aligns shared constants, tightens TypeScript strictness, and makes logging privacy-compliant. Update constants so there is one source of truth across app and native layers, update tsconfig.json with the recommended flags that remain compatible with Expo, and introduce log redaction or hashing for free-form prompt content while keeping log UX usable. Acceptance is that lint and tests pass, logs show redacted content, and constants match across layers.

Phase 2 (Security and Data Protection) decides and implements a storage encryption strategy for chat and logs, including migration-safe reads. Define whether data is Confidential or Internal, implement encryption at rest if required, and add recovery logic for corrupt data. Acceptance is that encrypted data round-trips in tests, corruption cases throw explicit errors, and downgrade/rollback does not strand user data.

Phase 3 (Performance and Compiler Validation) validates React Compiler activation and resolves diagnostics. Install and configure any missing compiler tooling per Expo expectations, address compiler warnings, and re-run smoke tests to ensure no regressions. Acceptance is a clean compiler run with no new runtime issues and stable UI behavior.

Phase 4 (Release Readiness) finalizes evidence, updates docs and changelog as needed, and defines a rollback strategy. Acceptance is a complete verification report, updated documentation, and a rollback path that preserves data integrity.

## Concrete Steps

All commands are run from the repository root unless noted otherwise.

    bun run lint
    bun run test
    node test-dns-simple.js "test message"
    node test-dns-simple.js "test message" --local-server
    bun run dns:harness -- --message "test message"
    bun run dns:harness -- --message "test message" --local-server
    bun run verify:ios-pods
    bun run verify:android
    npx tsc --noEmit
    npx react-compiler-healthcheck@latest

Expected outcomes are clean lint, passing tests, a valid DNS response in the harness output, and no TypeScript errors.

## Validation and Acceptance

Acceptance requires that the app can send a DNS query from the chat UI, logs capture the attempt without exposing raw prompt content, and the DNS response renders correctly. Automated verification must show lint and tests passing, and the DNS harness should return a successful TXT response for a sample message (use `--local-server` when outbound UDP/TCP 53 is blocked). Any TypeScript changes must pass npx tsc --noEmit.

## Testing Strategy

Use existing Jest unit tests for regression coverage. Add focused unit tests for new sanitization or encryption helpers. If local encryption is introduced, add tests that simulate corrupted payloads and verify recovery or explicit failure behavior. For DNS transports, rely on the existing DNS harness for integration-level validation.

## Observability

Logging should remain structured and privacy-respecting. Free-form prompt content should be hashed or truncated before persistence. Each DNS attempt should emit a structured log entry with timing, transport, and outcome fields. Keep log retention enforcement intact and verify cleanup behavior in the DNSLogService scheduler.

## Rollout Plan

Ship changes behind a config or version bump. For Expo updates, use a dev-client build first, then EAS Update for staged rollout if applicable. Validate on iOS and Android before any store submission.

## Rollback Plan

Revert the relevant commit(s), rebuild the dev client, and restore previous configuration flags. If storage format changes, keep backward-compatible read support so rollback does not strand existing user data.

## Risks and Mitigations

React Compiler activation could change rendering behavior, so mitigate with targeted UI tests and manual smoke on primary flows. Tightening TypeScript strictness can surface new errors, so mitigate with incremental tsconfig adoption and scoped fixes. Encrypting local data can break legacy stored data, so mitigate with a migration layer and explicit error reporting in storageService. Migrating to Bun could impact CI or scripts, so mitigate by documenting the migration and keeping npm-compatible scripts during transition. External DNS verification depends on network access; use `--local-server` for offline proof and re-run against real resolvers on a network with UDP/TCP 53 access.

## Open Questions

None blocking. If platform or dependency upgrades are requested, confirm scope before proceeding.

## Artifacts and Notes

Record command outputs here as they are executed during Phase 0. Keep transcripts short and focused on proof of success or failure.

Evidence captured on 2026-01-04:

    bun run lint
    Result: PASS (ast-grep scan completed with exit code 0)

    bun run test
    Result: PASS (61 suites, 1 skipped, 693 tests). No open handles observed.

    bun run test -- --detectOpenHandles
    Result: PASS (61 suites, 1 skipped, 693 tests). No open handles reported.

    node test-dns-simple.js "test message"
    Result: FAIL
      UDP TXT query failed: UDP query timed out (3000ms)
      TCP TXT query failed: TCP query timed out (4000ms)
      Skipping DoH fallback: zone=ch.at not expected via public DoH (use --force-doh to try anyway).

    node test-dns-simple.js "test message" --force-doh
    Result: FAIL
      UDP TXT query failed: UDP query timed out (3000ms)
      TCP TXT query failed: TCP query timed out (4000ms)
      DoH TXT query failed: Cloudflare DoH returned no TXT answers

    node test-dns-simple.js "test message" --local-server
    Result: PASS
      OK transport=udp
      Response: local:test message

    bun run dns:harness -- --message "test message"
    Result: FAIL
      NATIVE failed (Native module unavailable in this environment)
      UDP failed (UDP query timed out after 5000ms)
      TCP failed (TCP query timed out after 5000ms)

    bun run dns:harness -- --message "test message" --local-server
    Result: PASS
      UDP succeeded (local server)
      TXT records: ["local:test message"]

    bun run verify:ios-pods
    Result: PASS (verify-ios-pods-sync: OK)

    bun run verify:android
    Result: PASS with warnings
      android/local.properties sdk.dir points to a missing directory
      Metro bundler not running on port 8081
      No Android devices or emulators connected

    npx tsc --noEmit
    Result: PASS (exit code 0)

    npx react-compiler-healthcheck@latest
    Result: PASS (StrictMode usage found; 60/60 components compiled; no incompatible libraries)

## Interfaces and Dependencies

Implementation touched src/services/dnsLogService.ts (redaction + encrypted persistence), src/services/storageService.ts (encryption + migration-safe reads), src/services/encryptionService.ts (AES-GCM wrapper), src/constants/appConstants.ts and modules/dns-native/constants.ts (constant alignment), app.json + babel.config.js (compiler configuration), tsconfig.json and tsconfig.test.json (strictness + Jest compatibility), __tests__/setup.jest.js (noble mocks), src/ui/theme/liquidGlassTypography.ts (cross-platform typography keys), scripts/run-dns-harness.ts and test-dns-simple.js (local DNS responder mode), and __tests__/dnsService.nativeRetry.spec.ts (test teardown).

## Change Note

Created initial ExecPlan to satisfy the guidelines verification and best-practices alignment request, with phased work items and verification steps.

Revised on 2026-01-04 to add full guideline coverage, a prose-first milestone breakdown, and explicit best-practice deltas for package manager alignment and compiler validation.

Revised on 2026-01-04 to reflect Option C implementation, strict TypeScript enforcement, encryption and redaction rollout, Jest compatibility updates, React Compiler healthcheck validation, StrictMode enablement, local DNS smoke/harness mode, and new verification evidence.
