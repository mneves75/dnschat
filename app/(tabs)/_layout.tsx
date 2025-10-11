/**
 * NativeTabs Layout - iOS 26+ Liquid Glass Navigation
 *
 * CRITICAL MIGRATION: This uses the experimental NativeTabs API from expo-router/unstable-native-tabs.
 * This provides iOS 26+ features including:
 * - Native tab bar with liquid glass effects
 * - Badge support for notifications (Phase 3.2)
 * - Tab bar minimize behavior (Phase 3.3)
 * - System search integration (Phase 3.4)
 * - DynamicColorIOS for adaptive colors (Phase 3.5)
 *
 * ARCHITECTURE:
 * - Uses NativeTabs.Trigger instead of Tabs.Screen
 * - SF Symbols for icons instead of MaterialCommunityIcons
 * - Badge component for unread counts
 * - Glass-aware styling preserved
 *
 * @author DNSChat Team
 * @since 2.0.0 (NativeTabs Migration)
 */

import { Platform, DynamicColorIOS } from 'react-native';
import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs';

import { useTranslation } from '../../src/i18n';
import { useChat } from '../../src/context/ChatContext';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { chats } = useChat();

  /**
   * Tab Bar Color Configuration with iOS Accessibility Support
   *
   * IMPORTANT: DynamicColorIOS is CROSS-PLATFORM SAFE
   *
   * iOS Behavior (adapts to system settings):
   * - Light mode: #007AFF (iOS system blue)
   * - Dark mode: #0A84FF (iOS system blue - lighter for dark backgrounds)
   * - High contrast light: #0040DD (darker blue - 8:1 contrast ratio)
   * - High contrast dark: #409CFF (lighter blue - 8:1 contrast ratio)
   *
   * Android/Web Behavior (static color):
   * - Always uses 'light' value: #007AFF
   * - No dynamic adaptation (platform limitation)
   * - Still provides consistent brand color across platforms
   *
   * CRITICAL: DynamicColorIOS does NOT crash on non-iOS platforms.
   * React Native automatically returns the 'light' value when the API
   * is unavailable (Android, Web, etc). No Platform.select needed.
   *
   * ACCESSIBILITY: iOS high contrast modes meet WCAG AAA (7:1+ contrast).
   */
  const tabBarTintColor = DynamicColorIOS({
    light: '#007AFF',
    dark: '#0A84FF',
    highContrastLight: '#0040DD',
    highContrastDark: '#409CFF',
  });

  /**
   * Badge Calculation - Chat Count
   *
   * Shows the total number of active chats on the Chat List tab.
   * Badge is hidden when there are no chats (undefined badge value).
   *
   * FUTURE ENHANCEMENT: Could be extended to show unread message counts
   * by adding lastViewed tracking to the Chat type.
   */
  const chatBadgeCount = chats.length;

  return (
    <NativeTabs
      tintColor={tabBarTintColor}
      /**
       * iOS 26+ Feature: Tab Bar Minimize Behavior
       *
       * Automatically hides the tab bar when user scrolls down,
       * maximizing content visibility. Tab bar reappears when scrolling up.
       *
       * Options: 'automatic' | 'never' | 'onScrollDown' | 'onScrollUp'
       * Default: 'automatic'
       */
      minimizeBehavior="onScrollDown"
    >
      {/* Chat List Tab (Home/Index) */}
      <NativeTabs.Trigger name="index">
        <Icon sf="house" />
        <Label>{t('tabs.chat')}</Label>
        {/* Shows total number of active chats. Badge is hidden when count is 0. */}
        <Badge>{chatBadgeCount > 0 ? String(chatBadgeCount) : undefined}</Badge>
      </NativeTabs.Trigger>

      {/* Search Tab (iOS System Integration) */}
      {/* Uses role="search" for system-provided icon and search functionality */}
      <NativeTabs.Trigger name="search" role="search">
        {/* Icon and Label are optional when using role - system provides defaults */}
        <Icon sf="magnifyingglass" />
        <Label>Search</Label>
      </NativeTabs.Trigger>

      {/* DNS Logs Tab */}
      <NativeTabs.Trigger name="logs">
        <Icon sf="list.clipboard" />
        <Label>{t('tabs.logs')}</Label>
      </NativeTabs.Trigger>

      {/* About Tab */}
      <NativeTabs.Trigger name="about">
        <Icon sf="info.circle" />
        <Label>{t('tabs.about')}</Label>
      </NativeTabs.Trigger>

      {/* Development Logs Tab (Dev Only) */}
      {__DEV__ && (
        <NativeTabs.Trigger name="dev-logs">
          <Icon sf="ladybug" />
          <Label>{t('tabs.devLogs')}</Label>
        </NativeTabs.Trigger>
      )}

      {/* Chat Detail Screen (Hidden from Tab Bar) */}
      {/* This route exists for navigation but is not shown in tabs */}
      {/* Dynamic route: /chat/[id] */}
    </NativeTabs>
  );
}
