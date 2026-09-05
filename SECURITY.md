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

The September 2026 audit covers native DNS parsing, encrypted-storage corruption
handling, model-output rendering, dependency/secret checks and verification
scripts. See `docs/technical/AUDIT-PLAN-2026-09.md` for scope and `MEMORY.md` for
candidate-specific validation. Historical TestFlight or hardware results must
not be represented as proof of the current source.

The release follow-up also hashes chat corruption-backup diagnostics: schema
errors can contain decrypted field values even when JSON parsing succeeds.
Encrypted and legacy malformed-schema regression cases preserve the recovery
payload and verify that the plaintext marker never appears in backup metadata.

- **Production privacy blocker:** no public provider policy covering retention,
  secondary use, deletion, or service-provider status was located after
  reviewing the default third-party DNS service's public page and web search on
  2026-08-31. The public page documents only the query interface. Until
  operator evidence is recorded,
  do not submit store privacy declarations that claim prompts remain local,
  are not shared, or are immediately discarded. The app now discloses this
  uncertainty in both locales; release runbooks use conservative draft answers.

- `decode-uri-component` GHSA-vcc3-ghjq-m6fr is fixed by a scoped `^0.5.0`
  override and a one-line pnpm patch migrating `query-string` to its default
  export. An executable Metro regression verifies the installed consumer and
  decoder together. The two `image-size` suppressions remain time-boxed
  because the registry still reports `2.0.2`
  as latest and their declared patched version is `2.0.3`. All suppressions,
  reachability arguments and recheck dates live in `pnpm-workspace.yaml`.
- Secret scanning passes with `gitleaks detect --source . --redact --no-banner --config .gitleaks.toml`.
- Public-repo leak prevention uses defense in depth: local `gitleaks`,
  `pnpm run verify:public-redaction`, repo hygiene tests, GitHub secret scanning,
  and push protection when available.
- Xcode Debug simulator build, unsigned generic iOS Release build/archive,
  physical-device compiled-app install, signed App Store archive/export, and
  TestFlight upload are part of the release gate. For `4.3.6` build `84`, each
  claim was verified independently against the final beta source.
- TestFlight validation must report `0` errors and `0` warnings before a build
  is described as distributed. App Store version validation for `4.3.6` is not
  applicable until App Store Connect has a matching App Store version record.
  Internal App Store Connect IDs, tester group names, device names, local paths,
  and signing identifiers are intentionally omitted from public docs.
- iOS sourcemap generation is enabled for release symbolication. Source maps
  are private debugging artifacts: do not commit them, ship them inside IPA/AAB
  binaries, or publish them to public storage. Upload them only to the intended
  private crash-reporting/symbolication destination when that release lane is
  explicitly configured.
- Local chat history is encrypted at rest with AES-GCM. Native builds store key
  material in SecureStore; Web preview uses same-origin browser storage for the
  local-only preview key because SecureStore is not available in browsers, so
  Web preview storage is not a secure production at-rest boundary.
- DNS prompt/response transport is observable and not authenticated end to end.
  Packet validation rejects malformed and mismatched replies, but a resolver or
  on-path actor can still observe, retain, replay, or alter a valid-looking
  query or response. Do not send secrets or personal data, treat responses as
  cryptographically verified, or describe DNS prompts as private.
- **This app fails OWASP MASVS-NETWORK-1 by design, and that is not mitigated.**
  The control requires all network traffic to follow current best practice, and
  MASVS has no accepted-risk mechanism: scope is chosen before testing, not
  waived after it. Prompts leave the device as cleartext DNS, so an audit
  against MASVS 2.1.0 should record a deliberate failure rather than a control.
  MASVS-NETWORK-2 (identity pinning) does not apply, because it covers endpoints
  under the developer's control and the resolver is third-party. RFC 9076
  section 4.2 treats the query name as revealing what the user does; here the
  query name *is* the message, which is a broader exposure than that text
  contemplates. Responses are matched on transaction id, source port and the
  echoed question, which is less than the full tuple RFC 5452 section 9.1 asks
  for, and RFC 5452 section 1 states that even the full set does not protect
  against an actor who can observe or inject packets.
- Long high-entropy labels plus TXT queries plus multipart responses to a single
  domain is the signature protective DNS resolvers and enterprise monitoring use
  to detect DNS tunneling. On a managed or filtered network the app can be
  blocked outright, and the traffic may be attributed to the user's device as
  suspicious. Treat a blocked resolver as an expected failure mode, not a defect.
- Chat history is encrypted with AES-256-GCM implemented in JavaScript
  (`@noble/ciphers`), whose own documentation notes that its table-driven AES
  leaks access timings and that constant-time behaviour is not achievable in
  JavaScript. That is accepted here because the threat model is offline access
  to device storage, not a local timing side channel. Every payload uses a fresh
  random nonce from a hard-failing CSPRNG; there is deliberately no code path
  that can produce a constant key or nonce. There is currently no key rotation
  or keyset version (OWASP MASWE-0015): a compromised key stays valid for the
  lifetime of the install, and rotating it would require re-encrypting history.
- The static marketing site uses a restrictive meta-delivered CSP. The CSP
  standard ignores `frame-ancestors` in a meta element, and the current Pages
  deployment does not set a response-header policy. The site therefore exposes
  no authentication, forms, account state, or privileged actions. Any future
  interactive surface must move behind hosting that can enforce CSP response
  headers before it ships.

## Supported Versions

Only the latest release is actively maintained.

| Version | Supported |
|---------|-----------|
| Latest  | Yes       |
| Older   | No        |
