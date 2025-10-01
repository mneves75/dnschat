import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS, Platform } from 'react-native';
import { useLocalization } from '../../../src/i18n/LocalizationProvider';
import { isIOSGlassCapable } from '../../../src/utils/platform';

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

  const enableGlassEffects = Platform.OS === 'ios' && isIOSGlassCapable();

  // DEBUG: Log tab configuration
  console.log('🔵 [TABS] AppTabsLayout rendering');
  console.log('🔵 [TABS] Platform:', Platform.OS, 'Version:', Platform.Version);
  console.log('🔵 [TABS] Glass effects enabled:', enableGlassEffects);
  console.log('🔵 [TABS] __DEV__:', __DEV__);

  return (
    <NativeTabs
      labelStyle={
        Platform.OS === 'ios'
          ? {
              color: DynamicColorIOS({ dark: 'white', light: 'black' }),
            }
          : undefined
      }
      tintColor={
        Platform.OS === 'ios'
          ? DynamicColorIOS({ dark: '#007AFF', light: '#007AFF' })
          : undefined
      }
      minimizeBehavior={enableGlassEffects ? 'onScrollDown' : undefined}
    >
      {TAB_CONFIG.map((tab) => {
        const hidden = tab.hideInProduction && !__DEV__;

        console.log(`🔵 [TABS] Rendering trigger for ${tab.name}, hidden=${hidden}`);

        return (
          <NativeTabs.Trigger key={tab.name} name={tab.name} hidden={hidden}>
            {Platform.OS === 'ios' && <Icon sf={tab.icon} />}
            <Label>{t(tab.labelKey)}</Label>
          </NativeTabs.Trigger>
        );
      })}
    </NativeTabs>
  );
}
