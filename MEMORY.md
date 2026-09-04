# DNSChat Project Memory

## Project Environment

- Expo SDK 57 / React Native 0.86 with Expo Router, Hermes, New Architecture, and compiled iOS/Android projects.
- Use pnpm 11 and the repository scripts. Expo Go and Expo dev-client are not valid runtime proof because DNSChat depends on the native DNS module.
- Metro defaults to port 8081. Argent is the default compiled-app UI verification surface; discover elements before each tap and stop only the simulator services used by this project.
- The app also supports Metro-powered web, but there is no separate production web build script.

## Active Work

- TestFlight beta `4.4.0` build `85` is `VALID` and tagged `v4.4.0-beta1` from the exact source that produced the signed archive. Internal tester group only. CI green on `main` (`ci`, `gitleaks`, `codeql`, `public-redaction`). See `memory/2026-09-02.md`.
- `4.4.0` completed a half-finished native DNS hardening pass: Android DNS-over-HTTPS removed, native bridge pinned to port 53, every native query pinned to the allowlisted zone, native allowlist narrowed to the two LLM zones.
- **Build `85` has no physical-device proof.** The authorized iPhone was locked all session, so the developer disk image never mounted and `devicectl` could not install or launch. On-device behavior is unverified, and this release changes DNS transport behavior. Install and run the survival check before treating it as device-proven.
- Previous beta `4.3.6` build `84` (tagged `v4.3.6-beta1`) did have physical-device Release install/launch proof.
- No matching App Store version record exists; production remains blocked by the provider-policy and unauthenticated-response decisions below.

## Native DNS Invariants

- The compiled-in native allowlist is a strict **subset** of the TypeScript `ALLOWED_DNS_SERVERS`, not set-equal to it. Native narrows by intersection, so it may be stricter but must never list a host TS would reject. Both platforms must narrow identically, or one user setting succeeds on iOS and fails on Android. Enforced by `modules/dns-native/__tests__/nativeSecurityPolicy.test.ts`.
- Native speaks only to the LLM zones, never a public recursive resolver (`androidDnsResolver.policy.spec.ts` fails the build if `HttpURLConnection`, `8.8.8.8`, or `1.1.1.1` appear in that resolver).
- Consequence: selecting an IP resolver fails the native rung and falls through to UDP/TCP. With **Allow Experimental Transports** off the order is native-only, so an IP resolver has no rung left and the query fails by design.
- dnsjava treats a name without a trailing dot as **relative** and walks the system search path. The legacy Android lookup must stay rooted via `Name.fromString(queryName, Name.root)`, or it leaks the user's local search domain onto the wire. The JVM stub deliberately omits the `Lookup(String, int)` overload so a regression fails to compile.

## Known Unfixed

- iOS cancellation ordering race: `queryTXT` and `cancelActiveQueries` create independent unstructured Tasks funnelling to the same MainActor state, so a cancel can be admitted before an earlier query and report zero cancellations. A stale result is still rejected by the JS lifecycle guard, so no wrong data reaches the user. A fix needs a lock-protected cancellation generation read outside the MainActor; **the repo has no iOS test target**, so the ordering cannot be verified here. Deferred deliberately, recorded in `CHANGELOG.md` `4.4.0`.
- `decode-uri-component` CVE-2026-45822 (moderate DoS) is suppressed in `pnpm-workspace.yaml` `auditConfig.ignoreGhsas`, not fixed: the only patched release `0.5.0` is ESM-only while `query-string` requires it from the Metro CJS bundle, and every earlier release is vulnerable. Recheck 2026-10-01. Every other advisory, including future moderates, still fails the build.

## Decisions and Blockers

- DNS prompts go to a selected third-party DNS service and are observable; the provider may retain them. The UI and public material must never claim DNS prompts are private.
- Production store submission remains blocked because no verifiable public provider policy covering retention, use, deletion, or service-provider status was located; the publisher must obtain operator evidence or explicitly approve conservative Apple/Google privacy declarations.
- DNS packet validation does not authenticate the provider or protect an unsigned TXT response from an on-path replacement. Shipping requires an explicit risk decision or a provider-compatible authenticated response design; UI and docs disclose the limitation meanwhile.
- Signing identities, Apple team identifiers, device identifiers, and App Store Connect internal IDs remain local and out of tracked files.

## Lessons

- A gate that never runs is not a gate. CI died at `verify:typed-routes` for long enough that `pnpm run test` stopped running in CI entirely, hiding a second failure (`repo.lint.spec.ts`). When a CI job fails, check what it stopped *before* reaching.
- Two gates here were green locally and red in CI for environment reasons, not code reasons. `verify:typed-routes` passed against a stale `router.d.ts` (now deleted-then-polled), and `repo.lint.spec.ts` asserted a substring that only the linux-x64 Oxlint binding emits. Assert on parsed values, never on the presence of a word like "error" that a success message also contains.
- When a spec file is *modified* in the working tree, diff it against `HEAD` before inferring intent from source comments. Reading only the hardened source led to the wrong conclusion about the allowlist narrowing; the new spec settled it.
- `expo install --fix` cannot run at this pnpm workspace root (it calls `pnpm add` without `-w`). Update the dependency ranges directly, then `pnpm install`.
- `verify:expo-doctor` and `pnpm audit` are release gates that drift on their own as advisories land and Expo ships patches; neither failure means the working tree broke something.
