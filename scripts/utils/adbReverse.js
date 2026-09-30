const DEFAULT_PORT = "8081";

function parseAdbDevices(output) {
  if (!output) {
    return [];
  }

  return output
    .split("\n")
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => {
      if (!line || line.startsWith("*")) return false;
      const [, state] = line.split(/\s+/, 2);
      return state === "device";
    })
    .map((line) => line.split(/\s+/)[0]);
}

function resolveMetroPort(env = process.env) {
  return env.RCT_METRO_PORT || env.EXPO_DEV_SERVER_PORT || DEFAULT_PORT;
}

function resolveReverseOptions(args = [], env = process.env) {
  let port = resolveMetroPort(env);
  let device;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--port" || args[i] === "-p") port = args[++i];
    else if (args[i] === "--device" || args[i] === "-d") {
      if (args[i + 1] && !args[i + 1].startsWith("-")) device = args[++i];
    } else if (args[i].startsWith("--port=")) port = args[i].slice(7);
    else if (args[i].startsWith("--device=")) device = args[i].slice(9);
  }
  if (!/^\d+$/.test(String(port)) || Number(port) < 1 || Number(port) > 65535)
    throw new Error("Metro port must be an integer between 1 and 65535");
  return { port: String(port), device };
}

module.exports = {
  DEFAULT_PORT,
  parseAdbDevices,
  resolveMetroPort,
  resolveReverseOptions,
};
