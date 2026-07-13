import { useContext } from "react";
import { useColorScheme } from "react-native";
import { SettingsContext } from "../../context/SettingsContext";

export function useResolvedColorScheme(): "light" | "dark" {
  const systemScheme = useColorScheme();
  const settings = useContext(SettingsContext);

  if (
    settings?.themePreference === "light" ||
    settings?.themePreference === "dark"
  ) {
    return settings.themePreference;
  }

  // useColorScheme() may return null/undefined or "unspecified"; collapse every
  // non-dark value to the light default so the return type stays "light" | "dark".
  return systemScheme === "dark" ? "dark" : "light";
}
