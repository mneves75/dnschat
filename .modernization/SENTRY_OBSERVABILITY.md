# Sentry Observability & Monitoring

**Phase 5.4-5.5**
**Date:** 2025-10-03
**Status:** ✅ **IMPLEMENTED**

---

## Overview

This document describes DNSChat's Sentry integration for error tracking, performance monitoring, and release management.

**Sentry Organization:** `mneves75` (or your org slug)
**Sentry Project:** `dnschat`
**Sentry DSN:** Configured via environment variables

---

## Sentry Release Automation (Phase 5.4)

### Workflow: `.github/workflows/sentry-release.yml`

**Triggers:**
1. **Git tags** matching `v*.*.*` (e.g., `v2.0.1`, `v2.1.0-beta`)
2. **Manual workflow dispatch** with version + environment inputs

**Functionality:**
- Creates Sentry release with version tag
- Associates commits since last tag
- Deploys release to environment (production, preview, development)
- Auto-detects environment from tag pattern (beta/alpha/rc → preview)

**Example Usage:**

```bash
# Tag release locally
git tag v2.0.2
git push origin v2.0.2

# GitHub Actions automatically:
# 1. Creates Sentry release "2.0.2"
# 2. Associates commits from v2.0.1..v2.0.2
# 3. Deploys to "production" environment
```

**Manual Trigger:**

```bash
# Via GitHub UI:
# Actions → Sentry Release Automation → Run workflow
# - Version: 2.0.2
# - Environment: preview

# Or via GitHub CLI:
gh workflow run sentry-release.yml \
  -f version=2.0.2 \
  -f environment=preview
```

### Required Secrets

Configure in **GitHub Settings → Secrets and variables → Actions**:

| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `SENTRY_AUTH_TOKEN` | Sentry API token with `releases:write` scope | Sentry → Settings → Account → API → Auth Tokens → Create Token |
| `SENTRY_ORG` | Organization slug (e.g., `mneves75`) | Sentry URL: `https://sentry.io/organizations/<ORG>/` |
| `SENTRY_PROJECT` | Project name (e.g., `dnschat`) | Sentry → Projects → DNSChat → Settings → General |

**Creating Sentry Auth Token:**

1. Navigate to https://sentry.io/settings/account/api/auth-tokens/
2. Click **Create New Token**
3. Name: `GitHub Actions - DNSChat Releases`
4. Scopes:
   - ✅ `project:releases`
   - ✅ `org:read`
5. Click **Create Token**
6. Copy token and add to GitHub Secrets

### Release Version Strategy

**Semantic Versioning (SemVer):**

| Version Pattern | Environment | Example |
|----------------|-------------|---------|
| `v2.0.1` | Production | Stable release |
| `v2.1.0-beta.1` | Preview | Beta testing |
| `v2.2.0-alpha.3` | Preview | Alpha testing |
| `v2.1.0-rc.2` | Preview | Release candidate |

**Sentry Release Names:**
- Strip `v` prefix: `v2.0.1` → `2.0.1`
- Keep semver suffixes: `v2.1.0-beta.1` → `2.1.0-beta.1`

### Integration with EAS Build

**Option 1: Post-build Hook**

Add to `eas.json` (future enhancement):

```json
{
  "build": {
    "production": {
      "distribution": "store",
      "env": {
        "SENTRY_ORG": "mneves75",
        "SENTRY_PROJECT": "dnschat"
      },
      "autoIncrement": true,
      "releaseChannel": "production"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "mvneves75@gmail.com",
        "ascAppId": "6740045336"
      }
    }
  }
}
```

**Option 2: Manual Trigger After EAS Build**

```bash
# After successful EAS build
eas build --platform all --profile production

# Wait for build to complete, then:
git tag v2.0.2
git push origin v2.0.2

# Sentry release created automatically
```

---

## Sentry Dashboard Configuration (Phase 5.5)

### 1. Error Tracking Dashboard

**Navigate:** Sentry → Issues

**Filters to Add:**

**1.1. Unresolved Errors (Last 7 Days)**
- **Query:** `is:unresolved`
- **Sort by:** First seen (newest first)
- **Grouping:** By stack trace similarity

**1.2. High Volume Errors**
- **Query:** `is:unresolved`
- **Sort by:** Event count (highest first)
- **Threshold:** >10 events in 24 hours

**1.3. New Errors (Last 24 Hours)**
- **Query:** `is:unresolved age:-24h`
- **Alert:** Slack notification when new error appears

**1.4. Platform-Specific Errors**
- **iOS Tab:** `platform:cocoa`
- **Android Tab:** `platform:java`

### 2. Release Health Dashboard

**Navigate:** Sentry → Releases

**Metrics to Track:**

**2.1. Crash-Free Sessions**
- **Target:** >99.5% crash-free
- **Alert:** If drops below 99%
- **Chart:** Line graph over 30 days

**2.2. Crash-Free Users**
- **Target:** >99% crash-free
- **Alert:** If drops below 98%

**2.3. Session Duration**
- **Metric:** Median session duration
- **Goal:** Understand user engagement

**2.4. Adoption Rate**
- **Metric:** % of users on latest version
- **Goal:** >80% adoption within 7 days

### 3. Performance Monitoring Dashboard

**Navigate:** Sentry → Performance

**Transactions to Monitor:**

**3.1. App Launch (TTI)**
- **Transaction:** `App.componentDidMount` or TTI marker
- **Target:** p95 <2000ms
- **Alert:** If p95 >3000ms

**3.2. DNS Query Performance**
- **Transaction:** `DNSService.query`
- **Target:** p95 <500ms
- **Alert:** If p95 >1000ms
- **Breakdown:** By transport (Native, UDP, TCP, DoH)

**3.3. Screen Navigation**
- **Transaction:** `navigation.navigate`
- **Target:** p95 <300ms
- **Screens:** ChatList, ChatScreen, Settings

**3.4. Message Rendering**
- **Transaction:** `MessageList.render`
- **Target:** p95 <100ms
- **Metric:** Time to render 50 messages

### 4. Custom Alerts

**4.1. Critical Error Alert**

**Condition:**
- Error severity: `error` or `fatal`
- Event count: >5 in 10 minutes
- Environment: `production`

**Action:**
- Slack: `#dnschat-alerts`
- Email: `mvneves75@gmail.com`
- PagerDuty: (if configured)

**4.2. Performance Regression Alert**

**Condition:**
- Transaction: `DNSService.query`
- p95 latency: >2x baseline
- Timeframe: Compared to previous release

**Action:**
- Slack: `#dnschat-performance`

**4.3. New Release Alert**

**Condition:**
- New release deployed

**Action:**
- Slack: `#dnschat-releases`
- Message: "Release {version} deployed to {environment}"

### 5. Saved Searches

**5.1. DNS Query Failures**
- **Query:** `message:"DNS query failed" OR transaction:DNSService.query`
- **Save as:** "DNS Query Errors"

**5.2. Rate Limit Errors**
- **Query:** `message:"rate limit" OR message:"Too many requests"`
- **Save as:** "Rate Limit Violations"

**5.3. Native Module Crashes**
- **Query:** `stack.module:RNDNSModule OR stack.module:LiquidGlassNative`
- **Save as:** "Native Module Crashes"

**5.4. iOS 17+ Specific Issues**
- **Query:** `os.version:>=17.0 platform:cocoa`
- **Save as:** "iOS 17+ Issues"

---

## Sentry Configuration Audit

### app.config.ts (Lines 60-76)

**Current Configuration:**

```typescript
if (
  process.env.SENTRY_ORG &&
  process.env.SENTRY_PROJECT &&
  process.env.SENTRY_AUTH_TOKEN
) {
  plugins.push([
    '@sentry/react-native/expo',
    {
      organization: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      url: process.env.SENTRY_URL ?? 'https://sentry.io/',
      uploadDebugSymbols: true,  // ✅ Good
      uploadSourceMaps: true,     // ✅ Good
    },
  ]);
}
```

**Recommendations:**

✅ **Keep as-is:** Source maps and debug symbols enabled for production debugging

### Sentry.init() Configuration

**File:** `index.tsx` or `App.tsx` (wherever Sentry is initialized)

**Recommended Configuration:**

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Enable in production only
  enabled: !__DEV__,

  // Environment
  environment: __DEV__ ? 'development' : 'production',

  // Release tracking (auto-set by Sentry plugin)
  // release: '2.0.1',  // Automatically set from app version

  // Performance Monitoring
  tracesSampleRate: __DEV__ ? 0.0 : 0.1,  // 10% of production transactions
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000,  // 30 seconds

  // Error Filtering
  beforeSend(event, hint) {
    // Strip sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.Authorization;
    }

    // Filter development errors
    if (__DEV__) {
      return null;
    }

    return event;
  },

  // Integrations
  integrations: [
    new Sentry.ReactNativeTracing({
      // Trace React Navigation
      routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),

      // Trace network requests (optional)
      traceFetch: true,
      traceXHR: false,  // DNSChat uses UDP/TCP, not XHR
    }),
  ],
});
```

**Key Settings:**

| Setting | Value | Rationale |
|---------|-------|-----------|
| `enabled` | `!__DEV__` | Disable in development (avoid noise) |
| `environment` | `development` / `production` | Separate dev vs prod errors |
| `tracesSampleRate` | `0.1` (10%) | Balance performance cost vs data |
| `enableAutoSessionTracking` | `true` | Track crash-free sessions |
| `beforeSend` | Strip cookies, auth headers | Privacy compliance |

---

## Monitoring Metrics

### Error Rate Targets

| Metric | Target | Action if Exceeded |
|--------|--------|-------------------|
| Crash-free sessions | >99.5% | Investigate within 1 hour |
| Crash-free users | >99% | Investigate within 4 hours |
| Unhandled exceptions | <5 per day | Fix in next release |
| Handled exceptions | <50 per day | Review and triage |

### Performance Targets

| Transaction | p50 | p95 | Action if Exceeded |
|-------------|-----|-----|-------------------|
| App Launch (TTI) | <1500ms | <2500ms | Profile and optimize |
| DNS Query | <300ms | <800ms | Check network, review transport fallback |
| Screen Navigation | <100ms | <300ms | Optimize navigation stack |
| Message Rendering | <50ms | <150ms | Review FlatList config |

### Release Health Targets

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Adoption rate | >50% | Within 3 days |
| Adoption rate | >80% | Within 7 days |
| Rollback rate | <5% | Per release |
| Critical errors | 0 | Within 24 hours of release |

---

## Incident Response Workflow

### 1. Error Alert Received

**Step 1: Triage (5 minutes)**
- Check Sentry issue details
- Determine severity: critical / high / medium / low
- Check affected users count
- Check affected releases

**Step 2: Investigate (15 minutes)**
- Review stack trace
- Check breadcrumbs (user actions before crash)
- Identify root cause (code bug, API failure, network issue)
- Check if regression (was it working before?)

**Step 3: Mitigate (30 minutes)**
- **If critical:** Prepare hotfix or rollback
- **If high:** Create fix PR, fast-track through CI
- **If medium/low:** Create GitHub issue, schedule for next release

**Step 4: Resolve**
- Deploy fix
- Monitor Sentry for recurrence
- Mark Sentry issue as resolved

### 2. Performance Regression Detected

**Step 1: Confirm Regression**
- Compare p95 latency: current vs previous release
- Check if affects all users or specific platforms

**Step 2: Profile**
- Enable Sentry performance profiling (increase sample rate to 1.0 temporarily)
- Identify slow transaction spans

**Step 3: Optimize**
- Implement fix (defer loading, optimize query, add caching)
- Verify improvement locally with performance profiler

**Step 4: Deploy & Verify**
- Deploy fix
- Monitor Sentry performance metrics for 24 hours
- Confirm p95 returns to baseline

---

## Sentry Best Practices

### DO

✅ **Use structured logging:**
```typescript
Sentry.captureException(error, {
  tags: { component: 'DNSService', transport: 'Native' },
  extra: { query: domain, timeout: 10000 },
});
```

✅ **Set user context (non-identifying):**
```typescript
Sentry.setUser({
  id: hashedUserId,  // Hash or UUID, not email
  platform: Platform.OS,
  app_version: '2.0.1',
});
```

✅ **Add breadcrumbs for debugging:**
```typescript
Sentry.addBreadcrumb({
  category: 'dns',
  message: 'Attempting DNS query',
  level: 'info',
  data: { domain, transport },
});
```

### DON'T

❌ **Don't log sensitive data:**
```typescript
// BAD: Includes user message content
Sentry.captureMessage('Chat sent', { extra: { message: userInput } });

// GOOD: Logs only metadata
Sentry.captureMessage('Chat sent', { extra: { messageLength: userInput.length } });
```

❌ **Don't set high trace sample rates:**
```typescript
// BAD: 100% sampling (expensive, privacy risk)
tracesSampleRate: 1.0,

// GOOD: 10% sampling (sufficient for patterns)
tracesSampleRate: 0.1,
```

❌ **Don't ignore errors silently:**
```typescript
// BAD: Silent catch
try {
  await dnsQuery();
} catch (error) {
  // No logging
}

// GOOD: Log to Sentry
try {
  await dnsQuery();
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

---

## References

- [Sentry React Native SDK](https://docs.sentry.io/platforms/react-native/)
- [Sentry Releases](https://docs.sentry.io/product/releases/)
- [Sentry Dashboards](https://docs.sentry.io/product/dashboards/)
- [Sentry Alerts](https://docs.sentry.io/product/alerts/)
- [GitHub Action: getsentry/action-release](https://github.com/getsentry/action-release)

---

**Status:** Phase 5.4-5.5 complete. Sentry release automation and dashboard configuration documented.
**Next:** Phase 6 (Release Hardening).
