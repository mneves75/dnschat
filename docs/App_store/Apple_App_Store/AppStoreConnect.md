# DNS Chat - App Store Connect Marketing Materials

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

DNS Chat is a mobile chat app that sends short prompts as DNS TXT queries and renders AI-style responses from compatible DNS servers.

DNS-BASED TRANSPORT
Chat through DNS TXT queries instead of traditional HTTPS API calls. Use the default compatible DNS service or configure supported servers from the app settings.

NATIVE PERFORMANCE

- Native iOS implementation using Apple Network Framework
- Fast DNS queries with automatic transport fallback
- Works on cellular and WiFi networks worldwide
- Production-ready with comprehensive error handling

MODERN CHAT EXPERIENCE

- ChatGPT-style interface with beautiful message bubbles
- Persistent conversation history stored locally
- Dark/Light theme follows your device settings
- Smooth animations and intuitive navigation

LOCAL DATA & TRANSPARENCY

- Conversation history is stored locally on your device
- No account required, no data tracking
- Network-resilient with multiple fallback methods
- Open-source and fully transparent
- DNS queries are observable by DNS infrastructure, so do not send secrets or personal data

CROSS-PLATFORM READY

- Optimized for iPhone and iPad
- React Native architecture for consistent performance across iOS and Android
- Professional DNS-themed app icon and branding

CUSTOMIZABLE
Choose from supported DNS servers or use the default service. Perfect for developers, local-first app enthusiasts, and anyone curious about protocol-level experimentation.

Perfect for:

- Tech enthusiasts exploring cutting-edge communication
- Local-first users who understand DNS queries are observable infrastructure
- Developers interested in DNS innovation
- Anyone wanting a fast, reliable AI chat experience

Download now to try AI-style chat over DNS.

---

## Keywords (100 characters max)

AI,chat,DNS,assistant,local,native,tech,innovation,queries,networking

---

## What's New (Release Notes v4.0.10)

AXE-VERIFIED RELEASE

- Added full AXe simulator E2E coverage for onboarding, chat, settings, DNS logs, About, profile, and fallback routes.
- Improved accessibility identifiers and labels across core screens for more reliable navigation and assistive technology coverage.
- Tightened release diagnostics with screenshot and accessibility-tree artifacts when E2E checks fail.
- Kept privacy language explicit: local history is encrypted at rest, while DNS transport remains observable infrastructure.

## TestFlight What to Test (v4.0.10 build 39)

- Complete onboarding from a fresh install and confirm the app lands on the chat list.
- Send short prompts over the default DNS service and confirm responses render without transport errors.
- Open Logs and confirm DNS attempts, fallback methods, and failures are visible without exposing prompt text or TXT response contents.
- Check Settings, About, Profile, and language/accessibility labels in English and Portuguese.
- Exercise DNS server settings and confirm invalid or unsupported server choices fail closed.

---

## Promotional Text (170 characters max)

AI chat using DNS queries with native iOS performance, local encrypted history, and transparent networking.

---

## App Information

### Category

**Utilities**

### Content Rating

**4+** (Ages 4 and up)

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
- **Version**: `4.0.10`
- **Build Number**: 39 (sync-versions)
- **App Store Connect internal IDs**: intentionally omitted from public docs; keep exact IDs in private release notes.
- **Minimum iOS Version**: 16.0
- **Device Support**: iPhone, iPad
- **Orientation**: Portrait + Landscape (default)

### App Store Connect Settings

- **Age Rating**: 4+
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
Conversations are stored locally. DNS queries are observable, so do not send secrets or personal data.
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

- [x] Upload final IPA build (`4.0.10` build `39`)
- [x] Local ASC health checked with `asc doctor` (`2026-05-15`)
- [x] Apply App Store Connect metadata for `en-US` and `pt-BR`
- [ ] Configure pricing (Free)
- [ ] Set availability (Worldwide)
- [ ] Age rating questionnaire
- [x] Export compliance (`ITSAppUsesNonExemptEncryption=false`; no non-exempt encryption)
- [x] Content rights declaration (`DOES_NOT_USE_THIRD_PARTY_CONTENT`)

### Review Submission

- [x] Xcode Debug simulator build passed (`2026-05-14`, Xcode `26.5`)
- [x] Xcode generic iOS Release build/archive passed unsigned (`2026-05-14`)
- [x] Signed archive/export passed for `4.0.10` build `39`
- [x] App Store Connect upload/submission check with configured ASC credentials
- [x] TestFlight validation passed (`0` errors, `0` warnings)
- [ ] Final testing on TestFlight
- [ ] Review guidelines compliance check
- [ ] Submit for App Store Review
- [ ] Monitor review status

---

_Updated for DNS Chat v4.0.10 build 39 - AXe feature coverage complete, App Store metadata applied, TestFlight upload valid_
