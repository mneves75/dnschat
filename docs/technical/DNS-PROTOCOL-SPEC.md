# DNS protocol spec (app behavior)

This doc describes what DNSChat actually does today (code is the source of
truth). For implementation, see `src/services/dnsService.ts` (transport
orchestration + TXT parsing), `src/services/dnsWire.ts` (TXT query encoding,
packet decoding, TCP framing, TXT extraction, decoded-response validation), and
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

- `targetServer`: DNS server we send packets to (`llm.pieter.com` or `ch.at`).
- `zone`: suffix used to build the query name (e.g. `llm.pieter.com`).
- `label`: sanitized message label.

Algorithm (implemented by `composeDNSQueryName(label, dnsServer)`):

1. Strip trailing dots and whitespace from `label`.
2. Validate `dnsServer` (non-empty allowlisted hostname; ports disallowed).
3. Use the validated `dnsServer` (lowercased, trailing dot removed) as the zone.
4. Query name is `${label}.${zone}`.

Important consequence:

- Every allowlisted server is an LLM zone, so the query name is always pinned to
  the server that receives it. Public recursive resolvers (`8.8.8.8`,
  `1.1.1.1` and their secondaries) were allowlisted until 4.4.4 and reachable
  over the JavaScript UDP/TCP rungs only; 4.4.5 removed them, and settings
  migration resets a persisted IP resolver to `llm.pieter.com`.

## TXT response parsing

Input is a list of TXT strings as returned by the transport.

TXT bytes are UTF-8 (the default resolver returns raw non-ASCII bytes). RFC 1035
caps a character-string at 255 bytes and a server may split one RR at any byte,
so a multibyte character can straddle two character-strings. Transports decode
the bytes of one RR as a unit, never string by string:

- iOS native and Android raw UDP / legacy dnsjava: each non-empty
  character-string stays its own list element. An incomplete UTF-8 sequence at
  the end of one character-string carries into the next character-string of the
  same RR, never across RRs. Malformed bytes, or a sequence still incomplete at
  the end of the RR, reject the response as not valid UTF-8. The legacy rung
  decodes dnsjava's raw bytes (`getStringsAsByteArrays`), not its escaped
  presentation strings, and gives each lookup its own throwaway cache so an
  earlier answer for the same name is never replayed.
- JS UDP/TCP: one list element per RR, built by concatenating the RR's
  character-string bytes and decoding once. Invalid bytes stay lenient and
  decode to U+FFFD.

Parsing rules (implemented by `parseTXTResponse(txtRecords)`):

1. Ignore empty/whitespace-only records.
2. If every remaining record does NOT match multipart prefix `n/N:...`, treat the
   response as plain and return the concatenation of all records (in received order).
3. If every remaining record matches the multipart prefix, treat the response as
   multipart:
   - Each record must be `partNumber/totalParts:content`.
   - `totalParts` is taken from the first parsed part.
   - Parts are keyed by `partNumber`; duplicates are allowed only if content is identical.
   - The response must contain exactly `totalParts` unique parts `1..totalParts`.
   - Join `content` in order `1..N`.
4. Mixing plain and multipart records is rejected as an invalid response.
5. Sanitize the assembled response by removing unsafe control and bidi
   characters; reject it if it is empty after sanitization.

## Response validation

Native UDP resolvers (iOS/Android) and JS UDP/TCP fallbacks validate DNS responses before TXT parsing:

- Transaction ID must match the query.
- Header flags must indicate a standard response (QR=1, opcode=0, TC=0, RCODE=0).
- QDCOUNT must be `1` (single-question query).
- The response question section must match the original query:
  - QNAME equals the normalized query name (lowercased, sanitized).
  - QTYPE is TXT (16) and QCLASS is IN (1).
- Accepted TXT answers must also match the original owner name and IN class.
- DNS name parsing handles compression pointers with strict bounds checks and a small max-jump guard. Expanded names must fit 255 wire octets, including label-length octets and the terminating root; compression does not bypass this limit.
- JS UDP additionally rejects unexpected source metadata when the selected resolver is an explicit IPv4 address (source port must always match, and source address must match for IPv4-literal resolvers).

## Transport chain

Order used for iOS/Android builds:

1. Native DNS module (`modules/dns-native/`)
2. UDP DNS (JavaScript, `react-native-udp`)
3. TCP DNS (JavaScript, `react-native-tcp-socket`)
4. Mock (optional dev fallback)

Android native module internal fallback chain:

1. Raw UDP (native)
2. Legacy resolver (dnsjava), queried with an absolute name so the system
   search path cannot expand it

The DNS-over-HTTPS rung was removed in 4.4.0. The native resolver speaks only
DNS, so no query leaves the device over HTTPS to a third party;
`androidDnsResolver.policy.spec.ts` fails the build if `HttpURLConnection`
returns to that resolver.

Web builds use Mock because browsers cannot do custom DNS on port 53.

### Deadline and cancellation semantics

- Orchestration uses one absolute 20-second deadline across resolver fallback,
  retries, backoff, and all transport rungs.
- A single rung may use at most 10 seconds and never more than the query's
  remaining budget. Native transports cap their monotonic budget at 9.5
  seconds.
- JavaScript UDP/TCP deadline or lifecycle cancellation closes the socket;
  timing out only the awaiting promise is insufficient.
- On an app-background transition, all work from the prior lifecycle is
  invalid. It cannot publish a late response or start another fallback after
  the app returns to the foreground.

## Security model (non-negotiable)

- Do not send secrets or personal data; DNS is observable infrastructure and
  responses are not authenticated end to end. Packet validation rejects
  malformed or mismatched replies but cannot prove who produced a valid reply.
- DNS server input is validated and constrained in both JS and native; see whitelist and
  sanitizer rules in `modules/dns-native/constants.ts`.
