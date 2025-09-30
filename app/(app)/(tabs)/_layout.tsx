import { useMemo } from 'react';
import { Image, Pressable, Platform, View, StyleSheet } from 'react-native';
import { Tabs, useRouter } from 'expo-router';

import { LogsIcon } from '../../../src/components/icons/LogsIcon';
import { SettingsIcon } from '../../../src/components/icons/SettingsIcon';
import { useAppTheme } from '../../../src/theme';
import {
  LiquidGlassWrapper,
  useLiquidGlassCapabilities,
} from '../../../src/components/LiquidGlassWrapper';
import { useLocalization } from '../../../src/i18n/LocalizationProvider';

const newspaper = require('../../../src/assets/newspaper.png');

function SettingsButton() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useLocalization();

  return (
    <Pressable
      accessibilityLabel={t('settings.header')}
      onPress={() => router.push('/settings')}
      hitSlop={16}
      style={{ paddingHorizontal: 8 }}
    >
      <SettingsIcon size={22} color={colors.text} />
    </Pressable>
  );
}

export default function AppTabsLayout() {
  const { colors, isDark } = useAppTheme();
  const { t } = useLocalization();
  const { supportsSwiftUIGlass, isSupported } = useLiquidGlassCapabilities();
  const glassEnabled = Platform.OS === 'ios' && Boolean(isSupported);

  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: glassEnabled ? 'transparent' : colors.surface,
      borderTopWidth: glassEnabled ? 0 : StyleSheet.hairlineWidth,
      elevation: glassEnabled ? 0 : 2,
      position: glassEnabled ? 'absolute' as const : 'relative' as const,
    }),
    [glassEnabled, colors.surface],
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: t('app.title'),
        headerStyle: { backgroundColor: glassEnabled ? 'transparent' : colors.card },
        headerTintColor: colors.text,
        headerRight: () => <SettingsButton />,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        headerBackground: () =>
          glassEnabled ? (
            <LiquidGlassWrapper
              variant="prominent"
              shape="rect"
              enableContainer={true}
              sensorAware={supportsSwiftUIGlass}
              style={{
                flex: 1,
                backgroundColor: isDark ? 'rgba(28, 28, 30, 0.80)' : 'rgba(242, 242, 247, 0.80)',
              }}
            />
          ) : (
            <View style={{ flex: 1, backgroundColor: colors.card }} />
          ),
        tabBarBackground: () =>
          glassEnabled ? (
            <LiquidGlassWrapper
              variant="prominent"
              shape="rect"
              enableContainer={true}
              sensorAware={supportsSwiftUIGlass}
              style={{
                flex: 1,
                backgroundColor: isDark ? 'rgba(25, 25, 25, 0.85)' : 'rgba(255, 255, 255, 0.85)',
              }}
            />
          ) : (
            <View style={{ flex: 1, backgroundColor: colors.surface }} />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.chats'),
          tabBarIcon: ({ color }) => (
            <Image
              source={newspaper}
              style={{ width: 22, height: 22, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: t('tabs.logs'),
          tabBarIcon: ({ color }) => <LogsIcon size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: t('tabs.about'),
          tabBarIcon: ({ color }) => <SettingsIcon size={22} color={color} />, // placeholder icon
        }}
      />
      <Tabs.Screen
        name="dev-logs"
        options={{
          title: t('tabs.devLogs'),
          href: typeof __DEV__ !== 'undefined' && __DEV__ ? undefined : null,
          tabBarIcon: ({ color }) => <SettingsIcon size={22} color={color} />, // placeholder icon
        }}
      />
    </Tabs>
  );
}
