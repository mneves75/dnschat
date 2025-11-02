# Maintainer Guide

This document provides essential information for repository maintainers.

## Security & Hygiene Routines

### Weekly Tasks

- Review Dependabot PRs for security updates
- Check CodeQL scan results
- Monitor OpenSSF Scorecard trends

### Monthly Tasks

- Review and update documentation for accuracy
- Check external links in docs (run `python3 scripts/check_links.py`)
- Scan for secrets in new code (run `python3 scripts/scan_secrets.py`)
- Review and close stale issues/PRs

### Before Each Release

1. **Version Management**
   ```bash
   npm run sync-versions
   ```

2. **Documentation**
   - Update CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/)
   - Verify README.md reflects current features
   - Check all links in documentation

3. **Security**
   - Run secret scanner: `python3 scripts/scan_secrets.py`
   - Review security audit: `docs/troubleshooting/SECURITY-AUDIT.md`
   - Ensure no credentials in code

4. **Testing**
   ```bash
   # iOS
   npm run ios

   # Android
   npm run android

   # DNS functionality
   node test-dns-simple.js "test message"
   npm run dns:harness -- --message "harness test"
   ```

5. **SBOM Generation**
   - SBOM is auto-generated via GitHub Actions
   - Manually: `npx @cyclonedx/cyclonedx-npm --output-file sbom.json`

## Branch Protection (Recommended Settings)

Configure these settings for the `main` branch:

### Required Settings

- [x] Require pull request reviews before merging
  - Required approving reviews: 1
  - Dismiss stale reviews when new commits are pushed
- [x] Require status checks to pass before merging
  - Required checks: CodeQL, tests (if implemented)
  - Require branches to be up to date
- [x] Require conversation resolution before merging
- [x] Require linear history
- [x] Do not allow bypassing the above settings

### Optional but Recommended

- [ ] Require signed commits (if team uses GPG)
- [ ] Require deployments to succeed (if applicable)
- [ ] Lock branch (for critical security patches)

### Configuration Steps

1. Go to repository **Settings** → **Branches**
2. Click **Add rule** for branch name pattern: `main`
3. Enable settings listed above
4. Click **Create** or **Save changes**

## Secret Rotation

If a secret is detected in the repository:

### Immediate Actions

1. **Revoke/Rotate** the secret at the provider (AWS, GitHub, etc.)
2. **Remove from HEAD**
   ```bash
   # Remove file containing secret
   git rm path/to/file
   git commit -m "security: remove exposed credentials"

   # Or edit file to remove secret
   git commit -m "security: remove exposed credentials from <file>"
   ```

3. **Notify team** via security incident process

### Historical Cleanup (ONLY IF APPROVED)

**⚠️ WARNING**: Rewriting history is destructive. Get team approval first.

1. **Backup repository**
   ```bash
   git clone --mirror <repo-url> backup-repo.git
   ```

2. **Use git-filter-repo** (preferred) or BFG Repo-Cleaner
   ```bash
   # Install git-filter-repo
   pip3 install git-filter-repo

   # Remove sensitive file from all history
   git filter-repo --path path/to/secret-file --invert-paths

   # Or remove text pattern
   git filter-repo --replace-text <(echo "SECRET_KEY==>REDACTED")
   ```

3. **Force push with coordination**
   ```bash
   # Notify all contributors BEFORE this step
   git push --force-with-lease --all
   git push --force-with-lease --tags
   ```

4. **Document incident** in `docs/troubleshooting/SECURITY-AUDIT.md`

## Link Maintenance

Run link checker regularly:

```bash
python3 scripts/check_links.py
```

Review `reports/docs/broken_links.json` and fix broken internal links.

External links may need manual verification:
```bash
# Review external links
cat reports/docs/external_links.json
```

## Documentation Updates

### Broken Links Found

Current broken links (as of last audit):
- `docs/TROUBLESHOOTING.md` - Referenced but doesn't exist
- `docs/API.md` - Referenced but doesn't exist

These should either be:
1. Created with appropriate content, or
2. References removed from README.md, CONTRIBUTING.md, INSTALL.md

### Documentation Structure

Follow Diátaxis framework:
- **Tutorials**: Learning-oriented (getting started guides)
- **How-to Guides**: Problem-oriented (troubleshooting, recipes)
- **Reference**: Information-oriented (API, specs, ADRs)
- **Explanation**: Understanding-oriented (architecture, concepts)

Current inventory: `reports/docs/inventory.csv`

## Conventional Commits

Enforce commit message format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**: feat, fix, docs, style, refactor, test, chore, security

**Examples**:
```
feat(ios): add Liquid Glass bubble design
fix(android): resolve DNS timeout on API 29+
docs: update installation instructions
security: rotate exposed API key
```

## ADR (Architecture Decision Records)

For significant technical decisions:

1. Create file: `docs/architecture/ADR-NNN-title.md`
2. Use template:
   ```markdown
   # ADR-NNN: Title

   ## Status
   Proposed | Accepted | Deprecated | Superseded

   ## Context
   What is the issue we're facing?

   ## Decision
   What did we decide?

   ## Consequences
   What are the impacts?
   ```

3. Number sequentially (check existing ADRs)
4. Reference in related code/docs

## Contact & Escalation

- **Security Issues**: See SECURITY.md
- **Code of Conduct Violations**: See CODE_OF_CONDUCT.md
- **General Questions**: Open a GitHub Discussion or Issue

## Tools & Scripts

Located in `scripts/`:
- `inventory_docs.py` - Document inventory with Diátaxis classification
- `check_links.py` - Link checker for all documentation
- `scan_secrets.py` - Secret pattern scanner

Reports generated in `reports/`:
- `docs/inventory.csv` - Full doc inventory
- `docs/broken_links.json` - Broken internal links
- `docs/external_links.json` - External links for review
- `secrets/scan_results.json` - Secret scan results (masked)
