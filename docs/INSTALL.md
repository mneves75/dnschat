# Installation Guide

Complete setup instructions for DNSChat v1.7.7 - React Native app with native DNS implementation.

## 🎯 Prerequisites

### System Requirements
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)

### Platform-Specific Requirements

#### iOS Development
- **macOS** (required for iOS development)
- **Xcode 15+** - [Download from App Store](https://apps.apple.com/us/app/xcode/id497799835)
- **iOS 16+** device or simulator
- **CocoaPods** - `sudo gem install cocoapods`

#### Android Development  
- **Java 17** (required) - `brew install openjdk@17`
- **Android Studio** - [Download](https://developer.android.com/studio)
- **Android SDK API 21+**
- **Android device or emulator**

## 🚀 Quick Installation

### 1. Clone and Setup

```bash
# Clone repository
git clone https://github.com/mneves75/dnschat.git
cd dnschat

# Install dependencies
npm install

# iOS setup (macOS only)
cd ios && pod install && cd ..
```

### 2. Run the App

```bash
# Development server
npm start

# iOS (requires Xcode)
npm run ios

# Android (requires Java 17)
npm run android

# Web
npm run web
```

## 🔧 Platform-Specific Setup

### iOS Setup

1. **Install Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

2. **Install CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

3. **Setup iOS Dependencies**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Open in Xcode (optional)**
   ```bash
   open ios/DNSChat.xcworkspace
   ```

### Android Setup

1. **Install Java 17** (Critical - other versions cause build failures)
   ```bash
   # macOS
   brew install openjdk@17
   
   # Verify installation
   /opt/homebrew/opt/openjdk@17/bin/java -version
   ```

2. **Setup Android Studio**
   - Download and install Android Studio
   - Install Android SDK API 21-34
   - Create AVD (Android Virtual Device) or connect physical device

3. **Environment Variables** (if needed)
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## 🧪 Testing Your Installation

### Basic Functionality Test
```bash
# Test DNS connectivity
node test-dns.js "Hello world"
```

### Platform Tests
```bash
# Test iOS build
npm run ios

# Test Android build (Java 17 required)
npm run android

# Test web version
npm run web
```

## 🐛 Common Installation Issues

### iOS Issues

**CocoaPods Sandbox Sync Error**
```bash
# Quick fix
npm run fix-pods

# Manual fix
cd ios && rm -rf Pods/ Podfile.lock && pod install
```

**Swift Compilation Errors**
```bash
# Clean build
rm -rf ios/build/
npm run ios
```

### Android Issues

**Java Version Errors**
```bash
# Ensure Java 17 is being used
npm run android  # Uses Java 17 automatically
```

**Gradle Build Failures**
```bash
# Clean Gradle cache
rm -rf ~/.gradle/caches
rm -rf android/.gradle
npm run android
```

### DNS Connection Issues

**Test DNS Connectivity**
```bash
# Terminal test
dig @ch.at "test message" TXT +short

# In-app test
# Open app → Settings → Test DNS connection
```

## 🔄 Development Workflow

### Version Management
```bash
# Sync all platform versions
npm run sync-versions

# Preview version changes
npm run sync-versions:dry
```

### Clean Builds
```bash
# Clear Metro cache
npx expo start --clear

# Clean iOS
npm run clean-ios

# Clean Android
./gradlew clean  # From android directory
```

## 📱 Device Setup

### iOS Device
1. Connect iPhone/iPad via USB
2. Trust the computer when prompted
3. Enable Developer Mode in Settings → Privacy & Security
4. Run `npm run ios` and select your device

### Android Device
1. Enable Developer Options (tap Build Number 7 times)
2. Enable USB Debugging
3. Connect via USB and accept debugging permissions
4. Run `npm run android`

## 🚀 Next Steps

- **Development**: See [docs/API.md](./API.md) for DNS service documentation
- **Troubleshooting**: See [docs/TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed issue resolution
- **Contributing**: See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines

## 🆘 Getting Help

- **Issues**: [GitHub Issues](https://github.com/mneves75/dnschat/issues)
- **Documentation**: [docs/](./README.md)
- **Contact**: [@mneves75](https://x.com/mneves75)

---

*This guide is for DNSChat v1.7.7. For older versions, check the git history.*