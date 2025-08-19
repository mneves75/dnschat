# Security Policy

## Supported Versions

We actively support the following versions of DNSChat with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.7.x   | :white_check_mark: |
| 1.6.x   | :x:                |
| < 1.6   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in DNSChat, please report it responsibly.

### How to Report

**Please do NOT create a public GitHub issue for security vulnerabilities.**

Instead, please email us at: **[security@mvneves.org]** (or create a private security advisory through GitHub's security tab)

### What to Include

When reporting a vulnerability, please include:

- **Description**: A clear description of the vulnerability
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Impact**: What information or systems could be compromised
- **Affected Versions**: Which versions of DNSChat are affected
- **Proof of Concept**: If possible, provide a minimal proof of concept
- **Suggested Fix**: If you have ideas for how to fix the issue

### Response Timeline

- **Initial Response**: We will acknowledge receipt within 48 hours
- **Investigation**: We will investigate and validate the report within 5 business days
- **Resolution**: We aim to resolve critical vulnerabilities within 14 days
- **Disclosure**: We will coordinate responsible disclosure with the reporter

## Security Measures

DNSChat implements several security measures to protect users:

### Network Security

- **TLS/HTTPS**: All DNS-over-HTTPS queries use encrypted connections
- **DNS Validation**: Input sanitization and validation for DNS queries
- **Fallback Security**: Multi-layer DNS fallback system with security checks
- **Network Isolation**: Native DNS modules operate in sandboxed environments

### Mobile App Security

- **Deep Link Validation**: Secure handling of `dnschat://` URL schemes
- **Local Storage Encryption**: Chat data stored securely using platform encryption
- **No API Keys**: No hardcoded API keys or secrets in the application
- **Input Sanitization**: All user inputs are sanitized before DNS queries

### Platform-Specific Security

#### iOS (16.0+)
- **Network Framework**: Uses Apple's secure Network Framework for DNS queries
- **App Transport Security**: Configured ATS exceptions only for required domains
- **Keychain Integration**: Secure storage using iOS Keychain when applicable
- **iOS 26+ Liquid Glass**: Native UI components with secure sensor integration

#### Android
- **Network Security Config**: Configured network security policies
- **Scoped Storage**: Uses Android scoped storage for data persistence
- **ProGuard/R8**: Code obfuscation enabled for release builds
- **Java 17 Compatibility**: Updated to secure Java 17 runtime

### Dependencies

We regularly update dependencies to address security vulnerabilities:

- **Automated Scanning**: Dependencies are scanned for known vulnerabilities
- **Version Pinning**: Critical dependencies are pinned to secure versions
- **React Native**: Using React Native 0.79.5 with security patches
- **Expo SDK**: Using Expo 53 with latest security updates

## Security Best Practices for Contributors

### Code Review

- All code changes require review before merging
- Security-sensitive changes require additional security review
- Automated security scanning on pull requests

### Secure Development

- **Input Validation**: Always validate and sanitize user inputs
- **Error Handling**: Implement proper error handling without information leakage
- **Logging**: Avoid logging sensitive information
- **Secrets Management**: Never commit secrets, API keys, or passwords

### DNS Query Security

When working with DNS functionality:

- **Query Sanitization**: Sanitize messages before DNS queries (spaces→dashes, length limits)
- **Response Validation**: Validate DNS responses before processing
- **Timeout Handling**: Implement proper timeouts to prevent DoS
- **Rate Limiting**: Consider implementing rate limiting for DNS queries

## Known Security Considerations

### DNS Protocol Limitations

- **Plaintext UDP/TCP**: Traditional DNS queries are not encrypted
- **DNS Spoofing**: Potential for DNS response spoofing on unsecured networks
- **Message Length**: DNS queries have length limitations (200 characters)

### Mitigation Strategies

- **DNS-over-HTTPS Priority**: Option to prioritize encrypted DNS-over-HTTPS
- **Response Validation**: Multi-part response validation and integrity checks
- **Fallback Security**: Secure fallback chains with encrypted options
- **Network Detection**: Automatic detection and handling of compromised networks

## Privacy Considerations

- **Local Storage**: All chat data is stored locally on the device
- **No Telemetry**: No analytics or telemetry data is collected
- **DNS Logging**: Optional DNS query logging can be disabled in settings
- **Data Minimization**: Only necessary data is transmitted via DNS queries

## Reporting Security Issues in Dependencies

If you discover security issues in our dependencies, please:

1. Report directly to the dependency maintainer first
2. Notify us if the dependency is used in a security-sensitive context
3. Help us assess the impact on DNSChat users

## Contact

For security-related questions or concerns that are not vulnerabilities:

- **General Security Questions**: Create a GitHub Discussion
- **Documentation Issues**: Submit a pull request to improve this policy
- **Security Research**: Email [security@mvneves.org] for coordination

## Acknowledgments

We appreciate security researchers who responsibly disclose vulnerabilities. Contributors who help improve DNSChat's security will be acknowledged (with their permission) in our release notes.

---

**Last Updated**: January 2025
**Version**: 1.0