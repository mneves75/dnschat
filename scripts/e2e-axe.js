#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(__dirname, "e2e-axe-feature-manifest.json");
const MANIFEST = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const DEFAULT_BUNDLE_ID = "org.mvneves.dnschat";
const DEFAULT_ARTIFACTS = path.join(ROOT, "artifacts", "axe-e2e");
const DEFAULT_DERIVED_DATA = path.join(ROOT, "artifacts", "axe-e2e", "DerivedData");
const DEFAULT_RELEASE_APP = path.join(
  DEFAULT_DERIVED_DATA,
  "Build",
  "Products",
  "Release-iphonesimulator",
  "DNSChat.app",
);

function parseArgs(argv) {
  const options = {
    bundleId: DEFAULT_BUNDLE_ID,
    buildRelease: false,
    resetApp: false,
    doctor: false,
    listFeatures: false,
    describeOnly: false,
    createSimulator: false,
    bootSimulator: false,
    deleteCreatedSimulator: false,
    udid: process.env.AXE_UDID || "",
    appPath: process.env.AXE_APP_PATH || "",
    axeBin: process.env.AXE_BIN || "",
    artifactsDir: process.env.AXE_ARTIFACTS_DIR || DEFAULT_ARTIFACTS,
    scheme: "dnschat",
    simulatorName: "DNSChat AXe E2E",
    deviceType: "com.apple.CoreSimulator.SimDeviceType.iPhone-17",
    runtime: process.env.AXE_RUNTIME || "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--build-release":
        options.buildRelease = true;
        break;
      case "--reset-app":
        options.resetApp = true;
        break;
      case "--doctor":
        options.doctor = true;
        break;
      case "--list-features":
        options.listFeatures = true;
        break;
      case "--describe-only":
        options.describeOnly = true;
        break;
      case "--create-simulator":
        options.createSimulator = true;
        break;
      case "--boot-simulator":
        options.bootSimulator = true;
        break;
      case "--delete-created-simulator":
        options.deleteCreatedSimulator = true;
        break;
      case "--udid":
        options.udid = argv[++index] || "";
        break;
      case "--bundle-id":
        options.bundleId = argv[++index] || DEFAULT_BUNDLE_ID;
        break;
      case "--app-path":
        options.appPath = argv[++index] || "";
        break;
      case "--axe-bin":
        options.axeBin = argv[++index] || "";
        break;
      case "--artifacts-dir":
        options.artifactsDir = argv[++index] || DEFAULT_ARTIFACTS;
        break;
      case "--scheme":
        options.scheme = argv[++index] || "dnschat";
        break;
      case "--simulator-name":
        options.simulatorName = argv[++index] || "DNSChat AXe E2E";
        break;
      case "--device-type":
        options.deviceType = argv[++index] || options.deviceType;
        break;
      case "--runtime":
        options.runtime = argv[++index] || "";
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || ROOT,
    env: { ...process.env, ...(options.env || {}) },
    encoding: "utf8",
    timeout: options.timeout || 30000,
    maxBuffer: options.maxBuffer || 64 * 1024 * 1024,
    input: options.input,
  });

  if (result.error) {
    throw new Error(`${command} ${args.join(" ")} failed: ${result.error.message}`);
  }

  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(
      [
        `${command} ${args.join(" ")} failed with status ${result.status}`,
        result.stdout,
        result.stderr,
      ].filter(Boolean).join("\n"),
    );
  }

  return {
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    status: result.status || 0,
  };
}

function resolveAxeBinary(explicit) {
  const candidates = [
    explicit,
    "/opt/homebrew/Cellar/axe/1.7.0/libexec/axe",
    "/usr/local/Cellar/axe/1.7.0/libexec/axe",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  const fromPath = execFileSync("bash", ["-lc", "command -v axe || true"], {
    encoding: "utf8",
  }).trim();
  if (!fromPath) {
    throw new Error(
      "AXe is not installed. Install it with: brew install cameroncooke/axe/axe",
    );
  }

  const real = fs.realpathSync(fromPath);
  const cellarRoot = path.dirname(path.dirname(real));
  const libexec = path.join(cellarRoot, "libexec", "axe");
  return fs.existsSync(libexec) ? libexec : fromPath;
}

function axe(options, args, runOptions = {}) {
  return run(options.axeBin, args, {
    timeout: runOptions.timeout || 30000,
    input: runOptions.input,
  }).stdout;
}

function findBootedSimulator(options) {
  const output = axe(options, ["list-simulators"], { timeout: 15000 });
  const line = output
    .split("\n")
    .find((candidate) =>
      candidate.includes("| Booted |") &&
      (candidate.includes("| iPhone") || candidate.includes("| iPad")),
    );

  if (!line) {
    throw new Error(
      "No booted iOS simulator found. Boot one with Xcode or pass --udid.",
    );
  }

  return line.split("|")[0].trim();
}

function getAxeSimulatorLine(options, udid) {
  const output = axe(options, ["list-simulators"], { timeout: 15000 });
  return output
    .split("\n")
    .find((line) => line.startsWith(`${udid} |`)) || "";
}

function getSimulatorState(options, udid) {
  const line = getAxeSimulatorLine(options, udid);
  const parts = line.split("|").map((part) => part.trim());
  return {
    line,
    state: parts[2] || "Unknown",
  };
}

function latestAvailableIosRuntime() {
  const result = run("xcrun", ["simctl", "list", "runtimes", "--json"], {
    timeout: 15000,
  });
  const parsed = JSON.parse(result.stdout);
  const runtimes = parsed.runtimes
    .filter((runtime) => runtime.platform === "iOS" && runtime.isAvailable)
    .sort((a, b) => {
      return String(b.version).localeCompare(String(a.version), undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

  if (runtimes.length === 0) {
    throw new Error("No available iOS simulator runtime found.");
  }

  return runtimes[0].identifier;
}

function createSimulator(options) {
  const runtime = options.runtime || latestAvailableIosRuntime();
  const result = run(
    "xcrun",
    ["simctl", "create", options.simulatorName, options.deviceType, runtime],
    { timeout: 30000 },
  );
  const udid = result.stdout.trim();
  if (!udid) throw new Error("simctl create did not return a simulator UDID.");
  console.log(`Created simulator ${options.simulatorName}: ${udid}`);
  return udid;
}

function bootSimulator(options) {
  const boot = run("xcrun", ["simctl", "boot", options.udid], {
    timeout: 60000,
    allowFailure: true,
  });

  if (
    boot.status !== 0 &&
    !boot.stderr.includes("Unable to boot device in current state: Booted")
  ) {
    throw new Error(
      [
        `Could not boot simulator ${options.udid}.`,
        boot.stdout,
        boot.stderr,
      ].filter(Boolean).join("\n"),
    );
  }

  const bootstatus = run("xcrun", ["simctl", "bootstatus", options.udid, "-b"], {
    timeout: 120000,
    allowFailure: true,
  });
  if (bootstatus.status !== 0) {
    const { line } = getSimulatorState(options, options.udid);
    throw new Error(
      [
        `Simulator ${options.udid} did not finish booting.`,
        line ? `AXe simulator row: ${line}` : "",
        bootstatus.stdout,
        bootstatus.stderr,
      ].filter(Boolean).join("\n"),
    );
  }
}

function openSimulatorWindow(options) {
  run("open", ["-a", "Simulator", "--args", "-CurrentDeviceUDID", options.udid], {
    timeout: 10000,
    allowFailure: true,
  });
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000);
}

function assertSimulatorBooted(options) {
  const { line, state } = getSimulatorState(options, options.udid);
  if (state !== "Booted") {
    throw new Error(
      [
        `Simulator ${options.udid} is ${state}, not Booted.`,
        line ? `AXe simulator row: ${line}` : "AXe did not list this simulator UDID.",
        "Boot a healthy iOS simulator before running AXe E2E.",
      ].join("\n"),
    );
  }
}

function deleteSimulator(udid) {
  run("xcrun", ["simctl", "shutdown", udid], {
    timeout: 30000,
    allowFailure: true,
  });
  run("xcrun", ["simctl", "delete", udid], {
    timeout: 30000,
    allowFailure: true,
  });
}

function parseTree(raw) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`AXe describe-ui did not return JSON:\n${raw}`);
  }
}

function flattenTree(tree) {
  const elements = [];
  const visit = (node) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!node || typeof node !== "object") return;
    elements.push({
      id: node.AXUniqueId || "",
      label: node.AXLabel || "",
      value: node.AXValue || "",
      type: node.type || "",
      frame: node.frame || null,
    });
    if (node.children) visit(node.children);
  };
  visit(tree);
  return elements;
}

function describe(options) {
  const raw = axe(options, ["describe-ui", "--udid", options.udid], {
    timeout: 25000,
  });
  return parseTree(raw);
}

function describeElements(options) {
  return flattenTree(describe(options));
}

function slugifyArtifactName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "failure";
}

function writeFailureArtifacts(options, name, elements, lastDescribeError) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const slug = slugifyArtifactName(name);
  const base = path.join(options.artifactsDir, `${timestamp}-${slug}`);
  const screenshotPath = `${base}.png`;
  const dumpPath = `${base}.txt`;

  fs.mkdirSync(options.artifactsDir, { recursive: true });
  const screenshot = run("xcrun", ["simctl", "io", options.udid, "screenshot", screenshotPath], {
    timeout: 30000,
    allowFailure: true,
  });

  let diagnostics = { interestingDevices: [], activeProcesses: [] };
  try {
    diagnostics = collectSimulatorHostDiagnostics(options);
  } catch (error) {
    diagnostics.activeProcesses = [
      `Could not collect simulator diagnostics: ${error instanceof Error ? error.message : String(error)}`,
    ];
  }

  const visible = elements
    .filter((element) => element.id || element.label || element.value)
    .map((element) =>
      `${element.type} id=${element.id} label=${JSON.stringify(element.label)} value=${JSON.stringify(element.value)}`,
    );

  fs.writeFileSync(
    dumpPath,
    [
      `Failure: ${name}`,
      `UDID: ${options.udid}`,
      lastDescribeError ? `Last describe-ui error: ${lastDescribeError}` : "Last describe-ui error: none",
      screenshot.status === 0
        ? `Screenshot: ${screenshotPath}`
        : `Screenshot failed: ${screenshot.stderr || screenshot.stdout}`,
      "",
      "Visible elements:",
      visible.length > 0 ? visible.join("\n") : "(none)",
      "",
      "Simulator devices:",
      diagnostics.interestingDevices.join("\n") || "(none)",
      "",
      "Simulator-related processes:",
      diagnostics.activeProcesses.slice(0, 60).join("\n") || "(none)",
    ].join("\n"),
    "utf8",
  );

  return { screenshotPath, dumpPath };
}

function hasId(elements, id) {
  return elements.some((element) => element.id === id);
}

function hasLabel(elements, text) {
  return elements.some((element) => element.label.includes(text));
}

function tapDeepLinkPromptIfPresent(options, elements) {
  const hasDeepLinkPrompt = elements.some((element) =>
    element.label.includes("Abrir com") ||
    element.label.includes("Open with") ||
    element.label.includes("Open in"),
  );

  if (!hasDeepLinkPrompt) return false;

  if (hasLabel(elements, "Abrir")) {
    tapButtonLabel(options, "Abrir");
    return true;
  }
  if (hasLabel(elements, "Open")) {
    tapButtonLabel(options, "Open");
    return true;
  }

  return false;
}

function waitFor(options, name, predicate, timeoutMs = 20000) {
  const started = Date.now();
  let elements = [];
  let lastDescribeError = "";
  while (Date.now() - started < timeoutMs) {
    try {
      elements = describeElements(options);
      lastDescribeError = "";
    } catch (error) {
      lastDescribeError = error instanceof Error ? error.message : String(error);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
      continue;
    }
    if (tapDeepLinkPromptIfPresent(options, elements)) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
      continue;
    }
    if (predicate(elements)) return elements;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
  }
  const visible = elements
    .filter((element) => element.id || element.label)
    .slice(0, 40)
    .map((element) => `${element.type} id=${element.id} label=${element.label}`)
    .join("\n");
  const artifacts = writeFailureArtifacts(options, name, elements, lastDescribeError);
  throw new Error(
    [
      `Timed out waiting for ${name}.`,
      lastDescribeError ? `Last describe-ui error: ${lastDescribeError}` : "",
      `Failure artifacts: ${artifacts.dumpPath}`,
      `Screenshot: ${artifacts.screenshotPath}`,
      "Visible elements:",
      visible,
    ].filter(Boolean).join("\n"),
  );
}

function waitForId(options, id, timeoutMs) {
  return waitFor(options, `id ${id}`, (elements) => hasId(elements, id), timeoutMs);
}

function waitForAnyId(options, ids, timeoutMs) {
  return waitFor(
    options,
    `one of ids ${ids.join(", ")}`,
    (elements) => ids.some((id) => hasId(elements, id)),
    timeoutMs,
  );
}

function waitForChatList(options, timeoutMs = 30000) {
  return waitFor(
    options,
    "chat list",
    (elements) =>
      hasId(elements, "chat-list") ||
      hasId(elements, "chat-list-new-chat") ||
      hasLabel(elements, "Start New Conversation") ||
      hasLabel(elements, "New Chat"),
    timeoutMs,
  );
}

function waitForOnboardingStep(options, id, labels, timeoutMs = 30000) {
  return waitFor(
    options,
    `onboarding step ${id}`,
    (elements) => hasId(elements, id) || labels.some((label) => hasLabel(elements, label)),
    timeoutMs,
  );
}

function tapId(options, id, timeout = 10) {
  axe(options, [
    "tap",
    "--id",
    id,
    "--wait-timeout",
    String(timeout),
    "--udid",
    options.udid,
  ]);
}

function tapLabel(options, label, timeout = 10) {
  axe(options, [
    "tap",
    "--label",
    label,
    "--wait-timeout",
    String(timeout),
    "--udid",
    options.udid,
  ]);
}

function tapButtonLabel(options, label, timeout = 10) {
  axe(options, [
    "tap",
    "--label",
    label,
    "--element-type",
    "Button",
    "--wait-timeout",
    String(timeout),
    "--udid",
    options.udid,
  ]);
}

function typeText(options, text) {
  axe(options, ["type", text, "--udid", options.udid], { timeout: 20000 });
}

function acceptDeepLinkPromptIfNeeded(options, timeoutMs = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    let elements = [];
    try {
      elements = describeElements(options);
    } catch {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
      continue;
    }
    if (tapDeepLinkPromptIfPresent(options, elements)) return true;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
  }

  return false;
}

function openRoute(options, route) {
  const normalized = route.replace(/^\/+/, "");
  const url = normalized ? `${options.scheme}://${normalized}` : `${options.scheme}://`;
  run("xcrun", ["simctl", "openurl", options.udid, url], { timeout: 15000 });
  acceptDeepLinkPromptIfNeeded(options);
}

function launchApp(options, extraArgs = []) {
  const result = run(
    "xcrun",
    ["simctl", "launch", options.udid, options.bundleId, ...extraArgs],
    { timeout: 30000, allowFailure: true },
  );
  if (result.status !== 0 && !result.stderr.includes("already running")) {
    throw new Error(result.stderr || result.stdout);
  }
  openSimulatorWindow(options);
}

function terminateApp(options) {
  run("xcrun", ["simctl", "terminate", options.udid, options.bundleId], {
    timeout: 10000,
    allowFailure: true,
  });
}

function buildReleaseApp(options) {
  fs.mkdirSync(DEFAULT_DERIVED_DATA, { recursive: true });
  const destination = options.udid ? `id=${options.udid}` : "generic/platform=iOS Simulator";
  run(
    "xcodebuild",
    [
      "-quiet",
      "-workspace",
      "ios/DNSChat.xcworkspace",
      "-scheme",
      "DNSChat",
      "-configuration",
      "Release",
      "-destination",
      destination,
      "-derivedDataPath",
      DEFAULT_DERIVED_DATA,
      "build",
    ],
    { timeout: 20 * 60 * 1000 },
  );

  if (!fs.existsSync(DEFAULT_RELEASE_APP)) {
    throw new Error(`Release app not found at ${DEFAULT_RELEASE_APP}`);
  }
  return DEFAULT_RELEASE_APP;
}

function installFreshApp(options, appPath) {
  if (!fs.existsSync(appPath)) {
    throw new Error(`App path does not exist: ${appPath}`);
  }
  terminateApp(options);
  run("xcrun", ["simctl", "uninstall", options.udid, options.bundleId], {
    timeout: 60000,
    allowFailure: true,
  });
  run("xcrun", ["simctl", "install", options.udid, appPath], {
    timeout: 120000,
  });
}

function collectSimulatorHostDiagnostics(options) {
  const axeSimulators = axe(options, ["list-simulators"], { timeout: 15000 });
  const interestingDevices = axeSimulators
    .split("\n")
    .filter((line) =>
      (line.includes("iPhone") || line.includes("iPad")) &&
      (line.includes("| Booted |") || line.includes("| Booting |") || line.includes("| Shutdown |")),
    );
  const activeProcesses = run("ps", ["-axo", "pid,ppid,stat,command"], {
    timeout: 10000,
    allowFailure: true,
  }).stdout
    .split("\n")
    .filter((line) =>
      /CoreSimulator|launchd_sim|Simulator|xcodebuild|simctl/.test(line) &&
      !/scripts\/e2e-axe\.js/.test(line),
    );

  return {
    interestingDevices,
    activeProcesses,
  };
}

function assertNotDevLauncher(elements) {
  const isDevLauncher =
    hasLabel(elements, "Development Build") ||
    hasLabel(elements, "No development servers found") ||
    hasLabel(elements, "Development Servers");

  if (isDevLauncher) {
    throw new Error(
      "The simulator is showing Expo development launcher, not DNSChat. Run e2e:axe:release or start Expo dev-client and open the app runtime before E2E.",
    );
  }
}

function assertManifestSelectors() {
  for (const feature of MANIFEST.features) {
    if (!feature.id || !feature.name || !feature.expected) {
      throw new Error(`Invalid feature manifest entry: ${JSON.stringify(feature)}`);
    }
    if (!Array.isArray(feature.primarySelectors) || feature.primarySelectors.length === 0) {
      throw new Error(`Feature ${feature.id} has no primary selectors`);
    }
  }
}

function runOnboarding(options) {
  const landing = waitFor(
    options,
    "onboarding welcome or chat list",
    (elements) =>
      hasId(elements, "onboarding-welcome") ||
      hasLabel(elements, "Welcome to DNS Chat") ||
      hasLabel(elements, "Bem-vindo ao DNS Chat") ||
      hasId(elements, "chat-list") ||
      hasId(elements, "chat-list-new-chat"),
    30000,
  );
  assertNotDevLauncher(landing);

  if (hasId(landing, "chat-list") || hasId(landing, "chat-list-new-chat")) {
    console.log("F-APP-001 onboarding already completed; chat list is visible.");
    return;
  }

  console.log("F-APP-001 onboarding: welcome");
  tapId(options, "onboarding-continue");
  waitForOnboardingStep(options, "onboarding-dns-magic", [
    "DNS Magic in Action",
    "See DNS in Action",
    "Magia DNS em Ação",
  ]);
  console.log("F-APP-001 onboarding: DNS magic");

  tapId(options, "onboarding-continue");
  waitForOnboardingStep(options, "onboarding-network-setup", [
    "Network Optimization",
    "Otimização de Rede",
  ]);
  console.log("F-APP-001 onboarding: network setup");

  tapId(options, "onboarding-continue");
  waitForOnboardingStep(options, "onboarding-first-chat", [
    "Try Your First Chat",
    "Experimente Seu Primeiro Chat",
  ]);
  console.log("F-APP-001 onboarding: first chat");

  tapId(options, "onboarding-continue");
  waitForOnboardingStep(options, "onboarding-features", [
    "Powerful Features",
    "Recursos Poderosos",
    "You're All Set",
    "Tudo Pronto",
  ]);
  console.log("F-APP-001 onboarding: feature summary");

  tapId(options, "onboarding-complete");
  waitForChatList(options);
}

function runSettingsSmoke(options) {
  openRoute(options, "settings");
  waitFor(
    options,
    "settings screen",
    (elements) =>
      hasId(elements, "settings-screen") ||
      hasId(elements, "settings-dns-server") ||
      hasLabel(elements, "Configurações") ||
      hasLabel(elements, "Settings"),
    30000,
  );
  console.log("F-SET-001 settings screen");

  for (const id of [
    "settings-dns-server",
    "settings-mock-dns-switch",
    "settings-haptics-switch",
    "language-option-system",
    "language-option-en-US",
    "language-option-pt-BR",
    "settings-reset-onboarding",
  ]) {
    waitForId(options, id, 10000);
  }

  tapId(options, "settings-dns-server");
  waitForId(options, "settings-dns-option-llm-pieter-com", 10000);
  tapId(options, "settings-dns-option-llm-pieter-com");

  const currentSettings = waitForId(options, "settings-mock-dns-switch", 10000);
  const mockSwitch = currentSettings.find((element) => element.id === "settings-mock-dns-switch");
  if (!String(mockSwitch && mockSwitch.value).includes("1")) {
    tapId(options, "settings-mock-dns-switch");
    waitFor(
      options,
      "mock DNS switch enabled",
      (elements) => {
        const element = elements.find((item) => item.id === "settings-mock-dns-switch");
        return String(element && element.value).includes("1");
      },
      10000,
    );
  }
}

function runChatFlow(options) {
  openRoute(options, "");
  waitForChatList(options);
  console.log("F-APP-002 chat list");

  tapId(options, "chat-list-new-chat");
  waitFor(
    options,
    "chat screen",
    (elements) =>
      hasId(elements, "chat-screen") ||
      hasId(elements, "chat-input-field") ||
      hasLabel(elements, "Comece uma conversa!") ||
      hasLabel(elements, "Start a conversation!"),
    30000,
  );
  waitForId(options, "chat-input-field", 10000);
  console.log("F-CHAT-001 chat thread");

  tapId(options, "chat-input-field");
  typeText(options, "ping");
  tapId(options, "chat-input-send");

  waitFor(options, "sent user and assistant messages", (elements) => {
    const labels = elements.map((element) => element.label.toLowerCase());
    return labels.some((label) =>
      label.includes("your message: ping") ||
      label.includes("sua mensagem: ping"),
    ) &&
      labels.some((label) =>
        label.includes("assistant message:") ||
        label.includes("mensagem do assistente:"),
      );
  }, 45000);
}

function runLogsSmoke(options) {
  openRoute(options, "logs");
  const elements = waitFor(
    options,
    "logs screen",
    (items) =>
      hasId(items, "logs-screen") ||
      hasId(items, "logs-clear-all") ||
      items.some((item) => item.id.startsWith("logs-entry-")) ||
      hasLabel(items, "Logs de consultas DNS") ||
      hasLabel(items, "DNS Query Logs"),
    30000,
  );
  assertNotDevLauncher(elements);
  console.log("F-LOG-001 logs screen");
}

function runAboutSmoke(options) {
  openRoute(options, "about");
  waitFor(
    options,
    "about screen",
    (elements) =>
      hasId(elements, "about-screen") ||
      hasId(elements, "about-settings-link") ||
      hasLabel(elements, "Sobre") ||
      hasLabel(elements, "About"),
    30000,
  );
  waitForId(options, "about-settings-link", 10000);
  console.log("F-UI-001 about screen");
}

function runProfileSmoke(options) {
  openRoute(options, "profile/e2e");
  waitFor(
    options,
    "profile screen",
    (elements) =>
      hasId(elements, "profile-screen") ||
      hasId(elements, "profile-settings-link") ||
      hasLabel(elements, "Perfil") ||
      hasLabel(elements, "Profile"),
    30000,
  );
  for (const id of ["profile-settings-link", "profile-export-data", "profile-clear-all-data"]) {
    waitForId(options, id, 10000);
  }
  console.log("F-USER-001 profile screen");
}

function runNotFoundSmoke(options) {
  openRoute(options, "missing/route");
  waitFor(
    options,
    "not-found screen",
    (elements) =>
      hasId(elements, "not-found-screen") ||
      hasId(elements, "not-found-chat-link") ||
      hasLabel(elements, "Página não encontrada") ||
      hasLabel(elements, "Page not found"),
    30000,
  );
  for (const id of ["not-found-chat-link", "not-found-logs-link", "not-found-about-link"]) {
    waitForId(options, id, 10000);
  }
  console.log("F-ERR-001 not-found screen");
}

function printFeatureList() {
  for (const feature of MANIFEST.features) {
    console.log(`${feature.id}: ${feature.name}`);
  }
}

function doctor(options) {
  assertManifestSelectors();
  console.log(`AXe binary: ${options.axeBin}`);
  console.log(`AXe version: ${axe(options, ["--version"]).trim()}`);
  const { interestingDevices, activeProcesses } = collectSimulatorHostDiagnostics(options);
  const booted = interestingDevices
    .filter((line) => line.includes("| Booted |"));
  const booting = interestingDevices
    .filter((line) => line.includes("| Booting |"));
  console.log(`Booted iOS simulators: ${booted.length}`);
  for (const line of booted) console.log(line);
  if (booting.length > 0) {
    console.log(`Booting iOS simulators: ${booting.length}`);
    for (const line of booting) console.log(line);
  }
  if (activeProcesses.length > 0) {
    console.log("Active simulator-related processes:");
    for (const line of activeProcesses.slice(0, 20)) console.log(line);
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  options.axeBin = resolveAxeBinary(options.axeBin);

  if (options.listFeatures) {
    printFeatureList();
    return;
  }

  if (options.doctor) {
    doctor(options);
    return;
  }

  assertManifestSelectors();
  let createdSimulator = "";
  try {
    if (!options.udid) {
      if (options.createSimulator) {
        options.udid = createSimulator(options);
        createdSimulator = options.udid;
      } else {
        options.udid = findBootedSimulator(options);
      }
    }

    if (options.createSimulator || options.bootSimulator) {
      bootSimulator(options);
    }
    openSimulatorWindow(options);
    assertSimulatorBooted(options);

    let appPath = options.appPath;
    if (options.buildRelease) {
      appPath = buildReleaseApp(options);
    }
    if (options.resetApp) {
      if (!appPath) {
        throw new Error("--reset-app requires --app-path or --build-release");
      }
      installFreshApp(options, appPath);
    }

    launchApp(options);
    acceptDeepLinkPromptIfNeeded(options);
    if (options.describeOnly) {
      const elements = describeElements(options);
      for (const element of elements) {
        if (element.id || element.label || element.value) {
          console.log(
            `${element.type} id=${element.id} label=${JSON.stringify(element.label)} value=${JSON.stringify(element.value)}`,
          );
        }
      }
      return;
    }

    runOnboarding(options);
    runSettingsSmoke(options);
    runChatFlow(options);
    runLogsSmoke(options);
    runAboutSmoke(options);
    runProfileSmoke(options);
    runNotFoundSmoke(options);

    console.log(`AXe E2E passed for ${MANIFEST.features.length} feature groups.`);
  } finally {
    if (createdSimulator && options.deleteCreatedSimulator) {
      deleteSimulator(createdSimulator);
    }
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
