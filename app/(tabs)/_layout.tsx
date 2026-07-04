import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTranslation } from "../../src/i18n";

export default function TabsLayout() {
  const { t } = useTranslation();

  // No labelStyle color override: iOS applies the accent tint to the selected
  // tab and the secondary (gray) color to unselected tabs automatically. Forcing
  // a single gray color defeated the selected-state accent, hiding which tab is
  // active (HIG "recognition over recall").
  return (
    <NativeTabs>
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
