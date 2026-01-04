# DNSChat Engineering ExecPlan: Guidelines Re-Verification + CI/Best-Practice Alignment (2026-01-04)

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.

PLANS.md is not present in this repository. This document is therefore the sole execution plan for this work and must remain self-contained.

## Purpose / Big Picture

Re-verify DNSChat against all documents listed in docs/GUIDELINES-REF/GUIDELINES_INDEX.json, confirm alignment with the latest React Native performance guidance, and deliver any remediation needed to keep CI and core app behavior production-ready. Success means a reviewer can follow this plan alone to understand what was verified, what was fixed, and how to prove it works.

## Progress

- [x] (2026-01-04 16:27Z) Reviewed GUIDELINES-REF index, core/mobile/Expo/React/TypeScript/security/logging/audit guidance, and validated React Native performance guidance for production console stripping.
- [x] (2026-01-04 16:42Z) Captured full applicability log for all GUIDELINES-REF documents and attached to this plan.
- [x] (2026-01-04 16:43Z) Reconciled legacy exec plans (v3.3.0 Android Hardening, v3.4.0 Security Hardening) to reflect completed work.
- [x] (2026-01-04 16:46Z) Implemented remediation items from code/workflow review (accessibility config equality) and documented error logging decision.
- [x] (2026-01-04 16:49Z) Bumped version, synced versions, and updated CHANGELOG + docs index for this plan.
- [x] (2026-01-04 16:52Z) Ran verification commands and attached evidence.
- [x] (2026-01-04 16:55Z) Summarized outcomes and closed the plan.

## Surprises & Discoveries

- Observation: React Native performance guidance recommends stripping console logging in production to reduce overhead; the current Babel config already strips console.* in production while preserving warn/error. Evidence: reactnative.dev performance guidance (see Artifacts).
- Observation: Legacy CI run 20687873837 failed due to npm cache expecting a root lockfile; current workflow no longer uses npm cache or npm installs in root, so the failure is historical. Evidence: ci.yml now uses bun installs and no setup-node cache config.
- Observation: SettingsContext still compares accessibility configs via JSON.stringify, which is stable but unnecessary for a fixed-shape object and can be replaced with explicit field comparison for clarity and efficiency.
- Observation: Android verification still warns about local.properties sdk.dir and missing Metro/ADB devices; these are local environment warnings, not CI failures.

## Decision Log

- Decision: Create a new ExecPlan in docs/ for this re-verification pass instead of rewriting the older guideline-alignment plan. Rationale: keep historical plan intact while producing a spec that follows current ExecPlan formatting requirements. Date/Author: 2026-01-04 / Codex.
- Decision: Bump patch version after remediation and docs updates. Rationale: user explicitly requested a version bump and the change set includes behavior and CI/documentation updates that should be traceable by version. Date/Author: 2026-01-04 / Codex.
- Decision: Keep ErrorBoundary logging on console.error and rely on production console stripping for log spam control. Rationale: preserve crash visibility in production while still removing console.log noise per RN performance guidance. Date/Author: 2026-01-04 / Codex.

## Outcomes & Retrospective

Accessibility settings now avoid redundant persistence using explicit field equality, with test coverage added. Legacy exec plans were reconciled to show completion status, and a new ExecPlan captures guideline re-verification evidence. Version metadata was bumped to 3.8.4 (build 24) and documentation updated accordingly. Lint and test suites pass; Android verification reports local warnings (SDK path in local.properties, Metro and devices not running).

## Context and Orientation

DNSChat is an Expo dev-client React Native app (SDK 54) that sends DNS TXT queries via native/UDP/TCP fallbacks. The core DNS pipeline lives in src/services/dnsService.ts. Settings persistence and migrations live in src/context/SettingsContext.tsx and src/context/settingsStorage.ts. Error handling UI is in src/components/ErrorBoundary.tsx. CI workflows are in .github/workflows/ci.yml, codeql.yml, and gitleaks.yml. Version sync is handled by scripts/sync-versions.js and uses package.json as the source of truth.

Guidelines coverage follows docs/GUIDELINES-REF/GUIDELINES_INDEX.json. Core, mobile, Expo, React, TypeScript, security, logging, and audit guidance are applicable. Web/backend/integration-specific documents are reviewed for applicability and marked not applicable unless the scope expands.

## Plan of Work

Phase 0: Audit and evidence. Confirm all guideline documents listed in GUIDELINES_INDEX.json are reviewed for applicability, capture the applicability log in this plan, and verify external best-practice references (React Native performance guidance). Review CI workflows and key app files to identify any remaining gaps or regressions.

Phase 1: Remediation. Implement any code or workflow fixes found in the audit. For this pass, focus on SettingsContext accessibility config equality and error logging decisions, and ensure CI has no dependency on missing root lockfiles. Update legacy exec plans to mark completed work and add current verification evidence.

Phase 2: Release readiness. Bump the patch version, sync versions across app.json and native configs, update CHANGELOG and docs/README to include this plan, and run lint/tests/verification commands. Record results in Artifacts and update Outcomes & Retrospective.

## Concrete Steps

Run these commands from the repo root:

    bun run lint
    bun run test
    bun run sync-versions:dry
    bun run verify:android

If version bump is applied:

    bun run sync-versions

If any workflows are changed, re-run CI on push to confirm green status.

## Validation and Acceptance

Acceptance requires:

1. SettingsContext no longer uses JSON.stringify for equality checks; accessibility updates skip redundant writes based on explicit field comparison.
2. Any decision on error logging is consistent with production console stripping guidance and documented in this plan.
3. CI workflows no longer assume a root npm lockfile, and the historical lockfile error is not reproducible on current workflow definitions.
4. Version numbers are synchronized across package.json, app.json, iOS project, and Android build.gradle after bump.
5. Lint and tests pass, and verification output is captured in Artifacts.

## Idempotence and Recovery

All changes are additive or replace internal comparisons without schema migrations. If any regression appears, revert the commit and rerun bun run sync-versions to restore the prior version/build numbers. Workflow changes are reversible by restoring .github/workflows/ci.yml from git history.

## Artifacts and Notes

Guidelines applicability log (2026-01-04):

Applicable: PRAGMATIC-RULES.md, AGENTS.md, INDEX.md, EXECPLANS-GUIDELINES.md, SOFTWARE-ENGINEERING-GUIDELINES.md, DEV-GUIDELINES.md, SECURITY-GUIDELINES.md, OWASP-GUIDELINES.md, LOG-GUIDELINES.md, AUDIT-GUIDELINES.md, KNOWLEDGE-BASE-GUARDRAIL.md, TROUBLESHOOTING-RUNBOOK.md, REACT-GUIDELINES.md, REACT_USE_EFEECT-GUIDELINES.md, TYPESCRIPT-GUIDELINES.md, DESIGN-UI-UX-GUIDELINES.md, MOBILE-GUIDELINES.md, EXPO-GUIDELINES.md, IOS-GUIDELINES.md, liquid-glass-app-with-expo-ui-and-swiftui.md, BUN-GUIDELINES.md, CLAUDE.md, CHANGELOG.md.

Conditional (apply if scope expands): SWIFT-GUIDELINES.md (native Swift work), PNPM-GUIDELINES.md (monorepo), DB-GUIDELINES.md / POSTGRESQL-GUIDELINES.md / SQLITE-GUIDELINES.md / D1-DATETIME-EXPIRY-GUIDELINES.md (database work), VERCEL-GUIDELINES.md / VERCEL-DESIGN-GUIDELINES.md / SUPABASE-GUIDELINES.md / CLOUDFARE-GUIDELINES.md / VPS_HOSTINGER/ (infra), MCPORTER-GUIDELINES.md / STAGEHAND-GUIDELINES.md / PEEKABOO-GUIDELINES.md / WARELAY-GUIDELINES.md / WAHA-GUIDELINES.md / EVOLUTION-API-GUIDELINES.md / EVOLUTION-API-DEPLOYMENT-GUIDE.md (tooling/integrations), RAG-CHATBOT-GUIDELINES.md / chat-message-idempotency.md (AI or messaging backends), PYTHON-GUIDELINES.md / CLOUDERA-PYSPARK-GUIDELINES.md / SWEETLINK-GUIDELINES.md / OPUS-4-5-PROMPT-OPTIMIZER.md / PETER-ORACLE-GUIDELINES.md (other stacks/tools).

Not applicable to current scope: WEB-NEXTJS-GUIDELINES.md, WEB-GUIDELINES.md, PSEO-GUIDELINES.md, ELYSIA-GUIDELINES.md.

External best-practice reference:

    React Native performance guidance recommends removing console logging in production builds to reduce overhead. Reference: https://reactnative.dev/docs/performance

Verification outputs (2026-01-04):

    bun run lint
    Result: PASS (ast-grep scan completed with exit code 0)

    bun run test
    Result: PASS (64 suites, 1 skipped, 702 tests). No open handles observed.

    bun run sync-versions:dry
    Result: PASS (all versions synchronized at 3.8.4 build 24)

    bun run verify:android
    Result: PASS with warnings
      - android/local.properties sdk.dir points to a missing directory
      - Metro bundler not running on port 8081
      - No Android devices or emulators connected

## Interfaces and Dependencies

No new runtime dependencies are required. If a helper is added for accessibility equality, it should live in src/context/settingsStorage.ts and be imported by src/context/SettingsContext.tsx. Tests should be updated in __tests__/settings.migration.spec.ts to cover the helper behavior.
