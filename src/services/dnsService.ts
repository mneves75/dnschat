import { Platform, AppState } from 'react-native';
import * as dns from 'dns-packet';
import { nativeDNS, DNSError, DNSErrorType } from '../../modules/dns-native';
import { DNSLogService } from './dnsLogService';
import { DNSMethodPreference } from '../context/SettingsContext';

// Try to import UDP and TCP, fallback to null if not available
let dgram: any = null;
let TcpSocket: any = null;
let Buffer: any = null;

try {
  dgram = require('react-native-udp');
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('✅ UDP library loaded successfully:', !!dgram);
  }
} catch (error) {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('❌ UDP library failed to load:', error);
  }
  // UDP not available, will use fallback methods
}

try {
  const tcpLibrary = require('react-native-tcp-socket');
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('🔍 TCP Socket library structure:', Object.keys(tcpLibrary));
  }
  TcpSocket = tcpLibrary; // Use the entire library object
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('✅ TCP Socket library loaded successfully:', !!TcpSocket && !!TcpSocket.Socket);
  }
} catch (error) {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('❌ TCP Socket library failed to load:', error);
  }
  // TCP Socket not available, will use DNS-over-HTTPS fallback
}

// Try to import Buffer (Node.js environment) or create a minimal polyfill
try {
  // In React Native, Buffer might be available via a polyfill
  Buffer = global.Buffer || require('buffer').Buffer;
} catch (error) {
  // Create minimal Buffer polyfill for web environments
  Buffer = {
    alloc: (size: number) => new Uint8Array(size),
    allocUnsafe: (size: number) => new Uint8Array(size),
    concat: (arrays: Uint8Array[]) => {
      const totalLength = arrays.reduce((len, arr) => len + arr.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
      }
      return result;
    },
    from: (data: any) => (data instanceof Uint8Array ? data : new Uint8Array(data)),
    isBuffer: (obj: any) =>
      obj instanceof Uint8Array || (obj && typeof obj === 'object' && 'length' in obj),
  };
}

// Safe helpers for logging/decoding
function safeStringify(value: any): string {
  try {
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    return JSON.stringify(value);
  } catch {
    try {
      return String(value);
    } catch {
      return '<unstringifiable>';
    }
  }
}

function safeDecodeBytes(bytes: any): string {
  try {
    const TD: any =
      (global as any)?.TextDecoder ?? (typeof TextDecoder !== 'undefined' ? TextDecoder : null);
    if (TD) {
      const dec = new TD('utf-8');
      return dec.decode(bytes as Uint8Array);
    }
  } catch {}
  try {
    if (Buffer && typeof Buffer.from === 'function') {
      return Buffer.from(bytes as Uint8Array).toString('utf8');
    }
  } catch {}
  try {
    const arr = bytes as Uint8Array;
    let out = '';
    for (let i = 0; i < arr.length; i++) out += String.fromCharCode(arr[i]);
    return out;
  } catch {
    return '';
  }
}

/**
 * Validate a user message for DNS-safe usage.
 * Throws on invalid inputs. Non-printable and control characters are rejected.
 * SECURITY: Enhanced validation to prevent DNS injection attacks
 */
export function validateDNSMessage(message: string): void {
  if (!message || typeof message !== 'string') {
    throw new Error('Message must be a non-empty string');
  }

  if (message.length > 255) {
    throw new Error('Message too long (maximum 255 characters)');
  }

  if (message.trim().length === 0) {
    throw new Error('Message cannot be empty or contain only whitespace');
  }

  // CRITICAL: Reject ALL control characters and potential DNS injection patterns
  const dangerousPatterns = [
    /[\x00-\x1F\x7F-\x9F]/, // ALL control characters (including null bytes)
    /[<>'"&`]/, // HTML/XML/Shell injection chars
    /[@:]/, // DNS special characters that could alter queries
    /\\\w/, // Escaped sequences
    /\$\{/, // Template injection
    /[()]/, // Function calls
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(message)) {
      throw new Error('Message contains invalid or potentially dangerous characters');
    }
  }
  
  // Additional check: Reject if message looks like a domain or IP
  if (/^[\d.]+$/.test(message) || /\.[a-z]{2,}$/i.test(message)) {
    throw new Error('Message cannot be an IP address or domain name');
  }
}

/**
 * Sanitize a user message into a single DNS label (RFC 1035 compliant):
 * SECURITY: Strict sanitization to prevent DNS injection
 * - Validate first
 * - Allow ONLY alphanumeric and dash
 * - Convert spaces to dashes
 * - Force lowercase
 * - Truncate to 63 chars (DNS label limit)
 */
export function sanitizeDNSMessage(message: string): string {
  validateDNSMessage(message);

  // SECURITY: Only allow known-safe characters
  const sanitized = message
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // spaces to dashes
    .replace(/[^a-z0-9-]/g, '') // ONLY alphanumeric and dash
    .replace(/^-+|-+$/g, '') // no leading/trailing dashes
    .replace(/-{2,}/g, '-') // collapse multiple dashes
    .substring(0, 63); // DNS label limit
    
  // Final safety check
  if (sanitized.length === 0) {
    throw new Error('Message contains no valid characters after sanitization');
  }
  
  return sanitized;
}

/**
 * Validate DNS server to prevent redirection attacks
 * SECURITY: Only allow known-safe DNS servers
 */
export function validateDNSServer(server: string): void {
  if (!server || typeof server !== 'string') {
    throw new Error('DNS server must be a non-empty string');
  }
  
  // Whitelist of allowed DNS servers
  const allowedServers = [
    'ch.at', // Primary chat DNS server
    '8.8.8.8', // Google DNS (fallback)
    '8.8.4.4', // Google DNS secondary
    '1.1.1.1', // Cloudflare DNS (fallback)
    '1.0.0.1', // Cloudflare DNS secondary
  ];
  
  // Allow exact matches only (no subdomains or variations)
  if (!allowedServers.includes(server.toLowerCase().trim())) {
    throw new Error(`DNS server '${server}' is not in the allowed list. Use: ${allowedServers.join(', ')}`);
  }
}

/**
 * Parse TXT records returned by DNS into a single response string.
 * Behavior mirrors native module semantics:
 * - If any record is plain (no n/n: prefix), return that record (first one encountered)
 * - If multipart records are present, require a complete set [1..N] and join in order
 * - Throw on empty input or incomplete multipart sequences
 */
export function parseTXTResponse(txtRecords: string[]): string {
  if (!Array.isArray(txtRecords) || txtRecords.length === 0) {
    throw new Error('No TXT records to parse');
  }

  // If any record is plain text, treat it as the response (native behavior)
  for (const record of txtRecords) {
    if (!/^(\d+)\/(\d+):/.test(record)) {
      const plain = String(record || '').trim();
      if (!plain) throw new Error('Received empty response');
      return plain;
    }
  }

  // All records match multipart format: collect, validate, and assemble
  type Part = { partNumber: number; totalParts: number; content: string };
  const parts: Part[] = [];
  let expectedTotal = 0;

  for (const record of txtRecords) {
    const match = record.match(/^(\d+)\/(\d+):(.*)$/);
    if (!match) continue; // Should not happen given earlier check
    const partNumber = parseInt(match[1], 10);
    const totalParts = parseInt(match[2], 10);
    const content = match[3];
    parts.push({ partNumber, totalParts, content });
    expectedTotal = Math.max(expectedTotal, totalParts);
  }

  // Validate completeness: unique parts 1..N must exist and no duplicates
  const partNumbers = parts.map((p) => p.partNumber);
  const uniquePartNumbers = new Set(partNumbers);
  if (uniquePartNumbers.size !== partNumbers.length) {
    throw new Error('Duplicate part numbers detected in multi-part response');
  }
  if (
    expectedTotal <= 0 ||
    uniquePartNumbers.size !== expectedTotal ||
    [...uniquePartNumbers].some((n) => n < 1 || n > expectedTotal)
  ) {
    throw new Error(
      `Incomplete multi-part response: got ${uniquePartNumbers.size} parts, expected ${expectedTotal}`,
    );
  }

  // Assemble in order
  parts.sort((a, b) => a.partNumber - b.partNumber);
  const fullResponse = parts.map((p) => p.content).join('');
  if (!fullResponse.trim()) {
    throw new Error('Received empty response');
  }
  return fullResponse.trim();
}

export class DNSService {
  private static readonly DEFAULT_DNS_SERVER = 'ch.at';
  private static readonly DNS_PORT: number = 53; // Ensure port is explicitly typed as number
  private static readonly TIMEOUT = 10000; // 10 seconds
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second
  private static readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private static readonly MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute
  private static isAppInBackground = false;
  private static backgroundListenerInitialized = false;
  private static requestHistory: number[] = [];
  private static appStateSubscription: { remove: () => void } | null = null;

  private static isVerbose(): boolean {
    try {
      return typeof __DEV__ !== 'undefined' && !!__DEV__;
    } catch {
      return false;
    }
  }

  private static vLog(...args: any[]) {
    if (this.isVerbose()) console.log(...args);
  }

  private static initializeBackgroundListener() {
    if (this.backgroundListenerInitialized || Platform.OS === 'web') {
      return;
    }

    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        this.isAppInBackground = true;
      } else if (nextAppState === 'active') {
        this.isAppInBackground = false;
      }
    });

    this.backgroundListenerInitialized = true;
  }

  // Optional teardown (for tests or future lifecycle control)
  static destroyBackgroundListener() {
    if (this.appStateSubscription) {
      try {
        this.appStateSubscription.remove();
      } catch {}
      this.appStateSubscription = null;
      this.backgroundListenerInitialized = false;
    }
  }

  private static checkRateLimit(): boolean {
    const now = Date.now();

    // Remove requests outside the current window
    this.requestHistory = this.requestHistory.filter(
      (timestamp) => now - timestamp <= this.RATE_LIMIT_WINDOW,
    );

    // Check if we've exceeded the rate limit
    if (this.requestHistory.length >= this.MAX_REQUESTS_PER_WINDOW) {
      return false;
    }

    // Add current request to history
    this.requestHistory.push(now);
    return true;
  }

  private static async handleBackgroundSuspension<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isAppInBackground) {
      throw new Error('DNS query suspended due to app backgrounding');
    }

    try {
      return await operation();
    } catch (error: any) {
      // If we get a network error and the app is in background, provide better error message
      if (
        this.isAppInBackground &&
        (error.message.includes('network') ||
          error.message.includes('connection') ||
          error.message.includes('timeout'))
      ) {
        throw new Error('DNS query failed - app was backgrounded during network operation');
      }
      throw error;
    }
  }

  static async queryLLM(
    message: string,
    dnsServer?: string,
    preferHttps?: boolean,
    methodPreference?: DNSMethodPreference,
    enableMockDNS?: boolean,
  ): Promise<string> {
    // Initialize background listener on first use
    this.initializeBackgroundListener();

    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    // Check rate limit
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before making another request.');
    }

    // Use provided DNS server or fallback to default
    const targetServer = dnsServer || this.DEFAULT_DNS_SERVER;
    
    // SECURITY: Validate DNS server to prevent redirection attacks
    validateDNSServer(targetServer);

    // Sanitize the message for DNS query
    const sanitizedMessage = this.sanitizeMessage(message);

    // Start logging the query
    const queryId = DNSLogService.startQuery(message);

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        // Determine method order based on preference
        const methodOrder = this.getMethodOrder(methodPreference, preferHttps, enableMockDNS);

        for (const method of methodOrder) {
          try {
            const result = await this.tryMethod(method, sanitizedMessage, targetServer);
            if (result) {
              await DNSLogService.endQuery(true, result.response, result.method);
              return result.response;
            }
          } catch (methodError: any) {
            // Log the failure and continue to next method
            DNSLogService.logMethodFailure(method, methodError.message, 0);

            // Log fallback to next method if available
            const nextMethodIndex = methodOrder.indexOf(method) + 1;
            if (nextMethodIndex < methodOrder.length) {
              DNSLogService.logFallback(method, methodOrder[nextMethodIndex]);
            }

            // Continue to next method
            continue;
          }
        }

        // If we get here, all methods failed for this attempt
        const availableMethods = methodOrder.join(', ');
        const methodCount = methodOrder.length;

        // Provide actionable guidance based on common failure patterns
        let guidance = '';
        if (methodOrder.includes('udp') && methodOrder.includes('tcp')) {
          guidance =
            ' • This often indicates network restrictions blocking DNS port 53. Try switching to a different network (e.g., cellular vs WiFi) or contact your network administrator.';
        } else if (methodOrder.includes('https')) {
          guidance =
            " • DNS-over-HTTPS was attempted but cannot access ch.at's custom responses. This is a known architectural limitation.";
        }

        throw new Error(
          `All ${methodCount} DNS transport methods failed (attempted: ${availableMethods}) for target server: ${targetServer}.${guidance}`,
        );
      } catch (error: any) {
        if (attempt === this.MAX_RETRIES - 1) {
          await DNSLogService.endQuery(false, undefined, undefined);
          throw error;
        }

        DNSLogService.addLog({
          id: `retry-${Date.now()}`,
          timestamp: new Date(),
          message: `Retrying query (attempt ${attempt + 2}/${this.MAX_RETRIES})`,
          method: 'udp',
          status: 'attempt',
          details: `Waiting ${this.RETRY_DELAY * Math.pow(2, attempt)}ms`,
        });

        // Exponential backoff
        await this.sleep(this.RETRY_DELAY * Math.pow(2, attempt));
      }
    }

    await DNSLogService.endQuery(false, undefined, undefined);

    // Provide comprehensive error guidance
    const troubleshootingSteps = [
      '1. Check network connectivity and try a different network (WiFi ↔ Cellular)',
      '2. Verify DNS server is accessible: ping ch.at',
      '3. Check DNS logs in app Settings for detailed failure information',
      '4. Network may be blocking DNS port 53 - contact network administrator',
      '5. Try enabling DNS-over-HTTPS in Settings if using public WiFi',
    ].join('\n');

    throw new Error(
      `DNS query failed after ${this.MAX_RETRIES} attempts to '${targetServer}' with message '${sanitizedMessage}'.\n\nTroubleshooting steps:\n${troubleshootingSteps}`,
    );
  }

  private static async performNativeUDPQuery(
    message: string,
    dnsServer: string,
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (!dgram) {
        return reject(new Error('UDP not available'));
      }

      const socket = dgram.createSocket('udp4');
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        socket.close();
      };

      const onError = (e: any) => {
        this.vLog('❌ UDP: Error occurred:', e);
        this.vLog('❌ UDP: Error type:', typeof e);
        this.vLog('❌ UDP: Error message:', e?.message);
        this.vLog('❌ UDP: Error code:', e?.code);
        this.vLog('❌ UDP: Error errno:', e?.errno);

        cleanup();

        // Enhanced error handling for common UDP issues
        if (e === undefined || e === null) {
          reject(new Error('UDP Socket error - received undefined error object'));
        } else if (typeof e === 'string') {
          reject(new Error(`UDP Socket error: ${e}`));
        } else if (e instanceof Error) {
          // Check for specific iOS port blocking errors
          const errorMsg = e.message?.toLowerCase() || '';
          if (
            errorMsg.includes('bad_port') ||
            errorMsg.includes('port') ||
            e.code === 'ERR_SOCKET_BAD_PORT'
          ) {
            reject(
              new Error(
                `UDP port 53 blocked by network/iOS - automatic fallback to TCP: ${e.message}`,
              ),
            );
          } else if (errorMsg.includes('permission') || errorMsg.includes('denied')) {
            reject(
              new Error(`UDP permission denied - network restrictions detected: ${e.message}`),
            );
          } else if (errorMsg.includes('network') || errorMsg.includes('unreachable')) {
            reject(new Error(`UDP network unreachable - connectivity issue: ${e.message}`));
          } else {
            reject(e);
          }
        } else if (e && typeof e === 'object') {
          // Extract meaningful error information from object
          const errorMsg = e.message || e.error || e.description || 'Unknown UDP socket error';
          const errorCode = e.code || e.errno || 'NO_CODE';
          reject(new Error(`UDP Socket error [${errorCode}]: ${errorMsg}`));
        } else {
          reject(new Error(`UDP Socket error - unexpected error type: ${typeof e} (${String(e)})`));
        }
      };

      const dnsQuery = {
        type: 'query' as const,
        id: Math.floor(Math.random() * 65536),
        flags: 0x0100, // Standard query with recursion desired
        questions: [
          {
            type: 'TXT' as const,
            class: 'IN' as const,
            name: message,
          },
        ],
      };

      try {
        const queryBuffer = dns.encode(dnsQuery);

        timeoutId = setTimeout(() => {
          onError(new Error('DNS query timed out'));
        }, this.TIMEOUT);

        socket.once('error', onError);

        socket.once('message', (response: Buffer, rinfo: any) => {
          try {
            const decoded = dns.decode(response);

            if ((decoded as any).rcode !== 'NOERROR') {
              throw new Error(`DNS query failed with rcode: ${(decoded as any).rcode}`);
            }

            if (!decoded.answers || decoded.answers.length === 0) {
              throw new Error('No TXT records found');
            }

            const txtRecords = decoded.answers
              .filter((answer) => answer.type === 'TXT')
              .map((answer) => {
                if (Array.isArray(answer.data)) {
                  return answer.data.join('');
                } else if (
                  answer.data instanceof Uint8Array ||
                  (answer.data && typeof answer.data === 'object' && 'length' in answer.data)
                ) {
                  return safeDecodeBytes(answer.data as Uint8Array);
                } else {
                  return answer.data ? answer.data.toString() : '';
                }
              })
              .filter((record) => record.length > 0);

            cleanup();
            resolve(txtRecords);
          } catch (e) {
            onError(e);
          }
        });

        socket.send(
          queryBuffer,
          0,
          queryBuffer.length,
          this.DNS_PORT,
          dnsServer,
          (error?: Error) => {
            if (error) {
              onError(new Error(`Failed to send UDP packet: ${error.message}`));
            }
          },
        );
      } catch (error) {
        onError(error);
      }
    });
  }

  private static async performDNSOverTCP(message: string, dnsServer: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.vLog('🔧 TCP: Starting DNS-over-TCP query');
      this.vLog('🔧 TCP: TcpSocket available:', !!TcpSocket);
      this.vLog('🔧 TCP: TcpSocket.Socket available:', !!TcpSocket?.Socket);

      if (!TcpSocket) {
        console.log('❌ TCP: Socket not available');
        return reject(new Error('TCP Socket not available'));
      }

      let socket: any;
      try {
        this.vLog('🔧 TCP: Creating socket...');
        socket = new TcpSocket.Socket();
        this.vLog('✅ TCP: Socket created successfully');
      } catch (socketError) {
        this.vLog('❌ TCP: Socket creation failed:', socketError);
        return reject(new Error(`Socket creation failed: ${socketError}`));
      }

      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      let responseBuffer = Buffer.alloc(0);
      let expectedLength = 0;

      const cleanup = () => {
        this.vLog('🧹 TCP: Cleaning up...');
        if (timeoutId) clearTimeout(timeoutId);
        if (socket) {
          try {
            socket.destroy();
          } catch (destroyError) {
            console.log('⚠️ TCP: Error during socket destroy:', destroyError);
          }
        }
      };

      const onError = (e: any) => {
        this.vLog('❌ TCP: Error occurred:', e);
        this.vLog('❌ TCP: Error type:', typeof e);
        this.vLog('❌ TCP: Error constructor:', e?.constructor?.name);
        this.vLog('❌ TCP: Error message:', e?.message);
        this.vLog('❌ TCP: Error code:', e?.code);
        this.vLog('❌ TCP: Error errno:', e?.errno);
        this.vLog('❌ TCP: Error stringified:', safeStringify(e));
        this.vLog('❌ TCP: Error is undefined/null:', e === undefined || e === null);

        cleanup();

        // Enhanced error handling for undefined/null errors
        if (e === undefined || e === null) {
          reject(
            new Error(
              'TCP Socket error - received undefined error object (possible React Native socket issue)',
            ),
          );
        } else if (typeof e === 'string') {
          // Check for specific connection issues in string errors
          const errorStr = e.toLowerCase();
          if (errorStr.includes('connection refused') || errorStr.includes('econnrefused')) {
            reject(
              new Error(`TCP connection refused - DNS server may be blocking TCP port 53: ${e}`),
            );
          } else if (errorStr.includes('timeout') || errorStr.includes('etimedout')) {
            reject(new Error(`TCP connection timeout - network may be blocking TCP DNS: ${e}`));
          } else {
            reject(new Error(`TCP Socket error: ${e}`));
          }
        } else if (e instanceof Error) {
          // Check for specific connection issues in Error objects
          const errorMsg = e.message?.toLowerCase() || '';
          if (
            errorMsg.includes('connection refused') ||
            errorMsg.includes('econnrefused') ||
            e.code === 'ECONNREFUSED'
          ) {
            reject(
              new Error(
                `TCP connection refused - DNS server may be blocking TCP port 53: ${e.message}`,
              ),
            );
          } else if (
            errorMsg.includes('timeout') ||
            errorMsg.includes('etimedout') ||
            e.code === 'ETIMEDOUT'
          ) {
            reject(
              new Error(`TCP connection timeout - network may be blocking TCP DNS: ${e.message}`),
            );
          } else if (
            errorMsg.includes('network') ||
            errorMsg.includes('unreachable') ||
            e.code === 'ENETUNREACH'
          ) {
            reject(new Error(`TCP network unreachable - connectivity issue: ${e.message}`));
          } else {
            reject(e);
          }
        } else if (e && typeof e === 'object') {
          // Extract meaningful error information from object
          const errorMsg = e.message || e.error || e.description || 'Unknown TCP socket error';
          const errorCode = e.code || e.errno || 'NO_CODE';

          // Check for connection issues in object errors
          if (
            errorCode === 'ECONNREFUSED' ||
            String(errorMsg).toLowerCase().includes('connection refused')
          ) {
            reject(
              new Error(
                `TCP connection refused [${errorCode}] - DNS server may be blocking TCP port 53: ${errorMsg}`,
              ),
            );
          } else if (
            errorCode === 'ETIMEDOUT' ||
            String(errorMsg).toLowerCase().includes('timeout')
          ) {
            reject(
              new Error(
                `TCP connection timeout [${errorCode}] - network may be blocking TCP DNS: ${errorMsg}`,
              ),
            );
          } else {
            reject(new Error(`TCP Socket error [${errorCode}]: ${errorMsg}`));
          }
        } else {
          reject(new Error(`TCP Socket error - unexpected error type: ${typeof e} (${String(e)})`));
        }
      };

      const dnsQuery = {
        type: 'query' as const,
        id: Math.floor(Math.random() * 65536),
        flags: 0x0100, // Standard query with recursion desired
        questions: [
          {
            type: 'TXT' as const,
            class: 'IN' as const,
            name: message,
          },
        ],
      };

      try {
        this.vLog('🔧 TCP: Encoding DNS query...');
        const queryBuffer = dns.encode(dnsQuery);
        this.vLog('✅ TCP: DNS query encoded, length:', queryBuffer?.length);

        if (!queryBuffer) {
          throw new Error('DNS packet encoding failed - queryBuffer is null/undefined');
        }

        // DNS-over-TCP requires 2-byte length prefix
        this.vLog('🔧 TCP: Creating length prefix...');
        this.vLog('🔧 TCP: Buffer available:', !!Buffer);
        this.vLog('🔧 TCP: Buffer.allocUnsafe available:', !!Buffer?.allocUnsafe);

        let lengthPrefix;
        try {
          lengthPrefix = Buffer.allocUnsafe(2);
          this.vLog('✅ TCP: Length prefix buffer created');
        } catch (bufferError) {
          this.vLog('❌ TCP: Buffer.allocUnsafe failed:', bufferError);
          throw new Error(`Buffer allocation failed: ${bufferError}`);
        }

        // For polyfill compatibility, write length manually
        this.vLog('🔧 TCP: Writing length prefix...');
        if (lengthPrefix.writeUInt16BE) {
          this.vLog('🔧 TCP: Using Buffer.writeUInt16BE method');
          lengthPrefix.writeUInt16BE(queryBuffer.length, 0);
        } else {
          this.vLog('🔧 TCP: Using manual big-endian write (polyfill mode)');
          // Manual big-endian write for polyfill
          lengthPrefix[0] = (queryBuffer.length >> 8) & 0xff;
          lengthPrefix[1] = queryBuffer.length & 0xff;
        }
        this.vLog('✅ TCP: Length prefix written:', Array.from(lengthPrefix));

        this.vLog('🔧 TCP: Concatenating buffers...');
        this.vLog('🔧 TCP: Buffer.concat available:', !!Buffer?.concat);

        let tcpQuery;
        try {
          tcpQuery = Buffer.concat([lengthPrefix, queryBuffer]);
          this.vLog('✅ TCP: TCP query buffer created, total length:', tcpQuery?.length);
        } catch (concatError) {
          this.vLog('❌ TCP: Buffer.concat failed:', concatError);
          throw new Error(`Buffer concatenation failed: ${concatError}`);
        }

        this.vLog('🔧 TCP: Setting up timeout...');
        timeoutId = setTimeout(() => {
          this.vLog('⏰ TCP: Query timed out');
          onError(new Error('DNS TCP query timed out'));
        }, this.TIMEOUT);

        this.vLog('🔧 TCP: Setting up error handler...');
        socket.on('error', (err: any) => {
          this.vLog('❌ TCP: Socket error event:', err);
          onError(err);
        });

        this.vLog('🔧 TCP: Setting up data handler...');
        socket.on('data', (data: Buffer) => {
          this.vLog('📥 TCP: Received data, length:', data.length);
          responseBuffer = Buffer.concat([responseBuffer, data]);

          // Read the length prefix if we haven't yet
          if (expectedLength === 0 && responseBuffer.length >= 2) {
            // Read big-endian 16-bit integer
            if (responseBuffer.readUInt16BE) {
              expectedLength = responseBuffer.readUInt16BE(0);
            } else {
              // Manual big-endian read for polyfill
              expectedLength = (responseBuffer[0] << 8) | responseBuffer[1];
            }
            responseBuffer = responseBuffer.slice(2); // Remove length prefix
          }

          // Check if we have received the complete response
          if (expectedLength > 0 && responseBuffer.length >= expectedLength) {
            try {
              const decoded = dns.decode(responseBuffer.slice(0, expectedLength));

              if ((decoded as any).rcode !== 'NOERROR') {
                throw new Error(`DNS query failed with rcode: ${(decoded as any).rcode}`);
              }

              if (!decoded.answers || decoded.answers.length === 0) {
                throw new Error('No TXT records found');
              }

              const txtRecords = decoded.answers
                .filter((answer) => answer.type === 'TXT')
                .map((answer) => {
                  if (Array.isArray(answer.data)) {
                    return answer.data.join('');
                  } else if (
                    answer.data instanceof Uint8Array ||
                    (answer.data && typeof answer.data === 'object' && 'length' in answer.data)
                  ) {
                    return safeDecodeBytes(answer.data as Uint8Array);
                  } else {
                    return answer.data ? answer.data.toString() : '';
                  }
                })
                .filter((record) => record.length > 0);

              cleanup();
              resolve(txtRecords);
            } catch (e) {
              onError(e);
            }
          }
        });

        this.vLog('🔧 TCP: Setting up close handler...');
        socket.on('close', () => {
          this.vLog('🔌 TCP: Socket closed');
          if (expectedLength === 0 || responseBuffer.length < expectedLength) {
            this.vLog('❌ TCP: Connection closed prematurely');
            onError(new Error('Connection closed before receiving complete response'));
          }
        });

        // Connect and send the query
        this.vLog('🔧 TCP: Attempting to connect to', dnsServer, 'port', this.DNS_PORT);
        try {
          socket.connect(
            {
              port: this.DNS_PORT,
              host: dnsServer,
            },
            (connectResult: any) => {
              this.vLog('✅ TCP: Connected successfully');
              this.vLog('🔍 TCP: Connect result:', connectResult);
              try {
                this.vLog('📤 TCP: Sending query, length:', tcpQuery.length);
                const writeResult = socket.write(tcpQuery);
                this.vLog('✅ TCP: Query sent, write result:', writeResult);
              } catch (writeError) {
                this.vLog('❌ TCP: Write failed:', writeError);
                this.vLog('❌ TCP: Write error type:', typeof writeError);
                this.vLog('❌ TCP: Write error details:', safeStringify(writeError));
                onError(writeError || new Error(`Write operation failed with undefined error`));
              }
            },
          );

          // Add specific error handling for connect failures
          socket.on('connect', () => {
            this.vLog('🎉 TCP: Socket connect event fired');
          });

          socket.on('timeout', () => {
            this.vLog('⏰ TCP: Socket timeout event fired');
            onError(new Error('TCP Socket connection timeout'));
          });
        } catch (connectError) {
          this.vLog('❌ TCP: Connect attempt failed:', connectError);
          this.vLog('❌ TCP: Connect error type:', typeof connectError);
          this.vLog('❌ TCP: Connect error details:', safeStringify(connectError));
          onError(connectError || new Error(`Connect attempt failed with undefined error`));
        }
      } catch (error) {
        onError(error);
      }
    });
  }

  private static async performDNSOverHTTPS(message: string, dnsServer: string): Promise<string[]> {
    this.vLog('🔧 HTTPS: Starting DNS-over-HTTPS query');
    this.vLog('🔧 HTTPS: Message:', message);
    this.vLog('🔧 HTTPS: DNS Server:', dnsServer);

    // ARCHITECTURE LIMITATION: DNS-over-HTTPS cannot directly query ch.at like UDP/TCP can
    // DNS-over-HTTPS services like Cloudflare act as DNS resolvers, not proxies to specific DNS servers
    // They will resolve queries using their own infrastructure, not forward to ch.at
    //
    // For ch.at specifically, we need direct DNS queries to their custom TXT service
    // DNS-over-HTTPS would query Cloudflare's resolvers, which don't have ch.at's custom responses

    this.vLog('❌ HTTPS: DNS-over-HTTPS incompatible with ch.at custom TXT service architecture');
    this.vLog(
      '❌ HTTPS: ch.at provides custom TXT responses that DNS-over-HTTPS resolvers cannot access',
    );
    this.vLog('❌ HTTPS: Fallback to Mock service will be attempted');

    throw new Error(
      `DNS-over-HTTPS cannot access ${dnsServer}'s custom TXT responses - network restrictions require Mock fallback`,
    );
  }

  private static parseResponse(txtRecords: string[]): string {
    return parseTXTResponse(txtRecords);
  }

  private static validateMessage(message: string): void {
    return validateDNSMessage(message);
  }

  private static sanitizeMessage(message: string): string {
    return sanitizeDNSMessage(message);
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private static getMethodOrder(
    methodPreference?: DNSMethodPreference,
    preferHttps?: boolean,
    enableMockDNS?: boolean,
  ): ('native' | 'udp' | 'tcp' | 'https' | 'mock')[] {
    // Handle new method preferences
    switch (methodPreference) {
      case 'udp-only':
        return enableMockDNS ? ['udp', 'mock'] : ['udp'];

      case 'never-https':
        const neverHttpsMethods: ('native' | 'udp' | 'tcp' | 'https' | 'mock')[] =
          Platform.OS === 'web' ? ['native', 'udp', 'tcp'] : ['native', 'udp', 'tcp'];
        return enableMockDNS ? [...neverHttpsMethods, 'mock'] : neverHttpsMethods;

      case 'prefer-https':
        const preferHttpsMethods: ('native' | 'udp' | 'tcp' | 'https' | 'mock')[] = [
          'https',
          'native',
          'udp',
          'tcp',
        ];
        return enableMockDNS ? [...preferHttpsMethods, 'mock'] : preferHttpsMethods;

      case 'native-first':
        // New default: Native DNS always first, regardless of other preferences
        const nativeFirstMethods: ('native' | 'udp' | 'tcp' | 'https' | 'mock')[] =
          Platform.OS === 'web' ? ['https', 'native'] : ['native', 'udp', 'tcp', 'https'];
        return enableMockDNS ? [...nativeFirstMethods, 'mock'] : nativeFirstMethods;

      case 'automatic':
      default:
        // Legacy behavior: respect preferHttps flag
        if (preferHttps) {
          const httpsFirstMethods: ('native' | 'udp' | 'tcp' | 'https' | 'mock')[] = [
            'https',
            'native',
            'udp',
            'tcp',
          ];
          return enableMockDNS ? [...httpsFirstMethods, 'mock'] : httpsFirstMethods;
        } else {
          const normalMethods: ('native' | 'udp' | 'tcp' | 'https' | 'mock')[] =
            Platform.OS === 'web' ? ['https'] : ['native', 'udp', 'tcp', 'https'];
          return enableMockDNS ? [...normalMethods, 'mock'] : normalMethods;
        }
    }
  }

  private static async tryMethod(
    method: 'native' | 'udp' | 'tcp' | 'https' | 'mock',
    message: string,
    targetServer: string,
  ): Promise<{
    response: string;
    method: 'native' | 'udp' | 'tcp' | 'https' | 'mock';
  } | null> {
    const startTime = Date.now();

    try {
      DNSLogService.logMethodAttempt(method, `Server: ${targetServer}`);

      let txtRecords: string[];

      switch (method) {
        case 'native':
          console.log('🌐 NATIVE: Starting native DNS transport test');
          console.log('🌐 NATIVE: Target server:', targetServer);
          console.log('🌐 NATIVE: Message:', message);

          const result = await this.handleBackgroundSuspension(async () => {
            console.log('🔧 NATIVE: Checking native DNS capabilities...');

            let capabilities;
            try {
              capabilities = await nativeDNS.isAvailable();
              console.log('🔍 NATIVE: Capabilities check completed');
              console.log(
                '🔍 NATIVE: Capabilities details:',
                JSON.stringify(capabilities, null, 2),
              );
              console.log('🔍 NATIVE: Available:', capabilities.available);
              console.log('🔍 NATIVE: Platform:', capabilities.platform);
              console.log('🔍 NATIVE: Supports custom server:', capabilities.supportsCustomServer);
              console.log('🔍 NATIVE: Supports async query:', capabilities.supportsAsyncQuery);

              if (capabilities.apiLevel) {
                console.log('🔍 NATIVE: Android API level:', capabilities.apiLevel);
              }
            } catch (capabilitiesError) {
              console.log('❌ NATIVE: Capabilities check failed:', capabilitiesError);
              console.log('❌ NATIVE: Capabilities error type:', typeof capabilitiesError);
              console.log(
                '❌ NATIVE: Capabilities error details:',
                JSON.stringify(capabilitiesError),
              );
              throw new Error(
                `Native DNS capabilities check failed: ${capabilitiesError?.message || capabilitiesError}`,
              );
            }

            if (capabilities.available && capabilities.supportsCustomServer) {
              console.log('✅ NATIVE: Native DNS available and supports custom servers');
              console.log('🔧 NATIVE: Attempting to query TXT records...');

              try {
                console.log('📤 NATIVE: Calling nativeDNS.queryTXT with:', {
                  server: targetServer,
                  message: message,
                });

                const queryStartTime = Date.now();
                const records = await nativeDNS.queryTXT(targetServer, message);
                const queryDuration = Date.now() - queryStartTime;

                console.log('📥 NATIVE: Raw TXT records received:', records);
                console.log('📊 NATIVE: Query took:', queryDuration, 'ms');
                console.log('📊 NATIVE: Records count:', records?.length || 0);
                console.log(
                  '📊 NATIVE: Records type:',
                  Array.isArray(records) ? 'array' : typeof records,
                );

                if (!records) {
                  throw new Error('Native DNS query returned null/undefined records');
                }

                if (!Array.isArray(records)) {
                  console.log('⚠️ NATIVE: Records is not an array, converting...');
                  const arrayRecords = Array.isArray(records) ? records : [String(records)];
                  console.log('🔄 NATIVE: Converted records:', arrayRecords);
                  return nativeDNS.parseMultiPartResponse(arrayRecords);
                }

                if (records.length === 0) {
                  throw new Error('Native DNS query returned empty records array');
                }

                console.log('🔧 NATIVE: Parsing multi-part response...');
                const parsedResponse = nativeDNS.parseMultiPartResponse(records);
                console.log('✅ NATIVE: Response parsed successfully');
                console.log('📄 NATIVE: Parsed response length:', parsedResponse?.length || 0);
                console.log(
                  '📄 NATIVE: Parsed response preview:',
                  parsedResponse?.substring(0, 100) + (parsedResponse?.length > 100 ? '...' : ''),
                );

                return parsedResponse;
              } catch (nativeError) {
                console.log('❌ NATIVE: Query failed with error:', nativeError);
                console.log('❌ NATIVE: Error type:', typeof nativeError);
                console.log('❌ NATIVE: Error constructor:', nativeError?.constructor?.name);
                console.log('❌ NATIVE: Error message:', nativeError?.message);
                console.log('❌ NATIVE: Error code:', nativeError?.code);
                console.log('❌ NATIVE: Error details:', JSON.stringify(nativeError));

                // Enhance error message with context and actionable guidance
                if (nativeError?.message?.includes('timeout')) {
                  throw new Error(
                    `Native DNS timeout - network may be slow or DNS server unreachable: ${nativeError.message}`,
                  );
                } else if (nativeError?.message?.includes('network')) {
                  throw new Error(
                    `Native DNS network error - check connectivity or try different network: ${nativeError.message}`,
                  );
                } else if (nativeError?.message?.includes('permission')) {
                  throw new Error(
                    `Native DNS permission denied - iOS/Android may restrict DNS access: ${nativeError.message}`,
                  );
                } else if (
                  nativeError?.message?.includes('resolution') ||
                  nativeError?.message?.includes('not found')
                ) {
                  throw new Error(
                    `Native DNS resolution failed - DNS server may not support TXT queries: ${nativeError.message}`,
                  );
                } else {
                  throw new Error(
                    `Native DNS query failed - falling back to UDP/TCP methods: ${nativeError?.message || nativeError}`,
                  );
                }
              }
            } else {
              console.log("❌ NATIVE: Native DNS not available or doesn't support custom servers");
              console.log('❌ NATIVE: Available:', capabilities.available);
              console.log('❌ NATIVE: Supports custom server:', capabilities.supportsCustomServer);

              if (!capabilities.available) {
                throw new Error(`Native DNS not available on platform: ${capabilities.platform}`);
              } else {
                throw new Error("Native DNS doesn't support custom servers on this platform");
              }
            }
          });

          if (!result) {
            console.log('❌ NATIVE: Result is null/undefined after background suspension handling');
            throw new Error('Native DNS returned null result');
          }

          const nativeDuration = Date.now() - startTime;
          console.log('✅ NATIVE: Native DNS query completed successfully');
          console.log('📊 NATIVE: Total duration:', nativeDuration, 'ms');
          DNSLogService.logMethodSuccess(
            'native',
            nativeDuration,
            `Response received (${result.length} chars)`,
          );
          return { response: result, method: 'native' };

        case 'udp':
          if (Platform.OS === 'web') {
            throw new Error(
              `UDP DNS transport not supported on web platform - use DNS-over-HTTPS instead`,
            );
          }
          if (!dgram) {
            throw new Error(
              `UDP DNS transport unavailable - react-native-udp library not loaded (platform: ${Platform.OS})`,
            );
          }

          txtRecords = await this.handleBackgroundSuspension(() =>
            this.performNativeUDPQuery(message, targetServer),
          );
          break;

        case 'tcp':
          if (Platform.OS === 'web') {
            throw new Error(
              `TCP DNS transport not supported on web platform - use DNS-over-HTTPS instead`,
            );
          }
          if (!TcpSocket) {
            throw new Error(
              `TCP DNS transport unavailable - react-native-tcp-socket library not loaded (platform: ${Platform.OS})`,
            );
          }

          txtRecords = await this.handleBackgroundSuspension(() =>
            this.performDNSOverTCP(message, targetServer),
          );
          break;

        case 'https':
          txtRecords = await this.handleBackgroundSuspension(() =>
            this.performDNSOverHTTPS(message, targetServer),
          );
          break;

        case 'mock':
          const mockResponse = await MockDNSService.queryLLM(message);
          const mockDuration = Date.now() - startTime;
          DNSLogService.logMethodSuccess('mock', mockDuration, `Mock response generated`);
          return { response: mockResponse, method: 'mock' };

        default:
          const validMethods = ['native', 'udp', 'tcp', 'https', 'mock'].join(', ');
          throw new Error(
            `Invalid DNS transport method '${method}' - valid methods are: ${validMethods}`,
          );
      }

      const response = this.parseResponse(txtRecords);
      const successDuration = Date.now() - startTime;
      DNSLogService.logMethodSuccess(method, successDuration, `Response received`);

      return { response, method };
    } catch (error: any) {
      const errorDuration = Date.now() - startTime;
      DNSLogService.logMethodFailure(method, error.message, errorDuration);
      throw error;
    }
  }

  // Alternative method using a custom DNS resolver service
  // This would require setting up a simple HTTP service that does the actual dig command
  static async queryViaCustomService(message: string, dnsServer?: string): Promise<string> {
    const sanitizedMessage = this.sanitizeMessage(message);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch('https://your-dns-service.com/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          server: dnsServer || this.DEFAULT_DNS_SERVER,
          query: sanitizedMessage,
          type: 'TXT',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Custom DNS service error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'No response received';
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('DNS query timed out');
      }
      throw error;
    }
  }

  /**
   * Test a specific DNS transport method with no fallback
   * Used for testing individual transport methods in isolation
   */
  static async testTransport(
    message: string,
    transport: 'native' | 'udp' | 'tcp' | 'https',
    dnsServer?: string,
  ): Promise<string> {
    console.log(`🧪 Starting forced transport test: ${transport.toUpperCase()}`);

    if (!message.trim()) {
      throw new Error('Test message cannot be empty');
    }

    // Check rate limit
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before making another request.');
    }

    // Use provided DNS server or fallback to default
    const targetServer = dnsServer || this.DEFAULT_DNS_SERVER;
    
    // SECURITY: Validate DNS server to prevent redirection attacks
    validateDNSServer(targetServer);

    // Sanitize the message for DNS query
    const sanitizedMessage = this.sanitizeMessage(message);

    // Start logging the query
    const queryId = DNSLogService.startQuery(message);

    const startTime = Date.now();

    try {
      console.log(`🔧 Testing ${transport.toUpperCase()} transport to ${targetServer}`);
      DNSLogService.logMethodAttempt(
        transport,
        `FORCED test (no fallback) - Server: ${targetServer}`,
      );

      let txtRecords: string[];

      switch (transport) {
        case 'native':
          console.log('🧪 NATIVE TEST: Starting forced native DNS transport test');

          const result = await this.handleBackgroundSuspension(async () => {
            console.log('🔧 NATIVE TEST: Checking capabilities for forced test...');
            const capabilities = await nativeDNS.isAvailable();
            console.log('🔍 NATIVE TEST: Capabilities:', JSON.stringify(capabilities, null, 2));

            if (capabilities.available && capabilities.supportsCustomServer) {
              console.log('✅ NATIVE TEST: Native DNS available for forced test');
              console.log('📤 NATIVE TEST: Executing queryTXT...');

              const testStartTime = Date.now();
              const records = await nativeDNS.queryTXT(targetServer, sanitizedMessage);
              const testQueryDuration = Date.now() - testStartTime;

              console.log('📥 NATIVE TEST: Records received:', records);
              console.log('📊 NATIVE TEST: Query duration:', testQueryDuration, 'ms');

              const parsedResult = nativeDNS.parseMultiPartResponse(records);
              console.log('✅ NATIVE TEST: Response parsed:', parsedResult?.length, 'chars');

              return parsedResult;
            }
            console.log('❌ NATIVE TEST: Native DNS not available for forced test');
            throw new Error(
              `Native DNS not available for forced test - available: ${capabilities.available}, custom server: ${capabilities.supportsCustomServer}`,
            );
          });

          const nativeDuration = Date.now() - startTime;
          console.log('🎉 NATIVE TEST: Forced test completed successfully');
          DNSLogService.logMethodSuccess(
            'native',
            nativeDuration,
            `Forced test response received (${result.length} chars)`,
          );
          await DNSLogService.endQuery(true, result, 'native');
          console.log(
            `✅ Native transport test successful: ${result.substring(0, 100)}${result.length > 100 ? '...' : ''}`,
          );
          return result;

        case 'udp':
          if (Platform.OS === 'web') {
            throw new Error(
              `UDP forced test not supported on web platform - use HTTPS forced test instead`,
            );
          }
          if (!dgram) {
            throw new Error(
              `UDP forced test unavailable - react-native-udp library not loaded (platform: ${Platform.OS})`,
            );
          }

          txtRecords = await this.handleBackgroundSuspension(() =>
            this.performNativeUDPQuery(sanitizedMessage, targetServer),
          );
          break;

        case 'tcp':
          if (Platform.OS === 'web') {
            throw new Error(
              `TCP forced test not supported on web platform - use HTTPS forced test instead`,
            );
          }
          if (!TcpSocket) {
            throw new Error(
              `TCP forced test unavailable - react-native-tcp-socket library not loaded (platform: ${Platform.OS})`,
            );
          }

          txtRecords = await this.handleBackgroundSuspension(() =>
            this.performDNSOverTCP(sanitizedMessage, targetServer),
          );
          break;

        case 'https':
          txtRecords = await this.handleBackgroundSuspension(() =>
            this.performDNSOverHTTPS(sanitizedMessage, targetServer),
          );
          break;

        default:
          const validTransports = ['native', 'udp', 'tcp', 'https'].join(', ');
          throw new Error(
            `Invalid transport method '${transport}' for forced test - valid transports are: ${validTransports}`,
          );
      }

      const response = this.parseResponse(txtRecords);
      const testSuccessDuration = Date.now() - startTime;
      DNSLogService.logMethodSuccess(
        transport,
        testSuccessDuration,
        `Forced test response received`,
      );
      await DNSLogService.endQuery(true, response, transport);
      console.log(`✅ ${transport.toUpperCase()} transport test successful: ${response}`);
      return response;
    } catch (error: any) {
      const testErrorDuration = Date.now() - startTime;
      console.log(`❌ ${transport.toUpperCase()} transport test failed:`, error.message);
      DNSLogService.logMethodFailure(transport, error.message, testErrorDuration);
      await DNSLogService.endQuery(false, undefined, transport);
      throw error;
    }
  }
}

// Export a mock service for development/testing
export class MockDNSService {
  private static responses = [
    "Hello! I'm an AI assistant. How can I help you today?",
    "That's an interesting question. Let me think about that...",
    "I understand what you're asking. Here's my perspective on this topic:",
    "Thank you for your message. I'm here to assist you with any questions you might have.",
  ];

  static async queryLLM(message: string): Promise<string> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

    // NOTE: Removed random errors to ensure mock service is reliable fallback
    // When used as final fallback, mock service should always succeed

    // Return a mock response
    const randomResponse = this.responses[Math.floor(Math.random() * this.responses.length)];
    return `${randomResponse}\n\nYour message: "${message}"`;
  }
}
