# TestFlight Upload Guide for DNSChat

To upload your DNSChat iOS app to TestFlight, you'll need to follow these steps:

## TestFlight upload process

### 1. **Prerequisites**

- **Apple Developer Account** (paid - $99/year)
- **Xcode** installed on macOS
- **App Store Connect** access
- **Code signing certificates** and provisioning profiles

### 2. **Set Up App Store Connect**

```bash
# First, create your app in App Store Connect
# Go to: https://appstoreconnect.apple.com
```

1. **Create App Record**:
   - Log into App Store Connect
   - Click "My Apps" → "+" → "New App"
   - **Platform**: iOS
   - **Name**: DNS Chat
   - **Bundle ID**: `<BUNDLE_ID>` (from your app.json)
   - **Language**: English
   - **SKU**: Any unique identifier (e.g., "dnschat-ios-2025")

### 3. **Configure Xcode Project for Distribution**

```bash
# Navigate to iOS project
cd ios

# Clean previous builds
rm -rf build/
rm -rf DerivedData/

# Install/update pods
pod install --clean-install
```

### 4. **Open Xcode and Configure Signing**

```bash
# Open workspace in Xcode
open DNSChat.xcworkspace
```

**In Xcode**:

1. **Select Project** → Select "DNSChat" target
2. **Signing & Capabilities** tab
3. **Team**: Select your Apple Developer team
4. **Bundle Identifier**: Ensure it matches `<BUNDLE_ID>`
5. **Signing**: Select "Automatically manage signing"

### 5. **Build for Archive**

**In Xcode**:

1. **Device Selection**: Choose "Any iOS Device" (not simulator)
2. **Scheme**: Ensure "DNSChat" scheme is selected
3. **Build Configuration**: Set to "Release"

**Menu**: Product → Archive

### 6. **Upload to App Store Connect**

**After successful archive**:

1. **Organizer** window opens automatically
2. **Select your archive** → **Distribute App**
3. **App Store Connect** → **Next**
4. **Upload** → **Next**
5. **Automatically manage signing** → **Next**
6. Review and **Upload**

### 7. **Command-line build validation**

Run these before a signed upload when you want CLI evidence outside Xcode:

```bash
# Check available destinations
xcodebuild -workspace ios/DNSChat.xcworkspace -scheme DNSChat -showdestinations

# Debug simulator build
xcodebuild clean build \
  -workspace ios/DNSChat.xcworkspace \
  -scheme DNSChat \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 17'

# Release compile/archive smoke without local signing credentials
xcodebuild clean build \
  -workspace ios/DNSChat.xcworkspace \
  -scheme DNSChat \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  CODE_SIGNING_ALLOWED=NO

xcodebuild clean archive \
  -workspace ios/DNSChat.xcworkspace \
  -scheme DNSChat \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath /tmp/DNSChat.xcarchive \
  CODE_SIGNING_ALLOWED=NO
```

Latest fully signed/uploaded public evidence is `4.0.26` build `60`
(`2026-06-05`, SDK 56.0.8 baseline). Build `60` validation completed so far:

- `bun run verify:all`, secret scan, and `asc doctor` have fresh build `60`
  evidence.
- Physical-device Release build/install completed for `4.0.22` build `56`;
  `devicectl` reported installed metadata `4.0.22`/`56` and launched the app
  successfully. A `devicectl` relaunch can still be denied by iOS when the phone
  is locked; that is tracked separately from install proof. Direct install for
  `4.0.26` build `60` is blocked by local Xcode Development provisioning state
  (`No Accounts` and no matching development profile).
- Signed App Store archive/export and TestFlight upload passed for `4.0.26`
  build `60`; App Store Connect processing returned `VALID`, and
  `asc validate testflight` reported `0` errors and `0` warnings. Exact App
  Store Connect identifiers remain private.
- App Store Connect has no App Store version record for `4.0.26`; this is a
  TestFlight-only staging build, not an App Store submission.
- Internal App Store Connect IDs, tester group names, device names, device identifiers, local paths, team IDs, profile names, and certificate IDs are intentionally omitted from public docs.

Earlier 4.0.14 baseline evidence (`2026-05-22`, Xcode `26.5` / `17F42`, SDK 56 baseline):

- Lint (`ast-grep`), `verify:ios-pods`, and the full Jest suite (816 passed /
  13 skipped, 95 of 96 suites) passed for version `4.0.14` build `44`.
- Physical-device Debug build (Apple Development signing) compiled and installed
  via `xcrun devicectl` on an iPhone 17 Pro Max for version `4.0.14` build `44`.
- Physical-device Release build (Apple Development signing) compiled and
  installed via `xcrun devicectl` on the same device for version `4.0.14`
  build `44`, and the bundle launched successfully.
- Signed App Store archive, signed IPA export, and App Store Connect TestFlight
  upload were NOT run for `4.0.14` build `44` because no Apple Distribution
  identity was available locally.

Prior signed-release evidence (`2026-05-17`, Xcode `26.5` / `17F42`):

- Debug simulator build passed on iOS 26.5.
- AXe release simulator pass covered 10 feature groups for version `4.0.13`
  build `43`.
- Generic iOS Release build passed unsigned.
- Generic iOS Release archive passed unsigned.
- Physical-device compiled app install passed for version `4.0.8` build `36`.
- Signed App Store archive passed for version `4.0.13` build `43`.
- Signed IPA export passed for version `4.0.13` build `43`.
- App Store Connect metadata was applied for `en-US` and `pt-BR` release fields.
- App Store Connect TestFlight upload passed for version `4.0.13` build `43`.
- TestFlight build processing completed as `VALID`; non-exempt encryption is `false`.
- TestFlight validation passed with `0` errors and `0` warnings.
- App Store version validation is not applicable until a matching App Store
  version record exists; App Privacy publish-state remains API-unverifiable.
- `asc doctor` passed local checks.
- `xcodebuild test` did not run because the `DNSChat` scheme has no XCTest bundles.

If Xcode script phases fail with a missing Node binary, inspect
`ios/.xcode.env.local`. It is ignored by Git and can contain a stale local
`NODE_BINARY` override.

### 8. **Alternative: EAS command-line upload**

If you prefer command line or need automation:

```bash
# Install Expo CLI tools
bun add -g @expo/cli
bun add -g eas-cli

# Configure EAS (Expo Application Services)
eas login
eas build:configure

# Build and submit
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

### 9. **Configure TestFlight in App Store Connect**

**After upload processes**:

1. Go to **App Store Connect** → **Your App** → **TestFlight**
2. **Processing**: Wait for Apple to process your build (5-30 minutes)
3. **Compliance**: Answer export compliance questions
4. **Internal Testing**: Add internal testers (up to 100)
5. **External Testing**: Create test groups for external testers

### 10. **Add TestFlight Testers**

**Internal Testers** (App Store Connect users):

- Automatically added, no review needed
- Can test immediately after processing

**External Testers**:

- Add via email addresses
- Requires Apple review (24-48 hours)
- Up to 10,000 testers

### Troubleshooting common issues

#### Code Signing Problems:

```bash
# Clean derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Regenerate certificates
# Go to Xcode → Preferences → Accounts → Download Manual Profiles
```

#### Native Module Issues:

```bash
# Ensure native DNS module builds properly
cd ios && pod install && cd ..

# Check native module compilation
bun run ios -- --verbose
```

#### Bundle Identifier Conflicts:

- Ensure `<BUNDLE_ID>` is unique in App Store Connect
- Check it matches exactly in `app.json` and Xcode

### Pre-upload checklist

- **Apple Developer Account** active
- **App Store Connect** app record created
- **Code signing** configured correctly
- **Bundle ID** matches (`<BUNDLE_ID>`)
- **Version numbers** consistent (v4.0.26 build 60)
- **Native DNS module** compiles successfully
- **Xcode CLI smoke** passed:
  - Debug simulator build
  - Generic iOS Release build/archive, or signed equivalent
- **ASC local health** checked with `asc doctor`
- **Universal landscape support** enabled
- **App Store screenshots** (current requirements):
  - iPhone screenshots uploaded for `en-US` and `pt-BR`
  - iPad screenshots uploaded for `en-US` and `pt-BR`
- **App icons** and metadata ready
- **Privacy Policy** URL (required for App Store)

### Quick start commands

```bash
# Clean and prepare
cd ios && pod install --clean-install && cd ..

# Build in Xcode
open ios/DNSChat.xcworkspace

# Or use EAS (recommended for Expo projects)
eas build --platform ios --profile production
```

### TestFlight distribution

Current v4.0.26 distribution target:

- Version/build: `4.0.26` / `60`
- Processing state: `VALID`; TestFlight validation reports `0` errors and `0`
  warnings.
- App Store state: no App Store version record exists for `4.0.26`; create or
  update an App Store version only when preparing an App Store submission.
- Tester groups: configured in App Store Connect; internal group names are intentionally omitted from public docs.
- Exact build IDs and App Store Connect version IDs belong in private release notes, not public runbooks.

After upload:

1. **Internal Testing**: Immediate access for team members
2. **External Testing**: Public beta testing after Apple review
3. **Feedback**: Collect user feedback through TestFlight
4. **Iterate**: Upload new builds for continuous testing

### What to Test for v4.0.26 build 60

- Complete onboarding from a fresh install and confirm the app lands on the chat list.
- Open native menu actions and React Native modal sheet actions from chat, logs,
  messages, and settings; confirm they remain accessible and dismiss cleanly.
- Open a stale chat deep link and confirm the conversation-not-found state
  appears instead of a blank chat.
- Send short prompts through the default DNS service and confirm responses render.
- Confirm DNS failures, invalid settings, and unsupported server choices fail
  closed without exposing prompt text or TXT responses.
- Type in a long chat thread and confirm new messages follow the bottom while
  manual scrollback is not forced down by background updates.
- Open onboarding/help, Settings, and About external links and confirm allowed
  `https:` and `mailto:` destinations open normally.
- Confirm Logs show resolver attempts and failures without exposing prompt text or TXT responses.
- Confirm existing local chat history loads after update and remains available offline.
- Check onboarding, settings, About, and language/accessibility labels in English and Portuguese.
- Toggle supported DNS settings and confirm unsupported server choices fail closed.
- Turn on system Reduce Motion before launch and confirm onboarding, chat, and
  settings render without startup loops or unexpected motion.
- Increase the in-app font-size preference and confirm chat list, profile, and
  message surfaces scale text without clipping.
- In Portuguese, confirm chat-list and profile relative timestamps localize
  instead of using English date phrasing.

**Next Steps**: After TestFlight testing, you can submit for full App Store review and release!

## Useful links

- [App Store Connect](https://appstoreconnect.apple.com)
- [Apple Developer Portal](https://developer.apple.com)
- [TestFlight Documentation](https://developer.apple.com/testflight/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

## Support

If you encounter issues during the upload process:

1. Check the [Apple Developer Forums](https://developer.apple.com/forums/)
2. Review Expo documentation for native builds
3. Verify all native modules compile correctly with `bun run ios`
4. Ensure code signing certificates are valid and not expired

---

_TestFlight upload guide for DNSChat v4.0.26 build 60 - Last updated: 2026-06-05_
