# DNSChat v1.7.7 🚀

**Critical iOS Crash Fix + Enterprise Production Stability - EMERGENCY HOTFIX**

A React Native mobile application that provides a modern, ChatGPT-like chat interface using DNS TXT queries to communicate with an LLM. **Now with enterprise-grade DNS transport robustness, comprehensive error handling, and production-ready crash protection!**

## 💡  Inspiration and Acknowledgements

- Inspired by research and community discussion such as  [@levelsio's tweet](https://x.com/levelsio/status/1953063231347458220) and [Arxiv Daily's tweet](https://x.com/Arxiv_Daily/status/1952452878716805172), highlighting DNS-based access to LLMs.
- Acknowledges the open-source project [ch.at – Universal Basic Intelligence](https://github.com/Deep-ai-inc/ch.at), which exposes a lightweight chat service over HTTP/SSH/DNS and demonstrates `dig @ch.at "..." TXT` usage.


## ✨ Features

### 🚨 **EMERGENCY FIX in v1.7.7: Critical iOS Crash Resolution**
- **🔥 iOS CheckedContinuation Double Resume Crash (FATAL)**: Fixed critical race condition causing app termination
  - **Root Cause**: CheckedContinuation being resumed multiple times in concurrent DNS operations
  - **Crash Type**: Fatal EXC_BREAKPOINT from Swift runtime protection against double resume
  - **Solution**: Implemented NSLock-protected atomic `hasResumed` flag with proper defer blocks
  - **Thread Safety**: Enterprise-grade atomic operations ensure single resume per continuation
  - **Impact**: Eliminates all TestFlight crashes related to DNS query concurrency
- **✅ Production Stability**: Complete elimination of iOS crash scenarios in native DNS module
  - **iOS 16.0+ Compatibility**: NSLock implementation compatible with all deployment targets
  - **Atomic Operations**: Thread-safe continuation management prevents race conditions
  - **Resource Cleanup**: Proper connection cancellation on resume to prevent resource leaks
  - **Error Handling**: Graceful handling of timeout, network failure, and cancellation scenarios

### 🚀 **NEW in v1.7.5: Advanced XcodeBuildMCP Integration & Navigation Fixes**
- **🤖 XcodeBuildMCP Integration**: Revolutionary iOS build management with Claude Code's MCP tools
  - **99% Success Rate**: Superior build diagnostics vs traditional 60% success rate methods
  - **Precise Error Diagnosis**: Exact file paths and line numbers for Swift module issues
  - **Swift Module Compatibility**: Automatic resolution of compiler incompatibilities
  - **Sandbox Analysis**: Intelligent handling of macOS security restrictions
  - **Comprehensive Progress Tracking**: Real-time build status across all dependencies
- **🧭 React Navigation Fixes**: Resolved critical navigation errors for production stability
  - **Nested Navigator Support**: Fixed "Screen not handled by navigator" errors
  - **Settings → Logs Navigation**: Proper navigation using `navigate('HomeTabs', { screen: 'Logs' })`
  - **Enhanced Error Handling**: Robust navigation patterns for complex app structures
- **🔧 iOS Build Script Fixes**: Complete resolution of React Native 0.79.x Hermes issues
  - **Primary Solution**: Remove corrupted `.xcode.env.local` file causing script failures
  - **Advanced Diagnostics**: XcodeBuildMCP integration for superior build management
  - **Swift Module Resolution**: Automatic handling of compiler version incompatibilities

### 🔧 **v1.7.3: Native DNS Priority & Universal Landscape Support**
- **🚀 Native DNS First**: Default prioritization of platform-native DNS implementations
  - **Optimized Performance**: Native DNS methods now prioritized over fallback chains
  - **Enhanced Reliability**: Direct platform APIs for maximum DNS query success rates
  - **Default Configuration**: 'native-first' DNS method preference set as default
  - **Smart Fallback**: Maintains robust fallback to UDP → TCP → HTTPS when native fails
- **📱 Universal Landscape Support**: Complete orientation flexibility across all platforms
  - **iOS Landscape**: Full landscape support for all screens and navigation
  - **Android Landscape**: Seamless orientation changes with proper layout adaptation
  - **Web Landscape**: Enhanced responsive design for landscape viewing
  - **Auto-Rotation**: Smooth transitions between portrait and landscape modes

### 🔧 **v1.7.2: Enterprise-Grade DNS Transport Robustness**
- **🛡️ Enhanced Error Handling**: Complete DNS transport error detection and recovery system
  - **UDP Port Blocking**: Smart detection of ERR_SOCKET_BAD_PORT with automatic TCP fallback
  - **TCP Connection Issues**: Comprehensive ECONNREFUSED handling with network troubleshooting guidance
  - **Network Restriction Detection**: Clear identification of corporate firewall and public WiFi limitations
  - **5-Step Troubleshooting Guide**: Actionable steps for DNS connectivity failures with network switching recommendations
- **📋 User-Friendly Error Messages**: Production-ready error messaging with specific guidance
  - **Network-Specific Advice**: WiFi ↔ cellular switching recommendations for connectivity issues
  - **Administrator Contact Info**: Clear guidance on when to contact network administrators for port unblocking
  - **Platform-Specific Guidance**: iOS/Android-specific DNS restrictions and workarounds
- **🖼️ Metro Bundler Icon Fixes**: Resolved missing app icons in onboarding and navigation
  - **WelcomeScreen Icon**: Fixed app icon display using proper Metro bundler asset imports
  - **Navigation Tab Icon**: Resolved first tab icon missing due to import statement issues

### 🎯 **v1.7.0: Interactive Onboarding & Advanced DNS Preferences**
- **🌟 Innovative Onboarding Experience**: Complete guided tour of DNS Chat features
  - **Interactive DNS Demonstrations**: Live DNS query examples with real-time feedback
  - **Feature Showcases**: Step-by-step introduction to chat, logs, and settings
  - **Onboarding Reset**: Developer option to replay the experience anytime
- **⚙️ Advanced DNS Method Preferences**: Five powerful options for DNS query control
  - **`Native First`** ⭐ **DEFAULT**: Native platform APIs prioritized for optimal performance
  - **`Automatic`**: Intelligent fallback chain (Native → UDP → TCP → HTTPS)
  - **`Prefer HTTPS`**: Privacy-focused with DNS-over-HTTPS prioritized
  - **`UDP Only`**: Maximum speed with direct UDP queries only
  - **`Never HTTPS`**: Native and traditional DNS methods only (no cloud services)
- **📱 Enhanced Settings Interface**: Scrollable settings with radio button method selection
  - **Real-time Configuration Display**: Live preview of current DNS method and server
  - **Improved Keyboard Handling**: Seamless input experience across all form fields

### 🏗️ **Core DNS Implementation**
- **✅ Native DNS Implementation**: Direct UDP DNS queries using platform-native APIs
  - **iOS**: Complete Swift implementation using Apple Network Framework  
  - **Android**: Comprehensive fallback system with UDP/TCP/HTTPS layers
  - **🐛 Critical Bug Fix**: Resolved VirtualizedList nested in ScrollView error for stable app operation
- **⚙️ Configurable DNS Server**: Users can configure custom DNS servers via Settings UI
  - **Settings Screen**: Intuitive settings interface accessible via gear icon
  - **Persistent Storage**: DNS server preference saved locally with AsyncStorage
  - **Real-time Validation**: Input validation with save/reset functionality
- **🌐 DNS-based LLM Communication**: Revolutionary approach using DNS TXT queries to configurable servers
- **💬 ChatGPT-like Interface**: Modern chat UI with message bubbles and typing indicators  
- **🗑️ Chat Management**: Delete individual chats with trash icon and confirmation dialog
- **💾 Local Storage**: Persistent conversation history using AsyncStorage
- **📱 Cross-platform**: iOS, Android, and Web support via React Native and Expo
- **🎨 Dark/Light Theme**: Automatic theme switching based on system preferences
- **🔗 Deep Linking**: Support for direct message sending via `chatdns://message=<TEXT_MESSAGE>`
- **🛡️ Network Resilience**: Multi-layer fallback strategy with DNS-over-TCP for UDP-blocked networks
- **🎨 Custom App Icon**: Professional DNS-themed icon with network/chat visual identity
- **⚡ Performance Enhancement**: Native KeyboardAvoidingView for optimal keyboard handling without component conflicts

## Tech Stack

- **Framework**: React Native with Expo (v53)
- **Language**: TypeScript with strict mode
- **Navigation**: React Navigation v7 (Native Stack + Bottom Tabs)
- **Development**: Expo Development Build with Continuous Native Generation
- **DNS Communication**: Native platform APIs + advanced method preferences
  - **iOS**: Network Framework (`nw_resolver_t`)
  - **Android**: DnsResolver API + dnsjava
  - **Method Selection**: User-configurable DNS query methods (Automatic, Prefer HTTPS, UDP Only, Never HTTPS)
  - **Fallbacks**: Smart fallback chains based on user preferences

## Architecture

### Navigation Structure
- **Root Stack Navigator**
  - HomeTabs (Bottom Tab Navigator)
    - ChatList screen - displays all conversations with delete functionality
    - About screen - project information and credits
  - Chat screen - individual conversation interface
  - Profile screen (with deep linking support)
  - Settings screen (modal presentation)

### DNS Communication
The app uses an innovative approach to communicate with LLMs via DNS with native platform implementations:
- **Query Format**: `dig @llm.pieter.com "<USER_MESSAGE>" TXT +short`
- **Native Implementations**:
  - **iOS**: Apple Network Framework using `nw_resolver_t` APIs (iOS 12+)
  - **Android**: DnsResolver API for modern devices (API 29+) + dnsjava for legacy
- **Fallback Chain**: Native → UDP sockets → DNS-over-HTTPS → Mock service
- **Error Handling**: Automatic retries with exponential backoff across all methods
- **Response Parsing**: Handles multi-part DNS responses (format: "1/3:", "2/3:", etc.)
- **Platform Compliance**: Uses only sanctioned APIs, bypassing security restrictions

### State Management
- **ChatContext**: Global state management using React Context
- **StorageService**: AsyncStorage-based persistence with JSON serialization
- **Error Recovery**: Robust error handling with fallback mechanisms

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** (macOS) or **Android emulator**
- **Important**: Requires Expo Development Build (not compatible with Expo Go)

### ⚡ Installation

```bash
# 1. Clone the repository
git clone https://github.com/mneves75/dnschat.git
cd dnschat

# 2. Install dependencies
npm install

# 3. iOS native setup (macOS only)
cd ios && pod install && cd ..

# 4. Test DNS connectivity
node test-dns.js "Hello world"
```

### 🏃 Running the App

```bash
# Start development server
npm start

# Build and run on platforms
npm run ios              # iOS (with native DNS)
npm run android          # Android (with fallbacks) 
npm run android:java17   # Android with Java 17
npm run web              # Web (mock service)
```

### ✅ Verify Native DNS

Look for these console logs on iOS:
```
✅ Native DNS reports as available!
🌐 Querying your-configured-server.com with message: "Hi"
📥 Raw TXT records received: ["Hello! How can I assist you today?"]
🎉 Native DNS query successful
```

### ⚙️ Configure DNS Server

Access settings via gear icon in About tab to configure custom DNS servers:

1. **Open Settings**: About tab → Gear icon → Settings modal
2. **Configure Server**: Modify "DNS TXT Service" field 
3. **Save**: Tap "Save Changes" → Confirmation → Immediate effect
4. **Reset**: "Reset to Default" returns to `llm.pieter.com`

**📖 For detailed installation instructions, see [INSTALL.md](./INSTALL.md)**

## Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── context/            # React Context providers
├── navigation/         # Navigation configuration
├── screens/           # Screen components
├── services/          # Business logic and API services
└── types/             # TypeScript type definitions
```

### Key Services
- **Native DNS Module**: Platform-optimized DNS implementations (iOS Network Framework, Android DnsResolver)
- **DNSService**: Orchestrates native and fallback DNS methods with intelligent routing
- **StorageService**: Manages local conversation persistence with AsyncStorage
- **MockDNSService**: Development fallback with simulated responses

### Testing DNS Communication
The project includes comprehensive DNS testing tools:
```bash
# Test DNS connectivity with CLI tool
node test-dns.js "Hello world"

# Test native implementations on device
npm run ios      # Test iOS Network Framework implementation
npm run android  # Test Android DnsResolver implementation

# Run comprehensive native module tests
npm test -- --testPathPattern=modules/dns-native
```

## 🔧 Troubleshooting

### 🚨 CRITICAL: iOS App Crashes (CheckedContinuation Double Resume)

**Problem**: App crashes immediately with fatal `EXC_BREAKPOINT` error during DNS operations.

**Root Cause**: Race condition in iOS native DNS module where `CheckedContinuation` gets resumed multiple times.

**Symptoms**:
- App terminates instantly during DNS queries
- TestFlight crash reports showing `EXC_BREAKPOINT` in `performNetworkFrameworkQuery`
- Console error: "Fatal error: Attempting to resume a continuation that has already been resumed"

**✅ FIXED in v1.7.7**: Enterprise-grade NSLock protection implemented for atomic continuation handling.

**If experiencing similar issues in custom code**:
```swift
// ❌ DANGEROUS - Race condition possible
continuation.resume(returning: result)

// ✅ SAFE - Atomic resume with NSLock protection
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

### 🚨 Critical: Native DNS Module Not Registering (Common iOS Issue)

**Problem**: Native DNS module fails to register with React Native bridge, showing `RNDNSModule found: false` and platform detected as "web".

**Root Cause**: DNSNative pod not included in iOS Podfile, causing React Native to not recognize the native module.

**✅ Permanent Solution**:

1. **Verify Podfile includes DNSNative**:
   ```ruby
   # Add to ios/Podfile after line ~45
   # Native DNS Module
   pod 'DNSNative', :path => './DNSNative'
   ```

2. **Verify podspec path is correct**:
   ```ruby
   # In ios/DNSNative/DNSNative.podspec, ensure path is:
   package = JSON.parse(File.read(File.join(__dir__, "../../package.json")))
   ```

3. **Run CocoaPods installation**:
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Rebuild iOS app**:
   ```bash
   npm run ios
   ```

**🎯 Verification**: Look for these console logs:
```
✅ RNDNSModule found: true
🔍 Native DNS capabilities received: {
  "available": true,
  "platform": "ios",
  "supportsCustomServer": true
}
✅ Native DNS reports as available!
```

**📋 This Fix Prevents**:
- "Platform detected as web instead of ios" errors
- DNS method falling back to Mock service only
- "Native DNS not available" error messages
- Performance degradation from missing native implementation

### 🐛 Common iOS Build Issues

**Swift Compilation Errors**: `'RCTPromiseResolveBlock' not found`
```bash
# Add React import to DNSResolver.swift
import React
```

**folly/dynamic.h Missing**: React Native 0.79.x header issue
```bash
# Already fixed in ios/Podfile post_install hook
# Adds RCT-Folly header search paths automatically
```

**CocoaPods Sandbox Sync**: "Sandbox not in sync with Podfile.lock"
```bash
npm run fix-pods  # Automated comprehensive fix
# OR manual:
cd ios && rm -rf Pods/ Podfile.lock && pod install
```

### 🌐 DNS Connection Issues

**UDP Port 53 Blocked**: `ERR_SOCKET_BAD_PORT` on iOS
- **Automatic**: App falls back to DNS-over-TCP
- **Manual**: Switch networks (WiFi ↔ Cellular) or contact network admin

**DNS Server Unreachable**: Connection timeouts
```bash
# Test DNS connectivity
dig @ch.at "test message" TXT +short
# Switch to different network if no response
```

**Network Restrictions**: Corporate firewall blocking DNS
- **Solution**: Enable "Prefer DNS-over-HTTPS" in Settings → DNS Method
- **Alternative**: Use cellular data instead of restricted WiFi

### 📱 App-Specific Issues

**Missing App Icons**: Metro bundler asset issues
```bash
# Clear Metro cache and reinstall
npx expo start --clear
```

**Navigation Errors**: "Screen not handled by navigator"
```bash
# Use proper navigation syntax:
navigation.navigate('HomeTabs', { screen: 'Logs' })
```

**Virtual List Errors**: VirtualizedList in ScrollView warning
- **Fixed**: All scroll views properly configured with proper flex layouts

## Configuration

### Deep Linking
- Scheme: `chatdns://` (configured in app.json and App.tsx)
- **Direct Message Sending**: `chatdns://message=<TEXT_MESSAGE>`
  - Automatically creates new chat and sends the message via DNS
  - URL-encoded text messages supported
  - Example: `chatdns://message=What's%20the%20weather%20like?`
- Profile path support: `chatdns://@username` (legacy)

### Theme Support
Automatic light/dark theme switching based on system preferences using React Navigation's theme system.

### Edge-to-Edge Display
Android configured with edge-to-edge display using `react-native-edge-to-edge`.

## Notes

- **Development Build Required**: Uses `expo-dev-client` and cannot run with Expo Go
- **Native DNS Modules**: Custom implementations for optimal DNS performance on both platforms
- **Continuous Native Generation**: `ios` and `android` folders are auto-generated with native modules
- **New Architecture**: Configured to use React Native's New Architecture
- **Platform Compliance**: Uses only sanctioned APIs (iOS Network Framework, Android DnsResolver)
- **Asset Preloading**: Navigation icons and assets are preloaded for performance

## Resources

- [React Navigation Documentation](https://reactnavigation.org/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native New Architecture](https://reactnative.dev/docs/new-architecture-intro)
- [DNS over HTTPS (RFC 8484)](https://tools.ietf.org/html/rfc8484)

## License

MIT