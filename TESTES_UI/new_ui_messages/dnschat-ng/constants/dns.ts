export type DNSWhitelistEntry = {
  host: string;
  label: string;
  default?: boolean;
};

export const DNS_SERVER_WHITELIST: Record<string, DNSWhitelistEntry> = {
  'ch.at': { host: 'ch.at', label: 'ch.at Primary', default: true },
  'llm.pieter.com': { host: 'llm.pieter.com', label: 'Pieter LLM' },
  'dns.google': { host: 'dns.google', label: 'Google Public DNS' },
  'one.one.one.one': { host: 'one.one.one.one', label: 'Cloudflare' }
};

export const DEFAULT_DNS_SERVER = Object.values(DNS_SERVER_WHITELIST).find(
  (entry) => entry.default
)?.host ?? 'ch.at';
