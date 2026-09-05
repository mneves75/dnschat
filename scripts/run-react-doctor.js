#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const path = require("node:path");

const result = spawnSync(
  "pnpm",
  [
    "--silent",
    "dlx",
    "react-doctor@0.9.13",
    ".",
    "--project",
    "chat-dns",
    "--json",
  ],
  {
    cwd: path.join(__dirname, ".."),
    encoding: "utf8",
    timeout: 300_000,
    maxBuffer: 10 * 1024 * 1024,
  },
);

if (result.stderr) process.stderr.write(result.stderr);
if (result.error || result.signal || result.status !== 0) {
  if (result.stdout) process.stdout.write(result.stdout);
  console.error(
    `[react-doctor] Failed: ${result.error?.message ?? result.signal ?? `exit ${result.status}`}`,
  );
  process.exit(result.status || 1);
}

try {
  const report = JSON.parse(result.stdout);
  if (
    report.schemaVersion !== 3 ||
    report.version !== "0.9.13" ||
    typeof report.ok !== "boolean" ||
    !Array.isArray(report.projects) ||
    report.projects.length === 0 ||
    !Array.isArray(report.diagnostics) ||
    !Number.isInteger(report.summary?.errorCount)
  ) {
    throw new Error("Invalid React Doctor report structure");
  }

  for (const diagnostic of report.diagnostics) {
    console.log(
      `${diagnostic.severity}: ${diagnostic.filePath}:${diagnostic.line} ${diagnostic.rule}: ${diagnostic.message}`,
    );
  }
  for (const project of report.projects) {
    if (
      project.complete !== true ||
      !Array.isArray(project.skippedChecks) ||
      project.skippedChecks.length !== 0
    ) {
      throw new Error(
        `Incomplete analysis: ${JSON.stringify(project.skippedCheckReasons ?? project.skippedChecks ?? project)}`,
      );
    }
  }
  if (!report.ok || report.summary.errorCount !== 0) {
    throw new Error(report.error?.message ?? "React Doctor reported errors");
  }
  console.log(
    `[react-doctor] Complete; ${report.summary.errorCount} errors, ${report.summary.warningCount} warnings; score ${report.summary.score ?? "unavailable"}.`,
  );
} catch (error) {
  console.error(`[react-doctor] ${error.message}`);
  process.exit(1);
}
