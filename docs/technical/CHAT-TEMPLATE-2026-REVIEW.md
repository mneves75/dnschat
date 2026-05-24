# Chat template 2026 review plan

Date: 2026-05-14

External baseline reviewed:

- `https://github.com/EvanBacon/chat-template` at commit `34db42e1930796917c59aba0852db291d9834cb7`.
- Expo React Compiler docs, last updated 2026-05-13.
- Expo New Architecture docs for SDK 55 / React Native 0.83.
- Expo app navigation docs, last updated 2026-05-05.
- React Native 0.83 security docs.

## What carries over

1. Keep Expo SDK 55, React 19.2, React Native 0.83, Hermes, New Architecture,
   typed routes, and React Compiler enabled.
2. Keep Expo Router as the navigation surface. DNSChat uses `app/` routes at
   repo root instead of the template's `src/app/`; this is intentional and
   already matches Expo Router's file-based model.
3. Use Expo Doctor as a hard dependency-alignment gate. The current baseline is
   the SDK 55 patch set in `package.json` and `bun.lock`.
4. Preserve the product boundary that differs from the template: no account
   system, no API-key chat backend, no server action, and no provider SDK in the
   client. DNS TXT remains the transport.

## What does not carry over

1. Do not import the template's `@ai-sdk/*`, Anthropic, API route, or model
   picker stack. DNSChat's core promise is DNS-only transport without user API
   keys.
2. Do not add Uniwind/Tailwind or web server output just because the template
   uses them. DNSChat already has a native-first design system and Metro web
   preview.
3. Do not replace the custom `entry.tsx`; DNSChat needs crypto bootstrap before
   `expo-router/entry`.

## Repairs applied

1. Expo SDK drift:
   Updated SDK 55 patch packages to the versions required by current
   `expo-doctor`.

2. Local encryption drift:
   `StorageService.loadChats()` now rewrites valid legacy plaintext chat JSON
   as encrypted payloads. Corrupted plaintext backups are encrypted before they
   are written to AsyncStorage.

3. DNS log privacy:
   `DNSLogService` now redacts prompt-derived chat titles and responses. DNS
   query names and labels emitted by `DNSService` are stored as stable hashes
   instead of raw sanitized prompt text.

4. Recovery safety:
   Corrupted DNS log backups now protect legacy plaintext payloads before
   writing the backup record.

5. Expo Doctor local-module check:
   `.gitignore` explicitly unignores `modules/dns-native/android` and
   `modules/dns-native/ios` so the owned native source stays trackable.

## Remaining policy

1. Run `bun run verify:all` with `modules/dns-native/node_modules` absent.
   `expo-doctor` intentionally scans `modules/**/android` and `modules/**/ios`;
   a nested `node_modules` created by `npm ci` inside the local module can
   produce a false positive.
2. Run native module tests separately with `cd modules/dns-native && npm ci &&
   npm test`, then remove `modules/dns-native/node_modules` before rerunning
   Expo Doctor.
3. Keep DNS logs diagnostic-only. Do not persist raw prompts, raw TXT responses,
   or prompt-derived DNS labels.
