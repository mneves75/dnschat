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
- Data handling and storage (AsyncStorage, SecureStore, Web preview browser storage)

**Out of scope:**
- DNS server infrastructure (`llm.pieter.com`, `ch.at`) — these are third-party services
- Issues requiring physical device access
- Denial of service against external DNS servers

## Current Security Baseline

Last full source/security sweep: `2026-06-03`.
Last iOS signed release archive/export/upload: `4.0.20` build `54`; local
release target `4.0.22` build `56` has not yet been uploaded.

- Dependency audits pass on `2026-06-04` (`bun audit` reports
  `No vulnerabilities found`).
- Secret scanning passes with `gitleaks detect --source . --redact --no-banner --config .gitleaks.toml`.
- Public-repo leak prevention uses defense in depth: local `gitleaks`,
  `bun run verify:public-redaction`, repo hygiene tests, GitHub secret scanning,
  and push protection when available.
- Xcode Debug simulator build, unsigned generic iOS Release build/archive,
  physical-device compiled-app install, signed App Store archive/export, and
  TestFlight upload are part of the release gate; the current local release
  target is `4.0.22` build `56`. Physical-device Release build/install,
  installed metadata check, and launch passed for this target on `2026-06-04`.
- TestFlight validation must report `0` errors and `0` warnings before a build
  is described as distributed. App Store version validation is not applicable
  until a matching App Store version record exists in App Store Connect; App
  Privacy publish-state still requires browser confirmation because the public
  API cannot verify it. Internal App Store Connect IDs, tester group names,
  device names, local paths, and signing identifiers are intentionally omitted
  from public docs.
- Local chat history is encrypted at rest with AES-GCM. Native builds store key
  material in SecureStore; Web preview uses same-origin browser storage for the
  local-only preview key because SecureStore is not available in browsers, so
  Web preview storage is not a secure production at-rest boundary.
- DNS prompt/response transport is observable infrastructure. Do not send
  secrets or personal data, and do not describe DNS prompts as private or
  end-to-end encrypted.

## Supported Versions

Only the latest release is actively maintained.

| Version | Supported |
|---------|-----------|
| Latest  | Yes       |
| Older   | No        |
