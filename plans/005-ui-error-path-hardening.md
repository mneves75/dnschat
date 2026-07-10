# Plan 005: Harden UI error paths in Logs, GlassChatList and chat route

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 2739cf2..HEAD -- src/navigation/screens/Logs.tsx src/navigation/screens/GlassChatList.tsx 'app/chat/[threadId].tsx' src/navigation/screens/Chat.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S–M
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `2739cf2`, 2026-07-10 (working tree also carries uncommitted SDK-57 patch-alignment changes to package.json/bun.lock/ios/Podfile.lock — that is expected, not drift)

## Why this matters

Four UI flows swallow promise rejections or lock UI state permanently on
failure: the Logs pull-to-refresh spinner never stops if the reload throws,
"New chat" can double-fire and has no error feedback, the initial chat-list
load has no rejection handler (skeleton can persist forever), and the
auto-create-chat route guard never retries after a failed create. A fifth,
smaller issue: a dismissed error toast never re-appears when the identical
error message recurs. These are the app's most user-visible failure modes.

## Current state

- `src/navigation/screens/Logs.tsx:91-95` — no try/finally:
  ```ts
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };
  ```
  Compare with the correct pattern in `GlassChatList.tsx` `handleRefresh`
  (uses `.finally`).

- `src/navigation/screens/GlassChatList.tsx:309-321` — no in-flight guard, no
  try/catch:
  ```ts
  const handleNewChat = async () => {
    const newChat = await createChat();
    setCurrentChat(newChat);
    push({ pathname: "/chat/[threadId]", params: { threadId: newChat.id } });
    ...
  ```
  The guarded exemplar lives at `app/(tabs)/index.tsx:14-35` (boolean
  in-flight ref + try/catch). Match it.

- `src/navigation/screens/GlassChatList.tsx:288-298` — mount load without
  `.catch`:
  ```ts
  React.useEffect(() => {
    let isMounted = true;
    loadChats().then(() => {
      if (isMounted && !hasLoadedOnce) {
        setHasLoadedOnce(true);
      }
    });
  ```

- `app/chat/[threadId].tsx:73-89` — `lastAttemptedRef.current = "new"` is set
  before `createChat()`; the `.catch` only calls `devWarn`, never resets the
  ref, so the guard at the top returns forever and the user is stuck with no
  active thread and no error UI.

- `src/navigation/screens/Chat.tsx:77,131` and
  `src/navigation/screens/GlassChatList.tsx:284-285` — dismissal by string
  equality:
  ```ts
  const visibleError = error && error !== dismissedError ? error : null;
  ```
  A recurring identical error string stays suppressed after one dismissal.

- Bonus (same file, trivial perf fix, [PERF-03]):
  `src/navigation/screens/GlassChatList.tsx:456-458` and `:466-472` compute
  `chats.reduce((t,c)=>t+c.messages.length,0)` TWICE inline in JSX. Compute
  once into a local and derive the average from it.

Repo conventions: TypeScript strict, no `any` (ast-grep blocks it). React
Compiler is enabled — do NOT add `useMemo`/`useCallback`; plain functions and
`useRef`/`useState` are fine. i18n strings must exist in BOTH
`src/i18n/messages/en-US.ts` and `pt-BR.ts` (parity test enforces it) — for
error feedback reuse existing error keys where possible.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `bun run typecheck`      | exit 0              |
| Lint      | `bun run lint`           | exit 0              |
| Tests     | `bun run test`           | all pass            |
| Focused   | `bun run test -- --testPathPattern=glassChatList` | pass |

## Scope

**In scope** (the only files you may modify):
- `src/navigation/screens/Logs.tsx`
- `src/navigation/screens/GlassChatList.tsx`
- `src/navigation/screens/Chat.tsx`
- `app/chat/[threadId].tsx`
- New/updated test files under `__tests__/`

**Out of scope** (do NOT touch):
- `src/context/ChatContext.tsx` (error emission shape stays as-is; plan 008
  owns its tests)
- `app/(tabs)/index.tsx` (it is the exemplar, already correct)
- Anything in `src/services/`

## Git workflow

Work directly in the current working tree. Do NOT commit, push, or touch
`.git` — the operator reviews and commits.

## Steps

### Step 1: Fix Logs pull-to-refresh spinner lock

In `Logs.tsx` wrap the refresh in try/finally:
```ts
const handleRefresh = async () => {
  setRefreshing(true);
  try {
    await loadLogs();
  } finally {
    setRefreshing(false);
  }
};
```
NOTE the repo's React Compiler convention (CLAUDE.md): `try/finally` **blocks**
are disallowed in compiled component code — use `Promise.prototype.finally()`
instead if `bun run verify:react-compiler` complains:
```ts
const handleRefresh = () => {
  setRefreshing(true);
  loadLogs()
    .catch(() => {})
    .finally(() => setRefreshing(false));
};
```
Prefer the promise form to stay within convention.

**Verify**: `bun run verify:react-compiler` → exit 0 (103/103 or higher).

### Step 2: Guard handleNewChat and surface failures

In `GlassChatList.tsx`, mirror `app/(tabs)/index.tsx`: add an in-flight
`useRef(false)` guard, wrap the create+navigate in try/catch, and on failure
surface the error through the SAME mechanism the screen already uses for
context errors (the dismissable toast fed by `visibleError`) — a local error
state merged into the toast display is acceptable. Reset the guard in a
trailing statement or `.finally`.

**Verify**: `bun run typecheck` → exit 0.

### Step 3: Handle mount-load rejection

Add `.catch` to the `loadChats()` mount effect: still set `hasLoadedOnce`
(so the skeleton yields to the empty/error state) and record the error for
the toast.

**Verify**: `bun run test -- --testPathPattern=glassChatList` → pass.

### Step 4: Reset auto-create guard on failure

In `app/chat/[threadId].tsx`, in the `.catch` of `createChat()`, reset
`lastAttemptedRef.current = null` so a re-render can retry, keeping the
existing `devWarn`.

**Verify**: `bun run test -- --testPathPattern=chatRoute` → all pass.

### Step 5: Make dismissed errors re-notify on recurrence

The cleanest minimal fix without touching ChatContext: when the user sends a
new message (or triggers a new action), clear `dismissedError`. In both
`Chat.tsx` and `GlassChatList.tsx`, reset `setDismissedError(null)` at the
start of the action that can produce a new error (send flow entry point in
`Chat.tsx`; `handleNewChat`/refresh in `GlassChatList.tsx`). Do NOT change the
`error` shape in ChatContext.

**Verify**: `bun run typecheck` → exit 0.

### Step 6: De-duplicate the stats reduction

In `GlassChatList.tsx`, compute `const totalMessages = chats.reduce(...)`
once (plain local, no memo hooks) and use it for both the total and the
average.

**Verify**: `bun run lint` → exit 0.

## Test plan

- Extend or add a spec (model after existing hermetic screen specs, e.g.
  `__tests__/glassForm.scroll.contract.spec.ts` style or an existing
  glassChatList spec if present) covering:
  - `handleRefresh` failure leaves `refreshing === false` (Logs).
  - Double-tap "new chat" creates exactly one chat (mock `createChat`).
  - Mount `loadChats` rejection still renders (no skeleton lock).
- Verification: `bun run test` → all pass, no suite regressions.

## Done criteria

- [ ] `bun run typecheck` exits 0
- [ ] `bun run lint` exits 0
- [ ] `bun run test` exits 0 with new/updated tests present
- [ ] `bun run verify:react-compiler` exits 0
- [ ] `grep -n "setRefreshing(true);\s*$" src/navigation/screens/Logs.tsx` — the refresh path visibly routes through catch/finally
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- The excerpts above don't match the live code (drift).
- Fixing step 5 seems to require changing `ChatContext`'s error emission —
  STOP; that is out of scope.
- Any verification fails twice after a reasonable fix attempt.

## Maintenance notes

- If ChatContext later exposes error objects with identity/timestamps, replace
  the step-5 heuristic with identity comparison.
- Reviewer should scrutinize: no `useCallback`/`useMemo` additions (React
  Compiler), no `try/finally` blocks in compiled code, i18n parity untouched.
