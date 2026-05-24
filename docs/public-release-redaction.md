# Public Release Redaction Policy

DNSChat is a public repository. Public docs must be useful for contributors
without exposing personal, machine-local, or account-internal release evidence.

## Public Docs

Public docs may include:

- Product behavior, architecture, and user-facing release notes.
- Public commands with placeholders for account-specific values.
- Public version and build numbers.
- Public bundle/package identifiers when they are required to build or publish
  the app.
- Validation outcomes, such as "TestFlight upload passed" or "`0` warnings".

Public docs must not include:

- Local host paths, especially `/Users/<real-user>/...`.
- Personal device names or device identifiers.
- Apple Developer team IDs, certificate IDs, profile names, or profile UUIDs.
- App Store Connect internal UUIDs.
- Private TestFlight group names.
- Personal maintainer names, personal social links, or personal funding links
  unless explicitly approved as project branding.
- Certificates, private keys, `.p12` files, provisioning profiles, App Store
  Connect API keys, Android keystores, or other signing assets.

Use placeholders such as `<APP_ID>`, `<BUNDLE_ID>`, `<TEAM_ID>`,
`<DEVICE_ID>`, `<GROUPS>`, `<REPOSITORY_URL>`, and `<PRIVACY_POLICY_URL>`.

## Private Release Evidence

Exact release evidence belongs outside git in private operator notes. Private
notes may include the exact device, local artifact paths, App Store Connect IDs,
tester group names, signing-profile names, and certificate identifiers needed to
reproduce or audit a release.

Do not copy private release evidence back into `README.md`, `CHANGELOG.md`,
`SECURITY.md`, `AGENTS.md`, `CLAUDE.md`, `docs/`, `.github/`, or user-facing app
copy.

## Required Gates

Before committing release docs, run:

```bash
bun run verify:public-redaction
gitleaks detect --source . --redact --no-banner --config .gitleaks.toml
```

`verify:public-redaction` catches project-specific identifiers that generic
secret scanners may not classify as secrets. `gitleaks` catches common token and
credential patterns. Both gates are required because neither fully replaces the
other.

GitHub secret scanning and push protection should stay enabled for the public
repository when the repository settings allow it. GitHub's push protection can
block supported secrets before they land, but project-specific identifiers still
need this repo-local redaction gate.
