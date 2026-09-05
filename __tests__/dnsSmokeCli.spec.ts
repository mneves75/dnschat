import { spawn } from "node:child_process";
import dgram from "node:dgram";
import net from "node:net";
import path from "node:path";
import dnsPacket from "dns-packet";

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
