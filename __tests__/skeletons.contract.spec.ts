import fs from "node:fs";

describe("skeleton component contracts", () => {
  it("keeps ChatListSkeleton count configurable", () => {
    const source = fs.readFileSync("src/components/skeletons/ChatListSkeleton.tsx", "utf8");

    expect(source).toContain("export function ChatListSkeleton({ count = 5 }");
    expect(source).toContain("Array.from({ length: count })");
    expect(source).toContain('testID="chat-list-skeleton"');
  });

  it("keeps SettingsSkeleton sections and item counts configurable", () => {
    const source = fs.readFileSync("src/components/skeletons/SettingsSkeleton.tsx", "utf8");

    expect(source).toContain("sections = 3");
    expect(source).toContain("itemsPerSection = 3");
    expect(source).toContain("Array.from({ length: sections })");
    expect(source).toContain("itemCount={itemsPerSection}");
    expect(source).toContain('testID="settings-skeleton"');
  });
});
