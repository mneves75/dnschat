import React from "react";
import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { DNSLogViewer } from "../../src/components/DNSLogViewer";
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
      <View style={styles.container}>
        <DNSLogViewer maxEntries={50} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
