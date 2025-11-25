#!/usr/bin/env node
const { execSync } = require("node:child_process");
const { setTimeout: delay } = require("node:timers/promises");
const { parseAdbDevices, resolveMetroPort } = require("./utils/adbReverse");

const MAX_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 500;

function log(message) {
  console.log(`[ensure-adb-reverse] ${message}`);
}

function warn(message) {
  console.warn(`[ensure-adb-reverse] ${message}`);
}

function getConnectedDevices() {
  try {
    const output = execSync("adb devices", { encoding: "utf8" });
    return parseAdbDevices(output);
  } catch (error) {
    warn(`Unable to execute 'adb devices': ${error.message.trim()}`);
    return [];
  }
}

function reversePortForDevices(devices, port) {
  devices.forEach((serial) => {
    try {
      execSync(`adb -s ${serial} reverse tcp:${port} tcp:${port}`, {
        stdio: "ignore",
      });
      log(`Reversed tcp:${port} on ${serial}`);
    } catch (error) {
      warn(
        `Failed to reverse tcp:${port} on ${serial}: ${error.message.trim()}`,
      );
    }
  });
}

async function waitForDevices() {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const devices = getConnectedDevices();
    if (devices.length > 0) {
      return devices;
    }

    if (attempt < MAX_ATTEMPTS - 1) {
      await delay(POLL_INTERVAL_MS);
    }
  }

  return [];
}

async function main() {
  const port = resolveMetroPort();
  const devices = await waitForDevices();

  if (devices.length === 0) {
    log("No Android devices or emulators detected. Skipping reverse.");
    return;
  }

  reversePortForDevices(devices, port);
}

main();
