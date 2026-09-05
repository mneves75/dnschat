# Plan 001: Harden DNS transport failure paths (timeout budget, UDP cleanup, multipart, TCP framing)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat b69b6ab..HEAD -- src/services/dnsService.ts src/services/dnsWire.ts modules/dns-native/index.ts modules/dns-native/ios/DNSResolver.swift`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (critical network path — characterization tests included per step)
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `b69b6ab`, 2026-07-04

## Why this matters

Four verified defects in the DNS transport chain degrade failure behavior:
(a) a silent-packet-drop network can stall a single send for ~70–90s while the
UI is locked; (b) iOS UDP error paths skip the explicit `NWConnection` cleanup
the TCP path has; (c) a TXT response mixing plain and multipart records is
silently truncated instead of rejected; (d) a TCP frame with a declared length
of 0 puts the JS TCP parser into a misframed state. All are static-read
verified. Success behavior must not change — only failure behavior gets faster,
cleaner, and louder.

## Current state

- `src/services/dnsService.ts` — DNSService static class (~1744 lines).
  - `queryWithServer` (~line 736): retry loop `for attempt in 1..MAX_RETRIES(3)`, each attempt iterating full `methodOrder` (`native`,`udp`,`tcp`), each method wrapped in `withTimeout(..., this.TIMEOUT /* 10000ms */)`.
  - TCP data handler (~lines 1146–1152):
    ```ts
    responseBuffer = responseBuffer.length === 0 ? data : Buffer.concat([responseBuffer, data]);
    // Read the length prefix if we haven't yet
    if (expectedLength === 0 && responseBuffer.length >= 2) {
      expectedLength = readTcpFrameLength(responseBuffer);
      responseBuffer = responseBuffer.subarray(2); // Remove length prefix
    }
    ```
    If the declared frame length is 0, `expectedLength` stays 0 and the next
    chunk re-reads a "length prefix" from payload bytes.
- `modules/dns-native/index.ts` — `parseMultiPartResponse` (~lines 195–215):
  when any record is plain (`hasPlainResponse`), returns the plain concat and
  silently discards collected `parts[]` (multipart `n/N:` fragments).
- `modules/dns-native/ios/DNSResolver.swift`:
  - `performTCPQueryInternal` (~lines 468–477) uses
    `defer { connection.stateUpdateHandler = nil; connection.cancel() }`.
  - `performUDPQueryInternal` (~lines 348–465) has NO such `defer`; the
    `.failed` state branch (~390–394) and send-error branch (~417–425) resume
    the continuation without `connection.cancel()`.
- Conventions: errors are thrown as `DNSError(DNSErrorType.X, message)` (see
  `modules/dns-native/index.ts` for the enum); tests live in `__tests__/*.spec.ts`
  (root workspace) and `modules/dns-native/__tests__/*.test.ts` (module
  workspace); follow the existing packet-builder pattern in
  `__tests__/dnsWire.spec.ts`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install (already done by operator) | `bun install --frozen-lockfile` | exit 0 |
| Typecheck | `bun run typecheck` | exit 0 |
| Root tests (scoped) | `bun run test -- --testPathPattern='dnsService\|dnsWire'` | all pass |
| Module tests | `cd modules/dns-native && bun run test` | all pass |
| Lint | `bun run lint` | exit 0 |

Swift cannot be compiled standalone here; the Swift change is verified by
matching the existing TCP `defer` pattern exactly (reviewer builds later).

## Scope

**In scope**:
- `src/services/dnsService.ts` (timeout budget, TCP framing)
- `modules/dns-native/index.ts` (multipart mixed-set rejection)
- `modules/dns-native/ios/DNSResolver.swift` (UDP defer cleanup)
- `__tests__/dnsService.spec.ts`, `__tests__/dnsWire.spec.ts`, new `__tests__/dnsService.tcpFraming.spec.ts` (create if cleaner)
- `modules/dns-native/__tests__/` (multipart tests)

**Out of scope** (do NOT touch):
- Any file under `app/`, `src/components/`, `src/navigation/`, `src/ui/`, `src/i18n/` — owned by another session in this same worktree.
- `modules/dns-native/android/DNSResolver.java` and `android/app/src/main/java/**` — the Java copies are synced by `verify:dnsresolver-sync`; no Java change is required by this plan.
- Server selection order, sanitization rules, success-path parsing.
- `package.json`, `bun.lock` (Plan 003 owns dependency changes).

## Git workflow

Work directly on the current branch `worktree-ios26-ui-redesign`. Do NOT
commit, push, or touch `.git` — the operator reviews and commits by path.

## Steps

### Step 1: Global wall-clock budget for `queryLLM`

In `src/services/dnsService.ts`, add a module-level constant
`TOTAL_QUERY_BUDGET_MS = 20000` next to the existing `TIMEOUT` constant, with a
comment stating the invariant: *total elapsed time for one `queryLLM` call
across all servers × retries × transports must not exceed this budget*.
Thread a `deadline = Date.now() + TOTAL_QUERY_BUDGET_MS` from the top of
`queryLLM` into `queryWithServer`'s retry loop: before starting each attempt
and each method, if `Date.now() >= deadline`, throw
`new DNSError(DNSErrorType.TIMEOUT, "DNS query budget exhausted")` (reuse the
existing timeout error type — check the enum name; if it is `QUERY_TIMEOUT` or
similar, use that). Also cap each per-method `withTimeout` at
`Math.min(this.TIMEOUT, deadline - Date.now())`.

Success paths must be unaffected: a response that arrives within budget
behaves exactly as before.

**Verify**: `bun run typecheck` → exit 0; `bun run test -- --testPathPattern='dnsService'` → pass.

### Step 2: Characterization test for the budget

Add to `__tests__/dnsService.spec.ts` (follow its existing mock style): a test
where every transport hangs (never resolves) using fake timers, asserting
`queryLLM` rejects with the budget error after advancing timers by
`TOTAL_QUERY_BUDGET_MS`, and a test that a fast successful response still
resolves normally.

**Verify**: `bun run test -- --testPathPattern='dnsService'` → pass, including the 2 new tests.

### Step 3: TCP zero/short frame rejection

In the TCP data handler in `src/services/dnsService.ts` (~1146), replace the
`expectedLength === 0` sentinel with an explicit `prefixConsumed` boolean, and
reject declared frame lengths `< 12` (DNS header size):

```ts
if (!prefixConsumed && responseBuffer.length >= 2) {
  expectedLength = readTcpFrameLength(responseBuffer);
  responseBuffer = responseBuffer.subarray(2);
  prefixConsumed = true;
  if (expectedLength < 12) {
    reject(new DNSError(DNSErrorType.INVALID_RESPONSE, `Invalid TCP frame length: ${expectedLength}`));
    /* also destroy/cleanup the socket the same way neighboring error paths do */
    return;
  }
}
```

Match the surrounding cleanup idiom (socket destroy + timeout clear) used by
the adjacent error branches in the same handler.

**Verify**: `bun run typecheck` → exit 0.

### Step 4: Test the TCP framing fix

Add tests (new file `__tests__/dnsService.tcpFraming.spec.ts` or extend the
existing TCP tests if `dnsService.spec.ts` already mocks
`react-native-tcp-socket` — check first): (a) a frame with declared length 0
rejects with `INVALID_RESPONSE`; (b) a valid response split across two chunks
still parses (regression guard).

**Verify**: `bun run test -- --testPathPattern='tcpFraming|dnsService'` → pass.

### Step 5: Reject mixed plain+multipart TXT sets

In `modules/dns-native/index.ts` `parseMultiPartResponse`: if
`hasPlainResponse && parts.length > 0`, throw
`new DNSError(DNSErrorType.INVALID_RESPONSE, "Mixed plain and multipart TXT records")`
instead of returning the plain records. All-plain and all-multipart behavior
unchanged.

**Verify**: `cd modules/dns-native && bun run test` → pass.

### Step 6: Test the multipart rejection

In the dns-native test workspace, add cases: mixed set throws
`INVALID_RESPONSE`; all-plain still returns concat; all-multipart still
reassembles in order (the last two likely exist — extend, don't duplicate;
check `__tests__/dnsService.parse.spec.ts` in the root workspace too, which
covers reassembly, and put the mixed-set test wherever `parseMultiPartResponse`
is directly exercised today).

**Verify**: `cd modules/dns-native && bun run test` → pass; `bun run test -- --testPathPattern='parse'` → pass.

### Step 7: Swift UDP cleanup parity

In `modules/dns-native/ios/DNSResolver.swift` `performUDPQueryInternal`, add at
the top of the connection-owning scope the same pattern TCP uses:

```swift
defer {
  connection.stateUpdateHandler = nil
  connection.cancel()
}
```

Then remove any now-redundant explicit `connection.cancel()` calls inside that
function ONLY if the `defer` provably covers them (keep the
`withTaskCancellationHandler onCancel` cancel — it runs on a different path).
Mirror `performTCPQueryInternal` exactly. Do not change any other Swift logic.

**Verify**: visual diff only (`git diff modules/dns-native/ios/DNSResolver.swift`) — the diff must show only the `defer` insertion and (optionally) removal of redundant cancels inside the same function.

### Step 8: Full gates

**Verify**: `bun run typecheck` → exit 0; `bun run lint` → exit 0; `bun run test` → all pass; `cd modules/dns-native && bun run test` → all pass.

## Test plan

Covered in steps 2, 4, 6. Model new tests after `__tests__/dnsWire.spec.ts`
(hand-built packets) and the transport mocks already present in
`__tests__/dnsService.spec.ts`.

## Done criteria

- [ ] `bun run typecheck` exits 0
- [ ] `bun run test` exits 0 with new tests for: budget exhaustion, fast-path unaffected, zero-length TCP frame, mixed multipart rejection
- [ ] `cd modules/dns-native && bun run test` exits 0
- [ ] `git diff --name-only` shows ONLY in-scope files
- [ ] Swift diff is limited to the `defer` parity change
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at the cited locations doesn't match the excerpts (drift).
- `__tests__/dnsService.spec.ts` mocking style cannot simulate a hanging
  transport without real timers leaking (report instead of adding sleeps).
- The fix appears to require changing `modules/dns-native/android/**` or any
  out-of-scope file.
- The `DNSErrorType` enum has no suitable timeout/invalid-response member.

## Maintenance notes

- The budget constant interacts with `MAX_NATIVE_ATTEMPTS` in
  `modules/dns-native/constants.ts` (documented multiplicative behavior around
  lines 181–192). If native retry counts change, revisit the 20s budget.
- Reviewer should scrutinize: per-method `withTimeout` clamp math (no negative
  timeouts) and that the UDP Swift `defer` does not double-cancel a connection
  the task-cancellation handler already cancelled (NWConnection.cancel() is
  idempotent, but stateUpdateHandler=nil ordering matters).
- Deferred (out of this plan): source-address validation for hostname resolvers
  on the JS dgram UDP path (SEC finding; needs a resolve step and anycast
  analysis — see plans/README.md "considered and rejected/deferred").
