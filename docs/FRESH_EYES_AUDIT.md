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
- Docs describe slightly different fallback orders: `DNSService.getMethodOrder()` currently prioritizes native → UDP → TCP → HTTPS when experimental transports are enabled and preferHttps=false (web defaults to HTTPS). Other docs imply UDP → TCP → DoH without calling out the native bridge. Pick a single authoritative sequence and mirror it across `.cursor/rules/dns-service-architecture.mdc`, `docs/CHAT_DNS_SERVER_COMPAT.md`, and inline code comments/tests.

2) Type-safety gaps in core files
- Frequent `any` usage in `src/services/dnsService.ts`, `src/utils/liquidGlass.ts`, screens (e.g., `About`, `Settings`, `GlassSettings`) weakens compile-time guarantees. `tsconfig.json` notes stricter settings are TODO. This raises risk of runtime shape errors on networking, logs, and UI props.

3) Logs UX feature gap
- `src/screens/Logs.tsx` shows a TODO for single-log deletion, while `src/services/dnsLogService.ts` lacks a targeted delete API. This causes friction for users triaging noisy logs.

4) Android/iOS native module cohesion
- Ensure there is a single source for the React Native bridge (`RNDNSModule`) and resolver implementations on Android and iOS. The project relies on Expo config plugins (`plugins/dns-native-plugin.js`, `plugins/liquid-glass-plugin.js`) to copy files from `modules/dns-native/*` and `native/liquid-glass/*` into the platform folders. Verify no stale copies linger under `android/app/src/main/java/com/dnsnative` or `ios/` after plugin runs.

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
  - Update `DNSService.getMethodOrder()` documentation/tests and `.cursor/rules/dns-service-architecture.mdc` to describe the same order. Ensure retry logging matches.
- Validate DNS server inputs consistently
  - Replace the current whitelist in `validateDNSServer` with format and safety checks so custom resolvers allowed in Settings continue working while blocking injection or invalid hostnames.

P1 — Developer Experience & Resilience
- Add targeted log deletion
  - Add `deleteLog(id: string)` to `src/services/dnsLogService.ts`; wire to `Logs` screen action.
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
- `dnsLogService` exposes `deleteLog(id)` and `Logs` implements it.
- Core `any` usages in `dnsService` helpers and `liquidGlass` version parsing are replaced with explicit types.
- One stricter TS flag enabled without introducing new errors in CI.
- Native module sources are verified for single source-of-truth via the Expo plugin; README updated if needed.

## Notes

- Avoid broad refactors. Prefer narrow, well-tested edits aligned with existing patterns.
- Keep security-sensitive code paths (crypto, DNS parsing/sanitization) conservative and well typed.

