import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Runs the Xcode "strip dev keys" build phase against a copy of the real
// Info.plist, the way Xcode does after ProcessInfoPlistFile. PlistBuddy only
// exists on macOS, so Linux CI skips this and the macOS verify:all runs it.
const PLIST_BUDDY = "/usr/libexec/PlistBuddy";
const describeOnMac = fs.existsSync(PLIST_BUDDY) ? describe : describe.skip;

function stripScript(): string {
  const pbxproj = fs.readFileSync(
    "ios/DNSChat.xcodeproj/project.pbxproj",
    "utf8",
  );
  const match = pbxproj.match(
    /shellScript = "(# Strip dev-launcher-specific[^"\\]*(?:\\.[^"\\]*)*)";/,
  );
  if (!match) throw new Error("strip build phase not found in project.pbxproj");
  return JSON.parse(`"${match[1]}"`) as string;
}

function builtPlistAfterStrip(configuration: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dnschat-plist-"));
  const infoPlistPath = "DNSChat.app/Info.plist";
  fs.mkdirSync(path.join(dir, "DNSChat.app"));
  fs.copyFileSync("ios/DNSChat/Info.plist", path.join(dir, infoPlistPath));
  execFileSync("/bin/bash", ["-c", stripScript()], {
    env: {
      ...process.env,
      PATH: "/usr/bin:/bin",
      CONFIGURATION: configuration,
      TARGET_BUILD_DIR: dir,
      INFOPLIST_PATH: infoPlistPath,
    },
  });
  const xml = execFileSync("/usr/bin/plutil", [
    "-convert",
    "xml1",
    "-o",
    "-",
    path.join(dir, infoPlistPath),
  ]).toString();
  fs.rmSync(dir, { recursive: true, force: true });
  return xml;
}

describeOnMac("iOS release Info.plist strip phase", () => {
  it("removes development-only local network keys from Release", () => {
    const plist = builtPlistAfterStrip("Release");

    expect(plist).not.toContain("<key>NSAllowsLocalNetworking</key>");
    expect(plist).not.toContain("_expo._tcp");
    expect(plist).not.toContain("<key>NSLocalNetworkUsageDescription</key>");
    expect(plist).toMatch(/<key>NSAllowsArbitraryLoads<\/key>\s*<false\/>/);
  });

  it("keeps them in Debug so Metro stays reachable", () => {
    const plist = builtPlistAfterStrip("Debug");

    expect(plist).toContain("<key>NSAllowsLocalNetworking</key>");
    expect(plist).toContain("_expo._tcp");
  });
});
