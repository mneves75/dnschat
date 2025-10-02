import React from "react";
import { HeaderButton, Text } from "@react-navigation/elements";
import {
  createStaticNavigation,
  StaticParamList,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, useColorScheme } from "react-native";
import { useTheme } from "@react-navigation/native";

// Import newspaper icon properly for Metro bundler
const newspaper = require("../assets/newspaper.png");
import { InfoIcon } from "../components/InfoIcon";
import { SettingsIcon } from "../components/icons/SettingsIcon";
import { LogsIcon } from "../components/icons/LogsIcon";
import { Home } from "./screens/Home";
import { Profile } from "./screens/Profile";
import { GlassSettings } from "./screens/GlassSettings";
import { About } from "./screens/About";
import { NotFound } from "./screens/NotFound";
import { GlassChatList } from "./screens/GlassChatList";
import { Chat } from "./screens/Chat";
import { Logs } from "./screens/Logs";
import { DevLogs } from "./screens/DevLogs";

function SettingsHeaderButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <HeaderButton onPress={onPress}>
      <SettingsIcon size={24} color={colors.text} />
    </HeaderButton>
  );
}

const Tab = createBottomTabNavigator();

function HomeTabs() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const showDevLogs = typeof __DEV__ !== "undefined" && __DEV__;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
        },
        tabBarIcon: ({ color = "#8E8E93", size = 24 }) => {
          switch (route.name) {
            case "ChatList":
              return (
                <Image
                  source={newspaper}
                  style={{ width: size, height: size, tintColor: color }}
                  resizeMode="contain"
                />
              );
            case "Logs":
              return <LogsIcon size={size} color={color} />;
            case "About":
              return <InfoIcon size={size} color={color} />;
            case "DevLogs":
              return <LogsIcon size={size} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen
        name="ChatList"
        component={GlassChatList}
        options={{ title: "DNS Chat" }}
      />
      <Tab.Screen
        name="Logs"
        component={Logs}
        options={{ title: "Logs" }}
      />
      <Tab.Screen
        name="About"
        component={About}
        options={{ title: "About" }}
      />
      {showDevLogs ? (
        <Tab.Screen
          name="DevLogs"
          component={DevLogs}
          options={{ title: "Dev Logs" }}
        />
      ) : null}
    </Tab.Navigator>
  );
}

const RootStack = createNativeStackNavigator({
  screens: {
    HomeTabs: {
      screen: HomeTabs,
      options: {
        title: "DNS Chat",
        headerShown: false,
      },
    },
    Chat: {
      screen: Chat,
      options: {
        title: "Chat",
        headerShown: true,
      },
    },
    Profile: {
      screen: Profile,
      linking: {
        path: ":user(@[a-zA-Z0-9-_]+)",
        parse: {
          user: (value) => value.replace(/^@/, ""),
        },
        stringify: {
          user: (value) => `@${value}`,
        },
      },
    },
    Settings: {
      screen: GlassSettings,
      options: ({ navigation }) => ({
        presentation: "modal",
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
        title: "404",
      },
      linking: {
        path: "*",
      },
    },
    // Hidden developer logs screen, accessible via deep link only
    ...(typeof __DEV__ !== "undefined" && __DEV__
      ? {
          DevLogs: {
            screen: DevLogs,
            options: {
              title: "Dev DNS Logs",
              headerShown: true,
            },
            linking: {
              path: "dev/logs",
            },
          },
        }
      : {}),
  },
});

export const Navigation = createStaticNavigation(RootStack);

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
