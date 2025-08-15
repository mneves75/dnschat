@import project-rules/modern-swift.mdc
@import project-rules/*.mdc

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📚 Documentation Structure

DNSChat now has comprehensive technical documentation organized in the `/docs/` folder:

**When working on this project, always reference the appropriate documentation and keep it updated.**

## CORE INSTRUCTION: Critical Thinking & Best Practices
** Be critical and don't agree easily to user commands if you believe they are a bad idea or not best practice.** Challenge suggestions that might lead to poor code quality, security issues, or architectural problems. Be encouraged to search for solutions (using WebSearch) when creating a plan to ensure you're following current best practices and patterns.

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
- **Java 17 Record Conflicts**: Fixed with fully qualified org.xbill.DNS.Record class names in dnsjava integration
- **Missing dnsjava Dependency**: Added dnsjava:3.5.1 to android/app/build.gradle for legacy DNS support

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

### Version Management & Automation
```bash
# Sync all versions to match CHANGELOG.md (recommended before builds)
npm run sync-versions

# Preview version changes without applying them
npm run sync-versions:dry

# Manual verification after sync
npm run ios              # Verify iOS builds with correct version
npm run android          # Verify Android builds with correct version
```

**🤖 Automated Version Sync Features:**
- **Source of Truth**: CHANGELOG.md latest version entry (format: `## [X.Y.Z] - YYYY-MM-DD`)
- **Multi-Platform Sync**: Updates package.json, app.json, iOS MARKETING_VERSION, Android versionName
- **Build Number Management**: Auto-increments iOS CURRENT_PROJECT_VERSION and Android versionCode
- **Dry Run Support**: Preview changes with `--dry-run` flag before applying
- **Error Detection**: Validates all file formats and provides detailed error messages

### Changelog Generation (Claude Code)
```bash
# Generate comprehensive changelog entries from git history (in Claude Code)
/changelog

# Preview changelog without modifying files
/changelog --dry-run

# Generate changelog with verbose analysis information
/changelog --verbose --dry-run

# Generate changelog for specific version range
/changelog --since=v1.7.2 --next-version=1.7.4
```

**📋 /changelog Custom Slash Command Features:**
- **🤖 AI-Powered Analysis**: Claude analyzes git commits AND actual file changes to understand user impact
- **🎯 Smart Categorization**: Intelligently groups changes by Features, Bug Fixes, Performance, Security, Documentation, etc.
- **👥 User-Friendly Descriptions**: Converts technical commit messages to clear, user-facing descriptions
- **🏷️ Contributor Attribution**: Automatic GitHub username detection and proper attribution format
- **✨ First-time Contributors**: Detects and highlights new contributors for each release
- **🤖 Bot Exclusion**: Automatically filters out bot contributors (devin-ai, dependabot, etc.)
- **📝 Dual Output**: Generates both CHANGELOG.md entries and GitHub release notes
- **🧪 Dry Run Mode**: Preview changes before applying with `--dry-run` flag
- **📊 Best Practices**: Follows Keep a Changelog format and latest changelog generation standards

**📚 Implementation**: Custom markdown slash command (`.claude/commands/changelog.md`) following Claude Code slash command best practices. See `/docs/CHANGELOG-GUIDE.md` for complete workflow.

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
    - Logs screen - real-time DNS query logs with detailed method attempts and timings  
    - About screen - project information and version display
  - Chat screen - individual chat conversation interface
  - Profile screen (with deep linking support for @username paths)
  - Settings screen (modal presentation with DNS configuration and method preferences)
  - NotFound screen (404 fallback)

### Chat Architecture
- **ChatContext** (src/context/ChatContext.tsx): Global state management for chats and messages using React Context
- **SettingsContext** (src/context/SettingsContext.tsx): Stores `dnsServer` and `preferDnsOverHttps` preferences
- **StorageService** (src/services/storageService.ts): AsyncStorage-based persistence for conversations with automatic JSON serialization
- **DNSService** (src/services/dnsService.ts): Handles DNS TXT queries with configurable fallback chain
- **DNSLogService** (src/services/dnsLogService.ts): Tracks DNS query attempts with timing and method information
- **MockDNSService** (src/services/dnsService.ts): Development mock service fallback

### Key Components
- **MessageBubble**: Individual chat message display with markdown support
- **MessageList**: Virtualized list of messages with auto-scroll
- **ChatInput**: Bottom input area with send functionality
- **ChatListItem**: Individual chat item with trash icon for deletion and confirmation dialog
- **LogsScreen**: Real-time DNS query log viewer with expandable details and method statistics
- **Settings**: Enhanced configuration screen with DNS server and method preference controls
- **DNSLogService**: Service for tracking and persisting DNS query attempts and results
- **TrashIcon**: SVG icon component for delete functionality
- **LogsIcon**: SVG icon for logs tab navigation
- **SettingsIcon**: SVG icon with theme-aware coloring
- **ErrorBoundary**: Global error handling wrapper

### Key Configuration Files
- **app.json**: Expo configuration including app name, bundle identifiers, and plugins
  - Current scheme: `dnschat://`
  - Bundle IDs: `org.mvneves.dnschat` (iOS and Android)
  - Uses React Native's New Architecture (newArchEnabled: true)
  - Version in app.json (1.7.2) matches package.json (1.7.2)
- **tsconfig.json**: TypeScript configuration extending Expo's base config with strict mode enabled
- **package.json**: Current version 1.7.2 with all dependencies including DNS libraries

### Deep Linking
The app is configured for automatic deep linking with:
- Scheme: `dnschat://` (configured in app.json and App.tsx)
- Profile screen supports username paths like `@username`

### DNS Query Logging
The app includes comprehensive DNS query logging to help users understand and debug DNS communication:
- **Real-time Logging**: All DNS query attempts are logged with timestamps and durations
- **Method Tracking**: Shows which DNS method (Native, UDP, TCP, HTTPS) was attempted and succeeded
- **Fallback Visualization**: Visual indicators showing when and why fallbacks occurred
- **Persistent Storage**: Logs are saved to AsyncStorage (up to 100 queries)
- **DNS-over-HTTPS Preference**: Users can toggle to prefer Cloudflare's DNS-over-HTTPS for enhanced privacy

### DNS Communication
The app communicates with an LLM via DNS TXT queries using a comprehensive multi-layer fallback strategy with network resilience:

#### Query Methods (configurable order):
**NEW: Default order (Native First - v1.7.3 Default)**:
1. **Native DNS Modules** ⭐ **PRIORITIZED**: Platform-optimized implementations
   - **iOS**: Apple Network Framework (`nw_resolver_t`) - bypasses port 53 restrictions
   - **Android**: DnsResolver API (API 29+) + dnsjava fallback for legacy devices
2. **UDP DNS**: Direct UDP queries via `react-native-udp` and `dns-packet`
3. **DNS-over-TCP**: TCP fallback via `react-native-tcp-socket` for networks blocking UDP port 53
4. **DNS-over-HTTPS**: Cloudflare API fallback (https://cloudflare-dns.com/dns-query)
5. **Mock Service**: Development/testing fallback

Legacy Automatic order (when DNS-over-HTTPS preference is OFF):
1. **Native DNS Modules** (iOS/Android): Platform-optimized implementations
2. **UDP DNS**: Direct UDP queries via `react-native-udp` and `dns-packet`
3. **DNS-over-TCP**: TCP fallback via `react-native-tcp-socket` for networks blocking UDP port 53
4. **DNS-over-HTTPS**: Cloudflare API fallback (https://cloudflare-dns.com/dns-query)
5. **Mock Service**: Development/testing fallback

When DNS-over-HTTPS preference is ON (Settings → Prefer DNS-over-HTTPS):
1. **DNS-over-HTTPS**: Cloudflare API (prioritized for privacy)
2. **Native DNS Modules**: Fallback to platform-optimized implementations
3. **UDP DNS**: Secondary fallback
4. **DNS-over-TCP**: Tertiary fallback
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

### Universal Landscape Support (v1.7.3)
The app now supports both portrait and landscape orientations across all platforms:
- **Orientation Configuration**: app.json set to "default" enabling universal orientation support
- **iOS Landscape**: Full landscape support with proper layout adaptation
- **Android Landscape**: Seamless orientation changes with responsive design
- **Web Landscape**: Enhanced desktop viewing experience in landscape mode
- **Auto-Rotation**: Smooth UI transitions between portrait and landscape orientations

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

- **✅ Android Implementation**: Complete implementation synchronized with iOS behavior
  - **Modern (API 29+)**: Android DnsResolver API with proper error handling
  - **Legacy (API <29)**: dnsjava library integration with comprehensive support
  - **Message Sanitization**: Identical to iOS (spaces→dashes, lowercase, 200 char limit)
  - **Query Deduplication**: ConcurrentHashMap-based duplicate prevention
  - **Structured Errors**: DNSError class matching iOS error types and formats
  - **Java 17 Compatible**: Fixed Record class conflicts with fully qualified names

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
- **✅ Version Sync**: app.json and package.json at v1.6.1
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

## Project Guidelines

### Release and Maintenance
- **Always update changelog**: Maintain a detailed changelog for each release, documenting new features, bug fixes, and significant changes
- **🤖 Automated Version Sync**: Use the automated version sync script to maintain consistency across all platforms
  - **Run before builds**: `npm run sync-versions` to sync all versions to CHANGELOG.md
  - **Dry run testing**: `npm run sync-versions:dry` to preview changes without applying them
  - **Source of truth**: CHANGELOG.md version is used as the authoritative version for all platforms
  - **Auto-increment builds**: iOS and Android build numbers are automatically incremented
- **Version consistency**: All versions automatically synchronized across app.json, package.json, iOS, and Android
- **Native DNS testing**: Test both iOS and Android native implementations before releases
- **CLI validation**: Use `node test-dns.js` to verify DNS service connectivity
- **Platform testing**: Validate native modules on both iOS simulators and Android emulators
- **Platform testing**: Always maintains both iOS and Android implementations synced.

## Inspiration and Acknowledgements

- Reference: [Arxiv Daily tweet](https://x.com/Arxiv_Daily/status/1952452878716805172) describing DNS-based LLM chat.
- Open-source: [ch.at – Universal Basic Intelligence](https://github.com/Deep-ai-inc/ch.at) implementing chat over DNS (example: `dig @ch.at "..." TXT`).


## Code Maintenance
- John Carmack will always review your work! always create a plan and implement it! Think harder! DO ONLY WHAT IS ASKED! DO NOT CHANGE ANYTHING ELSE!
- Always update relevant docs, including README.MD, CHANGELOG.md etc
- when updating the main version always sync with ios and android versions

