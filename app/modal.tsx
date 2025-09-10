import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import Button from '../src/components/ui/Button';
import { useTheme } from '../src/theme/theme';

export default function ModalScreen() {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, padding: spacing[4], gap: spacing[3] }}
    >
      <Stack.Screen options={{ presentation: 'modal', title: 'Modal' }} />
      <Text
        accessibilityRole="header"
        style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}
      >
        Modal
      </Text>
      <Text style={{ color: colors.muted }}>Conteúdo de exemplo do modal.</Text>
      <Button label="Fechar" onPress={() => {}} accessibilityLabel="Fechar modal" />
    </View>
  );
}
