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
    // Discover the stubs rather than listing them. A hand-maintained list meant
    // adding one stub silently excluded it from the compile, which surfaced as a
    // bogus "DNSResolver.java does not compile" failure.
    const collectJavaFiles = (directory: string): string[] =>
      fs
        .readdirSync(directory, { withFileTypes: true })
        .flatMap((entry) => {
          const entryPath = path.join(directory, entry.name);
          if (entry.isDirectory()) return collectJavaFiles(entryPath);
          return entry.isFile() && entry.name.endsWith(".java")
            ? [entryPath]
            : [];
        })
        .sort();

    const stubSources = collectJavaFiles(path.join(fixtureRoot, "stubs"));
    // Guard the glob itself: an empty or truncated stub set would make the
    // compile fail for the wrong reason.
    expect(stubSources.length).toBeGreaterThanOrEqual(12);

    const javaSources = [
      path.join(moduleRoot, "android", "DNSResolver.java"),
      path.join(fixtureRoot, "DNSResolverJvmHarness.java"),
      ...stubSources,
    ];

    try {
      // JVM startup plus a ~2k-line compile is fast when idle but not when the
      // machine is loaded; a 30s budget produced SIGTERM/status:null flakes on a
      // busy host (load ~17) for a compile that passes in seconds when idle.
      // These bounds only exist to stop a wedged toolchain hanging the suite.
      const compile = spawnSync(
        "javac",
        ["-source", "8", "-target", "8", "-d", outputDirectory, ...javaSources],
        { encoding: "utf8", timeout: 180_000 },
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
        // The harness itself asserts its own sub-second deadlines, so this only
        // bounds a hung JVM, not the behavior under test.
        { encoding: "utf8", timeout: 60_000 },
      );

      expect(run.stdout).toContain("PASS parser-transactionality-and-utf8");
      expect(run.stdout).toContain("PASS expanded-dns-name-boundaries");
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
