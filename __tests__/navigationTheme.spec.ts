import {
  createNavigationTheme,
} from "../src/ui/theme/navigationTheme";
import {
  IMESSAGE_DARK,
  IMESSAGE_LIGHT,
} from "../src/ui/theme/imessagePalette";

jest.mock("@react-navigation/native", () => ({
  DefaultTheme: {
    dark: false,
    colors: {
      primary: "default-primary",
      background: "default-background",
      card: "default-card",
      text: "default-text",
      border: "default-border",
      notification: "default-notification",
    },
    fonts: {},
  },
  DarkTheme: {
    dark: true,
    colors: {
      primary: "dark-primary",
      background: "dark-background",
      card: "dark-card",
      text: "dark-text",
      border: "dark-border",
      notification: "dark-notification",
    },
    fonts: {},
  },
}));

describe("createNavigationTheme", () => {
  it("uses app palette colors for dark native navigation chrome", () => {
    const theme = createNavigationTheme(IMESSAGE_DARK, true);

    expect(theme.dark).toBe(true);
    expect(theme.colors.background).toBe(IMESSAGE_DARK.background);
    expect(theme.colors.card).toBe(IMESSAGE_DARK.backgroundSecondary);
    expect(theme.colors.text).toBe(IMESSAGE_DARK.textPrimary);
    expect(theme.colors.border).toBe(IMESSAGE_DARK.separator);
    expect(theme.colors.primary).toBe(IMESSAGE_DARK.userBubble);
  });

  it("uses app palette colors for light native navigation chrome", () => {
    const theme = createNavigationTheme(IMESSAGE_LIGHT, false);

    expect(theme.dark).toBe(false);
    expect(theme.colors.background).toBe(IMESSAGE_LIGHT.background);
    expect(theme.colors.card).toBe(IMESSAGE_LIGHT.backgroundSecondary);
    expect(theme.colors.text).toBe(IMESSAGE_LIGHT.textPrimary);
    expect(theme.colors.border).toBe(IMESSAGE_LIGHT.separator);
    expect(theme.colors.primary).toBe(IMESSAGE_LIGHT.userBubble);
  });
});
