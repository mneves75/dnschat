import React from "react";
import { Stack, useRouter } from "expo-router";
import { GlassSettings } from "../../src/navigation/screens/GlassSettings";
import { useTranslation } from "../../src/i18n";

export default function SettingsRoute() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen.Title>{t("screen.settings.navigationTitle")}</Stack.Screen.Title>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={() => router.back()}>
          {t("common.close")}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <GlassSettings />
    </>
  );
}
