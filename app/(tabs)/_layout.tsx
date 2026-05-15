import { NativeTabs } from "expo-router/unstable-native-tabs";
import { DynamicColorIOS, Platform } from "react-native";
import { useTranslation } from "../../src/i18n";

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <NativeTabs
      labelStyle={Platform.OS === "ios" ? {
        color: DynamicColorIOS({ dark: "#EBEBF599", light: "#8E8E93" }),
      } : undefined}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="bubble.left.and.bubble.right.fill" md="forum" />
        <NativeTabs.Trigger.Label>{t("navigation.tabs.chat")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="logs">
        <NativeTabs.Trigger.Icon sf="list.bullet.rectangle" md="receipt_long" />
        <NativeTabs.Trigger.Label>{t("navigation.tabs.logs")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="about">
        <NativeTabs.Trigger.Icon sf="info.circle.fill" md="info" />
        <NativeTabs.Trigger.Label>{t("navigation.tabs.about")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
