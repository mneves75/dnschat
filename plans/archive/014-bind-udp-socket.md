# Plan 014: Bind the UDP socket so the JS UDP transport can actually send

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 749334c..HEAD -- src/services/dnsService.ts __tests__/dnsService.udpDatagram.spec.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW-MED
- **Depends on**: none (but land 013 first if both are queued — see Maintenance)
- **Category**: bug
- **Planned at**: commit `749334c`, 2026-07-28

## Why this matters

This app's whole premise is sending prompts as DNS TXT queries through a
fallback chain: native DNS, then UDP, then TCP, then mock. The UDP rung is
broken and always has been. `performNativeUDPQuery` creates a socket and calls
`send()` on it without ever binding it, and `react-native-udp` throws
`ERR_SOCKET_BAD_PORT` from `send()` on an unbound socket. So on Android — the
only platform routed through this code path, since iOS uses the native module —
UDP fails instantly on every attempt, burning a fallback slot and a log entry.

The failure is also actively misleading: the error handler special-cases that
exact error and relabels it "UDP port 53 blocked by network/iOS - automatic
fallback to TCP", which sends anyone debugging toward their firewall instead of
toward a missing `bind()`. That the special case exists at all suggests the
symptom was seen in the field and misdiagnosed.

After this plan, UDP is attempted for real, and a bind failure reports itself
as a bind failure.

## Current state

Files involved:

- `src/services/dnsService.ts:860-1000` — `performNativeUDPQuery`, the JS UDP
  transport.
- `__tests__/dnsService.udpDatagram.spec.ts` — the UDP suite, whose mock socket
  does not model the bound/unbound state machine, which is why the suite passes
  against a socket the real library would reject.

The socket is created and never bound (`src/services/dnsService.ts:870`):

```ts
      const socket = dgram.createSocket('udp4');
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      let settled = false;
```

`grep -n "\.bind(" src/services/dnsService.ts` returns nothing.

The send happens directly on that unbound socket
(`src/services/dnsService.ts:982-994`):

```ts
        socket.send(
          queryBuffer,
          0,
          queryBuffer.length,
          port,  // Use the allowlisted resolver port
          dnsServer,
          (error?: unknown) => {
            if (error) {
              const message = getErrorMessage(error);
              onError(new Error(`Failed to send UDP packet to ${dnsServer}:${port}: ${message}`));
            }
          },
        );
```

The installed library rejects that (`node_modules/react-native-udp/src/UdpSocket.js`,
version 4.1.7, whose `package.json` `main` is `src/index.js`):

```js
    this._state = STATE.UNBOUND            // line 36, in the constructor
...
  send(msg, offset, length, port, address, callback) {
    if (this._state === STATE.UNBOUND) throw new Error('ERR_SOCKET_BAD_PORT')   // line 229
```

Note this is a **synchronous throw**, not a callback error, so it lands in the
enclosing `try` and reaches `onError` at `src/services/dnsService.ts:995`,
where it is relabelled (`src/services/dnsService.ts:907-916`) as a blocked
port.

The mock that hides it (`__tests__/dnsService.udpDatagram.spec.ts:33-42`) —
`send()` has no state precondition and no `bind` method exists at all:

```ts
  send(
    query: Uint8Array,
    _offset: number,
    _length: number,
    _port: number,
    _address: string,
    callback: (error?: unknown) => void,
  ): void {
    callback();
    currentBehavior.emitResponses(query, this);
  }
```

Conventions this code follows, which your change must preserve:

- The `settled` flag plus `cleanup()` (`src/services/dnsService.ts:876-885`)
  guarantee the socket is closed exactly once. Every new async path must route
  its failure through the existing `onError`, never call `reject` directly.
- The timeout is armed before the send (`src/services/dnsService.ts:939-941`,
  `this.TIMEOUT`). Keep it armed before bind too, so a hanging bind cannot
  outlive the budget.
- The `'message'` listener is deliberately persistent, not `once`, as
  anti-spoofing (see the comment at `src/services/dnsService.ts:944-950`). Do
  not convert it to `once`.
- The repo bans emoji in tracked files (`__tests__/repo.noEmoji.spec.ts`) and
  bans `console.*` in `src/` outside three allowlisted files
  (`__tests__/repo.noConsoleLog.spec.ts`). Use `devLog` from
  `src/utils/devLog.ts` if you need logging.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install --frozen-lockfile` | exit 0 |
| Typecheck | `pnpm run typecheck` | exit 0, no output |
| UDP suite | `pnpm run test --testPathPattern=dnsService.udpDatagram` | all pass |
| DNS suites | `pnpm run test --testPathPattern=dnsService` | all pass |
| Full suite | `pnpm run test` | 129 suites passed, 1 skipped |
| Offline transport harness | `pnpm run dns:harness --message "test message" --local-server` | completes against the local server |

Two environment notes that will otherwise cost you an hour:

- **Never put a `--` separator before a script's flags.** pnpm forwards `--`
  literally, so `pnpm run test -- --bail` matches zero tests and exits 1.
- **Use the Node version in `.node-version` (24).** Example:
  `PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH" pnpm run test`.
- If `pnpm run test` fails in `__tests__/repo.noCredentials.spec.ts` with
  "project.pbxproj contains DEVELOPMENT_TEAM entries", the operator's tree has
  a local iOS signing team set. Pre-existing and unrelated. Report it; do not
  edit the pbxproj.

## Scope

**In scope** (the only files you should modify):

- `src/services/dnsService.ts` — `performNativeUDPQuery` only
- `__tests__/dnsService.udpDatagram.spec.ts` — the mock socket and new cases

**Out of scope** (do NOT touch, even though they look related):

- `modules/dns-native/` — the native iOS/Android resolvers have their own
  socket lifecycles and their own timeout budgets. This bug is JS-only.
- The TCP transport (`performNativeTCPQuery` and friends) — `react-native-tcp-socket`
  has a different lifecycle and is not affected.
- The error-classification block at `src/services/dnsService.ts:907-916`. You
  may **add** a distinct bind-failure message, but do not delete the existing
  `ERR_SOCKET_BAD_PORT` branch: a genuinely blocked port can still surface
  errors there, and removing it changes user-visible messaging beyond this fix.
- `DNSService.TIMEOUT` and `TOTAL_QUERY_BUDGET_MS` — timing policy is a
  separate finding about the Android native path.

## Git workflow

- Branch: `advisor/014-bind-udp-socket`
- Conventional Commits, matching this repo's history. Example from `git log`:
  `fix: apply remaining improve-deep audit fixes and pnpm supply-chain hardening`
  For this plan: `fix(dns): bind the UDP socket before sending`
- Do NOT push and do NOT open a PR.

## Steps

### Step 1: Make the mock model the real state machine, and watch the suite go red

Before changing production code, add the precondition to the mock in
`__tests__/dnsService.udpDatagram.spec.ts`: give `MockUdpSocket` a `_bound`
flag defaulting to false, a `bind(port, callback)` method that sets it and
invokes the callback asynchronously (and emits `'listening'`), and make
`send()` throw `new Error('ERR_SOCKET_BAD_PORT')` when `_bound` is false —
mirroring `react-native-udp/src/UdpSocket.js:229`.

**Verify**: `pnpm run test --testPathPattern=dnsService.udpDatagram` now
**fails**. That red suite is the reproduction. If it still passes, the mock is
not on the path the code uses — STOP.

### Step 2: Bind before sending

In `performNativeUDPQuery`, bind to an ephemeral port (port `0`) and move the
send into the bind completion path. Route any bind error through the existing
`onError` so `cleanup()` still runs exactly once, and keep the timeout armed
before the bind so a bind that never completes is still bounded.

Give the bind failure its own message (something like
`Failed to bind UDP socket: <message>`) so it is distinguishable in the Logs
screen from a genuinely blocked port.

**Verify**: `pnpm run test --testPathPattern=dnsService.udpDatagram` passes
again, now against a mock that enforces the precondition.

### Step 3: Cover the bind-failure path

Add a case where `bind` invokes its callback with an error (or emits
`'error'`), and assert that the promise rejects with the bind-specific message
and that the socket was closed exactly once (the mock already exposes
`close` as a `jest.fn()`).

Add a case asserting `bind` is called before `send` — the ordering is the
invariant this whole plan exists to establish.

**Verify**: `pnpm run test --testPathPattern=dnsService.udpDatagram` → all
pass, including the new cases.

### Step 4: Confirm no other suite depended on the old behavior

**Verify**: `pnpm run test --testPathPattern=dnsService` passes, then
`pnpm run test` passes in full.

### Step 5: Exercise the real transport if a local server is available

**Verify**: `pnpm run dns:harness --message "test message" --local-server`
completes. If the harness cannot run in your environment, say so explicitly in
your report rather than claiming transport-level proof.

## Test plan

New cases in `__tests__/dnsService.udpDatagram.spec.ts`:

- `bind` is called before `send` (ordering invariant).
- A successful query still resolves end to end, through bind then send, with
  the existing anti-spoofing datagram-drop behavior intact (the suite already
  covers forged-datagram dropping — keep those cases passing unchanged).
- A bind error rejects with the bind-specific message and closes the socket
  once.
- The unbound-send precondition in the mock stays in place permanently, so this
  regression cannot return.

Structural pattern: the file's existing `MockUdpSocket` and
`currentBehavior` harness. Extend it; do not rewrite it.

## Done criteria

ALL must hold:

- [ ] `src/services/dnsService.ts` calls `socket.bind(...)` before `socket.send(...)` in `performNativeUDPQuery`
- [ ] `MockUdpSocket.send` throws `ERR_SOCKET_BAD_PORT` when the socket is unbound, and the suite passes with that precondition in place
- [ ] New cases cover bind-before-send ordering and bind failure
- [ ] Bind failures produce a message distinct from the blocked-port message
- [ ] The existing anti-spoofing cases still pass, and the `'message'` listener is still persistent (not `once`)
- [ ] `pnpm run typecheck` exits 0
- [ ] `pnpm run test` passes
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Step 1 does not turn the suite red. That means the production code is not
  reaching this mock and the reproduction is invalid.
- `react-native-udp` in `node_modules` is not version 4.1.7, or
  `src/UdpSocket.js` no longer throws on unbound send. Re-read the installed
  source and report what it does instead.
- Binding to port 0 turns out to require a permission or platform capability
  the app does not have. Report the exact error; do not switch to a fixed port
  (a fixed source port would weaken the anti-spoofing properties the persistent
  `'message'` listener exists to protect).
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- Land plan 013 (`--passWithNoTests`) first if both are queued. Not a hard
  dependency, but this plan's proof rests entirely on the test suite actually
  running, and 013 removes the flag that lets a suite silently disappear.
- The bug survived because the mock was more permissive than the library. When
  adding future transport mocks, model the failure preconditions first — a mock
  that cannot reject is a mock that cannot catch anything.
- A reviewer should check that `cleanup()` still cannot run twice across the new
  bind path, and that the timeout is armed before the bind rather than after.
- Deliberately deferred: the Android native resolver's missing overall timeout
  budget, and the fact that `getLLMServers()` returns a single server so the
  server-level fallback loop is unreachable. Both are separate findings.
