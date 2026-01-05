import { Tabs } from "expo-router";
import React from "react";
import { Image } from "react-native";
import { useTranslation } from "../../src/i18n";
import { useImessagePalette } from "../../src/ui/theme/imessagePalette";

const chatIcon = require("../../src/assets/newspaper.png");
const logsIcon = require("../../src/assets/logs-icon.png");
const infoIcon = require("../../src/assets/info-icon.png");

function TabIcon({ source, color }: { source: number; color: string }) {
  return (
    <Image
      source={source}
      style={{ width: 22, height: 22, tintColor: color }}
      resizeMode="contain"
    />
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const palette = useImessagePalette();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.userBubble,
        tabBarInactiveTintColor: palette.textTertiary,
        tabBarStyle: {
          backgroundColor: palette.backgroundSecondary,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("navigation.tabs.chat"),
          tabBarIcon: ({ color }) => <TabIcon source={chatIcon} color={color} />,
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: t("navigation.tabs.logs"),
          tabBarIcon: ({ color }) => <TabIcon source={logsIcon} color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: t("navigation.tabs.about"),
          tabBarIcon: ({ color }) => <TabIcon source={infoIcon} color={color} />,
        }}
      />
    </Tabs>
  );
}
