---
description: Generate comprehensive changelog entries and GitHub release notes from git history
argument-hint: "[--since=tag] [--next-version=X.Y.Z] [--dry-run] [--verbose]"
allowed-tools: [Bash, Read, Write, Grep, Glob]
---

# Generate Comprehensive Changelog for DNSChat

You are tasked with generating a comprehensive changelog entry and GitHub release notes for the DNSChat React Native project following the latest best practices for changelog generation.

## Context & Requirements

This project follows the **Keep a Changelog** format and has specific requirements outlined in `@docs/CHANGELOG-GUIDE.md`. The changelog should be:

- **User-focused**: Write for end users, not developers
- **Impact-driven**: Analyze actual file changes to understand user impact
- **Well-categorized**: Group changes logically (Features, Bug Fixes, Performance, etc.)
- **Properly attributed**: Credit all contributors with GitHub links
- **Bot-aware**: Exclude bot contributors but include their changes

## Analysis Process

### 1. Parse Command Arguments
Extract any arguments from `$ARGUMENTS`:
- `--since=tag`: Analyze commits since this git tag (default: last tag)
- `--next-version=X.Y.Z`: Version for the new release (default: auto-increment)
- `--dry-run`: Preview only, don't modify files
- `--verbose`: Show detailed analysis

### 2. Git History Analysis
Use these commands to analyze the repository:

```bash
# Get latest git tag for default range
! git describe --tags --abbrev=0

# Get commits in range with details
! git log --format="%H|%an|%ae|%s|%ai" [SINCE_TAG]..HEAD

# For each significant commit, analyze file changes
! git show --name-only --format="" [COMMIT_HASH]
! git show --stat [COMMIT_HASH]
```

### 3. Categorization Logic

Analyze commit messages and file changes to categorize:

**Features** (🎯): New functionality
- Keywords: feat, feature, add, new, implement, create
- Files: New components, screens, services

**Improvements** (🔧): Enhancements to existing features
- Keywords: improve, enhance, update, upgrade, refactor, optimize
- Files: Existing component modifications

**Bug Fixes** (🐛): Issue resolutions
- Keywords: fix, bug, resolve, correct, patch
- Critical fixes get 🔥 prefix

**Performance** (⚡): Speed/efficiency improvements
- Keywords: perf, performance, speed, optimize, cache

**Security** (🛡️): Security-related changes
- Keywords: security, auth, permission, vulnerability, secure

**Documentation** (📚): Documentation updates
- Files: *.md, docs/, README changes

**Developer Experience** (🔧): Build, test, CI improvements
- Keywords: dev, build, test, ci, cd, lint, format
- Files: package.json, build configs, scripts

### 4. Contributor Attribution

For each change:
- Extract author email and name from git log
- Map email to GitHub username (use known mappings)
- Format as: `(via [@username](https://github.com/username))`
- **Exclude bots**: Skip any contributor matching these patterns:
  - `*[bot]` in name or email
  - `devin-ai-integration`, `blacksmith-sh`, `dependabot`, `github-actions`

### 5. First-time Contributors

Compare contributors in current range vs. all previous history:
```bash
# Get all previous contributors
! git log --format="%ae" [SINCE_TAG] | sort -u

# Get current range contributors  
! git log --format="%ae" [SINCE_TAG]..HEAD | sort -u
```

Identify new contributors (excluding bots) for special recognition.

## Output Format

### CHANGELOG.md Entry

Generate this exact format:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Features
- User-friendly description (affected areas) (via [@username](https://github.com/username))

### Improvements  
- User-friendly description (affected areas) (via [@username](https://github.com/username))

### Bug Fixes
- User-friendly description (affected areas) (via [@username](https://github.com/username))

### Performance
- User-friendly description (affected areas) (via [@username](https://github.com/username))

### Security
- User-friendly description (affected areas) (via [@username](https://github.com/username))

### Documentation
- User-friendly description (affected areas) (via [@username](https://github.com/username))

### Developer Experience
- User-friendly description (affected areas) (via [@username](https://github.com/username))

### First-time Contributors
- [@username](https://github.com/username) - Full Name
```

### GitHub Release Notes

Generate comprehensive release notes:

```markdown
## Highlights
- 🎯 Major feature one
- 🐛 Critical bug fix  
- ⚡ Performance improvement

## What's Changed
[Copy all categorized changes from CHANGELOG.md]

## First-time Contributors
- @username made their first contribution

## Installation
See [installation instructions](https://github.com/mneves75/dnschat#installation)
```

## Processing Instructions

1. **Start Analysis**: Begin by getting the git range and analyzing commits
2. **Parse Commits**: For each commit, extract message, files changed, and author details
3. **Categorize Intelligently**: Don't just rely on commit prefixes - analyze actual changes
4. **Generate Descriptions**: Convert technical commits to user-friendly descriptions
5. **Handle Attribution**: Properly credit contributors while excluding bots
6. **Create Output**: Generate both CHANGELOG.md entry and release notes

## Quality Guidelines

- **User Language**: Avoid technical jargon, focus on user impact
- **Consistency**: Use consistent formatting and emoji indicators
- **Completeness**: Don't miss any significant changes
- **Accuracy**: Ensure contributor attribution is correct
- **Readability**: Group related changes, use clear categorization

## File Handling

If not in `--dry-run` mode:
1. **Update CHANGELOG.md**: Insert new entry after the `## [Unreleased]` section
2. **Create release-notes.md**: Save GitHub release notes for easy copying
3. **Provide Next Steps**: Guide user on creating GitHub release

Begin the analysis with the provided arguments: `$ARGUMENTS`