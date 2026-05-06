# Security Policy

## Reporting a Vulnerability

**Preferred**: Use [GitHub Security Advisories](https://github.com/mneves75/dnschat/security/advisories/new) to report privately.

**Alternative**: Open a [GitHub issue](https://github.com/mneves75/dnschat/issues) for non-sensitive findings.

Please do not open public issues for security vulnerabilities.

## Responsible Disclosure

- We ask for a **90-day window** before public disclosure
- We will acknowledge receipt within 5 business days
- We will provide a fix timeline within 14 days of confirmation

## Scope

**In scope:**
- App source code (TypeScript, React Native)
- Native modules (`modules/dns-native/`)
- Dependency vulnerabilities
- Data handling and storage (AsyncStorage, SecureStore)

**Out of scope:**
- DNS server infrastructure (`llm.pieter.com`, `ch.at`) — these are third-party services
- Issues requiring physical device access
- Denial of service against external DNS servers

## Current Security Baseline

Last full source/security sweep: `2026-05-05`.
Last iOS CLI release smoke: `2026-05-05`.

- Dependency audits pass for the app (`bun audit`) and local native module
  (`npm audit` in `modules/dns-native`).
- Secret scanning passes with `gitleaks detect --source . --redact --no-banner --config .gitleaks.toml`.
- Xcode Debug simulator build and unsigned generic iOS Release build/archive
  pass. App Store Connect upload/submission checks still require local ASC
  credentials and signed distribution assets.
- Local chat history is encrypted at rest with AES-GCM using key material stored
  in SecureStore.
- DNS prompt/response transport is observable infrastructure. Do not send
  secrets or personal data, and do not describe DNS prompts as private or
  end-to-end encrypted.

## Supported Versions

Only the latest release is actively maintained.

| Version | Supported |
|---------|-----------|
| Latest  | Yes       |
| Older   | No        |
