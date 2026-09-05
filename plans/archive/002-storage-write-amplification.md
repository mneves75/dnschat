# Plan 002: Eliminate chat-history write amplification (coalesce per-send writes)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If a
> "STOP condition" occurs, stop and report — do not improvise. Update this
> plan's row in `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat b69b6ab..HEAD -- src/services/storageService.ts src/context/ChatContext.tsx`
> On any mismatch with the "Current state" excerpts, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (critical data path — persistence + cache invariant)
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `b69b6ab`, 2026-07-04

## Why this matters

Every sent message triggers three read-modify-write cycles, each serializing
the ENTIRE chat history, AES-GCM-encrypting the whole blob, and writing it to
AsyncStorage. Cost scales with total history size per message, not O(1). In a
long conversation, persistence becomes the dominant JS-thread cost of typing.
This plan coalesces the three writes of a single `sendMessage` into one,
turning 3× full-history writes per message into 1× — a low-risk, high-leverage
win that does not change the storage format (no migration).

## Current state

- `src/services/storageService.ts`:
  - `saveChats(chats)` (~lines 173–200): `serializeChats` → `encryptString`
    (AES-GCM) → `AsyncStorage.setItem(CHATS_KEY, blob)` — full array every call.
  - `mutateChats(label, mutate)` (~lines 90–111): the single choke point;
    `queueOperation(async () => { load → mutate → saveChats(chats) → cache = chats })`.
    Every mutation calls `saveChats`.
- `src/context/ChatContext.tsx` — one `sendMessage` performs three mutations:
  add user message (~line 257), add assistant placeholder (~line 296),
  update assistant message with the response (~line 345). Each currently maps
  to a `StorageService` call that individually persists.

Verify the exact `StorageService` methods `ChatContext.sendMessage` calls
(e.g. `addMessage`, `updateMessage`) before changing anything — the fix batches
at whichever boundary those calls cross.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Typecheck | `bun run typecheck` | exit 0 |
| Tests (scoped) | `bun run test -- --testPathPattern='storage\|chatContext\|ChatContext'` | pass |
| Lint | `bun run lint` | exit 0 |

## Scope

**In scope**:
- `src/services/storageService.ts`
- `src/context/ChatContext.tsx`
- Their spec files under `__tests__/` (extend; do not rewrite unrelated cases)

**Out of scope**:
- Storage format / encryption scheme (no migration in this plan).
- `app/`, `src/components/`, `src/navigation/`, `src/ui/` — owned by another session.
- MMKV migration or per-chat key sharding — explicitly deferred (see Maintenance).

## Git workflow

Work on the current branch. Do NOT commit/push/touch `.git`. Operator commits by path.

## Steps

### Step 1: Add a batched mutation entry point

In `storageService.ts`, add a method that applies MULTIPLE message operations to
a single chat within ONE `mutateChats` call, e.g.:

```ts
static appendAndUpdateMessages(
  chatId: string,
  ops: (chat: Chat) => void, // mutates the single chat in place
): Promise<Chat>
```

It loads once, finds the chat, applies `ops`, and calls `saveChats` exactly
once. Preserve the existing cache contract (commit cache on success, invalidate
on failure) — reuse `mutateChats` rather than hand-rolling the queue.

If the existing per-op methods (`addMessage`/`updateMessage`) must stay for
other callers, keep them; this adds a batched path, it does not remove the
granular one.

**Verify**: `bun run typecheck` → exit 0.

### Step 2: Route `sendMessage` through the batched path

In `ChatContext.tsx` `sendMessage`, replace the three sequential persist calls
with: optimistic in-memory state updates for immediate UI feedback (keep those
so the UI still updates per-step), then a SINGLE persistence call at the points
where a write is actually required:
- one persisted write after the user message + placeholder are added (they
  happen back-to-back), and
- one persisted write when the response (or error status) arrives.

That is 2 writes per send instead of 3, each touching one `saveChats`. If the
placeholder and user-message additions can be a single in-memory update, prefer
one persisted write for both. Do NOT drop a persist that is needed for crash
recovery of the in-flight user message.

**Verify**: `bun run test -- --testPathPattern='ChatContext|chatContext'` → pass.

### Step 3: Characterization test for write count

Add a test (extend the storage or ChatContext spec) that mocks
`AsyncStorage.setItem` and asserts a single `sendMessage` round trip results in
≤ 2 `setItem` calls (was 3), while the final persisted state contains the user
message and the assistant response. Model the mock after existing
`storageService` specs.

**Verify**: `bun run test -- --testPathPattern='storage|ChatContext'` → pass, new test included.

### Step 4: Full gates

**Verify**: `bun run typecheck` → 0; `bun run lint` → 0; `bun run test` → all pass.

## Test plan

- New: "sendMessage persists at most twice and final state is correct."
- Regression: existing storage specs (cache invariant, corruption recovery)
  still pass unchanged.

## Done criteria

- [ ] `bun run typecheck` exits 0
- [ ] `bun run lint` exits 0
- [ ] `bun run test` exits 0, new write-count test present and green
- [ ] A single `sendMessage` triggers ≤ 2 `AsyncStorage.setItem` calls (asserted)
- [ ] `git diff --name-only` shows only in-scope files
- [ ] `plans/README.md` updated

## STOP conditions

- `sendMessage` state machine cannot batch without dropping crash-recovery of
  the in-flight user message → report the trade-off instead of guessing.
- Reducing writes breaks the storage cache invariant test.
- The change would require touching the encryption or serialization format.

## Maintenance notes

- Deferred follow-up (bigger win, separate plan): move from a single encrypted
  blob to per-chat keys or an append log, so one mutation touches only the
  affected chat (O(1) instead of O(total history)); consider MMKV. Not in scope
  here — this plan is the safe, format-preserving coalescing step.
- Reviewer should confirm no path persists the assistant placeholder alone in a
  way that could survive a crash as a dangling "sending" bubble with no retry.
