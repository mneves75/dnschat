# @dnschat/dns-native

Native DNS TXT resolver module for React Native (iOS + Android).

This package is used by the DNSChat app to perform direct DNS TXT lookups from
native code and return raw TXT records to the TypeScript layer for parsing.

Status:

- This module currently ships as part of this repo (under `modules/dns-native/`).
- It is not published to npm in the default workflow; the app imports it via a
  repo-local path.

## Platform implementation

- iOS: uses Apple's Network framework for DNS resolution (where available).
- Android: attempts a raw UDP TXT query first; if that fails, it can fall back to
  DNS-over-HTTPS for non-`ch.at` servers, then to a legacy resolver (dnsjava).

Note: In the DNSChat app, the TypeScript layer controls the overall transport
order (native -> UDP -> TCP -> mock). The Android native module also has its own
internal fallback chain inside the native "native" step.

Native UDP responses are validated before TXT parsing (transaction ID, header
flags, QDCOUNT, and question name/type/class matching) to reduce spoofing risk.

## Usage

```ts
import { nativeDNS } from "../../modules/dns-native";

const capabilities = await nativeDNS.isAvailable();
if (!capabilities.available) {
  throw new Error("Native DNS not available on this platform");
}

// queryName must be the fully-qualified name you want to look up (already
// sanitized/validated by the caller).
const queryName = "hello-world.ch.at";
const txtRecords = await nativeDNS.queryTXT("ch.at", queryName, 53);
const response = nativeDNS.parseMultiPartResponse(txtRecords);
```

## API

- `nativeDNS.isAvailable(): Promise<DNSCapabilities>`
- `nativeDNS.queryTXT(dnsServer: string, queryName: string, port?: number): Promise<string[]>`
- `nativeDNS.parseMultiPartResponse(records: string[]): string`

## Development

```bash
cd modules/dns-native
npm ci
npm test
```
