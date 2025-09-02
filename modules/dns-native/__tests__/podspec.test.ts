import fs from "fs";
import path from "path";

describe("iOS Podspec deployment target", () => {
  it("sets iOS deployment target to 16.0 or higher", () => {
    const podspecPath = path.join(__dirname, "..", "ios", "DNSNative.podspec");
    const content = fs.readFileSync(podspecPath, "utf-8");

    // Match either platforms hash or explicit deployment_target
    const platformsMatch = content.match(
      /platforms\s*=\s*\{\s*:ios\s*=>\s*\"(\d+\.\d+)\"\s*\}/,
    );
    const deploymentMatch = content.match(
      /ios\.deployment_target\s*=\s*\"(\d+\.\d+)\"/,
    );

    const versions: number[] = [];
    if (platformsMatch) versions.push(parseFloat(platformsMatch[1]));
    if (deploymentMatch) versions.push(parseFloat(deploymentMatch[1]));

    expect(versions.length).toBeGreaterThanOrEqual(1);
    versions.forEach((v) => expect(v).toBeGreaterThanOrEqual(16.0));
  });
});
