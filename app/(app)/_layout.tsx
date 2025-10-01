import { Stack } from 'expo-router';
import React from 'react';

import { useAppTheme } from '../../src/theme';
import { useLocalization } from '../../src/i18n/LocalizationProvider';
import {
  LiquidGlassWrapper,
  useLiquidGlassCapabilities,
} from '../../src/components/LiquidGlassWrapper';
import { Platform, View } from 'react-native';

export default function AppStackLayout() {
  const { colors } = useAppTheme();
  
  // Safely access localization - catch if provider isn't ready
  let t: (key: string) => string;
  try {
    const localization = useLocalization();
    t = localization.t;
  } catch (error) {
    console.warn('LocalizationProvider not ready, using fallback', error);
    // Fallback function
    t = (key: string) => key;
  }
  
  const { supportsSwiftUIGlass, isSupported } = useLiquidGlassCapabilities();
  const glassEnabled = Platform.OS === 'ios' && Boolean(isSupported) && Boolean(supportsSwiftUIGlass);

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: glassEnabled ? 'transparent' : colors.card },
        contentStyle: { backgroundColor: colors.background },
        headerBackground: () =>
          glassEnabled ? (
            <LiquidGlassWrapper
              variant="prominent"
              shape="rect"
              enableContainer
              sensorAware
              style={{ flex: 1 }}
            />
          ) : (
            <View style={{ flex: 1, backgroundColor: colors.card }} />
          ),
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="chat" options={{ title: t('chat.header') }} />
      <Stack.Screen
        name="profile/[user]"
        options={{ title: t('profile.header') }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: t('settings.header'),
          presentation: 'formSheet',
        }}
      />
      <Stack.Screen
        name="dev/logs"
        options={{
          title: t('devLogs.title'),
        }}
      />
      <Stack.Screen
        name="glass-debug"
        options={{
          title: 'Glass Debug',
        }}
      />
    </Stack>
  );
}
