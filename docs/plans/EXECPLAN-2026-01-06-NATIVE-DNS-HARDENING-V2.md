# Exec Plan: Native DNS Hardening v2 (2026-01-06)

Status: Completed
Owner: Mobile
Last updated: 2026-01-06

## Goal

Harden native DNS behavior to align with current best practices by enforcing the server allowlist in native code, moving Android DoH to the RFC 8484 wireformat, and keeping iOS/Android/JS constants in sync.

## Non-goals

- Changing the user-facing DNS server selection UI.
- Adding new DNS transports or altering the JS-level fallback order.
- Switching DoH provider (Cloudflare remains the endpoint).

## Best-practice references (source of truth)

- RFC 8484: DNS-over-HTTPS wireformat is `application/dns-message` and preferred for stability.
- Cloudflare DoH API guidance (wireformat + JSON formats).
- React Native native module lifecycle guidance (invalidate/cleanup).
- Gradle 8+ Groovy DSL deprecation guidance for space assignment syntax.

## Phase 0: Audit & constraints

Acceptance criteria:
- Identify native allowlist gaps and DoH JSON usage on Android.
- Confirm shared constants path and existing sanitizer bridge.

Tasks:
- [x] Locate JS allowlist and native resolver entry points.
- [x] Confirm Android DoH uses JSON format.
- [x] Confirm iOS lacks allowlist enforcement.

Verification:
- [x] `rg -n "ALLOWED_DNS_SERVERS|queryTXTDNSOverHTTPS|normalizeServerHost" src modules android ios`

## Phase 1: Shared allowlist propagation

Acceptance criteria:
- Native sanitizer config includes `allowedServers` list.
- JS passes allowlist to native on both iOS and Android.

Tasks:
- [x] Extend `NativeSanitizerConfig` with `allowedServers`.
- [x] Include allowlist in `getNativeSanitizerConfig()`.
- [x] Configure sanitizer on iOS as well as Android.

Verification:
- [x] Type-check compilation (TS) and unit tests (JS).

## Phase 2: Native allowlist enforcement

Acceptance criteria:
- Android and iOS reject DNS servers not in the allowlist.
- Normalization matches JS behavior (trim/lowercase/strip trailing dot).

Tasks:
- [x] Add allowlist set to Android `SanitizerConfig`.
- [x] Enforce allowlist in Android `normalizeServerHost`.
- [x] Add allowlist enforcement in iOS resolver (normalized domain).

Verification:
- [x] Code review for parity and error messages.

## Phase 3: Android DoH wireformat

Acceptance criteria:
- DoH uses `application/dns-message` POST body with raw DNS wireformat.
- Responses parsed with existing DNS wire parser and validated.

Tasks:
- [x] Build DoH queries with `transactionId=0` (RFC 8484 guidance).
- [x] Switch to POST + `application/dns-message` headers.
- [x] Parse response via `parseDnsTxtResponse`.

Verification:
- [x] `cd android && ./gradlew --warning-mode all :app:testDebugUnitTest --console=plain`

Residual warnings (expected):
- `sdk.dir` missing in `android/local.properties` for this environment.
- Gradle toolchain auto-provisioning repository warning (environment config).

## Phase 4: Docs & traceability

Acceptance criteria:
- Spec and changelog reflect allowlist enforcement and DoH wireformat.
- Protocol doc reflects Android native fallback chain.

Tasks:
- [x] Update `CHANGELOG.md`.
- [x] Update `docs/technical/DNS-PROTOCOL-SPEC.md`.
- [x] Record this exec plan.

Verification:
- [x] `rg -n "DNS-over-HTTPS|allowlist" docs/technical/DNS-PROTOCOL-SPEC.md`

## Implementation status

All phases completed on 2026-01-06.
