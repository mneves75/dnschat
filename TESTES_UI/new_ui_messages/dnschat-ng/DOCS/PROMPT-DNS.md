### DNS Implementation Details

**DNS Query Flow**:
1. User message → validateDNSMessage() → sanitizeDNSMessage()
2. composeDNSQueryName() creates `<label>.<dnsServer>` (e.g., `hello.ch.at`)
3. queryLLM() attempts methods in order based on preference
4. parseTXTResponse() handles multi-part responses (e.g., `1/3:part1`, `2/3:part2`, `3/3:part3`)

**Security**:
- Input validation rejects control characters and DNS special characters
- Server whitelist allows only ch.at, Google DNS, Cloudflare
- Message sanitization: lowercase → trim → spaces-to-dashes → remove-invalid → truncate(63)

**Method Order** (default: `native-first`):
1. **Native DNS**: iOS Network Framework / Android DnsResolver
2. **UDP DNS**: `react-native-udp` (direct socket)
3. **TCP DNS**: `react-native-tcp-socket` (for UDP-blocked networks)
4. **DNS-over-HTTPS**: Cloudflare (limited - cannot reach ch.at custom TXT)
5. **Mock Service**: Development fallback (always succeeds)

**Known Limitations**:
- DNS-over-HTTPS cannot access ch.at's custom TXT responses (resolver architecture limitation)
- UDP/TCP may be blocked on corporate networks (port 53)
- Queries suspend when app is backgrounded
