# Fresh Eyes Audit — DNSChat

Date: 2025-10-01

## Scope

- Reviewed core runtime paths and native boundaries:
  - `src/services/dnsService.ts`, `modules/dns-native/index.ts`
  - Storage and crypto: `src/services/storageService.ts`, `src/utils/encryption.ts`
  - Logging: `src/services/dnsLogService.ts`, `src/screens/Logs.tsx`
  - Platform modules: `ios/DNSNative/*`, `modules/dns-native/android/*`, `ios/LiquidGlass*`, `native/liquid-glass/*`
  - Configuration and typing: `tsconfig.json`, `package.json`

## Key Findings (High Signal)

0) IPv6 custom resolver handling is broken
- `composeDNSQueryName` only recognises IPv4 literals. An IPv6 server such as `2001:db8::1` is treated as the DNS zone, producing query names like `label.2001:db8::1` and guaranteeing NXDOMAIN (src/services/dnsService.ts:11-33).
- `validateDNSServer` rejects compressed IPv6 (e.g., `2001:db8::1`) and bracketed inputs because the regex lacks `::` support (src/services/dnsService.ts:206-233). Users cannot persist legitimate IPv6 resolvers.

1) DNS fallbacks and documentation drift
- Docs describe slightly different fallback orders: `DNSService.getMethodOrder()` currently prioritizes native → UDP → TCP → HTTPS when experimental transports are enabled and preferHttps=false (web defaults to HTTPS). Other docs imply UDP → TCP → DoH without calling out the native bridge. Pick a single authoritative sequence and mirror it across `.cursor/rules/dns-service-architecture.mdc`, `docs/CHAT_DNS_SERVER_COMPAT.md`, and inline code comments/tests.

2) Type-safety gaps in core files
- Frequent `any` usage in `src/services/dnsService.ts`, `src/utils/liquidGlass.ts`, screens (e.g., `About`, `Settings`, `GlassSettings`) weakens compile-time guarantees. `tsconfig.json` notes stricter settings are TODO. This raises risk of runtime shape errors on networking, logs, and UI props.

3) Logs UX feature gap
- `src/screens/Logs.tsx` shows a TODO for single-log deletion, while `src/services/dnsLogService.ts` lacks a targeted delete API. This causes friction for users triaging noisy logs.

4) iOS availability reporting does not match the deployment target
- `DNSResolver.isAvailable` returns `true` on iOS 12+, but the podspec pins the deployment target at iOS 15.1. Devices running 12–14 fail to load the module even though the capability probe says it is available (modules/dns-native/ios/DNSResolver.swift:25-30, modules/dns-native/ios/DNSNative.podspec:19-34).

5) Android/iOS native module cohesion
- Ensure there is a single source for the React Native bridge (`RNDNSModule`) and resolver implementations on Android and iOS. The project relies on Expo config plugins (`plugins/dns-native-plugin.js`, `plugins/liquid-glass-plugin.js`) to copy files from `modules/dns-native/*` and `native/liquid-glass/*` into the platform folders. Verify no stale copies linger under `android/app/src/main/java/com/dnsnative` or `ios/` after plugin runs.

6) Security posture: positive, but validate invariants
- Crypto code (`src/utils/encryption.ts`) shows AES-256-GCM, PBKDF2, and secure Keychain/Keystore usage with mutexes to avoid races. Keep an eye on:
  - Master password creation single-flight cache correctness
  - Validation when reading stored key material
  - Web Crypto availability on all entry points (polyfill order)

7) Liquid Glass placeholders
- iOS 26+ view manager contains TODO to integrate official APIs when available; current code paths appear to guard older OS versions. Fine to defer but keep clearly flagged.

## Prioritized TODO (Actionable)

P0 — Correctness & Security
- Fix IPv6 resolver acceptance end-to-end
  - Update `composeDNSQueryName` to detect IPv6 literals (and treat them like IPv4: use the default TXT zone) and expand `validateDNSServer` to accept compressed or bracketed IPv6 hosts; add regression tests.
- Align fallback order across code and docs
  - Update `DNSService.getMethodOrder()` documentation/tests and `.cursor/rules/dns-service-architecture.mdc` to describe the same order. Ensure retry logging matches.
- Validate DNS server inputs consistently
  - Replace or augment the current pattern checks with format-based validation so hostnames/IPs (including IPv6 literals) pass, while rejecting injection payloads and invalid labels.

P1 — Developer Experience & Resilience
- Add targeted log deletion
  - Add `deleteLog(id: string)` to `src/services/dnsLogService.ts`; wire to `Logs` screen action.
- Align iOS availability probe with deployment target
  - Gate `DNSResolver.isAvailable` behind `@available(iOS 15.1, *)` (matching the podspec) and update the capabilities payload so older devices surface a clear unsupported message.
- Reduce `any` in core surfaces
  - Replace `any` in `dnsService` helpers and event handlers with typed interfaces; introduce local `type` definitions in `src/types/` where needed.
- Incremental TS strictness
  - Turn on one stricter flag at a time (e.g., `noUncheckedIndexedAccess`) after addressing the most common offenders in services and screens.

P2 — Platform Cohesion & Docs
- Consolidate native module source-of-truth
  - Confirm Expo plugins copy from the expected source directories only; remove manually committed duplicates from `ios/` or `android/` if the plugin now vends them automatically.
- Clarify DoH gating
  - Ensure the rule for skipping DoH for `ch.at` (if implemented in JS/native) is mirrored in docs and tests, emphasizing that DoH currently cannot reach ch.at custom records.
- Update documentation
  - Unify fallback order across `docs/*` and `.cursor/rules/*`; add a short “source of truth” section linking to `src/services/dnsService.ts`.

P3 — Nice-to-haves
- Improve `GlassSettings` error typing and user-facing error messages.

## Acceptance Criteria (for closure)

- Fallback order is consistent in code, tests, and docs; tests pass locally and in CI.
- IPv6 resolvers can be saved through Settings, produce correct TXT query names, and pass automated/unit coverage.
- `dnsLogService` exposes `deleteLog(id)` and `Logs` implements it.
- Core `any` usages in `dnsService` helpers and `liquidGlass` version parsing are replaced with explicit types.
- One stricter TS flag enabled without introducing new errors in CI.
- Native module sources are verified for single source-of-truth via the Expo plugin; README updated if needed.

## Notes

- Avoid broad refactors. Prefer narrow, well-tested edits aligned with existing patterns.
- Keep security-sensitive code paths (crypto, DNS parsing/sanitization) conservative and well typed.

## TODO (Working List)

- [ ] Extend `validateDNSServer` to accept compressed/bracketed IPv6 literals and add unit coverage for IPv4, IPv6, and hostname cases.
- [ ] Update `composeDNSQueryName` and the smoke test (`test-dns-simple.js`) to treat IPv6 resolvers like IPv4 (use default TXT zone) and document examples in README/Settings UI.
- [ ] Synchronize documented fallback order with `DNSService.getMethodOrder()` and native fallbacks.
- [ ] Replace remaining DNS server whitelist remnants with shared validation helpers and update `SettingsContext` error messaging.
- [ ] Add targeted log deletion flow (`dnsLogService` + `Logs` screen) and accompanying tests.
- [ ] Guard `DNSResolver.isAvailable` with the iOS 15.1 availability check and adjust capability messaging/tests.
- [ ] Triage top `any` hot spots and enable one stricter TS compiler flag.
- [ ] Verify Expo plugins remain the single source for native module files; delete stale copies if found.
