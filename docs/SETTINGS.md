# Settings Guide

This document explains the DNS-related settings available in DNSChat and how they affect message transport.

## DNS Service

- `DNS TXT Service` (`dnsServer`): Hostname of the DNS server that receives TXT queries (default: `ch.at`). Native transports honor this selection on both iOS and Android.

## DNS Method Preference

Controls the order of transport methods attempted when sending DNS queries:

- `automatic`: Balanced fallback chain; respects the legacy “Prefer HTTPS” toggle.
- `prefer-https`: Start with DNS-over-HTTPS, then native/UDP/TCP.
- `udp-only`: Only uses UDP; no fallback to TCP/HTTPS.
- `never-https`: Use Native/UDP/TCP only; never attempt HTTPS.
- `native-first`: Always use native DNS first (iOS Network.framework / Android DnsResolver), then UDP/TCP/HTTPS.

Notes:

- On Web, only HTTPS is available.
- For `ch.at`, DNS-over-HTTPS is disabled (it cannot access ch.at’s custom TXT responses).

## Enable Mock DNS

When enabled, the fallback chain includes a local Mock transport that always returns a deterministic, development-friendly response. Useful on networks that block port 53 or when testing UI flows.

## Transport Test

The Settings screen includes actions to:

- Test the selected preference chain (logs each attempt and fallback).
- Force a specific transport (`native`, `udp`, `tcp`, or `https`).

Results and any errors are shown inline and in the Logs screen.
