import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

type SettingsState = {
  theme: ThemeMode;
  highContrast: boolean;
  setTheme: (t: ThemeMode) => void;
  setHighContrast: (v: boolean) => void;
};

export const useThemeStore = create<SettingsState>((set) => ({
  theme: 'system',
  highContrast: false,
  setTheme: (t) => set({ theme: t }),
  setHighContrast: (v) => set({ highContrast: v }),
}));
