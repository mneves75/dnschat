import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

describe("Android DNSResolver executable JVM boundaries", () => {
  it("bounds stalled host resolution and enforces parser/body limits", () => {
    const moduleRoot = path.resolve(__dirname, "../..");
    const fixtureRoot = path.join(__dirname, "jvm");
    const outputDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "dnsresolver-jvm-"),
    );
    const javaSources = [
      path.join(moduleRoot, "android", "DNSResolver.java"),
      path.join(fixtureRoot, "DNSResolverJvmHarness.java"),
      path.join(
        fixtureRoot,
        "stubs",
        "android",
        "net",
        "ConnectivityManager.java",
      ),
      path.join(fixtureRoot, "stubs", "android", "net", "DnsResolver.java"),
      path.join(fixtureRoot, "stubs", "android", "net", "Network.java"),
      path.join(fixtureRoot, "stubs", "android", "os", "Build.java"),
      path.join(
        fixtureRoot,
        "stubs",
        "android",
        "os",
        "CancellationSignal.java",
      ),
      path.join(fixtureRoot, "stubs", "android", "os", "SystemClock.java"),
      path.join(fixtureRoot, "stubs", "android", "util", "Log.java"),
      path.join(fixtureRoot, "stubs", "org", "xbill", "DNS", "DClass.java"),
      path.join(fixtureRoot, "stubs", "org", "xbill", "DNS", "Lookup.java"),
      path.join(fixtureRoot, "stubs", "org", "xbill", "DNS", "Name.java"),
      path.join(fixtureRoot, "stubs", "org", "xbill", "DNS", "Record.java"),
      path.join(fixtureRoot, "stubs", "org", "xbill", "DNS", "Resolver.java"),
      path.join(
        fixtureRoot,
        "stubs",
        "org",
        "xbill",
        "DNS",
        "SimpleResolver.java",
      ),
      path.join(fixtureRoot, "stubs", "org", "xbill", "DNS", "TXTRecord.java"),
      path.join(fixtureRoot, "stubs", "org", "xbill", "DNS", "Type.java"),
    ];

    try {
      const compile = spawnSync(
        "javac",
        ["-source", "8", "-target", "8", "-d", outputDirectory, ...javaSources],
        { encoding: "utf8", timeout: 30_000 },
      );

      expect({
        status: compile.status,
        signal: compile.signal,
        stdout: compile.stdout,
        stderr: compile.stderr,
      }).toEqual({
        status: 0,
        signal: null,
        stdout: "",
        stderr: expect.any(String),
      });

      const run = spawnSync(
        "java",
        ["-cp", outputDirectory, "com.dnsnative.DNSResolverJvmHarness"],
        { encoding: "utf8", timeout: 10_000 },
      );

      expect(run.stdout).toContain("PASS parser-transactionality-and-utf8");
      // doh-body-size-boundaries is intentionally absent: the Cloudflare DoH
      // transport was removed, so there is no readDnsMessageBody left to bound.
      expect(run.stdout).not.toContain("doh-body-size-boundaries");
      expect(run.stdout).toContain(
        "PASS stalled-resolution-deadline-and-cleanup",
      );
      expect(run.stdout).toContain("PASS expired-caller-deadline-before-io");
      expect(run.stdout).toContain(
        "PASS legacy-fallback-observability-positive-control",
      );
      expect(run.stdout).toContain(
        "PASS short-caller-deadline-bounds-fallback",
      );
      expect(run.stdout).toContain(
        "PASS cancelled-identical-queries-release-raw-udp-workers",
      );
      expect(run.stdout).toContain(
        "PASS cancel-during-host-resolution-blocks-raw-udp",
      );
      expect(run.stdout).toContain(
        "PASS cancelled-host-lookups-do-not-retain-query-workers",
      );
      expect(run.stdout).toContain(
        "PASS platform-resolver-timeout-cancels-signal",
      );
      expect({
        status: run.status,
        signal: run.signal,
        stdout: run.stdout,
        stderr: run.stderr,
      }).toEqual({
        status: 0,
        signal: null,
        stdout: expect.any(String),
        stderr: "",
      });
    } finally {
      fs.rmSync(outputDirectory, { recursive: true, force: true });
    }
  });
});
