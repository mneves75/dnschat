import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

describe("Android launcher reverse setup", () => {
  it("reverses only the explicitly selected device and CLI port", () => {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "dnschat-adb-test-"));
    const bin = path.join(fixture, "bin");
    fs.mkdirSync(bin);
    const commandLog = path.join(fixture, "commands.log");
    const executable = (name: string, body: string) =>
      fs.writeFileSync(path.join(bin, name), `#!/bin/sh\n${body}\n`, {
        mode: 0o700,
      });
    executable(
      "adb",
      'if [ "$1" = devices ]; then printf "List of devices attached\\nemulator-5554\\tdevice\\nemulator-5556\\tdevice\\n"; else printf "%s\\n" "$*" >> "$DNSCHAT_TEST_COMMAND_LOG"; fi',
    );
    executable("java", "printf 'openjdk version \"17.0.11\"\\n' >&2");
    executable("pnpm", "exit 0");
    try {
      execFileSync(
        process.execPath,
        [
          "scripts/run-android.js",
          "--device",
          "emulator-5554",
          "--port",
          "19007",
        ],
        {
          env: {
            ...process.env,
            JAVA_HOME: fixture,
            PATH: `${bin}${path.delimiter}${process.env["PATH"]}`,
            DNSCHAT_TEST_COMMAND_LOG: commandLog,
          },
        },
      );
      expect(fs.readFileSync(commandLog, "utf8").trim().split("\n")).toEqual([
        "-s emulator-5554 reverse tcp:19007 tcp:19007",
      ]);
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });
});
