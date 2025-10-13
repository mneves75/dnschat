# DNS Chat v2.5 Detailed TODO (2025-10-13)

This plan decomposes the PRD (DOCS/PRD-2025-10-12.md) into actionable engineering work across the Expo app, native DNS module (`modules/dns-native`), and DNS server (`DOCS/ch_at_dns_server_code.go`). Tasks are grouped by functional area and reference the PRD requirements (FR-xxx / NFR-xxx).

## 1. Application Data Model & Persistence

- [ ] Replace seeded conversations in `context/MessageProvider.tsx` with persisted state (FR-002, FR-003, FR-004).  
  - Implement AsyncStorage-backed repository (`storage/conversations.ts`) with load/save helpers.  
  - Migrate reducer to hydrate on mount and persist deltas debounced.  
  - Add unique conversation ID generator + UTC timestamp serialization.
- [ ] Enforce message input validation (max 200 chars before sanitization) in `app/messages/[conversationId].tsx` (FR-008, NFR-009).  
  - Introduce shared validation util in `utils/validation.ts`.  
  - Display inline error + disable send for invalid content.
- [ ] Add conversation creation & deletion flows (FR-004).  
  - Implement “New Chat” CTA in `app/(tabs)/index.tsx` with modal route `app/new-chat.tsx`.  
  - Add delete option (swipe or long-press) with confirmation bottom sheet.
- [ ] Store onboarding completion and user settings (transport toggles, locale) via dedicated context + AsyncStorage (FR-062, FR-019, FR-053).
- [ ] When you create a new screen always base on existing screen, a  modern look following the latest best practices of UI/UX (2025)

## 2. Chat UI & Navigation

- [ ] Swap FlatList for FlashList in `app/(tabs)/index.tsx` and `components/chat/ChatView.tsx` (NFR-007).  
- [ ] Implement message timestamps with localized formatting in `components/messages/MessageListItem.tsx` and `components/chat/ChatView.tsx` (FR-005, FR-057).  
  - Use `Intl.DateTimeFormat` for web, `formatDate` fallback on native if needed.
- [ ] Add loading and error states in conversation screen (FR-006, FR-007).  
  - Introduce `<ActivityIndicator>` overlay while awaiting DNS response.  
  - Render toast/banner for transport errors with retry CTA.
- [ ] Ensure dynamic routing matches `/chat/[id]` pattern (FR-009).  
  - Rename `app/messages` route folder to `app/chat/[conversationId].tsx`; update navigation references & deep links.  
  - Update typed routes config if necessary.
- [ ] Apply Liquid Glass & Material 3 styling budget (FR-029, NFR-006).  
  - Audit number of glass elements per screen; wrap composer/list header in `GlassContainer` (or fallback) respecting Reduce Transparency.

## 3. DNS Transport Layer (JavaScript)

- [ ] Create `services/DNSTransportService.ts` orchestrating fallback chain (FR-010).  
  - Expose `executeQuery({ message, conversationId })` returning structured response.
- [ ] Implement sanitization per RFC 1035 (FR-011, NFR-009, NFR-013).  
  - Lowercase, replace spaces with `-`, strip invalid chars, enforce 63-char labels (`utils/dnsLabel.ts`).
- [ ] Maintain DNS whitelist (FR-012) with configuration in `constants/dns.ts`.  
  - Add validation at settings save-time & runtime.
- [ ] Compose queries as `<label>.<server>` (FR-013); add helpers for fallback domain assembly.  
- [ ] Parse multi-part TXT responses with `n/n:content` support (FR-014).  
  - Deduplicate on record id to satisfy FR-015.
- [ ] Implement rate limiting (10 requests / 60s) in service-level queue (FR-016, NFR-014).  
  - Use token bucket stored in context/local state; surface error message when limit hit.
- [ ] Pause DNS polling when app backgrounded (FR-017, NFR-041).  
  - Hook into AppState; cancel inflight promise or skip new queries.
- [ ] Expose transport preference toggles & experimental methods (FR-018, FR-019).  
  - Settings screen should persist preferences & update DNSTransportService behaviour.
- [ ] Add exponential backoff logic for retries (max 3 attempts) (FR-020).  
  - Ensure jitter & respect rate limiting budget.

## 4. Native Module Enhancements (`modules/dns-native`)

### iOS (FR-021–FR-027, NFR-042)

- [ ] Update `DNSResolver.swift` to honor adjustable timeout, bounded concurrency (FR-024, FR-025).  
  - Replace global queue start with `Task.detached` & dedicated `Actor` to manage connections.  
  - Ensure `activeQueries` cleanup on cancellations and background events.
- [ ] Implement DNS-over-UDP/TCP selection & fallback gating via exported methods (FR-010, FR-023).  
  - Provide separate Swift async functions for UDP & TCP; expose selection in bridge.
- [ ] Harden CheckedContinuation usage: guard double-resume and cancellation paths (FR-023, NFR-042).  
  - Add tests using `XCTest` for continuation resume counts.
- [ ] Export typed TypeScript interface for bridging (`modules/dns-native/NativeDNSModule.ts`) with consistent payload shape (FR-028).
- [ ] Add unit tests in `modules/dns-native/__tests__/` to cover parsing, failures, and retries (Testing Guidelines).

### Android (FR-022–FR-024, NFR-043)

- [ ] Review `modules/dns-native/android` implementation:  
  - Add DnsResolver API usage for API ≥29; fallback to dnsjava for older (FR-022).  
  - Introduce bounded `ThreadPoolExecutor` (2–4 threads) with queue rejects (FR-024, NFR-043).  
  - Implement exponential backoff & timeout parity with iOS.
- [ ] Ensure module exports consistent errors & result shape to JS (FR-028).  
- [ ] Write instrumentation/unit tests using Robolectric or androidTest harness.

### Autolinking & Build

- [ ] Confirm `package.json` + `DNSNative.podspec` expose autolinking metadata (FR-027, NFR-054).  
- [ ] Update README with installation instructions and supported methods.

## 5. Settings, Logs & Diagnostics

- [ ] Build Settings screen (`app/(tabs)/settings.tsx`) covering:  
  - Transport toggles (FR-019)  
  - DNS server management (FR-012)  
  - Locale picker (FR-053–FR-058)  
  - Accessibility toggles (Reduce Transparency awareness)  
- [ ] Implement DNS Logs tab (FR-047–FR-051).  
  - Add new route `app/(tabs)/logs.tsx` using FlashList to display query history.  
  - Create `services/DNSLogService.ts` with log persistence (maybe SQLite or AsyncStorage).  
  - Provide filtering UI (method/status) & fallback chain visualization.
- [ ] Ensure production logs use guarded console statements (`__DEV__`) (FR-052).

## 6. Internationalization & Onboarding

- [ ] Integrate `expo-localization` & create `i18n` framework (FR-053–FR-058).  
  - Define typed translation keys (e.g., `types/translations.d.ts`).  
  - Provide translation files `i18n/en-US.json`, `i18n/pt-BR.json`.  
  - Wrap app with `<I18nProvider>`; expose `useTranslation()` hook.  
  - Update all UI text (tabs, buttons, errors) to use translations.
- [ ] Build onboarding flow (FR-059–FR-063).  
  - New routes under `app/onboarding/`.  
  - Include real DNS query demonstration using sandbox server + progress indicators.  
  - Store completion flag in AsyncStorage; redirect returning users to chat list.

## 7. DNS Server (`DOCS/ch_at_dns_server_code.go`)

- [ ] Verify if app client follow server implementation. DO NOT CHANGE SERVER IMPLEMENTATION!
- [ ] Sanitize incoming prompts, ensure synergy with client label constraints (FR-011).  
- [ ] Expand fallback handling for UDP duplicates (FR-015); ensure server merges/respects `n/n` format.  
- [ ] Add logging fields: query name, response time, status, error details (FR-046).  

## 8. Security, Performance & Compliance

- [ ] Security hardening checklist (NFR-009–NFR-017):  
  - Input validation across UI & backend.  
  - npm audit & dependency review (ensure zero critical).  
  - Document OWASP ASVS L1 coverage.
- [ ] Performance targets (NFR-001–NFR-008):  
  - Profile Liquid Glass usage; add instrumentation for FPS.  
  - Ensure Hermes builds with dSYM export (NFR-048).  
  - Verify New Architecture & React Compiler flags remain enabled.
- [ ] Accessibility audit (NFR-018–NFR-027):  
  - Add a11y props to buttons, list items, settings toggles.  
  - Provide dynamic hints (e.g., "Double tap to send DNS query").  
  - Respect `AccessibilityInfo.isReduceTransparencyEnabled` by switching to solid backgrounds.
- [ ] Cross-platform QA (NFR-028–NFR-036):  
  - Test matrix: iOS 16 & 26, Android API 21/29/34, modern browsers.  
  - Validate feature parity & transport toggles per platform.

## 9. Tooling, Testing & Release Process

- [ ] Expand test coverage:  
  - Unit tests for sanitization, transport selection, reducers (≥80% for critical services).  
  - Integration tests simulating fallback chain with mocked native responses.  
  - Native module tests (Swift XCTest, Android unit tests).  
- [ ] Add E2E tests (Detox/Playwright) covering onboarding, chat flows, settings toggles.  
- [ ] Automate `npm run sync-versions :dry` in CI; ensure CHANGELOG updates (NFR-046–NFR-048).  
- [ ] Document new APIs/settings in project docs; ensure Expo doctor passes 16/17 checks (NFR-050–NFR-051).  
- [ ] Capture telemetry for success metrics (Section 8 KPIs):  
  - Log DNS success/fail, fallback usage, onboarding completion, crash analytics.

## 10. Deployment Readiness

- [ ] Prepare EAS Build profiles for development, preview, production (NFR-049).  
- [ ] Confirm Java 17 setup for Android builds (`android-java17.sh`).  
- [ ] Run `pod install` updates after native module enhancements.  
- [ ] Ensure App Store privacy usage strings present & accurate (NFR-017).  

## 11. Setttings screen 
- [ ] Create a new modern (follow the latest best practices) settings screen
- [ ] Create a button in about box to call settings screen

## 12. Onboarding 
- [ ] Create a new modern (follow the latest best practices) Onboarding screen
- [ ] Create in settings screen a toggle to reenable it


---

**Status Tracking:** Update this markdown as tasks are completed. Prioritize transport reliability (Section 3/4/7) and onboarding/i18n (Section 6) to satisfy core PRD milestones.
