import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "../../i18n";

export function NotFound() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text>{t("screen.notFound.title")}</Text>
      <Pressable
        onPress={() => router.replace("/")}
        accessibilityRole="button"
        style={styles.homeButton}
      >
        <Text style={styles.homeButtonText}>{t("screen.notFound.goHome")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  homeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#007AFF",
  },
  homeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
