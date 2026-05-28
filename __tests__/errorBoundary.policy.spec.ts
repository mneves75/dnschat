import fs from "node:fs";

describe("ErrorBoundary policy", () => {
  const source = fs.readFileSync("src/components/ErrorBoundary.tsx", "utf8");

  it("uses redacted development logging and provider-independent fallback copy", () => {
    expect(source).toContain('devWarn("ErrorBoundary caught an error"');
    expect(source).not.toContain("console.error");
    expect(source).not.toContain("useTranslation");
    expect(source).toContain("FALLBACK_COPY");
    expect(source).toContain("accessibilityLabel={FALLBACK_COPY.reset}");
  });
});
