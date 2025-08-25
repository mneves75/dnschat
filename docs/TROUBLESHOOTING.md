# Troubleshooting Guide

Common issues and solutions for DNSChat v1.7.7 development and deployment.

## 🚨 Critical Issues

### iOS App Crashes (CheckedContinuation)

**Problem**: App crashes with `EXC_BREAKPOINT` during DNS operations.

**Symptoms**:
- App terminates instantly during DNS queries
- TestFlight crash reports showing `EXC_BREAKPOINT`
- Console error: "Attempting to resume continuation that has already been resumed"

**Solution**: ✅ Fixed in v1.7.7 with enterprise-grade NSLock protection.

**If creating similar code**:
```swift
// ❌ DANGEROUS - Race condition possible
continuation.resume(returning: result)

// ✅ SAFE - Atomic resume pattern
let resumeLock = NSLock()
var hasResumed = false

let resumeOnce: (Result<[String], Error>) -> Void = { result in
    resumeLock.lock()
    defer { resumeLock.unlock() }
    
    if !hasResumed {
        hasResumed = true
        continuation.resume(returning: result)
    }
}
```

### Native DNS Module Not Registering (iOS)

**Problem**: `RNDNSModule found: false`, platform detected as "web".

**Solution**:
```bash
# 1. Verify Podfile includes DNSNative
# Add to ios/Podfile if missing:
pod 'DNSNative', :path => './DNSNative'

# 2. Reinstall pods
cd ios && pod install && cd ..

# 3. Rebuild
npm run ios
```

**Verification**: Look for console log:
```
✅ RNDNSModule found: true
🔍 Native DNS capabilities: {"available": true, "platform": "ios"}
```

## 🔧 Build Issues

### iOS Build Errors

**Swift Compilation Errors**
```bash
# Add missing React import if needed
# In ios/DNSNative/DNSResolver.swift:
import React

# Clean and rebuild
rm -rf ios/build/
npm run ios
```

### “'ReactCommon/RuntimeExecutor.h' file not found” (iOS)

**Cause**: Header search paths can break when using static frameworks with RN 0.81.0.

**Fix**:
```bash
# Podfile includes a post_install that restores header maps and search paths
# 1) Reinstall pods and reset Xcode caches
npm run fix-pods

# 2) Clean build for simulator
npm run ios:clean-build
```

**CocoaPods Sandbox Sync Error / Xcode PIF Session Error**
```bash
# Automated fix (cleans Pods and resets Xcode caches/PIF session)
npm run fix-pods

# Manual fix
cd ios
rm -rf Pods/ Podfile.lock build/
pod cache clean --all
pod install
```

### “Could not compute dependency graph” or “unable to initiate PIF transfer session”

**Symptoms**:
- Xcode shows dependency graph errors
- Logs include: `unable to initiate PIF transfer session (operation in progress?)`

**Solution**:
```bash
npm run fix-pods
# Then open ios/DNSChat.xcworkspace and build for a simulator
```

**folly/dynamic.h Missing** (React Native 0.79.x)
- ✅ Fixed automatically in ios/Podfile post_install hook
- No action needed - fix is already applied

### Android Build Errors

**Java Version Incompatibility**
```bash
# Use Java 17 (required)
npm run android  # Automatically uses Java 17

# Verify Java version
/opt/homebrew/opt/openjdk@17/bin/java -version
```

**Gradle Build Failures**
```bash
# Clean Gradle cache
rm -rf ~/.gradle/caches
rm -rf android/.gradle
npm run android
```

**dnsjava Conflicts**
- ✅ Fixed with fully qualified class names in v1.7.6
- No action needed - fix is already applied

## 🌐 Network Issues

### DNS Connection Problems

**UDP Port 53 Blocked**
```bash
# App automatically falls back to TCP
# Manual test:
dig @ch.at "test message" TXT +short
```

**Solutions**:
- Switch between WiFi and cellular data
- Enable "Prefer DNS-over-HTTPS" in Settings
- Contact network administrator for port unblocking

**DNS Server Unreachable**
```bash
# Test connectivity
dig @ch.at "hello" TXT +short

# If no response:
# 1. Try different network
# 2. Check firewall settings
# 3. Use DNS-over-HTTPS fallback
```

### Corporate/Public WiFi Restrictions

**Problem**: DNS queries blocked by firewall.

**Solutions**:
1. **Enable DNS-over-HTTPS**: Settings → DNS Method → Prefer HTTPS
2. **Switch to cellular**: Bypass WiFi restrictions
3. **Contact IT**: Request ch.at domain whitelisting

## 📱 App-Specific Issues

### Missing App Icons

**About Screen Icon Missing**
```bash
# Clear Metro cache
npx expo start --clear

# Verify icon exists
ls -la assets/icon.png

# Check import path in About.tsx
```

### Navigation Errors

**"Screen not handled by navigator"**
```bash
# Use proper nested navigation
navigation.navigate('HomeTabs', { screen: 'Logs' })

# Not: navigation.navigate('Logs')
```

### React Native Warnings

**VirtualizedList in ScrollView**
- ✅ Fixed in v1.7.0+ with proper flex layouts
- No action needed - fix is already applied

## 🧰 Development Tools

### Clear Caches
```bash
# Metro bundler
npx expo start --clear

# iOS derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/

# Android gradle
./gradlew clean  # From android/ directory
```

### Version Management
```bash
# Sync all platform versions
npm run sync-versions

# Preview changes
npm run sync-versions:dry
```

### DNS Testing
```bash
# CLI test
node test-dns-simple.js "Hello world"

# Test specific methods
# Use app Settings → DNS Method preferences
```

## 🔍 Debugging

### Enable Debug Mode

**iOS**: Use Xcode console or device logs
**Android**: Use `adb logcat` or Android Studio logcat
**React Native**: Use Expo developer tools

### Common Debug Commands
```bash
# React Native logs
npx expo logs

# iOS device logs
xcrun devicectl list devices
xcrun devicectl device logs --device [DEVICE_ID]

# Android logs
adb logcat | grep DNSChat
```

### DNS Query Debugging

1. **Check Logs Tab**: Real-time DNS query monitoring
2. **Console Logs**: Look for DNS service debug output
3. **Network Tab**: Verify DNS-over-HTTPS requests
4. **Settings Test**: Use built-in connectivity test

## 🆘 Getting Help

### Before Reporting Issues

1. **Check this guide**: Look for your specific error
2. **Test on different networks**: WiFi vs cellular
3. **Try different DNS methods**: Settings → DNS Method
4. **Clear caches**: Metro, Xcode, Gradle
5. **Check versions**: Ensure all platforms use same version

### Reporting Issues

Include:
- **Platform**: iOS/Android/Web
- **Version**: App version and OS version
- **Network**: WiFi/cellular, corporate/public
- **Error logs**: Complete error messages
- **Steps to reproduce**: Detailed reproduction steps

**GitHub Issues**: [dnschat/issues](https://github.com/mneves75/dnschat/issues)

## 📚 Additional Resources

- **Installation**: [docs/INSTALL.md](./INSTALL.md)
- **API Reference**: [docs/API.md](./API.md)
- **Contributing**: [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Architecture**: [docs/architecture/SYSTEM-ARCHITECTURE.md](./architecture/SYSTEM-ARCHITECTURE.md)

---

*This guide covers DNSChat v1.7.7. For version-specific issues, check CHANGELOG.md.*
