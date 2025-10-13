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
    if (this.paused) {
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

    for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
      if (this.paused) {
        throw new BackgroundedError();
      }
      for (const transport of activeTransports) {
        if (this.paused) {
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
          errors.push(error as Error);
        }
      }

      if (attempt < MAX_RETRIES - 1) {
        const backoff = Math.min(1500, 250 * 2 ** attempt);
        const jitter = Math.random() * 120;
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
      const queryBuffer = dnsPacket.encode({
        type: 'query',
        id: Math.floor(Math.random() * 65535),
        flags: dnsPacket.RECURSION_DESIRED,
        questions: [{ type: 'TXT', name: domain }]
      });

      const onError = (error: Error) => {
        clearTimeout(timeout);
        cleanup();
        reject(new Error(`UDP transport failed: ${error.message}`));
      };

      const onMessage = (msg: Uint8Array) => {
        clearTimeout(timeout);
        cleanup();
        try {
          const packet = dnsPacket.decode(msg);
          resolve(extractTxtRecords(packet));
        } catch (error) {
          reject(new Error(`UDP decode failed: ${(error as Error).message}`));
        }
      };

      const cleanup = () => {
        try {
          socket.removeListener('error', onError);
          socket.removeListener('message', onMessage as any);
          socket.close();
        } catch {
          // ignore cleanup errors
        }
      };

      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('UDP transport timed out'));
      }, QUERY_TIMEOUT_MS);

      socket.on('error', onError);
      socket.on('message', onMessage as any);

      try {
        socket.send(queryBuffer, 0, queryBuffer.length, DNS_PORT, domain, (error?: Error) => {
          if (error) {
            clearTimeout(timeout);
            cleanup();
            reject(new Error(`UDP send failed: ${error.message}`));
          }
        });
      } catch (error) {
        clearTimeout(timeout);
        cleanup();
        reject(new Error(`UDP send threw: ${(error as Error).message}`));
      }
    });
  }

  private async queryTcp(domain: string): Promise<string[]> {
    const supported = await this.ensureTcpSupport();
    if (!supported || !this.tcpModule) {
      throw new Error(`TCP transport unavailable: ${this.tcpLoadError?.message ?? 'not linked in this build.'}`);
    }

    return new Promise<string[]>((resolve, reject) => {
      const socket = this.tcpModule!.createConnection({ host: domain, port: DNS_PORT, timeout: QUERY_TIMEOUT_MS }, () => {
        try {
          socket.write(payload);
        } catch (error) {
          clearTimeout(timeout);
          cleanup();
          reject(new Error(`TCP send threw: ${(error as Error).message}`));
        }
      });
      const queryBuffer = dnsPacket.encode({
        type: 'query',
        id: Math.floor(Math.random() * 65535),
        flags: dnsPacket.RECURSION_DESIRED,
        questions: [{ type: 'TXT', name: domain }]
      });
      const lengthBuffer = Buffer.alloc(2);
      lengthBuffer.writeUInt16BE(queryBuffer.length, 0);
      const payload = Buffer.concat([lengthBuffer, Buffer.from(queryBuffer)]);

      const cleanup = () => {
        try {
          socket.removeAllListeners();
          socket.destroy();
        } catch {
          // swallow cleanup errors
        }
      };

      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('TCP transport timed out'));
      }, QUERY_TIMEOUT_MS);

      let buffer = Buffer.alloc(0);

      socket.on('data', (chunk: Uint8Array) => {
        buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
        if (buffer.length < 2) return;
        const expectedLength = buffer.readUInt16BE(0);
        if (buffer.length - 2 >= expectedLength) {
          clearTimeout(timeout);
          const message = buffer.subarray(2, 2 + expectedLength);
          cleanup();
          try {
            const packet = dnsPacket.decode(message);
            resolve(extractTxtRecords(packet));
          } catch (error) {
            reject(new Error(`TCP decode failed: ${(error as Error).message}`));
          }
        }
      });

      socket.once('error', (error: Error) => {
        clearTimeout(timeout);
        cleanup();
        reject(new Error(`TCP transport failed: ${error.message}`));
      });

      socket.once('close', () => {
        clearTimeout(timeout);
        cleanup();
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
