# DNSChat v1.0.0 🚀

**Production Ready - Secure Initial Release**

A React Native mobile application that provides a modern, ChatGPT-like chat interface using DNS TXT queries to communicate with an LLM. **Now with fully functional native DNS implementation, configurable server settings, and critical VirtualizedList bug fixes!**

## 💡  Inspiration and Acknowledgements

- Inspired by research and community discussion such as  [@levelsio's tweet](https://x.com/levelsio/status/1953063231347458220) and [Arxiv Daily's tweet](https://x.com/Arxiv_Daily/status/1952452878716805172), highlighting DNS-based access to LLMs.
- Acknowledges the open-source project [ch.at – Universal Basic Intelligence](https://github.com/Deep-ai-inc/ch.at), which exposes a lightweight chat service over HTTP/SSH/DNS and demonstrates `dig @ch.at "..." TXT` usage.


## ✨ Features

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
- **🔗 Deep Linking**: Support for direct message sending via `dnschat://message=<TEXT_MESSAGE>`
- **🛡️ Network Resilience**: Multi-layer fallback strategy with DNS-over-TCP for UDP-blocked networks
- **🎨 Custom App Icon**: Professional DNS-themed icon with network/chat visual identity
- **⚡ Performance Enhancement**: Native KeyboardAvoidingView for optimal keyboard handling without component conflicts

## Tech Stack

- **Framework**: React Native with Expo (v53)
- **Language**: TypeScript with strict mode
- **Navigation**: React Navigation v7 (Native Stack + Bottom Tabs)
- **Development**: Expo Development Build with Continuous Native Generation
- **DNS Communication**: Native platform APIs + comprehensive fallback chain
  - **iOS**: Network Framework (`nw_resolver_t`)
  - **Android**: DnsResolver API + dnsjava
  - **Fallbacks**: UDP sockets → DNS-over-HTTPS → Mock service

## Architecture

DNSChat uses a layered architecture with platform-native DNS implementations and comprehensive fallback strategies.

**📚 For complete technical details, see [docs/architecture/SYSTEM-ARCHITECTURE.md](docs/architecture/SYSTEM-ARCHITECTURE.md)**

### Key Components
- **DNS Communication**: Native iOS/Android modules with UDP/TCP/HTTPS fallbacks
- **State Management**: React Context with AsyncStorage persistence  
- **Navigation**: React Navigation v7 with deep linking support
- **UI**: Modern chat interface with dark/light theme support

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** (macOS) or **Android emulator**
- **Android**: Java 17 (OpenJDK) - `brew install openjdk@17` ⚠️ **Required for builds**
- **iOS**: Xcode 14+ with iOS 16.4+ SDK
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
npm run android          # Android (uses Java 17 automatically) 
npm run android:java24   # Android with system Java (may fail)
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
4. **Reset**: "Reset to Default" returns to `ch.at`

**📖 For detailed installation instructions, see [INSTALL.md](./INSTALL.md)**

## Development

### Project Structure
```
src/
├── components/          # Reusable UI components  
├── services/           # DNS communication & storage
├── navigation/         # App navigation & screens
└── context/           # Global state management
```

### Quick Testing
```bash
# Test DNS connectivity
node test-dns.js "Hello world"

# Run the app
npm run ios      # iOS with native DNS
npm run android  # Android with native DNS
```

**📚 For detailed development guides, see [docs/technical/JUNIOR-DEV-GUIDE.md](docs/technical/JUNIOR-DEV-GUIDE.md)**

## 🛠️ Troubleshooting

### Common Issues Quick Fix

| Problem | Quick Solution | Detailed Guide |
|---------|---------------|----------------|
| Build fails | Use Java 17: `npm run android` | [Tech FAQ](docs/TECH-FAQ.md) |
| "expo: command not found" | `npm install -g @expo/cli` | [Setup Issues](docs/troubleshooting/COMMON-ISSUES.md#environment-setup-issues) |
| Native DNS not working | `cd ios && pod install && cd ..` | [Native Module Issues](docs/troubleshooting/COMMON-ISSUES.md#native-module-issues) |
| DNS queries failing | Test: `node test-dns.js "test"` | [DNS Issues](docs/troubleshooting/COMMON-ISSUES.md#dns-communication-issues) |

**📚 Complete troubleshooting resources:**
- **[Tech FAQ](docs/TECH-FAQ.md)** - Quick solutions for 90% of issues
- **[Common Issues Guide](docs/troubleshooting/COMMON-ISSUES.md)** - Comprehensive troubleshooting
- **[Junior Developer Guide](docs/technical/JUNIOR-DEV-GUIDE.md)** - Setup and development help

## Features & Configuration

### Deep Linking
- **URL Scheme**: `dnschat://message=<TEXT_MESSAGE>` for direct message sending
- **Theme Support**: Automatic dark/light mode based on system preferences  
- **Cross-Platform**: iOS, Android, and Web with platform-specific optimizations

**📚 For detailed configuration options, see [docs/technical/](docs/technical/)**

## Documentation

### 📚 Complete Technical Documentation
- **[docs/README.md](docs/README.md)** - Documentation hub and navigation
- **[Tech FAQ](docs/TECH-FAQ.md)** - Quick solutions for common issues
- **[Installation Guide](INSTALL.md)** - Detailed setup instructions
- **[Troubleshooting](docs/troubleshooting/)** - Problem-solving resources
- **[Architecture](docs/architecture/)** - System design and technical deep-dives
- **[Developer Guides](docs/technical/)** - Onboarding and development help

### External Resources
- [React Native Docs](https://reactnative.dev/) | [Expo Docs](https://docs.expo.dev/) | [React Navigation](https://reactnavigation.org/)

## Important Notes

- **Requires Development Build**: Cannot run with Expo Go (uses native modules)
- **Java 17 Required**: For Android builds (automatic with `npm run android`)
- **Native DNS**: Custom iOS/Android implementations for optimal performance

## License

MIT