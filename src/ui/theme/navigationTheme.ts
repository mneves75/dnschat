import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import type { Theme } from "@react-navigation/native";
import type { IMessagePalette } from "./imessagePalette";

export function createNavigationTheme(
  palette: IMessagePalette,
  isDark: boolean,
): Theme {
  const baseTheme = isDark ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      primary: palette.userBubble,
      background: palette.background,
      card: palette.backgroundSecondary,
      text: palette.textPrimary,
      border: palette.separator,
      notification: palette.destructive,
    },
  };
}
