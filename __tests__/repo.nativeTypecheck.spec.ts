import fs from "node:fs";

describe("repo policy: dns-native has an isolated TypeScript gate", () => {
  it("keeps the native module compiler contract wired into verify:all", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["typecheck:dns-native"]).toBe(
      "pnpm --filter @dnschat/dns-native run typecheck",
    );

    const verifyAll = pkg.scripts?.["verify:all"] ?? "";
    const orderedGates = [
      "pnpm run typecheck",
      "pnpm run typecheck:dns-native",
      "pnpm run fmt:check",
      "pnpm run lint",
    ];
    const commands = verifyAll.split(" && ");
    const gateIndexes = orderedGates.map((gate) => commands.indexOf(gate));
    expect(gateIndexes.every((index) => index >= 0)).toBe(true);
    expect(gateIndexes).toEqual([...gateIndexes].sort((a, b) => a - b));
  });
});
