# Technical FAQ - DNSChat

**Complete troubleshooting guide for junior developers working on DNSChat**

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Environment Setup Issues](#environment-setup-issues)
3. [Build & Compilation Problems](#build--compilation-problems)
4. [DNS Communication Issues](#dns-communication-issues)
5. [React Native Specific Issues](#react-native-specific-issues)
6. [Native Module Problems](#native-module-problems)
7. [Testing & Debugging](#testing--debugging)
8. [Development Workflow](#development-workflow)
9. [Common Error Messages](#common-error-messages)
10. [Performance & Optimization](#performance--optimization)

---

## Quick Reference

### Essential Commands

```bash
# Start development
npm start                    # Start Expo dev server
npm run ios                 # Build and run iOS
npm run android             # Build and run Android (Java 17)
npm run web                 # Run web version

# Testing
node test-dns-simple.js "message"  # Test DNS connectivity
npm test                    # Run unit tests

# Cleanup
npm run clean              # Clean builds and cache
rm -rf node_modules && npm install  # Nuclear option

# iOS specific
cd ios && pod install && cd ..      # Update iOS dependencies
cd ios && pod deintegrate && cd ..  # Reset iOS pods
```

### File Structure Quick Guide

```
/src/                   # React Native source code
/ios/                   # iOS native code (auto-generated)
/android/               # Android native code (auto-generated)
/modules/dns-native/    # Native DNS module interface
/docs/                  # Documentation (this folder)
/src/services/          # Business logic (DNS, Storage)
/src/components/        # Reusable UI components
/src/navigation/        # App navigation structure
```

---

## Environment Setup Issues

### Q: "expo: command not found" when running npm scripts

**A:** Expo CLI is not installed or not in PATH.

**Solutions:**

1. Install globally: `npm install -g @expo/cli`
2. Use npx instead: `npx expo start`
3. Update PATH if installed in non-standard location

### Q: Java version errors on Android builds

**A:** DNSChat requires Java 17 for Android builds.

**Solutions:**

```bash
# Install Java 17 (macOS)
brew install openjdk@17

# Set environment (add to ~/.zshrc)
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=/opt/homebrew/opt/openjdk@17/bin:$PATH

# Use our automated script
npm run android:java17  # Uses Java 17 automatically
```

### Q: Android SDK/Tools not found

**A:** Android development environment not properly configured.

**Solutions:**

1. Install Android Studio
2. Install Android SDK API Level 34+
3. Set ANDROID_HOME environment variable
4. Add SDK tools to PATH

---

## Build & Compilation Problems

### Q: "Unsupported class file major version 68"

**A:** Using Java 24+ with Android build system that expects Java 17.

**Solutions:**

```bash
# Check current Java version
java -version

# Switch to Java 17
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home

# Or use our script
npm run android  # Automatically uses Java 17
```

### Q: iOS build fails with pod errors

**A:** CocoaPods dependencies out of sync or corrupted.

**Solutions:**

```bash
# Standard fix
cd ios && pod install && cd ..

# Nuclear option
cd ios
pod deintegrate
pod cache clean --all
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Q: Metro cache issues / stale builds

**A:** React Native Metro bundler cache corruption.

**Solutions:**

```bash
# Clear Metro cache
npx expo start -c

# Clear all caches
npm run clean

# Nuclear option
rm -rf node_modules package-lock.json
npm install
```

---

## DNS Communication Issues

### Q: "Native DNS not available" message

**A:** Native DNS modules not properly compiled or registered.

**Check List:**

1. iOS: Run `cd ios && pod install && cd ..`
2. Android: Ensure Java 17 is active
3. Rebuild: `npm run ios` or `npm run android`
4. Verify: Check console for "✅ Native DNS reports as available!"

### Q: DNS queries failing with network errors

**A:** Multiple potential causes - DNS service, network restrictions, or implementation issues.

**Debugging Steps:**

```bash
# 1. Test CLI connectivity first
node test-dns-simple.js "Hello world"

# 2. Check network restrictions
# UDP port 53 may be blocked on corporate/public WiFi
# App should automatically fallback to DNS-over-TCP then HTTPS

# 3. Check console logs for specific error patterns
# - "ERR_SOCKET_BAD_PORT" → UDP blocked, fallback active
# - "DNS_SERVER_UNREACHABLE" → Server down or network issue
# - "TIMEOUT" → Network latency or server overload
```

### Q: DNS responses are incomplete or malformed

**A:** Multi-part response parsing issue or server-side problem.

**Debugging:**

1. Check raw DNS response format: Should be "1/3:", "2/3:", etc.
2. Verify response concatenation logic in `dnsService.ts`
3. Test with different message lengths
4. Check server compatibility with `dig @ch.at "message" TXT +short`

---

## React Native Specific Issues

### Q: "VirtualizedLists should never be nested" warning

**A:** This was a critical bug fixed in v1.5.1 - ensure you're on latest version.

**Background:**

- **Problem:** KeyboardAwareScrollView wrapping FlatList created nested virtual lists
- **Solution:** Replaced with native KeyboardAvoidingView
- **Fix:** Update to v1.5.1+ or manually apply the KeyboardAvoidingView pattern

### Q: Navigation/Deep linking not working

**A:** URL scheme configuration or React Navigation setup issue.

**Check:**

1. Scheme in `app.json`: `"scheme": "dnschat"`
2. iOS Info.plist: URL types configured
3. Android AndroidManifest.xml: Intent filters configured
4. Test: `npx uri-scheme open dnschat://message=test`

### Q: AsyncStorage data corruption or loss

**A:** Storage service error handling or JSON serialization issue.

**Solutions:**

```typescript
// Emergency storage reset
await AsyncStorage.clear();

// Check storage contents
const data = await AsyncStorage.getItem("@chat_dns_chats");
console.log("Storage data:", data);
```

---

## Native Module Problems

### Q: iOS native module not registering

**A:** CocoaPods not linking native module or bridging issue.

**Solutions:**

```bash
# 1. Verify podspec
cat ios/DNSNative/DNSNative.podspec

# 2. Clean and reinstall
cd ios
pod deintegrate
pod cache clean --all
pod install
cd ..

# 3. Check Xcode project
# Open ios/ChatDNS.xcworkspace (NOT .xcodeproj)
# Verify DNSNative appears in Pods

# 4. Check bridging
# Verify RNDNSModule.m exists and exports are correct
```

### Q: Android native module compilation errors

**A:** Java/Kotlin compilation issue or package registration problem.

**Check:**

1. Package name matches: `com.dnschat`
2. Module registered in `MainApplication.kt`
3. Java 17 active: `java -version`
4. Gradle sync: `cd android && ./gradlew clean && cd ..`

---

## Testing & Debugging

### Q: How to debug DNS communication?

**A:** Use multiple debugging approaches:

**1. CLI Testing (Fastest)**

```bash
node test-dns-simple.js "test message"
```

**2. Console Logging**

```javascript
// In dnsService.ts - look for these patterns
console.log("🔍 Native DNS capabilities:", capabilities);
console.log("🌐 Querying server with message:", message);
console.log("📥 Raw TXT records received:", records);
console.log("❌ DNS query failed:", error);
```

**3. Network Analysis**

```bash
# macOS - Monitor network traffic
sudo tcpdump -i any port 53

# Or use Wireshark to capture DNS packets
```

### Q: How to test native modules specifically?

**A:** Test native modules in isolation:

```typescript
// Test in React Native app
import { NativeModules } from "react-native";

// Check availability
const isAvailable = await NativeModules.NativeDns?.isAvailable();
console.log("Native DNS available:", isAvailable);

// Test query
try {
  const result = await NativeModules.NativeDns?.queryTXT(
    "ch.at",
    "Hello world",
  );
  console.log("Native query result:", result);
} catch (error) {
  console.error("Native query error:", error);
}
```

---

## Development Workflow

### Q: What's the recommended development workflow?

**A:** Follow this pattern for efficient development:

**1. Environment Verification**

```bash
# Verify all tools are working
node -v    # Should be 18+
java -version  # Should show Java 17 when using npm run android
npx expo --version

# Test DNS connectivity
node test-dns-simple.js "connectivity test"
```

**2. Development Loop**

```bash
# Start development server (keep running)
npm start

# In separate terminals:
npm run ios      # For iOS development
npm run android  # For Android development

# For quick testing
npm run web      # Uses mock service, faster iteration
```

**3. Testing Strategy**

- Use `npm run web` for UI/UX development (mock DNS)
- Use `npm run ios` for native DNS testing on iOS
- Use `npm run android` for native DNS testing on Android
- Use `node test-dns-simple.js` for DNS connectivity testing

---

## Common Error Messages

### "Cannot determine the project's Expo SDK version"

**Solution:** `npm install expo`

### "Metro bundler can't resolve module"

**Solution:**

```bash
npx expo start -c  # Clear cache
# If persistent: rm -rf node_modules && npm install
```

### "Unable to resolve module @expo/vector-icons"

**Solution:** `npx expo install @expo/vector-icons`

### "Task :app:checkDebugAarMetadata FAILED"

**Solution:** Java version mismatch - use Java 17

### "The following build commands failed: CompileC"

**Solution:** iOS compilation error - check Xcode logs, often missing dependencies

---

## Performance & Optimization

### Q: App is slow or laggy

**A:** Check these performance factors:

**1. Message List Performance**

- Uses FlatList (VirtualizedList) for message rendering
- Should handle thousands of messages efficiently
- If slow: Check if you're on v1.5.1+ (VirtualizedList fix)

**2. DNS Query Performance**

- Native DNS: <2 seconds typical
- Fallback methods: 2-5 seconds
- If slow: Check network connectivity and server status

**3. Storage Performance**

- AsyncStorage should be fast for chat data
- If slow: Check for large message payloads or corrupted data

### Q: Battery drain concerns

**A:** DNSChat is optimized for battery efficiency:

- DNS queries are on-demand only
- Background queries are suspended
- Native implementations more efficient than JavaScript
- No polling or continuous connections

---

## Emergency Procedures

### Complete Reset (Nuclear Option)

When everything is broken and you need to start fresh:

```bash
# 1. Stop all processes
# Kill Metro bundler, simulators, etc.

# 2. Clean everything
rm -rf node_modules package-lock.json
rm -rf ios/Pods ios/Podfile.lock
rm -rf android/.gradle android/build
rm -rf .expo

# 3. Reinstall everything
npm install
cd ios && pod install && cd ..

# 4. Clear all caches
npx expo start -c

# 5. Rebuild
npm run ios     # or npm run android
```

### Rollback to Working State

If you broke something and need to revert:

```bash
# 1. Check git status
git status

# 2. Discard changes
git checkout .  # Discard all changes
# OR
git stash      # Save changes for later

# 3. Clean and rebuild
npm run clean
npm install
```

---

## Getting Help

### Internal Resources

1. Check this FAQ first
2. Review `/docs/technical/` for detailed guides
3. Check git history for recent changes: `git log --oneline -10`

### External Resources

1. [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting)
2. [Expo Documentation](https://docs.expo.dev/)
3. [React Navigation Docs](https://reactnavigation.org/)

### Escalation

If stuck after trying FAQ solutions:

1. Document exact error messages
2. Note your environment (macOS/Linux, Node version, etc.)
3. Include steps to reproduce
4. Share relevant console logs
5. Ask senior developer or create issue

---

**Last Updated:** v1.6.1 - UI Fixes & Enhanced Features
**Maintainers:** DNSChat Development Team
