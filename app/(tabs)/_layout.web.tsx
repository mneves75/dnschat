import { Tabs } from "expo-router";
import React from "react";
import { Image } from "react-native";
import type { ColorValue } from "react-native";
import { useTranslation } from "../../src/i18n";
import { useImessagePalette } from "../../src/ui/theme/imessagePalette";
import { useResponsiveLayout } from "../../src/ui/hooks/useResponsiveLayout";

const chatIcon = require("../../src/assets/newspaper.png");
const logsIcon = require("../../src/assets/logs-icon.png");
const infoIcon = require("../../src/assets/info-icon.png");

function TabIcon({
  source,
  color,
  size,
}: {
  source: number;
  color: ColorValue;
  size: number;
}) {
  return (
    <Image
      source={source}
      style={{ width: size, height: size }}
      tintColor={color}
      resizeMode="contain"
    />
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const palette = useImessagePalette();
  const { tabIconSize } = useResponsiveLayout();

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
          tabBarIcon: ({ color }) => <TabIcon source={chatIcon} color={color} size={tabIconSize} />,
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: t("navigation.tabs.logs"),
          tabBarIcon: ({ color }) => <TabIcon source={logsIcon} color={color} size={tabIconSize} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: t("navigation.tabs.about"),
          tabBarIcon: ({ color }) => <TabIcon source={infoIcon} color={color} size={tabIconSize} />,
        }}
      />
    </Tabs>
  );
}
