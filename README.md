# DNSChat 🚀

A React Native mobile app that revolutionizes LLM interaction by using DNS TXT queries for AI communication. Chat with AI models through DNS infrastructure for enhanced privacy and network resilience.

[![React Native](https://img.shields.io/badge/React%20Native-0.81.1-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0.10-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![iOS](https://img.shields.io/badge/iOS-16%2B-lightgrey.svg)](https://developer.apple.com/ios/)
[![Android](https://img.shields.io/badge/Android-API%2021%2B-green.svg)](https://developer.android.com/)

## ✨ Key Features

- **🔒 Production-Grade Security (v2.1.0)**:
  - Real iOS Keychain & Android Keystore for encryption keys (no more AsyncStorage!)
  - AES-256-GCM encryption for all conversation data
  - Encrypted backups (zero plaintext exposure)
  - Fail-fast crypto validation
  - DNS parser with bounds-checked array access (prevents malicious response crashes)
  - DNS injection protection, input validation, and server whitelisting
- **🌟 iOS 26+ Liquid Glass**: Custom `LiquidGlassWrapper` with environmental adaptation, thermal monitoring, and GlassEffectContainer optimization (~40% GPU reduction)
- **🌐 DNS-Based AI Chat**: Revolutionary LLM communication via DNS TXT queries
- **📱 Cross-Platform**: Native iOS, Android, and Web support with platform-specific optimizations
- **⚡ Expo Router Native Tabs**: System native tabs with iOS 26+ liquid glass effects, automatic positioning (iPhone/iPad/Vision Pro), and minimize-on-scroll behavior
- **🚀 Native DNS Implementation**: Platform-optimized iOS Network Framework and Android DnsResolver with robust error handling
- **🔄 Multi-Layer Fallback**: Native DNS → UDP → TCP → DNS-over-HTTPS → Mock service
- **💾 Encrypted Storage**: End-to-end encrypted conversation history with automatic legacy migration
- **🎨 Modern Glass UI**: Custom liquid glass system with 3 material variants (regular, prominent, interactive), ambient light sensing, and CoreMotion parallax effects
- **⚙️ Advanced DNS Config**: Multiple DNS service options (ch.at, llm.pieter.com)
- **📝 Strict DNS Contract**: Client sanitizes queries to dashed lowercase labels (≤63 chars) matching the production `dns.go` resolver
- **📊 Real-Time Logging**: Comprehensive DNS query monitoring and debugging
- **🔗 Deep Linking**: Direct message sending via custom URL schemes
- **✅ Enterprise-Grade Stability**: Thread-safe operations, proper resource management, atomic flags preventing race conditions

## 🛠 Tech Stack

### **Core Framework**

- **React Native 0.81.1** (SDK 54 preview compatible)
- **Expo SDK 54.0.10** with Development Build
- **TypeScript** (strict mode)

### **Navigation & UI**

- **Expo Router v6** with Native Tabs (system native liquid glass on iOS 26+)
- **iOS 26+ Liquid Glass**: Custom `LiquidGlassWrapper` with environmental adaptation, thermal monitoring, and `GlassEffectContainer` optimization
- **React Native Safe Area Context** with gesture handler support
- **Advanced Theme Support** (automatic light/dark switching with iOS system colors)
- **Glass System**: 3 material variants (regular, prominent, interactive) with ambient light sensing, CoreMotion parallax, and ~40% GPU reduction via container merging

### **DNS Implementation**

- **iOS**: Swift + Apple Network Framework
- **Android**: Java + DnsResolver API + dnsjava fallback
- **Fallback**: DNS-over-HTTPS (Cloudflare)

### **Security & Storage**

- **iOS Keychain / Android Keystore** for encryption key storage (via `react-native-keychain`)
- **AES-256-GCM** encryption for all conversation data
- **PBKDF2** key derivation (100,000 iterations)
- **AsyncStorage** for encrypted data persistence
- **React Context** for global state management
- **Automatic migration** from legacy storage formats

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- iOS: Xcode 15+ and iOS 16+ device/simulator
- Android: Java 17 and Android SDK

### Installation

```bash
# Clone the repository
git clone https://github.com/mneves75/dnschat.git
cd dnschat

# Install dependencies
npm install

# iOS build note
# React Native is deprecating direct `pod install` usage. Prefer `npx expo run:ios`.
# If you need to troubleshoot native deps:
#   cd ios && pod install && cd ..

# Start development server
npm start
```

### Run on Device

```bash
# iOS (requires Xcode)
npm run ios

# Android (requires Java 17)
npm run android

# Web *(blocked in Expo CLI 54: `TypeError: Invalid URL`)*
# Track the CLI fix and rerun when resolved.
npm run web
```

## 💬 Usage

1. **Start a Chat**: Tap the chat input and type your message
2. **DNS Query**: Your message is sent via DNS TXT query to the LLM service
3. **Receive Response**: AI response appears in chat interface
4. **View Logs**: Check the Logs tab for detailed DNS query information
5. **Configure DNS**: Use Settings to adjust DNS method preferences

### Example DNS Query

```bash
# What the app does behind the scenes
dig @ch.at "What is the meaning of life?" TXT +short
```

### CLI Smoke Test

```bash
# Native-only default
node test-dns-simple.js "Hello" 

# Log experimental intent (UDP/TCP/HTTPS fallbacks in-app)
node test-dns-simple.js --experimental "Hello"
```

## 🏗 Architecture

### DNS Communication Flow

```
User Message → DNS Service → Native DNS Module → ch.at Server → LLM → Response
```

### Fallback Strategy

1. **Native DNS** (iOS Network Framework / Android DnsResolver)
2. **UDP DNS** (Direct socket communication)
3. **TCP DNS** (For UDP-blocked networks)
4. **DNS-over-HTTPS** (Cloudflare API)
5. **Mock Service** (Development fallback)

### Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context providers
├── screens/           # Expo Router screen implementations
├── services/          # DNS and storage services
└── types/             # TypeScript definitions

ios/DNSNative/         # iOS native DNS module
modules/dns-native/    # Android native DNS module
```

## 🔐 Security & Stability (v2.1.0+)

### Critical Issues Fixed

**DNS Injection Protection**
- Strict input validation prevents control characters and DNS special characters
- Server whitelist allows only known-safe DNS servers (ch.at, Google DNS, Cloudflare)
- Message sanitization ensures DNS-safe queries

**Thread Safety**
- iOS: NSLock-protected CheckedContinuation prevents race conditions
- Android: Bounded ThreadPoolExecutor prevents thread exhaustion
- Cross-platform: Identical message sanitization logic

**Resource Management**
- Guaranteed cleanup of network connections
- Proper timeout handling with Task cancellation
- Memory-efficient buffer management

### Security Best Practices

- Never send sensitive data through DNS queries
- Use DNS-over-HTTPS when available for enhanced privacy
- Monitor rate limits to prevent abuse
- Review logs regularly for suspicious activity

## 🔧 Development

### DNS Testing

```bash
# Node-only UDP TXT smoke test (no RN runtime required)
node test-dns-simple.js

# Run with specific DNS method
npm run ios -- --device-id "iPhone-UUID"
npm run android -- --variant debug
```

### DNS Transports & Troubleshooting

- UDP/TCP: Primary transports. Some networks block port 53; the app logs fallbacks and will try TCP where possible.
- HTTPS: DNS-over-HTTPS cannot reach ch.at’s custom TXT responses (resolver architecture). For ch.at queries, DoH is disabled and native/UDP/TCP are preferred; web preview enables Mock by default.
- Backgrounding: Queries suspend while the app is backgrounded; errors will mention suspension.
- Rate limiting: Per-minute throttling prevents spam; errors indicate when to retry.

View logs in-app: you can mount the developer log viewer to inspect attempts and fallbacks during development.

```tsx
import { DNSLogViewer } from "./src/components/DNSLogViewer";

export function LogsScreen() {
  return <DNSLogViewer maxEntries={50} />;
}
```

### Version Management

```bash
# Sync all platform versions
npm run sync-versions

# Preview version changes
npm run sync-versions:dry
```

### Common Development Tasks

**Clear Caches**

```bash
npx expo start --clear
```

**Fix iOS CocoaPods Issues**

```bash
npm run fix-pods
```

**Clean Builds**

```bash
npm run clean-ios
```

## 📚 Documentation

- **[Installation Guide](./docs/INSTALL.md)** - Detailed setup instructions
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[API Documentation](./docs/API.md)** - DNS service API reference
- **[Contributing](./CONTRIBUTING.md)** - Development guidelines

### Swift Xcode 26 Additional Docs

Always look for Swift documentation updated at this Xcode 26 folder: `/Applications/Xcode.app/Contents/PlugIns/IDEIntelligenceChat.framework/Versions/A/Resources/AdditionalDocumentation`.

### Guidelines for Modern Swift

Whenever possible, favor Apple programming languages and frameworks or APIs that are already available on Apple devices. Whenever suggesting code, assume the user wants Swift unless they show or tell you they are interested in another language. Always prefer Swift, Objective-C, C, and C++ over alternatives.

Pay close attention to the platform that the code targets. For example, if you see clues that the user is writing a Mac app, avoid suggesting iOS-only APIs.

Refer to Apple platforms with their official names, like iOS, iPadOS, macOS, watchOS, and visionOS. Avoid mentioning specific products and instead use these platform names.

In general, prefer the use of Swift Concurrency (async/await, actors, etc.) over tools like Dispatch or Combine, but if the user's code or words show you they may prefer something else, you should be flexible to this preference.

#### Modern Previews

Instead of using the `PreviewProvider` protocol for new previews in SwiftUI, use the new `#Preview` macro.

## 🐛 Troubleshooting

### Quick Fixes

**iOS Build Errors**

```bash
cd ios && pod install && cd ..
npm run ios
```

**Android Build Errors**

```bash
# Ensure Java 17 is used
npm run android
```

**DNS Connection Issues**

- Switch between WiFi and cellular data
- Try different DNS methods in Settings
- Check network firewall restrictions

For detailed troubleshooting, see [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md).

### SIGTERM in Xcode/Simulator during development

Seeing a backtrace ending at `UIApplicationMain` with `SIGTERM` (e.g., `mach_msg2_trap` → run loop → `UIApplicationMain`) is expected when:

- You press Stop in Xcode, or a new build reinstalls the app over the running one.
- The simulator restarts the process during install.

This is not a crash. If it’s noisy, you can instruct LLDB to not break on SIGTERM during dev:

```
(lldb) process handle SIGTERM -s false -n true -p true
```

If termination happens immediately without reinstall/stop:

- Ensure Metro is running: `npm start`
- Clean and rebuild iOS: `cd ios && pod install && cd .. && npm run ios`
- Uninstall the app from the simulator and run again
- Check device logs for errors outside of SIGTERM

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

### Inspiration

- **[@arxiv_daily](https://x.com/Arxiv_Daily/status/1952452878716805172)** - Original DNS-based LLM concept
- **[@levelsio](https://x.com/levelsio)** - Amplified the concept to wider audience
- **[ch.at](https://github.com/Deep-ai-inc/ch.at)** - Open-source DNS LLM service

### Dependencies

- **React Native Team** - Cross-platform framework
- **Expo Team** - Development platform and tooling
- **Cloudflare** - DNS-over-HTTPS infrastructure

---

**Made with ❤️ by [@mneves75](https://x.com/mneves75)**

_For support, bug reports, or feature requests, please [open an issue](https://github.com/mneves75/dnschat/issues)._
