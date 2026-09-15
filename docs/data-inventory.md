# DNSChat Data Inventory

This document inventories the data stored or processed by DNSChat and satisfies SECURITY-GUIDELINES.md data classification requirements.

## Data Stores (On-Device)

1) Chats (encrypted at rest)
- Storage key: `@chat_dns_chats`
- Contents: chat threads, message IDs, roles (`user`/`assistant`), message content, timestamps, titles
- Storage location: AsyncStorage (device local)
- Encryption: AES-GCM via `encryptionService`; native key material is stored in
  SecureStore, while Web preview stores the local-only preview key in
  same-origin browser storage because SecureStore is not available in browsers.
- Retention: Persistent until user deletes chats or clears app data

2) Chat backup (encrypted at rest)
- Storage key: `@chat_dns_chats_backup`
- Contents: backup payload for corrupted chat storage
- Storage location: AsyncStorage
- Encryption: same as chats
- Diagnostic metadata: the parser error is stored as its length only.
- Retention: Removed when any chat is deleted or all chats are cleared. The
  backup is an opaque copy of every chat at quarantine time and cannot be
  filtered per chat.

3) DNS query logs (redacted and encrypted at rest)
- Storage key: `@dns_query_logs`
- Contents: per-query log entries (length of the message text, chat title and
  response, local chat ID, status, method, timestamps, durations)
- Storage location: AsyncStorage
- Redaction: message content stored as `redacted len:<length>`. Until 4.4.4 an
  unsalted SHA-256 was stored as well; prompts are short natural language, so
  that digest could be confirmed by guessing, and loading older logs strips it.
  Per-entry `details`/`error` text is also scrubbed at the logging boundary
  (active-query prompt/title values, composed DNS query names, and multipart
  TXT fragments are replaced with `[redacted len:<length>]` before entries
  reach memory or storage). The raw
  prompt/title values used for that scrub are held only for the query lifecycle
  and dropped on completion, clear, or an early-throw finalize.
- Encryption: AES-GCM via `encryptionService`; native key material is stored in
  SecureStore, while Web preview stores the local-only preview key in
  same-origin browser storage because SecureStore is not available in browsers.
- Retention: 30 days (automatic cleanup) and max 100 logs; deleting a chat
  removes its log records, including a query still in flight, and records of
  chats that no longer exist are dropped whenever the chat list loads

4) DNS logs backup (encrypted at rest)
- Storage key: `@dns_query_logs_backup`
- Contents: backup payload for corrupted log storage
- Storage location: AsyncStorage
- Encryption: same as DNS query logs; legacy plaintext corruption payloads are encrypted before backup writes
- Diagnostic metadata: parser error messages are stored only as their length, because JSON errors may quote a fragment of the corrupted plaintext. Backup encryption does not make adjacent metadata safe to store verbatim.
- Retention: Persistent until user clears logs or app removes backups

5) User settings
- Storage key: `@chat_dns_settings`
- Contents: DNS server selection, mock DNS flag, haptics, locale preference, accessibility settings
- Storage location: AsyncStorage
- Retention: Persistent until user resets settings or clears app data

6) Encryption key material
- Storage keys: `dnschat.encryption_key` (the key, native and web preview),
  `dnschat.encryption_key.v2` (transient verified staging copy) and
  `dnschat.encryption_key.protection` (completion marker, no key material)
- Contents: AES key for local payload encryption
- Storage location: SecureStore in native builds (device protected storage).
  iOS writes the key as `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, so it is not restored
  onto another device from a backup. A key written before 4.3.6 with the
  library default is re-added under the same name as device-only: it is copied
  to the staging entry and read back, the original is deleted and added again
  and read back, the marker is written, and the staging copy is removed. The key
  always exists in at least one verified entry; if the device-only re-add fails
  the key is written back under its name with the default accessibility, so
  older builds keep reading the same name; a later launch finishes an
  interrupted step. Encrypted backups
  taken before protection still contain the key (there is no key rotation).
  Android backup and device-transfer rules exclude the SecureStore shared
  preferences file so key material is not restored without the platform
  keystore. Web preview stores the key in same-origin browser storage as a
  browser-only fallback and must not be treated as a secure production at-rest
  boundary.
- Retention: Persistent until app uninstall or explicit secure-store reset

## Data in Transit

- DNS prompt text is sent as a DNS TXT query to configured DNS servers (default: `llm.pieter.com:53`).
- The app transmits user input over UDP/TCP via the DNS pipeline, with optional mock DNS in development.
- Responses are rendered in the UI and stored in local encrypted chat history.
- DNS over standard port 53 is observable and not authenticated end to end.
  Resolvers or on-path infrastructure may observe, retain, replay, or alter
  queries and responses. Users must not send secrets or personal data through
  prompts and must not treat responses as cryptographically verified.
- The configured DNS services are third parties. As of `2026-08-31`, the
  default service's public page documents how to query it, but no public policy
  covering retention, secondary use, deletion, or service-provider status was
  located on that page or through web search. Provider-side storage and use
  therefore remain unknown; production store declarations must
  not claim local-only handling or no sharing without operator evidence.

## Data Classification

- Chat content: Confidential
- DNS query logs (redacted to lengths): Internal
- User settings: Internal
- Encryption key material: Restricted

## Retention & Deletion

- Logs: automatic cleanup after 30 days and capped at 100 entries; user can clear logs from the Logs screen.
- Chats: retained until user deletes chats or clears app storage.
- Settings: retained until user resets settings or clears app storage.
- Backups: the chat backup is removed when any chat is deleted or all chats are cleared; the log backup when logs are cleared.

## Security Controls

- Encryption at rest for chat payloads and log storage via AES-GCM.
- SecureStore for encryption key material in native builds.
- Same-origin browser storage for Web preview encryption key material because
  SecureStore is not available in browsers; this is not a secure production
  at-rest boundary.
- Android Auto Backup/device-transfer excludes SecureStore key material.
- iOS declares `ITSAppUsesNonExemptEncryption=false`; the app uses platform
  storage and standard local data protection, not non-exempt custom
  cryptography for export-compliance purposes.
- Redaction of log message content to its length.

## Review Cadence

- Review this inventory whenever storage keys, retention policies, or data flows change.
- Last reviewed during the pre-production security review on `2026-09-15`.
