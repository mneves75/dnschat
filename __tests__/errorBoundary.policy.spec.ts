import fs from "node:fs";

describe("ErrorBoundary policy", () => {
  const source = fs.readFileSync("src/components/ErrorBoundary.tsx", "utf8");

  it("uses redacted development logging and localized fallback copy", () => {
    expect(source).toContain('devWarn("ErrorBoundary caught an error"');
    expect(source).not.toContain("console.error");
    expect(source).toContain('t("common.errorTitle")');
    expect(source).toContain('t("common.unknownError")');
    expect(source).toContain('t("common.reset")');
  });
});
