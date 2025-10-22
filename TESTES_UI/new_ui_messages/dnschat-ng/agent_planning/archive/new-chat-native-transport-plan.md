# Purpose

Enable users to start a new conversation without typing a contact name and guarantee every outbound DNS chat message uses the native resolver stack (native module with UDP/TCP) against the `ch.at` endpoint. After this change, creating a chat should feel instant: the user writes a prompt, the app opens the conversation titled for the remote endpoint, and transport settings can no longer divert traffic away from the hardened native pipeline.

# Current Behavior

The modal at `app/new-chat.tsx` presents both a contact-name field and an optional message box. `MessageProvider.createConversation` requires a caller-supplied title, so new chats persist whichever label the user typed and derive remote participant IDs from it. Once in the conversation view, `TransportProvider.executeQuery` pulls `preferences.transport` and `preferences.serverHost`, meaning user toggles can disable the native TurboModule and route to HTTPS or alternate DNS servers—violating the new requirements.

# High-Level Strategy

1. Remove the contact-name UX by collapsing the modal down to a single, required message composer. Default any new conversation metadata (title, participant label) to the hardened `ch.at` endpoint so downstream UI continues to render meaningful headers and avatars.
2. Force transport configuration in code: always query `ch.at` using the native module, falling back to native UDP/TCP sockets only when the TurboModule is unavailable. Ignore or visibly disable the settings UI that previously altered transports/servers, and persist preferences in a fixed shape to avoid legacy overrides.
3. Update translations, list views, and storage helpers to align with the new defaults, and document tricky code paths with inline comments so reviewers understand why the configuration is locked.

# Implementation Steps

1. **Lock constants**
   - Introduce a `PRIMARY_DNS_HOST` constant (value `ch.at`) in `constants/dns.ts` plus a helper for display labels.
   - Export a frozen `FORCED_TRANSPORT_ORDER` `{ native: true, udp: true, tcp: true, https: false }` for reuse.
2. **Conversation model defaults**
   - Extend `MessageProvider` so `createConversation` no longer depends on caller-provided titles. Accept an optional override but default both `title` and remote participant names to the primary host label.
   - Adjust `ensureConversationParticipants` to read the new constant, and add minimal unit-free sanity (trim/fallback) so persisted data stays consistent.
3. **New chat modal**
   - Rebuild `app/new-chat.tsx` to capture only the initial message (required). On submit, validate via `validateMessageInput`, call `createConversation` with the default host label, then navigate to `/chat/[conversationId]`.
   - Mirror composer UX (character counter, errors) so validation feedback remains familiar. Remove unused title state and translations.
4. **Transport enforcement**
   - In `context/TransportProvider.tsx`, remove `preferences.transport`/`preferences.serverHost` dependencies when executing queries; instead call `DNSTransportService.executeQuery` with the forced constants.
   - Update logging payloads to reflect the locked host/transport and add an inline comment explaining why user toggles are ignored.
   - Within `storage/preferences.ts`, migrate persisted values by always returning the forced server/transport (even if legacy storage differs) and treat setters as no-ops for disallowed fields.
5. **Settings UI adjustments**
   - Disable transport switches and server list interactions in `app/(tabs)/settings.tsx`, displaying a short caption that informs users traffic is locked to native `ch.at`.
   - Keep locale/onboarding controls intact.
6. **Messaging UI polish**
   - Ensure `MessageListItem` avatar initials and delete-sheet copy still make sense with the fixed title (e.g., use a helper that renders `ch.at` initials).
   - Update translations (`i18n/en-US.json`, `i18n/pt-BR.json`) to remove contact-name strings and add messaging about the locked transport.
7. **Testing & verification**
   - Run TypeScript build (`npx tsc --noEmit`) in `TESTES_UI/new_ui_messages/dnschat-ng` to catch type regressions.
   - Manual flow: launch Expo web or native dev client, start a new chat, confirm the modal only requests a message, ensure conversation title defaults to `ch.at`, and send a message to verify logs record `native` or socket transports with host `ch.at`.

# Risks & Mitigations

- **Persisted preferences drift**: Existing installs may have toggled HTTPS-only transports. Forcing values on load plus disabling setters avoids inconsistent behavior.
- **Platform without native module**: When TurboModule is absent (e.g., Expo Go), native transport will throw. Document this in comments and rely on UDP/TCP fallbacks; if sockets are also missing, emit a clear error banner so users know a dev build is required.
- **Localization entropy**: Removing old strings could break translations; update both English and Portuguese files, and run a quick lint of translation keys during validation.

# Validation

1. `cd TESTES_UI/new_ui_messages/dnschat-ng && npx tsc --noEmit`
2. Launch dev client (`npm start`) and, from the inbox, tap “New Chat”.
3. Enter a message; verify the Create button enables, and a conversation titled `ch.at` appears with the message logged.
4. Confirm Settings → Transport section shows disabled switches with explanatory text and server list is locked.

# Progress

- [x] Constants locked
- [x] Conversation defaults updated
- [x] New chat modal simplified
- [x] Transport provider enforced
- [x] Settings UI adjusted
- [x] Messaging UI + i18n updated
- [x] Validation steps executed

# Decision Log

- 2025-10-18: Opted to hardcode `ch.at` + native transports in provider instead of relying on user preferences so requirements remain enforceable even with legacy persisted settings.
- 2025-10-18: Ran `npx tsc --noEmit`; existing type errors in ChatView and DNSTransportService (outside this change set) still fail compilation, documented for follow-up.
