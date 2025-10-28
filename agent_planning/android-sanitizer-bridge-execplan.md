# ExecPlan: Android Native Sanitizer Bridge

## Purpose
Align Android label sanitization with the single TypeScript source of truth so regexes, limits, and replacements evolve in one place, and prove the bridge with device-level integration tests that exercise the real native module.

## Context and Orientation
The current Android implementation (`modules/dns-native/android/DNSResolver.java`) embeds its own regex patterns, dash rules, and label length limit while JavaScript uses `modules/dns-native/constants.ts` for the same logic. `RNDNSModule.java` exposes only `queryTXT` and `isAvailable`, and the JS facade (`modules/dns-native/index.ts`) instantiates the module but never configures sanitization. Integration coverage lives in `modules/dns-native/__tests__/integration.test.ts`, which already gates on `RUN_INTEGRATION_TESTS`. We must extend the JS constants module so both JavaScript sanitization (`sanitizeDNSMessageReference`) and the native sanitizer consume identical data, then deliver that config over the bridge before any query runs. Hooks for ast-grep are provisioned via `scripts/install-git-hooks.js`, and we will verify they remain blocking.

## Milestones
Milestone 1 (JS configuration): reshape `constants.ts` to expose a serialisable sanitizer config, refactor the TypeScript sanitizer to consume it, and update the facade to push that config into the native module on Android during startup.
Milestone 2 (Android runtime config): introduce a configurable sanitizer inside `DNSResolver`, wire a new `configureSanitizer` React method that translates the JS map into compiled `Pattern`s, and ensure defaults mirror legacy behaviour if JS fails to configure.
Milestone 3 (End-to-end proof): add bridge-level integration tests that compare native sanitization against `sanitizeDNSMessageReference`, document the required `RUN_INTEGRATION_TESTS=true` flow, and validate ast-grep hook execution so commits fail when lint errors appear.

## Plan of Work
Extend `modules/dns-native/constants.ts` with a plain-object `DNS_SANITIZER_CONFIG` that carries regex source strings, replacement tokens, truncation limits, and the Unicode normalization form. Refactor `sanitizeDNSMessageReference` to instantiate `RegExp` objects from that config rather than hard-coding literals, preserving behaviour. In `modules/dns-native/index.ts`, broaden the `NativeDNSModule` interface with an optional `configureSanitizer` method that accepts a serialisable config and call it from the constructor only when the platform is Android and the method exists. On the native side, add a `configureSanitizer` `@ReactMethod` to `RNDNSModule.java`, parse the incoming `ReadableMap` into a new immutable `SanitizerConfig` object, and store it in `DNSResolver` using an `AtomicReference` so future calls use the latest values. Rewrite `sanitizeLabel` to pull regexes, replacements, and limits from that config while keeping the folding logic compatible with `Normalizer.Form.NFKD`. Provide a defensive fallback config defined alongside the new class to maintain current behaviour if JS never configures.

## Concrete Steps
After the refactor, run `npm run lint:ast-grep` from the repository root to confirm the hook logic also succeeds manually. Execute `npm test -- modules/dns-native/__tests__/DNSResolver.test.ts` to catch unit regressions introduced by the sanitizer changes, then invoke `RUN_INTEGRATION_TESTS=true npm test -- modules/dns-native/__tests__/integration.test.ts` on a device or simulator to exercise the new bridge assertions; expect the suite to complete within ~30 seconds with the newly added test names appearing in the output. Manually trigger `node scripts/install-git-hooks.js` once to reinstall the hook if necessary and observe the `[install-git-hooks]` confirmation in the terminal.

## Validation and Acceptance
Acceptance requires that Android sanitization outcomes match `sanitizeDNSMessageReference` for mixed-case, accented, and punctuation-heavy samples, as demonstrated by the new integration assertions. All Jest suites (`npm test`) and ast-grep linting must pass. A developer running the integration tests with `RUN_INTEGRATION_TESTS=true` should see the new scenarios succeed on both emulator and physical Android hardware.

## Idempotence and Recovery
Calling `configureSanitizer` multiple times should overwrite the prior settings atomically; re-running the JS constructor or hot reload will therefore not corrupt native state. If map parsing fails, the native module will log the failure, retain the previous config, and reject with a descriptive error so the app can surface a fallback path. The integration tests remain safe to re-run because they only read sanitization results and touch no external resources.

## Interfaces and Dependencies
The bridge introduces `configureSanitizer(config: NativeSanitizerConfig): Promise<boolean>` on the Android module. The config contains `maxLabelLength: number`, `spaceReplacement: string`, `unicodeNormalization: string`, and regex descriptors `{ pattern: string }` for whitespace, invalid characters, dash collapsing, edge trimming, and combining marks. `RNDNSModule` depends on `ReadableMap` and enforces presence of each key before accepting the update. `DNSResolver` now depends on `AtomicReference` for thread-safe access to the shared config and only recompiles regexes when the payload hash changes.

## Artifacts and Notes
New integration coverage will land in `modules/dns-native/__tests__/integration.test.ts` under a describe block that compares native and JS sanitization. Any helper added for testing (for example a native `debugSanitizeLabel`) must remain behind `RUN_INTEGRATION_TESTS` guards in JS to keep production bundles lean.

## Progress
- [x] (2025-10-27 19:25Z) JS constants expose `DNS_SANITIZER_CONFIG` and sanitize reference refactor completed.
- [x] (2025-10-27 19:28Z) Android `DNSResolver` consumes runtime config and bridge method implemented.
- [x] (2025-10-27 19:31Z) Integration tests and hook verification executed successfully.

## Surprises & Discoveries
- Observation: Jest unit environment lacks a `Platform` mock, so direct `Platform.OS` access crashed after the refactor.
  Evidence: `npm test -- modules/dns-native/__tests__/DNSResolver.test.ts` initially failed with "Cannot read properties of undefined (reading 'OS')" until optional chaining guarded the reference.
- Observation: The shared config’s `g` flag (harmless in JS) surfaced as an unsupported token for Java’s `Pattern`, so the native parser now treats it as a no-op while continuing to reject truly invalid flags.
  Evidence: Added `parseFlags` guard inside `SanitizerConfig` and covered it in the new `nativeDNS.configureSanitizer.spec.ts` suite; tests confirmed the flag table behaves as expected.

## Decision Log
- Decision: Use a JS-driven runtime configuration (`configureSanitizer`) instead of build-time code generation so regex updates flow instantly from TypeScript to Android. Rationale: avoids duplicating constants and keeps future sanitization tweaks single-sourced while preserving hot reload ergonomics. Date/Author: 2025-10-27 / Codex.
- Decision: Surface sanitizer updates as promise-based responses with structured error codes so JavaScript can react to rejected configs deterministically. Rationale: brings the bridge in line with other production modules and prevents silent desyncs. Date/Author: 2025-10-27 / Codex.

## Outcomes & Retrospective
Android now ingests the shared sanitizer payload at runtime, eliminating regex drift, and parity tests (skipped without hardware) validate behaviour when the native bridge is available. Guarding `Platform` access keeps unit tests green in headless environments. Further device runs should confirm the new parity block realises on physical hardware.
