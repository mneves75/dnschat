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

- `targetServer`: DNS server/resolver we send packets to (e.g. `llm.pieter.com`, `8.8.8.8`).
- `zone`: suffix used to build the query name (e.g. `llm.pieter.com`).
- `label`: sanitized message label.

Algorithm (implemented by `composeDNSQueryName(label, dnsServer)`):

1. Strip trailing dots and whitespace from `label`.
2. Validate `dnsServer` (non-empty allowlisted hostname or IP; ports disallowed).
3. Determine `zone`:
   - If `dnsServer` is empty or an IPv4 address, use default zone `llm.pieter.com`
     (`DNS_CONSTANTS.DEFAULT_DNS_SERVER`).
   - Else use `dnsServer` (lowercased, trailing dot removed) as the zone.
4. Query name is `${label}.${zone}`.

Important consequence:

- If the user selects an IP resolver like `8.8.8.8`, we still query a name under
  `llm.pieter.com` (e.g. `hello-world.llm.pieter.com`) but we send it to
  resolver `8.8.8.8`.
- Since 4.4.0 this path is JavaScript-only. The native rung compiles in the LLM
  zones alone and rejects an IP resolver, so the chain falls through to UDP/TCP,
  which still honour it.
- Reachability: the Settings picker offers only `llm.pieter.com` and `ch.at`, so
  an IP resolver cannot be *newly selected*. It reaches the code path when an
  older install already persisted one -- `migrateSettings` preserves it and
  `validateDNSServer` still accepts it (see `__tests__/settings.migration.spec.ts`).
- With **Allow Experimental Transports** disabled the order is native-only, so
  such a stored IP resolver is retried `MAX_RETRIES` times against the native
  rung and then fails -- unless **Mock DNS** is also enabled, in which case the
  mock rung answers and the query succeeds.

## TXT response parsing

Input is a list of TXT strings as returned by the transport.

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
- DNS name parsing handles compression pointers with strict bounds checks and a small max-jump guard.
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
