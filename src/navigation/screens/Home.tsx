import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "../../i18n";

export function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text>{t("screen.home.title")}</Text>
      <Text>{t("screen.home.subtitle")}</Text>
      <Pressable
        onPress={() => router.push({ pathname: "/profile/[user]", params: { user: "jane" } })}
        accessibilityRole="button"
      >
        <Text>{t("screen.home.goToProfile")}</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push("/settings")}
        accessibilityRole="button"
      >
        <Text>{t("screen.home.goToSettings")}</Text>
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
});
