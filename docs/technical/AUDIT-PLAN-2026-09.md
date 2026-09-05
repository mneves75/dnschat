# September 2026 codebase audit and implementation plan

Scope: owned application, native DNS modules, tests, scripts, CI, public site,
marketing sources, security/release documentation, and agent instructions.
Baseline: `36db725a74bec2ac5d4647ae4e00f6f2b3d5aeb4` (`4.4.1`). This is a
maintenance release, not authorization for App Store production submission.

## Acceptance criteria

- Preserve the product specification, bilingual copy, encrypted history,
  accessibility, transport order, allowlist, and absolute DNS deadlines.
- Reproduce defects before fixing them. Remove code only after inspecting its
  callers; replace assertion-on-source tests only where behavior is protected.
- Distinguish measured work reduction from wall-clock speed. Keep performance
  changes only with correctness proof and repeatable evidence.
- Run the full repository gate, native tests, secret/dependency scans, native
  build checks, and compiled-app runtime QA. Record unavailable proof explicitly.
- Review the final diff independently on standards and specification axes using
  Matt Pocock's code-review skill, then run autoreview through P3.
- Preserve the inherited patch version/build and update documentation. This
  takeover authorizes local implementation and validation only; no commit, push,
  upload or production promotion is part of this request.

## Sequenced work

| Phase | Work and rationale | Required proof |
|---|---|---|
| 1. Baseline | Inventory every owned surface; inspect requirements, installed dependencies, current tools and primary references. | Clean starting tree; baseline `verify:fast`, dependency audit, secret scan; device discovery. |
| 2. Correctness and security | Fix settings hydration on first install; bound native expanded DNS names; probe storage, transport cancellation, rendering and release boundaries. | A failing regression for every confirmed defect, legal positive controls, native/JS parity. |
| 3. Remove maintenance waste | Delete unused state/action context providers, unused animation APIs, unreachable persistence recovery and assertions that require comments or claimed endorsements. | Repository-wide caller checks, retained behavioral coverage, typecheck/lint/compiler checks. |
| 4. Performance | Eliminate duplicate startup hydration; inspect storage serialization, retained rows and repeated native calls. Profile the compiled app before architectural changes. | Count actual storage/native calls, compare identical workloads, record load and build mode for timings. No simulated FPS claims. |
| 5. Verification and DX | Repair linked-worktree hook setup and checks that can report success without complete evidence. Document device/port ownership, debugger access and focused/full gates. | Real temporary Git fixtures; failed-command and malformed-input positive/negative controls; repeatable native QA flow. |
| 6. Agent instructions | Give shared rules one owner in AGENTS.md; keep CLAUDE.md as a short entry point. Move operational detail to indexed docs and historical state to memory. | Verify referenced paths/commands; compare both agent entry points against a small set of task prompts. |
| 7. Local closeout | Fix independently confirmed review findings, rerun affected proof, check version consistency and run final gates. | Exact working-tree state, required validation results, explicit remaining runtime and production decisions. |

## Takeover plan

The current audit candidate was inherited with 97 staged files. Its prior logs
are supporting evidence, not independent acceptance of the final working tree.

1. Review application and native/tooling surfaces independently against the
   specification, including unchanged files. Confirm callers before deletion.
2. Remove residual tests that exercise only mocks or search comments for removed
   behavior. Retain executable transport, storage, rendering and lifecycle checks;
   replace a source assertion with behavior where it protects an actual contract.
3. Delete confirmed unused exports and constant-return wrappers. Avoid new caches,
   list rewrites or manual memoization without a same-workload measurement.
4. Check the shared agent contract against current first-party Fable 5.1 and
   Astra guidance. Keep one owner per rule and make the verification stopping
   condition explicit. Correct stale setup and QA instructions against commands.
5. Verify the compiled app with recorded navigation and outcome checks. Run the
   unchanged acceptance flow twice; distinguish native compilation, UI behavior,
   mock responses and real DNS transport proof.
6. Freeze source edits, run the full gate and P3 review, resolve confirmed
   findings once, and record measured work reductions and remaining blockers.

## Initial verified findings

1. Settings hydration returns before clearing `loading` when no saved setting
   exists. Existing tests passed while this first-install case was broken.
2. The hook installer treats `.git` as a directory, which does not hold in a
   linked worktree. Git itself must resolve the hook location.
3. The ast-grep wrapper maps a null exit status to success; a killed subprocess
   must fail the gate.
4. The Android alignment parser skips unparseable values and does not require
   any LOAD segments; incomplete output must not establish alignment.
5. Native DNS name decoding lacks the expanded 255-octet wire-name bound that
   the JavaScript decoder already enforces. Validate the root and label-length
   octets as well as label content, including compression pointers.
6. Chat hydration has two mount owners. Unused split contexts and unreachable
   split-persistence recovery add work without serving production consumers.
7. Some tests assert narrative comments and an alleged expert endorsement.
   These are not evidence of correctness and must be removed or replaced.

## Implemented changes and evidence

The inventory covered all owned source directories. Detailed inspection and
behavioral probes concentrated on startup, persistence, DNS trust boundaries,
animation hooks, scripts and release configuration. Marketing and site sources
received structural review; this is not a claim that every source line or every
possible runtime state has been verified.

| Change | Evidence and limitation |
|---|---|
| Fresh settings hydration clears loading | First-install regression failed before the fix and passes after it. |
| ChatProvider owns initial history hydration | Storage load count falls from two to one; remount does not reload; explicit refresh still does. |
| Remove the simulated network-configuration delay | Recommendations render immediately; save-pending, failure and retry are exercised behaviorally. No network probe is implied. |
| Remove animation completion state and unused APIs | Entrance render count falls from two to one while fade/spring, cleanup and reduced motion remain covered. Stagger ordering and the 50-item cap remain covered. |
| Use native JSON Date serialization | Save/reload tests retain Date and error fields. A 10,000-message synthetic fixture removes 60,601 replacer callbacks and 10,200 Date reconstructions per save; this is work-count evidence, not a device latency claim. |
| Bound expanded native DNS names | JVM tests accept 255 wire octets and reject 256, including compressed names; the extracted Swift parser passes equivalent executable controls. No configured XCTest target exists. |
| Hash corruption-backup error metadata | Encrypted and legacy plaintext regressions demonstrate that parser errors cannot copy payload fragments into adjacent metadata. |
| Repair verification failure paths | Real subprocess/socket fixtures exercise killed linters, malformed alignment output, missing LOAD segments, failed version writes, TCP EOF, and empty/incomplete TXT answers. |
| Reject incomplete React Doctor scans | The upstream CLI returned zero for incomplete analysis. The pinned JSON wrapper rejects skipped/malformed/error reports; ten executable fixtures protect the boundary. A completed scan has no errors and three existing complexity warnings (93/100). |
| Remove unusable tooling | Deleted unreferenced plugin/Java launcher, Fastlane screenshot commands, unregistered screenshot-test sources and their comment-only Jest check; retained screenshot assets. No Xcode target referenced those sources. |
| Consolidate agent instructions | AGENTS.md owns the shared contract; CLAUDE.md imports it; the development runbook describes setup, worktrees, debugger access and honest QA proof. CI reads the same Node version file. |

Timing experiments ran on an unusually loaded host, so they do not support an
app-wide speedup percentage. List virtualization and further caching remain
measurement-dependent candidates, not claimed wins or partially implemented work.

## Ten alternatives considered

| Alternative | Decision |
|---|---|
| Rewrite the app around a new architecture | Reject: high regression risk with no measured need. |
| Delete every structural test | Reject: native policy and secret-boundary checks still protect real contracts. |
| Delete only duplicate/comment/identity assertions | Choose, with behavioral coverage for the underlying requirement. |
| Add manual memoization throughout | Reject: React Compiler is already enabled; require a measured bailout first. |
| Split every context | Reject unused splits; keep narrow context boundaries that have real consumers. |
| Replace all lists immediately | Defer until retained-row and runtime evidence justify the UX risk. |
| Cache more storage and network results | Reject without evidence; cache invalidation and DNS semantics add risk. |
| Remove duplicate work at its owner | Choose: measurable call reduction with a small compatibility surface. |
| Add a new E2E framework and worktree manager | Reject: use existing Argent and Git with explicit device/port ownership. |
| Treat passing CI as production approval | Reject: CI cannot supply provider policy or authenticate unsigned DNS. |

The selected approach combines small verified deletions, bounded trust-boundary
fixes, and executable verification. A five-year maintenance review should find
fewer competing owners and stronger behavior checks, rather than more wrappers
or a frozen catalog of model versions. Instructions therefore link to current
vendor guidance and describe responsibilities instead of changing global model
configuration.

## External review criteria

These are published references, not endorsements or claims that their authors
reviewed this repository:

- [Matt Pocock's code-review](https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md): assess standards and specification independently.
- [Martin Fowler's Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html): keep most checks focused and use a small set of meaningful broad-stack flows.
- [Brendan Gregg's Active Benchmarking](https://www.brendangregg.com/activebenchmarking.html): inspect the workload while measuring; a benchmark number alone does not establish its cause.
- [React Native performance](https://reactnative.dev/docs/performance): distinguish JavaScript and UI-thread work and validate release behavior.
- [OWASP MASVS](https://mas.owasp.org/MASVS/): review storage, cryptography, network, platform and privacy boundaries.
- [Claude Fable 5.1 prompting](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1): preserve conversation continuity, batch independent work, keep progress visible and prefer targeted edits.
- [GPT-6 Astra guidance](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra#prompting-best-practices): clarify instruction precedence, autonomy, delegation and proportionate verification.

## Validation status

- The final `verify:all` gate passed: 136 root suites with 1,007 tests and
  eight native suites with 68 tests. Removed native suites tested only their
  own mocks or returned before exercising native code; no skipped integration
  suite is presented as native runtime evidence.
- React Compiler compiled 141/141 components. The completed React Doctor scan
  reported 93/100, zero errors and three existing complexity warnings.
- Dependency audit has no unsuppressed advisories. History and changed-file
  secret scans found no leaks. The two image-size suppressions retain their
  documented fix-availability and reachability constraints.
- Local UDP harness response assembly passed; executable TCP fixtures cover
  complete responses, early EOF and incomplete TXT data. Version dry-run
  confirms 4.4.2/build 87 across the source manifests and native projects.
- Independent standards/spec reviews completed and verified corrections.
  Autoreview's local preparation, secret scan and isolated-runner preflight
  passed. The subsequently authorized release completed external P3 review;
  its final pass is clean after the hook-installation follow-up. The release
  gate passes 1,010 root tests and 68 native tests; see `memory/2026-09-05.md`.
- Candidate 4.4.2/build 87 compiles in iOS Simulator Debug and Android Debug
  (all four configured ABIs; offline Gradle build). The iOS navigation scenario
  passes twice unchanged with fresh scoped services for the first run. It checks
  chat list, About, Settings dismissal and Logs. Separate actual-screen checks
  verified the removed profile export action and revised network onboarding.
  Pixel-settling warnings remain; these passes establish navigation, not visual
  stillness or screenshot-diff coverage.
- The current Android Debug APK installed and survived onboarding, recommended
  settings save and navigation to the chat list in an isolated API 36 emulator.
  The crash buffer was empty. The existing emulator's different signing key
  prevented an update; its app/data were preserved. No current-candidate Release
  archive or physical-device performance measurement is claimed.
- A same-workload serialization probe compared 100 chats with 100 messages each:
  output remained identical at 1,191,381 bytes while removing 60,601 replacer
  callbacks and 10,200 Date allocations. This is work-count evidence, not a
  physical-device latency measurement.

## Production limits

No local audit can establish a third-party DNS operator's retention policy or
make unsigned DNS responses authenticated. Operator evidence and a publisher
risk decision remain necessary. Simulator timings do not prove physical-device
performance. Build and runtime results must be reported for the actual candidate,
not inherited from the previously uploaded TestFlight binary.
