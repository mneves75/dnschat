@import project-rules/modern-swift.mdc
@import project-rules/update-docs.mdc
@import project-rules/code-analysis.mdc

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📚 Documentation Structure

DNSChat now has comprehensive technical documentation organized in the `/docs/` folder:

- **[docs/README.md](docs/README.md)** - Complete documentation hub and navigation
- **[docs/TECH-FAQ.md](docs/TECH-FAQ.md)** - Technical FAQ for quick issue resolution
- **[docs/technical/JUNIOR-DEV-GUIDE.md](docs/technical/JUNIOR-DEV-GUIDE.md)** - Comprehensive onboarding guide
- **[docs/architecture/SYSTEM-ARCHITECTURE.md](docs/architecture/SYSTEM-ARCHITECTURE.md)** - Complete system architecture overview
- **[docs/troubleshooting/COMMON-ISSUES.md](docs/troubleshooting/COMMON-ISSUES.md)** - Comprehensive troubleshooting guide

**When working on this project, always reference the appropriate documentation and keep it updated.**

## Inspiration and Acknowledgements

- Reference: [Arxiv Daily tweet](https://x.com/Arxiv_Daily/status/1952452878716805172) describing DNS-based LLM chat.
- Open-source: [ch.at – Universal Basic Intelligence](https://github.com/Deep-ai-inc/ch.at) implementing chat over DNS (example: `dig @ch.at "..." TXT`).

## Project Overview

This is a React Native mobile application that provides a modern, ChatGPT-like chat interface using DNS TXT queries to communicate with an LLM. The app features local storage for conversation history, a polished UI with dark/light theme support, and native KeyboardAvoidingView for optimal keyboard handling.

## Development Commands

### Starting the Application
```bash
# Start development server with dev client
npm start

# Run on specific platforms
npm run ios              # Build and run iOS development build
npm run android          # Build and run Android development build (uses Java 17)
npm run android:java24   # Build Android with system Java (may fail with newer Java versions)
npm run web              # Start web version (available via Expo's web support)
```

### Android Build Requirements

**IMPORTANT**: Android builds require **Java 17** for compatibility with Gradle and react-native-reanimated.

#### Setup Java 17 (Required)
```bash
# Install OpenJDK 17 if not already installed
brew install openjdk@17

# Verify installation
/opt/homebrew/opt/openjdk@17/bin/java -version

# The npm run android script automatically uses Java 17
# Manual command if needed:
JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home PATH=/opt/homebrew/opt/openjdk@17/bin:$PATH expo run:android
```

#### Common Issues
- **Java 24**: Causes "Unsupported class file major version 68" error
- **Gradle 8.13+**: May cause react-native-reanimated compatibility issues (downgraded to 8.10.2)

### Dependencies Installation
```bash
npm install

# For iOS native functionality
cd ios && pod install && cd ..
```

### Testing DNS Communication
```bash
# Test DNS functionality directly (CLI tool)
node test-dns.js "test message"
```

### No Linting or Testing Commands
This project does not have configured lint, typecheck, or test scripts. If you need to check TypeScript compilation, use the Expo development build process which will show compilation errors.

## Architecture

### Tech Stack
- **Framework**: React Native with Expo (v53)
- **Language**: TypeScript with strict mode enabled
- **Navigation**: React Navigation v7 (Native Stack + Bottom Tabs)
- **Development**: Expo Development Build with Continuous Native Generation
- **Platform Support**: iOS, Android, and Web

### Navigation Structure
The app uses a hierarchical navigation pattern:
- **Root Stack** (`RootStack` in src/navigation/index.tsx)
  - HomeTabs (Bottom Tab Navigator)
    - ChatList screen - displays all chat conversations with delete functionality
    - About screen - project information and version display
  - Chat screen - individual chat conversation interface
  - Profile screen (with deep linking support for @username paths)
  - Settings screen (modal presentation)
  - NotFound screen (404 fallback)

### Chat Architecture
- **ChatContext** (src/context/ChatContext.tsx): Global state management for chats and messages using React Context
- **StorageService** (src/services/storageService.ts): AsyncStorage-based persistence for conversations with automatic JSON serialization
- **DNSService** (src/services/dnsService.ts): Handles DNS TXT queries to `ch.at` via DNS-over-HTTPS (Cloudflare)
- **MockDNSService** (src/services/dnsService.ts): Development mock service (currently active) - simulates network delays and occasional errors

### Key Components
- **MessageBubble**: Individual chat message display with markdown support
- **MessageList**: Virtualized list of messages with auto-scroll
- **ChatInput**: Bottom input area with send functionality
- **ChatListItem**: Individual chat item with trash icon for deletion and confirmation dialog
- **TrashIcon**: SVG icon component for delete functionality
- **ErrorBoundary**: Global error handling wrapper

### Key Configuration Files
- **app.json**: Expo configuration including app name, bundle identifiers, and plugins
  - Current scheme: `dnschat://`
  - Bundle IDs still using template defaults (`com.satya164.reactnavigationtemplate`) - needs updating
  - Uses React Native's New Architecture (newArchEnabled: true)
  - Version in app.json (1.5.0) matches package.json (1.5.0)
- **tsconfig.json**: TypeScript configuration extending Expo's base config with strict mode enabled
- **package.json**: Current version 1.5.0 with all dependencies including DNS libraries

### Deep Linking
The app is configured for automatic deep linking with:
- Scheme: `dnschat://` (configured in app.json and App.tsx)
- Profile screen supports username paths like `@username`

### DNS Communication
The app communicates with an LLM via DNS TXT queries using a comprehensive multi-layer fallback strategy with network resilience:

#### Query Methods (in order of preference):
1. **Native DNS Modules** (iOS/Android): Platform-optimized implementations
   - **iOS**: Apple Network Framework (`nw_resolver_t`) - bypasses port 53 restrictions
   - **Android**: DnsResolver API (API 29+) + dnsjava fallback for legacy devices
2. **UDP DNS**: Direct UDP queries via `react-native-udp` and `dns-packet`
3. **DNS-over-TCP**: TCP fallback via `react-native-tcp-socket` for networks blocking UDP port 53
4. **DNS-over-HTTPS**: Cloudflare API fallback (https://cloudflare-dns.com/dns-query)
5. **Mock Service**: Development/testing fallback

#### Network Resilience Features:
- **Query format**: `dig @ch.at "<USER_MESSAGE>" TXT +short`
- **Error handling**: Automatic retries with exponential backoff (3 retries, 10-second timeout)
- **Response parsing**: Multi-part DNS response handling with format "1/3:", "2/3:", etc.
- **Background suspension**: Automatic app state detection and query suspension/recovery
- **iOS ATS compliance**: Configured App Transport Security exceptions for ch.at
- **React Native compatibility**: Custom timeout handling replacing AbortSignal.timeout
- **Network detection**: UDP port blocking detection with automatic TCP fallback
- **Connection pooling**: Efficient socket management and cleanup

## Important Notes

### Development Build Required
This project uses Expo Development Build and cannot run with Expo Go. The `expo-dev-client` package is required.

### Native Folders
The `ios` and `android` folders are gitignored by default (Continuous Native Generation). Use Expo config plugins for native customization rather than editing these folders directly.

### Assets
- Navigation icons are loaded from `src/assets/` (newspaper.png, bell.png)
- App icons and splash screens are in the root `assets/` folder
- Assets are preloaded using `Asset.loadAsync()` in src/App.tsx:11-15 for performance

### Theme Support
The app automatically switches between light and dark themes based on system preferences using React Navigation's theme system (src/App.tsx:20-22).

### Edge-to-Edge Display
Android is configured with edge-to-edge display using the `react-native-edge-to-edge` plugin.

## State Management & Data Flow

### Chat Flow
1. **Chat Creation**: StorageService creates new chat with UUID, saves to AsyncStorage
2. **Message Sending**: User message saved immediately, assistant placeholder created with "sending" status  
3. **DNS Query**: MockDNSService (or DNSService) processes the user message
4. **Response Handling**: Assistant message updated with response content and "sent" status
5. **Auto-titling**: First user message becomes chat title (truncated to 50 chars)

### Storage Structure
- **Storage Key**: `@chat_dns_chats` in AsyncStorage
- **Date Serialization**: Automatic ISO string conversion for dates
- **Error Recovery**: Storage operations include error handling and fallback to empty arrays

## Native DNS Implementation (v1.5.4+) - PRODUCTION READY ✅

### 🎯 FULLY FUNCTIONAL: Native iOS & Android Enhanced

**Status: PRODUCTION READY** - Native DNS implementation now works perfectly on iOS, matching `dig @ch.at "message" TXT +short` functionality. Version 1.5.3 fixed critical iOS timeout issues. Version 1.5.4 enhanced Android implementation with comprehensive logging and improved packet handling.

### Native Platform Implementation

- **✅ iOS Implementation**: Complete Swift implementation using Apple Network Framework
- **Direct UDP DNS**: Queries `ch.at:53` directly via UDP socket
  - **Manual DNS Packets**: Creates and parses DNS packets for maximum compatibility
  - **Message-as-Domain**: Treats user message as DNS query domain (exactly like dig)
  - **Network Framework**: Uses `NWConnection` with proper async/await patterns
  - **Comprehensive Logging**: Extensive debug output for monitoring and troubleshooting

- **🔄 Android Implementation**: Ready for implementation (fallback chain active)
  - **Modern (API 29+)**: Android DnsResolver API ready for integration
  - **Legacy (API <29)**: dnsjava library fallback prepared
  - **Current Status**: Using JavaScript UDP/TCP fallbacks (functional)

### ✅ Production Test Results

**iOS Native DNS Console Output:**
```
🔧 NativeDNS constructor called
✅ RNDNSModule found: true
🔍 Native DNS capabilities received: {
  "available": true,
  "supportsCustomServer": true,
  "supportsAsyncQuery": true,
  "platform": "ios"
}
✅ Native DNS reports as available!
🌐 Querying ch.at with message: "What's the meaning of life?"
📥 Raw TXT records received: ["The meaning of life is a personal and philosophical question..."]
🎉 Native DNS query successful
```

### Technical Implementation Status

- **✅ iOS Swift Module**: Complete implementation with manual DNS packet handling
- **✅ TypeScript Interface**: Full compatibility with React Native bridge
- **✅ CocoaPods Integration**: Proper podspec configuration and native dependency management
- **✅ Error Handling**: Comprehensive error handling with timeout management
- **✅ Fallback Chain**: Seamless integration with existing UDP/TCP/HTTPS fallbacks

### Configuration Status - COMPLETE

- **✅ Bundle IDs**: Production identifiers (`org.mvneves.dnschat`)
- **✅ Version Sync**: app.json and package.json at v1.5.0
- **✅ Package Metadata**: Complete podspec dependencies resolved
- **✅ Build Process**: iOS builds successfully with native DNS module
- **✅ Module Registration**: Native module properly detected by React Native bridge

## Debugging Native DNS Issues

When working on native DNS problems:
1. **Test with CLI first**: Use `node test-dns.js "message"` to verify DNS service connectivity
2. **Check platform capabilities**: Use `nativeDNS.isAvailable()` to verify native module status
3. **iOS debugging**: Monitor Network Framework usage in Xcode console
4. **Android debugging**: Check API level support and dnsjava fallback behavior
5. **Fallback chain testing**: Verify graceful degradation through all fallback layers

## Network Troubleshooting Guide

### Common Network Issues and Solutions

#### 1. UDP Port 53 Blocked (ERR_SOCKET_BAD_PORT on iOS)
- **Symptoms**: UDP DNS queries fail with port/BAD_PORT errors
- **Solution**: App automatically falls back to DNS-over-TCP
- **Manual fix**: Ensure `react-native-tcp-socket` is installed
- **Networks affected**: Some cellular networks, corporate Wi-Fi, public hotspots

#### 2. iOS App Transport Security (ATS) Issues
- **Symptoms**: Network requests blocked by ATS
- **Solution**: Configured exceptions in `ios/ChatDNS/Info.plist` (iOS project structure)
- **Coverage**: 
  - `ch.at` - allows insecure loads for DNS queries
  - `llm.pieter.com` - allows insecure loads for DNS queries
  - `cloudflare-dns.com` - secure HTTPS for DNS-over-HTTPS fallback

#### 3. Background App Suspension
- **Symptoms**: DNS queries fail when app returns from background
- **Solution**: Automatic app state monitoring and query suspension
- **Behavior**: Queries suspend in background, resume in foreground
- **Error messages**: "DNS query suspended due to app backgrounding"

#### 4. React Native AbortSignal Compatibility
- **Symptoms**: "AbortSignal.timeout is not a function" errors
- **Solution**: Custom AbortController + setTimeout implementation
- **Impact**: Affects DNS-over-HTTPS timeout handling

#### 5. Native Module Registration Issues
- **Symptoms**: "Native DNS not available, falling back to legacy methods"
- **iOS Solution**: Run `cd ios && pod install` to register native modules
- **Android Solution**: Clean and rebuild with `expo run:android`
- **Verification**: Check `nativeDNS.isAvailable()` returns `available: true`

#### 6. Android Build Issues
- **Java 24 Compatibility Error**: "Unsupported class file major version 68"
  - **Solution**: Use Java 17 - `npm run android` (automatically uses Java 17)
  - **Manual**: `JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home npm run android`
- **react-native-reanimated Gradle Error**: "Could not create task ':react-native-reanimated:outgoingVariants'"
  - **Solution**: Project uses Gradle 8.10.2 for compatibility
  - **Clear caches**: `rm -rf ~/.gradle/caches && rm -rf android/.gradle`
- **Build Environment**: Install Java 17 with `brew install openjdk@17`

### Network Testing Commands

```bash
# Test DNS connectivity directly
node test-dns.js "Hello world"

# Test native module integration (in React Native app)
await nativeDNS.isAvailable()

# Test fallback chain
# 1. Native -> 2. UDP -> 3. TCP -> 4. HTTPS -> 5. Mock

# iOS build with native modules
cd ios && pod install && cd .. && npm run ios

# Android build with native modules  
npm run android
```

## Recent Critical Fixes (v1.5.1)

### VirtualizedList Architecture Fix
- **Issue**: React Native warning "VirtualizedLists should never be nested inside plain ScrollViews with the same orientation"
- **Cause**: KeyboardAwareScrollView wrapping MessageList (FlatList) created nested VirtualizedList architecture
- **Solution**: Replaced `react-native-keyboard-aware-scroll-view` with native `KeyboardAvoidingView`
- **Implementation**: 
  - Used `KeyboardAvoidingView` with `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`
  - Added `keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}` for navigation header
  - Maintained FlatList (MessageList) without ScrollView wrapper
- **Result**: Eliminated VirtualizedList nesting warnings and improved app stability

### Keyboard Handling Architecture
- **Previous**: Third-party KeyboardAwareScrollView with complex configuration
- **Current**: Native KeyboardAvoidingView with platform-specific behavior
- **Benefits**: Better performance, no external dependencies, proper React Native compliance
- **Cross-Platform**: Consistent keyboard handling across iOS and Android

## Project Guidelines

### Release and Maintenance
- **Always update changelog**: Maintain a detailed changelog for each release, documenting new features, bug fixes, and significant changes
- **Version consistency**: Keep app.json and package.json versions synchronized
- **Native DNS testing**: Test both iOS and Android native implementations before releases
- **CLI validation**: Use `node test-dns.js` to verify DNS service connectivity
- **Platform testing**: Validate native modules on both iOS simulators and Android emulators

## Personal Notes
- John Carmack will always review your work! Think harder!

## Code Maintenance
- Always update docs
- Always update changelog
- Always update changelog