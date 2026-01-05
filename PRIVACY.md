# Privacy Policy

Last updated: 2026-01-04

DNSChat is an open-source mobile app that sends short prompts via DNS TXT queries and stores chat history locally on your device. This policy explains what data the app processes and how you can control it.

## Data We Process

- **Chat content**: Messages you type are sent as DNS TXT queries to the DNS resolver you choose (default: ch.at) and the responses are displayed in the app.
- **DNS query logs**: The app stores local logs about DNS query attempts (method, timestamps, status). Query/response content is hashed in logs.
- **Settings**: Your preferences (DNS server, language, haptics, accessibility) are stored locally.

## How We Use Data

Data is used only to provide app functionality: sending DNS queries, showing responses, keeping your chat history, and enabling diagnostics via the Logs screen.

## Data Storage and Security

- Chat history and DNS logs are stored locally on your device and encrypted at rest.
- The app does not use analytics SDKs, advertising SDKs, or remote tracking services.

## Network Transmission

DNSChat sends your messages as DNS queries to the configured DNS resolver. Standard DNS over UDP/TCP (port 53) is not encrypted in transit. The app does not implement DNS-over-HTTPS or DNS-over-TLS at this time.

## Data Sharing

The app does not sell your data. Messages are transmitted to DNS resolvers to fetch responses; those resolvers may process the queries to provide a reply. No other third-party services are used for analytics or tracking.

## Your Choices

You can delete locally stored chat history and DNS logs at any time from the Settings screen using the “Clear Local Data” action.

## Contact

If you have privacy questions, open an issue at https://github.com/mneves75/dnschat/issues.
