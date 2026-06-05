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
Last iOS signed release archive/export/upload: `4.0.23` build `57`; App Store
Connect processing returned `VALID` on `2026-06-04`.

- Dependency audits pass on `2026-06-04` (`bun audit` reports
  `No vulnerabilities found`).
- Secret scanning passes with `gitleaks detect --source . --redact --no-banner --config .gitleaks.toml`.
- Public-repo leak prevention uses defense in depth: local `gitleaks`,
  `bun run verify:public-redaction`, repo hygiene tests, GitHub secret scanning,
  and push protection when available.
- Xcode Debug simulator build, unsigned generic iOS Release build/archive,
  physical-device compiled-app install, signed App Store archive/export, and
  TestFlight upload are part of the release gate; physical-device Release
  build/install, installed metadata check, signed archive/export/upload, and
  TestFlight validation passed for `4.0.23` build `57` on `2026-06-04`.
- TestFlight validation must report `0` errors and `0` warnings before a build
  is described as distributed. Pre-submit App Store validation for `4.0.23`
  build `57` reported `0` errors, `0` warnings, and `0` blocking findings; after
  submission the App Store version is `WAITING_FOR_REVIEW`, so validation
  correctly reports that the version is no longer editable. App Privacy
  publish-state still requires browser confirmation because the public API
  cannot verify it. Internal App Store Connect IDs, tester group names, device
  names, local paths, and signing identifiers are intentionally omitted from
  public docs.
- iOS sourcemap generation is enabled for release symbolication. Source maps
  are private debugging artifacts: do not commit them, ship them inside IPA/AAB
  binaries, or publish them to public storage. Upload them only to the intended
  private crash-reporting/symbolication destination when that release lane is
  explicitly configured.
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
