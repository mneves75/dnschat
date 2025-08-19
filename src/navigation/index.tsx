import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HeaderButton, Text } from '@react-navigation/elements';
import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LiquidGlassNavBar } from '../components/LiquidGlassWrapper';

// Import newspaper icon properly for Metro bundler
const newspaper = require('../assets/newspaper.png');
import { InfoIcon } from '../components/InfoIcon';
import { SettingsIcon } from '../components/icons/SettingsIcon';
import { LogsIcon } from '../components/icons/LogsIcon';
import { Home } from './screens/Home';
import { Profile } from './screens/Profile';
import { GlassSettings } from './screens/GlassSettings';
import { About } from './screens/About';
import { NotFound } from './screens/NotFound';
import { GlassChatList } from './screens/GlassChatList';
import { Chat } from './screens/Chat';
import { Logs } from './screens/Logs';

function SettingsHeaderButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <HeaderButton onPress={onPress}>
      <SettingsIcon size={24} color={colors.text} />
    </HeaderButton>
  );
}

const HomeTabs = createBottomTabNavigator({
  screens: {
    ChatList: {
      screen: GlassChatList,
      options: {
        title: 'DNS Chat',
        tabBarIcon: ({ color, size }) => (
          <Image
            source={newspaper}
            tintColor={color}
            style={{
              width: size,
              height: size,
            }}
          />
        ),
      },
    },
    Logs: {
      screen: Logs,
      options: {
        title: 'Logs',
        tabBarIcon: ({ color, size }) => (
          <LogsIcon size={size} color={color} />
        ),
      },
    },
    About: {
      screen: About,
      options: ({ navigation }) => ({
        title: 'About',
        tabBarIcon: ({ color, size }) => (
          <InfoIcon size={size} color={color} />
        ),
        headerRight: () => (
          <SettingsHeaderButton onPress={() => navigation.navigate('Settings')} />
        ),
      }),
    },
  },
});

const RootStack = createNativeStackNavigator({
  screens: {
    HomeTabs: {
      screen: HomeTabs,
      options: {
        title: 'DNS Chat',
        headerShown: false,
      },
    },
    Chat: {
      screen: Chat,
      options: {
        title: 'Chat',
        headerShown: true,
      },
    },
    Profile: {
      screen: Profile,
      linking: {
        path: ':user(@[a-zA-Z0-9-_]+)',
        parse: {
          user: (value) => value.replace(/^@/, ''),
        },
        stringify: {
          user: (value) => `@${value}`,
        },
      },
    },
    Settings: {
      screen: GlassSettings,
      options: ({ navigation }) => ({
        presentation: 'modal',
        headerRight: () => (
          <HeaderButton onPress={navigation.goBack}>
            <Text>Close</Text>
          </HeaderButton>
        ),
      }),
    },
    NotFound: {
      screen: NotFound,
      options: {
        title: '404',
      },
      linking: {
        path: '*',
      },
    },
  },
});

export const Navigation = createStaticNavigation(RootStack);

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
