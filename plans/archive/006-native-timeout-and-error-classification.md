# Plan 006: Fix iOS native timeout budget and native→JS error-classification parity

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 2739cf2..HEAD -- modules/dns-native/ ios/DNSNative/ android/app/src/main/java/com/dnsnative/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code; on a mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (touches the native network core; all changes are
  constant/ordering/message-level, no protocol changes)
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `2739cf2`, 2026-07-10

## Why this matters

Three related defects make native DNS failures slower and less diagnosable
than designed. (1) On iOS the OUTER query timeout (8s) is smaller than one
worst-case attempt of the default `udpThenTCP` transport (4s UDP + 6s TCP =
10s), so a slow-but-valid TCP fallback is killed and the advertised 3 retries
essentially never run. (2) Every native rejection carries code
`DNS_QUERY_FAILED`, and the JS mapper short-circuits on that code BEFORE its
substring classification, so real timeouts/network failures never map to
`DNSErrorType.TIMEOUT`/`NETWORK_UNAVAILABLE` — dead code plus a latent trap.
(3) The iOS combined failure message hardcodes "timed out" for non-timeout
failures, which would force wrong classification once (2) is fixed. A fourth,
small parity fix: Android `split("\\.")` keeps empty labels that iOS drops.

## Current state

- `modules/dns-native/ios/DNSResolver.swift:12-15`:
  ```swift
  private static let queryTimeout: TimeInterval = 8.0
  private static let udpAttemptTimeout: TimeInterval = 4.0
  private static let tcpAttemptTimeout: TimeInterval = 6.0
  private static let maxNativeAttempts: Int = 3
  ```
  `:216` — `return try await withTimeout(seconds: Self.queryTimeout) {` wraps
  the whole `for attempt in 0..<Self.maxNativeAttempts` retry loop.
  `:263-279` — one `udpThenTCP` attempt runs UDP (≤4s) then TCP (≤6s)
  sequentially. The JS side allows 10s per native call
  (`src/services/dnsService.ts` `this.TIMEOUT`).

- `modules/dns-native/index.ts:455-467` — code check precedes substring
  classification:
  ```ts
  const details = getErrorDetails(error);
  const messageLower = details.message.toLowerCase();
  ...
  if (details.code === "DNS_QUERY_FAILED") {
    throw new DNSError(DNSErrorType.DNS_QUERY_FAILED, ...);
  }
  if (messageLower.includes("timeout") || messageLower.includes("timed out")) ...
  ```
  Native reject sites always use code `DNS_QUERY_FAILED`
  (`modules/dns-native/android/RNDNSModule.java:59`, iOS equivalents), so the
  substring branches below are unreachable for native errors.

- `modules/dns-native/ios/DNSResolver.swift:275-277` — combined message
  hardcodes "timed out" regardless of the real causes:
  `"Native UDP blocked or timed out; TCP fallback failed: …"`.

- `modules/dns-native/android/DNSResolver.java:586` —
  `trimmed.split("\\.")` keeps empty internal/leading tokens →
  `sanitizeLabel("")` throws at `:621-623`. iOS uses
  `split(separator: ".", omittingEmptySubsequences: true)`
  (`ios/DNSResolver.swift:826`). Filter empty tokens on Android to match.

**CRITICAL repo mechanics — dual native copies**: the files
`modules/dns-native/ios/DNSResolver.swift` and
`modules/dns-native/android/DNSResolver.java` have byte-identical committed
copies at `ios/DNSNative/DNSResolver.swift` and
`android/app/src/main/java/com/dnsnative/DNSResolver.java`. A pre-commit gate
(`bun run verify:dnsresolver-sync`) fails if they diverge. After EVERY edit to
a module native file, copy it over its counterpart (`cp` is fine) and re-run
the gate.

## Commands you will need

| Purpose   | Command                            | Expected |
|-----------|------------------------------------|----------|
| Sync gate | `bun run verify:dnsresolver-sync`  | exit 0   |
| Typecheck | `bun run typecheck`                | exit 0   |
| Module tests | `cd modules/dns-native && bun run test` | all pass |
| Root tests | `bun run test`                    | all pass |
| Lint      | `bun run lint`                     | exit 0   |

There is no on-device native test harness — Swift/Java changes are verified
by the TS-side tests, the policy specs, and code review. Do not attempt to
run xcodebuild.

## Scope

**In scope**:
- `modules/dns-native/ios/DNSResolver.swift` (+ its copy `ios/DNSNative/DNSResolver.swift`)
- `modules/dns-native/android/DNSResolver.java` (+ its copy `android/app/src/main/java/com/dnsnative/DNSResolver.java`)
- `modules/dns-native/index.ts`
- Tests under `modules/dns-native/__tests__/` and root `__tests__/`

**Out of scope**:
- `src/services/dnsService.ts` (JS transport orchestration — its 10s budget
  stays as-is)
- Adding `queryTXTUDP`/`queryTXTTCP` to Android (known asymmetry, separate
  backlog item)
- Any wire-format/protocol change; any new native capability

## Git workflow

Work in the current tree. Do NOT commit or push; the operator reviews.

## Steps

### Step 1: Give the iOS outer timeout headroom over one full attempt

In `modules/dns-native/ios/DNSResolver.swift`, derive the outer budget instead
of the fixed 8s, e.g.:
```swift
private static let queryTimeout: TimeInterval = udpAttemptTimeout + tcpAttemptTimeout + 1.0  // 11s: one full udpThenTCP attempt + slack
```
Keep `maxNativeAttempts` as-is (the JS 10s cap still bounds the overall call;
that is accepted and documented below). Add a one-line comment stating the
invariant: `queryTimeout > udpAttemptTimeout + tcpAttemptTimeout`.

Copy the file over `ios/DNSNative/DNSResolver.swift`.

**Verify**: `bun run verify:dnsresolver-sync` → exit 0.

### Step 2: Compose the udpThenTCP failure message from real causes

At `DNSResolver.swift:275-277`, build the message from the two underlying
errors' `localizedDescription` values without injecting the literal
"timed out", e.g. `"Native UDP failed (<udpError>); TCP fallback failed: <tcpError>"`.
Re-copy the file; re-run the sync gate.

**Verify**: `bun run verify:dnsresolver-sync` → exit 0.

### Step 3: Move substring classification ahead of the generic code check in JS

In `modules/dns-native/index.ts` (~455-495), reorder so the
timeout/network/permission substring branches run BEFORE the
`details.code === "DNS_QUERY_FAILED"` catch-all. Preserve the exact
DNSErrorType values and messages. Result: a native "DNS query timed out" /
"Receive timed out" maps to `DNSErrorType.TIMEOUT`, network-ish messages to
`NETWORK_UNAVAILABLE`, permission to `PERMISSION_DENIED`, and everything else
still falls through to `DNS_QUERY_FAILED`.

**Verify**: `cd modules/dns-native && bun run test` → all pass.

### Step 4: Android empty-label parity

In `modules/dns-native/android/DNSResolver.java:586-594`, filter out empty
tokens after the split (matching iOS `omittingEmptySubsequences: true`)
before calling `sanitizeLabel`. Copy the file over
`android/app/src/main/java/com/dnsnative/DNSResolver.java`.

**Verify**: `bun run verify:dnsresolver-sync` → exit 0.

## Test plan

- In `modules/dns-native/__tests__/`, add cases to the existing error-mapping
  suite (find it via `grep -rln "DNSErrorType" modules/dns-native/__tests__`)
  asserting: native reject `{code:"DNS_QUERY_FAILED", message:"DNS query timed
  out"}` → `DNSErrorType.TIMEOUT`; `"...Receive timed out..."` → TIMEOUT;
  `"...network unavailable..."` → NETWORK_UNAVAILABLE; a generic message →
  DNS_QUERY_FAILED.
- Root policy spec: if a policy test asserts the old hardcoded iOS message
  string, update it to the new composed form (search
  `grep -rn "timed out; TCP fallback" __tests__ modules`).
- Verification: `bun run test` and `cd modules/dns-native && bun run test` →
  all pass.

## Done criteria

- [ ] `bun run verify:dnsresolver-sync` exits 0
- [ ] `bun run typecheck` exits 0, `bun run lint` exits 0
- [ ] Both test suites pass with the new mapping tests present
- [ ] In `DNSResolver.swift`, `queryTimeout` is strictly greater than `udpAttemptTimeout + tcpAttemptTimeout` (both copies)
- [ ] `grep -n "blocked or timed out" modules/dns-native/ios/DNSResolver.swift` → no matches
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- The `withTimeout` nesting at `DNSResolver.swift:216` doesn't match the
  excerpt (drift).
- Reordering in step 3 breaks an existing behavioral test in a way that
  suggests JS code DEPENDS on native timeouts collapsing to
  DNS_QUERY_FAILED — report instead of forcing.
- You find yourself editing `src/services/dnsService.ts` — out of scope.

## Maintenance notes

- The JS-side 10s (`DNSService.TIMEOUT`) now becomes the effective cap on a
  full native call; the iOS outer 11s is intentionally slightly larger so the
  JS layer, which has the query-budget logic, is the one that decides.
- Follow-up (deferred): fine-grained native error CODES
  (DNS_TIMEOUT/DNS_NETWORK) instead of message-substring mapping; Android
  queryTXTUDP/TCP parity ([CORRECTNESS-12]); iOS continuation leak on cancel
  during connect ([CORRECTNESS-09]).
