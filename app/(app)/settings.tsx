import { Pressable, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { GlassSettings } from '../../src/screens/GlassSettings';
import { useAppTheme } from '../../src/theme';
import { useLocalization } from '../../src/i18n/LocalizationProvider';

function CloseButton() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useLocalization();

  return (
    <Pressable
      accessibilityLabel={t('common.close')}
      onPress={() => router.back()}
    >
      <Text style={{ color: colors.accent, fontWeight: '600' }}>{t('common.close')}</Text>
    </Pressable>
  );
}

export default function SettingsModal() {
  const { t } = useLocalization();

  return (
    <>
      <Stack.Screen
        options={{
          title: t('settings.title'),
          headerRight: () => <CloseButton />,
        }}
      />
      <GlassSettings />
    </>
  );
}
