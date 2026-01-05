import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { Profile } from "../../src/navigation/screens/Profile";
import { useTranslation } from "../../src/i18n";
import { normalizeRouteParam } from "../../src/utils/routeParams";
import { NotFound } from "../../src/navigation/screens/NotFound";

export default function ProfileRoute() {
  const { user } = useLocalSearchParams<{ user?: string | string[] }>();
  const { t } = useTranslation();
  const normalizedUser = normalizeRouteParam(user);

  if (!normalizedUser) {
    return <NotFound />;
  }

  return (
    <>
      <Stack.Screen
        options={{ title: t("screen.profile.title", { user: normalizedUser }) }}
      />
      <Profile user={normalizedUser} />
    </>
  );
}
