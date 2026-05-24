import fs from "node:fs";

describe("AXe E2E screenshot artifact policy", () => {
  const source = fs.readFileSync("scripts/e2e-axe.js", "utf8");
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
    scripts?: Record<string, string>;
  };

  it("requires a non-empty screenshot before reporting success", () => {
    expect(source).toContain("function captureRequiredScreenshot");
    expect(source).toContain('fs.statSync(screenshotPath).size === 0');
    expect(source).toContain('captureRequiredScreenshot(options, "axe-e2e-success")');
    expect(source).toContain("AXe E2E screenshot:");
  });

  it("runs the AXe harness through Node from package scripts", () => {
    const axeScripts = {
      "e2e:axe": "node scripts/e2e-axe.js",
      "e2e:axe:doctor": "node scripts/e2e-axe.js --doctor",
      "e2e:axe:release":
        "node scripts/e2e-axe.js --create-simulator --delete-created-simulator --build-release --reset-app",
    };

    expect(packageJson.scripts).toEqual(expect.objectContaining(axeScripts));

    for (const name of Object.keys(axeScripts)) {
      expect(packageJson.scripts?.[name]).not.toContain("bun scripts/e2e-axe.js");
    }
  });
});
