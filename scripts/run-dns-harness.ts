#!/usr/bin/env ts-node
/**
 * Cross-layer DNS harness for verification bundles.
 * Sanitizes the message, composes the query name, and executes the
 * configured transport order (native -> UDP -> TCP by default).
 *
 * Usage examples:
 *   npx ts-node scripts/run-dns-harness.ts --message "Hello" --server ch.at \
 *     --method-order native,udp,tcp --json-out artifacts/result.json --raw-out artifacts/raw
 */

import { promises as fs } from 'node:fs';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import dgram from 'node:dgram';
import net from 'node:net';
import crypto from 'node:crypto';
import dnsPacket from 'dns-packet';

const DEFAULT_SERVER = 'ch.at';
const DEFAULT_PORT = 53;
const DEFAULT_METHOD_ORDER: HarnessMethod[] = ['native', 'udp', 'tcp'];
const DEFAULT_TIMEOUT_MS = 5000;

const METHOD_NAMES: HarnessMethod[] = ['native', 'udp', 'tcp'];

// NOTE: Keep these values in sync with modules/dns-native/constants.ts
const HARNESS_DNS_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 120,
  MAX_DNS_LABEL_LENGTH: 63,
};

type HarnessMethod = 'native' | 'udp' | 'tcp';

type AttemptStatus = 'success' | 'failure';

type HarnessOptions = {
  message: string;
  server: string;
  port: number;
  methodOrder: HarnessMethod[];
  timeoutMs: number;
  localServer: boolean;
  jsonOut?: string;
  rawOutDir?: string;
};

type HarnessAttempt = {
  method: HarnessMethod;
  status: AttemptStatus;
  durationMs: number;
  error?: string;
  txtRecords?: string[];
  rawRequestPath?: string;
  rawResponsePath?: string;
};

type HarnessResult = {
  timestamp: string;
  message: string;
  sanitizedLabel: string;
  queryName: string;
  server: string;
  port: number;
  methodOrder: HarnessMethod[];
  attempts: HarnessAttempt[];
  finalStatus: AttemptStatus;
  resolvedText?: string;
};

function parseArgs(argv: string[]): HarnessOptions {
  const args = [...argv];
  let message = '';
  let server = DEFAULT_SERVER;
  let port = DEFAULT_PORT;
  let methodOrder = DEFAULT_METHOD_ORDER;
  let methodOrderExplicit = false;
  let timeoutMs = DEFAULT_TIMEOUT_MS;
  let localServer = false;
  let jsonOut: string | undefined;
  let rawOutDir: string | undefined;

  const takeValue = (flag: string, index: number): string => {
    const value = args[index + 1];
    if (value === undefined) {
      throw new Error(`Missing value for ${flag}`);
    }
    return value;
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) {
      continue;
    }
    if (arg === '--message' || arg === '-m') {
      message = takeValue(arg, i);
      i += 1;
    } else if (arg === '--server' || arg === '-s') {
      server = takeValue(arg, i);
      i += 1;
    } else if (arg === '--port' || arg === '-p') {
      port = parseInt(takeValue(arg, i), 10) || DEFAULT_PORT;
      i += 1;
    } else if (arg === '--method-order') {
      const raw = takeValue(arg, i);
      i += 1;
      methodOrderExplicit = true;
      methodOrder = raw
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter((item): item is HarnessMethod => METHOD_NAMES.includes(item as HarnessMethod));
      if (methodOrder.length === 0) {
        methodOrder = DEFAULT_METHOD_ORDER;
      }
    } else if (arg === '--timeout') {
      timeoutMs = parseInt(takeValue(arg, i), 10) || DEFAULT_TIMEOUT_MS;
      i += 1;
    } else if (arg === '--json-out') {
      jsonOut = takeValue(arg, i);
      i += 1;
    } else if (arg === '--raw-out') {
      rawOutDir = takeValue(arg, i);
      i += 1;
    } else if (arg === '--local-server') {
      localServer = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (!arg.startsWith('--') && message === '') {
      message = arg;
    }
  }

  if (!message) {
    throw new Error('Message is required. Provide via --message "text".');
  }

  const options: HarnessOptions = {
    message,
    server,
    port,
    methodOrder,
    timeoutMs,
    localServer,
  };
  if (jsonOut) {
    options.jsonOut = jsonOut;
  }
  if (rawOutDir) {
    options.rawOutDir = rawOutDir;
  }

  if (options.localServer && !methodOrderExplicit) {
    options.methodOrder = ['udp', 'tcp'];
  }

  return options;
}

function printHelp() {
  console.log(`DNS Harness Usage:\n\n` +
    `  npx ts-node scripts/run-dns-harness.ts --message "hello world" [options]\n\n` +
    `Options:\n` +
    `  --message, -m        Message to encode (required)\n` +
    `  --server,  -s        Resolver host (default: ${DEFAULT_SERVER})\n` +
    `  --port,    -p        Resolver port (default: ${DEFAULT_PORT})\n` +
    `  --method-order       Comma list of transports (native,udp,tcp)\n` +
    `  --timeout            Transport timeout in ms (default: ${DEFAULT_TIMEOUT_MS})\n` +
    `  --json-out           Path to write harness JSON artifact\n` +
    `  --raw-out            Directory to persist raw request/response buffers\n` +
    `  --local-server       Spin up a local UDP/TCP DNS responder for offline validation\n` +
    `  --help, -h           Show this help message`);
}

function validateMessage(message: string) {
  if (typeof message !== 'string' || message.length === 0) {
    throw new Error('Message must be a non-empty string');
  }
  if (message.length > HARNESS_DNS_CONSTANTS.MAX_MESSAGE_LENGTH) {
    throw new Error(`Message too long (max ${HARNESS_DNS_CONSTANTS.MAX_MESSAGE_LENGTH} characters)`);
  }
  if (message.trim().length === 0) {
    throw new Error('Message cannot be only whitespace');
  }
  const controlChars = /[\x00-\x1F\x7F-\x9F]/;
  if (controlChars.test(message)) {
    throw new Error('Message contains control characters that cannot be encoded safely');
  }
}

function sanitizeMessageForDns(message: string): string {
  let result = message.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  result = result.toLowerCase();
  result = result.trim();
  result = result.replace(/\s+/g, '-');
  result = result.replace(/[^a-z0-9-]/g, '');
  result = result.replace(/-{2,}/g, '-');
  result = result.replace(/^-+|-+$/g, '');

  if (!result) {
    throw new Error(
      'Message must contain at least one letter or number after sanitization',
    );
  }
  if (result.length > HARNESS_DNS_CONSTANTS.MAX_DNS_LABEL_LENGTH) {
    throw new Error(
      `Message exceeds DNS label limit of ${HARNESS_DNS_CONSTANTS.MAX_DNS_LABEL_LENGTH} characters after sanitization`,
    );
  }

  return result;
}

function composeQueryName(label: string, dnsServer: string): string {
  const trimmedLabel = label.replace(/\.+$/g, '').trim();
  if (!trimmedLabel) {
    throw new Error('Sanitized label cannot be empty when composing query name');
  }

  const serverInput = (dnsServer || '').trim().replace(/:\d+$/, '').replace(/\.+$/g, '');
  const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  const zone = !serverInput || ipRegex.test(serverInput) ? DEFAULT_SERVER : serverInput.toLowerCase();

  return `${trimmedLabel}.${zone}`;
}

function ensureDirectory(dir: string) {
  if (!dir) return;
  mkdirSync(dir, { recursive: true });
}

function buildDnsQueryBuffer(queryName: string): Buffer {
  // SECURITY: Use cryptographically secure random for DNS transaction ID (RFC 5452)
  return dnsPacket.encode({
    type: 'query',
    id: crypto.randomInt(0, 65536),
    flags: dnsPacket.RECURSION_DESIRED,
    questions: [
      {
        type: 'TXT',
        name: queryName,
      },
    ],
  });
}

type LocalDnsServer = {
  host: string;
  port: number;
  close: () => Promise<void>;
};

function buildTxtResponseFromQuery(queryBuffer: Buffer, responseText: string): Buffer {
  const decoded = dnsPacket.decode(queryBuffer);
  const question = decoded.questions?.[0];
  if (!question || !question.name) {
    throw new Error('DNS query missing question');
  }

  return dnsPacket.encode({
    type: 'response',
    id: decoded.id,
    flags: dnsPacket.RECURSION_DESIRED | dnsPacket.AUTHORITATIVE_ANSWER,
    questions: decoded.questions,
    answers: [
      {
        type: 'TXT',
        name: question.name,
        ttl: 60,
        data: [responseText],
      },
    ],
  });
}

async function startLocalDnsServer(responseText: string): Promise<LocalDnsServer> {
  const tcpServer = net.createServer((socket) => {
    let buffer = Buffer.alloc(0);
    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      if (buffer.length < 2) {
        return;
      }
      const expectedLength = buffer.readUInt16BE(0);
      if (buffer.length < expectedLength + 2) {
        return;
      }
      const queryBuffer = buffer.subarray(2, expectedLength + 2);
      try {
        const response = buildTxtResponseFromQuery(queryBuffer, responseText);
        const payload = prependLength(response);
        socket.write(payload);
      } catch {
        // Ignore malformed queries.
      } finally {
        socket.end();
      }
    });
  });

  await new Promise<void>((resolve) => {
    tcpServer.listen(0, '127.0.0.1', () => resolve());
  });

  const address = tcpServer.address();
  if (!address || typeof address === 'string') {
    tcpServer.close();
    throw new Error('Failed to bind local TCP server');
  }

  const udpSocket = dgram.createSocket('udp4');
  await new Promise<void>((resolve) => {
    udpSocket.bind(address.port, '127.0.0.1', () => resolve());
  });

  udpSocket.on('message', (message, rinfo) => {
    try {
      const response = buildTxtResponseFromQuery(message, responseText);
      udpSocket.send(response, rinfo.port, rinfo.address);
    } catch {
      // Ignore malformed queries.
    }
  });

  return {
    host: '127.0.0.1',
    port: address.port,
    close: () =>
      new Promise((resolve) => {
        udpSocket.close(() => {
          tcpServer.close(() => resolve());
        });
      }),
  };
}

type NativeModule = {
  nativeDNS: {
    queryTXT: (domain: string, message: string) => Promise<string[]>;
  };
};

async function attemptNative(
  options: HarnessOptions,
  queryName: string,
): Promise<Omit<HarnessAttempt, 'method'>> {
  try {
    const start = Date.now();
    const nativeModule = (await importNativeModule()) as NativeModule | null;
    if (!nativeModule) {
      return {
        status: 'failure',
        durationMs: Date.now() - start,
        error: 'Native module unavailable in this environment',
      };
    }

    const records = await nativeModule.nativeDNS.queryTXT(options.server, queryName);
    return {
      status: 'success',
      durationMs: Date.now() - start,
      txtRecords: records,
    };
  } catch (error: any) {
    return {
      status: 'failure',
      durationMs: 0,
      error: error instanceof Error ? error.message : String(error ?? 'Native query failed'),
    };
  }
}

async function importNativeModule() {
  // Native module only works in React Native environment, not Node.js
  // The harness always runs in Node.js, so we always skip the native module
  // and rely on UDP/TCP transports instead
  if (process.env['DNS_HARNESS_DEBUG'] === '1') {
    console.warn('Native module skipped: DNS harness runs in Node.js (not React Native)');
  }
  return null;
}

async function attemptUdp(
  options: HarnessOptions,
  queryName: string,
  queryBuffer: Buffer,
  rawOutDir?: string,
  attemptIndex?: number,
): Promise<Omit<HarnessAttempt, 'method'>> {
  const start = Date.now();

  const requestPath = rawOutDir
    ? path.join(rawOutDir, `attempt-${attemptIndex ?? 0}-udp-request.bin`)
    : undefined;
  const responsePath = rawOutDir
    ? path.join(rawOutDir, `attempt-${attemptIndex ?? 0}-udp-response.bin`)
    : undefined;

  if (requestPath) {
    await fs.writeFile(requestPath, queryBuffer);
  }

  return new Promise((resolve) => {
    const socket = dgram.createSocket('udp4');
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      socket.removeAllListeners();
      socket.close();
    };

    socket.on('error', (error) => {
      cleanup();
      resolve({
        status: 'failure',
        durationMs: Date.now() - start,
        error: error.message || 'UDP socket error',
        ...(requestPath ? { rawRequestPath: requestPath } : {}),
      });
    });

    socket.on('message', async (response) => {
      cleanup();
      if (responsePath) {
        await fs.writeFile(responsePath, response);
      }
      try {
        const decoded = dnsPacket.decode(response);
        const answers = (decoded.answers || [])
          .filter((answer) => answer.type === 'TXT')
          .flatMap((answer: any) => answer.data || [])
          .map((buf: Buffer) => buf.toString('utf8'));
        resolve({
          status: 'success',
          durationMs: Date.now() - start,
          txtRecords: answers,
          ...(requestPath ? { rawRequestPath: requestPath } : {}),
          ...(responsePath ? { rawResponsePath: responsePath } : {}),
        });
      } catch (error: any) {
        resolve({
          status: 'failure',
          durationMs: Date.now() - start,
          error: error.message || 'Failed to decode UDP response',
          ...(requestPath ? { rawRequestPath: requestPath } : {}),
          ...(responsePath ? { rawResponsePath: responsePath } : {}),
        });
      }
    });

    timeout = setTimeout(() => {
      cleanup();
      resolve({
        status: 'failure',
        durationMs: Date.now() - start,
        error: `UDP query timed out after ${options.timeoutMs}ms`,
        ...(requestPath ? { rawRequestPath: requestPath } : {}),
      });
    }, options.timeoutMs);

    socket.send(queryBuffer, 0, queryBuffer.length, options.port, options.server, (error) => {
      if (error) {
        cleanup();
        resolve({
          status: 'failure',
          durationMs: Date.now() - start,
          error: error.message || 'UDP send failed',
          ...(requestPath ? { rawRequestPath: requestPath } : {}),
        });
      }
    });
  });
}

async function attemptTcp(
  options: HarnessOptions,
  queryName: string,
  queryBuffer: Buffer,
  rawOutDir?: string,
  attemptIndex?: number,
): Promise<Omit<HarnessAttempt, 'method'>> {
  const start = Date.now();

  const requestPath = rawOutDir
    ? path.join(rawOutDir, `attempt-${attemptIndex ?? 0}-tcp-request.bin`)
    : undefined;
  const responsePath = rawOutDir
    ? path.join(rawOutDir, `attempt-${attemptIndex ?? 0}-tcp-response.bin`)
    : undefined;

  if (requestPath) {
    await fs.writeFile(requestPath, prependLength(queryBuffer));
  }

  return new Promise((resolve) => {
    const client = net.createConnection({ host: options.server, port: options.port });
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const chunks: Buffer[] = [];

    const cleanup = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      client.removeAllListeners();
      client.end();
      client.destroy();
    };

    client.on('error', (error) => {
      cleanup();
      resolve({
        status: 'failure',
        durationMs: Date.now() - start,
        error: error.message || 'TCP socket error',
        ...(requestPath ? { rawRequestPath: requestPath } : {}),
      });
    });

    client.on('timeout', () => {
      cleanup();
      resolve({
        status: 'failure',
        durationMs: Date.now() - start,
        error: `TCP query timed out after ${options.timeoutMs}ms`,
        ...(requestPath ? { rawRequestPath: requestPath } : {}),
      });
    });

    client.on('data', (data) => {
      chunks.push(data);
    });

    client.on('end', async () => {
      cleanup();
      const responseBuffer = Buffer.concat(chunks);
      if (responsePath) {
        await fs.writeFile(responsePath, responseBuffer);
      }

      try {
        const decodedMessage = parseTcpResponse(responseBuffer);
        const answers = (decodedMessage.answers || [])
          .filter((answer: any) => answer.type === 'TXT')
          .flatMap((answer: any) => answer.data || [])
          .map((buf: Buffer) => buf.toString('utf8'));
        resolve({
          status: 'success',
          durationMs: Date.now() - start,
          txtRecords: answers,
          ...(requestPath ? { rawRequestPath: requestPath } : {}),
          ...(responsePath ? { rawResponsePath: responsePath } : {}),
        });
      } catch (error: any) {
        resolve({
          status: 'failure',
          durationMs: Date.now() - start,
          error: error.message || 'Failed to decode TCP response',
          ...(requestPath ? { rawRequestPath: requestPath } : {}),
          ...(responsePath ? { rawResponsePath: responsePath } : {}),
        });
      }
    });

    timeout = setTimeout(() => {
      client.emit('timeout');
    }, options.timeoutMs);

    const payload = prependLength(queryBuffer);
    client.write(payload);
  });
}

function prependLength(buffer: Buffer): Buffer {
  const lengthPrefixed = Buffer.alloc(buffer.length + 2);
  lengthPrefixed.writeUInt16BE(buffer.length, 0);
  buffer.copy(lengthPrefixed, 2);
  return lengthPrefixed;
}

function parseTcpResponse(buffer: Buffer) {
  if (buffer.length < 2) {
    throw new Error('TCP response too short to contain length prefix');
  }
  const expectedLength = buffer.readUInt16BE(0);
  const payload = buffer.slice(2);
  if (payload.length !== expectedLength) {
    throw new Error(`TCP response length mismatch (expected ${expectedLength}, got ${payload.length})`);
  }
  return dnsPacket.decode(payload);
}

function reduceTxtRecords(records: string[] | undefined): string | undefined {
  if (!records || records.length === 0) return undefined;

  const plainSegments: string[] = [];
  const parts: Array<{ part: number; total: number; content: string }> = [];

  for (const record of records) {
    const trimmed = (record ?? '').trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^(\d+)\/(\d+):(.*)$/);
    if (match && match[1] && match[2] && match[3] !== undefined) {
      parts.push({
        part: parseInt(match[1], 10),
        total: parseInt(match[2], 10),
        content: match[3],
      });
    } else {
      plainSegments.push(trimmed);
    }
  }

  if (plainSegments.length) {
    return plainSegments.join('');
  }

  if (!parts.length) {
    return undefined;
  }

  const firstPart = parts[0];
  if (!firstPart) {
    return undefined;
  }
  const total = firstPart.total;
  const map = new Map<number, string>();
  for (const part of parts) {
    if (!map.has(part.part)) {
      map.set(part.part, part.content);
    }
  }
  if (map.size !== total) {
    return undefined;
  }
  return Array.from({ length: total }, (_, i) => map.get(i + 1) ?? '').join('');
}

async function writeJsonArtifact(pathname: string, result: HarnessResult) {
  const dir = path.dirname(pathname);
  ensureDirectory(dir);
  await fs.writeFile(pathname, JSON.stringify(result, null, 2));
}

function normalizeServerHost(server: string): string {
  const trimmed = server.trim();
  if (!trimmed) return DEFAULT_SERVER;
  return trimmed.replace(/:\d+$/, '');
}

async function runHarness() {
  const options = parseArgs(process.argv.slice(2));
  validateMessage(options.message);
  let localServer: LocalDnsServer | null = null;

  if (options.localServer) {
    localServer = await startLocalDnsServer(`local:${options.message}`);
    options.server = localServer.host;
    options.port = localServer.port;
  }

  try {
    const sanitizedLabel = sanitizeMessageForDns(options.message);
    const normalizedServer = normalizeServerHost(options.server);
    const queryName = composeQueryName(sanitizedLabel, normalizedServer);
    const queryBuffer = buildDnsQueryBuffer(queryName);

    if (options.rawOutDir) {
      ensureDirectory(options.rawOutDir);
      await fs.writeFile(
        path.join(options.rawOutDir, 'input-metadata.json'),
        JSON.stringify(
          {
            message: options.message,
            sanitizedLabel,
            queryName,
            server: normalizedServer,
            port: options.port,
            methodOrder: options.methodOrder,
          },
          null,
          2,
        ),
      );
      await fs.writeFile(
        path.join(options.rawOutDir, 'query.bin'),
        queryBuffer,
      );
    }

    const attempts: HarnessAttempt[] = [];
    let finalResponse: string | undefined;
    let finalStatus: AttemptStatus = 'failure';

    for (let index = 0; index < options.methodOrder.length; index++) {
      const method = options.methodOrder[index];
      if (!method) {
        continue;
      }
      let attempt: Omit<HarnessAttempt, 'method'>;

      if (method === 'native') {
        attempt = await attemptNative(options, queryName);
      } else if (method === 'udp') {
        attempt = await attemptUdp(options, queryName, queryBuffer, options.rawOutDir, index);
      } else if (method === 'tcp') {
        attempt = await attemptTcp(options, queryName, queryBuffer, options.rawOutDir, index);
      } else {
        attempt = {
          status: 'failure',
          durationMs: 0,
          error: `Unsupported method: ${method}`,
        };
      }

      const harnessAttempt: HarnessAttempt = {
        method,
        ...attempt,
      };

      attempts.push(harnessAttempt);

      if (attempt.status === 'success') {
        finalStatus = 'success';
        finalResponse = reduceTxtRecords(attempt.txtRecords);
        break;
      }
    }

    const harnessResult: HarnessResult = {
      timestamp: new Date().toISOString(),
      message: options.message,
      sanitizedLabel,
      queryName,
      server: normalizedServer,
      port: options.port,
      methodOrder: options.methodOrder,
      attempts,
      finalStatus,
      ...(finalResponse ? { resolvedText: finalResponse } : {}),
    };

    console.log('DNS Harness');
    console.log(`  Message:        ${options.message}`);
    console.log(`  Sanitized:      ${sanitizedLabel}`);
    console.log(`  Query name:     ${queryName}`);
    console.log(`  Server:         ${normalizedServer}:${options.port}`);
    console.log(`  Method order:   ${options.methodOrder.join(' -> ')}`);

    for (const attempt of attempts) {
      if (attempt.status === 'success') {
        console.log(`  ${attempt.method.toUpperCase()} succeeded in ${attempt.durationMs}ms`);
        if (attempt.txtRecords?.length) {
          console.log(`    TXT records: ${JSON.stringify(attempt.txtRecords)}`);
        }
        if (finalResponse) {
          console.log(`    Combined: ${finalResponse}`);
        }
      } else {
        console.log(`  ${attempt.method.toUpperCase()} failed (${attempt.error ?? 'unknown error'})`);
      }
    }

    if (options.jsonOut) {
      await writeJsonArtifact(options.jsonOut, harnessResult);
      console.log(`  JSON artifact written to ${options.jsonOut}`);
    }

    if (options.rawOutDir) {
      console.log(`  Raw buffers saved to ${options.rawOutDir}`);
    }

    if (finalStatus === 'failure') {
      console.error('Harness failed to resolve TXT record with the provided transports.');
      process.exitCode = 1;
    }
  } finally {
    if (localServer) {
      await localServer.close();
    }
  }
}

runHarness().catch((error) => {
  console.error('DNS harness execution failed:', error instanceof Error ? error.stack : error);
  process.exit(1);
});
