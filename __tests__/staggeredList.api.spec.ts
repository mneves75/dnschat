import fs from "fs";
import path from "path";

describe("useStaggeredList API", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../src/ui/hooks/useStaggeredList.tsx"),
    "utf8",
  );

  it("does not expose a callback that creates animated-style hooks", () => {
    expect(source).not.toContain("getItemStyle");
    expect(source).toContain("useStaggeredListValues");
    expect(source).toContain("AnimatedListItem");
  });
});
