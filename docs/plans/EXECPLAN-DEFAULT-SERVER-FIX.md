# ExecPlan: Default DNS Server Fix

**Version**: 1.1.0
**Created**: 2026-01-05
**Updated**: 2026-01-05
**Status**: COMPLETE
**Reviewer**: John Carmack Standard

---

## Executive Summary

Critical bug fix: The default DNS server was still set to `ch.at` (offline) instead of `llm.pieter.com`. When a user has a specific server selected in settings, the app bypasses the fallback chain entirely, causing all queries to fail.

**Phase 2 (v1.1.0)**: Added automatic migration for existing users who had ch.at saved in their settings (v3 → v4 migration).

---

## Root Cause Analysis

### The Bug

1. **settingsStorage.ts:30** had `DEFAULT_DNS_SERVER = "ch.at"` (should be `llm.pieter.com`)
2. When user has `dnsServer` setting set, **queryLLM bypasses the fallback chain**:
   ```typescript
   const serversToTry = dnsServer
     ? [{ host: dnsServer, port, priority: 1 }]  // ONLY this server, no fallback!
     : getLLMServers();  // Fallback chain only used when no server selected
   ```
3. Since `DEFAULT_DNS_SERVER` was `ch.at`, new users defaulted to the offline server
4. **Self-critique finding**: Existing users with ch.at saved would NOT be migrated - they needed a settings version bump with automatic migration

### Evidence from Logs

```
LOG  Server ch.at:53 failed: All 3 DNS transports failed
WARN  [Chat] Error occurred DNS query failed after trying all servers (ch.at:53).
```

Only ONE server tried - no fallback to llm.pieter.com!

---

## Files Changed

| File | Change |
|------|--------|
| `src/context/settingsStorage.ts` | `DEFAULT_DNS_SERVER = "llm.pieter.com"`, `SETTINGS_VERSION = 4`, added `migrateOfflineServer()` |
| `src/services/dnsService.ts` | Updated comments (port 9000 -> 53) |
| `src/services/dnsLogService.ts` | Updated comment |
| `src/i18n/messages/en-US.ts` | Updated placeholders and (Default) label |
| `src/i18n/messages/pt-BR.ts` | Updated placeholders and (padrao) label |
| `src/navigation/screens/GlassSettings.tsx` | Reordered server options, llm.pieter.com first |
| `__tests__/settings.migration.spec.ts` | Added v3→v4 migration test, updated expectations |

---

## Implementation Details

### Fix 1: Default Server (CRITICAL)

```typescript
// settingsStorage.ts - BEFORE
export const DEFAULT_DNS_SERVER = "ch.at";

// settingsStorage.ts - AFTER
export const DEFAULT_DNS_SERVER = "llm.pieter.com";
```

### Fix 2: i18n Labels

```typescript
// BEFORE
dnsOptions: {
  chAt: { label: "ch.at (Default)", ... },
  llmPieter: { label: "llm.pieter.com", ... },
}

// AFTER
dnsOptions: {
  chAt: { label: "ch.at", description: "Original ChatDNS server (offline)" },
  llmPieter: { label: "llm.pieter.com (Default)", description: "...recommended" },
}
```

### Fix 3: Settings UI Order

```typescript
// GlassSettings.tsx - BEFORE
dnsServerOptions = [
  { value: DEFAULT_DNS_SERVER, label: chAt.label },  // ch.at first
  { value: "llm.pieter.com", label: llmPieter.label },
]

// GlassSettings.tsx - AFTER
dnsServerOptions = [
  { value: "llm.pieter.com", label: llmPieter.label },  // llm.pieter.com first
  { value: "ch.at", label: chAt.label },
]
```

### Fix 4: Settings Migration v3 → v4 (CRITICAL)

Existing users with ch.at saved need automatic migration:

```typescript
// settingsStorage.ts - NEW
export const SETTINGS_VERSION = 4;  // Bumped from 3

/**
 * Migrate DNS server from ch.at (offline) to llm.pieter.com
 * This handles users who had ch.at saved before the server went offline.
 */
function migrateOfflineServer(server: string): string {
  if (server.toLowerCase().trim() === 'ch.at') {
    return DEFAULT_DNS_SERVER;
  }
  return server;
}

// In migrateSettings():
// Version 3 → Version 4: Migrate ch.at (offline) to llm.pieter.com
if (typeof candidate.version === "number" && candidate.version === 3) {
  return {
    version: SETTINGS_VERSION,
    dnsServer: normalizePersistedDnsServer(candidate.dnsServer, true), // Apply offline migration
    // ... rest of settings
  };
}
```

---

## Verification

- [x] All 712 tests pass (65 suites, 13 skipped as expected)
- [x] DEFAULT_DNS_SERVER is now llm.pieter.com
- [x] SETTINGS_VERSION bumped to 4
- [x] Settings migration converts ch.at → llm.pieter.com
- [x] Settings UI shows llm.pieter.com first
- [x] Comments updated from port 9000 to port 53
- [x] New test added: "migrates v3 payload with ch.at to llm.pieter.com"

---

## John Carmack Review Checklist

- [x] Root cause identified and fixed
- [x] Self-critique revealed migration gap for existing users
- [x] No over-engineering - minimal changes
- [x] Code is clear and direct
- [x] All related locations updated consistently
- [x] Tests pass (712 tests)
- [x] Migration is automatic and transparent to users

---

## Related Issues

This fix was discovered during self-critique of the DNS server migration. See:
- `docs/plans/EXECPLAN-DNS-SERVER-SELF-CRITIQUE.md`
