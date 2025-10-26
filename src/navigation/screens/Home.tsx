import { Button, Text } from "@react-navigation/elements";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "../../i18n";

export function Home() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text>{t("screen.home.title")}</Text>
      <Text>{t("screen.home.subtitle")}</Text>
      <Button screen="Profile" params={{ user: "jane" }}>
        {t("screen.home.goToProfile")}
      </Button>
      <Button screen="Settings">{t("screen.home.goToSettings")}</Button>
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
