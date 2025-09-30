import { useMemo } from 'react';
import { Image, Pressable, Platform, View, StyleSheet } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { BottomTabBar } from '@react-navigation/bottom-tabs';

import { LogsIcon } from '../../../src/components/icons/LogsIcon';
import { SettingsIcon } from '../../../src/components/icons/SettingsIcon';
import { useAppTheme } from '../../../src/theme';
import {
  LiquidGlassWrapper,
  useLiquidGlassCapabilities,
} from '../../../src/components/LiquidGlassWrapper';
import { useLocalization } from '../../../src/i18n/LocalizationProvider';
import { FloatingGlassTabBar } from '../../../src/components/glass/GlassTabBar';

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
      backgroundColor: colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
    }),
    [colors.surface],
  );

  const tabIconMap: Record<string, { sfSymbol: string }> = useMemo(
    () => ({
      index: { sfSymbol: 'message.fill' },
      logs: { sfSymbol: 'list.bullet' },
      about: { sfSymbol: 'info.circle' },
      'dev-logs': { sfSymbol: 'gear' },
    }),
    [],
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: t('app.title'),
        headerStyle: { backgroundColor: glassEnabled ? 'transparent' : colors.card },
        headerTintColor: colors.text,
        headerBackVisible: false,
        headerLeft: () => null,
        headerRight: () => <SettingsButton />,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: glassEnabled ? { display: 'none' } : tabBarStyle,
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
        tabBarBackground: glassEnabled
          ? undefined
          : () => <View style={{ flex: 1, backgroundColor: colors.surface }} />,
      }}
      tabBar={(props) => {
        if (!glassEnabled) {
          return <BottomTabBar {...props} />;
        }

        const { state, descriptors, navigation } = props;
        const activeRoute = state.routes[state.index];
        const visibleRoutes = state.routes.filter((route) => {
          const options = descriptors[route.key]?.options;
          return options?.href !== null;
        });

        const tabs = visibleRoutes.map((route) => {
          const descriptor = descriptors[route.key];
          const options = descriptor?.options ?? {};
          const label =
            options.tabBarLabel ??
            options.title ??
            route.name;
          const config = tabIconMap[route.name] ?? { sfSymbol: 'circle' };
          return {
            id: route.key,
            title: typeof label === 'string' ? label : route.name,
            sfSymbol: config.sfSymbol,
          };
        });

        return (
          <FloatingGlassTabBar
            tabs={tabs}
            activeTabId={activeRoute.key}
            onTabPress={(tabId) => {
              const target = state.routes.find((route) => route.key === tabId);
              if (!target) return;
              if (target.name === activeRoute.name) {
                // already focused
                return;
              }
              navigation.navigate(target.name);
            }}
            margin={18}
          />
        );
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
