import React from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { parseProfileHandle } from "../src/utils/routeParams";
import { NotFound } from "../src/navigation/screens/NotFound";

export default function ProfileRedirectRoute() {
  const { user } = useLocalSearchParams<{ user?: string | string[] }>();
  const handle = parseProfileHandle(user);

  if (!handle) {
    return <NotFound />;
  }

  return <Redirect href={{ pathname: "/profile/[user]", params: { user: handle } }} />;
}
