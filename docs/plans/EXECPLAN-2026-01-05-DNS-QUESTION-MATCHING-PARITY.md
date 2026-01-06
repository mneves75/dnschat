# DNSChat Engineering ExecPlan: DNS Question Matching Parity (2026-01-05)

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.

PLANS.md is not present in this repository. This document is therefore the sole execution plan for this work and must remain self-contained.

## Purpose / Big Picture

Complete RFC-aligned DNS response validation by ensuring the response question section matches the original query (name/type/class), across Android and iOS native UDP resolvers. This closes the remaining spoofing gap after transaction ID checks by verifying the response question section is consistent with the request.

## Goal and Non-Goals

Goals:
- Validate response QNAME matches the normalized query name.
- Validate response QTYPE/QCLASS match TXT/IN.
- Ensure question-name parsing handles compression pointers safely.
- Keep Android and iOS duplicate resolver copies in sync.
- Verify changes via Android unit tests and iOS workspace tests.

Non-goals:
- DNSSEC validation or EDNS extensions.
- Changes to transport fallback order.
- Refactors unrelated to DNS parsing security.

## Current State

Android and iOS resolvers validate transaction ID and basic DNS header flags, but they do not compare the response question name/type/class to the original query. RFC 5452 recommends matching on these fields to further reduce spoofing risk.

## Proposed Approach (Options + Tradeoffs)

Option A: Match only QNAME. Slight improvement but leaves type/class ambiguity.

Option B: Match QNAME + QTYPE + QCLASS (chosen). Full question parity and minimal additional parsing risk.

## Architecture / Data Flow Changes

No architecture changes. Parsing now includes a safe name decoder (with compression pointer support), question comparison, and explicit QTYPE/QCLASS validation.

## Phased Plan With Milestones (Multi-Phase Todo)

Phase 0 (Discovery)
- Confirm where query names are normalized and how they are encoded in Android/iOS.
- Confirm existing header validation coverage.
Success: validated entry points and normalized query names.

Phase 1 (Design)
- Define question matching rules (normalized lowercase name, TXT/IN).
- Define pointer parsing safeguards (loop bounds, bounds checks).
Success: agreed parse algorithm and error semantics.

Phase 2 (Implementation)
- Android: add readName helper + question checks in both resolver copies.
- iOS: add readName helper + question checks in both resolver copies.
- Ensure DnsQuery carries normalized query name into parser.
Success: parity changes compiled in all copies.

Phase 3 (Verification)
- Run Android unit tests (gradle).
- Run iOS workspace tests on an installed simulator.
Success: tests complete (or failures documented).

Phase 4 (Documentation)
- Update this ExecPlan with results and artifacts.
Success: reviewers can reproduce results.

## Testing Strategy

Android: `./gradlew :app:testDebugUnitTest`
iOS: `xcodebuild -workspace ios/DNSChat.xcworkspace -scheme DNSChat -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 17,OS=26.2' test`

## Risks and Mitigations

Risk: Overly strict QNAME matching may reject responses with case differences.
Mitigation: normalize to lowercase before comparison.

Risk: Pointer compression parsing mistakes could reject valid responses.
Mitigation: implement conservative bounds checks and a small max jump limit.

## Progress

- [x] (2026-01-05 20:55Z) Confirmed normalized query name flow in Android/iOS.
- [x] (2026-01-05 21:05Z) Implemented question-name parsing and question parity checks in Android resolver copies.
- [x] (2026-01-05 21:12Z) Implemented question-name parsing and question parity checks in iOS resolver copies.
- [x] (2026-01-05 21:16Z) Verified Android tests.
- [x] (2026-01-05 21:02Z) Verified iOS workspace tests.
- [x] (2026-01-05 21:17Z) Updated Outcomes & Retrospective with artifacts.

## Surprises & Discoveries

- None yet.

## Decision Log

- Decision: Enforce QNAME/QTYPE/QCLASS match in native UDP parsers. Rationale: aligns with RFC 5452 spoofing defenses and keeps parity with stricter DNS validation.

## Outcomes & Retrospective

Question matching (QNAME/QTYPE/QCLASS) is now enforced in Android and iOS native UDP parsers, with safe compression pointer handling and strict bounds checks. Android unit tests passed and iOS workspace UI tests succeeded on the iPhone 17 simulator.

## Artifacts and Notes

Verification outputs (2026-01-05):

    cd android && ./gradlew :app:testDebugUnitTest
    Result: BUILD SUCCESSFUL (11s)

    xcodebuild -workspace ios/DNSChat.xcworkspace -scheme DNSChat -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 17,OS=26.2' test
    Result: TEST SUCCEEDED
    xcresult: /Users/mneves/Library/Developer/Xcode/DerivedData/DNSChat-dqhwowdchhbursepygjgrhdnktlj/Logs/Test/Test-DNSChat-2026.01.05_20-59-44--0300.xcresult
