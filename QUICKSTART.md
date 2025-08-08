# DNSChat Quick Start Guide

**Get up and running with DNSChat in 5 minutes! 🚀**

## Inspiration and Acknowledgements

- Refer to [Arxiv Daily's tweet](https://x.com/Arxiv_Daily/status/1952452878716805172) showcasing DNS as a transport for LLM chat via `dig`.
- Project concept aligns with [ch.at – Universal Basic Intelligence](https://github.com/Deep-ai-inc/ch.at), which supports `dig @ch.at "..." TXT` queries.

## ⚡ Prerequisites (2 minutes)

```bash
# Install required tools
node --version  # Need v18.0.0+
npm --version   # Need v9.0.0+

# macOS only (for iOS)
xcode-select -p  # Need Xcode installed
pod --version    # Need CocoaPods
```

## 🚀 Installation (3 minutes)

```bash
# 1. Clone and enter directory
git clone https://github.com/mneves75/dnschat.git
cd dnschat

# 2. Install dependencies
npm install

# 3. iOS setup (macOS only)
cd ios && pod install && cd ..

# 4. Test DNS (verify connectivity)
node test-dns.js "Hello world"
# Expected: ✅ DNS query successful!
```

## 📱 Run the App

Choose your platform:

```bash
# Start development server (always run first)
npm start

# Then in another terminal:
npm run ios              # iOS simulator
npm run android          # Android emulator
npm run android:java17   # Android with Java 17
npm run web              # Web browser
```

## ✅ Verify Native DNS

**Look for these logs in the console:**

```
🔍 Attempting native DNS query...
✅ Native DNS available, querying via platform API
🌐 Querying ch.at with message: "Hi"
📥 Raw TXT records received: ["Hello! How can I assist..."]
🎉 Native DNS query successful
```

## 🛠️ Quick Fixes

**App won't build?**
```bash
# Universal reset
rm -rf node_modules && npm install
cd ios && pod install && cd ..  # iOS only
```

**Native DNS not working?**
```bash
# iOS: Reinstall pods
cd ios && pod deintegrate && pod install && cd ..

# Android: Use Java 17
npm run android:java17
```

**Network blocked?**
- App automatically falls back to TCP → HTTPS → Mock
- This is normal on corporate/public Wi-Fi
- No action needed!

## 🎯 What You Get

- **ChatGPT-like interface** with AI responses via DNS
- **Native DNS** on iOS/Android for optimal performance  
- **Automatic fallbacks** work on any network
- **Chat management** with delete functionality
- **Dark/light themes** that follow system preferences

## 📚 Need More Help?

- **Detailed setup**: [INSTALL.md](./INSTALL.md)
- **Development guide**: [CLAUDE.md](./CLAUDE.md)  
- **Issues**: [GitHub Issues](https://github.com/mneves75/dnschat/issues)

---

**🎉 That's it! You now have a fully functional DNS-powered AI chat app!**

Try asking: *"What's the weather like?"* or *"Tell me a joke"*