# Plan 008: Behavioral tests for the ChatContext error-recovery path and the UDP anti-spoofing loop

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. On
> any STOP condition, stop and report. When done, update the status row in
> `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 2739cf2..HEAD -- src/context/ChatContext.tsx src/services/dnsService.ts __tests__/chatContext.raceCondition.spec.ts __tests__/dnsService.tcpFraming.spec.ts`
> On excerpt mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW (additive tests; no production code changes except NONE —
  if a test exposes a real bug, STOP and report, do not fix here)
- **Depends on**: none — BUT run AFTER plans 005-007 land so you test the
  final code state
- **Category**: tests
- **Planned at**: commit `2739cf2`, 2026-07-10

## Why this matters

The two most dangerous code paths have no runtime assertions. (1)
`ChatContext.sendMessage`'s catch block — which previously shipped a critical
"messages in storage but not in UI" race bug — is "covered" only by a spec
that greps the source file for comment strings; any logic regression passes.
(2) The UDP transport's RFC 5452 anti-spoofing property (drop invalid
datagrams, KEEP listening) has no socket-level test; a regression to a
`once`-style handler — killing queries on the first forged packet — would
pass the whole suite. TCP's equivalent already has a proper mock-socket test
to model from.

## Current state

- `src/context/ChatContext.tsx:374-451` — the sendMessage catch block:
  persists the assistant message as `status:"error"` (two branches: message
  already persisted → `updateMessage`, not yet → `addMessage`) and reloads
  chats preserving the active thread. Read the block in full before writing
  tests.
- `__tests__/chatContext.raceCondition.spec.ts:16-117` — the source-grep spec
  (`fs.readFileSync` + `toContain("const chatIdAtSend = currentChat.id;")`
  etc.). Keep it (it documents invariants) but it is NOT behavioral coverage.
- `src/services/dnsService.ts:848-987` — `performNativeUDPQuery`: persistent
  `socket.on('message', ...)` handler at `:946-968` that validates each
  datagram via `extractTxtRecordsFromDecodedResponse` and on validation error
  logs + KEEPS WAITING (drop-and-continue). Cleanup/resolve only on a valid
  response; `setTimeout(this.TIMEOUT)` timeout path.
- Existing stubs that do NOT cover this: `__tests__/dnsService.nativeRetry.spec.ts:69`
  (`jest.spyOn(...,"performNativeUDPQuery").mockResolvedValue`).
- The structural exemplar: `__tests__/dnsService.tcpFraming.spec.ts:117-158`
  — mock `react-native-tcp-socket` emitting chunked frames. Mirror this
  pattern for `react-native-udp`.

Repo test conventions (IMPORTANT):
- Suite runs `jest --runInBand`. Behavioral specs that boot the real
  DNSService MUST mock at module boundaries to avoid polluting the shared RN
  `Platform.OS` mock (documented landmine). Follow how
  `dnsService.tcpFraming.spec.ts` isolates its mocks (jest.mock of the
  transport module + fresh `jest.resetModules()` per test where needed).
- Reanimated is mocked globally via `moduleNameMapper` →
  `__tests__/mocks/react-native-reanimated.js` (already in place; render
  tests work).
- No `any` — type mock payloads properly.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| New UDP spec | `bun run test -- --testPathPattern=udpDatagram` | pass |
| New context spec | `bun run test -- --testPathPattern=chatContext` | pass |
| Full suite | `bun run test` | all pass |
| Typecheck | `bun run typecheck` | exit 0 |

## Scope

**In scope** (create/modify ONLY tests):
- `__tests__/dnsService.udpDatagram.spec.ts` (create)
- `__tests__/chatContext.errorRecovery.spec.tsx` (create)
- `__tests__/chatContext.raceCondition.spec.ts` (optional: add a header
  comment pointing to the new behavioral spec; do not delete assertions)

**Out of scope**:
- ANY production source change. If a new test fails against current code,
  that is a finding — STOP and report which assertion fails and why.
- Converting other policy specs (backlog item TEST-03).

## Git workflow

Work in the current tree. Do NOT commit or push.

## Steps

### Step 1: UDP datagram-drop spec

Create `__tests__/dnsService.udpDatagram.spec.ts` modeled on
`dnsService.tcpFraming.spec.ts`:
- `jest.mock("react-native-udp")` with a fake socket exposing
  `createSocket`, `on`, `send`, `close`, capturing the `'message'` handler.
- Build a REAL DNS response buffer for the query (use the encode/decode
  helpers from `src/services/dnsWire.ts` — the tcpFraming spec shows how to
  build a valid TXT response; reuse its helper approach).
- Case A (anti-spoofing): emit first a datagram with a WRONG transaction ID
  (or wrong question name), then the valid response. Assert the promise
  resolves with the TXT payload from the valid one — i.e., the forged packet
  was dropped and the listener kept waiting.
- Case B (timeout): with fake timers, emit only forged datagrams; advance
  past the timeout; assert rejection with the timeout error and that
  `socket.close` was called exactly once.
- Case C (success first try): valid datagram resolves; `close` called once.

**Verify**: `bun run test -- --testPathPattern=udpDatagram` → 3+ tests pass.

### Step 2: ChatContext error-recovery spec

Create `__tests__/chatContext.errorRecovery.spec.tsx`:
- Render `ChatProvider` (from `src/context/ChatContext.tsx`) with
  `jest.mock("../src/services/dnsService")` (queryLLM rejecting) and
  `jest.mock("../src/services/storageService")` with an in-memory fake that
  records calls (addMessage/updateMessage/save).
- Case A: DNS rejects AFTER the assistant placeholder was persisted → assert
  the placeholder is updated to `status:"error"` (via updateMessage) and the
  thread still contains user + assistant messages.
- Case B: DNS rejects BEFORE persistence (make the storage fake fail the
  first persist) → assert the addMessage fallback branch writes the error
  message.
- Case C: after recovery, the active chat id is preserved (no thread switch).
- Use the resilient accessibility hooks convention — no AccessibilityProvider
  needed; wrap only in the providers ChatProvider requires (check its imports;
  SettingsProvider may be needed — mock `useSettings` if simpler, following
  existing context specs under `__tests__/`).

**Verify**: `bun run test -- --testPathPattern=chatContext` → new suite passes
AND the existing raceCondition spec still passes.

### Step 3: Full-suite regression

**Verify**: `bun run test` → all pass; `bun run typecheck` → exit 0;
`bun run lint` → exit 0.

## Test plan

This plan IS the test plan (steps above enumerate cases).

## Done criteria

- [ ] `__tests__/dnsService.udpDatagram.spec.ts` exists; ≥3 tests, including
      the forged-then-valid drop case, all passing
- [ ] `__tests__/chatContext.errorRecovery.spec.tsx` exists; ≥3 tests covering
      both catch branches + thread preservation, all passing
- [ ] `bun run test` exits 0 (no regressions in the 964+ existing tests)
- [ ] `git status` shows ONLY new/modified test files
- [ ] `plans/README.md` status row updated

## STOP conditions

- A new assertion fails against current production code → report the exact
  failing behavior (this is a real bug find, not a test bug) — do NOT patch
  production code.
- You cannot drive `performNativeUDPQuery` without touching production code
  (e.g. it is not reachable with mocks) → report what refactor would be
  needed instead of doing it.
- The Platform.OS mock pollution landmine bites (unrelated suites start
  failing) → isolate with `jest.resetModules`/scoped mocks; if still failing,
  STOP and report.

## Maintenance notes

- These specs become the characterization base that unblocks the deferred
  god-module split of `dnsService.ts` (ARCH-02) and the redaction-engine
  extraction (ARCH-03).
- Follow-up backlog: TEST-03 (triage remaining source-grep specs on runnable
  TS logic), TEST-04 (ClipboardService unit test).
