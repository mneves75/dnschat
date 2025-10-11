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
 * @author DNSChat Team
 * @since 2.0.0 (Expo Router Migration)
 */

import { Platform } from 'react-native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';
import { useTranslation } from '../../src/i18n';

/**
 * Native Tabs Layout Component
 *
 * CRITICAL: This component must be a default export for Expo Router.
 * The tabs will render with platform-native styling automatically.
 *
 * Tab Order:
 * 1. index.tsx (ChatList) - Main chat interface
 * 2. logs.tsx - DNS query logs
 * 3. about.tsx - App information
 * 4. dev-logs.tsx - Developer logs (__DEV__ only)
 *
 * SF Symbols (iOS):
 * - house.fill: Home/Chat tab
 * - list.bullet.rectangle: Logs tab
 * - info.circle: About tab
 * - ladybug.fill: Dev logs tab
 */
export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // CRITICAL: Get translations for tab labels
  const { t } = useTranslation();

  // CRITICAL: Tab bar colors should adapt to theme
  // iOS uses system colors by default, but we can customize
  const tabBarTintColor = isDark ? '#007AFF' : '#007AFF'; // Active tab color
  const tabBarInactiveTintColor = isDark ? '#8E8E93' : '#8E8E93'; // Inactive tab color
  const tabBarBackgroundColor = isDark
    ? 'rgba(28, 28, 30, 0.85)' // iOS dark mode bar color with blur
    : 'rgba(255, 255, 255, 0.85)'; // iOS light mode bar color with blur

  return (
    <NativeTabs
      screenOptions={{
        // CRITICAL: These options apply to all tabs
        headerShown: false, // Hide navigation header (tabs have their own headers)
        tabBarActiveTintColor: tabBarTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
        tabBarStyle: {
          backgroundColor: tabBarBackgroundColor,
          // FUTURE: Add glass effect using expo-glass-effect in Phase 7
        },
      }}
    >
      {/*
        Main Chat Tab (index.tsx)
        CRITICAL: "index" is a special name in Expo Router - it becomes the default route
      */}
      <NativeTabs.Screen
        name="index"
        options={{
          title: t('tabs.chat'),
          tabBarIcon: ({ focused, color }) => (
            // CRITICAL: SF Symbol "house.fill" for iOS, fallback for Android
            <Icon
              sf="house.fill"
              ios={{
                name: 'house.fill',
                color: color,
              }}
              android={{
                name: 'home', // Material icon name
                color: color,
              }}
            />
          ),
          tabBarLabel: t('tabs.chat'),
        }}
      />

      {/*
        Logs Tab
        Shows DNS query logs for debugging
      */}
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
                name: 'format_list_bulleted', // Material icon
                color: color,
              }}
            />
          ),
          tabBarLabel: t('tabs.logs'),
          // FUTURE: Add badge for unread logs count
          // tabBarBadge: unreadLogsCount > 0 ? unreadLogsCount : undefined,
        }}
      />

      {/*
        About Tab
        App information and version details
      */}
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
                name: 'info', // Material icon
                color: color,
              }}
            />
          ),
          tabBarLabel: t('tabs.about'),
        }}
      />

      {/*
        Developer Logs Tab (Development Only)
        CRITICAL: This tab only appears in __DEV__ mode
        Production builds will not show this tab
      */}
      {__DEV__ && (
        <NativeTabs.Screen
          name="dev-logs"
          options={{
            title: t('tabs.devLogs'),
            tabBarIcon: ({ focused, color }) => (
              <Icon
                sf="ladybug.fill"
                ios={{
                  name: 'ladybug.fill',
                  color: color,
                }}
                android={{
                  name: 'bug_report', // Material icon
                  color: color,
                }}
              />
            ),
            tabBarLabel: t('tabs.devLogs'),
          }}
        />
      )}

      {/*
        Chat Detail Route (Dynamic)
        CRITICAL: This is a nested route within tabs, but not a tab itself
        The route is app/(tabs)/chat/[id].tsx

        This screen won't show in the tab bar - it's a push navigation from the Chat tab
      */}
      <NativeTabs.Screen
        name="chat/[id]"
        options={{
          href: null, // CRITICAL: href: null prevents this from showing in tab bar
          title: t('screens.chatDetail'),
          headerShown: true, // Show header for chat detail screen
          // FUTURE: Add glass header in Phase 7
        }}
      />
    </NativeTabs>
  );
}
