# DNSChat v1.7.4 Release Notes

## Highlights
- 🤖 Complete automated version sync system across all platforms
- 📱 Native DNS first priority with universal landscape support  
- 🛡️ App Store security hardening and comprehensive screenshot toolkit

## What's Changed

### Features
- **🤖 Automated Version Sync System**: Complete multi-platform version synchronization automation (via [@conhecendocontato](https://github.com/conhecendocontato))
  - Automated script to sync versions across package.json, app.json, iOS, and Android projects
  - Source of truth from CHANGELOG.md with automatic build number increments
  - Dry-run support for safe preview before applying changes
- **📱 Native DNS First Priority**: Default prioritization of platform-native DNS implementations merged into main (via [@conhecendocontato](https://github.com/conhecendocontato))
  - Enhanced fallback chain with native methods prioritized for optimal performance
  - Universal landscape support for all platforms (iOS, Android, Web)
- **📸 Comprehensive App Store Assets**: Complete screenshot conversion and App Store preparation toolkit (via [@conhecendocontato](https://github.com/conhecendocontato))
  - Automated screenshot conversion tools for iPhone, iPad, and macOS App Store formats
  - Professional App Store screenshots covering all major screen sizes and orientations
  - TestFlight and App Store Connect documentation with deployment guides

### Improvements
- **🔧 Enhanced Android Network Connectivity**: Complete synchronization with iOS DNS implementation (via [@marcusneves](https://github.com/marcusneves) & [@conhecendocontato](https://github.com/conhecendocontato))
  - Message sanitization matching iOS behavior (spaces→dashes, lowercase, 200 char limit)
  - Query deduplication with ConcurrentHashMap implementation
  - Structured error handling with DNSError class matching iOS patterns
- **📚 Comprehensive Documentation Updates**: Enhanced technical documentation and changelog management (via [@conhecendocontato](https://github.com/conhecendocontato))
  - Updated CLAUDE.md with Android network sync completion details
  - Enhanced Hermes dSYM fix documentation for App Store Connect uploads
  - Version 1.7.2 and 1.7.3 documentation consolidation

### Bug Fixes
- **🔥 CRITICAL: Hermes dSYM App Store Connect Fix**: Permanent solution for missing debug symbols blocking uploads (via [@conhecendocontato](https://github.com/conhecendocontato))
  - expo-build-properties plugin with comprehensive iOS dSYM generation
  - Custom build script for automatic Hermes dSYM copying during Release builds
  - EAS build configuration with includeDsym and archiveHermesDsym enabled
- **🔧 Android Java 17 Compatibility**: Complete dnsjava integration and build system fixes (via [@conhecendocontato](https://github.com/conhecendocontato))
  - Fixed Record class conflicts with fully qualified org.xbill.DNS.Record names
  - Added dnsjava:3.5.1 dependency for comprehensive legacy DNS support
  - Resolved DnsResolver API compatibility issues for modern Android builds
- **🌐 Enhanced DNS Transport Debugging**: Comprehensive error detection and user guidance (via [@conhecendocontato](https://github.com/conhecendocontato))
  - Enhanced TCP error debugging with undefined error detection
  - Improved native DNS debugging with comprehensive diagnostics
  - Better error messages with specific diagnostics and actionable guidance

### Developer Experience
- **⚙️ iOS Project Configuration**: Updated build settings and version management for v1.7.2+ (via [@conhecendocontato](https://github.com/conhecendocontato))
- **🔄 Feature Branch Integration**: Seamless merge of native-dns-default-landscape-support features (via [@conhecendocontato](https://github.com/conhecendocontato))
- **📋 Enhanced Innovative Onboarding**: Complete onboarding flow improvements and user experience enhancements (via [@marcusneves](https://github.com/marcusneves))

### Security
- **🛡️ App Store Security Hardening**: Enhanced security measures for production App Store deployment (via [@conhecendocontato](https://github.com/conhecendocontato))
  - Comprehensive security review and hardening for App Store Connect compliance
  - Production-ready security configurations across all platforms

## Installation
See [installation instructions](https://github.com/mneves75/dnschat#installation)