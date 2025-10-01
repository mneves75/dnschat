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

1) DNS fallbacks and documentation drift
- Docs describe slightly different fallback orders: some say Native → UDP → TCP → DoH; another says UDP → TCP → DoH (with Native implicit). Ensure the implementation in `DNSService.queryLLM()` and the docs match a single, authoritative order for predictability and testing.

2) Type-safety gaps in core files
- Frequent `any` usage in `src/services/dnsService.ts`, `src/utils/liquidGlass.ts`, screens (e.g., `About`, `Settings`, `GlassSettings`) weakens compile-time guarantees. `tsconfig.json` notes stricter settings are TODO. This raises risk of runtime shape errors on networking, logs, and UI props.

3) Logs UX feature gap
- `src/screens/Logs.tsx` shows a TODO for single-log deletion, while `src/services/dnsLogService.ts` lacks a targeted delete API. This causes friction for users triaging noisy logs.

4) Android/iOS native module cohesion
- Ensure there is a single source for the React Native bridge (`RNDNSModule`) and resolver implementations on Android and iOS. The project relies on both `modules/dns-native/*` and platform folders; double-check build-time copy/autolinking from `plugins/dns-native-plugin.js` to prevent drift or duplication.

5) Security posture: positive, but validate invariants
- Crypto code (`src/utils/encryption.ts`) shows AES-256-GCM, PBKDF2, and secure Keychain/Keystore usage with mutexes to avoid races. Keep an eye on:
  - Master password creation single-flight cache correctness
  - Validation when reading stored key material
  - Web Crypto availability on all entry points (polyfill order)

6) Liquid Glass placeholders
- iOS 26+ view manager contains TODO to integrate official APIs when available; current code paths appear to guard older OS versions. Fine to defer but keep clearly flagged.

## Prioritized TODO (Actionable)

P0 — Correctness & Security
- Align fallback order across code and docs
  - Update `DNSService.queryLLM()` comments and docs to match actual order; ensure tests in `__tests__/dnsService.*.spec.ts` exercise that order.
- Validate DNS server sanitization consistently
  - Confirm `validateDNSServer` (in `src/services/dnsService.ts`) enforces hostname rules and 63-char label limits before native calls.

P1 — Developer Experience & Resilience
- Add targeted log deletion
  - Add `deleteLog(id: string)` to `src/services/dnsLogService.ts`; wire to `Logs` screen action.
- Reduce `any` in core surfaces
  - Replace `any` in `dnsService` helpers and event handlers with typed interfaces; introduce local `type` definitions in `src/types/` where needed.
- Incremental TS strictness
  - Turn on one stricter flag at a time (e.g., `noUncheckedIndexedAccess`) after addressing the most common offenders in services and screens.

P2 — Platform Cohesion & Docs
- Consolidate native module source-of-truth
  - Confirm Android/iOS bridge files loaded at build-time are from `modules/dns-native/` to avoid duplication under `android/app` or `ios/` unless intentionally vendored. Verify `plugins/dns-native-plugin.js` behavior.
- Clarify DoH gating
  - Ensure the rule for skipping DoH for `ch.at` (if implemented in native) is mirrored in JS docs and tests.
- Update documentation
  - Unify fallback order across `docs/*` and `.cursor/rules/*`; add a short “source of truth” section linking to `src/services/dnsService.ts`.

P3 — Nice-to-haves
- Add single-record log export/share action in `Logs` screen.
- Improve `GlassSettings` error typing and user-facing error messages.

## Acceptance Criteria (for closure)

- Fallback order is consistent in code, tests, and docs; tests pass locally and in CI.
- `dnsLogService` exposes `deleteLog(id)` and `Logs` implements it.
- Core `any` usages in `dnsService` helpers and `liquidGlass` version parsing are replaced with explicit types.
- One stricter TS flag enabled without introducing new errors in CI.
- Native module sources are verified for single source-of-truth via the Expo plugin; README updated if needed.

## Notes

- Avoid broad refactors. Prefer narrow, well-tested edits aligned with existing patterns.
- Keep security-sensitive code paths (crypto, DNS parsing/sanitization) conservative and well typed.

