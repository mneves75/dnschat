# ch.at DNS Server Compatibility — Plan and TODO

## Scope
- Align client behavior with ch.at’s DNS server (dns.go) semantics.
- Default to DNS transports only unless the user explicitly opts into HTTPS.
- Keep query name equal to the sanitized message label (no suffixing).

## Observations
- Access to dns.go via GitHub intermittently fails to render in the CLI’s fetcher; raw viewing is restricted by the harness. Link for reference: https://github.com/Deep-ai-inc/ch.at/blob/main/dns.go. The public project description and examples indicate TXT over UDP with QNAME equal to the user prompt label (e.g., `dig @ch.at "what-is-2+2" TXT`).
- Our transport stack already issues a TXT query with message-as-label and implements multi‑part TXT parsing in the `n/N:` prefix form.

## Verified Client Behaviors
- QTYPE=TXT, QCLASS=IN, random 16‑bit ID, standard RD flag for UDP.
- Name construction: sanitized label only, not `<label>.ch.at`.
- Sanitization preserves `+` and `-`; collapses spaces to `-`; length ≤ 63.
- Default method order (mobile): native → udp → (tcp if enabled); HTTPS excluded by default.
- Web: HTTPS remains only option.

## Gaps/Risks
- TCP may be refused by the server or blocked by networks; supported only as optional/explicit path.
- If ch.at changes label grammar beyond `+` and `-`, our sanitizer may over‑constrain input.
- Direct evidence from dns.go could not be scraped in this session; treat the above as best‑effort corroborated by public examples and live responses.

## Plan
1) Transport defaults
- Keep DNS only by default; include HTTPS only when user selects it.
- Do not auto‑fallback to HTTPS on mobile when DNS fails.

2) Label handling
- Preserve `+` and `-`; keep 63‑char limit; continue blocking control/injection characters.
- Add a one‑line hint under the input: “Allowed: letters, digits, `-`, `+`.”

3) Diagnostics
- Logs must show the exact method order attempted and the final transport.
- Developer toggle (optional) to reveal QNAME for the last query in Logs.

4) Node smoke
- Default UDP; add `--tcp` and `--udp-only` flags (implemented) to test restricted networks.
- No suffixing; target host `ch.at` on port 53.

5) Documentation
- Update Settings copy: “Default transport: DNS (UDP/native). Enable HTTPS only if required.”
- Add this file to release notes as the server‑compat checklist.

## TODO
- [ ] Settings copy: clarify DNS‑first default, HTTPS opt‑in only.
- [ ] Input helper text: allowed characters include `+`.
- [ ] Optional dev toggle: show last QNAME in Logs.
- [ ] Re‑run live checks: `dig @ch.at "hello" TXT` vs app result; archive outputs in project logs.

## References
- dns.go (server component) — content reference link: https://github.com/Deep-ai-inc/ch.at/blob/main/dns.go
- Project announcement/usage examples (TXT over DNS): https://news.ycombinator.com/item?id=44526221
