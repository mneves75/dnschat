import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// The parser has no Network/UIKit dependency. Execute the actual production
// readName body on macOS without needing an iOS build or copying its algorithm.
const swiftTest = process.platform === "darwin" ? describe : describe.skip;

swiftTest("iOS wire-name identity", () => {
  it("preserves label boundaries and folds only ASCII case", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../../ios/DNSResolver.swift"),
      "utf8",
    );
    const start = source.indexOf("    private func readName(");
    const end = source.indexOf("    // MARK: - Sanitization helpers", start);
    expect(start).toBeGreaterThan(0);
    expect(end).toBeGreaterThan(start);
    const method = source.slice(start, end).replace("private func", "func");
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "dns-name-swift-"));
    const harness = `
import Foundation
enum DNSError: Error { case queryFailed(String) }
final class NameParser {
    static let maxQNameLength = 255
${method}
}
func wire(_ labels: [String]) -> [UInt8] {
    labels.flatMap { [UInt8($0.utf8.count)] + Array($0.utf8) } + [0]
}
let parser = NameParser()
let expected = "k.llm.pieter.com"
var failures = 0
func check(_ condition: Bool, _ label: String) {
    print("\\(condition ? "PASS" : "FAIL") \\(label)")
    if !condition { failures += 1 }
}
let ordinary = wire(["K", "LLM", "PIETER", "COM"])
let plain = try parser.readName(bytes: ordinary, offset: 0)
check(plain.0 == expected && plain.1 == ordinary.count, "ASCII case")
let compressed = ordinary + [0xC0, 0]
let pointed = try parser.readName(bytes: compressed, offset: ordinary.count)
check(pointed.0 == expected && pointed.1 == compressed.count, "compression")
let dotted = try parser.readName(bytes: wire([expected]), offset: 0)
check(dotted.0 != expected, "literal dot label")
let unicode = try parser.readName(bytes: wire(["K", "llm", "pieter", "com"]), offset: 0)
check(unicode.0 != expected, "Unicode casefold")
let escaped = try parser.readName(bytes: wire(["k\\\\046llm", "pieter", "com"]), offset: 0)
check(escaped.0 != dotted.0, "escape identity")
exit(failures == 0 ? 0 : 1)
`;
    try {
      const input = path.join(directory, "main.swift");
      const executable = path.join(directory, "name-test");
      fs.writeFileSync(input, harness);
      const compile = spawnSync(
        "swiftc",
        [
          "-module-cache-path",
          path.join(directory, "cache"),
          input,
          "-o",
          executable,
        ],
        { encoding: "utf8", timeout: 180_000 },
      );
      expect({ status: compile.status, stderr: compile.stderr }).toEqual({
        status: 0,
        stderr: "",
      });
      const run = spawnSync(executable, [], {
        encoding: "utf8",
        timeout: 10_000,
      });
      expect({
        status: run.status,
        stdout: run.stdout,
        stderr: run.stderr,
      }).toEqual({
        status: 0,
        stdout: [
          "PASS ASCII case",
          "PASS compression",
          "PASS literal dot label",
          "PASS Unicode casefold",
          "PASS escape identity",
          "",
        ].join("\n"),
        stderr: "",
      });
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
});
