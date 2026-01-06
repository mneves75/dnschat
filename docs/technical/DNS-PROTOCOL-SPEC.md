# DNS protocol spec (app behavior)

This doc describes what DNSChat actually does today (code is the source of
truth). For implementation, see `src/services/dnsService.ts` and
`modules/dns-native/constants.ts`.

## Inputs and limits

- User prompt is a string.
- Prompt max length before sanitization: `120` chars.
- Prompt must not contain control characters (`0x00-0x1F`, `0x7F-0x9F`).

Sanitized label constraints:

- Output is a single DNS label (lowercase `a-z`, `0-9`, `-` only).
- Label max length: `63` chars (RFC 1035 label limit).
- Empty label after sanitization is rejected.

## Query name construction

Terminology:

- `targetServer`: DNS server/resolver we send packets to (e.g. `ch.at`, `8.8.8.8`).
- `zone`: suffix used to build the query name (e.g. `ch.at`, `llm.pieter.com`).
- `label`: sanitized message label.

Algorithm (implemented by `composeDNSQueryName(label, dnsServer)`):

1. Strip trailing dots and whitespace from `label`.
2. Validate `dnsServer` (non-empty allowlisted hostname or IP; ports disallowed).
3. Determine `zone`:
   - If `dnsServer` is an IPv4 address, use default zone `ch.at`.
   - Else use `dnsServer` (lowercased, trailing dot removed) as the zone.
4. Query name is `${label}.${zone}`.

Important consequence:

- If the user selects an IP resolver like `8.8.8.8`, we still query a name under
  `ch.at` (e.g. `hello-world.ch.at`) but we send it to resolver `8.8.8.8`.

## TXT response parsing

Input is a list of TXT strings as returned by the transport.

Parsing rules (implemented by `parseTXTResponse(txtRecords)`):

1. Ignore empty/whitespace-only records.
2. If any record does NOT match multipart prefix `n/N:...`, treat the response
   as plain and return the concatenation of all plain records (in received order).
3. Otherwise treat as multipart:
   - Each record must be `partNumber/totalParts:content`.
   - `totalParts` is taken from the first parsed part.
   - Parts are keyed by `partNumber`; duplicates are allowed only if content is identical.
   - The response must contain exactly `totalParts` unique parts `1..totalParts`.
   - Join `content` in order `1..N`.
4. Empty final response is rejected.

## UDP response validation (native)

Native UDP resolvers (iOS/Android) validate DNS responses before TXT parsing:

- Transaction ID must match the query.
- Header flags must indicate a standard response (QR=1, opcode=0, TC=0, RCODE=0).
- QDCOUNT must be `1` (single-question query).
- The response question section must match the original query:
  - QNAME equals the normalized query name (lowercased, sanitized).
  - QTYPE is TXT (16) and QCLASS is IN (1).
- DNS name parsing handles compression pointers with strict bounds checks and a small max-jump guard.

## Transport chain

Order used for iOS/Android builds:

1. Native DNS module (`modules/dns-native/`)
2. UDP DNS (JavaScript, `react-native-udp`)
3. TCP DNS (JavaScript, `react-native-tcp-socket`)
4. Mock (optional dev fallback)

Web builds use Mock because browsers cannot do custom DNS on port 53.

## Security model (non-negotiable)

- Do not send secrets or personal data; DNS is observable infrastructure.
- DNS server input is validated and constrained; see whitelist and sanitizer
  rules in `modules/dns-native/constants.ts`.
