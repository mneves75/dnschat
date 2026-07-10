# Plan 007: Stop the sanitized DNS label leaking through Android error text and the Logs store

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. On
> any STOP condition, stop and report. When done, update the status row in
> `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 2739cf2..HEAD -- modules/dns-native/android/DNSResolver.java src/services/dnsLogService.ts src/services/dnsService.ts`
> On excerpt mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 006 (touches the same `DNSResolver.java` region — run 006
  first to avoid copy-sync churn; not a hard logical dependency)
- **Category**: security
- **Planned at**: commit `2739cf2`, 2026-07-10

## Why this matters

The app's privacy posture is "no prompt content is ever persisted or logged
in the clear" (prompts/responses are SHA-256-redacted before the Logs store).
One Android error path violates it: the byte-length validation error embeds
the sanitized label — a lossy but often readable form of the user's prompt —
into the error message, which (a) is written to logcat un-gated in release
builds, and (b) travels to JS and is persisted by the Logs store, where the
redaction engine does not match a bare label (it only matches the raw prompt
and full FQDNs with known zone suffixes).

## Current state

- `modules/dns-native/android/DNSResolver.java:552-556`:
  ```java
  if (bytes.length > config.maxLabelLength) {
      throw new DNSError(
          DNSError.Type.QUERY_FAILED,
          "DNS label exceeds " + config.maxLabelLength + " bytes: " + label
      );
  }
  ```
  The correct model already exists in the same file at `:638-643`, which says
  `"DNS label exceeds N characters after sanitization"` WITHOUT the label.

- `modules/dns-native/android/DNSResolver.java:423,426` — `Log.e(TAG, "DNS
  query failed", e)` logs the exception (with that message) to logcat without
  any debug gating.

- JS persistence path: `src/services/dnsService.ts:1592` →
  `DNSLogService.logMethodFailure(queryId, method, message, ...)`;
  `src/services/dnsLogService.ts:122-133` `sanitizeEntryText` applies (1)
  per-query sensitive patterns from `sensitiveValuesByQueryId` (registered at
  `:298-300`, built by `buildSensitiveValuePattern:86` from the RAW prompt)
  and (2) `redactKnownDnsQueries` (FQDN-with-zone). A bare sanitized label
  (e.g. `what-is-the-capital-of-france`) matches neither.

**Dual-copy mechanics** (same as plan 006): after editing
`modules/dns-native/android/DNSResolver.java`, copy it over
`android/app/src/main/java/com/dnsnative/DNSResolver.java` and run
`bun run verify:dnsresolver-sync`.

## Commands you will need

| Purpose   | Command                            | Expected |
|-----------|------------------------------------|----------|
| Sync gate | `bun run verify:dnsresolver-sync`  | exit 0   |
| Typecheck | `bun run typecheck`                | exit 0   |
| Root tests | `bun run test`                    | all pass |
| Redaction tests | `bun run test -- --testPathPattern=dnsLog` | pass |

## Scope

**In scope**:
- `modules/dns-native/android/DNSResolver.java` (+ committed copy, see above)
- `src/services/dnsLogService.ts`
- `src/services/dnsService.ts` — ONLY if needed to register the sanitized
  label as a sensitive value (see step 2)
- Tests under `__tests__/` (e.g. extend `__tests__/dnsLoggingPrivacy.spec.ts`
  or `dnsLogViewer.redaction.spec.ts`)

**Out of scope**:
- iOS Swift resolver (no equivalent leak — errors return via rejecter only)
- Changing what IS logged (entries stay; only their text is redacted)
- The `Log.e` call sites' existence (leave logging in place; the message
  becoming label-free makes them safe)

## Git workflow

Work in the current tree. Do NOT commit or push.

## Steps

### Step 1: Remove the label from the Android error message

At `DNSResolver.java:552-556`, drop `+ label`, matching the `:638-643` style:
`"DNS label exceeds " + config.maxLabelLength + " bytes"`. Copy the file to
the app copy; run the sync gate.

**Verify**: `bun run verify:dnsresolver-sync` → exit 0;
`grep -n 'bytes: " + label' modules/dns-native/android/DNSResolver.java` → no match.

### Step 2: Register the sanitized label as a per-query sensitive value

Defense-in-depth so ANY future native/transport message embedding the label
gets redacted. Find where `sensitiveValuesByQueryId` is populated
(`dnsLogService.ts:293-300`, called with the raw prompt) and where the query
label/queryName is available in `dnsService.ts` (the sanitized label and the
composed query name exist before transport dispatch). Add the sanitized label
(and the full composed query name if not already covered) to the sensitive
values registered for that queryId. Keep `buildSensitiveValuePattern`'s
escaping as the single pattern builder.

**Verify**: `bun run test -- --testPathPattern=dnsLog` → pass.

### Step 3: Regression test

Add a test (extend `__tests__/dnsLoggingPrivacy.spec.ts`) that logs a method
failure whose message contains the bare sanitized label (e.g.
`"DNS label exceeds 63 bytes: secret-prompt-here"` with the label registered)
and asserts the persisted entry text does NOT contain the label.

**Verify**: `bun run test` → all pass.

## Done criteria

- [ ] `grep -rn 'bytes: " + label' modules/dns-native/android/ android/app/src/main/java/com/dnsnative/` → no matches
- [ ] `bun run verify:dnsresolver-sync` exits 0
- [ ] New redaction regression test exists and passes; `bun run test` exits 0
- [ ] `bun run typecheck` and `bun run lint` exit 0
- [ ] No files outside scope modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- `sanitizeEntryText`/`sensitiveValuesByQueryId` structure doesn't match the
  excerpts (drift).
- Registering the label pattern causes broad over-redaction in existing log
  tests (e.g. short labels matching unrelated text) — report with the failing
  case instead of loosening the pattern blindly.

## Maintenance notes

- Any NEW native error message must never embed user-derived strings (label,
  query name, prompt). Reviewer checklist item for future native PRs.
- The Logs-screen display path shares `sanitizeEntryText`, so this fix covers
  both persistence and display.
