import { useColorScheme as useRNColorScheme } from 'react-native';
import { useThemeStore } from '../store/useSettingsStore';

export function useColorScheme() {
  const system = useRNColorScheme();
  const selected = useThemeStore((s) => s.theme);
  return selected === 'system' ? system : selected;
}
