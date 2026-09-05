# DNSChat Project Memory

## Project Environment

Machine-independent inspector result: `memory/project-environment.json`.

- Expo SDK 57 / React Native 0.86 with Expo Router, Hermes, New Architecture, and compiled iOS/Android projects.
- Use pnpm 11 and the repository scripts. Expo Go and Expo dev-client are not valid runtime proof because DNSChat depends on the native DNS module.
- Metro defaults to port 8081. Argent is the default compiled-app UI verification surface; discover elements before each tap and stop only the simulator services used by this project.
- The app also supports Metro-powered web, but there is no separate production web build script.

## Active Work

- TestFlight 4.4.3/build 88 is `VALID`, internal only, with bilingual notes and strict validation at zero errors/warnings. Tag `v4.4.3-beta1` points to `f775597`, the source of the stable-Xcode signed archive/IPA. The final gate passes 1,010 root and 68 native tests, with 141/141 compiled components. External autoreview through P3 is clean; independent review accepts the corruption-metadata fix. Earlier 4.4.2/build 87 iOS/Android Debug walkthroughs pass, while build 88 hardware behavior remains unverified because paired devices are unavailable. See `memory/2026-09-05.md`.

- Previous TestFlight beta `4.4.1` build `86` is `VALID` and tagged `v4.4.1-beta1` from the exact source that produced the signed archive. Internal tester group only; its CI passed all jobs.
- `4.4.0` completed a half-finished native DNS hardening pass (Android DNS-over-HTTPS removed, bridge pinned to port 53, query-zone pin, native allowlist narrowed to the two LLM zones). `4.4.1` is the review follow-up: external-link userinfo spoofing fix, Android/iOS query-label parity, both `@xmldom/xmldom` advisories patched rather than suppressed, and `queryWithServer` no longer defaulting its deadline.
- **Android runtime proof exists for `4.4.1` (2026-09-04).** Signed release APK installed on an `android-36 google_apis arm64` emulator: onboarding, chat list, chat, error handling, persistence and the Logs screen all render; no crash, no ANR. The DNS query failed on the emulator's degraded network, and the Logs entry read `Failed / Method: TCP / Duration: 20.05s` -- which is the useful part: the chain fell through native -> UDP -> TCP and terminated exactly on `TOTAL_QUERY_BUDGET_MS` (20 000 ms), so the `4.4.0` wall-clock deadline works end to end on a device.
- **No iOS physical-device proof for `85` or `86`.** The authorized iPhone was locked, then `unavailable` (disconnected). Install and run the survival check before treating either as device-proven.
- Emulator setup is not preinstalled here: the SDK had no system image and no in-SDK `cmdline-tools`. Install both into `$ANDROID_HOME` (a Homebrew `avdmanager` resolves its SDK root from its own install path and will not see the project SDK), then `avdmanager create avd`. The release APK is unsigned, so sign it with the debug key via `zipalign` + `apksigner` before `adb install`.
- Previous beta `4.3.6` build `84` (tagged `v4.3.6-beta1`) is the last release with physical-device Release install/launch proof.
- App Store Connect reports production 4.0.23 on 2026-09-05. The draft is now 4.4.3, attached to build 88, with bilingual metadata and the two missing social-media capability fields filled from app behavior. Strict API readiness passes, but cannot verify App Privacy publication. Web authentication requires 2FA; provider-policy, content-rating and unauthenticated-response decisions below still apply. No clean v4.4.3 production tag or submission was made.

## Native DNS Invariants

- The compiled-in native allowlist is a strict **subset** of the TypeScript `ALLOWED_DNS_SERVERS`, not set-equal to it. Native narrows by intersection, so it may be stricter but must never list a host TS would reject. Both platforms must narrow identically, or one user setting succeeds on iOS and fails on Android. Enforced by `modules/dns-native/__tests__/nativeSecurityPolicy.test.ts`.
- Native speaks only to the LLM zones, never a public recursive resolver (`androidDnsResolver.policy.spec.ts` fails the build if `HttpURLConnection`, `8.8.8.8`, or `1.1.1.1` appear in that resolver).
- Consequence: selecting an IP resolver fails the native rung and falls through to UDP/TCP. With **Allow Experimental Transports** off the order is native-only, so an IP resolver has no rung left and the query fails by design.
- dnsjava treats a name without a trailing dot as **relative** and walks the system search path. The legacy Android lookup must stay rooted via `Name.fromString(queryName, Name.root)`, or it leaks the user's local search domain onto the wire. The JVM stub deliberately omits the `Lookup(String, int)` overload so a regression fails to compile.

## Known Unfixed

- ~~iOS cancellation ordering race~~ **closed as not applicable (2026-09-04)**. Both `queryTXT` and `cancelActiveQueries` are declared on `RNDNSModule` and exported by one `RCT_EXTERN_MODULE` block, so JS calls arrive in order on a single serial methodQueue; the bridge forwards synchronously; SE-0431 makes an actor-isolated `Task` enqueue synchronously onto the FIFO `MainActor`; and the query registers in `activeQueries` before its first `await`. Two earlier readings of this were wrong (first "unordered Tasks", then "different modules") -- the premise was never checked against `RNDNSModule.m`. `iosDnsResolver.policy.spec.ts` now gates the ordering by construction. Structural, not executed: there is still no iOS test target.
- `decode-uri-component` CVE-2026-45822 is fixed in the 4.4.2 candidate with a scoped `^0.5.0` override and a one-line pnpm patch migrating query-string to the ESM default export. The installed Metro consumer regression passes. A direct override alone failed, but the prior conclusion that this required indefinite suppression was too broad. Two image-size advisories remain suppressed with reachability arguments and recheck dates in `pnpm-workspace.yaml` because their fixed release is not published.

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
- Check a finding's PREMISE against the code before acting on it, and again before publishing it. The iOS cancellation "race" was reported, then deferred, then re-deferred on a second wrong premise -- twice reasoning about which module owns the bridge methods without opening `RNDNSModule.m`, which answers it in one grep. A wrong premise survived into a shipped changelog.
- Timing assertions in the JVM harness must bound what the code controls. Two separate CI failures came from budgets that also had to cover executor dispatch on a loaded runner: measure from the seam the test injects, and keep the injected native budget well clear of scheduling latency.
