#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const appRoot = path.join(projectRoot, "app");
const outputDir = path.join(projectRoot, ".expo", "types");
const outputFile = path.join(outputDir, "router.d.ts");

// The generated declaration must augment expo-router for `Href` to narrow.
// Asserting on this string is what keeps the gate honest: an empty or
// placeholder file would satisfy "file exists" but not this.
const REQUIRED_DECLARATION = "declare module 'expo-router'";

const log = (message) => console.log(message);
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
  return Boolean(appJson?.expo?.experiments?.typedRoutes);
};

/**
 * Regenerate .expo/types/router.d.ts using the same generator the Expo dev
 * server runs. `setupTypedRoutes` supports this Metro-less path (it is what
 * `expo customize tsconfig.json` uses), so the gate checks the real artifact
 * rather than an approximation of it.
 */
const generateTypedRoutes = async () => {
  if (!fs.existsSync(appRoot)) {
    throw new Error("app/ directory not found; Expo Router app root missing");
  }

  const {
    setupTypedRoutes,
  } = require("@expo/cli/build/src/start/server/type-generation/routes.js");

  await setupTypedRoutes({
    typesDirectory: outputDir,
    projectRoot,
    routerDirectory: appRoot,
    plugin: undefined,
  });
};

const verify = async () => {
  if (!isTypedRoutesEnabled()) {
    fail("Expo Router typed routes are not enabled in app.json");
    return;
  }

  try {
    await generateTypedRoutes();
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
    return;
  }

  if (!fs.existsSync(outputFile)) {
    fail("Typed routes file not generated");
    return;
  }

  const generated = fs.readFileSync(outputFile, "utf8");
  if (!generated.includes(REQUIRED_DECLARATION)) {
    fail(
      `Generated ${path.relative(projectRoot, outputFile)} does not augment expo-router ` +
        `(missing "${REQUIRED_DECLARATION}"); Href types would not narrow`,
    );
    return;
  }

  log(`OK: generated ${path.relative(projectRoot, outputFile)}`);
};

verify().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
