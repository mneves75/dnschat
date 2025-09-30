import React from "react";

export interface ThemeColors {
  background: string;
  foreground: string;
  accent: string;
}

export type TimeOfDayPeriod = "morning" | "afternoon" | "evening" | "night";

export interface UserPreferences {
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
}

export interface ThemeConfiguration {
  timeOfDay: TimeOfDayPeriod;
  preferences: UserPreferences;
}

export interface ThemeContextValue {
  colors: ThemeColors;
  configuration: ThemeConfiguration;
  setConfiguration: (config: Partial<ThemeConfiguration>) => void;
}

const defaultConfiguration: ThemeConfiguration = {
  timeOfDay: "afternoon",
  preferences: {
    prefersReducedMotion: false,
    prefersHighContrast: false,
  },
};

const defaultColors: ThemeColors = {
  background: "rgba(28,28,30,0.35)",
  foreground: "#ffffff",
  accent: "#0A84FF",
};

const LiquidGlassThemeContext = React.createContext<ThemeContextValue>({
  colors: defaultColors,
  configuration: defaultConfiguration,
  setConfiguration: () => undefined,
});

export const LiquidGlassThemeProvider: React.FC<{
  initialConfiguration?: Partial<ThemeConfiguration>;
  children?: React.ReactNode;
}> = ({ initialConfiguration, children }) => {
  const [configuration, setConfigurationState] = React.useState<ThemeConfiguration>({
    ...defaultConfiguration,
    ...initialConfiguration,
  });

  const setConfiguration = React.useCallback(
    (incoming: Partial<ThemeConfiguration>) => {
      setConfigurationState((current) => ({ ...current, ...incoming }));
    },
    [],
  );

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      colors: defaultColors,
      configuration,
      setConfiguration,
    }),
    [configuration, setConfiguration],
  );

  return (
    <LiquidGlassThemeContext.Provider value={value}>
      {children}
    </LiquidGlassThemeContext.Provider>
  );
};

export const useLiquidGlassTheme = () => React.useContext(LiquidGlassThemeContext);
