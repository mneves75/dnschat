import fs from "node:fs";

describe("docs: architecture statements match implementation", () => {
  it("states that TypeScript does not implement DNS-over-HTTPS", () => {
    const content = fs.readFileSync(
      "docs/architecture/SYSTEM-ARCHITECTURE.md",
      "utf8",
    );

    // This is a core product/engineering invariant: JS transports are raw DNS
    // (native -> UDP -> TCP -> mock) and must not silently drift into DoH.
    expect(content).toContain("TypeScript transport chain does not implement DNS-over-HTTPS");
    expect(content).toContain("DNS-over-TCP on port 53");
  });

  it("points to the transport order implementation location", () => {
    const content = fs.readFileSync(
      "docs/architecture/SYSTEM-ARCHITECTURE.md",
      "utf8",
    );
    expect(content).toContain("Transport order is implemented in `src/services/dnsService.ts`.");
  });
});

