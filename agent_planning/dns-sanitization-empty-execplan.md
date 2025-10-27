# Restore DNS message sanitization for punctuation-only inputs

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

If PLANS.md file is checked into the repo, reference the path to that file here from the repository root and note that this document must be maintained in accordance with PLANS.md.

## Purpose / Big Picture

Stop DNS queries from crashing when a user sends content that sanitizes to an empty label. The current pipeline throws `Message cannot be empty after sanitization`, leaving the chat stuck in an error state. After this change the app must either accept a broader set of inputs (accented latin text) or reject unsupported inputs early with a clearer explanation, without corrupting chat history.

## Progress

- [x] (2025-10-27 19:13Z) Audited `sanitizeDNSMessage`/`sanitizeDNSMessageReference`, reproduction paths, and existing documentation.
- [x] (2025-10-27 19:15Z) Implemented sanitization upgrades plus ChatContext pre-validation guard.
- [x] (2025-10-27 19:15Z) Backfilled unit tests and ran Jest (`npm test`).
- [x] (2025-10-27 19:18Z) Updated plan with outcomes and documentation notes.
- [x] (2025-10-27 20:36Z) Mirror Unicode normalization inside native iOS/Android sanitizers.
- [x] (2025-10-27 20:36Z) Expand Jest/native parity tests and rerun full suite plus `npm run dns-native:test`.

## Surprises & Discoveries

- Observation: Chat pipeline mutated storage before validation; pre-flight sanitization now avoids writing placeholder messages on validation failure.
  Evidence: `src/context/ChatContext.tsx:110` now invokes `sanitizeDNSMessage` inside try/catch before storage writes.
- Observation: Native sanitizers still reject accent-only input; need Unicode folding in Swift/Java plus shared tests.
  Evidence: `modules/dns-native/android/DNSResolver.java:252` only lowercases, no normalization.
- Observation: App-level Jest suite currently fails in `__tests__/chat.messageBubble.spec.ts` because the fixture expects `onLongPress`/`handleLongPress` hooks that no longer exist upstream; unrelated to DNS changes but noted for completeness.
  Evidence: `npm test` (2025-10-27 20:36Z) fails with missing `onLongPress` assertion.

## Decision Log

- Decision: Prefer accent/diacritic stripping plus early validation over inventing a new encoding so server-side expectations stay intact.
  Rationale: Server currently derives the prompt directly from the slug label; introducing a new encoding risks incompatibility, while accent folding covers the failing pt-BR cases observed in QA.
  Date/Author: 2025-10-27 / Codex.

## Outcomes & Retrospective

Accented Latin phrases like “Olá mundo” now yield `ola-mundo` across JS and native sanitizers, while punctuation-only or emoji-only inputs surface the clearer error “Message must contain at least one letter or number after sanitization.” ChatContext stops before persisting placeholders when validation fails, so a user sending invalid content no longer leaves dangling `sending` messages. Jest at repository root currently fails due to legacy `__tests__/chat.messageBubble.spec.ts` expectations, but DNS-focused suites—and `modules/dns-native` Jest run at 2025-10-27 20:36Z—cover the new accent and punctuation scenarios.

## Context and Orientation

`src/services/dnsService.ts` exports the validation/sanitization helpers used both by the React context and by the native module tests. `modules/dns-native/constants.ts` hosts the shared sanitization reference implementation that powers native bridges. `src/context/ChatContext.tsx` stages messages, persists them through `StorageService`, and calls `DNSService.queryLLM`. When sanitization returns an empty string, `DNSService.createQueryContext` rejects, bubbling an exception into `sendMessage` after chat state was already mutated. `__tests__/dnsService.spec.ts` and `__tests__/dnsService.pipeline.spec.ts` cover the current behavior.

## Plan of Work

First, enhance the shared sanitization reference to normalize Unicode input (NFKD) and strip combining marks before the ASCII filter, so accent-only words map to usable labels. Keep the existing RFC-1035 constraints on lowercase letters, digits, and dashes. Next, revise `sanitizeDNSMessage` to surface a clearer error when the sanitized label is empty, distinguishing it from the generic post-sanitization failure. In `ChatContext.sendMessage`, perform a pre-flight sanitization before mutating persistent state; if validation fails, surface the error and exit without touching storage. Update unit tests to cover accent folding and punctuation-only rejection, ensuring both helper exports and pipeline specs reflect the new behavior. Finally, document the commands and run Jest locally to verify the suite.

## Concrete Steps

1. Edit `modules/dns-native/constants.ts` to normalize input with `message.normalize('NFKD')`, remove combining marks, and proceed with the existing sanitization steps.
2. Update `src/services/dnsService.ts` so `sanitizeDNSMessage` throws a user-friendly explanation when the sanitized label is empty, and remove redundant post-sanitization length checks already handled by the reference.
3. Import `sanitizeDNSMessage` into `src/context/ChatContext.tsx` and run it before storage updates, short-circuiting on validation errors.
4. Extend `__tests__/dnsService.spec.ts` (and pipeline spec if needed) with cases for accent folding and punctuation-only rejection.
5. Run `npm test` (Jest) inside tmux to ensure regressions are caught.

Expected command transcript (run from repo root inside tmux window `codex:agent`):

```
tmux send-keys -t codex:agent "npm test" C-m
```

## Validation and Acceptance

Passing criteria: `sanitizeDNSMessage('ÁÉÍÓÚ')` returns `aeiou`; `sanitizeDNSMessage('!!!')` throws the new descriptive error; attempting to send punctuation-only content in `ChatContext.sendMessage` exits early without writing placeholder records. Jest suite (`npm test`) must pass. Manual sanity via `node test-dns-simple.js "Olá mundo"` should still print `ola-mundo`.

## Idempotence and Recovery

Sanitization edits are pure functions; reapplying the patch is safe. If the pre-validation change causes regressions, revert only `ChatContext.tsx` while keeping the improved helper. Storage mutations are avoided on validation failure, so no additional cleanup is required.

## Artifacts and Notes

- `npm test` (2025-10-27 20:36Z): fails in `__tests__/chat.messageBubble.spec.ts` (missing `onLongPress` handler), unrelated to DNS changes.
- `cd modules/dns-native && npm test` (2025-10-27 20:36Z): 3 suites passed (1 skipped), DNS sanitization parity tests succeeding.

## Interfaces and Dependencies

`modules/dns-native/constants.ts:sanitizeDNSMessageReference(message: string): string` must continue returning RFC-compliant labels. `src/services/dnsService.ts:sanitizeDNSMessage` remains the public gateway invoked across the app. `src/context/ChatContext.tsx:sendMessage` consumes these helpers and must maintain the storage update sequence when validation passes. Tests in `__tests__/dnsService.spec.ts` ensure contract stability.
