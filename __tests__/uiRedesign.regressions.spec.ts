import fs from "node:fs";

const readSource = (path: string) => fs.readFileSync(path, "utf8");

describe("Signal Path UI regressions", () => {
  const formSource = readSource("src/components/glass/GlassForm.tsx");
  const emptyStateSource = readSource("src/components/EmptyState.tsx");
  const chatListSource = readSource("src/navigation/screens/GlassChatList.tsx");
  const logsSource = readSource("src/navigation/screens/Logs.tsx");
  const aboutSource = readSource("src/navigation/screens/About.tsx");
  const navigationSource = readSource(
    "src/components/onboarding/OnboardingNavigation.tsx",
  );
  const welcomeSource = readSource(
    "src/components/onboarding/screens/WelcomeScreen.tsx",
  );
  const featuresSource = readSource(
    "src/components/onboarding/screens/FeaturesScreen.tsx",
  );

  it("keeps routine content opaque and out of Liquid Glass", () => {
    expect(formSource).toContain("backgroundColor: colors.backgroundSecondary");
    expect(formSource).not.toContain("<LiquidGlassWrapper");
    expect(emptyStateSource).not.toContain("<LiquidGlassWrapper");
    expect(logsSource).not.toContain("<LiquidGlassWrapper");
  });

  it("reserves native tab-bar clearance for every form-backed screen", () => {
    expect(formSource).toContain("SafeAreaDefaults.bottom.tabBar");
    expect(formSource).toMatch(
      /Math\.max\(\s*insets\.bottom \+ SafeAreaDefaults\.bottom\.tabBar \+ 24,\s*96,?\s*\)/,
    );
    expect(aboutSource).toMatch(/<Form\.List\s+testID="about-screen"/);
  });

  it("offers a single create action on the empty conversation screen", () => {
    const emptyBranch = chatListSource.slice(
      chatListSource.indexOf("if (chats.length === 0)"),
      chatListSource.indexOf(
        'return (\n    <Form.Section title={t("screen.glassChatList.recent.title")}',
      ),
    );

    expect(chatListSource).toContain('testID="chat-list-new-chat"');
    expect(emptyBranch).toContain('testID="chat-list-empty-state"');
    expect(emptyBranch).not.toContain("actionLabel=");
    expect(emptyBranch).not.toContain("onAction=");
  });

  it("renders onboarding navigation as an enabled, high-contrast primary action", () => {
    expect(navigationSource).toContain("backgroundColor: palette.userBubble");
    expect(navigationSource).toContain("color: palette.textOnChroma");
    expect(navigationSource).toContain("color: palette.accentText");
    expect(navigationSource).toContain("minHeight: 48");
    expect(navigationSource).toContain(
      "borderTopWidth: StyleSheet.hairlineWidth",
    );
    expect(navigationSource).not.toContain(
      "backgroundColor: palette.accentTint",
    );
  });

  it("keeps onboarding scrollable and limits decorative competition", () => {
    expect(welcomeSource).toContain("flexGrow: 1");
    expect(welcomeSource).toContain("maxWidth: LiquidGlassSpacing.huge * 12");
    expect(featuresSource).toContain("contentContainerStyle={styles.content}");
    expect(featuresSource).not.toContain('variant="primary"');
  });
});
