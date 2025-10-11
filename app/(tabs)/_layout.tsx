/**
 * Tabs Layout - Native Tab Navigation
 *
 * This layout configures Expo Router's experimental native tabs feature,
 * which provides platform-native tab bar rendering on iOS and Android.
 *
 * CRITICAL FEATURES:
 * - iOS: UITabBarController with SF Symbols
 * - Android: Material 3 NavigationBar with Material icons
 * - Badge support for notifications
 * - iOS 26: Tab bar minimize behavior (minimizeBehavior)
 *
 * IMPORTANT API STATUS:
 * - expo-router/unstable-native-tabs is EXPERIMENTAL
 * - API may change in future SDK releases
 * - Use with caution in production
 *
 * PLATFORM LIMITATIONS:
 * - Android: Maximum 5 tabs (platform limitation)
 * - No nested native tabs (use JavaScript tabs if needed)
 * - FlatList has limited support in tab content
 *
 * TAB STRUCTURE:
 * This layout defines 5 screens, 4 visible as tabs + 1 hidden detail screen:
 *
 * 1. index.tsx (ChatList) - Main chat interface [house.fill icon]
 *    CRITICAL: "index" is special in Expo Router - becomes default route
 *
 * 2. logs.tsx - DNS query logs [list.bullet.rectangle icon]
 *    Shows real-time DNS query attempts, fallbacks, and response times
 *
 * 3. about.tsx - App information [info.circle icon]
 *    Version details, privacy policy, attribution
 *
 * 4. dev-logs.tsx - Developer logs [ladybug.fill icon]
 *    CONDITIONAL: Only visible in __DEV__ mode via href pattern
 *    Production builds hide this tab using href: null
 *
 * 5. chat/[id] - Chat detail screen (NOT A TAB)
 *    Dynamic route for individual chat conversations
 *    Uses href: null to hide from tab bar
 *    Accessed via navigation from ChatList
 *
 * TRICKY PARTS:
 * - Conditional dev-logs tab uses href: __DEV__ ? undefined : null pattern
 *   This is cleaner than wrapping Screen in conditional rendering
 * - Glass effects require capability detection (iOS 26+ native glass)
 * - Tab bar styling adapts based on glass support availability
 * - All inline JSX comments removed to prevent React children warnings
 *
 * @author DNSChat Team
 * @since 2.0.0 (Expo Router Migration)
 */

import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { NativeTabs, Icon } from 'expo-router/unstable-native-tabs';
import { useTranslation } from '../../src/i18n';
import { useGlass, getGlassBackgroundFallback } from '../../src/design-system/glass';

/**
 * Native Tabs Layout Component
 *
 * CRITICAL: This component must be a default export for Expo Router.
 * The tabs will render with platform-native styling automatically.
 *
 * IMPORTANT: NativeTabs children MUST be Screen components only.
 * No wrappers, fragments, or inline comments between Screen components.
 * All documentation is kept outside the JSX return statement.
 */
export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { capabilities, shouldRenderGlass } = useGlass();
  const { t } = useTranslation();

  // TRICKY PART: Glass capability detection
  // Determines if we can use iOS 26+ native liquid glass effects
  // Falls back to semi-transparent backgrounds on older platforms
  const canRenderNativeGlass = capabilities.isNativeGlassSupported && shouldRenderGlass();

  // Tab bar color configuration
  // Using iOS system colors for native feel: #007AFF (blue), #8E8E93 (gray)
  const tabBarTintColor = '#007AFF';
  const tabBarInactiveTintColor = '#8E8E93';

  // TRICKY PART: Dynamic background based on glass support
  // - iOS 26+: transparent (relies on native blur effect)
  // - Older: semi-transparent color approximating glass
  const tabBarBackgroundColor = useMemo(() => {
    if (canRenderNativeGlass) {
      return 'transparent';
    }
    return getGlassBackgroundFallback(isDark, 'prominent');
  }, [canRenderNativeGlass, isDark]);

  return (
    <NativeTabs
      tintColor={tabBarTintColor}
      iconColor={tabBarInactiveTintColor}
      backgroundColor={tabBarBackgroundColor}
      blurEffect={canRenderNativeGlass ? 'systemUltraThinMaterial' : undefined}
      minimizeBehavior={canRenderNativeGlass ? 'onScrollDown' : undefined}
      shadowColor={canRenderNativeGlass ? 'transparent' : isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}
      disableTransparentOnScrollEdge={!canRenderNativeGlass}
      labelStyle={{ color: tabBarInactiveTintColor }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tabBarTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
      }}
    >
      <NativeTabs.Screen
        name="index"
        options={{
          title: t('tabs.chat'),
          tabBarIcon: ({ focused, color }) => (
            <Icon
              sf="house.fill"
              ios={{
                name: 'house.fill',
                color: color,
              }}
              android={{
                name: 'home',
                color: color,
              }}
            />
          ),
          tabBarLabel: t('tabs.chat'),
        }}
      />

      <NativeTabs.Screen
        name="logs"
        options={{
          title: t('tabs.logs'),
          tabBarIcon: ({ focused, color }) => (
            <Icon
              sf="list.bullet.rectangle"
              ios={{
                name: 'list.bullet.rectangle',
                color: color,
              }}
              android={{
                name: 'format_list_bulleted',
                color: color,
              }}
            />
          ),
          tabBarLabel: t('tabs.logs'),
        }}
      />

      <NativeTabs.Screen
        name="about"
        options={{
          title: t('tabs.about'),
          tabBarIcon: ({ focused, color }) => (
            <Icon
              sf="info.circle"
              ios={{
                name: 'info.circle',
                color: color,
              }}
              android={{
                name: 'info',
                color: color,
              }}
            />
          ),
          tabBarLabel: t('tabs.about'),
        }}
      />

      <NativeTabs.Screen
        name="dev-logs"
        options={{
          href: __DEV__ ? undefined : null,
          title: t('tabs.devLogs'),
          tabBarIcon: ({ focused, color }) => (
            <Icon
              sf="ladybug.fill"
              ios={{
                name: 'ladybug.fill',
                color: color,
              }}
              android={{
                name: 'bug_report',
                color: color,
              }}
            />
          ),
          tabBarLabel: t('tabs.devLogs'),
        }}
      />

      <NativeTabs.Screen
        name="chat/[id]"
        options={{
          href: null,
          title: t('screens.chatDetail'),
          headerShown: true,
        }}
      />
    </NativeTabs>
  );
}
