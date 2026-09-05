# DNS Chat - App Store Connect Marketing Materials

## Release state

- **Repository target:** `4.4.3` build `88`; signed archive and IPA uploaded.
- **Latest validated TestFlight artifact:** `4.4.3` build `88`, tagged
  `v4.4.3-beta1` and processed `VALID` on `2026-09-05`, with bilingual test
  notes and strict validation at `0` errors and `0` warnings.
- **Latest production App Store release:** `4.0.23`, observed as
  `READY_FOR_SALE` on `2026-09-05`. The existing draft is now `4.4.3`, attached
  to build `88`, with updated bilingual metadata. Its missing social-media
  capability fields are set to false: DNSChat has no social feed or user-to-user
  communication. Strict API readiness passes, but App Privacy publication and
  the provider privacy/content declarations still need verification.

## App Store Listing Information

### App Title

**DNS Chat**

### Subtitle (30 characters max)

**AI chat over DNS queries**

### Marketing URL

<REPOSITORY_URL>

### Support URL

<ISSUES_URL>

### Privacy Policy URL

<PRIVACY_POLICY_URL>

---

## App Store Description (4000 characters max)

DNSChat sends short messages as DNS TXT queries to a compatible third-party DNS service and displays its responses in a chat interface.

CHAT AND LOCAL HISTORY
- Keep conversation history encrypted on your iPhone or iPad.
- Use the app without an account or an API key.
- Choose light or dark appearance, English or Portuguese, and adjustable text size.
- Inspect transport attempts and errors in the local Logs screen.

DNS TRANSPORT
The default service is llm.pieter.com; ch.at is also available in Settings. Native DNS, UDP and TCP attempts share one time limit. Connectivity depends on your network and the selected service.

PRIVACY AND LIMITATIONS
DNSChat includes no analytics or advertising SDK. Prompts are sent to the selected third-party DNS service. DNSChat does not control that provider's retention, secondary use or deletion practices.

DNS queries are observable by DNS infrastructure, and responses are not authenticated end to end. Do not send secrets or personal data. Treat generated responses as untrusted information and verify important claims independently.

DNSChat is open source and intended for people interested in experimenting with DNS-based communication.

---

## Keywords (100 characters max)

AI,chat,DNS,assistant,local,native,tech,innovation,queries,networking

---

## Historical What's New (TestFlight v4.3.6)

RELIABILITY, SECURITY, AND ACCESSIBILITY

- Hardened native DNS deadlines, cancellation, and malformed-response rejection.
- Preserved encrypted data during secure-key failures.
- Improved contrast, localized failures, and bilingual captions.
- Hardened model-output links and release/public-data controls.

## Historical TestFlight What to Test (v4.3.6 build 84)

- Launch the app on iOS 27 and confirm it remains open instead of returning to the Home Screen.
- Cold-start the app from a `dnschat://` link, then open another `dnschat://` link while it is already running.
- Complete onboarding from a fresh install and confirm the app lands on the chat list.
- Open message/chat/log/settings menus and confirm actions remain reachable on supported native platforms and fall back cleanly elsewhere.
- Open settings and chat sheets and confirm React Native modal dismissal, accessibility labels, and hit targets behave correctly.
- Open a stale chat deep link and confirm the conversation-not-found state appears instead of a blank chat.
- Send short prompts over the default DNS service and confirm responses render without transport errors.
- Confirm settings/About reports 4.3.6 build 84 and DNS failures show a compact localized retry prompt.
- Confirm DNS failures, invalid settings, and unsupported server choices fail closed without exposing prompt text or TXT response contents.
- Type in a long chat thread and confirm new messages follow the bottom while manual scrollback is not forced down by background updates.
- Open onboarding/help, Settings, and About external links and confirm allowed HTTPS and email destinations open normally.
- Open Logs and confirm DNS attempts, fallback methods, and failures are visible without exposing prompt text or TXT response contents.
- Check Settings, About, Profile, and language/accessibility labels in English and Portuguese.
- Exercise DNS server settings and confirm invalid or unsupported server choices fail closed.
- Turn on system Reduce Motion before launch and confirm onboarding, chat, and settings render without startup loops or unexpected motion.
- Increase the in-app font-size preference and confirm chat list and message surfaces scale without clipping.
- In Portuguese, confirm chat-list relative timestamps use Portuguese phrasing.

---

## Promotional Text (170 characters max)

AI chat using DNS queries with native iOS performance, local encrypted history, and transparent networking.

---

## App Information

### Category

**Utilities**

### Content Rating

**Pending evidence.** Do not select or publish an age rating from this runbook.
The app renders third-party model output, so complete the App Store questionnaire
only after documenting provider safeguards and testing representative adversarial
prompts. Record the observed content risks and answer conservatively.

### App Icon

- **iOS**: `/icons/dnschat_ios26.png` (1024x1024)
- **Android**: `/icons/dnschat_ios26.png` (512x512)

### Screenshots Location (Current)

**iPhone screenshots**: current sets live under `ios/fastlane/screenshots/en-US/` and `ios/fastlane/screenshots/pt-BR/`.

**iPad screenshots**: current iPad Pro 13-inch sets live under the same `ios/fastlane/screenshots/` locale folders.

Validated screenshot sets currently available in App Store Connect:

- `APP_IPHONE_65`: 8 screenshots each for `en-US` and `pt-BR`.
- `APP_IPAD_PRO_3GEN_129`: 4 screenshots each for `en-US` and `pt-BR`.
- Local validation passed with `asc screenshots validate` before upload.

---

## App Store Connect Technical Details

### Bundle Information

- **Bundle ID**: `<BUNDLE_ID>`
- **Repository target**: `4.4.3` build `88` (from `package.json` via `sync-versions`)
- **Latest validated TestFlight artifact**: `4.4.3` build `88`
- **Latest production App Store release**: `4.0.23` (verified `2026-09-05`)
- **App Store Connect internal IDs**: intentionally omitted from public docs; keep exact IDs in private release notes.
- **Minimum iOS Version**: 16.4
- **Device Support**: iPhone, iPad
- **Orientation**: Portrait + Landscape (default)

### App Store Connect Settings

- **Age Rating**: pending provider-safeguard and representative adversarial evidence
- **Uses IDFA**: No
- **Contains Ads**: No
- **In-App Purchases**: No
- **Subscription**: No
- **Game Center**: No

### Review Information

**Demo Account**: Not required (no authentication)
**Review Notes**:

```
This app uses innovative DNS TXT queries to communicate with AI.
Test with any message to see the DNS-based communication in action.
Conversations are encrypted in local storage. Prompts are also sent to the
selected third-party DNS service; its retention and deletion practices are not
controlled by DNSChat. DNS queries are observable, so do not send secrets or
personal data.
No user account is required. The app does not require app-owned backend infrastructure, but it does require a compatible DNS service.
```

---

## ASO Strategy

### Primary Keywords (Focus)

1. **AI Chat** (High volume, medium competition)
2. **DNS Assistant** (Low volume, low competition - unique positioning)
3. **Local Chat** (Medium volume, medium competition)
4. **Native AI** (Medium volume, low competition)
5. **Networking Tools** (Medium volume, high competition)

### Long-tail Keywords

- "DNS based chat app"
- "Local history AI assistant"
- "Native iOS AI chat"
- "DNS TXT chat experiment"
- "Network protocol innovation"

### Localization Strategy

**Phase 1**: English (Primary market)
**Phase 2**: Portuguese, Spanish, French, German
**Phase 3**: Japanese, Korean, Chinese (Simplified)

---

## Launch Strategy

### Pre-Launch (Week -2)

- [ ] Submit to App Store Review
- [ ] Prepare press kit and media assets
- [ ] Create landing page with screenshots
- [ ] Social media teasers (@dnschat handle)

### Launch Day (Week 0)

- [ ] App Store release announcement
- [ ] GitHub repository promotion
- [ ] Tech community outreach (HackerNews, Reddit r/programming)
- [ ] Social launch engagement

### Post-Launch (Week +1)

- [ ] Monitor reviews and ratings
- [ ] ASO optimization based on performance
- [ ] Feature in tech blogs and podcasts
- [ ] Community feedback integration

---

## Competitive Analysis

### Direct Competitors

**None** - First DNS-based AI chat app in App Store

### Similar Categories

1. **ChatGPT** - Traditional API-based AI chat
2. **Claude** - Cloud-based AI assistant
3. **Telegram** - Messaging with bot integration
4. **Signal** - Privacy-focused messaging

### Unique Value Proposition

- **Local encrypted history** with no accounts or tracking
- **Native performance** with Apple Network Framework
- **DNS TXT transport** with transparent networking behavior
- **Open source** and fully transparent

---

## Support Information

### Support Channels

- **GitHub Issues**: `<ISSUES_URL>`
- **Email**: support@dnschat.app (to be configured)
- **X/social**: @dnschat (to be created)

### Common Support Topics

1. How DNS-based communication works
2. Custom DNS server configuration
3. Network troubleshooting and fallbacks
4. Privacy and data storage explanation
5. Technical implementation details

---

## Submission Checklist

### Required Assets

- [x] App Icon (1024x1024)
- [x] 5 Screenshots (1320x2868)
- [x] App Description (under 4000 chars)
- [x] Keywords (under 100 chars)
- [x] What's New text
- [x] Promotional text (under 170 chars)

### App Store Connect Configuration

- [x] Historical IPA upload evidence exists for `4.0.13` build `43`
- [x] Latest validated TestFlight artifact uploaded (`4.4.3` build `88`)
- [x] Local ASC health checked with `asc doctor` (`2026-08-31`)
- [x] Apply App Store Connect metadata for `en-US` and `pt-BR`
- [x] Renew iPhone and iPad screenshot sets for `en-US` and `pt-BR`
- [x] Update the App Store version to `4.4.3` and attach validated build `88`
- [ ] Configure pricing (Free)
- [ ] Set availability (Worldwide)
- [ ] Age rating questionnaire
- [x] Export compliance (`ITSAppUsesNonExemptEncryption=false`; no non-exempt encryption)
- [x] Content rights declaration (`DOES_NOT_USE_THIRD_PARTY_CONTENT`)

### Review Submission

- [x] Xcode Debug simulator build passed (`2026-06-30`, Xcode `26.6`)
- [x] Xcode generic iOS Release build/archive passed unsigned (`2026-06-30`)
- [x] Signed archive/export passed for `4.0.13` build `43`
- [x] Historical App Store Connect upload/submission check passed for build `43`
- [x] Historical TestFlight validation passed (`0` errors, `0` warnings) for build `43`
- [x] Historical build `56` physical-device Release build/install/launch
- [x] Historical build `84` signed archive/export
- [x] Historical build `84` physical-device Release install/launch
- [x] Historical build `84` TestFlight processing check (`VALID`)
- [x] Historical build `84` TestFlight validation (`0` errors, `0` warnings)
- [x] Build `88` upload, matching version attachment and strict API pre-submit validation
- [ ] App Privacy web verification and publisher privacy/content decisions
- [ ] Build `88` physical-device runtime verification
- [ ] Submit for App Store Review
- [ ] Final testing on TestFlight
- [ ] Review guidelines compliance check
- [ ] Monitor review status

---

_Source target and validated TestFlight beta: 4.4.3 build 88; production remains 4.0.23._
