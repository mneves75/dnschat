import React from "react";
import { Pressable, Text } from "react-native";
import { Stack, useRouter } from "expo-router";
import { GlassSettings } from "../../src/navigation/screens/GlassSettings";
import { useTranslation } from "../../src/i18n";
import { useImessagePalette } from "../../src/ui/theme/imessagePalette";

export default function SettingsRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const palette = useImessagePalette();

  return (
    <>
      <Stack.Screen
        options={{
          title: t("screen.settings.navigationTitle"),
          presentation: "modal",
          headerRight: () => (
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              style={{ paddingHorizontal: 8 }}
            >
              <Text style={{ color: palette.userBubble, fontWeight: "600" }}>
                {t("common.close")}
              </Text>
            </Pressable>
          ),
        }}
      />
      <GlassSettings />
    </>
  );
}
