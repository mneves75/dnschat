#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const hooksDir = path.join(repoRoot, ".git", "hooks");
const hookPath = path.join(hooksDir, "pre-commit");

const hookScript = `#!/bin/sh
npm run lint:ast-grep
`;

if (!fs.existsSync(path.join(repoRoot, ".git"))) {
  console.warn("[install-git-hooks] No .git directory found; skipping hook install.");
  process.exit(0);
}

fs.mkdirSync(hooksDir, { recursive: true });
fs.writeFileSync(hookPath, hookScript, { mode: 0o755 });
console.log("[install-git-hooks] Installed pre-commit hook for ast-grep");
