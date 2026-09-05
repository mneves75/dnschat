import { spawn } from "node:child_process";
import dgram from "node:dgram";
import fs from "node:fs";
import net from "node:net";
import dnsPacket from "dns-packet";
import ts from "typescript";

const harness = ts
  .transpileModule(fs.readFileSync("scripts/run-dns-harness.ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  })
  .outputText.replace(/^#![^\n]*\n/, "");

describe.each(["udp", "tcp"])(
  "DNS harness %s response validation",
  (method) => {
    it.each<[string[], number]>([
      [["fixture-response"], 0],
      [[], 1],
      [["1/2:incomplete"], 1],
    ])("checks TXT records %j", async (records, expected) => {
      const reply = (queryBuffer: Buffer) => {
        const query = dnsPacket.decode(queryBuffer);
        return dnsPacket.encode({
          type: "response",
          id: query.id,
          questions: query.questions,
          answers: records.map((record) => ({
            type: "TXT" as const,
            name: "ping.llm.pieter.com",
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
          socket.end(Buffer.concat([prefix, response]));
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
              "-e",
              harness,
              "harness",
              "--message",
              "ping",
              "--server",
              "127.0.0.1",
              "--port",
              String(port),
              "--method-order",
              method,
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
          expected === 0
            ? "Combined: fixture-response"
            : "No complete TXT response returned",
        );
      } finally {
        udp.close();
        await new Promise<void>((resolve) => tcp.close(() => resolve()));
      }
    });
  },
);
