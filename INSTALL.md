# DNSChat Installation Guide

## 📍 Documentation Moved

**The complete installation guide has moved to [docs/INSTALL.md](./docs/INSTALL.md)**

This new location provides:

- ✅ **Up-to-date instructions** for v1.7.7
- ✅ **Modern documentation structure**
- ✅ **Better organization and navigation**
- ✅ **Comprehensive troubleshooting links**

## 🚀 Quick Start

For immediate setup, see [docs/INSTALL.md](./docs/INSTALL.md).

**One-liner setup**:

```bash
git clone https://github.com/mneves75/dnschat.git && cd dnschat && npm install && cd ios && pod install && cd .. && npm start
```

## 📚 Complete Documentation

- **[Installation Guide](./docs/INSTALL.md)** - Detailed setup instructions
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[API Reference](./docs/API.md)** - DNS service documentation
- **[Contributing](./CONTRIBUTING.md)** - Development guidelines

---

_This file remains for compatibility. Please use [docs/INSTALL.md](./docs/INSTALL.md) for current instructions._

## Inspiration and Acknowledgements

- See [Arxiv Daily's tweet](https://x.com/Arxiv_Daily/status/1952452878716805172) describing DNS-based LLM access via `dig`.
- See [ch.at – Universal Basic Intelligence](https://github.com/Deep-ai-inc/ch.at) for an open-source implementation exposing chat over DNS (`dig @ch.at "..." TXT`).

## 🔧 Prerequisites

### Required Software

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or yarn)
- **Expo CLI**: Latest version (`npm install -g @expo/cli`)
- **Git**: For cloning the repository

### Platform-Specific Requirements

#### 📱 iOS Development

- **macOS**: Required for iOS development
- **Xcode**: v15.0 or higher
- **iOS Simulator**: v17.0+ or physical device
- **CocoaPods**: v1.11.0+ (`sudo gem install cocoapods`)
- **Command Line Tools**: `xcode-select --install`

#### 🤖 Android Development

- **Android Studio**: Latest version with SDK tools
- **Java Development Kit**: OpenJDK 17 (see [Java Setup](#java-setup))
- **Android SDK**: API Level 34+
- **Android Emulator** or physical device

#### 🌐 Web Development

- **Modern Browser**: Chrome, Firefox, Safari, Edge
- **No additional requirements** (uses fallback service)

---

## 🚀 Quick Start Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mneves75/dnschat.git
cd dnschat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Platform-Specific Setup

#### iOS Setup (macOS only)

```bash
# Install iOS native dependencies
cd ios && pod install && cd ..

# Verify CocoaPods lockfile matches installed Expo packages (recommended)
npm run verify:ios-pods

# Verify native DNS module (RN env)
node test-dns-simple.js "Hello world"
```

#### Android Setup

```bash
# Set up Java 17 environment (if needed)
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=/opt/homebrew/opt/openjdk@17/bin:$PATH

# Or use the provided script
chmod +x android-java17.sh
```

### 4. Start Development

```bash
# Start the development server
npm start

# Run on specific platforms
npm run ios              # iOS simulator
npm run android          # Android emulator
npm run android:java17   # Android with Java 17
npm run web              # Web browser
```

---

## 📋 Detailed Platform Instructions

### 📱 iOS Installation (Complete)

#### Step 1: System Requirements

```bash
# Verify Xcode installation
xcode-select -p

# Install Command Line Tools (if needed)
sudo xcode-select --install

# Check CocoaPods
pod --version
```

#### Step 2: Native Dependencies

```bash
# Navigate to project directory
cd /path/to/chat-dns

# Install Node dependencies
npm install

# Install iOS native dependencies
cd ios
pod install
cd ..
```

#### Step 3: Build Configuration

```bash
# Clean previous builds (if needed)
npm run clean

# Start development server
npm start

# In another terminal, build for iOS
npm run ios
```

#### Step 4: Verify Native DNS

- Open iOS Simulator
- Launch the app
- Send a message: "Hi there!"
- Check console logs for:
  ```
  ✅ Native DNS reports as available!
  ✅ Native DNS supports custom server queries!
  🌐 Querying llm.pieter.com with message: "Hi there!"
  📥 Raw TXT records received: ["Hello! How can I assist you today?"]
  ```

#### Troubleshooting iOS

```bash
# If pod install fails
cd ios
pod deintegrate
pod cache clean --all
pod install
cd ..

# If build fails
rm -rf node_modules package-lock.json
npm install
cd ios && pod install && cd ..
```

### 🤖 Android Installation (Complete)

#### Step 1: Java Setup {#java-setup}

**Option A: Using Homebrew (macOS)**

```bash
# Install OpenJDK 17
brew install openjdk@17

# Set environment variables
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=/opt/homebrew/opt/openjdk@17/bin:$PATH

# Add to ~/.zshrc or ~/.bash_profile for persistence
echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home' >> ~/.zshrc
echo 'export PATH=/opt/homebrew/opt/openjdk@17/bin:$PATH' >> ~/.zshrc
```

**Option B: Using Our Script**

```bash
# Make script executable
chmod +x android-java17.sh

# Use Java 17 for builds
npm run android:java17
```

**Option C: Manual Download**

1. Download OpenJDK 17 from [Adoptium](https://adoptium.net/)
2. Install and set JAVA_HOME to installation directory
3. Add to PATH environment variable

#### Step 2: Android Studio Setup

1. Install [Android Studio](https://developer.android.com/studio)
2. Open Android Studio
3. Go to **Tools > SDK Manager**
4. Install **Android 34 (API Level 34)**
5. Install **Android SDK Build-Tools 34.0.0**
6. Create or start an Android Virtual Device (AVD)

#### Step 3: Build and Run

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build and run (in another terminal)
npm run android
# OR with Java 17
npm run android:java17
```

#### Step 4: Verify Native DNS

- Open Android Emulator
- Launch the app
- Send a message
- Check logs for native DNS functionality

#### Troubleshooting Android

```bash
# Clean builds
cd android
./gradlew clean
cd ..

# Reset Metro cache
npx expo start -c

# If Java version errors
java -version  # Should show version 17
```

### 🌐 Web Installation (Fallback)

Web installation is the simplest as it uses fallback services:

```bash
# Install and start
npm install
npm run web

# App will open in browser at http://localhost:19006
```

**Note**: Web version uses mock DNS service due to browser UDP limitations.

---

## 🔍 Testing & Verification

### DNS Connectivity Test

Use the included CLI tool to test DNS connectivity:

```bash
# Test basic connectivity
node test-dns.js "Hello world"

# Test with custom message
node test-dns.js "What is the meaning of life?"

# Expected output:
# ✅ DNS query successful
# 📥 Response: Hello! How can I assist you today?
```

### Native Module Verification

#### iOS Native Module Check

```bash
# Build and check logs
npm run ios

# Look for in console:
# ✅ RNDNSModule found: true
# ✅ Native DNS reports as available!
```

#### Android Native Module Check

```bash
# Build and check logs
npm run android

# Look for in console:
# Native DNS module detected
# DNS queries using native implementation
```

### App Functionality Test

1. **Launch App**: Start on your target platform
2. **Create Chat**: Tap the "+" button
3. **Send Message**: Type "Hi" and send
4. **Verify Response**: Should receive AI response within 10 seconds
5. **Check Logs**: Console should show native DNS activity

---

## 🛠️ Development Environment

### Project Structure

```
chat-dns/
├── src/                    # React Native source code
├── ios/                    # iOS native code and configuration
├── android/                # Android native code and configuration
├── modules/dns-native/     # Native DNS module interface
├── assets/                 # App assets (icons, images)
└── docs/                   # Documentation
```

### Key Commands

```bash
# Development
npm start                   # Start Expo dev server
npm run ios                # Build and run iOS
npm run android            # Build and run Android
npm run web                # Start web version

# Testing
node test-dns.js "query"   # Test DNS connectivity
npm run clean              # Clean builds and cache

# Utilities
cd ios && pod install      # Update iOS dependencies
npx expo install           # Update Expo dependencies
```

### Environment Variables

Create `.env` file for custom configuration:

```bash
# Optional: Custom DNS server
#DNS_SERVER=llm.pieter.com
DNS_SERVER=ch.at
DNS_PORT=53

# Optional: Enable debug logging
DEBUG_DNS=true
```

---

## 📞 Support & Troubleshooting

### Common Issues

#### "Native DNS not available"

- **iOS**: Run `cd ios && pod install && cd ..`
- **Android**: Check Java version with `java -version`
- **Solution**: Rebuild with native dependencies

#### "UDP port blocked" / Network errors

- App automatically falls back to DNS-over-TCP and HTTPS
- Normal behavior on corporate/public Wi-Fi
- No action needed - fallback is transparent

#### Build failures

```bash
# Universal reset
rm -rf node_modules package-lock.json
npm install

# iOS reset
cd ios
pod deintegrate && pod install
cd ..

# Android reset
cd android && ./gradlew clean && cd ..
npx expo start -c
```

#### "Command not found: expo"

```bash
# Install Expo CLI globally
npm install -g @expo/cli
```

### Getting Help

1. **Check Console Logs**: Look for detailed error messages
2. **Verify Prerequisites**: Ensure all requirements are installed
3. **Test DNS**: Use `node test-dns.js` to isolate issues
4. **GitHub Issues**: Report bugs at [GitHub Repository](https://github.com/mneves75/dnschat/issues)

---

## 🎯 Deployment & Distribution

### Development Builds

```bash
# Create development build
eas build --platform ios --profile development
eas build --platform android --profile development
```

### Production Builds

```bash
# Create production build
eas build --platform ios --profile production
eas build --platform android --profile production
```

### App Store Distribution

1. Configure app signing in `eas.json`
2. Update app icons and splash screens
3. Build production version
4. Submit to App Store / Google Play

---

## 📄 License & Credits

- **License**: MIT License
- **Original Concept**: [@levelsio](https://twitter.com/levelsio)
- **Implementation**: Chat DNS Team
- **DNS Service**: llm.pieter.com

---

## 🎉 Success!

If you can send a message and receive an AI response, congratulations! You now have a fully functional React Native app that communicates with an LLM via DNS queries.

**Next Steps**:

- Explore the chat interface
- Try different types of questions
- Check out the native DNS logs
- Customize the app for your needs

For advanced configuration and development, see [CLAUDE.md](./CLAUDE.md) for detailed technical documentation.

---

_Installation guide for DNSChat v1.6.1 - Production Ready Native DNS Implementation_
