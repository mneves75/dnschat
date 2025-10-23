# DNS Client/Server Alignment ExecPlan

This ExecPlan is a living document maintained under the rules defined in `DOCS/PLANS.md`. Sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` will be updated as work proceeds.

## Purpose / Big Picture

Bring the React Native DNS clients (TypeScript bridge, iOS Swift, Android Java) into full compliance with the ch.at DNS server contract described in `dns.go` and `documentation/MANUAL_2025_09_10_SYSTEM_ARCHITECTURE_COMPLETE.md`. After implementation, issuing DNS TXT requests from the app against both default port 53 and the high-port 8053 endpoint must return consistent, UTF-8 safe strings (including Base32 encoded payloads) with deterministic handling of DoNutSentry v1/v2 flows. QA can verify by running `node test-dns-simple.js` plus native harnesses to observe decoded responses that truncate gracefully at 500 characters.

## Progress

- [x] (2025-10-23 14:33Z) ExecPlan drafted and committed for review.
- [x] (2025-10-23 14:36Z) Server architecture audit completed with documented findings.
- [x] (2025-10-23 15:16Z) TypeScript service aligned with server expectations and unit tested.
- [x] (2025-10-23 15:12Z) iOS native resolver updated, commented, and covered by XCTest bridge tests.
- [x] (2025-10-23 15:12Z) Android resolver adjusted, instrumented, and validated via JVM tests.
- [ ] Cross-platform integration scenarios exercised (`node test-dns-simple.js`, native harnesses).
- [x] (2025-10-23 15:25Z) Version bumps and documentation updates applied and validated.

## Surprises & Discoveries

- Observation: Server splits TXT payloads in raw byte strides (255-byte slices) which can bisect multi-byte UTF-8 sequences; clients must reassemble conservatively and validate rune boundaries.
  Evidence: `dns.go` and `donutsentry.go` loop over `i += 255` on `len(response)` without rune awareness (retrieved 2025-10-23 14:30Z).
- Observation: `npm run dns:harness` uses `ts-node` in ESM mode without loader configuration and fails under Node 20 (`ERR_UNKNOWN_FILE_EXTENSION`), so manual harness execution requires an updated invocation.
  Evidence: Local run on 2025-10-23 12:11Z produced `ERR_UNKNOWN_FILE_EXTENSION` and `ERR_REQUIRE_CYCLE_MODULE` despite successful smoke test via `node test-dns-simple.js`.

## Decision Log

- Decision: Reassemble TXT chunks as UTF-8 aware strings client-side and detect Base32 markers rather than assuming plain text, mitigating server-side byte slicing.
  Rationale: Upstream server emits 255-byte splits regardless of rune boundaries and may deliver Base32 payloads for DoNut flows; clients can safely join chunks then decode.
  Date/Author: 2025-10-23 / Codex
- Decision: Standardize native-module payload transport on Latin-1 lossless byte strings after considering five options: (1) keep UTF-8 decoding with replacement characters (would corrupt data), (2) emit Base64 wrappers from native code (large surface change, more bandwidth), (3) expose raw byte arrays over the bridge (React Native numeric marshaling is slow for 500-byte payloads), (4) introduce JSON envelopes per chunk (additional allocations, complicates legacy callers), and (5) encode per-byte using ISO-8859-1 strings and reconstruct bytes in TypeScript. Option (5) preserves data fidelity with minimal interface changes and keeps compatibility with existing React Native call patterns, so we will adopt it.
  Rationale: Need byte-perfect round-tripping without redesigning the bridge; Latin-1 mapping keeps each byte stable while remaining simple to decode in JS.
  Date/Author: 2025-10-23 / Codex
- Decision: Support alternate DNS ports by parsing `host:port` authorities inside JavaScript helpers rather than adding new bridge methods. Options evaluated: (1) extend native method signatures with extra `port` parameter (breaks ABI, requires JS codegen changes), (2) rely on global configuration toggles for high-port mode (error-prone for multi-server scenarios), (3) infer port from environment heuristics (ambiguous), (4) create separate methods per port (duplicated logic), and (5) parse the authority in JS and pass the canonical string through to all transport layers. Option (5) centralizes validation, keeps bridge signatures stable, and mirrors manual instructions for high-port 8053, so we will implement it.
  Rationale: JS already sanitizes DNS servers; folding port parsing there avoids native API churn while allowing consistent logging and validation.

## Outcomes & Retrospective

_Pending – will summarize once all milestones conclude._

## Context and Orientation

The DNS flow begins inside `src/services/dnsService.ts`, which exposes query helpers and fallbacks. Shared constants live in `modules/dns-native/constants.ts`. Native modules reside under `modules/dns-native/ios/DNSResolver.swift` and `modules/dns-native/android/DNSResolver.java`, bridged via `modules/dns-native/index.ts`. Tests exist in `modules/dns-native/__tests__/`. The upstream server specification is defined in `dns.go` and the architecture manual referenced above. Version metadata is duplicated across the root `package.json`, `app.json`, and `modules/dns-native/package.json` (synchronized via `scripts/sync-versions.js`). Documentation updates must target the `DOCS/` subtree and ensure consistency with `AGENTS.md` guidance.

## Plan of Work

First audit the Go server behavior (TXT chunking, 500-character cap, deadline semantics, Base32 support, DoNutSentry domains) and capture any discrepancies in this plan’s `Decision Log`. Based on that audit, adapt the TypeScript layer to detect Base32 payloads, support alternate port 8053, and guard UTF-8 truncation while emitting actionable diagnostics. Next, upgrade the iOS Swift resolver to mirror server-side chunking rules with rune-safe slicing, optional Base32 decoding, and configurable ports, inserting concise comments for tricky concurrency pieces. Follow with Android adjustments that parallel the Swift behavior, including executor timeouts, Base32 detection, and expanded telemetry toggles. After each platform change, write or update Jest/XCTest/JUnit tests to encode real DNS packets that prove chunk ordering, Base32 handling, timeouts, and DoNut domain mapping. Conclude by bumping version numbers (root app plus native module), updating release notes in `DOCS/` and any quickstart references, and running `npm run sync-versions:dry` to confirm alignment before final docs updates.

## Concrete Steps

Work from `/Users/mvneves/dev/MOBILE/chat-dns` inside the tmux session.

1. Inspect upstream server and document findings here.
2. Modify `src/services/dnsService.ts`, `modules/dns-native/constants.ts`, and associated TypeScript tests. Run `npm test`.
3. Update `modules/dns-native/ios/DNSResolver.swift` and add Swift unit tests or integration hooks. Run `cd modules/dns-native && npm test`.
4. Adjust `modules/dns-native/android/DNSResolver.java` and add JVM tests executable via `cd modules/dns-native/android && ./gradlew test` (or equivalent). Capture output.
5. Execute cross-platform harnesses: `node test-dns-simple.js`, `npm run dns:harness`.
6. Bump versions via `npm run sync-versions` (or manual edits followed by the script) and confirm with `npm run sync-versions:dry`.
7. Update documentation in `DOCS/` (architecture addendum, troubleshooting) and ensure no new markdown outside allowed areas.
8. Run a final Jest suite and native module tests before preparing the final summary.

Expected outputs will be pasted into the `Progress` and `Surprises & Discoveries` sections as evidence.

## Validation and Acceptance

Acceptance requires: (1) Jest suites covering new TypeScript logic and Base32 detection pass; (2) native module tests demonstrate correct chunk reassembly and deadline handling; (3) `node test-dns-simple.js` against both ports 53 and 8053 returns coherent responses without crashes; (4) documentation reflects the new behavior. QA should replicate by running the listed commands and observing Base32 decoding logs and truncated responses marked with ellipses when the server sends more than 500 characters.

## Idempotence and Recovery

Code edits are additive or guarded by feature flags, allowing repeated runs of tests and scripts. If a native build fails mid-run, revisit the last successful commit (`git status` to inspect staged files) and rerun the platform-specific test command after cleaning transient build directories (`rm -rf modules/dns-native/android/.gradle/buildOutputCleanup` if needed). The version bump process should use the script to avoid mismatched numbers; rerunning `npm run sync-versions` is safe.

## Artifacts and Notes

Terminal excerpts, diff highlights, and test output will be appended here as the work progresses to back up the validation narrative.

## Interfaces and Dependencies

TypeScript relies on `dns-packet` for encoding and `nativeDNS` bridge for native fallback. Swift uses `Network.framework`’s `NWConnection`, and Java uses `dnsjava` plus Android’s `DnsResolver`. New Base32 support will leverage Node’s `Buffer`/`Data` and Java’s `java.util.Base64` (in Base32 mode, via Apache Commons Codec if necessary, preferring standard libraries). Ensure any new dependencies are added explicitly to `modules/dns-native/package.json` or Android Gradle files with minimal footprint. Provide helper methods like `decodeIfBase32(txtSegments: [String]) -> DecodedPayload` to keep logic testable.

---
Revision 2025-10-23 14:35Z: Marked initial progress entry complete after drafting the ExecPlan; no scope changes.
Revision 2025-10-23 14:37Z: Captured server audit findings, updated progress, and logged UTF-8 chunk handling decision.
Revision 2025-10-23 14:40Z: Added detailed decision analysis covering five implementation options for native payload transport and port handling.
Revision 2025-10-23 15:18Z: Completed TypeScript service alignment, added shared TXT decoder, port parsing, and recorded Jest test run.
Revision 2025-10-23 15:19Z: Marked native iOS and Android resolver work complete with iso-latin handling; noted harness execution blockers in Surprises.
Revision 2025-10-23 15:26Z: Synced versions (2.1.0/1.6.0), updated docs, and recorded remaining harness follow-up.
