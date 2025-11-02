# Troubleshooting Guide

**Quick reference for common issues and their solutions**

This document serves as an entry point to troubleshooting resources for DNSChat. For detailed solutions, refer to the linked documentation.

## Quick Links

### Essential Resources

- **[Common Issues & Solutions](./troubleshooting/COMMON-ISSUES.md)** - Comprehensive guide for development and deployment issues
- **[Security Audit & Fixes](./troubleshooting/SECURITY-AUDIT.md)** - Security-related issues and hardening
- **[Hermes dSYM Fix](./troubleshooting/HERMES_DSYM_FIX.md)** - iOS symbolication issues
- **[XcodeBuildMCP Guide](./troubleshooting/XCODEBUILDMCP-GUIDE.md)** - Xcode build automation troubleshooting

### Development Resources

- **[Architecture Documentation](./architecture/SYSTEM-ARCHITECTURE.md)** - System design and component overview
- **[DNS Protocol Specification](./technical/DNS-PROTOCOL-SPEC.md)** - DNS implementation details
- **[Native Module Spec](./technical/NATIVE-SPEC.md)** - Native DNS module documentation

## Common Issues by Category

### Environment Setup

**Issue**: Command not found errors
- **Solution**: See [Environment Setup Issues](./troubleshooting/COMMON-ISSUES.md#environment-setup-issues)
- **Quick Fix**:
  ```bash
  npm install -g @expo/cli
  npm install
  npm run fix-pods  # iOS only
  ```

### iOS Build Issues

**Issue**: "sandbox permission denied" during pod install
- **Solution**: See [User Script Sandboxing](./troubleshooting/COMMON-ISSUES.md#2025-10-29-user-script-sandboxing-new-architecture-fixed)
- **Quick Fix**: `npm run fix-pods`

**Issue**: Hermes "Replace Configuration" script error
- **Solution**: See [Hermes dSYM Fix](./troubleshooting/HERMES_DSYM_FIX.md)
- **Quick Fix**: Ensure Xcode 15+ and run `npm run fix-pods`

**Issue**: Swift module incompatibility
- **Solution**: See [XcodeBuildMCP Guide](./troubleshooting/XCODEBUILDMCP-GUIDE.md)

### Android Build Issues

**Issue**: Java version mismatch
- **Solution**: See [Java/Android Issues](./troubleshooting/COMMON-ISSUES.md#javaandroid-build-issues)
- **Quick Fix**: Use `npm run android` (auto-sets Java 17)

**Issue**: Gradle sync failures
- **Solution**: Clean and rebuild
  ```bash
  cd android
  ./gradlew clean
  cd ..
  npm run android
  ```

### DNS Communication Issues

**Issue**: DNS queries failing or timing out
- **Solution**: See [DNS Communication Issues](./troubleshooting/COMMON-ISSUES.md#dns-communication-issues)
- **Diagnostic**:
  ```bash
  node test-dns-simple.js "test message"
  npm run dns:harness -- --message "diagnostic test"
  ```

**Issue**: Native DNS module not available
- **Solution**: See [Native Module Issues](./troubleshooting/COMMON-ISSUES.md#native-module-issues)
- **Quick Fix**: Rebuild native modules
  ```bash
  # iOS
  npm run fix-pods
  npm run ios

  # Android
  npm run android
  ```

### Runtime Errors

**Issue**: "Screen not handled by any navigator"
- **Solution**: See [Navigation Issues](./troubleshooting/COMMON-ISSUES.md#️-v174-screen-not-handled-by-any-navigator-error-fixed)

**Issue**: VirtualizedList warnings
- **Solution**: See [React Native Issues](./troubleshooting/COMMON-ISSUES.md#react-native-issues)

### Security Issues

**Issue**: App crashes on iOS with security errors
- **Solution**: See [Security Audit](./troubleshooting/SECURITY-AUDIT.md)
- **Critical Fixes**: Ensure version 2.0.1+ (see [v2.0.1 Security Fixes](./troubleshooting/COMMON-ISSUES.md#v201-critical-security-fixes-resolved))

**Issue**: DNS injection attempts detected
- **Solution**: Update to latest version (includes sanitization)

**Issue**: Thread exhaustion on Android
- **Solution**: See [Performance Issues](./troubleshooting/COMMON-ISSUES.md#v201-critical-security-fixes-resolved)

## Diagnostic Commands

### Quick Health Check

```bash
# Check environment
node --version          # Should be 18+
npm --version           # Should be 9+
npx expo --version      # Should be 54+

# Check project
npm run sync-versions   # Verify version alignment
git status              # Check for uncommitted changes

# Test DNS functionality
node test-dns-simple.js "health check"

# iOS specific
cd ios && pod --version && cd ..  # Should be 1.12+
xcodebuild -version              # Should be 15+

# Android specific
java -version  # Should be 17 (set via npm run android)
```

### Build Diagnostics

```bash
# iOS
npm run fix-pods
npm run ios -- --verbose

# Android
cd android && ./gradlew clean && cd ..
npm run android -- --verbose

# Expo diagnostics
npx expo-doctor
```

### DNS Diagnostics

```bash
# Quick test
node test-dns-simple.js "test"

# Comprehensive harness
npm run dns:harness -- --message "comprehensive test" --verbose

# Check native module
npm run ios  # Check logs for "Native DNS registered"
```

## When to File an Issue

Before filing an issue, please:

1. **Check [Common Issues](./troubleshooting/COMMON-ISSUES.md)** - Most problems are documented
2. **Search [existing issues](https://github.com/mneves75/dnschat/issues)** - Your issue may already be reported
3. **Run diagnostics** - Use commands above to gather info
4. **Update dependencies** - Run `npm install` and `npm run fix-pods`

When filing an issue, include:
- Platform (iOS/Android)
- OS version
- App version
- Steps to reproduce
- Full error message
- Output from diagnostic commands

Use our issue templates:
- [Bug Report](.github/ISSUE_TEMPLATE/bug_report.yml)
- [Feature Request](.github/ISSUE_TEMPLATE/feature_request.yml)

## Getting Help

### Documentation

- **[Installation Guide](./INSTALL.md)** - Setup instructions
- **[API Documentation](./API.md)** - DNS service API reference
- **[Contributing Guide](../CONTRIBUTING.md)** - Development guidelines
- **[Changelog](../CHANGELOG.md)** - Version history and fixes

### Community

- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share ideas

### Maintainers

See [MAINTAINERS.md](./MAINTAINERS.md) for maintainer-specific troubleshooting routines.

---

**Last Updated**: 2025-11-02
**Version**: 3.0.6

For immediate assistance with critical issues, check [SECURITY.md](../SECURITY.md) for security-related problems.
