import { readFileSync } from "fs";
import path from "path";

const repoRoot = path.resolve(__dirname, "..");
const readSource = (relativePath: string) =>
  readFileSync(path.join(repoRoot, relativePath), "utf8");

describe("typography accessibility policy", () => {
  it("applies the in-app font size scale to shared typography styles", () => {
    const source = readSource("src/ui/hooks/useTypography.ts");

    expect(source).toContain("useFontSize");
    expect(source).toContain("applyDynamicType(style, scale)");
    expect(source).not.toContain("React.useMemo");
  });
});
