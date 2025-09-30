# ch.at DNS Server Compatibility — Audit Plan (2025-09-30)

## Server Snapshot (`dns.go`)
- UDP TXT server binds to `ch.at` and catches all TXT questions via `dns.HandleFunc("ch.at.", handleDNS)` and the default handler.
- Incoming question names are trimmed to remove the zone (`strings.TrimSuffix(name, ".ch.at")`), then hyphens (`-`) are converted back to spaces before the prompt is sent to the LLM.
- Responses stream chunks into `dns.TXT` answers, splitting every 255 bytes without multipart numbering; clients must concatenate records in order received.
- 500-character budget (with hard 4s deadline) means long prompts can be truncated with `... (incomplete)`.

## Client Review Highlights

### TypeScript service (`src/services/dnsService.ts`)
- `createQueryContext` sanitizes the user message, then composes a fully-qualified query name `<label>.ch.at` (or `<label>.<custom server>`).
- Native transports receive this FQDN verbatim (`nativeDNS.queryTXT(targetServer, queryName)`), so platform modules must encode multi-label names correctly.

### iOS native module (`modules/dns-native/ios/DNSResolver.swift`)
- `encodeDomainName` splits on `.` and encodes each label with length prefixes, matching RFC 1035 expectations for names like `prompt.ch.at`.
- TXT parsing walks answer RR sets and collects each string, preserving order to join 255-byte fragments.

### Android native module (`modules/dns-native/android/DNSResolver.java`)
- `buildDnsQuery` now splits the fully-qualified query name into RFC 1035 length-prefixed labels, preserving the `.ch.at` suffix on the wire.
- Query-name normalization validates label characters/lengths up front so we fail fast instead of silently truncating near the 63-byte boundary.
- Legacy and DoH fallbacks remain for non-`ch.at` servers; additional regression tests are still pending to guarantee parity with dnsjava.

## Impact Assessment
- **Android ≤> ch.at**: Native UDP queries now encode the multi-label QNAME correctly; pending regression coverage will confirm behaviour across long prompts.
- **iOS & JS**: Packet construction continues to align with the server’s expectations; TXT concatenation matches the server’s chunking behaviour.
- **Docs**: Existing compatibility note incorrectly stated “keep query name equal to sanitized label only”; actual implementation already uses FQDN.

## Remediation Plan
1. **Android packet builder** *(completed 2025-09-30)*
   - Refactored `buildDnsQuery` to split the incoming FQDN on `.` and emit each label with its length byte.
   - Enforced the 63-character-per-label invariant and surface descriptive errors when the sanitized label is too long instead of truncating silently.
   - Pending: add regression coverage in `modules/dns-native/__tests__/integration.test.ts` asserting that `buildDnsQuery` produces the same wire bytes as dnsjava for `prompt.ch.at`.

2. **Shared sanitization contract**
   - Android now trusts the TypeScript-generated `<label>.zone` string, only lowercasing and enforcing RFC limits (no additional rewriting).
   - Document the shared limit (120 chars pre-sanitize → ≤63 chars label) in `modules/dns-native/README.md`.

3. **Verification**
   - Jest regression tests (`modules/dns-native/__tests__/dnsPacketEncoding.test.ts`) assert the composed FQDN encodes into the expected three labels and that multi-part TXT payloads (>255 bytes) round-trip through the shared parser.
   - Android: capture a packet from `nativeDNS.queryTXT("ch.at", queryName)` using `adb shell tcpdump` to confirm the on-device payload matches the Jest baseline.

4. **Multi-part parser parity**
   - Align the native TypeScript-side parser (`NativeDNS.parseMultiPartResponse`) with the shared service implementation so duplicate segment retransmissions are tolerated when the payload matches.
   - Mirror the corruption protection that TypeScript added (skip identical duplicates, throw only on conflicting content).

## TODO
- [x] Encode multi-label QNAMEs in `modules/dns-native/android/DNSResolver.java` instead of treating the FQDN as a single label (`buildDnsQuery`).
- [x] Wire Android sanitization to the shared TypeScript rules (or drop redundant sanitization) so any validation failures occur in one place.
- [x] Add regression tests covering Android packet encoding and end-to-end TXT parsing for long prompts (≥255 chars response) in `modules/dns-native/__tests__/`.
- [x] Update developer docs (`modules/dns-native/README.md`) with the server constraints (500-char responses, 4s timeout) and new Android requirements.
- [x] Harmonize duplicate multi-part TXT handling between `nativeDNS.parseMultiPartResponse` and `src/services/dnsService.parseTXTResponse` (skip identical duplicates, flag mismatches).
