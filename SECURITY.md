# Security Policy

## Reporting a Vulnerability

**Preferred**: Use this repository's GitHub Security Advisories page to report privately.

**Alternative**: Open a GitHub issue in this repository for non-sensitive findings.

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

Last full source/security sweep: `2026-05-14`.
Last iOS CLI release smoke: `2026-05-14`.

- Dependency audits pass for the app (`bun audit`) and local native module
  (`npm audit` in `modules/dns-native`).
- Secret scanning passes with `gitleaks detect --source . --redact --no-banner --config .gitleaks.toml`.
- Public-repo leak prevention uses defense in depth: local `gitleaks`,
  `bun run verify:public-redaction`, repo hygiene tests, GitHub secret scanning,
  and push protection when available.
- Xcode Debug simulator build, unsigned generic iOS Release build/archive,
  physical-device compiled-app install, signed App Store archive/export, and
  TestFlight upload all pass; the latest signed TestFlight evidence is
  `4.0.11` build `40`.
- The TestFlight build is `VALID`, encryption is `exempt`, and
  `asc validate testflight` reports `0` errors and `0` warnings. App Store
  version validation also reports `0` errors and `0` warnings, with App Privacy
  publish-state still requiring browser confirmation because the public API
  cannot verify it. Internal App Store Connect IDs, tester group names, device
  names, local paths, and signing identifiers are intentionally omitted from
  public docs.
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
