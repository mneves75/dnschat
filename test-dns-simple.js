#!/usr/bin/env node

const dgram = require('dgram');
const crypto = require('crypto');
const dnsPacket = require('dns-packet');

const DEFAULT_SERVER = 'ch.at';
const DNS_PORT = 53;
const MAX_MESSAGE_LENGTH = 120;

function composeQueryName(label, dnsServer) {
  const trimmedLabel = label.replace(/\.+$/g, '').trim();
  if (!trimmedLabel) {
    throw new Error('DNS label must be non-empty when composing query name');
  }

  const serverInput = (dnsServer || '').trim().replace(/:\d+$/, '').replace(/\.+$/g, '');
  const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  const zone = !serverInput || ipRegex.test(serverInput) ? DEFAULT_SERVER : serverInput.toLowerCase();

  return `${trimmedLabel}.${zone}`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const allowExperimental = args.includes('--experimental');
  const messageArg = args.find((arg) => !arg.startsWith('--'));
  return {
    allowExperimental,
    message: messageArg || 'Hello from DNS test!',
  };
}

function sanitizeMessage(message) {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error('Message cannot be empty');
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message too long (maximum ${MAX_MESSAGE_LENGTH} characters before sanitization)`);
  }

  if (/[^\x09\x0A\x0D\x20-\x7E]/.test(trimmed)) {
    throw new Error('Message contains control characters that cannot be encoded safely');
  }

  let result = trimmed.toLowerCase();
  result = result.replace(/\s+/g, '-');
  result = result.replace(/[^a-z0-9-]/g, '');
  result = result.replace(/-{2,}/g, '-');
  result = result.replace(/^-+|-+$/g, '');

  if (!result) {
    throw new Error('Message cannot be empty after sanitization');
  }

  if (result.length > 63) {
    throw new Error('Message too long after sanitization (maximum 63 characters)');
  }

  return result;
}

function buildQuery(queryName) {
  return dnsPacket.encode({
    type: 'query',
    id: crypto.randomInt(0, 65535),
    flags: dnsPacket.RECURSION_DESIRED,
    questions: [
      {
        type: 'TXT',
        name: queryName,
      },
    ],
  });
}

async function queryUdp(queryName) {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket('udp4');
    const message = buildQuery(queryName);

    const timeout = setTimeout(() => {
      socket.close();
      reject(new Error('UDP query timed out (2s)'));
    }, 2000);

    socket.on('error', (error) => {
      clearTimeout(timeout);
      socket.close();
      reject(error);
    });

    socket.on('message', (response) => {
      clearTimeout(timeout);
      socket.close();
      try {
        const decoded = dnsPacket.decode(response);
        const answers = decoded.answers || [];
        if (!answers.length) {
          return reject(new Error('No TXT records returned'));
        }
        const txtData = answers
          .flatMap((answer) => answer.data || [])
          .map((buffer) => buffer.toString('utf8'))
          .join('');
        resolve({ txtData, answers });
      } catch (error) {
        reject(error);
      }
    });

    socket.send(message, 0, message.length, DNS_PORT, DEFAULT_SERVER);
  });
}

(async () => {
  const { allowExperimental, message } = parseArgs();
  console.log('🧪 DNS smoke test');
  console.log(`📨 Raw message: "${message}"`);
  console.log(
    allowExperimental
      ? '⚙️  Experimental transports flag supplied (informational only)'
      : '🛡️  Native-only transport enforced by default',
  );

  const encodedLabel = sanitizeMessage(message);
  const queryName = composeQueryName(encodedLabel, DEFAULT_SERVER);
  console.log(`🔐 Encoded label: ${encodedLabel}`);
  console.log(`🌐 Query name: ${queryName}`);

  try {
    const start = Date.now();
    const { txtData } = await queryUdp(queryName);
    const duration = Date.now() - start;
    console.log('✅ UDP TXT query succeeded');
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📥 Response: ${txtData}`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ UDP TXT query failed: ${error.message}`);
    if (!allowExperimental) {
      console.log(
        "ℹ️  Re-run with '--experimental' to log fallback intention (app enables UDP/TCP/HTTPS when toggle is on).",
      );
    }
    process.exit(1);
  }
})();
