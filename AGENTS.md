# DNSChat agent contract

Shared project instructions for Codex and Claude Code. Read this file first;
CLAUDE.md imports it. User instructions take precedence over skill procedures.

## Start and scope

1. Inspect `git status -sb`. Preserve unrelated changes; stay in the requested checkout.
2. Read `MEMORY.md` and the relevant `memory/` journal for current state.
3. Read `docs/technical/SPECIFICATION.md` for behavior; `docs/README.md` indexes supporting references.
4. Read `docs/agents/development.md` for build, debug, worktree and verification mechanics.
5. For networking, storage, logging or release work, also read `SECURITY.md`, `docs/data-inventory.md`, `docs/model-registry.md` and `docs/technical/DNS-PROTOCOL-SPEC.md`.

An audit or explanation alone is read-only. A request to implement authorizes
reversible in-scope edits and validation. Push, publish, deployment and destructive
operations require explicit authorization. Do not ask again for an authorized step.

For substantial work, write acceptance criteria and a bounded plan. The primary
agent owns requirements, architecture, integration and acceptance. Delegate only
independent, substantial work with explicit file ownership and proof requirements;
subagents do not delegate again. Serialize native builds and device interaction.
Batch independent reads; keep the primary agent working on a separate part while
reviewers run. Use targeted edits and tests sized to the behavior being changed.

Report concise progress during long runs. Preserve the objective, decisions,
paths and proof across compaction. Stop when acceptance criteria and required
checks are satisfied; state actual blockers without inventing certainty. Model
configuration belongs to the harness, not this app. Current prompting references:
[Claude Fable 5.1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1)
and [GPT-6 Astra](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra#prompting-best-practices).
These references were checked on 2026-09-04. Keep model/effort tuning in the
harness; deeper reasoning does not require longer replies or repeated gates.

## Product and code map

DNSChat sends short prompts as DNS TXT queries. No accounts, API keys or tracking;
local history is encrypted. DNS itself is observable and unauthenticated.

- Stack: Expo SDK 57, React Native 0.86.3, React 19.2.3, TypeScript 6, Hermes, New Architecture.
- Default resolver: `llm.pieter.com:53`, the only automatic-chain server. `ch.at:53` is selectable but not an automatic fallback.
- `entry.tsx` bootstraps crypto before `expo-router/entry`; `app/_layout.tsx` owns providers and initialization.
- Routes exist only under `app/`. `src/navigation/screens/` contains screen components consumed by routes.
- `src/services/dnsService.ts` owns transport orchestration; `dnsWire.ts` owns DNS encoding, decoding, TCP framing and response validation.
- `src/services/storageService.ts`, `encryptionService.ts`, `dnsLogService.ts` own persistence, encryption and logs.
- `src/context/settingsStorage.ts` owns defaults and settings migration.
- `modules/dns-native/` owns native DNS and shared constants. Resolver mirrors also exist in `ios/DNSNative/` and `android/app/src/main/java/com/dnsnative/`; keep each platform's two copies identical.
- `src/i18n/messages/en-US.ts` and `pt-BR.ts` own bilingual text.
- `src/ui/theme/` and `DESIGN.md` own design tokens; `PRODUCT.md` owns product intent.

## Behavior and security invariants

- Keep the transport order native -> UDP -> TCP -> optional mock. Web uses mock; neither JS nor Android has DNS-over-HTTPS.
- One absolute 20-second budget covers retries, backoff and transports. Each rung is capped at 10 seconds; native converts the deadline once to a monotonic budget capped at 9.5 seconds.
- Backgrounding invalidates in-flight work and closes sockets/cancels native work. An expired or cancelled lifecycle cannot start another fallback or accept a stale result.
- Prompt limit is 120 before sanitization; output is one lowercase alphanumeric/dash label of at most 63 characters. Do not change limits or sanitizer without native + JS tests and docs.
- Resolver choices stay allowlisted in `modules/dns-native/constants.ts`. Never add arbitrary server input. Native accepts port 53 and the two LLM zones only; native allowlists must match each other and be a subset of the JS allowlist.
- Root Android dnsjava names explicitly with `Name.fromString(queryName, Name.root)`; pin every query to its selected zone. Validate packet/question/answer boundaries and expanded DNS-name length.
- Never log prompts, TXT responses, keys, credentials or device identifiers in production. Corruption handling must not store plaintext payload fragments in diagnostic metadata.
- Render untrusted Markdown only through `SafeMarkdown`; no automatic remote images or uncontrolled external navigation. Review installed renderer defaults when upgrading it.
- Native encryption keys live in SecureStore. Preserve Android backup/transfer exclusions. Browser storage is preview-only and is not a production secure-storage boundary.
- No credentials, signing assets, `.env*` secrets, Firebase configs, device IDs, local paths or internal App Store identifiers in tracked files. Follow `docs/public-release-redaction.md`.
- `DEVELOPMENT_TEAM` stays empty in the public Xcode project. Supply signing configuration locally at build time.
- Dependency suppressions require an actual fix blocker, reachability argument and recheck date. Remove them when a compatible fix exists; preserve the consumer major in version floors.

## Implementation conventions

- Use pnpm exclusively; `pnpm-lock.yaml` is authoritative. Install with `pnpm install --frozen-lockfile`; never hand-edit the lockfile or installed dependencies.
- Prefer deleting unused code and redundant ownership over adding wrappers. Keep validation at external boundaries and meaningful error/data-loss handling.
- Add a failing behavioral regression before a bug fix. Do not assert comments, endorsements or implementation spellings as a substitute for behavior. Keep useful native/security structural gates and prove their positive controls.
- React Compiler stays enabled. Add manual memoization only after profiling proves a compiler bailout and a benefit.
- Reanimated shared values use `.get()`/`.set()`. Create render-used animated values with lazy `useState`; avoid render-time ref reads. Use compiler-supported cleanup rather than `finally` blocks in component/hook code.
- Never add `react-native-reanimated/plugin`: `babel-preset-expo` already registers the worklets transform.
- Use `useImessagePalette()`, `useResolvedColorScheme()` and `useResponsiveLayout()` for colors, theme and sizing; raw `useColorScheme()` ignores the web theme setting.
- Use `appAlert()` instead of `Alert.alert`, which does not work on web. Preserve reduce-motion behavior, accessible labels/roles and touch targets.
- Update both locales together. Do not add emoji/pictographic glyphs to tracked source or docs.
- Register new routes under `app/`, then verify generated typed routes.
- ast-grep uses `sgconfig.yml` with `ruleDirs: project-rules`; never pass a rule as the scan config. Bans need both TypeScript/Tsx rules and violation fixtures.

## Validation and review

Use the smallest relevant check while editing. The full closeout gate is
`pnpm run verify:all`; run it before committing. It includes native module tests
and security scans. Run `pnpm run verify:video` only when `marketing/video`
changes. For a full source/security sweep also run
`asc doctor`, the local DNS harness, and the native build/runtime proof described
in `docs/agents/development.md`. A skipped artifact check is not build evidence.
Once required checks pass, repeat only for changed code, a new failure or a
specific unresolved concern. State which behavior each check can establish.

Visible changes require a real compiled-app UI pass. Argent is the default:
read the relevant skills, call `list-devices`, prefer a running simulator/emulator,
and use fresh accessibility/component-tree frames for taps. Never derive tap
coordinates from screenshots. Expo Go and Expo dev-client are not valid proof.
Record repeatable scenarios before the first action; saved QA flows need two
unchanged complete passes. Argent MCP is the only runtime proof surface.
At closeout, stop only Argent services for devices used by this session; do not
stop another session's Metro.

For broad audits, inventory `app/`, `src/`, `modules/`, `scripts/`, tests,
plugins, native config, site/marketing sources, CI and release/security docs.
Map findings to the specification. Performance claims need a same-workload
baseline, build mode, actual work counts and load-aware timings; simulator
measurements do not establish hardware performance.

Run `$autoreview` through P3 after non-trivial edits. Verify findings against
real code, fix in-scope defects, then rerun affected proof and one review pass.
When Matt Pocock's code-review is requested, use the starting commit and the
accepted requirements as the baseline; keep Standards and Spec findings separate.

## Version and release

`package.json` is the version source. Edit it first, then run
`pnpm run sync-versions --bump-build`; inspect `sync-versions:dry`. Never manually
edit version fields in app.json, Xcode or Gradle; Info.plist uses build variables.
Update CHANGELOG.md under Unreleased during work and relevant behavior docs.

A push is not an App Store release. TestFlight requires separate authorization
and the protocol in `docs/App_store/Apple_App_Store/TESTFLIGHT.md`: final verified
source, signed archive, IPA export, processed VALID upload, strict validation
with zero errors/warnings. Changes after upload require a new build and upload.
Use `vX.Y.Z-betaN` for staging; clean version tags require production promotion.
A matching App Store version attachment needs separate explicit evidence.
Before production submission, run `asc validate --strict` for the exact version
and verify App Privacy in an authenticated web session; API validation does not
establish whether privacy declarations are published.

Preserve the iOS SceneDelegate bridge and UIApplicationSceneManifest until Expo
provides equivalent support. Do not clean-prebuild without restoring the bridge
and passing `__tests__/iosSceneLifecycle.spec.ts`. A successful launch response
must be followed by process-survival and actual screen evidence.

Keep current release state and unresolved provider-policy/authentication decisions
in MEMORY.md and SECURITY.md. Never claim production readiness from a green gate
while those decisions remain unresolved.
