#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.join(__dirname, "..");
const cliDir = path.join(projectRoot, "node_modules", "@ast-grep", "cli");
const postinstallScript = path.join(cliDir, "postinstall.js");
const binaryName = process.platform === "win32" ? "ast-grep.exe" : "ast-grep";
const binaryPath = path.join(cliDir, binaryName);

function ensureCliBinary() {
  if (!fs.existsSync(postinstallScript)) {
    console.error("[lint:ast-grep] @ast-grep/cli não encontrado. Rode `bun install`.");
    process.exit(1);
  }

  const postinstall = spawnSync(process.execPath, [postinstallScript], {
    cwd: projectRoot,
    stdio: "pipe",
    encoding: "utf8",
  });

  if (postinstall.status !== 0) {
    process.stderr.write(postinstall.stderr || "");
    process.stdout.write(postinstall.stdout || "");
    console.error("[lint:ast-grep] Falha ao preparar o binário do ast-grep.");
    process.exit(postinstall.status || 1);
  }

  if (!fs.existsSync(binaryPath)) {
    console.error("[lint:ast-grep] Binário ast-grep não disponível após postinstall.");
    process.exit(1);
  }
}

function runAstGrep() {
  const args = process.argv.slice(2);
  const result = spawnSync(binaryPath, ["scan", ...args], {
    cwd: projectRoot,
    stdio: "inherit",
  });

  if (result.error) {
    console.error(`[lint:ast-grep] erro ao executar ast-grep: ${result.error.message}`);
    process.exit(1);
  }

  process.exit(result.status || 0);
}

ensureCliBinary();
runAstGrep();
