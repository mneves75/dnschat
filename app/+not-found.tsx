import React from "react";
import { Stack } from "expo-router";
import { NotFound } from "../src/navigation/screens/NotFound";
import { useTranslation } from "../src/i18n";

export default function NotFoundRoute() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t("navigation.stack.notFound") }} />
      <NotFound />
    </>
  );
}
