#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const hooksDir = path.join(repoRoot, ".git", "hooks");
const hookPath = path.join(hooksDir, "pre-commit");

// Keep this script intentionally dependency-free (no husky).
// The goal is to make commit-time checks reliable anywhere the repo has a
// writable .git/ directory.
const hookScript = `#!/bin/sh
set -e

echo "pre-commit: verifying iOS pods lockfile"
npm run verify:ios-pods

echo "pre-commit: running lint"
npm run lint

echo "pre-commit: running unit tests"
npm test -- --bail --passWithNoTests
`;

if (!fs.existsSync(path.join(repoRoot, ".git"))) {
  console.warn("[install-git-hooks] No .git directory found; skipping hook install.");
  process.exit(0);
}

fs.mkdirSync(hooksDir, { recursive: true });
fs.writeFileSync(hookPath, hookScript, { mode: 0o755 });
console.log(
  "[install-git-hooks] Installed pre-commit hook (verify:ios-pods, lint, test)",
);
