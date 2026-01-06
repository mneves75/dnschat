# DNSChat Model Registry

This repository does not ship or train machine learning models.

## Current Model Usage

- No embedded models are bundled with the app.
- No fine-tuned or hosted models are deployed by this repo.
- The app sends DNS queries to external servers; model behavior is owned by those servers and is out of scope for this repo.

## Required Review Notes

If any on-device or hosted model is introduced, this file must be updated to include:
- Model name, version, and provider
- Data sources and training lineage
- Evaluation results and approval date
- Risk classification and security review references

## Review Cadence

- Reconfirm model usage status when adding new dependencies or integrating AI features.
