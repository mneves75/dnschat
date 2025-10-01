import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Tabs } from 'expo-router';
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
const isIOSNativeTabsSupported = () => {
  if (Platform.OS !== 'ios') {
    return false;
  }

  const version = Platform.Version;
  if (typeof version === 'string') {
    const major = parseInt(version.split('.')[0] ?? '0', 10);
    return major >= 26;
  }

  if (typeof version === 'number') {
    return Math.floor(version) >= 26;
  }

  return false;
};

const TAB_CONFIG = [
  {
    name: 'index' as const,
    icon: { default: 'newspaper', selected: 'newspaper.fill' },
    labelKey: 'tabs.chats',
    hideInProduction: false,
  },
  {
    name: 'logs' as const,
    icon: { default: 'list.bullet.rectangle', selected: 'list.bullet.rectangle.fill' },
    labelKey: 'tabs.logs',
    hideInProduction: false,
  },
  {
    name: 'about' as const,
    icon: { default: 'info.circle', selected: 'info.circle.fill' },
    labelKey: 'tabs.about',
    hideInProduction: false,
  },
  {
    name: 'dev-logs' as const,
    icon: { default: 'terminal', selected: 'terminal.fill' },
    labelKey: 'tabs.devLogs',
    hideInProduction: true,
  },
] as const;

export default function AppTabsLayout() {
  const { t } = useLocalization();

  // iOS 26+ liquid glass color adaptation
  // DynamicColorIOS automatically adjusts tint colors for light/dark backgrounds
  const labelStyle = Platform.OS === 'ios' ? {
    color: DynamicColorIOS({ dark: 'white', light: 'black' }),
    tintColor: DynamicColorIOS({ dark: '#007AFF', light: '#007AFF' }),
  } : {};

  const useNativeTabs = isIOSNativeTabsSupported();

  if (useNativeTabs) {
    return (
      <NativeTabs 
        labelStyle={labelStyle}
        minimizeBehavior="onScrollDown"
      >
        {TAB_CONFIG.map((tab) => {
          const hidden = tab.hideInProduction && (typeof __DEV__ === 'undefined' || !__DEV__);
          return (
            <NativeTabs.Trigger key={tab.name} name={tab.name} hidden={hidden}>
              <Icon sf={tab.icon} />
              <Label>{t(tab.labelKey)}</Label>
            </NativeTabs.Trigger>
          );
        })}
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarLabelStyle: { fontSize: 12 },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.labelKey),
            href: tab.hideInProduction && (typeof __DEV__ === 'undefined' || !__DEV__) ? null : undefined,
          }}
        />
      ))}
    </Tabs>
  );
}
