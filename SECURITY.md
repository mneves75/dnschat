# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 3.0.x   | :white_check_mark: |
| < 3.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please follow responsible disclosure practices:

1. **DO NOT** open a public issue
2. Email security details to the maintainers (see repository contacts)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 5 business days
- **Fix Timeline**: Depends on severity
  - Critical: 7 days
  - High: 14 days
  - Medium: 30 days
  - Low: Next regular release

## Security Measures

This project implements:

- **Dependency Scanning**: Automated via Dependabot
- **Code Scanning**: CodeQL analysis on every push
- **Secret Scanning**: GitHub secret scanning enabled
- **OpenSSF Scorecard**: Regular security posture assessment
- **SBOM Generation**: Software Bill of Materials for all releases

## Security Best Practices

When contributing:

- Never commit secrets, API keys, or credentials
- Use environment variables for sensitive configuration
- Follow secure coding guidelines
- Keep dependencies up to date
- Review `docs/troubleshooting/SECURITY-AUDIT.md` for detailed security guidance

## Known Security Considerations

### DNS Protocol

- DNS queries are sent in plaintext (protocol limitation)
- Do not transmit sensitive information via DNS
- Rate limiting is implemented to prevent abuse
- See `docs/technical/DNS-PROTOCOL-SPEC.md` for protocol details

### Mobile Security

- iOS: User Script Sandboxing disabled for New Architecture compatibility (see `docs/architecture/ADR-001-ios-user-script-sandboxing.md`)
- Android: Minimum SDK 21+ ensures modern security features
- Both platforms: No external network requests outside DNS queries

## Contact

For security-related questions: Check repository settings for security contact information
