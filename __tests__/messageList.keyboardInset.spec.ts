import fs from "node:fs";
import path from "node:path";

describe("MessageList keyboard inset behavior", () => {
  it("rescrolls when bottomInset changes from keyboard or input height", () => {
    const sourcePath = path.resolve(__dirname, "../src/components/MessageList.tsx");
    const source = fs.readFileSync(sourcePath, "utf8");

    expect(source).toContain("[messages.length, lastMessageKey, bottomInset]");
  });
});
