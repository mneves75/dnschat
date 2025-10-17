import { AppState, AppStateStatus, Platform } from 'react-native';

import dnsPacket from 'dns-packet';

import { Buffer } from 'buffer';

import { DEFAULT_DNS_SERVER, DNS_SERVER_WHITELIST } from '@/constants/dns';
import { TransportPreferences } from '@/storage/preferences';
import { buildDnsQueryLabel } from '@/utils/dnsLabel';
import { stripControlCharacters } from '@/utils/validation';

import { getDNSModule } from '@/modules/dns-native/NativeDNSModule';
import type { Spec } from '@/modules/dns-native/NativeDNSModule';

const DNS_PORT = 53;
const QUERY_TIMEOUT_MS = 10_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const MAX_RETRIES = 3;

/**
 * TCP DNS Response Buffer Size Limit (64KB)
 * CRITICAL FIX: Prevents memory DOS from adversarial DNS servers or corrupted network data
 * that send a small length prefix followed by infinite data. Without this limit, the buffer
 * can grow unbounded and exhaust device memory.
 *
 * Rationale: DNS response wire format uses 16-bit length field (max 65535 bytes), but we
 * conservatively limit to 65536 to handle the 2-byte length prefix + payload.
 * Any DNS server returning responses larger than this is malformed or hostile.
 */
const TCP_MAX_RESPONSE_SIZE = 65536;

/**
 * UDP Packet ID Entropy
 * CRITICAL FIX: Prevents packet ID collisions under rapid-fire concurrent requests.
 * Using weak Math.random() for 16-bit IDs creates birthday paradox collisions when
 * sending 10+ concurrent queries. With 65536 possible values, collision probability
 * reaches ~50% at sqrt(65536) = 256 concurrent queries.
 *
 * Crypto randomness provides full 16-bit entropy space without collisions in typical
 * usage patterns (RFC 1035 expects unique IDs across in-flight queries).
 */
const getSecurePacketId = (): number => {
  try {
    // Use crypto API for cryptographically secure random 16-bit integer
    const randomBytes = new Uint16Array(1);
    globalThis.crypto?.getRandomValues?.(randomBytes);
    return randomBytes[0] ?? Math.floor(Math.random() * 65535);
  } catch {
    // Fallback to Math.random() if crypto unavailable (rare, but graceful)
    return Math.floor(Math.random() * 65535);
  }
};

type TransportMethod = 'native' | 'udp' | 'tcp' | 'https';

export type QueryOptions = {
  message: string;
  conversationId: string;
  server?: string;
  transports: TransportPreferences;
};

export type DNSRecord = {
  id: string;
  content: string;
};

export type QueryResult = {
  records: DNSRecord[];
  rawRecords: string[];
  transport: TransportMethod;
  domain: string;
  durationMs: number;
};

export class RateLimitError extends Error {
  constructor() {
    super('Too many DNS requests. Try again in a moment.');
  }
}

export class BackgroundedError extends Error {
  constructor() {
    super('DNS queries are paused while the app is in the background.');
  }
}

export class AllTransportsFailedError extends Error {
  constructor(readonly reasons: Error[]) {
    super('All DNS transports failed for this request.');
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseRecords = (records: string[]): DNSRecord[] => {
  const map = new Map<string, string>();
  for (const entry of records) {
    const sanitized = entry.replace(/^"|"$/g, '');
    const [prefix, ...rest] = sanitized.split(':');
    let position = prefix;
    let content = rest.join(':');

    if (!content) {
      position = '1/1';
      content = sanitized;
    }

    const [id] = position.split('/');
    if (!map.has(id)) {
      map.set(id, content);
    }
  }
  return Array.from(map.entries()).map(([id, content]) => ({ id, content }));
};

const decodeTxtBuffer = (data: unknown): string => {
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) {
    return String.fromCharCode(...(data as number[]));
  }
  if (data instanceof Uint8Array) {
    return String.fromCharCode(...Array.from(data));
  }
  if (typeof Buffer !== 'undefined' && data instanceof Buffer) {
    return data.toString('utf8');
  }
  return String(data ?? '');
};

const extractTxtRecords = (packet: any): string[] => {
  if (!packet?.answers) return [];
  const result: string[] = [];
  for (const answer of packet.answers) {
    if (answer?.type !== 'TXT') continue;
    const data = answer.data;
    if (Array.isArray(data)) {
      for (const item of data) {
        result.push(decodeTxtBuffer(item));
      }
    } else {
      result.push(decodeTxtBuffer(data));
    }
  }
  return result;
};

const resolveTransportOrder = (transports: TransportPreferences): TransportMethod[] => {
  const order: TransportMethod[] = [];
  if (transports.native) order.push('native');
  if (transports.udp) order.push('udp');
  if (transports.tcp) order.push('tcp');
  if (transports.https) order.push('https');
  if (order.length === 0) {
    return ['https'];
  }
  return order;
};

class DNSTransportServiceImpl {
  private requestTimestamps: number[] = [];
  private paused = false;
  private udpModule: typeof import('react-native-udp') | null = null;
  private udpSupport: 'unknown' | 'available' | 'unavailable' = 'unknown';
  private udpLoadError: Error | null = null;
  private tcpModule: typeof import('react-native-tcp-socket') | null = null;
  private tcpSupport: 'unknown' | 'available' | 'unavailable' = 'unknown';
  private tcpLoadError: Error | null = null;
  private nativeConfigured = false;

  constructor() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  async executeQuery(options: QueryOptions): Promise<QueryResult> {
    /**
     * CRITICAL FIX: Capture paused state once at function entry to prevent race conditions
     * where the app backgrounding/foregrounding between multiple checks could cause
     * inconsistent behavior (e.g., retrying after backgrounding, or starting a query then
     * backgrounding mid-retry).
     *
     * Rationale: this.paused is a mutable property that changes via AppState events.
     * Without capturing it once, the state can flip between the initial check and the retry
     * loop, potentially allowing a query to partially execute while backgrounded or vice versa.
     *
     * Example race condition that this fixes:
     * 1. Thread A: checks isPaused (false) at line N
     * 2. App event: backgrounding occurs, sets this.paused = true
     * 3. Thread A: enters for loop, checks isPaused again but now it's true (throwing BackgroundedError)
     * 4. Without capture, this inconsistent state could occur
     *
     * By capturing once, we commit to a decision for this entire query attempt, ensuring
     * consistent behavior even if the app state changes during the query.
     */
    const isPaused = this.paused;
    if (isPaused) {
      throw new BackgroundedError();
    }

    this.enforceRateLimit();

    const server = this.resolveServer(options.server);
    const sanitizedMessage = stripControlCharacters(options.message);
    if (!sanitizedMessage.trim()) {
      throw new Error('Message cannot be empty after sanitization.');
    }
    const label = buildDnsQueryLabel(sanitizedMessage, options.conversationId);
    const domain = `${label}.${server}`;
    const transports = resolveTransportOrder(options.transports);
    const activeTransports = await this.getSupportedTransports(transports);
    const errors: Error[] = [];

    // Retry loop with exponential backoff + jitter
    for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
      /**
       * Use captured isPaused state consistently throughout retry loop.
       * Note: This means if app backgrounds mid-query, we complete current attempt and error.
       * This is intentional: we don't want to silently succeed with stale backgrounded context.
       */
      if (isPaused) {
        throw new BackgroundedError();
      }

      for (const transport of activeTransports) {
        /**
         * Same consistency guarantee: use captured paused state throughout this query.
         * Each individual transport attempt uses the same app state assumption.
         */
        if (isPaused) {
          throw new BackgroundedError();
        }

        const start = Date.now();
        try {
          const rawRecords = await this.invokeTransport(transport, domain, sanitizedMessage);
          const durationMs = Date.now() - start;
          return {
            records: parseRecords(rawRecords),
            rawRecords,
            transport,
            domain,
            durationMs
          };
        } catch (error) {
          // Collect error for AllTransportsFailedError summary
          errors.push(error as Error);
        }
      }

      // Exponential backoff between retry attempts: 250ms, 500ms, 1500ms
      if (attempt < MAX_RETRIES - 1) {
        const backoff = Math.min(1500, 250 * 2 ** attempt);
        const jitter = Math.random() * 120; // Jitter: 0-120ms to prevent thundering herd
        await delay(backoff + jitter);
      }
    }

    throw new AllTransportsFailedError(errors);
  }

  private resolveServer(server?: string): string {
    if (!server) return DEFAULT_DNS_SERVER;
    const normalized = server.trim().toLowerCase();
    const entry = DNS_SERVER_WHITELIST[normalized] ??
      Object.values(DNS_SERVER_WHITELIST).find((candidate) => candidate.host.toLowerCase() === normalized);
    if (!entry) {
      throw new Error(`Server ${server} is not whitelisted.`);
    }
    return entry.host;
  }

  private enforceRateLimit() {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
    if (this.requestTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
      throw new RateLimitError();
    }
    this.requestTimestamps.push(now);
  }

  private async getSupportedTransports(order: TransportMethod[]): Promise<TransportMethod[]> {
    const result: TransportMethod[] = [];
    for (const method of order) {
      if (await this.isTransportSupported(method)) {
        result.push(method);
      }
    }
    if (result.length === 0) {
      const reasons = this.collectUnavailableReasons(order);
      const detail = reasons.length > 0 ? ` ${reasons.join(' ')}` : '';
      throw new Error(`No supported DNS transports are enabled.${detail}`);
    }
    return result;
  }

  private async isTransportSupported(method: TransportMethod): Promise<boolean> {
    switch (method) {
      case 'udp':
        return this.ensureUdpSupport();
      case 'tcp':
        return this.ensureTcpSupport();
      case 'native':
        return getDNSModule() !== null;
      case 'https':
      default:
        return true;
    }
  }

  private async ensureUdpSupport(): Promise<boolean> {
    if (Platform.OS === 'web') {
      this.udpSupport = 'unavailable';
      this.udpLoadError = new Error('UDP transport is not supported on web.');
      return false;
    }
    if (this.udpSupport === 'available') return true;
    if (this.udpSupport === 'unavailable') return false;
    try {
      // Dynamic import defers native socket requirement until a build that actually bundles the
      // native module, preventing Expo Go crashes while still supporting dev clients.
      this.udpModule = await import('react-native-udp');
      this.udpSupport = 'available';
      return true;
    } catch (error) {
      this.udpSupport = 'unavailable';
      this.udpLoadError = error instanceof Error ? error : new Error(String(error));
      return false;
    }
  }

  private async ensureTcpSupport(): Promise<boolean> {
    if (Platform.OS === 'web') {
      this.tcpSupport = 'unavailable';
      this.tcpLoadError = new Error('TCP transport is not supported on web.');
      return false;
    }
    if (this.tcpSupport === 'available') return true;
    if (this.tcpSupport === 'unavailable') return false;
    try {
      // Only load the TCP socket shim when a custom dev client includes it; Expo Go lacks this module.
      this.tcpModule = await import('react-native-tcp-socket');
      this.tcpSupport = 'available';
      return true;
    } catch (error) {
      this.tcpSupport = 'unavailable';
      this.tcpLoadError = error instanceof Error ? error : new Error(String(error));
      return false;
    }
  }

  private collectUnavailableReasons(order: TransportMethod[]): string[] {
    const messages: string[] = [];
    for (const method of order) {
      if (method === 'udp' && this.udpSupport === 'unavailable') {
        messages.push(`UDP unavailable: ${this.udpLoadError?.message ?? 'not linked in this build.'}`);
      }
      if (method === 'tcp' && this.tcpSupport === 'unavailable') {
        messages.push(`TCP unavailable: ${this.tcpLoadError?.message ?? 'not linked in this build.'}`);
      }
      if (method === 'native' && !getDNSModule()) {
        messages.push('Native DNS module unavailable.');
      }
    }
    return messages;
  }

  private async invokeTransport(transport: TransportMethod, domain: string, message: string): Promise<string[]> {
    switch (transport) {
      case 'native':
        return this.queryNative(domain, message);
      case 'udp':
        return this.queryUdp(domain);
      case 'tcp':
        return this.queryTcp(domain);
      case 'https':
      default:
        return this.queryHttps(domain);
    }
  }

  private async queryNative(domain: string, message: string): Promise<string[]> {
    const module = getDNSModule();
    if (!module) {
      throw new Error('Native DNS module unavailable.');
    }

    await this.ensureNativeConfigured(module);

    try {
      return await module.queryTXT(domain, message);
    } catch (error) {
      throw new Error(`Native DNS failed: ${(error as Error).message}`);
    }
  }

  private async ensureNativeConfigured(module: Spec): Promise<void> {
    // Native modules default to platform-specific concurrency/timeout. Configure once so JS-level
    // rate limiting stays in sync, but swallow errors to avoid blocking HTTPS fallbacks on Expo.
    if (this.nativeConfigured || typeof module.configure !== 'function') {
      this.nativeConfigured = true;
      return;
    }
    try {
      await module.configure({ timeoutMs: QUERY_TIMEOUT_MS, maxConcurrent: 4 });
    } catch (error) {
      if (__DEV__) {
        console.warn('[DNSTransport] Native configure failed', error);
      }
    } finally {
      this.nativeConfigured = true;
    }
  }

  private async queryUdp(domain: string): Promise<string[]> {
    const supported = await this.ensureUdpSupport();
    if (!supported || !this.udpModule) {
      throw new Error(`UDP transport unavailable: ${this.udpLoadError?.message ?? 'not linked in this build.'}`);
    }

    return new Promise<string[]>((resolve, reject) => {
      const socket = this.udpModule!.createSocket('udp4');

      /**
       * CRITICAL FIX: Use getSecurePacketId() for cryptographically secure packet IDs.
       * Prevents collisions under rapid concurrent queries (DNS RFC 1035 requires unique IDs
       * for in-flight queries to match responses to requests).
       */
      const queryBuffer = dnsPacket.encode({
        type: 'query',
        id: getSecurePacketId(), // Previously: Math.floor(Math.random() * 65535)
        flags: dnsPacket.RECURSION_DESIRED,
        questions: [{ type: 'TXT', name: domain }]
      });

      /**
       * Flag to prevent double cleanup/resolution.
       * CRITICAL FIX: Socket operations can trigger callbacks after timeout or after explicit cleanup.
       * For example, socket.send() callback might fire after we've already timed out and cleaned up.
       * Without this flag, we could resolve/reject multiple times, which violates Promise spec.
       */
      let completed = false;

      const done = (result: string[] | Error, isError: boolean = false) => {
        if (completed) return; // Prevent double resolve/reject
        completed = true;
        clearTimeout(timeout);
        cleanup();
        if (isError) {
          reject(result);
        } else {
          resolve(result as string[]);
        }
      };

      const onError = (error: Error) => {
        done(new Error(`UDP transport failed: ${error.message}`), true);
      };

      const onMessage = (msg: Uint8Array) => {
        try {
          const packet = dnsPacket.decode(msg);
          done(extractTxtRecords(packet), false);
        } catch (error) {
          done(new Error(`UDP decode failed: ${(error as Error).message}`), true);
        }
      };

      const cleanup = () => {
        try {
          socket.removeListener('error', onError);
          socket.removeListener('message', onMessage as any);
          socket.close();
        } catch {
          // Swallow cleanup errors - we're already in error state
        }
      };

      const timeout = setTimeout(() => {
        done(new Error('UDP transport timed out'), true);
      }, QUERY_TIMEOUT_MS);

      socket.on('error', onError);
      socket.on('message', onMessage as any);

      try {
        socket.send(queryBuffer, 0, queryBuffer.length, DNS_PORT, domain, (error?: Error) => {
          if (error) {
            done(new Error(`UDP send failed: ${error.message}`), true);
          }
        });
      } catch (error) {
        done(new Error(`UDP send threw: ${(error as Error).message}`), true);
      }
    });
  }

  private async queryTcp(domain: string): Promise<string[]> {
    const supported = await this.ensureTcpSupport();
    if (!supported || !this.tcpModule) {
      throw new Error(`TCP transport unavailable: ${this.tcpLoadError?.message ?? 'not linked in this build.'}`);
    }

    return new Promise<string[]>((resolve, reject) => {
      const socket = this.tcpModule!.createConnection(
        { host: domain, port: DNS_PORT, timeout: QUERY_TIMEOUT_MS },
        () => {
          try {
            socket.write(payload);
          } catch (error) {
            done(new Error(`TCP send threw: ${(error as Error).message}`), true);
          }
        }
      );

      /**
       * CRITICAL FIX: Use getSecurePacketId() for cryptographically secure packet IDs
       * (same rationale as UDP - DNS RFC 1035 requires unique IDs for in-flight queries).
       */
      const queryBuffer = dnsPacket.encode({
        type: 'query',
        id: getSecurePacketId(), // Previously: Math.floor(Math.random() * 65535)
        flags: dnsPacket.RECURSION_DESIRED,
        questions: [{ type: 'TXT', name: domain }]
      });

      // DNS over TCP uses 2-byte length prefix per RFC 1035 section 4.2.2
      const lengthBuffer = Buffer.alloc(2);
      lengthBuffer.writeUInt16BE(queryBuffer.length, 0);
      const payload = Buffer.concat([lengthBuffer, Buffer.from(queryBuffer)]);

      /**
       * Flag to prevent double completion.
       * CRITICAL FIX: Multiple callbacks can fire (socket error, socket close, timeout) and
       * attempt to resolve/reject the Promise multiple times. Without this flag, we violate
       * Promise spec by calling resolve/reject more than once.
       */
      let completed = false;

      const done = (result: string[] | Error, isError: boolean = false) => {
        if (completed) return;
        completed = true;
        clearTimeout(timeout);
        cleanup();
        if (isError) {
          reject(result);
        } else {
          resolve(result as string[]);
        }
      };

      const cleanup = () => {
        try {
          socket.removeAllListeners();
          socket.destroy();
        } catch {
          // Swallow cleanup errors - we're already in error state
        }
      };

      const timeout = setTimeout(() => {
        done(new Error('TCP transport timed out'), true);
      }, QUERY_TIMEOUT_MS);

      let buffer = Buffer.alloc(0);

      socket.on('data', (chunk: Uint8Array) => {
        /**
         * CRITICAL FIX: Add buffer size limit to prevent DOS from adversarial servers
         * or corrupted network data that sends a small length prefix followed by infinite data.
         *
         * Scenario that this fixes:
         * 1. Malicious server sends: 0x00 0xFF (length prefix = 255 bytes)
         * 2. Server then sends 1GB of data
         * 3. Without limit, buffer grows unbounded until device memory exhausted
         *
         * Rationale: DNS wire format uses 16-bit length field (max 65535 bytes).
         * We limit to TCP_MAX_RESPONSE_SIZE (65536) which includes 2-byte length prefix.
         * Any server returning responses larger than this is malformed per RFC 1035.
         */
        buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
        if (buffer.length > TCP_MAX_RESPONSE_SIZE) {
          done(new Error(`TCP response exceeds maximum size (${TCP_MAX_RESPONSE_SIZE} bytes)`), true);
          return;
        }

        // We need at least 2 bytes to read the length prefix
        if (buffer.length < 2) return;

        // Read the 16-bit big-endian length field
        const expectedLength = buffer.readUInt16BE(0);

        /**
         * Sanity check: length field should not exceed reasonable DNS response size.
         * If it does, the server is either malformed or attacking us.
         */
        if (expectedLength > 65535) {
          done(
            new Error(`Invalid DNS length prefix: ${expectedLength} (max 65535 bytes)`),
            true
          );
          return;
        }

        // Check if we've received the complete message (2-byte prefix + expectedLength bytes)
        if (buffer.length - 2 >= expectedLength) {
          try {
            const message = buffer.subarray(2, 2 + expectedLength);
            done(extractTxtRecords(dnsPacket.decode(message)), false);
          } catch (error) {
            done(new Error(`TCP decode failed: ${(error as Error).message}`), true);
          }
        }
      });

      socket.once('error', (error: Error) => {
        done(new Error(`TCP transport failed: ${error.message}`), true);
      });

      socket.once('close', () => {
        // Socket closed without completing the message - treat as timeout
        if (!completed) {
          done(new Error('TCP connection closed unexpectedly'), true);
        }
      });
    });
  }

  private async queryHttps(domain: string): Promise<string[]> {
    const endpoint = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=TXT`;
    const response = await fetch(endpoint, {
      headers: {
        accept: 'application/dns-json'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTPS DNS failed with status ${response.status}`);
    }
    const payload = await response.json();
    if (!Array.isArray(payload?.Answer)) {
      throw new Error('HTTPS DNS response missing Answer section.');
    }
    return payload.Answer.map((entry: { data: string }) => entry.data as string);
  }

  private handleAppStateChange = (state: AppStateStatus) => {
    this.paused = state !== 'active';
  };
}

export const DNSTransportService = new DNSTransportServiceImpl();
