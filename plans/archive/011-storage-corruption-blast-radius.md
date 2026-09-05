# Plan 011 — loadChats corruption handling: per-record quarantine instead of whole-history wipe

Written against commit `3147b64` (deep audit cycle 3, 2026-07-12).
Status: DONE (2026-07-13). Priority: P2. Effort: M. Risk: MED.

> **Done note.** Implemented per-record quarantine (codex executor, advisor
> review). Two autoreview cycles then found that the JSON date **reviver**
> (`:237-259`) threw during `JSON.parse` for a present-but-invalid date, which
> bypassed the new per-record boundary and still wiped the whole history —
> contradicting this plan's original "keep the reviver as whole-payload
> corruption" scoping (see "Out of scope"). That scoping was corrected: the
> reviver is now non-throwing (returns the raw value on an invalid/foreign-typed
> date, never coercing `null`→1970) so the per-record loop rejects only the bad
> record. See `plans/README.md` Cycle 3 "011 outcome" for the full trail and the
> deferred CACHE-01 concurrency follow-up.

## Problem

`StorageService.loadChats` (`src/services/storageService.ts`) gained stricter
structure validation in the 4.2.x working tree. The validation is now
**internally inconsistent** in how it treats malformed records, and a single
bad record discards the entire chat history.

Lenient (repairs and keeps the data):
- empty/whitespace `title` → normalized to `"New Chat"` (`storageService.ts:308`)
- missing message `status` → defaulted to `'sent'` (`storageService.ts:352-353`)

Fatal (throws `StorageCorruptionError` for the whole array):
- non-string `title` (`:303-307`)
- `createdAt`/`updatedAt` not a `Date` instance, i.e. absent (`:309-313`)
- message `timestamp` not a `Date` instance, i.e. absent (`:346-350`)
- invalid message `status` (`:354-362`)

With the default `recoverOnCorruption: true` (`:213`), any thrown
`StorageCorruptionError` backs the payload up to `CHAT_BACKUP_KEY` once, then
`removeItem(CHATS_KEY)` and returns `[]` (`:390-416`). `getChatsForMutation`
(`:85`) immediately re-persists the emptied array. Net effect: **one legacy or
partially-corrupt chat/message wipes every other valid conversation**, and the
single-slot backup is never auto-restored.

## Exposure (why this is P2, not a release blocker)

The JSON reviver (`storageService.ts:233-255`) already revives any *present*
`createdAt`/`updatedAt`/`timestamp` string/number into a `Date` and throws on a
present-but-invalid value. So the fatal `instanceof Date` checks only fire when
the field is **absent**. The app has always written these fields
(`createChat` sets `createdAt`/`updatedAt`; messages carry `timestamp`), so the
absent-field path is reachable only via genuinely corrupt storage or a very old
pre-timestamp schema — low real-world exposure. The corruption spec added in
this cycle (`__tests__/storageService.corruption.spec.ts`) deliberately asserts
the strict throw contract, so the strictness is by-design; this plan revisits
whether the *blast radius* of that contract is correct.

## Goal

Make corruption handling resilient at record granularity: a malformed chat or
message is dropped (or repaired) individually, and all well-formed conversations
survive. Preserve the "reject genuinely corrupt data" intent — do not admit
records that would crash the render path.

## Approach (recommended)

1. Refactor the validation loop (`storageService.ts:289-364`) so each chat is
   validated in a `try/catch`. On failure, record the chat id + reason to a
   `quarantined` list and `continue` to the next chat instead of throwing for
   the whole array. Same for the inner message loop: a bad message drops that
   message, not the whole chat (unless dropping leaves an empty/invalid chat).
2. Treat an absent `timestamp`/`createdAt`/`updatedAt` the way absent `status`
   is treated where a safe default exists, OR drop the single record; pick one
   and make the three fields consistent. Do NOT keep "title lenient, timestamp
   fatal."
3. When `recoverOnCorruption` is true and any record was quarantined, persist
   the cleaned array (so the next load is clean) and write the quarantined
   originals to the backup slot for forensics. When it is false (test/inspection
   mode), keep the current throw contract.
4. Keep `StorageCorruptionError` for whole-payload failures that are genuinely
   unrecoverable (not an array, JSON parse failure, decrypt failure) — those
   still wipe-to-backup as today.

## Out of scope

- The encryption layer, the reviver's present-but-invalid-date rejection
  (`:241-251`) — those are correct, keep them.
- MMKV/per-chat storage redesign (separate PERF backlog item).

## Test plan

- Rewrite the affected cases in `__tests__/storageService.corruption.spec.ts`:
  the "rejects a chat with missing createdAt/updatedAt" and "rejects a message
  with a missing timestamp" cases should, under the DEFAULT recovery mode,
  assert that the GOOD chats survive and only the bad record is dropped. Keep a
  `recoverOnCorruption: false` variant asserting the strict throw for callers
  that want it.
- Add a case: array of [validChat, chatMissingTimestamps, validChat2] →
  loadChats returns [validChat, validChat2], backup contains the dropped one.
- Add a case: chat with one bad message among good ones → chat kept, bad message
  dropped.
- Run `bun run test -- --testPathPattern=storageService` and the full suite.

## Maintenance note

The corruption backup is single-slot (`CHAT_BACKUP_KEY`) and never
auto-restored. If per-record quarantine lands, consider whether the backup
should accumulate or whether a "restore from backup" affordance is worth adding
(currently a silent data loss from the user's perspective). Watch the
`getChatsForMutation` re-persist path (`:85`) — it must persist the cleaned
array, not the pre-clean one.

## Escape hatch

If refactoring the loop to per-record quarantine turns out to interact with the
plaintext-migration branch (`:368-377`) in a way that could double-encrypt or
skip migration, STOP and report — the migration re-reads `CHATS_KEY` and
compares against `serializedChats`; the cleaned array must be serialized
consistently before that comparison.
