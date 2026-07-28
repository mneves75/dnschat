# Plan 015: Show the chats that corruption recovery actually salvaged

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 749334c..HEAD -- src/context/ChatContext.tsx src/services/storageService.ts __tests__/chatContext.errorRecovery.spec.tsx __tests__/storageService.corruption.spec.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `749334c`, 2026-07-28

## Why this matters

Local chat history is the only data this app stores, and there is no server
copy. `StorageService` already has a careful corruption-recovery path: it
quarantines the single bad record, backs up the original payload, and returns
every chat that survived. `ChatContext` calls that recovery and then throws the
result away, setting the chat list to `[]` and showing "Chat storage was
corrupted and has been reset."

So one malformed message — a bad `timestamp`, an unknown `status`, a non-string
`content` — makes the user's entire history vanish from the UI even though it
was successfully recovered one line earlier. And because the quarantine is
deliberately not written back for encrypted payloads, the same corrupt record
is re-read on the next launch and the history stays invisible forever, while
sitting decryptable in AsyncStorage.

The fix is to use the value that is already being computed and discarded.

## Current state

Files involved:

- `src/context/ChatContext.tsx:86-111` — the load path and its corruption
  handler. This is the only file that needs a production change.
- `src/services/storageService.ts:217+` — `loadChats(options)`, whose
  `recoverOnCorruption` flag drives the two-pass behavior.
- `__tests__/chatContext.errorRecovery.spec.tsx` — existing recovery coverage.
- `__tests__/storageService.corruption.spec.ts` — existing storage-side
  coverage.

The load and the discard (`src/context/ChatContext.tsx:86-111`):

```ts
      // NORMAL MODE: Load chats from storage
      const loadedChats = await StorageService.loadChats({
        recoverOnCorruption: false,
      });
      setChats(loadedChats);
      const preferredChat = options?.preserveChatId
        ? (loadedChats.find((chat) => chat.id === options.preserveChatId) ?? null)
        : null;
      setCurrentChat((preferredChat ?? loadedChats[0] ?? null) as Chat | null);
      setError(options?.clearError === false ? options?.preserveError ?? null : null);
    } catch (err) {
      if (err instanceof StorageCorruptionError) {
        // Best-effort recovery: a recovery failure must still reset state and
        // clear loading below (it must not escape and skip cleanup).
        try {
          await StorageService.loadChats();
        } catch {
          // Intentionally swallowed; state is reset regardless.
        }
        setChats([]);
        setCurrentChat(null);
        setError(
          options?.clearError === false
            ? options?.preserveError ?? "Chat storage was corrupted and has been reset."
            : "Chat storage was corrupted and has been reset.",
        );
      } else {
```

The `await StorageService.loadChats();` on the recovery line returns the
surviving chats (recovery is the default: `recoverOnCorruption` defaults to
true). Its return value is provably unused — nothing is assigned.

The storage side (`src/services/storageService.ts:217-223`):

```ts
  static async loadChats(options?: {
    recoverOnCorruption?: boolean;
    /**
     * When the stored payload is legacy plaintext, rewrite it to an encrypted
     * payload through the serialized mutation queue (default true). MUST be
     * false for any load that already runs inside queueOperation() — otherwise
     * the awaited queued rewrite deadlocks on the in-flight operation.
```

Behavior you must preserve:

- The recovery call must stay best-effort. If it throws, state still resets and
  `loading` still clears — the existing `try/catch` around it exists for
  exactly that, and the comment says so.
- The `options.preserveChatId` / `options.clearError` / `options.preserveError`
  semantics in the happy path are load-bearing for route hydration
  (`app/chat/[threadId].tsx`) — mirror them in the recovery path rather than
  inventing new behavior.
- The user must still be told something happened. Losing the banner entirely
  would hide real data loss (the quarantined record *is* gone from view).

Repo conventions:

- Context tests use `react-test-renderer` and the shared React Native mock in
  `__tests__/mocks/react-native.js`. Model new cases on
  `__tests__/chatContext.errorRecovery.spec.tsx`.
- The repo cannot use `finally` blocks — the React Compiler cannot lower them.
  Use `Promise.prototype.finally()` or a trailing statement after `try/catch`.
- The repo bans emoji in tracked files, and bans `console.*` in `src/` outside
  three allowlisted files. Use `devWarn` from `src/utils/devLog.ts`.
- User-facing strings are bilingual: any new or changed copy must be added to
  **both** `src/i18n/messages/en-US.ts` and `src/i18n/messages/pt-BR.ts`. See
  the note in "Steps" about whether this plan needs new copy.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install --frozen-lockfile` | exit 0 |
| Typecheck | `pnpm run typecheck` | exit 0, no output |
| Targeted tests (context) | `pnpm run test --testPathPattern=chatContext` | all pass |
| Targeted tests (storage) | `pnpm run test --testPathPattern=storageService` | all pass |
| i18n parity | `pnpm run test --testPathPattern=i18n` | all pass |
| Full suite | `pnpm run test` | 129 suites passed, 1 skipped |

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

- `src/context/ChatContext.tsx` — the `StorageCorruptionError` branch only
- `__tests__/chatContext.errorRecovery.spec.tsx` — new cases
- `src/i18n/messages/en-US.ts` and `src/i18n/messages/pt-BR.ts` — only if you
  introduce new copy (see Step 3)

**Out of scope** (do NOT touch, even though they look related):

- `src/services/storageService.ts` — the recovery, quarantine and backup logic
  is correct and was hardened in plan 011. This plan consumes its return value;
  it does not change it.
- The decision not to persist the quarantine for encrypted payloads
  (`src/services/storageService.ts:476-480`). That is deliberate. Changing it
  is a separate, riskier decision about rewriting a user's store during a
  failure.
- The `recoverOnCorruption: false` on the first load. Removing the two-pass
  dance is tempting but changes the error-reporting contract; if you conclude
  it should go, report that as a recommendation rather than doing it.
- Any change to `StorageCorruptionError` itself or where it is thrown.

## Git workflow

- Branch: `advisor/015-preserve-recovered-chats`
- Conventional Commits, matching this repo's history. Example from `git log`:
  `fix: apply remaining improve-deep audit fixes and pnpm supply-chain hardening`
  For this plan: `fix(chat): keep chats recovered from a corrupted store`
- Do NOT push and do NOT open a PR.

## Steps

### Step 1: Write the failing test first

In `__tests__/chatContext.errorRecovery.spec.tsx`, add a case that seeds a
store where the first `loadChats({ recoverOnCorruption: false })` call rejects
with `StorageCorruptionError` and the second (recovery) call resolves with two
surviving chats. Assert the context exposes those two chats.

**Verify**: `pnpm run test --testPathPattern=chatContext.errorRecovery` →
the new case **fails**, showing an empty list. That red test is the
reproduction.

### Step 2: Use the recovered value

In the `StorageCorruptionError` branch of `src/context/ChatContext.tsx`, assign
the recovery load's result and drive state from it instead of from `[]`:
set the chat list to the recovered array, and resolve the current chat the same
way the happy path does — honor `options.preserveChatId` against the recovered
array first, then fall back to the first recovered chat, then `null`.

Keep the surrounding `try/catch` so a recovery failure still resets to an empty
list and still clears `loading`. In that failure case the old behavior is
correct and must remain.

**Verify**: the Step 1 case passes;
`pnpm run test --testPathPattern=chatContext` and
`pnpm run test --testPathPattern=storageService` all pass.

### Step 3: Keep the user informed, accurately

The current banner says storage "has been reset", which will be wrong once
survivors are shown. Decide between:

(a) keeping the existing message only when nothing was recovered, and using a
different message when some chats survived; or
(b) a single message that is true in both cases.

If you add or change any user-facing string, add it to **both**
`src/i18n/messages/en-US.ts` and `src/i18n/messages/pt-BR.ts` in the same
commit, and keep the copy factual — the repo's Plain Language Rule bans
promotional words such as "magic", "revolutionary" and "amazing" in either
language, enforced by `__tests__/i18n.plainLanguage.policy.spec.ts`.

**Verify**: `pnpm run test --testPathPattern=i18n` → all pass (key parity and
plain-language policy).

### Step 4: Cover the failure-of-recovery path too

Add a case where the recovery load also rejects. Assert the chat list is empty,
the current chat is `null`, the error banner is set, and loading has cleared.

**Verify**: `pnpm run test --testPathPattern=chatContext` → all pass.

### Step 5: Full gate

**Verify**: `pnpm run typecheck` exits 0; `pnpm run test` reports 129 suites
passed, 1 skipped; `git status` shows only in-scope files modified.

## Test plan

New cases in `__tests__/chatContext.errorRecovery.spec.tsx`:

- Corruption on the first load, recovery returns survivors: the context exposes
  the survivors and selects the first one.
- Same, with `preserveChatId` pointing at a surviving chat: that chat is
  selected.
- Same, with `preserveChatId` pointing at the record that did **not** survive:
  falls back to the first survivor rather than leaving a dangling selection.
- Recovery itself rejects: empty list, `null` current chat, error set, loading
  cleared.

Structural pattern: the existing cases in the same file, which already build
the provider with a mocked `StorageService`.

## Done criteria

ALL must hold:

- [ ] The `StorageCorruptionError` branch in `src/context/ChatContext.tsx` assigns and uses the recovery load's return value
- [ ] `grep -n "setChats(\[\])" src/context/ChatContext.tsx` shows it only on the recovery-failure path
- [ ] All four new cases from the test plan exist and pass
- [ ] Any changed user-facing copy exists in both `en-US.ts` and `pt-BR.ts`
- [ ] `pnpm run test --testPathPattern=i18n` passes
- [ ] `pnpm run typecheck` exits 0
- [ ] `pnpm run test` passes
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Step 1's new case passes without any production change. That would mean the
  discard has already been fixed and this plan is stale.
- The recovery load turns out to return something other than the surviving
  chats (read `src/services/storageService.ts:415-436` and confirm before
  assuming). If it returns an empty array by design, the fix belongs in
  `storageService`, which is out of scope here — report it.
- Honoring `preserveChatId` against the recovered array requires changing the
  happy-path selection logic.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- The deeper issue remains after this plan: the quarantined record is not
  persisted away, so the corrupt entry is re-read on every launch and recovery
  runs every time. That is by design today. If a future change makes the
  quarantine durable, revisit the banner copy — the "corrupted" message should
  then appear once rather than on every load.
- A reviewer should check the recovery-failure path specifically: it is the one
  case where resetting to an empty list is still correct, and it is easy to
  lose while making the success path work.
- Deliberately deferred: reconsidering `recoverOnCorruption: false` on the
  first load. The two-pass structure exists only to produce the banner, and a
  single recovering load with a "did we quarantine anything" signal would be
  simpler — but that is a contract change to `storageService`, not a bug fix.
