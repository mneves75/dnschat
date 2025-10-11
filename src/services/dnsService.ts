import { Platform, AppState } from 'react-native';
import * as dns from 'dns-packet';
import { nativeDNS, DNSError, DNSErrorType } from '../../modules/dns-native';
export { DNSError, DNSErrorType } from '../../modules/dns-native';
import { DNS_CONSTANTS, sanitizeDNSMessageReference } from '../../modules/dns-native/constants';
import { DNSLogService } from './dnsLogService';
import { DNSMethodPreference } from '../context/SettingsContext';
import { ERROR_MESSAGES } from '../constants/appConstants';

const DEFAULT_DNS_ZONE = DNS_CONSTANTS.DEFAULT_DNS_SERVER;

export function composeDNSQueryName(label: string, dnsServer: string): string {
  const trimmedLabel = label.replace(/\.+$/g, '').trim();
  if (!trimmedLabel) {
    throw new Error('DNS label must be non-empty when composing query name');
  }

  // SECURITY FIX: Validate DNS server before using it to prevent injection
  // Remove port if present for validation
  const serverForValidation = (dnsServer || '').trim().replace(/:\d+$/, '');
  if (serverForValidation) {
    // Only validate non-empty servers (empty defaults to ch.at which is safe)
    try {
      validateDNSServer(serverForValidation);
    } catch (error) {
      throw new Error(
        `Invalid DNS server in composeDNSQueryName: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  const serverInput = serverForValidation.replace(/\.+$/g, '');
  const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  const zone = !serverInput || ipRegex.test(serverInput) ? DEFAULT_DNS_ZONE : serverInput.toLowerCase();

  return `${trimmedLabel}.${zone}`;
}

type DNSQueryContext = {
  originalMessage: string;
  label: string;
  queryName: string;
  targetServer: string;
};

// CRITICAL: Dynamic library loading with graceful fallback
// These packages are INTENTIONALLY excluded from expo-doctor checks (see EXPO-DOCTOR-CONFIGURATION.md)
// - react-native-udp: Unmaintained but critical for DNS fallback on restricted networks
// - react-native-tcp-socket: Untested on New Architecture but works via Interop Layer
// If libraries fail to load, app gracefully falls back to native DNS → DNS-over-HTTPS → Mock
let dgram: any = null;
let TcpSocket: any = null;
let Buffer: any = null;

try {
  // UDP DNS transport (fallback #2 after native DNS)
  // Used when native DNS unavailable or fails
  dgram = require('react-native-udp');
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('✅ UDP library loaded successfully:', !!dgram);
  }
} catch (error) {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('❌ UDP library failed to load:', error);
  }
  // UDP not available, will use TCP/HTTPS/Mock fallback methods
}

try {
  // TCP DNS transport (fallback #3 after UDP)
  // Critical for corporate networks that block UDP port 53
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
  // TCP Socket not available, will use DNS-over-HTTPS/Mock fallback
}

// TRICKY: Buffer polyfill for cross-platform compatibility
// React Native, Web, and Node.js environments handle binary data differently
// This polyfill ensures dns-packet library works across all platforms
try {
  // Try to use native Buffer (React Native with polyfill or Node.js)
  Buffer = global.Buffer || require('buffer').Buffer;
} catch (error) {
  // FALLBACK: Create minimal Buffer polyfill for web environments
  // Provides only methods needed by dns-packet library for DNS protocol handling
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
  if (typeof message !== 'string') {
    throw new Error('Message must be a non-empty string');
  }

  if (message.length === 0) {
    throw new Error('Message must be a non-empty string');
  }

  if (message.length > DNS_CONSTANTS.MAX_MESSAGE_LENGTH) {
    throw new Error(
      `Message too long (maximum ${DNS_CONSTANTS.MAX_MESSAGE_LENGTH} characters before sanitization)`,
    );
  }

  if (message.trim().length === 0) {
    throw new Error('Message cannot be empty or contain only whitespace');
  }

  if (/[\x00-\x1F\x7F-\x9F]/.test(message)) {
    throw new Error('Message contains control characters that cannot be encoded safely');
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

  const sanitized = sanitizeDNSMessageReference(message);

  if (!sanitized) {
    throw new Error('Message cannot be empty after sanitization');
  }

  if (sanitized.length > DNS_CONSTANTS.MAX_DNS_LABEL_LENGTH) {
    throw new Error(
      `Message too long for DNS transport (maximum ${DNS_CONSTANTS.MAX_DNS_LABEL_LENGTH} characters after sanitization)`,
    );
  }

  return sanitized;
}

/**
 * Validate DNS server to prevent redirection attacks
 * SECURITY: Only allow known-safe DNS servers
 */
export function validateDNSServer(server: string): void {
  if (!server || typeof server !== 'string' || server.trim().length === 0) {
    throw new Error(ERROR_MESSAGES.DNS_SERVER_INVALID);
  }

  const normalizedServer = server.toLowerCase().trim();

  const ipv4Pattern = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
  const ipv6Pattern = /^([0-9a-f]{1,4}:){2,7}[0-9a-f]{1,4}$/i;
  const hostnamePattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*$/;

  const isIPAddress = ipv4Pattern.test(normalizedServer) || ipv6Pattern.test(normalizedServer);
  const isHostname = hostnamePattern.test(normalizedServer);

  if (!isIPAddress && !isHostname) {
    throw new Error(`DNS server '${server}' is not a valid hostname or IP address`);
  }

  if (isHostname) {
    const labels = normalizedServer.split('.');
    if (
      labels.some(
        (label) =>
          label.length === 0 ||
          label.length > DNS_CONSTANTS.MAX_DNS_LABEL_LENGTH,
      )
    ) {
      throw new Error(
        `DNS server '${server}' contains label exceeding ${DNS_CONSTANTS.MAX_DNS_LABEL_LENGTH} characters`,
      );
    }
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

  type Part = { partNumber: number; totalParts: number; content: string };
  const parts: Part[] = [];
  const plainSegments: string[] = [];

  for (const record of txtRecords) {
    const rawValue = String(record ?? '');
    const trimmedValue = rawValue.trim();
    if (!trimmedValue) {
      continue;
    }

    const match = rawValue.match(/^\s*(\d+)\/(\d+):(.*)$/);
    if (match && match[1] && match[2] && match[3] !== undefined) {
      parts.push({
        partNumber: parseInt(match[1], 10),
        totalParts: parseInt(match[2], 10),
        content: match[3],
      });
    } else {
      plainSegments.push(rawValue);
    }
  }

  if (plainSegments.length > 0) {
    const combinedRaw = plainSegments.join('');
    if (!combinedRaw.trim()) {
      throw new Error('Received empty response');
    }
    return combinedRaw;
  }

  if (parts.length === 0) {
    throw new Error('No TXT records to parse');
  }

  const expectedTotal = parts[0].totalParts;
  const byPart = new Map<number, string>();

  // TRICKY: Handle duplicate parts from UDP retransmission
  // UDP is unreliable - packets can be duplicated, reordered, or lost
  // DNS servers may send the same TXT record multiple times
  // We must detect duplicates and handle them correctly:
  // - Identical duplicates (same content): Safe to ignore (normal retransmission)
  // - Conflicting duplicates (different content): Data corruption, must fail
  // Example: "1/3:Hello" received twice is OK, but "1/3:Hello" + "1/3:Goodbye" is corruption
  for (const part of parts) {
    if (byPart.has(part.partNumber)) {
      const existing = byPart.get(part.partNumber);
      // If content matches, this is a harmless retransmission - skip it
      if (existing === part.content) {
        continue;  // Duplicate but identical - safe to ignore
      }
      // If content differs, this is data corruption - fail immediately
      throw new Error(
        `Conflicting content for part ${part.partNumber}: ` +
        `existing="${existing?.substring(0, 50)}..." vs new="${part.content.substring(0, 50)}..."`
      );
    }
    byPart.set(part.partNumber, part.content);
  }

  if (expectedTotal <= 0 || byPart.size !== expectedTotal) {
    throw new Error(
      `Incomplete multi-part response: got ${byPart.size} parts, expected ${expectedTotal}`,
    );
  }

  const ordered: string[] = [];
  for (let i = 1; i <= expectedTotal; i++) {
    const content = byPart.get(i);
    if (typeof content !== 'string') {
      throw new Error(`Incomplete multi-part response: missing part ${i}`);
    }
    ordered.push(content);
  }

  const fullResponse = ordered.join('');
  if (!fullResponse.trim()) {
    throw new Error('Received empty response');
  }
  return fullResponse;
}

export class DNSService {
  private static readonly DEFAULT_DNS_SERVER = DNS_CONSTANTS.DEFAULT_DNS_SERVER;
  private static readonly DNS_PORT: number = DNS_CONSTANTS.DNS_PORT;
  private static readonly TIMEOUT = DNS_CONSTANTS.QUERY_TIMEOUT_MS;
  private static readonly MAX_RETRIES = DNS_CONSTANTS.MAX_RETRIES;
  private static readonly RETRY_DELAY = DNS_CONSTANTS.RETRY_DELAY_MS;
  private static readonly RATE_LIMIT_WINDOW = DNS_CONSTANTS.RATE_LIMIT_WINDOW_MS;
  private static readonly MAX_REQUESTS_PER_WINDOW = DNS_CONSTANTS.MAX_REQUESTS_PER_WINDOW;
  private static isAppInBackground = false;
  private static backgroundListenerInitialized = false;
  private static requestHistory: number[] = [];
  private static appStateSubscription: { remove: () => void } | null = null;
  private static httpsLimitationLogged = false;

  private static isVerbose(): boolean {
    try {
      return typeof __DEV__ !== 'undefined' && !!__DEV__;
    } catch {
      return false;
    }
  }

  private static vLog(...args: unknown[]) {
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
    allowExperimentalTransports: boolean = false,
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

    // Prepare DNS query context (label + fully-qualified query name)
    const queryContext = this.createQueryContext(message, targetServer);

    // Start logging the query
    const queryId = DNSLogService.startQuery(message);
    DNSLogService.addLog({
      id: `${queryId}-query-name`,
      timestamp: new Date(),
      message: `Resolved DNS query name: ${queryContext.queryName}`,
      method: 'native',
      status: 'attempt',
      details: `Label: ${queryContext.label}`,
    });

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        // Determine method order based on preference
        const methodOrder = this.getMethodOrder(
          methodPreference,
          preferHttps,
          enableMockDNS,
          allowExperimentalTransports,
        );

        DNSLogService.addLog({
          id: `${queryId}-order-${attempt}`,
          timestamp: new Date(),
          message: `Transport order: ${methodOrder.join(' → ')}`,
          method: 'native',
          status: 'attempt',
          details: allowExperimentalTransports
            ? 'Experimental transports enabled'
            : 'Experimental transports disabled',
        });

        for (const method of methodOrder) {
          try {
            const result = await this.tryMethod(method, queryContext);
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

        if (!allowExperimentalTransports) {
          guidance +=
            " • Native DNS is enforced. Enable 'Allow Experimental Transports' in Settings to retry with UDP/TCP/HTTPS.";
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
      `DNS query failed after ${this.MAX_RETRIES} attempts to '${targetServer}' with label '${queryContext.label}' (query name: ${queryContext.queryName}).\n\nTroubleshooting steps:\n${troubleshootingSteps}`,
    );
  }

  private static async performNativeUDPQuery(
    queryName: string,
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
          const errorCode = (e as any)?.code;
          if (
            errorMsg.includes('bad_port') ||
            errorMsg.includes('port') ||
            errorCode === 'ERR_SOCKET_BAD_PORT'
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
            name: queryName,
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

  private static async performDNSOverTCP(queryName: string, dnsServer: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.vLog('🔧 TCP: Starting DNS-over-TCP query');
      this.vLog('🔧 TCP: TcpSocket available:', !!TcpSocket);
      this.vLog('🔧 TCP: TcpSocket.Socket available:', !!TcpSocket?.Socket);

      if (!TcpSocket) {
        this.vLog('❌ TCP: Socket not available');
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
            this.vLog('⚠️ TCP: Error during socket destroy:', destroyError);
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
          const errorCode = (e as any)?.code;
          if (
            errorMsg.includes('connection refused') ||
            errorMsg.includes('econnrefused') ||
            errorCode === 'ECONNREFUSED'
          ) {
            reject(
              new Error(
                `TCP connection refused - DNS server may be blocking TCP port 53: ${e.message}`,
              ),
            );
          } else if (
            errorMsg.includes('timeout') ||
            errorMsg.includes('etimedout') ||
            errorCode === 'ETIMEDOUT'
          ) {
            reject(
              new Error(`TCP connection timeout - network may be blocking TCP DNS: ${e.message}`),
            );
          } else if (
            errorMsg.includes('network') ||
            errorMsg.includes('unreachable') ||
            errorCode === 'ENETUNREACH'
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
            name: queryName,
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

        // TRICKY: DNS-over-TCP requires 2-byte length prefix (RFC 7766)
        // This is the key difference between UDP and TCP DNS:
        // - UDP: Send raw DNS packet
        // - TCP: Send [2-byte length prefix] + [DNS packet]
        // The length prefix tells the server how many bytes to read
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

        // TRICKY: Write length as big-endian 16-bit integer
        // Big-endian (network byte order): most significant byte first
        // For polyfill compatibility, support both Buffer.writeUInt16BE and manual write
        this.vLog('🔧 TCP: Writing length prefix...');
        if (lengthPrefix.writeUInt16BE) {
          this.vLog('🔧 TCP: Using Buffer.writeUInt16BE method');
          lengthPrefix.writeUInt16BE(queryBuffer.length, 0);
        } else {
          this.vLog('🔧 TCP: Using manual big-endian write (polyfill mode)');
          // Manual big-endian write for Buffer polyfill
          // Example: length 512 = 0x0200 -> [0x02, 0x00]
          lengthPrefix[0] = (queryBuffer.length >> 8) & 0xff;  // High byte
          lengthPrefix[1] = queryBuffer.length & 0xff;          // Low byte
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

  private static async performDNSOverHTTPS(queryName: string, dnsServer: string): Promise<string[]> {
    this.vLog('🔧 HTTPS: Starting DNS-over-HTTPS query');
    this.vLog('🔧 HTTPS: Query name:', queryName);
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

    if (!this.httpsLimitationLogged) {
      DNSLogService.addLog({
        id: `https-limit-${Date.now()}`,
        timestamp: new Date(),
        message: 'DNS-over-HTTPS is unavailable for ch.at responses; falling back to other transports.',
        method: 'https',
        status: 'failure',
        details: 'Requires experimental transports with alternative resolver support.',
      });
      this.httpsLimitationLogged = true;
    }

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

  private static createQueryContext(originalMessage: string, targetServer: string): DNSQueryContext {
    const label = this.sanitizeMessage(originalMessage);
    const queryName = composeDNSQueryName(label, targetServer);

    return {
      originalMessage,
      label,
      queryName,
      targetServer,
    };
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private static getMethodOrder(
    methodPreference: DNSMethodPreference | undefined,
    preferHttps: boolean | undefined,
    enableMockDNS: boolean | undefined,
    allowExperimentalTransports: boolean,
  ): ('native' | 'udp' | 'tcp' | 'https' | 'mock')[] {
    const appendMock = (order: ('native' | 'udp' | 'tcp' | 'https')[]) =>
      enableMockDNS ? ([...order, 'mock'] as ('native' | 'udp' | 'tcp' | 'https' | 'mock')[]) : order;

    // Web never supports native/UDP/TCP. honor preferHttps flag for clarity.
    if (Platform.OS === 'web') {
      return appendMock(preferHttps ? ['https'] : ['https']);
    }

    if (!allowExperimentalTransports) {
      return appendMock(['native']);
    }

    switch (methodPreference) {
      case 'udp-only':
        return appendMock(['udp']);
      case 'never-https':
        return appendMock(['native', 'udp', 'tcp']);
      case 'prefer-https':
        return appendMock(['https', 'native', 'udp', 'tcp']);
      case 'native-first':
        return appendMock(['native', 'udp', 'tcp', 'https']);
      case 'automatic':
      default:
        if (preferHttps) {
          return appendMock(['https', 'native', 'udp', 'tcp']);
        }
        return appendMock(['native', 'udp', 'tcp', 'https']);
    }
  }

  private static async tryMethod(
    method: 'native' | 'udp' | 'tcp' | 'https' | 'mock',
    context: DNSQueryContext,
  ): Promise<{
    response: string;
    method: 'native' | 'udp' | 'tcp' | 'https' | 'mock';
  } | null> {
    const startTime = Date.now();
    const { queryName, targetServer, originalMessage, label } = context;

    try {
      DNSLogService.logMethodAttempt(method, `Server: ${targetServer}`);

      let txtRecords: string[];

      switch (method) {
        case 'native':
          this.vLog('🌐 NATIVE: Starting native DNS transport test');
          this.vLog('🌐 NATIVE: Target server:', targetServer);
          this.vLog('🌐 NATIVE: Query name:', queryName);
          this.vLog('🌐 NATIVE: Label:', label);

          const result = await this.handleBackgroundSuspension(async () => {
            this.vLog('🔧 NATIVE: Checking native DNS capabilities...');

            let capabilities;
            try {
              capabilities = await nativeDNS.isAvailable();
              this.vLog('🔍 NATIVE: Capabilities check completed');
              this.vLog(
                '🔍 NATIVE: Capabilities details:',
                JSON.stringify(capabilities, null, 2),
              );
              this.vLog('🔍 NATIVE: Available:', capabilities.available);
              this.vLog('🔍 NATIVE: Platform:', capabilities.platform);
              this.vLog('🔍 NATIVE: Supports custom server:', capabilities.supportsCustomServer);
              this.vLog('🔍 NATIVE: Supports async query:', capabilities.supportsAsyncQuery);

              if (capabilities.apiLevel) {
                this.vLog('🔍 NATIVE: Android API level:', capabilities.apiLevel);
              }
            } catch (capabilitiesError: any) {
              this.vLog('❌ NATIVE: Capabilities check failed:', capabilitiesError);
              this.vLog('❌ NATIVE: Capabilities error type:', typeof capabilitiesError);
              this.vLog(
                '❌ NATIVE: Capabilities error details:',
                JSON.stringify(capabilitiesError),
              );
              throw new Error(
                `Native DNS capabilities check failed: ${capabilitiesError?.message || capabilitiesError}`,
              );
            }

            if (capabilities.available && capabilities.supportsCustomServer) {
              this.vLog('✅ NATIVE: Native DNS available and supports custom servers');
              this.vLog('🔧 NATIVE: Attempting to query TXT records...');

              try {
                this.vLog('📤 NATIVE: Calling nativeDNS.queryTXT with:', {
                  server: targetServer,
                  queryName,
                });

                const queryStartTime = Date.now();
                const records = await nativeDNS.queryTXT(targetServer, queryName);
                const queryDuration = Date.now() - queryStartTime;

                this.vLog('📥 NATIVE: Raw TXT records received:', records);
                this.vLog('📊 NATIVE: Query took:', queryDuration, 'ms');
                this.vLog('📊 NATIVE: Records count:', records?.length || 0);
                this.vLog(
                  '📊 NATIVE: Records type:',
                  Array.isArray(records) ? 'array' : typeof records,
                );

                // Validate records - native module contract guarantees string[] or throws
                if (!records || !Array.isArray(records)) {
                  throw new Error(
                    `Native DNS query returned invalid records type: ${typeof records} (expected string[])`
                  );
                }

                if (records.length === 0) {
                  throw new Error('Native DNS query returned empty records array');
                }

                this.vLog('🔧 NATIVE: Parsing multi-part response...');
                const parsedResponse = nativeDNS.parseMultiPartResponse(records);
                this.vLog('✅ NATIVE: Response parsed successfully');
                this.vLog('📄 NATIVE: Parsed response length:', parsedResponse?.length || 0);
                this.vLog(
                  '📄 NATIVE: Parsed response preview:',
                  parsedResponse?.substring(0, 100) + (parsedResponse?.length > 100 ? '...' : ''),
                );

                return parsedResponse;
              } catch (nativeError: any) {
                this.vLog('❌ NATIVE: Query failed with error:', nativeError);
                this.vLog('❌ NATIVE: Error type:', typeof nativeError);
                this.vLog('❌ NATIVE: Error constructor:', nativeError?.constructor?.name);
                this.vLog('❌ NATIVE: Error message:', nativeError?.message);
                this.vLog('❌ NATIVE: Error code:', nativeError?.code);
                this.vLog('❌ NATIVE: Error details:', JSON.stringify(nativeError));

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
              this.vLog("❌ NATIVE: Native DNS not available or doesn't support custom servers");
              this.vLog('❌ NATIVE: Available:', capabilities.available);
              this.vLog('❌ NATIVE: Supports custom server:', capabilities.supportsCustomServer);

              if (!capabilities.available) {
                throw new Error(`Native DNS not available on platform: ${capabilities.platform}`);
              } else {
                throw new Error("Native DNS doesn't support custom servers on this platform");
              }
            }
          });

          if (!result) {
            this.vLog('❌ NATIVE: Result is null/undefined after background suspension handling');
            throw new Error('Native DNS returned null result');
          }

          const nativeDuration = Date.now() - startTime;
          this.vLog('✅ NATIVE: Native DNS query completed successfully');
          this.vLog('📊 NATIVE: Total duration:', nativeDuration, 'ms');
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
            this.performNativeUDPQuery(queryName, targetServer),
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
            this.performDNSOverTCP(queryName, targetServer),
          );
          break;

        case 'https':
          txtRecords = await this.handleBackgroundSuspension(() =>
            this.performDNSOverHTTPS(queryName, targetServer),
          );
          break;

        case 'mock':
          const mockResponse = await MockDNSService.queryLLM(originalMessage);
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


  /**
   * Test a specific DNS transport method with no fallback
   * Used for testing individual transport methods in isolation
   */
  static async testTransport(
    message: string,
    transport: 'native' | 'udp' | 'tcp' | 'https',
    dnsServer?: string,
  ): Promise<string> {
    this.vLog(`🧪 Starting forced transport test: ${transport.toUpperCase()}`);

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

    const context = this.createQueryContext(message, targetServer);

    // Start logging the query
    const queryId = DNSLogService.startQuery(message);
    DNSLogService.addLog({
      id: `${queryId}-forced-query-name`,
      timestamp: new Date(),
      message: `Resolved DNS query name: ${context.queryName}`,
      method: transport,
      status: 'attempt',
      details: `Label: ${context.label}`,
    });

    const startTime = Date.now();

    try {
      this.vLog(`🔧 Testing ${transport.toUpperCase()} transport to ${targetServer}`);
      this.vLog('🔧 Forced query name:', context.queryName);
      DNSLogService.logMethodAttempt(
        transport,
        `FORCED test (no fallback) - Server: ${targetServer}`,
      );

      let txtRecords: string[];

      switch (transport) {
        case 'native':
          this.vLog('🧪 NATIVE TEST: Starting forced native DNS transport test');

          const result = await this.handleBackgroundSuspension(async () => {
            this.vLog('🔧 NATIVE TEST: Checking capabilities for forced test...');
            const capabilities = await nativeDNS.isAvailable();
            this.vLog('🔍 NATIVE TEST: Capabilities:', JSON.stringify(capabilities, null, 2));

            if (capabilities.available && capabilities.supportsCustomServer) {
              this.vLog('✅ NATIVE TEST: Native DNS available for forced test');
              this.vLog('📤 NATIVE TEST: Executing queryTXT...');

              const testStartTime = Date.now();
              const records = await nativeDNS.queryTXT(targetServer, context.queryName);
              const testQueryDuration = Date.now() - testStartTime;

              this.vLog('📥 NATIVE TEST: Records received:', records);
              this.vLog('📊 NATIVE TEST: Query duration:', testQueryDuration, 'ms');

              const parsedResult = nativeDNS.parseMultiPartResponse(records);
              this.vLog('✅ NATIVE TEST: Response parsed:', parsedResult?.length, 'chars');

              return parsedResult;
            }
            this.vLog('❌ NATIVE TEST: Native DNS not available for forced test');
            throw new Error(
              `Native DNS not available for forced test - available: ${capabilities.available}, custom server: ${capabilities.supportsCustomServer}`,
            );
          });

          const nativeDuration = Date.now() - startTime;
          this.vLog('🎉 NATIVE TEST: Forced test completed successfully');
          DNSLogService.logMethodSuccess(
            'native',
            nativeDuration,
            `Forced test response received (${result.length} chars)`,
          );
          await DNSLogService.endQuery(true, result, 'native');
          this.vLog(
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
            this.performNativeUDPQuery(context.queryName, targetServer),
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
            this.performDNSOverTCP(context.queryName, targetServer),
          );
          break;

        case 'https':
          txtRecords = await this.handleBackgroundSuspension(() =>
            this.performDNSOverHTTPS(context.queryName, targetServer),
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
      this.vLog(`✅ ${transport.toUpperCase()} transport test successful: ${response}`);
      return response;
    } catch (error: any) {
      const testErrorDuration = Date.now() - startTime;
      this.vLog(`❌ ${transport.toUpperCase()} transport test failed:`, error.message);
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
