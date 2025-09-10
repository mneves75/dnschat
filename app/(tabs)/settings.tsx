import { View, Text, Switch } from 'react-native';
import { useThemeStore } from '../../src/store/useSettingsStore';
import { useTheme } from '../../src/theme/theme';

export default function SettingsScreen() {
  const { colors, spacing, typography } = useTheme();
  const theme = useThemeStore((s) => s.theme);
  const highContrast = useThemeStore((s) => s.highContrast);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setHighContrast = useThemeStore((s) => s.setHighContrast);

  return (
    <View style={{ flex: 1, padding: spacing[4], backgroundColor: colors.background }}>
      <Text
        accessibilityRole="header"
        style={{ fontSize: typography.h2, fontWeight: '700', color: colors.text }}
      >
        Settings
      </Text>
      <View style={{ marginTop: spacing[4] }}>
        <Text style={{ color: colors.text, marginBottom: spacing[2] }}>Theme</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Text style={{ color: colors.text }}>Light</Text>
          <Switch
            accessibilityLabel="Toggle dark theme"
            value={theme === 'dark'}
            onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
          />
          <Text style={{ color: colors.text }}>Dark</Text>
        </View>
      </View>
      <View style={{ marginTop: spacing[4] }}>
        <Text style={{ color: colors.text, marginBottom: spacing[2] }}>High Contrast</Text>
        <Switch
          accessibilityLabel="Toggle high contrast"
          value={highContrast}
          onValueChange={setHighContrast}
        />
      </View>
    </View>
  );
}
