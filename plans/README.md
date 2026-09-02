# Implementation Plans — DNSChat

## Cycle 4 — deep audit 2026-07-28 (planned against commit `749334c`)

Release-closeout pass on `main` at `4.3.2`. Three parallel read-only auditors
(correctness/services, UI architecture + performance, tests/tooling/docs), plus
an autoreview cycle and a security audit. Every finding below was re-opened and
confirmed against live code by the advisor before being recorded; two auditor
claims were corrected in the process (see "Vetted with corrections").

Security audit found nothing: gitleaks clean over 449 commits, `pnpm audit`
and the `modules/dns-native` lockfile both at zero vulnerabilities, no
client-exposed env, no TLS disabling, no injection or upload surface. The one
residual risk is by design and documented: prompts travel as cleartext DNS to a
third-party server.

### Applied in-session (2026-07-28, docs only — commits `b404ecc`, `749334c`)

Documentation corrections, each verified against the code that disproved it:

- `getLLMServers()` returns a **single** server (`LLM_DNS_SERVERS` is
  `[DNS_SERVERS[0]]`), so there is no server-level fallback and `queryLLM`'s
  multi-server loop, `logServerFallback`, and the "All LLM servers are
  unreachable" message are unreachable in the default configuration. `CLAUDE.md`
  had claimed two servers.
- `gitleaks` does run in CI, via its own workflow. Four workflows exist
  (`ci.yml`, `gitleaks.yml`, `codeql.yml`, `public-redaction.yml`); only
  `ci.yml` was documented.
- `pnpm run lint` loads zero rules and enforces nothing — now stated as such in
  `CLAUDE.md` until plan 012 lands.
- CI job inventory omitted the `sbom` job; the hygiene policy permits tracked
  `.env*.example` files; the pbxproj recovery step recommended a whole-file
  `git checkout` that would discard unrelated unstaged native edits.
- `.node-version` pinned to `24`: `react-compiler-healthcheck` crashes on Node
  26 (`yargs`: `require is not defined in ES module scope`).

### Planned

| Plan | Title | Priority | Effort | Depends on | Status |
|------|-------|----------|--------|------------|--------|
| 012 | Lint gate loads and enforces the ast-grep rules | P1 | S | — | DONE (2026-07-28, codex executor + advisor review) |
| 013 | Drop `--passWithNoTests`; add a suite-size floor | P1 | S | — | DONE (2026-07-28, codex executor + advisor review) |
| 014 | Bind the UDP socket before sending | P1 | S | 013 (soft) | DONE (2026-07-28, codex executor + advisor review) |
| 015 | Keep chats recovered from a corrupted store | P1 | S | — | DONE (2026-07-28, codex executor + advisor review) |
| 016 | Test encryption against real AES-GCM | P1 | M | — | BLOCKED — `@noble/ciphers` is ESM and this Jest suite is CommonJS; removing the mock fails 27 suites with `Cannot use import statement outside a module`. Needs a `transformIgnorePatterns` change the plan put out of scope. |

Status values: TODO | IN PROGRESS | DONE | BLOCKED (reason) | REJECTED (rationale)

### Executor review notes (cycle 4)

- **012/013 (codex, 2026-07-28)**: implementation was sound and stayed in
  scope, but the advisor review caught a real gap before landing. ast-grep
  treats `Tsx` and `TypeScript` as **separate languages**, and the executor
  carried the original file's single-language split forward: the legacy-import
  rule was `Tsx`-only and the native-module rule `TypeScript`-only, so a
  `LiquidGlassNative` reference in a `.tsx` file (where nearly all components
  live) and a legacy import in a `.ts` file both passed. Verified empirically
  with planted files, then fixed by adding the mirrored rules
  (`astgrep-liquid-glass-ts.yml`, `astgrep-native-liquid-glass-tsx.yml`),
  extending the fixtures to all four combinations, and raising the rule floor
  from 2 to 4. Lesson for future plans: a done-criterion phrased as "a file
  containing the pattern fails lint" is satisfiable by one extension; name the
  extensions.
- The executor correctly declined to run `node scripts/install-git-hooks.js`
  because the spec forbade touching `.git/`, and validated the generated hook
  body in memory instead. The advisor ran the installer for real afterwards and
  confirmed `.git/hooks/pre-commit` contains `pnpm run test --bail`.
- **014/015 (codex, 2026-07-28)**: both landed cleanly with the required
  red-then-green evidence. Two advisor corrections: plan 015's zero-recovered
  branch was left with a hardcoded English string while the recovered branch was
  localized, so a `storageRecovery.reset` key was added to both locales for
  symmetry. The executor's choice of `settingsRef.current.locale` (the resolved
  active locale) over `preferredLocale` (nullable) was verified correct.
- **016 BLOCKED — the plan was wrong, not the executor.** It asserted
  "`@noble/ciphers` is pure JavaScript and fast, there is no reason the tests
  cannot run the real thing". The obstacle is module format, not speed: the
  package ships ESM, `jest.config.js` runs `testEnvironment: "node"` through
  ts-jest in CommonJS, and no `transformIgnorePatterns` entry lets it through.
  Removing the mock fails 27 suites with
  `SyntaxError: Cannot use import statement outside a module`. The executor hit
  the plan's own STOP condition and restored the mock. Revising 016 means
  allowing a `jest.config.js` change (transform `@noble/*`) or switching the
  encryption suites to `--experimental-vm-modules`; both were explicitly out of
  scope, so the plan needs rewriting before another attempt.
- Plans 013, 015 and 016 contain a `--testPathPattern` example written as
  `'repo\.(gitHooks\|ci)'`. Inside single quotes the `\|` is a literal escaped
  pipe, which matches nothing in ERE. Use `'repo\.(gitHooks|ci)'`.

### Dependency notes (cycle 4)

- 012 and 013 come first: until they land, two gates report green while
  checking nothing, so no other plan's "tests pass" evidence means much.
- 014 depends softly on 013 — its proof rests entirely on the suite running.
- 015 and 016 are independent of everything and of each other.

### Backlog — vetted, not planned (cycle 4)

Correctness:

- **C-03** Android `DNSResolver.java` has no overall query budget:
  `QUERY_TIMEOUT_MS = 10000` is per-attempt inside a 3-attempt loop, then
  `queryTXTLegacy` runs 3 more, so a query can hold a pool thread ~60s after JS
  abandoned it at 10s. iOS documents the exact invariant Android violates
  (`ios/DNSResolver.swift:14-24`, 9.5s budget). M effort, MED risk (shortening
  the budget converts slow-but-successful queries into timeouts).
- **C-05** A failed sanitizer configuration latches native DNS off for the
  whole JS runtime: `configureSanitizerIfNeeded()` runs only from the
  constructor, so one transient bridge failure at startup downgrades the
  session to UDP/TCP/mock with no recovery short of a restart. S-M.
- **C-04** `isAvailable()` creates its promise lock *after* an `await`
  (`modules/dns-native/index.ts:540` check, `:556` await, `:571` assignment),
  so the documented race guarantee does not hold. Behavior stays correct
  (idempotent calls); the comment is misleading. S.
- **C-06** `accessibility.fontSize` is passed through unvalidated in
  `migrateSettings` while every sibling field is normalized, and the "Version
  4+" branch matches versions greater than `SETTINGS_VERSION`. Not reachable
  from the UI today. S.

Tests and tooling:

- **TEST-02** `modules/dns-native/__tests__/concurrency.stress.test.ts` (337
  lines, in the CI `dns-native` job) never imports the module under test; every
  assertion is about its own `jest.fn()`. Its dedup case is tautological. It
  reads as evidence that the Swift ResumeGate race is covered; nothing in the
  repo tests that. S to delete, M to replace with a real `NativeDNS` test.
- **TEST-03** The shared `__tests__/mocks/react-native.js` omits `AppState`,
  `StatusBar`, `Appearance`, `TouchableWithoutFeedback` and `Settings`, so the
  Chat screen, `OnboardingContainer` and `GlassBottomSheet` cannot render in
  tests and are covered only by file-text specs. This is the mechanical cause
  of the text-spec ratio, not a style choice. M.
- **TEST-04** The background-suspension abort path
  (`dnsService.ts:586-604`, wrapping 10 call sites) has no test, nor do
  `recordServerFailure`, `assertWithinQueryBudget` or `normalizePort`. S.
- **TEST-05** `__tests__/mocks/modules-dns-native.js` and
  `__tests__/mocks/react-native-device-info.js` are both unreferenced; the
  first has drifted to a 2-arg `queryTXT` (real contract is 3) and re-implements
  multipart parsing without duplicate-part rejection or bidi stripping. S.
- **DX-03** `verify:react-doctor` runs `npx -y react-doctor@latest` inside
  `verify:all`, so the release gate depends on an unpinned network fetch while
  every other gate is pinned. S.
- **DX-04** `verify:android-16kb` warns and exits 0 when no build artifacts
  exist, so `verify:all` green does not imply 16KB compliance. Add a
  `--require-artifacts` flag for the CI path. S.
- **DX-05** (done: the script and the ESLint devDependencies were removed with the Oxfmt/Oxlint migration) `modules/dns-native`'s `lint` script invokes `eslint` with no
  ESLint config anywhere in the repo, carrying four EOL ESLint 8
  devDependencies into the lockfile and the SBOM. Fold into the 012 decision. S.
- **CI-01** Node is pinned to a fourth value (`20.19.4`) in
  `public-redaction.yml`, below `engines.node >= 22`, and
  `__tests__/repo.ci.spec.ts:86` hard-codes `/node-version: '?22[.']/` — so
  converging CI on `.node-version` breaks the suite. The inconsistency is
  self-enforcing. S.

UI, performance and debt:

- **PERF-01** `reduceTransparency` seeds `true` on iOS
  (`LiquidGlassWrapper.tsx:284`) and the glass/non-glass branches have
  different tree shapes (`:329-345`), so every glass surface renders once
  non-glass and then remounts its whole subtree. Multiplied by ~200 wrapper
  instances on the Logs screen. M, MED risk.
- **PERF-02** `GlassChatList.tsx:369` and `Logs.tsx:174` `.map()` unbounded
  data into a `ScrollView` (`GlassForm.tsx:176`), each row carrying its own
  hooks, animated style and (on Logs) native glass view. `MessageList.tsx` is
  already a properly tuned `FlatList` — the pattern exists. M per screen.
- **PERF-03** `OnboardingProgress.tsx` animates `width` via legacy `Animated`
  with `useNativeDriver: false`, alone among the app's animations, exactly when
  onboarding is mounting the next screen. S.
- **DEBT-05** Four hardcoded colours bypass `useImessagePalette()`. The visible
  one: `GlassChatList.tsx:586` hardcodes `#FF453A` (the **dark**-mode
  destructive) so the delete icon is the wrong red in light mode. Also
  `GlassSettings.tsx:477,503` and `ChatInput.tsx:616-623` (the Android and
  pre-iOS-26 fallback path). S.
- **DEBT-02** `app/chat/[threadId].tsx:146-152` builds share text with
  hardcoded English `You:`/`AI:` labels instead of `ShareService`, which
  `GlassChatList.tsx:532-537` uses. pt-BR users get English. Note the two
  paths also produce different formats, so "just call ShareService" would drop
  the role labels — decide the intended format first. S.
- **DEBT-03** `SkeletonBase.tsx:89` detects dark mode by comparing
  `palette.textPrimary` to a hex literal; the sibling `SkeletonMessage.tsx:33`
  was already migrated to `palette.isDark`. The two also freeze at different
  reduce-motion opacities. S.
- **DEBT-01** `useStaggeredList` (`src/ui/hooks/useStaggeredList.tsx:156-244`)
  is a near-verbatim duplicate of `useStaggeredListValues` and has no
  production consumer — it is kept alive only by
  `__tests__/staggeredList.api.spec.ts`, which reads the file as text. S.
- **DEBT-06** `SettingsSkeleton` is exported and contract-tested but never
  rendered; `GlassSettings.tsx:84` reads `loading` and has no loading branch,
  so Settings shows default values during hydration. S.
- **DEBT-04** Three divergent create-chat paths
  (`app/(tabs)/index.tsx:12-34`, `GlassChatList.tsx:466-492`,
  `app/chat/[threadId].tsx:174-193`) with different guards, different error
  surfaces (blocking alert vs toast) and inconsistent haptics. M, MED risk.
- **A11Y-01** `Toast.tsx:468` hardcodes a white icon glyph on chroma fills
  while every adjacent label uses `palette.textOnChroma` (`#000000`), chosen
  precisely for contrast on bright fills. S.
- **RESP-01** `useResponsiveLayout()` exposes `isTablet`/`isDesktop`/`size`/
  `width`/`height` with zero consumers; the content-width constraint is gated
  on `Platform.OS === "web"` (`GlassForm.tsx:165`, `Chat.tsx:179`), so native
  iPad runs full-bleed while a 1024px browser window is constrained. S-M.

Direction (options for the maintainer, not defects):

- **`ch.at` is selectable but offline.** `GlassSettings.tsx:160-164` offers it;
  selecting any server pins the app to that server with no fallback. The picker
  therefore lets a user configure guaranteed failure. Either mark it
  unavailable or remove it from the options.
- **Native code has no test surface, and the scheme points at a phantom
  target.** `ios/DNSChat.xcodeproj/xcshareddata/xcschemes/DNSChat.xcscheme:30-40`
  references `DNSChatTests.xctest` (blueprint `00E356ED1AD99517003FC87E`),
  which exists neither in the pbxproj nor on disk, so `xcodebuild test` fails
  on a missing target. Native DNS is the primary transport on device, and
  findings C-03, C-05 and TEST-02 all live in code no test can reach.
- **Node convergence** is now a two-file change plus relaxing the hard-coded
  major in `repo.ci.spec.ts:86`.

### Vetted with corrections (cycle 4)

- The correctness auditor reported the sanitizer latch as "set in exactly one
  place and cleared in none". It *is* cleared
  (`modules/dns-native/index.ts:333,344,347`) — but only inside
  `configureSanitizerIfNeeded()`, which runs solely from the constructor. The
  no-retry-after-startup substance stands; the claim as written did not.
- The UI auditor cited the web width gate as `styles.webContentWidth` in
  `Chat.tsx`; the actual style name there is `webContent` (`Chat.tsx:179`,
  `:247-249`). Evidence sound, name wrong.

### Rejected / verified-compliant (cycle 4, do not re-audit)

- **Test-suite flakiness**: the full suite was run twice plus once with
  `--randomize --seed=1337`; 129 passed / 1 skipped / 1017 tests each time.
  `encryptionService.key.spec.ts` mutates `process.env.JEST_WORKER_ID` but
  restores it every time. No order dependence.
- **`modules/dns-native` tests running twice** (root glob plus the dedicated CI
  job): deliberate per `repo.ci.spec.ts:35-46`, which documents the job as
  proving independent installability. Costs ~2.7s.
- **`docs/architecture/SYSTEM-ARCHITECTURE.md` transport claims**: pinned by
  `docs.architecture.spec.ts` and matching `dnsService.getMethodOrder`. Docs
  and code agree.
- **Android combining-marks default vs the JS `\p{M}+` config**: the subsequent
  `[^a-z0-9-]` pass removes anything the narrower default leaves, so outputs
  are identical. Not drift in practice.
- **Unused teardown APIs** (`DNSLogService.stopCleanupScheduler`,
  `DNSService.destroyBackgroundListener`): correct for app-lifetime singletons.
- **`redactText` storing SHA-256 of short prompts**: brute-forceable in theory,
  but the log store is encrypted at rest and this is the documented redaction
  design.
- **`useTypography` rebuilding its scale object per render**, **`React.Children.count`
  inside `React.Children.map`** (max 6 children), **`PressableRipple`'s rgba
  defaults**, **`MessageList` scroll effect keyed on `content.length`** (no
  streaming exists): all considered and not worth doing.
- **i18n key parity**: verified programmatically, identical key sets, zero
  missing or extra.

---

## Cycle 3 — deep audit 2026-07-12 (planned against commit `3147b64`)

Deep audit of the 4.2.x uncommitted working tree (chat-list "Signal Path"
redesign + cross-platform web fixes). Three parallel read-only auditors
(correctness/security, a11y/design, i18n), all findings vetted against live
code by the advisor. Cheap, low-risk conformance/defense fixes were applied
directly in-session; the one data-integrity finding too risky to fix blind
pre-release is planned below.

### Applied in-session (2026-07-12, verified: full Jest suite green)

- **appAlert web no-op fix** (BUG-WEB-1): `Alert.alert` is a silent no-op on
  react-native-web; added `src/utils/appAlert.ts` (Platform-aware, uses
  `window.confirm`/`window.alert`), migrated all 10 call sites. Runtime-proven
  on web (Reset Settings confirm dialog now resets state).
- **Theme preference on web** (BUG-WEB-2): `Appearance.setColorScheme` is
  ignored by react-native-web; added `src/ui/theme/resolvedColorScheme.ts` and
  routed the palette + theme-sensitive components through it. Runtime-proven
  (dark theme now paints `#000` canvas on web).
- **Plain Language copy** (CONTRACT-2): rewrote onboarding + chat-list copy to
  drop "magic/revolutionary/world's first/Amazing"; new policy spec guards
  onboarding AND chat-list subtrees.
- **DESIGN-05**: chat-row message-count badge was blue-on-15%-blue (~3.4:1,
  below AA) and violated the One Signal Rule — recolored to neutral
  (`assistantBubble` fill, `textPrimary` label).
- **A11Y-04**: `observableNotice` security disclosure bumped caption1(12px)→
  footnote(13px) + `textPrimary` for a stronger, AA-margin trust signal.
- **DESIGN-06**: hero title given `fontWeight: 600` per DESIGN.md §3
  (hero/state-panel titles are 600/22; `title2` token is 400).
- **NIT-01**: signal-path hero given `importantForAccessibility="no-hide-
  descendants"` for Android parity with the iOS `accessibilityElementsHidden`.
- **CORRECT-02**: `appAlert` dev-warns when given >2 buttons on web (window.
  confirm is binary; a third action would be silently dropped).
- **TECHDEBT-07**: removed dead `newConversation.subtitle` i18n key (both
  locales; unreferenced + off-tone).

### Planned

| Plan | Title | Priority | Effort | Status |
|------|-------|----------|--------|--------|
| 011 | loadChats corruption blast-radius: per-record quarantine vs whole-history wipe (CORRECT-01) | P2 | M | DONE (2026-07-13, codex executor + advisor review + 2 autoreview cycles) |
| — | CACHE-01 concurrency: non-queued write from the load path (data-loss race) | P2 | M | FIXED (2026-07-13, advisor, released as 4.3.1) |

**011 outcome.** Codex implemented per-record quarantine (a bad chat/message is
dropped, survivors kept, original payload backed up; genuinely unparseable
payloads still fail safe). Advisor review + autoreview surfaced one real gap the
initial patch missed: the JSON date **reviver** (`storageService.ts:237-259`)
threw `StorageCorruptionError` *during* `JSON.parse` for a present-but-invalid
date (e.g. `"timestamp":"corrupt"`), which bypassed the new per-record boundary
and still wiped the whole history. Fixed by making the reviver **non-throwing** —
it returns the raw value on an invalid/foreign-typed date (never coercing
`null`→1970) so the per-record loop rejects only that record. Two strict-mode
tests updated (throw now originates in the loop, same reject-not-coerce intent)
and two new default-mode quarantine tests added (invalid-date-string chat and
message). Full suite green (1010 passed), `tsc` clean, lint clean.

### Autoreview — CACHE-01 (FIXED 2026-07-13, released as 4.3.1)

- **CACHE-01 (concurrency, P2 — FIXED).** The corruption patch left `loadChats`
  persisting from the read path (quarantine cleanup and legacy plaintext→
  encrypted migration), i.e. a **non-queued writer** to `CHATS_KEY` that runs
  outside `operationQueue` and can overwrite a concurrent queued `saveChats`
  (lost update). **Root-cause fix (advisor, this session):** `loadChats` no
  longer writes `CHATS_KEY` directly. The only remaining `CHATS_KEY` writer is
  `saveChats()`, always invoked inside `queueOperation()`, so every write is
  serialized. Encryption at rest is preserved WITHOUT reopening the race: when a
  load sees a legacy plaintext payload it rewrites it to an encrypted payload
  *through the mutation queue* (awaited, so a read-only upgrade — open the app,
  never mutate — still migrates), re-reading the latest payload inside the queue
  and skipping the write if a concurrent mutation already encrypted it.
  Mutation-path loads (`getChatsForMutation`) and the migration's own inner load
  pass `scheduleRewrite:false` to avoid a recursive-queue deadlock. Quarantine
  cleanup for an already-encrypted payload is not persisted from the load path
  (it would need a non-queued write); corrupt records are re-quarantined
  idempotently on each load and the original is backed up. Verified: full Jest
  suite green (1010 passed), `tsc` clean, lint clean, two autoreview cycles
  (first surfaced the encryption-at-rest regression of the naive fix; second
  clean, "patch is correct").

### Backlog — vetted, not planned (cycle 3)

- **DEBT-01 (i18n)** promotional key *names* survive (`dnsMagic`,
  `revolutionary`) though their values are now factual; the plainLanguage
  policy only scans string values, not key paths. M effort (rename + all call
  sites) — bundle with the next onboarding-touching change.
- **DEBT-02 (i18n)** soft-promo adjectives outside the banned list
  ("Powerful Features", "Beautiful iOS 26 interface", "Pretty cool, right?").
  Judgment call; S copy-only if pursued.
- **DEBT-03 (i18n)** pt-BR mixes "Ajustes" and "Configurações" for Settings;
  pre-existing, standardize opportunistically.
- **NIT-02 (onboarding)** `markStepCompleted` updates React state only, never
  persisted; likely presentation-only by design — document or fold into the
  snapshot if step-completion should survive reload.

### Rejected / verified-compliant (cycle 3, do not re-audit)

- **A11Y-02** primary compose button contrast: black `#000` on `#007AFF`
  (5.23:1) / `#0A84FF` (5.76:1) MEETS AA. `textOnChroma = #000` is correct — do
  NOT switch the label to white (white-on-#007AFF = 4.02:1, fails).
- **A11Y-03** touch targets: primary button `minHeight: 48` (pass); nodes/chevron are
  non-interactive.
- **A11Y-01** signal-path hero color-only nodes: it is a decorative motif (not
  the live transport-state indicator), hidden from AT and restated by the
  adjacent title/description — the "State Is More Than Color" rule targets real
  success/fallback/failure state, so this is polish, not a defect. Left as-is.
- appAlert / useResolvedColorScheme / OnboardingContext validator / GlassChatList
  keys+stagger: audited clean by the correctness auditor.

---

## Cycle 2 — deep audit 2026-07-10 (planned against commit `2739cf2`)

Deep audit (8 categories, all findings vetted against the live code by the
advisor before planning). Non-interactive run: per the improve skill's
default, plans were written for the top findings by leverage; everything else
is recorded in the backlog below. Executor: codex (batch 005–010), reviewed
in the main session.

### Execution order & status (cycle 2)

| Plan | Title | Priority | Effort | Depends on | Status |
|------|-------|----------|--------|------------|--------|
| 005 | UI error-path hardening (Logs spinner, new-chat guard, mount-load catch, auto-create retry, dismissed-error re-notify, stats reduce) | P1 | S–M | — | DONE (2026-07-10; no new i18n — surfacing reuses ChatContext error→visibleError toast, no local error state; hermetic `__tests__/uiErrorPaths.contract.spec.ts` added; typecheck/lint/react-compiler 101/101 clean, `bun run test` 971 passed / 13 skipped / 984 total) |
| 006 | iOS native timeout budget + native→JS error-classification parity (+ Android empty-label parity) | P1 | M | — | DONE (2026-07-10, Opus executor + main-session completion: executor hit session limit after all code changes; advisor ran final gates and updated the stale `iosDnsResolver.policy.spec.ts` assertion to the new composed message; sync gate + 972 root / 65 module tests green) |
| 007 | Sanitized-label leak: Android error text + Logs-store redaction | P1 | S | 006 (soft — same file region) | DONE (2026-07-10, same run: label removed from Android error text, `registerSensitiveValues` defense-in-depth in dnsLogService + dnsService, redaction regression test added) |
| 008 | Behavioral tests: ChatContext error recovery + UDP anti-spoofing datagram drop | P1 | M | run after 005–007 | DONE (2026-07-10; codex created both specs and correctly STOPped on a failing case; advisor adjudicated: NOT a production bug — the plan's Case B expectation was stale. Since the 4.2.0 coalescing, user+placeholder persist atomically in ONE `appendAndUpdateMessages` call, so a rejection means nothing persisted and reload-only recovery is correct; writing an assistant error would orphan a bubble with no question. Test rewritten to assert the atomic contract; udpDatagram spec 3/3, errorRecovery 3/3, full suite 978 passed) |
| 009 | Deps hygiene: remove react-native-device-info, dns-native @types/react-native, expo-constants override | P2 | S | — | DONE (2026-07-10, main session — codex quota-blocked; note: dns-native `tsc --noEmit` fails pre-existing with 340 jest-globals errors, no tsc gate exists there; expo-constants re-resolve needed `--minimum-release-age=0`) |
| 010 | DX/docs truth: release ledger, CI typecheck, verify:fast, env example, knip.json, dead glass exports | P2 | S–M | — | DONE (2026-07-10, main session; correction: `shouldUseGlassEffect` is NOT dead — used internally + by `__tests__/liquidGlassWrapper.helpers.spec.ts` — kept exported; only LiquidGlassCard/NavBar removed) |

### Backlog — vetted findings NOT planned this cycle (with one-line reason)

- **ARCH-01** Triple-maintained native DNS source (module + committed prebuild
  copies + 3 podspecs; `ios/DNSNative/` copy not even compiled — 0 pbxproj
  refs): M effort, MED risk on the Android compile path; needs a careful
  prebuild-regeneration validation lane — schedule as its own cycle.
- **ARCH-02/03/04/07** God-module splits (dnsService 1798L, dnsLogService 749L
  — redaction-engine extraction is the cheapest first slice, GlassSettings
  1034L, OnboardingScreenLayout): still deferred pending characterization
  tests; plan 008 builds part of that base.
- **ARCH-05** ToastProvider/useToast unification (3 per-screen Toast wirings +
  20 Alert.alert): M, LOW risk — good next-cycle candidate.
- **ARCH-06** `allowExperimentalTransports` flag is 100% rolled out but still
  branches through 3 layers (dead branch dnsService.ts:811; zero UI callers):
  S — bundle with the next settings-touching change (SETTINGS_VERSION bump).
- **ARCH-09** Two parallel DNS-log UIs (Logs.tsx vs DNSLogViewer/DevLogs): S–M,
  needs a product call on keeping the dev route.
- **PERF-01/02** Virtualize chat list + Logs screen (ScrollView `.map` today;
  full re-render per log entry during active queries): M each, MED risk —
  REQUIRES simulator visual verification (stagger animation, Form.Section
  layout); do NOT execute blind. PERF-04 (i18n lookup caching) rides along.
- **TEST-03** Policy-spec → behavioral conversion triage (59 readFileSync
  specs; rule: source-grep only where no runtime harness exists).
- **TEST-04** ClipboardService unit test: opportunistic.
- **CORRECTNESS-08** Android JS socket lingers past outer budget timeout
  (needs AbortSignal plumbing through tryMethod): M, MED risk.
- **CORRECTNESS-09** iOS continuation leak on cancel-during-connect (NWConnection
  handler nil'd before cancel): M, MED risk — pair with a Swift-focused pass.
- **CORRECTNESS-12** Android lacks native queryTXTUDP/TCP (latent interface
  asymmetry, zero runtime impact today).
- **CORRECTNESS-13 (new, found by plan 008)** The `!assistantMessagePersisted`
  → `addMessage` branch in ChatContext's sendMessage catch (~line 392) is
  defensive dead code since the 4.2.0 atomic-coalescing change (both persisted
  flags are set together after the single `appendAndUpdateMessages` write).
  Harmless; remove during the next ChatContext-touching change.
- **DEPS-03** dns-native ESLint 8 EOL → flat-config migration or lint removal.
- **DEPS-04** `react-native-markdown-display` unmaintained (2023) on the
  message-render path — watch item, no action.
- **DX-03** Pre-commit runs the full 964-test suite; narrowing to
  `--findRelatedTests` is an operator decision (trades safety for speed).
- **DIR-01** Chat-history search (README already promises it; zero search UI
  or i18n keys) — design/spike: search over decrypted in-memory chats.
- **DIR-02** Finish "Export Data" (Profile row is a stub Alert; serializeChats
  + Share already exist) — S build once format/PII decisions are made.
- **DIR-03** Custom DNS server entry (validation layer + 6-host allowlist
  exist; picker hardcodes 2; native `supportsCustomServer` still false) —
  M–L design/spike, security-sensitive.

### Vetted and rejected this cycle (do not re-audit)

- SEC-02 web localStorage AES key: by-design, documented in code +
  SECURITY.md/data-inventory (web uses Mock DNS).
- bun audit + dns-native npm audit: clean. CI actions all SHA-pinned.
- react-native-udp / tcp-socket abandonment: refuted (releases 2025-10 /
  2026-01).
- docs/architecture/SYSTEM-ARCHITECTURE.md version claims: accurate (checked).
- CHANGELOG.md currency: accurate.
- Haptics/glass-surface/layering/utils/screens-vs-app split: audited clean.
- Modal-per-row in GlassChatList: already fixed (shared action sheet).

---

## Cycle 1 — iOS 26 redesign + hardening (2026-07-04)

Generated by the improve skill on 2026-07-04, planned against commit `b69b6ab`.
Two execution tracks run in parallel in this worktree:

- **Backend track (`001`–`004`)** → dispatched to **codex** (gpt-5.5 xhigh).
  Services, native module, storage, contexts, tests/CI. No UI files.
- **Frontend track (`hig-01`–`hig-08`)** → executed in the **main Claude
  session**. All visual / expo-router / RN component work, verified on the iOS
  simulator with Argent.

The two tracks are file-disjoint by design (see each plan's Scope) so the diffs
never collide. The one shared-file caution: `src/components/MessageBubble.tsx`
— codex touches ONLY the `useSettings()` context read (plan 003 Step 4); the
main session owns everything visual there.

## Execution order & status

### Backend (codex)

| Plan | Title | Priority | Effort | Depends on | Status |
|------|-------|----------|--------|------------|--------|
| 001 | DNS transport failure-path hardening (timeout budget, UDP Swift cleanup, multipart, TCP framing) | P1 | M | — | TODO |
| 002 | Eliminate chat-history write amplification | P1 | M | — | TODO |
| 003 | Architecture cleanup (dead code, redundant deps, context slicing) | P2 | M | — | TODO |
| 004 | Test coverage + CI/DX hardening (green `test` job, anti-spoof tests, faster loop) | P2 | M | — | TODO |

### Frontend (main session)

| Plan | Title | Priority | Effort | Depends on | Status |
|------|-------|----------|--------|------------|--------|
| hig-01 | Native navigation + large titles + safe-area + status bar | P1 | L | — | TODO |
| hig-02 | Dynamic Type scaling (relative line height, maxFontSizeMultiplier) | P1 | M | hig-01 | TODO |
| hig-03 | Accessibility semantics (header roles, list role, decorative image) | P1 | S | hig-01 | TODO |
| hig-04 | Color contrast (textTertiary, badges, inline code) | P1 | S–M | — | TODO |
| hig-05 | Sheets & modals (detents/grabber, stacked-modal, close target) | P2 | M–L | — | TODO |
| hig-06 | Feedback patterns (success toast not Alert, real pull-to-refresh) | P1 | S | — | TODO |
| hig-07 | SF Symbols iconography (replace text glyphs) | P1 | M | — | TODO |
| hig-08 | Onboarding (≤3 pages, touch targets, reduce-motion) | P2 | M | — | TODO |

Status values: TODO | IN PROGRESS | DONE | BLOCKED (reason) | REJECTED (rationale)

## Execution outcome — 2026-07-04 (shipped as 4.2.0 / build 73)

**Backend track `001`–`004`: DONE.** Implemented by a dispatched `codex`
(gpt-5.5) run and reviewed like a tech-lead in the main session. The codex
process exited non-cleanly (websocket reset near the end; empty
`--output-last-message`), but the working tree it left was type-complete and
coherent. Verdict: **approved**. Every plan's intent landed with tests:
wall-clock budget (001 BUG-01), UDP `defer` teardown parity (001 BUG-02),
mixed plain/multipart rejection (001 BUG-03), TCP `prefixConsumed` + `<12`
frame reject (001 BUG-04), storage `appendAndUpdateMessages` coalescing (002),
dead-module removal + `uuid`→`expo-crypto` (003), and Expo SDK 57 patch
alignment → `expo-doctor` 19/19 (004). Two review misses were reconciled in the
main session: the orphaned `doctor.config.json` exemption for the deleted
`LiquidGlassTextInput.tsx`, and the second `DNSResolver.swift` copy under
`ios/DNSNative/` that the sync gate requires to match the module copy.

**Frontend track:**

| Plan | Status |
|------|--------|
| hig-03 Accessibility semantics | DONE (header roles, decorative About logo, log status hidden) |
| hig-04 Color contrast | DONE (tertiary→secondary where meaningful, accent-locked "Latest" badge) |
| hig-06 Feedback patterns | DONE (success toast replaces blocking Alerts, real pull-to-refresh) |
| hig-07 SF Symbols iconography | DONE (`ChevronIcon`/`CheckmarkIcon`/`CloseIcon` replace text glyphs) |
| hig-05 Sheets & modals | PARTIAL (44pt close target + header role DONE; detents/grabber deferred — build-47 regression risk) |
| hig-01 Native large titles | DEFERRED — L-effort navigation change; needs on-device visual verification, which the Argent screenshot backend is currently unreliable for in this SDK 57 lane. Do not ship blind. |
| hig-02 Dynamic Type scaling | DEFERRED — depends on hig-01's native header; the fake in-scroll title makes relative line-height work premature. |
| hig-08 Onboarding | DEFERRED — page-count consolidation is a product decision; touch-target/reduce-motion fixes bundled into a follow-up. |

Also shipped beyond the plans: flat iMessage bubbles (drop shadows removed,
MessageBubble), send-button spinner (ChatInput), and the tab-label accent-tint
restore (removed the unconditional gray `labelStyle`).

## Recommended sequencing

- **codex** runs 001→002→003→004 as one dispatched batch (they are
  independent; ordering is by leverage). 001 and 002 are the P1 correctness/perf
  wins; 003/004 are cleanup + CI green.
- **main session** runs hig-06, hig-04 first (low-risk, high polish), then
  hig-07, then hig-01 (native nav — unblocks hig-02 safe-area and hig-03
  headers), then hig-02, hig-03, hig-08, and hig-05 last (highest regression
  risk — `GlassBottomSheet` header documents the build-47 startup crash on the
  prior native-sheet attempt).

## Dependency notes

- hig-02 and hig-03 depend on hig-01: once tab screens get a native header,
  the safe-area top inset and header-role semantics are provided natively rather
  than via the in-scroll fake title.
- 004 Step 1 (expo-doctor alignment) and 003 Step 2 (remove `react-native-uuid`)
  both touch `package.json`/`bun.lock`; codex runs them in one worktree so the
  lockfile is reconciled once. Keep `"lockfileVersion": 1` (CI pins bun 1.3.9).

## Findings considered and deferred (not rejected — scoped out on purpose)

- **God-module splits** (`dnsService.ts` ~1744 lines → `Transport` interface;
  `dnsLogService.ts` responsibilities; `GlassSettings.tsx` ~1031 lines;
  `OnboardingScreenLayout`): high blast radius, need characterization tests
  first, and several files are actively edited by the redesign. Deferred to
  follow-up plans after this release lands. (ARCH-01/02/03/06/07)
- **Per-chat / append-log / MMKV storage**: the O(1)-per-mutation redesign;
  plan 002 does the safe format-preserving coalescing instead. (PERF-01 tail)
- **JS dgram UDP source-address validation for hostname resolvers** (SEC-01):
  residual, well-mitigated (secure random IDs, source-port + question echo,
  native path already validates). Needs a resolve step + anycast/multi-A
  analysis; deferred to avoid rejecting legitimate responses. Documented in
  plan 001 Maintenance.
- **Meta/policy test conversion** and **watch/coverage scripts**: deferred in
  plan 004 Maintenance.

## Findings verified and rejected as non-issues (by the auditors)

- Markdown render path is safe (`externalLinks.ts` allowlists only
  `https:`/`mailto:`, images disabled).
- Prompt/response content is SHA-256-redacted before any log persistence; no PII
  in logs.
- `GlassTabBar` deletion candidate: already deleted; not a finding.
- `android` CI job's Java compile error at `DNSResolver.java:825`: already fixed
  in commit `6b007a1`; do not re-fix.
