# DNSChat Data Inventory

This document inventories the data stored or processed by DNSChat and satisfies SECURITY-GUIDELINES.md data classification requirements.

## Data Stores (On-Device)

1) Chats (encrypted at rest)
- Storage key: `@chat_dns_chats`
- Contents: chat threads, message IDs, roles (`user`/`assistant`), message content, timestamps, titles
- Storage location: AsyncStorage (device local)
- Encryption: AES-GCM via `encryptionService` using a key stored in SecureStore
- Retention: Persistent until user deletes chats or clears app data

2) Chat backup (encrypted at rest)
- Storage key: `@chat_dns_chats_backup`
- Contents: backup payload for corrupted chat storage
- Storage location: AsyncStorage
- Encryption: same as chats
- Retention: Persistent until app recovers/clears storage

3) DNS query logs (redacted at rest)
- Storage key: `@dns_query_logs`
- Contents: per-query log entries (hashed message text, status, method, timestamps, durations)
- Storage location: AsyncStorage
- Redaction: message content stored as `sha256:<hash> len:<length>`
- Retention: 30 days (automatic cleanup) and max 100 logs

4) DNS logs backup
- Storage key: `@dns_query_logs_backup`
- Contents: backup payload for corrupted log storage
- Storage location: AsyncStorage
- Retention: Persistent until user clears logs or app removes backups

5) User settings
- Storage key: `@chat_dns_settings`
- Contents: DNS server selection, mock DNS flag, haptics, locale preference, accessibility settings
- Storage location: AsyncStorage
- Retention: Persistent until user resets settings or clears app data

6) Encryption key material
- Storage key: `dnschat.encryption_key` (SecureStore)
- Contents: AES key for local payload encryption
- Storage location: SecureStore (device protected storage)
- Retention: Persistent until app uninstall or explicit secure-store reset

## Data in Transit

- DNS prompt text is sent as a DNS TXT query to configured DNS servers (default: `llm.pieter.com:53`).
- The app transmits user input over UDP/TCP via the DNS pipeline, with optional mock DNS in development.
- Responses are rendered in the UI and stored in local encrypted chat history.

## Data Classification

- Chat content: Confidential
- DNS query logs (hashed): Internal
- User settings: Internal
- Encryption key material: Restricted

## Retention & Deletion

- Logs: automatic cleanup after 30 days and capped at 100 entries; user can clear logs from the Logs screen.
- Chats: retained until user deletes chats or clears app storage.
- Settings: retained until user resets settings or clears app storage.
- Backups: retained until corruption recovery or manual clear.

## Security Controls

- Encryption at rest for chat payloads and log storage via AES-GCM.
- SecureStore for encryption key material.
- Redaction of log message content to hashed form.

## Review Cadence

- Review this inventory whenever storage keys, retention policies, or data flows change.
