#!/usr/bin/env node

const dgram = require("dgram");
const net = require("net");
const crypto = require("crypto");
const dnsPacket = require("dns-packet");

const {
  composeQueryName,
  DEFAULT_ZONE,
  resolveTargetFromArgs,
  sanitizeMessage,
} = require("./scripts/dnsSmokeTestUtils");

function parseArgs() {
  const args = process.argv.slice(2);
  const allowExperimental = args.includes("--experimental");
  const noTcp = args.includes("--no-tcp");
  const noDoh = args.includes("--no-doh");
  const forceDoh = args.includes("--force-doh");
  const localServer = args.includes("--local-server");

  const resolverIndex = args.findIndex((arg) => arg === "--resolver" || arg === "--server");
  const zoneIndex = args.findIndex((arg) => arg === "--zone");
  const portIndex = args.findIndex((arg) => arg === "--port");
  const messageIndex = args.findIndex((arg) => arg === "--message");

  const messageArg = messageIndex >= 0 ? args[messageIndex + 1] : args.find((arg) => !arg.startsWith("--"));

  return {
    allowExperimental,
    noTcp,
    noDoh,
    forceDoh,
    localServer,
    resolver: resolverIndex >= 0 ? args[resolverIndex + 1] : null,
    zone: zoneIndex >= 0 ? args[zoneIndex + 1] : null,
    port: portIndex >= 0 ? Number(args[portIndex + 1]) : null,
    message: messageArg || "Hello from DNS test!",
  };
}

function formatDuration(ms) {
  return `${ms}ms`;
}

function buildQuery(queryName) {
  return dnsPacket.encode({
    type: "query",
    id: crypto.randomInt(0, 65535),
    flags: dnsPacket.RECURSION_DESIRED,
    questions: [
      {
        type: "TXT",
        name: queryName,
      },
    ],
  });
}

function buildTxtResponseFromQuery(queryBuffer, responseText) {
  const decoded = dnsPacket.decode(queryBuffer);
  const question = decoded.questions && decoded.questions[0];
  if (!question || !question.name) {
    throw new Error("DNS query missing question");
  }

  return dnsPacket.encode({
    type: "response",
    id: decoded.id,
    flags: dnsPacket.RECURSION_DESIRED | dnsPacket.AUTHORITATIVE_ANSWER,
    questions: decoded.questions,
    answers: [
      {
        type: "TXT",
        name: question.name,
        ttl: 60,
        data: [responseText],
      },
    ],
  });
}

async function startLocalDnsServer(responseText) {
  const tcpServer = net.createServer((socket) => {
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
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
        const prefix = Buffer.alloc(2);
        prefix.writeUInt16BE(response.length, 0);
        socket.write(Buffer.concat([prefix, response]));
      } catch {
        // Ignore malformed queries.
      } finally {
        socket.end();
      }
    });
  });

  await new Promise((resolve) => tcpServer.listen(0, "127.0.0.1", resolve));

  const address = tcpServer.address();
  if (!address || typeof address === "string") {
    tcpServer.close();
    throw new Error("Failed to bind local TCP server");
  }

  const udpSocket = dgram.createSocket("udp4");
  await new Promise((resolve) => udpSocket.bind(address.port, "127.0.0.1", resolve));

  udpSocket.on("message", (message, rinfo) => {
    try {
      const response = buildTxtResponseFromQuery(message, responseText);
      udpSocket.send(response, rinfo.port, rinfo.address);
    } catch {
      // Ignore malformed queries.
    }
  });

  return {
    host: "127.0.0.1",
    port: address.port,
    close: () =>
      new Promise((resolve) => {
        udpSocket.close(() => {
          tcpServer.close(() => resolve());
        });
      }),
  };
}

function decodeTxtResponse(decoded) {
  const answers = decoded.answers || [];
  if (!answers.length) {
    throw new Error("No TXT records returned");
  }
  const txtData = answers
    .flatMap((answer) => answer.data || [])
    .map((buffer) => buffer.toString("utf8"))
    .join("");
  return { txtData, answers };
}

async function queryUdp({ resolverHost, resolverPort, queryName, timeoutMs }) {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket("udp4");
    const message = buildQuery(queryName);

    const timeout = setTimeout(() => {
      socket.close();
      reject(new Error(`UDP query timed out (${timeoutMs}ms)`));
    }, timeoutMs);

    socket.on("error", (error) => {
      clearTimeout(timeout);
      socket.close();
      reject(error);
    });

    socket.on("message", (response) => {
      clearTimeout(timeout);
      socket.close();
      try {
        const decoded = dnsPacket.decode(response);
        resolve(decodeTxtResponse(decoded));
      } catch (error) {
        reject(error);
      }
    });

    socket.send(message, 0, message.length, resolverPort, resolverHost);
  });
}

async function queryTcp({ resolverHost, resolverPort, queryName, timeoutMs }) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: resolverHost, port: resolverPort });
    const query = buildQuery(queryName);

    const lengthPrefix = Buffer.alloc(2);
    lengthPrefix.writeUInt16BE(query.length, 0);

    const timeout = setTimeout(() => {
      socket.destroy(new Error(`TCP query timed out (${timeoutMs}ms)`));
    }, timeoutMs);

    const chunks = [];
    let expectedLength = null;
    let bytesSeen = 0;

    socket.on("connect", () => {
      socket.write(Buffer.concat([lengthPrefix, query]));
    });

    socket.on("data", (chunk) => {
      chunks.push(chunk);
      bytesSeen += chunk.length;

      const buffer = Buffer.concat(chunks, bytesSeen);
      if (expectedLength == null && buffer.length >= 2) {
        expectedLength = buffer.readUInt16BE(0) + 2;
      }

      if (expectedLength != null && buffer.length >= expectedLength) {
        clearTimeout(timeout);
        socket.end();
        try {
          const payload = buffer.subarray(2, expectedLength);
          const decoded = dnsPacket.decode(payload);
          resolve(decodeTxtResponse(decoded));
        } catch (error) {
          reject(error);
        }
      }
    });

    socket.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    socket.on("close", () => {
      clearTimeout(timeout);
    });
  });
}

function stripDnsJsonQuotes(value) {
  const raw = String(value || "");
  const trimmed = raw.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

async function queryDohJson({ providerName, url, queryName, timeoutMs }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "application/dns-json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`${providerName} DoH HTTP ${response.status}`);
    }

    const body = await response.json();
    const answers = Array.isArray(body.Answer) ? body.Answer : [];
    const txtData = answers
      .filter((answer) => answer && answer.type === 16 && typeof answer.data === "string")
      .map((answer) => stripDnsJsonQuotes(answer.data))
      .join("");

    if (!txtData) {
      throw new Error(`${providerName} DoH returned no TXT answers`);
    }

    return { txtData, answers };
  } finally {
    clearTimeout(timeout);
  }
}

(async () => {
  const {
    allowExperimental,
    message,
    noTcp,
    noDoh,
    forceDoh,
    resolver,
    zone,
    port,
    localServer,
  } = parseArgs();
  const target = resolveTargetFromArgs({ resolverArg: resolver, zoneArg: zone, portArg: port });
  let localDnsServer = null;
  if (localServer) {
    localDnsServer = await startLocalDnsServer(`local:${message}`);
    target.resolverHost = localDnsServer.host;
    target.resolverPort = localDnsServer.port;
  }

  console.log("DNS smoke test");
  console.log(`Raw message: "${message}"`);
  if (allowExperimental) {
    console.log("Note: --experimental enabled (more retries + logs)");
  }

  const encodedLabel = sanitizeMessage(message);
  const queryName = composeQueryName(encodedLabel, target.zone);
  console.log(`Encoded label: ${encodedLabel}`);
  console.log(`Query name: ${queryName}`);
  console.log(`Resolver: ${target.resolverHost}:${target.resolverPort}`);
  console.log(`Zone: ${target.zone}`);

  try {
    const start = Date.now();
    const { txtData } = await queryUdp({
      resolverHost: target.resolverHost,
      resolverPort: target.resolverPort,
      queryName,
      // Keep default reasonably strict but not flaky; 2s is borderline for ch.at.
      timeoutMs: allowExperimental ? 6000 : 3000,
    });
    const durationMs = Date.now() - start;
    console.log("OK transport=udp");
    console.log(`Duration: ${formatDuration(durationMs)}`);
    console.log(`Response: ${txtData}`);
    if (localDnsServer) {
      await localDnsServer.close();
    }
    process.exit(0);
  } catch (error) {
    console.error(`UDP TXT query failed: ${error.message}`);
  }

  if (!noTcp) {
    try {
      const start = Date.now();
      const { txtData } = await queryTcp({
        resolverHost: target.resolverHost,
        resolverPort: target.resolverPort,
        queryName,
        timeoutMs: 4000,
      });
      const durationMs = Date.now() - start;
      console.log("OK transport=tcp");
      console.log(`Duration: ${formatDuration(durationMs)}`);
      console.log(`Response: ${txtData}`);
      if (localDnsServer) {
        await localDnsServer.close();
      }
      process.exit(0);
    } catch (error) {
      console.error(`TCP TXT query failed: ${error.message}`);
    }
  }

  // DoH fallback is valuable on networks where UDP/TCP 53 is blocked.
  // Note: In this repo, ch.at is often a custom DNS server; public DoH resolvers
  // may not return TXT records for that zone. We default to skipping DoH for ch.at
  // unless explicitly forced.
  const dohAllowed =
    !localServer && (forceDoh || (target.zone !== DEFAULT_ZONE && (!noDoh || allowExperimental)));

  if (dohAllowed) {
    try {
      const start = Date.now();
      const cloudflareUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(
        queryName
      )}&type=TXT`;
      const { txtData } = await queryDohJson({
        providerName: "Cloudflare",
        url: cloudflareUrl,
        queryName,
        timeoutMs: 6000,
      });
      const durationMs = Date.now() - start;
      console.log("OK transport=doh provider=cloudflare");
      console.log(`Duration: ${formatDuration(durationMs)}`);
      console.log(`Response: ${txtData}`);
      if (localDnsServer) {
        await localDnsServer.close();
      }
      process.exit(0);
    } catch (error) {
      console.error(`DoH TXT query failed: ${error.message}`);
    }

    if (allowExperimental) {
      try {
        const start = Date.now();
        const googleUrl = `https://dns.google/resolve?name=${encodeURIComponent(
          queryName
        )}&type=TXT`;
        const { txtData } = await queryDohJson({
          providerName: "Google",
          url: googleUrl,
          queryName,
          timeoutMs: 6000,
        });
        const durationMs = Date.now() - start;
        console.log("OK transport=doh provider=google");
        console.log(`Duration: ${formatDuration(durationMs)}`);
        console.log(`Response: ${txtData}`);
        if (localDnsServer) {
          await localDnsServer.close();
        }
        process.exit(0);
      } catch (error) {
        console.error(`DoH (experimental Google) TXT query failed: ${error.message}`);
      }
    }
  } else if (!noDoh || allowExperimental) {
    console.log(
      `Skipping DoH fallback: zone=${target.zone} is not expected to be resolvable via public DoH (use --force-doh to try anyway).`
    );
  }

  if (localDnsServer) {
    await localDnsServer.close();
  }
  console.error("DNS smoke test failed: no transport succeeded.");
  process.exit(1);
})();
