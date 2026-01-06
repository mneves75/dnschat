# DNSChat Engineering ExecPlan: iOS DNS Response Validation Hardening (2026-01-05)

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.

PLANS.md is not present in this repository. This document is therefore the sole execution plan for this work and must remain self-contained.

## Purpose / Big Picture

Close the spoofing gap in iOS native UDP DNS by validating transaction IDs and DNS header fields, and ensure both iOS resolver copies stay in parity with Android/TypeScript behavior. The changes are limited to the native UDP path and are designed to enforce RFC-compliant response checks while preserving the existing fallback chain.

## Goal and Non-Goals

Goals:
- Validate DNS response transaction IDs against the originating query.
- Enforce header sanity checks (QR/opcode/TC/RCODE/QDCOUNT).
- Ensure question section parsing is robust (handles compression pointers).
- Keep ios/DNSNative and modules/dns-native copies in sync.
- Document and verify the change with reproducible steps.

Non-goals:
- Adding DNSSEC validation.
- Changing transport order or fallback strategy.
- Refactoring the query pipeline beyond validation.

## Current State

The iOS UDP query builder generates a random transaction ID, but the response parser does not validate it or DNS header flags. The parser also assumes a single-question response and does not account for compression pointers in the question section. This is weaker than the TypeScript UDP validation and the hardened Android implementation.

## Proposed Approach (Options + Tradeoffs)

Option A: Add transaction ID validation only. Lowest risk but still accepts malformed headers and truncated responses.

Option B: Add transaction ID + header validation + safer question parsing (chosen). Slightly broader changes but aligns with DNS header semantics and common spoofing defenses.

## Architecture / Data Flow Changes

No architecture changes. The iOS UDP resolver now threads an expected transaction ID from the query builder into the parser and validates header flags/counts before parsing answers.

## Phased Plan With Milestones (Multi-Phase Todo)

Phase 0 (Discovery)
- Inspect iOS DNSResolver UDP path and compare with TS/Android behavior.
- Identify missing validations and pointer parsing gaps.
Success: documented deltas and validation rules.

Phase 1 (Design)
- Define required header checks: QR=1, opcode=0, TC=0, RCODE=0, QDCOUNT=1.
- Define error handling for mismatch (fail UDP path to trigger fallback).
Success: agreed validation rules.

Phase 2 (Implementation)
- Update createDNSQuery to return both payload + transaction ID.
- Update performUDPQuery to pass expected ID into parser.
- Update parseDnsTxtResponse to validate header fields and parse question section safely.
- Mirror changes in ios/DNSNative and modules/dns-native copies.
Success: code compiled and mirrored across both paths.

Phase 3 (Tests)
- Attempt to run iOS tests (xcodebuild) using the available simulator.
- If unavailable, document the limitation and the required device/simulator.
Success: verification attempt recorded.

Phase 4 (Documentation)
- Record results in Progress and Outcomes sections.
Success: reviewer can trace decisions and evidence.

## Testing Strategy

Primary: xcodebuild test on simulator. If no simulator matches, record failure and list available devices. No new iOS unit test target exists yet.

## Observability

Validation failures surface as DNSError.queryFailed to trigger the fallback chain.

## Rollout Plan + Rollback Plan

Rollout: ship as a patch release and note security hardening.
Rollback: revert DNSResolver changes in both iOS copies.

## Risks and Mitigations

Risk: Overly strict validation could reject unusual responses. Mitigation: align checks with standard DNS header requirements and keep fallback chain intact.

Risk: iOS simulator configuration mismatch blocks tests. Mitigation: record available destinations and rerun with an installed simulator.

## Open Questions

None blocking.

## Progress

- [x] (2026-01-05 20:28Z) Reviewed iOS DNSResolver UDP path and identified missing validations.
- [x] (2026-01-05 20:32Z) Finalized header validation rules and error handling.
- [x] (2026-01-05 20:37Z) Implemented transaction ID threading + header validation in both iOS DNSResolver copies.
- [x] (2026-01-05 20:44Z) Attempted iOS verification via xcodebuild; simulator mismatch recorded.
- [x] (2026-01-05 20:52Z) Re-ran xcodebuild using the workspace on iPhone 17 simulator; tests succeeded.
- [x] (2026-01-05 20:53Z) Updated Outcomes & Retrospective with verification evidence.

## Surprises & Discoveries

- The default simulator spec in the verification command did not exist on this machine; only iPhone 16e / iPhone 17 series simulators were available.
- xcodebuild must target the workspace (not the project) to include CocoaPods module maps.

## Decision Log

- Decision: Enforce QR/opcode/TC/RCODE/QDCOUNT validation in iOS UDP parser for parity with Android/TS. Rationale: aligns with DNS header semantics and standard spoofing defenses.

## Outcomes & Retrospective

iOS UDP DNS responses now validate transaction IDs and header fields before parsing answers, and question parsing is resilient to compression pointers. Changes are mirrored in both iOS resolver copies. Verification succeeded using the workspace on an installed iPhone 17 simulator; the earlier project-based command failed because Pods were not included.

## Context and Orientation

Relevant files:
- modules/dns-native/ios/DNSResolver.swift
- ios/DNSNative/DNSResolver.swift

## Validation and Acceptance

Acceptance requires:
- Transaction ID validation in iOS UDP DNS parser.
- Header sanity checks and QDCOUNT enforcement.
- Updated question parsing logic.
- Recorded verification attempt or success.

## Artifacts and Notes

Verification outputs (2026-01-05):

    xcodebuild -project ios/DNSChat.xcodeproj -scheme DNSChat -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 15' test
    Result: FAILED (no matching simulator)
    Available simulators included: iPhone 16e, iPhone 17, iPhone 17 Pro, iPhone 17 Pro Max, iPhone Air, iPad (A16), iPad Air (M3), iPad Pro (M5).

    xcodebuild -workspace ios/DNSChat.xcworkspace -scheme DNSChat -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 17,OS=26.2' test
    Result: TEST SUCCEEDED (warnings from ExpoModulesCore about dynamic type casts)
    xcresult: /Users/mneves/Library/Developer/Xcode/DerivedData/DNSChat-dqhwowdchhbursepygjgrhdnktlj/Logs/Test/Test-DNSChat-2026.01.05_20-46-23--0300.xcresult
