# DNSChat 🚀

A React Native mobile app that revolutionizes LLM interaction by using DNS TXT queries for AI communication. Chat with AI models through DNS infrastructure for enhanced privacy and network resilience.

the app has to have 

- 3 tabs: Messages, Logs, About
- Screens: messages list, message detail, logs, log detail, about, settings
- Onboarding explaining the app and its features.
- 

[![React Native](https://img.shields.io/badge/React%20Native-0.81.1-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54%20Preview-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![iOS](https://img.shields.io/badge/iOS-16%2B-lightgrey.svg)](https://developer.apple.com/ios/)
[![Android](https://img.shields.io/badge/Android-API%2021%2B-green.svg)](https://developer.android.com/)

## ✨ Key Features

- **🔒 Production-Hardened Security**: DNS injection protection, input validation, and server whitelisting (v2.0.1)
- **🌟 iOS 26+ Liquid Glass**: Native UIGlassEffect with environmental adaptation and comprehensive fallbacks
- **🌐 DNS-Based AI Chat**: Revolutionary LLM communication via DNS TXT queries
- **📱 Cross-Platform**: Native iOS, Android, and Web support with platform-specific optimizations
- **🚀 Native DNS Implementation**: Platform-optimized iOS Network Framework and Android DnsResolver
- **💾 Local Storage**: Persistent conversation history with local sqlite if possible
- **⚙️ Advanced DNS Service Config**: DNS service : ch.at as default
- **📊 Real-Time Logging**: Comprehensive DNS query monitoring and debugging
- **🔗 Deep Linking**: Direct message sending via custom URL schemes
- **✅ Enterprise-Grade Stability**: Thread-safe operations, proper resource management, no memory leaks


### **DNS Implementation**

- **iOS**: Swift + Apple Network Framework
- **Android**: Java + DnsResolver API + dnsjava fallback

## 🏗 Architecture

### DNS Communication Flow

```
User Message → DNS Service → Native DNS Module → ch.at Server → LLM → Response
```

## 🔐 Security & Stability (v2.0.1+)

### Critical Issues For Verification

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

- Monitor rate limits to prevent abuse
- Review logs regularly for suspicious activity

### DNS Transports & Troubleshooting

- UDP/TCP: Primary transports. Some networks block port 53; the app logs fallbacks and will try TCP where possible.
- Backgrounding: Queries suspend while the app is backgrounded; errors will mention suspension.
- Rate limiting: Per-minute throttling prevents spam; errors indicate when to retry.

## 🙏 Acknowledgments

### Inspiration

- **[@arxiv_daily](https://x.com/Arxiv_Daily/status/1952452878716805172)** - Original DNS-based LLM concept
- **[ch.at](https://github.com/Deep-ai-inc/ch.at)** - Open-source DNS LLM service
- For DNS s
- **[@levelsio](https://x.com/levelsio)** - Amplified the concept to wider audience


**Made with ❤️ by [@mneves75](https://x.com/mneves75)**
_For support, bug reports, or feature requests, please [open an issue](https://github.com/mneves75/dnschat/issues)._
