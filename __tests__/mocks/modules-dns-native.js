// Jest mock for local native DNS module and constants

class DNSError extends Error {
  constructor(type, message, cause) {
    super(message);
    this.name = 'DNSError';
    this.type = type;
    this.cause = cause;
  }
}

const DNSErrorType = {
  PLATFORM_UNSUPPORTED: 'PLATFORM_UNSUPPORTED',
  NETWORK_UNAVAILABLE: 'NETWORK_UNAVAILABLE',
  DNS_SERVER_UNREACHABLE: 'DNS_SERVER_UNREACHABLE',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  TIMEOUT: 'TIMEOUT',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  DNS_QUERY_FAILED: 'DNS_QUERY_FAILED',
};

const nativeDNS = {
  async isAvailable() {
    return {
      available: false,
      platform: 'web',
      supportsCustomServer: false,
      supportsAsyncQuery: false,
    };
  },
  async queryTXT(_domain, _message) {
    return ['mock'];
  },
  parseMultiPartResponse(txtRecords) {
    if (!Array.isArray(txtRecords) || txtRecords.length === 0) {
      throw new DNSError(DNSErrorType.INVALID_RESPONSE, 'No TXT records to parse');
    }
    const parts = [];
    for (const r of txtRecords) {
      const m = String(r || '').match(/^(\d+)\/(\d+):(.*)$/);
      if (!m) return String(r);
      parts.push({ n: parseInt(m[1], 10), t: parseInt(m[2], 10), c: m[3] });
    }
    parts.sort((a, b) => a.n - b.n);
    const expected = parts[0]?.t || 1;
    if (parts.length !== expected) {
      throw new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        `Incomplete multi-part response: got ${parts.length} parts, expected ${expected}`,
      );
    }
    return parts.map((p) => p.c).join('');
  },
};

const DNS_CONSTANTS = {
  ALLOWED_DNS_SERVERS: ['ch.at', 'llm.pieter.com', '8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1'],
};

module.exports = {
  nativeDNS,
  DNSError,
  DNSErrorType,
  DNS_CONSTANTS,
};

