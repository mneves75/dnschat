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
- **🔗 Deep Linking**: Support for direct message sending via `chatdns://message=<TEXT_MESSAGE>`
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
- **Query Format**: `dig @ch.at "<USER_MESSAGE>" TXT +short`
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

## 🛠️ Troubleshooting

### Android Build Issues

#### "Unsupported class file major version 68"
This error occurs when using Java 24 with Android builds. **Solution**: Use Java 17.

```bash
# Install Java 17 if not already installed
brew install openjdk@17

# Verify you have Java 17
/opt/homebrew/opt/openjdk@17/bin/java -version

# Use the updated android script (automatically uses Java 17)
npm run android
```

#### "Could not create task ':react-native-reanimated:outgoingVariants'"
This is a Gradle version compatibility issue. **Solution**: The project uses Gradle 8.10.2 for compatibility.

```bash
# Clear Gradle caches if needed
rm -rf ~/.gradle/caches && rm -rf android/.gradle && rm -rf android/build

# Try build again
npm run android
```

#### Android Build Environment
If you encounter persistent build issues, ensure you have the correct environment:

```bash
# Check current Java version (should show Java 17 when using npm run android)
java -version

# If you need to manually set Java 17 for debugging
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=/opt/homebrew/opt/openjdk@17/bin:$PATH
```

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