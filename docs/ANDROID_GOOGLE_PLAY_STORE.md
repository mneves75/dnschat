# Google Play Store Launch Guide

Complete step-by-step guide for publishing DNSChat to the Google Play Store.

**App**: DNSChat
**Package**: `com.dnschat.app`
**Current Version**: 3.6.0

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Play Console Setup](#google-play-console-setup)
3. [App Listing Configuration](#app-listing-configuration)
4. [Store Listing Assets](#store-listing-assets)
5. [Content Rating](#content-rating)
6. [Pricing & Distribution](#pricing--distribution)
7. [App Signing](#app-signing)
8. [Release Management](#release-management)
9. [Review Checklist](#review-checklist)

---

## Prerequisites

Before starting, ensure you have:

- [ ] Google Play Developer Account ($25 one-time fee)
- [ ] Signed release AAB/APK (see [ANDROID_RELEASE.md](./ANDROID_RELEASE.md))
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots for each device type
- [ ] Privacy policy URL (required)
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)

---

## Google Play Console Setup

### Step 1: Create Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with Google account
3. Accept Developer Agreement
4. Pay $25 registration fee
5. Complete account details (name, address, phone)

### Step 2: Create New App

1. Click **"Create app"** button
2. Fill in app details:
   - **App name**: `DNSChat`
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
3. Accept declarations (Developer Program Policies, US export laws)
4. Click **"Create app"**

### Step 3: Set Up Your App

Complete the **Dashboard** checklist:

```
Dashboard → Set up your app
├── App access (if app requires login/special access)
├── Ads (declare if app contains ads)
├── Content ratings
├── Target audience
├── News apps (declare if news app)
├── COVID-19 apps (declare if related)
├── Data safety
├── Government apps (declare if government)
└── Financial features (declare if applicable)
```

---

## App Listing Configuration

### Main Store Listing

Navigate to: **Grow → Store presence → Main store listing**

#### App Details

| Field | Value |
|-------|-------|
| App name | DNSChat |
| Short description | Chat via DNS - Send messages through DNS TXT queries |
| Full description | See [Full Description](#full-description) below |

#### Full Description

```
DNSChat is an innovative chat application that sends messages through DNS TXT queries, demonstrating the creative potential of internet protocols.

KEY FEATURES:

• DNS-Based Messaging
Send short prompts as DNS TXT queries and receive AI-powered responses through the DNS protocol.

• Multiple DNS Transports
Supports Native DNS, UDP, and TCP transports with automatic fallback for reliability.

• Privacy-Focused
No account required. Messages are processed through DNS - no traditional server infrastructure.

• Beautiful iOS 26-Inspired UI
Modern glass-effect interface with smooth animations and dark mode support.

• Query Logging
View detailed logs of all DNS queries with timing, method used, and response data.

• Offline Support
Chat history is stored locally and accessible offline.

• Accessibility
Full VoiceOver/TalkBack support with screen reader optimizations.

TECHNICAL DETAILS:

• Built with React Native and Expo SDK 54
• React 19 with New Architecture enabled
• Native DNS module for iOS and Android
• Supports DNS servers: 1.1.1.1, 8.8.8.8, 9.9.9.9

OPEN SOURCE:
DNSChat is open source. View the code and contribute at:
https://github.com/mneves75/dnschat

NOTE: This app is for educational and demonstration purposes, showcasing DNS protocol capabilities.
```

### Contact Details

| Field | Value |
|-------|-------|
| Email | your-support-email@example.com |
| Phone | (Optional) |
| Website | https://github.com/mneves75/dnschat |

---

## Store Listing Assets

### Required Graphics

#### 1. App Icon
- **Size**: 512 x 512 px
- **Format**: PNG (32-bit with alpha)
- **Location**: `src/assets/dnschat_ios26.png` (scale up or recreate)

#### 2. Feature Graphic
- **Size**: 1024 x 500 px
- **Format**: PNG or JPEG
- **Content**: App name, tagline, key visual
- **Tips**:
  - Keep text minimal (may be cropped on some devices)
  - Use brand colors
  - Show app in action or key feature

#### 3. Screenshots

| Device Type | Required | Dimensions | Recommended |
|-------------|----------|------------|-------------|
| Phone | Yes (2-8) | 16:9 or 9:16 | 1080x1920 or 1920x1080 |
| 7" Tablet | Optional | 16:9 or 9:16 | 1200x1920 or 1920x1200 |
| 10" Tablet | Optional | 16:9 or 9:16 | 1600x2560 or 2560x1600 |

### Screenshot Recommendations

Capture these screens for best store presentation:

1. **Chat List Screen** - Show the glass UI chat list with sample conversations
2. **Active Chat Screen** - Display a conversation with DNS responses
3. **DNS Query Logs** - Show the detailed query logging feature
4. **Settings Screen** - Display customization options
5. **About Screen** - Show app info and credits
6. **Empty State** - Show the welcoming empty state UI

### Taking Screenshots

#### Using Android Emulator:

```bash
# Start emulator
npm run android

# Take screenshot (saves to desktop)
adb exec-out screencap -p > ~/Desktop/screenshot_$(date +%s).png

# Or use Android Studio:
# View → Tool Windows → Device File Explorer
# Navigate to /sdcard/Pictures/Screenshots
```

#### Using Physical Device:

1. Connect device via USB
2. Enable USB debugging
3. Run: `adb exec-out screencap -p > screenshot.png`

Or use device's native screenshot (Power + Volume Down)

### Screenshot Best Practices

- Use **portrait orientation** (9:16) for phones
- Show **actual app content**, not mockups
- Use **dark mode** for at least 2 screenshots (shows glass effects better)
- Add **device frames** (optional but professional)
- Include **captions** describing features (Google Play supports this)

---

## Content Rating

Navigate to: **Policy → App content → Content ratings**

### IARC Questionnaire

Answer the following for DNSChat:

| Question | Answer |
|----------|--------|
| Violence | No |
| Sexual content | No |
| Language | No |
| Controlled substances | No |
| User interaction | No (no chat between users) |
| Location sharing | No |
| User-generated content | No |
| In-app purchases | No |
| Ads | No |

**Expected Rating**: PEGI 3 / Everyone

---

## Pricing & Distribution

Navigate to: **Monetize → Pricing**

### Settings

| Setting | Value |
|---------|-------|
| Price | Free |
| Distributed countries | All countries |
| Contains ads | No |
| In-app purchases | No |

---

## App Signing

### Google Play App Signing (Recommended)

1. Navigate to: **Release → Setup → App signing**
2. Choose **"Use Google-generated key"** (recommended for new apps)
3. Google manages your app signing key securely
4. You upload with your upload key (from `keystore.properties`)

### Upload Key Setup

Your upload key is configured in:
- `android/keystore.properties` (local, git-ignored)
- Or injected via CI/CD secrets

See [ANDROID_RELEASE.md](./ANDROID_RELEASE.md) for signing configuration.

---

## Release Management

### Step 1: Create Internal Testing Release

1. Navigate to: **Release → Testing → Internal testing**
2. Click **"Create new release"**
3. Upload your AAB file:
   ```bash
   # Build AAB locally
   cd android && ./gradlew bundleRelease
   # Output: android/app/build/outputs/bundle/release/app-release.aab

   # Or use EAS Build
   eas build --platform android --profile production
   ```
4. Add release notes
5. Click **"Save"** then **"Review release"**
6. Click **"Start rollout to Internal testing"**

### Step 2: Test Internally

1. Add testers: **Internal testing → Testers**
2. Create email list or use Google Groups
3. Share opt-in link with testers
4. Testers install via Play Store (internal track)

### Step 3: Closed Testing (Beta)

1. Navigate to: **Release → Testing → Closed testing**
2. Create track (e.g., "Beta testers")
3. Promote from internal or upload new AAB
4. Add more testers (up to 100,000)

### Step 4: Open Testing (Optional)

1. Navigate to: **Release → Testing → Open testing**
2. Anyone can join without invitation
3. Good for larger scale testing before production

### Step 5: Production Release

1. Navigate to: **Release → Production**
2. Click **"Create new release"**
3. Either:
   - **Promote** from testing track, or
   - **Upload** new AAB
4. Add release notes:
   ```
   What's new in v3.5.0:
   • Enhanced security with DNS response validation
   • Improved performance and memory management
   • React Compiler optimizations enabled
   • Various bug fixes and stability improvements
   ```
5. Click **"Review release"**
6. Set rollout percentage (start with 10-20% recommended)
7. Click **"Start rollout to Production"**

---

## Data Safety Section

Navigate to: **Policy → App content → Data safety**

### DNSChat Data Practices

| Category | Collected | Shared | Required |
|----------|-----------|--------|----------|
| Personal info | No | No | - |
| Financial info | No | No | - |
| Health & fitness | No | No | - |
| Messages | Yes* | No | Optional |
| Photos & videos | No | No | - |
| Audio | No | No | - |
| Files & docs | No | No | - |
| Calendar | No | No | - |
| Contacts | No | No | - |
| App activity | No | No | - |
| Web browsing | No | No | - |
| App info & performance | No | No | - |
| Device identifiers | No | No | - |
| Location | No | No | - |

*Messages are stored locally only (AsyncStorage) and transmitted via DNS queries to ch.at servers.

### Security Practices

- [ ] Data encrypted in transit (DNS over standard port 53)
- [x] Data stored locally on device only
- [ ] Users can request data deletion (clear from Settings)

---

## Review Checklist

Before submitting for review, verify:

### App Quality

- [ ] App installs and launches without crashes
- [ ] All core features work (chat, DNS queries, logs)
- [ ] Back button behavior is correct
- [ ] App handles network errors gracefully
- [ ] Accessibility features work (TalkBack)

### Store Listing

- [ ] App name is correct and unique
- [ ] Short description is compelling (80 chars)
- [ ] Full description explains features clearly
- [ ] Screenshots show actual app (not mockups)
- [ ] Feature graphic is professional
- [ ] Contact email is valid and monitored

### Policy Compliance

- [ ] Privacy policy URL is accessible
- [ ] Content rating questionnaire completed
- [ ] Data safety section accurate
- [ ] No policy violations in app content
- [ ] Target audience correctly set

### Technical

- [ ] AAB is signed with upload key
- [ ] Version code is incremented from previous release
- [ ] minSdkVersion meets requirements (API 24+)
- [ ] targetSdkVersion is current (API 34+)
- [ ] No debug code in release build

---

## Troubleshooting

### Common Rejection Reasons

1. **Broken functionality**: Test all features before submission
2. **Misleading metadata**: Screenshots must match actual app
3. **Privacy policy issues**: Must be accessible and complete
4. **Crash on launch**: Test on multiple API levels

### Review Timeline

- Internal testing: Instant (no review)
- Closed testing: Usually <24 hours
- Production: 1-7 days (first release may take longer)

### Support

- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Policy Center](https://play.google.com/about/developer-content-policy/)
- [Developer Support](https://support.google.com/googleplay/android-developer/contact/dev_support)

---

## Version History

| Version | Date | Notes |
|---------|------|-------|
| 3.6.0 | 2025-12-16 | Google Play Store documentation |
| 3.5.0 | 2025-12-16 | Security hardening, TypeScript fixes |
| 3.4.0 | 2025-12-16 | Security fixes (8 critical) |
| 3.3.0 | 2025-12-16 | Android hardening |

---

*Last updated: 2025-12-16*
