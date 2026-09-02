# @dnschat/dns-native

Native DNS TXT resolver module for React Native (iOS + Android).

This package is used by the DNSChat app to perform direct DNS TXT lookups from
native code and return raw TXT records to the TypeScript layer for parsing.

Status:

- This module currently ships as part of this repo (under `modules/dns-native/`).
- It is not published to npm in the default workflow; the app imports it via a
  repo-local path.

## Platform implementation

- iOS: uses Apple's Network framework (`NWConnection`) for DNS resolution.
- Android: attempts a raw UDP TXT query first; if that fails, it falls back to
  DNS-over-HTTPS only when the selected resolver is Cloudflare (`1.1.1.1`),
  then to a legacy resolver (dnsjava).

Note: In the DNSChat app, the TypeScript layer controls the overall transport
order (native -> UDP -> TCP -> mock). The Android native module also has its own
internal fallback chain inside the native "native" step.

Native UDP responses are validated before TXT parsing (transaction ID, header
flags, QDCOUNT, and question name/type/class matching) to reduce spoofing risk.
Every query receives the caller's absolute epoch deadline. The native boundary
converts it once to a monotonic budget capped at 9.5 seconds. Calls are tracked
as independent operations so `cancelActiveQueries()` can cancel all in-flight
work without coupling callers that have different deadlines.

## Usage

```ts
import { nativeDNS } from "../../modules/dns-native";

const capabilities = await nativeDNS.isAvailable();
if (!capabilities.available) {
  throw new Error("Native DNS not available on this platform");
}

// queryName must be the fully-qualified name you want to look up (already
// sanitized/validated by the caller).
const queryName = "hello-world.llm.pieter.com";
const deadlineEpochMs = Date.now() + 10_000;
const txtRecords = await nativeDNS.queryTXT(
  "llm.pieter.com",
  queryName,
  53,
  deadlineEpochMs,
);
const response = nativeDNS.parseMultiPartResponse(txtRecords);
```

## API

- `nativeDNS.isAvailable(): Promise<DNSCapabilities>`
- `nativeDNS.queryTXT(dnsServer: string, queryName: string, port: number, deadlineEpochMs: number): Promise<string[]>`
- `nativeDNS.queryTXTUDP(dnsServer: string, queryName: string, port: number, deadlineEpochMs: number): Promise<string[]>`
- `nativeDNS.queryTXTTCP(dnsServer: string, queryName: string, port: number, deadlineEpochMs: number): Promise<string[]>`
- `nativeDNS.cancelActiveQueries(): Promise<number>`
- `nativeDNS.parseMultiPartResponse(records: string[]): string`

## Development

```bash
pnpm install --frozen-lockfile
pnpm run test:native
```
