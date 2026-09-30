import { spawn, execFileSync } from "node:child_process";
import dgram from "node:dgram";
import net from "node:net";
import dnsPacket from "dns-packet";

beforeAll(() => {
  execFileSync(process.execPath, [
    "node_modules/typescript/bin/tsc",
    "-p",
    "scripts/tsconfig.harness.json",
  ]);
}, 30000);

describe.each(["udp", "tcp"])(
  "DNS harness %s response validation",
  (method) => {
    it.each<[string[], number, string]>([
      [["fixture-response"], 0, "valid"],
      [["fixture-response"], 0, "keep-open"],
      [[], 1, "valid"],
      [["1/2:incomplete"], 1, "valid"],
      [["1/2:a", "3/2:c"], 1, "valid"],
      [["plain", "1/1:part"], 1, "valid"],
      [["fixture-response"], 1, "id"],
      [["fixture-response"], 1, "question"],
      [["fixture-response"], 1, "owner"],
      [["fixture-response"], 1, "class"],
      [["fixture-response"], 1, "truncated"],
    ])("checks TXT records %j (%s, %s)", async (records, expected, variant) => {
      const reply = (queryBuffer: Buffer) => {
        const query = dnsPacket.decode(queryBuffer);
        return dnsPacket.encode({
          type: "response",
          id: variant === "id" ? (query.id! + 1) & 0xffff : query.id,
          flags: variant === "truncated" ? dnsPacket.TRUNCATED_RESPONSE : 0,
          questions:
            variant === "question"
              ? [{ name: "other.llm.pieter.com", type: "TXT", class: "IN" }]
              : query.questions,
          answers: records.map((record) => ({
            type: "TXT" as const,
            name:
              variant === "owner"
                ? "other.llm.pieter.com"
                : "ping.llm.pieter.com",
            class: variant === "class" ? "CH" : "IN",
            ttl: 1,
            data: [record],
          })),
        });
      };
      const udp = dgram.createSocket("udp4");
      udp.on("message", (query, remote) =>
        udp.send(reply(query), remote.port, remote.address),
      );
      const tcp = net.createServer((socket) => {
        let requestBuffer = Buffer.alloc(0);
        socket.on("data", (query) => {
          requestBuffer = Buffer.concat([requestBuffer, Buffer.from(query)]);
          if (
            requestBuffer.length < 2 ||
            requestBuffer.length < requestBuffer.readUInt16BE(0) + 2
          )
            return;
          socket.removeAllListeners("data");
          const response = reply(requestBuffer.subarray(2));
          const prefix = Buffer.alloc(2);
          prefix.writeUInt16BE(response.length);
          const frame = Buffer.concat([prefix, response]);
          if (variant === "keep-open") socket.write(frame);
          else socket.end(frame);
        });
      });
      try {
        await new Promise<void>((resolve) =>
          tcp.listen(0, "127.0.0.1", resolve),
        );
        const port = (tcp.address() as net.AddressInfo).port;
        await new Promise<void>((resolve) =>
          udp.bind(port, "127.0.0.1", resolve),
        );
        const result = await new Promise<{
          code: number | null;
          output: string;
        }>((resolve, reject) => {
          const child = spawn(
            process.execPath,
            [
              "scripts/dist/scripts/run-dns-harness.js",
              "--message",
              "ping",
              "--server",
              "127.0.0.1",
              "--port",
              String(port),
              "--method-order",
              method,
              "--timeout",
              "500",
            ],
            { timeout: 10000 },
          );
          let output = "";
          child.stdout.on("data", (chunk) => {
            output += chunk;
          });
          child.stderr.on("data", (chunk) => {
            output += chunk;
          });
          child.on("error", reject);
          child.on("close", (code) => resolve({ code, output }));
        });
        expect(result.code).toBe(expected);
        expect(result.output).toContain(
          expected === 0 ? "Combined: fixture-response" : "failed",
        );
      } finally {
        udp.close();
        await new Promise<void>((resolve) => tcp.close(() => resolve()));
      }
    });
  },
);
