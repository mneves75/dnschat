# Pull Request Gating Setup Guide

**Phase 4.4**
**Date:** 2025-10-03
**Status:** ✅ **DOCUMENTED** (requires GitHub admin access to apply)

---

## Overview

This document provides step-by-step instructions for configuring GitHub branch protection rules to enforce CI/e2e test passage before allowing PR merges.

**Goals:**
- Block merges if linting/type-checking fails
- Block merges if iOS or Android e2e tests fail
- Require branches to be up-to-date with base branch
- Allow emergency bypasses for repository admins

---

## Required Status Checks

The following GitHub Actions jobs must pass before merging:

| Check Name | Workflow | Description | Avg Duration |
|------------|----------|-------------|--------------|
| `lint-and-typecheck` | `ci.yml` | ESLint + TypeScript type-check | 5-10 min |
| `e2e-ios` | `e2e-tests.yml` | iOS Simulator e2e tests (6 suites) | 15-25 min |
| `e2e-android` | `e2e-tests.yml` | Android Emulator e2e tests (6 suites) | 20-30 min |
| `e2e-summary` | `e2e-tests.yml` | Aggregate pass/fail summary | <1 min |

**Total Pipeline Duration:** ~40-60 minutes (jobs run in parallel)

---

## Configuration Steps

### 1. Navigate to Branch Protection Settings

1. Go to GitHub repository: `https://github.com/mneves75/dnschat`
2. Click **Settings** (requires admin access)
3. Sidebar → **Branches**
4. Click **Add branch protection rule**

### 2. Configure Protection Rule for `main`

**Branch name pattern:**
```
main
```

**Settings to enable:**

#### ✅ Require a pull request before merging

**Sub-options:**
- ☑ **Require approvals:** 0 (or 1+ if team has reviewers)
- ☑ **Dismiss stale pull request approvals when new commits are pushed:** Recommended
- ☐ **Require review from Code Owners:** Optional (if CODEOWNERS file exists)

#### ✅ Require status checks to pass before merging

**Sub-options:**
- ☑ **Require branches to be up to date before merging:** Enforces rebase before merge

**Status checks to require:**

Search for and select the following checks:

```
lint-and-typecheck
e2e-ios
e2e-android
e2e-summary
```

**Note:** These checks will only appear after they've run at least once. If not visible:
1. Create a test PR
2. Wait for workflows to complete
3. Return to branch protection settings
4. Checks should now appear in search

#### ✅ Require conversation resolution before merging

Ensures all PR comments are addressed.

#### ✅ Require linear history (Optional)

Forces rebasing instead of merge commits (cleaner git history).

#### ⚠️ Do not allow bypassing the above settings (Admin Control)

**Recommendation:** Leave unchecked initially

- **Unchecked:** Admins can bypass in emergencies (hotfixes, urgent rollbacks)
- **Checked:** Strict enforcement (no bypasses, even for admins)

**For production repos:** Check this after team is confident in CI stability

#### Rules applied to administrators (Optional)

**Recommendation:** Check this to enforce discipline

- **Checked:** Admins follow same rules as contributors
- **Unchecked:** Admins can push directly to `main` (not recommended)

### 3. Save Protection Rule

Click **Create** (or **Save changes** if editing existing rule)

---

## Configuration for `develop` Branch (Optional)

Repeat steps 1-3 with the following adjustments:

**Branch name pattern:**
```
develop
```

**Differences from `main` branch protection:**
- **Require approvals:** 0 (faster iteration)
- **Require linear history:** Optional (team preference)
- **Allow bypassing:** More lenient (admins can bypass for urgent dev fixes)

---

## Verification

### Test PR Gating (Required)

After configuring branch protection:

1. **Create test PR with intentional failure:**

```bash
# Create new branch
git checkout -b test/pr-gating

# Introduce TypeScript error
echo "const broken: number = 'string';" >> src/test-pr-gating.ts

# Commit and push
git add src/test-pr-gating.ts
git commit -m "test: intentional TS error to verify PR gating"
git push origin test/pr-gating
```

2. **Open PR to `main`:**
   - Navigate to GitHub
   - Click **New Pull Request**
   - Base: `main`, Compare: `test/pr-gating`
   - Create PR

3. **Verify CI runs:**
   - Wait for `lint-and-typecheck` job to fail
   - Check that **Merge** button is blocked
   - Should see: ❌ "Required status check 'lint-and-typecheck' is expected."

4. **Fix error and verify unblock:**

```bash
# Fix TypeScript error
git rm src/test-pr-gating.ts
git commit -m "test: remove TS error"
git push
```

   - Wait for CI to re-run
   - Verify all checks pass: ✅
   - **Merge** button should become available

5. **Close test PR** (do not merge)

---

## PR Workflow for Contributors

### Standard PR Workflow

1. **Create feature branch:**

```bash
git checkout -b feat/my-feature
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin feat/my-feature
```

2. **Open PR to `main` (or `develop`):**
   - GitHub will automatically trigger `ci.yml` and `e2e-tests.yml`
   - Workflows run in parallel (~40-60 min total)

3. **Monitor CI progress:**
   - Check **Checks** tab in PR
   - Wait for all required checks to complete

4. **If checks fail:**
   - Click failed check to view logs
   - Fix issues locally
   - Push new commit (CI re-runs automatically)

5. **If checks pass:**
   - ✅ All checks green
   - Request review (if required)
   - **Merge** button becomes available
   - Click **Merge pull request**

### Handling Outdated Branches

If base branch (`main`) has new commits:

1. PR will show: ⚠️ "This branch is out-of-date with the base branch"
2. Click **Update branch** button (if rebase allowed)
3. Or rebase manually:

```bash
git checkout feat/my-feature
git fetch origin
git rebase origin/main
git push --force-with-lease
```

4. CI re-runs on rebased commits

---

## E2E Test Failure Handling

### Common E2E Failures

#### Scenario 1: Flaky Test (Passes on Retry)

**Symptoms:**
- Test fails in CI but passes locally
- Inconsistent failures across runs

**Action:**
1. Re-run failed workflow (click "Re-run jobs" → "Re-run failed jobs")
2. If passes on retry → flaky test detected
3. Create issue to fix flakiness
4. Merge PR after pass

**Long-term fix:**
- Add retries to Detox config (see CI_E2E_INTEGRATION.md)
- Increase wait timeouts for elements

#### Scenario 2: Real Failure (Code Issue)

**Symptoms:**
- Test fails consistently
- Clear error message (e.g., "Element not found: by.id('chat-send')")

**Action:**
1. Download artifacts from failed workflow run
2. Review screenshot to see UI state at failure
3. Fix code locally (add missing testID, fix logic, etc.)
4. Run e2e tests locally to verify fix:

```bash
npm run e2e:ios
# or
npm run e2e:android
```

5. Push fix, wait for CI to re-run

#### Scenario 3: Missing TestID

**Symptoms:**
- Error: "Element not found: by.id('...')"

**Action:**
1. Check `.modernization/TESTID_REQUIREMENTS.md` for required testIDs
2. Add missing testID to component:

```tsx
<Pressable testID="chat-send" onPress={handleSend}>
  <Text>Send</Text>
</Pressable>
```

3. Push fix

---

## Emergency Bypass Procedures

### When to Bypass (Admin Only)

**Valid reasons:**
- **Hotfix:** Critical production bug, CI unrelated to fix
- **CI Outage:** GitHub Actions down, need to deploy urgently
- **Flaky Test:** Known flaky test blocking critical PR (with mitigation plan)

**Invalid reasons:**
- ❌ "CI is slow" (wait for it)
- ❌ "I don't want to fix tests" (fix tests)
- ❌ "My change is small" (small changes can break e2e)

### How to Bypass (If Permitted)

**Option 1: Admin Push (Not Recommended)**

```bash
# Admin-only (if "Rules applied to administrators" unchecked)
git checkout main
git merge --no-ff feat/my-feature
git push origin main
```

**Consequences:**
- Bypasses all checks (linting, type-check, e2e)
- No audit trail of why bypass occurred
- Risky (could introduce bugs)

**Option 2: Temporarily Disable Protection (Slightly Better)**

1. GitHub → Settings → Branches → Edit protection rule
2. Uncheck "Require status checks to pass"
3. Merge PR
4. **Immediately re-enable** protection rule

**Consequences:**
- Documented in GitHub audit log
- Time window where all PRs can bypass (risky)

**Option 3: Use GitHub Admin Override (Best)**

1. Navigate to PR
2. As admin, merge button shows: "Merge without waiting for requirements to be met (bypass branch protections)"
3. Click **Merge pull request**
4. Add comment explaining bypass reason

**Consequences:**
- Documented in PR comments (audit trail)
- Other PRs remain protected
- Recommended approach for emergencies

---

## Monitoring PR Gating Effectiveness

### Metrics to Track

| Metric | Target | How to Measure |
|--------|--------|----------------|
| % PRs passing CI on first try | >70% | GitHub Insights → Pull Requests |
| Avg time to merge (from PR open) | <2 days | Manual tracking or GitHub API |
| % PRs bypassing checks | <5% | Count admin overrides in audit log |
| E2E test pass rate | >95% | Workflow run statistics |

### GitHub Insights Dashboard

1. Navigate to **Insights** tab
2. **Pull requests** → Filter by `is:pr is:merged`
3. Review:
   - Average time to merge
   - Number of commits per PR (indicates rework)
   - Number of comments per PR (indicates review thoroughness)

---

## FAQ

### Q: Can I merge if only one platform (iOS or Android) fails?

**A:** No. Both `e2e-ios` and `e2e-android` are required checks. Both must pass.

**Reason:** Ensures cross-platform consistency. A feature working on iOS but broken on Android is not shippable.

**Exception:** If Android emulator is broken in CI (infrastructure issue), temporarily remove `e2e-android` from required checks until fixed.

### Q: How long do I have to wait for e2e tests?

**A:** Typically 40-60 minutes for full pipeline (lint + iOS + Android in parallel).

**Optimization:** Run tests locally first (`npm run e2e:ios`) to catch issues before pushing.

### Q: What if CI is stuck or timeout?

**A:** Re-run workflow:
1. Go to **Checks** tab
2. Click "Re-run jobs"
3. Select "Re-run all jobs" or "Re-run failed jobs"

If timeout persists, check for:
- Infinite loop in test code
- App crash causing Detox to hang
- Simulator/emulator stuck (infrastructure issue)

### Q: Can I skip e2e tests for documentation-only PRs?

**A:** Not with current setup (e2e workflow triggers on all code changes).

**Future improvement:** Add path filters to e2e workflow:

```yaml
on:
  pull_request:
    paths-ignore:
      - '**.md'  # Skip e2e for markdown-only changes
      - 'docs/**'
```

### Q: How do I add a new required check?

**A:**
1. Add job to existing workflow or create new workflow
2. Wait for job to run at least once (creates check name)
3. GitHub → Settings → Branches → Edit `main` protection
4. Search for new check name, select it
5. Save

Example: Adding `unit-tests` check:

```yaml
# .github/workflows/ci.yml
jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test
```

Then add `unit-tests` to required checks in branch protection.

---

## Rollback Plan

If PR gating causes issues (e.g., too strict, blocking critical work):

### Temporary Disable (Emergency)

1. GitHub → Settings → Branches → Edit `main` protection
2. Uncheck "Require status checks to pass"
3. Communicate to team: "PR gating temporarily disabled for [reason], will re-enable by [date]"

### Adjust Requirements (Less Strict)

Instead of disabling entirely, make specific adjustments:

**Option A: Remove flaky checks**
- Uncheck `e2e-android` if Android emulator consistently fails
- Keep `lint-and-typecheck` and `e2e-ios`

**Option B: Remove "require up-to-date" requirement**
- Uncheck "Require branches to be up to date before merging"
- Allows merging slightly outdated PRs (riskier but faster)

**Option C: Allow admin bypasses**
- Uncheck "Rules applied to administrators"
- Admins can bypass in emergencies

### Communicate Changes

Post in team Slack/Discord:

```
🚨 PR Gating Update:
- Temporarily removed e2e-android from required checks (emulator instability)
- Plan: Fix Android CI by Friday, re-enable Monday
- All other checks (lint, TypeScript, e2e-ios) still required
```

---

## Summary

**Implemented:**
- ✅ Documented branch protection configuration for `main` and `develop`
- ✅ Defined 4 required status checks (lint, e2e-ios, e2e-android, e2e-summary)
- ✅ Created verification procedure (test PR with intentional failure)
- ✅ Documented contributor PR workflow
- ✅ E2E failure handling procedures
- ✅ Emergency bypass procedures (admin-only)
- ✅ Monitoring metrics and dashboard guidance

**Pending (Requires GitHub Admin):**
- ⏳ Apply branch protection rule to `main` branch
- ⏳ Apply branch protection rule to `develop` branch (optional)
- ⏳ Run verification test PR
- ⏳ Communicate new PR workflow to team

**Result:** Once applied, all PRs to `main` must pass linting, type-check, and both iOS + Android e2e tests before merging.

---

## Next Steps (Post-Phase 4)

1. **Phase 5.1-5.5:** Compliance & Observability
   - Apple privacy manifest
   - Google Play data safety
   - Sentry release automation

2. **Phase 6.1-6.4:** Release Hardening
   - EAS channel promotion flow
   - OTA rollback rehearsal
   - Release checklist documentation

**Phase 4 Complete:** Testing automation infrastructure ready for production use.
