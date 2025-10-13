import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NativeTabs, Icon, Label, VectorIcon } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS, Platform } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';

export default function NativeTabsLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const baseLabelColor = colorScheme === 'dark' ? '#F2F2F7' : '#1C1C1E';
  const labelColor =
    Platform.OS === 'ios'
      ? DynamicColorIOS({
          light: '#1C1C1E',
          dark: '#F2F2F7'
        })
      : baseLabelColor;

  return (
    <NativeTabs
      disableTransparentOnScrollEdge
      labelStyle={{
        color: labelColor,
        fontSize: 12,
        fontWeight: '600'
      }}>
      <NativeTabs.Trigger name="index">
        {Platform.OS === 'ios' ? (
          <Icon sf={{ default: 'text.bubble', selected: 'text.bubble.fill' }} />
        ) : (
          <VectorIcon family={MaterialCommunityIcons} name="message-text-outline" />
        )}
        <Label>Inbox</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="logs">
        {Platform.OS === 'ios' ? (
          <Icon sf={{ default: 'list.bullet.rectangle', selected: 'list.bullet.rectangle.fill' }} />
        ) : (
          <VectorIcon family={MaterialCommunityIcons} name="chart-box-outline" />
        )}
        <Label>Logs</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        {Platform.OS === 'ios' ? (
          <Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} />
        ) : (
          <VectorIcon family={MaterialCommunityIcons} name="cog-outline" />
        )}
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
