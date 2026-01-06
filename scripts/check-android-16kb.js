#!/usr/bin/env node

const { execFileSync, execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const androidDir = path.join(projectRoot, "android");

const requiredAlign = 0x4000;

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

const resolveAndroidSdkDir = () => {
  const candidates = [
    process.env.ANDROID_SDK_ROOT,
    process.env.ANDROID_HOME,
    path.join(process.env.HOME || "", "Library", "Android", "sdk"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const stat = fs.statSync(candidate);
      if (stat.isDirectory()) {
        return candidate;
      }
    } catch {
      // ignore
    }
  }

  return null;
};

const compareVersions = (a, b) => {
  const aParts = a.split(/[.+-]/).map((part) => Number(part));
  const bParts = b.split(/[.+-]/).map((part) => Number(part));
  const length = Math.max(aParts.length, bParts.length);
  for (let i = 0; i < length; i += 1) {
    const aValue = aParts[i] ?? 0;
    const bValue = bParts[i] ?? 0;
    if (aValue === bValue) continue;
    return aValue > bValue ? -1 : 1;
  }
  return 0;
};

const getRequestedNdkVersion = () => {
  const appJson = readJsonFile(path.join(projectRoot, "app.json"));
  if (!appJson || !appJson.expo) return null;

  const plugins = Array.isArray(appJson.expo.plugins)
    ? appJson.expo.plugins
    : [];

  for (const plugin of plugins) {
    if (!Array.isArray(plugin)) continue;
    if (plugin[0] !== "expo-build-properties") continue;
    const config = plugin[1];
    if (config?.android?.ndkVersion) {
      return String(config.android.ndkVersion);
    }
  }

  return null;
};

const resolveNdkDir = (sdkDir) => {
  if (!sdkDir) return null;
  const ndkRoot = path.join(sdkDir, "ndk");
  if (!fs.existsSync(ndkRoot)) return null;

  const requestedVersion = getRequestedNdkVersion();
  if (requestedVersion) {
    const requestedPath = path.join(ndkRoot, requestedVersion);
    if (fs.existsSync(requestedPath)) {
      return requestedPath;
    }
  }

  const versions = fs
    .readdirSync(ndkRoot)
    .filter((entry) => fs.statSync(path.join(ndkRoot, entry)).isDirectory())
    .sort(compareVersions);

  if (versions.length === 0) return null;
  return path.join(ndkRoot, versions[0]);
};

const resolveReadelf = (ndkDir) => {
  if (!ndkDir) return null;
  const prebuiltDir = path.join(
    ndkDir,
    "toolchains",
    "llvm",
    "prebuilt",
  );
  if (!fs.existsSync(prebuiltDir)) return null;

  const candidates = fs
    .readdirSync(prebuiltDir)
    .map((dir) => path.join(prebuiltDir, dir, "bin", "llvm-readelf"))
    .filter((filePath) => fs.existsSync(filePath));

  return candidates[0] ?? null;
};

const ALIGNED_ABIS = ["arm64-v8a", "x86_64"];

const isAllowedAbiPath = (filePath) =>
  ALIGNED_ABIS.some((abi) => filePath.includes(`${path.sep}${abi}${path.sep}`));

const collectSoFiles = (rootDir) => {
  const results = [];
  if (!fs.existsSync(rootDir)) return results;

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectSoFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith(".so")) {
      if (isAllowedAbiPath(entryPath)) {
        results.push(entryPath);
      }
    }
  }

  return results;
};

const commandExists = (command) => {
  try {
    execSync(`command -v ${command}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

const extractArchive = (archivePath, outputDir) => {
  if (commandExists("unzip")) {
    execFileSync("unzip", ["-q", archivePath, "-d", outputDir], {
      stdio: "ignore",
    });
    return;
  }

  if (commandExists("jar")) {
    execFileSync("jar", ["xf", archivePath], {
      cwd: outputDir,
      stdio: "ignore",
    });
    return;
  }

  throw new Error("No unzip or jar command available to extract AAB");
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const aabIndex = args.indexOf("--aab");
  const aabArg = aabIndex >= 0 ? args[aabIndex + 1] : null;
  const envAab = process.env.ANDROID_AAB_PATH || "";
  const envPaths = envAab
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const paths = [];
  if (aabArg) paths.push(aabArg);
  paths.push(...envPaths);
  return { aabPaths: paths };
};

const collectAabSoFiles = (aabPath) => {
  if (!fs.existsSync(aabPath)) {
    throw new Error(`AAB not found: ${aabPath}`);
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "dnschat-aab-"));
  try {
    extractArchive(aabPath, tempDir);
  } catch (error) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    throw error;
  }

  const soFiles = collectSoFiles(tempDir);
  return { soFiles, tempDir };
};

const checkAlignment = (soFiles, readelf) => {
  const failures = [];

  for (const soFile of soFiles) {
    let output = "";
    try {
      output = execFileSync(readelf, ["-l", soFile], { encoding: "utf8" });
    } catch {
      failures.push({ file: soFile, reason: "readelf failed" });
      continue;
    }

    const loadLines = output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith("LOAD"));

    for (const line of loadLines) {
      const columns = line.split(/\s+/);
      const alignHex = columns[columns.length - 1];
      if (!alignHex || !alignHex.startsWith("0x")) continue;
      const alignValue = Number.parseInt(alignHex, 16);
      if (Number.isNaN(alignValue)) continue;
      if (alignValue < requiredAlign) {
        failures.push({
          file: soFile,
          reason: `LOAD segment alignment ${alignHex} < 0x4000`,
        });
        break;
      }
    }
  }

  return failures;
};

const run = () => {
  const { aabPaths } = parseArgs();
  const sdkDir = resolveAndroidSdkDir();
  if (!sdkDir) {
    fail("Android SDK not found. Set ANDROID_SDK_ROOT or ANDROID_HOME.");
    return;
  }

  const ndkDir = resolveNdkDir(sdkDir);
  if (!ndkDir) {
    fail("Android NDK not found under the SDK. Install an NDK r26+.");
    return;
  }

  const readelf = resolveReadelf(ndkDir);
  if (!readelf) {
    fail(`llvm-readelf not found under ${ndkDir}. Install a full NDK.`);
    return;
  }

  const searchRoots = [
    path.join(androidDir, "app", "build", "intermediates", "cxx"),
    path.join(androidDir, "app", "build", "intermediates", "merged_native_libs"),
  ];

  const soFiles = searchRoots.flatMap((root) => collectSoFiles(root));
  const aabResults = [];

  for (const aabPath of aabPaths) {
    try {
      const { soFiles: aabSoFiles, tempDir } = collectAabSoFiles(aabPath);
      aabResults.push({ aabPath, soFiles: aabSoFiles, tempDir });
    } catch (error) {
      fail(error instanceof Error ? error.message : String(error));
    }
  }

  if (soFiles.length === 0) {
    fail("No native .so files found. Build the Android app before checking 16KB alignment.");
    return;
  }

  const failures = checkAlignment(soFiles, readelf);
  for (const result of aabResults) {
    const aabFailures = checkAlignment(result.soFiles, readelf);
    failures.push(
      ...aabFailures.map((failure) => ({
        ...failure,
        file: `${result.aabPath}:${failure.file}`,
      })),
    );
  }

  for (const result of aabResults) {
    fs.rmSync(result.tempDir, { recursive: true, force: true });
  }

  if (failures.length > 0) {
    fail("16KB page size check failed for one or more native libraries.");
    for (const failure of failures.slice(0, 20)) {
      console.error(`- ${failure.file}: ${failure.reason}`);
    }
    if (failures.length > 20) {
      console.error(`- ...and ${failures.length - 20} more`);
    }
    return;
  }

  const aabCounts = aabResults
    .map((result) => `${result.soFiles.length} from ${result.aabPath}`)
    .join(", ");

  if (aabResults.length > 0) {
    log(
      `OK: ${soFiles.length} native libraries + ${aabCounts} have LOAD alignment >= 0x4000`,
    );
  } else {
    log(`OK: ${soFiles.length} native libraries have LOAD alignment >= 0x4000`);
  }
};

run();
