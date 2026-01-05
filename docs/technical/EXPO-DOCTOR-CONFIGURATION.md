# Expo doctor configuration

This repo intentionally uses a few packages/patterns that Expo Doctor may warn
about. The goal is to keep DNSChat functional on real networks, not to satisfy
every directory heuristic.

## Why ios/ + android/ exist (and stay committed)

DNSChat includes a custom native module for DNS TXT resolution:

- iOS: Swift + Network.framework
- Android: Java + DnsResolver API (with fallback behavior inside the module)

Because custom native code exists, the repo keeps `ios/` and `android/` checked
in. Some Expo tooling warns when native folders exist alongside config in
`app.json`. In this repo, `app.json` is still the source of truth for intent,
and native folders are kept in sync by humans + tests.

## Why some packages are excluded from Expo Doctor

Expo Doctor can warn about unmaintained or “untested on New Architecture”
packages. DNSChat uses dynamic loading and graceful fallback so these do not
brick the app if they fail to load.

Current excludes live in `package.json` under `expo.doctor.reactNativeDirectoryCheck.exclude`.

### `react-native-udp`

Used as the JS UDP DNS fallback transport. If it fails to load, the app falls
back to TCP or Mock.

### `react-native-tcp-socket`

Used for DNS-over-TCP fallback (port 53) when UDP is blocked.

### `@dnschat/dns-native`

Local package (`modules/dns-native/`), not published to npm, so directory
metadata is not applicable.

## Quick verification

```bash
# Lint (includes ast-grep rules)
bun run lint

# Unit tests
bun run test

# DNS smoke test
node test-dns-simple.js "Hello world"
```
