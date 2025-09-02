const { withDangerousMod } = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

module.exports = function withLiquidGlass(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const srcDir = path.join(projectRoot, "native", "liquid-glass", "ios");
      const iosDest = config.modRequest.platformProjectRoot; // ios project dir

      if (fs.existsSync(srcDir)) {
        // Only copy if the destination does not already contain our files
        const sentinel = path.join(iosDest, "LiquidGlassViewManager.swift");
        if (!fs.existsSync(sentinel)) {
          copyTree(srcDir, iosDest);
        }
      }

      return config;
    },
  ]);
};

function copyTree(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyTree(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}
