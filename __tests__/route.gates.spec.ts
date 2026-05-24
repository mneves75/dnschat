import fs from "node:fs";

describe("route gates", () => {
  it("keeps dev DNS logs behind the production NotFound gate", () => {
    const source = fs.readFileSync("app/dev/logs.tsx", "utf8");

    expect(source).toContain('typeof __DEV__ === "undefined" || !__DEV__');
    expect(source).toContain("return <NotFound />");
    expect(source).toContain("<DevLogs />");
  });

  it("keeps profile route linked to normalized params and NotFound fallback", () => {
    const source = fs.readFileSync("app/profile/[user].tsx", "utf8");

    expect(source).toContain("normalizeRouteParam(user)");
    expect(source).toContain("return <NotFound />");
    expect(source).toContain("<Profile user={normalizedUser} />");
  });
});
