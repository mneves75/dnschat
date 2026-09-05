#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");

const hookScript = `#!/bin/sh
set -e

echo "pre-commit: verifying iOS pods lockfile"
pnpm run verify:ios-pods

echo "pre-commit: checking formatting"
pnpm run fmt:check

echo "pre-commit: running lint"
pnpm run lint

echo "pre-commit: running unit tests"
pnpm run test --bail
`;

if (!fs.existsSync(path.join(repoRoot, ".git"))) {
  console.warn(
    "[install-git-hooks] No .git directory found; skipping hook install.",
  );
  process.exit(0);
}

// Git resolves linked worktrees and core.hooksPath, including relative paths.
const hooksDir = path.resolve(
  repoRoot,
  execFileSync("git", ["rev-parse", "--git-path", "hooks"], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim(),
);
const commonGitDir = fs.realpathSync(
  path.resolve(
    repoRoot,
    execFileSync("git", ["rev-parse", "--git-common-dir"], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim(),
  ),
);
if (
  !fs.existsSync(hooksDir) &&
  fs.existsSync(path.dirname(hooksDir)) &&
  path.join(
    fs.realpathSync(path.dirname(hooksDir)),
    path.basename(hooksDir),
  ) === path.join(commonGitDir, "hooks")
) {
  fs.mkdirSync(hooksDir);
}
const resolvedHooksDir = fs.existsSync(hooksDir)
  ? fs.realpathSync(hooksDir)
  : null;
const localPrefix = fs.realpathSync(repoRoot) + path.sep;
if (
  !resolvedHooksDir ||
  (!resolvedHooksDir.startsWith(localPrefix) &&
    resolvedHooksDir !== path.join(commonGitDir, "hooks"))
) {
  console.error(
    "[install-git-hooks] Refusing a missing hooks directory or one outside this repository. Create a repository-local core.hooksPath directory or use Git's default hooks path.",
  );
  process.exit(1);
}
const hookPath = path.join(hooksDir, "pre-commit");
const existingHook = fs.lstatSync(hookPath, { throwIfNoEntry: false });
if (
  existingHook &&
  (!existingHook.isFile() || fs.readFileSync(hookPath, "utf8") !== hookScript)
) {
  console.error(
    "[install-git-hooks] Preserving existing pre-commit hook. Review core.hooksPath and integrate the DNSChat checks manually before retrying.",
  );
  process.exit(1);
}
fs.writeFileSync(hookPath, hookScript, { mode: 0o755 });
fs.chmodSync(hookPath, 0o755);
console.log(
  "[install-git-hooks] Installed pre-commit hook (verify:ios-pods, fmt:check, lint, test)",
);
