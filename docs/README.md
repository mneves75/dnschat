# DNSChat Documentation

**Complete technical documentation for DNSChat development**

Welcome to the DNSChat documentation hub. This directory contains all technical documentation, guides, and troubleshooting resources for developers working on DNSChat.

## 📁 Documentation Structure

### 🚀 Quick Start for New Developers
- **[Tech FAQ](TECH-FAQ.md)** - Complete troubleshooting guide with quick solutions
- **[Junior Developer Guide](technical/JUNIOR-DEV-GUIDE.md)** - Comprehensive onboarding for new team members

### 🏗️ Architecture & Technical Deep Dives
- **[System Architecture](architecture/SYSTEM-ARCHITECTURE.md)** - Complete architectural overview
- **[Native Specifications](technical/NATIVE-SPEC-CLAUDE.md)** - Native DNS module implementation details
- **[DNS Protocol Specification](technical/DNS-PROTOCOL-SPEC.md)** - DNS communication protocol details

### 🔧 Troubleshooting & Support
- **[Common Issues](troubleshooting/COMMON-ISSUES.md)** - Comprehensive troubleshooting guide
- **[XcodeBuildMCP Guide](troubleshooting/XCODEBUILDMCP-GUIDE.md)** - Advanced iOS build management with Claude Code's MCP tools
- **[Security Audit](troubleshooting/SECURITY-AUDIT.md)** - Security assessment and fixes

### 📖 Guides & References
- **[Quick Start Guide](guides/QUICKSTART.md)** - Fast setup for experienced developers
- **[Gemini Context](guides/GEMINI-CONTEXT.md)** - AI assistant context and conventions
- **[Version Management](guides/VERSION_MANAGEMENT.md)** - Release and versioning procedures

## 🎯 Documentation Quick Links by Role

### New Developer Joining the Team
1. Start with [Junior Developer Guide](technical/JUNIOR-DEV-GUIDE.md)
2. Review [Tech FAQ](TECH-FAQ.md) for common issues
3. Follow main [README.md](../README.md) for setup
4. Check [Common Issues](troubleshooting/COMMON-ISSUES.md) if you get stuck

### Experienced React Native Developer
1. Review [Quick Start Guide](guides/QUICKSTART.md)
2. Understand [System Architecture](architecture/SYSTEM-ARCHITECTURE.md)
3. Dive into [DNS Protocol Specification](technical/DNS-PROTOCOL-SPEC.md)

### DevOps/Infrastructure Role
1. Review [System Architecture](architecture/SYSTEM-ARCHITECTURE.md)
2. Check [Security Audit](troubleshooting/SECURITY-AUDIT.md)
3. Understand [Version Management](guides/VERSION_MANAGEMENT.md)

### QA/Testing Role
1. Use [Tech FAQ](TECH-FAQ.md) for testing environment setup
2. Review [Common Issues](troubleshooting/COMMON-ISSUES.md) for known bugs
3. Reference [Junior Developer Guide](technical/JUNIOR-DEV-GUIDE.md) for testing strategies

## 📋 Documentation Categories

### Technical Documentation (`/technical/`)
Deep technical specifications and implementation details:
- Native module architecture
- DNS protocol implementation
- System design decisions
- API specifications

### Architecture Documentation (`/architecture/`)
High-level system design and architectural decisions:
- System architecture overview
- Component relationships
- Data flow diagrams
- Design patterns used

### Troubleshooting Documentation (`/troubleshooting/`)
Problem-solving resources and debugging guides:
- Common error messages and solutions
- Platform-specific issues
- Network and connectivity problems
- Security-related issues

### Guide Documentation (`/guides/`)
Step-by-step procedures and reference materials:
- Setup procedures
- Development workflows
- Release processes
- Context and conventions

## 🚨 Emergency Resources

### Having Build Issues?
1. **🤖 Advanced Solution**: Try [XcodeBuildMCP Guide](troubleshooting/XCODEBUILDMCP-GUIDE.md) for superior iOS build diagnostics (99% success rate)
2. **Quick Fix**: Check [Tech FAQ](TECH-FAQ.md) → [Build Problems Section](TECH-FAQ.md#build--compilation-problems)
3. **Deep Dive**: Review [Common Issues](troubleshooting/COMMON-ISSUES.md) → [Build Issues](troubleshooting/COMMON-ISSUES.md#build-issues)
4. **Nuclear Option**: Follow [Emergency Procedures](troubleshooting/COMMON-ISSUES.md#emergency-procedures)

### DNS Not Working?
1. **Quick Test**: Run `node test-dns.js "test message"`
2. **Troubleshooting**: [Tech FAQ](TECH-FAQ.md) → [DNS Communication Issues](TECH-FAQ.md#dns-communication-issues)
3. **Deep Debug**: [Common Issues](troubleshooting/COMMON-ISSUES.md) → [DNS Communication](troubleshooting/COMMON-ISSUES.md#dns-communication-issues)

### App Crashing?
1. **React Native Issues**: [Tech FAQ](TECH-FAQ.md) → [React Native Specific Issues](TECH-FAQ.md#react-native-specific-issues)
2. **Native Module Problems**: [Common Issues](troubleshooting/COMMON-ISSUES.md) → [Native Module Issues](troubleshooting/COMMON-ISSUES.md#native-module-issues)

## 📚 External Resources

### React Native
- [Official React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [Expo Documentation](https://docs.expo.dev/)

### DNS & Networking
- [RFC 1035 - DNS Specification](https://tools.ietf.org/html/rfc1035)
- [DNS over HTTPS (RFC 8484)](https://tools.ietf.org/html/rfc8484)

### Platform-Specific
- [iOS Network Framework](https://developer.apple.com/documentation/network)
- [Android DnsResolver](https://developer.android.com/reference/android/net/DnsResolver)

## 🔄 Documentation Maintenance

### Contributing to Documentation
1. **Small fixes**: Direct edit and commit
2. **Major changes**: Create PR with detailed description
3. **New sections**: Follow existing structure and style
4. **Always update**: Keep `Last Updated` timestamps current

### Documentation Standards
- **Markdown Format**: Use GitHub-flavored markdown
- **Code Examples**: Include working code snippets
- **Screenshots**: Use when helpful, keep up-to-date
- **Links**: Use relative links for internal docs
- **Structure**: Follow established folder organization

### Review Schedule
- **Monthly**: Review for outdated information
- **After releases**: Update version-specific content
- **After major changes**: Update architecture docs
- **Quarterly**: Full documentation audit

## 📞 Getting Help

### Documentation Feedback
- **Missing information**: Create GitHub issue with "documentation" label
- **Incorrect information**: Create PR with correction
- **Unclear sections**: Ask in team chat for clarification

### Technical Support Escalation
1. **Self-service**: Use documentation resources above
2. **Team discussion**: Quick questions in team chat
3. **Senior developer**: Complex architectural questions
4. **External resources**: GitHub issues for bugs, Stack Overflow for general questions

---

## 🏷️ Document Status

| Document | Status | Last Updated | Maintainer |
|----------|--------|--------------|------------|
| Tech FAQ | ✅ Current | v1.7.2 | Team |
| Junior Dev Guide | ✅ Current | v1.7.2 | Team |
| System Architecture | ✅ Current | v1.7.2 | Team |
| Common Issues | ✅ Current | v1.7.5 | Team |
| XcodeBuildMCP Guide | ✅ Current | v1.7.5 | Team |
| Native Specs | ✅ Current | v1.7.2 | Team |
| App Store Assets | ✅ Current | v1.7.2 | Team |

---

**Welcome to DNSChat development!** 🚀

Start with the documentation that matches your role and experience level. When in doubt, begin with the [Tech FAQ](TECH-FAQ.md) - it covers 90% of common issues you might encounter.

---

**Documentation Version**: v1.7.5  
**Last Updated**: Advanced XcodeBuildMCP Integration & Navigation Fixes  
**Maintainers**: DNSChat Development Team