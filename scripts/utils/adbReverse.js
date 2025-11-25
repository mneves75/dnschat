const DEFAULT_PORT = "8081";

function parseAdbDevices(output) {
  if (!output) {
    return [];
  }

  return output
    .split("\n")
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("*") && !line.includes("offline"))
    .map((line) => line.split(/\s+/)[0]);
}

function resolveMetroPort(env = process.env) {
  return env.RCT_METRO_PORT || env.EXPO_DEV_SERVER_PORT || DEFAULT_PORT;
}

module.exports = {
  DEFAULT_PORT,
  parseAdbDevices,
  resolveMetroPort,
};
