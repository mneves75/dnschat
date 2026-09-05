import { spawn } from "node:child_process";
import dgram from "node:dgram";
import net from "node:net";
import path from "node:path";
import dnsPacket from "dns-packet";
const {
  composeQueryName,
  resolveTargetFromArgs,
  sanitizeMessage,
} = require("../scripts/dnsSmokeTestUtils");

describe("DNS smoke CLI TCP completion", () => {
  it.each([true, false])(
    "reports a complete TCP response=%s accurately",
    async (complete) => {
      const tcp = net.createServer((socket) => {
        let requestBuffer = Buffer.alloc(0);
        socket.on("data", (request) => {
          requestBuffer = Buffer.concat([requestBuffer, Buffer.from(request)]);
          if (
            requestBuffer.length < 2 ||
            requestBuffer.length < requestBuffer.readUInt16BE(0) + 2
          )
            return;
          socket.removeAllListeners("data");
          if (!complete) {
            socket.end();
            return;
          }
          const query = dnsPacket.decode(requestBuffer.subarray(2));
          const reply = dnsPacket.encode({
            type: "response",
            id: query.id,
            questions: query.questions,
            answers: [
              {
                type: "TXT",
                name: "ping.llm.pieter.com",
                ttl: 1,
                data: ["fixture-response"],
              },
            ],
          });
          const prefix = Buffer.alloc(2);
          prefix.writeUInt16BE(reply.length);
          socket.end(Buffer.concat([prefix, reply]));
        });
      });
      const udp = dgram.createSocket("udp4");
      udp.on("message", (_message, remote) => {
        udp.send(Buffer.from([0]), remote.port, remote.address);
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
          const child = spawn(process.execPath, [
            path.resolve("test-dns-simple.js"),
            "ping",
            "--resolver",
            "127.0.0.1",
            "--port",
            String(port),
            "--no-doh",
          ]);
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
        expect(result.output).toContain("UDP TXT query failed");
        expect(result.code).toBe(complete ? 0 : 1);
        expect(result.output).toContain(
          complete
            ? "Response: fixture-response"
            : "TCP connection closed before a complete DNS response",
        );
      } finally {
        udp.close();
        await new Promise<void>((resolve) => tcp.close(() => resolve()));
      }
    },
  );
});

describe("dnsSmokeTestUtils", () => {
  describe("sanitizeMessage", () => {
    it("sanitizes a message into a DNS label", () => {
      expect(sanitizeMessage("Hello world")).toBe("hello-world");
      expect(sanitizeMessage("  Hello   world  ")).toBe("hello-world");
      expect(sanitizeMessage("Hello, world!")).toBe("hello-world");
    });

    it("rejects empty messages", () => {
      expect(() => sanitizeMessage("   ")).toThrow("Message cannot be empty");
    });

    it("rejects messages that become empty after sanitization", () => {
      expect(() => sanitizeMessage("!!!")).toThrow(
        "Message must contain at least one letter or number after sanitization",
      );
    });

    it("enforces max DNS label length (63)", () => {
      // 64 ASCII chars should exceed label max after sanitization.
      const message = "a".repeat(64);
      expect(() => sanitizeMessage(message)).toThrow(
        "Message too long after sanitization",
      );
    });
  });

  describe("composeQueryName", () => {
    it("composes label + zone and strips trailing dots", () => {
      expect(composeQueryName("hello", "ch.at")).toBe("hello.ch.at");
      expect(composeQueryName("hello.", "ch.at.")).toBe("hello.ch.at");
    });

    it("requires non-empty label and zone", () => {
      expect(() => composeQueryName("", "ch.at")).toThrow(
        "DNS label must be non-empty",
      );
      expect(() => composeQueryName("hello", "   ")).toThrow(
        "DNS zone must be non-empty",
      );
    });
  });

  describe("resolveTargetFromArgs", () => {
    it("defaults resolver + zone to llm.pieter.com", () => {
      expect(
        resolveTargetFromArgs({
          resolverArg: null,
          zoneArg: null,
          portArg: null,
        }),
      ).toEqual({
        resolverHost: "llm.pieter.com",
        resolverPort: 53,
        zone: "llm.pieter.com",
      });
    });

    it("supports resolver host:port shorthand", () => {
      expect(
        resolveTargetFromArgs({
          resolverArg: "8.8.8.8:5353",
          zoneArg: "ch.at",
          portArg: null,
        }),
      ).toEqual({
        resolverHost: "8.8.8.8",
        resolverPort: 5353,
        zone: "ch.at",
      });
    });

    it("prefers explicit --port over resolver shorthand port", () => {
      expect(
        resolveTargetFromArgs({
          resolverArg: "8.8.8.8:5353",
          zoneArg: "ch.at",
          portArg: 53,
        }),
      ).toEqual({
        resolverHost: "8.8.8.8",
        resolverPort: 53,
        zone: "ch.at",
      });
    });

    it("keeps default zone when resolver is IP and zone not provided", () => {
      expect(
        resolveTargetFromArgs({
          resolverArg: "8.8.8.8",
          zoneArg: null,
          portArg: null,
        }),
      ).toEqual({
        resolverHost: "8.8.8.8",
        resolverPort: 53,
        zone: "llm.pieter.com",
      });
    });

    it("uses zone when resolver is a domain and zone not provided", () => {
      expect(
        resolveTargetFromArgs({
          resolverArg: "dns.example.com",
          zoneArg: null,
          portArg: null,
        }),
      ).toEqual({
        resolverHost: "dns.example.com",
        resolverPort: 53,
        zone: "llm.pieter.com",
      });
    });
  });
});
