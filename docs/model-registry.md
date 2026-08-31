# DNSChat Model Registry

This repository does not ship or train machine learning models.

## Current Model Usage

- No embedded models are bundled with the app.
- No fine-tuned or hosted models are deployed by this repo.
- The app sends DNS queries to external servers; model behavior is owned by those servers and is out of scope for this repo.
- The default service's public page documents the DNS interface, but no public
  policy covering retention, secondary use, deletion, or service-provider
  status was located on that page or through web search as of `2026-08-31`.
  App Store and Play production submission remains blocked on
  provider evidence or an explicitly conservative disclosure approved by the
  publisher.

## Required Review Notes

If any on-device or hosted model is introduced, this file must be updated to include:
- Model name, version, and provider
- Data sources and training lineage
- Evaluation results and approval date
- Risk classification and security review references

## Review Cadence

- Reconfirm model usage status when adding new dependencies or integrating AI features.
- Last reviewed during the production security sweep on `2026-08-31`; no app-owned
  model usage was introduced.
