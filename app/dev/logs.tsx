import React from "react";
import { Stack } from "expo-router";
import { DevLogs } from "../../src/navigation/screens/DevLogs";
import { useTranslation } from "../../src/i18n";
import { NotFound } from "../../src/navigation/screens/NotFound";

export default function DevLogsRoute() {
  const { t } = useTranslation();

  if (typeof __DEV__ === "undefined" || !__DEV__) {
    return <NotFound />;
  }

  return (
    <>
      <Stack.Screen options={{ title: t("navigation.stack.devLogs") }} />
      <DevLogs />
    </>
  );
}
