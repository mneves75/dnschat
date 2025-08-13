# Common Issues & Solutions - DNSChat

**Comprehensive troubleshooting guide for DNSChat development and deployment**

## Quick Issue Lookup

| Issue | Category | Solution Link |
|-------|----------|---------------|
| "expo: command not found" | Setup | [Environment Setup](#environment-setup-issues) |
| Java version errors | Build | [Java/Android Issues](#javaandroid-build-issues) |
| "Native DNS not available" | DNS | [Native Module Issues](#native-module-issues) |
| VirtualizedList warnings | React Native | [React Native Issues](#react-native-issues) |
| DNS queries failing | Network | [DNS Communication](#dns-communication-issues) |
| Build failures | Build | [Build Problems](#build-issues) |

---

## Environment Setup Issues

### "expo: command not found"

**Symptoms:**
```bash
npm run ios
> expo run:ios
sh: expo: command not found
```

**Root Cause:** Expo CLI not installed or not in PATH

**Solutions:**
```bash
# Option 1: Install globally
npm install -g @expo/cli

# Option 2: Use npx (temporary)
npx expo run:ios

# Option 3: Check PATH
echo $PATH  # Verify npm global bin is in PATH
npm config get prefix  # Check npm global directory
```

**Prevention:** Add npm global bin directory to shell profile (`.zshrc`, `.bash_profile`)

### Node.js Version Compatibility

**Symptoms:**
- Weird compilation errors
- Package installation failures
- Runtime crashes

**Requirements:** Node.js 18.0.0 or higher

**Solutions:**
```bash
# Check current version
node -v

# Install/upgrade Node.js
# Option 1: Using nvm (recommended)
nvm install 18
nvm use 18

# Option 2: Direct download
# Download from https://nodejs.org/
```

---

## Java/Android Build Issues

### "Unsupported class file major version 68"

**Symptoms:**
```
FAILURE: Build failed with an exception.
* What went wrong:
Could not create task ':react-native-reanimated:outgoingVariants'.
> Unsupported class file major version 68
```

**Root Cause:** Using Java 24 (major version 68) when Android build system requires Java 17

**Solutions:**
```bash
# Check current Java version
java -version

# Install Java 17 (macOS with Homebrew)
brew install openjdk@17

# Set environment variables (add to ~/.zshrc)
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=/opt/homebrew/opt/openjdk@17/bin:$PATH

# Reload shell
source ~/.zshrc

# Use our automated script
npm run android  # Automatically uses Java 17
```

**Alternative Solution:**
```bash
# Temporary Java 17 for single build
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
npm run android
```

### Android SDK Not Found

**Symptoms:**
```
ANDROID_SDK_ROOT is not set and "android" command not in your PATH
```

**Solutions:**
```bash
# Install Android Studio first
# Then set environment variables
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Verify installation
android --version
adb --version
```

### Gradle Build Failures

**Symptoms:**
- Task execution failures
- Dependency resolution errors
- "Could not create task" errors

**Solutions:**
```bash
# Clean Gradle cache
cd android
./gradlew clean
cd ..

# Nuclear option - clean all Gradle caches
rm -rf ~/.gradle/caches
rm -rf android/.gradle
rm -rf android/build

# Rebuild
npm run android
```

---

## Native Module Issues

### "Native DNS not available" Message

**Symptoms:**
Console shows: "Native DNS not available, falling back to legacy methods"

**Diagnostic Steps:**
```bash
# 1. Check if native modules are compiled
npm run ios    # Look for compilation success
npm run android

# 2. Check console logs for errors
# Look for: "✅ RNDNSModule found: true"
# Or: "❌ RNDNSModule not found"

# 3. Verify native module files exist
ls -la ios/DNSNative/
ls -la modules/dns-native/android/
```

**Solutions by Platform:**

#### iOS Native Module Issues
```bash
# 1. Check CocoaPods installation
pod --version

# 2. Reinstall pods
cd ios
pod deintegrate
pod cache clean --all
pod install
cd ..

# 3. Verify podspec
cat ios/DNSNative/DNSNative.podspec

# 4. Check Xcode project
# Open ios/ChatDNS.xcworkspace (NOT .xcodeproj)
# Verify DNSNative appears in Pods section
```

#### Android Native Module Issues
```bash
# 1. Verify Java 17
java -version  # Should show Java 17

# 2. Check package registration
grep -n "NativeDnsPackage" android/app/src/main/java/com/satya164/reactnavigationtemplate/MainApplication.kt

# 3. Verify module files
ls -la modules/dns-native/android/

# 4. Clean and rebuild
cd android && ./gradlew clean && cd ..
npm run android
```

### Native Module Compilation Errors

**iOS Compilation Errors:**
```bash
# Common errors and solutions

# Error: "Module 'DNSNative' not found"
# Solution: Check podspec and pod install

# Error: Swift compilation failed
# Solution: Check Swift version compatibility
swift --version  # Should be 5.0+

# Error: Bridging header not found
# Solution: Verify RNDNSModule.m exists and is included
```

**Android Compilation Errors:**
```bash
# Error: "package com.dnschat does not exist"
# Solution: Verify package structure matches
ls -la android/app/src/main/java/com/dnschat/

# Error: Kotlin compilation failed
# Solution: Check Kotlin version in build.gradle
grep kotlin android/build.gradle
```

---

## DNS Communication Issues

### DNS Queries Failing

**Symptoms:**
- Messages don't get responses
- "DNS query failed" errors  
- Timeout errors
- "UDP port 53 blocked" errors
- "TCP connection refused" errors

**🆕 v1.7.2: Enhanced Error Diagnostics & Guidance**

The app now provides comprehensive error messages with actionable troubleshooting steps. When DNS queries fail, you'll see detailed guidance including:

- **Network switching recommendations** (WiFi ↔ Cellular)
- **Port blocking detection** with administrator contact advice
- **5-step troubleshooting guide** for connectivity issues
- **Platform-specific guidance** for iOS/Android restrictions

**Diagnostic Steps:**
```bash
# 1. Test basic connectivity with CLI tool
dig @ch.at "Hello world" TXT +short

# Expected output:
# "Hello! How can I assist you today?"

# 2. Check network restrictions
# Test from different networks (home WiFi, cellular, public WiFi)

# 3. Check app DNS logs
# Go to Settings → View Logs for detailed failure information
```

**Common Causes & Solutions:**

#### 🔧 UDP Port 53 Blocked (Enhanced in v1.7.2)
**Symptoms:** 
- "UDP port 53 blocked by network/iOS - automatic fallback to TCP"
- "ERR_SOCKET_BAD_PORT" errors
- iOS may show "Bad port" errors on cellular/corporate networks

**Cause:** Network blocking UDP port 53 (common on corporate/public WiFi, iOS restrictions)

**🆕 Enhanced Solutions:**
1. **Automatic Fallback**: App now automatically switches to TCP then HTTPS
2. **Network Switching**: Try switching between WiFi and cellular data
3. **Corporate Networks**: Contact network administrator to unblock DNS port 53
4. **iOS Restrictions**: Some iOS versions/carriers block direct DNS - TCP fallback handles this

#### 🔧 TCP Connection Issues (Enhanced in v1.7.2)
**Symptoms:**
- "TCP connection refused - DNS server may be blocking TCP port 53"
- "Connection refused" or "ECONNREFUSED" errors
- "TCP connection timeout - network may be blocking TCP DNS"

**🆕 Enhanced Solutions:**
1. **HTTPS Fallback**: App automatically tries DNS-over-HTTPS as final fallback
2. **Network Diagnosis**: Error messages now indicate specific connection issues
3. **Admin Guidance**: Clear instructions on contacting network administrators
4. **Alternative Networks**: Switch to mobile data or different WiFi network

#### DNS Server Unreachable
**Symptoms:** "DNS_SERVER_UNREACHABLE" errors
**Solutions:**
```bash
# 1. Test server reachability
ping ch.at
dig ch.at

# 2. Try alternative DNS servers
# Go to Settings → Change DNS TXT Service
# Try: llm.pieter.com, 8.8.8.8, 1.1.1.1
```

#### Response Parsing Errors
**Symptoms:** Partial responses or garbled text
**Debug Steps:**
```bash
# Enable verbose logging in dnsService.ts
# Look for raw DNS responses in console:
# 📥 Raw TXT records received: ["1/3:Hello", "2/3: world", "3/3:!"]
```

### Native DNS vs Fallback Issues

**Understanding the Fallback Chain:**
1. **Native DNS** (iOS Network Framework, Android DnsResolver) - Fastest
2. **UDP Sockets** (JavaScript) - Good compatibility
3. **DNS-over-TCP** (JavaScript) - Bypasses UDP blocks
4. **DNS-over-HTTPS** (Cloudflare API) - Universal compatibility
5. **Mock Service** (Development) - Always works

**Debugging Fallback Issues:**
```typescript
// Check which method succeeded
// Look for console logs like:
// "🔍 Attempting native DNS query"
// "⚠️ Native DNS failed, trying UDP"
// "⚠️ UDP failed, trying DNS-over-HTTPS"
// "✅ DNS-over-HTTPS query successful"
```

---

## React Native Issues

### VirtualizedList Warnings

**Symptoms:**
```
Warning: VirtualizedLists should never be nested inside plain ScrollViews 
with the same orientation
```

**Status:** Fixed in v1.5.1

**Background:**
- **Problem:** KeyboardAwareScrollView wrapping FlatList created nested virtual lists
- **Impact:** Performance warnings and potential crashes
- **Solution:** Replaced with native KeyboardAvoidingView

**If you see this warning:**
```bash
# Check your version
grep version package.json

# Should be 1.5.1 or higher
# If not, update to latest
git pull origin main
npm install
```

### Navigation Issues

**Deep Linking Not Working:**
```bash
# Test URL scheme
npx uri-scheme open dnschat://message=test

# Check scheme configuration
grep scheme app.json

# Verify iOS URL types
cat ios/ChatDNS/Info.plist | grep -A5 CFBundleURLTypes

# Verify Android intent filters
cat android/app/src/main/AndroidManifest.xml | grep -A10 intent-filter
```

**Navigation State Issues:**
- Clear AsyncStorage: Delete app from device/simulator
- Reset navigation state: Restart Metro bundler
- Check navigation structure: Verify screen names match

### Performance Issues

**Slow Message List:**
```typescript
// Check FlatList optimization
// In MessageList.tsx, verify:
getItemLayout={(data, index) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
})}
removeClippedSubviews={true}
```

**Memory Leaks:**
```bash
# Monitor memory usage
# iOS: Xcode Instruments
# Android: Android Studio Memory Profiler

# Common causes:
# - Missing cleanup in useEffect
# - Uncanceled DNS queries
# - Large message history
```

---

## Build Issues

### Metro Bundler Issues

**Cache Problems:**
```bash
# Clear Metro cache
npx expo start -c

# Clear all React Native caches
npx react-native start --reset-cache

# Nuclear option
rm -rf node_modules package-lock.json .expo
npm install
```

**Port Conflicts:**
```bash
# Change Metro port
npx expo start --port 8082

# Kill processes using port 8081
lsof -ti:8081 | xargs kill -9
```

### iOS Build Issues

**Xcode Errors:**
```bash
# "Build input file cannot be found"
# Solution: Clean build folder in Xcode
# Product → Clean Build Folder

# "No such module 'DNSNative'"
# Solution: Pod installation issue
cd ios && pod install && cd ..

# "Command PhaseScriptExecution failed"
# Solution: Check build scripts and permissions
```

**Code Signing Issues:**
```bash
# Development builds don't require paid account
# Use automatic code signing in Xcode
# Or configure EAS Build for cloud building
```

### Android Build Issues

**Gradle Errors:**
```bash
# "Execution failed for task ':app:checkDebugAarMetadata'"
# Solution: Java version issue (use Java 17)

# "Could not resolve all files for configuration"
# Solution: Clean Gradle cache
cd android && ./gradlew clean && cd ..

# "INSTALL_FAILED_INSUFFICIENT_STORAGE"
# Solution: Clear device storage or use different AVD
```

---

## Network & Connectivity Issues

### Corporate/Restricted Networks

**Common Restrictions:**
- UDP port 53 blocked (DNS)
- Port 443 restrictions (HTTPS)
- DNS server restrictions
- Proxy requirements

**Solutions:**
```bash
# 1. Use mobile hotspot for testing
# 2. Configure proxy in React Native
# 3. Use DNS-over-HTTPS fallback
# 4. Test with different DNS servers
```

### IPv6 vs IPv4 Issues

**Symptoms:** DNS works on some networks but not others

**Solutions:**
```bash
# Test IPv6 connectivity
ping6 ch.at

# Configure DNS server preferences
# Some servers may only support IPv4 or IPv6
```

---

## Storage & Data Issues

### AsyncStorage Corruption

**Symptoms:**
- App crashes on startup
- Chat history lost
- Settings reset

**Solutions:**
```typescript
// Emergency storage reset
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();

// Check storage contents
const chats = await AsyncStorage.getItem('@chat_dns_chats');
console.log('Storage data:', chats);
```

### Data Migration Issues

**After App Updates:**
```typescript
// Check data format compatibility
// Old data structure may be incompatible
// Implement migration logic in StorageService
```

---

## Testing & Debugging Issues

### Test Environment Setup

**DNS Testing:**
```bash
# CLI test not working
node test-dns.js "test"

# Common issues:
# - Node.js version compatibility
# - Network restrictions
# - DNS server down
```

**Device Testing:**
```bash
# iOS Simulator not connecting
# Reset simulator: Device → Erase All Content and Settings

# Android Emulator issues
# Wipe data in AVD Manager
# Or create new AVD
```

---

## Emergency Procedures

### Complete Reset (Last Resort)

When everything is broken:

```bash
# 1. Backup your work
git stash  # Save uncommitted changes
git log --oneline -5  # Note recent commits

# 2. Nuclear clean
rm -rf node_modules package-lock.json
rm -rf ios/Pods ios/Podfile.lock
rm -rf android/.gradle android/build
rm -rf .expo

# 3. Clean system caches
npm cache clean --force
cd ios && pod cache clean --all && cd ..

# 4. Reinstall everything
npm install
cd ios && pod install && cd ..

# 5. Clear Metro cache and restart
npx expo start -c
```

### Rollback to Working Version

```bash
# Find last working commit
git log --oneline

# Rollback (replace COMMIT_HASH)
git reset --hard COMMIT_HASH

# Or create new branch from working version
git checkout -b fix-branch COMMIT_HASH
```

---

## Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Try the nuclear reset procedure**
3. **Test on a different network**
4. **Check recent git changes**: `git log --oneline -10`

### Information to Provide

When asking for help, include:

```bash
# Environment info
node -v
npm -v
java -version
expo --version

# Platform info
uname -a  # OS version
xcode-select -p  # Xcode path (macOS)

# Project info
grep version package.json
git log --oneline -5

# Error logs
# Copy exact error messages
# Include console logs
# Include stack traces
```

### Escalation Path

1. **Self-service**: Use this guide and FAQ
2. **Team chat**: Quick questions for team members
3. **Code review**: Create PR with attempted fix
4. **Senior developer**: Complex architecture questions
5. **External**: GitHub issues for bugs, Stack Overflow for general RN questions

---

**Last Updated:** v1.7.2 - Enhanced DNS Transport Robustness & Error Handling  
**Maintainers:** DNSChat Development Team

*This guide is continuously updated. Check git history for recent additions.*