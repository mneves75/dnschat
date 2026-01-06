# DNSChat Engineering Exec Spec: Guidelines Compliance + Best-Practice Alignment (2026-01-06)

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

PLANS.md is not present in this repository, so this document is the sole source of truth and must remain fully self-contained.

## Goals

Bring the DNSChat repository into compliance with all documents listed in `docs/GUIDELINES-REF/GUIDELINES_INDEX.json`, align with current best practices for Expo SDK 54 / React Native 0.81.5, and provide hard verification evidence (lint/tests/builds and guideline-to-evidence mapping).

## Non-goals

- Feature development or UI redesign beyond compliance fixes.
- Dependency upgrades that are not required for guideline compliance.
- Infrastructure or backend work unless the repo scope changes to include those domains.

## Constraints & Assumptions

- Bun is the default package manager; all commands use `bun` unless a sub-workspace explicitly requires another tool.
- The repository is an Expo dev-client React Native app; no web backend is present.
- Security-sensitive operations (secrets, credentials, PII) must not be introduced into the repo or logs.
- Mobile build commands (Xcode/Android Studio) are not part of the baseline unless required by a specific fix.
- This plan is authored under a no-questions policy unless a blocking ambiguity is discovered.

## Progress

- [x] (2026-01-06 15:19Z) Indexed all guideline documents from `docs/GUIDELINES-REF/GUIDELINES_INDEX.json` and summarized enforceable rules with verification approaches.
- [x] (2026-01-06 15:19Z) Ran baseline lint/test/build and captured results.
- [x] (2026-01-06 15:19Z) Drafted this exec spec and `docs/engineering-todo.md`.
- [x] (2026-01-06 15:25Z) Added `docs/data-inventory.md` and re-ran unit tests.
- [x] (2026-01-06 15:26Z) Added `docs/model-registry.md` and re-ran unit tests.
- [x] (2026-01-06 15:27Z) Updated `docs/README.md` to index the data inventory and model registry docs.
- [x] (2026-01-06 15:29Z) Removed `@ts-ignore` from native DNS tests via constructor injection and re-ran unit tests.
- [x] (2026-01-06 15:45Z) Tightened `src/services/dnsService.ts` typing (removed `any`, added decode helpers, and clarified socket/buffer types) and re-ran unit tests.
- [x] (2026-01-06 15:47Z) Removed `any` usage from `modules/dns-native/index.ts` and normalized native error handling; re-ran unit tests.
- [x] (2026-01-06 15:50Z) Removed `any` from `src/services/dnsLogService.ts` parsing logic and hardened stored-log normalization; re-ran unit tests.
- [x] (2026-01-06 15:51Z) Typed focus/blur handlers in `src/components/ui/LiquidGlassTextInput.tsx` and re-ran unit tests.
- [x] (2026-01-06 15:53Z) Typed `MessageContent` style/palette props in `src/components/MessageContent.tsx` and re-ran unit tests.
- [x] (2026-01-06 15:54Z) Typed additional style arrays in `src/components/ChatInput.tsx` and re-ran unit tests.
- [x] (2026-01-06 15:55Z) Typed pan gesture handler state change events in `src/components/glass/GlassBottomSheet.tsx` and re-ran unit tests.
- [x] (2026-01-06 15:56Z) Normalized error handling in `src/navigation/screens/GlassSettings.tsx` and re-ran unit tests.
- [x] (2026-01-06 15:57Z) Typed chat list items/handlers in `src/navigation/screens/GlassChatList.tsx` and re-ran unit tests.
- [x] (2026-01-06 15:59Z) Removed `any` from DNS harness decoding in `scripts/run-dns-harness.ts` and re-ran unit tests.
- [x] (2026-01-06 16:00Z) Removed `as any` from crypto bootstrap and screenshot mode helpers (`src/bootstrap/crypto.ts`, `src/utils/screenshotMode.ts`) and re-ran unit tests.
- [ ] Execute remediation tasks one-by-one with tests, update docs, and commit per item.
- [ ] Run full verification suite and assemble the review packet mapping each guideline to evidence.

## Surprises & Discoveries

- Jest reported 1 skipped suite / 13 skipped tests during baseline; this is expected but needs to be tracked as non-failing coverage.
- Adding a private helper named `configureSanitizer` conflicted with the `NativeDNSModule` interface (TS2420) and caused test failures; resolved by renaming the helper.
- Strict TypeScript settings required explicit type predicates and buffer conversions when tightening DNS service typing.

## Decision Log

- Decision: Treat `docs/GUIDELINES-REF/GUIDELINES_INDEX.json` as the authoritative inventory for “all @guidelines-ref docs.”
  Rationale: It is the machine-readable canonical index referenced by GUIDELINES-REF.
  Date/Author: 2026-01-06 / Codex
- Decision: Interpret “baseline build” as `bun run dns:harness:build` (TypeScript compile) because there is no deterministic CI build script for native platforms in this environment.
  Rationale: Provides a verifiable compile step without invoking platform toolchains.
  Date/Author: 2026-01-06 / Codex
- Decision: Add an optional `nativeModuleOverride` to `NativeDNS` to simulate missing native modules in tests without `@ts-ignore`.
  Rationale: Removes forbidden `@ts-ignore` while keeping production behavior unchanged.
  Date/Author: 2026-01-06 / Codex

## Outcomes & Retrospective

TBD at completion.

## Context and Orientation

DNSChat is an Expo dev-client React Native app that sends prompts as DNS TXT queries and renders responses. Entry points and core logic:

- `entry.tsx` bootstraps crypto and Expo Router.
- `app/_layout.tsx` wires providers and app initialization.
- `src/services/dnsService.ts` implements the DNS query pipeline and transport fallback chain.
- `src/services/dnsLogService.ts` stores logs and manages retention.
- `src/services/storageService.ts` handles encrypted local storage.
- `modules/dns-native/` contains native DNS module code and platform implementations.

## Baseline Verification (Completed)

Commands executed from repo root:

- `bun run lint`
- `bun run test`
- `bun run dns:harness:build`

Results:

- Lint: passed.
- Tests: 65 suites passed, 1 skipped; 712 tests passed, 13 skipped.
- Build: TypeScript harness compile succeeded.

## Guidelines Inventory (from `docs/GUIDELINES-REF/GUIDELINES_INDEX.json`)

Each entry lists applicability, enforceable rules (summary), and verification approach.

### Core / Always Applicable

PRAGMATIC-RULES.md
Applicability: Yes.
Rules: Bun is default; never use `any`; avoid unnecessary abstractions; no emojis in code/docs; avoid `useEffect` unless justified.
Verify: `bun install` lockfile is `bun.lock`; `rg -n "\\bany\\b" src app modules`; `rg -n "useEffect" src app`; code review for abstraction use and emoji-free docs.

AGENTS.md
Applicability: Yes.
Rules: Plan before acting; no workarounds; critical reasoning; complete all list items; no scope creep; concise, emoji-free output.
Verify: Exec spec and todo exist; progress updated; diffs scoped to requested work; final review packet includes evidence.

INDEX.md
Applicability: Yes.
Rules: Use as human navigation; ensure referenced guideline list aligns with index.
Verify: Cross-check `GUIDELINES_INDEX.json` list against index; ensure no missing docs in compliance matrix.

EXECPLANS-GUIDELINES.md
Applicability: Yes (multi-step work).
Rules: ExecPlans must be self-contained, include Progress/Decision Log/Surprises/Outcomes, define validation, avoid ambiguity.
Verify: `docs/engineering-exec-spec.md` follows required sections; updates logged as work proceeds.

SOFTWARE-ENGINEERING-GUIDELINES.md
Applicability: Yes.
Rules: Plan deliberately; prove correctness with tests; avoid fire-and-forget promises; maintain observability; use conventional commits.
Verify: Tests/linters run per change; ensure async flows await or explicitly managed; commits are atomic and conventional.

DEV-GUIDELINES.md
Applicability: Yes.
Rules: Strong typing (no `any`), explicit return types, validate inputs at boundaries, handle errors with typed classes; tests for changes.
Verify: `rg` for `any` and `@ts-ignore`; check TS lint/tests; review new code for validation + error handling.

SECURITY-GUIDELINES.md
Applicability: Yes.
Rules: Zero Trust, no secrets in code/logs, maintain data inventory/model registry, log sensitive actions, and document security notes for high-risk changes.
Verify: `docs/data-inventory.md` and `docs/model-registry.md` exist and are current; repo scans for secrets; logging redacts PII; security notes captured in docs.

OWASP-GUIDELINES.md
Applicability: Partially (client-side + network use).
Rules: Validate inputs, treat LLM outputs as untrusted, least privilege, log deny/allow decisions, map controls to mitigations.
Verify: Input validation in `dnsService`; no unsafe rendering; security tests for prompt handling where applicable.

LOG-GUIDELINES.md
Applicability: Yes (app logging + dns logs).
Rules: Structured logs at boundaries; event naming; no secrets/PII; retention policy enforced.
Verify: Inspect `src/services/dnsLogService.ts` for retention behavior; tests cover logging; ensure log redaction for user content.

AUDIT-GUIDELINES.md
Applicability: Yes (state changes in app).
Rules: Log state-changing operations with immutable audit-style records; never hard delete audit logs; avoid PII in plaintext.
Verify: Log storage uses retention/cleanup; ensure no hard delete of audit data; tests validate log handling.

KNOWLEDGE-BASE-GUARDRAIL.md
Applicability: Yes (documentation compliance).
Rules: Cite relevant guideline sections in PR/work notes; run kb-verify when available; update knowledge base when creating new reusable guidance.
Verify: This exec spec cites applicable guidelines; create/update docs as needed; record evidence in final review packet.

TROUBLESHOOTING-RUNBOOK.md
Applicability: No (infra/container runbook is out of scope).
Rules: N/A for this repo unless backend/infra introduced.
Verify: Confirm no container/Traefik deployment in repo (`rg -n "docker|traefik|coolify"`).

BUN-GUIDELINES.md
Applicability: Yes.
Rules: Use Bun for scripts/tests; keep `bun.lock`; run `bun test` + typecheck if configured.
Verify: `bun.lock` present; scripts use `bun`; baseline commands run with `bun`.

CLAUDE.md (GUIDELINES-REF)
Applicability: Indirect (meta guidance).
Rules: Keep CLAUDE docs in sync with repo practices; update changelog when changing guidance.
Verify: `CLAUDE.md` in repo reflects current practices; docs updated with changes in this work.

CHANGELOG.md (GUIDELINES-REF)
Applicability: Indirect (meta guidance).
Rules: Update changelog when behavior or guidance changes.
Verify: Update root `CHANGELOG.md` if compliance work changes behavior or docs.

### React / TypeScript / UI / Mobile

REACT-GUIDELINES.md
Applicability: Yes (React Native).
Rules: React Compiler enabled; minimize manual memoization; keep `'use client'` boundaries correct where applicable; audit/logging awareness.
Verify: `babel.config.js` includes React Compiler; `app.json` enables `reactCompiler`; scan for unnecessary `useMemo/useCallback`.

REACT_USE_EFEECT-GUIDELINES.md
Applicability: Partial (not using RSC; useEffect guidance still relevant).
Rules: Use effects only when necessary; keep client/server boundary rules if applicable.
Verify: `rg -n "useEffect" src app` and review usage; ensure no data fetching in effects unless unavoidable.

TYPESCRIPT-GUIDELINES.md
Applicability: Yes.
Rules: Strict TS config, no `any`, runtime validation at boundaries, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`.
Verify: `tsconfig.json` options; `rg -n "any|@ts-ignore"`; tests and `tsc` usage where applicable.

DESIGN-UI-UX-GUIDELINES.md
Applicability: Yes (mobile UI).
Rules: Follow design tokens, glass morphism/Liquid Glass, WCAG 2.2 AA, 44x44 touch targets, pt-BR localization.
Verify: UI components follow `src/components` and `src/navigation/screens` patterns; tests for accessibility/hit slop; translations in `src/i18n/messages`.

MOBILE-GUIDELINES.md
Applicability: Yes.
Rules: New Architecture on; Android 16 / 16KB page size readiness; avoid shadow/border props on native views; performance budgets.
Verify: `app.json` `newArchEnabled` true; Android config uses SDK 36; tests for native view prop guards; ensure wrappers for blur/native views.

EXPO-GUIDELINES.md
Applicability: Yes.
Rules: Expo SDK 54, typed routes, React Compiler, new arch; avoid deprecated expo-av; safe-area-context usage.
Verify: `app.json` `experiments.typedRoutes` and `reactCompiler`; dependencies match SDK 54; no `expo-av` usage; use `react-native-safe-area-context`.

IOS-GUIDELINES.md
Applicability: Partial (only for native iOS modules/configs).
Rules: SwiftUI/SwiftData for native work; privacy manifests; Xcode tooling; accessibility and performance budgets.
Verify: Native module changes include privacy manifest updates; iOS config aligns with deployment target and `DEVELOPMENT_TEAM` empty.

SWIFT-GUIDELINES.md
Applicability: Conditional (only when touching Swift code in `ios/` or `modules/dns-native/ios`).
Rules: Swift 6 strict concurrency; privacy manifests; Swift Testing.
Verify: If Swift files change, ensure toolchain flags and privacy manifests align; run iOS tests where possible.

liquid-glass-app-with-expo-ui-and-swiftui.md
Applicability: Yes (UI design reference).
Rules: Liquid Glass patterns for iOS 26; ensure glass components and translucent layers.
Verify: UI components use glass effect guidelines where relevant; design tokens enforced in styles/tests.

### Web / Backend / Infra (Not Applicable Unless Scope Expands)

WEB-NEXTJS-GUIDELINES.md
Applicability: No (no Next.js app).
Rules: N/A.
Verify: No Next.js config or app (`rg -n "next" app src package.json` excludes Next.js dependencies).

WEB-GUIDELINES.md
Applicability: No (no web frontend beyond Expo web preview).
Rules: N/A unless a separate web app is added.
Verify: No dedicated web build system or CSS framework present.

PSEO-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No PSEO/SEO tooling or content pipelines in repo.

PNPM-GUIDELINES.md
Applicability: No (Bun is standard).
Rules: N/A unless monorepo with pnpm appears.
Verify: No `pnpm-lock.yaml`.

DB-GUIDELINES.md
Applicability: No (no database layer).
Rules: N/A unless database added.
Verify: No DB client or schema files.

POSTGRESQL-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No Postgres usage.

SQLITE-GUIDELINES.md
Applicability: No (no SQLite usage in app logic).
Rules: N/A unless SQLite introduced.
Verify: No sqlite dependencies.

TESTING-IN-MEMORY-DATABASE-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No in-memory DB testing utilities.

D1-DATETIME-EXPIRY-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No Cloudflare D1 usage.

ELYSIA-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No Elysia server code.

VERCEL-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No Vercel deployment config.

VERCEL-DESIGN-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No Vercel UI conventions used.

SUPABASE-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No Supabase client usage.

CLOUDFARE-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No Cloudflare Workers/Pages usage.

MCPORTER-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No mcporter tool usage.

STAGEHAND-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No Stagehand automation.

PEEKABOO-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No macOS UI automation.

WARELAY-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No Warelay CLI usage.

WAHA-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No WAHA integration.

EVOLUTION-API-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No Evolution API integration.

EVOLUTION-API-DEPLOYMENT-GUIDE.md
Applicability: No.
Rules: N/A.
Verify: No Evolution API deployment.

KIWIFY-API-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No Kiwify API usage.

RAG-CHATBOT-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No RAG pipeline or embeddings.

chat-message-idempotency.md
Applicability: No.
Rules: N/A.
Verify: No backend chat idempotency logic.

PYTHON-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No Python code.

CLOUDERA-PYSPARK-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No PySpark code.

SWEETLINK-GUIDELINES.md
Applicability: No.
Rules: N/A.
Verify: No SweetLink integration.

OPUS-4-5-PROMPT-OPTIMIZER.md
Applicability: No.
Rules: N/A.
Verify: No prompt-optimization workflows in repo.

PETER-ORACLE-GUIDELINES.md
Applicability: Optional (only if Oracle tool needed).
Rules: N/A unless Oracle invoked.
Verify: Not used in this effort.

### Internal Specs / Inventories (GUIDELINES-REF meta docs)

docs/ENGINEERING-EXEC-SPEC.md
Applicability: Reference only.
Rules: Follow exec spec structure for guideline verification work.
Verify: This plan mirrors required sections and preserves self-contained format.

docs/GUIDELINES-REF-VERIFICATION-EXEC-SPEC.md
Applicability: Reference only.
Rules: Follow its verification flow when doing full repo compliance checks.
Verify: This plan incorporates guideline inventory and verification mapping.

docs/GUIDELINES-SYSTEM-IMPROVEMENTS-EXEC-SPEC.md
Applicability: Reference only.
Rules: N/A unless contributing to GUIDELINES-REF system itself.
Verify: Not modified.

docs/EXPO-SDK-BEST-PRACTICES-EXEC-SPEC.md
Applicability: Yes (Expo SDK 54 verification checklist).
Rules: Follow Expo-specific verification steps for config, SDK versions, and New Architecture.
Verify: `app.json`, dependencies, and tests checked against Expo checklist.

docs/EXEC-SPEC-REF-STRUCTURE-POSTGRESQL.md
Applicability: No (no Postgres work).
Rules: N/A.
Verify: No Postgres usage.

docs/GUIDELINES-STRUCTURAL-ALIGNMENT-EXEC-SPEC.md
Applicability: Reference only.
Rules: N/A unless updating GUIDELINES-REF structure.
Verify: Not modified.

docs/KIWIFY-API-GUIDELINES-EXEC-SPEC.md
Applicability: No.
Rules: N/A.
Verify: No Kiwify integration.

docs/data-inventory.md
Applicability: Yes (SECURITY-GUIDELINES requirement).
Rules: Maintain a data inventory for repo data handling.
Verify: Create/update `docs/data-inventory.md` and reference it in compliance mapping.

docs/model-registry.md
Applicability: Conditional (only if models are used). For this app, still required by SECURITY-GUIDELINES as a placeholder stating “no models.”
Rules: Track model usage/lineage or explicitly declare none.
Verify: Create/update `docs/model-registry.md`.

docs/spec.md
Applicability: No (mcporter CLI not used).
Rules: N/A.
Verify: Not referenced in code.

CLAUDE.md (repo root)
Applicability: Yes.
Rules: Keep repo-specific workflow guidance accurate.
Verify: Update if any workflow changes are introduced by remediation.

CHANGELOG.md (repo root)
Applicability: Yes.
Rules: Record notable changes from compliance work.
Verify: Update changelog per remediation item.

## Plan of Work

Phase 0: Discovery and baseline evidence (complete). Establish guideline inventory, run baseline lint/tests/build, and record results.

Phase 1: Documentation scaffolding (complete). Author exec spec and todo plan with explicit verification steps.

Phase 2: Compliance remediation. For each gap, implement a small change, add or update tests, run verification, update docs, and commit with a conventional message.

Phase 3: Final verification and review packet. Run full verification suite, assemble guideline-to-evidence mapping, and summarize residual risks.

## Risks & Mitigations

- Risk: Scope creep from optional guidelines or platform upgrades.
  Mitigation: Only address gaps required for compliance; log optional upgrades as future work.
- Risk: Native build steps require local toolchains (Xcode/Android Studio).
  Mitigation: Use unit tests and config verification; document unmet steps if tooling unavailable.
- Risk: Security/docs requirements (data inventory/model registry) missing.
  Mitigation: Create minimal compliant docs stating current data/model usage.

## Idempotence and Recovery

All changes are additive or small edits; steps can be re-run safely. If a change introduces regressions, revert that commit and re-run lint/tests.

## Artifacts and Notes

Baseline command outputs are recorded in this spec. Additional verification outputs will be added per remediation item.

## Interfaces and Dependencies

No new runtime dependencies are planned unless required by compliance tests or missing tooling explicitly demanded by guidelines.
