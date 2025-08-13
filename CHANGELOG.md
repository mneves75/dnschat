# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **🔧 MAJOR: Complete Android Network Connectivity Sync**: Full synchronization of Android DNS implementation to match iOS behavior
  - **Message Sanitization Sync**: Android now applies identical message processing as iOS (spaces→dashes, lowercase, 200 char limit)
  - **Query Deduplication**: Implemented ConcurrentHashMap-based duplicate query prevention matching iOS @MainActor pattern
  - **Structured Error Handling**: Added DNSError class with same error types and message formats as iOS DNSError enum
  - **Java 17 Compatibility**: Fixed Record class conflicts with fully qualified org.xbill.DNS.Record names for Java 17 support
  - **dnsjava Integration**: Added dnsjava:3.5.1 dependency for comprehensive legacy DNS support (API < 29)
  - **API Compatibility**: Fixed DnsResolver method signature issues by removing unsupported FLAG_EMPTY parameter
  - **Build Success**: Resolved all compilation errors enabling successful Android production builds
- **🚀 Cross-Platform Consistency**: Android and iOS now have identical network connectivity behavior ensuring consistent DNS query handling

## [1.7.2] - 2025-08-13

### Fixed
- **🔥 CRITICAL: Hermes dSYM App Store Connect Upload Issue**: Permanent fix for missing Hermes debug symbols blocking App Store uploads
  - Added expo-build-properties plugin with comprehensive iOS dSYM generation settings
  - Created EAS build configuration (eas.json) with `includeDsym: true` and `archiveHermesDsym: true`
  - Implemented custom build script (ios/scripts/copy_hermes_dsym.sh) to copy Hermes dSYM files
  - Integrated Xcode build phase to automatically execute dSYM copy during Release builds
  - Addresses error: "archive did not include a dSYM for hermes.framework with UUIDs"
- **🔧 DNS Transport Robustness**: Complete overhaul of DNS transport error handling and fallback chain
  - Enhanced UDP port blocking detection (ERR_SOCKET_BAD_PORT) with clear fallback messaging
  - Improved TCP connection refused handling (ECONNREFUSED) with actionable network guidance
  - Better DNS-over-HTTPS architectural limitation explanations for ch.at compatibility
  - Comprehensive troubleshooting steps for common network restriction scenarios
- **🖼️ Metro Bundler Icon Issues**: Fixed missing app icons in onboarding and navigation
  - Resolved WelcomeScreen app icon display using proper Metro bundler asset imports
  - Fixed first tab navigation icon missing due to import statement issues
  - Fixed About screen to display proper app icon instead of search emoji

### Enhanced
- **📋 Error Messages with Actionable Guidance**: User-friendly error messages with specific troubleshooting steps
  - Network-specific guidance (WiFi ↔ cellular switching recommendations)
  - Clear port blocking detection with network administrator contact suggestions
  - Detailed 5-step troubleshooting guide for DNS connectivity failures
  - Platform-specific error categorization with fallback method explanations
- **🔍 Comprehensive Error Diagnostics**: Enhanced logging and error type detection
  - Robust error type detection across all transport methods (native, UDP, TCP, HTTPS)
  - Enhanced native DNS error messages with iOS/Android platform-specific guidance  
  - Comprehensive socket error logging with diagnostic information for debugging

### Added
- **📚 Comprehensive Documentation**: Detailed troubleshooting guides for production deployment
  - Created HERMES_DSYM_FIX.md with complete technical implementation details
  - Enhanced COMMON-ISSUES.md with App Store Connect upload troubleshooting section
  - Step-by-step verification procedures for dSYM inclusion testing

### Technical Improvements
- **🛡️ Production-Ready Error Handling**: Enterprise-grade error recovery and user guidance
- **🔧 Network Resilience**: Improved detection of corporate firewalls and public WiFi restrictions
- **📱 Cross-Platform Compatibility**: Better Metro bundler asset handling for consistent icon display
- **🚀 App Store Connect Readiness**: 4-layer comprehensive solution ensures successful production uploads

## [1.7.1] - 2025-08-13

### Fixed
- **🚨 CRITICAL: Infinite Render Loop**: Fixed critical chat screen freeze causing iOS watchdog termination (0x8BADF00D)
  - Resolved destructuring of `useSettings()` in ChatContext causing continuous re-renders
  - Fixed infinite React Native hot reload bundle rebuilds
  - Eliminated main thread blocking that triggered iOS 5-second timeout kills
  - Prevented circular dependency between SettingsContext and ChatContext
- **⚠️ MockDNSService Misuse**: Fixed inappropriate MockDNSService usage in onboarding screens
  - MockDNSService now disabled by default (users get real DNS behavior)
  - Added `enableMockDNS` setting in Settings context (default: false)  
  - Onboarding screens explicitly use real DNS methods only
  - DNS fallback chain now respects MockDNSService setting properly

### Technical Improvements
- **Performance Optimization**: Eliminated useCallback dependency issues causing infinite loops
- **Context Architecture**: Improved React Context usage patterns to prevent render cycles
- **Error Recovery**: Enhanced app stability and crash resistance

## [1.7.0] - 2025-08-13

### Added
- **🎯 Innovative Onboarding Experience**: Complete interactive onboarding flow with DNS demonstrations and feature showcases
- **⚙️ Advanced DNS Method Preferences**: Four new DNS method options for fine-grained control:
  - `Automatic`: Balanced fallback chain (default)
  - `Prefer HTTPS`: Privacy-focused with DNS-over-HTTPS first  
  - `UDP Only`: Fast direct UDP queries only
  - `Never HTTPS`: Native and UDP/TCP methods only
- **📱 Scrollable Settings Interface**: Enhanced settings screen with improved navigation and keyboard handling
- **🔄 Onboarding Reset Feature**: Developer option to reset and replay the onboarding experience
- **🏗️ Structured DNS Fallback Logic**: Completely rewritten DNS service with method-specific fallback chains

### Fixed
- **🐛 DNS Fallback Chain Compliance**: DNS method preferences now fully respected throughout entire fallback chain
- **📊 Logs Screen Text Rendering**: Fixed React Native error "Text strings must be rendered within a <Text> component"
- **⚡ DNS Service Error Handling**: Enhanced null checks and fallback values for undefined DNS log entries
- **🔧 DNS Method Selection**: Improved conditional logic for UDP-only and never-HTTPS preferences

### Changed
- **📋 Settings UI Architecture**: Migrated to radio button interface for DNS method selection
- **🎨 Visual Method Indicators**: Real-time configuration display with method-specific colors and icons
- **📡 DNS Query Parameters**: Extended DNSService.queryLLM() signature to support new method preferences
- **💾 Settings Storage**: Enhanced AsyncStorage structure to persist DNS method preferences

### Technical Improvements
- **TypeScript Enhancements**: Added DNSMethodPreference type with strict enum validation
- **Component Architecture**: Refactored Settings component with ScrollView and improved state management
- **Context Updates**: Extended SettingsContext and ChatContext for new DNS preferences
- **Error Recovery**: Robust undefined value handling in DNS logging service methods

## [1.6.1] - 2025-08-11

### Fixed
- **Settings Save Button Contrast**: Fixed save button visibility in dark mode with proper theme-aware colors
- **Settings Header Button**: Resolved React child error in navigation header settings button
- **Button Theme Adaptation**: Improved contrast ratios for better accessibility across light/dark themes

### Changed
- **UI Color Schemes**: Enhanced settings button styling with theme-appropriate background and text colors

## [1.6.0] - 2025-08-11

### Added
- **DNS Query Logging Tab**: New dedicated tab for viewing detailed DNS query logs with step-by-step method attempts
- **DNS-over-HTTPS Preference**: Toggle in Settings to prefer DNS-over-HTTPS (Cloudflare) for enhanced privacy
- **Real-time DNS Query Visualization**: Live logging of DNS method attempts, fallbacks, and response times
- **Comprehensive Logging Service**: Track all DNS queries with detailed timing and error information
- **DNS Method Statistics**: Visual indicators showing which DNS method succeeded (Native, UDP, TCP, HTTPS)

### Fixed
- **Settings Button Theme**: Settings icon now properly adapts to light/dark theme colors

### Changed
- **DNS Query Priority**: When DNS-over-HTTPS is enabled, it's tried first before native methods
- **Settings UI**: Enhanced with toggle for DNS method preference and improved configuration display

## [1.5.0] - 2025-08-08

### Added
- Complete documentation restructure with comprehensive technical guides
- Technical FAQ for quick issue resolution
- Junior Developer Guide for comprehensive onboarding
- System Architecture documentation with detailed component relationships
- Common Issues troubleshooting guide with step-by-step solutions
- Native specifications for DNS module implementation

### Changed
- Project references renamed from "chatdns" to "dnschat" for consistency
- Improved documentation organization with role-based navigation
- Enhanced technical documentation with practical examples and troubleshooting

### Documentation
- New `/docs/` folder structure with organized technical documentation
- Complete developer onboarding guide for new team members
- Comprehensive troubleshooting resources with emergency procedures
- Architecture documentation with system design decisions
- Version management guide for release procedures

## [1.0.0] - 2025-08-08

### Added
- Initial release of DNSChat - React Native mobile app for DNS-based LLM communication
- Native DNS implementation for iOS (Swift) and Android (Kotlin)  
- Modern ChatGPT-like chat interface with message bubbles
- Configurable DNS server settings with persistent storage
- Multi-layer DNS fallback: Native → UDP → TCP → HTTPS → Mock
- Dark/light theme support with automatic system preference detection
- Chat management with deletion functionality
- Cross-platform support (iOS, Android, Web)
- Comprehensive security implementation with input validation and rate limiting
- Professional documentation and installation guides

### Security
- RFC 1035 compliant DNS sanitization preventing injection attacks
- Zero security vulnerabilities in dependencies
- Production-ready with no debug logging or sensitive data exposure
- OWASP ASVS 5.0 Level 1 compliant architecture

---

*Generated with [Claude Code](https://claude.ai/code)*