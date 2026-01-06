#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const appRoot = path.join(projectRoot, "app");
const outputDir = path.join(projectRoot, ".expo", "types");
const outputFile = path.join(outputDir, "router.d.ts");

const log = (message) => console.log(message);
const warn = (message) => console.warn(`[WARN] ${message}`);
const fail = (message) => {
  console.error(`[ERROR] ${message}`);
  process.exitCode = 1;
};

const readJsonFile = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
};

const isTypedRoutesEnabled = () => {
  const appJson = readJsonFile(path.join(projectRoot, "app.json"));
  const typedRoutes = appJson?.expo?.experiments?.typedRoutes;
  return Boolean(typedRoutes);
};

const generateTypedRoutes = () => {
  if (!fs.existsSync(appRoot)) {
    throw new Error("app/ directory not found; Expo Router app root missing");
  }

  const { EXPO_ROUTER_CTX_IGNORE } = require("expo-router/_ctx-shared");
  const requireContext = require("expo-router/build/testing-library/require-context-ponyfill")
    .default;
  const {
    getTypedRoutesDeclarationFile,
  } = require("expo-router/build/typed-routes/generate");

  const ctx = requireContext(appRoot, true, EXPO_ROUTER_CTX_IGNORE);
  const file = getTypedRoutesDeclarationFile(ctx, {});

  if (!file || !file.trim()) {
    throw new Error("Typed routes generator returned empty output");
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, file, "utf8");
};

const verify = () => {
  if (!isTypedRoutesEnabled()) {
    fail("Expo Router typed routes are not enabled in app.json");
    return;
  }

  try {
    generateTypedRoutes();
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
    return;
  }

  if (!fs.existsSync(outputFile)) {
    fail("Typed routes file not generated");
    return;
  }

  log(`OK: generated ${path.relative(projectRoot, outputFile)}`);
};

verify();
