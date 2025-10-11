/**
 * Tabs Layout - Expo Router Navigation
 *
 * Uses the stable <Tabs> component so only Tabs.Screen children are rendered,
 * eliminating the layout warnings triggered by the experimental native tabs API.
 * Glass-aware styling is preserved via the design-system helpers.
 */

import { useMemo } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { Tabs } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useTranslation } from '../../src/i18n';
import { useGlass, getGlassBackgroundFallback } from '../../src/design-system/glass';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { capabilities, shouldRenderGlass } = useGlass();
  const { t } = useTranslation();

  const canRenderNativeGlass = capabilities.isNativeGlassSupported && shouldRenderGlass();

  const tabBarTintColor = '#007AFF';
  const tabBarInactiveTintColor = '#8E8E93';

  const tabBarBackgroundColor = useMemo(() => {
    if (canRenderNativeGlass) {
      return 'transparent';
    }
    return getGlassBackgroundFallback(isDark, 'prominent');
  }, [canRenderNativeGlass, isDark]);

  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: tabBarBackgroundColor,
      borderTopWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
      position: Platform.OS === 'ios' ? 'absolute' : 'relative',
    }),
    [tabBarBackgroundColor],
  );

  const renderIcon = (name: string) => ({ color }: { focused: boolean; color: string }) => (
    <MaterialCommunityIcons name={name} size={24} color={color} />
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tabBarTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
        tabBarStyle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.chat'),
          tabBarLabel: t('tabs.chat'),
          tabBarIcon: renderIcon('home-variant'),
        }}
      />

      <Tabs.Screen
        name="logs"
        options={{
          title: t('tabs.logs'),
          tabBarLabel: t('tabs.logs'),
          tabBarIcon: renderIcon('clipboard-list-outline'),
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          title: t('tabs.about'),
          tabBarLabel: t('tabs.about'),
          tabBarIcon: renderIcon('information-outline'),
        }}
      />

      <Tabs.Screen
        name="dev-logs"
        options={{
          href: __DEV__ ? undefined : null,
          title: t('tabs.devLogs'),
          tabBarLabel: t('tabs.devLogs'),
          tabBarIcon: renderIcon('ladybug'),
        }}
      />

      <Tabs.Screen
        name="chat/[id]"
        options={{
          href: null,
          title: t('screens.chatDetail'),
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
