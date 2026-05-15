#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const { existsSync, readFileSync } = require("node:fs");

function listTrackedFiles() {
  return execFileSync("git", ["ls-files"], { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((path) => existsSync(path));
}

function isPublicMarkdown(path) {
  return path.endsWith(".md");
}

function isUserFacingSource(path) {
  return (
    path.startsWith("src/i18n/messages/") ||
    path === "src/navigation/screens/About.tsx" ||
    path === "app/_layout.tsx" ||
    path.startsWith("app/")
  );
}

function isScannable(path) {
  return isPublicMarkdown(path) || isUserFacingSource(path) || path.startsWith(".github/");
}

const rules = [
  {
    id: "local-macos-user-path",
    description: "Local macOS user paths do not belong in public docs or UI.",
    pattern: /\/Users\/(?!<username>|me\/)[A-Za-z0-9._-]+/g,
  },
  {
    id: "app-store-connect-uuid",
    description: "Internal App Store Connect UUIDs belong in private release notes.",
    pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
    markdownOnly: true,
  },
  {
    id: "apple-team-profile-id",
    description: "Concrete Apple team/profile/certificate IDs must be placeholders in public docs.",
    pattern: /\b(?=[A-Z0-9]*\d)(?=[A-Z0-9]*[A-Z])[A-Z0-9]{10}\b/g,
    markdownOnly: true,
  },
  {
    id: "apple-device-identifier",
    description: "Concrete Apple device identifiers must be placeholders in public docs.",
    pattern: /\b[0-9A-F]{8}-[0-9A-F]{16}\b/g,
    markdownOnly: true,
  },
  {
    id: "concrete-testflight-group",
    description: "Private TestFlight group names must be placeholders in public docs.",
    pattern: /(--group\s+(?!<GROUPS>)[^\s]+|Groups?:\s+`[^<][^`]+`)/gi,
    markdownOnly: true,
  },
  {
    id: "personal-device-name-pattern",
    description: "Personal device names must not be published.",
    pattern: /\b[A-Za-z][A-Za-z0-9_-]{2,}'s\s+(iPhone|iPad)\b/g,
  },
  {
    id: "personal-funding-link",
    description: "Personal funding links must not appear in public docs or UI.",
    pattern: /paypal\.me\/[A-Za-z0-9_]+/gi,
  },
];

const findings = [];

for (const path of listTrackedFiles().filter(isScannable)) {
  const body = readFileSync(path, "utf8");

  for (const rule of rules) {
    if (rule.markdownOnly && !isPublicMarkdown(path)) continue;

    const matches = [...body.matchAll(rule.pattern)];
    for (const match of matches) {
      const line = body.slice(0, match.index).split("\n").length;
      findings.push({
        path,
        line,
        rule: rule.id,
        description: rule.description,
        match: match[0],
      });
    }
  }
}

if (findings.length > 0) {
  console.error("Public redaction check failed:");
  for (const finding of findings) {
    console.error(
      `${finding.path}:${finding.line} ${finding.rule}: ${finding.description} (${finding.match})`,
    );
  }
  process.exit(1);
}

console.log("Public redaction check passed.");
