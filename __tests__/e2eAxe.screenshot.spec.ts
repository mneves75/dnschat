import fs from "node:fs";

describe("AXe E2E screenshot artifact policy", () => {
  const source = fs.readFileSync("scripts/e2e-axe.js", "utf8");

  it("requires a non-empty screenshot before reporting success", () => {
    expect(source).toContain("function captureRequiredScreenshot");
    expect(source).toContain('fs.statSync(screenshotPath).size === 0');
    expect(source).toContain('captureRequiredScreenshot(options, "axe-e2e-success")');
    expect(source).toContain("AXe E2E screenshot:");
  });
});
