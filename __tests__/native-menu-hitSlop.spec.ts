import fs from "node:fs";

describe("Expo UI native menu migration", () => {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const nativeMenuSource = fs.readFileSync("src/components/platform/NativeMenu.tsx", "utf8");
  const messageBubbleSource = fs.readFileSync("src/components/MessageBubble.tsx", "utf8");

  it("uses Expo UI menu and removes the patched community menu dependency", () => {
    expect(packageJson.dependencies["@expo/ui"]).toBeDefined();
    expect(packageJson.dependencies["@react-native-menu/menu"]).toBeUndefined();
    expect(nativeMenuSource).toContain("@expo/ui/community/menu");
    expect(messageBubbleSource).toContain("NativeMenu");
    expect(messageBubbleSource).not.toContain("@react-native-menu/menu");
  });

  it("keeps a web fallback because Expo UI menu does not fire actions on web", () => {
    expect(nativeMenuSource).toContain('Platform.OS !== "web"');
    expect(nativeMenuSource).toContain("WebMenuFallback");
    expect(nativeMenuSource).toContain("createNativeMenuActionEvent");
    expect(nativeMenuSource).toContain("getNativeMenuActionId(action)");
  });
});
