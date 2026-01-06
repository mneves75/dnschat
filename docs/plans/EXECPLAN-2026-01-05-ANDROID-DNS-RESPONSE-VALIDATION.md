# DNSChat Engineering ExecPlan: Android DNS Response Validation Hardening (2026-01-05)

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.

PLANS.md is not present in this repository. This document is therefore the sole execution plan for this work and must remain self-contained.

## Purpose / Big Picture

Harden the Android raw UDP DNS resolver so it validates response integrity (transaction ID, header flags, and question count) and uses a cryptographically secure transaction ID generator. Align parsing rules with DNS protocol specifications and modern best practices to reduce spoofing risk, while keeping behavior consistent with existing fallback chains (UDP -> DoH -> legacy). Deliver a documented, test-backed change that can be audited by a security reviewer.

## Goal and Non-Goals

Goals:
- Validate DNS response transaction IDs against the issued query ID.
- Enforce DNS header sanity checks (QR/RCODE/TC and QDCOUNT) for UDP responses.
- Use SecureRandom for transaction ID generation on Android.
- Keep Android copies in android/app and modules/dns-native in strict parity.
- Add/adjust unit tests to cover the new validation behavior.

Non-goals:
- Changing transport fallback order or adding new transports.
- Adding DNSSEC validation (out of scope for this patch).
- Modifying iOS or TypeScript UDP implementations beyond documenting parity.

## Current State

Android raw UDP DNS queries are built with a Math.random transaction ID and responses are parsed without checking the response ID or header flags. The parse routine jumps to the answer count and does not validate QR, RCODE, or TC. TypeScript (react-native-udp) already validates IDs and RCODE, so Android native is lagging on security checks.

## Proposed Approach (Options + Tradeoffs)

Option A: Minimal fix (transaction ID validation only). Lower change risk but leaves header flag validation and weak RNG.

Option B: Comprehensive response validation + SecureRandom (chosen). Slightly larger change, but aligns with RFC 1035 header semantics, RFC 5452 spoofing countermeasures, and RFC 9619 QDCOUNT guidance. Still contained to the Android raw UDP path and preserves fallback behavior.

## Architecture / Data Flow Changes

No architecture changes. Only the Android UDP query/parse path is hardened:
- buildDnsQuery returns both query bytes and transaction ID.
- queryTXTRawUDP validates response source, ID, flags, and question count before parsing.
- parseDnsTxtResponse receives expected ID and header context.

## Phased Plan With Milestones (Multi-Phase Todo)

Phase 0 (Discovery & alignment)
- Review Android DNSResolver raw UDP path and identify gaps vs. RFC 1035/5452/9619.
- Compare with TypeScript UDP behavior in src/services/dnsService.ts.
Success: documented gaps and planned checks.

Phase 1 (Design)
- Define validation rules: transaction ID match, QR=1, opcode=0, rcode=0, TC=0, QDCOUNT=1, response source address/port match.
- Define error handling: raise QUERY_FAILED to trigger fallback.
Success: concise decision log and error semantics.

Phase 2 (Implementation)
- Introduce SecureRandom transaction ID generation.
- Update buildDnsQuery to return a tuple (bytes + ID).
- Update parseDnsTxtResponse to accept expected ID and validate header.
- Update queryTXTRawUDP to check response source and pass expected ID.
- Mirror identical changes in modules/dns-native/android/DNSResolver.java.
Success: changes compile and preserve existing flow.

Phase 3 (Tests)
- Add unit tests to validate transaction ID mismatch is rejected.
- Add unit tests to validate matching ID and minimal header parses successfully.
Success: tests run and pass.

Phase 4 (Verification & Documentation)
- Run the targeted test suite for Android unit tests.
- Update this ExecPlan Progress + Outcomes with evidence.
Success: verification artifacts recorded.

## Testing Strategy

Primary: Android unit tests in android/app/src/test (gradle testDebugUnitTest).
Secondary: Manual review of modules/dns-native mirror for parity.

## Observability

No new runtime logging besides existing error propagation; errors will surface as DNSError with QUERY_FAILED.

## Rollout Plan + Rollback Plan

Rollout: ship as part of the next patch release, noting security hardening in changelog if required.
Rollback: revert DNSResolver changes in both Android paths and remove tests added in this plan.

## Risks and Mitigations

Risk: Overly strict validation could reject legitimate responses (e.g., unexpected QDCOUNT). Mitigation: limit checks to RFC requirements for standard queries and align with RFC 9619. The fallback chain (DoH/legacy) provides resilience.

Risk: SecureRandom blocking or failure. Mitigation: SecureRandom is standard on Android; we avoid custom seeding and rely on platform entropy sources.

## Open Questions

None blocking.

## Progress

- [x] (2026-01-05 19:25Z) Reviewed Android DNSResolver UDP path and compared with TypeScript validation behavior.
- [x] (2026-01-05 20:05Z) Finalized validation rules and error handling.
- [x] (2026-01-05 20:10Z) Implemented SecureRandom ID generation + response validation in both Android DNSResolver copies.
- [x] (2026-01-05 20:16Z) Added/updated unit tests for transaction ID validation.
- [x] (2026-01-05 20:21Z) Ran Android unit tests and recorded results.
- [x] (2026-01-05 20:22Z) Updated Outcomes & Retrospective with verification evidence.

## Surprises & Discoveries

- Gradle warns about missing sdk.dir in local.properties; tests still pass on this machine.
- NODE_ENV warning for Expo config resolved by setting a default in root Gradle config.

## Decision Log

- Decision: Choose comprehensive validation + SecureRandom (Option B). Rationale: Aligns with RFC 1035/5452/9619 and avoids known spoofing weaknesses.

## Outcomes & Retrospective

Android UDP DNS response validation now enforces transaction ID matching, header sanity checks, and SecureRandom ID generation. Unit tests cover the mismatch and success paths, and the changes are mirrored in the prebuild DNSResolver copy. Gradle unit tests completed successfully; only sdk.dir warnings remain on this machine.

## Context and Orientation

Relevant files:
- android/app/src/main/java/com/dnsnative/DNSResolver.java
- modules/dns-native/android/DNSResolver.java
- android/app/src/test/java/com/dnsnative/DNSResolverTest.java
- src/services/dnsService.ts (reference behavior)

## Validation and Acceptance

Acceptance requires:
- Transaction ID validation in Android raw UDP parser.
- SecureRandom ID generation in Android query builder.
- Header sanity checks and QDCOUNT validation.
- Unit tests covering ID mismatch + valid response path.
- Recorded verification results in this ExecPlan.

## Artifacts and Notes

Verification outputs (2026-01-05):

    cd android && GRADLE_USER_HOME=$PWD/.gradle-cache ./gradlew --no-daemon -Dorg.gradle.java.installations.auto-download=false -Dorg.gradle.java.installations.auto-detect=false -Dorg.gradle.java.installations.paths=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home :app:testDebugUnitTest
    Result: BUILD SUCCESSFUL (5 tests)
    Notes: Warning about missing sdk.dir; NODE_ENV warning resolved.

    node scripts/verify-dnsresolver-sync.js
    Result: DNSResolver.java copies are in sync.
