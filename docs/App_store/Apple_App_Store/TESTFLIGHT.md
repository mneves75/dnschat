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

Latest public release evidence (`2026-05-17`, Xcode `26.5` / `17F42`):

- Debug simulator build passed on iOS 26.5.
- AXe release simulator pass covered 10 feature groups for version `4.0.13`
  build `43`.
- Generic iOS Release build passed unsigned.
- Generic iOS Release archive passed unsigned.
- Physical-device compiled Expo dev-client install passed for version `4.0.8` build `36`.
- Signed App Store archive passed for version `4.0.13` build `43`.
- Signed IPA export passed for version `4.0.13` build `43`.
- App Store Connect metadata was applied for `en-US` and `pt-BR` release fields.
- App Store Connect TestFlight upload passed for version `4.0.13` build `43`.
- TestFlight build processing completed as `VALID`; non-exempt encryption is `false`.
- TestFlight validation passed with `0` errors and `0` warnings.
- App Store version validation passed with `0` errors and `0` warnings; App Privacy publish-state remains API-unverifiable.
- `asc doctor` passed local checks.
- `xcodebuild test` did not run because the `DNSChat` scheme has no XCTest bundles.
- Internal App Store Connect IDs, tester group names, device names, device identifiers, local paths, team IDs, profile names, and certificate IDs are intentionally omitted from public docs.

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
- **Version numbers** consistent (v4.0.13 build 43)
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

Current v4.0.13 distribution target:

- Version/build: `4.0.13` / `43`
- Processing state: `VALID`
- Tester groups: configured in App Store Connect; internal group names are intentionally omitted from public docs.
- Exact build IDs and App Store Connect version IDs belong in private release notes, not public runbooks.

After upload:

1. **Internal Testing**: Immediate access for team members
2. **External Testing**: Public beta testing after Apple review
3. **Feedback**: Collect user feedback through TestFlight
4. **Iterate**: Upload new builds for continuous testing

### What to Test for v4.0.13 build 43

- Complete onboarding from a fresh install and confirm the app lands on the chat list.
- Send short prompts through the default DNS service and confirm responses render.
- Confirm DNS failures, invalid settings, and unsupported server choices fail
  closed without exposing prompt text or TXT responses.
- Type in a long chat thread and confirm the final message remains visible above
  the composer as the keyboard/input inset changes.
- Open onboarding/help, Settings, and About external links and confirm allowed
  `https:` and `mailto:` destinations open normally.
- Confirm Logs show resolver attempts and failures without exposing prompt text or TXT responses.
- Confirm existing local chat history loads after update and remains available offline.
- Check onboarding, settings, About, and language/accessibility labels in English and Portuguese.
- Toggle supported DNS settings and confirm unsupported server choices fail closed.

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

_TestFlight upload guide for DNSChat v4.0.13 build 43 - Last updated: 2026-05-17_
