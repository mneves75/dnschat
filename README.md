# DNSChat 🚀

A React Native mobile app that revolutionizes LLM interaction by using DNS TXT queries for AI communication. Chat with AI models through DNS infrastructure for enhanced privacy and network resilience.

[![Version](https://img.shields.io/badge/Version-2.1.2-brightgreen.svg)](https://github.com/mneves75/dnschat/releases)
[![Production Ready](https://img.shields.io/badge/Production-Ready-success.svg)](https://github.com/mneves75/dnschat)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54--preview-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![iOS](https://img.shields.io/badge/iOS-16%2B-lightgrey.svg)](https://developer.apple.com/ios/)
[![Android](https://img.shields.io/badge/Android-API%2021%2B-green.svg)](https://developer.android.com/)

## 🚨 Production Stability Update (v2.1.2)

**Critical Production Issues Resolved** - All P0 fatal bugs eliminated. The app is now production-ready with enterprise-grade stability:

- **✅ iOS Crash Protection**: Eliminated CheckedContinuation double resume crashes with atomic thread safety
- **✅ Memory Management**: Android memory leaks fixed with TTL-based cleanup and resource bounds
- **✅ DNS Protocol Compliance**: Fixed packet construction for reliable ch.at communication
- **✅ Thread Safety**: All concurrency issues resolved with proper synchronization primitives

See [CHANGELOG.md](./CHANGELOG.md) for complete technical details.

## ✨ Key Features

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

## 🛠 Tech Stack

### **Core Framework**
- **React Native 0.79** with New Architecture
- **Expo SDK 53** with Development Build
- **TypeScript** with strict mode

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

# iOS setup
cd ios && pod install && cd ..

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

## 🔧 Development

### DNS Testing
```bash
# Test DNS connectivity
node test-dns.js "Hello world"

# Run with specific DNS method
npm run ios -- --device-id "iPhone-UUID"
npm run android -- --variant debug
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

*For support, bug reports, or feature requests, please [open an issue](https://github.com/mneves75/dnschat/issues).*