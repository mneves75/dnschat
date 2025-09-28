# ch.at Compatibility Audit — Plan and TODO

## Direct Conclusions
- Default transport must be DNS. Do not attempt HTTPS unless the user explicitly opts in. Implemented by removing implicit HTTPS from the default method order; HTTPS appears only when the user selects the "Prefer HTTPS" option. On web, HTTPS remains the only viable transport. Verified against the ch.at README which documents DNS usage as the primary interface via TXT queries.
- Query name equals the sanitized message label, not `<label>.ch.at`. Confirmed by the documented example: `dig @ch.at "what-is-2+2" TXT` — the question name is the message, server is `@ch.at`.
- Preserve `+` in labels. The public example uses `what-is-2+2`; removing `+` would change semantics. Sanitization updated to allow `+` in both app and Node smoke.

## Changes Completed
- Transport policy: `native-first` and `automatic` now exclude HTTPS unless user opt-in (`preferDnsOverHttps` or `prefer-https`). Web still uses HTTPS.
- Sanitization: allow `+` (alphanumeric, `-`, `+`), keep RFC 1035 length (≤63). Validation still blocks control/injection characters.
- Node smoke: default UDP to `ch.at:53`; added `--tcp` and UDP→TCP fallback for restricted networks; the name equals sanitized message only.
- Tests: updated order expectations to reflect DNS-only defaults; all suites pass.

## Open Risks
- Some networks block UDP/53 and TCP/53; Node smoke will fail by design. Use device/app with native stack on another network.
- If ch.at evolves label grammar, revisit allowed character set beyond `+`.

## Plan
- UI clarity: ensure Settings text states “Default transport: DNS (UDP/native). Enable HTTPS only if required.”
- Telemetry-free logs: keep DNS logs local-only; do not transmit queries.
- Manual validation checklist per release:
  - `dig @ch.at "hello" TXT` returns a sensible answer.
  - App query with same prompt returns comparable text.
  - Node smoke `node test-dns-simple.js "hello"` returns TXT preview.
  - Toggle “Prefer HTTPS”; verify app does not use HTTPS unless enabled.

## TODO
- Copy review in Settings for transport options (explicit DNS default language).
- Add a one-line helper under input explaining allowed characters; keep `+`.
- Optional: expose a developer toggle to display the exact qname sent.

## References
- ch.at README — primary interface is DNS TXT queries; example `dig @ch.at "what-is-2+2" TXT`.
