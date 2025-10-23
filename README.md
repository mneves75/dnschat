# DNSChat 🚀

A React Native mobile app that revolutionizes LLM interaction by using DNS TXT queries for AI communication. Chat with AI models through DNS infrastructure for enhanced privacy and network resilience.

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0.19-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![iOS](https://img.shields.io/badge/iOS-16%2B-lightgrey.svg)](https://developer.apple.com/ios/)
[![Android](https://img.shields.io/badge/Android-API%2021%2B-green.svg)](https://developer.android.com/)

## ✨ Key Features

- **🔒 Production-Hardened Security**: DNS injection protection, input validation, and server whitelisting (v2.0.1)
- **🌟 iOS 26+ Liquid Glass**: Native UIGlassEffect with environmental adaptation and comprehensive fallbacks
- **🌐 DNS-Based AI Chat**: Revolutionary LLM communication via DNS TXT queries
- **📱 Cross-Platform**: Native iOS, Android, and Web support with platform-specific optimizations
- **⚡ Native Bottom Tabs**: react-native-bottom-tabs with UITabBarController/BottomNavigationView primitives
- **🚀 Native DNS Implementation**: Platform-optimized iOS Network Framework and Android DnsResolver
- **🔄 Multi-Layer Fallback**: UDP → TCP → DNS-over-HTTPS → Mock service
- **💾 Local Storage**: Persistent conversation history with AsyncStorage
- **🎨 Modern Glass UI**: iOS 26 Liquid Glass design system with sensor-aware adaptation
- **⚙️ Advanced DNS Config**: Multiple DNS service options (ch.at, llm.pieter.com)
- **📊 Real-Time Logging**: Comprehensive DNS query monitoring and debugging
- **🔗 Deep Linking**: Direct message sending via custom URL schemes
- **✅ Enterprise-Grade Stability**: Thread-safe operations, proper resource management, no memory leaks

## 🛠 Tech Stack

### **Core Framework**

- **React Native 0.81.1** (SDK 54 preview compatible)
- **Expo SDK 54 (preview)** with Development Build
- **TypeScript** (strict mode)

### **Navigation & UI**

- **React Navigation v7** (Native Stack) + **react-native-bottom-tabs** (Native UITabBarController)
- **iOS 26+ Liquid Glass**: Native `.glassEffect()` modifier with comprehensive fallback system
- **React Native Safe Area Context** with gesture handler support
- **Advanced Theme Support** (automatic light/dark switching with iOS system colors)

### **DNS Implementation**

- **iOS**: Swift + Apple Network Framework
- **Android**: Java + DnsResolver API + dnsjava fallback
- **Fallback**: DNS-over-HTTPS (Cloudflare)

### **Storage & State**

- **AsyncStorage** for local persistence
- **React Context** for global state management

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

# Web
# Web preview defaults to Mock DNS (DoH can’t reach ch.at custom TXT).
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
├── navigation/         # Navigation configuration
├── screens/           # Screen components
├── services/          # DNS and storage services
└── types/             # TypeScript definitions

ios/DNSNative/         # iOS native DNS module
modules/dns-native/    # Android native DNS module
```

## 🔐 Security & Stability (v2.0.1+)

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
# Quick DNS smoke test (no React Native runtime required)
node test-dns-simple.js "test message"

# Comprehensive DNS harness test (UDP/TCP transports)
npm run dns:harness -- --message "test message"

# With debugging output
npm run dns:harness -- --message "test" --json-out harness-output.json --raw-out raw-dns.bin

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
