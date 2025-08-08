# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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