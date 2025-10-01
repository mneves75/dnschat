import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS, Platform } from 'react-native';
import { useLocalization } from '../../../src/i18n/LocalizationProvider';

/**
 * Native Tab Navigation
 * 
 * Uses Expo Router's native tabs for iOS 26+ liquid glass effects.
 * System automatically handles:
 * - Tab bar positioning (bottom/top/side based on device)
 * - Liquid glass translucency
 * - Minimize behavior on scroll
 * - Safe area insets
 * 
 * Note: Falls back to standard tabs on Android.
 * 
 * @see https://docs.expo.dev/router/advanced/native-tabs/
 */
export default function AppTabsLayout() {
  const { t } = useLocalization();

  // iOS 26+ liquid glass color adaptation
  // DynamicColorIOS automatically adjusts tint colors for light/dark backgrounds
  const labelStyle = Platform.OS === 'ios' ? {
    color: DynamicColorIOS({ dark: 'white', light: 'black' }),
    tintColor: DynamicColorIOS({ dark: '#007AFF', light: '#007AFF' }),
  } : {};

  return (
    <NativeTabs 
      labelStyle={labelStyle}
      minimizeBehavior="onScrollDown"
    >
      {/* Home/Chats Tab */}
      <NativeTabs.Trigger name="index">
        <Icon 
          sf={{ 
            default: "newspaper", 
            selected: "newspaper.fill" 
          }} 
        />
        <Label>{t('tabs.chats')}</Label>
      </NativeTabs.Trigger>

      {/* Logs Tab */}
      <NativeTabs.Trigger name="logs">
        <Icon 
          sf={{ 
            default: "list.bullet.rectangle", 
            selected: "list.bullet.rectangle.fill" 
          }} 
        />
        <Label>{t('tabs.logs')}</Label>
      </NativeTabs.Trigger>

      {/* About Tab */}
      <NativeTabs.Trigger name="about">
        <Icon 
          sf={{ 
            default: "info.circle", 
            selected: "info.circle.fill" 
          }} 
        />
        <Label>{t('tabs.about')}</Label>
      </NativeTabs.Trigger>

      {/* Dev Logs Tab (hidden in production) */}
      <NativeTabs.Trigger 
        name="dev-logs" 
        hidden={typeof __DEV__ === 'undefined' || !__DEV__}
      >
        <Icon 
          sf={{ 
            default: "terminal", 
            selected: "terminal.fill" 
          }} 
        />
        <Label>{t('tabs.devLogs')}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
