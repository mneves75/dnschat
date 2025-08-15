# TestFlight Upload Guide for DNSChat

To upload your DNSChat iOS app to TestFlight, you'll need to follow these steps:

## 📱 TestFlight Upload Process

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
   - **Bundle ID**: `org.mvneves.dnschat` (from your app.json)
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
open ChatDNS.xcworkspace
```

**In Xcode**:
1. **Select Project** → Select "ChatDNS" target
2. **Signing & Capabilities** tab
3. **Team**: Select your Apple Developer team
4. **Bundle Identifier**: Ensure it matches `org.mvneves.dnschat`
5. **Signing**: Select "Automatically manage signing"

### 5. **Build for Archive**

**In Xcode**:
1. **Device Selection**: Choose "Any iOS Device" (not simulator)
2. **Scheme**: Ensure "ChatDNS" scheme is selected
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

### 7. **Alternative: Command Line Upload**

If you prefer command line or need automation:

```bash
# Install Expo CLI tools
npm install -g @expo/cli
npm install -g eas-cli

# Configure EAS (Expo Application Services)
eas login
eas build:configure

# Build and submit
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

### 8. **Configure TestFlight in App Store Connect**

**After upload processes**:
1. Go to **App Store Connect** → **Your App** → **TestFlight**
2. **Processing**: Wait for Apple to process your build (5-30 minutes)
3. **Compliance**: Answer export compliance questions
4. **Internal Testing**: Add internal testers (up to 100)
5. **External Testing**: Create test groups for external testers

### 9. **Add TestFlight Testers**

**Internal Testers** (App Store Connect users):
- Automatically added, no review needed
- Can test immediately after processing

**External Testers**:
- Add via email addresses
- Requires Apple review (24-48 hours)
- Up to 10,000 testers

### 🔧 **Troubleshooting Common Issues**

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
npm run ios -- --verbose
```

#### Bundle Identifier Conflicts:
- Ensure `org.mvneves.dnschat` is unique in App Store Connect
- Check it matches exactly in `app.json` and Xcode

### 📋 **Pre-Upload Checklist**

- ✅ **Apple Developer Account** active
- ✅ **App Store Connect** app record created
- ✅ **Code signing** configured correctly
- ✅ **Bundle ID** matches (`org.mvneves.dnschat`)
- ✅ **Version numbers** consistent (v1.7.2)
- ✅ **Native DNS module** compiles successfully
- ✅ **Universal landscape support** enabled
- ✅ **App Store screenshots** (2024 compliant):
  - iPhone 6.9" (1320×2868px): 8 screenshots
  - iPad 13" (2752×2064px): 8 screenshots  
  - macOS (2560×1600px): 8 screenshots
- ✅ **App icons** and metadata ready
- ✅ **Privacy Policy** URL (required for App Store)

### 🚀 **Quick Start Commands**

```bash
# Clean and prepare
cd ios && pod install --clean-install && cd ..

# Build in Xcode
open ios/ChatDNS.xcworkspace

# Or use EAS (recommended for Expo projects)
eas build --platform ios --profile production
```

### 📱 **TestFlight Distribution**

Once uploaded:
1. **Internal Testing**: Immediate access for team members
2. **External Testing**: Public beta testing after Apple review
3. **Feedback**: Collect user feedback through TestFlight
4. **Iterate**: Upload new builds for continuous testing

**Next Steps**: After TestFlight testing, you can submit for full App Store review and release!

## 🔗 **Useful Links**

- [App Store Connect](https://appstoreconnect.apple.com)
- [Apple Developer Portal](https://developer.apple.com)
- [TestFlight Documentation](https://developer.apple.com/testflight/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

## 📞 **Support**

If you encounter issues during the upload process:
1. Check the [Apple Developer Forums](https://developer.apple.com/forums/)
2. Review Expo documentation for native builds
3. Verify all native modules compile correctly with `npm run ios`
4. Ensure code signing certificates are valid and not expired

---

*TestFlight upload guide for DNSChat v1.7.2 - Last updated: 2025-08-15*