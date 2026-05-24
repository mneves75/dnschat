import fs from "node:fs";

describe("GlassForm scroll contract", () => {
  const formSource = fs.readFileSync("src/components/glass/GlassForm.tsx", "utf8");
  const chatListSource = fs.readFileSync("src/navigation/screens/GlassChatList.tsx", "utf8");

  it("keeps outer layout styles separate from ScrollView content styles", () => {
    expect(formSource).toContain("contentContainerStyle?: StyleProp<ViewStyle>;");
    expect(formSource).toContain("contentContainerStyle,");
    expect(formSource).toContain("style={[styles.safeAreaContainer, { backgroundColor: colors.background }, style]}");
    expect(formSource).toContain("flexGrow: 1");
  });

  it("gives the main chat list bottom scroll clearance for the native tab bar", () => {
    expect(chatListSource).toContain("contentContainerStyle={styles.scrollContent}");
    expect(chatListSource).toContain("paddingBottom: 140");
  });
});
