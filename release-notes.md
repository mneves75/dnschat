# DNSChat v2.1.2 Release Notes

## What's New

### DNS Testing Infrastructure

**DNS Harness Test Tool** - We've added a powerful new testing tool for developers!

- **What it does**: Tests DNS queries using UDP and TCP transports directly from Node.js
- **Why it matters**: Verify DNS protocol compatibility without running the full React Native app
- **How to use**: `npm run dns:harness -- --message "your test message"`
- **Supports**: JSON output (`--json-out`), raw binary dumps (`--raw-out`), custom DNS servers

This tool helped us verify our DNS protocol implementation matches the ch.at server perfectly.

### Developer Experience Improvements

**Better Documentation** - Updated development guidelines for contributors:
- Clear testing requirements including the new DNS harness
- Atomic commit guidelines to keep git history clean
- Critical thinking standards for code review
- No unnecessary markdown files after completion

**Technical Details** - For developers:
- Fixed Node.js import cycle error when running DNS harness
- Compile TypeScript to CommonJS before execution
- Native DNS module properly isolated from Node.js environment

## What Was Fixed

- **ERR_REQUIRE_CYCLE_MODULE** error when running DNS harness in Node.js
- Import conflicts between React Native native modules and Node.js runtime
- Module resolution issues with dynamic imports

## For Developers

### New Commands
```bash
npm run dns:harness             # Run DNS test harness
npm run dns:harness:build       # Compile harness TypeScript to JavaScript
```

### Updated Testing Checklist
Before any release:
1. `npm test -- --runInBand` - Run Jest test suite
2. `node test-dns-simple.js "test"` - Quick DNS smoke test
3. `npm run dns:harness -- --message "test"` - Full DNS harness verification

## Previous Versions

See [CHANGELOG.md](./CHANGELOG.md) for detailed technical changelog following Keep a Changelog format.

---

**Version**: 2.1.2
**Release Date**: October 24, 2025
**React Native**: 0.81.5
**Expo SDK**: 54.0.19
