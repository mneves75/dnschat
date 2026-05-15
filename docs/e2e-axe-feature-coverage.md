# AXe end-to-end feature coverage

This document is the feature contract for the AXe simulator loop. It records
what each user-facing feature is expected to do before the E2E assertions are
run. The machine-readable source is
`scripts/e2e-axe-feature-manifest.json`; the Jest guard
`__tests__/axeFeatureManifest.spec.ts` keeps this document and the manifest in
sync.

AXe scope: iOS Simulator automation through accessibility selectors. The runner
uses selectors first and avoids coordinates except for future debugging.

## Running the loop

```bash
bun run e2e:axe:doctor
bun run e2e:axe -- --udid <BOOTED_SIMULATOR_UDID>
bun run e2e:axe:release
```

`e2e:axe` expects DNSChat to be installed and running as the real app. If the
Expo development launcher is visible, the runner fails because it is not testing
DNSChat. `e2e:axe:release` builds a Release simulator app, reinstalls it, and
then runs the full feature loop on a fresh simulator that the runner creates,
boots, and deletes. To reuse a manually booted simulator instead, run
`bun run e2e:axe:release -- --udid <BOOTED_SIMULATOR_UDID> --boot-simulator`.

## Feature checklist

| Feature ID | Feature | Expected behavior | Evidence path |
| --- | --- | --- | --- |
| F-APP-001 | Onboarding gate and onboarding flow | A fresh install opens onboarding, exposes welcome, DNS demo, network setup, first chat, and feature summary steps, then persists completion and lands on the chat list. | AXe selectors: `onboarding-welcome`, `onboarding-dns-magic`, `onboarding-network-setup`, `onboarding-first-chat`, `onboarding-features`, `chat-list`; Jest onboarding persistence and accessibility tests. |
| F-APP-002 | Chat list | The chat list renders empty and populated states, exposes a new chat action, routes into a thread, and updates aggregate chat/message statistics. | AXe selectors: `chat-list`, `chat-list-new-chat`; ChatContext and storage Jest tests. |
| F-CHAT-001 | Chat thread and messaging | A thread renders message history, accepts a prompt, disables duplicate sends while loading, shows user and assistant bubbles, and surfaces errors without hiding the failed message. | AXe selectors: `chat-screen`, `message-list`, `chat-input-field`, `chat-input-send`; chat input, message bubble, single-flight, and error Jest tests. |
| F-DNS-001 | DNS query transport behavior | Prompts are validated, sanitized, sent through the native, UDP, TCP, and mock fallback chain as configured, TXT responses are parsed, and DNS attempts are logged. | Jest DNS service/native tests, DNS harness, and AXe settings/logs smoke selectors: `settings-transport-test`, `settings-force-native`, `settings-force-udp`, `settings-force-tcp`, `logs-screen`. |
| F-SET-001 | Settings and app behavior configuration | Settings expose allowlisted DNS server selection, mock DNS, haptics, locale, transport tests, about/support actions, data clearing, defaults reset, and onboarding reset. | AXe selectors: `settings-screen`, `settings-dns-server`, `settings-mock-dns-switch`, `settings-haptics-switch`, `language-option-system`, `settings-clear-data`, `settings-reset-defaults`, `settings-reset-onboarding`; settings Jest tests. |
| F-LOG-001 | DNS logs | The logs tab shows empty and populated DNS query history, status, timing, expanded step details, pull refresh behavior, and clear-all action when logs exist. | AXe selectors: `logs-screen`, `logs-empty-state`; DNS log service Jest tests. |
| F-UI-001 | About screen | The About tab shows app identity, version, project links, credits, and a route into Settings. | AXe selectors: `about-screen`, `about-settings-link`; app version tests. |
| F-USER-001 | Profile and data management | The profile route shows user identity, conversation/message statistics, settings navigation, export placeholder, and clear-all data confirmation. | AXe selectors: `profile-screen`, `profile-settings-link`, `profile-export-data`, `profile-clear-all-data`; route parsing and chat context tests. |
| F-ERR-001 | Not-found fallback | Unknown routes render a not-found screen with quick links back to chat, logs, and about. | AXe selectors: `not-found-screen`, `not-found-chat-link`, `not-found-logs-link`, `not-found-about-link`; route parsing tests. |
| F-SYS-001 | Localization and accessibility context | Locale selection, system-locale fallback, reduced motion, font size, high contrast, screen reader flags, and accessible labels remain available to the app shell and screens. | AXe settings smoke selectors: `language-option-system`, `language-option-en-US`, `language-option-pt-BR`; locale/accessibility Jest tests. |

## Failure triage rule

When an AXe assertion fails, inspect the UI state with:

```bash
AXE_BIN=/opt/homebrew/Cellar/axe/1.7.0/libexec/axe \
  bun run e2e:axe -- --udid <BOOTED_SIMULATOR_UDID> --describe-only
```

Fix the app when the expected feature behavior is absent or broken. Update the
test only when the app is behaving correctly and the selector, route, timeout,
or assertion is demonstrably wrong.
