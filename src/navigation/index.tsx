import React, { useState } from "react";
import { HeaderButton, Text } from "@react-navigation/elements";
import {
  createStaticNavigation,
  StaticParamList,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Image, Platform, useColorScheme } from "react-native";
import { useTheme } from "@react-navigation/native";
import TabView, { SceneMap } from "react-native-bottom-tabs";
import type { BaseRoute } from "react-native-bottom-tabs";
import { LiquidGlassNavBar } from "../components/LiquidGlassWrapper";

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

type TabRoute = BaseRoute & {
  key: "ChatList" | "Logs" | "About" | "DevLogs";
  title: string;
  focusedIcon: any;
  unfocusedIcon: any;
};

function HomeTabs() {
  const [index, setIndex] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const routes: TabRoute[] = [
    {
      key: "ChatList",
      title: "DNS Chat",
      focusedIcon: newspaper,
      unfocusedIcon: newspaper,
    },
    {
      key: "Logs",
      title: "Logs",
      focusedIcon: { sfSymbol: "list.bullet.rectangle" },
      unfocusedIcon: { sfSymbol: "list.bullet.rectangle" },
    },
    {
      key: "About",
      title: "About",
      focusedIcon: { sfSymbol: "info.circle" },
      unfocusedIcon: { sfSymbol: "info.circle" },
    },
  ];

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    routes.push({
      key: "DevLogs",
      title: "Dev Logs",
      focusedIcon: { sfSymbol: "wrench.and.screwdriver" },
      unfocusedIcon: { sfSymbol: "wrench.and.screwdriver" },
    });
  }

  const renderScene = SceneMap({
    ChatList: GlassChatList,
    Logs: Logs,
    About: About,
    DevLogs: DevLogs,
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      labeled={true}
      hapticFeedbackEnabled={true}
      tabBarActiveTintColor={isDark ? "#007AFF" : "#007AFF"}
      tabBarInactiveTintColor={isDark ? "#8E8E93" : "#8E8E93"}
      tabBarStyle={{
        backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF", // Fix: White background in light mode
      }}
      translucent={false}
    />
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
