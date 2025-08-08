import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HeaderButton, Text } from '@react-navigation/elements';
import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'react-native';
import newspaper from '../assets/newspaper.png';
import { InfoIcon } from '../components/InfoIcon';
import { SettingsIcon } from '../components/icons/SettingsIcon';
import { Home } from './screens/Home';
import { Profile } from './screens/Profile';
import { Settings } from './screens/Settings';
import { About } from './screens/About';
import { NotFound } from './screens/NotFound';
import { ChatList } from './screens/ChatList';
import { Chat } from './screens/Chat';

const HomeTabs = createBottomTabNavigator({
  screens: {
    ChatList: {
      screen: ChatList,
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
    About: {
      screen: About,
      options: ({ navigation }) => ({
        title: 'About',
        tabBarIcon: ({ color, size }) => (
          <InfoIcon size={size} color={color} />
        ),
        headerRight: () => (
          <HeaderButton onPress={() => navigation.navigate('Settings')}>
            <SettingsIcon size={24} />
          </HeaderButton>
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
      screen: Settings,
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
