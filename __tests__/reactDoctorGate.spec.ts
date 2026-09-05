import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

describe("React Doctor completion gate", () => {
  let scratch: string;
  beforeEach(() => {
    scratch = fs.mkdtempSync(path.join(os.tmpdir(), "dns-doctor-gate-"));
  });
  afterEach(() => fs.rmSync(scratch, { recursive: true, force: true }));

  const complete = {
    schemaVersion: 3,
    version: "0.9.13",
    ok: true,
    projects: [{ complete: true, skippedChecks: [] }],
    diagnostics: [
      {
        severity: "warning",
        filePath: "src/example.tsx",
        line: 1,
        rule: "example",
        message: "Review this warning",
      },
    ],
    summary: { errorCount: 0, warningCount: 1, score: null },
  };

  function run(body: string) {
    fs.writeFileSync(
      path.join(scratch, "pnpm"),
      `#!${process.execPath}\nrequire('node:fs').writeFileSync(${JSON.stringify(path.join(scratch, "args.json"))}, JSON.stringify(process.argv.slice(2)));\n${body}`,
      { mode: 0o755 },
    );
    return spawnSync(
      process.execPath,
      [path.join(process.cwd(), "scripts/run-react-doctor.js")],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          PATH: `${scratch}${path.delimiter}${process.env["PATH"]}`,
        },
      },
    );
  }

  it("accepts complete analysis, preserves warnings and pins the CLI", () => {
    const result = run(
      `console.log(${JSON.stringify(JSON.stringify(complete))});`,
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Review this warning");
    expect(
      JSON.parse(fs.readFileSync(path.join(scratch, "args.json"), "utf8")),
    ).toEqual([
      "--silent",
      "dlx",
      "react-doctor@0.9.13",
      ".",
      "--project",
      "chat-dns",
      "--json",
    ]);
  });

  it.each([
    {
      ...complete,
      projects: [
        {
          complete: false,
          skippedChecks: ["dead-code"],
          skippedCheckReasons: { "dead-code": "Worker failed" },
        },
      ],
    },
    { ...complete, projects: [{ complete: true, skippedChecks: ["lint"] }] },
    { ...complete, projects: [] },
    { ...complete, summary: { errorCount: 1 } },
    { ok: true },
  ])(
    "rejects incomplete or invalid reports despite child success",
    (report) => {
      expect(
        run(`console.log(${JSON.stringify(JSON.stringify(report))});`).status,
      ).toBe(1);
    },
  );

  it("reports the incomplete check reason", () => {
    const report = {
      ...complete,
      projects: [
        {
          complete: false,
          skippedChecks: ["dead-code"],
          skippedCheckReasons: { "dead-code": "Worker failed" },
        },
      ],
    };
    expect(
      run(`console.log(${JSON.stringify(JSON.stringify(report))});`).stderr,
    ).toContain("Worker failed");
  });

  it("rejects malformed output", () => {
    expect(run("console.log('not JSON');").status).toBe(1);
  });

  it("preserves process failures and stderr", () => {
    const result = run("console.error('tool failed'); process.exit(7);");
    expect(result.status).toBe(7);
    expect(result.stderr).toContain("tool failed");
  });

  it("rejects termination by signal", () => {
    const result = run("process.kill(process.pid, 'SIGTERM');");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("SIGTERM");
  });
});
